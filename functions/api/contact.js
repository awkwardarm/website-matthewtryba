/**
 * ===========================================================
 * POST /api/contact — Contact form handler (home + landing pages)
 * ===========================================================
 *
 * Cloudflare Pages Function (auto-deployed from /functions).
 * The home and national-landing contact forms post here instead
 * of directly to Formbold so the notification email — sent via
 * Resend — can have a custom subject line per page. (Formbold
 * only allows editing the subject on a paid plan, and has no
 * hidden-field override like Formspree's _subject.)
 *
 * Flow:
 *   1. Drop honeypot submissions (pretend success, send nothing)
 *   2. Forward the submission to Formbold (dashboard record)
 *   3. Email the lead's details to NOTIFY_TO via Resend
 *   4. Redirect to the form's _redirect URL (per-page thank-you)
 *
 * Which page the submission came from is selected by the ?page=
 * query param on the form action (see assets/page-configs.js).
 * Formbold's own email notification for these forms should be
 * turned OFF in the Formbold dashboard, or every lead arrives
 * twice.
 *
 * Uses the same RESEND_API_KEY environment variable already
 * configured for /api/tools-signup.
 * ===========================================================
 */

const NOTIFY_TO = 'matthewtryba@gmail.com';
const NOTIFY_FROM = 'Website Contact Form <forms@matthewtryba.com>';

// Per-page settings, keyed by the ?page= query param on the form action.
// formbold:  which Formbold form records the submission (kept separate
//            per page so source tracking in the dashboard still works)
// subject:   notification email subject — edit freely here
// fallback:  thank-you path used if the _redirect field is missing/invalid
const PAGES = {
    'home': {
        formbold: 'https://formbold.com/s/3nK2A',
        subject: (name) => `New lead from home page — ${name}`,
        fallback: '/thank-you-home-98jkxco9012?source=home-page'
    },
    'national-landing': {
        formbold: 'https://formbold.com/s/3nKg0',
        subject: (name) => `New lead from USA landing page — ${name}`,
        fallback: '/thank-you-8399akkgak3214?source=landing-page-usa'
    }
};

export async function onRequestPost({ request, env }) {
    const url = new URL(request.url);
    const origin = url.origin;

    const page = PAGES[url.searchParams.get('page')];
    if (!page) {
        return new Response('Unknown form', { status: 400 });
    }

    let form;
    try {
        form = await request.formData();
    } catch {
        return new Response('Bad request', { status: 400 });
    }

    const redirectUrl = safeRedirect(form.get('_redirect'), origin, page.fallback);

    // Honeypot — bots fill hidden fields. Pretend success, send nothing.
    if (form.get('_honeypot')) {
        return Response.redirect(redirectUrl, 303);
    }

    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    if (!name || !email) {
        return new Response('Missing required fields', { status: 400 });
    }

    // Record the submission in Formbold — best effort; the notification
    // email still goes out if Formbold is unreachable.
    try {
        const fb = new FormData();
        for (const [key, value] of form.entries()) {
            // Underscore fields (_honeypot, _redirect) are form plumbing,
            // not lead data — don't clutter the Formbold record with them.
            if (!key.startsWith('_')) fb.append(key, value);
        }
        await fetch(page.formbold, { method: 'POST', body: fb });
    } catch (err) {
        console.error('Formbold forward failed:', err);
    }

    const sent = await sendNotification(env, { form, name, email, page });
    if (!sent) {
        // The submission is still recorded in Formbold, so the lead isn't
        // lost — but surface the failure so it gets fixed.
        console.error('Contact notification email did not send for', email);
    }

    return Response.redirect(redirectUrl, 303);
}

/**
 * Validate the form's _redirect value: must parse as a URL on the SAME
 * origin as this request (production or *.pages.dev preview). Anything
 * else falls back to the page's own thank-you path — prevents the hidden
 * field being abused as an open redirect.
 */
function safeRedirect(value, origin, fallback) {
    try {
        const url = new URL(String(value || ''));
        if (url.origin === origin) return url.href;
    } catch { /* not a valid absolute URL — use fallback */ }
    return origin + fallback;
}

async function sendNotification(env, { form, name, email, page }) {
    if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured — skipping notification');
        return false;
    }

    const links = String(form.get('links') || '').trim();
    const message = String(form.get('message') || '').trim();
    const gclid = String(form.get('gclid') || form.get('gbraid') || form.get('wbraid') || '').trim();

    const rows = [
        ['Name', name],
        ['Email', email],
        ['Music links', links || '—'],
        ['Message', message],
        ['Google Ads click id', gclid || '—']
    ];

    const html = rows.map(([label, value]) =>
        `<p><strong>${label}:</strong><br>${escapeHtml(value).replace(/\n/g, '<br>')}</p>`
    ).join('\n');

    const text = rows.map(([label, value]) => `${label}:\n${value}`).join('\n\n');

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: NOTIFY_FROM,
                to: [NOTIFY_TO],
                reply_to: email, // hitting Reply answers the lead directly
                subject: page.subject(name),
                html,
                text
            })
        });

        if (!res.ok) {
            console.error('Resend error:', res.status, await res.text());
            return false;
        }
        return true;
    } catch (err) {
        console.error('Resend request failed:', err);
        return false;
    }
}

function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}
