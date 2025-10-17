/**
 * =============================================================================
 * OKLCH Palette Generator
 * =============================================================================
 * Generate complete 10-shade color palettes from a single base OKLCH color
 * Based on research: oklch.org best practices (October 2025)
 * =============================================================================
 */

import type { OklchColor, ColorPalette } from '../types/color.types.js';
import { oklchToCss, clampOklch } from './color-convert.js';

/**
 * Generate a 10-shade color palette from a base OKLCH color
 *
 * Algorithm:
 * - Lightness: Progresses from 95% (lightest) to base-40% (darkest)
 * - Chroma: Scales proportionally to maintain saturation consistency
 * - Hue: Remains constant across all shades
 *
 * @param base - Base OKLCH color (typically shade 500)
 * @returns Complete 10-shade palette (50-900)
 *
 * @example
 * const blue = { l: 60, c: 0.18, h: 262 };
 * const palette = generatePalette(blue);
 * // Returns: { 50: "oklch(95% 0.072 262deg)", ..., 900: "oklch(20% 0.108 262deg)" }
 */
export function generatePalette(base: OklchColor): ColorPalette {
  const { h, c } = base;

  // Lightness progression (perceptually uniform)
  const lightnessSteps = {
    50:  95,
    100: 90,
    200: 80,
    300: 70,
    400: 65,
    500: base.l,  // Base lightness
    600: base.l - 10,
    700: base.l - 20,
    800: base.l - 30,
    900: base.l - 40
  };

  // Chroma scaling (maintains saturation consistency)
  const chromaScale = {
    50:  c * 0.4,
    100: c * 0.5,
    200: c * 0.6,
    300: c * 0.7,
    400: c * 0.8,
    500: c,  // Base chroma
    600: c * 0.9,
    700: c * 0.8,
    800: c * 0.7,
    900: c * 0.6
  };

  const palette = {} as ColorPalette;

  for (const [shade, lightness] of Object.entries(lightnessSteps)) {
    const shadeKey = shade as unknown as keyof ColorPalette;
    const chroma = chromaScale[shadeKey];
    const color = clampOklch({ l: lightness, c: chroma, h });
    palette[shadeKey] = oklchToCss(color);
  }

  return palette;
}

/**
 * Generate palette with custom lightness range
 *
 * Useful for creating palettes with specific lightness constraints
 *
 * @param base - Base OKLCH color
 * @param options - Lightness range options
 * @returns Custom color palette
 *
 * @example
 * const palette = generatePaletteCustom(
 *   { l: 60, c: 0.18, h: 262 },
 *   { lightest: 90, darkest: 30 }
 * );
 */
export function generatePaletteCustom(
  base: OklchColor,
  options: { lightest: number; darkest: number }
): ColorPalette {
  const { h, c } = base;
  const { lightest, darkest } = options;
  const range = lightest - darkest;

  const lightnessSteps = {
    50:  lightest,
    100: lightest - range * 0.1,
    200: lightest - range * 0.2,
    300: lightest - range * 0.3,
    400: lightest - range * 0.4,
    500: base.l,
    600: base.l - (range * 0.1),
    700: base.l - (range * 0.2),
    800: base.l - (range * 0.3),
    900: darkest
  };

  const chromaScale = {
    50:  c * 0.4,
    100: c * 0.5,
    200: c * 0.6,
    300: c * 0.7,
    400: c * 0.8,
    500: c,
    600: c * 0.9,
    700: c * 0.8,
    800: c * 0.7,
    900: c * 0.6
  };

  const palette = {} as ColorPalette;

  for (const [shade, lightness] of Object.entries(lightnessSteps)) {
    const shadeKey = shade as unknown as keyof ColorPalette;
    const chroma = chromaScale[shadeKey];
    const color = clampOklch({ l: lightness, c: chroma, h });
    palette[shadeKey] = oklchToCss(color);
  }

  return palette;
}

/**
 * Get a specific shade from a palette
 *
 * @param palette - Color palette
 * @param shade - Shade number (50-900)
 * @returns CSS color string
 */
export function getShade(palette: ColorPalette, shade: keyof ColorPalette): string {
  return palette[shade];
}

/**
 * Adjust palette brightness globally
 *
 * @param palette - Original palette
 * @param adjustment - Lightness adjustment (-50 to +50)
 * @returns Adjusted palette
 */
export function adjustPaletteBrightness(
  palette: ColorPalette,
  adjustment: number
): ColorPalette {
  const adjusted = {} as ColorPalette;

  for (const [shade, cssColor] of Object.entries(palette)) {
    const shadeKey = shade as unknown as keyof ColorPalette;
    const match = (cssColor as string).match(/oklch\((\d+\.?\d*)%\s+(\d+\.?\d*)\s+(\d+\.?\d*)deg\)/);
    if (!match || !match[1] || !match[2] || !match[3]) continue;

    const l = parseFloat(match[1]) + adjustment;
    const c = parseFloat(match[2]);
    const h = parseFloat(match[3]);

    const color = clampOklch({ l, c, h });
    adjusted[shadeKey] = oklchToCss(color);
  }

  return adjusted;
}
