# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.29] - 2026-06-20

### Changed
- Switched the site's brand typeface from **Manrope** to **Outfit** (Google Fonts, OFL — free for commercial use).
  - Updated the `@import` (weights 400/500/600/700) and the `font-family` declarations on `body`, `.form-control`, and `.form-group` inputs in `shared-styles.css` to `"Outfit", system-ui, sans-serif`.
  - Updated the `:root` font-variable override in `squarespace-overrides.css` (`--heading-font-font-family`, `--body-font-font-family`, `--meta-font-font-family`) to `"Outfit", system-ui, sans-serif !important`, so Outfit wins over Squarespace's Adobe Fonts (Futura PT).

## [1.0.28] - 2026-06-20

### Fixed
- Manrope typeface was not taking effect on the live site. Squarespace's Design panel applies **Futura PT** (Adobe Fonts) site-wide via three `:root` custom properties (`--heading-font-font-family`, `--body-font-font-family`, `--meta-font-font-family`) that all component fonts inherit from, which out-ranked the `font-family` edits in `shared-styles.css`.
  - Added a brand-typeface override to `squarespace-overrides.css` that redefines those three `:root` variables to `"Manrope", system-ui, sans-serif !important`. This file loads after Squarespace's `site.css`, so the whole site now renders in Manrope without touching individual selectors.

## [1.0.27] - 2026-06-20

### Changed
- Switched the site's brand typeface from **Futura PT** to **Manrope** (Google Fonts, OFL — free for commercial use) in `shared-styles.css`.
  - Added `@import` for Manrope (weights 400/500/600/700) at the top of the stylesheet so the font loads without relying on Squarespace/Adobe Fonts.
  - Updated `font-family` on `body`, `.form-control`, and `.form-group` inputs to `"Manrope", system-ui, sans-serif`.

## [1.0.26] - 2026-05-09

### Changed
- Refined contact form double-submission prevention logic in `shared-scripts.js`.
- Improved button "Sending..." animation with a heartbeat check to ensure the status interval clears correctly if the button state changes or is removed.

## [1.0.25] - 2026-05-09

### Changed
- Added `scroll-animate-golden` animation class to testimonial cards on the national landing page.
- Refined formatting of the divider in the contact section for consistency.
- Added links field in forms
- Refined copy on landing page

## [1.0.24] - 2026-05-07

### Changed
- Updated buttons to use animations only on CTA buttons.
- Updated hero background to have subtle grdient from light top to blue background.
- Refactored css styles out of home page and into shared-styles.css for better maintainability and consistency across pages.
- Simplified form labels to "Name" and "Email"

## [1.0.23] - 2026-05-07

### Changed
- Refined button animations: Moved idle breathing and hover aura effects to pseudo-elements (`::before`, `::after`) for better performance and reliability.
- Updated various comments and formatting across CSS and JS files for better readability.
- Standardized comment blocks in `shared-styles.css` and `audio-player-tracks.js`.

## [1.0.22] - 2026-05-06

### Changed
- Submit button cycling dots now driven by JS `setInterval` instead of CSS keyframes — more reliable across all browsers
- Removed unused `dot-fade` keyframe and `.sending-dots` CSS

## [1.0.21] - 2026-05-06

### Added
- Idle breathing animation (`btn-idle-breathe`) on all `.btn` elements — subtle glow pulse at rest
- Sending state animation on submit button — animated dots (`Sending...`) while form submits
- `.btn--sending` class disables idle breathe and sets `cursor: not-allowed` during submission

### Changed
- Removed scroll-triggered button pop effect (unreliable on mobile) — buttons now simply breathe
- Removed `heroTextReveal` animation — hero section is now fully static for reliability on mobile
- Removed `box-shadow` from `.btn` transition to prevent it from fighting keyframe animations
- Local asset loader now checks `!== production domain` instead of `=== localhost`, enabling mobile network preview
- Scroll animate trigger moved to 90% from top (10% bottom margin) so cards animate sooner
- Stripped `scroll-animate` from all `<p>` elements — only headings and cards animate in

### Fixed
- Hero headline invisible on mobile due to CSS animation timing race on slow networks
- `rootMargin` had invalid `%px` units in IntersectionObserver — corrected to valid `%` values
- Invalid RGB value `rgba(26, 115, 256, 0)` corrected to `rgba(26, 115, 232, 0)`
- Stray orphan `}` in `shared-styles.css` that was breaking CSS parsing

## [1.0.20] - 2026-05-06

### Changed
- fixed padding on hero section to be symmetrical.

## [1.0.19] - 2026-05-06

### Changed
- Reduced hero section top padding

