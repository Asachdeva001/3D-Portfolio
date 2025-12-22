'use client';

import { useState, useEffect } from 'react';
import { useSceneStore } from '@/store/sceneStore';

interface HUDProps {
  showDebugInfo?: boolean;
  showControls?: boolean;
}

export default function HUD({ showDebugInfo = false, showControls = true }: HUDProps) {
  const { performance, controls } = useSceneStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top HUD Bar */}
      <div className="absolute top-0 left-0 right-0 p-4">
        <div className="flex justify-between items-start">
          <div className="pointer-events-auto">
            <div className="bg-black/70 border border-cyan-400 rounded-lg p-3 backdrop-blur-sm">
              <h1 className="text-cyan-400 font-mono text-lg font-bold tracking-wider">
                CYBERPUNK PORTFOLIO
              </h1>
              <div className="text-cyan-300 text-xs opacity-70">
                {currentTime.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {showDebugInfo && (
            <div className="bg-black/70 border border-green-400 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-green-400 font-mono text-sm space-y-1">
                <div>FPS: {performance.fps}</div>
                <div>Quality: {performance.quality.toUpperCase()}</div>
                <div>
                  Mode: {controls.cameraMode?.toUpperCase() || 'FIRST-PERSON'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex justify-between items-end">
          {showControls && !controls.isPointerLocked && (
            <div className="bg-black/70 border border-purple-400 rounded-lg p-4 backdrop-blur-sm">
              <div className="text-purple-400 font-mono text-sm space-y-2">
                <div className="text-purple-300 font-bold mb-2">CONTROLS</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div>WASD</div><div>Move</div>
                  <div>Mouse</div><div>Look</div>
                  <div>Shift</div><div>Run</div>
                  <div>Space</div><div>Jump</div>
                  <div>C</div><div>Toggle Camera</div>
                  <div>Click</div><div>Enter/Exit</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-black/70 border border-orange-400 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-orange-400 font-mono text-sm">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    controls.isPointerLocked ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <span>{controls.isPointerLocked ? 'ACTIVE' : 'INACTIVE'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {controls.isPointerLocked && controls.cameraMode === 'first-person' && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
        </div>
      )}
    </div>
  );
}
