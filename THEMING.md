# 🎨 Theme System Documentation

This site features a powerful, user-customizable theming system that allows you to change colors and appearance without touching any CSS code.

## Quick Start

Edit `_config.yml` to customize your theme:

```yaml
# Theme Configuration
theme:
  brand_primary: "blue"      # Main brand color
  brand_secondary: "green"   # Optional accent color
  neutral: "slate"           # Text/backgrounds
  mode: "light"              # Theme mode
```

Then rebuild your site:

```bash
bundle exec jekyll build
```

---

## Available Options

### Brand Colors

Choose from these predefined color palettes:

| Palette  | Base Color | Example Use Cases                    |
|----------|------------|--------------------------------------|
| `orange` | #f97316    | Energy, creativity, enthusiasm       |
| `blue`   | #3b82f6    | Trust, professionalism, technology   |
| `green`  | #22c55e    | Growth, nature, success              |
| `purple` | #a855f7    | Luxury, creativity, innovation       |
| `red`    | #ef4444    | Passion, urgency, excitement         |

### Neutral Colors

Choose the neutral palette for text and backgrounds:

| Palette | Tone      | Description                          |
|---------|-----------|--------------------------------------|
| `slate` | Cool gray | Modern, professional, slightly blue  |
| `gray`  | True gray | Classic, neutral, balanced           |

### Theme Modes

| Mode    | Behavior                                            |
|---------|-----------------------------------------------------|
| `light` | Always display light theme                          |
| `dark`  | Always display dark theme                           |
| `auto`  | Respect user's OS/browser preference automatically  |

---

## Architecture

### System Files (Do Not Edit)

**`_data/color-palettes.yml`**
- Contains all color palette definitions (50-900 shades)
- Based on Tailwind CSS color system
- Only edit to add new palettes

**`_includes/design-tokens.html`**
- Generates CSS custom properties dynamically
- Reads theme selection from `_config.yml`
- Resolves colors from `_data/color-palettes.yml`

### User Configuration (Edit This)

**`_config.yml`** → `theme:` section
- Select brand colors by name
- Choose theme mode (light/dark/auto)
- No need to know hex codes or CSS

---

## How It Works

### Color Resolution Flow

```
User selects "blue" in _config.yml
         ↓
Liquid resolves palette from _data/color-palettes.yml
         ↓
Generates CSS custom properties in <head>
         ↓
Components use semantic tokens (--color-primary)
         ↓
Site displays with blue theme
```

### Semantic Tokens

The system generates semantic tokens that components use:

**Brand Colors:**
- `--color-primary` - Main brand color
- `--color-primary-hover` - Hover state
- `--color-primary-active` - Active/pressed state

**Text Colors:**
- `--color-text` - Primary text
- `--color-text-secondary` - Secondary text
- `--color-text-muted` - Muted/disabled text

**Background Colors:**
- `--color-background` - Page background
- `--color-surface` - Card/panel backgrounds
- `--bg-primary` - Primary color sections
- `--bg-dark` - Dark sections

---

## Examples

### Example 1: Professional Blue Theme (Light Mode)

```yaml
theme:
  brand_primary: "blue"
  brand_secondary: null
  neutral: "slate"
  mode: "light"
```

**Result:** Clean, professional look with blue accents on white background.

---

### Example 2: Bold Dual-Color Theme (Dark Mode)

```yaml
theme:
  brand_primary: "purple"
  brand_secondary: "orange"
  neutral: "gray"
  mode: "dark"
```

**Result:** Bold purple primary color with orange accents on dark background.

---

### Example 3: Adaptive Green Theme (Auto Mode)

```yaml
theme:
  brand_primary: "green"
  brand_secondary: "green"
  neutral: "slate"
  mode: "auto"
```

**Result:** Green theme that automatically switches between light and dark based on user's OS preference.

---

## Color Palette Reference

### Orange Palette

