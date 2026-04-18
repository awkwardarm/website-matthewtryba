# Website Architecture Overview

## How the System Works

Your website uses a **centralized asset system** where CSS, JavaScript, and configurations are shared across all pages. This means you can update styling or functionality in one place and it automatically applies everywhere.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                    │
│  (version controlled source of truth)                   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Git Push + Version Tag
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    jsDelivr CDN                         │
│  CSS, JS, audio player assets                           │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ HTTP Request
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Squarespace Code Injection                 │
│  (loads all CSS/JS globally on every page)              │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ Applied to
                   ▼
┌─────────────────────────────────────────────────────────┐
│                    Your Web Pages                       │
│  (HTML content in Code Blocks)                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Cloudflare R2                          │
│  (serves audio MP3s and artwork images)                 │
│  pub-869789a451fa44dbadf9e27cd445afa0.r2.dev            │
└─────────────────────────────────────────────────────────┘
       ↑ CDN_BASE in shared-scripts.js points here
       ↑ Referenced by audio-player-tracks.js track URLs
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

All assets — including the audio player — are loaded globally on every page via **Settings → Advanced → Code Injection**. A single `CDN_VERSION` value controls which version of all files is loaded.

**Header Injection:**
```html
<!-- Set CDN version and inject CSS -->
<script>window.CDN_VERSION = 'v1.0.13';</script>
<script>
  (function(){
    var b = 'https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@' + window.CDN_VERSION + '/assets/';
    ['shared-styles.css','squarespace-overrides.css','audio-player.css'].forEach(function(f){
      document.head.insertAdjacentHTML('beforeend','<link rel="stylesheet" href="'+b+f+'">');
    });
  })();
</script>
```

**Footer Injection:**
```html
<!-- Load JS in order, then initialize audio player -->
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

To deploy a new version, update `CDN_VERSION` in the header injection. There is no per-page script loading for the audio player — it initializes globally wherever a `#player-root` element exists.

### Audio Files and Artwork — Cloudflare R2

Audio MP3s and album artwork are stored in **Cloudflare R2** (not GitHub). The base URL is defined once in `shared-scripts.js`:

```javascript
const CDN_BASE = 'https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/';
```

Track URLs in `audio-player-tracks.js` use `CDN_BASE` as a prefix:
- Audio files: `CDN_BASE + 'audio/Song-Title.mp3'`
- Artwork: `CDN_BASE + 'images/album-art/Cover.jpg'`

Uploading new audio or artwork goes directly to R2 — no version bump needed.

### Local Development (Your Computer)

The landing page HTML auto-detects `localhost` / `file:` protocol and loads local `../assets/` files via `document.write`. No manual commenting/uncommenting needed.

---

## External Services

| Service | Purpose | Details |
|---|---|---|
| **jsDelivr CDN** | Serves all CSS/JS assets (versioned) | `cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@{version}/assets/` |
| **Cloudflare R2** | Audio MP3s and artwork images | `pub-869789a451fa44dbadf9e27cd445afa0.r2.dev` — MP3s at `/audio/`, artwork at `/images/` |
| **Squarespace** | CMS and site hosting | Code Injection for global asset loading |
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
- **Add/remove audio tracks** → Edit `audio-player-tracks.js`, commit with a new version tag, update `CDN_VERSION` in Squarespace Code Injection; upload new MP3/artwork files directly to Cloudflare R2
- **Create new page** → See [CREATING-PAGES.md](CREATING-PAGES.md)
- **Deploy changes** → See [DEPLOYMENT.md](DEPLOYMENT.md)
