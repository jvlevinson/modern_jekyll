# BEM Style Guide

**Last Updated**: October 1, 2025
**Phase**: Phase 4 - BEM Migration Complete

---

## Overview

This project uses BEM (Block Element Modifier) naming convention for all CSS classes. BEM provides a systematic, predictable naming structure that improves code maintainability and prevents naming conflicts.

---

## BEM Methodology

### Naming Convention

```
.block
.block__element
.block--modifier
.block__element--modifier
```

### Structure

- **Block**: Standalone component (e.g., `.service-box`, `.btn`, `.nav`)
- **Element**: Part of a block (e.g., `.service-box__icon`, `.btn__text`)
- **Modifier**: Variant of a block or element (e.g., `.btn--primary`, `.service-box--featured`)

---

## Naming Rules

### DO ✅

```scss
// Good: Clear hierarchy
.portfolio-box { }
.portfolio-box__image { }
.portfolio-box__overlay { }
.portfolio-box--flippable { }

// Good: Semantic names
.btn--primary { }
.btn--outline { }
.btn--xl { }

// Good: Multiple modifiers
.btn.btn--primary.btn--xl { }
```

### DON'T ❌

```scss
// Bad: Nested elements
.portfolio-box__overlay__content { }
// Use: .portfolio-box__content

// Bad: Generic names
.box { }
.item { }
.thing { }

// Bad: Mixing BEM with utility classes
.btn--primary.text-center { }
// Use component-specific styling instead
```

---

## Component Examples

### Service Box

**HTML:**
```html
<div class="service-box">
  <i class="service-box__icon fa-solid fa-diamond"></i>
  <h3 class="service-box__title">IT Strategy</h3>
  <p class="service-box__description">Leading IT initiatives...</p>
</div>
```

**SCSS:**
```scss
.service-box {
  max-width: 400px;
  text-align: center;

  &__icon {
    font-size: 4rem;
    color: var(--color-primary);
  }

  &__title {
    font-weight: var(--font-weight-bold);
  }

  &__description {
    color: var(--color-text-muted);
  }
}
```

---

### Buttons

**HTML:**
```html
<!-- Primary button -->
<a href="#" class="btn btn--primary btn--xl">View My Work</a>

<!-- Outline button -->
<a href="#" class="btn btn--outline btn--xl">Learn More</a>

<!-- Scroll behavior -->
<a href="#about" class="btn btn--primary btn--scroll">About</a>
```

**SCSS:**
```scss
.btn {
  // Base button styles
  border-radius: var(--radius-pill);
  transition: all var(--transition-normal);

  &--primary {
    background-color: var(--color-primary);
    color: var(--color-text-inverse);
  }

  &--outline {
    background-color: transparent;
    border: 2px solid var(--color-text-inverse);
  }

  &--xl {
    padding: var(--space-md) var(--space-lg);
  }

  &--scroll {
    scroll-behavior: smooth;
  }
}
```

---

### Portfolio Box

**HTML:**
```html
<div class="portfolio-box portfolio-box--flippable">
  <div class="portfolio-box__inner">
    <div class="portfolio-box__front">
      <img src="..." class="portfolio-box__image" alt="...">
      <div class="portfolio-box__overlay">
        <div class="portfolio-box__content">
          <div class="portfolio-box__category">Enterprise IT</div>
          <div class="portfolio-box__name">IT Manager</div>
        </div>
      </div>
    </div>
    <div class="portfolio-box__back">
      <div class="portfolio-box__content">
        <div class="portfolio-box__category">Enterprise IT</div>
        <div class="portfolio-box__name">IT Manager</div>
        <p class="portfolio-box__description">Detailed description...</p>
      </div>
    </div>
  </div>
</div>
```

**SCSS:**
```scss
.portfolio-box {
  position: relative;
  max-width: 650px;

  &--flippable {
    perspective: 1000px;
    cursor: pointer;
  }

  &--flipped &__inner {
    transform: rotateY(180deg);
  }

  &__image {
    display: block;
    width: 100%;
  }

  &__overlay {
    opacity: 0;
    transition: opacity var(--transition-normal);
  }

  &:hover &__overlay {
    opacity: 1;
  }
}
```

---

### Navigation

**HTML:**
```html
<nav class="nav" id="mainNav">
  <a href="#top" class="nav__brand">Jordan v. levinson</a>
  <ul class="nav__menu">
    <li class="nav__item">
      <a href="#about" class="nav__link nav__link--scroll">About</a>
    </li>
  </ul>
</nav>
```

**SCSS:**
```scss
.nav {
  position: fixed;
  z-index: var(--z-fixed);

  &__brand {
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
  }

  &__link {
    text-transform: uppercase;
    transition: color var(--transition-fast);

    &--scroll {
      cursor: pointer;
    }
  }

  &--shrink {
    background-color: var(--navbar-bg-scrolled);
    box-shadow: var(--shadow-sm);
  }
}
```

