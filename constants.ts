import { ArtMatrix } from './types';

// Helper to create a simple heart
const createHeart = (): ArtMatrix => {
  const width = 11;
  const height = 10;
  const grid = Array(height).fill(null).map(() => Array(width).fill(null));
  
  const R = '#ef4444'; // Red
  const pattern = [
    [0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  ];

  pattern.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) grid[y][x] = R;
    });
  });

  return { name: 'Heart', width, height, grid };
};

// Helper to create a ghost (Pacman style)
const createGhost = (): ArtMatrix => {
  const width = 14;
  const height = 14;
  const grid = Array(height).fill(null).map(() => Array(width).fill(null));
  const C = '#3b82f6'; // Blue
  const W = '#ffffff';
  
  // Simple mapping for visual design
  // 1 = body, 2 = eye white, 3 = pupil
  const pattern = [
    [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 2, 2, 3, 2, 1, 1, 2, 2, 3, 2, 1, 1],
    [1, 1, 2, 2, 3, 2, 1, 1, 2, 2, 3, 2, 1, 1],
    [1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  ];

  pattern.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell === 1) grid[y][x] = C;
      if (cell === 2) grid[y][x] = W;
      if (cell === 3) grid[y][x] = '#000000';
    });
  });

  return { name: 'Ghost', width, height, grid };
};

export const SAMPLE_ART: ArtMatrix[] = [
  createHeart(),
  createGhost(),
];