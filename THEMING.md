# 🎨 Theme System Documentation (Phase 7)

This site features a powerful OKLCH-based theme editor that allows you to create custom color palettes with mathematical precision and WCAG accessibility compliance.

## Quick Start

### Option 1: Visual Editor (Recommended)

1. Start Jekyll server:
   ```bash
   bundle exec jekyll serve
   ```

2. Open the theme editor:
   ```
   http://localhost:4000/onboard/
   ```

3. Use the interactive color picker to customize your theme with live preview

4. Export your theme configuration and update `_config.yml`

### Option 2: Manual Configuration

Edit `_config.yml` to customize your theme:

```yaml
# Theme Configuration (Phase 7: OKLCH Format)
theme:
  brand_primary:
    l: 60      # Lightness (0-100)
    c: 0.18    # Chroma (0-0.4)
    h: 262     # Hue (0-360)
  brand_secondary: null  # Optional accent color
  neutral: "slate"       # Text/backgrounds (slate or gray)
  mode: "auto"           # Theme mode (light, dark, or auto)
```

Then rebuild your site:

```bash
pnpm run build  # Builds TypeScript editor + Jekyll site
# OR
bundle exec jekyll build  # Jekyll only
```

---

## OKLCH Color System

### What is OKLCH?

OKLCH (Oklab Lightness Chroma Hue) is a modern perceptually uniform color space that provides:

- **Perceptual uniformity**: Equal steps = equal visual differences
- **Predictable lightness**: L value directly controls brightness
- **Vibrant colors**: Maintains saturation better than HSL
- **Browser support**: 93.1% (Chrome 111+, Safari 15.4+, Firefox 113+)

### Color Parameters

**Lightness (L)**: `0-100`
- 0 = Pure black
- 50 = Medium tone
- 100 = Pure white
- Controls perceived brightness

**Chroma (C)**: `0-0.4`
- 0 = Grayscale (no color)
- 0.15 = Subtle color
- 0.25 = Vibrant color
- 0.37 = Maximum saturated (varies by hue)

**Hue (H)**: `0-360`
- 0° = Red
- 120° = Green
- 240° = Blue
- 360° = Red (wraps)

### Example Colors

```yaml
# Professional blue (similar to #3b82f6)
brand_primary:
  l: 60
  c: 0.18
  h: 262

# Vibrant orange (similar to #f97316)
brand_primary:
  l: 65
  c: 0.22
  h: 45

# Natural green (similar to #22c55e)
brand_primary:
  l: 70
  c: 0.20
  h: 145

# Royal purple (similar to #a855f7)
brand_primary:
  l: 60
  c: 0.25
  h: 305
```

---

## Theme Editor Features

### Interactive Color Picker
- Real-time OKLCH adjustments with sliders
- Live palette generation (50-900 shades)
- WCAG contrast validation
- Visual color preview

### Automatic Palette Generation

From a single base color, the system automatically generates:
- 10 shades (50, 100, 200, ..., 900)
- Perceptually uniform lightness progression
- Consistent saturation across shades
- WCAG-compliant text color recommendations

### Accessibility Validation

Built-in WCAG 2.1 contrast checker:
- AA compliance (≥4.5:1 for normal text)
- AAA compliance (≥7:1 for normal text)
- AA Large compliance (≥3:1 for large text)
- Real-time feedback on color picker

---

## Architecture

### Phase 7 System Files

**TypeScript Source** (`onboard/src/`)
- `utils/color-convert.ts` - OKLCH ↔ RGB conversion (Culori library)
- `utils/palette-generator.ts` - 10-shade palette generation
- `utils/contrast-checker.ts` - WCAG 2.1 validation
- `core/event-bus.ts` - Component communication
- `core/config-manager.ts` - State management
- `components/color-picker.ts` - Interactive UI
- `controllers/theme-editor.ts` - Main controller

**Build Output**
- `onboard/assets/dist/editor.bundle.js` - Compiled editor (58.8KB, 17KB brotli)

**Ruby Plugin**
- `_plugins/onboard_api.rb` - API endpoint generation

**Dashboard**
- `onboard/index.html` - Theme editor interface

### Configuration

**`_config.yml`** → `theme:` section
```yaml
theme:
  brand_primary:    # Primary brand color (OKLCH)
    l: 60
    c: 0.18
    h: 262
  brand_secondary:  # Optional accent color (null or OKLCH)
    l: 55
    c: 0.22
    h: 25
  neutral: "slate"  # Neutral palette (slate or gray)
  mode: "auto"      # Theme mode (light, dark, auto)
```

---

## Development Workflow

### Building the Editor

