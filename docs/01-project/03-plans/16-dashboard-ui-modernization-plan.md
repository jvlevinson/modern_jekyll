# Dashboard UI Modernization - Comprehensive Implementation Plan

**Date**: October 16, 2025
**Phase**: 7 (Theme Editor Enhancement)
**Status**: Awaiting Approval
**Estimated Time**: 7-11 hours
**Estimated Bundle Impact**: +15-20 KB

---

## Executive Summary

This plan outlines the complete modernization of the Onboard Dashboard theme editor, implementing:

1. **Restructured Brand Colors Section**
   - Move secondary color toggle to section header level
   - Display primary/secondary as side-by-side cards
   - Implement shared color picker (one picker for both colors)
   - Active color selection state

2. **Modern Color Visualizations**
   - Gradient squares (9-step light-to-dark progression)
   - Shade matrix (TailwindCSS-style: 50, 100, 200...950)
   - Color harmonies (complementary, triadic, analogous)
   - Quick color presets

3. **Architectural Principles Maintained**
   - ✅ Tokenized: All constants extracted
   - ✅ Variabilized: CSS custom properties
   - ✅ Templatized: HTML string templates
   - ✅ Atomic: Self-contained components
   - ✅ Modular: Clear separation of concerns
   - ✅ Cascading: Design tokens flow from root
   - ✅ First-party: Zero new dependencies

---

## Completed Quick Fixes

