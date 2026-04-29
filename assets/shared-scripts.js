/**
 * Shared JavaScript for All Landing Pages
 */

// Cloudflare R2 CDN base URL — single source of truth for all pages
const CDN_BASE = 'https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/';

/**
 * Resolves all img[data-cdn] src attributes using CDN_BASE.
 * Called automatically on DOMContentLoaded.
 */
function hydrateCdnImages() {
    document.querySelectorAll('img[data-cdn]').forEach(img => {
        img.src = CDN_BASE + img.dataset.cdn;
    });
}

// Spam detection configuration
const SPAM_CONFIG = {
    patterns: [
        "robertduend",
        "robert duend"
        // Add more patterns as needed
    ],
    thankYouUrl: "https://www.matthewtryba.com/thank-you-home-98jkxco9012"
};

/**
 * Validates the contact form for spam
 * @returns {boolean} - true if valid, false if spam detected
 */
function validateForm() {
    const honeypot = document.getElementById('_honeypot').value;
    const rawName = document.getElementById('name').value;
    const cleanName = rawName.toLowerCase()
                          .replace(/\s+/g, ' ')
                          .trim();
    const strippedName = cleanName.replace(/[^a-z0-9]/g, '');
    
    console.log("Raw name:", rawName);
    console.log("Clean name:", cleanName);
    console.log("Stripped name:", strippedName);
    
    // Check honeypot
    if (honeypot) {
        console.log("Honeypot filled - spam detected");
        window.location.href = SPAM_CONFIG.thankYouUrl;
        return false;
    }
    
    // Check spam patterns
    for (const pattern of SPAM_CONFIG.patterns) {
        if (cleanName.includes(pattern) || strippedName.includes(pattern.replace(/\s+/g, ''))) {
            console.log(`Spam pattern "${pattern}" detected`);
            window.location.href = SPAM_CONFIG.thankYouUrl;
            return false;
        }
    }
    
    // Prevent double-submit
    const btn = document.querySelector('#contact-form button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
    }

    return true;
}

/**
 * Initialize form with reCAPTCHA
 * Call this after the DOM is loaded
 */
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.onsubmit = validateForm;
    }
}

/**
 * Adds a pulsing invite animation to the first visible input in each form.
 * The animation stops once the field is focused.
 */
function initializeFormInviteAnimation() {
    document.querySelectorAll('form').forEach(form => {
        const firstField = form.querySelector(
            'input:not([type="hidden"]):not([tabindex="-1"]), textarea'
        );
        if (!firstField) return;
        firstField.classList.add('form-control--invite');
        firstField.addEventListener('focus', () => {
            firstField.classList.remove('form-control--invite');
        }, { once: true });
    });
}

/**
 * Renders the shared footer into the page's <footer> element.
 * Single source of truth for footer content across all pages.
 */
function renderSharedFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;
    footer.innerHTML = `
        <div class="container">
            <p class="footer-tagline">You are the art.</p>
            <p>&copy; ${new Date().getFullYear()} TRYBA MUSIC, LLC. All Rights Reserved.</p>
        </div>`;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeContactForm();
        hydrateCdnImages();
        initializeFormInviteAnimation();
        renderSharedFooter();
    });
} else {
    initializeContactForm();
    hydrateCdnImages();
    initializeFormInviteAnimation();
    renderSharedFooter();
}
