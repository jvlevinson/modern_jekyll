---
ai_context:
  model_requirements:
    context_window: 16k_tokens
    memory_format: hierarchical
    reasoning_depth: optional
    attention_focus: process
  context_dependencies: []
  context_chain:
    previous: README.md
    next: ""
  metadata:
    created: 2025-09-30 10:39:50 AM CST
    updated: 2025-09-30 10:39:50 AM CST
    version: v1.0.0
    category: guide
    status: active
    revision_id: ""
    parent_doc: "README.md"
    abstract: "Plain-language, step-by-step guide to customize the site without coding."
---

# ELI5 README

Relative path: `./ELI5.README.md`

Last updated: 2025-09-30 10:39:50 AM CST

Document purpose: A beginner-friendly guide for non-developers to customize and publish this site with minimal steps.

Version history:
- v1.0.0 (2025-09-30): First version

## What you have

This is a personal website you can customize without writing code. Most changes happen in one file called `_config.yml`.

- **You change content in one place**: `_config.yml`
- **Images go in**: `img/` (portfolio images in `img/portfolio/`)
- **The site is built for you** if you use GitHub Pages; you don’t need to run tools locally unless you want to preview changes on your computer.

## The one file you edit: `_config.yml`

Open `_config.yml` in any text editor. Update the parts below as needed.

### Site basics

```yaml
title: Your Site Title
author: Your Name
email: your-email@example.com
description: "A short sentence about you or your site"
favicon: img/favicon.svg  # Optional: change to another image in img/
```

### Your name in the top-left (navbar)

```yaml
brand_name: Your Brand
```

### Colors and theme (light/dark)

Pick your colors and theme mode. No CSS needed.

```yaml
theme:
  brand_primary: "blue"      # blue | orange | green | purple | red
  brand_secondary: "green"   # or null
  neutral: "slate"           # slate | gray
  mode: "auto"               # light | dark | auto
```

Tip: Visitors can also switch themes using the sun/moon button at the top.

### Hero (first big section)

```yaml
hero:
  heading: Your main headline
  description: Your short tagline
  button_text: Learn More
  button_link: "#services"            # click target
  background_image: img/header.jpg     # change to your own image if you like
```

### Call-to-Action (optional)

```yaml
cta:
  heading: A short call to action
  description: A sentence describing why to click
  button_text: See My Work
  button_link: "#portfolio"
```

### Services or skills

Add or remove list items as you like.

```yaml
services:
  heading: What I Do
  list:
    - icon: fa-diamond
      title: Service Name
      description: Short description
      delay: 0
    - icon: fa-paper-plane
      title: Another Service
      description: Another description
      delay: .1s
```

Icons: See the Font Awesome Free icon names at `https://fontawesome.com/search?o=r&m=free`.

### Portfolio projects (with images and flip details)

1) Put images in `img/portfolio/` (recommended size ~650×350px).
2) List each project here:

```yaml
portfolio_heading: My Work
portfolio_items:
  - image: img/portfolio/1.jpg
    category: Project Type
    name: Project Name
    link: "#"                 # a URL or section link
    flip_description: A longer description shown when the card flips
```

### Resume section (optional)

```yaml
resume:
  heading: Resume & Credentials
  description: Download my complete resume
  file_path: /public/files/your-resume.pdf
  view_button_text: View Resume
  download_button_text: Download Resume
```

### Contact section and social links

```yaml
contact:
  heading: Let's Get In Touch!
  description: Feel free to reach out
```

Social links show automatically if you set these at the top of `_config.yml`:

```yaml
twitter_username: yourhandle
github_username: yourhandle
linkedin_username: yourhandle
email: your-email@example.com
```

### Footer

```yaml
footer:
  copyright: Your Name
  year: 2025
```

## Add your images

- Put your favicon or logo in `img/` (e.g., `img/favicon.svg`).
- Put portfolio images in `img/portfolio/`.
- Update the image paths in `_config.yml` to match your filenames.

## How to see your changes

You have two options.

### Option A (easiest): Use GitHub Pages

1. Commit and push your changes to the `main` branch.
2. In your repository, go to Settings → Pages and choose GitHub Actions as the source.
3. Wait for the build to finish (see the Actions tab). Your site will be live.

If your repository is named `username.github.io`, your site will be at `https://username.github.io`.
If it is any other name, your site will be at `https://username.github.io/your-repo-name`.

### Option B (optional): Preview on your computer

Only do this if you are comfortable installing software.

1. Install Ruby and Bundler (see the main `README.md` under Quick Start).
2. Run these commands in the project folder:

```bash
bundle install
bundle exec jekyll serve
```

3. Open `http://localhost:4000` in your browser.

## Quick launch checklist

- [ ] Update site basics (title, author, description, email)
- [ ] Set your brand name
- [ ] Pick colors and theme mode
- [ ] Update hero text and background image
- [ ] Add services or skills
- [ ] Add portfolio items and images
- [ ] Add resume file and links (optional)
- [ ] Add social links
- [ ] Update footer year and name
- [ ] Push to GitHub and enable GitHub Pages

## Common problems (simple fixes)

- **I pushed changes but nothing updated**: Wait 1-2 minutes, then refresh. Check the Actions tab for build status.
- **Images don’t show**: Make sure the file names match exactly (including upper/lowercase) and the images are inside `img/` or `img/portfolio/`.
- **Links go to a 404**: For project sites, make sure `baseurl` is set correctly in `_config.yml` (see the main `README.md` under Deploying).
- **Colors didn’t change**: Double-check spelling of `brand_primary` and choose one of: `blue`, `orange`, `green`, `purple`, `red`.
- **Dark mode looks wrong**: Try `mode: "auto"` and use the theme toggle button to test.

## For Developers: Quality Assurance Tools (Optional)

This site includes modern testing tools to ensure everything works correctly. You don't need to use these unless you're making code changes (not just updating `_config.yml`).

### What's included

**Config Validator** - Checks if your `_config.yml` has mistakes before you publish
- Run: `pnpm run validate:config`
- Example: Catches typos like `brand_primary: "bleu"` (should be "blue")

**Visual Testing** - Takes screenshots and compares them to make sure nothing broke
- Run: `pnpm run test:visual`
- Uses Playwright (industry standard, works on Chrome, Firefox, Safari)

**Accessibility Checker** - Makes sure your site works for everyone, including people using screen readers
- Run: `pnpm run test:a11y`
- Uses axe-core (the same tool Google Lighthouse uses)

### When to use these

- **Before publishing**: Run `pnpm run validate:config` to catch config errors
- **After big changes**: Run all tests with `pnpm test`
- **Never required**: If you only change text/images in `_config.yml`, you can skip this

### Quick start

1. Install pnpm: `npm install -g pnpm` (one-time setup)
2. Install tools: `pnpm install`
3. Test everything: `pnpm test`
4. If tests pass ✅, you're good to publish

### Why these tools?

- **Playwright**: Microsoft-backed, most popular testing tool in 2025, huge community
- **AJV**: Industry standard for validating configuration files
- **axe-core**: Powers Google Lighthouse accessibility tests

These are the same tools professional developers use, but we've made them simple for you.

## Where to get help

- Check the main `README.md` for detailed, technical information.
- Ask a developer friend to help preview locally if needed.
- If you're stuck, describe what you changed and what you expected to see.

## Change log

- 2025-10-01 (v1.2.0): Fixed branch references (master → main), updated for latest improvements
- 2025-10-01 (v1.1.0): Added quality assurance tools section
- 2025-09-30 (v1.0.0): Created beginner-friendly ELI5 README


