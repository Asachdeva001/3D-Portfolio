'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

interface CameraControllerProps {
  sensitivity?: number;
  smoothing?: number;
  verticalLimit?: number;
  enablePointerLock?: boolean;
  mode?: 'first-person' | 'third-person';
}

export default function CameraController({
  sensitivity = 0.002,
  smoothing = 0.1,
  verticalLimit = Math.PI / 2 - 0.1,
  enablePointerLock = true,
  mode = 'first-person'
}: CameraControllerProps) {
  const { camera, gl } = useThree();
  const { controls, setControls } = useSceneStore();
  
  // Mouse state
  const [isLocked, setIsLocked] = useState(false);
  const [mouseMovement, setMouseMovement] = useState({ x: 0, y: 0 });
  
  // Camera rotation state
  const yaw = useRef(0);
  const pitch = useRef(0);
  const targetYaw = useRef(0);
  const targetPitch = useRef(0);
  
  // Third-person camera state
  const [thirdPersonDistance, setThirdPersonDistance] = useState(8);
  const [thirdPersonHeight, setThirdPersonHeight] = useState(3);
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());
  
  // Pointer lock setup
  useEffect(() => {
    if (!enablePointerLock) return;
    
    const canvas = gl.domElement;
    
    const handlePointerLockChange = () => {
      setIsLocked(document.pointerLockElement === canvas);
    };
    
    const handlePointerLockError = () => {
      console.warn('Pointer lock failed');
      setIsLocked(false);
    };
    
    const handleClick = () => {
      if (!isLocked) {
        canvas.requestPointerLock();
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && isLocked) {
        document.exitPointerLock();
      }
      
      // Toggle camera mode
      if (event.code === 'KeyC') {
        setControls({
          ...controls,
          cameraMode: controls.cameraMode === 'first-person' ? 'third-person' : 'first-person'
        });
      }
    };
    
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);
    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('click', handleClick);
    
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
      document.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('click', handleClick);
    };
  }, [gl.domElement, isLocked, enablePointerLock, controls, setControls]);
  
  // Mouse movement handling
  useEffect(() => {
    if (!isLocked) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;
      
      setMouseMovement({ x: movementX, y: movementY });
      
      // Update target rotation
      targetYaw.current -= movementX * sensitivity;
      targetPitch.current -= movementY * sensitivity;
      
      // Clamp vertical rotation
      targetPitch.current = Math.max(
        -verticalLimit,
        Math.min(verticalLimit, targetPitch.current)
      );
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isLocked, sensitivity, verticalLimit]);
  
  // Wheel handling for third-person distance
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (controls.cameraMode === 'third-person') {
        event.preventDefault();
        const delta = event.deltaY > 0 ? 1 : -1;
        setThirdPersonDistance(prev => 
          Math.max(3, Math.min(15, prev + delta * 0.5))
        );
      }
    };
    
    gl.domElement.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      gl.domElement.removeEventListener('wheel', handleWheel);
    };
  }, [gl.domElement, controls.cameraMode]);
  
  // Camera update loop
  useFrame((state, delta) => {
    // Smooth rotation interpolation
    yaw.current = THREE.MathUtils.lerp(yaw.current, targetYaw.current, smoothing);
    pitch.current = THREE.MathUtils.lerp(pitch.current, targetPitch.current, smoothing);
    
    if (controls.cameraMode === 'first-person' || mode === 'first-person') {
      // First-person camera (handled by PlayerController)
      const euler = new THREE.Euler(pitch.current, yaw.current, 0, 'YXZ');
      camera.quaternion.setFromEuler(euler);
    } else {
      // Third-person camera
      updateThirdPersonCamera(delta);
    }
    
    // Update controls state
    setControls({
      ...controls,
      mouseMovement: { x: mouseMovement.x, y: mouseMovement.y },
      isPointerLocked: isLocked,
      cameraRotation: { yaw: yaw.current, pitch: pitch.current }
    });
  });
  
  const updateThirdPersonCamera = (delta: number) => {
    // Calculate target position behind the player
    const playerPosition = new THREE.Vector3(0, 2, 0); // This should come from player
    
    // Calculate camera position based on yaw and pitch
    const spherical = new THREE.Spherical(
      thirdPersonDistance,
      Math.PI / 2 - pitch.current,
      yaw.current + Math.PI
    );
    
    targetPosition.current.setFromSpherical(spherical);
    targetPosition.current.add(playerPosition);
    targetPosition.current.y += thirdPersonHeight;
    
    // Smooth camera movement
    currentPosition.current.lerp(targetPosition.current, delta * 5);
    camera.position.copy(currentPosition.current);
    
    // Look at player
    const lookAtTarget = playerPosition.clone();
    lookAtTarget.y += 1.5; // Look at head level
    camera.lookAt(lookAtTarget);
  };
  
  // UI overlay for instructions
  return (
    <>
      {!isLocked && enablePointerLock && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontSize: '14px',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #00ffff'
          }}
        >
          <div style={{ marginBottom: '10px', fontSize: '16px', color: '#ff0080' }}>
            CYBERPUNK PORTFOLIO
          </div>
          <div style={{ marginBottom: '5px' }}>
            Click to enter immersive mode
          </div>
          <div style={{ fontSize: '12px', opacity: 0.7 }}>
            WASD: Move | Mouse: Look | Shift: Run | Space: Jump | C: Toggle Camera | ESC: Exit
          </div>
        </div>
      )}
      
      {isLocked && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 1000,
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #00ffff'
          }}
        >
          <div>Mode: {controls.cameraMode?.toUpperCase() || 'FIRST-PERSON'}</div>
          <div>ESC: Exit | C: Toggle Camera</div>
          {controls.cameraMode === 'third-person' && (
            <div>Scroll: Zoom</div>
          )}
        </div>
      )}
      
      {/* Crosshair for first-person mode */}
      {isLocked && (controls.cameraMode === 'first-person' || mode === 'first-person') && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '4px',
            height: '4px',
            background: '#00ffff',
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 0 10px #00ffff'
          }}
        />
      )}
    </>
  );
}

// Hook for accessing camera state
export function useCameraControls() {
  const { controls } = useSceneStore();
  
  return {
    isPointerLocked: controls.isPointerLocked,
    cameraMode: controls.cameraMode,
    mouseMovement: controls.mouseMovement,
    cameraRotation: controls.cameraRotation
  };
}