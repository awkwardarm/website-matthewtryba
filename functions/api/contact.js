/**
 * ===========================================================
 * POST /api/contact — Contact form handler (home + landing pages)
 * ===========================================================
 *
 * Cloudflare Pages Function (auto-deployed from /functions).
 * The home and national-landing contact forms post here. Each
 * submission is logged to the shared Google Sheet and emailed to
 * NOTIFY_TO via Resend with a custom subject line per page.
 * (Formerly forwarded to Formbold — replaced by the sheet, since
 * Formbold only allows editing the email subject on a paid plan.)
 *
 * Flow:
 *   1. Drop honeypot submissions (pretend success, log nothing)
 *   2. Append the submission to the Google Sheet (lib/google-sheets.js)
 *   3. Email the lead's details to NOTIFY_TO via Resend
 *   4. Redirect to the form's _redirect URL (per-page thank-you)
 *
 * Which page the submission came from is selected by the ?page=
 * query param on the form action (see assets/page-configs.js).
 *
 * Sheet and email are independent best-effort deliveries — either
 * one failing never blocks the other or the visitor's redirect.
 * Environment variables (Pages dashboard → Settings): RESEND_API_KEY
 * plus the three Google vars documented in lib/google-sheets.js.
 * ===========================================================
 */

import { appendRow, SHEET_TAB } from '../../lib/google-sheets.js';

const NOTIFY_TO = 'matthew@matthewtryba.com';
const NOTIFY_FROM = 'Website Contact Form <forms@matthewtryba.com>';

// Per-page settings, keyed by the ?page= query param on the form action.
// label:    "Form" column value in the Google Sheet
// subject:  notification email subject — edit freely here
// fallback: thank-you path used if the _redirect field is missing/invalid
const PAGES = {
    'home': {
        label: 'home',
        subject: (name) => `New lead from home page — ${name}`,
        fallback: '/thank-you-home-98jkxco9012?source=home-page'
    },
    'national-landing': {
        label: 'usa-landing',
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

    const links = String(form.get('links') || '').trim();
    const message = String(form.get('message') || '').trim();
    const clickId = String(form.get('gclid') || form.get('gbraid') || form.get('wbraid') || '').trim();

    // Sheet log and notification email run concurrently; each is best
    // effort and failures are logged, so one lost delivery still leaves
    // the other copy of the lead.
    const [logged, sent] = await Promise.all([
        appendRow(env, SHEET_TAB, [
            new Date().toISOString(), page.label, name, email, links, message, clickId
        ]),
        sendNotification(env, { name, email, links, message, clickId, page })
    ]);
    if (!logged) console.error('Sheet log failed for contact from', email);
    if (!sent) console.error('Contact notification email did not send for', email);

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

async function sendNotification(env, { name, email, links, message, clickId, page }) {
    if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured — skipping notification');
        return false;
    }

    const rows = [
        ['Name', name],
        ['Email', email],
        ['Music links', links || '—'],
        ['Message', message],
        ['Google Ads click id', clickId || '—']
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
