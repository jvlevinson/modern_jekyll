/**
 * =============================================================================
 * WCAG 2.1 Contrast Checker
 * =============================================================================
 * Calculate contrast ratios and validate against WCAG 2.1 accessibility standards
 * Spec: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 * =============================================================================
 */

import { converter } from 'culori';
import type { OklchColor, ContrastResult } from '../types/color.types.js';

const toRgb = converter('rgb');

/**
 * Calculate relative luminance from OKLCH color
 *
 * Algorithm (WCAG 2.1):
 * 1. Convert OKLCH → RGB
 * 2. Convert RGB to linear RGB (gamma correction)
 * 3. Calculate luminance: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 *
 * @param color - OKLCH color object
 * @returns Relative luminance (0-1)
 *
 * @example
 * getLuminance({ l: 60, c: 0.18, h: 262 }) // 0.203
 */
export function getLuminance(color: OklchColor): number {
  const rgb = toRgb({ mode: 'oklch', l: color.l / 100, c: color.c, h: color.h });
  if (!rgb) throw new Error(`Failed to convert OKLCH to RGB: ${JSON.stringify(color)}`);

  // Convert to linear RGB (gamma correction)
  const toLinear = (channel: number): number => {
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };

  const rLinear = toLinear(rgb.r);
  const gLinear = toLinear(rgb.g);
  const bLinear = toLinear(rgb.b);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate WCAG 2.1 contrast ratio between two colors
 *
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 > L2
 *
 * @param color1 - First OKLCH color
 * @param color2 - Second OKLCH color
 * @returns Contrast ratio (1-21)
 *
 * @example
 * getContrastRatio(
 *   { l: 60, c: 0.18, h: 262 },  // Blue
 *   { l: 95, c: 0.01, h: 0 }     // White
 * ) // 4.8
 */
export function getContrastRatio(color1: OklchColor, color2: OklchColor): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check contrast against WCAG 2.1 standards
 *
 * WCAG 2.1 Requirements:
 * - AA (normal text): ≥ 4.5:1
 * - AAA (normal text): ≥ 7:1
 * - AA (large text): ≥ 3:1
 *
 * @param foreground - Foreground color (text)
 * @param background - Background color
 * @returns Contrast validation result
 *
 * @example
 * checkContrast(
 *   { l: 30, c: 0.05, h: 0 },    // Dark text
 *   { l: 95, c: 0.01, h: 0 }     // Light background
 * )
 * // { ratio: 12.6, wcagAA: true, wcagAAA: true, wcagAALarge: true }
 */
export function checkContrast(
  foreground: OklchColor,
  background: OklchColor
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio: Math.round(ratio * 10) / 10,  // Round to 1 decimal
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7,
    wcagAALarge: ratio >= 3
  };
}

/**
 * Find accessible text color for a background
 * Returns either white or black depending on which has better contrast
 *
 * @param background - Background OKLCH color
 * @returns Best text color (white or black OKLCH)
 *
 * @example
 * getAccessibleTextColor({ l: 60, c: 0.18, h: 262 })
 * // { l: 95, c: 0.01, h: 0 } (white)
 */
export function getAccessibleTextColor(background: OklchColor): OklchColor {
  const white: OklchColor = { l: 95, c: 0.01, h: 0 };
  const black: OklchColor = { l: 20, c: 0.01, h: 0 };

  const whiteContrast = getContrastRatio(white, background);
  const blackContrast = getContrastRatio(black, background);

  return whiteContrast > blackContrast ? white : black;
}

/**
 * Validate entire color palette for accessibility
 * Checks if all palette shades have sufficient contrast with white/black text
 *
 * @param baseColor - Base OKLCH color to validate
 * @returns Array of validation results per shade
 *
 * @example
 * validatePaletteContrast({ l: 60, c: 0.18, h: 262 })
 * // [
 * //   { shade: 500, ratio: 4.8, passes: true, recommendedText: 'white' },
 * //   ...
 * // ]
 */
export function validatePaletteContrast(baseColor: OklchColor): {
  shade: number;
  ratio: number;
  passes: boolean;
  recommendedText: 'white' | 'black';
}[] {
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const lightnessSteps: Record<number, number> = {
    50: 95, 100: 90, 200: 80, 300: 70, 400: 65,
    500: baseColor.l,
    600: baseColor.l - 10, 700: baseColor.l - 20,
    800: baseColor.l - 30, 900: baseColor.l - 40
  };

  return shades.map(shade => {
    const shadeColor: OklchColor = {
      l: lightnessSteps[shade],
      c: baseColor.c,
      h: baseColor.h
    };

    const textColor = getAccessibleTextColor(shadeColor);
    const ratio = getContrastRatio(textColor, shadeColor);

    return {
      shade,
      ratio: Math.round(ratio * 10) / 10,
      passes: ratio >= 4.5,  // WCAG AA minimum
      recommendedText: textColor.l > 50 ? 'white' : 'black'
    };
  });
}

/**
 * Suggest lightness adjustment to meet WCAG AA standards
 *
 * @param foreground - Foreground color
 * @param background - Background color
 * @param targetRatio - Target contrast ratio (default: 4.5)
 * @returns Adjusted foreground color or null if impossible
 *
 * @example
 * suggestContrastFix(
 *   { l: 65, c: 0.18, h: 262 },  // Low contrast blue
 *   { l: 95, c: 0.01, h: 0 },    // White background
 *   4.5
 * )
 * // { l: 48, c: 0.18, h: 262 } (darkened to meet AA)
 */
export function suggestContrastFix(
  foreground: OklchColor,
  background: OklchColor,
  targetRatio: number = 4.5
): OklchColor | null {
  const currentRatio = getContrastRatio(foreground, background);
  if (currentRatio >= targetRatio) return foreground;

  // Try darkening foreground
  for (let l = foreground.l; l >= 0; l -= 5) {
    const adjusted: OklchColor = { ...foreground, l };
    if (getContrastRatio(adjusted, background) >= targetRatio) {
      return adjusted;
    }
  }

  // Try lightening foreground
  for (let l = foreground.l; l <= 100; l += 5) {
    const adjusted: OklchColor = { ...foreground, l };
    if (getContrastRatio(adjusted, background) >= targetRatio) {
      return adjusted;
    }
  }

  return null;  // Cannot fix
}
