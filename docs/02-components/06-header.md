# Header/Hero Component

**File**: `_sass/layout/_header.scss`
**Usage**: `_includes/header.html`
**Last Updated**: October 1, 2025
**Status**: ✅ BEM Complete

---

## Overview

Full-screen hero section with background image, overlay, heading, description, and call-to-action button. Features responsive text sizing and configurable overlay.

---

## Structure

```html
<header role="banner"
        style="background-image: url('{{ site.hero.background_image | relative_url }}');">
  <div class="header__overlay"></div>

  <div class="header-content">
    <div class="header-content-inner">
      <h1>{{ site.hero.heading }}</h1>
      <hr>
      <p>{{ site.hero.description }}</p>
      <a href="{{ site.hero.button_link }}"
         class="btn btn--primary btn--xl btn--scroll">
        {{ site.hero.button_text }}
      </a>
    </div>
  </div>
</header>
```

---

## Configuration

Edit `_config.yml`:

```yaml
hero:
  heading: IT Leadership Portfolio
  description: Skilled IT leader with 12+ years of experience...
  button_text: View My Work
  button_link: "#portfolio"
  background_image: img/header.jpg
```

---

## Elements

### `<header>` (Block)

Main hero container.

**Attributes**:
- `role="banner"` - ARIA landmark
- `style` - Background image inline style

**Features**:
- Full viewport height
- Background image with cover
- Flexbox centering
- Position relative for overlay

### `.header__overlay`

Color overlay on background image.

**Tokens Used**:
- `--header-overlay-color`
- `--header-overlay-opacity`

**Features**:
- Semi-transparent overlay
- Improves text readability
- Configurable via design tokens

### `.header-content`

Content container.

**Features**:
- Centered vertically and horizontally
- Flexbox layout
- Responsive padding

### `.header-content-inner`

Inner content wrapper.

**Tokens Used**:
- `--space-md`, `--space-lg`

**Features**:
- Max width constraint
- Text centering
- Responsive spacing

---

## Typography

### Heading (`<h1>`)

Main hero heading.

**Features**:
- Responsive font sizing (JavaScript)
- Font size range: 35px - 65px
- Scales based on container width
- Uppercase text transform

**JavaScript**:
```javascript
function initResponsiveText() {
  const headers = document.querySelectorAll('h1');

  function resizeText() {
    headers.forEach(header => {
      const containerWidth = header.parentElement.offsetWidth;
      let fontSize = containerWidth / 10;
      fontSize = Math.max(35, Math.min(65, fontSize));
      header.style.fontSize = fontSize + 'px';
    });
  }

  resizeText();
  window.addEventListener('resize', resizeText);
}
```

### Description (`<p>`)

Hero description text.

**Tokens Used**:
- `--font-size-lg`
- `--color-text-faded`
- `--space-lg`

**Features**:
- Larger font size
- Faded color for contrast
- Bottom spacing

### Divider (`<hr>`)

Decorative horizontal rule.

**Tokens Used**:
- `--color-primary`
- `--space-md`

**Features**:
- Primary color
- Short width (50px)
- Centered
- 3px height

---

## Background Image

### Image Specs

- **Recommended size**: 1920×1080px or larger
- **Format**: JPG (smaller file size) or WebP
- **Location**: `img/header.jpg`
- **Aspect ratio**: 16:9 works best

### Optimization

- Compress images (< 500KB recommended)
- Use responsive images for mobile
- Consider lazy loading for below-fold content

### Inline Style

Background image is set via inline style:

```html
<header style="background-image: url('{{ site.hero.background_image | relative_url }}');"></header>
```

This allows configuration through `_config.yml`.

---

## Overlay Customization

### Default Overlay

```scss
.header__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--header-overlay-color);
  opacity: var(--header-overlay-opacity);
}
```

### Design Tokens

```scss
// _sass/abstracts/_design-tokens.scss
--header-overlay-color: color-mix(in srgb, var(--color-primary) 80%, black 20%);
--header-overlay-opacity: 0.4;
```

### Customization Options

Edit design tokens:

```scss
// Darker overlay
--header-overlay-opacity: 0.6;

// Different color
--header-overlay-color: color-mix(in srgb, var(--color-secondary) 70%, black 30%);

// No overlay
--header-overlay-opacity: 0;
```

---

## SCSS Structure

```scss
header {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-position: center center;
  background-size: cover;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-text-inverse);
}

.header__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--header-overlay-color);
  opacity: var(--header-overlay-opacity);
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding: var(--space-lg) var(--space-md);
}

.header-content-inner {
  max-width: 1000px;
  margin: 0 auto;

  h1 {
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    margin-top: 0;
    margin-bottom: var(--space-md);
    // Font size set by JavaScript
  }

  hr {
    max-width: 50px;
    border-width: 3px;
    border-color: var(--color-primary);
    margin: var(--space-md) auto;
  }

  p {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-light);
    color: var(--color-text-faded);
    margin-bottom: var(--space-lg);
  }
}
```

---

## Responsive Behavior

### Desktop (992px+)

- Full viewport height
- Large heading (up to 65px)
- XL button size

### Tablet (768px - 991px)

- Full viewport height
- Medium heading (45-55px)
- XL button size

### Mobile (< 768px)

- Full viewport height
- Smaller heading (35-45px)
- XL button size (still large)
- Reduced padding

---

## Accessibility

### WCAG Compliance

- ✅ Color contrast: 7:1 (AAA) - white text on dark overlay
- ✅ Semantic HTML: `<header>` with `role="banner"`
- ✅ Heading hierarchy: `<h1>` is first heading
- ✅ Focus indicator: Button has visible focus state

### Text Alternatives

- Background image is decorative (no alt text needed)
- All meaning conveyed through text content

### Keyboard Navigation

- Tab to CTA button
- Enter/Space to activate

---

## Testing

### Visual Regression

```bash
pnpm run test:visual
```

Tests:
- Hero rendering with image
- Text overlay visibility
- Button placement
- Responsive sizing

### Accessibility

```bash
pnpm run test:a11y
```

Checks:
- Color contrast
- Heading hierarchy
- ARIA landmarks
- Focus indicators

---

## Customization Examples

### Different Button Style

```html
<a href="{{ site.hero.button_link }}"
   class="btn btn--outline btn--xl btn--scroll">
  {{ site.hero.button_text }}
</a>
```

### Multiple Buttons

```html
<a href="#portfolio" class="btn btn--primary btn--xl btn--scroll">
  View Work
</a>
<a href="#contact" class="btn btn--outline btn--xl btn--scroll">
  Get In Touch
</a>
```

### No Overlay

Remove `.header__overlay` div from HTML:

```html
<header style="background-image: url('...');">
  <div class="header-content">
    <!-- content -->
  </div>
</header>
```

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+

---

## Troubleshooting

### Image Not Showing

1. Verify path in `_config.yml`
2. Check image exists in `img/` folder
3. Ensure file name matches exactly

### Text Not Readable

1. Increase overlay opacity
2. Darken overlay color
3. Use image with less detail in center
4. Add text shadow to heading

### Heading Too Small/Large

1. Check JavaScript is loaded (`initResponsiveText()`)
2. Adjust min/max values in JavaScript
3. Override with CSS if needed

---

## Related Components

- [Buttons](02-buttons.md) - CTA button
- [Design Tokens](00-design-tokens.md) - Overlay customization

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
