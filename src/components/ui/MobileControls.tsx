'use client';

import { useState, useEffect, useRef } from 'react';
import { deviceCapabilities } from '../../utils/performanceUtils';

interface MobileControlsProps {
  onMove: (direction: { x: number; y: number }) => void;
  onLook: (delta: { x: number; y: number }) => void;
  onJump: () => void;
  onRun: (isRunning: boolean) => void;
}

export default function MobileControls({ 
  onMove, 
  onLook, 
  onJump, 
  onRun 
}: MobileControlsProps) {
  const [isMobile] = useState(() => deviceCapabilities.getDeviceType() !== 'desktop');
  const [isRunning, setIsRunning] = useState(false);
  const [joystickActive, setJoystickActive] = useState(false);
  const [lookpadActive, setLookpadActive] = useState(false);
  
  const joystickRef = useRef<HTMLDivElement>(null);
  const lookpadRef = useRef<HTMLDivElement>(null);
  const joystickCenter = useRef({ x: 0, y: 0 });
  const lookpadCenter = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    if (!isMobile) return;
    
    // Calculate joystick and lookpad centers
    if (joystickRef.current) {
      const rect = joystickRef.current.getBoundingClientRect();
      joystickCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
    
    if (lookpadRef.current) {
      const rect = lookpadRef.current.getBoundingClientRect();
      lookpadCenter.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }
  }, [isMobile]);
  
  const handleJoystickStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setJoystickActive(true);
    
    const rect = joystickRef.current!.getBoundingClientRect();
    joystickCenter.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };
  
  const handleJoystickMove = (e: React.TouchEvent) => {
    if (!joystickActive) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - joystickCenter.current.x;
    const deltaY = touch.clientY - joystickCenter.current.y;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50; // Maximum joystick radius
    
    let normalizedX = deltaX / maxDistance;
    let normalizedY = deltaY / maxDistance;
    
    // Clamp to circle
    if (distance > maxDistance) {
      normalizedX = (deltaX / distance) * (maxDistance / maxDistance);
      normalizedY = (deltaY / distance) * (maxDistance / maxDistance);
    }
    
    onMove({ x: normalizedX, y: -normalizedY }); // Invert Y for forward/backward
  };
  
  const handleJoystickEnd = () => {
    setJoystickActive(false);
    onMove({ x: 0, y: 0 });
  };
  
  const handleLookpadStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setLookpadActive(true);
    
    const touch = e.touches[0];
    lookpadCenter.current = {
      x: touch.clientX,
      y: touch.clientY
    };
  };
  
  const handleLookpadMove = (e: React.TouchEvent) => {
    if (!lookpadActive) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - lookpadCenter.current.x;
    const deltaY = touch.clientY - lookpadCenter.current.y;
    
    // Update center for continuous movement
    lookpadCenter.current = {
      x: touch.clientX,
      y: touch.clientY
    };
    
    // Apply sensitivity
    const sensitivity = 0.003;
    onLook({ x: deltaX * sensitivity, y: deltaY * sensitivity });
  };
  
  const handleLookpadEnd = () => {
    setLookpadActive(false);
  };
  
  const handleRunToggle = () => {
    const newRunning = !isRunning;
    setIsRunning(newRunning);
    onRun(newRunning);
  };
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Movement Joystick - Bottom Left */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <div
          ref={joystickRef}
          className={`w-24 h-24 rounded-full border-2 border-cyan-400/50 bg-black/30 backdrop-blur-sm flex items-center justify-center ${
            joystickActive ? 'border-cyan-400 bg-cyan-400/10' : ''
          }`}
          onTouchStart={handleJoystickStart}
          onTouchMove={handleJoystickMove}
          onTouchEnd={handleJoystickEnd}
        >
          <div className="w-8 h-8 rounded-full bg-cyan-400/70 shadow-lg shadow-cyan-400/50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-cyan-400 text-xs font-mono font-bold">MOVE</div>
          </div>
        </div>
      </div>
      
      {/* Look Pad - Bottom Right */}
      <div className="absolute bottom-8 right-8 pointer-events-auto">
        <div
          ref={lookpadRef}
          className={`w-32 h-24 rounded-lg border-2 border-purple-400/50 bg-black/30 backdrop-blur-sm flex items-center justify-center ${
            lookpadActive ? 'border-purple-400 bg-purple-400/10' : ''
          }`}
          onTouchStart={handleLookpadStart}
          onTouchMove={handleLookpadMove}
          onTouchEnd={handleLookpadEnd}
        >
          <div className="text-purple-400 text-xs font-mono font-bold">LOOK</div>
        </div>
      </div>
      
      {/* Action Buttons - Right Side */}
      <div className="absolute right-8 bottom-40 space-y-4 pointer-events-auto">
        {/* Jump Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJump();
          }}
          className="w-16 h-16 rounded-full border-2 border-green-400 bg-black/30 backdrop-blur-sm flex items-center justify-center active:bg-green-400/20 active:border-green-300"
        >
          <div className="text-green-400 text-xs font-mono font-bold">JUMP</div>
        </button>
        
        {/* Run Toggle */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleRunToggle();
          }}
          className={`w-16 h-16 rounded-full border-2 bg-black/30 backdrop-blur-sm flex items-center justify-center ${
            isRunning 
              ? 'border-orange-300 bg-orange-400/20 text-orange-300' 
              : 'border-orange-400 text-orange-400'
          }`}
        >
          <div className="text-xs font-mono font-bold">RUN</div>
        </button>
      </div>
      
      {/* Settings Button - Top Right */}
      <div className="absolute top-8 right-8 pointer-events-auto">
        <button
          className="w-12 h-12 rounded-lg border-2 border-gray-400 bg-black/30 backdrop-blur-sm flex items-center justify-center active:bg-gray-400/20"
          onTouchStart={(e) => {
            e.preventDefault();
            // This would open settings menu
          }}
        >
          <div className="text-gray-400 text-lg">⚙</div>
        </button>
      </div>
      
      {/* Instructions Overlay */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="bg-black/70 border border-cyan-400 rounded-lg p-4 backdrop-blur-sm max-w-sm">
          <div className="text-cyan-400 font-mono text-sm text-center space-y-2">
            <div className="font-bold">MOBILE CONTROLS</div>
            <div className="text-xs space-y-1">
              <div>• Left joystick: Move around</div>
              <div>• Right pad: Look around</div>
              <div>• Green button: Jump</div>
              <div>• Orange button: Toggle run</div>
              <div>• Tap billboards to interact</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for mobile detection
export function useMobileControls() {
  const [isMobile] = useState(() => deviceCapabilities.getDeviceType() !== 'desktop');
  
  return { isMobile };
}