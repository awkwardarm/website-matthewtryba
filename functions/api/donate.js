/**
 * ===========================================================
 * POST /api/donate — Inline Stripe donation checkout
 * ===========================================================
 *
 * Cloudflare Pages Function (auto-deployed from /functions).
 * The download page's donate widgets post here with the amount the
 * visitor picked. This creates a Stripe Checkout Session in embedded
 * mode and returns its client_secret, which Stripe.js mounts inline
 * under the tool, so the visitor pays without leaving the page.
 *
 * Request:  JSON { amount: <dollars>, tool: 'stem-logic' | 'transpose-all' | 'general' }
 * Response: JSON { clientSecret } or { error } with a 4xx/5xx status
 *
 * The tool id lands on the payment as client_reference_id and
 * metadata.tool, so per-tool totals show up in the Stripe dashboard
 * the same way the old Payment Link attribution did.
 *
 * SETUP (one-time, Cloudflare Pages dashboard):
 *   Settings → Environment variables → add STRIPE_SECRET_KEY
 *   (Stripe dashboard → Developers → API keys → Secret key).
 *   Also paste the matching publishable key into
 *   stripePublishableKey in assets/page-configs.js.
 *   Until both are set, the widgets fall back to the Payment Link.
 * ===========================================================
 */

// Pinned so a Stripe account API upgrade can't change the shape of
// the embedded Checkout Session parameters used below.
const STRIPE_API_VERSION = '2024-06-20';

const TOOLS = {
    'stem-logic': 'Stem Logic',
    'transpose-all': 'Transpose All',
    'general': 'Production Tools'
};

const MIN_DOLLARS = 1;
const MAX_DOLLARS = 1000;

export async function onRequestPost({ request, env }) {
    if (!env.STRIPE_SECRET_KEY) {
        console.error('STRIPE_SECRET_KEY not configured');
        return json({ error: 'Donations are not configured' }, 503);
    }

    let body;
    try {
        body = await request.json();
    } catch {
        return json({ error: 'Bad request' }, 400);
    }

    const tool = String(body.tool || '');
    const dollars = Number(body.amount);
    if (!TOOLS[tool]) return json({ error: 'Unknown tool' }, 400);
    if (!Number.isFinite(dollars) || dollars < MIN_DOLLARS || dollars > MAX_DOLLARS) {
        return json({ error: `Amount must be between $${MIN_DOLLARS} and $${MAX_DOLLARS}` }, 400);
    }
    const cents = Math.round(dollars * 100);

    const params = new URLSearchParams({
        'ui_mode': 'embedded',
        'mode': 'payment',
        'submit_type': 'donate',
        // The page shows its own thank-you in place of the form,
        // so Stripe never navigates the visitor away
        'redirect_on_completion': 'never',
        'client_reference_id': tool,
        'metadata[tool]': tool,
        'metadata[source]': 'download-page',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': String(cents),
        'line_items[0][price_data][product_data][name]': `Donation for ${TOOLS[tool]}`
    });

    try {
        const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Stripe-Version': STRIPE_API_VERSION
            },
            body: params
        });
        const session = await res.json();
        if (!res.ok) {
            console.error('Stripe error:', res.status, JSON.stringify(session.error || session));
            return json({ error: 'Could not start checkout' }, 502);
        }
        return json({ clientSecret: session.client_secret });
    } catch (err) {
        console.error('Stripe request failed:', err);
        return json({ error: 'Could not start checkout' }, 502);
    }
}

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}
