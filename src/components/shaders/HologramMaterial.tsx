import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Custom hologram shader material
class HologramMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('#00ffff') },
        opacity: { value: 0.6 },
        scanlineSpeed: { value: 2.0 },
        scanlineWidth: { value: 0.1 },
        fresnelPower: { value: 2.0 },
        glitchIntensity: { value: 0.1 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float opacity;
        uniform float scanlineSpeed;
        uniform float scanlineWidth;
        uniform float fresnelPower;
        uniform float glitchIntensity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec3 vWorldPosition;
        
        // Noise function
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }
        
        void main() {
          // Fresnel effect
          vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
          float fresnel = 1.0 - dot(vNormal, viewDirection);
          fresnel = pow(fresnel, fresnelPower);
          
          // Scanlines
          float scanline = sin((vUv.y + time * scanlineSpeed) * 50.0) * scanlineWidth + (1.0 - scanlineWidth);
          
          // Glitch effect
          float glitch = random(vec2(vUv.x, floor(time * 10.0))) * glitchIntensity;
          vec2 glitchedUv = vUv + vec2(glitch, 0.0);
          
          // Grid pattern
          vec2 grid = abs(fract(glitchedUv * 10.0) - 0.5) / fwidth(glitchedUv * 10.0);
          float gridLine = 1.0 - min(grid.x, grid.y);
          
          // Combine effects
          float alpha = (fresnel + scanline * 0.3 + gridLine * 0.2) * opacity;
          vec3 finalColor = color * (1.0 + fresnel * 0.5);
          
          // Add some color variation
          finalColor += sin(time + vUv.x * 10.0) * 0.1;
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
  }
}

extend({ HologramMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    hologramMaterial: object;
  }
}

interface HologramMaterialComponentProps {
  color?: string;
  opacity?: number;
  scanlineSpeed?: number;
  fresnelPower?: number;
  glitchIntensity?: number;
}

export function HologramMaterialComponent({ 
  color = '#00ffff',
  opacity = 0.6,
  scanlineSpeed = 2.0,
  fresnelPower = 2.0,
  glitchIntensity = 0.1
}: HologramMaterialComponentProps) {
  const materialRef = useRef<HologramMaterial>(null);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  const colorValue = useMemo(() => new THREE.Color(color), [color]);

  return (
    <hologramMaterial
      ref={materialRef}
      color={colorValue}
      opacity={opacity}
      scanlineSpeed={scanlineSpeed}
      fresnelPower={fresnelPower}
      glitchIntensity={glitchIntensity}
    />
  );
}

export default HologramMaterial;