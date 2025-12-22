// performanceUtils.ts
/**
 * Performance testing and optimization utilities
 */

type DeviceTier = 'low' | 'medium' | 'high';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memoryUsage: number; // MB
  drawCalls: number;
  triangles: number;
  textureMemory: number; // MB (best-effort)
  geometryMemory: number; // MB (best-effort)
}

interface PerformanceBudget {
  targetFPS: number;
  maxMemoryMB: number;
  maxDrawCalls: number;
  maxTriangles: number;
  maxLoadTime: number;
}

// Default performance budgets for device tiers
export const performanceBudgets: Record<DeviceTier, PerformanceBudget> = {
  high: {
    targetFPS: 60,
    maxMemoryMB: 512,
    maxDrawCalls: 200,
    maxTriangles: 100_000,
    maxLoadTime: 3000,
  },
  medium: {
    targetFPS: 45,
    maxMemoryMB: 256,
    maxDrawCalls: 100,
    maxTriangles: 50_000,
    maxLoadTime: 5000,
  },
  low: {
    targetFPS: 30,
    maxMemoryMB: 128,
    maxDrawCalls: 50,
    maxTriangles: 25_000,
    maxLoadTime: 8000,
  },
};

// Small cross-env helpers
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
const perf = (isBrowser && (window.performance || globalThis.performance)) || ({} as Performance);

// PerformanceMonitor class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    fps: 0,
    frameTime: 0,
    memoryUsage: 0,
    drawCalls: 0,
    triangles: 0,
    textureMemory: 0,
    geometryMemory: 0,
  };

  private frameCount = 0;
  private lastTime = (perf && typeof perf.now === 'function') ? perf.now() : Date.now();
  private frameTimes: number[] = [];
  private running = false;
  private callbackIdCounter = 0;
  private callbacks = new Map<number, (metrics: PerformanceMetrics) => void>();
  private rafHandle: number | null = null;

  // Start monitoring (safe to call on SSR — will be a no-op)
  start() {
    if (!isBrowser) return;
    if (this.running) return;
    this.running = true;
    this.lastTime = (perf && typeof perf.now === 'function') ? perf.now() : Date.now();
    this.frameTimes = [];
    this.frameCount = 0;
    this.scheduleFrame();
  }

  // Stop monitoring
  stop() {
    if (!isBrowser) return;
    this.running = false;
    if (this.rafHandle !== null) {
      try {
        cancelAnimationFrame(this.rafHandle);
      } catch {
        // ignore
      }
      this.rafHandle = null;
    }
  }

  // Register a callback. Returns an id that can be used to remove the callback.
  onUpdate(callback: (metrics: PerformanceMetrics) => void): number {
    const id = ++this.callbackIdCounter;
    this.callbacks.set(id, callback);
    return id;
  }

  removeCallbackById(id: number) {
    this.callbacks.delete(id);
  }

  // Backwards-compatible removal by reference (keeps old API)
  removeCallback(callback: (metrics: PerformanceMetrics) => void) {
    for (const [id, cb] of this.callbacks.entries()) {
      if (cb === callback) {
        this.callbacks.delete(id);
        break;
      }
    }
  }

  // Update render metrics (call this from your renderer: gl.info.render.calls etc.)
  updateRenderMetrics(drawCalls: number, triangles: number) {
    this.metrics.drawCalls = drawCalls;
    this.metrics.triangles = triangles;
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  isPerformanceGood(budget: PerformanceBudget): boolean {
    return (
      this.metrics.fps >= budget.targetFPS * 0.9 &&
      this.metrics.memoryUsage <= budget.maxMemoryMB &&
      this.metrics.drawCalls <= budget.maxDrawCalls &&
      this.metrics.triangles <= budget.maxTriangles
    );
  }

  getPerformanceScore(budget: PerformanceBudget): number {
    const fpsScore = Math.min(this.metrics.fps / Math.max(1, budget.targetFPS), 1) * 25;
    const memoryScore = Math.max(1 - this.metrics.memoryUsage / Math.max(1, budget.maxMemoryMB), 0) * 25;
    const drawCallScore = Math.max(1 - this.metrics.drawCalls / Math.max(1, budget.maxDrawCalls), 0) * 25;
    const triangleScore = Math.max(1 - this.metrics.triangles / Math.max(1, budget.maxTriangles), 0) * 25;

    return Math.round(fpsScore + memoryScore + drawCallScore + triangleScore);
  }

  // PRIVATE ---------------------------------------------------------

  private scheduleFrame() {
    if (!isBrowser) return;
    this.rafHandle = (typeof requestAnimationFrame === 'function')
      ? requestAnimationFrame(this.update)
      : (setTimeout(this.update, 1000 / 60) as unknown as number);
  }

  private update = () => {
    if (!this.running) return;

    const now = (perf && typeof perf.now === 'function') ? perf.now() : Date.now();
    const delta = Math.max(0, now - this.lastTime);
    this.lastTime = now;

    this.frameCount++;
    this.frameTimes.push(delta);
    if (this.frameTimes.length > 120) this.frameTimes.shift(); // keep a slightly longer rolling window

    // Compute metrics at a reasonable cadence (every ~30 frames)
    if (this.frameCount % 30 === 0 && this.frameTimes.length > 0) {
      this.calculateMetrics();
      // notify callbacks (shallow copy)
      const snapshot = { ...this.metrics };
      for (const cb of this.callbacks.values()) {
        try {
          cb(snapshot);
        } catch {
          // swallow callback errors
        }
      }
    }

    // schedule next
    this.scheduleFrame();
  };

  private calculateMetrics() {
    const sum = this.frameTimes.reduce((a, b) => a + b, 0);
    const avgFrameTime = this.frameTimes.length ? sum / this.frameTimes.length : 16;
    const fps = avgFrameTime > 0 ? 1000 / avgFrameTime : 0;

    this.metrics.frameTime = avgFrameTime;
    this.metrics.fps = Math.round(fps);

    // Memory (best-effort; guard for environments without profiler)
    this.metrics.memoryUsage = this.getMemoryUsage();

    // textureMemory & geometryMemory are left as 0 (best-effort; require renderer instrumentation)
    // They can be filled externally if you have renderer-level instrumentation.
  }

  private getMemoryUsage(): number {
    // best-effort: performance.memory exists in Chromium-based browsers when enabled
    try {
      const m = (perf as any).memory;
      if (m && typeof m.usedJSHeapSize === 'number') {
        return Math.round(m.usedJSHeapSize / 1048576); // MB
      }
    } catch {
      // ignore
    }
    return 0;
  }
}

