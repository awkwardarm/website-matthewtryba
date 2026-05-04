/**
 * ============================================================
 * SHARED SCRIPTS — Common JavaScript for All Pages
 * ============================================================
 * 
 * PURPOSE:
 *     This file contains JavaScript utilities and initialization
 *     logic shared across all pages of the website. It provides:
 * 
 *       1. CDN image resolution (hydrateCdnImages)
 *       2. Form spam validation (validateForm)
 *       3. Contact form initialization (initializeContactForm)
 *       4. Form field invite animations (initializeFormInviteAnimation)
 *       5. Contact form scroll animations (initializeContactFormAnimation)
 *       6. Shared footer rendering (renderSharedFooter)
 *       7. Scroll-triggered animations (initializeScrollAnimations)
 * 
 * HOW IT WORKS:
 *     The file auto-initializes all features when the DOM is ready.
 *     No manual function calls are needed — just include this script
 *     in your page and all features activate automatically.
 * 
 * DEPENDENCIES:
 *     - shared-styles.css : Provides CSS classes used by animations
 *     - Squarespace footer : Expects <footer> element to exist
 * ============================================================
 */

// ============================================================
// CDN BASE — Cloudflare R2 URL
// ============================================================
// This is the single source of truth for all CDN asset URLs.
// All images with data-cdn attributes will have this prefix
// automatically prepended by hydrateCdnImages().
//
// Example: <img data-cdn="images/photo.jpg">
//          → becomes → src="https://pub-...r2.dev/images/photo.jpg"
// ============================================================
const CDN_BASE = 'https://pub-869789a451fa44dbadf9e27cd445afa0.r2.dev/';

// ============================================================
// HYDRATE CDN IMAGES
// ============================================================
// Scans the DOM for <img data-cdn="..."> elements and sets
// their src attribute to the full CDN URL.
//
// This allows you to write relative paths in HTML while
// serving assets from Cloudflare R2.
//
// Called automatically on DOMContentLoaded.
// ============================================================

/**
 * hydrateCdnImages() — Resolve all data-cdn images to full URLs
 * 
 * Finds all <img> elements with data-cdn attribute and sets
 * their src to CDN_BASE + data-cdn value.
 * 
 * Example:
 *     HTML:  <img data-cdn="images/photo.jpg">
 *     Output: <img src="https://pub-...r2.dev/images/photo.jpg">
 */
function hydrateCdnImages() {
    document.querySelectorAll('img[data-cdn]').forEach(img => {
        img.src = CDN_BASE + img.dataset.cdn;
    });
}

// ============================================================
// SPAM CONFIG — Spam Detection Settings
// ============================================================
// Configuration for form spam prevention.
// Contains patterns to block and fallback redirect URL.
//
// STRUCTURE:
//     patterns[]      : Array of spam keyword patterns
//     thankYouUrl     : Redirect URL when spam detected
// ============================================================
const SPAM_CONFIG = {
    patterns: [
         "robertduend",
         "robert duend"
         // Add more patterns as needed
     ],
    thankYouUrl: "https://www.matthewtryba.com/thank-you-home-98jkxco9012"
};

// ============================================================
// FORM VALIDATION — Spam Detection
// ============================================================
// Validates form submissions against spam patterns.
// Uses honeypot field + name pattern matching.
// ============================================================

/**
 * validateForm() — Validate contact form for spam
 * 
 * Checks:
 *    1. Honeypot field (if filled, likely a bot)
 *    2. Name field against known spam patterns
 *    3. Prevents double-submit by disabling button
 * 
 * If spam is detected, redirects to thank-you page.
 * 
 * @returns {boolean} true if valid, false if spam (redirects)
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
    
     // Check honeypot — bots often fill hidden fields
    if (honeypot) {
        console.log("Honeypot filled - spam detected");
        window.location.href = SPAM_CONFIG.thankYouUrl;
        return false;
     }
    
     // Check spam patterns — block known spam names
    for (const pattern of SPAM_CONFIG.patterns) {
        if (cleanName.includes(pattern) || strippedName.includes(pattern.replace(/\s+/g, ''))) {
            console.log(`Spam pattern "${pattern}" detected`);
            window.location.href = SPAM_CONFIG.thankYouUrl;
            return false;
         }
     }
    
     // Prevent double-submit — disable button after first click
    const btn = document.querySelector('#contact-form button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
     }

    return true;
}

// ============================================================
// CONTACT FORM INITIALIZATION
// ============================================================
// Wires up the validateForm function to the contact form.
// ============================================================

/**
 * initializeContactForm() — Wire up form validation
 * 
 * Finds the #contact-form element and attaches validateForm
 * as its onsubmit handler.
 * 
 * Called automatically on DOMContentLoaded.
 */