### 1. Phase 7 Badge Removal
**File**: [onboard/index.html:21](onboard/index.html#L21)
**Status**: ✅ Complete

```html
<!-- BEFORE -->
<div class="dashboard__badges">
  <span class="dashboard__badge dashboard__badge--info">Phase 7</span>
  <span class="dashboard__badge dashboard__badge--warning">Editor Mode</span>
</div>

<!-- AFTER -->
<div class="dashboard__badges">
  <span class="dashboard__badge dashboard__badge--warning">Editor Mode</span>
</div>
```

### 2. Horizontal Tab Layout Fix
**File**: [onboard/assets/dashboard.css:179-232](onboard/assets/dashboard.css#L179)
**Status**: ✅ Complete

```css
/* Added explicit horizontal layout */
.dashboard__nav-tabs {
  display: flex;
  flex-direction: row;  /* NEW */
  gap: 0;
  flex: 1;
  overflow-x: auto;
  align-items: stretch;  /* NEW */
}

.dashboard__nav-item {
  flex: 1 1 auto;  /* CHANGED: allow shrink */
  min-width: 100px;  /* CHANGED: reduced from 120px */
  max-width: 200px;  /* NEW: prevent over-stretch */
  white-space: nowrap;  /* NEW: prevent wrapping */
  /* ... rest */
}
```

---

## Architecture Overview

### Technology Stack (No Changes)
- **TypeScript 5.9.3** (strict mode, ES2022)
- **SCSS** (BEM methodology, 7-1 architecture)
- **OKLCH color space** (Culori 4.0.2 library - already installed)
- **Event Bus** (pub/sub pattern for state management)
- **LocalStorage** (state persistence with 24h expiration)

### Design Principles Applied

#### 1. Tokenization
All magic numbers and configuration extracted to constants:

```typescript
// onboard/src/utils/color-constants.ts (NEW FILE)
export const COLOR_CONSTANTS = {
  GRADIENT_STEPS: 9,
  SHADE_SCALE: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  HARMONY_ANGLES: {
    COMPLEMENTARY: 180,
    TRIADIC: 120,
    ANALOGOUS: 30,
  },
  LIGHTNESS_RANGE: { MIN: 15, MAX: 95 },
  CHROMA_RANGE: { MIN: 0, MAX: 0.37 },
} as const;
```

#### 2. Variabilization
All styling uses CSS custom properties:

```scss
// _sass/onboard/components/_color-card.scss (NEW FILE)
.color-card {
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  transition: all var(--transition-base);

  &--active {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }
}
```

#### 3. Atomic Components
Each component is self-contained with single responsibility:

- `color-card.ts` - Displays color with metadata (hex, OKLCH values)
- `color-gradient.ts` - Shows 9-step light-to-dark progression
- `shade-matrix.ts` - Renders TailwindCSS-style color scale
- `color-harmonies.ts` - Calculates and displays color relationships
- `color-presets.ts` - Quick color selection grid
- `color-theory.ts` - Pure utility functions for color calculations

#### 4. Event-Driven Architecture
All component communication via event bus:

```typescript
// Select color card -> emit event
emit(EventName.ACTIVE_COLOR_CHANGE, {
  activeColor: 'primary'
});

// Color picker listens -> updates selected color
on(EventName.ACTIVE_COLOR_CHANGE, ({ activeColor }) => {
  updateColorPicker(activeColor);
});
```

---

## Phase 1: Foundation (1-2 hours)

### 1.1 Type Definitions
**File**: [onboard/src/types/color.types.ts](onboard/src/types/color.types.ts)
**Action**: Add new types
**Lines Added**: ~40

```typescript
/**
 * Active color selection (which color is being edited)
 */
export type ActiveColorKey = 'primary' | 'secondary';

/**
 * Color harmony type
 */
export type HarmonyType = 'complementary' | 'triadic' | 'analogous';

/**
 * Color harmony result
 */
export interface ColorHarmony {
  type: HarmonyType;
  colors: OklchColor[];
  names: string[];
}

/**
 * Shade scale step (TailwindCSS-compatible)
 */
export interface ShadeScale {
  weight: number;  // 50, 100, 200...950
  color: OklchColor;
  hex: string;
}

/**
 * Quick preset color
 */
export interface ColorPreset {
  name: string;
  color: OklchColor;
  hex: string;
  category: 'vibrant' | 'pastel' | 'neutral' | 'dark';
}
```

### 1.2 Event Definitions
**File**: [onboard/src/types/events.types.ts](onboard/src/types/events.types.ts)
**Action**: Add new events
**Lines Added**: ~30

```typescript
/**
 * Event names (type-safe)
 */
export enum EventName {
  // ... existing events ...

  // NEW: Active color selection
  ACTIVE_COLOR_CHANGE = 'active-color:change',

  // NEW: Secondary color toggle
  SECONDARY_COLOR_TOGGLE = 'secondary-color:toggle',

  // NEW: Preset selection
  COLOR_PRESET_SELECT = 'color-preset:select',
}

/**
 * Event payloads
 */
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
 * Event map (maps event names to payload types)
 */
export interface EventMap {
  // ... existing mappings ...

  [EventName.ACTIVE_COLOR_CHANGE]: ActiveColorChangePayload;
  [EventName.SECONDARY_COLOR_TOGGLE]: SecondaryColorTogglePayload;
  [EventName.COLOR_PRESET_SELECT]: ColorPresetSelectPayload;
}
```

### 1.3 Color Constants
**File**: `onboard/src/utils/color-constants.ts` (NEW)
**Lines**: ~120

```typescript
/**
 * =============================================================================
 * Color Constants
 * =============================================================================
 * Tokenized configuration for color system
 * =============================================================================
 */

import type { ColorPreset, OklchColor } from '../types/color.types.js';

/**
 * Color system configuration
 */
export const COLOR_CONSTANTS = {
  /**
   * Gradient visualization
   */
  GRADIENT_STEPS: 9,
  GRADIENT_LIGHTNESS_MIN: 20,
  GRADIENT_LIGHTNESS_MAX: 95,

  /**
   * Shade matrix (TailwindCSS-compatible)
   */
  SHADE_SCALE: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const,
  SHADE_LIGHTNESS_MAP: {
    50: 0.97,
    100: 0.93,
    200: 0.85,
    300: 0.73,
    400: 0.60,
    500: 0.50,
    600: 0.42,
    700: 0.35,
    800: 0.28,
    900: 0.22,
    950: 0.15,
  } as const,

  /**
   * Color harmonies
   */
  HARMONY_ANGLES: {
    COMPLEMENTARY: 180,
    TRIADIC: 120,
    ANALOGOUS: 30,
  } as const,

  /**
   * OKLCH bounds
   */
  LIGHTNESS_RANGE: { MIN: 0.15, MAX: 0.95 } as const,
  CHROMA_RANGE: { MIN: 0, MAX: 0.37 } as const,
  HUE_RANGE: { MIN: 0, MAX: 360 } as const,

  /**
   * Color card dimensions
   */
  COLOR_CARD_HEIGHT: '120px',
  COLOR_GRADIENT_HEIGHT: '40px',
  SHADE_CELL_SIZE: '48px',
  HARMONY_CIRCLE_SIZE: '64px',
} as const;

/**
 * Quick color presets
 */
export const COLOR_PRESETS: ColorPreset[] = [
  // Vibrant
  { name: 'Electric Blue', color: { l: 0.55, c: 0.25, h: 250 }, hex: '#0066ff', category: 'vibrant' },
  { name: 'Vivid Red', color: { l: 0.55, c: 0.25, h: 25 }, hex: '#ff3333', category: 'vibrant' },
  { name: 'Bright Green', color: { l: 0.60, c: 0.22, h: 145 }, hex: '#00cc66', category: 'vibrant' },
  { name: 'Purple', color: { l: 0.50, c: 0.24, h: 300 }, hex: '#9933ff', category: 'vibrant' },
  { name: 'Orange', color: { l: 0.65, c: 0.20, h: 50 }, hex: '#ff8800', category: 'vibrant' },
  { name: 'Cyan', color: { l: 0.65, c: 0.18, h: 200 }, hex: '#00ccff', category: 'vibrant' },

  // Pastel
  { name: 'Soft Pink', color: { l: 0.80, c: 0.12, h: 15 }, hex: '#ffccdd', category: 'pastel' },
  { name: 'Mint', color: { l: 0.85, c: 0.10, h: 150 }, hex: '#ccffee', category: 'pastel' },
  { name: 'Lavender', color: { l: 0.75, c: 0.12, h: 290 }, hex: '#ddccff', category: 'pastel' },
  { name: 'Peach', color: { l: 0.80, c: 0.11, h: 40 }, hex: '#ffeedd', category: 'pastel' },

  // Neutral
  { name: 'Slate', color: { l: 0.50, c: 0.02, h: 250 }, hex: '#708090', category: 'neutral' },
  { name: 'Stone', color: { l: 0.55, c: 0.03, h: 60 }, hex: '#8b8680', category: 'neutral' },
  { name: 'Zinc', color: { l: 0.50, c: 0.01, h: 0 }, hex: '#7f7f7f', category: 'neutral' },

  // Dark
  { name: 'Navy', color: { l: 0.25, c: 0.15, h: 260 }, hex: '#001f3f', category: 'dark' },
  { name: 'Forest', color: { l: 0.30, c: 0.12, h: 140 }, hex: '#0d4d2d', category: 'dark' },
  { name: 'Burgundy', color: { l: 0.30, c: 0.18, h: 20 }, hex: '#660033', category: 'dark' },
];
```

### 1.4 Color Theory Utilities
**File**: `onboard/src/utils/color-theory.ts` (NEW)
**Lines**: ~150

```typescript
/**
 * =============================================================================
 * Color Theory Utilities
 * =============================================================================
 * Pure functions for color calculations (harmonies, shades, gradients)
 * =============================================================================
 */

import type { OklchColor, ColorHarmony, HarmonyType, ShadeScale } from '../types/color.types.js';
import { COLOR_CONSTANTS } from './color-constants.js';
import { clampOklch } from './color-convert.js';

/**
 * Generate color harmony (complementary, triadic, analogous)
 */
export function generateHarmony(baseColor: OklchColor, type: HarmonyType): ColorHarmony {
  const { l, c, h } = baseColor;
  const angle = COLOR_CONSTANTS.HARMONY_ANGLES[type.toUpperCase() as keyof typeof COLOR_CONSTANTS.HARMONY_ANGLES];

  let colors: OklchColor[];
  let names: string[];

  switch (type) {
    case 'complementary':
      colors = [
        baseColor,
        clampOklch({ l, c, h: (h + angle) % 360 }),
      ];
      names = ['Base', 'Complement'];
      break;

    case 'triadic':
      colors = [
        baseColor,
        clampOklch({ l, c, h: (h + angle) % 360 }),
        clampOklch({ l, c, h: (h + angle * 2) % 360 }),
      ];
      names = ['Base', 'Triadic 1', 'Triadic 2'];
      break;

    case 'analogous':
      colors = [
        clampOklch({ l, c, h: (h - angle + 360) % 360 }),
        baseColor,
        clampOklch({ l, c, h: (h + angle) % 360 }),
      ];
      names = ['Analogous -30°', 'Base', 'Analogous +30°'];
      break;
  }

  return { type, colors, names };
}

/**
 * Generate shade scale (TailwindCSS-style: 50, 100, 200...950)
 */
export function generateShadeScale(baseColor: OklchColor): ShadeScale[] {
  const { c, h } = baseColor;
  const { SHADE_SCALE, SHADE_LIGHTNESS_MAP } = COLOR_CONSTANTS;

  return SHADE_SCALE.map((weight) => {
    const lightness = SHADE_LIGHTNESS_MAP[weight as keyof typeof SHADE_LIGHTNESS_MAP];
    const color = clampOklch({ l: lightness, c, h });

    return {
      weight,
      color,
      hex: '', // Populated by component using oklchToHex()
    };
  });
}

/**
 * Generate gradient steps (light to dark)
 */
export function generateGradient(baseColor: OklchColor, steps: number = COLOR_CONSTANTS.GRADIENT_STEPS): OklchColor[] {
  const { c, h } = baseColor;
  const { GRADIENT_LIGHTNESS_MIN, GRADIENT_LIGHTNESS_MAX } = COLOR_CONSTANTS;

  const gradient: OklchColor[] = [];
  const step = (GRADIENT_LIGHTNESS_MAX - GRADIENT_LIGHTNESS_MIN) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const l = (GRADIENT_LIGHTNESS_MAX - step * i) / 100;
    gradient.push(clampOklch({ l, c, h }));
  }

  return gradient;
}

/**
 * Adjust color lightness (for hover states, etc.)
 */
export function adjustLightness(color: OklchColor, delta: number): OklchColor {
  return clampOklch({
    l: color.l + delta,
    c: color.c,
    h: color.h,
  });
}

/**
 * Adjust color chroma (saturation)
 */
export function adjustChroma(color: OklchColor, delta: number): OklchColor {
  return clampOklch({
    l: color.l,
    c: color.c + delta,
    h: color.h,
  });
}

/**
 * Rotate hue
 */
export function rotateHue(color: OklchColor, degrees: number): OklchColor {
  return clampOklch({
    l: color.l,
    c: color.c,
    h: (color.h + degrees + 360) % 360,
  });
}
```

---

## Phase 2: Atomic Components (2-3 hours)

### 2.1 Color Card Component
**File**: `onboard/src/components/color-card.ts` (NEW)
**Lines**: ~120

```typescript
/**
 * =============================================================================
 * Color Card Component
 * =============================================================================
 * Displays color as clickable card with metadata
 * =============================================================================
 */

import type { OklchColor, ActiveColorKey } from '../types/color.types.js';
import { oklchToHex } from '../utils/color-convert.js';
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
  const lPercent = Math.round(l * 100);
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
```

### 2.2 Color Gradient Component
**File**: `onboard/src/components/color-gradient.ts` (NEW)
**Lines**: ~80

```typescript
/**
 * =============================================================================
 * Color Gradient Component
 * =============================================================================
 * Displays 9-step light-to-dark gradient
 * =============================================================================
 */

import type { OklchColor } from '../types/color.types.js';
import { generateGradient } from '../utils/color-theory.js';
import { oklchToHex } from '../utils/color-convert.js';
import { COLOR_CONSTANTS } from '../utils/color-constants.js';

/**
 * Render gradient visualization
 */
export function renderColorGradient(baseColor: OklchColor): string {
  const gradient = generateGradient(baseColor, COLOR_CONSTANTS.GRADIENT_STEPS);

  const cells = gradient.map((color, index) => {
    const hex = oklchToHex(color);
    const lightness = Math.round(color.l * 100);

    return `
      <div
        class="color-gradient__cell"
        style="background-color: ${hex}"
        title="Step ${index + 1}: ${hex} (L: ${lightness}%)"
      ></div>
    `;
  }).join('');

  return `
    <div class="color-gradient">
      <div class="color-gradient__header">
        <span class="color-gradient__label">Gradient (Light → Dark)</span>
      </div>
      <div class="color-gradient__cells">${cells}</div>
    </div>
  `;
}
```

### 2.3 Shade Matrix Component
**File**: `onboard/src/components/shade-matrix.ts` (NEW)
**Lines**: ~100

```typescript
/**
 * =============================================================================
 * Shade Matrix Component
 * =============================================================================
 * TailwindCSS-style color scale (50, 100, 200...950)
 * =============================================================================
 */

import type { OklchColor } from '../types/color.types.js';
import { generateShadeScale } from '../utils/color-theory.js';
import { oklchToHex } from '../utils/color-convert.js';

/**
 * Render shade matrix
 */
export function renderShadeMatrix(baseColor: OklchColor): string {
  const shades = generateShadeScale(baseColor);

  const cells = shades.map(({ weight, color }) => {
    const hex = oklchToHex(color);
    const lightness = Math.round(color.l * 100);

    return `
      <div class="shade-matrix__cell">
        <div
          class="shade-matrix__swatch"
          style="background-color: ${hex}"
          title="${hex} (L: ${lightness}%)"
        ></div>
        <span class="shade-matrix__weight">${weight}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="shade-matrix">
      <div class="shade-matrix__header">
        <span class="shade-matrix__label">Shade Scale (TailwindCSS)</span>
      </div>
      <div class="shade-matrix__grid">${cells}</div>
    </div>
  `;
}
```

### 2.4 Color Harmonies Component
**File**: `onboard/src/components/color-harmonies.ts` (NEW)
**Lines**: ~130

```typescript
/**
 * =============================================================================
 * Color Harmonies Component
 * =============================================================================
 * Complementary, triadic, analogous color relationships
 * =============================================================================
 */

import type { OklchColor, HarmonyType } from '../types/color.types.js';
import { generateHarmony } from '../utils/color-theory.js';
import { oklchToHex } from '../utils/color-convert.js';

/**
 * Render single harmony type
 */
function renderHarmony(baseColor: OklchColor, type: HarmonyType): string {
  const harmony = generateHarmony(baseColor, type);

  const circles = harmony.colors.map((color, index) => {
    const hex = oklchToHex(color);
    const name = harmony.names[index];
    const isBase = index === (type === 'analogous' ? 1 : 0);

    return `
      <div class="harmony-circle ${isBase ? 'harmony-circle--base' : ''}">
        <div
          class="harmony-circle__swatch"
          style="background-color: ${hex}"
          title="${name}: ${hex}"
        ></div>
        <span class="harmony-circle__label">${name}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="harmony-group">
      <div class="harmony-group__label">${capitalizeFirst(type)}</div>
      <div class="harmony-group__circles">${circles}</div>
    </div>
  `;
}

/**
 * Render all harmonies
 */
export function renderColorHarmonies(baseColor: OklchColor): string {
  const types: HarmonyType[] = ['complementary', 'triadic', 'analogous'];

  const harmonies = types.map((type) => renderHarmony(baseColor, type)).join('');

  return `
    <div class="color-harmonies">
      <div class="color-harmonies__header">
        <span class="color-harmonies__label">Color Harmonies</span>
      </div>
      <div class="color-harmonies__groups">${harmonies}</div>
    </div>
  `;
}

/**
 * Utility: Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

### 2.5 Color Presets Component
**File**: `onboard/src/components/color-presets.ts` (NEW)
**Lines**: ~110

```typescript
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
```

---

## Phase 3: Theme Editor Integration (2-3 hours)

### 3.1 Refactor Theme Editor Controller
**File**: [onboard/src/controllers/theme-editor.ts](onboard/src/controllers/theme-editor.ts)
**Action**: Major refactor
**Lines Changed**: ~400 (200 removed, 300 added, 100 unchanged)

#### Key Changes:

1. **Add Active Color State**
```typescript
// Line 30 (after imports)
let activeColor: ActiveColorKey = 'primary';
let isSecondaryEnabled = false;
```

2. **Update renderBrandColorsSection()**
```typescript
function renderBrandColorsSection(): string {
  const theme = getTheme();
  const primaryColor = theme.brand_primary;
  const secondaryColor = theme.brand_secondary;

  // Determine if secondary is enabled
  isSecondaryEnabled = secondaryColor !== null && secondaryColor !== undefined;

  return `
    <section class="theme-section">
      <header class="theme-section__header">
        <h3 class="theme-section__title">Brand Colors</h3>

        <label class="toggle-switch">
          <input
            type="checkbox"
            data-secondary-toggle
            ${isSecondaryEnabled ? 'checked' : ''}
          />
          <span class="toggle-switch__slider"></span>
          <span class="toggle-switch__label">Enable Secondary Color</span>
        </label>
      </header>

      <div class="color-cards-container">
        ${renderColorCard(primaryColor, 'primary', activeColor === 'primary')}
        ${isSecondaryEnabled ? renderColorCard(secondaryColor!, 'secondary', activeColor === 'secondary') : ''}
      </div>
    </section>
  `;
}
```

3. **Update renderColorPicker() - Make Shared**
```typescript
function renderColorPicker(): string {
  const theme = getTheme();
  const currentColor = activeColor === 'primary' ? theme.brand_primary : theme.brand_secondary;

  if (!currentColor) return '';

  return `
    <section class="theme-section">
      <header class="theme-section__header">
        <h3 class="theme-section__title">
          Editing: <span class="color-key-label">${capitalizeFirst(activeColor)} Color</span>
        </h3>
      </header>

      <div data-color-picker></div>
    </section>
  `;
}
```

4. **Add Visualization Sections**
```typescript
function renderVisualizationsSection(): string {
  const theme = getTheme();
  const currentColor = activeColor === 'primary' ? theme.brand_primary : theme.brand_secondary;

  if (!currentColor) return '';

  return `
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
  `;
}
```

5. **Update Main Render Function**
```typescript
function render(): void {
  const container = document.querySelector('[data-theme-editor]');
  if (!container) return;

  container.innerHTML = `
    <div class="theme-editor">
      <header class="theme-editor__header">
        <h2 class="theme-editor__title">Theme Editor</h2>
      </header>

      ${renderBrandColorsSection()}
      ${renderColorPicker()}
      ${renderVisualizationsSection()}
      ${renderNeutralPaletteSection()}
      ${renderThemeModeSection()}
      ${renderActionsSection()}
    </div>
  `;

  // Initialize components
  const brandSection = container.querySelector('.color-cards-container');
  if (brandSection) {
    initColorCard(brandSection as HTMLElement);
  }

  const pickerContainer = container.querySelector('[data-color-picker]');
  if (pickerContainer) {
    initColorPicker(pickerContainer as HTMLElement);
  }

  const presetsContainer = container.querySelector('.color-presets');
  if (presetsContainer) {
    initColorPresets(presetsContainer as HTMLElement, activeColor);
  }
}
```

6. **Add Event Listeners**
```typescript
// Listen for active color changes
on(EventName.ACTIVE_COLOR_CHANGE, ({ activeColor: newActiveColor }) => {
  activeColor = newActiveColor;
  render(); // Re-render to show active state
});

// Listen for secondary toggle
container.addEventListener('change', (event) => {
  const toggle = (event.target as HTMLElement).closest('[data-secondary-toggle]');
  if (!toggle) return;

  const isEnabled = (toggle as HTMLInputElement).checked;

  if (isEnabled && !getTheme().brand_secondary) {
    // Generate default secondary color (complementary)
    const primary = getTheme().brand_primary;
    const secondary = rotateHue(primary, 180);
    updateConfig('brand_secondary', secondary);
  } else if (!isEnabled) {
    updateConfig('brand_secondary', null);
  }

  emit(EventName.SECONDARY_COLOR_TOGGLE, { enabled: isEnabled });
  render();
});

// Listen for preset selection
on(EventName.COLOR_PRESET_SELECT, ({ preset, targetColor }) => {
  const key = targetColor === 'primary' ? 'brand_primary' : 'brand_secondary';
  updateConfig(key, preset.color);
});
```

---

## Phase 4: Component Styling (1-2 hours)

### 4.1 Color Card Styles
**File**: `_sass/onboard/components/_color-card.scss` (NEW)
**Lines**: ~120

```scss
/**
 * =============================================================================
 * Color Card Component
 * =============================================================================
 */

.color-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: 0;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  overflow: hidden;

  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  &--active {
    border-color: var(--color-primary);
    border-width: 3px;
    box-shadow: var(--shadow-lg);

    .color-card__info {
      background: linear-gradient(
        to bottom,
        var(--color-primary-alpha-10),
        transparent
      );
    }
  }

  /**
   * Color preview area
   */
  &__preview {
    width: 100%;
    height: 120px;
    border-bottom: 2px solid var(--color-border);
  }

  /**
   * Info section
   */
  &__info {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    padding: var(--space-lg);
  }

  /**
   * Label
   */
  &__label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text);
  }

  /**
   * Active badge
   */
  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-sm);
    font-size: 0.75rem;
    font-weight: 700;
  }

  /**
   * Hex value
   */
  &__hex {
    font-family: var(--font-mono);
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--color-text);
  }

  /**
   * OKLCH values
   */
  &__oklch {
    display: flex;
    gap: var(--space-md);
    font-size: 0.75rem;
    color: var(--color-text-muted);

    .oklch-value {
      font-family: var(--font-mono);
    }
  }
}

