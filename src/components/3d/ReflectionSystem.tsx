"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useSceneStore } from "@/store/sceneStore";

interface ReflectiveGroundProps {
  size?: number;
  reflectionIntensity?: number;
  roughness?: number;
  metalness?: number;
  color?: string;
}

export function ReflectiveGround({
  size = 200,
  reflectionIntensity = 0.4,
  roughness = 0.1,
  metalness = 0.8,
  color = "#2a2a4a",
}: ReflectiveGroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { performance } = useSceneStore();
  const { scene, camera } = useThree();

  // Create ground texture
  const groundTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Base dark asphalt color
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 512, 512);

    // Add noise for texture
    const imageData = ctx.getImageData(0, 0, 512, 512);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 30;
      data[i] = Math.max(0, Math.min(255, data[i] + noise));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);

    return texture;
  }, [color]);

  // Create normal map for wet surface effect
  const normalMap = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, "#8080ff");
    gradient.addColorStop(1, "#7f7fff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(10, 10);

    return texture;
  }, []);

  // Animate normal map for water-like effect
  useFrame((state) => {
    if (normalMap) {
      const time = state.clock.elapsedTime;
      normalMap.offset.x = Math.sin(time * 0.1) * 0.01;
      normalMap.offset.y = Math.cos(time * 0.15) * 0.01;
    }
  });

  // Adjust reflection quality based on performance
  const reflectionConfig = useMemo(() => {
    switch (performance.quality) {
      case "low":
        return {
          resolution: 256,
          mixBlur: 0,
          mixStrength: 0.2,
          mirror: 0.3,
        };
      case "medium":
        return {
          resolution: 512,
          mixBlur: 1,
          mixStrength: 0.3,
          mirror: 0.5,
        };
      case "high":
      default:
        return {
          resolution: 1024,
          mixBlur: 2,
          mixStrength: 0.4,
          mirror: 0.7,
        };
    }
  }, [performance.quality]);

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[size, size, 100, 100]} />
      {performance.quality === "low" ? (
        // Fallback material for low-end devices
        <meshStandardMaterial
          map={groundTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughness={roughness}
          metalness={metalness}
          envMapIntensity={reflectionIntensity * 0.5}
          color={new THREE.Color(color)}
        />
      ) : (
        // High-quality reflective material
        <MeshReflectorMaterial
          map={groundTexture}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          roughness={roughness}
          metalness={metalness}
          color={new THREE.Color(color)}
          resolution={reflectionConfig.resolution}
          mixBlur={reflectionConfig.mixBlur}
          mixStrength={reflectionConfig.mixStrength}
          mirror={reflectionConfig.mirror}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          depthToBlurRatioBias={0.25}
          distortion={0.1}
          mixContrast={1}
        />
      )}
    </mesh>
  );
}

interface ReflectionProbeProps {
  position: [number, number, number];
  intensity?: number;
  size?: number;
}

// Environment reflection probe for enhanced reflections
export function ReflectionProbe({
  position,
  intensity = 1,
  size = 10,
}: ReflectionProbeProps) {
  const cubeCamera = useRef<THREE.CubeCamera | null>(null);
  const renderTarget = useRef<THREE.WebGLCubeRenderTarget | null>(null);
  const { gl, scene } = useThree();
  const { performance } = useSceneStore();

  useEffect(() => {
    if (performance.quality === "low") return;

    // Create cube render target
    const resolution = performance.quality === "high" ? 256 : 128;
    renderTarget.current = new THREE.WebGLCubeRenderTarget(resolution);

    // Create cube camera
    cubeCamera.current = new THREE.CubeCamera(0.1, 100, renderTarget.current);
    cubeCamera.current.position.set(...position);

    return () => {
      renderTarget.current?.dispose();
    };
  }, [position, performance.quality]);

  useFrame(() => {
    if (
      !cubeCamera.current ||
      !renderTarget.current ||
      performance.quality === "low"
    )
      return;

    // Update cube camera occasionally (not every frame for performance)
    if (Math.random() < 0.1) {
      cubeCamera.current.update(gl, scene);
    }
  });

  return (
    <group position={position}>
      {/* Invisible helper for debugging */}
      <mesh visible={false}>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial color="#ff0000" wireframe />
      </mesh>
    </group>
  );
}

// Screen Space Reflections component (for advanced reflections)
export function ScreenSpaceReflections() {
  const { performance } = useSceneStore();

  // Only enable SSR on high-end devices
  if (performance.quality !== "high") {
    return null;
  }

  // This would integrate with post-processing pipeline
  // For now, we'll rely on the reflective materials
  return null;
}

// Planar reflections for specific surfaces
interface PlanarReflectionProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  reflectionIntensity?: number;
  clipBias?: number;
}

export function PlanarReflection({
  position,
  rotation = [0, 0, 0],
  size,
  reflectionIntensity = 0.8,
  clipBias = 0.003,
}: PlanarReflectionProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const reflectorRef = useRef<THREE.Mesh | null>(null);
  const { performance } = useSceneStore();

  // Only create planar reflections on medium/high quality
  if (performance.quality === "low") {
    return (
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <planeGeometry args={size} />
        <meshStandardMaterial
          color="#2a2a4a"
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.8}
        />
      </mesh>
    );
  }

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      <planeGeometry args={size} />
      <MeshReflectorMaterial
        color="#2a2a4a"
        roughness={0.1}
        metalness={0.8}
        resolution={performance.quality === "high" ? 512 : 256}
        mirror={reflectionIntensity}
        mixBlur={1}
        mixStrength={0.5}
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
      />
    </mesh>
  );
}

// Utility functions for reflection management
export const reflectionUtils = {
  // Calculate reflection vector
  calculateReflection(
    incident: THREE.Vector3,
    normal: THREE.Vector3
  ): THREE.Vector3 {
    const reflection = incident.clone();
    reflection.reflect(normal);
    return reflection;
  },

  // Get reflection intensity based on viewing angle
  getFresnelReflectance(
    viewDirection: THREE.Vector3,
    normal: THREE.Vector3,
    ior = 1.5
  ): number {
    const cosTheta = Math.abs(viewDirection.dot(normal));
    const r0 = Math.pow((1 - ior) / (1 + ior), 2);
    return r0 + (1 - r0) * Math.pow(1 - cosTheta, 5);
  },

  // Update reflection probe
  updateReflectionProbe(
    cubeCamera: THREE.CubeCamera,
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene
  ) {
    cubeCamera.update(renderer, scene);
  },
};

export default {
  ReflectiveGround,
  ReflectionProbe,
  ScreenSpaceReflections,
  PlanarReflection,
  reflectionUtils,
};
