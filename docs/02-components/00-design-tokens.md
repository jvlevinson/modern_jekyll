# Design Token System Reference

**Last Updated**: October 1, 2025
**Phase**: Phase 2 - Token System Completion

---

## Overview

This project uses a comprehensive design token system for systematic, scalable theming. All design values are centralized as CSS custom properties, making the site easily customizable and forkable.

---

## Token Architecture

```
User Configuration (_config.yml)
    ↓
Palette Tokens (_data/color-palettes.yml)
    ↓
Raw Color Tokens (--color-primary-500)
    ↓
Semantic Tokens (--color-primary, --color-text)
    ↓
Component Usage (var(--color-primary))
```

### Theme Pattern

**Theme-Agnostic Tokens** → `:root` only (spacing, typography, radius, opacity, timing, z-index)
**Theme-Specific Tokens** → `:root` (light default) + `[data-theme="dark"]` (dark override)

---

## Token Categories

### 1. Color Tokens

#### Palette Selection (User Configurable)

Edit `_config.yml`:
```yaml
theme:
  brand_primary: "blue"      # orange | blue | green | purple | red
  brand_secondary: "green"   # orange | blue | green | purple | red | null
  neutral: "slate"           # slate | gray
  mode: "light"              # light | dark | auto
```

#### Raw Color Tokens

Generated dynamically from palette selection in `_includes/design-tokens.html`:
- `--color-primary-50` through `--color-primary-900` (10 shades)
- `--color-secondary-50` through `--color-secondary-900` (optional)
- `--color-neutral-50` through `--color-neutral-900`

#### Semantic Color Tokens

Contextual meaning assigned to raw colors:
- `--color-primary` - Main brand color
- `--color-primary-hover` - Hover state (generated via color-mix())
- `--color-primary-active` - Active/pressed state (generated via color-mix())
- `--color-text` - Body text
- `--color-text-secondary` - Secondary text
- `--color-text-muted` - Muted/disabled text
- `--color-text-inverse` - Text on dark backgrounds
- `--color-background` - Page background
- `--color-surface` - Card/panel background
- `--color-border` - Border colors

#### Dynamic Color Generation with color-mix()

Hover and active states are generated dynamically using CSS `color-mix()` function:

**Light Theme** (darken toward black):
```css
--color-primary-hover: color-mix(in srgb, var(--color-primary) 90%, black 10%);
--color-primary-active: color-mix(in srgb, var(--color-primary) 85%, black 15%);
```

**Dark Theme** (lighten toward white):
```css
--color-primary-hover: color-mix(in srgb, var(--color-primary) 85%, white 15%);
--color-primary-active: color-mix(in srgb, var(--color-primary) 80%, white 20%);
```

**Color Space Strategy:**
- `srgb` - Simple darkening/lightening toward black/white (hover/active states)
- `oklch` - Perceptually uniform mixing for nuanced effects (glows, decorations)
- `transparent` - Alpha/opacity effects (overlays, shadows)

**Benefits:**
- Works with ANY user-selected palette automatically
- No static shade dependencies
- Runtime color manipulation without SCSS compilation
- More flexible for theme customization and forking

---

### 2. Spacing Tokens (8pt Grid)

| Token           | Value   | Use Case                    |
|-----------------|---------|----------------------------|
| `--space-0`     | 0       | No spacing                 |
| `--space-xs`    | 0.5rem  | 8px - Tight spacing        |
| `--space-sm`    | 1rem    | 16px - Small spacing       |
| `--space-md`    | 1.25rem | 20px - Medium spacing      |
| `--space-lg`    | 2rem    | 32px - Large spacing       |
| `--space-xl`    | 3.125rem| 50px - Extra large spacing |
| `--space-2xl`   | 6.25rem | 100px - Section spacing    |

---

### 3. Typography Tokens

**Font Families**:
- `--font-sans`: 'Open Sans' (headings, UI)
- `--font-serif`: 'Merriweather' (body text)

**Font Sizes**:
- `--font-size-sm`: 13px
- `--font-size-md`: 14px
- `--font-size-base`: 16px
- `--font-size-lg`: 18px
- `--font-size-xl`: 22px

**Font Weights**:
- `--font-weight-normal`: 400
- `--font-weight-medium`: 600
- `--font-weight-bold`: 700

**Line Heights**:
- `--line-height-tight`: 1.2 (headings)
- `--line-height-base`: 1.5 (body text)

---

### 4. Border Radius Tokens

