import { create } from 'zustand';

interface PlayerState {
  position: [number, number, number];
  rotation: [number, number, number];
  velocity: [number, number, number];
  isMoving: boolean;
  isJumping: boolean;
  cameraMode: 'first-person' | 'third-person';
}

interface PerformanceState {
  fps: number;
  quality: 'high' | 'medium' | 'low';
  autoQuality: boolean;
}

interface UIState {
  showHUD: boolean;
  showMenu: boolean;
  showLoading: boolean;
  loadingProgress: number;
  activeHologram: string | null;
  pointerLocked: boolean;
}

interface SceneState {
  // Player state
  player: PlayerState;
  setPlayerPosition: (position: [number, number, number]) => void;
  setPlayerRotation: (rotation: [number, number, number]) => void;
  setPlayerVelocity: (velocity: [number, number, number]) => void;
  setPlayerMoving: (isMoving: boolean) => void;
  setPlayerJumping: (isJumping: boolean) => void;
  setCameraMode: (mode: 'first-person' | 'third-person') => void;

  // Performance state
  performance: PerformanceState;
  setFPS: (fps: number) => void;
  setQuality: (quality: 'high' | 'medium' | 'low') => void;
  setAutoQuality: (auto: boolean) => void;

  // UI state
  ui: UIState;
  setShowHUD: (show: boolean) => void;
  setShowMenu: (show: boolean) => void;
  setShowLoading: (show: boolean) => void;
  setLoadingProgress: (progress: number) => void;
  setActiveHologram: (id: string | null) => void;
  setPointerLocked: (locked: boolean) => void;

  // Actions
  resetPlayer: () => void;
  toggleMenu: () => void;
  toggleHUD: () => void;
}

const initialPlayerState: PlayerState = {
  position: [0, 2, 10],
  rotation: [0, 0, 0],
  velocity: [0, 0, 0],
  isMoving: false,
  isJumping: false,
  cameraMode: 'first-person'
};

const initialPerformanceState: PerformanceState = {
  fps: 60,
  quality: 'high',
  autoQuality: true
};

const initialUIState: UIState = {
  showHUD: true,
  showMenu: false,
  showLoading: true,
  loadingProgress: 0,
  activeHologram: null,
  pointerLocked: false
};

export const useSceneStore = create<SceneState>((set, get) => ({
  // Initial state
  player: initialPlayerState,
  performance: initialPerformanceState,
  ui: initialUIState,

  // Player actions
  setPlayerPosition: (position) =>
    set((state) => ({
      player: { ...state.player, position }
    })),

  setPlayerRotation: (rotation) =>
    set((state) => ({
      player: { ...state.player, rotation }
    })),

  setPlayerVelocity: (velocity) =>
    set((state) => ({
      player: { ...state.player, velocity }
    })),

  setPlayerMoving: (isMoving) =>
    set((state) => ({
      player: { ...state.player, isMoving }
    })),

  setPlayerJumping: (isJumping) =>
    set((state) => ({
      player: { ...state.player, isJumping }
    })),

  setCameraMode: (cameraMode) =>
    set((state) => ({
      player: { ...state.player, cameraMode }
    })),

  // Performance actions
  setFPS: (fps) =>
    set((state) => {
      const newState = {
        performance: { ...state.performance, fps }
      };

      // Auto quality adjustment
      if (state.performance.autoQuality) {
        if (fps < 30 && state.performance.quality === 'high') {
          newState.performance.quality = 'medium';
        } else if (fps < 20 && state.performance.quality === 'medium') {
          newState.performance.quality = 'low';
        } else if (fps > 50 && state.performance.quality === 'medium') {
          newState.performance.quality = 'high';
        } else if (fps > 40 && state.performance.quality === 'low') {
          newState.performance.quality = 'medium';
        }
      }

      return newState;
    }),

  setQuality: (quality) =>
    set((state) => ({
      performance: { ...state.performance, quality }
    })),

  setAutoQuality: (autoQuality) =>
    set((state) => ({
      performance: { ...state.performance, autoQuality }
    })),

  // UI actions
  setShowHUD: (showHUD) =>
    set((state) => ({
      ui: { ...state.ui, showHUD }
    })),

  setShowMenu: (showMenu) =>
    set((state) => ({
      ui: { ...state.ui, showMenu }
    })),

  setShowLoading: (showLoading) =>
    set((state) => ({
      ui: { ...state.ui, showLoading }
    })),

  setLoadingProgress: (loadingProgress) =>
    set((state) => ({
      ui: { ...state.ui, loadingProgress }
    })),

  setActiveHologram: (activeHologram) =>
    set((state) => ({
      ui: { ...state.ui, activeHologram }
    })),

  setPointerLocked: (pointerLocked) =>
    set((state) => ({
      ui: { ...state.ui, pointerLocked }
    })),

  // Utility actions
  resetPlayer: () =>
    set((state) => ({
      player: initialPlayerState
    })),

  toggleMenu: () =>
    set((state) => ({
      ui: { ...state.ui, showMenu: !state.ui.showMenu }
    })),

  toggleHUD: () =>
    set((state) => ({
      ui: { ...state.ui, showHUD: !state.ui.showHUD }
    }))
}));

export default useSceneStore;