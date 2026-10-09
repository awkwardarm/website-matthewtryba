/**
 * ===========================================================
 * INLINE DONATE WIDGET: Stripe Embedded Checkout
 * ===========================================================
 *
 * Turns every .donate-widget on the page into an amount picker
 * (preset buttons plus an "Other" field) and a Donate button.
 * Donate posts to /api/donate (functions/api/donate.js), then
 * mounts Stripe's Embedded Checkout inside the widget, so the
 * visitor pays without leaving the page. On success the widget
 * swaps to a thank-you message.
 *
 * Markup:   <div class="donate-widget" data-tool="stem-logic"
 *                data-tool-key="stemLogic">...prompt...</div>
 *           data-tool is the id sent to /api/donate (must be in its
 *           TOOLS list); data-tool-key picks a per-tool Payment Link.
 * Styles:   assets/donate-widget.css
 *
 * Used by the tools download page and /donate.
 * ===========================================================
 */

/**
 * @param {Object} pageConfig  needs stripePublishableKey and donateUrl
 * @param {Object} options
 *        amounts        preset dollar amounts, e.g. [5, 10, 20]
 *        defaultAmount  the amount selected to start with
 *        source         where the donation came from, recorded on the payment
 *        paymentLinkFor (toolKey, toolId) => Payment Link URL, the fallback
 *                       when inline checkout isn't configured or fails
 */
function initDonateWidgets(pageConfig, options) {
    const AMOUNTS = options.amounts;
    const DEFAULT_AMOUNT = options.defaultAmount;
    const source = options.source || 'download-page';
    const paymentLinkFor = options.paymentLinkFor ||
        ((key, refId) => pageConfig.donateUrl + '?client_reference_id=' + refId);

    let stripePromise = null;   // Stripe.js loads on first donate click
    let activeCheckout = null;  // Stripe allows one embedded checkout per page

    function loadStripe() {
        if (!stripePromise) {
            stripePromise = new Promise((resolve, reject) => {
                const s = document.createElement('script');
                s.src = 'https://js.stripe.com/v3/';
                s.onload = () => resolve(Stripe(pageConfig.stripePublishableKey));
                s.onerror = () => { stripePromise = null; reject(new Error('Stripe.js failed to load')); };
                document.head.appendChild(s);
            });
        }
        return stripePromise;
    }

    document.querySelectorAll('.donate-widget').forEach(widget => {
        const tool = widget.dataset.tool;
        const fallbackUrl = paymentLinkFor(widget.dataset.toolKey, tool);
        let amount = DEFAULT_AMOUNT;

        const amounts = document.createElement('div');
        amounts.className = 'donate-amounts';
        amounts.setAttribute('role', 'group');
        amounts.setAttribute('aria-label', 'Donation amount');
        const presetButtons = AMOUNTS.map(a => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = '$' + a;
            b.setAttribute('aria-pressed', String(a === amount));
            b.addEventListener('click', () => { custom.value = ''; setAmount(a); });
            amounts.appendChild(b);
            return b;
        });
        const customWrap = document.createElement('label');
        customWrap.className = 'donate-custom-wrap';
        customWrap.innerHTML = '<span>$</span>';
        const custom = document.createElement('input');
        custom.className = 'donate-custom';
        custom.type = 'number';
        custom.min = '1';
        custom.max = '1000';
        custom.step = '1';
        custom.inputMode = 'decimal';
        custom.placeholder = 'Other';
        custom.setAttribute('aria-label', 'Other amount in dollars');
        custom.addEventListener('input', () => setAmount(parseFloat(custom.value) || 0, true));
        customWrap.appendChild(custom);
        amounts.appendChild(customWrap);

        const go = document.createElement('button');
        go.type = 'button';
        go.className = 'btn btn-secondary donate-go';

        const status = document.createElement('p');
        status.className = 'donate-status';
        status.setAttribute('role', 'status');

        const checkoutEl = document.createElement('div');
        checkoutEl.className = 'donate-checkout';
        checkoutEl.id = 'donate-checkout-' + tool;

        widget.append(amounts, go, status, checkoutEl);

        function setAmount(a, fromCustom) {
            amount = a;
            presetButtons.forEach((b, i) => b.setAttribute('aria-pressed', String(!fromCustom && AMOUNTS[i] === a)));
            custom.classList.toggle('selected', Boolean(fromCustom));
            go.textContent = a >= 1 ? 'Donate $' + formatDollars(a) : 'Donate';
            status.textContent = '';
        }
        setAmount(amount);

        go.addEventListener('click', async () => {
            // Not configured for inline checkout yet: use the Payment Link
            if (!pageConfig.stripePublishableKey) {
                window.open(fallbackUrl, '_blank', 'noopener');
                return;
            }
            if (!(amount >= 1 && amount <= 1000)) {
                status.textContent = 'Pick an amount between $1 and $1,000.';
                return;
            }

            go.disabled = true;
            status.textContent = 'Loading secure checkout...';
            try {
                const [stripe, res] = await Promise.all([
                    loadStripe(),
                    fetch('/api/donate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount, tool, source })
                    })
                ]);
                const data = await res.json();
                if (!res.ok || !data.clientSecret) throw new Error(data.error || 'No client secret');

                if (activeCheckout) {
                    activeCheckout.checkout.destroy();
                    activeCheckout.onClose();
                }
                const checkout = await stripe.initEmbeddedCheckout({
                    fetchClientSecret: () => Promise.resolve(data.clientSecret),
                    onComplete: () => {
                        checkout.destroy();
                        activeCheckout = null;
                        widget.innerHTML = '<p class="donate-thanks">Thank you so much! Your donation went through, and a receipt is on its way to your inbox.</p>';
                    }
                });
                checkout.mount(checkoutEl);
                activeCheckout = { checkout, onClose: () => { checkoutEl.innerHTML = ''; } };
                status.textContent = '';
                checkoutEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (err) {
                console.error('Inline donate failed:', err);
                status.innerHTML = 'Checkout didn\'t load. <a href="' + fallbackUrl + '" target="_blank" rel="noopener">Donate on Stripe instead</a>.';
            } finally {
                go.disabled = false;
            }
        });
    });

    function formatDollars(a) {
        return Number.isInteger(a) ? String(a) : a.toFixed(2);
    }
}
