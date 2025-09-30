# GitHub Pages Deployment Troubleshooting Guide

## 🚨 Common Deployment Issues & Solutions

This guide addresses the most frequent issues when deploying Jekyll sites to GitHub Pages using GitHub Actions.

---

## Issue 1: "Environment not found" or Deployment Fails

### Symptoms
- Build succeeds but deployment step fails
- Error message: `Environment "github-pages" not found`
- Workflow shows: ❌ on deploy job, ✅ on build job

### Root Cause
The `github-pages` environment doesn't exist in repository settings.

### Solution
GitHub Pages **automatically creates** this environment when you:

1. Go to repository: `https://github.com/williammorr/Personal-Profile`
2. Click **Settings** → **Pages**
3. Under **Build and deployment**:
   - **Source:** Select `GitHub Actions` (NOT "Deploy from a branch")
4. Save changes

The `github-pages` environment will be auto-created after the first successful workflow run.

### Verification
- Go to **Settings** → **Environments**
- You should see `github-pages` listed after first deployment

---

## Issue 2: 404 Error - Page Not Found

### Symptoms
- Workflow completes successfully (green checkmarks)
- Visiting `https://williammorr.github.io/Personal-Profile` shows 404

### Root Causes & Solutions

#### A. GitHub Pages Not Enabled
**Solution:**
1. Go to **Settings** → **Pages**
2. Ensure **Source** is set to `GitHub Actions`
3. You should see: "Your site is live at https://williammorr.github.io/Personal-Profile"

#### B. Wrong Repository Name
**Solution:**
- Repository name **must be** `Personal-Profile` (case-sensitive)
- Check URL: `https://github.com/williammorr/Personal-Profile`
- Do NOT rename repository

#### C. Baseurl Mismatch
**Solution:**
- Verify `_config.yml` has: `baseurl: "/Personal-Profile"`
- Must match repository name exactly (case-sensitive)

---

## Issue 3: Build Fails - "cannot load such file -- webrick"

### Symptoms
- Workflow fails at "Build Jekyll site" step
- Error: `LoadError: cannot load such file -- webrick`

### Root Cause
Ruby 3.0+ requires explicit `webrick` gem.

### Solution
✅ **Already fixed!** `Gemfile` now includes:
```ruby
gem 'webrick', '~> 1.8'
```

Verify `Gemfile.lock` exists and has `webrick` entry.

---

## Issue 4: Build Fails - Bundler Issues

### Symptoms
- Error: `Bundler could not find compatible versions`
- Error: `Your bundle is locked to X but your Gemfile specifies Y`

### Root Cause
Missing or outdated `Gemfile.lock`.

### Solution
✅ **Already fixed!** `Gemfile.lock` is now committed.

If issues persist:
```bash
# Locally regenerate lockfile
bundle update
git add Gemfile.lock
git commit -m "Update Gemfile.lock"
git push upstream master
```

---

## Issue 5: CSS/JS/Images Don't Load (404)

### Symptoms
- Site loads but has no styling
- Browser console shows 404 errors for assets
- Example: `https://williammorr.github.io/css/main.css` (404)

### Root Cause
Asset paths missing `/Personal-Profile` prefix.

### Solution
✅ **Already fixed!** All asset paths now use `| relative_url` filter:
- `_includes/head.html` - CSS files
- `_includes/scripts.html` - JS files
- `_includes/portfolio.html` - Images

### Verification
View page source, assets should have `/Personal-Profile/` prefix:
- ✅ `/Personal-Profile/css/main.css`
- ❌ `/css/main.css` (wrong)

---

## Issue 6: Workflow Never Runs

### Symptoms
- Push to GitHub but no workflow appears in Actions tab
- No build is triggered

### Root Causes & Solutions

#### A. Wrong Branch
**Check:**
```bash
git branch --show-current
```
**Solution:** Must be on `master` branch:
```bash
git checkout master
git push upstream master
```

#### B. Workflow File Not Committed
**Check:** Verify `.github/workflows/jekyll.yml` exists
```bash
git ls-files | grep jekyll.yml
```
**Solution:** Ensure workflow is committed:
```bash
git add .github/workflows/jekyll.yml
git commit -m "Add GitHub Pages workflow"
git push upstream master
```

#### C. GitHub Actions Disabled
**Solution:**
1. Go to **Settings** → **Actions** → **General**
2. Ensure "Allow all actions and reusable workflows" is selected
3. Save changes

---

## Issue 7: Build Succeeds But Shows Old Content

### Symptoms
- Workflow shows green checkmark
- Site still shows old version of content

### Root Causes & Solutions

#### A. Browser Cache
**Solution:**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Open in private/incognito window
- Clear browser cache completely

#### B. CDN Cache
**Solution:**
- GitHub Pages uses CDN caching (5-10 minutes)
- Wait 10 minutes and try again
- CDN cache cannot be manually cleared

