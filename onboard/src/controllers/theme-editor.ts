/**
 * =============================================================================
 * Theme Editor Controller
 * =============================================================================
 * Main orchestrator for the theme editor
 * Coordinates config manager, color pickers, preview, and UI state
 * =============================================================================
 */

import type { OklchColor, ActiveColorKey } from '../types/color.types.js';
import type { ThemeConfig } from '../types/config.types.js';
import {
  loadConfig,
  updateConfig,
  saveConfig,
  resetConfig,
  isDirtyConfig,
  getConfig
} from '../core/config-manager.js';
import { on, emit } from '../core/event-bus.js';
import { EventName } from '../types/events.types.js';
import {
  createColorPickerHTML,
  initColorPicker
} from '../components/color-picker.js';
import { renderColorCard, initColorCard } from '../components/color-card.js';
import { renderColorGradient } from '../components/color-gradient.js';
import { renderShadeMatrix } from '../components/shade-matrix.js';
import { renderColorHarmonies } from '../components/color-harmonies.js';
import { renderColorPresets, initColorPresets } from '../components/color-presets.js';
import { rotateHue } from '../utils/color-theory.js';

/**
 * Theme editor state
 */
interface EditorState {
  isLoading: boolean;
  isSaving: boolean;
  activeColor: ActiveColorKey;
  isSecondaryEnabled: boolean;
  pickerCleanup?: () => void;
}

/**
 * Initialize theme editor
 *
 * @param containerId - Container element ID
 * @returns Cleanup function
 *
 * @example
 * const cleanup = await initThemeEditor('theme-editor');
 * // Later: cleanup();
 */
export async function initThemeEditor(containerId: string): Promise<() => void> {
  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Theme editor: container #${containerId} not found`);
    return () => {};
  }

  const state: EditorState = {
    isLoading: true,
    isSaving: false,
    activeColor: 'primary',
    isSecondaryEnabled: false
  };

  // Show loading state
  showLoadingState(container);

  // Load configuration
  const theme = await loadConfig();

  if (!theme) {
    showErrorState(container, 'Failed to load theme configuration');
    return () => {};
  }

  state.isLoading = false;
  state.isSecondaryEnabled = theme.brand_secondary !== null && theme.brand_secondary !== undefined;

  // Render editor UI
  renderEditor(container, theme, state);

  // Initialize components
  const cleanupFunctions = initializeComponents(container, theme, state);

  // Setup event listeners
  setupEventListeners(container, state);

  return () => {
    cleanupFunctions.forEach(fn => fn());
  };
}

/**
 * Render editor UI structure
 */
