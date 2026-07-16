# Creating New Pages

## Quick Start

1. Create a file in `src/` with front matter
2. Write the page content (sections only — the layout adds nav/footer)
3. If it has a form: add a config in `assets/page-configs.js` + an init script
4. Add a nav link if it belongs in the menu
5. Commit and push — done

---

## Step 1: Create the File

Create `src/my-page.html`:

```yaml
---
layout: base.njk
title: My Page | Matthew Tryba
description: One-sentence description for search engines and social shares.
permalink: /my-page/
---
```

Front matter fields:

| Field | What it does |
|---|---|
| `layout: base.njk` | Wraps the page in the shared layout (head/meta, gtag, header nav, footer, scripts) — always include |
| `title` | Browser tab, `<title>`, and og:title |
| `description` | Meta description and og:description |
| `permalink` | The URL, with trailing slash (e.g. `/my-page/`) |
| `noindex: true` | Optional — hides from search engines AND excludes from sitemap.xml (used for thank-you and download pages) |

## Step 2: Write the Content

Below the front matter, write plain HTML sections. Copy patterns from an existing page:

- **Landing page** → `src/welcome-2.html` (hero bullets, social proof, testimonials, audio player, contact form)
- **Simple content page** → `src/about.html` or `src/faq.html`
- **Thank-you page** → `src/thank-you-tools.html`

Useful building blocks (styled in `assets/shared-styles.css`):
- `.hero`, `.page-hero` — page headers
- `.container` — centered max-width wrapper
- `.btn` / `.btn-secondary` — buttons (inside a `.cta-section`, use plain `.btn` — `.btn-secondary`'s forced white text is invisible on the CTA's white button)
- `.cta-section` — blue call-to-action banner
- `.testimonial-grid` / `.testimonial-card`
- `.video-wrapper` — responsive YouTube embed
- `<img data-cdn="images/...">` — image served from the R2 bucket
- `<div id="player-root"></div>` — mounts the audio player

Page-specific styles go in a `<style>` block at the top of the content. Don't duplicate shared CSS — put reusable styles in `shared-styles.css`.

## Step 3: Forms (if needed)

1. Add a config block in `assets/page-configs.js`:

```javascript
'my-page': {
    formAction: '/api/contact?page=my-page',   // also add 'my-page' to PAGES in functions/api/contact.js
    redirectUrl: location.origin + '/thank-you-8399akkgak3214?source=my-page'
},
```

- Use `location.origin` so redirects also work on `*.pages.dev` previews
- Image paths are site-relative (e.g. `/images/profile-photos/...`)

2. Copy the `<form id="contact-form">` markup from an existing page. **Keep the honeypot field** — spam filtering, validation, and Google Ads gclid attribution are all wired automatically by `shared-scripts.js`.

3. Add the init script at the bottom of the page content:

```html
<script>
    window.onCDNReady = function() {
        const pageConfig = getPageConfig('my-page');
        document.getElementById('contact-form').action = pageConfig.formAction;
        document.getElementById('form-redirect').value = pageConfig.redirectUrl;
    };
</script>
```

> Both Functions log submissions to the "Website Form Submissions" Google Sheet and send notification emails via Resend — see `functions/api/contact.js` and `lib/google-sheets.js`. The tools signup form has its own Function (`/api/tools-signup`) because it also emails the download link to the submitter.

## Step 4: Google Ads Conversion Tracking (landing pages)

The site-wide Google tag (`AW-17389653886`) loads from the layout on every page — nothing to add per page.

**Source parameter** — every form redirect must carry a unique `?source=` so conversions are attributable:

- Format: `landing-page-[campaign-identifier]`
- Examples: `landing-page-la`, `landing-page-vocal-production`, `landing-page-summer-promo-2026`

**Conversion event** — the thank-you pages fire it on load:

```html
<script>
    gtag('event', 'conversion', {'send_to': 'AW-17389653886/DTy2CMuBkZwbEP6ehORA'});
</script>
```

Reuse the existing thank-you pages (`/thank-you-8399akkgak3214?source=...`) when possible. If you create a new thank-you page, copy that snippet into it and give it `noindex: true`.

**In Google Ads** (per new campaign): Tools → Measurement → Conversions → create a conversion action matching the thank-you URL (`URL contains` your source parameter). Test-submit and confirm the conversion appears within 24 hours.

## Step 5: Navigation

To add the page to the site menu, edit the nav in `src/_includes/base.njk` — one `<a>` line, following the existing pattern with the active-state condition.

## Step 6: Test and Deploy

```bash
npm run serve     # http://localhost:8080/my-page/
```

Check: renders correctly, mobile width, nav/footer present, form `action` points at the right endpoint (inspect in DevTools), redirect URL carries the right `?source=`.

Update `docs/CHANGELOG.md`, then commit and push:
- Push to a **branch** for a `*.pages.dev` preview URL
- Push/merge to **`main`** to go live (~1 minute)

New pages are automatically included in `sitemap.xml` unless `noindex: true`.

---

## Troubleshooting

**Form doesn't submit / wrong destination:**
- Verify the page name in `getPageConfig('page-name')` exactly matches the key in `page-configs.js`
- Check browser console for JavaScript errors

**Images don't load:**
- Repo images: path starts with `/images/` and the file exists in the repo
- R2 images: `data-cdn` value matches the object key in the bucket

**Styles look wrong:**
- Hard refresh (browsers cache aggressively right after a deploy)
- Confirm the page uses shared classes rather than redefining them