function initializeContactForm() {
    const form = document.getElementById('contact-form');
    if (form) {
        form.onsubmit = validateForm;
     }
}

// ============================================================
// FORM INVITE ANIMATION
// ============================================================
// Adds a pulsing highlight to the first visible input field
// in each form to invite user interaction.
// The animation stops when the field is focused.
// ============================================================

/**
 * initializeFormInviteAnimation() — Add pulse animation to first form field
 * 
 * For each <form> on the page:
 *    1. Find the first visible input/textarea
 *    2. Add .form-control--invite class (triggers CSS pulse)
 *    3. Remove class on focus (animation stops when user clicks)
 * 
 * Called automatically on DOMContentLoaded.
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

// ============================================================
// CONTACT FORM SCROLL ANIMATION
// ============================================================
// Triggers an entrance animation when the contact form scrolls
// into view, then switches to a pulsing shadow effect.
// Uses Intersection Observer for scroll detection.
// ============================================================

/**
 * initializeContactFormAnimation() — Animate form on scroll
 * 
 * Behavior:
 *    1. When #contact-form-container scrolls into view:
 *          → Trigger entrance animation (slide up + fade in)
 *    2. After entrance completes (700ms):
 *          → Switch to pulsing shadow effect (infinite loop)
 *    3. Only animates if form was NOT already visible on page load
 * 
 * Uses IntersectionObserver with 20% threshold.
 * 
 * Called automatically on DOMContentLoaded.
 */
   function initializeContactFormAnimation() {
       const formContainer = document.getElementById('contact-form-container');
       if (!formContainer) return;

        // Only animate if the element is not already visible (i.e., not in viewport on load)
       if (formContainer.classList.contains('form-entrance-active')) return;

       const observerOptions = {
           threshold: 0.2,
           rootMargin: '0px 0px -10% 0px'
        };

       const observer = new IntersectionObserver((entries) => {
           entries.forEach(entry => {
               if (entry.isIntersecting && !formContainer.classList.contains('form-entrance-active')) {
                    // Trigger entrance animation
                   formContainer.classList.add('form-entrance-active');

                    // After entrance completes, switch to pulsing effect
                   setTimeout(() => {
                       formContainer.classList.remove('form-entrance-active');
                       formContainer.classList.add('form-pulse-active');
                    }, 700); // Matches the 0.7s entrance animation duration

                   observer.unobserve(entry.target);
                 }
              });
           }, observerOptions);

       observer.observe(formContainer);
    }

// ============================================================
// SHARED FOOTER
// ============================================================
// Renders the footer into the page's <footer> element.
// Single source of truth for footer content across all pages.
// ============================================================

