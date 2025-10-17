# Navigation Component

**File**: `_sass/layout/_navigation.scss`
**Usage**: `_includes/nav.html`
**Last Updated**: October 1, 2025
**Status**: ✅ BEM Complete

---

## Overview

Fixed-position navigation bar with scroll behavior, mobile menu toggle, theme switcher, and smooth scroll links. Features transparent-to-solid transition on scroll.

---

## Structure

```html
<nav id="mainNav"
     class="navbar navbar-expand-lg navbar-light fixed-top"
     role="navigation"
     aria-label="Main navigation">
  <div class="container-fluid">
    <!-- Brand/Logo -->
    <a class="navbar-brand page-scroll" href="#page-top">
      {{ site.brand_name }}
    </a>

    <!-- Mobile toggle button -->
    <button class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>

    <!-- Navigation menu -->
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item">
          <a class="nav-link page-scroll" href="#about">About</a>
        </li>
        <li class="nav-item">
          <a class="nav-link page-scroll" href="#services">Services</a>
        </li>
        <li class="nav-item">
          <a class="nav-link page-scroll" href="#portfolio">Portfolio</a>
        </li>
        <li class="nav-item">
          <a class="nav-link page-scroll" href="#resume">Resume</a>
        </li>
        <li class="nav-item">
          <a class="nav-link page-scroll" href="#contact">Contact</a>
        </li>
        <li class="nav-item">
          <!-- Theme toggle -->
          <button id="theme-toggle"
                  class="theme-toggle"
                  aria-label="Toggle theme">
            <i class="fa-solid fa-sun theme-icon-light"></i>
            <i class="fa-solid fa-moon theme-icon-dark"></i>
          </button>
        </li>
      </ul>
    </div>
  </div>
</nav>
```

---

## BEM Classes (New)

### `.nav` (Block)

Main navigation container.

**Backward Compatible**: `.navbar` extends `.nav`

### `.nav__brand` (Element)

Brand/logo link.

**Backward Compatible**: `.navbar-brand` extends `.nav__brand`

**Tokens Used**:
- `--font-sans`
- `--font-weight-bold`
- `--color-primary`
- `--transition-normal`

### `.nav__link` (Element)

Navigation link.

**Backward Compatible**: `.nav-link` extends `.nav__link`

**Tokens Used**:
- `--font-weight-bold`
- `--color-text`
- `--space-xs`, `--space-sm`
- `--radius-sm`
- `--transition-fast`

**Features**:
- Text transform uppercase
- Hover color change
- Focus indicator

### `.nav__link--scroll` (Modifier)

Smooth scroll behavior.

**Backward Compatible**: `.page-scroll` extends `.nav__link--scroll`

### `.nav--shrink` (Modifier)

Applied by JavaScript when scrolled.

**Backward Compatible**: `.navbar-shrink` extends `.nav--shrink`

**Tokens Used**:
- `--navbar-bg-scrolled`
- `--shadow-sm`

**Changes**:
- Solid background appears
- Box shadow added
- Link colors adjust

---

## States

### Default (Top of Page)

- **Desktop**: Semi-transparent background with blur
- **Mobile**: Solid background
- **Text**: Light/faded color

### Scrolled (`.nav--shrink`)

- **All devices**: Solid background
- **Shadow**: Subtle drop shadow
- **Text**: Standard color

---

## Scroll Behavior

JavaScript adds/removes `.nav--shrink` class:

```javascript
// js/creative.js
const mainNav = document.getElementById('mainNav');

window.addEventListener('scroll', function() {
  if (window.scrollY > 100) {
    mainNav.classList.add('navbar-shrink');
    mainNav.classList.add('nav--shrink');
  } else {
    mainNav.classList.remove('navbar-shrink');
    mainNav.classList.remove('nav--shrink');
  }
});
```

---

## Theme Toggle

### Structure

```html
<button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
  <i class="fa-solid fa-sun theme-icon-light"></i>
  <i class="fa-solid fa-moon theme-icon-dark"></i>
</button>
```

### Functionality

JavaScript toggles `data-theme` attribute:

```javascript
themeToggle.addEventListener('click', function(e) {
  e.preventDefault();
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
});
```

### Storage

Theme preference is saved in:
1. `localStorage` (preferred)
2. `sessionStorage` (fallback)
3. Memory object (private browsing fallback)

---

## Mobile Menu

### Toggle Button

Bootstrap's built-in collapse component:

```html
<button class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav">
  <span class="navbar-toggler-icon"></span>
</button>
```

