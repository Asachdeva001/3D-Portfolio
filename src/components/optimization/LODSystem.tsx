'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';
import { qualitySettings } from '@/utils/performanceUtils';

/* ----------------------------- LODComponent ----------------------------- */

interface LODComponentProps {
  children: React.ReactNode[]; // each child corresponds to a LOD level (0..N)
  distances: number[]; // distances at which to switch LOD (length should be children.length - 1)
  position?: [number, number, number];
  hysteresis?: number;
}

export function LODComponent({
  children,
  distances,
  position = [0, 0, 0],
  hysteresis = 0.1,
}: LODComponentProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const { camera } = useThree();
  const [currentLOD, setCurrentLOD] = useState<number>(0);
  const { performance } = useSceneStore();

  useFrame(() => {
    if (!groupRef.current) return;

    const distance = camera.position.distanceTo(new THREE.Vector3(...position));

    // Apply quality-based distance multipliers
    const qualityMultiplier =
      performance.quality === 'high' ? 1.2 : performance.quality === 'medium' ? 1.0 : 0.8;

    const adjustedDistances = distances.map((d) => d * qualityMultiplier);

    // Determine LOD index
    let newLOD = 0;
    for (let i = 0; i < adjustedDistances.length; i++) {
      if (distance > adjustedDistances[i]) newLOD = i + 1;
    }

    // Hysteresis prevention
    if (newLOD !== currentLOD) {
      // determine threshold safely (clamp index)
      const idx = Math.min(newLOD, adjustedDistances.length - 1);
      const threshold = adjustedDistances[idx] ?? adjustedDistances[adjustedDistances.length - 1] ?? 0;
      const hystThreshold = newLOD > currentLOD ? threshold * (1 + hysteresis) : threshold * (1 - hysteresis);

      if ((newLOD > currentLOD && distance > hystThreshold) || (newLOD < currentLOD && distance < hystThreshold)) {
        // clamp newLOD to available children count
        setCurrentLOD(Math.min(newLOD, children.length - 1));
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {children.map((child, index) => (
        <group key={index} visible={index === currentLOD}>
          {child}
        </group>
      ))}
    </group>
  );
}

/* ----------------------------- BuildingLOD ----------------------------- */

interface BuildingLODProps {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export function BuildingLOD({ position, size, color }: BuildingLODProps) {
  const { performance } = useSceneStore();
  const lodDistances = qualitySettings?.[performance.quality]?.lodDistance ?? [20, 50];

  // Generate stable random positions for windows using useState
  const [windowPositions] = useState(() => 
    Array.from({ length: 20 }).map(() => [
      (Math.random() - 0.5) * size[0] * 0.8,
      (Math.random() - 0.5) * size[1] * 0.8,
      size[2] / 2 + 0.01,
    ])
  );

  // High detail building
  const highDetail = useMemo(
    () => (
      <group>
        <mesh castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
        </mesh>

        {/* Windows (using stable positions) */}
        {windowPositions.map((position, i) => (
          <mesh
            key={i}
            position={position as [number, number, number]}
          >
            <boxGeometry args={[0.8, 0.8, 0.1]} />
            <meshStandardMaterial color="#4080ff" transparent opacity={0.7} emissive="#204080" />
          </mesh>
        ))}

        {/* Neon accents (use Standard so emissive works) */}
        <mesh position={[0, size[1] / 2 - 1, size[2] / 2 + 0.02]}>
          <boxGeometry args={[size[0] * 0.8, 0.2, 0.05]} />
          <meshStandardMaterial color={color} emissive={new THREE.Color(color)} emissiveIntensity={0.5} />
        </mesh>
      </group>
    ),
    [size, color]
  );

  // Medium detail building
  const mediumDetail = useMemo(
    () => (
      <group>
        <mesh castShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} />
        </mesh>

        <mesh position={[0, size[1] / 2 - 1, size[2] / 2 + 0.02]}>
          <boxGeometry args={[size[0] * 0.8, 0.2, 0.05]} />
          <meshStandardMaterial color={color} emissive={new THREE.Color(color)} emissiveIntensity={0.3} />
        </mesh>
      </group>
    ),
    [size, color]
  );

  // Low detail impostor
  const lowDetail = useMemo(
    () => (
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial color={color} />
      </mesh>
    ),
    [size, color]
  );

  return (
    <LODComponent position={position} distances={lodDistances} hysteresis={0.15}>
      {[highDetail, mediumDetail, lowDetail]}
    </LODComponent>
  );
}

/* --------------------------- Frustum Culling ---------------------------- */

export function useFrustumCulling() {
  const { camera, scene } = useThree();
  const frustum = useRef(new THREE.Frustum());
  const cameraMatrix = useRef(new THREE.Matrix4());

  useFrame(() => {
    // projectionMatrix * viewMatrix
    cameraMatrix.current.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    frustum.current.setFromProjectionMatrix(cameraMatrix.current);

    // Cull objects outside frustum
    scene.traverse((object) => {
      if (object.type === 'Mesh') {
        const mesh = object as THREE.Mesh;
        const geom = mesh.geometry as THREE.BufferGeometry;
        if (!geom.boundingSphere) {
          geom.computeBoundingSphere();
        }
        const sphere = geom.boundingSphere;
        if (sphere) {
          // transform sphere center to world space
          const worldCenter = sphere.center.clone().applyMatrix4(mesh.matrixWorld);
          const worldSphere = new THREE.Sphere(worldCenter, sphere.radius * Math.max(mesh.scale.x, mesh.scale.y, mesh.scale.z));
          mesh.visible = frustum.current.intersectsSphere(worldSphere);
        }
      }
    });
  });
}

/* ---------------------------- Object Pooling --------------------------- */

class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;

    for (let i = 0; i < initialSize; i++) this.pool.push(createFn());
  }

  get(): T {
    return this.pool.length > 0 ? (this.pool.pop() as T) : this.createFn();
  }

  release(obj: T): void {
    try {
      this.resetFn(obj);
      this.pool.push(obj);
    } catch {
      // ignore reset errors
    }
  }

  clear(): void {
    this.pool.length = 0;
  }
}

// simple vector3 particle pool
export const particlePool = new ObjectPool<THREE.Vector3>(() => new THREE.Vector3(), (v) => v.set(0, 0, 0), 100);

/* -------------------------- Instanced Mesh util ------------------------ */

interface InstancedMeshProps {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  positions: THREE.Vector3[];
  rotations?: THREE.Euler[];
  scales?: THREE.Vector3[];
}

export function InstancedMesh({ geometry, material, positions, rotations, scales }: InstancedMeshProps) {
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const { performance } = useSceneStore();

  // determine how many instances to actually use
  const maxInstances = useMemo(() => {
    const base = positions.length;
    switch (performance.quality) {
      case 'low':
        return Math.max(1, Math.floor(base * 0.3));
      case 'medium':
        return Math.max(1, Math.floor(base * 0.6));
      case 'high':
      default:
        return base;
    }
  }, [positions.length, performance.quality]);

  const actualPositions = useMemo(() => positions.slice(0, maxInstances), [positions, maxInstances]);

  // compose instance matrices once when inputs change
  useEffect(() => {
    if (!meshRef.current) return;
    const matrix = new THREE.Matrix4();
    const quat = new THREE.Quaternion();
    for (let i = 0; i < actualPositions.length; i++) {
      const pos = actualPositions[i];
      const rot = rotations?.[i] ?? new THREE.Euler();
      const scl = scales?.[i] ?? new THREE.Vector3(1, 1, 1);
      quat.setFromEuler(rot);
      matrix.compose(pos, quat, scl);
      meshRef.current.setMatrixAt(i, matrix);
    }
    meshRef.current.count = actualPositions.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [actualPositions, rotations, scales]);

  return (
    // react-three accepts geometry, material, count as args
    <instancedMesh ref={meshRef} args={[geometry, material, Math.max(1, maxInstances)]} castShadow receiveShadow />
  );
}

/* --------------------------- Texture Atlas ----------------------------- */

export class TextureAtlas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private texture: THREE.CanvasTexture;
  private regions: Map<string, { x: number; y: number; width: number; height: number }> = new Map();
  private currentX = 0;
  private currentY = 0;
  private rowHeight = 0;

  constructor(width = 1024, height = 1024) {
    // guard for SSR
    if (typeof document === 'undefined') {
      // create dummy canvas in SSR (won't be used)
      this.canvas = {} as HTMLCanvasElement;
      this.ctx = {} as CanvasRenderingContext2D;
      this.texture = new THREE.CanvasTexture({} as HTMLCanvasElement);
      return;
    }

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context for TextureAtlas');
    }
    this.ctx = ctx;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.needsUpdate = true;
  }

  addTexture(name: string, imageData: ImageData | HTMLCanvasElement | HTMLImageElement) {
    const width = 'width' in imageData ? imageData.width : 0;
    const height = 'height' in imageData ? imageData.height : 0;

    if (!width || !height) return;

    if (this.currentX + width > this.canvas.width) {
      this.currentX = 0;
      this.currentY += this.rowHeight;
      this.rowHeight = 0;
    }

    if (imageData instanceof ImageData) {
      this.ctx.putImageData(imageData, this.currentX, this.currentY);
    } else {
      this.ctx.drawImage(imageData as CanvasImageSource, this.currentX, this.currentY, width, height);
    }

    this.regions.set(name, {
      x: this.currentX / this.canvas.width,
      y: this.currentY / this.canvas.height,
      width: width / this.canvas.width,
      height: height / this.canvas.height,
    });

    this.currentX += width;
    this.rowHeight = Math.max(this.rowHeight, height);
    this.texture.needsUpdate = true;
  }

  getTexture(): THREE.Texture {
    return this.texture;
  }

  getUVs(name: string): number[] | null {
    const region = this.regions.get(name);
    if (!region) return null;
    return [
      region.x,
      region.y + region.height, // bottom-left
      region.x + region.width,
      region.y + region.height, // bottom-right
      region.x + region.width,
      region.y, // top-right
      region.x,
      region.y, // top-left
    ];
  }
}

