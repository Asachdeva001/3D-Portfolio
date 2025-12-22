import * as THREE from 'three';

// Neon material creation utility
export function createNeonMaterial(color: string = '#00ffff', intensity: number = 1.0): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.8,
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity * 0.5
  });
}

// Hologram material (alias for createHologramMaterial)
export const HologramMaterial = createHologramMaterial;

// Advanced neon shader material
export function createAdvancedNeonMaterial(options: {
  color?: string;
  intensity?: number;
  glowSize?: number;
  animated?: boolean;
} = {}): THREE.ShaderMaterial {
  const {
    color = '#00ffff',
    intensity = 1.0,
    glowSize = 1.0,
    animated = true
  } = options;

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 color;
    uniform float intensity;
    uniform float time;
    uniform float glowSize;
    uniform bool animated;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      // Base neon color
      vec3 neonColor = color;
      
      // Fresnel effect for edge glow
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
      fresnel = pow(fresnel, glowSize);
      
      // Pulsing animation
      float pulse = 1.0;
      if (animated) {
        pulse = 0.8 + 0.2 * sin(time * 3.0);
      }
      
      // Combine effects
      float alpha = fresnel * intensity * pulse;
      vec3 finalColor = neonColor * (1.0 + fresnel * 2.0);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      intensity: { value: intensity },
      time: { value: 0 },
      glowSize: { value: glowSize },
      animated: { value: animated }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });
}

// Hologram material
export function createHologramMaterial(options: {
  color?: string;
  opacity?: number;
  scanlineSpeed?: number;
  glitchIntensity?: number;
} = {}): THREE.ShaderMaterial {
  const {
    color = '#00ffff',
    opacity = 0.7,
    scanlineSpeed = 1.0,
    glitchIntensity = 0.1
  } = options;

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 color;
    uniform float opacity;
    uniform float time;
    uniform float scanlineSpeed;
    uniform float glitchIntensity;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    // Noise function
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    void main() {
      vec2 uv = vUv;
      
      // Scanlines
      float scanline = sin(uv.y * 100.0 + time * scanlineSpeed) * 0.1 + 0.9;
      
      // Glitch effect
      float glitch = random(vec2(floor(time * 10.0), floor(uv.y * 20.0))) * glitchIntensity;
      uv.x += glitch;
      
      // Fresnel for hologram edge effect
      vec3 viewDirection = normalize(cameraPosition - vPosition);
      float fresnel = 1.0 - abs(dot(viewDirection, vNormal));
      fresnel = pow(fresnel, 2.0);
      
      // Color modulation
      vec3 finalColor = color * scanline;
      float finalOpacity = opacity * (0.5 + fresnel * 0.5);
      
      gl_FragColor = vec4(finalColor, finalOpacity);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(color) },
      opacity: { value: opacity },
      time: { value: 0 },
      scanlineSpeed: { value: scanlineSpeed },
      glitchIntensity: { value: glitchIntensity }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    side: THREE.DoubleSide
  });
}

// Energy field material
export function createEnergyFieldMaterial(options: {
  color1?: string;
  color2?: string;
  speed?: number;
  density?: number;
} = {}): THREE.ShaderMaterial {
  const {
    color1 = '#ff0080',
    color2 = '#00ffff',
    speed = 1.0,
    density = 10.0
  } = options;

  const vertexShader = `
    varying vec2 vUv;
    varying vec3 vPosition;
    
    void main() {
      vUv = uv;
      vPosition = position;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform vec3 color1;
    uniform vec3 color2;
    uniform float time;
    uniform float speed;
    uniform float density;
    
    varying vec2 vUv;
    varying vec3 vPosition;
    
    // Noise functions
    float noise(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }
    
    float smoothNoise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      
      vec2 u = f * f * (3.0 - 2.0 * f);
      
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }
    
    void main() {
      vec2 st = vUv * density;
      
      // Animated noise
      float n1 = smoothNoise(st + time * speed);
      float n2 = smoothNoise(st * 2.0 - time * speed * 0.5);
      
      // Combine noise layers
      float pattern = n1 * 0.7 + n2 * 0.3;
      
      // Color mixing
      vec3 finalColor = mix(color1, color2, pattern);
      
      // Intensity based on pattern
      float intensity = pattern * 0.8 + 0.2;
      
      gl_FragColor = vec4(finalColor * intensity, intensity);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: new THREE.Color(color1) },
      color2: { value: new THREE.Color(color2) },
      time: { value: 0 },
      speed: { value: speed },
      density: { value: density }
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending
  });
}

// Utility to update shader time uniforms
export function updateShaderTime(material: THREE.ShaderMaterial, deltaTime: number): void {
  if (material.uniforms && material.uniforms.time) {
    material.uniforms.time.value += deltaTime;
  }
}

const NeonShader = {
  createNeonMaterial,
  createAdvancedNeonMaterial,
  createHologramMaterial,
  HologramMaterial,
  createEnergyFieldMaterial,
  updateShaderTime
};

export default NeonShader;