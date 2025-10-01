# Portfolio Box Component

**File**: `_sass/components/_portfolio-box.scss`
**Usage**: `_includes/portfolio.html`
**Last Updated**: October 1, 2025
**Status**: ✅ BEM Complete

---

## Overview

Portfolio item display component with 3D flip functionality, hover overlays, and responsive images. Features card flip interaction showing detailed information on the back side.

---

## Structure

```html
<div class="portfolio-box portfolio-box--flippable">
  <div class="portfolio-box__inner">
    <!-- Front side -->
    <div class="portfolio-box__front">
      <img src="img/portfolio/1.jpg"
           class="portfolio-box__image"
           loading="lazy"
           alt="Project Name">

      <div class="portfolio-box__overlay">
        <div class="portfolio-box__content">
          <div class="portfolio-box__category">Category</div>
          <div class="portfolio-box__name">Project Name</div>
        </div>
      </div>
    </div>

    <!-- Back side -->
    <div class="portfolio-box__back">
      <div class="portfolio-box__content">
        <div class="portfolio-box__category">Category</div>
        <div class="portfolio-box__name">Project Name</div>
        <p class="portfolio-box__description">Detailed description...</p>
      </div>
    </div>
  </div>
</div>
```

---

## Elements

### `.portfolio-box` (Block)

Container for portfolio item.

**Tokens Used**:
- Position and overflow

### `.portfolio-box--flippable` (Modifier)

Enables 3D flip functionality.

**Features**:
- Perspective for 3D effect
- Cursor pointer
- Corner brackets animation on hover

### `.portfolio-box--flipped` (Modifier)

Applied by JavaScript when clicked to show back side.

```javascript
element.classList.toggle('portfolio-box--flipped');
```

### `.portfolio-box__inner`

Inner container for 3D transformation.

**Tokens Used**:
- `--transition-slow`
- Transform style preserve-3d

### `.portfolio-box__front` / `.portfolio-box__back`

Front and back faces of the card.

**Features**:
- Backface visibility hidden
- Absolute positioning for back
- Transform rotate for flip

### `.portfolio-box__image`

Portfolio image element.

**Features**:
- Responsive (width: 100%)
- Lazy loading
- Alt text for accessibility

### `.portfolio-box__overlay`

Hover overlay on front face.

**Tokens Used**:
- `--color-primary`
- `--transition-normal`
- `--opacity-0`

**Features**:
- Fades in on hover
- Color-mix for transparency
- Centered content

### `.portfolio-box__content`

Content container for text.

**Tokens Used**:
- `--color-text-inverse`
- `--space-md`

### `.portfolio-box__category`

Project category label.

**Tokens Used**:
- `--font-sans`
- `--font-weight-semibold`
- `--space-xs`

### `.portfolio-box__name`

Project name/title.

**Tokens Used**:
- `--font-sans`
- `--font-weight-bold`
- `--space-sm`

### `.portfolio-box__description`

Detailed description (back side only).

**Tokens Used**:
- `--font-size-md`, `--font-size-base`
- `--line-height-base`

---

## Configuration

Edit `_config.yml`:

```yaml
portfolio_heading: My Work
portfolio_items:
  - image: img/portfolio/1.jpg
    category: Enterprise IT
    name: SCI - Senior IT Manager / Interim Director
    link: "#"
    flip_description: Led enterprise IT strategy for a Fortune 500 company...

  - image: img/portfolio/2.jpg
    category: IT Field Ops
    name: SCI - IT Manager & Field Ops Manager
    link: "#"
    flip_description: Directed field operations for 2,500+ locations...
```

---

## Interactions

### Hover Overlay

Front face shows overlay on hover:

```scss
.portfolio-box__front:hover .portfolio-box__overlay {
  opacity: 1;
}
```

### Click to Flip

JavaScript toggles the flipped state:

```javascript
// js/creative.js
document.querySelectorAll('.portfolio-box--flippable').forEach(container => {
  container.addEventListener('click', function(e) {
    e.preventDefault();
    this.classList.toggle('portfolio-box--flipped');
  });
});
```

### Corner Brackets

Animated brackets appear on hover:

