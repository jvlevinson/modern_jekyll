/**
 * =============================================================================
 * Color Picker Component
 * =============================================================================
 * Functional OKLCH color picker with live preview
 * Pure functions that manipulate DOM (no Web Components)
 * =============================================================================
 */

import type { OklchColor } from '../types/color.types.js';
import { toCssColor } from '../utils/color-convert.js';
import { generatePalette } from '../utils/palette-generator.js';
import { checkContrast } from '../utils/contrast-checker.js';
import { EventName } from '../types/events.types.js';
import { emit } from '../core/event-bus.js';
import { createColorSelector2DHTML, initColorSelector2D, updateSelector2DLightness } from './color-selector-2d.js';
import { oklchToHex, hexToOklch, isValidHex } from '../utils/hex-converter.js';

/**
 * Color picker state
 */
interface ColorPickerState {
  color: OklchColor;
  previousColor: OklchColor;
  key: 'brand_primary' | 'brand_secondary';
}

/**
 * Create color picker HTML structure
 *
 * @param id - Unique picker ID
 * @param label - Picker label text
 * @param initialColor - Initial OKLCH color
 * @returns HTML string
 *
 * @example
 * const html = createColorPickerHTML('primary-picker', 'Primary Color', { l: 60, c: 0.18, h: 262 });
 * container.innerHTML = html;
 */
export function createColorPickerHTML(
  id: string,
  label: string,
  initialColor: OklchColor
): string {
  const cssColor = toCssColor(initialColor);
  const hexColor = oklchToHex(initialColor);

  return `
    <div class="color-picker" id="${id}" data-picker>
      <label class="color-picker__label">
        ${label}
        <div class="color-picker__preview" data-preview style="background-color: ${cssColor}"></div>
      </label>

      <!-- 2D Color Selector -->
      <div class="color-picker__visual">
        ${createColorSelector2DHTML(`${id}-selector`, initialColor.l)}
      </div>

      <!-- Hex Input -->
      <div class="color-picker__hex">
        <label for="${id}-hex">
          Hex Color
        </label>
        <div class="color-picker__hex-input">
          <input
            type="text"
            id="${id}-hex"
            data-hex-input
            value="${hexColor}"
            pattern="^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"
            placeholder="#000000"
            maxlength="7"
            aria-label="Hex color code"
          />
          <button
            type="button"
            class="color-picker__hex-copy"
            data-hex-copy
            title="Copy hex code"
          >
            📋
          </button>
        </div>
      </div>

      <div class="color-picker__controls">
        <!-- Lightness slider (0-100) -->
        <div class="color-picker__control">
          <label for="${id}-lightness">
            Lightness: <span data-lightness-value>${initialColor.l}%</span>
          </label>
          <input
            type="range"
            id="${id}-lightness"
            data-lightness
            min="0"
            max="100"
            step="1"
            value="${initialColor.l}"
            aria-label="Lightness"
          />
        </div>

        <!-- Chroma slider (0-0.4) -->
        <div class="color-picker__control">
          <label for="${id}-chroma">
            Chroma: <span data-chroma-value>${initialColor.c}</span>
          </label>
          <input
            type="range"
            id="${id}-chroma"
            data-chroma
            min="0"
            max="0.4"
            step="0.01"
            value="${initialColor.c}"
            aria-label="Chroma (saturation)"
          />
        </div>

        <!-- Hue slider (0-360) -->
        <div class="color-picker__control">
          <label for="${id}-hue">
            Hue: <span data-hue-value>${initialColor.h}°</span>
          </label>
          <input
            type="range"
            id="${id}-hue"
            data-hue
            min="0"
            max="360"
            step="1"
            value="${initialColor.h}"
            aria-label="Hue"
          />
        </div>
      </div>

      <div class="color-picker__info">
        <div class="color-picker__css" data-css-value>
          ${cssColor}
        </div>
        <div class="color-picker__contrast" data-contrast>
          <span data-contrast-ratio>—</span>
          <span data-wcag-badge></span>
        </div>
      </div>

      <div class="color-picker__palette" data-palette></div>
    </div>
  `;
}

/**
 * Initialize color picker functionality
 *
 * @param element - Color picker container element
 * @param initialColor - Initial OKLCH color
 * @param key - Config key ('brand_primary' or 'brand_secondary')
 * @param onChange - Optional change callback
 * @returns Cleanup function
 *
 * @example
 * const container = document.getElementById('primary-picker');
 * const cleanup = initColorPicker(container, { l: 60, c: 0.18, h: 262 }, 'brand_primary');
 */
