'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, ToneMapping, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing';
import { ToneMappingMode, BlendFunction } from 'postprocessing';
import { useSceneStore } from '@/store/sceneStore';
import * as THREE from 'three';

// Custom shader for cyberpunk scan lines
const ScanLinesShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    intensity: { value: 0.5 },
    frequency: { value: 800 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    uniform float frequency;
    varying vec2 vUv;
    
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      
      // Create scan lines
      float scanLine = sin(vUv.y * frequency + time * 10.0) * 0.5 + 0.5;
      scanLine = pow(scanLine, 3.0) * intensity;
      
      // Add some noise
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      scanLine += noise * 0.1;
      
      color.rgb *= (1.0 - scanLine);
      
      gl_FragColor = color;
    }
  `
};

// Custom data corruption effect
const DataCorruptionShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    intensity: { value: 0.1 },
    blockSize: { value: 8.0 }
  },
  
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float intensity;
    uniform float blockSize;
    varying vec2 vUv;
    
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Create blocks
      vec2 blockUv = floor(uv * blockSize) / blockSize;
      float noise = random(blockUv + time);
      
      // Corrupt some blocks
      if (noise > 1.0 - intensity) {
        // Shift UV coordinates
        uv.x += (random(blockUv) - 0.5) * 0.1;
        uv.y += (random(blockUv + 1.0) - 0.5) * 0.1;
        
        // Color corruption
        vec4 color = texture2D(tDiffuse, uv);
        color.r = texture2D(tDiffuse, uv + vec2(0.01, 0.0)).r;
        color.b = texture2D(tDiffuse, uv - vec2(0.01, 0.0)).b;
        
        gl_FragColor = color;
      } else {
        gl_FragColor = texture2D(tDiffuse, uv);
      }
    }
  `
};

interface EffectsProps {
  enablePostProcessing?: boolean;
}

export default function Effects({ enablePostProcessing = true }: EffectsProps) {
  const { performance } = useSceneStore();
  const scanLinesRef = useRef<any>(null);
  const dataCorruptionRef = useRef<any>(null);
  const glitchRef = useRef<any>(null);
  
  // Create custom shader materials
  const scanLinesMaterial = useMemo(() => {
    return new THREE.ShaderMaterial(ScanLinesShader);
  }, []);
  
  const dataCorruptionMaterial = useMemo(() => {
    return new THREE.ShaderMaterial(DataCorruptionShader);
  }, []);
  
  // Animate effects
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (scanLinesRef.current) {
      scanLinesMaterial.uniforms.time.value = time;
    }
    
    if (dataCorruptionRef.current) {
      dataCorruptionMaterial.uniforms.time.value = time;
      // Occasional data corruption bursts
      if (Math.random() < 0.001) {
        dataCorruptionMaterial.uniforms.intensity.value = 0.3;
      } else {
        dataCorruptionMaterial.uniforms.intensity.value = Math.max(
          0.05,
          dataCorruptionMaterial.uniforms.intensity.value * 0.95
        );
      }
    }
    
    // Occasional glitch effect
    if (glitchRef.current && Math.random() < 0.0005) {
      glitchRef.current.mode = 1; // Enable glitch
      setTimeout(() => {
        if (glitchRef.current) {
          glitchRef.current.mode = 0; // Disable glitch
        }
      }, 100);
    }
  });
  
  // Don't render post-processing on low-end devices or if disabled
  if (!enablePostProcessing || performance.quality === 'low') {
    return null;
  }

  const effects = [
    <Bloom
      key="bloom"
      intensity={performance.quality === 'high' ? 2.0 : 1.5}
      luminanceThreshold={0.8}
      luminanceSmoothing={0.025}
      mipmapBlur={performance.quality === 'high'}
      radius={performance.quality === 'high' ? 0.8 : 0.6}
    />,
    <ToneMapping
      key="tone"
      mode={ToneMappingMode.ACES_FILMIC}
      resolution={performance.quality === 'high' ? 256 : 128}
      whitePoint={4.0}
      middleGrey={0.6}
      minLuminance={0.01}
      adaptation={1.0}
    />,
    <ChromaticAberration
      key="chromatic"
      blendFunction={BlendFunction.NORMAL}
      offset={new THREE.Vector2(0.002, 0.002)}
    />,
    <Vignette
      key="vignette"
      offset={0.3}
      darkness={0.5}
      eskil={false}
      blendFunction={BlendFunction.MULTIPLY}
    />
  ];

  if (performance.quality === 'high' || performance.quality === 'medium') {
    effects.push(
      <Glitch
        key="glitch"
        ref={glitchRef}
        delay={new THREE.Vector2(1.5, 3.5)}
        duration={new THREE.Vector2(0.1, 0.3)}
        strength={new THREE.Vector2(0.2, 0.4)}
        mode={0}
        active={false}
        ratio={0.85}
      />
    );
  }
  
  return (
    <EffectComposer>
      {effects}
    </EffectComposer>
  );
}