```bash
# Development mode (watch)
pnpm run dev:ts

# Production build
pnpm run build:ts

# Type checking
pnpm type:check

# Bundle size analysis
pnpm size
```

### Performance Budget

- Gzipped: 20.23 KB (limit: 150 KB) ✅
- Brotli: 17.04 KB (limit: 50 KB) ✅

### Browser Support

**Editor requires**:
- ES2022 (class fields, top-level await)
- ESM modules

**Color system supports**:
- OKLCH (93.1% - Chrome 111+, Safari 15.4+, Firefox 113+)
- Automatic RGB fallback for older browsers (~7%)

---

## Migration Guide

### From Phase 6 (Color Names) to Phase 7 (OKLCH)

**Old format:**
```yaml
theme:
  brand_primary: "blue"
  brand_secondary: "green"
```

**New format:**
```yaml
theme:
  brand_primary:
    l: 60
    c: 0.18
    h: 262
  brand_secondary:
    l: 70
    c: 0.20
    h: 145
```

**Migration steps:**

1. Use the theme editor to pick your desired colors
2. Export the OKLCH values
3. Update `_config.yml` with new format
4. Rebuild site with `pnpm run build`

---

## API Reference

### Public API (JavaScript)

The editor exports a public API for advanced usage:

```typescript
import {
  initThemeEditor,
  loadConfig,
  saveConfig,
  updateConfig,
  generateCSSVariables,
  exportThemeCSS
} from './onboard/assets/dist/editor.bundle.js';

// Initialize editor
const cleanup = await initThemeEditor('theme-editor-container');

// Load current config
const theme = await loadConfig();

// Update single property
updateConfig('brand_primary', { l: 65, c: 0.20, h: 180 });

// Generate CSS variables
const vars = generateCSSVariables(theme);
// Returns: { '--color-primary': 'oklch(60% 0.18 262deg)', ... }

// Export theme as CSS file
exportThemeCSS('my-theme.css');
```

### REST API (Read-Only)

**GET `/api/config.json`**

Returns current theme configuration:

```json
{
  "success": true,
  "theme": {
    "brand_primary": {
      "l": 60,
      "c": 0.18,
      "h": 262
    },
    "brand_secondary": null,
    "neutral": "slate",
    "mode": "auto"
  }
}
```

**Note**: Write operations (POST/PUT) are not currently implemented. To save changes:
1. Export theme from editor
2. Manually update `_config.yml`
3. Restart Jekyll server

---

## Security

### Localhost-Only Operation

The theme editor includes built-in security:

```typescript
// Editor only runs on localhost
const isLocalhost =
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '[::1]' ||
  hostname.endsWith('.local');
```

### Production Builds

- `onboard/` directory is deployed but non-functional on production
- JavaScript checks hostname and disables editor
- No security risk from deployment

---

## Advanced Topics

### Color Theory with OKLCH

**Monochromatic palette**: Same hue, varying lightness
```yaml
light: { l: 80, c: 0.15, h: 262 }
base:  { l: 60, c: 0.18, h: 262 }
dark:  { l: 40, c: 0.15, h: 262 }
```

**Complementary colors**: Opposite hues (180° apart)
```yaml
primary:   { l: 60, c: 0.18, h: 262 }  # Blue
secondary: { l: 60, c: 0.18, h: 82 }   # Yellow-green
```

**Analogous colors**: Adjacent hues (30° apart)
```yaml
primary:   { l: 60, c: 0.18, h: 262 }  # Blue
secondary: { l: 60, c: 0.18, h: 292 }  # Purple
```

### Custom Palette Generation

```typescript
import { generatePalette } from './utils/palette-generator.js';

const palette = generatePalette({
  l: 60,
  c: 0.18,
  h: 262
});

// Returns:
// {
//   50: "oklch(95% 0.072 262deg)",
//   100: "oklch(90% 0.09 262deg)",
//   ...
//   900: "oklch(20% 0.108 262deg)"
// }
```

---

## Troubleshooting

### Editor not loading
- Ensure Jekyll server is running
- Check browser console for errors
- Verify you're on localhost (not 0.0.0.0)

### Colors not displaying correctly
- Ensure browser supports OKLCH (Chrome 111+, Safari 15.4+, Firefox 113+)
- Check that values are in valid ranges (L: 0-100, C: 0-0.4, H: 0-360)

### Build errors
```bash
# Clear node modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Rebuild TypeScript
pnpm run build:ts
```

---

## Resources

- [OKLCH Color Picker](https://oklch.com)
- [Culori Library Documentation](https://culorijs.org/)
- [WCAG 2.1 Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [TypeScript 5.7 Documentation](https://www.typescriptlang.org/docs/)

---

**Phase 7 Complete** ✅ Modern OKLCH theme system with interactive editor