### Auto-Close

JavaScript closes menu when link is clicked:

```javascript
document.querySelectorAll('.navbar-collapse ul li a').forEach(link => {
  link.addEventListener('click', function() {
    if (navbarToggler && window.getComputedStyle(navbarToggler).display !== 'none') {
      const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  });
});
```

---

## Smooth Scroll

Links with `.page-scroll` or `.nav__link--scroll` scroll smoothly:

```javascript
document.querySelectorAll('a.page-scroll').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    const targetElement = document.querySelector(targetId);

    if (targetElement) {
      const offsetTop = targetElement.offsetTop - 50;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    }
  });
});
```

---

## SCSS Structure

```scss
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: var(--z-fixed);
  background-color: var(--bg-light);
  font-family: var(--font-sans);
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);

  &__brand {
    color: var(--color-primary);
    font-family: var(--font-sans);
    font-weight: var(--font-weight-bold);
    text-transform: uppercase;
    text-decoration: none;
    transition: color var(--transition-normal);

    &:hover,
    &:focus {
      color: var(--color-primary-hover);
    }
  }

  &__link {
    text-transform: uppercase;
    font-weight: var(--font-weight-bold);
    font-size: 0.8125rem; // 13px
    color: var(--color-text);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-sm);
    transition: all var(--transition-fast);
    text-decoration: none;

    &:hover,
    &:focus {
      color: var(--color-primary);
    }

    &--scroll {
      cursor: pointer;
    }
  }

  &--shrink {
    background-color: var(--navbar-bg-scrolled);
    box-shadow: var(--shadow-sm);

    .nav__brand {
      color: var(--color-primary);
      font-size: 1rem;

      &:hover {
        color: var(--color-primary-hover);
      }
    }

    .nav__link {
      color: var(--color-text);

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}

// Desktop transparent state
@media (min-width: 992px) {
  .nav {
    background-color: var(--navbar-bg);

    .nav__brand {
      color: var(--color-text-faded);

      &:hover {
        color: var(--bg-light);
      }
    }

    .nav__link {
      color: var(--color-text-faded);

      &:hover {
        color: var(--bg-light);
      }
    }
  }
}

// Dark mode enhanced hover
[data-theme="dark"] {
  .nav__link {
    &:hover,
    &:focus {
      color: var(--nav-link-hover-color);
      background: var(--nav-link-hover-bg);
    }
  }
}
```

---

## Customization

### Changing Brand Name

Edit `_config.yml`:

```yaml
brand_name: Your Name Here
```

### Adding/Removing Links

Edit `_includes/nav.html`:

```html
<li class="nav-item">
  <a class="nav-link page-scroll" href="#new-section">New Section</a>
</li>
```

### Adjusting Scroll Threshold

Edit `js/creative.js`:

```javascript
if (window.scrollY > 150) {  // Changed from 100
  mainNav.classList.add('nav--shrink');
}
```

---

## Accessibility

### WCAG Compliance

- ✅ ARIA labels: `role="navigation"`, `aria-label="Main navigation"`
- ✅ Keyboard navigation: Tab through links
- ✅ Focus indicators: Visible outline
- ✅ Screen readers: Proper semantic HTML
- ✅ Mobile toggle: `aria-expanded`, `aria-controls`

### Keyboard Navigation

- **Tab**: Move through links
- **Enter/Space**: Activate link
- **Escape**: Close mobile menu (Bootstrap)

---

## Testing

### Visual Regression

```bash
pnpm run test:visual
```

Tests:
- Navigation at top (transparent)
- Navigation scrolled (solid)
- Mobile menu open
- Theme toggle

### Accessibility

```bash
pnpm run test:a11y
```

Checks:
- ARIA attributes
- Keyboard navigation
- Focus indicators
- Color contrast

---

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+

---

## Troubleshooting

### Navigation Doesn't Shrink

1. Check JavaScript is loaded
2. Verify `#mainNav` ID exists
3. Check scroll event listener
4. Ensure `.nav--shrink` styles are present

### Smooth Scroll Not Working

1. Verify `.page-scroll` class on links
2. Check JavaScript `initSmoothScroll()` runs
3. Ensure target sections have correct IDs

### Mobile Menu Won't Close

1. Check Bootstrap JS is loaded
2. Verify `data-bs-toggle` attributes
3. Check collapse component initialized

---

## Related Components

- [Buttons](02-buttons.md) - Theme toggle button
- [Design Tokens](00-design-tokens.md) - Color customization

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
