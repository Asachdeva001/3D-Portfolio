'use client';

import { useState, useEffect } from 'react';
import { useSceneStore } from '@/store/sceneStore';
import { qualitySettings, deviceCapabilities } from '@/utils/performanceUtils';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsMenu({ isOpen, onClose }: SettingsMenuProps) {
  const { performance, setPerformance } = useSceneStore();
  const [localSettings, setLocalSettings] = useState({
    quality: performance.quality,
    mouseSensitivity: 0.002,
    enablePostProcessing: true,
    enableReflections: true,
    enableParticles: true,
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.6
  });
  
  useEffect(() => {
    if (isOpen) {
      // Load settings from localStorage
      const savedSettings = localStorage.getItem('cyberpunk-portfolio-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Use timeout to avoid setState in effect
        const timer = setTimeout(() => {
          setLocalSettings(prev => ({ ...prev, ...parsed }));
        }, 0);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen]);
  
  const handleSave = () => {
    // Apply settings
    setPerformance({
      ...performance,
      quality: localSettings.quality
    });
    
    // Save to localStorage
    localStorage.setItem('cyberpunk-portfolio-settings', JSON.stringify(localSettings));
    
    onClose();
  };
  
  const handleReset = () => {
    const defaultSettings = {
      quality: deviceCapabilities.getPerformanceTier(),
      mouseSensitivity: 0.002,
      enablePostProcessing: true,
      enableReflections: true,
      enableParticles: true,
      masterVolume: 0.7,
      sfxVolume: 0.8,
      musicVolume: 0.6
    };
    
    setLocalSettings(defaultSettings);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900/95 border-2 border-cyan-400 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-mono font-bold text-cyan-400 tracking-wider">
            SYSTEM SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="text-red-400 hover:text-red-300 text-xl font-bold"
          >
            ✕
          </button>
        </div>
        
        {/* Graphics Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-mono text-purple-400 mb-3 border-b border-purple-400/30 pb-1">
            GRAPHICS
          </h3>
          
          <div className="space-y-4">
            {/* Quality Preset */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-2">
                Quality Preset
              </label>
              <select
                value={localSettings.quality}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  quality: e.target.value as 'low' | 'medium' | 'high' 
                }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-cyan-400 font-mono focus:border-cyan-400 focus:outline-none"
              >
                <option value="low">LOW - Better Performance</option>
                <option value="medium">MEDIUM - Balanced</option>
                <option value="high">HIGH - Best Quality</option>
              </select>
              <div className="text-xs text-gray-400 mt-1 font-mono">
                Current: {qualitySettings[localSettings.quality].shadowMapSize}px shadows, 
                {qualitySettings[localSettings.quality].antialias ? ' AA enabled' : ' AA disabled'}
              </div>
            </div>
            
            {/* Post Processing */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono text-gray-300">
                Post Processing Effects
              </label>
              <input
                type="checkbox"
                checked={localSettings.enablePostProcessing}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  enablePostProcessing: e.target.checked 
                }))}
                className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
              />
            </div>
            
            {/* Reflections */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono text-gray-300">
                Real-time Reflections
              </label>
              <input
                type="checkbox"
                checked={localSettings.enableReflections}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  enableReflections: e.target.checked 
                }))}
                className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
              />
            </div>
            
            {/* Particles */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-mono text-gray-300">
                Particle Effects
              </label>
              <input
                type="checkbox"
                checked={localSettings.enableParticles}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  enableParticles: e.target.checked 
                }))}
                className="w-4 h-4 text-cyan-400 bg-gray-800 border-gray-600 rounded focus:ring-cyan-400"
              />
            </div>
          </div>
        </div>
        
        {/* Controls Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-mono text-orange-400 mb-3 border-b border-orange-400/30 pb-1">
            CONTROLS
          </h3>
          
          <div className="space-y-4">
            {/* Mouse Sensitivity */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-2">
                Mouse Sensitivity: {(localSettings.mouseSensitivity * 1000).toFixed(1)}
              </label>
              <input
                type="range"
                min="0.001"
                max="0.01"
                step="0.0005"
                value={localSettings.mouseSensitivity}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  mouseSensitivity: parseFloat(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
        
        {/* Audio Settings */}
        <div className="mb-6">
          <h3 className="text-lg font-mono text-green-400 mb-3 border-b border-green-400/30 pb-1">
            AUDIO
          </h3>
          
          <div className="space-y-4">
            {/* Master Volume */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-2">
                Master Volume: {Math.round(localSettings.masterVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localSettings.masterVolume}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  masterVolume: parseFloat(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* SFX Volume */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-2">
                Sound Effects: {Math.round(localSettings.sfxVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localSettings.sfxVolume}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  sfxVolume: parseFloat(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
            
            {/* Music Volume */}
            <div>
              <label className="block text-sm font-mono text-gray-300 mb-2">
                Music: {Math.round(localSettings.musicVolume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localSettings.musicVolume}
                onChange={(e) => setLocalSettings(prev => ({ 
                  ...prev, 
                  musicVolume: parseFloat(e.target.value) 
                }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>
        
        {/* System Info */}
        <div className="mb-6">
          <h3 className="text-lg font-mono text-yellow-400 mb-3 border-b border-yellow-400/30 pb-1">
            SYSTEM INFO
          </h3>
          
          <div className="text-sm font-mono text-gray-400 space-y-1">
            <div>Device: {deviceCapabilities.getDeviceType().toUpperCase()}</div>
            <div>WebGL: {deviceCapabilities.getWebGLSupport().webgl2 ? 'WebGL 2.0' : 'WebGL 1.0'}</div>
            <div>Performance Tier: {deviceCapabilities.getPerformanceTier().toUpperCase()}</div>
            <div>Reduced Motion: {deviceCapabilities.prefersReducedMotion() ? 'YES' : 'NO'}</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between space-x-4">
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-red-600/20 border border-red-400 text-red-400 font-mono rounded hover:bg-red-600/30 transition-colors"
          >
            RESET TO DEFAULTS
          </button>
          
          <div className="space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600/20 border border-gray-400 text-gray-400 font-mono rounded hover:bg-gray-600/30 transition-colors"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-cyan-600/20 border border-cyan-400 text-cyan-400 font-mono rounded hover:bg-cyan-600/30 transition-colors"
            >
              APPLY SETTINGS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}