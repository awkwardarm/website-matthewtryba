Squarespace → Cloudflare Pages Migration Plan (with hour estimate)
Context
The $228/yr Squarespace renewal is due next month. The question: how many hours to drop Squarespace entirely and host on Cloudflare (or similar)?
Key finding from exploration: this repo is not the website — it’s a CSS/JS asset layer injected into Squarespace via jsDelivr. Squarespace is the actual host, CMS, and page renderer. What Squarespace still provides:
	1.	Page rendering — wraps the repo’s HTML snippets (pasted into Code Blocks) with site nav/header/footer
	2.	Pages that exist only in Squarespace — the “Tools” page (with a native email/download-consent form targeted by assets/squarespace-overrides.css), the live thank-you pages, possibly others
	3.	Code Injection — the jsDelivr loader + gtag (AW-17389653886) + Google site verification (documented in docs/DEPLOYMENT.md:156-209)
	4.	DNS / domain for matthewtryba.com
What is already off Squarespace (makes this migration unusually cheap):
	•	All CSS/JS is in this repo, vanilla, no build step
	•	Audio + album art on Cloudflare R2 (CDN_BASE in assets/shared-scripts.js:39) — account already exists
	•	Main forms post to Formbold (assets/page-configs.js), not Squarespace
	•	Font is Outfit (free Google Font, loaded via @import in shared-styles.css) — the Futura PT/Adobe Fonts dependency was already replaced (squarespace-overrides.css:137-158)
	•	No blog, no commerce, no member areas; ~8 pages total
Estimate
~12–20 hours by hand; with Claude Code doing the implementation, roughly 5–8 hours of Matthew’s time, spread over ~1 week (DNS/domain steps have waiting periods). Verdict: worth doing before the renewal — ongoing cost drops from $228/yr to ~$0 (Cloudflare Pages free tier; domain ~$11/yr if transferred to Cloudflare Registrar; Stripe only takes per-transaction fees).

|Task                                                                                                                                                                                                                                                                |Solo hours|
|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
|1. Content capture from live site (save live pages’ HTML for nav/footer markup and SEO/OG meta; for Tools + download pages only the **text content and download-file link** — their current styling is discarded)                                                   |1–1.5     |
|2. Scaffold static site with shared layout (header/nav/footer partial) — Eleventy, minimal config, keeps existing HTML nearly as-is                                                                                                                                 |2–3       |
|3. Port repo pages (`pages-main/*`, `pages-landing/*`, `pages-thank-you/*`) into full pages; **build Tools + download/donate pages fresh in the main site’s design system** (`shared-styles.css` — current Squarespace-built styling is intentionally not preserved)|3–5       |
|4. Tools-page pipeline: Formbold form → automated email with download link → recreated download page with **Stripe Payment Link donate button** (new Stripe account); export existing submissions/email list from Squarespace                                       |2–4       |
|5. Fold Code Injection into the layout (gtag, site verification, direct local asset loading — jsDelivr/version-tag workflow deleted); repoint `raw.githubusercontent.com` image URLs in `page-configs.js` to local paths                                            |1–2       |
|6. Cloudflare Pages project + custom domain + DNS cutover; 301 redirects (obfuscated thank-you URLs, any changed paths); 404 page, sitemap.xml, robots.txt, favicon                                                                                                 |1.5–2     |
|7. QA: Formbold submissions end-to-end, spam honeypot, gclid ads-attribution cookie, audio player, YouTube embeds, mobile nav, hard-refresh across pages; verify Google Ads final URLs still resolve                                                                |2–3       |
|8. Cancel Squarespace; keep/transfer domain                                                                                                                                                                                                                         |0.5       |

Open assumptions (resolve at task 1; plan covers both paths)
	•	Domain registrar: if registered at Squarespace → transfer to Cloudflare Registrar before cancelling (start early; transfers take up to 5 days). If elsewhere → just repoint nameservers/DNS. Check: Squarespace Settings → Domains.
	•	Custom email: if Google Workspace is billed through Squarespace, migrate billing to direct-with-Google and preserve MX records before cancelling (+~1h). If no custom email, skip.
	•	Squarespace-only pages: plan assumes only the Tools page + thank-you pages. Each additional page ≈ +0.5–1h.