### Fixed
- Fixed syntax error in `assets/shared-styles.css`

## [1.0.18] - 2026-04-29

### Added
- Hero section animated gradient background with subtle `heroGradientShift` keyframe animation
- Hero CTA button gradient background with glow effect and `btn-aura-pulse` animation
- Hero text reveal animation (`heroTextReveal`) — h1 and subheadline fade in with slide-up effect
- Scroll-triggered animations via `initializeScrollAnimations()` using Intersection Observer
- Form invite animation — pulsing border on first input field (`initializeFormInviteAnimation()`)
- Contact form entrance animation — triggers when form scrolls into view (`initializeContactFormAnimation()`)
- Shared footer component — `renderSharedFooter()` renders consistent footer across all pages
- Golden shadow pulse animation for service cards and testimonial cards (`.scroll-animate-golden`)
- Scroll indicator SVG in landing page hero section
- `vscode-file:` protocol check for local preview asset loading
- New CSS variables: `--accent-secondary`, `--gradient-primary`

### Changed
- Increased h2 font size from 2.2rem to 3.5rem
- Enhanced `.btn` hover states with gradient background, glow, and transform effects
- Added `scroll-animate` and `scroll-animate-golden` classes to sections, cards, and headings across pages
- Hero content wrapped in `.container` with `z-index: 1` for proper layering over gradient overlay
- Various formatting and indentation cleanup across all edited files

### Fixed
- Form control invite animation now stops on focus to prevent distraction

## [1.0.17] - 2026-04-18

### Fixed
- `audio-player.js`: mobile playback state now restores correctly after page navigation
  - `saveState()` accepts an optional `currentTimeOverride` to preserve position when audio metadata hasn't loaded yet (avoids saving `0:00` when autoplay is blocked)
  - Card mode: play button only switches to pause icon after `play()` resolves successfully; `.catch()` now saves paused state with the original position
  - Ghost mode: `.catch()` passes the saved `currentTime` instead of `audio.currentTime` (which is `0` before metadata loads), preserving seek position on mobile

## [1.0.16] - 2026-04-17

### Added
- `audio-player.js`: persistent now-playing bar across page navigations via `localStorage`
  - Saves `{ trackIndex, currentTime, isPlaying }` on every page; restores bar automatically on load
  - "Ghost mode" plays audio without a visible card grid (for home, about pages)
  - Prev/Next skip buttons now work on all pages, not just the work/landing page
  - Double-init guard (`window._audioPlayerInitialized`) prevents duplicate initialization
- `about.html`: added `initAudioPlayer` call for local preview (was missing)

### Fixed
- `audio-player-tracks.js`: corrected missing `/` in artwork path for "Down With Me" track

## [1.0.15] - 2026-04-16

### Fixed
- `home-page.html`: changed form initialization from `DOMContentLoaded` to `window.onCDNReady` — `DOMContentLoaded` fires before CDN scripts load on Squarespace, leaving form `action` empty and causing 403 on submit

## [1.0.14] - 2026-04-16

### Fixed
- `shared-scripts.js`: disabled submit button and changed text to "Sending..." on form submit to prevent double-submission

## [1.0.13] - 2026-04-16

### Added
- `shared-scripts.js`: `hydrateCdnImages()` function — resolves `img[data-cdn]` attributes to full R2 CDN URLs on `DOMContentLoaded`, replacing scattered hardcoded CDN `src` values across all pages
- `shared-scripts.js`: `CDN_BASE` constant (`https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/`) as single source of truth for R2 base URL

### Changed
- All pages: hardcoded R2 CDN `src` attributes on `<img>` tags replaced with `data-cdn` relative paths — hydrated at runtime by `hydrateCdnImages()`
  - Affected: `about.html`, `home-page.html`, `work.html`, `landing-page-national.html`
- `shared-styles.css`: moved page-specific styles into shared CSS — `.sync-success`, `.thank-you-header`, `.video-wrapper`, `#sync .logos img` poster overrides
- `about.html`, `work.html`, `thank-you-home.html`, `thank-you.html`: removed large inline CSS blocks now covered by `shared-styles.css`
- `about.html`: replaced inline global CSS block with conditional local-preview asset loader script
- `audio-player-tracks.js`: hardcoded full R2 URLs replaced with `CDN_BASE + "..."` references
- `home-page.html`, `work.html`, `landing-page-national.html`: minor copy edits (grammar, phrasing, removed unnecessary hyphens)

### Removed
- `pages-thank-you/thank-you-studio-denver.html`: deleted (page no longer in use)

## [1.0.12] - 2026-04-16

