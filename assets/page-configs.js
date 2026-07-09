/**
 * \===========================================================
 * PAGE CONFIGURATION — Page Settings
 * \===========================================================
 *
 * PURPOSE:
 *     This file centralizes configuration for pages with forms
 *     or dynamic links. Each page has its own settings block:
 *            - Form submission URL (Formbold)
 *            - Redirect URL (thank-you page after form submission)
 *            - reCAPTCHA site key (spam protection, currently unused)
 *            - Hero/About image paths (served from this site)
 *
 *     Redirect URLs are built from location.origin so they work
 *     on the production domain AND on Cloudflare Pages preview
 *     deployments (*.pages.dev).
 *
 * PAGE NAMES:
 *      'main-landing'     : Primary landing page
 *      'national-landing' : USA/national targeting page (/welcome-2)
 *      'home'             : Homepage (different form source)
 *      'tools'            : Tools page signup form
 *      'tools-download'   : Download/donate page links
 *
 * ADDING A NEW PAGE:
 *     1. Add a new entry to PAGE_CONFIGS object
 *     2. Set all required fields (formAction, redirectUrl, etc.)
 *     3. Ensure page name matches getPageConfig('page-name') in the page
 * \===========================================================
 */

const PAGE_CONFIGS = {
     'main-landing': {
        formAction: 'https://formbold.com/s/3nKg0',
        redirectUrl: location.origin + '/thank-you-8399akkgak3214?source=landing-page-main',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: '/images/profile-photos/profile-photo-IMG_5596.jpeg',
        aboutImage: '/images/profile-photos/profile-photo-IMG_5507.jpeg'
     },
     'national-landing': {
        formAction: 'https://formbold.com/s/3nKg0',
        redirectUrl: location.origin + '/thank-you-8399akkgak3214?source=landing-page-usa',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: '/images/profile-photos/profile-photo-IMG_5596%202000%20wide.jpeg',
        aboutImage: '/images/profile-photos/profile-photo-IMG_5507.jpeg'
     },
     'home': {
        formAction: 'https://formbold.com/s/3nK2A', // Different form for home page to track source separately
        redirectUrl: location.origin + '/thank-you-home-98jkxco9012?source=home-page',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: '/images/profile-photos/profile-photo-IMG_5596.jpeg',
        aboutImage: '/images/profile-photos/profile-photo-IMG_5507.jpeg'
     },
     'tools': {
        // Posts to a Cloudflare Pages Function that records the submission
        // in Formbold (9kKyO), emails the download link via Resend, then
        // redirects to /thank-you-tools. See functions/api/tools-signup.js
        formAction: '/api/tools-signup'
     },

     'tools-download': {
        // Download files — served from the Cloudflare R2 bucket (downloads/)
        downloads: {
            stemLogic: 'https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/downloads/Stem%20Logic%200.1.1.zip',
            transposeAll: 'https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/downloads/Transpose%20All%201.0.zip'
        },
        // Stripe Payment Link (donations — any amount).
        // Per-tool attribution: the download page appends
        // ?client_reference_id=stem-logic / transpose-all to this link, and
        // that id appears on each payment in the Stripe dashboard/exports.
        donateUrl: 'https://donate.stripe.com/00wdR2bT4cKi886aT4gUM02',
        // Optional: for per-link revenue reports in Stripe instead, create a
        // separate Payment Link per tool and paste it below — a non-empty
        // value here overrides the client_reference_id approach.
        donateUrls: {
            stemLogic: '',
            transposeAll: ''
        }
     }
};

/**
 * getPageConfig() — Retrieve configuration for a specific page
 *
 * Returns the config object for the given page name.
 * Falls back to 'main-landing' config if page name not found.
 *
 * @param {string} pageName — Page identifier (e.g., 'main-landing', 'home')
 * @returns {Object} Page configuration object
 */
function getPageConfig(pageName) {
    return PAGE_CONFIGS[pageName] || PAGE_CONFIGS['main-landing'];
}
