/**
 * =============================================================================
 * Event Type Definitions
 * =============================================================================
 * Type-safe event payloads for EventBus
 * =============================================================================
 */

import type { OklchColor, ColorPalette, ActiveColorKey, ColorPreset } from './color.types.js';
import type { ThemeConfig, BuildStatus } from './config.types.js';

/**
 * Event names (type-safe)
 */
export enum EventName {
  // Config events
  CONFIG_LOADED = 'config:loaded',
  CONFIG_CHANGE = 'config:change',
  CONFIG_DIRTY = 'config:dirty',
  CONFIG_SAVING = 'config:saving',
  CONFIG_SAVED = 'config:saved',
  CONFIG_RESET = 'config:reset',
  CONFIG_ERROR = 'config:error',

  // Color picker events
  COLOR_CHANGE = 'color:change',
  PALETTE_GENERATED = 'palette:generated',

  // Preview events
  PREVIEW_UPDATE = 'preview:update',
  PREVIEW_RELOAD = 'preview:reload',

  // Rebuild events
  REBUILD_STARTED = 'rebuild:started',
  REBUILD_STATUS = 'rebuild:status',
  REBUILD_COMPLETE = 'rebuild:complete',
  REBUILD_ERROR = 'rebuild:error',

  // Active color selection
  ACTIVE_COLOR_CHANGE = 'active-color:change',

  // Secondary color toggle
  SECONDARY_COLOR_TOGGLE = 'secondary-color:toggle',

  // Preset selection
  COLOR_PRESET_SELECT = 'color-preset:select',
}

/**
 * Event payloads
 */

export interface ConfigLoadedPayload {
  theme: ThemeConfig;
}

export interface ConfigChangePayload {
  key: keyof ThemeConfig;
  value: unknown;
  previousValue: unknown;
  theme: ThemeConfig;
}

export interface ConfigDirtyPayload {
  isDirty: boolean;
}

export interface ConfigSavedPayload {
  theme?: ThemeConfig;
  message?: string;
  section?: string;
  data?: unknown;
}

export interface ConfigResetPayload {
  theme: ThemeConfig;
}

export interface ConfigErrorPayload {
  error: Error;
  operation: 'load' | 'save' | 'reset' | 'getHero' | 'updateHero' | 'getServices' | 'updateServices' | 'getPortfolio' | 'updatePortfolio' | 'upload';
}

export interface ColorChangePayload {
  color: OklchColor;
  previousColor: OklchColor;
  key: 'brand_primary' | 'brand_secondary';
}

export interface PaletteGeneratedPayload {
  palette: ColorPalette;
  baseColor: OklchColor;
}

export interface PreviewUpdatePayload {
  theme: Partial<ThemeConfig>;
}

export interface RebuildStatusPayload {
  status: BuildStatus;
}

export interface ActiveColorChangePayload {
  activeColor: ActiveColorKey;
}

export interface SecondaryColorTogglePayload {
  enabled: boolean;
}

export interface ColorPresetSelectPayload {
  preset: ColorPreset;
  targetColor: ActiveColorKey;
}

/**
 * Event handler type
 */
export type EventHandler<T = unknown> = (payload: T) => void;

/**
 * Event map (maps event names to payload types)
 */
export interface EventMap {
  [EventName.CONFIG_LOADED]: ConfigLoadedPayload;
  [EventName.CONFIG_CHANGE]: ConfigChangePayload;
  [EventName.CONFIG_DIRTY]: ConfigDirtyPayload;
  [EventName.CONFIG_SAVING]: void;
  [EventName.CONFIG_SAVED]: ConfigSavedPayload;
  [EventName.CONFIG_RESET]: ConfigResetPayload;
  [EventName.CONFIG_ERROR]: ConfigErrorPayload;
  [EventName.COLOR_CHANGE]: ColorChangePayload;
  [EventName.PALETTE_GENERATED]: PaletteGeneratedPayload;
  [EventName.PREVIEW_UPDATE]: PreviewUpdatePayload;
  [EventName.PREVIEW_RELOAD]: void;
  [EventName.REBUILD_STARTED]: void;
  [EventName.REBUILD_STATUS]: RebuildStatusPayload;
  [EventName.REBUILD_COMPLETE]: BuildStatus;
  [EventName.REBUILD_ERROR]: Error;
  [EventName.ACTIVE_COLOR_CHANGE]: ActiveColorChangePayload;
  [EventName.SECONDARY_COLOR_TOGGLE]: SecondaryColorTogglePayload;
  [EventName.COLOR_PRESET_SELECT]: ColorPresetSelectPayload;
}
