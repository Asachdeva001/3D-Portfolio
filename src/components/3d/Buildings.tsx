'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { random, geometry } from '@/utils/mathUtils';
import { createNeonMaterial } from '@/components/shaders/NeonShader';
import { useSceneStore } from '@/store/sceneStore';

interface BuildingProps {
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  color?: string;
  windowDensity?: number;
}

function Building({ position, width, height, depth, color = '#0a0a2a', windowDensity = 0.3 }: BuildingProps) {
  const buildingRef = useRef<THREE.Group>(null);
  const { performance } = useSceneStore();

  // Generate building geometry and windows
  const { buildingGeometry, windows } = useMemo(() => {
    const buildingGeometry = geometry.createRoundedBox(width, height, depth, 0.2);

    const windows: Array<{
      position: [number, number, number];
      size: [number, number];
      color: string;
      intensity: number;
    }> = [];

    // Generate windows on building faces
    const windowSize = 0.8;
    const windowSpacing = 1.5;

    // Front and back faces
    for (let y = 2; y < height - 1; y += windowSpacing) {
      for (let x = -width / 2 + 1; x < width / 2 - 1; x += windowSpacing) {
        if (random.boolean(windowDensity)) {
          // Front face
          windows.push({
            position: [x, y - height / 2, depth / 2 + 0.01],
            size: [windowSize, windowSize],
            color: random.choice(['#00ffff', '#ff0080', '#ff8000', '#8000ff']),
            intensity: random.range(0.5, 1.0)
          });

          // Back face
          windows.push({
            position: [x, y - height / 2, -depth / 2 - 0.01],
            size: [windowSize, windowSize],
            color: random.choice(['#00ffff', '#ff0080', '#ff8000', '#8000ff']),
            intensity: random.range(0.5, 1.0)
          });
        }
      }
    }

    // Left and right faces
    for (let y = 2; y < height - 1; y += windowSpacing) {
      for (let z = -depth / 2 + 1; z < depth / 2 - 1; z += windowSpacing) {
        if (random.boolean(windowDensity)) {
          // Left face
          windows.push({
            position: [-width / 2 - 0.01, y - height / 2, z],
            size: [windowSize, windowSize],
            color: random.choice(['#00ffff', '#ff0080', '#ff8000', '#8000ff']),
            intensity: random.range(0.5, 1.0)
          });

          // Right face
          windows.push({
            position: [width / 2 + 0.01, y - height / 2, z],
            size: [windowSize, windowSize],
            color: random.choice(['#00ffff', '#ff0080', '#ff8000', '#8000ff']),
            intensity: random.range(0.5, 1.0)
          });
        }
      }
    }

    return { buildingGeometry, windows };
  }, [width, height, depth, windowDensity]);

  // Animate building (subtle breathing effect)
  useFrame((state) => {
    if (buildingRef.current && performance.quality !== 'low') {
      const time = state.clock.elapsedTime;
      buildingRef.current.scale.y = 1 + Math.sin(time * 0.5 + position[0] * 0.1) * 0.02;
    }
  });

  return (
    <group ref={buildingRef} position={position}>
      {/* Main building structure */}
      <mesh>
        <primitive object={buildingGeometry} />
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Windows */}
      {performance.quality !== 'low' && windows.map((window, index) => (
        <group key={index} position={window.position}>
          <mesh>
            <planeGeometry args={window.size} />
            <meshStandardMaterial
              color="#4080ff"
              transparent
              opacity={window.intensity}
              emissive={new THREE.Color(window.color)}
              emissiveIntensity={window.intensity * 0.5}
              roughness={0.4}
              metalness={0.0}
            />
          </mesh>

          {/* Window glow effect */}
          {performance.quality === 'high' && (
            <pointLight
              color={window.color}
              intensity={window.intensity * 0.3}
              distance={5}
              decay={2}
            />
          )}
        </group>
      ))}

      {/* Building top light */}
      {performance.quality !== 'low' && (
        <pointLight
          position={[0, height / 2 + 1, 0]}
          color={random.choice(['#ff0080', '#00ffff', '#ff8000'])}
          intensity={0.5}
          distance={20}
          decay={2}
        />
      )}
    </group>
  );
}

