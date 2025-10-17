# Footer Component

**File**: `_sass/layout/_footer.scss`
**Usage**: `_includes/footer.html`
**Last Updated**: October 1, 2025
**Status**: ✅ BEM Complete

---

## Overview

Site footer with copyright information. Simple, centered layout with dark background.

---

## Structure

```html
<footer class="footer bg-dark" role="contentinfo">
  <div class="container">
    <div class="row">
      <div class="col-lg-12 text-center">
        <p class="footer-text">
          &copy; {{ site.footer.year }} {{ site.footer.copyright }}. All Rights Reserved.
        </p>
      </div>
    </div>
  </div>
</footer>
```

---

## Configuration

Edit `_config.yml`:

```yaml
footer:
  copyright: Jordan v. levinson
  year: 2025
```

---

## Elements

### `.footer` (Block)

Main footer container.

**Classes**:
- `.footer` - BEM block
- `.bg-dark` - Dark background (Bootstrap utility)
- `role="contentinfo"` - ARIA landmark

**Tokens Used**:
- `--color-bg-dark`
- `--color-text-inverse`
- `--space-md`

### `.footer-text`

Copyright text element.

**Features**:
- Centered text
- Inverse color for dark background
- Small font size
- Bottom padding

---

## SCSS Structure

```scss
.footer {
  background-color: var(--color-bg-dark);
  color: var(--color-text-inverse);
  padding: var(--space-md) 0;

  &-text {
    font-size: 0.875rem; // 14px
    margin: 0;
    opacity: var(--opacity-80);
  }
}

// Bootstrap utility class
.bg-dark {
  background-color: var(--color-bg-dark) !important;
}
```

---

## Customization

### Adding Social Links

```html
<footer class="footer bg-dark" role="contentinfo">
  <div class="container">
    <div class="row">
      <div class="col-lg-12 text-center">
        <!-- Social icons -->
        <div class="footer__social">
          {% if site.github_username %}
          <a href="https://github.com/{{ site.github_username }}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="GitHub">
            <i class="fa-brands fa-github"></i>
          </a>
          {% endif %}

          {% if site.linkedin_username %}
          <a href="https://linkedin.com/in/{{ site.linkedin_username }}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="LinkedIn">
            <i class="fa-brands fa-linkedin"></i>
          </a>
          {% endif %}

          {% if site.twitter_username %}
          <a href="https://twitter.com/{{ site.twitter_username }}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Twitter">
            <i class="fa-brands fa-twitter"></i>
          </a>
          {% endif %}
        </div>

        <!-- Copyright -->
        <p class="footer-text">
          &copy; {{ site.footer.year }} {{ site.footer.copyright }}.
          All Rights Reserved.
        </p>
      </div>
    </div>
  </div>
</footer>
```

**SCSS for social links**:

```scss
.footer {
  &__social {
    margin-bottom: var(--space-md);

    a {
      display: inline-block;
      margin: 0 var(--space-sm);
      color: var(--color-text-inverse);
      font-size: 1.5rem;
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-primary);
      }
    }
  }
}
```

---

### Adding Multiple Columns

```html
<footer class="footer bg-dark" role="contentinfo">
  <div class="container">
    <div class="row">
      <!-- Column 1: About -->
      <div class="col-lg-4">
        <h4>About</h4>
        <p>{{ site.description }}</p>
      </div>

      <!-- Column 2: Quick Links -->
      <div class="col-lg-4">
        <h4>Quick Links</h4>
        <ul class="footer__links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#portfolio">Portfolio</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </div>

      <!-- Column 3: Contact -->
      <div class="col-lg-4">
        <h4>Contact</h4>
        <p>
          Email: <a href="mailto:{{ site.email }}">{{ site.email }}</a>
        </p>
      </div>
    </div>

    <!-- Copyright -->
    <div class="row">
      <div class="col-lg-12 text-center">
        <hr class="footer__divider">
        <p class="footer-text">
          &copy; {{ site.footer.year }} {{ site.footer.copyright }}.
        </p>
      </div>
    </div>
  </div>
</footer>
```

---

### Back to Top Button

