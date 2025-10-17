/**
 * =============================================================================
 * Color Gradient Component
 * =============================================================================
 * Displays 9-step light-to-dark gradient
 * =============================================================================
 */

import type { OklchColor } from '../types/color.types.js';
import { generateGradient } from '../utils/color-theory.js';
import { oklchToHex } from '../utils/hex-converter.js';
import { COLOR_CONSTANTS } from '../utils/color-constants.js';

/**
 * Render gradient visualization
 */
export function renderColorGradient(baseColor: OklchColor): string {
  const gradient = generateGradient(baseColor, COLOR_CONSTANTS.GRADIENT_STEPS);

  const cells = gradient.map((color, index) => {
    const hex = oklchToHex(color);
    const lightness = Math.round(color.l);

    return `
      <div
        class="color-gradient__cell"
        style="background-color: ${hex}"
        title="Step ${index + 1}: ${hex} (L: ${lightness}%)"
      ></div>
    `;
  }).join('');

  return `
    <div class="color-gradient">
      <div class="color-gradient__header">
        <span class="color-gradient__label">Gradient (Light → Dark)</span>
      </div>
      <div class="color-gradient__cells">${cells}</div>
    </div>
  `;
}
