/**
 * ===========================================================
 * POST /api/tools-signup — Tools download signup handler
 * ===========================================================
 *
 * Cloudflare Pages Function (auto-deployed from /functions).
 * The /tools signup form posts here instead of directly to
 * Formbold, so the download link can be delivered by EMAIL —
 * proving the address is real — rather than shown on the
 * thank-you page.
 *
 * Flow:
 *   1. Drop honeypot submissions (pretend success, send nothing)
 *   2. Forward the submission to Formbold (dashboard record)
 *   3. Email the download-page link via Resend
 *   4. Redirect to /thank-you-tools ("check your email")
 *
 * The user ALWAYS lands on /thank-you-tools, whether or not the
 * email actually sent — the download page is never reachable
 * directly from this form. That's the whole point of gating:
 * a fake/typo'd email address gets nothing, so the address list
 * this builds is real. If RESEND_API_KEY isn't configured yet (or
 * Resend errors), the failure is logged instead of falling back
 * to the download page — check the Pages Function logs.
 *
 * SETUP (one-time, Cloudflare Pages dashboard) — required before
 * sending real traffic to /tools, or submitters get "check your
 * email" and nothing ever arrives:
 *   Settings → Environment variables → add RESEND_API_KEY
 *   (from resend.com — verify matthewtryba.com as a sending
 *   domain there first). Optional: EMAIL_FROM to override the
 *   default sender address.
 * ===========================================================
 */

const FORMBOLD_ENDPOINT = 'https://formbold.com/s/9kKyO';
const DOWNLOAD_PAGE = '/production-tools-download-1abgd7dkgjafa5/';
const THANK_YOU_PAGE = '/thank-you-tools/';
const DEFAULT_FROM = 'Matthew Tryba <tools@matthewtryba.com>';
const REPLY_TO = 'matthewtryba@gmail.com';

/**
 * GET /api/tools-signup — health check / diagnostics.
 * Reports whether the deployment can see its configuration
 * (booleans only, never values). Visit in a browser to verify
 * the RESEND_API_KEY secret reached this deployment.
 */
export async function onRequestGet({ env }) {
    return new Response(JSON.stringify({
        ok: true,
        resendKeyConfigured: Boolean(env.RESEND_API_KEY),
        emailFromOverride: Boolean(env.EMAIL_FROM)
    }), { headers: { 'Content-Type': 'application/json' } });
}

export async function onRequestPost({ request, env }) {
    console.log('tools-signup: POST received');
    const origin = new URL(request.url).origin;

    let form;
    try {
        form = await request.formData();
    } catch {
        return new Response('Bad request', { status: 400 });
    }

    const email = String(form.get('email') || '').trim();
    const name = String(form.get('name') || '').trim();

    // Honeypot — bots fill hidden fields. Pretend success, send nothing.
    if (form.get('_honeypot')) {
        return Response.redirect(origin + THANK_YOU_PAGE, 303);
    }

    if (!email) {
        return new Response('Missing required fields', { status: 400 });
    }

    // Record the submission in Formbold — best effort; the email still
    // goes out if Formbold is unreachable.
    try {
        const fb = new FormData();
        for (const [key, value] of form.entries()) {
            if (key !== '_honeypot') fb.append(key, value);
        }
        await fetch(FORMBOLD_ENDPOINT, { method: 'POST', body: fb });
    } catch (err) {
        console.error('Formbold forward failed:', err);
    }

    const emailSent = await sendDownloadEmail(env, { name, email, origin });
    if (!emailSent) {
        // Never fall back to the download page — that would let anyone
        // get the files with a fake email address, defeating the point
        // of gating downloads behind a real inbox. Surface the failure
        // in logs instead so it gets fixed (check RESEND_API_KEY).
        console.error('Tools signup email did not send for', email);
    }

    return Response.redirect(origin + THANK_YOU_PAGE + '?source=tools-page', 303);
}

async function sendDownloadEmail(env, { name, email, origin }) {
    if (!env.RESEND_API_KEY) {
        console.error('RESEND_API_KEY not configured — skipping email');
        return false;
    }

    const downloadUrl = origin + DOWNLOAD_PAGE + '?source=email';
    const firstName = name.split(' ')[0] || 'there';

    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: env.EMAIL_FROM || DEFAULT_FROM,
                to: [email],
                reply_to: REPLY_TO,
                subject: 'Your production tools are ready to download',
                html: `
                    <p>Hey ${escapeHtml(firstName)},</p>
                    <p>Thanks for signing up! Here's your download link for
                    <strong>Stem Logic</strong> (Logic Pro) and
                    <strong>Transpose All</strong> (Ableton Live):</p>
                    <p><a href="${downloadUrl}">Download the tools</a></p>
                    <p>If the link doesn't work, copy and paste this into your browser:<br>
                    ${downloadUrl}</p>
                    <p>Enjoy — and if they save you time in a session, there's a
                    donate button on the download page.</p>
                    <p>— Matthew Tryba<br>
                    <a href="https://www.matthewtryba.com">matthewtryba.com</a></p>
                `,
                text: `Hey ${firstName},\n\nThanks for signing up! Here's your download link for Stem Logic (Logic Pro) and Transpose All (Ableton Live):\n\n${downloadUrl}\n\nEnjoy — and if they save you time in a session, there's a donate button on the download page.\n\n— Matthew Tryba\nhttps://www.matthewtryba.com`
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
