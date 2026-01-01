/**
 * Shared JavaScript for All Landing Pages
 */

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

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeContactForm);
} else {
    initializeContactForm();
}
