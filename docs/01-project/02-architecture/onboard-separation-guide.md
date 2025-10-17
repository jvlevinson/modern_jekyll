# Onboard Architecture & Separation Guide

**Document ID**: onboard-separation-guide
**Created**: October 17, 2025
**Purpose**: Comprehensive reference for understanding the complete architectural separation between the Onboard dashboard and the main Jekyll project
**Status**: ✅ Active Reference

---

## Executive Summary

The **Onboard Dashboard** is a completely separate, standalone application that runs alongside the main Jekyll project. It is **NOT** integrated into the main project's codebase, styles, or build pipeline.

### Key Separation Facts

✅ **Separate directories**: `/onboard/`, `/_sass/onboard/`, `/api/`
✅ **Separate build tools**: TypeScript, Vite, ESLint (scoped to onboard only)
✅ **Separate servers**: Jekyll (4000), API (4001)
✅ **Zero main project dependencies**: Main CSS does not import onboard styles
✅ **Production exclusion**: Onboard excluded from production builds

**Mental Model**: Think of onboard as a separate Node.js app that happens to live in the same repository for convenience.

---

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Build Pipeline Separation](#build-pipeline-separation)
3. [Configuration Reference](#configuration-reference)
4. [Sass/CSS Separation](#sasscss-separation)
5. [TypeScript Architecture](#typescript-architecture)
6. [API Backend](#api-backend)
7. [Integration Points](#integration-points)
8. [Production Exclusion](#production-exclusion)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)

---

## Directory Structure

### Complete File Tree

```
modern_jekyll/
├── onboard/                        # ⚡ ONBOARD: Frontend Dashboard
│   ├── index.html                  # Dashboard entry point
│   ├── README.md                   # Onboard documentation
│   ├── assets/
│   │   ├── dashboard.js            # Legacy nav script
│   │   ├── fa-icons.json           # Font Awesome icon data
│   │   └── dist/
│   │       └── editor.bundle.js    # Compiled TypeScript (Vite output)
│   ├── css/
│   │   ├── editor.scss             # Main editor stylesheet (imports /_sass/onboard/)
│   │   ├── content-editor.scss     # Content editor styles
│   │   ├── content-editor.css      # Compiled CSS
│   │   └── editor.css              # Compiled editor CSS (from Sass)
│   └── src/                        # TypeScript source code
│       ├── main.ts                 # Entry point (Vite)
│       ├── dashboard-nav.ts        # Navigation controller
│       ├── components/             # UI components
│       ├── controllers/            # Feature controllers
│       ├── core/                   # Core services
│       ├── types/                  # TypeScript type definitions
│       └── utils/                  # Utility functions
│
├── _sass/onboard/                  # ⚡ ONBOARD: Sass Modules (NOT in main project)
│   ├── _index.scss                 # Central import file
│   ├── abstracts/
│   │   ├── _tokens.scss            # Editor design tokens
│   │   └── _tokens-shadcn.scss     # Dashboard shell tokens
│   └── components/
│       ├── _dashboard.scss         # Dashboard layout
│       ├── _theme-editor.scss      # Theme editor UI
│       ├── _color-picker.scss      # Color picker component
│       ├── _color-selector-2d.scss # 2D color wheel
│       ├── _color-card.scss        # Color card display
│       ├── _color-gradient.scss    # Gradient visualizations
│       ├── _shade-matrix.scss      # Shade matrix display
│       ├── _color-harmonies.scss   # Color harmony suggestions
│       └── _color-presets.scss     # Preset color palettes
│
├── api/                            # ⚡ ONBOARD: Ruby Backend API
│   ├── app.rb                      # Roda application (main)
│   ├── config.ru                   # Rack entry point
│   ├── Gemfile                     # Ruby dependencies (separate from Jekyll)
│   ├── Gemfile.lock
│   ├── README.md                   # API documentation
│   ├── config/
│   │   ├── constants.rb            # Tokenized constants
│   │   ├── security.rb             # Rack::Attack localhost enforcement
│   │   └── shrine.rb               # File upload configuration
│   ├── lib/validators/
│   │   ├── config_validator.rb     # Config validation logic
│   │   └── content_validator.rb    # Content validation logic
│   ├── routes/                     # Modular route handlers
│   │   ├── config.rb               # /api/config endpoints
│   │   ├── content.rb              # /api/content endpoints
│   │   └── upload.rb               # /api/upload endpoints
│   ├── services/                   # Business logic
│   │   ├── config_writer.rb        # _config.yml write service
│   │   └── image_processor.rb      # libvips image processing
│   └── test/                       # API tests
│
├── _plugins/onboard_api.rb         # ⚡ ONBOARD: Jekyll plugin (dev only)
│
├── _config.yml                     # 🔗 INTEGRATION POINT: Lines 25-31
│
├── _sass/                          # ✅ MAIN PROJECT: Sass modules
│   ├── abstracts/                  # (Does NOT import onboard)
│   ├── base/
│   ├── components/
│   ├── layout/
│   ├── pages/
│   └── vendors/
│
├── css/main.scss                   # ✅ MAIN PROJECT: Entry (Does NOT import onboard)
│
├── package.json                    # 🔗 INTEGRATION POINT: Onboard scripts
├── tsconfig.json                   # ⚡ ONBOARD: TypeScript config (scoped)
├── vite.config.ts                  # ⚡ ONBOARD: Vite build config
├── eslint.config.js                # ⚡ ONBOARD: ESLint config (scoped)
└── Procfile                        # 🔗 INTEGRATION POINT: Process orchestration
```

### Legend
- ⚡ **ONBOARD**: Exclusively onboard-related
- ✅ **MAIN PROJECT**: Main Jekyll site (zero onboard dependencies)
- 🔗 **INTEGRATION POINT**: Configuration that references both

---

## Build Pipeline Separation

### Main Project Build

**Tools**: Jekyll, Ruby, Sass (via Jekyll)
**Entry**: `css/main.scss`
**Output**: `_site/css/main.css`
**Command**: `bundle exec jekyll build`

```bash
# Main project build flow
css/main.scss
  → @use 'abstracts'      # _sass/abstracts/_index.scss
  → @use 'base'           # _sass/base/_index.scss
  → @use 'components'     # _sass/components/_index.scss
  → @use 'layout'         # _sass/layout/_index.scss
  → (NO ONBOARD IMPORTS)
  → _site/css/main.css
```

### Onboard Build

**Tools**: Vite, TypeScript, esbuild, Sass (standalone)
**Entry**: `onboard/src/main.ts`
**Output**: `onboard/assets/dist/editor.bundle.js`
**Command**: `pnpm run build:ts` (or `vite build`)

```bash
# Onboard build flow
onboard/src/main.ts
  → Import all TypeScript modules
  → Vite bundles with esbuild
  → onboard/assets/dist/editor.bundle.js

# Onboard CSS build
onboard/css/editor.scss
  → @use '../../_sass/onboard'  # _sass/onboard/_index.scss
  → Compiles to onboard/css/editor.css
  → Loaded by onboard/index.html
```

### Critical Difference

| Aspect | Main Project | Onboard |
|--------|--------------|---------|
| **Build Tool** | Jekyll + Ruby Sass | Vite + TypeScript |
| **Entry Point** | `css/main.scss` | `onboard/src/main.ts` |
| **CSS Output** | `_site/css/main.css` | `onboard/css/editor.css` |
| **JS Output** | `js/creative.js` (vanilla) | `onboard/assets/dist/editor.bundle.js` |
| **Sass Imports** | `_sass/{abstracts,base,components,layout}` | `_sass/onboard/` only |
| **Build Command** | `bundle exec jekyll build` | `pnpm run build:ts` |

**Key Insight**: These are **two completely separate build pipelines** that never cross.

---

## Configuration Reference

### 1. `_config.yml` (Lines 25-31)

**Purpose**: Onboard feature flag and security configuration
**Used By**: Jekyll plugin (`_plugins/onboard_api.rb`), Dashboard JavaScript

```yaml
onboard:
  enabled: true               # Enable/disable dashboard
  require_auth: false         # Password protection (not implemented)
  host_whitelist:             # Allowed hosts (security)
    - localhost
    - 127.0.0.1
    - 0.0.0.0
```

**Separation**: This config section is **data only**. It does not integrate onboard into the main project build.

### 2. `_config.yml` (Lines 138-140) - Exclude

**Purpose**: Prevent onboard from being included in production builds

```yaml
exclude:
  - _tests_/
  - scripts/
```

**Note**: The `onboard/` directory is **NOT** explicitly excluded because Jekyll's default behavior is to only include files referenced in the build. Since no main project files reference onboard, it's implicitly excluded.

### 3. `package.json`

**Purpose**: Define onboard-specific build scripts
**Key Scripts**:

```json
{
  "scripts": {
    "dev:jekyll": "bundle exec jekyll serve --livereload",
    "dev:api": "cd api && bundle exec rackup config.ru -p 4001",
    "dev": "concurrently \"pnpm run dev:jekyll\" \"pnpm run dev:api\"",
    "build:ts": "vite build",
    "dev:ts": "vite",
    "lint": "eslint \"onboard/src/**/*.ts\"",
    "type:check": "tsc --noEmit"
  }
}
```

**Separation**: All TypeScript/Vite commands are explicitly scoped to `onboard/`.

### 4. `tsconfig.json`

**Purpose**: TypeScript compiler configuration **scoped to onboard only**

```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "ESNext",
    "strict": true,
    "rootDir": "./onboard/src",
    "outDir": "./dist"
  },
  "include": ["onboard/src/**/*"],  // ⚡ ONLY onboard
  "exclude": ["node_modules", "dist", "_site"]
}
```

**Key**: `"include": ["onboard/src/**/*"]` ensures TypeScript **only** compiles onboard code.

### 5. `eslint.config.js`

**Purpose**: ESLint configuration **scoped to onboard only**

```javascript
export default [
  {
    files: ['onboard/src/**/*.ts', 'onboard/src/**/*.tsx'],  // ⚡ ONLY onboard
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  },
  {
    ignores: [
      'dist/**',
      '_site/**',
      'api/**',
      '_sass/**',          // ⚡ Ignores ALL Sass (main + onboard)
      'css/**',
      'onboard/assets/dist/**'
    ]
  }
];
```

**Key**: ESLint **only** lints `onboard/src/**/*.ts`. Main project JavaScript is ignored.

### 6. `vite.config.ts`

**Purpose**: Vite bundler configuration for onboard TypeScript

```typescript
export default defineConfig({
  root: '.',
  build: {
    outDir: 'onboard/assets/dist',     // ⚡ Output to onboard directory
    emptyOutDir: false,
    target: 'es2024',
    rollupOptions: {
      input: 'onboard/src/main.ts',    // ⚡ Entry point
      output: {
        entryFileNames: 'editor.bundle.js',
        format: 'es'
      }
    }
  }
});
```

**Key**: Entry point is `onboard/src/main.ts`, output is `onboard/assets/dist/editor.bundle.js`. Nothing touches main project.

### 7. `Procfile`

**Purpose**: Orchestrate Jekyll and API servers concurrently

```
# Jekyll Static Site (Port 4000)
jekyll: bundle exec jekyll serve --port 4000 --livereload

# Onboard API Server (Port 4001)
api: cd api && bundle exec rackup config.ru -p 4001
```

**Usage**: `overmind start` (runs both processes in parallel)

**Separation**: Two independent servers with no shared state.

### 8. `_plugins/onboard_api.rb`

**Purpose**: Jekyll plugin to generate `/api/config.json` endpoint (development only)

```ruby
module Jekyll
  class OnboardAPIGenerator < Generator
    def generate(site)
      return unless Jekyll.env == 'development'  # ⚡ Dev only

      # Create /api/config.json with theme data from _config.yml
      api_dir = File.join(site.dest, 'api')
      FileUtils.mkdir_p(api_dir)

      theme = site.config['theme']
      # Write JSON file...
    end
  end
end
```

**Key**: Only runs in development. Production builds skip this plugin.

---

## Sass/CSS Separation

### Main Project Sass (✅ No Onboard)

**File**: `css/main.scss`
**Location**: `/home/groot/Github/modern_jekyll/css/main.scss`

```scss
// =============================================================================
// Main Stylesheet - Modular SCSS Architecture
// =============================================================================

@use 'abstracts';         // _sass/abstracts/
@use 'base';              // _sass/base/
@use 'components';        // _sass/components/
@use 'layout';            // _sass/layout/
@use 'pages/extras';      // _sass/pages/extras
@use 'vendors/bootstrap-overrides';  // _sass/vendors/

// ⚡ NO ONBOARD IMPORTS
```

**Compiled Output**: `_site/css/main.css` (Jekyll build)

### Onboard Sass (⚡ Completely Separate)

**File**: `onboard/css/editor.scss`
**Location**: `/home/groot/Github/modern_jekyll/onboard/css/editor.scss`

```scss
// =============================================================================
// Theme Editor Stylesheet
// =============================================================================

// Import onboard-specific modules
@use '../../_sass/onboard';           // _sass/onboard/_index.scss

// Content editor styles
@use 'content-editor' as *;           // onboard/css/content-editor.scss

// Editor container isolation
#theme-editor-container {
  isolation: isolate;
  contain: layout style;
  font-family: var(--editor-font-sans);
  // ...
}
```

**Compiled Output**: `onboard/css/editor.css` (standalone Sass compilation)

### Onboard Sass Modules

**File**: `_sass/onboard/_index.scss`
**Location**: `/home/groot/Github/modern_jekyll/_sass/onboard/_index.scss`

```scss
// =============================================================================
// Onboard Theme Editor - Module Index
// =============================================================================

// Abstracts - Design Tokens
@forward 'abstracts/tokens-shadcn';  // Dashboard shell tokens
@forward 'abstracts/tokens';         // Editor component tokens

// Components - Dashboard & Editor UI
@forward 'components/dashboard';     // Dashboard layout
@forward 'components/theme-editor';  // Theme editor UI
@forward 'components/color-picker';
@forward 'components/color-selector-2d';
@forward 'components/color-card';
@forward 'components/color-gradient';
@forward 'components/shade-matrix';
@forward 'components/color-harmonies';
@forward 'components/color-presets';
```

### Visual Separation Diagram

```
Main Project CSS Flow:
  css/main.scss
    ├─> _sass/abstracts/
    ├─> _sass/base/
    ├─> _sass/components/
    ├─> _sass/layout/
    ├─> _sass/pages/
    └─> _sass/vendors/

    ⚠️ DOES NOT TOUCH _sass/onboard/

Onboard CSS Flow:
  onboard/css/editor.scss
    └─> _sass/onboard/
        ├─> abstracts/
        └─> components/

    ⚠️ DOES NOT TOUCH main project Sass
```

### Why `_sass/onboard/` Lives in `_sass/`?

**Reason**: Jekyll's Sass compiler looks for imports in `_sass/` by default. By placing onboard Sass in `_sass/onboard/`, we can:
1. Use Jekyll's Sass compilation for `onboard/css/editor.scss`
2. Keep onboard styles organizationally separate
3. Ensure main project never accidentally imports them

**Key**: Location doesn't matter; what matters is that **nothing imports `_sass/onboard/` except `onboard/css/editor.scss`**.

---

## TypeScript Architecture

### Entry Point

**File**: `onboard/src/main.ts`
**Purpose**: Initialize dashboard controllers

```typescript
import { initDashboardNav } from './dashboard-nav.js';
import { initThemeEditor } from './controllers/theme-editor.js';
import { initContentEditor } from './controllers/content-editor.js';

document.addEventListener('DOMContentLoaded', () => {
  initDashboardNav();
  initThemeEditor();
  initContentEditor();
});
```

### Module Structure

```
onboard/src/
├── main.ts                    # Entry point (Vite)
├── dashboard-nav.ts           # Tab navigation controller
├── components/                # UI components (functional modules)
│   ├── color-card.ts          # Color preview card
│   ├── color-gradient.ts      # Gradient visualization
│   ├── color-harmonies.ts     # Color harmony suggestions
│   ├── color-picker.ts        # OKLCH sliders
│   ├── color-presets.ts       # Preset color palettes
│   ├── color-selector-2d.ts   # 2D color wheel (canvas)
│   ├── icon-picker.ts         # Font Awesome icon picker
│   ├── image-uploader.ts      # Drag-drop file upload
│   └── shade-matrix.ts        # Shade matrix display
├── controllers/               # Feature controllers
│   ├── theme-editor.ts        # Theme editor orchestration
│   └── content-editor.ts      # Content editor orchestration
├── core/                      # Core services
│   ├── config-manager.ts      # _config.yml read/write
│   ├── content-api.ts         # API client for content
│   ├── event-bus.ts           # Pub/sub event system
│   ├── preview-manager.ts     # Live preview iframe control
│   └── storage-manager.ts     # LocalStorage wrapper
├── types/                     # TypeScript type definitions
│   ├── color.types.ts         # OKLCH, RGB, Hex types
│   ├── config.types.ts        # Theme config types
│   ├── content.types.ts       # Content section types
│   └── events.types.ts        # Event payload types
└── utils/                     # Utility functions
    ├── color-constants.ts     # Neutral palette definitions
    ├── color-convert.ts       # OKLCH ↔ RGB conversion
    ├── color-theory.ts        # Color harmony algorithms
    ├── contrast-checker.ts    # WCAG contrast calculations
    ├── hex-converter.ts       # Hex ↔ OKLCH conversion
    └── palette-generator.ts   # Shade palette generation
```

### Build Output

**Command**: `pnpm run build:ts` (or `vite build`)
**Output**: `onboard/assets/dist/editor.bundle.js` (~68 KB uncompressed, ~23 KB gzipped)

**Loaded By**: `onboard/index.html`

```html
<script type="module" src="assets/dist/editor.bundle.js"></script>
```

---

## API Backend

### Architecture

**Framework**: Roda 3.84 (routing tree web framework)
**Port**: 4001
**Security**: Localhost-only (Rack::Attack enforcement)
**Purpose**: Read/write Jekyll `_config.yml`, manage content, handle file uploads

### Directory Structure

```
api/
├── app.rb                     # Main Roda application
├── config.ru                  # Rack entry point
├── Gemfile                    # Ruby dependencies (separate from Jekyll)
├── config/
│   ├── constants.rb           # Tokenized constants (DRY)
│   ├── security.rb            # Rack::Attack localhost enforcement
│   └── shrine.rb              # File upload configuration
├── lib/validators/
│   ├── config_validator.rb    # Config validation logic
│   └── content_validator.rb   # Content validation logic
├── routes/                    # Modular route handlers
│   ├── config.rb              # GET/POST /api/config
│   ├── content.rb             # GET/POST /api/content/{hero,services,portfolio}
│   └── upload.rb              # POST /api/upload
├── services/                  # Business logic (atomic)
│   ├── config_writer.rb       # _config.yml write with file locking
│   └── image_processor.rb     # libvips image processing
└── test/                      # API tests (minitest)
```

### Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/` | API status |
| `GET` | `/health` | Health check |
| `GET` | `/api/docs` | API documentation |
| `GET` | `/api/config` | Read Jekyll `_config.yml` theme |
| `POST` | `/api/config` | Write Jekyll `_config.yml` theme |
| `GET` | `/api/content/hero` | Get hero section |
| `POST` | `/api/content/hero` | Update hero section |
| `GET` | `/api/content/services` | Get services list |
| `POST` | `/api/content/services` | Update services |
| `GET` | `/api/content/portfolio` | Get portfolio items |
| `POST` | `/api/content/portfolio` | Update portfolio |
| `POST` | `/api/upload` | Upload & process image |

### Security

**Localhost-Only Enforcement** (`api/config/security.rb`):

```ruby
# Rack::Attack configuration
Rack::Attack.safelist('allow localhost') do |req|
  ['127.0.0.1', '::1', 'localhost'].include? req.ip
end

Rack::Attack.blocklist('block non-localhost') do |req|
  !['127.0.0.1', '::1', 'localhost'].include? req.ip
end
```

### Technology Stack

| Component | Technology | Why |
|-----------|------------|-----|
| **Framework** | Roda 3.84 | 3.2x faster than Sinatra, modular routing tree |
| **Image Processing** | libvips + ruby-vips 2.2 | 10x faster, 90% less memory vs ImageMagick |
| **File Uploads** | Shrine 3.6 | Streaming-first, cloud-native |
| **Security** | Rack::Attack 6.7 | Localhost-only, CVE protection |
| **Validation** | dry-validation 1.10 | Type-safe input validation |

---

## Integration Points

### 1. Jekyll Plugin (`_plugins/onboard_api.rb`)

**Purpose**: Generate `/api/config.json` endpoint during Jekyll build (development only)

**Behavior**:
- Runs during `bundle exec jekyll build` or `serve`
- Reads theme config from `_config.yml` (lines 14-24)
- Generates `_site/api/config.json` with theme data
- **Only runs in development** (`Jekyll.env == 'development'`)

**Separation**: This plugin **does not** add onboard styles or scripts to the main project. It only exposes theme data as JSON.

### 2. `_config.yml` Onboard Section (Lines 25-31)

**Purpose**: Feature flag and security configuration

```yaml
onboard:
  enabled: true
  require_auth: false
  host_whitelist:
    - localhost
    - 127.0.0.1
    - 0.0.0.0
```

**Used By**:
- Jekyll plugin (`_plugins/onboard_api.rb`) to check if onboard is enabled
- Dashboard JavaScript (`onboard/assets/dashboard.js`) to enforce localhost-only access

**Separation**: This is **configuration data only**. It does not integrate onboard into the build.

### 3. Onboard HTML Page (`onboard/index.html`)

**Permalink**: `/onboard/index.html`
**Access URL**: `http://localhost:4000/onboard/`

**Front Matter**:
```yaml
---
layout: null
permalink: /onboard/index.html
---
```

**Key**: `layout: null` means this page **does not** use any Jekyll layout from `_layouts/`. It's a completely standalone HTML page.

### 4. Process Orchestration (`Procfile`)

**Purpose**: Run Jekyll and API servers concurrently

```
jekyll: bundle exec jekyll serve --port 4000 --livereload
api: cd api && bundle exec rackup config.ru -p 4001
```

**Usage**: `overmind start`

**Separation**: Two independent processes with no shared state.

---

## Production Exclusion

### How Onboard is Excluded from Production

#### 1. **Implicit Exclusion by Jekyll**

Jekyll only includes files that are:
- Referenced in layouts/includes
- Have Jekyll front matter
- Are in specific directories (`_posts/`, `_pages/`, etc.)

Since **no main project files reference onboard**, Jekyll naturally excludes it from builds.

#### 2. **`onboard/index.html` with `layout: null`**

```yaml
---
layout: null
permalink: /onboard/index.html
---
```

This page **is** built by Jekyll, but it's:
- A standalone HTML file (no layout wrapper)
- Only accessible at `/onboard/` URL
- Not linked from main site navigation

#### 3. **Jekyll Plugin Disabled in Production**

```ruby
def generate(site)
  return unless Jekyll.env == 'development'  # ⚡ Only runs in dev
  # ...
end
```

In production (`JEKYLL_ENV=production`), the plugin does nothing.

#### 4. **GitHub Pages Build**

GitHub Pages runs:
```bash
JEKYLL_ENV=production bundle exec jekyll build
```

This:
- Skips custom plugins (GitHub's security policy)
- Builds only standard Jekyll content
- Does not execute `_plugins/onboard_api.rb`
- Does not generate `/api/config.json`

Result: Dashboard loads but is **read-only** (no API).

#### 5. **Security Check in Dashboard JavaScript**

`onboard/assets/dashboard.js`:

```javascript
function isLocalhost() {
  const hostname = window.location.hostname;
  const allowed = ['localhost', '127.0.0.1', '0.0.0.0', ''];
  return allowed.includes(hostname);
}

if (!isLocalhost()) {
  document.body.innerHTML = '<h1>Access Denied</h1><p>Dashboard only works on localhost.</p>';
}
```

Even if dashboard deploys, it **blocks non-localhost access**.

### Production Verification

```bash
# Production build
JEKYLL_ENV=production bundle exec jekyll build

# Result:
# - _site/ contains main project files
# - _site/onboard/ contains dashboard HTML
# - _site/api/config.json does NOT exist (plugin skipped)
# - Dashboard loads but is non-functional (no API, localhost check fails)
```

---

## Development Workflow

### Working on Main Project (Jekyll Site)

**Files**:
- `_includes/`, `_layouts/`, `_sass/`, `css/`, `js/`

**Commands**:
```bash
# Start Jekyll server
bundle exec jekyll serve --livereload

# Visit site
http://localhost:4000/
```

**Build**:
```bash
bundle exec jekyll build
```

**No onboard involvement**: Main project builds independently.

### Working on Onboard Dashboard

**Files**:
- `onboard/src/` (TypeScript)
- `_sass/onboard/` (Sass)
- `onboard/css/` (Sass entry)
- `onboard/index.html` (HTML)

**Commands**:
```bash
# Start both Jekyll + API (recommended)
overmind start

# OR start separately:
# Terminal 1: Jekyll
bundle exec jekyll serve --livereload

# Terminal 2: API
cd api && bundle exec rackup config.ru -p 4001

# Terminal 3: TypeScript dev (optional)
pnpm run dev:ts
```

**Visit Dashboard**:
```
http://localhost:4000/onboard/
```

**Build TypeScript**:
```bash
pnpm run build:ts
# Output: onboard/assets/dist/editor.bundle.js
```

**Build CSS**:
```bash
# CSS is compiled by Jekyll automatically when you run:
bundle exec jekyll serve
```

### Working on API Backend

**Files**:
- `api/` (Ruby/Roda)

**Commands**:
```bash
# Start API server
cd api && bundle exec rackup config.ru -p 4001

# Test endpoints
curl http://localhost:4001/
curl http://localhost:4001/api/config
curl http://localhost:4001/api/docs
```

**Restart After Changes**:
```bash
overmind restart api
```

### Concurrent Development

**Recommended Setup** (using Overmind):

```bash
# Terminal 1: Start all processes
overmind start

# Terminal 2: Watch TypeScript (optional)
pnpm run dev:ts

# Terminal 3: Commit changes
git add .
git commit -m "..."
```

**Overmind Commands**:
```bash
overmind start           # Start all (Jekyll + API)
overmind restart api     # Restart only API
overmind restart jekyll  # Restart only Jekyll
overmind connect api     # Connect to API (interactive)
overmind kill            # Stop all
```

---

## Troubleshooting

### Common Confusion Points

#### ❓ "Is onboard integrated into the main project?"

**No**. Onboard is a **completely separate application** that lives in the same repository for convenience.

**Evidence**:
- Main CSS (`css/main.scss`) does NOT import `_sass/onboard/`
- TypeScript config (`tsconfig.json`) only includes `onboard/src/`
- No files in `_includes/` or `_layouts/` reference onboard
- Separate build commands (`jekyll build` vs `vite build`)

#### ❓ "Why is `_sass/onboard/` in the main Sass directory?"

**Reason**: Jekyll's Sass compiler looks for imports in `_sass/` by default. By placing onboard Sass in `_sass/onboard/`, we can use Jekyll's Sass compilation for `onboard/css/editor.scss` while keeping styles organizationally separate.

**Key**: The main project's `css/main.scss` **never imports** `_sass/onboard/`. Only `onboard/css/editor.scss` does.

#### ❓ "Did we accidentally add onboard CSS to the main project?"

**No**. The main project's CSS (`_site/css/main.css`) contains **zero onboard styles**.

**Verification**:
```bash
# Check main project CSS output
grep -i "onboard\|editor\|theme-editor" _site/css/main.css
# Result: No matches (or only if CSS variable names coincidentally match)
```

#### ❓ "Are there any onboard dependencies in the main project?"

**No**. The main project has zero dependencies on onboard.

**Evidence**:
```bash
# Check main project files for onboard references
grep -r "onboard" _includes/ _layouts/ _sass/abstracts/ _sass/base/ _sass/components/ _sass/layout/
# Result: No matches
```

#### ❓ "What if I delete `_sass/onboard/`?"

**Effect**:
- Main project: **Zero impact** (main CSS compiles normally)
- Onboard dashboard: **Breaks** (no styles)

#### ❓ "What if I delete `onboard/` directory?"

**Effect**:
- Main project: **Zero impact**
- Onboard dashboard: **Completely removed**

### Debugging Separation Issues

#### Test 1: Main Project CSS Has No Onboard

```bash
# Build main project
bundle exec jekyll build

# Check CSS output
cat _site/css/main.css | grep -i "editor\|onboard\|theme-editor\|color-picker"
# Expected: No matches (or minimal false positives)
```

#### Test 2: Onboard CSS is Separate

```bash
# Check onboard CSS
cat onboard/css/editor.css | grep -i "color-picker\|theme-editor"
# Expected: Many matches
```

#### Test 3: TypeScript Only Compiles Onboard

```bash
# Check TypeScript config
cat tsconfig.json | grep "include"
# Expected: ["onboard/src/**/*"]
```

#### Test 4: ESLint Only Lints Onboard

```bash
# Run ESLint
pnpm run lint
# Expected: Only checks onboard/src/**/*.ts
```

#### Test 5: Main Project Builds Without Onboard

```bash
# Temporarily rename onboard directory
mv onboard onboard.bak
mv _sass/onboard _sass/onboard.bak

# Build main project
bundle exec jekyll build

# Check output
ls _site/css/main.css
# Expected: Success (main project builds normally)

# Restore onboard
mv onboard.bak onboard
mv _sass/onboard.bak _sass/onboard
```

### Support

For architecture questions or clarifications:
1. Check this document first
2. Review relevant planning documents (`docs/01-project/03-plans/`)
3. Check component-specific READMEs (`onboard/README.md`, `api/README.md`)
4. Inspect configuration files (`_config.yml`, `tsconfig.json`, `vite.config.ts`)

---

## Summary

### Key Takeaways

✅ **Onboard is a separate application** that lives alongside the main Jekyll project
✅ **Main project has zero onboard dependencies** (no imports, no references)
✅ **Separate build pipelines**: Jekyll (main) vs Vite (onboard)
✅ **Separate servers**: Jekyll (4000) vs API (4001)
✅ **Production exclusion**: Onboard is localhost-only by design
✅ **`_sass/onboard/` location is convenience**: Main project never imports it

### Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│                   modern_jekyll Repository                  │
│                                                             │
│  ┌─────────────────────────┐  ┌──────────────────────────┐ │
│  │   Main Jekyll Project   │  │    Onboard Dashboard     │ │
│  │                         │  │                          │ │
│  │  • _includes/           │  │  • onboard/              │ │
│  │  • _layouts/            │  │  • _sass/onboard/        │ │
│  │  • _sass/ (main)        │  │  • api/                  │ │
│  │  • css/main.scss        │  │                          │ │
│  │  • Jekyll build         │  │  • TypeScript/Vite       │ │
│  │  • Port 4000            │  │  • Ruby/Roda API         │ │
│  │                         │  │  • Port 4001             │ │
│  └─────────────────────────┘  └──────────────────────────┘ │
│              ↑                            ↑                 │
│              └────────────────────────────┘                 │
│                      No dependencies                        │
│              Only shared: Repository location               │
└─────────────────────────────────────────────────────────────┘
```

**Think of it as**: Two separate apps sharing a git repository, not an integrated monolith.

---

**Document Status**: ✅ Complete
**Last Updated**: October 17, 2025
**Maintained By**: Architecture Team
**Related Documents**:
- `onboard/README.md` - Onboard feature documentation
- `api/README.md` - API backend documentation
- `THEMING.md` - Theme system user guide
- `docs/01-project/03-plans/14-20251002-002.06-phase-7-completion.md` - Phase 7 completion
