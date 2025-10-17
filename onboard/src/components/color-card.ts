/**
 * =============================================================================
 * Color Card Component
 * =============================================================================
 * Displays color as clickable card with metadata
 * =============================================================================
 */

import type { OklchColor, ActiveColorKey } from '../types/color.types.js';
import { oklchToHex } from '../utils/hex-converter.js';
import { emit } from '../core/event-bus.js';
import { EventName } from '../types/events.types.js';

/**
 * Render color card
 */
export function renderColorCard(
  color: OklchColor,
  colorKey: ActiveColorKey,
  isActive: boolean
): string {
  const hex = oklchToHex(color);
  const { l, c, h } = color;

  // Format values for display
  const lPercent = Math.round(l);
  const cPercent = Math.round(c * 100);
  const hDegrees = Math.round(h);

  return `
    <button
      class="color-card ${isActive ? 'color-card--active' : ''}"
      data-color-card="${colorKey}"
      type="button"
      aria-label="Select ${colorKey} color for editing"
      aria-pressed="${isActive}"
    >
      <div class="color-card__preview" style="background-color: ${hex}"></div>

      <div class="color-card__info">
        <div class="color-card__label">
          ${colorKey === 'primary' ? 'Primary Color' : 'Secondary Color'}
          ${isActive ? '<span class="color-card__badge">Editing</span>' : ''}
        </div>

        <div class="color-card__hex">${hex}</div>

        <div class="color-card__oklch">
          <span class="oklch-value">L: ${lPercent}%</span>
          <span class="oklch-value">C: ${cPercent}%</span>
          <span class="oklch-value">H: ${hDegrees}°</span>
        </div>
      </div>
    </button>
  `;
}

/**
 * Initialize color card event listeners
 */
export function initColorCard(container: HTMLElement): void {
  container.addEventListener('click', (event) => {
    const card = (event.target as HTMLElement).closest('[data-color-card]');
    if (!card) return;

    const colorKey = card.getAttribute('data-color-card') as ActiveColorKey;

    emit(EventName.ACTIVE_COLOR_CHANGE, { activeColor: colorKey });
  });
}