```html
<footer class="footer bg-dark" role="contentinfo">
  <div class="container">
    <!-- Back to top -->
    <div class="row">
      <div class="col-lg-12 text-center">
        <a href="#page-top" class="footer__back-to-top btn--scroll">
          <i class="fa-solid fa-chevron-up"></i>
          Back to Top
        </a>
      </div>
    </div>

    <!-- Copyright -->
    <div class="row">
      <div class="col-lg-12 text-center">
        <p class="footer-text">
          &copy; {{ site.footer.year }} {{ site.footer.copyright }}.
        </p>
      </div>
    </div>
  </div>
</footer>
```

**SCSS**:

```scss
.footer {
  &__back-to-top {
    display: inline-block;
    padding: var(--space-sm) var(--space-md);
    color: var(--color-text-inverse);
    text-decoration: none;
    transition: all var(--transition-normal);
    margin-bottom: var(--space-md);

    &:hover {
      color: var(--color-primary);
      transform: translateY(-2px);
    }

    i {
      display: block;
      margin-bottom: var(--space-xs);
      font-size: 1.5rem;
    }
  }
}
```

---

## Auto-Updating Year

### Option 1: JavaScript

```html
<p class="footer-text">
  &copy; <span id="current-year"></span> {{ site.footer.copyright }}.
  All Rights Reserved.
</p>

<script>
  document.getElementById('current-year').textContent = new Date().getFullYear();
</script>
```

### Option 2: Jekyll (Build Time)

```html
<p class="footer-text">
  &copy; {{ 'now' | date: "%Y" }} {{ site.footer.copyright }}.
  All Rights Reserved.
</p>
```

**Note**: Jekyll method shows build year, not visitor's current year.

---

## Accessibility

### WCAG Compliance

- ✅ Color contrast: 4.5:1+ on dark background
- ✅ ARIA landmark: `role="contentinfo"`
- ✅ Link focus indicators: Visible
- ✅ Text readability: Adequate size
- ✅ Semantic HTML: `<footer>` element

### Screen Readers

- Footer identified as contentinfo landmark
- Copyright notice read aloud
- Link destinations announced

---

## Testing

### Visual Regression

```bash
pnpm run test:visual
```

Tests:
- Footer rendering
- Text alignment
- Dark background
- Responsive layout

### Accessibility

```bash
pnpm run test:a11y
```

Checks:
- ARIA landmarks
- Color contrast
- Text readability

---

## Responsive Behavior

### All Screen Sizes

- Full width
- Centered text
- Consistent padding

### Mobile Specific

- Text may wrap on very small screens
- Font size remains readable
- Touch targets adequate

---

## Color Customization

### Default (Dark)

```scss
.footer {
  background-color: var(--color-bg-dark);
  color: var(--color-text-inverse);
}
```

### Light Footer

```scss
.footer--light {
  background-color: var(--color-bg-light);
  color: var(--color-text);
  border-top: 1px solid var(--color-border);
}
```

### Primary Color

```scss
.footer--primary {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}
```

---

## Legal Additions

### Privacy Policy Link

```html
<p class="footer-text">
  &copy; {{ site.footer.year }} {{ site.footer.copyright }}.
  All Rights Reserved. |
  <a href="/privacy-policy.html">Privacy Policy</a>
</p>
```

### Terms of Service

```html
<p class="footer-text">
  &copy; {{ site.footer.year }} {{ site.footer.copyright }}. |
  <a href="/terms.html">Terms</a> |
  <a href="/privacy.html">Privacy</a>
</p>
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
- [Navigation](05-navigation.md) - Similar semantic HTML

---

## Complete Example

```html
<footer class="footer bg-dark" role="contentinfo">
  <div class="container">
    <!-- Social media -->
    <div class="row">
      <div class="col-lg-12 text-center">
        <div class="footer__social">
          <a href="https://github.com/{{ site.github_username }}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="GitHub">
            <i class="fa-brands fa-github"></i>
          </a>
          <a href="https://linkedin.com/in/{{ site.linkedin_username }}"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="LinkedIn">
            <i class="fa-brands fa-linkedin"></i>
          </a>
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="row">
      <div class="col-lg-12 text-center">
        <p class="footer-text">
          &copy; {{ 'now' | date: "%Y" }} {{ site.footer.copyright }}.
          All Rights Reserved.
        </p>
      </div>
    </div>
  </div>
</footer>
```

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
