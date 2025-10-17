# shadcn UI Complete Tokenization - Gap Analysis

**Document ID**: shadcn-tokenization-gap-analysis
**Created**: October 17, 2025
**Purpose**: Comprehensive analysis of what needs to change to fully tokenize onboard dashboard with shadcn UI design tokens
**Status**: 📋 Analysis Complete - Awaiting Approval

---

## Executive Summary

### Current State
The onboard dashboard uses a **hybrid token system**:
- **shadcn tokens** (33 variables): Colors only (`--background`, `--primary`, `--border`, etc.)
- **Editor tokens** (54 variables): Spacing, typography, shadows, transitions, layout

### Desired State
**100% shadcn-tokenized system** with:
- All colors using shadcn conventions
- Spacing following Tailwind/shadcn conventions
- Typography using shadcn naming patterns
- Shadows, radius, and utilities in shadcn style
- Zero `--editor-*` tokens

### Impact
- **Files to modify**: 11 Sass files (2,718 total lines)
- **Token replacements**: 54 unique `--editor-*` tokens → shadcn equivalents
- **New tokens to create**: ~40 new shadcn-style tokens
- **Estimated effort**: 4-6 hours (systematic find/replace + testing)

---

## Current Token Inventory

### Editor Tokens in Use (54 unique)

| Category | Count | Tokens |
|----------|-------|--------|
| **Spacing** | 7 | `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` |
| **Colors** | 14 | `primary`, `bg`, `surface`, `text`, `border`, `danger`, `success`, `warning`, `info`, etc. |
| **Typography** | 11 | Font sizes (xs-3xl), weights (normal-bold), families (sans, mono) |
| **Border Radius** | 5 | `sm`, `md`, `lg`, `xl`, `full` |
| **Shadows** | 5 | `sm`, `md`, `lg`, `xl`, `focus` |
| **Transitions** | 2 | `fast`, `normal` |
| **Layout** | 1 | `max-width` |
| **Z-Index** | 1 | `toast` |
| **Specialized** | 8 | Sliders, WCAG, etc. |

### shadcn Tokens Currently Defined (33 variables)

