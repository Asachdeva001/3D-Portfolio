'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider, RapierRigidBody, CollisionPayload } from '@react-three/rapier';
import * as THREE from 'three';
import { cityConfig } from '@/data/cityConfig';

interface CollisionBoundaryProps {
  size: number;
  height?: number;
}

// Invisible collision boundaries for the city
export function CollisionBoundary({ size, height = 20 }: CollisionBoundaryProps) {
  const boundaries = [
    // North wall
    { position: [0, height/2, size/2], size: [size, height, 1] },
    // South wall  
    { position: [0, height/2, -size/2], size: [size, height, 1] },
    // East wall
    { position: [size/2, height/2, 0], size: [1, height, size] },
    // West wall
    { position: [-size/2, height/2, 0], size: [1, height, size] }
  ];
  
  return (
    <>
      {boundaries.map((boundary, index) => (
        <RigidBody
          key={index}
          type="fixed"
          position={boundary.position as [number, number, number]}
        >
          <CuboidCollider args={boundary.size as [number, number, number]} />
          {/* Invisible mesh for debugging */}
          <mesh visible={false}>
            <boxGeometry args={boundary.size as [number, number, number]} />
            <meshBasicMaterial color="#ff0000" transparent opacity={0.1} />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
}

interface BuildingColliderProps {
  position: [number, number, number];
  size: [number, number, number];
  enableWallSliding?: boolean;
}

// Individual building collision
export function BuildingCollider({ 
  position, 
  size, 
  enableWallSliding = true 
}: BuildingColliderProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  
  return (
    <RigidBody
      ref={rigidBodyRef}
      type="fixed"
      position={[position[0], position[1] + size[1]/2, position[2]]}
      friction={enableWallSliding ? 0.1 : 0.8}
      restitution={0.1}
    >
      <CuboidCollider args={[size[0]/2, size[1]/2, size[2]/2]} />
      {/* Debug visualization */}
      <mesh visible={false}>
        <boxGeometry args={size} />
        <meshBasicMaterial color="#00ff00" transparent opacity={0.1} wireframe />
      </mesh>
    </RigidBody>
  );
}

interface CollisionDetectorProps {
  onCollisionEnter?: (payload: CollisionPayload) => void;
  onCollisionExit?: (payload: CollisionPayload) => void;
  onCollisionStay?: (payload: CollisionPayload) => void;
}

// Collision event detector component
export function CollisionDetector({
  onCollisionEnter,
  onCollisionExit,
  onCollisionStay
}: CollisionDetectorProps) {
  const activeCollisions = useRef(new Set());
  
  useFrame(() => {
    // This would integrate with Rapier's collision events
    // For now, we'll handle basic collision detection
  });
  
  return null;
}

interface ProximityTriggerProps {
  position: [number, number, number];
  radius: number;
  onEnter?: () => void;
  onExit?: () => void;
  onStay?: () => void;
  targetTag?: string;
}

// Proximity trigger for interactive elements
export function ProximityTrigger({
  position,
  radius,
  onEnter,
  onExit,
  onStay,
  targetTag = 'player'
}: ProximityTriggerProps) {
  const triggerRef = useRef<RapierRigidBody>(null);
  const [isTriggered, setIsTriggered] = useState(false);
  const lastTriggerState = useRef(false);
  
  useFrame(() => {
    if (!triggerRef.current) return;
    
    // Simple distance-based proximity detection
    // In a real implementation, this would use Rapier's sensor colliders
    const triggerPosition = new THREE.Vector3(...position);
    const playerPosition = new THREE.Vector3(0, 2, 0); // Get from player controller
    
    const distance = triggerPosition.distanceTo(playerPosition);
    const currentlyTriggered = distance <= radius;
    
    if (currentlyTriggered !== lastTriggerState.current) {
      if (currentlyTriggered) {
        onEnter?.();
      } else {
        onExit?.();
      }
      setIsTriggered(currentlyTriggered);
      lastTriggerState.current = currentlyTriggered;
    } else if (currentlyTriggered) {
      onStay?.();
    }
  });
  
  return (
    <RigidBody
      ref={triggerRef}
      type="fixed"
      position={position}
      sensor
    >
      <CuboidCollider args={[radius, radius, radius]} sensor />
      {/* Debug visualization */}
      <mesh visible={false}>
        <sphereGeometry args={[radius]} />
        <meshBasicMaterial 
          color={isTriggered ? "#ff0080" : "#0080ff"} 
          transparent 
          opacity={0.2} 
          wireframe 
        />
      </mesh>
    </RigidBody>
  );
}

// Wall sliding physics helper
export class WallSlidingController {
  private velocity = new THREE.Vector3();
  private normal = new THREE.Vector3();
  private slideVector = new THREE.Vector3();
  
  calculateSlideVector(
    inputVelocity: THREE.Vector3, 
    wallNormal: THREE.Vector3
  ): THREE.Vector3 {
    // Project velocity onto the wall surface
    this.normal.copy(wallNormal).normalize();
    const dot = inputVelocity.dot(this.normal);
    
    // Remove the component of velocity that's into the wall
    this.slideVector.copy(inputVelocity);
    this.slideVector.addScaledVector(this.normal, -dot);
    
    return this.slideVector;
  }
  
  applyWallSliding(
    rigidBody: RapierRigidBody,
    inputVelocity: THREE.Vector3,
    wallNormal: THREE.Vector3,
    slideForce: number = 1.0
  ) {
    const slideVelocity = this.calculateSlideVector(inputVelocity, wallNormal);
    slideVelocity.multiplyScalar(slideForce);
    
    const currentVel = rigidBody.linvel();
    rigidBody.setLinvel({
      x: slideVelocity.x,
      y: currentVel.y, // Preserve vertical velocity
      z: slideVelocity.z
    }, true);
  }
}

// Ground detection system
export function GroundDetector({ 
  onGroundStateChange 
}: { 
  onGroundStateChange?: (isGrounded: boolean) => void 
}) {
  const [isGrounded, setIsGrounded] = useState(true);
  const lastGroundState = useRef(true);
  
  useFrame(() => {
    // Simple ground detection based on Y position and velocity
    // In a real implementation, this would use raycast or collision events
    const playerY = 2; // Get from player controller
    const currentlyGrounded = playerY <= 2.1;
    
    if (currentlyGrounded !== lastGroundState.current) {
      setIsGrounded(currentlyGrounded);
      onGroundStateChange?.(currentlyGrounded);
      lastGroundState.current = currentlyGrounded;
    }
  });
  
  return null;
}

// Main collision system component
export default function CollisionSystem() {
  const wallSlidingController = useRef(new WallSlidingController());
  
  return (
    <>
      {/* City boundaries */}
      <CollisionBoundary size={cityConfig.city.size} height={50} />
      
      {/* Ground collision */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <CuboidCollider args={[cityConfig.city.size/2, 0.5, cityConfig.city.size/2]} />
      </RigidBody>
      
      {/* Ground detection */}
      <GroundDetector 
        onGroundStateChange={(grounded) => {
          console.log('Ground state changed:', grounded);
        }}
      />
      
      {/* Example proximity triggers for interactive elements */}
      <ProximityTrigger
        position={[10, 2, 10]}
        radius={3}
        onEnter={() => console.log('Entered interactive area')}
        onExit={() => console.log('Left interactive area')}
      />
    </>
  );
}

// Utility functions for collision detection
export const collisionUtils = {
  // Check if point is within bounds
  isPointInBounds(point: THREE.Vector3, bounds: { min: THREE.Vector3; max: THREE.Vector3 }): boolean {
    return point.x >= bounds.min.x && point.x <= bounds.max.x &&
           point.y >= bounds.min.y && point.y <= bounds.max.y &&
           point.z >= bounds.min.z && point.z <= bounds.max.z;
  },
  
  // Get closest point on a box to a given point
  getClosestPointOnBox(
    point: THREE.Vector3, 
    boxCenter: THREE.Vector3, 
    boxSize: THREE.Vector3
  ): THREE.Vector3 {
    const closest = new THREE.Vector3();
    const halfSize = boxSize.clone().multiplyScalar(0.5);
    
    closest.x = Math.max(boxCenter.x - halfSize.x, Math.min(point.x, boxCenter.x + halfSize.x));
    closest.y = Math.max(boxCenter.y - halfSize.y, Math.min(point.y, boxCenter.y + halfSize.y));
    closest.z = Math.max(boxCenter.z - halfSize.z, Math.min(point.z, boxCenter.z + halfSize.z));
    
    return closest;
  },
  
  // Calculate wall normal from collision
  calculateWallNormal(
    playerPosition: THREE.Vector3,
    wallPosition: THREE.Vector3,
    wallSize: THREE.Vector3
  ): THREE.Vector3 {
    const closestPoint = this.getClosestPointOnBox(playerPosition, wallPosition, wallSize);
    const normal = playerPosition.clone().sub(closestPoint).normalize();
    
    // Ensure normal points away from wall
    if (normal.length() === 0) {
      normal.set(0, 0, 1); // Default normal
    }
    
    return normal;
  }
};