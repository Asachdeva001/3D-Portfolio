import * as THREE from "three";

// Random utility functions
export const random = {
  range: (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  },

  choice: <T>(array: T[]): T => {
    return array[Math.floor(Math.random() * array.length)];
  },

  boolean: (probability: number = 0.5): boolean => {
    return Math.random() < probability;
  },

  gaussian: (mean: number = 0, stdDev: number = 1): number => {
    let u = 0,
      v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return (
      mean +
      stdDev * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
    );
  },
};

// Geometry utility functions
export const geometry = {
  createRoundedBox: (
    width: number,
    height: number,
    depth: number,
    radius: number = 0.1
  ): THREE.BufferGeometry => {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    const w = width;
    const h = height;

    shape.moveTo(x, y + radius);
    shape.lineTo(x, y + h - radius);
    shape.quadraticCurveTo(x, y + h, x + radius, y + h);
    shape.lineTo(x + w - radius, y + h);
    shape.quadraticCurveTo(x + w, y + h, x + w, y + h - radius);
    shape.lineTo(x + w, y + radius);
    shape.quadraticCurveTo(x + w, y, x + w - radius, y);
    shape.lineTo(x + radius, y);
    shape.quadraticCurveTo(x, y, x, y + radius);

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: radius * 0.1,
      bevelThickness: radius * 0.1,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  },

  createHexagon: (radius: number): THREE.BufferGeometry => {
    const shape = new THREE.Shape();
    const sides = 6;

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      if (i === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    }
    shape.closePath();

    return new THREE.ShapeGeometry(shape);
  },

  createCylinderWithHoles: (
    radiusTop: number,
    radiusBottom: number,
    height: number,
    radialSegments: number = 8
  ): THREE.BufferGeometry => {
    const geometry = new THREE.CylinderGeometry(
      radiusTop,
      radiusBottom,
      height,
      radialSegments
    );
    return geometry;
  },

  spiralPath: (
    radius: number,
    height: number,
    turns: number
  ): THREE.Curve<THREE.Vector3> => {
    return {
      getPoint(t: number, target = new THREE.Vector3()) {
        const angle = t * Math.PI * 2 * turns;
        const y = t * height;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return target.set(x, y, z);
      },
    } as THREE.Curve<THREE.Vector3>;
  },
};

// Math utility functions
export const math = {
  lerp: (a: number, b: number, t: number): number => {
    return a + (b - a) * t;
  },

  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  smoothstep: (edge0: number, edge1: number, x: number): number => {
    const t = math.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
    return t * t * (3.0 - 2.0 * t);
  },

  map: (
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number => {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  },

  distance2D: (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  },

  distance3D: (pos1: THREE.Vector3, pos2: THREE.Vector3): number => {
    return pos1.distanceTo(pos2);
  },

  angleBetween: (v1: THREE.Vector3, v2: THREE.Vector3): number => {
    return v1.angleTo(v2);
  },
};

// Vector utilities
export const vector = {
  create: (x: number = 0, y: number = 0, z: number = 0): THREE.Vector3 => {
    return new THREE.Vector3(x, y, z);
  },

  random: (min: number = -1, max: number = 1): THREE.Vector3 => {
    return new THREE.Vector3(
      random.range(min, max),
      random.range(min, max),
      random.range(min, max)
    );
  },

  randomOnSphere: (radius: number = 1): THREE.Vector3 => {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);

    return new THREE.Vector3(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );
  },

  randomInCircle: (radius: number = 1): THREE.Vector3 => {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * radius;

    return new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r);
  },
};

// Color utilities
export const color = {
  lerp: (color1: THREE.Color, color2: THREE.Color, t: number): THREE.Color => {
    const result = new THREE.Color();
    result.lerpColors(color1, color2, t);
    return result;
  },

  random: (): THREE.Color => {
    return new THREE.Color(Math.random(), Math.random(), Math.random());
  },

  fromHex: (hex: string): THREE.Color => {
    return new THREE.Color(hex);
  },

  cyberpunkPalette: {
    neonPink: new THREE.Color("#ff0080"),
    neonCyan: new THREE.Color("#00ffff"),
    neonOrange: new THREE.Color("#ff8000"),
    neonPurple: new THREE.Color("#8000ff"),
    neonGreen: new THREE.Color("#00ff80"),
    darkBlue: new THREE.Color("#0a0a2a"),
    darkPurple: new THREE.Color("#2a0a2a"),
    darkGray: new THREE.Color("#1a1a1a"),
  },
};

const MathUtils = {
  random,
  geometry,
  math,
  vector,
  color,
};

export default MathUtils;
