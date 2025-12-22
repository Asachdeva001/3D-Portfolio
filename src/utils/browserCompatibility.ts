// browserCompatibility.ts
/**
 * Browser compatibility detection and handling utilities
 */

interface BrowserInfo {
  name: string;
  version: string;
  engine: string;
  platform: string;
  mobile: boolean;
  webglSupport: {
    webgl1: boolean;
    webgl2: boolean;
    extensions: string[];
    maxTextureSize: number;
    maxVertexAttribs: number;
  };
  features: {
    es6: boolean;
    webAssembly: boolean;
    serviceWorker: boolean;
    webWorkers: boolean;
    indexedDB: boolean;
    localStorage: boolean;
    pointerLock: boolean;
    fullscreen: boolean;
    gamepad: boolean;
    webAudio: boolean;
  };
}

interface CompatibilityIssue {
  severity: 'critical' | 'warning' | 'info';
  feature: string;
  message: string;
  workaround?: string;
}

export class BrowserCompatibilityChecker {
  private browserInfo: BrowserInfo | null = null;
  private issues: CompatibilityIssue[] = [];
  private isBrowserEnv: boolean;

  constructor(autoRun = true) {
    this.isBrowserEnv = typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof document !== 'undefined';

    // Only run detection in browser environment; otherwise keep as null (safe for SSR)
    if (autoRun && this.isBrowserEnv) {
      try {
        this.detectBrowser();
        this.checkCompatibility();
      } catch (err) {
        // Fail gracefully — leave browserInfo null and issues empty
        // Consumers should check getBrowserInfo() for null
        console.warn('BrowserCompatibilityChecker initialization failed:', err);
      }
    }
  }

  // Public method to trigger detection if instance was created on server and later used in browser
  async runDetectionIfNeeded() {
    if (!this.isBrowserEnv) return;
    if (!this.browserInfo) {
      this.detectBrowser();
      this.checkCompatibility();
    }
  }

  private detectBrowser() {
    if (!this.isBrowserEnv) return;

    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';
    let name = 'Unknown';
    let version = '0';
    let engine = 'Unknown';

    // Browser name/version/engine detection (basic)
    if (userAgent.includes('Edg/')) {
      name = 'Edge';
      version = this.extractVersion(userAgent, /Edg\/([0-9.]+)/);
      engine = 'Blink';
    } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
      name = 'Opera';
      version = this.extractVersion(userAgent, /(?:Opera|OPR)\/([0-9.]+)/);
      engine = 'Blink';
    } else if (userAgent.includes('Chrome') && !userAgent.includes('Chromium') && !userAgent.includes('Edg')) {
      name = 'Chrome';
      version = this.extractVersion(userAgent, /Chrome\/([0-9.]+)/);
      engine = 'Blink';
    } else if (userAgent.includes('Firefox')) {
      name = 'Firefox';
      version = this.extractVersion(userAgent, /Firefox\/([0-9.]+)/);
      engine = 'Gecko';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      name = 'Safari';
      version = this.extractVersion(userAgent, /Version\/([0-9.]+)/);
      engine = 'WebKit';
    }

    const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    const webglSupport = this.checkWebGLSupport();
    const features = this.checkFeatureSupport();

