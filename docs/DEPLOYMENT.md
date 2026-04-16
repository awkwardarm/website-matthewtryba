# Deployment Guide

## Overview

Your website uses a **version-tagged deployment system** with GitHub and jsDelivr CDN. Changes go live in 4 steps:

1. Edit files locally
2. Commit and tag with version
3. Push to GitHub
4. Update version in Squarespace

---

## Prerequisites

- Git installed and configured
- VS Code (or any code editor)
- Access to your GitHub repository
- Access to Squarespace settings

---

## Step-by-Step Deployment

### 1. Make Your Changes

Edit files in VS Code:
- CSS changes → `assets/shared-styles.css`
- JavaScript changes → `assets/shared-scripts.js`
- Page configurations → `assets/page-configs.js`
- HTML changes → `pages-*/your-page.html`
- Audio player styles → `assets/audio-player.css`
- Audio player logic → `assets/audio-player.js`
- Audio tracks → `assets/audio-player-tracks.js`

> **Audio player files** now use jsDelivr CDN like all other assets. Update the version tag in the landing page `<head>` when deploying audio player changes.
```bash
# Open HTML file in browser
open pages-landing/landing-page-national.html
```

---

### 2. Update CHANGELOG.md

**Before committing**, document your changes in `CHANGELOG.md`.

1. Open `CHANGELOG.md`
2. Add your changes under the appropriate version section
3. Follow the format:

```markdown
## [1.0.4] - 2026-01-02

### Changed
- Updated hero section styling
  - Increased font size for headings
  - Adjusted button padding
```

**Categories to use:**
- `Added` - New features or files
- `Changed` - Changes to existing functionality
- `Fixed` - Bug fixes
- `Removed` - Removed features or files

---

### 3. Commit Changes to Git

#### Option A: Using VS Code UI

1. Click **Source Control** icon (left sidebar)
2. Review changed files
3. Click **+** to stage files (or stage all)
4. Enter commit message: `Update hero section styling`
5. Click **✓ Commit**

#### Option B: Using Terminal

```bash
cd /Users/matthewtryba/Documents/GitHub/website-matthewtryba

# See what changed
git status

# Stage all changes
git add .

# Or stage specific files
git add assets/shared-styles.css

# Commit with message
git commit -m "Update hero section styling"
```

---

### 4. Create Version Tag

Version tags control what Squarespace loads. Use **semantic versioning**:
- `v1.0.0` → Major redesign
- `v1.1.0` → New feature
- `v1.0.1` → Bug fix or small change

#### Option A: Using VS Code

1. Press `Cmd+Shift+P`
2. Type `Git: Create Tag`
3. Enter: `v1.0.4` (increment from last version)
4. Enter message: `Update hero section styling`
5. Press `Cmd+Shift+P` again
6. Type `Git: Push Tags`

#### Option B: Using Terminal

```bash
# Create tag
git tag -a v1.0.4 -m "Update hero section styling"

# Push tag to GitHub
git push origin v1.0.4
```

**Check your current version:**
```bash
git tag --list
```

---

### 5. Push to GitHub

If you haven't already pushed:

#### VS Code UI:
1. Click **Source Control**
2. Click **...** menu
3. Select **Push**

#### Terminal:
```bash
git push origin main
```

---

### 6. Update Squarespace

Now that the new version is on GitHub, update Squarespace to use it.

**Go to: Settings → Advanced → Code Injection**

#### Update Header Injection

Change version numbers from `@v1.0.3` to `@v1.0.4` (your new version):

```html
<meta name="google-site-verification" content="C6rIbGf37oPNtwidRGBKWA6wnrsLsSVH9P4v8ZzXo9E" />

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17389653886"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-17389653886');
</script>


<!-- Global CSS -->
<script>window.CDN_VERSION = 'v1.0.10';</script>
<script>
  (function(){
    var b = 'https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@' + window.CDN_VERSION + '/assets/';
    ['shared-styles.css','squarespace-overrides.css','audio-player.css'].forEach(function(f){
      document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="'+b+f+'">');
    });
  })();
</script>
```

#### Update Footer Injection

```html
<!-- Global JavaScript -->
<script>
  (function(){
    var b = 'https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@' + window.CDN_VERSION + '/assets/';
    var scripts = ['shared-scripts.js','page-configs.js','audio-player-tracks.js','audio-player.js'];
    var i = 0;
    function loadNext() {
      if (i >= scripts.length) {
        if (typeof initAudioPlayer === 'function' && typeof TRACKS !== 'undefined') {
          initAudioPlayer({ tracks: TRACKS });
        }
        if (typeof window.onCDNReady === 'function') window.onCDNReady();
        return;
      }
      var s = document.createElement('script');
      s.src = b + scripts[i++];
      s.onload = loadNext;
      document.body.appendChild(s);
    }
    loadNext();
  })();
</script>
```

**Click Save!**

---

### 6. Verify Changes

1. **Wait 30-60 seconds** for jsDelivr to fetch new files
2. **Hard refresh** your browser:
   - Open Chrome DevTools: `Cmd+Option+I`
   - **Right-click** the reload button
   - Select **"Empty Cache and Hard Reload"**

Your changes should now be live!

---

## Common Deployment Scenarios

### Updating Site-Wide Styles

**Example: Change primary color**

1. Edit `assets/shared-styles.css`:
```css
:root {
    --primary-color: #2c3e50; /* Changed from #0d0d0d */
    /* ... */
}
```

2. Commit and tag:
```bash
git add assets/shared-styles.css
git commit -m "Update primary color to darker shade"
git tag -a v1.0.5 -m "Update primary color"
git push origin main
git push origin v1.0.5
```