function renderEditor(container: HTMLElement, theme: ThemeConfig, state: EditorState): void {
  const primaryColor = theme.brand_primary;
  const secondaryColor = theme.brand_secondary || rotateHue(primaryColor, 180);
  const currentColor = state.activeColor === 'primary' ? primaryColor : secondaryColor;

  container.innerHTML = `
    <div class="theme-editor">
      <header class="theme-editor__header">
        <h2 class="theme-editor__title">Theme Editor</h2>
      </header>

      <div class="theme-editor__content">
        <!-- Brand Colors Section -->
        <section class="theme-section">
          <header class="theme-section__header">
            <h3 class="theme-section__title">Brand Colors</h3>

            <label class="toggle-switch">
              <input
                type="checkbox"
                data-secondary-toggle
                ${state.isSecondaryEnabled ? 'checked' : ''}
              />
              <span class="toggle-switch__slider"></span>
              <span class="toggle-switch__label">Enable Secondary Color</span>
            </label>
          </header>

          <div class="color-cards-container" data-color-cards>
            ${renderColorCard(primaryColor, 'primary', state.activeColor === 'primary')}
            ${state.isSecondaryEnabled ? renderColorCard(secondaryColor, 'secondary', state.activeColor === 'secondary') : ''}
          </div>
        </section>

        <!-- Color Picker Section (Shared) -->
        <section class="theme-section">
          <header class="theme-section__header">
            <h3 class="theme-section__title">
              Editing: <span class="color-key-label">${capitalizeFirst(state.activeColor)} Color</span>
            </h3>
          </header>

          <div data-color-picker-container></div>
        </section>

        <!-- Visualizations Section -->
        <section class="theme-section theme-section--visualizations">
          <header class="theme-section__header">
            <h3 class="theme-section__title">Color Analysis</h3>
          </header>

          <div class="visualizations-grid">
            ${renderColorGradient(currentColor)}
            ${renderShadeMatrix(currentColor)}
            ${renderColorHarmonies(currentColor)}
            ${renderColorPresets()}
          </div>
        </section>

        <!-- Theme Settings Section -->
        <section class="theme-section theme-section--collapsible" data-section="theme-settings">
          <h3 class="theme-section__title" data-toggle>
            <span class="theme-section__icon">⚙️</span>
            <span>Theme Settings</span>
            <span class="theme-section__arrow">▼</span>
          </h3>

          <div class="theme-section__content" data-content>
            <!-- Theme Mode -->
            <div class="theme-setting-group">
              <label class="theme-setting__label">Theme Mode</label>
              <div class="theme-setting__options">
                ${['auto', 'light', 'dark'].map(mode => `
                  <label class="theme-radio">
                    <input
                      type="radio"
                      name="theme-mode"
                      value="${mode}"
                      ${theme.mode === mode ? 'checked' : ''}
                      data-mode-radio
                    />
                    <span>${capitalizeFirst(mode)}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <!-- Neutral Palette -->
            <div class="theme-setting-group">
              <label class="theme-setting__label">Neutral Palette</label>
              <div class="theme-setting__options">
                ${['slate', 'gray', 'zinc', 'neutral', 'stone'].map(neutral => `
                  <label class="theme-radio">
                    <input
                      type="radio"
                      name="neutral-palette"
                      value="${neutral}"
                      ${theme.neutral === neutral ? 'checked' : ''}
                      data-neutral-radio
                    />
                    <span>${capitalizeFirst(neutral)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer class="theme-editor__footer">
        <button
          class="theme-editor__button theme-editor__button--secondary"
          data-reset-btn
          disabled
        >
          Reset
        </button>
        <button
          class="theme-editor__button theme-editor__button--primary"
          data-save-btn
          disabled
        >
          💾 Save Changes
        </button>
      </footer>
    </div>
  `;
}

/**
 * Utility: Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Initialize all components
 */
function initializeComponents(
  container: HTMLElement,
  theme: ThemeConfig,
  state: EditorState
): Array<() => void> {
  const cleanupFunctions: Array<() => void> = [];

  // Initialize color cards
  const cardsContainer = container.querySelector('[data-color-cards]') as HTMLElement;
  if (cardsContainer) {
    initColorCard(cardsContainer);
  }

  // Initialize shared color picker
  const pickerContainer = container.querySelector('[data-color-picker-container]') as HTMLElement;
  if (pickerContainer) {
    const currentColor = state.activeColor === 'primary' ? theme.brand_primary : (theme.brand_secondary || rotateHue(theme.brand_primary, 180));
    const configKey = state.activeColor === 'primary' ? 'brand_primary' : 'brand_secondary';

    pickerContainer.innerHTML = createColorPickerHTML(
      `${state.activeColor}-color`,
      `${capitalizeFirst(state.activeColor)} Color`,
      currentColor
    );

    const pickerEl = pickerContainer.querySelector('[data-picker]') as HTMLElement;
    if (pickerEl) {
      const cleanup = initColorPicker(
        pickerEl,
        currentColor,
        configKey,
        (color: OklchColor) => {
          updateConfig(configKey, color);
        }
      );
      cleanupFunctions.push(cleanup);
    }
  }

  // Initialize color presets
  const presetsContainer = container.querySelector('.color-presets') as HTMLElement;
  if (presetsContainer) {
    initColorPresets(presetsContainer, state.activeColor);
  }

  return cleanupFunctions;
}

/**
 * Setup event listeners for UI controls
 */
function setupEventListeners(container: HTMLElement, state: EditorState): void {
  const saveBtn = container.querySelector('[data-save-btn]') as HTMLButtonElement;
  const resetBtn = container.querySelector('[data-reset-btn]') as HTMLButtonElement;
  const modeRadios = container.querySelectorAll('[data-mode-radio]');
  const neutralRadios = container.querySelectorAll('[data-neutral-radio]');
  const secondaryToggle = container.querySelector('[data-secondary-toggle]') as HTMLInputElement;

  // Setup collapsible sections
  setupCollapsibleSections(container);

  // Save button
  if (saveBtn) {
    const handleSave = async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      const success = await saveConfig();

      saveBtn.disabled = !isDirtyConfig();
      saveBtn.textContent = '💾 Save Changes';

      if (success) {
        showSuccessMessage(container, 'Theme saved successfully!');
      } else {
        showErrorMessage(container, 'Failed to save theme');
      }
    };

    saveBtn.addEventListener('click', () => {
      void handleSave();
    });
  }

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all changes? This cannot be undone.')) {
        resetConfig();
      }
    });
  }

  // Mode radio buttons
  modeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const input = radio as HTMLInputElement;
      if (input.checked) {
        updateConfig('mode', input.value as 'light' | 'dark' | 'auto');
      }
    });
  });

  // Neutral radio buttons
  neutralRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const input = radio as HTMLInputElement;
      if (input.checked) {
        updateConfig('neutral', input.value as 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone');
      }
    });
  });

  // Secondary color toggle
  if (secondaryToggle) {
    secondaryToggle.addEventListener('change', () => {
      if (secondaryToggle.checked) {
        // Enable secondary color - generate complementary from primary
        const theme = getConfig();
        if (!theme) return;
        const secondary = rotateHue(theme.brand_primary, 180);
        updateConfig('brand_secondary', secondary);
        state.isSecondaryEnabled = true;
      } else {
        // Disable secondary color
        updateConfig('brand_secondary', null);
        state.isSecondaryEnabled = false;
        // Switch to primary if we were editing secondary
        if (state.activeColor === 'secondary') {
          state.activeColor = 'primary';
        }
      }
      emit(EventName.SECONDARY_COLOR_TOGGLE, { enabled: secondaryToggle.checked });
      // Re-render to update UI
      const theme = getConfig();
      if (!theme) return;
      renderEditor(container, theme, state);
      initializeComponents(container, theme, state);
      setupEventListeners(container, state);
    });
  }

  // Listen for active color change
  on(EventName.ACTIVE_COLOR_CHANGE, ({ activeColor }) => {
    state.activeColor = activeColor;
    const theme = getConfig();
    if (!theme) return;
    renderEditor(container, theme, state);
    initializeComponents(container, theme, state);
    setupEventListeners(container, state);
  });

  // Listen for preset selection
  on(EventName.COLOR_PRESET_SELECT, ({ preset, targetColor }) => {
    const key = targetColor === 'primary' ? 'brand_primary' : 'brand_secondary';
    updateConfig(key, preset.color);
  });

  // Listen to config dirty state changes
  on(EventName.CONFIG_DIRTY, ({ isDirty }) => {
    if (saveBtn) saveBtn.disabled = !isDirty;
    if (resetBtn) resetBtn.disabled = !isDirty;
  });

  // Listen to config reset events
  on(EventName.CONFIG_RESET, ({ theme }) => {
    state.isSecondaryEnabled = theme.brand_secondary !== null && theme.brand_secondary !== undefined;
    renderEditor(container, theme, state);
    initializeComponents(container, theme, state);
    setupEventListeners(container, state);
  });
}

