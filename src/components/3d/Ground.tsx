'use client';

import { RigidBody } from '@react-three/rapier';
import { ReflectiveGround } from './ReflectionSystem';
import { cityConfig } from '@/data/cityConfig';
import * as THREE from 'three';

interface GroundProps {
  size?: number;
  reflectionIntensity?: number;
}

export default function Ground({ size = 200, reflectionIntensity = 0.4 }: GroundProps) {
  return (
    <>
      {/* Physics collision for ground */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, -0.1, 0]}>
        <mesh visible={false}>
          <boxGeometry args={[size, 0.2, size]} />
        </mesh>
      </RigidBody>
      
      {/* Reflective ground surface */}
      <ReflectiveGround
        size={size}
        reflectionIntensity={reflectionIntensity}
        roughness={0.1}
        metalness={0.8}
        color="#2a2a4a"
      />
      
      {/* Cyberpunk grid overlay */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial
          transparent
          opacity={0.1}
          color={cityConfig.lighting.fogColor}
          map={(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d')!;
            
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            
            // Draw grid
            const gridSize = 32;
            for (let i = 0; i <= 256; i += gridSize) {
              ctx.beginPath();
              ctx.moveTo(i, 0);
              ctx.lineTo(i, 256);
              ctx.stroke();
              
              ctx.beginPath();
              ctx.moveTo(0, i);
              ctx.lineTo(256, i);
              ctx.stroke();
            }
            
            const gridTexture = new THREE.CanvasTexture(canvas);
            gridTexture.wrapS = gridTexture.wrapT = THREE.RepeatWrapping;
            gridTexture.repeat.set(10, 10);
            return gridTexture;
          })()}
        />
      </mesh>
    </>
  );
}