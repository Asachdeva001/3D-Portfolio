import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Custom neon shader material
class NeonMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00ffff') },
        intensity: { value: 1.0 },
        pulseSpeed: { value: 2.0 },
        glowSize: { value: 1.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float intensity;
        uniform float pulseSpeed;
        uniform float glowSize;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          // Fresnel effect for edge glow
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          float fresnel = 1.0 - dot(vNormal, viewDirection);
          fresnel = pow(fresnel, 2.0);
          
          // Pulsing effect
          float pulse = sin(time * pulseSpeed) * 0.3 + 0.7;
          
          // Scanlines effect
          float scanlines = sin(vUv.y * 100.0) * 0.1 + 0.9;
          
          // Combine effects
          float glow = fresnel * pulse * scanlines * intensity;
          vec3 finalColor = color * glow * glowSize;
          
          gl_FragColor = vec4(finalColor, glow);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }
}

// Extend Three.js with our custom material
extend({ NeonMaterial });

// TypeScript declaration
declare module '@react-three/fiber' {
  interface ThreeElements {
    neonMaterial: object;
  }
}

interface NeonMaterialComponentProps {
  color?: string;
  intensity?: number;
  pulseSpeed?: number;
  glowSize?: number;
}

export function NeonMaterialComponent({ 
  color = '#00ffff', 
  intensity = 1.0,
  pulseSpeed = 2.0,
  glowSize = 1.0 
}: NeonMaterialComponentProps) {
  const materialRef = useRef<NeonMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const colorValue = useMemo(() => new THREE.Color(color), [color]);

  return (
    <neonMaterial
      ref={materialRef}
      color={colorValue}
      intensity={intensity}
      pulseSpeed={pulseSpeed}
      glowSize={glowSize}
    />
  );
}

export default NeonMaterial;