    this.browserInfo = {
      name,
      version,
      engine,
      platform,
      mobile,
      webglSupport,
      features,
    };
  }

  private extractVersion(userAgent: string, regex: RegExp): string {
    const match = userAgent.match(regex);
    return match ? match[1] : '0';
  }

  private checkWebGLSupport() {
    if (!this.isBrowserEnv) {
      return {
        webgl1: false,
        webgl2: false,
        extensions: [] as string[],
        maxTextureSize: 0,
        maxVertexAttribs: 0,
      };
    }

    const canvas = document.createElement('canvas');

    // guard calls in try/catch - some environments can throw
    let gl1: WebGLRenderingContext | null = null;
    let gl2: WebGL2RenderingContext | null = null;

    try {
      gl2 = (canvas.getContext('webgl2') as WebGL2RenderingContext) || null;
    } catch {
      gl2 = null;
    }

    try {
      gl1 = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    } catch {
      gl1 = null;
    }

    const extensions: string[] = [];
    let maxTextureSize = 0;
    let maxVertexAttribs = 0;

    try {
      if (gl2) {
        const exts = gl2.getSupportedExtensions();
        if (exts && exts.length) extensions.push(...exts);
        // getParameter expects GLenum constants from the context
        maxTextureSize = typeof gl2.getParameter === 'function' ? (gl2.getParameter(gl2.MAX_TEXTURE_SIZE) as number) : 0;
        maxVertexAttribs = typeof gl2.getParameter === 'function' ? (gl2.getParameter(gl2.MAX_VERTEX_ATTRIBS) as number) : 0;
      } else if (gl1) {
        const exts = gl1.getSupportedExtensions();
        if (exts && exts.length) extensions.push(...exts);
        maxTextureSize = typeof gl1.getParameter === 'function' ? (gl1.getParameter(gl1.MAX_TEXTURE_SIZE) as number) : 0;
        maxVertexAttribs = typeof gl1.getParameter === 'function' ? (gl1.getParameter(gl1.MAX_VERTEX_ATTRIBS) as number) : 0;
      }
    } catch {
      // ignore WebGL parameter errors
    }

    return {
      webgl1: !!gl1,
      webgl2: !!gl2,
      extensions,
      maxTextureSize: maxTextureSize || 0,
      maxVertexAttribs: maxVertexAttribs || 0,
    };
  }

  private checkFeatureSupport() {
    if (!this.isBrowserEnv) {
      return {
        es6: false,
        webAssembly: false,
        serviceWorker: false,
        webWorkers: false,
        indexedDB: false,
        localStorage: false,
        pointerLock: false,
        fullscreen: false,
        gamepad: false,
        webAudio: false,
      };
    }

    const supportsPointerLock =
      'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    const supportsFullscreen =
      'fullscreenElement' in document || 'webkitFullscreenElement' in document || 'mozFullScreenElement' in document;
    const supportsWebAudio = typeof (window as Window & { AudioContext?: unknown; webkitAudioContext?: unknown }).AudioContext !== 'undefined' || typeof (window as Window & { AudioContext?: unknown; webkitAudioContext?: unknown }).webkitAudioContext !== 'undefined';

    return {
      es6: this.supportsES6(),
      webAssembly: typeof (window as Window & { WebAssembly?: unknown }).WebAssembly !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      webWorkers: typeof Worker !== 'undefined',
      indexedDB: typeof indexedDB !== 'undefined',
      localStorage: this.supportsLocalStorage(),
      pointerLock: !!supportsPointerLock,
      fullscreen: !!supportsFullscreen,
      gamepad: 'getGamepads' in navigator,
      webAudio: !!supportsWebAudio,
    };
  }

  private supportsES6(): boolean {
    try {
      return typeof Symbol !== 'undefined' && typeof Promise !== 'undefined' && typeof Map !== 'undefined' && typeof Set !== 'undefined';
    } catch {
      return false;
    }
  }

  private supportsLocalStorage(): boolean {
    if (!this.isBrowserEnv) return false;
    try {
      const test = '__compat_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private checkCompatibility() {
    if (!this.browserInfo) return;

    // Clear previous issues
    this.issues = [];

    // Critical WebGL check
    if (!this.browserInfo.webglSupport.webgl1) {
      this.issues.push({
        severity: 'critical',
        feature: 'WebGL',
        message: 'WebGL is not supported. The 3D portfolio cannot run.',
        workaround: 'Please use a modern browser like Chrome, Firefox, or Safari.',
      });
    }

    // WebGL2 warning
    if (!this.browserInfo.webglSupport.webgl2) {
      this.issues.push({
        severity: 'warning',
        feature: 'WebGL 2',
        message: 'WebGL 2 is not supported. Some advanced features may be disabled.',
        workaround: 'Update your browser to the latest version for best experience.',
      });
    }

    // ES6
    if (!this.browserInfo.features.es6) {
      this.issues.push({
        severity: 'critical',
        feature: 'ES6',
        message: 'ES6 features are not supported. The application may not work correctly.',
        workaround: 'Please update your browser to a modern version.',
      });
    }

    // Browser version checks
    this.checkBrowserVersions();

    // Mobile notes
    if (this.browserInfo.mobile) {
      this.checkMobileCompatibility();
    }

    // Texture size
    if (this.browserInfo.webglSupport.maxTextureSize > 0 && this.browserInfo.webglSupport.maxTextureSize < 2048) {
      this.issues.push({
        severity: 'warning',
        feature: 'Texture Size',
        message: 'Maximum texture size is limited. Some textures may be downscaled.',
        workaround: 'Graphics quality will be automatically reduced.',
      });
    }

    // Pointer lock info
    if (!this.browserInfo.features.pointerLock) {
      this.issues.push({
        severity: 'info',
        feature: 'Pointer Lock',
        message: 'Pointer lock is not supported. Mouse controls may be limited.',
        workaround: 'Use keyboard controls for navigation.',
      });
    }

    // Web Audio info
    if (!this.browserInfo.features.webAudio) {
      this.issues.push({
        severity: 'info',
        feature: 'Web Audio',
        message: 'Web Audio API is not supported. Audio features will be disabled.',
        workaround: 'Audio is optional and does not affect core functionality.',
      });
    }
  }

  private checkBrowserVersions() {
    if (!this.browserInfo) return;

    const minVersions: Record<string, number> = {
      Chrome: 80,
      Firefox: 75,
      Safari: 13,
      Edge: 80,
      Opera: 67,
    };

    const raw = this.browserInfo.version || '0';
    const currentVersion = parseInt(raw.split('.')[0] || '0', 10);
    const minVersion = minVersions[this.browserInfo.name];

    if (minVersion && currentVersion > 0 && currentVersion < minVersion) {
      this.issues.push({
        severity: 'warning',
        feature: 'Browser Version',
        message: `${this.browserInfo.name} ${this.browserInfo.version} may have compatibility issues.`,
        workaround: `Please update to ${this.browserInfo.name} ${minVersion} or later.`,
      });
    }
  }

  private checkMobileCompatibility() {
    if (!this.browserInfo) return;

    this.issues.push({
      severity: 'info',
      feature: 'Mobile Device',
      message: 'Running on mobile device. Performance may be limited.',
      workaround: 'Graphics quality will be automatically optimized for mobile.',
    });

    // iOS Safari specifics
    if (this.browserInfo.name === 'Safari' && /iPhone|iPad|iPod/.test(navigator.userAgent || '')) {
      this.issues.push({
        severity: 'info',
        feature: 'iOS Safari',
        message: 'iOS Safari has specific WebGL limitations.',
        workaround: 'Some advanced effects may be disabled for stability.',
      });
    }
  }

  // Public methods
  getBrowserInfo(): BrowserInfo | null {
    return this.browserInfo ? { ...this.browserInfo } : null;
  }

  getCompatibilityIssues(): CompatibilityIssue[] {
    return [...this.issues];
  }

  isCompatible(): boolean {
    return !this.issues.some((issue) => issue.severity === 'critical');
  }

  getCompatibilityScore(): number {
    if (!this.browserInfo) return 0;
    let score = 100;
    this.issues.forEach((issue) => {
      if (issue.severity === 'critical') score -= 30;
      else if (issue.severity === 'warning') score -= 15;
      else if (issue.severity === 'info') score -= 5;
    });
    return Math.max(0, score);
  }

  getRecommendedSettings() {
    if (!this.browserInfo) return null;

    const settings = {
      quality: 'high' as 'high' | 'medium' | 'low',
      enablePostProcessing: true,
      enableShadows: true,
      enableReflections: true,
      enableParticles: true,
      textureQuality: 1.0,
      renderScale: 1.0,
    };

    const criticalIssues = this.issues.filter((i) => i.severity === 'critical').length;
    const warningIssues = this.issues.filter((i) => i.severity === 'warning').length;

    if (criticalIssues > 0) {
      return null; // cannot run
    }

    if (warningIssues > 2 || this.browserInfo.mobile) {
      settings.quality = 'low';
      settings.enablePostProcessing = false;
      settings.enableShadows = false;
      settings.enableReflections = false;
      settings.enableParticles = false;
      settings.textureQuality = 0.5;
      settings.renderScale = 0.75;
    } else if (warningIssues > 0) {
      settings.quality = 'medium';
      settings.enablePostProcessing = true;
      settings.enableShadows = true;
      settings.enableReflections = false;
      settings.textureQuality = 0.75;
      settings.renderScale = 0.9;
    }

    return settings;
  }

  // Browser-specific polyfills and fixes (safe guards applied)
  applyPolyfills() {
    if (!this.isBrowserEnv) return;

    // Pointer lock polyfill
    const docWithPointerLock = document as Document & {
      exitPointerLock?: () => void;
      webkitExitPointerLock?: () => void;
      mozExitPointerLock?: () => void;
    };
    if (!docWithPointerLock.exitPointerLock) {
      const polyfill = docWithPointerLock.webkitExitPointerLock || docWithPointerLock.mozExitPointerLock;
      if (polyfill) {
        docWithPointerLock.exitPointerLock = polyfill;
      }
    }

    // Fullscreen API polyfill
    const docWithFullscreen = document as Document & {
      exitFullscreen?: () => Promise<void>;
      webkitExitFullscreen?: () => void;
      mozCancelFullScreen?: () => void;
      msExitFullscreen?: () => void;
    };
    if (!docWithFullscreen.exitFullscreen) {
      const polyfill = docWithFullscreen.webkitExitFullscreen || docWithFullscreen.mozCancelFullScreen || docWithFullscreen.msExitFullscreen;
      if (polyfill) {
        docWithFullscreen.exitFullscreen = () => Promise.resolve(polyfill());
      }
    }

    // AudioContext polyfill
    const winWithAudio = window as Window & {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    if (typeof winWithAudio.AudioContext === 'undefined' && typeof winWithAudio.webkitAudioContext !== 'undefined') {
      try {
        winWithAudio.AudioContext = winWithAudio.webkitAudioContext;
      } catch {
        // ignore if assignment fails
      }
    }

    // Performance.now polyfill
    const perfWithNow = performance as Performance & { now?: () => number };
    if (typeof perfWithNow.now !== 'function') {
      try {
        perfWithNow.now = () => Date.now();
      } catch {
        // ignore
      }
    }

    // RequestAnimationFrame polyfill
    const winWithRAF = window as Window & {
      webkitRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
      mozRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
      oRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
      msRequestAnimationFrame?: (callback: FrameRequestCallback) => number;
    };
    if (typeof window.requestAnimationFrame !== 'function') {
      (window as Window & { requestAnimationFrame: (callback: FrameRequestCallback) => number }).requestAnimationFrame =
        winWithRAF.webkitRequestAnimationFrame ||
        winWithRAF.mozRequestAnimationFrame ||
        winWithRAF.oRequestAnimationFrame ||
        winWithRAF.msRequestAnimationFrame ||
        ((cb: FrameRequestCallback) => window.setTimeout(cb, 1000 / 60));
    }
  }

  // Generate compatibility report (markdown-ish)
  generateReport(): string {
    if (!this.browserInfo) return 'Browser detection failed.';

    const bi = this.browserInfo;
    let report = '# Browser Compatibility Report\n\n';

    report += `**Browser:** ${bi.name} ${bi.version}\n`;
    report += `**Engine:** ${bi.engine}\n`;
    report += `**Platform:** ${bi.platform}\n`;
    report += `**Mobile:** ${bi.mobile ? 'Yes' : 'No'}\n\n`;

    report += '## WebGL Support\n';
    report += `- WebGL 1.0: ${bi.webglSupport.webgl1 ? '✅' : '❌'}\n`;
    report += `- WebGL 2.0: ${bi.webglSupport.webgl2 ? '✅' : '❌'}\n`;
    report += `- Max Texture Size: ${bi.webglSupport.maxTextureSize}px\n`;
    report += `- Max Vertex Attributes: ${bi.webglSupport.maxVertexAttribs}\n\n`;

    report += '## Feature Support\n';
    Object.entries(bi.features).forEach(([feature, supported]) => {
      report += `- ${feature}: ${supported ? '✅' : '❌'}\n`;
    });

    if (this.issues.length > 0) {
      report += '\n## Compatibility Issues\n';
      this.issues.forEach((issue, index) => {
        const icon = issue.severity === 'critical' ? '🚨' : issue.severity === 'warning' ? '⚠️' : 'ℹ️';
        report += `${index + 1}. ${icon} **${issue.feature}**: ${issue.message}\n`;
        if (issue.workaround) {
          report += `   *Workaround: ${issue.workaround}*\n`;
        }
        report += '\n';
      });
    }

    report += `\n**Compatibility Score:** ${this.getCompatibilityScore()}/100\n`;
    report += `**Can Run 3D Portfolio:** ${this.isCompatible() ? 'Yes' : 'No'}\n`;

    return report;
  }
}

/**
 * Safe singleton factory:
 * - In browser: returns a real, initialized checker instance
 * - On server: returns a lightweight stub with safe methods
 */
function createBrowserCompatibility(): BrowserCompatibilityChecker {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || typeof document === 'undefined') {
    // SSR stub
    return new BrowserCompatibilityChecker(false);
  }
  const checker = new BrowserCompatibilityChecker(true);
  return checker;
}