export function initColorPicker(
  element: HTMLElement,
  initialColor: OklchColor,
  key: 'brand_primary' | 'brand_secondary',
  onChange?: (color: OklchColor) => void
): () => void {
  const state: ColorPickerState = {
    color: { ...initialColor },
    previousColor: { ...initialColor },
    key
  };

  // Get elements
  const lightnessInput = element.querySelector('[data-lightness]') as HTMLInputElement;
  const chromaInput = element.querySelector('[data-chroma]') as HTMLInputElement;
  const hueInput = element.querySelector('[data-hue]') as HTMLInputElement;
  const previewEl = element.querySelector('[data-preview]') as HTMLElement;
  const cssValueEl = element.querySelector('[data-css-value]') as HTMLElement;
  const paletteEl = element.querySelector('[data-palette]') as HTMLElement;
  const hexInput = element.querySelector('[data-hex-input]') as HTMLInputElement;
  const hexCopyBtn = element.querySelector('[data-hex-copy]') as HTMLButtonElement;
  const selectorContainer = element.querySelector('[data-selector-2d]') as HTMLElement;

  if (!lightnessInput || !chromaInput || !hueInput || !previewEl || !cssValueEl) {
    console.error('Color picker: missing required elements');
    return () => {};
  }

  // Initialize 2D color selector
  let selector2DCleanup: (() => void) | null = null;
  if (selectorContainer) {
    selector2DCleanup = initColorSelector2D(
      selectorContainer,
      initialColor,
      (color: OklchColor) => {
        // Update state from 2D selector (keeps current lightness)
        state.color = { ...color, l: state.color.l };
        updateUI();
        emitChangeEvent();
        onChange?.(state.color);
      }
    );
  }

  // Update UI from state
  const updateUI = () => {
    const { l, c, h } = state.color;
    const cssColor = toCssColor(state.color);
    const hexColor = oklchToHex(state.color);

    // Update sliders
    lightnessInput.value = String(l);
    chromaInput.value = String(c);
    hueInput.value = String(h);

    // Update value displays
    const lightnessValue = element.querySelector('[data-lightness-value]');
    const chromaValue = element.querySelector('[data-chroma-value]');
    const hueValue = element.querySelector('[data-hue-value]');

    if (lightnessValue) lightnessValue.textContent = `${l}%`;
    if (chromaValue) chromaValue.textContent = String(c);
    if (hueValue) hueValue.textContent = `${h}°`;

    // Update hex input
    if (hexInput && hexInput !== document.activeElement) {
      hexInput.value = hexColor;
    }

    // Update preview
    previewEl.style.backgroundColor = cssColor;

    // Update CSS value
    cssValueEl.textContent = cssColor;

    // Update palette preview
    if (paletteEl) {
      updatePalettePreview(paletteEl, state.color);
    }

    // Update contrast info
    updateContrastInfo(element, state.color);
  };

  // Handle slider changes
  const handleLightnessChange = () => {
    state.color.l = parseFloat(lightnessInput.value);

    // Update 2D selector when lightness changes
    if (selectorContainer) {
      updateSelector2DLightness(selectorContainer, state.color.l);
    }

    updateUI();
    emitChangeEvent();
    onChange?.(state.color);
  };

  const handleChromaChange = () => {
    state.color.c = parseFloat(chromaInput.value);
    updateUI();
    emitChangeEvent();
    onChange?.(state.color);
  };

  const handleHueChange = () => {
    state.color.h = parseFloat(hueInput.value);
    updateUI();
    emitChangeEvent();
    onChange?.(state.color);
  };

  // Handle hex input change
  const handleHexChange = () => {
    if (!hexInput) return;

    const hex = hexInput.value.trim();

    if (isValidHex(hex)) {
      const oklch = hexToOklch(hex);

      if (oklch) {
        state.color = oklch;
        updateUI();
        emitChangeEvent();
        onChange?.(state.color);

        // Update 2D selector
        if (selectorContainer) {
          updateSelector2DLightness(selectorContainer, oklch.l);
        }

        // Remove error styling
        hexInput.classList.remove('color-picker__hex-input--error');
      }
    } else {
      // Add error styling
      hexInput.classList.add('color-picker__hex-input--error');
    }
  };

  // Handle hex copy
  const handleHexCopy = async () => {
    if (!hexInput) return;

    try {
      await navigator.clipboard.writeText(hexInput.value);

      // Show feedback
      if (hexCopyBtn) {
        const originalText = hexCopyBtn.textContent;
        hexCopyBtn.textContent = '✓';
        hexCopyBtn.classList.add('color-picker__hex-copy--copied');

        setTimeout(() => {
          hexCopyBtn.textContent = originalText;
          hexCopyBtn.classList.remove('color-picker__hex-copy--copied');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy hex code:', err);
    }
  };

  // Emit color change event
  const emitChangeEvent = () => {
    emit(EventName.COLOR_CHANGE, {
      color: { ...state.color },
      previousColor: { ...state.previousColor },
      key: state.key
    });

    state.previousColor = { ...state.color };
  };

  // Attach listeners
  lightnessInput.addEventListener('input', handleLightnessChange);
  chromaInput.addEventListener('input', handleChromaChange);
  hueInput.addEventListener('input', handleHueChange);

  if (hexInput) {
    hexInput.addEventListener('change', handleHexChange);
    hexInput.addEventListener('blur', handleHexChange);
  }

  if (hexCopyBtn) {
    hexCopyBtn.addEventListener('click', () => {
      void handleHexCopy();
    });
  }

  // Initial UI update
  updateUI();

  // Cleanup function
  return () => {
    lightnessInput.removeEventListener('input', handleLightnessChange);
    chromaInput.removeEventListener('input', handleChromaChange);
    hueInput.removeEventListener('input', handleHueChange);

    if (hexInput) {
      hexInput.removeEventListener('change', handleHexChange);
      hexInput.removeEventListener('blur', handleHexChange);
    }

    // Note: hexCopyBtn cleanup handled by wrapper function

    if (selector2DCleanup) {
      selector2DCleanup();
    }
  };
}

/**
 * Update palette preview
 */
function updatePalettePreview(container: HTMLElement, baseColor: OklchColor): void {
  const palette = generatePalette(baseColor);

  const html = Object.entries(palette)
    .map(([shade, cssColor]) => {
      return `
        <div
          class="color-picker__palette-swatch"
          style="background-color: ${cssColor}"
          title="${shade}: ${cssColor}"
        >
          <span class="color-picker__palette-shade">${shade}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = html;
}

/**
 * Update contrast information
 */
function updateContrastInfo(element: HTMLElement, color: OklchColor): void {
  const contrastRatioEl = element.querySelector('[data-contrast-ratio]');
  const wcagBadgeEl = element.querySelector('[data-wcag-badge]');

  if (!contrastRatioEl || !wcagBadgeEl) return;

  // Check contrast against white background
  const whiteBackground: OklchColor = { l: 95, c: 0.01, h: 0 };
  const result = checkContrast(color, whiteBackground);

  contrastRatioEl.textContent = `${result.ratio}:1`;

  // Update WCAG badge
  if (result.wcagAAA) {
    wcagBadgeEl.textContent = 'AAA';
    wcagBadgeEl.className = 'color-picker__wcag-badge color-picker__wcag-badge--aaa';
  } else if (result.wcagAA) {
    wcagBadgeEl.textContent = 'AA';
    wcagBadgeEl.className = 'color-picker__wcag-badge color-picker__wcag-badge--aa';
  } else {
    wcagBadgeEl.textContent = 'Fail';
    wcagBadgeEl.className = 'color-picker__wcag-badge color-picker__wcag-badge--fail';
  }
}

/**
 * Set color picker value programmatically
 *
 * @param element - Color picker container
 * @param color - New OKLCH color
 *
 * @example
 * setColorPickerValue(container, { l: 70, c: 0.2, h: 180 });
 */
export function setColorPickerValue(element: HTMLElement, color: OklchColor): void {
  const lightnessInput = element.querySelector('[data-lightness]') as HTMLInputElement;
  const chromaInput = element.querySelector('[data-chroma]') as HTMLInputElement;
  const hueInput = element.querySelector('[data-hue]') as HTMLInputElement;

  if (lightnessInput) lightnessInput.value = String(color.l);
  if (chromaInput) chromaInput.value = String(color.c);
  if (hueInput) hueInput.value = String(color.h);

  // Trigger input event to update UI
  lightnessInput?.dispatchEvent(new Event('input', { bubbles: true }));
}

/**
 * Get color picker value
 *
 * @param element - Color picker container
 * @returns Current OKLCH color
 *
 * @example
 * const color = getColorPickerValue(container);
 * console.log(color); // { l: 60, c: 0.18, h: 262 }
 */
export function getColorPickerValue(element: HTMLElement): OklchColor | null {
  const lightnessInput = element.querySelector('[data-lightness]') as HTMLInputElement;
  const chromaInput = element.querySelector('[data-chroma]') as HTMLInputElement;
  const hueInput = element.querySelector('[data-hue]') as HTMLInputElement;

  if (!lightnessInput || !chromaInput || !hueInput) {
    return null;
  }

  return {
    l: parseFloat(lightnessInput.value),
    c: parseFloat(chromaInput.value),
    h: parseFloat(hueInput.value)
  };
}