/**
 * renderSharedFooter() — Render shared footer HTML
 * 
 * Injects into <footer>:
 *      <div class="container">
 *          <p class="footer-tagline">You are the art.</p>
 *          <p>&copy; [YEAR] TRYBA MUSIC, LLC. All Rights Reserved.</p>
 *      </div>
 * 
 * The year updates automatically via new Date().getFullYear().
 * 
 * Called automatically on DOMContentLoaded.
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

// ============================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================
// Uses Intersection Observer to animate elements when they
// scroll into view. Elements start invisible and slide up
// + fade in when they cross the golden ratio threshold (38.2%).
// After animation, elements can re-animate when scrolled away
// and back (re-trigger effect).
// ============================================================

/**
 * initializeScrollAnimations() — Setup scroll-triggered animations
 * 
 * What it does:
 *    1. Dynamically creates <style> with animation CSS
 *    2. Finds all .scroll-animate and .scroll-animate-golden elements
 *    3. Immediately adds .animate-visible (for desktop preview)
 *    4. Sets up IntersectionObserver for scroll-triggered re-animation
 * 
 * Animation behavior:
 *    - Elements start at opacity: 0, translateY(30px)
 *    - When scrolled into view: opacity: 1, translateY(0)
 *    - When scrolled out: class removed
 *    - When scrolled back in: class re-added (re-trigger)
 * 
 * Golden ratio trigger: 38.2% from top of viewport
 * 
 * Mobile adjustments: Reduced translateY (20px vs 30px)
 * Accessibility: Respects prefers-reduced-motion
 * 
 * Called automatically on DOMContentLoaded.
 */
     function initializeScrollAnimations() {
           // Create animation styles dynamically (only once)
       const styleId = 'scroll-animations-style';
       if (!document.getElementById(styleId)) {
         const style = document.createElement('style');
         style.id = styleId;
         style.textContent = `
               .scroll-animate {
             opacity: 0;
             transform: translateY(30px);
             transition: opacity 0.6s ease-out, transform 0.6s ease-out;
             will-change: transform, opacity;
               }
               .scroll-animate.animate-visible {
             opacity: 1;
             transform: translateY(0);
             will-change: auto;
               }
               @keyframes goldenShadowPulse {
                 0% {
               box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06), 0 0 0 0 rgba(245, 166, 35, 0);
                 }
                 50% {
               box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1), 0 0 20px 5px rgba(245, 166, 35, 0.2);
                 }
                 100% {
               box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1), 0 0 10px 2px rgba(245, 166, 35, 0.1);
                 }
               }
               .scroll-animate-golden {
             opacity: 0;
             transform: translateY(40px);
             transition: opacity 0.6s ease-out, transform 0.6s ease-out;
             will-change: transform, opacity;
               }
               .scroll-animate-golden.animate-visible {
             opacity: 1;
             transform: translateY(0);
             will-change: auto;
             animation: goldenShadowPulse 1.2s ease-out 0.4s forwards;
               }
               @media (max-width: 768px) {
                 .scroll-animate,
                 .scroll-animate-golden {
               transform: translateY(20px);
                 }
               }
               @media (prefers-reduced-motion: reduce) {
                 .scroll-animate,
                 .scroll-animate-golden {
               opacity: 1;
               transform: none;
               transition: none;
               will-change: auto;
                 }
                 @keyframes goldenShadowPulse {
                   0%, 100% { box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06); }
                 }
               }
             `;
         document.head.appendChild(style);
           }

           // Get all elements that should have scroll animations
       const animatedElements = document.querySelectorAll('.scroll-animate, .scroll-animate-golden');

           // IMMEDIATE: Add animate-visible to all elements right away.
           // This ensures elements are visible in desktop preview and on page load.
       animatedElements.forEach(el => {
         el.classList.add('animate-visible');
           });

           // Scroll-triggered re-animation: Use Intersection Observer to re-trigger
           // the animation when elements scroll back into view after being hidden.
       const GOLDEN_RATIO_TRIGGER = 0.382;
       const observerOptions = {
         threshold: 0,
         rootMargin: `${GOLDEN_RATIO_TRIGGER * 100}%px 0px -${(1 - GOLDEN_RATIO_TRIGGER) * 100}%px 0px`
           };

       const observer = new IntersectionObserver((entries) => {
         entries.forEach(entry => {
           if (entry.isIntersecting) {
             entry.target.classList.add('animate-visible');
               } else {
                // Remove class when element scrolls out of view, so it re-animates on return
             entry.target.classList.remove('animate-visible');
               }
              });
           }, observerOptions);

           // Observe all animated elements for scroll-triggered re-animation
       animatedElements.forEach(el => {
         observer.observe(el);
           });
          }

// ============================================================
// AUTO-INITIALIZATION
// ============================================================
// Wires up all shared features to run when DOM is ready.
// Handles both lazy-loaded and already-ready DOM states.
//
// FLOW:
//    if (document.readyState === 'loading') {
//          → Wait for DOMContentLoaded, then init all
//     } else {
//          → DOM already ready, init immediately
//     }
//
// INITIALIZED FEATURES (in order):
//    1. initializeContactForm()           — Form spam validation
//    2. hydrateCdnImages()               — CDN image resolution
//    3. initializeFormInviteAnimation()  — Pulse first field
//    4. initializeContactFormAnimation() — Scroll entrance
//    5. renderSharedFooter()             — Render footer
//    6. initializeScrollAnimations()     — Scroll animations
// ============================================================

   // Auto-initialize when DOM is ready
   if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
          initializeContactForm();
          hydrateCdnImages();
          initializeFormInviteAnimation();
          initializeContactFormAnimation();
          renderSharedFooter();
          initializeScrollAnimations();
         });
     } else {
      initializeContactForm();
      hydrateCdnImages();
      initializeFormInviteAnimation();
      initializeContactFormAnimation();
      renderSharedFooter();
      initializeScrollAnimations();
     }
