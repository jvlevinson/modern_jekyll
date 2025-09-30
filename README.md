# Personal Profile Site

A personal portfolio website built with Jekyll 4.4+ using the [Creative Theme](http://startbootstrap.com/template-overviews/creative/) from Start Bootstrap. This is a fully customizable, single-page Bootstrap site with a modern, tokenized configuration system and advanced theming capabilities.

**✨ Key Features:**
- **Fully tokenized configuration** - All content managed through `_config.yml`
- **User-customizable theming** - Choose colors and light/dark modes without touching CSS
- **Theme toggle button** - Manual theme switcher with localStorage persistence
- **Modern modular SCSS architecture** - 7-1 pattern with Sass modules (`@use`/`@forward`)
- **Bootstrap 5.3.8** with responsive design
- **Vanilla JavaScript** - No jQuery dependencies (2025 best practices)
- **Font Awesome 6.7.2** icons
- **Interactive portfolio** - Flip animations with hover indicators
- **Glassmorphism navbar** - Blur effects for modern UI
- **SVG favicon** - Customizable brand icon
- **GitHub Pages ready** - Automated deployment

**🔗 Live Site:** [https://williammorr.com](https://williammorr.com)

---

## Quick Start

### Prerequisites

You'll need these installed on your machine:

**Git**
- Windows: [Git for Windows](https://gitforwindows.org/)
- macOS: `xcode-select --install`
- Linux: `sudo apt-get install -y git`

**Ruby + Bundler**
- Windows: [Ruby+Devkit from RubyInstaller](https://rubyinstaller.org/)
- macOS: `brew install ruby`
- Linux: `sudo apt-get install -y ruby-full build-essential zlib1g-dev`

Then install Bundler:
```bash
gem install bundler
```

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/williammorr/Personal-Profile.git
   cd Personal-Profile
   ```

2. **Install dependencies:**
   ```bash
   bundle install
   ```

3. **Serve locally:**
   ```bash
   bundle exec jekyll serve
   ```
   Open [http://localhost:4000](http://localhost:4000) in your browser.

4. **Serve with live reload:**
   ```bash
   bundle exec jekyll serve --livereload
   ```

---

## Architecture: Tokenization & Modularity

This project follows Jekyll best practices with a **fully tokenized, modular architecture** that separates content from presentation.

### Why Tokenization?

Traditional static sites hard-code content directly into HTML templates, making updates tedious and error-prone. This site uses **Liquid template variables** to pull all content from a central configuration file (`_config.yml`), providing:

- **Single source of truth** - All content in one place
- **Zero HTML editing** - Update text, images, and links without touching templates
- **Type safety** - Structured YAML prevents formatting errors
- **Version control friendly** - Content changes are clearly visible in diffs
- **Rapid customization** - Fork, edit config, deploy

### How It Works

**Traditional approach (❌ Hard-coded):**
```html
<h1>Your Favorite Source of Free Bootstrap Themes</h1>
<p>Start Bootstrap can help you build...</p>
```

**This project (✅ Tokenized):**
```html
<h1>{{ site.hero.heading }}</h1>
<p>{{ site.hero.description }}</p>
```

**Configuration (_config.yml):**
```yaml
hero:
  heading: Your Favorite Source of Free Bootstrap Themes
  description: Start Bootstrap can help you build...
  background_image: img/header.jpg
```

### Modular Components

Each page section lives in its own include file (`_includes/`):
- `header.html` → Hero section with configurable background image
- `services.html` → Services grid (loops through `site.services.list`)
- `portfolio.html` → Portfolio grid with flip animations (loops through `site.portfolio_items`)
- `resume.html` → Resume download section
- `contact.html` → Contact section with social links
- `footer.html` → Footer with copyright
- `nav.html` → Navigation with theme toggle button

These components are:
1. **Reusable** - Include anywhere in any layout
2. **Composable** - Reorder by changing include order in `_layouts/front.html`
3. **Self-contained** - Each manages its own markup and styling
4. **Data-driven** - All content pulled from `_config.yml`

### Benefits

✅ **No code knowledge required** - Edit YAML, not HTML
✅ **Maintainable** - Update content without breaking markup
✅ **Scalable** - Add portfolio items, services, etc. as array entries
✅ **Static & fast** - No database, all compiled at build time
✅ **GitHub Pages compatible** - Uses only standard Jekyll features

---

## Customization

All site content is managed through `_config.yml`. No need to edit HTML files!

### Site Metadata
```yaml
title: Your Site Title
email: your-email@example.com
description: 'Your site description'
author: Your Name
favicon: img/favicon.svg          # Path to favicon (SVG supported!)
twitter_username: yourhandle
github_username: yourhandle
linkedin_username: yourhandle
```

### Navigation
```yaml
brand_name: Your Brand              # Top-left navbar brand
```

### Color Theme & Dark Mode

**🎨 User-Customizable Color Theming System**

Your site supports easy color customization and light/dark themes! Choose from 5 pre-defined color palettes without editing any CSS.

#### Available Color Palettes

- **orange** - Warm, energetic (#f97316)
- **blue** - Professional, trustworthy (#3b82f6)
- **green** - Fresh, growth-oriented (#22c55e)
- **purple** - Creative, sophisticated (#a855f7)
- **red** - Bold, attention-grabbing (#ef4444)

#### How to Change Colors & Theme Mode

Edit the `theme` section in `_config.yml`:

```yaml
theme:
  brand_primary: "blue"          # Main brand color
  brand_secondary: "green"       # Optional accent color (or null)
  neutral: "slate"               # Text/backgrounds - Choose: slate, gray
  mode: "light"                  # Choose: light, dark, auto
```

Then rebuild your site:
```bash
bundle exec jekyll build
```

**That's it!** All buttons, links, navigation, portfolio overlays, and the favicon will automatically use your chosen colors.

#### Theme Modes

The theming system supports three modes:

- **`light`** - Always display light theme (white background, dark text)
- **`dark`** - Always display dark theme (dark background, light text)
- **`auto`** - Automatically respect user's OS/browser theme preference

**Theme Toggle Button:** Users can manually switch themes using the sun/moon icon button in the navigation bar. Their preference is saved in localStorage and persists across sessions.

#### Separation of Concerns

The theming system separates user configuration from system files:

**User Configuration** (`_config.yml`):
- ✅ Simple color selection (brand_primary, brand_secondary, neutral, mode)
- ✅ No technical knowledge required
- ✅ Clear options and comments

**System Files** (not user-editable):
- `_data/color-palettes.yml` - Color palette library (5 palettes × 10 shades each)
- `_includes/design-tokens.html` - Dynamic token generation logic
- `_sass/` - Component styles using semantic tokens

#### Under the Hood

The theming system uses:
- **Color Palette Library** - 5 palettes × 10 shades each (50-900) in `_data/color-palettes.yml`
- **Liquid Template Engine** - Resolves user selection to CSS custom properties
- **Semantic Tokens** - Components reference meaningful names (`--color-primary`, `--color-text`, `--navbar-bg`)
- **CSS Custom Properties** - Runtime theming without recompilation
- **JavaScript Theme Toggle** - Manual theme switching with localStorage persistence

See `_includes/design-tokens.html` for the full token architecture.

#### Implementation Status

- ✅ **Phase 1** (Complete): Color palette selection system
- ✅ **Phase 2** (Complete): Multi-color support (5 palettes)
- ✅ **Phase 3** (Complete): Dark theme support with `mode: "light"`, `mode: "dark"`, and `mode: "auto"`
- ✅ **Phase 4** (Complete): Theme toggle button with localStorage persistence
- 🔄 **Phase 5** (Future): Custom color overrides for advanced users

### Hero Section
The landing section with heading, description, and configurable background:
```yaml
hero:
  heading: Your main headline
  description: Your tagline or description
  button_text: Call to Action
  button_link: "#about"              # Anchor link or URL
  background_image: img/header.jpg   # Configurable background image
```

### Call-to-Action Section
```yaml
cta:
  heading: Section heading
  description: Longer description text
  button_text: Button text
  button_link: "#services"
```

### Services Section
Define your services or skills:
```yaml
services:
  heading: Services Heading
  list:
    - icon: fa-diamond              # Font Awesome icon
      title: Service Name
      description: Service description
      delay: 0                      # Animation delay
    - icon: fa-paper-plane
      title: Another Service
      description: Another description
      delay: .1s
```

**Available Font Awesome Icons:** See [Font Awesome 6 Free icons](https://fontawesome.com/search?o=r&m=free)

### Portfolio Section
Showcase projects with flip animations and hover effects:
```yaml
portfolio_heading: My Work          # Optional section heading
portfolio_items:
  - image: img/portfolio/1.jpg      # Image path
    category: Project Type
    name: Project Name
    link: "#"                       # Project URL or anchor
    flip_description: Detailed description shown on back of card when clicked
  - image: img/portfolio/2.jpg
    category: Another Type
    name: Another Project
    link: "https://example.com"
    flip_description: More details about this project
```

**Interactive Features:**
- **Click to flip** - Cards flip to show detailed description
- **Hover indicators** - Animated corner brackets and "Click to flip" text
- **Responsive** - Works on all screen sizes

Add your images to `img/portfolio/` and reference them here.

### Resume Section
```yaml
resume:
  heading: Resume & Credentials
  description: Download my complete resume...
  file_path: /public/files/your-resume.pdf
  view_button_text: View Resume
  download_button_text: Download Resume
```

### Aside Section
A prominent call-out section:
```yaml
aside:
  heading: Explore My Full Portfolio
  button_text: More Coming Soon!
  button_link: "https://yoursite.com"
```

### Contact Section
```yaml
contact:
  heading: Let's Get In Touch!
  description: Contact prompt or additional info
```

Social links (Twitter, Email, GitHub, LinkedIn) are shown automatically using the usernames defined at the top of `_config.yml`.

### Footer Section
```yaml
footer:
  copyright: Your Name
  year: 2025
```

---

## Site Structure

```
.
├── _includes/          # Reusable HTML components
│   ├── head.html       # <head> metadata with favicon support
│   ├── nav.html        # Navigation bar with theme toggle
│   ├── header.html     # Hero section with configurable background
│   ├── call-to-action.html
│   ├── services.html   # Services grid
│   ├── portfolio.html  # Portfolio grid with flip animations
│   ├── resume.html     # Resume download section
│   ├── aside.html      # CTA aside
│   ├── contact.html    # Contact section
│   ├── footer.html     # Footer
│   ├── design-tokens.html  # Dynamic color token generator
│   └── scripts.html    # JavaScript includes
├── _layouts/
│   └── front.html      # Main layout composing all sections
├── _sass/              # Modern SCSS architecture (7-1 pattern)
│   ├── abstracts/      # Variables, functions, mixins
│   ├── base/           # Reset, typography, utilities
│   ├── components/     # Buttons, service-box, portfolio-box, theme-toggle
│   ├── layout/         # Navigation, header, sections, contact
│   ├── pages/          # Page-specific styles
│   └── vendors/        # Bootstrap overrides
├── _data/
│   └── color-palettes.yml  # System color palette library
├── css/
│   └── main.scss       # Master stylesheet (uses @use/@forward)
├── img/                # Images and graphics
│   ├── favicon.svg     # SVG favicon (blue "W" icon)
│   ├── header.jpg      # Hero background image
│   └── portfolio/      # Portfolio images
├── js/
│   ├── creative.js     # Custom scripts (vanilla JS, no jQuery!)
│   └── wow.min.js      # Scroll animations
├── _config.yml         # Site configuration (edit this!)
├── Gemfile             # Ruby dependencies
├── CLAUDE.md           # Claude Code AI assistant instructions
├── THEMING.md          # Detailed theming documentation
└── index.html          # Entry point
```

**To reorder or remove sections:** Edit `_layouts/front.html` and rearrange the `{% include %}` statements.

### Modern SCSS Architecture

This project uses the **7-1 Pattern** with modern Sass module system (`@use`/`@forward`):

- **No deprecation warnings** - Uses `color.adjust()` instead of deprecated `darken()`
- **CSS Custom Properties** - Runtime theming support for light/dark modes
- **Modular & maintainable** - Each component in its own file
- **BEM-ready** - Structured for easy migration to BEM naming
- **Bootstrap 5 compatible** - Modern grid and components
- **User-Customizable Colors** - Choose from 5 color palettes via `_config.yml`
- **Glassmorphism Effects** - Navbar with backdrop-filter blur

#### CSS File Structure

**Design Tokens (Dynamic):**
- `_includes/design-tokens.html` → Generates CSS custom properties from user theme selection
  - Reads color selection from `_config.yml` (brand_primary, brand_secondary, neutral, mode)
  - Resolves palettes from `_data/color-palettes.yml` (system file)
  - Creates 30+ CSS custom properties including:
    - Color scales (--color-primary-50 through --color-primary-900)
    - Semantic tokens (--color-primary, --color-secondary, --color-text, --bg-dark, --navbar-bg)
    - Theme-aware tokens that invert for dark mode
  - Injected into `<head>` before main.css for proper cascade

**Your Custom Styles (Modular):**
- `css/main.scss` → Compiles to `main.css`
- `_sass/` → Modular SCSS architecture (7-1 pattern)
  - `abstracts/` - Variables, functions, mixins (now includes token documentation)
  - `base/` - Reset, typography, utilities
  - `components/` - Buttons, service boxes, portfolio boxes with flip animations, theme toggle
  - `layout/` - Navigation with glassmorphism, header, sections, contact
  - `pages/` - Page-specific styles
  - `vendors/` - Bootstrap 5 overrides

**Third-Party Libraries (CDN):**
- **Bootstrap 5.3.8** - Framework via CDN (no local files)
- **Font Awesome 6.7.2** - Icons via CDN (no local files)

**Vendor CSS (Local):**
- `css/animate.min.css` - Animate.css library for WOW.js animations
  - **Not modularized** - Third-party library kept separate per best practices

### JavaScript Architecture

**Modern Vanilla JavaScript (No jQuery!)**

The site uses **pure vanilla JavaScript** following 2025 best practices:

- ✅ **No jQuery dependency** - Removed for performance and modern standards
- ✅ **Bootstrap 5 native APIs** - Uses built-in ScrollSpy, Collapse, etc.
- ✅ **Native smooth scrolling** - `window.scrollTo({ behavior: 'smooth' })`
- ✅ **Modern event listeners** - `addEventListener` instead of jQuery `.on()`
- ✅ **localStorage with fallbacks** - Private browsing detection with graceful degradation

**Features in `js/creative.js`:**
- Smooth scroll navigation
- Sticky navbar with glassmorphism
- Mobile menu auto-close
- Responsive text sizing
- Portfolio flip animations
- Theme toggle with persistence
- WOW.js scroll animations

---

## Deploying to GitHub Pages

This site supports both **user sites** (`username.github.io`) and **project sites** (`username.github.io/repo-name`).

### Automated Deployment (Recommended)

The repository includes a **GitHub Actions workflow** (`.github/workflows/jekyll.yml`) that automatically builds and deploys your site on every push to the `master` branch.

**Setup Steps:**

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under **Build and deployment**, select **GitHub Actions** (not "Deploy from branch")

### Step 2: Configure URLs

**For a user site** (`williammorr.github.io`):
```yaml
# _config.yml
url: "https://williammorr.github.io"
baseurl: ""
```

**For a project site** (`williammorr.github.io/Personal-Profile`):
```yaml
# _config.yml
url: "https://williammorr.github.io"
baseurl: "/Personal-Profile"  # Must match repo name exactly
```

### Step 3: Push Changes

```bash
git add .
git commit -m "Deploy site to GitHub Pages"
git push origin master
```

GitHub Actions will automatically:
1. Build the Jekyll site with modern Sass compilation
2. Deploy to GitHub Pages

**Monitor progress:** Check the **Actions** tab in your repository for build status.

Once the workflow completes (✅ green checkmark), your site will be live!

---

## Adding New Portfolio Images

1. Add your image to `img/portfolio/` (recommended size: 650x350px)
2. Update `_config.yml` portfolio_items section with the new item
3. Commit and push

Example:
```yaml
portfolio_items:
  - image: img/portfolio/my-new-project.jpg
    category: Web Development
    name: My Awesome Project
    link: "https://github.com/williammorr/my-project"
    flip_description: Detailed description of the project shown when card is flipped
```

---

## Advanced Customization

### Custom Favicon

The site includes a blue "W" SVG favicon by default. To customize:

1. Create your favicon (SVG, ICO, or PNG)
2. Place it in `img/` directory
3. Update `_config.yml`:
   ```yaml
   favicon: img/your-custom-favicon.svg
   ```

SVG favicons are recommended for scalability and theme integration.

### Custom Colors

For advanced users who want colors not in the pre-defined palettes:

1. Add a new palette to `_data/color-palettes.yml` (system file)
2. Follow the same structure as existing palettes (shades 50-900)
3. Reference your custom palette name in `theme.brand_primary` or `theme.brand_secondary`

**Example** (`_data/color-palettes.yml`):
```yaml
teal:
  50: "#f0fdfa"
  100: "#ccfbf1"
  # ... continue with 200-800
  500: "#14b8a6"    # Base color
  900: "#134e4a"
```

Then use in `_config.yml`:
```yaml
theme:
  brand_primary: "teal"
```

See `_includes/design-tokens.html` for the complete token architecture.

---

## Troubleshooting

### Local Development Issues

**"Could not locate Gemfile"**
- Make sure you're in the project directory
- Run `bundle install`

**"bundle: command not found"**
- Bundler isn't installed. Run `gem install bundler`

**Site builds but CSS/images don't load locally**
- If using project site config with `baseurl: "/Personal-Profile"`:
  - Option 1: Visit `http://localhost:4000/Personal-Profile/`
  - Option 2: Serve with: `bundle exec jekyll serve --baseurl ""`

### GitHub Pages Deployment Issues

**404 Error on GitHub Pages**
- ✅ **GitHub Pages enabled:** Settings → Pages → Source: "GitHub Actions"
- ✅ **Branch is correct:** Workflow triggers on `master` branch
- ✅ **Workflow file exists:** `.github/workflows/jekyll.yml` is present
- ✅ **URLs match:** For user site use `baseurl: ""`, for project site use `baseurl: "/repo-name"`

**CSS/JS/Images don't load on GitHub Pages**
- Check that `baseurl` in `_config.yml` matches your deployment type
- Verify all asset links use `| relative_url` filter in templates
- Check browser console for 404 errors

**GitHub Actions build fails**
- Check the **Actions** tab for error details
- Common issues:
  - Missing `Gemfile` or syntax errors in `_config.yml`
  - Image paths pointing to non-existent files
  - SCSS compilation errors (check build logs)

**Changes not appearing on live site**
- Wait 1-2 minutes for GitHub Actions to rebuild
- Check the **Actions** tab to verify build succeeded (green checkmark)
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache or use private/incognito window

**Theme toggle not working**
- Check browser console for JavaScript errors
- Verify `js/creative.js` is loading
- Try clearing localStorage: `localStorage.clear()` in browser console

---

## Technology Stack

- **Jekyll 4.4+** - Static site generator
- **Bootstrap 5.3.8** - Front-end framework (CDN)
- **Sass/SCSS** - CSS preprocessor with modern module system
- **Liquid** - Templating engine
- **Font Awesome 6.7.2** - Icon library (CDN)
- **Vanilla JavaScript** - No dependencies (jQuery removed)
- **WOW.js** - Scroll reveal animations
- **GitHub Actions** - Automated deployment

---

## Credits

- **Jekyll:** Static site generator - [jekyllrb.com](https://jekyllrb.com)
- **Creative Theme:** Start Bootstrap - [startbootstrap.com](http://startbootstrap.com)
- **Bootstrap:** Front-end framework - [getbootstrap.com](https://getbootstrap.com)
- **Font Awesome:** Icon library - [fontawesome.com](https://fontawesome.com)

---

## License

See [LICENSE](LICENSE) file for details.