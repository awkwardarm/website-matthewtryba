# Mercenary Copy Plan: Fewer, Better Leads

## Goal

Rewrite the site copy so it **turns away casual, low-budget, "maybe someday" inquiries**
and speaks directly to artists who have money set aside, a release plan, and a career to
build. The aim is fewer form fills with a much higher close rate and bigger average
project size. Right now the copy is built to make anyone feel welcome. The new copy should
make the right people feel recognized and make the wrong people leave on their own.

## Diagnosis: where the current copy is soft

The Hero/Caregiver/Sage audit (`docs/BRAND-ARCHETYPE-COPY-AUDIT.md`) pushed the copy toward
warmth and safety. That was right for building trust, but it now works against filtering:

| Soft signal | Where | Who it attracts |
|---|---|---|
| "No pressure, no commitment, just a conversation" | `about.html`, `welcome-2.html` CTAs | Tire-kickers, people collecting free advice |
| "Unfinished gems gathering dust… stuck in loop land" | `welcome-2.html` Problem section | Hobbyists with no budget or deadline |
| "Start small… Start wherever feels right… no pressure to go further" | `docs/services-and-pricing.html` | Buyers of the $400 Creative Date only |
| "Ready to take your music to the next level?" | `about.html`, `welcome-2.html` | Anyone at all (generic) |
| No price anywhere on the public site | All public pages | Leads who find out the price on a call and disappear |
| Form asks only name, email, link, message | `index.html`, `welcome-2.html` | No way to screen before replying |
| "Much more than a spacebar monkey" | `about.html` | Undercuts the positioning |
| "I help you make and record songs" | Hero subhead | Sounds like a service for beginners |

## Positioning shift

- **From:** "Your caring creative partner, for any artist, at any stage."
- **To:** "A major-label producer who takes a limited number of artists a year who are
  serious about releasing records that compete."

Archetype rebalance, replacing the 70/25/5 formula:

- **Hero/Ruler, about 75%:** a set standard, scarcity, conditions stated up front, results.
- **Sage, about 15%:** the credits explain *why* the process works. Keep the
  "what separates a good song from a global hit" angle.
- **Caregiver, about 10%:** keep it only as **protecting the artist's identity**. The
  Lindsey Leigh testimonial carries this well. Drop anything about comfort or safety.

Voice rules:

1. **State the conditions, don't plead.** Say "I work with artists who…" and never
   "Whether you're just starting or…".
2. **Name the price floor publicly.** This one line filters better than any other copy.
3. **Say who it's not for.** A short "Not a fit if…" list does more screening than a
   paragraph of adjectives.
4. **Use scarcity only when it's true.** "I take on a limited number of full productions
   each quarter" must be accurate. If it isn't, leave it out.
5. **Cut hedges and filler.** Remove "just," "hopefully," "next level," and "no pressure."
6. **Put outcomes before process.** Talk about releases, placements, and records that sit
   next to the charts. Leave the steps for the services doc.

## Target client (define before writing)

Confirm or edit this profile. Every line of copy gets checked against it.

- **In:** independent artists with a **budget of $4k+ per song** (or an EP budget), a
  **release plan or date**, **prior releases** or a real audience, sync ambitions, and
  referrals from managers or labels.
- **Out:** people looking for their first song on a hobby budget, beat or loop shoppers,
  "can you just mix this for $100," and people with no timeline.

## Page-by-page plan

### 1. Home (`src/index.html`)

- **Hero headline:** keep "Major Label Sound for Independent Artists", which already
  filters well, or sharpen it to "Major-Label Records for Independent Artists Who Are
  Ready to Release."
- **Hero subhead:** rewrite as a qualifier. Draft direction: *"I produce Pop, Adult
  Contemporary, and Dark Pop records to the same standard as the Diamond and
  Grammy-winning albums I engineered. I work with a limited number of artists who have
  the songs, the budget, and a plan to release."*
- **CTA:** change "Start The Conversation" to **"Apply to Work Together"** or **"Check
  Availability."**
- **"Your Creative Partner from Start to End":** retitle it to something like "How I
  Work." Keep the "never off the rack" line. Cut the "You + Me stronger than either of us"
  line.
- **Services cards:** add **"from $X"** to each card, using numbers from
  `docs/studio-rates.html` and `docs/services-and-pricing.html`.
- **New block, "Who This Is For / Not For":** two short columns with 3 or 4 bullets each.
- **Testimonials:** lead with Hunter M. ("If you are serious about your song…"), which is
  the most mercenary quote on the site.
