export type PixelColor = string | null; // Hex code or null for transparent/empty

export type PixelGrid = PixelColor[][];

export interface ArtMatrix {
  name: string;
  width: number;
  height: number;
  grid: PixelGrid;
}

export interface WallConfig {
  dropSpeed: number; // Pixels per frame approx
  spawnRate: number; // Pixels spawned per frame
  pauseDuration: number; // ms to wait after completion
  pixelSize: number; // Target pixel size (will be scaled)
}

export interface Particle {
  x: number; // Grid X
  y: number; // Current visual Y (float)
  targetY: number; // Target Grid Y
  color: string;
  velocity: number;
  landed: boolean;
}