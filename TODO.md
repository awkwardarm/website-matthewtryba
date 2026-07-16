# TODO — Domain & Migration Wrap-Up

Squarespace site plan and domain auto-renew are cancelled; **both stay active until mid-August 2026**. Everything below should be finished well before then.

---

## 1. Point trybamusic.com at the new site (via Cloudflare)

Currently registered at **Hover** and pointing at Squarespace — it will silently break when the Squarespace plan lapses in mid-August.

- [ ] **Add the zone to Cloudflare**
  - Cloudflare dashboard → **Add a site** → `trybamusic.com` → **Free** plan
  - Review the DNS records Cloudflare imports; **delete any Squarespace records** (A records to Squarespace IPs, `ext-cust.squarespace.com` CNAMEs, etc.)
- [ ] **Add placeholder DNS records** so Cloudflare's proxy answers for the domain
  - `A` record, name `@`, IPv4 `192.0.2.1`, **Proxied** (orange cloud ON)
  - `A` record, name `www`, IPv4 `192.0.2.1`, **Proxied**
  - (`192.0.2.1` is a reserved dummy IP — the proxy intercepts requests before it is ever contacted)
- [ ] **Add the redirects** — extend the existing Bulk Redirect list (the one that handles `matthewtryba.com` → `www`):
  - Source `trybamusic.com/*` → Target `https://www.matthewtryba.com/*` — 301, subpath matching ✓, preserve query string ✓
  - Source `www.trybamusic.com/*` → Target `https://www.matthewtryba.com/*` — 301, subpath matching ✓, preserve query string ✓
  - (If the Bulk Redirect list won't accept the new hostnames, use a **Single Redirect rule** in the `trybamusic.com` zone instead: hostname equals `trybamusic.com` OR `www.trybamusic.com` → dynamic redirect to `concat("https://www.matthewtryba.com", http.request.uri.path)`, 301, preserve query string.)
- [ ] **Switch nameservers at Hover**
  - Hover dashboard → `trybamusic.com` → Nameservers → replace with the two nameservers Cloudflare assigned when the zone was added
  - Propagation: minutes to a few hours
- [ ] **Verify:** `trybamusic.com`, `www.trybamusic.com`, and a deep link like `trybamusic.com/tools` all 301 to the matching `www.matthewtryba.com` page
- [ ] *(Optional, anytime)* **Transfer the registration** from Hover to Cloudflare for at-cost renewal (~$10/yr): Hover → unlock domain → request auth/EPP code → Cloudflare → **Domain Registration → Transfer Domains** → enter code (same flow as section 2)

## 2. Transfer matthewtryba.com registration (waiting on auth code)

DNS is already on Cloudflare, so the transfer causes **zero downtime** — it only changes who bills for the domain. Auto-renew at Squarespace is already off; the transfer must complete **before mid-August**.

- [x] Receive the **transfer authentication (EPP) code** from Squarespace (requested; domain already unlocked)
- [x] Cloudflare dashboard → **Domain Registration → Transfer Domains** → `matthewtryba.com` should be listed as eligible
- [x] Enter the auth code and pay (~$10–11 — one year of .com at wholesale cost, **added on top of** the current expiration date)
- [x] Back in Squarespace → Domains: if a pending-transfer approval option appears, **approve it** to complete immediately; otherwise it auto-completes within ~5 days
- [x] After completion: confirm **auto-renew is ON** in Cloudflare → Domain Registration (WHOIS privacy is on by default)
- [x] ⚠️ Do **not** edit the registrant/WHOIS contact info before the transfer — contact changes trigger a 60-day ICANN transfer lock

## 3. Before the Squarespace plan lapses (deadline: mid-August)

- [x] **Export old form submissions** from Squarespace (each form's storage → export CSV) — they are unrecoverable after the plan ends
- [x] Confirm sections 1 and 2 are done, then let the plan lapse — nothing else references Squarespace

## 4. Email delivery (Resend) — ✅ DONE (2026-07-10)

- [x] `matthewtryba.com` verified as sending domain in Resend
- [x] End-to-end test passed: `/tools` form → "Check Your Email!" → email from `tools@matthewtryba.com` → download page
- [x] `RESEND_API_KEY` set as a Secret in both **Production** and **Preview** (separate keys, so either can be revoked in Resend independently)
- Health check anytime: `https://www.matthewtryba.com/api/tools-signup` → `"resendKeyConfigured": true`

## 5. Forms → Google Sheets migration — ✅ DONE (2026-07-15)

- [x] All forms (home, `/welcome-2`, `/tools`) log to the **"Website Form Submissions"** Google Sheet and email `matthew@matthewtryba.com` via Resend with custom subjects — Formbold removed from the code entirely
- [x] Google service-account env vars (`GOOGLE_SA_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`, `SHEETS_ID`) set in Production + Preview; end-to-end test passed (sheet row + email)
- [x] Legacy history consolidated into the sheet: Squarespace tools contacts + all three Formbold exports (344 rows)
- [x] Formbold email notifications turned off — nothing left to do; the subscription just lapses **2026-09-02**
- Health check anytime: `https://www.matthewtryba.com/api/tools-signup` → `"sheetsConfigured": true`
