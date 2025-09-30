# GitHub Pages Deployment Checklist

## ✅ Pre-Deployment Verification (All Complete!)

### Configuration Files
- [x] **_config.yml**
  - `url: "https://williammorr.github.io"`
  - `baseurl: "/Personal-Profile"` (matches repository name exactly)
  - `github_username: williammorr`
  - `title: William M. Orr`
  - `author: William M. Orr`

### Asset Paths Fixed
- [x] **CSS files** use `| relative_url` filter
  - `_includes/head.html`: `/css/animate.min.css` ✓
  - `_includes/head.html`: `/css/main.css` ✓
  
- [x] **JavaScript files** use `| relative_url` filter
  - `_includes/scripts.html`: `/js/wow.min.js` ✓
  - `_includes/scripts.html`: `/js/creative.js` ✓

- [x] **Images** use `| relative_url` filter
  - `_includes/portfolio.html`: Portfolio images ✓

### GitHub Actions Workflow
- [x] **File exists:** `.github/workflows/jekyll.yml`
- [x] **Triggers on:** `master` branch push
- [x] **Ruby version:** 3.3
- [x] **Latest actions:** All using 2025 versions

### Build Verification
- [x] **Local build:** Successful (0.063s)
- [x] **No errors:** 0 deprecation warnings
- [x] **Paths verified:** `/Personal-Profile/css/main.css` ✓

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Configure for GitHub Pages deployment with correct baseurl"
git push upstream master
```

### Step 2: Enable GitHub Pages (One-Time Setup)
1. Go to: https://github.com/williammorr/Personal-Profile
2. Click: **Settings** → **Pages**
3. Under "Build and deployment":
   - Source: Select **GitHub Actions**
   - Save changes

### Step 3: Monitor Deployment
1. Go to: **Actions** tab
2. Wait for workflow: "Deploy Jekyll site to GitHub Pages"
3. Wait for: ✅ Green checkmark (1-2 minutes)

### Step 4: Verify Site
**Live URL:** https://williammorr.github.io/Personal-Profile

Check:
- [ ] Site loads without 404 error
- [ ] CSS styling appears correctly
- [ ] Images load properly
- [ ] Navigation works
- [ ] All sections render

## 🔍 Common Issues & Solutions

### Issue: 404 Error
**Cause:** Repository name doesn't match baseurl  
**Solution:** Repository must be named `Personal-Profile` (case-sensitive)

### Issue: Site loads but no styling
**Cause:** Asset paths don't include baseurl  
**Solution:** All asset links now use `| relative_url` filter ✅

### Issue: Build fails in Actions
**Cause:** Missing dependencies or syntax errors  
**Solution:** Check Actions tab logs for specific error

### Issue: Old content showing
**Cause:** Browser or CDN cache  
**Solution:** Hard refresh (Ctrl+Shift+R) or wait 5-10 minutes

## 📝 Important Notes

1. **Repository Name:** Must be `Personal-Profile` (do NOT rename)
2. **Baseurl:** Must match repository name exactly: `/Personal-Profile`
3. **Branch:** Workflow triggers on `master` branch only
4. **Testing Locally:** Use `bundle exec jekyll serve --baseurl ""` for local testing

## ✅ Configuration Summary

| Setting | Value | Status |
|---------|-------|--------|
| Repository | `williammorr/Personal-Profile` | ✅ |
| Live URL | `https://williammorr.github.io/Personal-Profile` | ✅ |
| Base URL | `/Personal-Profile` | ✅ |
| GitHub Username | `williammorr` | ✅ |
| Branch | `master` | ✅ |
| Workflow | `.github/workflows/jekyll.yml` | ✅ |
| Asset Paths | Use `relative_url` filter | ✅ |

## 🎉 Ready to Deploy!

All configuration is correct. Follow the deployment steps above.
