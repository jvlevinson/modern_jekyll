/**
 * =============================================================================
 * Color Type Definitions
 * =============================================================================
 * Modern color system using OKLCH color space
 * Based on research: oklch.org best practices (October 2025)
 * =============================================================================
 */

/**
 * OKLCH color space (perceptually uniform)
 *
 * @property l - Lightness (0-100%)
 * @property c - Chroma/saturation (0-0.4, limit to prevent over-saturation)
 * @property h - Hue (0-360 degrees)
 *
 * @example
 * const blue: OklchColor = { l: 60, c: 0.18, h: 262 };
 */
export interface OklchColor {
  l: number;  // 0-100
  c: number;  // 0-0.4
  h: number;  // 0-360
}

/**
 * HSV color space (color wheel input)
 * Used for conversion from visual color pickers
 */
export interface HsvColor {
  h: number;  // 0-360
  s: number;  // 0-100
  v: number;  // 0-100
}

/**
 * RGB color space (web standard)
 * Used for conversion from hex colors
 */
export interface RgbColor {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
}

/**
 * Hex color string
 * Must match pattern: #RRGGBB
 *
 * @example "#3b82f6"
 */
export type HexColor = `#${string}`;

/**
 * Complete color palette (10 shades)
 * Generated from single base OKLCH color
 *
 * Shade progression:
 * - 50:  Lightest (95% lightness)
 * - 100-400: Light shades
 * - 500: Base color
 * - 600-900: Dark shades
 * - 900: Darkest (20% lightness)
 */
export interface ColorPalette {
  50: string;   // oklch(95% ...)
  100: string;  // oklch(90% ...)
  200: string;  // oklch(80% ...)
  300: string;  // oklch(70% ...)
  400: string;  // oklch(65% ...)
  500: string;  // Base color
  600: string;  // oklch(base.l - 10% ...)
  700: string;  // oklch(base.l - 20% ...)
  800: string;  // oklch(base.l - 30% ...)
  900: string;  // oklch(base.l - 40% ...)
}

/**
 * Palette shade type (50-900)
 */
export type PaletteShade = keyof ColorPalette;

/**
 * Color validation result
 */
export interface ColorValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Contrast validation result
 * Based on WCAG 2.1 standards
 */
export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;       // ≥ 4.5:1 for normal text
  wcagAAA: boolean;      // ≥ 7:1 for normal text
  wcagAALarge: boolean;  // ≥ 3:1 for large text
}

/**
 * Active color selection (which color is being edited)
 */
export type ActiveColorKey = 'primary' | 'secondary';

/**
 * Color harmony type
 */
export type HarmonyType = 'complementary' | 'triadic' | 'analogous';

/**
 * Color harmony result
 */
export interface ColorHarmony {
  type: HarmonyType;
  colors: OklchColor[];
  names: string[];
}

/**
 * Shade scale step (TailwindCSS-compatible)
 */
export interface ShadeScale {
  weight: number;  // 50, 100, 200...950
  color: OklchColor;
  hex: string;
}

/**
 * Quick preset color
 */
export interface ColorPreset {
  name: string;
  color: OklchColor;
  hex: string;
  category: 'vibrant' | 'pastel' | 'neutral' | 'dark';
}
