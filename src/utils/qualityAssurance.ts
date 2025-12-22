/**
 * Quality Assurance and Testing Utilities
 */

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

interface QAReport {
  overall: 'pass' | 'fail' | 'warning';
  score: number;
  tests: TestResult[];
  recommendations: string[];
  timestamp: string;
}

export class QualityAssuranceManager {
  private testResults: TestResult[] = [];
  
  // Core functionality tests
  async testWebGLSupport(): Promise<TestResult> {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    const gl2 = canvas.getContext('webgl2');
    
    const passed = !!gl;
    
    // Type guard to ensure we have WebGL context
    const webglContext = gl as WebGLRenderingContext | null;
    
    const details = {
      webgl1: !!gl,
      webgl2: !!gl2,
      vendor: webglContext ? webglContext.getParameter(webglContext.VENDOR) : 'N/A',
      renderer: webglContext ? webglContext.getParameter(webglContext.RENDERER) : 'N/A',
      version: webglContext ? webglContext.getParameter(webglContext.VERSION) : 'N/A'
    };
    
    return {
      name: 'WebGL Support',
      passed,
      message: passed ? 'WebGL is supported' : 'WebGL is not supported',
      details,
      timestamp: new Date().toISOString()
    };
  }
  
  async testThreeJSInitialization(): Promise<TestResult> {
    try {
      // Test if Three.js can be imported and basic objects created
      const THREE = await import('three');
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer();
      
      // Clean up
      renderer.dispose();
      
      return {
        name: 'Three.js Initialization',
        passed: true,
        message: 'Three.js initialized successfully',
        details: { version: THREE.REVISION },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'Three.js Initialization',
        passed: false,
        message: `Three.js initialization failed: ${error}`,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async testReactThreeFiber(): Promise<TestResult> {
    try {
      // Test React Three Fiber import
      await import('@react-three/fiber');
      await import('@react-three/drei');
      
      return {
        name: 'React Three Fiber',
        passed: true,
        message: 'React Three Fiber loaded successfully',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: 'React Three Fiber',
        passed: false,
        message: `React Three Fiber failed to load: ${error}`,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async testPerformanceCapabilities(): Promise<TestResult> {
    const startTime = performance.now();
    
    // Test basic performance metrics
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    
    if (!gl) {
      return {
        name: 'Performance Capabilities',
        passed: false,
        message: 'WebGL not available for performance testing',
        timestamp: new Date().toISOString()
      };
    }
    
    // Test rendering performance
    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexAttribs = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    
    const endTime = performance.now();
    const testDuration = endTime - startTime;
    
    return {
      name: 'Performance Capabilities',
      passed: true,
      message: 'Performance test completed successfully',
      details: {
        renderer,
        vendor,
        maxTextureSize,
        maxVertexAttribs,
        testDuration
      },
      timestamp: new Date().toISOString()
    };
  }
  
  async runAllTests(): Promise<QAReport> {
    this.testResults = [];
    
    // Run all tests
    const tests = [
      this.testWebGLSupport(),
      this.testThreeJSInitialization(),
      this.testReactThreeFiber(),
      this.testPerformanceCapabilities()
    ];
    
    const results = await Promise.all(tests);
    this.testResults = results;
    
    // Calculate overall score
    const passedTests = results.filter(test => test.passed).length;
    const score = (passedTests / results.length) * 100;
    
    // Determine overall status
    let overall: 'pass' | 'fail' | 'warning';
    if (score === 100) {
      overall = 'pass';
    } else if (score >= 75) {
      overall = 'warning';
    } else {
      overall = 'fail';
    }
    
    // Generate recommendations
    const recommendations: string[] = [];
    results.forEach(test => {
      if (!test.passed) {
        recommendations.push(`Fix: ${test.message}`);
      }
    });
    
    if (recommendations.length === 0) {
      recommendations.push('All tests passed! System is ready for production.');
    }
    
    return {
      overall,
      score,
      tests: results,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }
  
  getLastReport(): QAReport | null {
    if (this.testResults.length === 0) return null;
    
    const passedTests = this.testResults.filter(test => test.passed).length;
    const score = (passedTests / this.testResults.length) * 100;
    
    let overall: 'pass' | 'fail' | 'warning';
    if (score === 100) {
      overall = 'pass';
    } else if (score >= 75) {
      overall = 'warning';
    } else {
      overall = 'fail';
    }
    
    return {
      overall,
      score,
      tests: this.testResults,
      recommendations: [],
      timestamp: new Date().toISOString()
    };
  }
}

export const qaManager = new QualityAssuranceManager();
  