'use client';

import { motion } from 'framer-motion';
import { useSceneStore } from '@/store/sceneStore';

export default function HUD() {
  const { player, performance, toggleMenu } = useSceneStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        {/* Left side - Player info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 pointer-events-auto"
        >
          <div className="text-cyan-400 text-xs font-mono mb-1">NEURAL LINK</div>
          <div className="text-white text-sm">
            Position: {player.position.map(p => p.toFixed(1)).join(', ')}
          </div>
          <div className="text-gray-400 text-xs">
            Mode: {player.cameraMode.toUpperCase()}
          </div>
        </motion.div>

        {/* Right side - Performance info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-black/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 pointer-events-auto"
        >
          <div className="text-cyan-400 text-xs font-mono mb-1">SYSTEM STATUS</div>
          <div className="text-white text-sm">
            FPS: {performance.fps.toFixed(0)}
          </div>
          <div className="text-gray-400 text-xs">
            Quality: {performance.quality.toUpperCase()}
          </div>
        </motion.div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        {/* Left side - Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3"
        >
          <div className="text-cyan-400 text-xs font-mono mb-2">CONTROLS</div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            <div>WASD - Move</div>
            <div>Mouse - Look</div>
            <div>Space - Jump</div>
            <div>ESC - Menu</div>
          </div>
        </motion.div>

        {/* Right side - Menu button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={toggleMenu}
          className="bg-black/50 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-3 pointer-events-auto hover:border-cyan-400/60 transition-colors"
        >
          <div className="text-cyan-400 text-xs font-mono mb-1">MENU</div>
          <div className="text-white text-sm">⚙️</div>
        </motion.button>
      </div>

      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-4 h-4 border border-cyan-400/50 rounded-full">
          <div className="w-1 h-1 bg-cyan-400 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Cyberpunk-style corner decorations */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400/30" />
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400/30" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400/30" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400/30" />

      {/* Scanning lines effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 255, 255, 0.03) 2px,
            rgba(0, 255, 255, 0.03) 4px
          )`
        }}
        animate={{
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}