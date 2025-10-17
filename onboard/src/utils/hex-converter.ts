/**
 * =============================================================================
 * Hex Color Converter
 * =============================================================================
 * Convert between OKLCH and Hex color formats using Culori
 * Provides user-friendly hex input/output for color pickers
 * =============================================================================
 */

import { formatHex, parse, converter } from 'culori';
import type { OklchColor } from '../types/color.types.js';

/**
 * Convert OKLCH color to Hex string
 *
 * @param color - OKLCH color object
 * @returns Hex color string (e.g., "#3b82f6")
 *
 * @example
 * const hex = oklchToHex({ l: 60, c: 0.18, h: 262 });
 * // Returns: "#5c7cfa"
 */
export function oklchToHex(color: OklchColor): string {
  // Convert to Culori OKLCH format
  const oklch = {
    mode: 'oklch' as const,
    l: color.l / 100, // Culori uses 0-1 range for lightness
    c: color.c,
    h: color.h
  };

  // Convert to hex using Culori
  const hex = formatHex(oklch);

  return hex;
}

/**
 * Convert Hex string to OKLCH color
 *
 * @param hex - Hex color string (with or without #)
 * @returns OKLCH color object or null if invalid
 *
 * @example
 * const oklch = hexToOklch("#5c7cfa");
 * // Returns: { l: 60, c: 0.18, h: 262 }
 */
export function hexToOklch(hex: string): OklchColor | null {
  try {
    // Normalize hex (add # if missing)
    const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;

    // Parse hex to Culori color
    const parsed = parse(normalizedHex);

    if (!parsed) {
      return null;
    }

    // Convert to OKLCH using Culori's converter
    const toOklch = converter('oklch');
    const converted = toOklch(parsed);

    if (!converted || converted.mode !== 'oklch') {
      return null;
    }

    return {
      l: (converted.l ?? 0) * 100, // Convert back to 0-100 range
      c: converted.c ?? 0,
      h: converted.h ?? 0
    };
  } catch (error) {
    console.error('Failed to convert hex to OKLCH:', error);
    return null;
  }
}

/**
 * Validate hex color string
 *
 * @param hex - Hex color string to validate
 * @returns true if valid hex color
 *
 * @example
 * isValidHex("#5c7cfa"); // true
 * isValidHex("5c7cfa");  // true
 * isValidHex("invalid"); // false
 */
export function isValidHex(hex: string): boolean {
  const hexRegex = /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i;
  return hexRegex.test(hex);
}

/**
 * Normalize hex string (add # prefix, expand 3-digit to 6-digit)
 *
 * @param hex - Hex color string
 * @returns Normalized hex string or null if invalid
 *
 * @example
 * normalizeHex("5c7"); // "#55cc77"
 * normalizeHex("5c7cfa"); // "#5c7cfa"
 * normalizeHex("#5c7cfa"); // "#5c7cfa"
 */
export function normalizeHex(hex: string): string | null {
  if (!isValidHex(hex)) {
    return null;
  }

  // Remove # if present
  let clean = hex.replace('#', '');

  // Expand 3-digit hex to 6-digit
  if (clean.length === 3) {
    clean = clean.split('').map(char => char + char).join('');
  }

  return `#${clean.toUpperCase()}`;
}
