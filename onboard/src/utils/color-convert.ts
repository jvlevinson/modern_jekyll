/**
 * =============================================================================
 * Color Conversion Utilities
 * =============================================================================
 * Convert between color spaces: HEX ↔ RGB ↔ OKLCH
 * Uses Culori library for accurate color space conversions
 * =============================================================================
 */

import { converter, formatHex } from 'culori';
import type { HexColor, RgbColor, OklchColor } from '../types/color.types.js';

// Culori converters (accurate, maintained library)
const toOklch = converter('oklch');
const toRgb = converter('rgb');

/**
 * Convert HEX to RGB
 *
 * @param hex - Hex color string (e.g., "#3b82f6")
 * @returns RGB color object
 *
 * @example
 * hexToRgb("#3b82f6") // { r: 59, g: 130, b: 246 }
 */
export function hexToRgb(hex: HexColor): RgbColor {
  const rgb = toRgb(hex);
  if (!rgb) throw new Error(`Invalid hex color: ${hex}`);

  return {
    r: Math.round(rgb.r * 255),
    g: Math.round(rgb.g * 255),
    b: Math.round(rgb.b * 255)
  };
}

/**
 * Convert RGB to HEX
 *
 * @param rgb - RGB color object
 * @returns Hex color string
 *
 * @example
 * rgbToHex({ r: 59, g: 130, b: 246 }) // "#3b82f6"
 */
export function rgbToHex(rgb: RgbColor): HexColor {
  return formatHex({
    mode: 'rgb',
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255
  }) as HexColor;
}

/**
 * Convert RGB to OKLCH (using Culori for accuracy)
 *
 * @param rgb - RGB color object
 * @returns OKLCH color object
 *
 * @example
 * rgbToOklch({ r: 59, g: 130, b: 246 }) // { l: 59.9, c: 0.181, h: 262.3 }
 */
export function rgbToOklch(rgb: RgbColor): OklchColor {
  const oklch = toOklch({
    mode: 'rgb',
    r: rgb.r / 255,
    g: rgb.g / 255,
    b: rgb.b / 255
  });

  if (!oklch) throw new Error(`Conversion failed for RGB: ${JSON.stringify(rgb)}`);

  return {
    l: Math.round(oklch.l * 1000) / 10, // Convert to 0-100 scale
    c: Math.round(oklch.c * 1000) / 1000,
    h: oklch.h ? Math.round(oklch.h * 10) / 10 : 0
  };
}

/**
 * Convert HEX to OKLCH
 *
 * @param hex - Hex color string
 * @returns OKLCH color object
 *
 * @example
 * hexToOklch("#3b82f6") // { l: 59.9, c: 0.181, h: 262.3 }
 */
export function hexToOklch(hex: HexColor): OklchColor {
  const oklch = toOklch(hex);
  if (!oklch) throw new Error(`Invalid hex color: ${hex}`);

  return {
    l: Math.round(oklch.l * 1000) / 10,
    c: Math.round(oklch.c * 1000) / 1000,
    h: oklch.h ? Math.round(oklch.h * 10) / 10 : 0
  };
}

/**
 * Convert OKLCH to CSS string
 *
 * @param color - OKLCH color object
 * @returns CSS oklch() string
 *
 * @example
 * oklchToCss({ l: 60, c: 0.18, h: 262 }) // "oklch(60% 0.18 262deg)"
 */
export function oklchToCss(color: OklchColor): string {
  return `oklch(${color.l}% ${color.c} ${color.h}deg)`;
}

/**
 * Parse CSS oklch() string to OKLCH object
 *
 * @param css - CSS oklch() string
 * @returns OKLCH color object or null if invalid
 *
 * @example
 * parseOklchCss("oklch(60% 0.18 262deg)") // { l: 60, c: 0.18, h: 262 }
 */
export function parseOklchCss(css: string): OklchColor | null {
  const match = css.match(/oklch\((\d+\.?\d*)%?\s+(\d+\.?\d*)\s+(\d+\.?\d*)deg?\)/);

  if (!match) return null;

  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3])
  };
}

/**
 * Validate OKLCH color values
 *
 * @param color - OKLCH color object
 * @returns true if valid
 */
export function validateOklch(color: OklchColor): boolean {
  return (
    color.l >= 0 && color.l <= 100 &&
    color.c >= 0 && color.c <= 0.4 &&  // Limit chroma
    color.h >= 0 && color.h < 360
  );
}

/**
 * Clamp OKLCH values to valid ranges
 *
 * @param color - OKLCH color object
 * @returns Clamped OKLCH color
 */
export function clampOklch(color: OklchColor): OklchColor {
  return {
    l: Math.max(0, Math.min(100, color.l)),
    c: Math.max(0, Math.min(0.4, color.c)),
    h: ((color.h % 360) + 360) % 360  // Wrap to 0-360
  };
}

/**
 * Check if browser supports OKLCH color space
 *
 * @returns true if OKLCH is supported
 */
export function supportsOklch(): boolean {
  if (typeof CSS === 'undefined' || !CSS.supports) return false;
  return CSS.supports('color', 'oklch(50% 0.2 180deg)');
}

/**
 * Get CSS color string with automatic fallback
 * Uses OKLCH if supported, RGB as fallback
 *
 * @param color - OKLCH color object
 * @returns CSS color string (OKLCH or RGB)
 *
 * @example
 * toCssColor({ l: 60, c: 0.18, h: 262 }) // "oklch(60% 0.18 262deg)" or "rgb(59, 130, 246)"
 */
export function toCssColor(color: OklchColor): string {
  if (supportsOklch()) {
    return oklchToCss(color);
  }

  // Fallback to RGB for ~7% of browsers
  const rgb = toRgb({ mode: 'oklch', l: color.l / 100, c: color.c, h: color.h });
  if (!rgb) return 'rgb(0, 0, 0)'; // Ultimate fallback

  return `rgb(${Math.round(rgb.r * 255)}, ${Math.round(rgb.g * 255)}, ${Math.round(rgb.b * 255)})`;
}