// PerformanceTester class (automated tests)
export class PerformanceTester {
  private monitor: PerformanceMonitor;
  private testResults: Array<any> = [];

  constructor(monitor?: PerformanceMonitor) {
    this.monitor = monitor ?? new PerformanceMonitor();
  }

  async runPerformanceTest(
    testName: string,
    testFunction: () => Promise<void> | void,
    duration: number = 10_000
  ): Promise<any> {
    if (!isBrowser) {
      // No-op on server
      const stub = { name: testName, duration: 0, metrics: null, timestamp: new Date().toISOString() };
      this.testResults.push(stub);
      return stub;
    }

    // Prepare
    const startTime = (perf && typeof perf.now === 'function') ? perf.now() : Date.now();
    const samples: PerformanceMetrics[] = [];

    // Register monitor callback
    const cbId = this.monitor.onUpdate((metrics) => {
      samples.push({ ...metrics });
    });

    // Start monitoring
    this.monitor.start();

    // Run the test function (allow synchronous or async)
    try {
      await Promise.resolve(testFunction());
    } catch (err) {
      // test function error shouldn't break monitoring - keep going
      console.warn(`Performance test "${testName}" testFunction threw:`, err);
    }

    // Wait the duration
    await new Promise((resolve) => setTimeout(resolve, duration));

    // Stop monitor and remove callback
    this.monitor.removeCallbackById(cbId);
    this.monitor.stop();

    const endTime = (perf && typeof perf.now === 'function') ? perf.now() : Date.now();
    const testDuration = Math.round(endTime - startTime);

    const analysis = this.analyzeResults(samples, testDuration);

    const result = {
      name: testName,
      duration: testDuration,
      metrics: analysis,
      timestamp: new Date().toISOString(),
    };

    this.testResults.push(result);
    console.log(`Performance test completed: ${testName}`, result);

    return result;
  }