**Color Tokens** (23):
- Semantic: `--background`, `--foreground`, `--card`, `--popover`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`
- Extended: `--success`, `--warning`, `--info` (with `-foreground` variants)
- Charts: `--chart-1` through `--chart-5`

**Utility Tokens** (1):
- `--radius`: Single border radius value

**Missing from shadcn**:
- ❌ Spacing scale
- ❌ Typography scale
- ❌ Shadow scale
- ❌ Transition/animation tokens
- ❌ Z-index scale
- ❌ Layout constraints

---

## Gap Analysis by Category

### 1. Color Tokens

#### ✅ Direct Mappings (Already Compatible)

| Current `--editor-*` | shadcn Equivalent | Status |
|----------------------|-------------------|--------|
| `--editor-primary` | `--primary` | ✅ Exists |
| `--editor-primary-hover` | `--primary` (computed) | ⚠️ Need to add hover variant |
| `--editor-primary-active` | `--primary` (computed) | ⚠️ Need to add active variant |
| `--editor-bg` | `--background` | ✅ Exists |
| `--editor-surface` | `--card` | ✅ Exists (use card as surface) |
| `--editor-text` | `--foreground` | ✅ Exists |
| `--editor-text-muted` | `--muted-foreground` | ✅ Exists |
| `--editor-border` | `--border` | ✅ Exists |
| `--editor-border-dark` | `--border` (darker variant) | ⚠️ Need to add |
| `--editor-border-focus` | `--ring` | ✅ Exists |
| `--editor-danger` | `--destructive` | ✅ Exists |
| `--editor-success` | `--success` | ✅ Exists |
| `--editor-warning` | `--warning` | ✅ Exists |
| `--editor-info` | `--info` | ✅ Exists |

**Action Required**:
- ✅ 10 tokens map directly
- ⚠️ 4 tokens need hover/active/variant additions to shadcn

#### ❌ Missing Specialized Color Tokens

| Current | Purpose | shadcn Equivalent Needed |
|---------|---------|--------------------------|
| `--editor-wcag-aa` | WCAG AA compliance indicator | `--success` (can reuse) |
| `--editor-wcag-aaa` | WCAG AAA compliance indicator | `--success` (darker variant) |
| `--editor-wcag-fail` | Failed contrast indicator | `--destructive` (can reuse) |

**Action**: Reuse existing semantic tokens

---

### 2. Spacing Tokens

#### ❌ Currently Missing from shadcn

shadcn/ui (built on Tailwind) uses spacing scale but doesn't define it as CSS variables by default.

**Proposed shadcn Spacing Tokens** (following Tailwind convention):

| Current `--editor-*` | Proposed shadcn Token | Value | Tailwind Equiv |
|----------------------|-----------------------|-------|----------------|
| `--editor-space-xs` | `--space-2` | 0.5rem (8px) | `space-2` |
| `--editor-space-sm` | `--space-3` | 0.75rem (12px) | `space-3` |
| `--editor-space-md` | `--space-4` | 1rem (16px) | `space-4` |
| `--editor-space-lg` | `--space-6` | 1.5rem (24px) | `space-6` |
| `--editor-space-xl` | `--space-8` | 2rem (32px) | `space-8` |
| `--editor-space-2xl` | `--space-12` | 3rem (48px) | `space-12` |
| `--editor-space-3xl` | `--space-16` | 4rem (64px) | `space-16` |

**Rationale**: Use Tailwind's numeric naming (0.5 = 2, 1 = 4, 1.5 = 6, 2 = 8, etc.) since shadcn is Tailwind-based.

**Alternative Naming** (more semantic):
- `--spacing-xs`, `--spacing-sm`, etc. (if you prefer descriptive names)

**Action Required**:
- Add 7 spacing tokens to `_tokens-shadcn.scss`

---

### 3. Typography Tokens

#### ❌ Currently Missing from shadcn

**Proposed shadcn Typography Tokens**:

| Current `--editor-*` | Proposed shadcn Token | Value | Notes |
|----------------------|-----------------------|-------|-------|
| `--editor-font-sans` | `--font-sans` | System font stack | shadcn convention |
| `--editor-font-mono` | `--font-mono` | Monospace stack | shadcn convention |
| `--editor-font-size-xs` | `--text-xs` | 0.75rem (12px) | Tailwind naming |
| `--editor-font-size-sm` | `--text-sm` | 0.875rem (14px) | |
| `--editor-font-size-md` | `--text-base` | 1rem (16px) | Tailwind uses "base" |
| `--editor-font-size-lg` | `--text-lg` | 1.125rem (18px) | |
| `--editor-font-size-xl` | `--text-xl` | 1.25rem (20px) | |
| `--editor-font-size-2xl` | `--text-2xl` | 1.5rem (24px) | |
| `--editor-font-size-3xl` | `--text-3xl` | 2rem (32px) | |
| `--editor-font-weight-normal` | `--font-normal` | 400 | |
| `--editor-font-weight-medium` | `--font-medium` | 500 | |
| `--editor-font-weight-semibold` | `--font-semibold` | 600 | |
| `--editor-font-weight-bold` | `--font-bold` | 700 | |

**Action Required**:
- Add 13 typography tokens to `_tokens-shadcn.scss`

---

### 4. Border Radius Tokens

#### ⚠️ Partially Covered by shadcn

shadcn defines `--radius: 0.5rem` (single value).

**Current Usage**:
- `--editor-radius-sm`: 0.25rem (4px) - **54 uses**
- `--editor-radius-md`: 0.375rem (6px) - **13 uses**
- `--editor-radius-lg`: 0.5rem (8px) - **12 uses**
- `--editor-radius-xl`: 0.75rem (12px) - **6 uses**
- `--editor-radius-full`: 9999px (pill) - **6 uses**

**Proposed shadcn Radius Tokens**:

| Current | Proposed shadcn Token | Value | Notes |
|---------|-----------------------|-------|-------|
| `--editor-radius-sm` | `--radius-sm` | 0.25rem | Add to shadcn |
| `--editor-radius-md` | `--radius` (rename existing) | 0.375rem | shadcn default |
| `--editor-radius-lg` | `--radius-lg` | 0.5rem | Add to shadcn |
| `--editor-radius-xl` | `--radius-xl` | 0.75rem | Add to shadcn |
| `--editor-radius-full` | `--radius-full` | 9999px | Add to shadcn |

**Action Required**:
- Expand shadcn radius system from 1 token to 5 tokens

---

### 5. Shadow Tokens (Elevation)

#### ❌ Currently Missing from shadcn

**Current Usage**:
- `--editor-shadow-sm`: 8 uses
- `--editor-shadow-md`: 13 uses
- `--editor-shadow-lg`: 5 uses
- `--editor-shadow-xl`: 1 use
- `--editor-shadow-focus`: 2 uses

**Proposed shadcn Shadow Tokens**:

| Current | Proposed shadcn Token | Value |
|---------|-----------------------|-------|
| `--editor-shadow-sm` | `--shadow-sm` | `0 1px 2px 0 rgba(0, 0, 0, 0.05)` |
| `--editor-shadow-md` | `--shadow` | `0 4px 6px -1px rgba(0, 0, 0, 0.1), ...` |
| `--editor-shadow-lg` | `--shadow-lg` | `0 10px 15px -3px rgba(0, 0, 0, 0.1), ...` |
| `--editor-shadow-xl` | `--shadow-xl` | `0 20px 25px -5px rgba(0, 0, 0, 0.1), ...` |
| `--editor-shadow-focus` | `--ring-offset-shadow` | `0 0 0 3px rgba(59, 130, 246, 0.5)` |

**Alternative**: Use Tailwind's shadow naming convention

**Action Required**:
- Add 5 shadow tokens to `_tokens-shadcn.scss`

---

### 6. Transition/Animation Tokens

#### ❌ Currently Missing from shadcn

**Current Usage**:
- `--editor-transition-fast`: 25 uses (150ms)
- `--editor-transition-normal`: 4 uses (250ms)

**Proposed shadcn Transition Tokens**:

| Current | Proposed shadcn Token | Value | Notes |
|---------|-----------------------|-------|-------|
| `--editor-transition-fast` | `--duration-150` or `--transition-fast` | 150ms ease-in-out | Tailwind uses numeric |
| `--editor-transition-normal` | `--duration-250` or `--transition-normal` | 250ms ease-in-out | |

**Action Required**:
- Add 2 transition tokens to `_tokens-shadcn.scss`

---

### 7. Layout & Utility Tokens

#### ❌ Currently Missing from shadcn

| Current | Proposed shadcn Token | Value | Usage |
|---------|-----------------------|-------|-------|
| `--editor-max-width` | `--container-max-width` or `--max-w-7xl` | 1200px | 1 use |
| `--editor-z-toast` | `--z-toast` | 1080 | 1 use (toast notifications) |

**Action Required**:
- Add 2 utility tokens (or consider inline values)

---

### 8. Specialized Tokens (Sliders)

#### ❌ Currently Missing from shadcn

| Current | Proposed shadcn Token | Usage |
|---------|-----------------------|-------|
| `--editor-slider-track-height` | `--slider-track-height` | 1 use |
| `--editor-slider-thumb-size` | `--slider-thumb-size` | 4 uses |
| `--editor-slider-thumb-border` | `--slider-thumb-border` | 2 uses |
| `--editor-slider-thumb-shadow` | `--slider-thumb-shadow` | 2 uses |

**Action Required**:
- Add 4 slider tokens (component-specific, could be scoped)

---

## Migration Strategy

### Approach: Expand shadcn Token System

**Philosophy**: Since shadcn only defines color tokens, we'll **expand the shadcn system** to include all utility tokens following shadcn/Tailwind conventions.

### New File Structure

```
_sass/onboard/abstracts/
├── _tokens-shadcn.scss       # Expanded to include ALL tokens
└── _tokens.scss               # DEPRECATED (remove after migration)
```

### Proposed Token Categories in `_tokens-shadcn.scss`

```scss
:root {
  // ========================================================================
  // 1. Color Tokens (✅ Already defined)
  // ========================================================================
  --background: oklch(...);
  --foreground: oklch(...);
  --primary: oklch(...);
  // ... (33 existing color tokens)

  // ========================================================================
  // 2. Spacing Scale (❌ NEW - Tailwind convention)
  // ========================================================================
  --space-0: 0;
  --space-1: 0.25rem;   // 4px
  --space-2: 0.5rem;    // 8px (editor-space-xs)
  --space-3: 0.75rem;   // 12px (editor-space-sm)
  --space-4: 1rem;      // 16px (editor-space-md)
  --space-6: 1.5rem;    // 24px (editor-space-lg)
  --space-8: 2rem;      // 32px (editor-space-xl)
  --space-12: 3rem;     // 48px (editor-space-2xl)
  --space-16: 4rem;     // 64px (editor-space-3xl)

  // ========================================================================
  // 3. Typography Scale (❌ NEW - Tailwind convention)
  // ========================================================================
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', ...;
  --font-mono: 'Monaco', 'Courier New', monospace;

  --text-xs: 0.75rem;   // 12px
  --text-sm: 0.875rem;  // 14px
  --text-base: 1rem;    // 16px
  --text-lg: 1.125rem;  // 18px
  --text-xl: 1.25rem;   // 20px
  --text-2xl: 1.5rem;   // 24px
  --text-3xl: 2rem;     // 32px

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  // ========================================================================
  // 4. Border Radius Scale (⚠️ EXPAND existing --radius)
  // ========================================================================
  --radius-sm: 0.25rem;    // 4px
  --radius: 0.375rem;      // 6px (keep existing for compatibility)
  --radius-md: 0.5rem;     // 8px
  --radius-lg: 0.75rem;    // 12px
  --radius-xl: 1rem;       // 16px
  --radius-full: 9999px;   // Pill shape

  // ========================================================================
  // 5. Shadow Scale (❌ NEW - Tailwind convention)
  // ========================================================================
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), ...;
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), ...;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), ...;
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), ...;
  --ring-offset-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);

  // ========================================================================
  // 6. Transition Tokens (❌ NEW)
  // ========================================================================
  --duration-150: 150ms;
  --duration-250: 250ms;
  --duration-350: 350ms;
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  // ========================================================================
  // 7. Z-Index Scale (❌ NEW)
  // ========================================================================
  --z-base: 1;
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-modal: 1050;
  --z-toast: 1080;

  // ========================================================================
  // 8. Layout Tokens (❌ NEW)
  // ========================================================================
  --container-max-width: 1200px;

  // ========================================================================
  // 9. Component-Specific Tokens (❌ NEW)
  // ========================================================================
  --slider-track-height: 8px;
  --slider-thumb-size: 20px;
  --slider-thumb-border: 2px solid #ffffff;
  --slider-thumb-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark {
  // Dark mode overrides for all tokens
}
```

---

## File-by-File Impact Analysis

### Files Requiring Changes (11 Sass files)

| File | Lines | Editor Tokens Used | Estimated Effort |
|------|-------|--------------------|------------------|
| `_theme-editor.scss` | 758 | ~200 uses | 1-2 hours |
| `_dashboard.scss` | 720 | ~150 uses | 1-2 hours |
| `_color-picker.scss` | 454 | ~80 uses | 45 min |
| `_tokens.scss` | 177 | N/A (delete file) | 5 min |
| `_tokens-shadcn.scss` | 123 | N/A (expand file) | 1 hour |
| `_color-card.scss` | 121 | ~20 uses | 15 min |
| `_color-selector-2d.scss` | 92 | ~15 uses | 15 min |
| `_color-harmonies.scss` | 90 | ~15 uses | 15 min |
| `_color-presets.scss` | 72 | ~10 uses | 10 min |
| `_shade-matrix.scss` | 62 | ~10 uses | 10 min |
| `_color-gradient.scss` | 49 | ~8 uses | 10 min |
| **Total** | **2,718** | **~520 replacements** | **4-6 hours** |

---

## Detailed Migration Plan

### Phase 1: Expand shadcn Token System (1-2 hours)

**File**: `_sass/onboard/abstracts/_tokens-shadcn.scss`

**Actions**:
1. ✅ Keep existing 33 color tokens
2. ➕ Add 7 spacing tokens (`--space-{2,3,4,6,8,12,16}`)
3. ➕ Add 13 typography tokens (`--font-*`, `--text-*`)
4. ➕ Expand 1 radius token to 6 (`--radius-{sm,md,lg,xl,full}`)
5. ➕ Add 5 shadow tokens (`--shadow-*`)
6. ➕ Add 2 transition tokens (`--duration-*`)
7. ➕ Add 5 z-index tokens (`--z-*`)
8. ➕ Add 1 layout token (`--container-max-width`)
9. ➕ Add 4 slider tokens (`--slider-*`)
10. 🔄 Update dark mode overrides for new tokens

**Result**: 71 total shadcn tokens (from 33)

### Phase 2: Update Component Sass Files (3-4 hours)

**Systematic Find/Replace** in each file:

```bash
# Example replacements
var(--editor-space-xs)      → var(--space-2)
var(--editor-space-sm)      → var(--space-3)
var(--editor-space-md)      → var(--space-4)
var(--editor-primary)       → var(--primary)
var(--editor-bg)            → var(--background)
var(--editor-surface)       → var(--card)
var(--editor-text)          → var(--foreground)
var(--editor-border)        → var(--border)
var(--editor-font-sans)     → var(--font-sans)
var(--editor-radius-lg)     → var(--radius-lg)
var(--editor-shadow-md)     → var(--shadow-md)
var(--editor-transition-fast) → calc(var(--duration-150) * 1ms) ease-in-out
```

**Files** (in order of size, largest first):
1. `_theme-editor.scss` (758 lines)
2. `_dashboard.scss` (720 lines)
3. `_color-picker.scss` (454 lines)
4. `_color-card.scss` (121 lines)
5. `_color-selector-2d.scss` (92 lines)
6. `_color-harmonies.scss` (90 lines)
7. `_color-presets.scss` (72 lines)
8. `_shade-matrix.scss` (62 lines)
9. `_color-gradient.scss` (49 lines)

### Phase 3: Update Index File (5 minutes)

**File**: `_sass/onboard/_index.scss`

**Change**:
```scss
// Before
@forward 'abstracts/tokens-shadcn';
@forward 'abstracts/tokens';  // ❌ Remove this line