// Skyscraper component
interface SkyscraperProps {
  position: [number, number, number];
  floors: number;
  baseWidth: number;
  baseDepth: number;
}

function Skyscraper({ position, floors, baseWidth, baseDepth }: SkyscraperProps) {
  const { performance } = useSceneStore();

  const sections = useMemo(() => {
    const sections = [];
    let currentHeight = 0;

    for (let i = 0; i < floors; i++) {
      const floorHeight = random.range(3, 5);
      const widthScale = 1 - (i / floors) * 0.3; // Taper towards top
      const depthScale = 1 - (i / floors) * 0.3;

      sections.push({
        position: [0, currentHeight + floorHeight / 2, 0] as [number, number, number],
        width: baseWidth * widthScale,
        height: floorHeight,
        depth: baseDepth * depthScale,
        color: `hsl(${200 + i * 10}, 70%, ${20 + i * 2}%)`
      });

      currentHeight += floorHeight;
    }

    return sections;
  }, [floors, baseWidth, baseDepth]);

  return (
    <group position={position}>
      {sections.map((section, index) => (
        <Building
          key={index}
          position={section.position}
          width={section.width}
          height={section.height}
          depth={section.depth}
          color={section.color}
          windowDensity={0.4}
        />
      ))}

      {/* Antenna/spire */}
      {performance.quality !== 'low' && (
        <group position={[0, sections.reduce((sum, s) => sum + s.height, 0), 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.2, 8, 8]} />
            <primitive object={createNeonMaterial('#ff0080', 1.5)} />
          </mesh>

          {/* Blinking light */}
          <pointLight
            color="#ff0080"
            intensity={1}
            distance={30}
            decay={2}
          />
        </group>
      )}
    </group>
  );
}

// Main Buildings component
export default function Buildings() {
  const { performance } = useSceneStore();

  // Generate city layout
  const buildings = useMemo(() => {
    const buildings = [];
    const citySize = 80;
    const buildingCount = performance.quality === 'low' ? 20 : performance.quality === 'medium' ? 40 : 60;

    for (let i = 0; i < buildingCount; i++) {
      const x = random.range(-citySize, citySize);
      const z = random.range(-citySize, citySize);

      // Avoid center area (player spawn)
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;

      const buildingType = random.choice(['building', 'skyscraper']);

      if (buildingType === 'skyscraper' && random.boolean(0.3)) {
        buildings.push({
          type: 'skyscraper',
          position: [x, 0, z] as [number, number, number],
          floors: random.range(8, 20),
          baseWidth: random.range(4, 8),
          baseDepth: random.range(4, 8)
        });
      } else {
        buildings.push({
          type: 'building',
          position: [x, random.range(5, 25), z] as [number, number, number],
          width: random.range(3, 8),
          height: random.range(10, 50),
          depth: random.range(3, 8),
          windowDensity: random.range(0.2, 0.5)
        });
      }
    }

    return buildings;
  }, [performance.quality]);

  return (
    <group>
      {buildings.map((building, index) => (
        building.type === 'skyscraper' ? (
          <Skyscraper
            key={index}
            position={building.position}
            floors={building.floors ?? 3}           // <- default to 3 floors when undefined
            baseWidth={building.baseWidth ?? 10}    // also safe-guard other numeric fields
            baseDepth={building.baseDepth ?? 10}
          />
        ) : (
          <Building
            key={index}
            position={building.position}
            width={building.width ?? 10}              // default width
            height={building.height ?? 20}            // default height
            depth={building.depth ?? 10}              // default depth
            windowDensity={building.windowDensity ?? 0.5}  // default window density
          />
        )
      ))}

      {/* Atmospheric fog */}
      {performance.quality === 'high' && (
        <fog attach="fog" args={['#0a0a2a', 50, 200]} />
      )}
    </group>
  );
}