// Atmospheric effects component
export function AtmosphericEffects() {
  const { performance } = useSceneStore();
  
  if (performance.quality === 'low') return null;
  
  return (
    <>
      {/* Volumetric fog */}
      <fog attach="fog" args={['#0a0a1a', 20, 200]} />
      
      {/* Atmospheric particles */}
      {Array.from({ length: performance.quality === 'high' ? 50 : 25 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 200,
            Math.random() * 50 + 10,
            (Math.random() - 0.5) * 200
          ]}
        >
          <sphereGeometry args={[0.1, 4, 4]} />
          <meshBasicMaterial
            color={Math.random() > 0.5 ? '#00ffff' : '#ff0080'}
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Light shafts */}
      {performance.quality === 'high' && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={`shaft-${i}`}
              position={[
                (Math.random() - 0.5) * 100,
                25,
                (Math.random() - 0.5) * 100
              ]}
              rotation={[Math.PI / 2, 0, Math.random() * Math.PI]}
            >
              <coneGeometry args={[0.5, 50, 8, 1, true]} />
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={0.1}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </>
      )}
    </>
  );
}

// Screen distortion effects
export function ScreenDistortion() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      // Subtle screen shake
      meshRef.current.position.x = Math.sin(time * 0.5) * 0.01;
      meshRef.current.position.y = Math.cos(time * 0.7) * 0.01;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, -0.1]}>
      <planeGeometry args={[2, 2]} />
      <meshBasicMaterial
        transparent
        opacity={0.02}
        color="#00ffff"
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// Dynamic lighting effects
export function DynamicLighting() {
  const lightRef = useRef<THREE.PointLight>(null);
  const { performance } = useSceneStore();
  
  useFrame((state) => {
    if (lightRef.current) {
      const time = state.clock.elapsedTime;
      
      // Pulsing intensity
      lightRef.current.intensity = 0.5 + Math.sin(time * 2) * 0.3;
      
      // Color cycling
      const hue = (time * 0.1) % 1;
      lightRef.current.color.setHSL(hue, 1, 0.5);
      
      // Floating movement
      lightRef.current.position.y = 15 + Math.sin(time * 0.5) * 5;
      lightRef.current.position.x = Math.cos(time * 0.3) * 10;
    }
  });
  
  if (performance.quality === 'low') return null;
  
  return (
    <pointLight
      ref={lightRef}
      position={[0, 15, 0]}
      intensity={0.5}
      distance={30}
      decay={2}
      color="#00ffff"
    />
  );
}

// Holographic interference patterns
export function HolographicInterference() {
  const { performance } = useSceneStore();
  
  if (performance.quality === 'low') return null;
  
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0, -50 + i * 50]}
          rotation={[0, 0, Math.PI / 4]}
        >
          <planeGeometry args={[200, 200]} />
          <meshBasicMaterial
            transparent
            opacity={0.05}
            color="#ff0080"
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </>
  );
}