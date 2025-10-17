/**
 * =============================================================================
 * Color Theory Utilities
 * =============================================================================
 * Pure functions for color calculations (harmonies, shades, gradients)
 * =============================================================================
 */

import type { OklchColor, ColorHarmony, HarmonyType, ShadeScale } from '../types/color.types.js';
import { COLOR_CONSTANTS } from './color-constants.js';
import { clampOklch } from './color-convert.js';
import { oklchToHex } from './hex-converter.js';

/**
 * Generate color harmony (complementary, triadic, analogous)
 */
export function generateHarmony(baseColor: OklchColor, type: HarmonyType): ColorHarmony {
  const { l, c, h } = baseColor;
  const angle = COLOR_CONSTANTS.HARMONY_ANGLES[type.toUpperCase() as keyof typeof COLOR_CONSTANTS.HARMONY_ANGLES];

  let colors: OklchColor[];
  let names: string[];

  switch (type) {
    case 'complementary':
      colors = [
        baseColor,
        clampOklch({ l, c, h: (h + angle) % 360 }),
      ];
      names = ['Base', 'Complement'];
      break;

    case 'triadic':
      colors = [
        baseColor,
        clampOklch({ l, c, h: (h + angle) % 360 }),
        clampOklch({ l, c, h: (h + angle * 2) % 360 }),
      ];
      names = ['Base', 'Triadic 1', 'Triadic 2'];
      break;

    case 'analogous':
      colors = [
        clampOklch({ l, c, h: (h - angle + 360) % 360 }),
        baseColor,
        clampOklch({ l, c, h: (h + angle) % 360 }),
      ];
      names = ['Analogous -30°', 'Base', 'Analogous +30°'];
      break;
  }

  return { type, colors, names };
}

/**
 * Generate shade scale (TailwindCSS-style: 50, 100, 200...950)
 */
export function generateShadeScale(baseColor: OklchColor): ShadeScale[] {
  const { c, h } = baseColor;
  const { SHADE_SCALE, SHADE_LIGHTNESS_MAP } = COLOR_CONSTANTS;

  return SHADE_SCALE.map((weight) => {
    const lightness = SHADE_LIGHTNESS_MAP[weight] * 100;
    const color = clampOklch({ l: lightness, c, h });

    return {
      weight,
      color,
      hex: oklchToHex(color),
    };
  });
}

/**
 * Generate gradient steps (light to dark)
 */
export function generateGradient(baseColor: OklchColor, steps: number = COLOR_CONSTANTS.GRADIENT_STEPS): OklchColor[] {
  const { c, h } = baseColor;
  const { GRADIENT_LIGHTNESS_MIN, GRADIENT_LIGHTNESS_MAX } = COLOR_CONSTANTS;

  const gradient: OklchColor[] = [];
  const step = (GRADIENT_LIGHTNESS_MAX - GRADIENT_LIGHTNESS_MIN) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const l = GRADIENT_LIGHTNESS_MAX - step * i;
    gradient.push(clampOklch({ l, c, h }));
  }

  return gradient;
}

/**
 * Adjust color lightness (for hover states, etc.)
 */
export function adjustLightness(color: OklchColor, delta: number): OklchColor {
  return clampOklch({
    l: color.l + delta,
    c: color.c,
    h: color.h,
  });
}

/**
 * Adjust color chroma (saturation)
 */
export function adjustChroma(color: OklchColor, delta: number): OklchColor {
  return clampOklch({
    l: color.l,
    c: color.c + delta,
    h: color.h,
  });
}

/**
 * Rotate hue
 */
export function rotateHue(color: OklchColor, degrees: number): OklchColor {
  return clampOklch({
    l: color.l,
    c: color.c,
    h: (color.h + degrees + 360) % 360,
  });
}
