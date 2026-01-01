/**
 * Configuration for different landing pages
 * Import this and call getPageConfig('page-name') to get specific page data
 */

const PAGE_CONFIGS = {
    'main-landing': {
        formAction: 'https://formbold.com/s/3nKg0',
        redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-main',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: 'https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/refs/heads/main/images/profile-photos/profile-photo-IMG_5596.jpeg',
        aboutImage: 'https://github.com/awkwardarm/website-matthewtryba/blob/main/images/profile-photos/profile-photo-IMG_5507.jpeg?raw=true'
    },
    // Add more landing page configs here as needed
    'secondary-landing': {
        formAction: 'https://formbold.com/s/XXXXX',
        redirectUrl: 'https://www.matthewtryba.com/thank-you-secondary',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: 'https://example.com/different-hero.jpg',
        aboutImage: 'https://example.com/different-about.jpg'
    }
};

function getPageConfig(pageName) {
    return PAGE_CONFIGS[pageName] || PAGE_CONFIGS['main-landing'];
}
