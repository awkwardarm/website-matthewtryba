# Client Document Release Order — TRYBA MUSIC

A reference for which document to send the client at each stage, in order.

Each document is an unlisted page under a random base path — send the link, not
a PDF, so the client always sees the current version. See `docs/CREATING-PAGES.md`
for how those pages are built. This file is internal; it is not published.

> **This repo is public.** The base path below is written as `<base>/` — never
> replace that with the real value here or anywhere else in this repo; a
> committed value stops being a secret the moment it's pushed. The real base
> lives only in the `DOCS_BASE` Cloudflare Pages environment variable. To get
> the actual links: open `<base>/` itself (bookmark it — it's the index of
> everything below) or look up `DOCS_BASE` in the Cloudflare Pages dashboard.

## The path (in order)

1. **Services & Pricing** — `<base>/services-and-pricing/`
   - Send: right after the discovery call.
   - Purpose: the menu of ways to work together, as an ascending ladder. The client
     picks a starting point. Includes the credit structure and fine print.

2. **Creative Date Checklist** — Zoom: `<base>/creative-date-checklist-zoom/` ·
   In-Studio: `<base>/creative-date-checklist-in-studio/`
   - Send: as soon as a Creative Date is booked.
   - Which one: the **Zoom** version for a remote Creative Date; the **In-Studio**
     version for a session at the studio.
   - Purpose: how to prep for the Creative Date.

3. **Remote Vocal Recording** (one-sheet) — `<base>/remote-vocal-recording/`
   - Send: only after the client commits to an **Advanced Demo or higher** recording
     service *and* will be recording remotely.
   - Purpose: explains how remote recording works and what gear to buy (two paths).
     Pairs with the remote vocal recording premium, whose first-song rate folds in
     the one-time home-rig setup. (Not for standalone Vocal
     Production — that's an à la carte Studio Rates service, not a recording package.)

4. **Remote Vocal Session Tech Setup Guide** — `<base>/remote-vocal-tech-setup/`
   - Send: with the recording one-sheet, then referenced before every remote session
     once the one-time Remote Studio Setup is done.
   - Purpose: the ~10–15 minute per-session pre-flight the client runs themselves.

5. **Production Pathway** — `<base>/production-pathway/`
   - Send: included with a **Full Production** or **Gold Tier Demo**.
   - Purpose: the full five-phase roadmap from pre-production to release, with the
     payment schedule, contracts, and client homework. Carries the "You Are Here"
     marker for the client's current phase.

## Off-path — send only on request

- **Studio Rates** — `<base>/studio-rates/`
  - Standalone à la carte services: Mixing, Vocal Production, Additional Production,
    Mastering. Sits outside the production path; send only when a client specifically
    asks about individual services.

## Quick reference

```
discovery
  → Services & Pricing
  → Creative Date Checklist (Zoom / In-Studio)
  → (client commits)
  → Remote Vocal Recording + one-time Remote Studio Setup
  → Tech Setup Guide (before every remote session)
  → Production Pathway (with Full Production or Gold Tier Demo)

Studio Rates = off-path, on request.
```

## FAQs — send as needed

| Topic | Link |
|---|---|
| PROs, Copyrights & Royalty Splits | `<base>/faq-pros-copyrights-splits/` |
| Music Distribution & Master Audio | `<base>/faq-music-distribution/` |
| Independent Music Promotion | `<base>/faq-independent-music-promotion/` |
| Sync Licensing & Pitching | `<base>/faq-sync-licensing/` |

`<base>/` itself is an unlisted index of every one of these links.

## Not published

- **Profit & Loss Statement** — real revenue figures. Never goes on the site,
  under any URL. `<base>/` pages are unlisted, which is obscurity, not access
  control: a link can be forwarded.
- **This file** — internal sales sequencing, kept in the repo only.