### Changed
- `audio-player.js` / `audio-player.css`: now-playing bar content wrapped in `.np-inner` div
  - Bar background/border still spans full viewport width
  - Inner content capped at `max-width: 1100px` and centered with `margin: 0 auto` — prevents stretching on wide screens
- `audio-player.css`: responsive breakpoint rules updated to target `.np-inner` instead of `.now-playing-bar` for padding/gap adjustments
- `audio-player.css`: `#player-root` player grid capped at `max-width: 800px` and centered

## [1.0.11] - 2026-04-16

### Added
- `home-page.html`: album art in social proof section now clickable to play corresponding track via `data-play-title` attributes
- `home-page.html`: hidden `#player-root` mount point so `initAudioPlayer` initialises fully and wires play triggers
- `home-page.html`: audio player (`initAudioPlayer`) now called on page load for local preview
- `landing-page-national.html`: `initAudioPlayer` call added for local preview (was silently skipped)

### Changed
- All pages: local preview asset loading replaced with a JS `if` block checking `location.hostname` / `location.protocol` — no more manual commenting before deployment
- `audio-player.js` / `audio-player.css`: volume control converted from an inline horizontal slider to a popup panel
  - Volume icon is now a toggle button; clicking opens a vertical slider above the now-playing bar
  - Dismisses on outside click; `aria-pressed` reflects open/closed state
- `audio-player.css`: now-playing bar is now fully responsive
  - `.np-track` changed from fixed `width: 180px` to `flex: 0 1 180px` (can shrink)
  - At ≤600px: reduced padding/gap, track area shrinks to 130px
  - At ≤420px: further reduced padding/gap, track area shrinks to 100px, artist name hidden
- All pages: all images (album art, profile photos, testimonial headshots) migrated from GitHub raw and Squarespace CDN to Cloudflare R2 (`pub-869789a451fa44dbadf9e27cd445afa0.r2.dev`)
  - Album art: `images/album-art/`
  - Profile photos: `images/profile-photos/`
  - Review headshots: `images/client-review-profile-photos/`
- `landing-page-national.html`: album art R2 paths updated to `images/album-art/` subfolder (previously bare `images/`)

## [1.0.10] - 2026-04-15

### Added
- Prev/next skip buttons to now-playing bar (wraps around; navigates visible tracks only)

### Changed
- `work.html`: replaced Disco embed iframes with custom audio player (`<div id="player-root">`)
  - Removed inline `.audio-grid` / `.disco-embed` CSS (now owned by `audio-player.css`)
  - Added local preview asset block and `onCDNReady`-compatible init
- `landing-page-national.html`: Squarespace Code Injection footer loader now handles `initAudioPlayer` call; removed inline init script from page
- `landing-page-national.html`: page init uses `window.onCDNReady` instead of `DOMContentLoaded` to ensure `page-configs.js` is loaded before use

## [1.0.9] - 2026-04-15

### Added
- Custom modular audio player replacing Disco playlist embeds on `landing-page-national.html`
  - `assets/audio-player.css` — all player component styles (cards, now-playing bar, play triggers)
  - `assets/audio-player.js` — `initAudioPlayer(config)` function; renders cards, now-playing bar, wires album art triggers
  - `assets/audio-player-tracks.js` — single source of truth for all tracks (edit once, updates all pages)
- Spotify-style now-playing bar: fixed bottom bar that slides up on first play with track info, progress/seek, play/pause, and volume control (hidden on touch devices)
- Social proof click-to-play: clicking any album art image in the social proof section plays the corresponding track and opens the now-playing bar
- Audio files and artwork served from Cloudflare R2 bucket (`pub-869789a451fa44dbadf9e27cd445afa0.r2.dev`)
- Hidden group pattern for tracks: tracks with `group: "hidden"` render into an invisible DOM container (available for album art click-to-play without appearing in the player grid)
- Track list: 4 major label engineering tracks (Counting Stars, I Know Places, Why Try, Remedy), 2 hidden tracks (Maps, Burn), 2 independent artist tracks (Down With Me, Fearless)

### Changed
- Landing page audio section: replaced Disco embed iframes with `<div id="player-root"></div>` + player scripts
- Audio player accent color set to `#6196f8` (blue) throughout player UI
- Player cards redesigned as compact single-row layout (artwork + title/artist + play button)
  - Tightened card padding, artwork size, and gaps to reduce dead space
  - 2-column grid now holds down to 360px (collapses to 1-column only below that)
- All audio player assets (`audio-player.css`, `audio-player.js`, `audio-player-tracks.js`) served via jsDelivr CDN alongside all other site assets — no Squarespace file uploads needed
- Landing page `<head>` contains only local preview paths (commented out); all CDN URLs managed exclusively in Squarespace Code Injection

