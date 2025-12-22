'use client';

import React, { useState, useEffect } from 'react';
import { deviceCapabilities } from '@/utils/performanceUtils';
import { useSceneStore } from '@/store/sceneStore';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  fallbackComponent?: React.ReactNode;
}

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  webglSupport: {
    webgl1: boolean;
    webgl2: boolean;
    maxTextureSize: number;
  };
  performanceTier: 'low' | 'medium' | 'high';
  screenInfo: {
    width: number;
    height: number;
  };
  prefersReducedMotion: boolean;
  connectionSpeed: 'slow' | 'medium' | 'fast';
}

export default function ResponsiveWrapper({ children, fallbackComponent }: ResponsiveWrapperProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [canRun3D, setCanRun3D] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { setPerformance } = useSceneStore();

  const detectConnectionSpeed = (): 'slow' | 'medium' | 'fast' => {
    if (typeof navigator === 'undefined') return 'fast';

    const connection = (navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        type?: string;
      };
      mozConnection?: {
        effectiveType?: string;
        type?: string;
      };
      webkitConnection?: {
        effectiveType?: string;
        type?: string;
      };
    }).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType || connection.type || '';
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return 'slow';
        case '3g':
          return 'medium';
        case '4g':
        default:
          return 'fast';
      }
    }
    return 'fast';
  };

  // Accept DeviceInfo shape for info (defensive)
  const canRun3DExperience = (info: DeviceInfo | null): boolean => {
    if (!info) return false;

    // Check WebGL support
    if (!info.webglSupport || !info.webglSupport.webgl1) {
      return false;
    }

    // Check minimum texture size
    if (typeof info.webglSupport.maxTextureSize === 'number' && info.webglSupport.maxTextureSize < 1024) {
      return false;
    }

    // Check device type and performance
    if (info.type === 'mobile' && info.performanceTier === 'low') {
      return false;
    }

    // Check screen size (too small screens)
    if (info.screenInfo && (info.screenInfo.width < 480 || info.screenInfo.height < 320)) {
      return false;
    }

    return true;
  };

  useEffect(() => {
    let mounted = true;

    const detectCapabilities = async () => {
      try {
        // Defensive: ensure deviceCapabilities exists and provides expected methods
        const dc = deviceCapabilities as {
          getDeviceType?: () => Promise<'mobile' | 'tablet' | 'desktop'> | 'mobile' | 'tablet' | 'desktop';
          getWebGLSupport?: () => Promise<{ webgl1: boolean; webgl2: boolean; maxTextureSize: number }> | { webgl1: boolean; webgl2: boolean; maxTextureSize: number };
          getPerformanceTier?: () => Promise<'low' | 'medium' | 'high'> | 'low' | 'medium' | 'high';
          getScreenInfo?: () => Promise<{ width: number; height: number }> | { width: number; height: number };
          prefersReducedMotion?: () => Promise<boolean> | boolean;
        };

        const type = typeof dc?.getDeviceType === 'function' ? await Promise.resolve(dc.getDeviceType()) : 'desktop';
        const webglSupport = typeof dc?.getWebGLSupport === 'function' ? await Promise.resolve(dc.getWebGLSupport()) : { webgl1: false, webgl2: false, maxTextureSize: 0 };
        const performanceTier = typeof dc?.getPerformanceTier === 'function' ? await Promise.resolve(dc.getPerformanceTier()) : 'low';
        const screenInfo = typeof dc?.getScreenInfo === 'function' ? await Promise.resolve(dc.getScreenInfo()) : { width: typeof window !== 'undefined' ? window.innerWidth : 0, height: typeof window !== 'undefined' ? window.innerHeight : 0 };
        const prefersReducedMotion = typeof dc?.prefersReducedMotion === 'function' ? await Promise.resolve(dc.prefersReducedMotion()) : false;

        // Detect connection speed (guard navigator)
        const connectionSpeed = detectConnectionSpeed();

        const info = {
          type,
          webglSupport,
          performanceTier,
          screenInfo,
          prefersReducedMotion,
          connectionSpeed,
        };

        if (!mounted) return;
        setDeviceInfo(info);

        // Determine if 3D experience can run
        const can3D = canRun3DExperience(info);
        setCanRun3D(can3D);

        // Set performance settings (defensive call)
        try {
          setPerformance({
            quality: can3D ? performanceTier : 'low',
            fps: 60,
          });
        } catch {
          // ignore if store signature differs
        }

        if (!mounted) return;
        setIsLoading(false);
      } catch (error) {
        // Fail gracefully
        console.warn('Capability detection failed:', error);
        if (mounted) {
          setCanRun3D(false);
          setIsLoading(false);
        }
      }
    };

    detectCapabilities();

    return () => {
      mounted = false;
    };
  }, [setPerformance]);

  if (isLoading) {
    return <LoadingScreenLocal />;
  }

  if (!canRun3D) {
    return fallbackComponent ?? <Fallback2D deviceInfo={deviceInfo} />;
  }

  return (
    <div className="relative w-full h-full">
      {children}
      <DeviceAdaptations deviceInfo={deviceInfo} />
    </div>
  );
}

