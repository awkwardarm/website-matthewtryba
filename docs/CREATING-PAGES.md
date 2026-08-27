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

## Client Documents (`/docs/`)

The client-facing documents — rate cards, service menus, prep checklists, FAQs —
live in `src/docs/` and publish as **unlisted** pages at `/docs/<slug>/`. They are
sent to clients as links instead of PDF attachments, so an edit here updates what
everyone already holds a link to. `docs/CLIENT-DOCUMENT-RELEASE-ORDER.md` says
which document to send when.

> **Unlisted is not private.** `noindex` keeps these out of Google and out of
> `sitemap.xml`, but anyone with the link can read and forward it. Never put
> financials, contracts, or client-specific terms in `src/docs/`.

### Adding a document

Create `src/docs/my-document.html` with three lines of front matter:

```yaml
---
title: "My Document | Matthew Tryba"
description: "One sentence, quoted — a colon or a pipe will break unquoted YAML."
updated: "August 26, 2026"
---
```

Everything else comes from `src/docs/docs.11tydata.js`: the layout, `noindex`,
the `/docs/<slug>/` permalink, and `docPage: true` — which is what makes
`base.njk` load `assets/doc.css` and render the "Save as PDF" / last-updated bar.

Then write the body as a single `<article class="doc">`. Don't use `<main>` —
`base.njk` already provides the page's one `<main>`.

### What `assets/doc.css` gives you

Loaded only on these pages. Shared document furniture:

| | |
|---|---|
| `.doc` | the 8.5in paper column. Override `--doc-width` on `body` for landscape — see `production-pathway.html` |
| `.doc-frame` + `.hdr-space` / `.ftr-space` | table scaffold that reserves running-header space on each printed page |
| `.running-hdr` / `.running-ftr` | hidden on screen, fixed on paper so they repeat per page |
| `.qa`, `.q-mark`, `.section-rule`, `.callout-example` | the FAQ card components |
| `.keep` | put on anything that must not split across a page break |

The print block hides the site header, footer, and the actions bar, so
Cmd+P → Save as PDF produces a clean document. **Always check print preview** —
these pages are still deliverables people print.

`--doc-width` is why the actions bar lines up with the sheet; set it on `body`,
not on `.doc`, since the bar is a sibling.

### Re-importing a redesign from Claude Design

The repo is the source of truth — edit the HTML here. The exception is reworking
a document's design on the Design canvas, which you pull back with:

```bash
python3 scripts/import-design-doc.py
```

It reads the unzipped Design export (`~/Downloads/Documents - TRYBA MUSIC`, or
`DESIGN_EXPORT=/some/path`) and **overwrites** every file it knows about in
`src/docs/`, so commit first. It strips the canvas wrapper, converts
`<image-slot>` elements to plain `<img>`, removes the pixel width/height the
editor stamps on anything you dragged a resize handle over, and rewrites asset
paths to `/images/docs/`. Those strips are heuristic — read the diff.

New images go in `images/docs/`.

### Gotchas

- **Quote your front matter.** `templateEngineOverride: false` in the data file
  keeps a stray `{{` in document text from breaking the build, but YAML still
  parses the front matter, and both `:` and `|` are common in these titles.
- **No Nunjucks in document bodies.** Same override — `{{ updated }}` will not
  interpolate inside a document. The layout renders it instead.
- **Flex rows and mobile.** These layouts were built for paper. `doc.css` sets
  `min-width: 0` on `.doc` descendants below 700px so flex/grid children can
  shrink; without it a label-and-price row pushes the whole sheet sideways.
- **No audio player.** `base.njk` skips it on `docPage` pages.
- **Wide tables reflow, they don't shrink.** The Production Pathway roadmap groups its grid cells into `.pp-row` wrappers set to `display: contents`, so they are invisible to the desktop grid and to print, and become one card per phase below 720px. If you add another wide table, copy that pattern rather than letting a grid squeeze — a grid with `overflow: hidden` clips text silently as it narrows.
- **Check print after any layout change.** `--headless --print-to-pdf` in Chrome, then compare the file size against a copy made before the change. Identical size with a few differing bytes is just the embedded `CreationDate`.

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