```css
50:  #fff7ed  (Lightest)
100: #ffedd5
200: #fed7aa
300: #fdba74
400: #fb923c
500: #f97316  ← Base color
600: #ea580c
700: #c2410c
800: #9a3412
900: #7c2d12  (Darkest)
```

### Blue Palette

```css
50:  #eff6ff
100: #dbeafe
200: #bfdbfe
300: #93c5fd
400: #60a5fa
500: #3b82f6  ← Base color
600: #2563eb
700: #1d4ed8
800: #1e40af
900: #1e3a8a
```

### Green Palette

```css
50:  #f0fdf4
100: #dcfce7
200: #bbf7d0
300: #86efac
400: #4ade80
500: #22c55e  ← Base color
600: #16a34a
700: #15803d
800: #166534
900: #14532d
```

### Purple Palette

```css
50:  #faf5ff
100: #f3e8ff
200: #e9d5ff
300: #d8b4fe
400: #c084fc
500: #a855f7  ← Base color
600: #9333ea
700: #7e22ce
800: #6b21a8
900: #581c87
```

### Red Palette

```css
50:  #fef2f2
100: #fee2e2
200: #fecaca
300: #fca5a5
400: #f87171
500: #ef4444  ← Base color
600: #dc2626
700: #b91c1c
800: #991b1b
900: #7f1d1d
```

---

## Dark Theme Details

### How Dark Theme Works

When `mode: "dark"` (or when `mode: "auto"` and OS prefers dark):

1. **Text Colors** are inverted (light text on dark backgrounds)
2. **Brand Colors** use lighter shades (400 instead of 500) for better contrast
3. **Backgrounds** use darkest neutral shades (900, 800)
4. **Borders** use subtle colors that work on dark backgrounds

### Dark Theme Semantic Token Mapping

| Token                | Light Mode         | Dark Mode          |
|----------------------|--------------------|--------------------|
| `--color-primary`    | primary-500        | primary-400        |
| `--color-text`       | neutral-900        | neutral-50         |
| `--color-background` | #ffffff            | neutral-900        |
| `--color-surface`    | #ffffff            | neutral-800        |

---

## Troubleshooting

### Colors Not Changing

1. **Did you rebuild the site?**
   ```bash
   bundle exec jekyll build
   ```

2. **Check your `_config.yml` syntax:**
   ```yaml
   theme:
     brand_primary: "blue"  # Must be quoted
     mode: "light"          # Must be quoted
   ```

3. **Verify color name spelling:**
   - Valid: `orange`, `blue`, `green`, `purple`, `red`
   - Invalid: `Orange`, `BLUE`, `greeen`

### Dark Mode Not Working

1. **Check mode setting:**
   ```yaml
   mode: "dark"  # Not "Dark" or "DARK"
   ```

2. **For auto mode, check browser:**
   - Chrome: Settings → Appearance → Theme
   - Firefox: about:config → ui.systemUsesDarkTheme
   - Safari: System Preferences → General → Appearance

3. **Clear browser cache:**
   - Hard reload: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

---

## Advanced: Adding New Color Palettes

To add a new color palette (e.g., "teal"):

1. Edit `_data/color-palettes.yml`:

```yaml
teal:
  50: "#f0fdfa"
  100: "#ccfbf1"
  200: "#99f6e4"
  300: "#5eead4"
  400: "#2dd4bf"
  500: "#14b8a6"  # Base color
  600: "#0d9488"
  700: "#0f766e"
  800: "#115e59"
  900: "#134e4a"
```

2. Update this documentation to list "teal" as available

3. Use in `_config.yml`:

```yaml
theme:
  brand_primary: "teal"
```

---

## Support

For issues or questions:
- Check this documentation first
- Review `_includes/design-tokens.html` for implementation details
- Inspect generated CSS in browser DevTools (look for `:root` styles)

---

**Generated with Claude Code** • Updated: 2025