// Local Loading screen (keeps the file self-contained)
function LoadingScreenLocal() {
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-center text-cyan-400 font-mono">
        <div className="text-2xl font-bold mb-4 animate-pulse">INITIALIZING CYBERPUNK PORTFOLIO</div>
        <div className="text-sm opacity-70">Detecting device capabilities...</div>
        <div className="mt-4">
          <div className="w-48 h-1 bg-gray-800 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 2D Fallback component for unsupported devices
interface Fallback2DProps {
  deviceInfo: DeviceInfo | null;
}

function Fallback2D({ deviceInfo }: Fallback2DProps) {
  const info = deviceInfo ?? {};
  const typeLabel = ('type' in info && typeof info.type === 'string' ? info.type : 'unknown').toString().toUpperCase();
  const webglText = 'webglSupport' in info && info.webglSupport && typeof info.webglSupport === 'object' && info.webglSupport !== null ? 
    ('webgl2' in info.webglSupport && info.webglSupport.webgl2 ? 'WebGL 2.0' : 
     'webgl1' in info.webglSupport && info.webglSupport.webgl1 ? 'WebGL 1.0' : 'Not Supported') : 'Unknown';
  const perfLabel = ('performanceTier' in info && typeof info.performanceTier === 'string' ? info.performanceTier : 'unknown').toString().toUpperCase();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10" />
        <div className="relative z-10 container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
            CYBERPUNK PORTFOLIO
          </h1>
          <p className="text-xl text-gray-300 mb-8">Full Stack Developer & 3D Graphics Enthusiast</p>

          {/* Device compatibility notice */}
          <div className="bg-yellow-900/20 border border-yellow-400 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="text-yellow-400 font-mono text-sm">
              <div className="font-bold mb-2">3D Experience Unavailable</div>
              <div className="text-xs space-y-1">
                <div>Device: {typeLabel}</div>
                <div>WebGL: {webglText}</div>
                <div>Performance: {perfLabel}</div>
              </div>
              <div className="mt-2 text-yellow-300">Showing optimized 2D version instead.</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content sections */}
      <main className="container mx-auto px-4 py-16 space-y-16">
        {/* About section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-cyan-400 mb-8">About Me</h2>
          <div className="max-w-3xl mx-auto text-gray-300 leading-relaxed">
            <p className="mb-4">
              I&apos;m a passionate full-stack developer with expertise in modern web technologies, 3D graphics, and creating
              immersive digital experiences.
            </p>
            <p>
              This portfolio normally features a fully interactive 3D cyberpunk city, but your device is showing this
              optimized version for the best experience.
            </p>
          </div>
        </section>

        {/* Skills section */}
        <section>
          <h2 className="text-3xl font-bold text-purple-400 mb-8 text-center">Skills</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Frontend Development',
                skills: ['React/Next.js', 'TypeScript', 'Three.js/WebGL', 'Tailwind CSS'],
              },
              {
                title: 'Backend Development',
                skills: ['Node.js', 'Python', 'PostgreSQL', 'GraphQL'],
              },
              {
                title: 'Tools & Technologies',
                skills: ['Git/GitHub', 'Docker', 'AWS/Cloud', 'CI/CD'],
              },
            ].map((category, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-bold text-orange-400 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.skills.map((skill, skillIndex) => (
                    <li key={skillIndex} className="text-gray-300 flex items-center">
                      <span className="w-2 h-2 bg-cyan-400 rounded-full mr-3" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Projects section */}
        <section>
          <h2 className="text-3xl font-bold text-green-400 mb-8 text-center">Featured Projects</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700 hover:border-cyan-400 transition-colors"
              >
                <div className="h-48 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 flex items-center justify-center">
                  <div className="text-6xl opacity-30">🚀</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">Project {index + 1}</h3>
                  <p className="text-gray-300 text-sm mb-4">A showcase project demonstrating various technologies and skills.</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'Three.js'].map((tech, techIndex) => (
                      <span key={techIndex} className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-orange-400 mb-8">Get In Touch</h2>
          <div className="max-w-md mx-auto space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <div className="text-gray-300">
                <div className="font-mono text-sm opacity-70">Email:</div>
                <div className="text-cyan-400">your.email@example.com</div>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              {['GitHub', 'LinkedIn', 'Twitter'].map((platform, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 text-gray-300 rounded hover:border-cyan-400 hover:text-cyan-400 transition-colors"
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2024 Cyberpunk Portfolio. Built with Next.js and Three.js.</p>
          <p className="mt-2">For the full 3D experience, try visiting on a desktop with WebGL support.</p>
        </div>
      </footer>
    </div>
  );
}

// Device-specific adaptations
interface DeviceAdaptationsProps {
  deviceInfo: DeviceInfo | null;
}

function DeviceAdaptations({ deviceInfo }: DeviceAdaptationsProps) {
  const [showMobileHint, setShowMobileHint] = useState(false);
  const infoType = deviceInfo?.type ?? 'desktop';
  const perfTier = deviceInfo?.performanceTier ?? 'medium';
  const prefersReducedMotion = deviceInfo?.prefersReducedMotion ?? false;

  useEffect(() => {
    if (infoType === 'mobile' || infoType === 'tablet') {
      // Use timeout to avoid setState in effect
      const showTimer = setTimeout(() => setShowMobileHint(true), 0);

      // Hide hint after 5 seconds
      const hideTimer = setTimeout(() => {
        setShowMobileHint(false);
      }, 5000);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
    return;
  }, [infoType]);

  return (
    <>
      {/* Mobile optimization hint */}
      {showMobileHint && (
        <div className="fixed top-4 left-4 right-4 bg-black/80 border border-cyan-400 rounded-lg p-4 z-50 backdrop-blur-sm">
          <div className="text-cyan-400 font-mono text-sm text-center">
            <div className="font-bold mb-2">MOBILE OPTIMIZED</div>
            <div className="text-xs space-y-1">
              <div>• Reduced particle effects for better performance</div>
              <div>• Touch controls enabled</div>
              <div>• Simplified lighting and shadows</div>
            </div>
            <button onClick={() => setShowMobileHint(false)} className="mt-2 text-xs text-gray-400 hover:text-cyan-400">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Performance warning for low-end devices */}
      {perfTier === 'low' && (
        <div className="fixed bottom-4 left-4 bg-yellow-900/80 border border-yellow-400 rounded-lg p-3 z-50 backdrop-blur-sm">
          <div className="text-yellow-400 font-mono text-xs">
            <div className="font-bold">PERFORMANCE MODE</div>
            <div>Some effects disabled for smoother experience</div>
          </div>
        </div>
      )}

      {/* Reduced motion indicator */}
      {prefersReducedMotion && (
        <div className="fixed top-4 right-4 bg-blue-900/80 border border-blue-400 rounded-lg p-3 z-50 backdrop-blur-sm">
          <div className="text-blue-400 font-mono text-xs">
            <div className="font-bold">REDUCED MOTION</div>
            <div>Animations minimized per your preference</div>
          </div>
        </div>
      )}
    </>
  );
}

// Progressive loading component
export function ProgressiveLoader({
  children,
  fallback,
  delay = 1000,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
  delay?: number;
}) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setIsLoaded(true);
    }, delay);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [delay]);

  return isLoaded ? <>{children}</> : <>{fallback}</>;
}
