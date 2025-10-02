# Onboard Dashboard

**Phase 6: Advanced Features** - Local development configuration viewer for Modern Jekyll.

---

## Overview

The Onboard Dashboard is a browser-based interface for viewing your Jekyll site configuration without editing YAML files. It provides a visual overview of your theme settings, content statistics, and project structure.

**Current Version**: Phase 1 (Read-Only)

---

## Access

### Local Development

```
http://localhost:4000/onboard/
```

**Prerequisites**:
1. Jekyll server must be running: `bundle exec jekyll serve`
2. Access from localhost only (security restriction)

### Security

The dashboard is **restricted to localhost** for security:
- ✅ Works on `localhost`, `127.0.0.1`, `0.0.0.0`
- ❌ Blocked on all other hosts
- ✅ Excluded from production builds (see `_config.yml` exclude list)
- ✅ No remote access possible

---

## Features (Phase 1 - Read-Only)

### 🎨 Theme Configuration
- View current color palette (primary & secondary)
- Display all color shades (50-900)
- Show theme mode (light/dark/auto)
- View neutral palette setting

### 📝 Content Statistics
- Site title and author
- Hero section content
- Count of services, portfolio items, and social links
- Quick content overview

### 🏗️ Project Structure
- List of completed project phases
- Key directory overview
- Design system information
- Jekyll version details

### 👁️ Live Preview
- Embedded iframe of your site
- Responsive viewport switching (desktop/tablet/mobile)
- Refresh preview on demand
- Open site in new tab

---

## Usage Guide

### Viewing Theme Configuration

1. Start Jekyll: `bundle exec jekyll serve`
2. Open dashboard: `http://localhost:4000/onboard/`
3. Click **Theme** tab
4. View:
   - Current brand colors with hex codes
   - Full palette preview (all shades)
   - Theme statistics

### Checking Content

1. Click **Content** tab
2. View:
   - Site metadata (title, author)
   - Hero section text
   - Content counts (services, portfolio, social links)

### Reviewing Structure

1. Click **Structure** tab
2. View:
   - Completed phases (1-6)
   - Project directories
   - Design system info

### Live Preview

1. Click **Preview** tab
2. Features:
   - **Refresh Preview**: Reload the embedded site
   - **Viewport Selector**: Switch between desktop/tablet/mobile
   - **Open in New Tab**: View full site in separate window

---

## Configuration

Dashboard settings are in `_config.yml`:

```yaml
# Onboard Dashboard (Phase 6: Advanced Features)
onboard:
  enabled: true               # Enable/disable dashboard
  require_auth: false         # Password protection (future)
  host_whitelist:             # Allowed hosts
    - localhost
    - 127.0.0.1
    - 0.0.0.0
```

### Disabling the Dashboard

Set `enabled: false` in `_config.yml`:

```yaml
onboard:
  enabled: false
```

Or delete the `onboard/` directory entirely.

---

## Files & Structure

```
onboard/
├── index.html              # Main dashboard UI
├── assets/
│   ├── dashboard.css       # Styles
│   └── dashboard.js        # Logic & security
└── README.md              # This file
```

**Total Size**: ~50KB (minimal overhead)

---

## Technical Details

### Security Implementation

**JavaScript validation** (`assets/dashboard.js`):
```javascript
function isLocalhost() {
  const hostname = window.location.hostname;
  const allowed = ['localhost', '127.0.0.1', '0.0.0.0', ''];
  return allowed.includes(hostname);
}
```

If accessed from non-localhost, shows **Access Denied** page.

### Configuration Loading

Dashboard uses **hardcoded configuration** that matches `_config.yml`:

```javascript
siteConfig = {
  theme: {
    brand_primary: 'blue',
    brand_secondary: 'green',
    neutral: 'slate',
    mode: 'light'
  },
  // ... other settings
};
```

**Future Enhancement (Phase 2)**: Dynamic loading from Jekyll data endpoint.

### Color Palettes

All 5 color palettes (orange, blue, green, purple, red) are embedded in JavaScript with full shade ranges (50-900) matching `_data/color-palettes.yml`.

---

## Browser Support

**Modern browsers only**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses modern CSS (Grid, Flexbox, custom properties) without fallbacks.

---

## Troubleshooting

### Dashboard Won't Load

**Symptoms**: Blank page or 404 error

**Solutions**:
1. ✅ Check Jekyll is running: `bundle exec jekyll serve`
2. ✅ Verify URL: `http://localhost:4000/onboard/` (note trailing slash)
3. ✅ Check `_config.yml`: `onboard.enabled` should be `true`
4. ✅ Clear browser cache

### Shows "Access Denied"

**Symptoms**: Security warning instead of dashboard

**Cause**: Not accessing from localhost

**Solutions**:
1. ✅ Use `localhost` (not IP address or domain)
2. ✅ Check URL: `http://localhost:4000/onboard/`
3. ✅ Don't use port forwarding from remote server (security block)

### Preview Iframe Blank

**Symptoms**: Preview section shows empty frame

**Solutions**:
1. ✅ Ensure main site is working: `http://localhost:4000`
2. ✅ Click "Refresh Preview" button
3. ✅ Check browser console for errors
4. ✅ Rebuild site: `bundle exec jekyll build`

### Colors Not Matching Site

**Symptoms**: Dashboard shows different colors than actual site

**Cause**: Hardcoded config in `dashboard.js` doesn't match `_config.yml`

**Solution**: Update `siteConfig` object in `assets/dashboard.js` to match your current `_config.yml` settings.

---

## Roadmap

### Phase 1: Read-Only Viewer ✅ **COMPLETE**
- [x] View theme configuration
- [x] Display color palettes
- [x] Show content statistics
- [x] Project structure overview
- [x] Live preview iframe

### Phase 2: Theme Editor (Future)
- [ ] Change colors via UI
- [ ] Switch theme mode
- [ ] Save changes to `_config.yml`
- [ ] Auto-rebuild on save

### Phase 3: Content Editor (Future)
- [ ] Edit hero text
- [ ] Manage services
- [ ] Update portfolio items
- [ ] Live preview updates

### Phase 4: Advanced Features (Future)
- [ ] Image upload & optimization
- [ ] Font management
- [ ] Performance metrics
- [ ] Accessibility checker

---

## Development Notes

### Customizing the Dashboard

**Change colors**:
Edit CSS variables in `assets/dashboard.css`:
```css
:root {
  --dashboard-primary: #3b82f6;
  --dashboard-bg: #f8fafc;
  --dashboard-surface: #ffffff;
  /* ... */
}
```

**Add new sections**:
1. Add HTML in `index.html`
2. Add nav button with `data-section="your-section"`
3. Create `<section id="section-your-section">`
4. Add logic in `dashboard.js`

**Debug mode**:
Open browser console:
```javascript
// View current config
window.onboardDashboard.config()

// Reload dashboard
window.onboardDashboard.reload()

// Check version
window.onboardDashboard.version
```

---

## Credits

**Built for**: Modern Jekyll Portfolio
**Phase**: 6 - Advanced Features
**Version**: 1.0.0 (Read-Only)
**Status**: Production Ready ✅

---

## License

Same license as main project (MIT).

---

## Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Verify Jekyll server is running
4. Check `_config.yml` settings

**Note**: This is a local development tool. For production sites, the dashboard is automatically excluded from builds.
