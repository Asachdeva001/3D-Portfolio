'use client';

import { Suspense } from 'react';
import Scene from '@/components/3d/Scene';
import LoadingScreen from '@/components/ui/LoadingScreen';
import HUD from '@/components/ui/HUD';
import { useSceneStore } from '@/store/sceneStore';

export default function Home() {
  const { showLoading, showHUD } = useSceneStore((state) => state.ui);

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Scene */}
      <Scene enablePhysics={true} enablePostProcessing={true}>
        <Suspense fallback={null}>
          {/* Scene content will be added in subsequent tasks */}
          <ambientLight intensity={0.1} />
          <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />
          
          {/* Temporary ground plane */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial color="#0a0a1a" />
          </mesh>
          
          {/* Temporary test cube */}
          <mesh position={[0, 1, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#ff0080" emissive="#ff0080" emissiveIntensity={0.2} />
          </mesh>
        </Suspense>
      </Scene>

      {/* UI Overlays */}
      {showLoading && <LoadingScreen />}
      {showHUD && <HUD />}
      
      {/* Instructions overlay for now */}
      <div className="absolute top-4 left-4 text-white text-sm bg-black/50 p-4 rounded-lg backdrop-blur-sm">
        <h3 className="font-bold mb-2">Cyberpunk 3D Portfolio</h3>
        <p>🚧 Under Construction</p>
        <p className="text-xs mt-2 text-gray-400">
          WASD controls and 3D city coming soon...
        </p>
      </div>
    </main>
  );
}