"use client";

import React, {
  useRef,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useSceneStore } from "@/store/sceneStore";

/**
 * Public audio context shape consumed by components
 */
interface AudioContextType {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  isMuted: boolean;
  setMasterVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  playSound: (soundId: string, options?: PlaySoundOptions) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}

interface PlaySoundOptions {
  volume?: number;
  loop?: boolean;
  position?: [number, number, number];
  maxDistance?: number;
  rolloffFactor?: number;
}

/**
 * Low-level audio manager (wraps Web Audio API)
 */
class AudioManager {
  private audioContext: globalThis.AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private activeSources: Map<string, AudioBufferSourceNode[]> = new Map();

  async initialize(): Promise<boolean> {
    try {
      if (typeof window === "undefined") {
        return false;
      }

      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;

      if (!AudioContextClass) {
        throw new Error("Web Audio API not supported");
      }

      this.audioContext = new AudioContextClass();

      // Gain nodes
      this.masterGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();

      // Default levels
      this.masterGain.gain.value = 1.0;
      this.sfxGain.gain.value = 0.8;
      this.musicGain.gain.value = 0.6;

      // Routing
      this.sfxGain.connect(this.masterGain);
      this.musicGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      return true;
    } catch (error) {
      console.error("Audio system initialization failed:", error);
      return false;
    }
  }

  async loadSound(id: string, url: string): Promise<boolean> {
    if (!this.audioContext) return false;
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // modern decodeAudioData can return a promise or use callbacks depending on TS DOM lib,
      // but awaiting is safe in browsers that support it.
      const audioBuffer = await this.audioContext.decodeAudioData(
        arrayBuffer.slice(0)
      );
      this.sounds.set(id, audioBuffer);
      return true;
    } catch (error) {
      console.warn(`Failed to load sound ${id}:`, error);
      return false;
    }
  }

  playSound(
    id: string,
    options: PlaySoundOptions = {}
  ): AudioBufferSourceNode | null {
    if (!this.audioContext || !this.sounds.has(id)) return null;

    const buffer = this.sounds.get(id)!;
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume ?? 1.0;

    // connect source -> gain -> sfxGain (or master, if sfxGain missing)
    source.connect(gainNode);
    if (this.sfxGain) {
      gainNode.connect(this.sfxGain);
    } else if (this.masterGain) {
      gainNode.connect(this.masterGain);
    } else {
      gainNode.connect(this.audioContext.destination);
    }

    source.loop = options.loop ?? false;

    // 3D positioning using PannerNode if position provided
    if (options.position && this.audioContext) {
      try {
        const panner = this.audioContext.createPanner();
        // Recommended modern properties (some browsers still use older API)
        panner.panningModel = "HRTF";
        panner.distanceModel = "inverse";
        panner.refDistance = 1;
        panner.maxDistance = options.maxDistance ?? 50;
        panner.rolloffFactor = options.rolloffFactor ?? 1;

        // set position (use AudioParam if available)
        if ("positionX" in panner) {
          (panner as any).positionX.value = options.position[0];
          (panner as any).positionY.value = options.position[1];
          (panner as any).positionZ.value = options.position[2];
        } else if ((panner as any).setPosition) {
          // fallback
          (panner as any).setPosition(
            options.position[0],
            options.position[1],
            options.position[2]
          );
        }

        // re-route: gain -> panner -> sfxGain
        gainNode.disconnect();
        if (this.sfxGain) {
          gainNode.connect(panner);
          panner.connect(this.sfxGain);
        } else if (this.masterGain) {
          gainNode.connect(panner);
          panner.connect(this.masterGain);
        } else {
          gainNode.connect(panner);
          panner.connect(this.audioContext.destination);
        }
      } catch (error) {
        // If PannerNode creation fails, fall back to non-positional playback
        console.warn("Positional audio disabled due to error:", error);
      }
    }

    // track active sources
    if (!this.activeSources.has(id)) {
      this.activeSources.set(id, []);
    }
    this.activeSources.get(id)!.push(source);

    source.onended = () => {
      const sources = this.activeSources.get(id);
      if (sources) {
        const idx = sources.indexOf(source);
        if (idx > -1) sources.splice(idx, 1);
      }
    };

    source.start();
    return source;
  }

  stopSound(id: string) {
    const sources = this.activeSources.get(id);
    if (sources) {
      sources.forEach((src) => {
        try {
          src.stop();
        } catch {
          // ignore already-stopped
        }
      });
      this.activeSources.set(id, []);
    }
  }

  setMasterVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setSfxVolume(volume: number) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setMusicVolume(volume: number) {
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Update the Web Audio listener position & orientation from a camera transform.
   * Uses AudioListener's positionX/Y/Z and forward/up orientation (if available).
   */
  updateListenerPosition(
    position: THREE.Vector3,
    forward: THREE.Vector3,
    up: THREE.Vector3
  ) {
    if (!this.audioContext) return;

    const listener = this.audioContext.listener;
    try {
      if ("positionX" in listener) {
        // modern AudioListener param interface
        (listener as any).positionX.value = position.x;
        (listener as any).positionY.value = position.y;
        (listener as any).positionZ.value = position.z;

        (listener as any).forwardX.value = forward.x;
        (listener as any).forwardY.value = forward.y;
        (listener as any).forwardZ.value = forward.z;

        (listener as any).upX.value = up.x;
        (listener as any).upY.value = up.y;
        (listener as any).upZ.value = up.z;
      } else if (
        (listener as any).setPosition &&
        (listener as any).setOrientation
      ) {
        // older API fallback
        (listener as any).setPosition(position.x, position.y, position.z);
        (listener as any).setOrientation(
          forward.x,
          forward.y,
          forward.z,
          up.x,
          up.y,
          up.z
        );
      }
    } catch (error) {
      // Non-fatal: some browsers may limit direct writes
      // console.warn('Could not update audio listener:', error);
    }
  }

  async suspend() {
    if (this.audioContext && this.audioContext.state === "running") {
      try {
        await this.audioContext.suspend();
      } catch {
        // ignore
      }
    }
  }

  async resume() {
    if (this.audioContext && this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch {
        // ignore
      }
    }
  }
}

