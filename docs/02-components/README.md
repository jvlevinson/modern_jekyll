# Component Library

**Last Updated**: October 1, 2025
**Status**: ✅ Complete - All components migrated to BEM

---

## Overview

Living documentation for all UI components in the Modern Jekyll Portfolio. All components follow BEM naming convention and use design tokens for consistent styling.

---

## Component Index

1. [**Design Tokens**](00-design-tokens.md) - Color, spacing, typography tokens
2. [**BEM Style Guide**](01-bem-style-guide.md) - BEM naming convention guide
3. [**Buttons**](02-buttons.md) - Button variants and states
4. [**Service Box**](03-service-box.md) - Service display component
5. [**Portfolio Box**](04-portfolio-box.md) - Portfolio item with flip functionality
6. [**Navigation**](05-navigation.md) - Main navigation bar
7. [**Header/Hero**](06-header.md) - Hero section
8. [**Resume Box**](07-resume-box.md) - Resume download section
9. [**Footer**](08-footer.md) - Site footer

---

## Quick Reference

### Naming Convention (BEM)

All components use BEM naming:
- `.block` - Component container
- `.block__element` - Child element
- `.block--modifier` - Variant or state

**Example:**
```html
<div class="service-box">
  <i class="service-box__icon"></i>
  <h3 class="service-box__title"></h3>
  <p class="service-box__description"></p>
</div>
```

---

## Usage Guidelines

### 1. Always Use Design Tokens

Never use hardcoded values. Always reference design tokens:

```scss
// ✅ Good
.component {
  padding: var(--space-md);
  color: var(--color-text);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
}

// ❌ Bad
.component {
  padding: 20px;
  color: #222;
  border-radius: 5px;
  transition: all 0.3s ease;
}
```

### 2. Follow BEM Structure

Keep component styling self-contained:

```scss
.portfolio-box {
  // Container styles

  &__image {
    // Element styles
  }

  &--flippable {
    // Modifier styles
  }
}
```

### 3. Accessibility Requirements

All components must meet:
- **WCAG 2.1 AA** contrast (4.5:1 minimum)
- **Keyboard accessible** - Tab navigation works
- **Screen reader friendly** - Proper ARIA labels
- **Focus indicators visible** - Outline on focus

---

## Component Status

| Component | BEM Migration | Tokens | A11y | Tests |
|-----------|--------------|--------|------|-------|
| Buttons | ✅ Complete | ✅ Yes | ✅ AA | ✅ Yes |
| Service Box | ✅ Complete | ✅ Yes | ✅ AA | ✅ Yes |
| Portfolio Box | ✅ Complete | ✅ Yes | ✅ AA | ✅ Yes |
| Navigation | ✅ Complete | ✅ Yes | ✅ AA | ✅ Yes |
| Header/Hero | ✅ Complete | ✅ Yes | ✅ AA | ✅ Yes |
| Resume Box | ✅ Complete | ✅ Yes | ✅ AA | ✅ Yes |
| Footer | ✅ Complete | ✅ Yes | ✅ AA | ✅ Yes |

---

## File Structure

```
_sass/
├── components/
│   ├── _buttons.scss          # .btn, .btn--primary, etc.
│   ├── _service-box.scss      # .service-box__*
│   ├── _portfolio-box.scss    # .portfolio-box__*
│   ├── _resume-box.scss       # .resume-box__*
│   ├── _theme-toggle.scss     # .theme-toggle__*
│   └── _index.scss            # Component index
├── layout/
│   ├── _navigation.scss       # .nav__*
│   ├── _header.scss           # .header__*
│   ├── _footer.scss           # .footer__*
│   └── _sections.scss         # .section-heading, .cta__*
└── abstracts/
    ├── _design-tokens.scss    # CSS custom properties
    ├── _mixins.scss           # Reusable mixins
    └── _index.scss            # Abstracts index
```

---

## Design System

### Colors

All colors are configurable through `_config.yml`:

```yaml
theme:
  brand_primary: "blue"      # orange, blue, green, purple, red
  brand_secondary: "green"   # or null
  neutral: "slate"           # slate or gray
  mode: "light"              # light, dark, or auto
```

### Spacing Scale

Consistent spacing using design tokens:

- `--space-xs`: 0.5rem (8px)
- `--space-sm`: 1rem (16px)
- `--space-md`: 1.5rem (24px)
- `--space-lg`: 2.5rem (40px)
- `--space-xl`: 4rem (64px)

### Typography

- `--font-sans`: "Montserrat", sans-serif
- `--font-serif`: "Merriweather", serif
- Font sizes: `--font-size-sm` through `--font-size-xl`

---

## Browser Support

All components tested and working on:

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+
- ✅ Chrome Android 90+

---

## Testing

### Config Validation
```bash
pnpm run validate:config
```

### Visual Regression (Playwright)
```bash
pnpm run test:visual
```

### Accessibility (axe-core)
```bash
pnpm run test:a11y
```

### All Tests
```bash
pnpm test
```

---

## Contributing

### Adding a New Component

1. Choose a semantic block name (e.g., `testimonial`)
2. Create SCSS file in `_sass/components/` or `_sass/layout/`
3. Use BEM naming throughout
4. Reference design tokens for all values
5. Add to `_index.scss`
6. Create component documentation (copy template from existing docs)
7. Add visual regression tests
8. Verify accessibility compliance

### Modifying Existing Components

1. Maintain existing BEM class names (don't break compatibility)
2. Add new modifiers for new variants
3. Update component documentation
4. Update visual regression baseline if needed
5. Run all tests before committing

---

## Resources

- [BEM Official Documentation](http://getbem.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Playwright Testing](https://playwright.dev/)
- [Design Tokens Reference](00-design-tokens.md)

---

**Document Status**: ✅ Complete
**Maintainer**: Jordan v. levinson
**Last Review**: October 1, 2025
