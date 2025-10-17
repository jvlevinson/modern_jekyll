/**
 * =============================================================================
 * Color Presets Component
 * =============================================================================
 * Quick color selection grid
 * =============================================================================
 */

import type { ColorPreset, ActiveColorKey } from '../types/color.types.js';
import { COLOR_PRESETS } from '../utils/color-constants.js';
import { emit } from '../core/event-bus.js';
import { EventName } from '../types/events.types.js';

/**
 * Group presets by category
 */
function groupPresetsByCategory(): Record<string, ColorPreset[]> {
  return COLOR_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, ColorPreset[]>);
}

/**
 * Render preset group
 */
function renderPresetGroup(category: string, presets: ColorPreset[]): string {
  const cells = presets.map((preset) => `
    <button
      class="preset-cell"
      data-preset-name="${preset.name}"
      style="background-color: ${preset.hex}"
      title="${preset.name} (${preset.hex})"
      type="button"
      aria-label="Apply ${preset.name}"
    ></button>
  `).join('');

  return `
    <div class="preset-group">
      <div class="preset-group__label">${capitalizeFirst(category)}</div>
      <div class="preset-group__grid">${cells}</div>
    </div>
  `;
}

/**
 * Render color presets
 */
export function renderColorPresets(): string {
  const grouped = groupPresetsByCategory();

  const groups = Object.entries(grouped)
    .map(([category, presets]) => renderPresetGroup(category, presets))
    .join('');

  return `
    <div class="color-presets">
      <div class="color-presets__header">
        <span class="color-presets__label">Quick Colors</span>
      </div>
      <div class="color-presets__groups">${groups}</div>
    </div>
  `;
}

/**
 * Initialize preset event listeners
 */
export function initColorPresets(container: HTMLElement, activeColor: ActiveColorKey): void {
  container.addEventListener('click', (event) => {
    const cell = (event.target as HTMLElement).closest('[data-preset-name]');
    if (!cell) return;

    const presetName = cell.getAttribute('data-preset-name') as string;
    const preset = COLOR_PRESETS.find((p) => p.name === presetName);

    if (preset) {
      emit(EventName.COLOR_PRESET_SELECT, { preset, targetColor: activeColor });
    }
  });
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