## [1.0.8] - 2026-04-02

### Fixed
- Re-tagged assets to fix broken CSS (force jsDelivr CDN cache refresh)

## [1.0.7] - 2026-04-02

### Changed
- Added `?source=home-page` query param to home page redirect URL in `page-configs.js`

## [1.0.6] - 2026-04-02

### Changed
- Disabled reCAPTCHA on home page
  - Commented out reCAPTCHA script, widget div, and JS initializer in `home-page.html`
- Added `home` page config to `page-configs.js`
  - New redirect URL: `https://www.matthewtryba.com/thank-you-home-98jkxco9012`
- Wired `home-page.html` to use `getPageConfig('home')`

## [1.0.5] - 2026-02-27

### Changed
- Copy edits across landing page and main pages
  - Updated hero subheadline, bullet points, and CTA button text in `landing-page-national.html`
  - Revised dream outcome and about section body copy in `landing-page-national.html`
  - Updated CTA section headline and copy in `landing-page-national.html` and `about.html`
  - Updated page heading and body copy in `about.html`
  - Simplified contact form subtitle in `landing-page-national.html`
- Disabled reCAPTCHA on national landing page
  - Commented out reCAPTCHA script, widget div, and JS initializer in `landing-page-national.html`
- Added `.social-proof p` note styling in `shared-styles.css`
  - Smaller font size (0.75rem), italic, muted opacity — styled as a contextual note below the section heading

## [1.0.4] - 2026-02-13

### Changed
- Removed budget dropdown from contact forms
  - Commented out budget field in `home-page.html` and `landing-page-national.html`
  - Reduces friction for potential leads
- Updated service cards grid layout in `home-page.html`
  - Changed from 4-column to 3-column layout after removing sync licensing service
- Improved testimonial quotation mark styling in `shared-styles.css`
  - Reduced quotation mark size from 3rem to 1.9rem for better proportions
  - Added closing quotation marks after quote-body text
  - Ensured consistent styling between opening and closing quotes
  - Refactored CSS to eliminate duplication

## [1.0.3] - 2026-01-02

### Added
- Light/dark mode toggle in `shared-styles.css`
  - Light mode active by default
  - Dark mode available via commenting/uncommenting `:root` color variables
  - Supports quick theme switching for testing and deployment

### Changed
- Updated documentation suite:
  - Created `docs/README.md` as navigation hub
  - Created `docs/OVERVIEW.md` with system architecture
  - Created `docs/CREATING-PAGES.md` with step-by-step page creation guide
  - Created `docs/DEPLOYMENT.md` with Git workflow and Squarespace deployment
  - Removed outdated documentation files (CSS-ORGANIZATION.md, SQUARESPACE-DEPLOYMENT.md, LOCAL-PREVIEW.md)

## [1.0.2] - 2026-01-02

### Changed
- Converted `home-page.html` to use centralized asset system
  - Reduced inline CSS from ~200 lines to ~75 lines
  - Now uses `shared-styles.css` with page-specific overrides
  - Improved maintainability and consistency across site

## [1.0.1] - 2026-01-02

### Changed
- Reorganized asset loading in HTML pages
  - Moved `<link>` and `<script>` tags from bottom of `<body>` to `<head>` section
  - Improved deployment management with centralized asset references
  - Added clear comment instructions for local vs production paths

### Fixed
- Hero image loading issue on landing pages
  - Added local script paths (`../assets/`) alongside Squarespace paths
  - Properly loads `page-configs.js` and `shared-scripts.js` for both local preview and production

## [1.0.0] - 2026-01-01

### Added
- Initial versioned release
- Centralized asset system with jsDelivr CDN
- `shared-styles.css` for consistent styling across all pages
- `shared-scripts.js` for form validation and spam detection
- `page-configs.js` for page-specific configuration management
- Google reCAPTCHA integration (site key: 6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a)
- Google Analytics/Ads tracking (AW-17389653886)
- Formbold form submission integration

### Technical
- Squarespace deployment via Code Injection with jsDelivr CDN
- Git version tags for controlled deployments and cache management
- DOMContentLoaded event pattern for reliable JavaScript initialization

---

## Version Tag Format

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., v1.0.3)
- **MAJOR**: Breaking changes or major redesigns
- **MINOR**: New features, non-breaking changes
- **PATCH**: Bug fixes, documentation updates, minor tweaks

## Deployment Reference

Each version tag corresponds to a specific jsDelivr CDN URL:
```
https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.3/assets/
```

Update the version in Squarespace Code Injection to deploy changes.
