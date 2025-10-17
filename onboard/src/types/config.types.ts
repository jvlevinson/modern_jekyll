/**
 * =============================================================================
 * Configuration Type Definitions
 * =============================================================================
 * Type-safe Jekyll _config.yml structure
 * =============================================================================
 */

import type { OklchColor } from './color.types.js';

/**
 * Theme configuration (stored in _config.yml)
 * Now stores OKLCH values instead of color names
 */
export interface ThemeConfig {
  brand_primary: OklchColor;
  brand_secondary: OklchColor | null;
  neutral: 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone';
  mode: 'light' | 'dark' | 'auto';
}

/**
 * Complete site configuration
 */
export interface SiteConfig {
  theme: ThemeConfig;
  site: {
    title: string;
    author: string;
    email: string;
    description: string;
  };
}

/**
 * API response for config endpoint
 */
export interface ConfigResponse {
  success: boolean;
  theme: ThemeConfig;
  message?: string;
}

/**
 * API request for updating config
 */
export interface ConfigUpdateRequest {
  theme: Partial<ThemeConfig>;
}

/**
 * Build status
 */
export type BuildState = 'idle' | 'running' | 'complete' | 'failed';

/**
 * Build status response
 */
export interface BuildStatus {
  id: string;
  state: BuildState;
  started_at: string;
  completed_at?: string;
  output?: string[];
  error?: string;
}

/**
 * Rebuild trigger response
 */
export interface RebuildResponse {
  buildId: string;
  message: string;
}
