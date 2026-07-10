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

- [ ] Receive the **transfer authentication (EPP) code** from Squarespace (requested; domain already unlocked)
- [ ] Cloudflare dashboard → **Domain Registration → Transfer Domains** → `matthewtryba.com` should be listed as eligible
- [ ] Enter the auth code and pay (~$10–11 — one year of .com at wholesale cost, **added on top of** the current expiration date)
- [ ] Back in Squarespace → Domains: if a pending-transfer approval option appears, **approve it** to complete immediately; otherwise it auto-completes within ~5 days
- [ ] After completion: confirm **auto-renew is ON** in Cloudflare → Domain Registration (WHOIS privacy is on by default)
- [ ] ⚠️ Do **not** edit the registrant/WHOIS contact info before the transfer — contact changes trigger a 60-day ICANN transfer lock

## 3. Before the Squarespace plan lapses (deadline: mid-August)

- [ ] **Export old form submissions** from Squarespace (each form's storage → export CSV) — they are unrecoverable after the plan ends
- [ ] Confirm sections 1 and 2 are done, then let the plan lapse — nothing else references Squarespace

## 4. Email delivery (Resend) — nearly done

- [ ] Resend → **Domains**: wait for `matthewtryba.com` to show **Verified** (DNS records already added in Cloudflare)
- [ ] Then test end-to-end: submit the `/tools` form with a real email → "Check Your Email!" page → email from `tools@matthewtryba.com` arrives → link opens the download page → both R2 downloads work
- [ ] Health check anytime: `https://www.matthewtryba.com/api/tools-signup` → `"resendKeyConfigured": true`
- [ ] *(Optional)* Add `RESEND_API_KEY` to the **Preview** environment too if branch previews should send real email (currently Production only — previews intentionally don't send)