  private analyzeResults(results: PerformanceMetrics[], duration: number) {
    if (!results || results.length === 0) return null;

    const avgFPS = results.reduce((s, r) => s + r.fps, 0) / results.length;
    const minFPS = Math.min(...results.map((r) => r.fps));
    const maxFPS = Math.max(...results.map((r) => r.fps));

    const avgMemory = results.reduce((s, r) => s + r.memoryUsage, 0) / results.length;
    const maxMemory = Math.max(...results.map((r) => r.memoryUsage));

    const avgDrawCalls = results.reduce((s, r) => s + r.drawCalls, 0) / results.length;
    const avgTriangles = results.reduce((s, r) => s + r.triangles, 0) / results.length;

    return {
      fps: { avg: Math.round(avgFPS), min: Math.round(minFPS), max: Math.round(maxFPS) },
      memory: { avg: Math.round(avgMemory), max: Math.round(maxMemory) },
      drawCalls: Math.round(avgDrawCalls),
      triangles: Math.round(avgTriangles),
      duration: Math.round(duration),
    };
  }

  // Convenience tests (stubs — user should provide realistic scenarios)
  async testSceneLoad(): Promise<any> {
    return this.runPerformanceTest(
      'Scene Load Performance',
      async () => {
        // Implement actual scene loading instrumentation outside this helper.
        // This is a placeholder / hook.
        // e.g. await loadSceneAssets();
      },
      5_000
    );
  }

  async testInteractionPerformance(): Promise<any> {
    return this.runPerformanceTest(
      'Interaction Performance',
      async () => {
        // Simulate interactions (placeholder)
      },
      10_000
    );
  }

  async testMemoryLeaks(): Promise<any> {
    return this.runPerformanceTest(
      'Memory Leak Detection',
      async () => {
        // Perform create/destroy cycles to test for leaks (placeholder)
      },
      15_000
    );
  }

  generateReport(): string {
    if (this.testResults.length === 0) return 'No performance tests have been run.';

    let report = '# Performance Test Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    this.testResults.forEach((res: any, i: number) => {
      report += `## Test ${i + 1}: ${res.name}\n`;
      report += `Duration: ${res.duration}ms\n`;
      if (res.metrics) {
        report += `FPS: ${res.metrics.fps.avg} (min: ${res.metrics.fps.min}, max: ${res.metrics.fps.max})\n`;
        report += `Memory: ${res.metrics.memory.avg}MB (max: ${res.metrics.memory.max}MB)\n`;
        report += `Draw Calls: ${res.metrics.drawCalls}\n`;
        report += `Triangles: ${res.metrics.triangles}\n`;
      }
      report += '\n';
    });

    return report;
  }

  getTestResults() {
    return [...this.testResults];
  }

  clearResults() {
    this.testResults = [];
  }
}

