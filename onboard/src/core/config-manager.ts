/**
 * =============================================================================
 * Config Manager (State Management)
 * =============================================================================
 * Manages theme configuration state, API interactions, and dirty state tracking
 * Functional architecture with private state
 * =============================================================================
 */

import type { ThemeConfig, ConfigResponse } from '../types/config.types.js';
import { EventName } from '../types/events.types.js';
import { emit } from './event-bus.js';
import { saveDraft, loadDraft, clearDraft, STORAGE_KEYS } from './storage-manager.js';

/**
 * Private state
 */
let currentTheme: ThemeConfig | null = null;
let originalTheme: ThemeConfig | null = null;
let isDirty = false;

/**
 * API endpoints (absolute URLs for development API server)
 * Connects to Roda API server on port 4001
 * Full CRUD operations supported with file locking
 */
const API_BASE = 'http://localhost:4001';
const API = {
  GET_CONFIG: `${API_BASE}/api/config`,
  UPDATE_CONFIG: `${API_BASE}/api/config`,
  RESET_CONFIG: `${API_BASE}/api/config/reset`
};

/**
 * Load theme configuration from API
 *
 * @returns Theme config or null if failed
 *
 * @example
 * const theme = await loadConfig();
 * if (theme) {
 *   console.log('Loaded:', theme);
 * }
 */
export async function loadConfig(): Promise<ThemeConfig | null> {
  try {
    const response = await fetch(API.GET_CONFIG);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as ConfigResponse;

    if (!data.success || !data.theme) {
      throw new Error('Invalid API response');
    }

    // Store as original
    originalTheme = data.theme;

    // Check for draft in localStorage
    const draft = loadDraft<ThemeConfig>(STORAGE_KEYS.THEME_DRAFT);

    if (draft) {
      // Restore draft state
      currentTheme = draft;
      isDirty = !isConfigEqual(currentTheme, originalTheme);

      if (isDirty) {
        console.info('Restored unsaved theme changes from localStorage');
        emit(EventName.CONFIG_DIRTY, { isDirty: true });
      }
    } else {
      // No draft, use loaded config
      currentTheme = structuredClone(data.theme);
      isDirty = false;
    }

    // Emit loaded event
    emit(EventName.CONFIG_LOADED, { theme: currentTheme });

    return currentTheme;
  } catch (error) {
    console.error('Failed to load config:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'load'
    });
    return null;
  }
}

/**
 * Get current theme config
 *
 * @returns Current theme or null if not loaded
 *
 * @example
 * const theme = getConfig();
 * if (theme) {
 *   console.log('Current theme:', theme);
 * }
 */
export function getConfig(): ThemeConfig | null {
  return currentTheme ? structuredClone(currentTheme) : null;
}

/**
 * Helper: Deep equality check for values (handles objects)
 */
function isValueEqual(a: unknown, b: unknown): boolean {
  // Same reference or primitive equality
  if (a === b) return true;

  // Handle null/undefined
  if (a == null || b == null) return false;

  // Different types
  if (typeof a !== typeof b) return false;

  // For objects, use JSON comparison (handles nested objects)
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return false;
}

/**
 * Update a single theme property
 *
 * @param key - Theme property key
 * @param value - New value
 *
 * @example
 * updateConfig('brand_primary', { l: 60, c: 0.18, h: 262 });
 */
export function updateConfig<K extends keyof ThemeConfig>(
  key: K,
  value: ThemeConfig[K]
): void {
  if (!currentTheme) {
    console.warn('Cannot update config: not loaded');
    return;
  }

  const previousValue = currentTheme[key];

  // Update current theme
  currentTheme[key] = value;

  // Mark as dirty if changed from original (using deep equality)
  const wasOriginal = originalTheme && isValueEqual(originalTheme[key], previousValue);
  const isOriginal = originalTheme && isValueEqual(originalTheme[key], value);

  if (!isDirty && wasOriginal && !isOriginal) {
    isDirty = true;
    emit(EventName.CONFIG_DIRTY, { isDirty: true });
  } else if (isDirty && !wasOriginal && isOriginal && originalTheme) {
    // Check if all values match original
    isDirty = !isConfigEqual(currentTheme, originalTheme);
    if (!isDirty) {
      emit(EventName.CONFIG_DIRTY, { isDirty: false });
    }
  }

  // Save draft to localStorage
  saveDraft(STORAGE_KEYS.THEME_DRAFT, currentTheme);

  // Emit change event
  emit(EventName.CONFIG_CHANGE, {
    key,
    value,
    previousValue,
    theme: structuredClone(currentTheme)
  });
}

/**
 * Update multiple theme properties at once
 *
 * @param updates - Partial theme config with updates
 *
 * @example
 * updateConfigBatch({
 *   brand_primary: { l: 60, c: 0.18, h: 262 },
 *   mode: 'dark'
 * });
 */