// Export a singleton instance (safe for SSR)
export const browserCompatibility = createBrowserCompatibility();

/* Utility helpers exported for convenience */
export const browserUtils = {
  isChrome: () => browserCompatibility.getBrowserInfo()?.name === 'Chrome',
  isFirefox: () => browserCompatibility.getBrowserInfo()?.name === 'Firefox',
  isSafari: () => browserCompatibility.getBrowserInfo()?.name === 'Safari',
  isEdge: () => browserCompatibility.getBrowserInfo()?.name === 'Edge',
  isMobile: () => browserCompatibility.getBrowserInfo()?.mobile || false,

  supportsWebGL2: () => browserCompatibility.getBrowserInfo()?.webglSupport.webgl2 || false,
  supportsPointerLock: () => browserCompatibility.getBrowserInfo()?.features.pointerLock || false,
  supportsWebAudio: () => browserCompatibility.getBrowserInfo()?.features.webAudio || false,

  getMaxTextureSize: () => browserCompatibility.getBrowserInfo()?.webglSupport.maxTextureSize || 0,

  getOptimalSettings: () => browserCompatibility.getRecommendedSettings(),

  hasWebGLExtension: (extensionName: string) => {
    const extensions = browserCompatibility.getBrowserInfo()?.webglSupport.extensions || [];
    return extensions.includes(extensionName);
  },
};