/**
 * Color cards container (side-by-side layout)
 */
.color-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
  margin-top: var(--space-md);
}
```

### 4.2 Color Gradient Styles
**File**: `_sass/onboard/components/_color-gradient.scss` (NEW)
**Lines**: ~60

```scss
/**
 * =============================================================================
 * Color Gradient Component
 * =============================================================================
 */

.color-gradient {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text);
  }

  &__cells {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    gap: 2px;
    height: 40px;
    border-radius: var(--radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
  }

  &__cell {
    width: 100%;
    height: 100%;
    transition: transform var(--transition-fast);
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
      z-index: 1;
      box-shadow: var(--shadow-md);
    }
  }
}
```

### 4.3 Shade Matrix Styles
**File**: `_sass/onboard/components/_shade-matrix.scss` (NEW)
**Lines**: ~90

```scss
/**
 * =============================================================================
 * Shade Matrix Component
 * =============================================================================
 */

.shade-matrix {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(48px, 1fr));
    gap: var(--space-sm);
  }

  &__cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  &__swatch {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-md);
    border: 2px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-md);
      z-index: 1;
    }
  }

  &__weight {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-muted);
  }
}
```

### 4.4 Color Harmonies Styles
**File**: `_sass/onboard/components/_color-harmonies.scss` (NEW)
**Lines**: ~110

```scss
/**
 * =============================================================================
 * Color Harmonies Component
 * =============================================================================
 */