/**
 * Show loading state
 */
function showLoadingState(container: HTMLElement): void {
  container.innerHTML = `
    <div class="theme-editor__loading">
      <div class="theme-editor__spinner"></div>
      <p>Loading theme configuration...</p>
    </div>
  `;
}

/**
 * Show error state
 */
function showErrorState(container: HTMLElement, message: string): void {
  container.innerHTML = `
    <div class="theme-editor__error">
      <p class="theme-editor__error-message">${message}</p>
      <button onclick="window.location.reload()">Reload</button>
    </div>
  `;
}

/**
 * Show success message (temporary)
 */
function showSuccessMessage(container: HTMLElement, message: string): void {
  const toast = document.createElement('div');
  toast.className = 'theme-editor__toast theme-editor__toast--success';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

/**
 * Show error message (temporary)
 */
function showErrorMessage(container: HTMLElement, message: string): void {
  const toast = document.createElement('div');
  toast.className = 'theme-editor__toast theme-editor__toast--error';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 5000);
}

/**
 * Setup collapsible sections
 */
function setupCollapsibleSections(container: HTMLElement): void {
  const sections = container.querySelectorAll('[data-section]');

  sections.forEach(section => {
    const toggle = section.querySelector('[data-toggle]') as HTMLElement;
    const content = section.querySelector('[data-content]') as HTMLElement;
    const arrow = section.querySelector('.theme-editor__section-arrow') as HTMLElement;

    if (!toggle || !content) return;

    // Start with sections expanded
    section.classList.add('is-expanded');

    toggle.addEventListener('click', () => {
      const isExpanded = section.classList.contains('is-expanded');

      if (isExpanded) {
        // Collapse
        section.classList.remove('is-expanded');
        section.classList.add('is-collapsed');
        if (arrow) arrow.textContent = '▶';
      } else {
        // Expand
        section.classList.remove('is-collapsed');
        section.classList.add('is-expanded');
        if (arrow) arrow.textContent = '▼';
      }
    });

    // Add hover effect
    toggle.style.cursor = 'pointer';
  });
}

