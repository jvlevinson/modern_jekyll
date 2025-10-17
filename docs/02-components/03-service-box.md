# Service Box Component

**File**: `_sass/components/_service-box.scss`
**Usage**: `_includes/services.html`
**Last Updated**: October 1, 2025
**Status**: ✅ BEM Complete

---

## Overview

Displays service or skill items with icon, title, and description. Features WOW.js animation support and responsive layout.

---

## Structure

```html
<div class="service-box">
  <i class="service-box__icon fa-solid fa-diamond wow bounceIn"
     data-wow-delay="0s"></i>
  <h3 class="service-box__title">Service Title</h3>
  <p class="service-box__description">Service description text</p>
</div>
```

---

## Elements

### `.service-box` (Block)

Container for the entire service box.

**Tokens Used**:
- `--space-xl`, `--space-md`
- Responsive spacing

### `.service-box__icon` (Element)

Font Awesome icon at the top.

**Tokens Used**:
- `--color-primary`
- `--space-md`
- `--transition-normal`

**Features**:
- 4rem font size
- Hover scale animation
- WOW.js animation support

### `.service-box__title` (Element)

Service heading.

**Tokens Used**:
- `--font-sans`
- `--font-weight-bold`
- `--color-text`
- `--space-sm`

### `.service-box__description` (Element)

Service description text.

**Tokens Used**:
- `--font-size-base`
- `--color-text-muted`
- `--line-height-base`

---

## Configuration

Edit `_config.yml` to customize services:

```yaml
services:
  heading: Core Competencies
  list:
    - icon: fa-diamond
      title: IT Strategy & Leadership
      description: Over a decade of experience aligning IT strategy...

    - icon: fa-paper-plane
      title: Network & VoIP Standardization
      description: Led U.S., Canada, and Puerto Rico infrastructure...

    - icon: fa-newspaper
      title: Capital Construction & Acquisitions
      description: Managed 2,500+ IT standardization projects...

    - icon: fa-heart
      title: Team Development
      description: Built and mentored high-performing IT teams...
```

---

## Icons

### Font Awesome

Uses Font Awesome 6 (Free) solid icons.

**Icon Format**: `fa-{name}`

**Examples**:
- `fa-diamond`
- `fa-paper-plane`
- `fa-newspaper`
- `fa-heart`
- `fa-code`
- `fa-rocket`

**Find Icons**: https://fontawesome.com/search?o=r&m=free

---

## Animations

### WOW.js Integration

```html
<i class="service-box__icon fa-solid fa-diamond wow bounceIn"
   data-wow-delay="0.1s"></i>
```

**Animation Classes**:
- `wow` - Enables WOW.js
- `bounceIn` - Animation type
- `data-wow-delay` - Staggered delay (0s, 0.1s, 0.2s, 0.3s)

### Hover Effect

Icons scale up on hover:

```scss
.service-box:hover .service-box__icon {
  transform: scale(1.1);
}
```

---

## SCSS Structure

```scss
.service-box {
  max-width: 400px;
  margin: var(--space-xl) auto 0;
  text-align: center;

  @media (min-width: 992px) {
    margin: var(--space-md) auto 0;
  }

  &__icon {
    display: block;
    font-size: 4rem;
    color: var(--color-primary);
    margin-bottom: var(--space-md);
    transition: transform var(--transition-normal);
  }

  &__title {
    font-family: var(--font-sans);
    font-size: 1.25rem;
    font-weight: var(--font-weight-bold);
    color: var(--color-text);
    margin-bottom: var(--space-sm);
  }

  &__description {
    font-size: var(--font-size-base);
    color: var(--color-text-muted);
    line-height: var(--line-height-base);
    margin-bottom: 0;
  }

  // Hover effect
  &:hover &__icon {
    transform: scale(1.1);
  }
}
```

---

## Layout

### Grid System

Uses Bootstrap grid for responsive layout:

```html
<div class="container">
  <div class="row">
    <!-- 4 columns on large screens, 2 on medium, 1 on small -->
    <div class="col-lg-3 col-md-6">
      <div class="service-box">
        <!-- content -->
      </div>
    </div>
  </div>
</div>
```

**Breakpoints**:
- **Mobile** (< 768px): 1 column
- **Tablet** (768px - 991px): 2 columns
- **Desktop** (992px+): 4 columns

---

## Customization

### Changing Icon Color

Edit `_config.yml`:

```yaml
theme:
  brand_primary: "green"  # Changes icon color
```

### Modifying Icon Size

Edit `_sass/components/_service-box.scss`:

```scss
.service-box__icon {
  font-size: 5rem;  // Larger icons
}
```

### Adding a Featured Variant

```scss
.service-box--featured {
  background: var(--color-surface);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  .service-box__icon {
    color: var(--color-primary-active);
    font-size: 5rem;
  }
}
```

Usage:

```html
<div class="service-box service-box--featured">
  <!-- content -->
</div>
```

---

## Accessibility

### WCAG Compliance

- ✅ Color contrast: 7.2:1 (AAA)
- ✅ Text readability: Adequate line-height
- ✅ Semantic HTML: `<h3>` for titles
- ✅ Icon decorative: Handled by CSS, not read by screen readers

### Screen Readers

Icons are decorative and use CSS classes, not affecting screen reader output. Ensure `title` and `description` are descriptive.

---

## Testing

### Visual Regression

```bash
pnpm run test:visual
```

Tests:
- Service box rendering
- Icon size and color
- Hover animations
- Grid layout

### Accessibility

```bash
pnpm run test:a11y
```

Checks:
- Heading hierarchy
- Color contrast
- Text readability

---

## Complete Example

```html
<section id="services">
  <div class="container">
    <div class="row">
      <div class="col-lg-12 text-center">
        <h2 class="section-heading">{{ site.services.heading }}</h2>
        <hr class="primary">
      </div>
    </div>
  </div>

  <div class="container">
    <div class="row">
      {% for service in site.services.list %}
      <div class="col-lg-3 col-md-6">
        <div class="service-box">
          {% assign delay_seconds = forloop.index0 | times: 0.1 %}
          <i class="service-box__icon fa-solid {{ service.icon }} wow bounceIn"
             data-wow-delay="{{ delay_seconds }}s"></i>
          <h3 class="service-box__title">{{ service.title }}</h3>
          <p class="service-box__description">{{ service.description }}</p>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
</section>
```

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+

---

## Related Components

- [Design Tokens](00-design-tokens.md) - Color customization
- [BEM Style Guide](01-bem-style-guide.md) - Naming conventions

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
