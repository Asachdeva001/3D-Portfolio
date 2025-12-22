'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { random } from '@/utils/mathUtils';
import { useSceneStore } from '@/store/sceneStore';

interface ParticleSystemProps {
  count?: number;
  position?: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  spread?: number;
  lifetime?: number;
  type?: 'sparks' | 'energy' | 'data' | 'glow';
}

export default function ParticleSystem({
  count = 100,
  position = [0, 0, 0],
  color = '#00ffff',
  size = 0.1,
  speed = 1,
  spread = 5,
  lifetime = 3,
  type = 'glow'
}: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { performance } = useSceneStore();
  
  // Adjust particle count based on performance
  const adjustedCount = useMemo(() => {
    const multiplier = performance.quality === 'low' ? 0.3 : performance.quality === 'medium' ? 0.6 : 1.0;
    return Math.floor(count * multiplier);
  }, [count, performance.quality]);
  
  // Create particle geometry and initial data
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const velocitiesRef = useRef<Float32Array | null>(null);
  const lifetimesRef = useRef<Float32Array | null>(null);
  const initialLifetimesRef = useRef<Float32Array | null>(null);
  
  // Initialize geometry and arrays in useEffect to avoid mutations in useMemo
  useEffect(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(adjustedCount * 3);
    const colors = new Float32Array(adjustedCount * 3);
    const sizes = new Float32Array(adjustedCount);
    const velocities = new Float32Array(adjustedCount * 3);
    const lifetimes = new Float32Array(adjustedCount);
    const initialLifetimes = new Float32Array(adjustedCount);
    
    const baseColor = new THREE.Color(color);
    
    for (let i = 0; i < adjustedCount; i++) {
      const i3 = i * 3;
      
      // Initial positions
      positions[i3] = position[0] + random.range(-spread, spread);
      positions[i3 + 1] = position[1] + random.range(-spread, spread);
      positions[i3 + 2] = position[2] + random.range(-spread, spread);
      
      // Colors with variation
      const colorVariation = random.range(0.8, 1.2);
      colors[i3] = baseColor.r * colorVariation;
      colors[i3 + 1] = baseColor.g * colorVariation;
      colors[i3 + 2] = baseColor.b * colorVariation;
      
      // Sizes with variation
      sizes[i] = size * random.range(0.5, 1.5);
      
      // Velocities based on particle type
      switch (type) {
        case 'sparks':
          velocities[i3] = random.range(-speed, speed);
          velocities[i3 + 1] = random.range(0, speed * 2);
          velocities[i3 + 2] = random.range(-speed, speed);
          break;
          
        case 'energy':
          const angle = random.range(0, Math.PI * 2);
          velocities[i3] = Math.cos(angle) * speed;
          velocities[i3 + 1] = random.range(-speed * 0.5, speed * 0.5);
          velocities[i3 + 2] = Math.sin(angle) * speed;
          break;
          
        case 'data':
          velocities[i3] = random.range(-speed * 0.5, speed * 0.5);
          velocities[i3 + 1] = speed;
          velocities[i3 + 2] = random.range(-speed * 0.5, speed * 0.5);
          break;
          
        case 'glow':
        default:
          velocities[i3] = random.range(-speed * 0.3, speed * 0.3);
          velocities[i3 + 1] = random.range(-speed * 0.3, speed * 0.3);
          velocities[i3 + 2] = random.range(-speed * 0.3, speed * 0.3);
          break;
      }
      
      // Lifetimes
      const particleLifetime = lifetime * random.range(0.5, 1.5);
      lifetimes[i] = particleLifetime;
      initialLifetimes[i] = particleLifetime;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Store in refs for mutation in useFrame
    geometryRef.current = geometry;
    velocitiesRef.current = velocities;
    lifetimesRef.current = lifetimes;
    initialLifetimesRef.current = initialLifetimes;
  }, [adjustedCount, position, color, size, speed, spread, lifetime, type]);
  
  // Create particle material based on type
  const material = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    
    switch (type) {
      case 'sparks':
        // Sharp spark texture
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(30, 0, 4, 64);
        ctx.fillRect(0, 30, 64, 4);
        break;
        
      case 'energy':
        // Electric energy texture
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);
        
        // Add electric lines
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          ctx.beginPath();
          ctx.moveTo(32, 32);
          const angle = (i / 8) * Math.PI * 2;
          ctx.lineTo(32 + Math.cos(angle) * 30, 32 + Math.sin(angle) * 30);
          ctx.stroke();
        }
        break;
        
      case 'data':
        // Digital square texture
        ctx.fillStyle = color;
        ctx.fillRect(16, 16, 32, 32);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(16, 16, 32, 32);
        break;
        
      case 'glow':
      default:
        // Soft glow texture
        const glowGradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        glowGradient.addColorStop(0, color);
        glowGradient.addColorStop(0.5, color + '80');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, 64, 64);
        break;
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    return new THREE.PointsMaterial({
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
  }, [type, color]);
  
  // Animate particles
  useFrame((state, delta) => {
    if (!pointsRef.current || !geometryRef.current || !velocitiesRef.current || !lifetimesRef.current || !initialLifetimesRef.current) return;
    
    const geometry = geometryRef.current;
    const velocities = velocitiesRef.current;
    const lifetimes = lifetimesRef.current;
    const initialLifetimes = initialLifetimesRef.current;
    
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const sizes = geometry.attributes.size.array as Float32Array;
    
    for (let i = 0; i < adjustedCount; i++) {
      const i3 = i * 3;
      
      // Update lifetime
      lifetimes[i] -= delta;
      
      if (lifetimes[i] <= 0) {
        // Reset particle
        positions[i3] = position[0] + random.range(-spread, spread);
        positions[i3 + 1] = position[1] + random.range(-spread, spread);
        positions[i3 + 2] = position[2] + random.range(-spread, spread);
        lifetimes[i] = initialLifetimes[i];
      } else {
        // Update position
        positions[i3] += velocities[i3] * delta;
        positions[i3 + 1] += velocities[i3 + 1] * delta;
        positions[i3 + 2] += velocities[i3 + 2] * delta;
        
        // Update alpha based on lifetime
        const alpha = lifetimes[i] / initialLifetimes[i];
        const baseColor = new THREE.Color(color);
        colors[i3] = baseColor.r * alpha;
        colors[i3 + 1] = baseColor.g * alpha;
        colors[i3 + 2] = baseColor.b * alpha;
        
        // Update size based on lifetime for some types
        if (type === 'sparks' || type === 'energy') {
          sizes[i] = size * alpha * random.range(0.5, 1.5);
        }
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    geometry.attributes.size.needsUpdate = true;
  });
  
  if (performance.quality === 'low' && type !== 'sparks') {
    return null; // Skip non-essential particles on low quality
  }
  
  return (
    <points ref={pointsRef}>
      {geometryRef.current && <primitive object={geometryRef.current} />}
      <primitive object={material} />
    </points>
  );
}

// Interaction particle burst effect
interface ParticleBurstProps {
  position: [number, number, number];
  trigger: boolean;
  onComplete?: () => void;
}

export function ParticleBurst({ position, trigger, onComplete }: ParticleBurstProps) {
  const [isActive, setIsActive] = useState(false);
  const timeRef = useRef(0);
  
  useEffect(() => {
    if (trigger && !isActive) {
      // Use timeout to avoid setState in effect
      const activateTimer = setTimeout(() => setIsActive(true), 0);
      timeRef.current = 0;
      
      const deactivateTimer = setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 1000);
      
      return () => {
        clearTimeout(activateTimer);
        clearTimeout(deactivateTimer);
      };
    }
  }, [trigger, isActive, onComplete]);
  
  if (!isActive) return null;
  
  return (
    <ParticleSystem
      count={50}
      position={position}
      color="#ff0080"
      size={0.2}
      speed={3}
      spread={2}
      lifetime={1}
      type="sparks"
    />
  );
}

// Ambient particle effects for atmosphere
export function AmbientParticles() {
  const { performance } = useSceneStore();
  
  if (performance.quality === 'low') return null;
  
  return (
    <>
      {/* Floating data particles */}
      <ParticleSystem
        count={30}
        position={[0, 10, 0]}
        color="#00ffff"
        size={0.05}
        speed={0.5}
        spread={50}
        lifetime={10}
        type="data"
      />
      
      {/* Energy streams */}
      <ParticleSystem
        count={20}
        position={[20, 15, 0]}
        color="#ff8000"
        size={0.1}
        speed={1}
        spread={3}
        lifetime={5}
        type="energy"
      />
      
      <ParticleSystem
        count={20}
        position={[-20, 12, 0]}
        color="#8000ff"
        size={0.1}
        speed={1}
        spread={3}
        lifetime={5}
        type="energy"
      />
    </>
  );
}