---

## When to Use Modifiers

### State Changes
Use modifiers for states that can be toggled:
```scss
.portfolio-box--flipped { }
.nav--shrink { }
.btn--disabled { }
```

### Variations
Use modifiers for style variants:
```scss
.btn--primary { }
.btn--outline { }
.btn--secondary { }
```

### Sizes
Use modifiers for size variants:
```scss
.btn--xl { }
.btn--sm { }
.service-box__icon--large { }
```

---

## Integration with Design Tokens

BEM classes should always reference design tokens, never hardcoded values:

**DO ✅**
```scss
.service-box__icon {
  font-size: 4rem;  // OK: rem units
  color: var(--color-primary);  // Good: design token
  margin-bottom: var(--space-md);  // Good: design token
}
```

**DON'T ❌**
```scss
.service-box__icon {
  color: #3b82f6;  // Bad: hardcoded color
  margin-bottom: 20px;  // Bad: magic number
}
```

---

## JavaScript Integration

### Class Selectors
```javascript
// Query by block
const portfolios = document.querySelectorAll('.portfolio-box');

// Query by modifier
const flippableItems = document.querySelectorAll('.portfolio-box--flippable');

// Toggle modifiers
element.classList.toggle('portfolio-box--flipped');
element.classList.add('nav--shrink');
```

### Event Handling
```javascript
// Specific element click
document.querySelectorAll('.portfolio-box__image').forEach(img => {
  img.addEventListener('click', handleClick);
});

// Parent delegation
document.querySelector('.nav').addEventListener('click', (e) => {
  if (e.target.classList.contains('nav__link')) {
    // Handle link click
  }
});
```

---

## Backward Compatibility

During migration, SCSS `@extend` provides backward compatibility:

```scss
// New BEM classes
.btn--primary { }

// Old Bootstrap classes (temporary)
.btn-primary {
  @extend .btn--primary;
}
```

**Migration Strategy:**
1. Create new BEM class with full styling
2. Add @extend for old class name
3. Update HTML templates to use new classes
4. Remove @extend after all templates updated

---

## Common Patterns

### Container + Content
```scss
.portfolio-box__overlay {
  // Container positioning/sizing
}

.portfolio-box__content {
  // Content layout within container
}
```

### Parent Selector Targeting
```scss
.portfolio-box {
  &--flippable {
    // Modifier styles
  }

  // Child targeted by parent state
  &--flipped &__inner {
    transform: rotateY(180deg);
  }
}
```

### Context-Specific Styling
```scss
.portfolio-box__category {
  font-size: 0.875rem;

  // Different sizing in back side
  .portfolio-box__back & {
    margin-bottom: var(--space-md);
  }
}
```

---

## Cheat Sheet

| Pattern | Example | Use Case |
|---------|---------|----------|
| `.block` | `.btn` | Component root |
| `.block__element` | `.btn__text` | Component part |
| `.block--modifier` | `.btn--primary` | Component variant |
| `.block__element--modifier` | `.nav__link--active` | Element variant |
| `.block.block--modifier` | `.btn.btn--primary` | Combined usage |

---

## File Organization

```
_sass/
├── components/
│   ├── _buttons.scss          # .btn, .btn--primary, etc.
│   ├── _service-box.scss      # .service-box__*
│   ├── _portfolio-box.scss    # .portfolio-box__*
│   └── _theme-toggle.scss     # .theme-toggle__*
└── layout/
    ├── _navigation.scss       # .nav__*
    ├── _header.scss           # .header__*
    └── _footer.scss           # .footer__*
```

---

## Migration Checklist

When migrating a component to BEM:

- [ ] Identify block (component root)
- [ ] List all elements (component parts)
- [ ] List all modifiers (variants/states)
- [ ] Update SCSS with BEM structure
- [ ] Update HTML templates
- [ ] Update JavaScript selectors
- [ ] Add @extend for backward compatibility
- [ ] Test all states and variants
- [ ] Remove @extend after verification
- [ ] Document component structure

---

## Resources

- [BEM Official Documentation](http://getbem.com/)
- [CSS Guidelines - BEM](https://cssguidelin.es/#bem-like-naming)
- Project design tokens: `docs/02-components/00-design-tokens.md`
- Phase 4 implementation: `docs/01-project/03-plans/05-20251001-001.04-phase-4-bem-migration.md`

---

## Maintenance

### Adding New Components

1. Choose a semantic block name
2. List all needed elements and modifiers
3. Create SCSS file in appropriate directory
4. Use BEM naming throughout
5. Reference design tokens for all values
6. Document component in this guide

### Modifying Existing Components

1. Maintain existing BEM structure
2. Add new modifiers for variants
3. Never break existing class names
4. Update documentation

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
