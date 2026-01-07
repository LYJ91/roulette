import type { Student } from '../types';

/**
 * Fisher-Yates shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Select random winners from a list of students
 */
export function selectRandomWinners(students: Student[], count: number): Student[] {
  if (students.length === 0) return [];
  if (students.length <= count) return [...students];
  
  const shuffled = shuffleArray(students);
  return shuffled.slice(0, count);
}

/**
 * Generate a random position within bounds
 */
export function randomPosition(maxX: number, maxY: number) {
  return {
    x: Math.random() * maxX,
    y: Math.random() * maxY,
  };
}

/**
 * Generate random velocity
 */
export function randomVelocity(maxSpeed: number = 5) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * maxSpeed + 1;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

/**
 * Delay utility for animations
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random color in HSL format
 */
export function randomHSLColor(saturation: number = 70, lightness: number = 60): string {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Predefined neon colors for the lottery balls
 */
export const NEON_COLORS = [
  '#ff006e', // Pink
  '#8338ec', // Purple
  '#3a86ff', // Blue
  '#06d6a0', // Teal
  '#ffbe0b', // Yellow
  '#fb5607', // Orange
  '#00f5d4', // Cyan
  '#9b5de5', // Lavender
  '#f15bb5', // Magenta
  '#00bbf9', // Light Blue
];

export function getRandomNeonColor(): string {
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
}
