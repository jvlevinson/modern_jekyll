/**
 * =============================================================================
 * Shade Matrix Component
 * =============================================================================
 * TailwindCSS-style color scale (50, 100, 200...950)
 * =============================================================================
 */

import type { OklchColor } from '../types/color.types.js';
import { generateShadeScale } from '../utils/color-theory.js';

/**
 * Render shade matrix
 */
export function renderShadeMatrix(baseColor: OklchColor): string {
  const shades = generateShadeScale(baseColor);

  const cells = shades.map(({ weight, color, hex }) => {
    const lightness = Math.round(color.l);

    return `
      <div class="shade-matrix__cell">
        <div
          class="shade-matrix__swatch"
          style="background-color: ${hex}"
          title="${hex} (L: ${lightness}%)"
        ></div>
        <span class="shade-matrix__weight">${weight}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="shade-matrix">
      <div class="shade-matrix__header">
        <span class="shade-matrix__label">Shade Scale (TailwindCSS)</span>
      </div>
      <div class="shade-matrix__grid">${cells}</div>
    </div>
  `;
}
