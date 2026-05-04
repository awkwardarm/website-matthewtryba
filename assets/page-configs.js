/**
 * ============================================================
 * PAGE CONFIGURATION — Landing Page Settings
 * ============================================================
 * 
 * PURPOSE:
 *     This file centralizes configuration for all landing pages.
 *     Each landing page has its own settings block containing:
 *            - Form submission URL (Formstack)
 *            - Redirect URL (thank-you page after form submission)
 *              - reCAPTCHA site key (spam protection)
 *              - Hero image URL (profile photo)
 *              - About section image URL
 * 
 * HOW TO USE:
 *     1. Import this file into your landing page HTML
 *     2. Call getPageConfig('page-name') to get settings
 *     3. Use returned values to populate form actions, images, etc.
 * 
 * PAGE NAMES:
 *      'main-landing'     : Primary landing page
 *      'national-landing' : USA/national targeting page
 *      'recording-studio' : Recording studio specific page
 *      'home'             : Homepage (different form source)
 * 
 * ADDING A NEW PAGE:
 *     1. Add a new entry to PAGE_CONFIGS object
 *     2. Set all required fields (formAction, redirectUrl, etc.)
 *     3. Ensure page name matches across your routes
 * ============================================================
 */

const PAGE_CONFIGS = {
     'main-landing': {
        formAction: 'https://formbold.com/s/3nKg0',
        redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-main',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: 'https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/refs/heads/main/images/profile-photos/profile-photo-IMG_5596.jpeg',
        aboutImage: 'https://github.com/awkwardarm/website-matthewtryba/blob/main/images/profile-photos/profile-photo-IMG_5507.jpeg?raw=true'
     },
     'national-landing': {
        formAction: 'https://formbold.com/s/3nKg0',
        redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-usa',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: 'https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/main/images/profile-photos/profile-photo-IMG_5596%202000%20wide.jpeg',
        aboutImage: 'https://github.com/awkwardarm/website-matthewtryba/blob/main/images/profile-photos/profile-photo-IMG_5507.jpeg?raw=true'
     },
     'recording-studio': {
        formAction: 'https://formbold.com/s/3nKg0',
        redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-recording-studio',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: 'https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/refs/heads/main/images/profile-photos/profile-photo-IMG_5596.jpeg',
        aboutImage: 'https://github.com/awkwardarm/website-matthewtryba/blob/main/images/profile-photos/profile-photo-IMG_5507.jpeg?raw=true'
     },
     'home': {
          formAction: 'https://formbold.com/s/3nK2A', // Different form for home page to track source separately
        redirectUrl: 'https://www.matthewtryba.com/thank-you-home-98jkxco9012?source=home-page',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: 'https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/refs/heads/main/images/profile-photos/profile-photo-IMG_5596.jpeg',
        aboutImage: 'https://github.com/awkwardarm/website-matthewtryba/blob/main/images/profile-photos/profile-photo-IMG_5507.jpeg?raw=true'
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
