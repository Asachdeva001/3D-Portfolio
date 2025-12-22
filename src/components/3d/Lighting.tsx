import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { cityConfig } from '@/data/cityConfig';

export default function Lighting() {
  const neonLightRef = useRef<THREE.PointLight>(null);
  const ambientRef = useRef<THREE.AmbientLight>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate neon light intensity
    if (neonLightRef.current) {
      neonLightRef.current.intensity = cityConfig.lighting.neonIntensity + 
        Math.sin(time * 2) * 0.3;
    }
    
    // Subtle ambient light variation
    if (ambientRef.current) {
      ambientRef.current.intensity = cityConfig.lighting.ambientIntensity + 
        Math.sin(time * 0.5) * 0.05;
    }
  });

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight 
        ref={ambientRef}
        intensity={cityConfig.lighting.ambientIntensity} 
        color="#4a4a6a" 
      />
      
      {/* Main directional light (moonlight) */}
      <directionalLight
        position={[50, 100, 50]}
        intensity={0.3}
        color="#b3d9ff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      
      {/* Neon accent lights */}
      <pointLight
        ref={neonLightRef}
        position={[0, 10, 0]}
        intensity={cityConfig.lighting.neonIntensity}
        color="#00ffff"
        distance={50}
      />
      
      <pointLight
        position={[20, 8, -20]}
        intensity={1.5}
        color="#ff0080"
        distance={40}
      />
      
      <pointLight
        position={[-20, 12, -15]}
        intensity={1.8}
        color="#8000ff"
        distance={45}
      />
      
      <pointLight
        position={[15, 6, 25]}
        intensity={1.2}
        color="#ff8000"
        distance={35}
      />
      
      {/* Fog */}
      <fog 
        attach="fog" 
        args={[cityConfig.lighting.fogColor, cityConfig.lighting.fogNear, cityConfig.lighting.fogFar]} 
      />
    </>
  );
}