'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSceneStore } from '@/store/sceneStore';

export default function LoadingScreen() {
  const { ui, setLoadingProgress, setShowLoading } = useSceneStore();
  const { loadingProgress } = ui;
  const [loadingText, setLoadingText] = useState('Initializing Cyberpunk City...');

  useEffect(() => {
    // Simulate loading progress
    const loadingSteps = [
      { progress: 20, text: 'Loading 3D Assets...' },
      { progress: 40, text: 'Generating Neon Buildings...' },
      { progress: 60, text: 'Initializing Hologram Systems...' },
      { progress: 80, text: 'Spawning Hover Cars...' },
      { progress: 95, text: 'Calibrating Neural Interface...' },
      { progress: 100, text: 'Welcome to the Future...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < loadingSteps.length) {
        const step = loadingSteps[currentStep];
        setLoadingProgress(step.progress);
        setLoadingText(step.text);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowLoading(false);
        }, 1000);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [setLoadingProgress, setShowLoading]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      >
        {/* Cyberpunk background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        </div>

        <div className="relative z-10 text-center">
          {/* Main logo/title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              CYBERPUNK
            </h1>
            <h2 className="text-2xl font-light text-cyan-300 tracking-widest">
              PORTFOLIO 2077
            </h2>
          </motion.div>

          {/* Loading bar */}
          <div className="w-80 mx-auto mb-6">
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
              
              {/* Glowing effect */}
              <motion.div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-50 blur-sm"
                initial={{ width: 0 }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            
            {/* Progress percentage */}
            <div className="flex justify-between mt-2 text-sm">
              <span className="text-gray-400">Loading...</span>
              <span className="text-cyan-400 font-mono">{loadingProgress}%</span>
            </div>
          </div>

          {/* Loading text */}
          <motion.p
            key={loadingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-lg text-gray-300 font-mono"
          >
            {loadingText}
          </motion.p>

          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Cyberpunk-style border */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}