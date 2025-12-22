'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ParticleBurst } from './ParticleSystem';
import { deviceCapabilities } from '@/utils/performanceUtils';

interface InteractionFeedbackProps {
  position: [number, number, number];
  isHovered: boolean;
  isClicked: boolean;
  type?: 'hover' | 'click' | 'activate';
}

export default function InteractionFeedback({
  position,
  isHovered,
  isClicked,
  type = 'hover',
}: InteractionFeedbackProps) {
  const ringRef = useRef<THREE.Mesh | null>(null);
  const glowRef = useRef<THREE.Mesh | null>(null);
  const [clickBurst, setClickBurst] = useState(false);

  useEffect(() => {
    if (isClicked) {
      // Use timeout to avoid setState in effect
      const timer = setTimeout(() => setClickBurst(true), 0);

      // Haptic feedback (guarded)
      try {
        if ('vibrate' in navigator) {
          (navigator as Navigator & { vibrate: (pattern: number | number[]) => boolean }).vibrate(50);
        }
      } catch {
        // ignore
      }

      // Audio feedback placeholder
      // audioFeedback.playClickSound();
      
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  useEffect(() => {
    if (isHovered) {
      try {
        if ('vibrate' in navigator) {
          (navigator as Navigator & { vibrate: (pattern: number | number[]) => boolean }).vibrate(20);
        }
      } catch {
        // ignore
      }
      // audioFeedback.playHoverSound();
    }
  }, [isHovered]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;

    if (ringRef.current) {
      if (isHovered) {
        const scale = 1 + Math.sin(time * 4) * 0.1;
        ringRef.current.scale.setScalar(scale);
        ringRef.current.rotation.z = time * 0.5;
        ringRef.current.visible = true;
      } else {
        ringRef.current.visible = false;
      }
    }

    if (glowRef.current) {
      if (isHovered || isClicked) {
        const intensity = isClicked ? 1.5 : isHovered ? 0.8 : 0;
        const material = glowRef.current.material as THREE.MeshBasicMaterial;
        // keep opacity in safe bounds
        material.opacity = Math.max(0, Math.min(1.5, intensity * (0.5 + Math.sin(time * 3) * 0.2)));
        glowRef.current.visible = true;
      } else {
        glowRef.current.visible = false;
      }
    }
  });

  return (
    <group position={position}>
      {/* Hover ring */}
      <mesh ref={ringRef} visible={false}>
        <ringGeometry args={[1.5, 2, 16]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Glow effect */}
      <mesh ref={glowRef} visible={false}>
        <sphereGeometry args={[2.5, 16, 16]} />
        <meshBasicMaterial
          color={type === 'click' ? '#ff0080' : '#00ffff'}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Click particle burst */}
      <ParticleBurst position={[0, 0, 0]} trigger={clickBurst} onComplete={() => setClickBurst(false)} />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/* --------------------------- ProximityFeedback ---------------------------- */
/* -------------------------------------------------------------------------- */

interface ProximityFeedbackProps {
  playerPosition: [number, number, number];
  targetPosition: [number, number, number];
  maxDistance?: number;
  onEnterRange?: () => void;
  onExitRange?: () => void;
}

export function ProximityFeedback({
  playerPosition,
  targetPosition,
  maxDistance = 5,
  onEnterRange,
  onExitRange,
}: ProximityFeedbackProps) {
  const [inRange, setInRange] = useState(false);
  const [distance, setDistance] = useState<number>(maxDistance);
  const indicatorRef = useRef<THREE.Mesh | null>(null);

  // keep last values in refs to avoid frequent setState calls
  const lastInRangeRef = useRef<boolean>(inRange);
  const lastDistanceRef = useRef<number>(distance);

  useFrame(() => {
    const playerPos = new THREE.Vector3(...playerPosition);
    const targetPos = new THREE.Vector3(...targetPosition);
    const currentDistance = playerPos.distanceTo(targetPos);

    // Update distance only when it changes meaningfully (threshold)
    if (Math.abs(currentDistance - lastDistanceRef.current) > 0.01) {
      lastDistanceRef.current = currentDistance;
      setDistance(currentDistance);
    }

    const nowInRange = currentDistance <= maxDistance;
    if (nowInRange !== lastInRangeRef.current) {
      lastInRangeRef.current = nowInRange;
      setInRange(nowInRange);
      if (nowInRange) onEnterRange?.();
      else onExitRange?.();
    }

    // Visual indicator update (no React state to avoid re-renders)
    if (indicatorRef.current && nowInRange) {
      const intensity = 1 - currentDistance / maxDistance;
      const mat = indicatorRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, Math.min(1, intensity * 0.8));

      const scale = 1 + Math.sin(Date.now() * 0.005) * 0.2 * intensity;
      indicatorRef.current.scale.setScalar(scale);
    }
  });

  if (!inRange) return null;

  return (
    <mesh ref={indicatorRef} position={[targetPosition[0], targetPosition[1] + 3, targetPosition[2]]}>
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshBasicMaterial color="#00ff80" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/* -------------------------------------------------------------------------- */
/* -------------------------------- UIFeedback ------------------------------- */
/* -------------------------------------------------------------------------- */

interface UIFeedbackProps {
  children: React.ReactNode;
  onHover?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

export function UIFeedback({ children, onHover, onClick, disabled = false }: UIFeedbackProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, newRipple]);

    // remove ripple after animation
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    // Haptic feedback guarded
    try {
      if ('vibrate' in navigator) {
        (navigator as Navigator & { vibrate: (pattern: number | number[]) => boolean }).vibrate(30);
      }
    } catch {
      // ignore
    }

    onClick?.();
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isHovered && !disabled ? 'transform scale-105' : ''} ${isPressed && !disabled ? 'transform scale-95' : ''}`}
      onMouseEnter={() => {
        if (!disabled) {
          setIsHovered(true);
          onHover?.();
        }
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => !disabled && setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={handleClick}
    >
      {children}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        >
          <div className="w-full h-full bg-cyan-400/30 rounded-full animate-ping" />
        </div>
      ))}

      {/* Hover glow */}
      {isHovered && !disabled && <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-purple-400/10 pointer-events-none" />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ---------------------------- Audio feedback (placeholder) ----------------- */
/* -------------------------------------------------------------------------- */

export const audioFeedback = {
  playHoverSound: () => {
    // Implement integration with global audio manager
  },

  playClickSound: () => {
    // Implement integration with global audio manager
  },

  playSuccessSound: () => {
    // Implement integration with global audio manager
  },

  playErrorSound: () => {
    // Implement integration with global audio manager
  },
};

/* -------------------------------------------------------------------------- */
/* ---------------------------- Reduced motion hook ------------------------- */
/* -------------------------------------------------------------------------- */

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && 'matchMedia' in window) {
        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        return mq.matches;
      }
      return deviceCapabilities?.prefersReducedMotion?.() ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = () => setPrefersReducedMotion(mq.matches);

    // modern API
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handleChange);
    } else if (typeof (mq as MediaQueryList & { addListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void }).addListener === 'function') {
      // fallback
      (mq as MediaQueryList & { addListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void }).addListener(handleChange);
    }

    return () => {
      if (typeof mq.removeEventListener === 'function') {
        mq.removeEventListener('change', handleChange);
      } else if (typeof (mq as MediaQueryList & { removeListener?: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void }).removeListener === 'function') {
        (mq as MediaQueryList & { removeListener: (listener: (this: MediaQueryList, ev: MediaQueryListEvent) => void) => void }).removeListener(handleChange);
      }
    };
  }, []);

  return prefersReducedMotion;
}