.color-harmonies {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text);
  }

  &__groups {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
}

.harmony-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  &__circles {
    display: flex;
    gap: var(--space-md);
  }
}

.harmony-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);

  &__swatch {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
    cursor: pointer;

    &:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-md);
    }
  }

  &__label {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    text-align: center;
  }

  &--base {
    .harmony-circle__swatch {
      border-width: 3px;
      border-color: var(--color-primary);
    }

    .harmony-circle__label {
      font-weight: 700;
      color: var(--color-text);
    }
  }
}
```

### 4.5 Color Presets Styles
**File**: `_sass/onboard/components/_color-presets.scss` (NEW)
**Lines**: ~80

```scss
/**
 * =============================================================================
 * Color Presets Component
 * =============================================================================
 */

.color-presets {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text);
  }

  &__groups {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
}

.preset-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: var(--space-sm);
  }
}

.preset-cell {
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    transform: scale(1.15);
    box-shadow: var(--shadow-md);
    z-index: 1;
  }
}
```

### 4.6 Update Main Styles Index
**File**: [_sass/onboard/_index.scss](/_sass/onboard/_index.scss)
**Action**: Add new component imports

```scss
// Components
@use 'components/color-picker';
@use 'components/color-selector-2d';
@use 'components/theme-editor';
@use 'components/color-card';        // NEW
@use 'components/color-gradient';    // NEW
@use 'components/shade-matrix';      // NEW
@use 'components/color-harmonies';   // NEW
@use 'components/color-presets';     // NEW
```

### 4.7 Add Visualizations Grid Layout
**File**: [_sass/onboard/components/_theme-editor.scss](/_sass/onboard/components/_theme-editor.scss)
**Action**: Add visualization section styles

```scss
/**
 * Visualizations section
 */
