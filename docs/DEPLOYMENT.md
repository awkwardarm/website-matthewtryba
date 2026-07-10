# Deployment Guide

## Overview

The site is a static **Eleventy** build hosted on **Cloudflare Pages**. Deployment is automatic:

1. Edit files locally
2. Commit
3. Push to `main`
4. Cloudflare Pages builds and deploys — live in ~1 minute

That's it. No version tags, no jsDelivr, no Squarespace Code Injection. (The old Squarespace workflow is preserved for reference in `migration-reference/`.)

---

## Project Layout

| Path | What it is |
|---|---|
| `src/` | Page content (one file per page, front matter sets title/description/URL) |
| `src/_includes/base.njk` | Shared layout: `<head>`, header/nav, footer, script loading, gtag |
| `src/_redirects` | Cloudflare Pages redirect rules (`/home` → `/`, etc.) |
| `assets/` | CSS/JS shared across pages (unchanged from before) |
| `assets/site-chrome.css` | Header/nav/footer styles (replaces what Squarespace rendered) |
| `assets/page-configs.js` | Form endpoints, redirect URLs, download + donate links |
| `images/` | Image assets (served from the site itself) |
| `.eleventy.js` | Build config |

Media (audio MP3s, album artwork) still lives in **Cloudflare R2** and is referenced via `data-cdn` attributes — unchanged.

---

## Local Development

```bash
npm install        # once
npm run serve      # http://localhost:8080, live-reloads on save
npm run build      # writes the production site to _site/
```

---

## Common Tasks

### Edit a page
Edit the file in `src/` (e.g. `src/about.html`), commit, push.

### Add a page
1. Create `src/my-page.html` with front matter:
   ```yaml
   ---
   layout: base.njk
   title: My Page | Matthew Tryba
   description: One-sentence description for search engines.
   permalink: /my-page/
   ---
   ```
2. Page content goes below the front matter (just the sections — the layout adds nav/footer).
3. If it needs a form, add a config block in `assets/page-configs.js` and an `onCDNReady` script (copy the pattern from `src/tools.html`).
4. Add a nav link in `src/_includes/base.njk` if it belongs in the menu.

### Update form endpoints / download links / donate link
Edit `assets/page-configs.js`. That file is the single source of truth for Formbold endpoints, thank-you redirects, tool download URLs, and the Stripe donate link.

### Add or change audio tracks
Edit `assets/audio-player-tracks.js`; upload new MP3s/artwork to the R2 bucket. No version bump needed — just push.

### Hide a page from search engines
Add `noindex: true` to its front matter (the thank-you and download pages do this). It's automatically excluded from `sitemap.xml` too.

---

## Cloudflare Pages settings (one-time setup)

- **Build command:** `npx @11ty/eleventy` (or `npm run build`)
- **Output directory:** `_site`
- **Production branch:** `main`
- Custom domains: `www.matthewtryba.com` (+ apex redirect to www via Cloudflare Bulk Redirects)

Every push to any other branch gets its own preview URL (`*.pages.dev`) — use those to review changes before merging to `main`.

### Tools signup email (one-time setup)

The `/tools` form posts to a Pages Function (`functions/api/tools-signup.js`) that emails the download link via **Resend** (free tier: 100 emails/day). To activate it:

1. Sign up at [resend.com](https://resend.com) and verify `matthewtryba.com` as a sending domain (it gives you a few DNS records to add — takes 2 minutes once DNS is on Cloudflare).
2. Create an API key in Resend.
3. In the Cloudflare Pages project: **Settings → Environment variables** → add `RESEND_API_KEY` with that key (Production + Preview).

**This is required before sending traffic to `/tools`.** The download page is intentionally never reachable directly from the signup form — a fake or typo'd email gets nothing, which is what makes the address list real. Until the key is configured, submitters land on "check your email" and no email arrives (the failure is logged in the Pages Function logs, and the thank-you page points them to the contact form as a manual fallback). Submissions are still recorded in Formbold either way.

> Note: Pages Functions don't run under `npm run serve` (that's Eleventy only). To test the function locally: `npx wrangler pages dev _site`.

---

## Rollback

Cloudflare Pages keeps every deployment. In the Pages dashboard, open **Deployments**, pick a previous one, and click **Rollback** — instant. (Or `git revert` the bad commit and push.)