// Memory management utilities
export const memoryOptimizer = {
  disposeObject(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    // geometry
    if (obj.geometry) {
      try {
        if (typeof obj.geometry.dispose === 'function') obj.geometry.dispose();
      } catch {
        // ignore
      }
    }

    // material(s)
    if (obj.material) {
      const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
      materials.forEach((mat: any) => memoryOptimizer.disposeMaterial(mat));
    }

    // textures (common prop names)
    const textureProps = ['map', 'alphaMap', 'aoMap', 'bumpMap', 'displacementMap', 'emissiveMap', 'envMap', 'lightMap', 'metalnessMap', 'normalMap', 'roughnessMap'];
    textureProps.forEach((prop) => {
      if (obj[prop] && typeof obj[prop].dispose === 'function') {
        try {
          obj[prop].dispose();
        } catch {
          // ignore
        }
      }
    });

    // children
    if (Array.isArray(obj.children)) {
      obj.children.forEach((child: any) => memoryOptimizer.disposeObject(child));
    }
  },

  disposeMaterial(material: any) {
    if (!material || typeof material !== 'object') return;

    // dispose textures referenced by the material
    const textureProps = [
      'map',
      'normalMap',
      'roughnessMap',
      'metalnessMap',
      'emissiveMap',
      'aoMap',
      'bumpMap',
      'displacementMap',
      'alphaMap',
      'envMap',
    ];

    textureProps.forEach((prop) => {
      try {
        if (material[prop] && typeof material[prop].dispose === 'function') {
          material[prop].dispose();
        }
      } catch {
        // ignore
      }
    });

    // dispose material itself
    try {
      if (typeof material.dispose === 'function') material.dispose();
    } catch {
      // ignore
    }
  },

  getMemoryInfo() {
    try {
      const m = (perf as any).memory;
      if (m && typeof m.usedJSHeapSize === 'number') {
        return {
          used: Math.round(m.usedJSHeapSize / 1048576),
          total: Math.round((m.totalJSHeapSize || 0) / 1048576),
          limit: Math.round((m.jsHeapSizeLimit || 0) / 1048576),
        };
      }
    } catch {
      // ignore
    }
    return null;
  },

  forceGC() {
    if (!isBrowser) return;
    try {
      const g = (window as any).gc;
      if (typeof g === 'function') {
        g();
      }
    } catch {
      // ignore - most browsers won't expose gc
    }
  },
};

// Performance optimization recommendations
export const performanceOptimizer = {
  analyzeScene(scene: any): string[] {
    const recommendations: string[] = [];

    if (!scene || typeof scene.traverse !== 'function') {
      return recommendations;
    }

    let totalTriangles = 0;
    let totalDrawCalls = 0;
    let textureCount = 0;

    scene.traverse((object: any) => {
      if (!object) return;

      if (object.geometry && object.geometry.attributes && object.geometry.attributes.position) {
        // position.count is number of vertices -> triangles = vertices / 3
        const pos = object.geometry.attributes.position;
        if (typeof pos.count === 'number') {
          totalTriangles += Math.floor(pos.count / 3);
        }
        totalDrawCalls++;
      }

      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((mat: any) => {
          if (!mat || typeof mat !== 'object') return;
          Object.keys(mat).forEach((k) => {
            const val = mat[k];
            if (val && typeof val === 'object' && typeof val.isTexture !== 'undefined') {
              textureCount++;
            }
          });
        });
      }
    });

    if (totalTriangles > 50_000) {
      recommendations.push('Use LOD (Level of Detail) for complex geometries.');
      recommendations.push('Use geometry simplification or baked meshes for distant objects.');
    }

    if (totalDrawCalls > 100) {
      recommendations.push('Use instanced rendering for repeated objects.');
      recommendations.push('Merge static geometries where possible to reduce draw calls.');
    }

    if (textureCount > 20) {
      recommendations.push('Use texture atlases to reduce texture binds.');
      recommendations.push('Enable texture compression (KTX2 / Basis) to reduce memory and bandwidth.');
    }

    return recommendations;
  },

  getOptimizationTips(deviceTier: DeviceTier): string[] {
    const tips: string[] = [];
    switch (deviceTier) {
      case 'low':
        tips.push('Disable or reduce post-processing effects.');
        tips.push('Drastically reduce particle counts and dynamic lights.');
        tips.push('Use lower-resolution textures and compressed formats.');
        tips.push('Disable real-time shadows and reflections.');
        tips.push('Simplify geometry (reduce polygon count).');
        break;
      case 'medium':
        tips.push('Enable selective post-processing with lower sample counts.');
        tips.push('Use medium-quality textures and limit high-frequency effects.');
        tips.push('Implement LOD for complex objects.');
        tips.push('Cap particle systems and cull off-screen emitters.');
        break;
      case 'high':
        tips.push('Enable full visual fidelity: post-processing, shadows, reflections.');
        tips.push('Use high-resolution textures with compression (KTX2/Basis).');
        tips.push('Advanced LOD and streaming for large scenes.');
        tips.push('Use GPU-driven particle systems and hardware instancing.');
        break;
      default:
        break;
    }
    return tips;
  },
};

// Expose singleton instances (safe for SSR)
export const performanceMonitor = new PerformanceMonitor();
export const performanceTester = new PerformanceTester(performanceMonitor);
