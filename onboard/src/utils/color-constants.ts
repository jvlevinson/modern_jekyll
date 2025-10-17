/**
 * =============================================================================
 * Color Constants
 * =============================================================================
 * Tokenized configuration for color system
 * =============================================================================
 */

import type { ColorPreset } from '../types/color.types.js';

/**
 * Color system configuration
 */
export const COLOR_CONSTANTS = {
  /**
   * Gradient visualization
   */
  GRADIENT_STEPS: 9,
  GRADIENT_LIGHTNESS_MIN: 20,
  GRADIENT_LIGHTNESS_MAX: 95,

  /**
   * Shade matrix (TailwindCSS-compatible)
   */
  SHADE_SCALE: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const,
  SHADE_LIGHTNESS_MAP: {
    50: 0.97,
    100: 0.93,
    200: 0.85,
    300: 0.73,
    400: 0.60,
    500: 0.50,
    600: 0.42,
    700: 0.35,
    800: 0.28,
    900: 0.22,
    950: 0.15,
  } as const,

  /**
   * Color harmonies
   */
  HARMONY_ANGLES: {
    COMPLEMENTARY: 180,
    TRIADIC: 120,
    ANALOGOUS: 30,
  } as const,

  /**
   * OKLCH bounds
   */
  LIGHTNESS_RANGE: { MIN: 0.15, MAX: 0.95 } as const,
  CHROMA_RANGE: { MIN: 0, MAX: 0.37 } as const,
  HUE_RANGE: { MIN: 0, MAX: 360 } as const,

  /**
   * Color card dimensions
   */
  COLOR_CARD_HEIGHT: '120px',
  COLOR_GRADIENT_HEIGHT: '40px',
  SHADE_CELL_SIZE: '48px',
  HARMONY_CIRCLE_SIZE: '64px',
} as const;

/**
 * Quick color presets
 */
export const COLOR_PRESETS: ColorPreset[] = [
  // Vibrant
  { name: 'Electric Blue', color: { l: 0.55, c: 0.25, h: 250 }, hex: '#0066ff', category: 'vibrant' },
  { name: 'Vivid Red', color: { l: 0.55, c: 0.25, h: 25 }, hex: '#ff3333', category: 'vibrant' },
  { name: 'Bright Green', color: { l: 0.60, c: 0.22, h: 145 }, hex: '#00cc66', category: 'vibrant' },
  { name: 'Purple', color: { l: 0.50, c: 0.24, h: 300 }, hex: '#9933ff', category: 'vibrant' },
  { name: 'Orange', color: { l: 0.65, c: 0.20, h: 50 }, hex: '#ff8800', category: 'vibrant' },
  { name: 'Cyan', color: { l: 0.65, c: 0.18, h: 200 }, hex: '#00ccff', category: 'vibrant' },

  // Pastel
  { name: 'Soft Pink', color: { l: 0.80, c: 0.12, h: 15 }, hex: '#ffccdd', category: 'pastel' },
  { name: 'Mint', color: { l: 0.85, c: 0.10, h: 150 }, hex: '#ccffee', category: 'pastel' },
  { name: 'Lavender', color: { l: 0.75, c: 0.12, h: 290 }, hex: '#ddccff', category: 'pastel' },
  { name: 'Peach', color: { l: 0.80, c: 0.11, h: 40 }, hex: '#ffeedd', category: 'pastel' },

  // Neutral
  { name: 'Slate', color: { l: 0.50, c: 0.02, h: 250 }, hex: '#708090', category: 'neutral' },
  { name: 'Stone', color: { l: 0.55, c: 0.03, h: 60 }, hex: '#8b8680', category: 'neutral' },
  { name: 'Zinc', color: { l: 0.50, c: 0.01, h: 0 }, hex: '#7f7f7f', category: 'neutral' },

  // Dark
  { name: 'Navy', color: { l: 0.25, c: 0.15, h: 260 }, hex: '#001f3f', category: 'dark' },
  { name: 'Forest', color: { l: 0.30, c: 0.12, h: 140 }, hex: '#0d4d2d', category: 'dark' },
  { name: 'Burgundy', color: { l: 0.30, c: 0.18, h: 20 }, hex: '#660033', category: 'dark' },
];