Implementation approach
Target: Cloudflare Pages (free, already have the CF account for R2, custom domains + redirects + 404 built in). Alternative hosts (Netlify, GitHub Pages) work equally well but consolidate less.
	1.	Capture live site — Matthew saves each live page (Cmd+S / View Source) into a migration-reference/ folder: home, about, work, both landing pages, Tools, both thank-you pages. This captures the Squarespace-rendered nav/header/footer, meta tags, and the Tools form structure that aren’t in the repo.
	2.	Scaffold Eleventy — package.json with @11ty/eleventy only; a single _includes/layout.njk holding <head> (meta, gtag, site-verification, direct <link>/<script> to /assets/), nav, footer. Existing pages become content wrapped by the layout; the location.hostname local-preview guards and document.write loaders in each pages-*/*.html are deleted.
	3.	Port pages — move pages-main/, pages-landing/, pages-thank-you/ content under src/ with clean URLs matching current live paths exactly (Google Ads final URLs must not break). Build the Tools page and the download/donate page fresh using the existing design system in shared-styles.css (hero, .container, .btn/.btn-secondary, card patterns) — per Matthew, their current Squarespace-built styling should NOT be preserved; only carry over the text content and the download file. The new Tools form is a Formbold form reusing the form-handling in assets/shared-scripts.js (honeypot, SPAM_CONFIG, initializeAdsAttribution() hidden fields).
3b. Tools download + donate pipeline (replaces Squarespace form-email and donation feature):
	•	Email with download link: use Formbold’s autoresponse/email feature if the plan supports it (zero code). Fallback: a small Cloudflare Pages Function receives the form POST, forwards it to Formbold, and sends the download email via Resend (free tier, 3k emails/mo) — keeps everything in the Cloudflare account.
	•	Download page: recreate as a static page at an obfuscated URL (like the current thank-you pages), noindex in robots meta, download served from R2.
	•	Donate button: create a Stripe Payment Link in the new Stripe dashboard (supports preset + custom amounts, no code, Stripe hosts checkout) and link it from a styled Donate button on the download page. Optional later upgrade to embedded Stripe Checkout, but a Payment Link is the right v1.
	•	Before cancelling Squarespace: export existing form submissions / donor records from Squarespace.
	4.	Delete dead weight — assets/squarespace-overrides.css (block-ID fixes and --heading-font-font-family overrides are meaningless off Squarespace; keep the Outfit font-family declarations by folding them into shared-styles.css if needed), the jsDelivr versioning docs workflow (docs/DEPLOYMENT.md rewritten to “git push = deploy”), and the tracked .cache file containing live Spotify OAuth tokens (security issue independent of migration — revoke the token, add to .gitignore, purge from history).
	5.	Deploy — Cloudflare Pages connected to this GitHub repo, build command npx @11ty/eleventy, output _site. _redirects file for the obfuscated thank-you URLs and www/apex canonicalization. Add 404.html, sitemap.xml, robots.txt, favicon (grab current one from live site).
	6.	Cutover — verify everything on the *.pages.dev preview URL first; then point DNS, keep Squarespace live in parallel for a few days (it keeps serving until DNS flips), re-verify Search Console + Google Ads, then cancel Squarespace before renewal.
Verification
	•	Preview on *.pages.dev: click through every page, mobile + desktop; submit each form with a test entry and confirm it arrives in Formbold and redirects to the right thank-you page; confirm honeypot/spam redirect still works.
	•	Visit a landing page with ?gclid=test123, submit the form, confirm the hidden gclid field arrives in the Formbold submission (attribution intact).
	•	Tools flow end-to-end: submit the Tools form with a real email → receive the download email → open the download page → complete a donation in Stripe test mode, then one live $1 donation before cutover.
	•	Play tracks in the audio player (R2 URLs unchanged, so should be untouched).
	•	After DNS cutover: curl -I the old obfuscated thank-you URLs and key paths → expect 200/301 as designed; check Google Search Console for crawl errors; confirm the Google Ads tag fires (Tag Assistant).