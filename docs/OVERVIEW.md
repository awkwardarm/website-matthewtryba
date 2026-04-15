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
│   ├── page-configs.js             # Page-specific settings
│   ├── audio-player.css            # Audio player styles (landing page)
│   ├── audio-player.js             # Audio player logic (initAudioPlayer)
│   └── audio-player-tracks.js     # Track list — single source of truth
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

There are **two separate systems** for loading assets:

#### 1. Global Site Assets — jsDelivr CDN (via Code Injection)

Loaded on every page via **Settings → Advanced → Code Injection**:

**Header Injection:**
```html
<!-- Global CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.8/assets/shared-styles.css">

<!-- Squarespace-specific overrides -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.8/assets/squarespace-overrides.css">
```

**Footer Injection:**
```html
<!-- Global JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.8/assets/shared-scripts.js"></script>
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.8/assets/page-configs.js"></script>
```

#### 2. Page-Specific Assets — Squarespace File Storage (`/s/` paths)

Assets uploaded directly to Squarespace via **Settings → Advanced → File Storage** (or Developer Tools). These are referenced as `/s/filename` and are embedded directly in a page's Code Block HTML.

**Audio player assets (landing page):**
```html
<!-- For Squarespace (jsDelivr CDN) -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.9/assets/audio-player.css">
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.9/assets/audio-player-tracks.js"></script>
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.9/assets/audio-player.js"></script>
<!-- For local preview (comment out CDN lines above and uncomment these) -->
<!-- <link rel="stylesheet" href="../assets/audio-player.css"> -->
<!-- <script src="../assets/audio-player-tracks.js"></script> -->
<!-- <script src="../assets/audio-player.js"></script> -->
```

All audio player assets now use jsDelivr CDN — same pattern as `shared-styles.css`. Bump the version tag in these URLs whenever the audio player files change.

### Local Development (Your Computer)

Comment out the CDN lines and uncomment the `../assets/` lines in the landing page `<head>` for local preview. Re-comment before pasting into Squarespace.
```

---

## External Services

| Service | Purpose | Details |
|---|---|---|
| **jsDelivr CDN** | Serves global site assets | `cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@{version}/assets/` |
| **Cloudflare R2** | Audio files and artwork for the audio player | `pub-869789a451fa44dbadf9e27cd445afa0.r2.dev` — MP3s at `/audio/`, artwork at `/images/` |
| **Squarespace** | CMS and site hosting | File Storage (`/s/`) for page-specific assets |
| **Formbold** | Form submissions | `formbold.com/s/3nKg0` |
| **Google Ads / Analytics** | Tracking | Tag: `AW-17389653886` |

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
- **Add/remove audio tracks** → Edit `audio-player-tracks.js`, then upload updated file to Squarespace File Storage
- **Create new page** → See [CREATING-PAGES.md](CREATING-PAGES.md)
- **Deploy changes** → See [DEPLOYMENT.md](DEPLOYMENT.md)
