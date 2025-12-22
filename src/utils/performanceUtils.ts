// Device capability detection utilities
export const deviceCapabilities = {
  getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  },

  getWebGLSupport(): {
    webgl1: boolean;
    webgl2: boolean;
    maxTextureSize: number;
    maxVertexAttribs: number;
    extensions: string[];
  } {
    const canvas = document.createElement('canvas');
    const gl1 = canvas.getContext('webgl');
    const gl2 = canvas.getContext('webgl2');
    
    const result = {
      webgl1: !!gl1,
      webgl2: !!gl2,
      maxTextureSize: 0,
      maxVertexAttribs: 0,
      extensions: [] as string[]
    };
    
    const gl = gl2 || gl1;
    if (gl) {
      result.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
      result.maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
      result.extensions = gl.getSupportedExtensions() || [];
    }
    
    return result;
  },

  getPerformanceTier(): 'low' | 'medium' | 'high' {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'low';
    
    // Type guard to ensure we have WebGL context
    const webglContext = gl as WebGLRenderingContext | WebGL2RenderingContext;
    
    const debugInfo = webglContext.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = webglContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
      
      // High-end GPUs
      if (renderer.includes('nvidia') && (renderer.includes('rtx') || renderer.includes('gtx'))) {
        return 'high';
      }
      
      // Medium-end GPUs
      if (renderer.includes('intel') || renderer.includes('amd')) {
        return 'medium';
      }
    }
    
    // Fallback based on device type
    const deviceType = this.getDeviceType();
    if (deviceType === 'desktop') return 'medium';
    if (deviceType === 'tablet') return 'medium';
    return 'low';
  },

  getScreenInfo(): {
    width: number;
    height: number;
    pixelRatio: number;
    orientation: 'portrait' | 'landscape';
  } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
    };
  },

  prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  getMemoryInfo(): { usedJSHeapSize?: number; totalJSHeapSize?: number; jsHeapSizeLimit?: number } {
    const performance = window.performance as any;
    return performance.memory || {};
  },

  getCPUCores(): number {
    return navigator.hardwareConcurrency || 4;
  }
};

// Performance monitoring utilities
export const performanceMonitor = {
  frameCount: 0,
  lastTime: 0,
  fps: 60,
  frameTime: 16.67,
  // subscription helpers for backward compatibility with other monitor APIs
  __callbackIdCounter: 0 as number,
  __callbacks: new Map<number, (metrics: { fps: number; frameTime: number }) => void >(),
  
  startFrame(): number {
    return performance.now();
  },
  
  endFrame(startTime: number): void {
    const currentTime = performance.now();
    this.frameTime = currentTime - startTime;
    this.frameCount++;
    
    // Calculate FPS every 60 frames
    if (this.frameCount % 60 === 0) {
      const deltaTime = currentTime - this.lastTime;
      this.fps = Math.round(60000 / deltaTime);
      this.lastTime = currentTime;
      // notify subscribers (shallow metric object)
      try {
        const snapshot = { fps: this.fps, frameTime: this.frameTime };
        for (const cb of this.__callbacks.values()) {
          try { cb(snapshot); } catch { /* swallow */ }
        }
      } catch {
        // ignore subscription errors
      }
    }
  },

  // Subscribe to monitor updates. Returns id for removal.
  onUpdate(callback: (metrics: { fps: number; frameTime: number }) => void): number {
    const id = ++this.__callbackIdCounter;
    this.__callbacks.set(id, callback);
    return id;
  },

  removeCallbackById(id: number) {
    this.__callbacks.delete(id);
  },

  removeCallback(callback: (metrics: { fps: number; frameTime: number }) => void) {
    for (const [id, cb] of this.__callbacks.entries()) {
      if (cb === callback) {
        this.__callbacks.delete(id);
        break;
      }
    }
  },
  
  getFPS(): number {
    return this.fps;
  },
  
  getFrameTime(): number {
    return this.frameTime;
  },
  
  getMemoryUsage(): { used: number; total: number; percentage: number } {
    const memory = deviceCapabilities.getMemoryInfo();
    const used = memory.usedJSHeapSize || 0;
    const total = memory.totalJSHeapSize || 0;
    
    return {
      used: Math.round(used / 1024 / 1024), // MB
      total: Math.round(total / 1024 / 1024), // MB
      percentage: total > 0 ? Math.round((used / total) * 100) : 0
    };
  },
  
  shouldReduceQuality(): boolean {
    return this.fps < 30 || this.frameTime > 33.33;
  },
  
  shouldIncreaseQuality(): boolean {
    return this.fps > 55 && this.frameTime < 18;
  }
};