/* ------------------------- Performance Monitor ------------------------- */

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    drawCalls: 0,
    triangles: 0,
    memory: 0,
  });

  const { gl } = useThree();
  const lastTimeRef = useRef<number | undefined>(undefined);
  const lastFpsUpdateRef = useRef<number>(0);

  // Initialize lastTimeRef in useEffect to avoid impure function in render
  useEffect(() => {
    if (lastTimeRef.current === undefined) {
      lastTimeRef.current = performance.now();
    }
  }, []);

  useFrame(() => {
    const now = performance.now();
    const delta = now - (lastTimeRef.current ?? now) || 16;
    lastTimeRef.current = now;

    // update FPS at ~4Hz to avoid excessive re-renders
    if (now - lastFpsUpdateRef.current > 250) {
      const fps = Math.round(1000 / delta);
      const info = gl.info;
      const memoryInfo = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
      const memoryMB = memoryInfo?.usedJSHeapSize ? memoryInfo.usedJSHeapSize / 1048576 : 0;

      setMetrics({
        fps,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        memory: Math.round(memoryMB * 10) / 10,
      });

      lastFpsUpdateRef.current = now;
    }
  });

  return (
    <div className="fixed top-4 left-4 bg-black/70 text-green-400 font-mono text-xs p-2 rounded border border-green-400 z-[9999]">
      <div>FPS: {metrics.fps}</div>
      <div>Draw Calls: {metrics.drawCalls}</div>
      <div>Triangles: {metrics.triangles}</div>
      <div>Memory: {metrics.memory.toFixed(1)}MB</div>
    </div>
  );
}
