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
   * Triggers an entrance animation on the contact form when it scrolls
   * into view, then switches to a subtle pulsing shadow effect.
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

/**
     * Scroll-triggered animations using Intersection Observer.
     * Triggers when elements cross the golden ratio threshold (38.2% from top).
     * All animations are hover-independent and mobile-friendly.
     * Also handles elements already in viewport on page load (desktop fallback).
     */
    function initializeScrollAnimations() {
         // Create animation styles dynamically
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
