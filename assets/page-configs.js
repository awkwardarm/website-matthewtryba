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
        // TODO(matthew): create a new form in Formbold for the tools signup
        formAction: 'https://formbold.com/s/9kKyO',
        redirectUrl: location.origin + 'NEW_PAGE'
        // (so submissions are tracked separately) and paste its endpoint here.
        // Optional: enable Formbold's autoresponse to also email the download
        // page link: https://www.matthewtryba.com/production-tools-download-1abgd7dkgjafa5
     },

     'tools-download': {
        // Download files — currently on Google Drive.
        // After uploading to the R2 bucket (downloads/ folder), swap to:
        //   stemLogic:    'https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/downloads/stem-logic.zip'
        //   transposeAll: 'https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/downloads/transpose-all.zip'
        downloads: {
            stemLogic: 'https://drive.google.com/uc?export=download&id=1O0cBMKBXyA1rABFLiQ71-GSfbWBQrqtA',
            transposeAll: 'https://drive.google.com/uc?export=download&id=1vwJVBGM2bYY-hGehgbZRFQoSZNJXx8sI'
        },
        // TODO(matthew): create a Payment Link in the Stripe dashboard
        // (Products → Payment Links → "Customer chooses price", enable
        // recurring options if desired) and paste its URL here.
        donateUrl: 'https://donate.stripe.com/REPLACE_WITH_PAYMENT_LINK'
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