export function updateConfigBatch(updates: Partial<ThemeConfig>): void {
  for (const [key, value] of Object.entries(updates)) {
    updateConfig(key as keyof ThemeConfig, value);
  }
}

/**
 * Check if config has unsaved changes
 *
 * @returns true if dirty (has unsaved changes)
 *
 * @example
 * if (isDirtyConfig()) {
 *   console.warn('You have unsaved changes!');
 * }
 */
export function isDirtyConfig(): boolean {
  return isDirty;
}

/**
 * Save current config to _config.yml via API
 * Uses atomic file write with locking for safety
 *
 * @returns true if saved successfully
 *
 * @example
 * const success = await saveConfig();
 * if (success) {
 *   console.log('Configuration saved to _config.yml!');
 * }
 */
export async function saveConfig(): Promise<boolean> {
  if (!currentTheme) {
    console.warn('Cannot save config: not loaded');
    return false;
  }

  if (!isDirty) {
    console.info('No changes to save');
    return true;
  }

  try {
    emit(EventName.CONFIG_SAVING, undefined);

    // Send theme updates to API
    const response = await fetch(API.UPDATE_CONFIG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        theme: currentTheme
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as { success: boolean; error?: string };

    if (!data.success) {
      throw new Error(data.error || 'Failed to save configuration');
    }

    // Update original to match current (mark as saved)
    originalTheme = structuredClone(currentTheme);
    isDirty = false;

    // Clear draft from localStorage (successfully saved)
    clearDraft(STORAGE_KEYS.THEME_DRAFT);

    // Emit saved event
    emit(EventName.CONFIG_SAVED, {
      theme: currentTheme,
      message: 'Theme configuration saved to _config.yml!'
    });
    emit(EventName.CONFIG_DIRTY, { isDirty: false });

    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'save'
    });
    return false;
  }
}

/**
 * Generate YAML snippet from theme config
 * Creates a formatted YAML block to paste into _config.yml
 *
 * @param theme - Theme configuration
 * @returns YAML formatted string
 *
 * @example
 * const yaml = generateYAMLSnippet(theme);
 * console.log(yaml);
 */
export function generateYAMLSnippet(theme: ThemeConfig): string {
  const lines = [
    '# ============================================================================',
    '# Theme Configuration - Generated by Onboard Dashboard',
    '# ============================================================================',
    '# Copy and paste this into your _config.yml file, replacing the existing',
    '# theme: section (lines starting with "theme:")',
    '# ============================================================================',
    '',
    'theme:',
  ];

  // Brand primary (always present)
  lines.push('  brand_primary:');
  lines.push(`    l: ${theme.brand_primary.l}`);
  lines.push(`    c: ${theme.brand_primary.c}`);
  lines.push(`    h: ${theme.brand_primary.h}`);

  // Brand secondary (optional)
  if (theme.brand_secondary) {
    lines.push('  brand_secondary:');
    lines.push(`    l: ${theme.brand_secondary.l}`);
    lines.push(`    c: ${theme.brand_secondary.c}`);
    lines.push(`    h: ${theme.brand_secondary.h}`);
  } else {
    lines.push('  brand_secondary: null');
  }

  // Neutral and mode
  lines.push(`  neutral: "${theme.neutral}"`);
  lines.push(`  mode: "${theme.mode}"`);

  lines.push('');
  lines.push('# ============================================================================');

  return lines.join('\n');
}

/**
 * Reset config to original (loaded) state
 *
 * @example
 * resetConfig(); // Revert all unsaved changes
 */
export function resetConfig(): void {
  if (!originalTheme) {
    console.warn('Cannot reset config: no original state');
    return;
  }

  currentTheme = structuredClone(originalTheme);
  isDirty = false;

  emit(EventName.CONFIG_RESET, { theme: currentTheme });
  emit(EventName.CONFIG_DIRTY, { isDirty: false });
}

/**
 * Reset config to default values via API
 *
 * @returns true if reset successfully
 *
 * @example
 * const success = await resetToDefaults();
 * if (success) {
 *   console.log('Reset to defaults!');
 * }
 */
export async function resetToDefaults(): Promise<boolean> {
  try {
    const response = await fetch(API.RESET_CONFIG, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as ConfigResponse;

    if (!data.success || !data.theme) {
      throw new Error(data.message || 'Failed to reset configuration');
    }

    // Update both original and current
    originalTheme = data.theme;
    currentTheme = structuredClone(data.theme);
    isDirty = false;

    emit(EventName.CONFIG_RESET, { theme: currentTheme });
    emit(EventName.CONFIG_DIRTY, { isDirty: false });

    return true;
  } catch (error) {
    console.error('Failed to reset to defaults:', error);
    emit(EventName.CONFIG_ERROR, {
      error: error as Error,
      operation: 'reset'
    });
    return false;
  }
}

/**
 * Helper: Check if two theme configs are equal
 */
function isConfigEqual(a: ThemeConfig, b: ThemeConfig): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