- **Form:** see section 6.

### 2. About (`src/about.html`)

- Remove "spacebar monkey."
- Open with the standard and the credits as proof, then move to the process. The
  Taylor Swift, Adele, OneRepublic, and Ariana Grande names should appear high on the page.
  Right now they are missing from the About page entirely.
- Replace the "Ready to take your music to the next level? … No pressure, no commitment"
  CTA with something like *"If you have a record you're ready to put real weight behind,
  tell me about it."*

### 3. Work (`src/work.html`)

- The copy is mostly fine. Tighten the intro to focus on results.
- Change the CTA from "Ready to create your best work? Let's talk." to something that
  qualifies, such as *"Have a release on the calendar? Let's see if it's a fit."*

### 4. Ads landing page (`src/welcome-2.html`): **the biggest change**

- **Replace the "Problem" section.** "Songs gathering dust in loop land" attracts exactly
  the clients we want to filter out. The new problem should be one a serious artist has:
  *"You've released music, but it doesn't stand up next to the records you're compared
  against. The songs are there; the production isn't."*
- Solution section: keep "You are the art, I am your guide". It works. Cut the
  reassurance about technical hurdles.
- Add the price floor and the fit list above the form.
- Swap the "No pressure, no commitment" CTA as described for the About page.
- **Run this as an A/B test instead of overwriting the page.** See the rollout section.

### 5. Services & Pricing doc (`src/docs/services-and-pricing.html`)

This doc is sent only after contact, so it can stay a bit warmer, but:

- Change "Start wherever feels right… no pressure to go further than you want" to a
  confident path: *"Most artists start with a Creative Date or go straight to Full
  Production."*
- Decide whether the **$400 Creative Date** stays as the entry point. It is the main
  low-commitment door. Options: raise the price, require a submitted song first, or keep
  it and rely on public pricing to screen upstream. **This is a decision for you.**

### 6. Contact form: qualification fields

Add fields to the forms on `index.html` and `welcome-2.html` so leads screen themselves:

- **Budget per song:** a dropdown with values like `Under $1k / $1–4k / $4–8k / $8k+ / EP
  budget`. Consider auto-routing leads under $1k to `/tools` instead of a reply.
- **Release timeline:** a dropdown with `Within 3 months / 3–6 months / 6+ months / No
  date yet`.
- **Have you released music before?** Yes/no, plus a link.
- Keep "Link to Your Music." Consider making it **required**.

Code impact: `functions/api/contact.js` logs a fixed column list to the Google Sheet and
builds the notification email. Both need the new fields, and the Sheet needs new column
headers (`scripts/setup-submissions-sheet.mjs`). The honeypot and GCLID handling in
`assets/shared-scripts.js` are unaffected.

### 7. Thank-you pages and meta

- Thank-you pages: set expectations with something like *"If it's a fit, I'll reply
  within one business day with next steps."*
- `<title>` and meta descriptions: remove "Start now." and similar calls to action from
  the About and Work descriptions.

## Rollout

1. **You confirm** the target-client profile, the price floor to show publicly, and what
   happens to the Creative Date.
2. **Draft the copy** for every page above in one pass (Claude). You review the voice before
   anything ships.
3. **Build the mercenary landing page as a new page**, for example `/welcome-3/`, cloned
   from `welcome-2`. Point part of the Google Ads traffic at it and compare
   **qualified leads per dollar**, not raw form fills. Expect fewer fills; that is the point.
4. **Ship the form qualification fields** to both forms. The Sheet columns make the A/B
   comparison measurable.
5. After 3 to 4 weeks of data, **move the winning copy** to Home, About, and Work.
6. Update `docs/BRAND-ARCHETYPE-COPY-AUDIT.md` with the new formula so future edits stay
   consistent.

## Success metrics

- Share of leads with a budget of $4k or more (the Sheet makes this visible).
- Close rate from inquiry to paid project.
- Average first-project value.
- Time spent on calls that go nowhere, as a rough self-report.

## Risks

- **Lead volume will drop.** Watch the Ads cost per *qualified* lead so a good filter
  isn't mistaken for a broken page.
- **Too cold reads as arrogant.** The testimonials about being "patient" and "listening"
  keep the Caregiver piece alive. Keep them.
- **Claims must be true.** Only claim scarcity or a waitlist if it's real, and word the
  credits exactly as they are ("engineering credits on…").
