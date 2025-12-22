'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { random } from '@/utils/mathUtils';
import { createNeonMaterial } from '@/components/shaders/NeonShader';
import { useSceneStore } from '@/store/sceneStore';

const MAX_TRAIL_POINTS = 50;

interface HoverCarProps {
  curve: THREE.CatmullRomCurve3; // Changed from path: Vector3[]
  speed: number;
  color: string;
  size: [number, number, number];
  index: number;
}

function HoverCar({ curve, speed, color, size, index }: HoverCarProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const { performance } = useSceneStore();

  const progress = useRef(Math.random());
  const trailPositions = useRef<THREE.Vector3[]>([]);
  
  // Reusable vectors to avoid GC pressure
  const tempPos = useRef(new THREE.Vector3());
  const tempLookAt = useRef(new THREE.Vector3());

  const { bodyMaterial, neonMaterial, glassMaterial } = useMemo(() => ({
    bodyMaterial: new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      metalness: 0.8,
      roughness: 0.2
    }),
    neonMaterial: createNeonMaterial(color, 1.5),
    glassMaterial: new THREE.MeshStandardMaterial({
      color: 0x4080ff,
      transparent: true,
      opacity: 0.3
    })
  }), [color]);

  const trailGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL_POINTS * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(MAX_TRAIL_POINTS * 3), 3));
    g.setDrawRange(0, 0);
    return g;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Advance progress
    progress.current += speed * delta * 0.05;
    if (progress.current >= 1) progress.current = 0;

    // 1. Position: Get smooth coordinate from curve
    curve.getPointAt(progress.current, tempPos.current);
    groupRef.current.position.copy(tempPos.current);

    // 2. Rotation: Look ahead on the curve
    const lookAtT = Math.min(progress.current + 0.01, 1);
    curve.getPointAt(lookAtT, tempLookAt.current);
    groupRef.current.lookAt(tempLookAt.current);

    // 3. Hovering oscillation
    groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 3 + index) * 0.2;

    if (performance.quality !== 'low') {
      updateTrail(tempPos.current);
    }

    if ((neonMaterial as any).update) {
      (neonMaterial as any).update(state.clock.elapsedTime);
    }
  });

  function updateTrail(pos: THREE.Vector3) {
    trailPositions.current.push(pos.clone());
    if (trailPositions.current.length > MAX_TRAIL_POINTS) trailPositions.current.shift();

    const positions = trailGeometry.attributes.position.array as Float32Array;
    const colors = trailGeometry.attributes.color.array as Float32Array;
    const c = new THREE.Color(color);

    trailPositions.current.forEach((p, i) => {
      const alpha = i / trailPositions.current.length;
      positions.set([p.x, p.y, p.z], i * 3);
      colors.set([c.r * alpha, c.g * alpha, c.b * alpha], i * 3);
    });

    trailGeometry.setDrawRange(0, trailPositions.current.length);
    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.color.needsUpdate = true;
  }

  return (
    <group ref={groupRef}>
      <mesh material={bodyMaterial} castShadow>
        <boxGeometry args={size} />
      </mesh>
      <mesh material={glassMaterial} position={[0, size[1] * 0.2, size[2] * 0.2]}>
        <boxGeometry args={[size[0] * 0.8, size[1] * 0.4, size[2] * 0.4]} />
      </mesh>
      <mesh material={neonMaterial} position={[0, -size[1] * 0.51, 0]}>
        <boxGeometry args={[size[0] * 1.1, 0.05, size[2] * 0.9]} />
      </mesh>

      {performance.quality !== 'low' && (
        <points geometry={trailGeometry}>
          <pointsMaterial size={0.15} vertexColors transparent blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
      )}
    </group>
  );
}

export default function HoverCars() {
  const { performance } = useSceneStore();

  const cars = useMemo(() => {
    const count = performance.quality === 'low' ? 3 : performance.quality === 'medium' ? 6 : 10;

    return Array.from({ length: count }, (_, i) => {
      const rawPoints = generateSpiralPath(
        random.range(15, 30),
        random.range(10, 20),
        random.range(1, 3)
      ).map(p => p.add(new THREE.Vector3(random.range(-30, 30), random.range(5, 15), random.range(-30, 30))));

      // Wrap raw points in a CatmullRomCurve3
      const curve = new THREE.CatmullRomCurve3(rawPoints, true); // true = closed loop

      return {
        curve,
        speed: random.range(0.2, 0.5),
        color: random.choice(['#ff0080', '#00ffff', '#ff8000', '#8000ff']),
        size: [1.2, 0.6, 2.5] as [number, number, number],
        index: i
      };
    });
  }, [performance.quality]);

  return (
    <group>
      {cars.map((c, i) => (
        <HoverCar key={i} {...c} />
      ))}
    </group>
  );
}

function generateSpiralPath(radius: number, height: number, turns: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const steps = 12; // Fewer points needed because CatmullRom interpolates smoothly

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const angle = t * Math.PI * 2 * turns;
    points.push(new THREE.Vector3(Math.cos(angle) * radius, t * height, Math.sin(angle) * radius));
  }
  return points;
}