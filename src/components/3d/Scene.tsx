'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Physics } from '@react-three/rapier';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

interface SceneProps {
  children: React.ReactNode;
  enablePhysics?: boolean;
  enablePostProcessing?: boolean;
  performanceMode?: 'high' | 'medium' | 'low';
}

export default function Scene({ 
  children, 
  enablePhysics = true, 
  enablePostProcessing = true,
  performanceMode = 'high' 
}: SceneProps) {
  const getCanvasSettings = () => {
    switch (performanceMode) {
      case 'low':
        return {
          antialias: false,
          powerPreference: 'low-power' as const,
          stencil: false,
          depth: true
        };
      case 'medium':
        return {
          antialias: true,
          powerPreference: 'default' as const,
          stencil: false,
          depth: true
        };
      case 'high':
      default:
        return {
          antialias: true,
          powerPreference: 'high-performance' as const,
          stencil: true,
          depth: true
        };
    }
  };

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{
          position: [0, 5, 10],
          fov: 75,
          near: 0.1,
          far: 1000
        }}
        gl={getCanvasSettings()}
        shadows={performanceMode === 'high'}
      >
        <Suspense fallback={null}>
          {enablePhysics ? (
            <Physics gravity={[0, -9.81, 0]} debug={false}>
              {children}
            </Physics>
          ) : (
            children
          )}
          
          {enablePostProcessing && (
            <EffectComposer>
              <Bloom 
                intensity={1.5} 
                luminanceThreshold={0.9} 
                luminanceSmoothing={0.025}
                mipmapBlur
              />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}