| Token             | Value  | Use Case                |
|-------------------|--------|------------------------|
| `--radius-none`   | 0      | Sharp edges            |
| `--radius-xs`     | 2px    | Minimal (badges)       |
| `--radius-sm`     | 3px    | Small (tooltips)       |
| `--radius-md`     | 5px    | Medium (inputs, cards) |
| `--radius-lg`     | 10px   | Large (modals)         |
| `--radius-xl`     | 15px   | Extra large            |
| `--radius-2xl`    | 20px   | Maximum rounding       |
| `--radius-pill`   | 300px  | Pills (buttons)        |
| `--radius-circle` | 50%    | Perfect circles        |

---

### 5. Animation Timing Tokens

#### Duration Scale

| Token                   | Value | Use Case                    |
|------------------------|-------|----------------------------|
| `--duration-instant`    | 0.1s  | Micro-interactions         |
| `--duration-fast`       | 0.2s  | Quick transitions          |
| `--duration-normal`     | 0.35s | Standard transitions       |
| `--duration-slow`       | 0.5s  | Deliberate transitions     |
| `--duration-slower`     | 0.75s | Attention-drawing          |
| `--duration-slowest`    | 1s    | Dramatic effects           |
| `--duration-extra-slow` | 1.5s  | Repeating animations       |
| `--duration-2s`         | 2s    | Specific long animations   |

#### Delay Scale

For staggered animations (service boxes, portfolio grid):
- `--delay-0`: 0s
- `--delay-1`: 0.1s
- `--delay-2`: 0.2s
- `--delay-3`: 0.3s
- `--delay-4`: 0.4s
- `--delay-5`: 0.5s
- `--delay-7`: 0.7s
- `--delay-8`: 0.8s

*Increment by 0.1s for smooth cascade effect*

#### Easing Functions

- `--ease-linear`: linear
- `--ease-in`: cubic-bezier(0.4, 0, 1, 1)
- `--ease-out`: cubic-bezier(0, 0, 0.2, 1)
- `--ease-in-out`: cubic-bezier(0.4, 0, 0.2, 1)
- `--ease-bounce`: cubic-bezier(0.68, -0.55, 0.265, 1.55)

#### Combined Transitions

Convenience tokens combining duration + easing:
- `--transition-instant`: 0.1s ease-out
- `--transition-fast`: 0.2s ease-out
- `--transition-normal`: 0.35s ease-in-out
- `--transition-slow`: 0.5s ease-in-out

---

### 6. Opacity Tokens

Standard increments for consistent transparency:

| Token            | Value | Common Use                |
|------------------|-------|---------------------------|
| `--opacity-0`    | 0     | Hidden                    |
| `--opacity-5`    | 0.05  | Subtle overlays           |
| `--opacity-10`   | 0.1   | Very light overlays       |
| `--opacity-20`   | 0.2   | Light overlays            |
| `--opacity-30`   | 0.3   | Background overlays       |
| `--opacity-40`   | 0.4   | Medium overlays           |
| `--opacity-50`   | 0.5   | Half transparency         |
| `--opacity-60`   | 0.6   | Moderate transparency     |
| `--opacity-65`   | 0.65  | Disabled states           |
| `--opacity-70`   | 0.7   | Prominent overlays        |
| `--opacity-80`   | 0.8   | Strong overlays           |
| `--opacity-90`   | 0.9   | Hover effects             |
| `--opacity-95`   | 0.95  | Near-solid backgrounds    |
| `--opacity-100`  | 1     | Fully opaque              |

---

### 7. Z-Index Tokens

Systematic layering scale:
- `--z-base`: 1
- `--z-dropdown`: 1000
- `--z-sticky`: 1020
- `--z-fixed`: 1030
- `--z-modal-backdrop`: 1040
- `--z-modal`: 1050
- `--z-popover`: 1060
- `--z-tooltip`: 1070

---

### 8. Shadow Tokens

#### Light Theme
- `--shadow-sm`: 0 1px 3px rgba(0, 0, 0, 0.12)
- `--shadow-md`: 0 4px 6px rgba(0, 0, 0, 0.1)
- `--shadow-lg`: 0 10px 25px rgba(0, 0, 0, 0.15)

#### Dark Theme (Stronger for depth)
- `--shadow-sm`: 0 1px 3px rgba(0, 0, 0, 0.5)
- `--shadow-md`: 0 4px 6px rgba(0, 0, 0, 0.4)
- `--shadow-lg`: 0 10px 25px rgba(0, 0, 0, 0.6)

