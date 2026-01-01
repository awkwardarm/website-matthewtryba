# Website Architecture Overview

## How the System Works

Your website uses a **centralized asset system** where CSS, JavaScript, and configurations are shared across all pages. This means you can update styling or functionality in one place and it automatically applies everywhere.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│  (version controlled source of truth)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Git Push + Version Tag
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    jsDelivr CDN                         │
│  (serves files globally with caching)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP Request
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Squarespace Code Injection                 │
│  (loads CSS/JS from CDN into every page)               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Applied to
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    Your Web Pages                        │
│  (HTML content in Code Blocks)                          │
└─────────────────────────────────────────────────────────┘
```

---

## File Structure

```
website-matthewtryba/
├── assets/                          # Shared resources
│   ├── shared-styles.css           # Global CSS (all pages)
│   ├── squarespace-overrides.css   # Squarespace-specific fixes
│   ├── shared-scripts.js           # Form validation & utilities
│   └── page-configs.js             # Page-specific settings
│
├── pages-landing/                   # Landing page templates
│   ├── landing-page-national.html
│   └── landing-page-recording-studio.html
│
├── pages-main/                      # Main site pages
│   ├── home-page.html
│   ├── about.html
│   └── work.html
│
├── pages-thank-you/                 # Thank you pages
│   └── thank-you-home.html
│
├── images/                          # Image assets
│   ├── album-art/
│   ├── profile-photos/
│   └── headshots-artists/
│
└── docs/                            # Documentation (you are here)
    ├── OVERVIEW.md
    ├── CREATING-PAGES.md
    └── DEPLOYMENT.md
```

---

## How Assets are Loaded

### On Squarespace (Production)

Every page on your Squarespace site loads shared assets via **Code Injection**:

**Header Injection:**
```html
<!-- Global CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.3/assets/shared-styles.css">

<!-- Squarespace-specific overrides -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.3/assets/squarespace-overrides.css">
```

**Footer Injection:**
```html
<!-- Global JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.3/assets/shared-scripts.js"></script>
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.3/assets/page-configs.js"></script>
```

### Local Development (Your Computer)

When previewing pages locally, the HTML files load assets from the local `../assets/` folder:

```html
<!-- Load Assets for Local Preview, Comment out when deploying -->
<link rel="stylesheet" href="../assets/shared-styles.css"> 
<script src="../assets/shared-scripts.js"></script>  
<script src="../assets/page-configs.js"></script>
```

**Important:** Comment these out before copying to Squarespace!

---

## Key Concepts

### 1. Version Tags
Version tags (like `@v1.0.3`) ensure:
- **Instant updates** - No waiting for cache to expire
- **Rollback capability** - Can revert to previous versions
- **Testing** - Test new versions without affecting live site

### 2. Shared Styles
CSS is centralized in `shared-styles.css`:
- Change once, updates everywhere
- Consistent design across all pages
- Easy to switch themes (light/dark mode)

### 3. Page Configurations
Page-specific settings in `page-configs.js`:
```javascript
'national-landing': {
    formAction: 'https://formbold.com/s/3nKg0',
    redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-usa',
    recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
    heroImage: 'https://raw.githubusercontent.com/...',
    aboutImage: 'https://github.com/...'
}
```

### 4. Form Validation
Spam protection and validation in `shared-scripts.js`:
- Honeypot fields
- Name pattern detection
- Automatic redirect on spam

---

## Workflow Summary

1. **Edit locally** - Update HTML/CSS/JS files in VS Code
2. **Test locally** - Open HTML files in browser to preview
3. **Commit changes** - Save to Git with descriptive message
4. **Create version tag** - Tag with semantic version (v1.0.4, v1.0.5, etc.)
5. **Push to GitHub** - Push commits and tags
6. **Update Squarespace** - Change version number in Code Injection
7. **Hard refresh** - Clear browser cache to see changes

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

---

## Common Tasks

- **Update site-wide colors** → Edit `shared-styles.css` `:root` variables
- **Change form submission** → Edit `page-configs.js` configurations
- **Add spam filter** → Update `shared-scripts.js` spam patterns
- **Create new page** → See [CREATING-PAGES.md](CREATING-PAGES.md)
- **Deploy changes** → See [DEPLOYMENT.md](DEPLOYMENT.md)
