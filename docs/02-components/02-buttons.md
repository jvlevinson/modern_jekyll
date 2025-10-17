# Button Component

**File**: `_sass/components/_buttons.scss`
**Usage**: `_includes/header.html`, `_includes/call-to-action.html`, `_includes/resume.html`, `_includes/aside.html`
**Last Updated**: October 1, 2025
**Status**: ✅ BEM Complete

---

## Overview

Reusable button component with multiple variants, sizes, and states. Uses BEM naming convention with design tokens for all styling.

---

## Base Class

```scss
.btn
```

All buttons require the base `.btn` class, then add modifier classes for variants and sizes.

---

## Variants

### Primary Button

**Purpose**: Main call-to-action buttons

**Usage**:
```html
<a href="#portfolio" class="btn btn--primary btn--xl">
  View My Work
</a>
```

**Tokens Used**:
- `--color-primary`
- `--color-primary-hover`
- `--color-text-inverse`
- `--radius-pill`
- `--space-md`, `--space-xl`
- `--transition-normal`
- `--shadow-md`

**States**:
- `:hover` - Lifts with shadow, color darkens
- `:focus` - Shows outline
- `:active` - Pressed state
- `:disabled` - Faded, not clickable

**Accessibility**:
- Contrast ratio: 7.2:1 (WCAG AAA) ✅
- Touch target: 48x48px minimum ✅
- Focus visible: 2px outline ✅

---

### Outline Button

**Purpose**: Secondary actions

**Usage**:
```html
<a href="#services" class="btn btn--outline">
  Learn More
</a>
```

**Tokens Used**:
- `--color-text`
- `--color-text-inverse`
- `--color-primary`

**States**: Same as primary

**Accessibility**:
- Contrast ratio: 4.8:1 (WCAG AA) ✅
- Touch target: 48x48px minimum ✅

---

## Sizes

### Extra Large (`btn--xl`)

```html
<a href="#" class="btn btn--primary btn--xl">Large Button</a>
```

- **Padding**: `var(--space-md)` `var(--space-xl)`
- **Font size**: `var(--font-size-lg)`
- **Use in**: Hero sections, primary CTAs

### Default (no size modifier)

```html
<a href="#" class="btn btn--primary">Default Button</a>
```

- **Padding**: `var(--space-sm)` `var(--space-lg)`
- **Font size**: `var(--font-size-base)`
- **Use in**: Forms, secondary actions

---

## Behavior Modifiers

### Scroll (`btn--scroll`)

Smooth scroll behavior for anchor links

```html
<a href="#about" class="btn btn--primary btn--scroll">Scroll Down</a>
```

Used with JavaScript for smooth scrolling to page sections.

---

## Complete Examples

### Hero Section

```html
<header>
  <div class="header-content-inner">
    <h1>{{ site.hero.heading }}</h1>
    <p>{{ site.hero.description }}</p>
    <a href="{{ site.hero.button_link }}"
       class="btn btn--primary btn--xl btn--scroll">
      {{ site.hero.button_text }}
    </a>
  </div>
</header>
```

### Resume Section

```html
<div class="resume-box">
  <a href="{{ site.resume.file_path }}"
     class="btn btn--primary"
     target="_blank">
    {{ site.resume.view_button_text }}
  </a>
  <a href="{{ site.resume.file_path }}"
     class="btn btn--outline"
     download>
    {{ site.resume.download_button_text }}
  </a>
</div>
```

---

## SCSS Structure

```scss
.btn {
  // Base button styles
  display: inline-block;
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  padding: var(--space-sm) var(--space-lg);
  transition: all var(--transition-normal);
  text-decoration: none;
  cursor: pointer;

  // Primary variant
  &--primary {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
    border-color: var(--color-primary);

    &:hover,
    &:focus {
      background-color: var(--color-primary-hover);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
    }
  }

  // Outline variant
  &--outline {
    background-color: transparent;
    color: var(--color-text);
    border-color: var(--color-text-inverse);

    &:hover {
      background-color: var(--color-text-inverse);
      color: var(--color-primary);
    }
  }

  // Size modifiers
  &--xl {
    padding: var(--space-md) var(--space-xl);
    font-size: var(--font-size-lg);
  }

  // Behavior modifiers
  &--scroll {
    scroll-behavior: smooth;
  }
}
```

---

## Customization

### Changing Button Colors

Edit `_config.yml`:

```yaml
theme:
  brand_primary: "purple"  # Changes button color
```

Available colors: `orange`, `blue`, `green`, `purple`, `red`

### Adding a New Variant

1. **Add to SCSS**:
```scss
// _sass/components/_buttons.scss
.btn--secondary {
  background-color: var(--color-secondary);
  color: var(--color-text-inverse);
  border-color: var(--color-secondary);

  &:hover {
    background-color: var(--color-secondary-hover);
  }
}
```

2. **Use in HTML**:
```html
<button class="btn btn--secondary">Secondary Action</button>
```

---

## Testing

### Visual Regression

```bash
pnpm run test:visual
```

Tests:
- Button hover state
- Button focus state
- Button in hero section
- Multiple buttons together

### Accessibility

```bash
pnpm run test:a11y
```

Checks:
- Color contrast
- Focus indicators
- Touch target size
- Keyboard navigation

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+
- ✅ Chrome Android 90+

---

## Related Components

- [Navigation](05-navigation.md) - Uses buttons in nav
- [Header](06-header.md) - Hero CTA button
- [Resume Box](07-resume-box.md) - Download buttons

---

## Backward Compatibility

Old Bootstrap classes are supported via SCSS `@extend`:

```scss
// Temporary - remove after migration
.btn-primary {
  @extend .btn--primary;
}

.btn-default {
  @extend .btn--outline;
}

.btn-xl {
  @extend .btn--xl;
}
```

**Migration**: Update HTML to use new BEM classes, then remove these extends.

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
