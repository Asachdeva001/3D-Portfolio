export interface CityConfig {
  city: {
    size: number;
    width: number;
    depth: number;
  };
  buildings: {
    count: number;
    minHeight: number;
    maxHeight: number;
    spacing: number;
    neonColors: string[];
    gridSize: { width: number; depth: number };
  };
  lighting: {
    ambientIntensity: number;
    neonIntensity: number;
    fogColor: string;
    fogDensity: number;
    fogNear: number;
    fogFar: number;
  };
  physics: {
    gravity: number;
    playerSpeed: number;
    jumpHeight: number;
    mouseSensitivity: number;
  };
  performance: {
    maxDrawDistance: number;
    lodDistances: number[];
    maxParticles: number;
  };
  cars: {
    count: number;
    speed: { min: number; max: number };
    height: { min: number; max: number };
    colors: string[];
  };
}

export const cityConfig: CityConfig = {
  city: {
    size: 200,
    width: 200,
    depth: 200
  },
  buildings: {
    count: 60,
    minHeight: 15,
    maxHeight: 80,
    spacing: 12,
    neonColors: [
      '#ff0080', // Hot pink
      '#00ffff', // Cyan
      '#ff8000', // Orange
      '#8000ff', // Purple
      '#00ff80', // Green
      '#ff0040', // Red
      '#0080ff', // Blue
      '#ffff00'  // Yellow
    ],
    gridSize: { width: 100, depth: 100 }
  },
  lighting: {
    ambientIntensity: 0.15,
    neonIntensity: 2.5,
    fogColor: '#0a0a1a',
    fogDensity: 0.008,
    fogNear: 10,
    fogFar: 200
  },
  physics: {
    gravity: -9.81,
    playerSpeed: 8,
    jumpHeight: 4,
    mouseSensitivity: 0.002
  },
  performance: {
    maxDrawDistance: 150,
    lodDistances: [30, 60, 100],
    maxParticles: 500
  },
  cars: {
    count: 15,
    speed: { min: 2, max: 8 },
    height: { min: 8, max: 25 },
    colors: ['#ff0080', '#00ffff', '#ff8000', '#8000ff']
  }
};

export default cityConfig;