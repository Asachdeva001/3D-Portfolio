import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSceneStore } from '@/store/sceneStore';

export function usePerformance() {
  const frameCount = useRef(0);
  const lastTime = useRef<number | undefined>(undefined);
  const { setFPS } = useSceneStore();

  // Initialize lastTime in useEffect to avoid impure function in render
  useEffect(() => {
    if (lastTime.current === undefined) {
      lastTime.current = performance.now();
    }
  }, []);

  useFrame(() => {
    frameCount.current++;
    const currentTime = performance.now();
    
    // Guard against undefined lastTime
    if (lastTime.current === undefined) {
      lastTime.current = currentTime;
      return;
    }
    
    if (currentTime - lastTime.current >= 1000) {
      const fps = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
      setFPS(fps);
      frameCount.current = 0;
      lastTime.current = currentTime;
    }
  });

  return null;
}

export function useWebGLDetection() {
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    
    if (!gl) {
      console.error('WebGL not supported');
      // Could show fallback UI here
      return;
    }
    
    // Check for required extensions
    const extensions = [
      'OES_texture_float',
      'OES_texture_half_float',
      'WEBGL_depth_texture'
    ];
    
    const missingExtensions = extensions.filter(ext => !gl.getExtension(ext));
    
    if (missingExtensions.length > 0) {
      console.warn('Missing WebGL extensions:', missingExtensions);
    }
    
    console.log('WebGL detection complete');
  }, []);
}