// After
@forward 'abstracts/tokens-shadcn';  // ✅ Only shadcn tokens
```

### Phase 4: Delete Legacy File (1 minute)

**File**: `_sass/onboard/abstracts/_tokens.scss`

**Action**: Delete (no longer needed)

### Phase 5: Testing (30-60 minutes)

**Actions**:
1. Rebuild CSS: `bundle exec jekyll build`
2. Check compiled output: `_site/onboard/css/editor.css`
3. Verify no `--editor-*` references remain
4. Test dashboard in browser (http://localhost:4000/onboard/)
5. Verify light/dark mode switching
6. Check all interactive components (sliders, buttons, etc.)
7. Run visual regression tests (if available)

### Phase 6: Documentation (15 minutes)

**Files to update**:
- `onboard/README.md` - Update token references
- `docs/01-project/02-architecture/onboard-separation-guide.md` - Update token section
- This document - Mark as complete

---

## Token Mapping Reference Table

### Complete Replacement Map

| Old Token | New Token | Category | Notes |
|-----------|-----------|----------|-------|
| `--editor-bg` | `--background` | Color | Direct |
| `--editor-surface` | `--card` | Color | Surface = Card |
| `--editor-text` | `--foreground` | Color | Direct |
| `--editor-text-muted` | `--muted-foreground` | Color | Direct |
| `--editor-border` | `--border` | Color | Direct |
| `--editor-border-dark` | `--border` | Color | Reuse (no variant needed) |
| `--editor-border-focus` | `--ring` | Color | Direct |
| `--editor-primary` | `--primary` | Color | Direct |
| `--editor-primary-hover` | `--primary` | Color | Compute hover in CSS |
| `--editor-primary-active` | `--primary` | Color | Compute active in CSS |
| `--editor-danger` | `--destructive` | Color | Direct |
| `--editor-success` | `--success` | Color | Direct |
| `--editor-warning` | `--warning` | Color | Direct |
| `--editor-info` | `--info` | Color | Direct |
| `--editor-wcag-aa` | `--success` | Color | Reuse |
| `--editor-wcag-aaa` | `--success` | Color | Reuse |
| `--editor-wcag-fail` | `--destructive` | Color | Reuse |
| `--editor-space-xs` | `--space-2` | Spacing | 8px |
| `--editor-space-sm` | `--space-3` | Spacing | 12px |
| `--editor-space-md` | `--space-4` | Spacing | 16px |
| `--editor-space-lg` | `--space-6` | Spacing | 24px |
| `--editor-space-xl` | `--space-8` | Spacing | 32px |
| `--editor-space-2xl` | `--space-12` | Spacing | 48px |
| `--editor-space-3xl` | `--space-16` | Spacing | 64px |
| `--editor-font-sans` | `--font-sans` | Typography | Direct |
| `--editor-font-mono` | `--font-mono` | Typography | Direct |
| `--editor-font-size-xs` | `--text-xs` | Typography | 12px |
| `--editor-font-size-sm` | `--text-sm` | Typography | 14px |
| `--editor-font-size-md` | `--text-base` | Typography | 16px |
| `--editor-font-size-lg` | `--text-lg` | Typography | 18px |
| `--editor-font-size-xl` | `--text-xl` | Typography | 20px |
| `--editor-font-size-2xl` | `--text-2xl` | Typography | 24px |
| `--editor-font-size-3xl` | `--text-3xl` | Typography | 32px |
| `--editor-font-weight-normal` | `--font-normal` | Typography | 400 |
| `--editor-font-weight-medium` | `--font-medium` | Typography | 500 |
| `--editor-font-weight-semibold` | `--font-semibold` | Typography | 600 |
| `--editor-font-weight-bold` | `--font-bold` | Typography | 700 |
| `--editor-radius-sm` | `--radius-sm` | Border Radius | 4px |
| `--editor-radius-md` | `--radius` | Border Radius | 6px |
| `--editor-radius-lg` | `--radius-lg` | Border Radius | 8px |
| `--editor-radius-xl` | `--radius-xl` | Border Radius | 12px |
| `--editor-radius-full` | `--radius-full` | Border Radius | 9999px |
| `--editor-shadow-sm` | `--shadow-sm` | Shadow | Elevation 1 |
| `--editor-shadow-md` | `--shadow` | Shadow | Elevation 2 |
| `--editor-shadow-lg` | `--shadow-lg` | Shadow | Elevation 3 |
| `--editor-shadow-xl` | `--shadow-xl` | Shadow | Elevation 4 |
| `--editor-shadow-focus` | `--ring-offset-shadow` | Shadow | Focus ring |
| `--editor-transition-fast` | `--duration-150` | Transition | 150ms |
| `--editor-transition-normal` | `--duration-250` | Transition | 250ms |
| `--editor-max-width` | `--container-max-width` | Layout | 1200px |
| `--editor-z-toast` | `--z-toast` | Z-Index | 1080 |
| `--editor-slider-track-height` | `--slider-track-height` | Component | Slider |
| `--editor-slider-thumb-size` | `--slider-thumb-size` | Component | Slider |
| `--editor-slider-thumb-border` | `--slider-thumb-border` | Component | Slider |
| `--editor-slider-thumb-shadow` | `--slider-thumb-shadow` | Component | Slider |

---

## Risk Assessment

### Low Risk ✅
- **Color tokens**: Direct 1:1 mappings, well-tested shadcn conventions
- **Testing**: Can be done incrementally, changes are CSS-only
- **Rollback**: Git makes reverting simple

### Medium Risk ⚠️
- **Spacing naming change**: `--editor-space-md` → `--space-4` (semantic → numeric)
  - Mitigation: Clear mapping table, systematic replacement
- **Typography naming**: `--editor-font-size-md` → `--text-base` (Tailwind's "base" is unusual)
  - Mitigation: Document clearly

### High Risk ❌
- None identified (this is a refactor, not a feature change)

---

## Benefits of Full shadcn Tokenization

### 1. **Alignment with Industry Standards** ✅
- shadcn/ui is one of the most popular design systems (100k+ GitHub stars)
- Built on Tailwind CSS conventions (millions of users)
- Easier for developers familiar with shadcn/Tailwind

### 2. **Consistency** ✅
- Single token namespace (no more hybrid `--editor-*` + shadcn)
- Easier to understand and maintain
- Follows established naming conventions

### 3. **Future-Proofing** ✅
- Easier to integrate shadcn React components if ever needed
- Compatible with shadcn tooling and extensions
- Community support and examples

### 4. **Reduced Cognitive Load** ✅
- One token system to remember instead of two
- Naming follows predictable patterns
- Better autocomplete in IDEs (Tailwind CSS IntelliSense)

### 5. **Smaller CSS Bundle** ⚠️
- Removes duplicate token definitions
- Estimated savings: ~2-3 KB (minimal)

---

## Alternatives Considered

### Alternative 1: Keep Hybrid System ❌
**Pros**: No migration effort
**Cons**: Confusing, non-standard, harder to maintain

### Alternative 2: Custom Token System ❌
**Pros**: Full control
**Cons**: Reinvents the wheel, no community support

### Alternative 3: Tailwind Utility Classes ❌
**Pros**: No CSS variables needed
**Cons**: Loses runtime theming, harder to customize

### ✅ Recommended: Full shadcn Tokenization
**Pros**: Industry standard, consistent, maintainable
**Cons**: Migration effort (4-6 hours)

---

## Success Criteria

### ✅ Migration Complete When:
1. All 54 `--editor-*` tokens removed from codebase
2. All component Sass files use shadcn tokens exclusively
3. `_tokens.scss` file deleted
4. `_tokens-shadcn.scss` expanded to 71 tokens
5. CSS compiles without errors
6. Dashboard loads and functions correctly
7. Light/dark mode switching works
8. All interactive components (sliders, buttons, pickers) work
9. Visual regression tests pass (or manual QA complete)
10. Documentation updated

---

## Next Steps

### Immediate Actions (Awaiting Approval)

1. **Review this gap analysis** - Ensure token mappings make sense
2. **Approve migration plan** - Confirm approach and effort estimate
3. **Begin Phase 1** - Expand `_tokens-shadcn.scss` with new tokens
4. **Execute systematic replacement** - Update all 11 component files
5. **Test thoroughly** - Verify all functionality preserved
6. **Update documentation** - Reflect new token system

### Questions to Resolve

1. **Naming Convention**: Prefer Tailwind numeric (`--space-4`) or semantic (`--spacing-md`)?
2. **Token Additions**: Should we add ALL Tailwind spacing values (0-96) or just what we use?
3. **Component Tokens**: Keep slider tokens in main file or create component-scoped tokens?
4. **Dark Mode**: Any additional tokens needed for dark mode beyond color adjustments?

---

## Appendix: Token Usage Statistics

### Most Used Tokens (Top 10)

| Token | Usage Count | Category |
|-------|-------------|----------|
| `--editor-space-md` | 54 | Spacing |
| `--editor-space-sm` | 44 | Spacing |
| `--editor-space-lg` | 33 | Spacing |
| `--editor-space-xl` | 31 | Spacing |
| `--editor-transition-fast` | 25 | Transition |
| `--editor-border` | 23 | Color |
| `--editor-text` | 22 | Color |
| `--editor-primary` | 21 | Color |
| `--editor-font-weight-semibold` | 18 | Typography |
| `--editor-space-xs` | 17 | Typography |

**Insight**: Spacing tokens dominate usage (40%), followed by colors (25%) and typography (20%).

---

**Document Status**: ✅ Ready for Review
**Estimated Migration Time**: 4-6 hours
**Risk Level**: Low
**Recommended Approach**: Systematic replacement with full shadcn tokenization

---

**Next Document**: `shadcn-migration-implementation.md` (after approval)