// single global manager
const audioManager = new AudioManager();

/**
 * AudioProvider - exposes high-level control via React Context
 */
interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [masterVolume, setMasterVolumeState] = useState<number>(0.7);
  const [sfxVolume, setSfxVolumeState] = useState<number>(0.8);
  const [musicVolume, setMusicVolumeState] = useState<number>(0.6);
  const [isMuted, setMuted] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Defer initialization until first user interaction (autoplay policy)
    let mounted = true;

    const initializeAudio = async () => {
      const success = await audioManager.initialize();
      if (!mounted) return;
      if (success) {
        setIsInitialized(true);
        // Optionally preload sounds here:
        // await audioManager.loadSound('hover','/sounds/hover.mp3');
      }
    };

    const handleFirstInteraction = () => {
      // only initialize once
      initializeAudio();
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction);
    document.addEventListener("keydown", handleFirstInteraction);

    return () => {
      mounted = false;
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

  const setMasterVolume = (volume: number) => {
    setMasterVolumeState(volume);
    audioManager.setMasterVolume(isMuted ? 0 : volume);
  };

  const setSfxVolume = (volume: number) => {
    setSfxVolumeState(volume);
    audioManager.setSfxVolume(volume);
  };

  const setMusicVolume = (volume: number) => {
    setMusicVolumeState(volume);
    audioManager.setMusicVolume(volume);
  };

  const handleSetMuted = (muted: boolean) => {
    setMuted(muted);
    audioManager.setMasterVolume(muted ? 0 : masterVolume);

    if (muted) {
      void audioManager.suspend();
    } else {
      void audioManager.resume();
    }
  };

  const playSound = (soundId: string, options?: PlaySoundOptions) => {
    if (isInitialized && !isMuted) {
      audioManager.playSound(soundId, options);
    }
  };

  const contextValue: AudioContextType = {
    masterVolume,
    sfxVolume,
    musicVolume,
    isMuted,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setMuted: handleSetMuted,
    playSound,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

/**
 * AudioListener component — updates the Web Audio listener from the Three.js camera
 */
export function AudioListener() {
  const { camera } = useThree();
  const { performance } = useSceneStore();

  useFrame(() => {
    if (!camera || performance.quality === "low") return;

    const position = camera.position;
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(
      camera.quaternion
    );
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);

    audioManager.updateListenerPosition(position, forward, up);
  });

  return null;
}

/**
 * AmbientSound — loops an ambient sound (simplified)
 */
interface AmbientSoundProps {
  soundId: string;
  volume?: number;
  fadeIn?: boolean;
}

export function AmbientSound({
  soundId,
  volume = 0.5,
  fadeIn = true,
}: AmbientSoundProps) {
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // We call audioManager directly so AmbientSound can work even if not consuming context,
    // but you could also call playSound from useAudio() if preferred.
    if (!isPlaying) {
      sourceRef.current = audioManager.playSound(soundId, {
        volume: fadeIn ? 0 : volume,
        loop: true,
      });

      // A proper fade-in would ramp the gain node over time. This sample is a placeholder.
      if (sourceRef.current && fadeIn) {
        // TODO: implement gain ramp on the specific source's gain node, if exposed
      }
      setIsPlaying(true);
    }

    return () => {
      if (sourceRef.current) {
        try {
          sourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsPlaying(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [soundId, volume, fadeIn]);

  return null;
}

/**
 * PositionalSound — attaches a looping positional sound to a location
 */
interface PositionalSoundProps {
  soundId: string;
  position: [number, number, number];
  volume?: number;
  maxDistance?: number;
  autoPlay?: boolean;
}

export function PositionalSound({
  soundId,
  position,
  volume = 1.0,
  maxDistance = 50,
  autoPlay = false,
}: PositionalSoundProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (autoPlay) {
      audioManager.playSound(soundId, {
        volume,
        position,
        maxDistance,
        loop: true,
      });
      // Use a timeout to avoid setState in effect
      const timer = setTimeout(() => setIsPlaying(true), 0);
      
      return () => {
        clearTimeout(timer);
        audioManager.stopSound(soundId);
        setIsPlaying(false);
      };
    }
  }, [autoPlay, soundId, position, volume, maxDistance]);

  // Separate effect for cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (isPlaying) {
        audioManager.stopSound(soundId);
      }
    };
  }, [isPlaying, soundId]);

  // Invisible mesh so this component can be placed inside a R3F scene graph
  return (
    <mesh position={position as any} visible={false}>
      <sphereGeometry args={[0.1]} />
    </mesh>
  );
}

/**
 * AudioControls — small UI for adjusting volumes
 */
export function AudioControls() {
  const {
    masterVolume,
    sfxVolume,
    musicVolume,
    isMuted,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,
    setMuted,
  } = useAudio();

  return (
    <div className="fixed bottom-4 right-4 bg-black/70 border border-cyan-400 rounded-lg p-4 backdrop-blur-sm">
      <div className="text-cyan-400 font-mono text-sm space-y-3">
        <div className="flex items-center justify-between">
          <span>AUDIO</span>
          <button
            onClick={() => setMuted(!isMuted)}
            className={`px-2 py-1 rounded text-xs ${
              isMuted
                ? "bg-red-600/20 text-red-400"
                : "bg-green-600/20 text-green-400"
            }`}
          >
            {isMuted ? "MUTED" : "ON"}
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <label className="block text-xs mb-1">
              Master: {Math.round(masterVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">
              SFX: {Math.round(sfxVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs mb-1">
              Music: {Math.round(musicVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Export everything and provide a default object similar to your original pattern
const AudioSystem = {
  AudioProvider,
  AudioListener,
  AmbientSound,
  PositionalSound,
  AudioControls,
  useAudio,
};

export default AudioSystem;
