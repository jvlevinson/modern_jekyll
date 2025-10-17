/**
 * =============================================================================
 * Theme Editor - Main Entry Point
 * =============================================================================
 * Initializes the theme editor and preview system
 * Includes hostname security check (localhost-only)
 * =============================================================================
 */

import { initThemeEditor } from './controllers/theme-editor.js';
import { initContentEditor } from './controllers/content-editor.js';
import { initPreviewManager } from './core/preview-manager.js';
import { initDashboardNav } from './dashboard-nav.js';
import { initDebugOverlay } from './utils/debug-overlay.js';

/**
 * Security: Only allow editor on localhost/127.0.0.1
 * This prevents the editor from running on GitHub Pages production
 */
function isLocalhost(): boolean {
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.local')
  );
}

/**
 * Initialize theme editor application
 *
 * @param config - Configuration options
 * @returns Cleanup function
 *
 * @example
 * const cleanup = await initApp({
 *   editorContainerId: 'theme-editor',
 *   previewTargetSelector: '#preview-iframe'
 * });
 */
export async function initApp(config: {
  editorContainerId: string;
  previewTargetSelector?: string;
}): Promise<() => void> {
  // Security check: only run on localhost
  if (!isLocalhost()) {
    console.warn('Theme editor is disabled (not running on localhost)');
    return () => {};
  }

  const { editorContainerId, previewTargetSelector } = config;

  // Initialize theme editor
  const cleanupEditor = await initThemeEditor(editorContainerId);

  // Initialize preview manager (if target provided)
  let cleanupPreview: (() => void) | null = null;
  if (previewTargetSelector) {
    cleanupPreview = initPreviewManager(previewTargetSelector);
  }

  // Return cleanup function
  return () => {
    cleanupEditor();
    cleanupPreview?.();
  };
}

/**
 * Auto-initialization when DOM is ready
 * Looks for data-theme-editor and data-preview-target attributes
 */
function autoInit(): void {
  // Security check
  if (!isLocalhost()) {
    return;
  }

  // Wait for DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
    return;
  }

  // Initialize dashboard navigation (tab switching)
  initDashboardNav();

  // Debug overlay (localhost only)
  initDebugOverlay();

  // Initialize theme editor
  const editorContainer = document.querySelector('[data-theme-editor]');
  if (editorContainer && editorContainer.id) {
    const editorId = editorContainer.id;

    // Look for preview target
    const previewTarget = document.querySelector('[data-preview-target]');
    const previewSelector = previewTarget
      ? `#${previewTarget.id || ''}`
      : undefined;

    // Initialize theme editor
    initApp({
      editorContainerId: editorId,
      previewTargetSelector: previewSelector
    }).catch(error => {
      console.error('Failed to initialize theme editor:', error);
    });
  } else {
    console.info('Theme editor: no [data-theme-editor] container found');
  }

  // Initialize content editor (Phase 8)
  const contentEditorContainer = document.querySelector('[data-content-editor]');
  if (contentEditorContainer && contentEditorContainer.id) {
    initContentEditor(contentEditorContainer.id).catch(error => {
      console.error('Failed to initialize content editor:', error);
    });
  } else {
    console.info('Content editor: no [data-content-editor] container found');
  }
}

// Auto-initialize
autoInit();

/**
 * Public API exports
 * These can be used by external scripts if needed
 */
export { initThemeEditor } from './controllers/theme-editor.js';
export { initContentEditor } from './controllers/content-editor.js';
export { initPreviewManager, generateCSSVariables, exportThemeCSS } from './core/preview-manager.js';
export { loadConfig, saveConfig, resetConfig, updateConfig } from './core/config-manager.js';
export { on, emit } from './core/event-bus.js';
export { EventName } from './types/events.types.js';
export type { ThemeConfig } from './types/config.types.js';
export type { OklchColor, ColorPalette } from './types/color.types.js';
export type { HeroData, ServicesData, PortfolioData } from './types/content.types.js';
