/**
 * Form HTML template for Matthew Tryba's landing pages
 */

function injectContactForm(formAction = "https://formbold.com/s/3nKg0", source = "landing-page-default") {
    const formContainers = document.querySelectorAll('.form-injection-point');
    
    if (formContainers.length === 0) return;
    
    const formHTML = `
    <form id="contact-form" action="${formAction}" method="POST" data-source="${source}" onsubmit="return validateForm()">
        <input type="hidden" name="_redirect" value="https://www.matthewtryba.com/thank-you?source=${source}">
        
        <!-- Honeypot field -->
        <div class="form-group honeypot-field">
            <label for="_honeypot">Leave this field empty</label>
            <input type="text" id="_honeypot" name="_honeypot" autocomplete="off" tabindex="-1">
        </div>
        
        <div class="form-group">
            <label for="name">Full Name <span style="font-weight: normal; color: #666;">(required)</span></label>
            <input type="text" id="name" name="name" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="email">Email Address <span style="font-weight: normal; color: #666;">(required)</span></label>
            <input type="email" id="email" name="email" class="form-control" required>
        </div>
        <div class="form-group">
            <label for="budget">What is your approximate budget for this project? <span style="font-weight: normal; color: #666;">(required)</span></label>
            <select id="budget" name="budget" class="form-control" required>
                <option value="" disabled selected>Please select a range...</option>
                <option value="$1,500 - $3,000 per song">$1,500 - $3,000 per song</option>
                <option value="$3,000 - $5,000 per song">$3,000 - $5,000 per song</option>
                <option value="$5,000 - $10,000 per song">$5,000 - $10,000 per song</option>
                <option value="$10,000+ per song">$10,000+ per song</option>
            </select>
        </div>
        <div class="form-group">
            <label for="message">Your Project Details: Tell me what you would like to achieve. <span style="font-weight: normal; color: #666;">(required)</span></label>
            <textarea id="message" name="message" rows="5" class="form-control" required></textarea>
        </div>
        <div class="g-recaptcha" data-sitekey="6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a"></div>
        <button type="submit" class="btn btn-primary btn-xl" style="width: 100%;">Submit Details</button>
        <p id="form-status"></p>
    </form>
    `;
    
    formContainers.forEach(container => {
        container.innerHTML = formHTML;
    });
}

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if the page has a data attribute for the form
    const pageBody = document.body;
    const formAction = pageBody.dataset.formAction || "https://formbold.com/s/3nKg0";
    const source = pageBody.dataset.source || window.location.pathname.replace(/\//g, '-').replace(/^-|-$/g, '');
    
    injectContactForm(formAction, source);
});
