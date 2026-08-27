# Documentation

Complete guide to managing and deploying the Matthew Tryba website (Eleventy on Cloudflare Pages).

## 📚 Documentation Structure

### [OVERVIEW.md](OVERVIEW.md) - Start Here
**Read this first to understand how everything works**
- System architecture (Eleventy → Cloudflare Pages, R2, Google Sheets, Resend, Stripe)
- File structure
- Key concepts (page configs, form pipeline, tools download flow)
- Client documents under a randomized base path

### [CREATING-PAGES.md](CREATING-PAGES.md)
**Step-by-step guide to creating new pages**
- Front matter and the shared layout
- Adding form configurations
- Testing locally
- Nav, sitemap, and noindex behavior
- Client documents: adding one, what `doc.css` provides, re-importing from Claude Design

### [CLIENT-DOCUMENT-RELEASE-ORDER.md](CLIENT-DOCUMENT-RELEASE-ORDER.md)
**Which client document to send at each stage** — internal, not published
- The send sequence from discovery call through release
- Links for every document under the current base path
- What is deliberately not on the site

### [DEPLOYMENT.md](DEPLOYMENT.md)
**Complete deployment workflow**
- Push-to-deploy via Cloudflare Pages
- Local development commands
- Tools signup email (Resend) setup
- Rollback procedures

---

## Quick Start

**Never deployed before? It's just git:**

1. Edit files, commit, push to `main` → live in ~1 minute
2. Push any other branch → automatic preview URL (`*.pages.dev`)
3. Read [OVERVIEW.md](OVERVIEW.md) to understand the moving parts

---

## Local Preview

```bash
npm install        # once
npm run serve      # http://localhost:8080, live-reloads on save
```

> The Pages Function (`/api/tools-signup`) doesn't run under `npm run serve` — use `npx wrangler pages dev _site` if you need to test it locally, or use a branch preview deployment.

---

## Common Questions

**How do I change site colors?**
→ Edit `assets/shared-styles.css` `:root` variables, push

**How do I add a new landing page?**
→ See [CREATING-PAGES.md](CREATING-PAGES.md)

**How do I update my live site?**
→ Commit and push to `main` — that's it

**Something broke, how do I revert?**
→ Cloudflare Pages dashboard → Deployments → pick a previous one → Rollback (instant). Or `git revert` and push.

**Where are my images?**
→ Repo `images/` folder (served at `/images/`); audio, artwork, and tool downloads live in the Cloudflare R2 bucket

**How do I send a client my rates or a checklist?**
→ Send the link, not a PDF. Bookmark the client-documents index (its URL is the `DOCS_BASE` value in the Cloudflare Pages dashboard, not written anywhere in this repo) — it lists every document, and the page always shows the current version. See [CLIENT-DOCUMENT-RELEASE-ORDER.md](CLIENT-DOCUMENT-RELEASE-ORDER.md) for which to send when.

**Are the client-document pages private?**
→ No — unlisted, at an unguessable random base path. They're hidden from search engines and the sitemap, and the path can't be guessed, but anyone who's been sent a link can still read and forward it. Don't put financials or contracts there.

**Why didn't a tools signup email send?**
→ Health check: `https://www.matthewtryba.com/api/tools-signup` — then Resend dashboard → Logs

---

## History

Until mid-2026 the site was hosted on Squarespace (assets injected via jsDelivr + Code Injection). Reference copies of that setup live in `migration-reference/` and `pages-saved-html/`. See `TODO.md` in the repo root for the remaining wind-down tasks.