// Quality settings presets
export const qualitySettings: Record<
  'low' | 'medium' | 'high',
  {
    lodDistance: number[];
    maxDrawDistance: number;
    particleMultiplier: number;
    shadowQuality: 'low' | 'medium' | 'high';
    shadowMapSize: number;
    antialias: boolean;
  }
> = {
  low: {
    lodDistance: [15, 35],       // switch early
    maxDrawDistance: 80,
    particleMultiplier: 0.3,
    shadowQuality: 'low',
    shadowMapSize: 512,
    antialias: false,
  },

  medium: {
    lodDistance: [25, 60],
    maxDrawDistance: 140,
    particleMultiplier: 0.6,
    shadowQuality: 'medium',
    shadowMapSize: 1024,
    antialias: true,
  },

  high: {
    lodDistance: [40, 100],      // keep high detail longer
    maxDrawDistance: 220,
    particleMultiplier: 1.0,
    shadowQuality: 'high',
    shadowMapSize: 2048,
    antialias: true,
  },
};


// Performance optimization utilities
export const performanceOptimizer = {
  adaptiveQuality: {
    current: 'medium' as 'low' | 'medium' | 'high',
    target: 60,
    tolerance: 5,
    
    update(): 'low' | 'medium' | 'high' {
      const fps = performanceMonitor.getFPS();
      
      if (fps < this.target - this.tolerance) {
        // Reduce quality
        if (this.current === 'high') this.current = 'medium';
        else if (this.current === 'medium') this.current = 'low';
      } else if (fps > this.target + this.tolerance) {
        // Increase quality
        if (this.current === 'low') this.current = 'medium';
        else if (this.current === 'medium') this.current = 'high';
      }
      
      return this.current;
    }
  },
  
  lodSystem: {
    getDistanceLOD(distance: number): 'high' | 'medium' | 'low' {
      if (distance < 20) return 'high';
      if (distance < 50) return 'medium';
      return 'low';
    },
    
    getParticleCount(baseCount: number, quality: 'low' | 'medium' | 'high'): number {
      const multipliers = { low: 0.3, medium: 0.6, high: 1.0 };
      return Math.floor(baseCount * multipliers[quality]);
    },
    
    getShadowMapSize(quality: 'low' | 'medium' | 'high'): number {
      const sizes = { low: 512, medium: 1024, high: 2048 };
      return sizes[quality];
    }
  },
  
  culling: {
    frustumCull(camera: any, objects: any[]): any[] {
      // Simplified frustum culling
      return objects.filter(obj => {
        // Basic distance check
        const distance = camera.position.distanceTo(obj.position);
        return distance < 100; // Cull objects beyond 100 units
      });
    },
    
    occlusionCull(objects: any[]): any[] {
      // Simplified occlusion culling
      // In a real implementation, this would check if objects are hidden behind others
      return objects;
    }
  }
};

// Texture optimization utilities
export const textureOptimizer = {
  getOptimalSize(originalSize: number, quality: 'low' | 'medium' | 'high'): number {
    const multipliers = { low: 0.25, medium: 0.5, high: 1.0 };
    const size = originalSize * multipliers[quality];
    
    // Ensure power of 2
    return Math.pow(2, Math.floor(Math.log2(size)));
  },
  
  shouldUseCompression(quality: 'low' | 'medium' | 'high'): boolean {
    return quality === 'low' || quality === 'medium';
  },
  
  getAnisotropy(quality: 'low' | 'medium' | 'high'): number {
    const levels = { low: 1, medium: 4, high: 16 };
    return levels[quality];
  }
};

// Battery and thermal monitoring
export const batteryMonitor = {
  async getBatteryInfo(): Promise<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  } | null> {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch {
      return null;
    }
  },
  
  shouldReducePerformance(batteryLevel: number): boolean {
    return batteryLevel < 0.2; // Reduce performance when battery is below 20%
  }
};

// Network performance monitoring
export const networkMonitor = {
  getConnectionInfo(): {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null {
    const connection = (navigator as any).connection || 
                     (navigator as any).mozConnection || 
                     (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 0,
        rtt: connection.rtt || 0,
        saveData: connection.saveData || false
      };
    }
    
    return null;
  },
  
  shouldReduceAssetQuality(): boolean {
    const connection = this.getConnectionInfo();
    if (!connection) return false;
    
    return connection.saveData || 
           connection.effectiveType === 'slow-2g' || 
           connection.effectiveType === '2g';
  }
};

const PerformanceUtils = {
  deviceCapabilities,
  performanceMonitor,
  performanceOptimizer,
  textureOptimizer,
  batteryMonitor,
  networkMonitor
};

export default PerformanceUtils;