.theme-section--visualizations {
  .visualizations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-xl);
    margin-top: var(--space-lg);
  }
}

/**
 * Color key label (in picker header)
 */
.color-key-label {
  color: var(--color-primary);
  font-weight: 700;
}
```

---

## Phase 5: Testing & Polish (1 hour)

### 5.1 Manual Testing Checklist

#### Functional Tests
- [ ] Click primary card → picker updates to primary color
- [ ] Click secondary card → picker updates to secondary color
- [ ] Active card shows "Editing" badge
- [ ] Toggle secondary color on → card appears
- [ ] Toggle secondary color off → card disappears, config updates
- [ ] Change primary color → gradient/shades/harmonies update
- [ ] Change secondary color → visualizations switch
- [ ] Click preset → applies to active color
- [ ] Save changes → localStorage clears, badge hides
- [ ] Refresh page → unsaved changes restore
- [ ] Switch tabs → changes persist

#### Visual Tests
- [ ] Cards have equal height
- [ ] Gradient cells are equal width
- [ ] Shade matrix grid aligns properly
- [ ] Harmony circles are equal size
- [ ] Preset grid wraps correctly
- [ ] Active state border visible
- [ ] Hover states smooth
- [ ] Dark mode colors readable
- [ ] Mobile layout stacks properly

#### Browser Tests
- [ ] Chrome 120+
- [ ] Firefox 120+
- [ ] Safari 17+
- [ ] Edge 120+

### 5.2 Known Edge Cases

1. **Secondary Toggle While Editing Secondary**
   - If user disables secondary while editing it
   - Solution: Auto-switch to primary on disable

2. **Very Low Chroma Colors**
   - Harmonies may look similar (hue less relevant)
   - Solution: Add warning text if C < 0.05

3. **Very Dark/Light Colors**
   - Border visibility issues
   - Solution: Use contrast-aware borders

### 5.3 Performance Validation

- [ ] Bundle size < 150 KB total
- [ ] Color picker initialization < 100ms
- [ ] Visualization rendering < 50ms
- [ ] No layout shift on render
- [ ] No memory leaks on tab switch

---

## Implementation Timeline

### Day 1 (4-5 hours)
- ✅ Phase 1: Foundation (types, constants, utilities)
- ✅ Phase 2: Components (5 new TS files)

### Day 2 (3-4 hours)
- ✅ Phase 3: Theme editor integration
- ✅ Phase 4: Component styling (5 new SCSS files)

### Day 3 (1-2 hours)
- ✅ Phase 5: Testing and polish
- ✅ Bug fixes and refinements

**Total**: 7-11 hours

---

## File Summary

### New Files (12 Total)

#### TypeScript (7 files, ~740 lines)
1. `onboard/src/utils/color-constants.ts` - 120 lines
2. `onboard/src/utils/color-theory.ts` - 150 lines
3. `onboard/src/components/color-card.ts` - 120 lines
4. `onboard/src/components/color-gradient.ts` - 80 lines
5. `onboard/src/components/shade-matrix.ts` - 100 lines
6. `onboard/src/components/color-harmonies.ts` - 130 lines
7. `onboard/src/components/color-presets.ts` - 110 lines

#### SCSS (5 files, ~460 lines)
8. `_sass/onboard/components/_color-card.scss` - 120 lines
9. `_sass/onboard/components/_color-gradient.scss` - 60 lines
10. `_sass/onboard/components/_shade-matrix.scss` - 90 lines
11. `_sass/onboard/components/_color-harmonies.scss` - 110 lines
12. `_sass/onboard/components/_color-presets.scss` - 80 lines

### Modified Files (4 files)

1. `onboard/src/types/color.types.ts` - +40 lines
2. `onboard/src/types/events.types.ts` - +30 lines
3. `onboard/src/controllers/theme-editor.ts` - ~400 lines changed
4. `_sass/onboard/components/_theme-editor.scss` - +50 lines

**Total New Code**: ~1,650 lines
**Bundle Impact**: +15-20 KB (well under 150 KB budget)

---

## Risk Assessment

### Low Risk
✅ Uses existing color utilities (no new math)
✅ Event bus pattern already proven
✅ BEM CSS prevents conflicts
✅ Functional components (easy to test)
✅ No third-party dependencies

### Medium Risk
⚠️ Large refactor of theme-editor.ts (backup recommended)
⚠️ New event types (need thorough testing)
⚠️ CSS grid layouts (test responsive behavior)

### Mitigation Strategy
1. Implement in branches (test before merge)
2. Keep backup of `theme-editor.ts`
3. Test all event flows manually
4. Validate on multiple browsers
5. Check bundle size after each phase

---

## Approval Checklist

Before execution, confirm:

- [ ] Architecture principles understood (tokenized, variabilized, etc.)
- [ ] File structure makes sense
- [ ] No new dependencies required
- [ ] Timeline acceptable (7-11 hours)
- [ ] Bundle impact acceptable (+15-20 KB)
- [ ] Testing plan comprehensive
- [ ] Risk mitigation adequate

---

## Next Steps

**Upon Approval**:
1. Create feature branch: `feature/theme-editor-modernization`
2. Implement Phase 1 (Foundation)
3. Commit after each phase
4. Test after Phases 2, 3, 4
5. Final testing in Phase 5
6. Merge to `enhancement/dashboard_backend-implementation`

**Questions Before Starting**:
- Any specific color presets to include?
- Should harmonies be clickable (apply to active color)?
- Should shade matrix export be added later?
- Mobile breakpoint priorities?

---

## References

### Inspiration Sources
- https://colorsforge.com/ - Modern color picker UI
- https://uicolors.app/ - TailwindCSS color generator
- https://colorhunt.co/ - Color palette inspiration

### Documentation
- OKLCH: https://oklch.com/
- Culori API: https://culorijs.org/api/
- BEM: https://getbem.com/

### Internal Docs
- [docs/01-project/03-plans/11-20251002-002.03-phase-7-implementation.md](docs/01-project/03-plans/11-20251002-002.03-phase-7-implementation.md)
- [docs/01-project/04-status/PHASE-7-STATUS.md](docs/01-project/04-status/PHASE-7-STATUS.md)

---

**Plan Created**: October 16, 2025
**Author**: Claude (Sonnet 4.5)
**Status**: Awaiting User Approval