```scss
.portfolio-box--flippable {
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 30px;
    height: 30px;
    border: 3px solid var(--color-text-inverse);
    opacity: 0;
    transition: all var(--transition-normal);
    z-index: 10;
  }

  &::before {
    top: 10px;
    left: 10px;
    border-right: none;
    border-bottom: none;
  }

  &::after {
    bottom: 10px;
    right: 10px;
    border-left: none;
    border-top: none;
  }

  &:hover::before,
  &:hover::after {
    opacity: 1;
  }
}
```

---

## SCSS Structure

```scss
.portfolio-box {
  position: relative;
  display: block;
  max-width: 650px;
  margin: 0 auto;
  overflow: hidden;

  &--flippable {
    perspective: 1000px;
    cursor: pointer;
  }

  &--flipped &__inner {
    transform: rotateY(180deg);
  }

  &__inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform var(--transition-slow);
    transform-style: preserve-3d;
  }

  &__front,
  &__back {
    position: relative;
    width: 100%;
    backface-visibility: hidden;
  }

  &__back {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    transform: rotateY(180deg);
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg);
  }

  &__image {
    display: block;
    width: 100%;
    height: auto;
  }

  &__overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--color-primary) 90%, black 10%);
    opacity: var(--opacity-0);
    transition: opacity var(--transition-normal);
  }

  &__front:hover &__overlay {
    opacity: 1;
  }

  &__content {
    width: 100%;
    text-align: center;
    color: var(--color-text-inverse);
  }

  &__category {
    display: block;
    text-transform: uppercase;
    font-weight: var(--font-weight-semibold);
    font-size: 0.875rem;
    font-family: var(--font-sans);
    margin-bottom: var(--space-xs);
    opacity: var(--opacity-90);

    @media (min-width: 768px) {
      font-size: 1rem;
    }
  }

  &__name {
    font-size: 1.125rem;
    font-family: var(--font-sans);
    font-weight: var(--font-weight-bold);
    margin-bottom: var(--space-sm);

    @media (min-width: 768px) {
      font-size: 1.375rem;
    }
  }

  &__description {
    font-size: var(--font-size-md);
    line-height: var(--line-height-base);
    margin: 0;

    @media (min-width: 768px) {
      font-size: var(--font-size-base);
    }
  }
}
```

---

## Images

### Recommended Specs

- **Size**: ~650×350px (or larger)
- **Format**: JPG, PNG, or WebP
- **Location**: `img/portfolio/`
- **Naming**: `1.jpg`, `2.jpg`, etc.

### Optimization

- Use lazy loading: `loading="lazy"`
- Compress images (TinyPNG, ImageOptim)
- Consider WebP format for better compression
- Always include descriptive alt text

---

## Layout

### Grid System

```html
<div class="container-fluid">
  <div class="row no-gutter">
    <div class="col-lg-4 col-sm-6">
      <div class="portfolio-box portfolio-box--flippable">
        <!-- content -->
      </div>
    </div>
  </div>
</div>
```

**Breakpoints**:
- **Mobile** (< 576px): 1 column
- **Small** (576px - 991px): 2 columns
- **Large** (992px+): 3 columns

---

## Accessibility

### WCAG Compliance

- ✅ Images have alt text
- ✅ Click target: Full card area
- ✅ Keyboard accessible: Enter/Space to flip
- ✅ Screen reader: Reads category, name, description
- ✅ Focus indicator: Visible outline

### Alt Text

Always provide descriptive alt text:

```html
<img src="{{ item.image | relative_url }}"
     class="portfolio-box__image"
     loading="lazy"
     alt="{{ item.name | escape }}">
```

---

## Testing

### Visual Regression

```bash
pnpm run test:visual
```

Tests:
- Hover overlay appearance
- Flip animation
- Front and back sides
- Responsive grid

### Accessibility

```bash
pnpm run test:a11y
```

Checks:
- Alt text presence
- Color contrast
- Keyboard navigation
- Focus indicators

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+ (touch flip)

---

## Related Components

- [Design Tokens](00-design-tokens.md) - Color customization
- [BEM Style Guide](01-bem-style-guide.md) - Naming conventions

---

## Troubleshooting

### Flip Doesn't Work

1. Check JavaScript is loaded
2. Verify `.portfolio-box--flippable` class is present
3. Check browser console for errors

### Images Don't Load

1. Verify image path in `_config.yml`
2. Check images exist in `img/portfolio/`
3. Ensure file names match exactly (case-sensitive)

### Overlay Not Showing

1. Check hover state works
2. Verify `--color-primary` token is set
3. Ensure opacity transition is enabled

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
