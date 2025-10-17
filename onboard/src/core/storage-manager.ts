/**
 * =============================================================================
 * Storage Manager (localStorage with Expiration)
 * =============================================================================
 * Manages draft state persistence across tab navigation
 * Prevents data loss when switching between Theme/Content/Structure tabs
 * =============================================================================
 */

/**
 * Storage keys (tokenized)
 */
const STORAGE_KEYS = {
  THEME_DRAFT: 'onboard:draft:theme',
  HERO_DRAFT: 'onboard:draft:hero',
  SERVICES_DRAFT: 'onboard:draft:services',
  PORTFOLIO_DRAFT: 'onboard:draft:portfolio',
  ACTIVE_TAB: 'onboard:active-tab'
} as const;

/**
 * Draft expiration (24 hours in milliseconds)
 */
const DRAFT_EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Draft wrapper interface
 */
interface Draft<T> {
  data: T;
  timestamp: number;
  expires: number;
}

/**
 * Check if localStorage is available
 *
 * @returns true if localStorage is supported and accessible
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save draft data to localStorage
 *
 * @param key - Storage key
 * @param data - Data to save
 *
 * @example
 * saveDraft(STORAGE_KEYS.THEME_DRAFT, themeConfig);
 */
export function saveDraft<T>(key: string, data: T): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available');
    return;
  }

  try {
    const draft: Draft<T> = {
      data,
      timestamp: Date.now(),
      expires: Date.now() + DRAFT_EXPIRATION_MS
    };

    localStorage.setItem(key, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

/**
 * Load draft data from localStorage
 *
 * @param key - Storage key
 * @returns Draft data or null if expired/not found
 *
 * @example
 * const theme = loadDraft<ThemeConfig>(STORAGE_KEYS.THEME_DRAFT);
 */
export function loadDraft<T>(key: string): T | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const draft = JSON.parse(item) as Draft<T>;

    // Check expiration
    if (Date.now() > draft.expires) {
      localStorage.removeItem(key);
      return null;
    }

    return draft.data;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
}

/**
 * Clear draft data from localStorage
 *
 * @param key - Storage key
 *
 * @example
 * clearDraft(STORAGE_KEYS.THEME_DRAFT);
 */
export function clearDraft(key: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
}

/**
 * Clear all drafts
 *
 * @example
 * clearAllDrafts(); // Clear everything on successful save
 */
export function clearAllDrafts(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    clearDraft(key);
  });
}

/**
 * Save active tab selection
 *
 * @param tabId - Tab identifier (theme, content, structure, preview)
 *
 * @example
 * saveActiveTab('content');
 */
export function saveActiveTab(tabId: string): void {
  if (!isLocalStorageAvailable()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
  } catch (error) {
    console.error('Failed to save active tab:', error);
  }
}

/**
 * Load active tab selection
 *
 * @returns Tab identifier or null
 *
 * @example
 * const lastTab = loadActiveTab();
 * if (lastTab) switchToTab(lastTab);
 */
export function loadActiveTab(): string | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
  } catch (error) {
    console.error('Failed to load active tab:', error);
    return null;
  }
}

/**
 * Check if a draft exists
 *
 * @param key - Storage key
 * @returns true if valid draft exists
 *
 * @example
 * if (hasDraft(STORAGE_KEYS.THEME_DRAFT)) {
 *   console.log('Unsaved theme changes detected!');
 * }
 */
export function hasDraft(key: string): boolean {
  return loadDraft(key) !== null;
}

/**
 * Get draft age in milliseconds
 *
 * @param key - Storage key
 * @returns Age in milliseconds or null if no draft
 *
 * @example
 * const age = getDraftAge(STORAGE_KEYS.THEME_DRAFT);
 * if (age && age > 3600000) {
 *   console.log('Draft is over 1 hour old');
 * }
 */
export function getDraftAge(key: string): number | null {
  if (!isLocalStorageAvailable()) return null;

  try {
    const item = localStorage.getItem(key);
    if (!item) return null;

    const draft = JSON.parse(item) as { timestamp: number };
    return Date.now() - draft.timestamp;
  } catch {
    return null;
  }
}

/**
 * Export storage keys for external use
 */
export { STORAGE_KEYS };
