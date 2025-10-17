# Resume Box Component

**File**: `_sass/components/_resume-box.scss`
**Usage**: `_includes/resume.html`
**Last Updated**: October 1, 2025
**Status**: ✅ BEM Complete

---

## Overview

Resume download section with heading, description, and action buttons. Provides both view (new tab) and download functionality for PDF resume files.

---

## Structure

```html
<section id="resume" class="bg-secondary">
  <div class="container">
    <div class="row">
      <div class="col-lg-8 offset-lg-2 text-center">
        <h2 class="section-heading">{{ site.resume.heading }}</h2>
        <hr class="light">
        <p class="resume-box__description">{{ site.resume.description }}</p>

        <div class="resume-box">
          <!-- View button (opens in new tab) -->
          <a href="{{ site.resume.file_path }}"
             class="btn btn--primary"
             target="_blank"
             rel="noopener noreferrer">
            <i class="fa-solid fa-file-pdf"></i>
            {{ site.resume.view_button_text }}
          </a>

          <!-- Download button -->
          <a href="{{ site.resume.file_path }}"
             class="btn btn--outline"
             download>
            <i class="fa-solid fa-download"></i>
            {{ site.resume.download_button_text }}
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## Configuration

Edit `_config.yml`:

```yaml
resume:
  heading: Resume & Credentials
  description: Download my complete resume to learn more about my professional experience...
  file_path: /public/files/wmorr_director-resume-v2.1.0.pdf
  view_button_text: View Resume
  download_button_text: Download Resume
```

---

## Elements

### `.resume-box` (Block)

Container for resume action buttons.

**Features**:
- Centers buttons
- Handles button spacing
- Responsive layout

### `.resume-box__description`

Description text above buttons.

**Tokens Used**:
- `--font-size-lg`
- `--color-text-faded`
- `--space-lg`

---

## File Setup

### PDF Location

Place your resume PDF in:

```
public/
└── files/
    └── your-resume.pdf
```

### File Path

Update `_config.yml` with correct path:

```yaml
resume:
  file_path: /public/files/your-resume.pdf
```

**Note**: Path must start with `/` for root-relative URLs.

---

## Buttons

### View Button (Primary)

Opens PDF in new browser tab:

```html
<a href="{{ site.resume.file_path }}"
   class="btn btn--primary"
   target="_blank"
   rel="noopener noreferrer">
  <i class="fa-solid fa-file-pdf"></i>
  {{ site.resume.view_button_text }}
</a>
```

**Attributes**:
- `target="_blank"` - Opens in new tab
- `rel="noopener noreferrer"` - Security best practice

### Download Button (Outline)

Downloads PDF file:

```html
<a href="{{ site.resume.file_path }}"
   class="btn btn--outline"
   download>
  <i class="fa-solid fa-download"></i>
  {{ site.resume.download_button_text }}
</a>
```

**Attributes**:
- `download` - Triggers download instead of navigation

---

## Icons

### Font Awesome Icons

- **View**: `fa-file-pdf`
- **Download**: `fa-download`

### Custom Icons

Replace Font Awesome with custom SVG:

```html
<svg class="btn-icon" width="20" height="20">
  <use xlink:href="#icon-download"></use>
</svg>
```

---

## SCSS Structure

```scss
.resume-box {
  margin-top: var(--space-lg);
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;

  &__description {
    font-size: var(--font-size-lg);
    color: var(--color-text-faded);
    margin-bottom: var(--space-lg);
  }

  // Button spacing
  .btn {
    margin: var(--space-xs);

    i {
      margin-right: var(--space-xs);
    }
  }

  // Responsive stacking
  @media (max-width: 576px) {
    flex-direction: column;

    .btn {
      width: 100%;
      margin: var(--space-xs) 0;
    }
  }
}
```

---

## Responsive Behavior

### Desktop (> 576px)

- Buttons side-by-side
- Horizontal spacing

### Mobile (≤ 576px)

- Buttons stacked vertically
- Full-width buttons
- Vertical spacing

---

## Customization

### Different Button Order

Swap button positions:

```html
<div class="resume-box">
  <!-- Download first -->
  <a href="..." class="btn btn--outline" download>
    <i class="fa-solid fa-download"></i>
    Download
  </a>

  <!-- View second -->
  <a href="..." class="btn btn--primary" target="_blank">
    <i class="fa-solid fa-file-pdf"></i>
    View
  </a>
