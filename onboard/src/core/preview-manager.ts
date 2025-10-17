/**
 * =============================================================================
 * Preview Manager
 * =============================================================================
 * Manages live theme preview updates
 * Injects CSS custom properties and handles iframe communication
 * =============================================================================
 */

import type { ThemeConfig } from '../types/config.types.js';
import { toCssColor } from '../utils/color-convert.js';
import { generatePalette } from '../utils/palette-generator.js';
import { on } from '../core/event-bus.js';
import { EventName } from '../types/events.types.js';

/**
 * Preview manager state
 */
interface PreviewState {
  currentTheme: ThemeConfig | null;
  targetElement: HTMLElement | null;
  isIframe: boolean;
}

const state: PreviewState = {
  currentTheme: null,
  targetElement: null,
  isIframe: false
};

/**
 * Initialize preview manager
 *
 * @param target - Target element or iframe selector
 * @returns Cleanup function
 *
 * @example
 * // For same-page preview
 * const cleanup = initPreviewManager('#preview-container');
 *
 * // For iframe preview
 * const cleanup = initPreviewManager('#preview-iframe');
 */
export function initPreviewManager(targetSelector: string): () => void {
  const target = document.querySelector(targetSelector);

  if (!target) {
    console.error(`Preview manager: target "${targetSelector}" not found`);
    return () => {};
  }

  // Determine if target is an iframe
  state.isIframe = target.tagName === 'IFRAME';

  if (state.isIframe) {
    const iframe = target as HTMLIFrameElement;
    // Wait for iframe to load
    iframe.addEventListener('load', () => {
      state.targetElement = iframe.contentDocument?.documentElement || null;
      if (state.currentTheme) {
        applyTheme(state.currentTheme);
      }
    });
  } else {
    state.targetElement = target as HTMLElement;
  }

  // Listen to config events
  const unsubscribeLoaded = on(EventName.CONFIG_LOADED, ({ theme }) => {
    state.currentTheme = theme;
    applyTheme(theme);
  });

  const unsubscribeChange = on(EventName.CONFIG_CHANGE, ({ theme }) => {
    state.currentTheme = theme;
    applyTheme(theme);
  });

  const unsubscribeReset = on(EventName.CONFIG_RESET, ({ theme }) => {
    state.currentTheme = theme;
    applyTheme(theme);
  });

  // Cleanup
  return () => {
    unsubscribeLoaded();
    unsubscribeChange();
    unsubscribeReset();
    state.targetElement = null;
    state.currentTheme = null;
  };
}

/**
 * Apply theme to preview target
 */
function applyTheme(theme: ThemeConfig): void {
  if (!state.targetElement) {
    console.warn('Preview manager: no target element');
    return;
  }

  // Generate CSS custom properties
  const cssVars = generateCSSVariables(theme);

  // Apply to target element
  if (state.targetElement) {
    const { targetElement } = state;
    Object.entries(cssVars).forEach(([property, value]) => {
      targetElement.style.setProperty(property, value);
    });

    // Update data-theme attribute
    targetElement.setAttribute('data-theme', theme.mode);
  }
}

/**
 * Generate CSS custom properties from theme config
 *
 * @param theme - Theme configuration
 * @returns CSS custom properties object
 *
 * @example
 * const vars = generateCSSVariables(theme);
 * // { '--color-primary': 'oklch(60% 0.18 262deg)', ... }
 */
export function generateCSSVariables(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};

  // Generate primary color palette
  const primaryPalette = generatePalette(theme.brand_primary);
  Object.entries(primaryPalette).forEach(([shade, cssColor]: [string, string]) => {
    vars[`--color-primary-${shade}`] = cssColor;
  });

  // Base primary color
  vars['--color-primary'] = toCssColor(theme.brand_primary);

  // Generate secondary color palette (if exists)
  if (theme.brand_secondary) {
    const secondaryPalette = generatePalette(theme.brand_secondary);
    Object.entries(secondaryPalette).forEach(([shade, cssColor]: [string, string]) => {
      vars[`--color-secondary-${shade}`] = cssColor;
    });
    vars['--color-secondary'] = toCssColor(theme.brand_secondary);
  }

  // Neutral palette selection
  vars['--neutral-palette'] = theme.neutral;

  // Theme mode
  vars['--theme-mode'] = theme.mode;

  return vars;
}

/**
 * Inject CSS variables into a style element
 *
 * @param theme - Theme configuration
 * @param targetDocument - Target document (default: current document)
 * @returns Style element
 *
 * @example
 * const styleEl = injectThemeStyles(theme);
 * // Appends <style> with CSS variables to document head
 */
export function injectThemeStyles(
  theme: ThemeConfig,
  targetDocument: Document = document
): HTMLStyleElement {
  // Remove existing theme style element
  const existingStyle = targetDocument.getElementById('theme-preview-styles');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Generate CSS variables
  const vars = generateCSSVariables(theme);

  // Create CSS text
  const cssText = `:root {
${Object.entries(vars)
  .map(([property, value]) => `  ${property}: ${value};`)
  .join('\n')}
}`;

  // Create and inject style element
  const styleEl = targetDocument.createElement('style');
  styleEl.id = 'theme-preview-styles';
  styleEl.textContent = cssText;
  targetDocument.head.appendChild(styleEl);

  return styleEl;
}

/**
 * Update preview with partial theme changes
 *
 * @param updates - Partial theme configuration
 *
 * @example
 * updatePreview({ mode: 'dark' });
 */
export function updatePreview(updates: Partial<ThemeConfig>): void {
  if (!state.currentTheme) {
    console.warn('Preview manager: no current theme');
    return;
  }

  // Merge updates into current theme
  const updatedTheme = { ...state.currentTheme, ...updates };
  state.currentTheme = updatedTheme;

  applyTheme(updatedTheme);
}

/**
 * Get current preview theme
 *
 * @returns Current theme or null
 */
export function getPreviewTheme(): ThemeConfig | null {
  return state.currentTheme ? { ...state.currentTheme } : null;
}

/**
 * Reload preview (for iframe targets)
 *
 * @example
 * reloadPreview(); // Refreshes iframe
 */
export function reloadPreview(): void {
  if (!state.isIframe || !state.targetElement) {
    console.warn('Preview manager: cannot reload non-iframe target');
    return;
  }

  const iframe = state.targetElement.ownerDocument?.defaultView?.frameElement as HTMLIFrameElement;
  if (iframe && iframe.src) {
    iframe.src = iframe.src; // Force reload
  }
}

/**
 * Export current theme as CSS file
 *
 * @param filename - Output filename
 *
 * @example
 * exportThemeCSS('my-theme.css');
 */
export function exportThemeCSS(filename: string = 'theme.css'): void {
  if (!state.currentTheme) {
    console.warn('Preview manager: no current theme to export');
    return;
  }

  const vars = generateCSSVariables(state.currentTheme);

  const cssText = `:root {
${Object.entries(vars)
  .map(([property, value]) => `  ${property}: ${value};`)
  .join('\n')}
}`;

  // Create blob and download
  const blob = new Blob([cssText], { type: 'text/css' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