---

### 9. Component-Specific Tokens

For unique values that don't fit standard scales:

**Selection Component**:
- `--selection-padding-y`: 2px
- `--selection-padding-x`: 6px

*Add more as needed while maintaining semantic naming*

---

## Usage Guidelines

### ✅ DO

```scss
// Use semantic tokens in components
.button {
  background: var(--color-primary);
  padding: var(--space-md);
  border-radius: var(--radius-pill);
  transition: all var(--transition-normal);
  opacity: var(--opacity-90);
}
```

### ❌ DON'T

```scss
// Don't use magic numbers
.button {
  background: #3b82f6;
  padding: 20px;
  border-radius: 300px;
  transition: all 0.35s ease;
  opacity: 0.9;
}
```

### Theme-Aware Components

```scss
// Light theme default
.component {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-md);
}

// Dark theme overrides (if needed)
[data-theme="dark"] {
  .component {
    // Only override what needs to change
    // Most tokens adapt automatically!
  }
}
```

---

## Customization for Forks

### Change Brand Colors

Edit `_config.yml`:
```yaml
theme:
  brand_primary: "purple"    # Switch from blue to purple
  brand_secondary: "orange"  # Add accent color
  neutral: "gray"            # Use gray instead of slate
  mode: "dark"               # Default to dark theme
```

### Adjust Token Values

Edit `_sass/abstracts/_variables.scss`:
```scss
:root {
  // Adjust spacing scale
  --space-md: 1.5rem;  // Increase from 1.25rem

  // Adjust timing
  --duration-normal: 0.25s;  // Faster transitions

  // Add custom tokens
  --my-custom-value: 42px;
}
```

### Component-Specific Customization

```scss
// In component file
.my-component {
  padding: var(--space-lg);
  border-radius: var(--radius-md);

  // Component-specific override
  @media (max-width: 768px) {
    padding: var(--space-sm);
  }
}
```

---

## Token Location Reference

| Category          | File Location                       | Theme Mode |
|-------------------|-------------------------------------|------------|
| Color tokens      | `_includes/design-tokens.html`      | Both       |
| Spacing           | `_sass/abstracts/_variables.scss`   | Agnostic   |
| Typography        | `_sass/abstracts/_variables.scss`   | Agnostic   |
| Border radius     | `_sass/abstracts/_variables.scss`   | Agnostic   |
| Z-index           | `_sass/abstracts/_variables.scss`   | Agnostic   |
| Opacity           | `_sass/abstracts/_variables.scss`   | Agnostic   |
| Animation timing  | `_sass/abstracts/_variables.scss`   | Agnostic   |
| Shadows           | `_sass/abstracts/_variables.scss`   | Both       |

---

## Browser Support

All tokens use CSS custom properties (CSS Variables):
- ✅ Chrome 49+
- ✅ Firefox 31+
- ✅ Safari 9.1+
- ✅ Edge 15+

Advanced features:
- `color-mix()`: Chrome 111+, Firefox 113+, Safari 16.2+
- `oklch` color space: Chrome 111+, Firefox 113+, Safari 15.4+

---

## Maintenance Notes

### Adding New Tokens

1. Add to `_sass/abstracts/_variables.scss` in `:root` block
2. Add inline documentation comment
3. Update this documentation file
4. Test in both light and dark themes

### Modifying Existing Tokens

1. Check all usages: `grep -r "var(--token-name)" _sass/`
2. Test visual impact in browser
3. Update documentation if use case changes
4. Consider adding migration note if breaking change

---

## Phase 2 Implementation Summary

**Completed**: October 1, 2025

**Tokens Added**:
- ✅ Border radius scale (9 tokens)
- ✅ Opacity scale (14 tokens)
- ✅ Animation duration scale (8 tokens)
- ✅ Animation delay scale (8 tokens)
- ✅ Easing functions (5 tokens)
- ✅ Component-specific tokens (2 tokens)

**Magic Numbers Eliminated**: 30+ hardcoded values replaced

**Files Modified**: 11 files
**Token Coverage**: 100%

---

## See Also

- [CLAUDE.md](../../CLAUDE.md) - Project architecture overview
- [Phase 2 Plan](../01-project/03-plans/03-20251001-001.02-phase-2-token-completion.md) - Detailed implementation plan
- [_variables.scss](../../_sass/abstracts/_variables.scss) - Token definitions
- [design-tokens.html](../../_includes/design-tokens.html) - Color token generation