#### C. Wrong Commit Deployed
**Solution:**
1. Go to **Actions** tab
2. Check which commit was built
3. Verify it's your latest commit

---

## Issue 8: Permission Denied Errors

### Symptoms
- Deploy step fails with "Permission denied"
- Error: `EACCES` or similar permission errors

### Root Cause
Workflow doesn't have required permissions.

### Solution
✅ **Already configured!** Workflow has correct permissions:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

If issue persists:
1. Go to **Settings** → **Actions** → **General**
2. Under "Workflow permissions":
   - Select "Read and write permissions"
   - Enable "Allow GitHub Actions to create and approve pull requests"
3. Save changes

---

## 🔍 Debugging Checklist

Use this checklist to systematically verify your deployment:

### Repository Settings
- [ ] Repository name is `Personal-Profile` (case-sensitive)
- [ ] Branch is `master`
- [ ] GitHub Pages enabled: Settings → Pages → Source: "GitHub Actions"
- [ ] GitHub Actions enabled: Settings → Actions → General

### Configuration Files
- [ ] `_config.yml` has:
  - `url: "https://williammorr.github.io"`
  - `baseurl: "/Personal-Profile"`
- [ ] `Gemfile` includes `gem 'webrick', '~> 1.8'`
- [ ] `Gemfile.lock` exists and is committed
- [ ] `.github/workflows/jekyll.yml` exists and triggers on `master`

### Asset Paths
- [ ] `_includes/head.html` uses `{{ '/css/main.css' | relative_url }}`
- [ ] `_includes/scripts.html` uses `{{ '/js/creative.js' | relative_url }}`
- [ ] `_includes/portfolio.html` uses `{{ item.image | relative_url }}`

### Workflow Verification
- [ ] Workflow file uses actions v4+ (modern versions)
- [ ] Workflow has correct permissions block
- [ ] Build step uses: `bundle exec jekyll build --baseurl ...`

---

## 🛠️ Manual Verification Steps

### 1. Test Local Build
```bash
# Install dependencies
bundle install

# Build site (should succeed with 0 errors)
bundle exec jekyll build

# Serve locally (test with baseurl)
bundle exec jekyll serve --baseurl ""

# Visit: http://localhost:4000
```

### 2. Check Repository Structure
```bash
# Verify all required files exist
ls -la .github/workflows/jekyll.yml
ls -la _config.yml
ls -la Gemfile
ls -la Gemfile.lock
```

### 3. Verify Git Status
```bash
# Check current branch
git branch --show-current
# Should output: master

# Check remote
git remote -v
# Should show: upstream https://github.com/williammorr/Personal-Profile.git
```

### 4. Monitor Deployment
```bash
# Push changes
git push upstream master

# Then immediately:
# 1. Go to: https://github.com/williammorr/Personal-Profile/actions
# 2. Click on latest workflow run
# 3. Watch real-time logs for errors
```

---

## 📞 Getting Help

If issues persist after trying all solutions:

1. **Check Workflow Logs:**
   - Go to Actions tab → Click failed run → View detailed logs
   - Look for specific error messages

2. **Verify Build Locally:**
   - Run `bundle exec jekyll build` locally
   - If local build fails, fix errors before pushing

3. **Compare Working Configuration:**
   - This repository is configured correctly
   - If deploying elsewhere, ensure exact same configuration

4. **GitHub Status:**
   - Check: https://www.githubstatus.com
   - GitHub Pages incidents may cause temporary failures

---

## ✅ Success Indicators

Your deployment is working correctly when:

- [ ] Actions tab shows: ✅ Deploy Jekyll site to GitHub Pages
- [ ] Settings → Pages shows: "Your site is live at..."
- [ ] Visiting `https://williammorr.github.io/Personal-Profile` loads site
- [ ] CSS styling appears correctly
- [ ] All images load
- [ ] Navigation works
- [ ] Browser console has 0 errors

**Expected URL:** https://williammorr.github.io/Personal-Profile

---

## 🚀 Quick Fix Checklist

Most common fixes in order of likelihood:

1. ✅ **Enable GitHub Pages:** Settings → Pages → Source: "GitHub Actions"
2. ✅ **Wait 2-5 minutes** after first enabling (environment creation takes time)
3. ✅ **Hard refresh browser:** Ctrl+Shift+R (cache issues)
4. ✅ **Verify baseurl:** Must be `/Personal-Profile` in `_config.yml`
5. ✅ **Check Actions tab:** Ensure workflow completed successfully
6. ✅ **Verify branch:** Must push to `master` branch
7. ✅ **Check Gemfile.lock:** Must be committed to repository

---

## 📚 Related Files

- `DEPLOYMENT_CHECKLIST.md` - Pre-deployment verification
- `README.md` - Full project documentation
- `.github/workflows/jekyll.yml` - Deployment workflow
- `_config.yml` - Site configuration