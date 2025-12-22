'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useSceneStore } from '@/store/sceneStore';

interface PlayerControllerProps {
  position?: [number, number, number];
  speed?: number;
  jumpForce?: number;
  enableFirstPerson?: boolean;
}

export default function PlayerController({
  position = [0, 2, 0],
  speed = 5,
  jumpForce = 8,
  enableFirstPerson = true
}: PlayerControllerProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const { controls } = useSceneStore();
  
  // Movement state
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    run: false
  });
  
  const [isGrounded, setIsGrounded] = useState(false);
  const [velocity, setVelocity] = useState(new THREE.Vector3());
  const [cameraOffset] = useState(new THREE.Vector3(0, 1.8, 0)); // Eye level
  
  // Movement vectors
  const moveVector = useRef(new THREE.Vector3());
  const cameraDirection = useRef(new THREE.Vector3());
  const cameraRight = useRef(new THREE.Vector3());
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys(prev => ({ ...prev, forward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeys(prev => ({ ...prev, backward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, left: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, right: true }));
          break;
        case 'Space':
          event.preventDefault();
          setKeys(prev => ({ ...prev, jump: true }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys(prev => ({ ...prev, run: true }));
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setKeys(prev => ({ ...prev, forward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setKeys(prev => ({ ...prev, backward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setKeys(prev => ({ ...prev, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setKeys(prev => ({ ...prev, right: false }));
          break;
        case 'Space':
          setKeys(prev => ({ ...prev, jump: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setKeys(prev => ({ ...prev, run: false }));
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  // Movement and camera update
  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;
    
    const rigidBody = rigidBodyRef.current;
    const currentVelocity = rigidBody.linvel();
    const currentPosition = rigidBody.translation();
    
    // Calculate movement direction based on camera
    cameraDirection.current.set(0, 0, -1);
    cameraDirection.current.applyQuaternion(camera.quaternion);
    cameraDirection.current.y = 0;
    cameraDirection.current.normalize();
    
    cameraRight.current.set(1, 0, 0);
    cameraRight.current.applyQuaternion(camera.quaternion);
    cameraRight.current.y = 0;
    cameraRight.current.normalize();
    
    // Calculate movement vector
    moveVector.current.set(0, 0, 0);
    
    if (keys.forward) {
      moveVector.current.add(cameraDirection.current);
    }
    if (keys.backward) {
      moveVector.current.sub(cameraDirection.current);
    }
    if (keys.right) {
      moveVector.current.add(cameraRight.current);
    }
    if (keys.left) {
      moveVector.current.sub(cameraRight.current);
    }
    
    // Normalize and apply speed
    if (moveVector.current.length() > 0) {
      moveVector.current.normalize();
      const currentSpeed = keys.run ? speed * 1.5 : speed;
      moveVector.current.multiplyScalar(currentSpeed);
    }
    
    // Apply movement with smooth acceleration
    const targetVelocityX = moveVector.current.x;
    const targetVelocityZ = moveVector.current.z;
    
    const newVelocityX = THREE.MathUtils.lerp(currentVelocity.x, targetVelocityX, delta * 10);
    const newVelocityZ = THREE.MathUtils.lerp(currentVelocity.z, targetVelocityZ, delta * 10);
    
    // Check if grounded (simple ground detection)
    setIsGrounded(Math.abs(currentVelocity.y) < 0.1 && currentPosition.y < 2.5);
    
    // Handle jumping
    let newVelocityY = currentVelocity.y;
    if (keys.jump && isGrounded) {
      newVelocityY = jumpForce;
    }
    
    // Apply velocity
    rigidBody.setLinvel({ x: newVelocityX, y: newVelocityY, z: newVelocityZ }, true);
    
    // Update camera position for first-person mode
    if (enableFirstPerson) {
      const playerPosition = new THREE.Vector3(
        currentPosition.x,
        currentPosition.y,
        currentPosition.z
      );
      
      const cameraPosition = playerPosition.clone().add(cameraOffset);
      camera.position.copy(cameraPosition);
    }
    
    // Prevent falling through the world
    if (currentPosition.y < -10) {
      rigidBody.setTranslation({ x: 0, y: 5, z: 0 }, true);
      rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
    }
  });
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      type="dynamic"
      colliders="ball"
      mass={1}
      friction={0.8}
      restitution={0.1}
      linearDamping={0.5}
      angularDamping={0.5}
      lockRotations
    >
      {/* Player capsule (invisible in first-person) */}
      <mesh visible={!enableFirstPerson}>
        <capsuleGeometry args={[0.5, 1.5]} />
        <meshStandardMaterial 
          color="#00ffff" 
          transparent 
          opacity={0.3}
          wireframe
        />
      </mesh>
      
      {/* Player collision shape */}
      <mesh visible={false}>
        <capsuleGeometry args={[0.5, 1.5]} />
      </mesh>
    </RigidBody>
  );
}

// Hook for accessing player movement state
export function usePlayerMovement() {
  const [movementState, setMovementState] = useState({
    isMoving: false,
    isRunning: false,
    isGrounded: true,
    velocity: new THREE.Vector3()
  });
  
  return movementState;
}