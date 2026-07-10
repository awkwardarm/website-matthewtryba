# Website Architecture Overview

## How the System Works

The site is a **static Eleventy build hosted on Cloudflare Pages**. Every page in `src/` shares one layout (`src/_includes/base.njk`) which provides the `<head>`, header/nav, footer, and script loading. Shared CSS/JS lives in `assets/` and is served by the site itself — no external CDN loader.

> **History:** until mid-2026 the site was hosted on Squarespace, with these assets injected via jsDelivr + Code Injection. That architecture is retired; reference copies of the old Squarespace custom CSS and Code Injection live in `migration-reference/`, and saved copies of the final Squarespace-rendered pages live in `pages-saved-html/`.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    GitHub Repository                     │
│  (source of truth: src/ pages + assets/ + images/)      │
└──────────────────┬──────────────────────────────────────┘
                   │  git push to main
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  Cloudflare Pages                        │
│  runs `npx @11ty/eleventy` → serves _site/ globally      │
│  www.matthewtryba.com                                    │
└──────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Cloudflare R2                           │
│  audio MP3s + album artwork + tool downloads             │
│  pub-869789a451fa44dbadf9e27cd445afa0.r2.dev             │
└──────────────────────────────────────────────────────────┘
       ↑ CDN_BASE in shared-scripts.js (data-cdn images)
       ↑ track URLs in audio-player-tracks.js
```

---

## File Structure

```
website-matthewtryba/
├── src/                             # Pages (Eleventy input)
│   ├── _includes/base.njk          # Shared layout (head, nav, footer, scripts)
│   ├── index.html                  # /            home
│   ├── about.html                  # /about
│   ├── work.html                   # /work
│   ├── faq.html                    # /faq
│   ├── tools.html                  # /tools (signup form)
│   ├── welcome-2.html              # /welcome-2 (Google Ads landing page)
│   ├── thank-you-*.html            # obfuscated thank-you pages (noindex)
│   ├── production-tools-download-*.html  # download + donate page (noindex)
│   ├── 404.html / sitemap.njk / robots.txt / _redirects
│
├── assets/                          # Shared resources (served at /assets/)
│   ├── shared-styles.css           # Global CSS
│   ├── site-chrome.css             # Header/nav/footer styles
│   ├── shared-scripts.js           # Forms, spam filter, GCLID, footer, animations
│   ├── page-configs.js             # Form endpoints, redirects, downloads, donate
│   ├── audio-player.css/.js        # Custom audio player
│   └── audio-player-tracks.js      # Track list — single source of truth
│
├── images/                          # Served at /images/
├── docs/                            # Documentation
├── migration-reference/             # Old Squarespace CSS + Code Injection (reference)
└── pages-saved-html/                # Saved Squarespace-rendered pages (reference)
```

---

## External Services

| Service | Purpose | Details |
|---|---|---|
| **Cloudflare Pages** | Hosting + deploys | builds on push to `main` |
| **Cloudflare R2** | Audio MP3s, artwork, tool downloads | `pub-869789a451fa44dbadf9e27cd445afa0.r2.dev` |
| **Formbold** | Form submissions | endpoints in `assets/page-configs.js` |
| **Stripe** | Donations (Payment Link) | link in `assets/page-configs.js` |
| **Resend** | Sends the tools download email | `RESEND_API_KEY` env var in the Pages project |
| **Google Ads / gtag** | Tracking + lead conversions | tag `AW-17389653886` in `base.njk`; conversion events on thank-you pages |

---

## Key Concepts

### Page configurations
Per-page dynamic values (form endpoints, redirect URLs, download/donate links) live in `assets/page-configs.js`. Pages read them in a `window.onCDNReady` callback, which the layout invokes after all scripts load.

### Form pipeline
Forms post to Formbold. `shared-scripts.js` adds spam protection (honeypot + name blocklist) and Google Ads click-id attribution (`gclid` captured to a 90-day cookie, injected as hidden fields). After submit, users are redirected to an obfuscated thank-you page, which fires the Google Ads conversion event.

### Tools download flow
`/tools` signup form → Pages Function `/api/tools-signup` (`functions/api/tools-signup.js`), which records the submission in Formbold, **emails the download link via Resend** (verifying the address is real), and always redirects to `/thank-you-tools` — the download page is never reachable directly from the form, even if the email send fails, so a fake address can't be used to grab the files. The email links to the obfuscated download page (`noindex`) with download buttons + Stripe donate link.

### data-cdn images
`<img data-cdn="images/...">` is resolved by `hydrateCdnImages()` to the R2 bucket URL. Images under `/images/` in the repo are served by the site directly.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the deploy workflow and [CREATING-PAGES.md](CREATING-PAGES.md) for page creation.