</div>
```

### Single Button

Remove one button if needed:

```html
<div class="resume-box">
  <a href="{{ site.resume.file_path }}"
     class="btn btn--primary"
     download>
    <i class="fa-solid fa-download"></i>
    Download Resume
  </a>
</div>
```

### Add LinkedIn Link

```html
<div class="resume-box">
  <a href="{{ site.resume.file_path }}"
     class="btn btn--primary"
     download>
    Download Resume
  </a>

  <a href="https://linkedin.com/in/{{ site.linkedin_username }}"
     class="btn btn--outline"
     target="_blank"
     rel="noopener noreferrer">
    <i class="fa-brands fa-linkedin"></i>
    LinkedIn Profile
  </a>
</div>
```

---

## Accessibility

### WCAG Compliance

- ✅ Button labels: Clear action description
- ✅ Icons: Supplemental (text also present)
- ✅ Links: Descriptive text
- ✅ Focus indicators: Visible outlines
- ✅ Touch targets: 48x48px minimum

### Security

```html
rel="noopener noreferrer"
```

Prevents:
- `window.opener` access
- Referrer leakage
- Tabnabbing attacks

### Download Attribute

```html
download
```

- Modern browsers: Triggers download
- Legacy browsers: Opens PDF normally
- Graceful degradation

---

## Testing

### Manual Testing

1. **View button**: PDF opens in new tab
2. **Download button**: File downloads
3. **Mobile**: Buttons stack vertically
4. **Keyboard**: Tab to buttons, Enter activates

### Visual Regression

```bash
pnpm run test:visual
```

Tests:
- Button layout
- Responsive stacking
- Icon rendering

### Accessibility

```bash
pnpm run test:a11y
```

Checks:
- Button labels
- Touch target size
- Focus indicators
- Link security attributes

---

## Troubleshooting

### PDF 404 Error

1. Verify file exists in `public/files/`
2. Check path in `_config.yml`
3. Ensure file name matches exactly (case-sensitive)
4. Check baseurl configuration for project sites

### Download Not Working

1. Check `download` attribute present
2. Verify browser supports download attribute
3. Try right-click → Save As
4. Check file permissions

### Opens in Same Tab

1. Add `target="_blank"` attribute
2. Check browser popup blocker
3. Verify no JavaScript preventing default

---

## File Management

### Version Control

Use semantic versioning in filename:

```
wmorr_director-resume-v2.1.0.pdf
```

- **Major**: Complete redesign (v2.0.0 → v3.0.0)
- **Minor**: New job/experience (v2.0.0 → v2.1.0)
- **Patch**: Minor updates (v2.1.0 → v2.1.1)

### Update Process

1. Upload new PDF to `public/files/`
2. Update `file_path` in `_config.yml`
3. Rebuild site
4. Test download

### Multiple Resumes

Offer different versions:

```yaml
resume:
  standard: /public/files/resume-standard.pdf
  technical: /public/files/resume-technical.pdf
  executive: /public/files/resume-executive.pdf
```

```html
<div class="resume-box">
  <a href="{{ site.resume.standard }}" class="btn btn--primary" download>
    Standard Resume
  </a>
  <a href="{{ site.resume.technical }}" class="btn btn--outline" download>
    Technical Resume
  </a>
</div>
```

---

## Browser Support

- ✅ Chrome 90+ (download attribute supported)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile Safari 14+

---

## Related Components

- [Buttons](02-buttons.md) - Button styling
- [Design Tokens](00-design-tokens.md) - Color customization

---

**Document Status**: ✅ Complete
**Last Updated**: October 1, 2025
