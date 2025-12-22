'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useProgress } from '@react-three/drei';
import * as THREE from 'three';

interface LoadingScreenProps {
  onComplete?: () => void;
  minLoadTime?: number;
}

// Static loading stages - moved outside component to avoid dependency issues
const LOADING_STAGES = [
  { stage: 'initializing', text: 'INITIALIZING SYSTEMS...', minProgress: 0 },
  { stage: 'webgl', text: 'CHECKING WEBGL COMPATIBILITY...', minProgress: 10 },
  { stage: 'shaders', text: 'COMPILING NEON SHADERS...', minProgress: 25 },
  { stage: 'textures', text: 'LOADING CYBERPUNK TEXTURES...', minProgress: 40 },
  { stage: 'models', text: 'GENERATING CITY GEOMETRY...', minProgress: 60 },
  { stage: 'lighting', text: 'CALIBRATING NEON LIGHTING...', minProgress: 80 },
  { stage: 'finalizing', text: 'FINALIZING HOLOGRAPHIC INTERFACE...', minProgress: 95 },
  { stage: 'complete', text: 'CYBERPUNK PORTFOLIO READY', minProgress: 100 }
];

export default function LoadingScreen({ onComplete, minLoadTime = 2000 }: LoadingScreenProps) {
  const { progress, loaded, total } = useProgress();
  const [loadingText, setLoadingText] = useState('INITIALIZING SYSTEMS...');
  const [isComplete, setIsComplete] = useState(false);
  const startTime = useRef<number | undefined>(undefined);
  
  // Initialize start time in useEffect to avoid impure function in render
  useEffect(() => {
    if (startTime.current === undefined) {
      startTime.current = Date.now();
    }
  }, []);
  
  // Generate random positions for floating shapes using useState to avoid impure functions in render
  const [floatingShapes] = useState(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDuration: 3 + Math.random() * 4,
      animationDelay: Math.random() * 2
    }))
  );
  
  useEffect(() => {
    // Update loading stage based on progress
    const currentStage = LOADING_STAGES.find(s => progress >= s.minProgress && progress < (LOADING_STAGES[LOADING_STAGES.indexOf(s) + 1]?.minProgress || 101));
    if (currentStage) {
      setLoadingText(currentStage.text);
    }
  }, [progress]);
  
  useEffect(() => {
    if (progress === 100 && !isComplete) {
      const elapsedTime = Date.now() - (startTime.current ?? Date.now());
      const remainingTime = Math.max(0, minLoadTime - elapsedTime);
      
      setTimeout(() => {
        setIsComplete(true);
        onComplete?.();
      }, remainingTime);
    }
  }, [progress, isComplete, onComplete, minLoadTime]);

  if (isComplete) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}
        />
      </div>
      
      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {floatingShapes.map((shape) => (
          <div
            key={shape.id}
            className="absolute w-2 h-2 bg-cyan-400 opacity-60"
            style={{
              left: `${shape.left}%`,
              top: `${shape.top}%`,
              animation: `float ${shape.animationDuration}s ease-in-out infinite`,
              animationDelay: `${shape.animationDelay}s`
            }}
          />
        ))}
      </div>
      
      {/* Main loading content */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-8">
        {/* Logo/Title */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-mono mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
              CYBERPUNK
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400">
              PORTFOLIO
            </span>
          </h1>
          <div className="text-cyan-400 text-sm font-mono opacity-70">
            IMMERSIVE 3D EXPERIENCE
          </div>
        </div>
        
        {/* Loading progress */}
        <div className="mb-8">
          <div className="text-cyan-400 font-mono text-lg mb-4 min-h-[1.5rem]">
            {loadingText}
          </div>
          
          {/* Progress bar */}
          <div className="relative w-full h-2 bg-gray-800 rounded-full overflow-hidden border border-cyan-400/30">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
          
          {/* Progress text */}
          <div className="flex justify-between text-xs font-mono text-gray-400 mt-2">
            <span>LOADING...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          
          {/* Asset counter */}
          <div className="text-xs font-mono text-gray-500 mt-1">
            {loaded} / {total} assets loaded
          </div>
        </div>
        
        {/* Loading stages indicator */}
        <div className="flex justify-center space-x-2 mb-8">
          {LOADING_STAGES.slice(0, -1).map((stage) => (
            <div
              key={stage.stage}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                progress >= stage.minProgress 
                  ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* System info */}
        <div className="text-xs font-mono text-gray-500 space-y-1">
          <div>WEBGL 2.0 COMPATIBLE</div>
          <div>NEURAL INTERFACE ACTIVE</div>
          <div>QUANTUM ENCRYPTION ENABLED</div>
        </div>
        
        {/* Glitch effect overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="w-full h-full opacity-10"
            style={{
              background: `
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.1) 2px,
                  rgba(0, 255, 255, 0.1) 4px
                )
              `,
              animation: 'glitch 0.3s infinite'
            }}
          />
        </div>
      </div>
      
      {/* CSS animations */}
      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes glitch {
          0%, 90%, 100% { opacity: 0; }
          95% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
}

// Error boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('3D Portfolio Error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }
    
    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error }: { error: Error }) {
  const [showDetails, setShowDetails] = useState(false);
  
  const handleReload = () => {
    window.location.reload();
  };
  
  const handleReport = () => {
    // In a real app, this would send error reports
    console.log('Error reported:', error);
  };
  
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-8 text-center">
        {/* Error icon */}
        <div className="text-6xl mb-6">⚠️</div>
        
        {/* Error message */}
        <h1 className="text-3xl font-bold text-red-400 mb-4 font-mono">
          SYSTEM MALFUNCTION
        </h1>
        
        <p className="text-gray-300 mb-8 leading-relaxed">
          The cyberpunk portfolio encountered a critical error and needs to restart. 
          This might be due to WebGL compatibility issues or insufficient system resources.
        </p>
        
        {/* Error details */}
        <div className="bg-gray-900 border border-red-400/30 rounded-lg p-4 mb-8 text-left">
          <div className="flex justify-between items-center mb-2">
            <span className="text-red-400 font-mono text-sm font-bold">ERROR DETAILS</span>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-400 hover:text-red-400"
            >
              {showDetails ? 'HIDE' : 'SHOW'}
            </button>
          </div>
          
          {showDetails && (
            <div className="font-mono text-xs text-gray-400 space-y-2">
              <div>
                <span className="text-red-400">Type:</span> {error.name}
              </div>
              <div>
                <span className="text-red-400">Message:</span> {error.message}
              </div>
              {error.stack && (
                <div>
                  <span className="text-red-400">Stack:</span>
                  <pre className="mt-1 text-xs overflow-x-auto">
                    {error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="space-y-4">
          <button
            onClick={handleReload}
            className="w-full px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-mono rounded-lg transition-colors"
          >
            RESTART SYSTEM
          </button>
          
          <div className="flex space-x-4">
            <button
              onClick={handleReport}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm rounded border border-gray-600 transition-colors"
            >
              REPORT ERROR
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-mono text-sm rounded border border-gray-600 transition-colors"
            >
              GO BACK
            </button>
          </div>
        </div>
        
        {/* Troubleshooting tips */}
        <div className="mt-8 text-left bg-gray-900/50 rounded-lg p-4 border border-gray-700">
          <h3 className="text-yellow-400 font-mono text-sm font-bold mb-3">TROUBLESHOOTING</h3>
          <ul className="text-xs text-gray-400 space-y-2 font-mono">
            <li>• Ensure your browser supports WebGL 2.0</li>
            <li>• Try refreshing the page or clearing browser cache</li>
            <li>• Update your graphics drivers</li>
            <li>• Close other tabs to free up memory</li>
            <li>• Try using a different browser (Chrome, Firefox, Safari)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Progressive asset loader
interface AssetLoaderProps {
  assets: { url: string; type: 'texture' | 'model' | 'audio'; priority: number }[];
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function AssetLoader({ assets, onProgress, onComplete, onError }: AssetLoaderProps) {
  const loadingManager = useRef<THREE.LoadingManager | null>(null);
  
  useEffect(() => {
    loadingManager.current = new THREE.LoadingManager(
      // onLoad
      () => {
        onComplete?.();
      },
      // onProgress
      (url, loaded, total) => {
        const progress = (loaded / total) * 100;
        onProgress?.(progress);
      },
      // onError
      (url) => {
        const error = new Error(`Failed to load asset: ${url}`);
        onError?.(error);
      }
    );
    
    // Sort assets by priority and load
    const sortedAssets = [...assets].sort((a, b) => b.priority - a.priority);
    
    sortedAssets.forEach(asset => {
      switch (asset.type) {
        case 'texture':
          if (loadingManager.current) {
            new THREE.TextureLoader(loadingManager.current).load(asset.url);
          }
          break;
        case 'model':
          // Would use GLTFLoader or similar
          break;
        case 'audio':
          // Would use AudioLoader
          break;
      }
    });
  }, [assets, onProgress, onComplete, onError]);
  
  return null;
}

interface WebGLInfo {
  version?: string;
  vendor?: string;
  renderer?: string;
  maxTextureSize?: number;
  maxVertexAttribs?: number;
  webgl2?: boolean;
  error?: string;
}

// WebGL compatibility checker
export function WebGLChecker({ onResult }: { onResult: (supported: boolean, info: WebGLInfo) => void }) {
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        
        if (!gl) {
          onResult(false, { error: 'WebGL not supported' });
          return;
        }
        
        const info = {
          version: gl.getParameter(gl.VERSION),
          vendor: gl.getParameter(gl.VENDOR),
          renderer: gl.getParameter(gl.RENDERER),
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
          webgl2: !!canvas.getContext('webgl2')
        };
        
        onResult(true, info);
      } catch (error) {
        onResult(false, { error: (error as Error).message });
      }
    };
    
    checkWebGL();
  }, [onResult]);
  
  return null;
}