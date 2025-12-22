import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

interface WindowLight {
  x: number;
  y: number;
  z: number;
  color: string;
}

interface BuildingProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  neonColor: string;
  windowPattern?: number;
}

/* ------------------ Pure generator (NO hooks) ------------------ */
function generateWindows(
  width: number,
  height: number,
  depth: number,
  windowPattern: number,
  neonColor: string
): WindowLight[] {
  const windowArray: WindowLight[] = [];
  const windowsX = Math.floor(width * 2);
  const windowsY = Math.floor(height / 3);

  for (let x = 0; x < windowsX; x++) {
    for (let y = 0; y < windowsY; y++) {
      if (Math.random() < windowPattern) {
        windowArray.push({
          x: (x - windowsX / 2) * 0.5,
          y: y * 3 + 2,
          z: depth / 2 + 0.01,
          color: Math.random() > 0.7 ? neonColor : "#ffff88",
        });
      }
    }
  }

  return windowArray;
}

export default function Building({
  position,
  height,
  width,
  depth,
  neonColor,
  windowPattern = 0.3,
}: BuildingProps) {
  const buildingRef = useRef<THREE.Group | null>(null);
  const neonRef = useRef<THREE.Mesh | null>(null);

  /* ---------- Lazy initialization (NO effect yet) ---------- */
  const [windows, setWindows] = useState<WindowLight[]>(() =>
    generateWindows(width, height, depth, windowPattern, neonColor)
  );

  /* ---------- Sync only when inputs change ---------- */
  useEffect(() => {
    setWindows(
      generateWindows(width, height, depth, windowPattern, neonColor)
    );
  }, [width, height, depth, windowPattern, neonColor]);

  /* ---------- Animations (safe) ---------- */
  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (neonRef.current) {
      const material =
        neonRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity =
        0.5 + Math.sin(time * 2 + position[0]) * 0.2;
    }

    if (buildingRef.current) {
      buildingRef.current.rotation.z =
        Math.sin(time * 0.5 + position[0]) * 0.002;
    }
  });

  return (
    <group ref={buildingRef} position={position}>
      {/* Main building */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      </RigidBody>

      {/* Neon strip */}
      <mesh
        ref={neonRef}
        position={[0, height / 2 - 1, depth / 2 + 0.02]}
      >
        <boxGeometry args={[width * 0.8, 0.5, 0.1]} />
        <meshStandardMaterial
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Top neon */}
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width + 0.2, 0.3, depth + 0.2]} />
        <meshStandardMaterial
          color={neonColor}
          emissive={neonColor}
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Front windows */}
      {windows.map((window, index) => (
        <mesh key={index} position={[window.x, window.y, window.z]}>
          <boxGeometry args={[0.3, 0.4, 0.02]} />
          <meshStandardMaterial
            color={window.color}
            emissive={window.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Side windows */}
      {windows
        .slice(0, Math.floor(windows.length / 3))
        .map((window, index) => (
          <mesh
            key={`side-${index}`}
            position={[width / 2 + 0.01, window.y, window.x]}
          >
            <boxGeometry args={[0.02, 0.4, 0.3]} />
            <meshStandardMaterial
              color={window.color}
              emissive={window.color}
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
    </group>
  );
}