3. Update Squarespace Code Injection:
   - Change `@v1.0.4` → `@v1.0.5` in both header and footer

---

### Updating Form Configuration

**Example: Change redirect URL**

1. Edit `assets/page-configs.js`:
```javascript
'national-landing': {
    formAction: 'https://formbold.com/s/3nKg0',
    redirectUrl: 'https://www.matthewtryba.com/new-thank-you', // Changed
    // ...
}
```

2. Deploy as usual (commit, tag, push, update Squarespace)

---

### Adding Spam Filter Pattern

**Example: Block new spam name**

1. Edit `assets/shared-scripts.js`:
```javascript
const SPAM_CONFIG = {
    patterns: [
        "robertduend",
        "robert duend",
        "newspammer123"  // Add here
    ],
    // ...
};
```

2. Deploy as usual

---

### Deploying New Page

**Example: Add landing-page-chicago.html**

1. Create page and add to `page-configs.js` (see [CREATING-PAGES.md](CREATING-PAGES.md))

2. Commit all changes:
```bash
git add pages-landing/landing-page-chicago.html
git add assets/page-configs.js
git commit -m "Add Chicago landing page"
git tag -a v1.1.0 -m "Add Chicago landing page"
git push origin main
git push origin v1.1.0
```

3. Update Squarespace Code Injection to `@v1.1.0`

4. In Squarespace:
   - Create new page
   - Add Code Block
   - Paste HTML from landing-page-chicago.html (with local paths commented out)
   - Publish

---

### Updating Audio Player Files

The audio player (`audio-player.css`, `audio-player-tracks.js`, `audio-player.js`) is served from **jsDelivr CDN** — same workflow as all other assets.

**When to do this:**
- Edited `audio-player-tracks.js` to add/remove tracks
- Changed `audio-player.css` styles
- Updated `audio-player.js` logic

#### Step-by-step

1. **Edit the file(s) locally** in `assets/`

2. **Test locally** — comment out the CDN lines and uncomment `../assets/` lines in the landing page `<head>`, open in browser, then restore before deploying

3. **Commit, tag, push, and update version** — same as any other asset change:
```bash
git add assets/audio-player*.{css,js}
git commit -m "Update audio player tracks"
git tag -a v1.1.0 -m "Update audio player tracks"
git push origin main
git push origin v1.1.0
```

4. **Update the version** in the landing page `<head>` CDN URLs (`@v1.0.9` → `@v1.1.0`) and in Squarespace Code Injection header/footer

5. **Hard refresh** to verify:
   - `Cmd+Option+I` → right-click reload → "Empty Cache and Hard Reload"

---

## Rollback to Previous Version

If something breaks, revert to a previous version:

1. **Find previous version:**
```bash
git tag --list
# v1.0.1
# v1.0.2
# v1.0.3  ← Revert to this one
# v1.0.4  ← Current broken version
```

2. **Update Squarespace Code Injection:**
   - Change `@v1.0.4` → `@v1.0.3` in header and footer
   - Save

3. **Hard refresh browser**

Your site reverts instantly!

---

## Version Numbering Guidelines

Use semantic versioning: `vMAJOR.MINOR.PATCH`

**Examples:**
- `v1.0.1` → Fixed typo in CSS
- `v1.0.2` → Updated form redirect URL
- `v1.1.0` → Added new landing page
- `v1.1.1` → Fixed broken image link
- `v2.0.0` → Complete redesign

**When to increment:**
- **PATCH** (v1.0.X) - Bug fixes, typos, small CSS tweaks
- **MINOR** (v1.X.0) - New pages, new features, non-breaking changes
- **MAJOR** (vX.0.0) - Complete redesigns, breaking changes

---

## Troubleshooting

### Changes not showing on Squarespace

**Check:**
1. Did you push the tag? `git tag --list` (should see your version)
2. Did you update Code Injection version number?
3. Did you hard refresh? (Cmd+Option+I → Right-click reload → Empty Cache and Hard Reload)
4. Wait 60 seconds for jsDelivr to fetch new version

### "Tag already exists" error

You tried to create a tag that exists. Increment the version:
```bash
# Delete local tag (if needed)
git tag -d v1.0.4

# Create new tag with higher number
git tag -a v1.0.5 -m "Update styling"
```

### Git push rejected

Your local branch is behind remote:
```bash
# Pull latest changes first
git pull origin main

# Then push
git push origin main
git push origin v1.0.5
```

### Form stopped working after deployment

**Check:**
1. Verify `page-configs.js` has correct config
2. Check browser console for JavaScript errors (F12)
3. Verify page config name matches: `getPageConfig('page-name')`
4. Confirm version tag in Squarespace matches deployed version

### CSS not loading

**Verify CDN URL works:**
1. Visit in browser: `https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.5/assets/shared-styles.css`
2. Should show CSS content
3. If 404 error, tag might not be pushed to GitHub

---

## Best Practices

### ✅ Do:
- Test locally before deploying
- Use descriptive commit messages
- Increment version numbers sequentially
- Update both header AND footer injection in Squarespace
- Document major changes in commit messages
- Keep version tags on all deployments

### ❌ Don't:
- Skip version tags (always tag releases)
- Reuse version numbers (creates cache issues)
- Deploy without testing
- Edit files directly on Squarespace (edit locally, then deploy)
- Forget to push tags (`git push origin v1.0.5`)

---

## Quick Reference

**Full deployment in terminal:**
```bash
cd /Users/matthewtryba/Documents/GitHub/website-matthewtryba
git add .
git commit -m "Your change description"
git tag -a v1.0.X -m "Your change description"
git push origin main
git push origin v1.0.X
```

**Then:** Update Squarespace Code Injection version to match.

**Current version in Squarespace:** Check your Code Injection to see what's live.
