/**
 * =============================================================================
 * Color Harmonies Component
 * =============================================================================
 * Complementary, triadic, analogous color relationships
 * =============================================================================
 */

import type { OklchColor, HarmonyType } from '../types/color.types.js';
import { generateHarmony } from '../utils/color-theory.js';
import { oklchToHex } from '../utils/hex-converter.js';

/**
 * Render single harmony type
 */
function renderHarmony(baseColor: OklchColor, type: HarmonyType): string {
  const harmony = generateHarmony(baseColor, type);

  const circles = harmony.colors.map((color, index) => {
    const hex = oklchToHex(color);
    const name = harmony.names[index];
    const isBase = index === (type === 'analogous' ? 1 : 0);

    return `
      <div class="harmony-circle ${isBase ? 'harmony-circle--base' : ''}">
        <div
          class="harmony-circle__swatch"
          style="background-color: ${hex}"
          title="${name}: ${hex}"
        ></div>
        <span class="harmony-circle__label">${name}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="harmony-group">
      <div class="harmony-group__label">${capitalizeFirst(type)}</div>
      <div class="harmony-group__circles">${circles}</div>
    </div>
  `;
}

/**
 * Render all harmonies
 */
export function renderColorHarmonies(baseColor: OklchColor): string {
  const types: HarmonyType[] = ['complementary', 'triadic', 'analogous'];

  const harmonies = types.map((type) => renderHarmony(baseColor, type)).join('');

  return `
    <div class="color-harmonies">
      <div class="color-harmonies__header">
        <span class="color-harmonies__label">Color Harmonies</span>
      </div>
      <div class="color-harmonies__groups">${harmonies}</div>
    </div>
  `;
}

/**
 * Utility: Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
