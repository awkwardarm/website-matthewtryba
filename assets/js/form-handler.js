/**
 * Form validation and spam detection for Matthew Tryba's landing pages
 */

// Spam patterns - centralized list that can be updated in one place
const spamPatterns = [
    "robertduend",
    "robert duend",
    // Add more patterns as needed
];

// Form validation function
function validateForm() {
    // Get the honeypot field value
    const honeypot = document.getElementById('_honeypot').value;
    
    // Get the name field value and clean it
    const rawName = document.getElementById('name').value;
    const cleanName = rawName.toLowerCase()
                          .replace(/\s+/g, ' ')
                          .trim();
    
    // Create a stripped version with only alphanumeric chars
    const strippedName = cleanName.replace(/[^a-z0-9]/g, '');
    
    console.log("Raw name:", rawName);
    console.log("Clean name:", cleanName);
    console.log("Stripped name:", strippedName);
    
    // Check for honeypot
    if (honeypot) {
        console.log("Honeypot filled - spam detected");
        window.location.href = "https://www.matthewtryba.com/thank-you-home-98jkxco9012";
        return false;
    }
    
    // Check against spam patterns in both clean and stripped versions
    for (const pattern of spamPatterns) {
        if (cleanName.includes(pattern) || strippedName.includes(pattern.replace(/\s+/g, ''))) {
            console.log(`Spam pattern "${pattern}" detected`);
            window.location.href = "https://www.matthewtryba.com/thank-you-home-98jkxco9012";
            return false;
        }
    }
    
    return true; // Allow the form to submit
}

// Get the source parameter from the page for analytics tracking
function getSourceParameter() {
    // Get data attribute from the form element or use a default
    const form = document.getElementById('contact-form');
    return form.dataset.source || 'unknown';
}

// Initialize forms when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    
    if (form) {
        // Set the redirect with source parameter
        const redirectInput = form.querySelector('input[name="_redirect"]');
        if (redirectInput) {
            const source = getSourceParameter();
            redirectInput.value = `https://www.matthewtryba.com/thank-you?source=${source}`;
        }
        
        // Add form validation
        form.addEventListener('submit', function(e) {
            if (!validateForm()) {
                e.preventDefault();
            }
        });
    }
});
