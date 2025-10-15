<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Matthew Tryba | Music Producer</title>
    <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <style>
        /*--------------------------------------------------*/
        /* 1. Global Styles & Typography */
        /*--------------------------------------------------*/
        :root {
            --primary-color: #0d0d0d;
            --secondary-color: #5a5a5a;
            --background-color: #ffffff;
            --accent-color: #1a73e8;
            --surface-color: #f8f9fa;
            --border-color: #dee2e6;
        }
        html { scroll-behavior: smooth; }
        body {
            margin: 0;
            font-family: "Futura PT", sans-serif;
            background-color: var(--background-color);
            color: var(--primary-color);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 0 20px;
        }
        h1, h2, h3 {
            font-weight: 700;
            line-height: 1.2;
            color: var(--primary-color);
        }
        h1 { font-size: 2.8rem; margin-bottom: 1rem; }
        h2 { font-size: 2.2rem; margin-bottom: 2rem; text-align: center;}
        h3 { font-size: 1.5rem; }
        p {
            font-size: 1.1rem;
            color: var(--secondary-color);
            margin-bottom: 1rem;
        }
        .btn {
            display: inline-block;
            padding: 12px 28px;
            background-color: var(--accent-color);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            transition: background-color 0.3s ease;
            border: none;
            cursor: pointer;
            font-size: 1.1rem;
        }
        .btn:hover { background-color: #1765c6; }
        .btn-secondary {
            background-color: transparent;
            color: var(--primary-color);
            border: 1px solid var(--border-color);
        }
        .btn-secondary:hover {
            background-color: var(--surface-color);
        }
        /* Section padding: adjust this value for more/less space between sections */
        section { padding: 20px 0; } /* was 80px 0 */

        /*--------------------------------------------------*/
        /* 3. Hero Section */
        /*--------------------------------------------------*/
        .hero { text-align: center; padding: 20px 0; }
        .hero-subheadline {
            font-size: 1.3rem;
            color: var(--secondary-color);
            max-width: 650px;
            margin: 0 auto 2rem auto;
        }
        .hero-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 2rem;
        }

        /*--------------------------------------------------*/
        /* 4. Social Proof (Album Art) Section */
        /*--------------------------------------------------*/
        .social-proof { padding: 20px 0; background-color: var(--surface-color); }
        .social-proof h3 {
             text-align:center; color: var(--secondary-color); font-weight: 500;
             margin-bottom: 2rem; text-transform: uppercase; letter-spacing: 1px; font-size: 0.9rem;
        }
        .logos { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 30px; }
        .logos img {
            max-height: 120px; width: 120px; object-fit: cover; border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08); transition: transform 0.3s ease;
        }
        .logos img:hover { transform: scale(1.05); }

        /*--------------------------------------------------*/
        /* 5. Services Section */
        /*--------------------------------------------------*/
        .services-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;            
            text-align: center;
        }
        .service-card {
            background: var(--surface-color);
            padding: 30px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        .service-card svg { color: var(--accent-color); margin-bottom: 1rem; }
        .service-card h3 { margin-bottom: 1rem; }

        /*--------------------------------------------------*/
        /* 6. Feature (About Intro) & Testimonials */
        /*--------------------------------------------------*/
        .feature-section .container { display: flex; align-items: center; gap: 60px; }
        .feature-section .text-content, .feature-section .image-content { flex: 1; }
        .feature-section .image-content img { width: 100%; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .feature-section h2 { text-align: left; }

        .testimonial-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
        .testimonial-card {
            background-color: var(--surface-color); border: 1px solid var(--border-color);
            border-radius: 8px; padding: 25px; display: flex; flex-direction: column;
        }
        .testimonial-card .quote-headline {
            font-size: 1.25rem; font-weight: 700; color: var(--primary-color);
            margin-bottom: 1rem; position: relative; padding-left: 30px;
        }
        .quote-headline::before {
            content: '“'; position: absolute; left: 0; top: -10px; font-size: 3rem;
            color: var(--accent-color); font-family: Georgia, serif;
        }
        .testimonial-card .quote-body { font-style: italic; color: var(--secondary-color); margin-bottom: 1.5rem; }
        .testimonial-author {
            margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color);
            display: flex; align-items: center;
        }
        .testimonial-author img { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; object-fit: cover; }
        .author-info .name { font-weight: 700; color: var(--primary-color); }
        .author-info .rating { color: #ffc107; font-size: 1rem; }

        /*--------------------------------------------------*/
        /* 7. CTA Section & Footer */
        /*--------------------------------------------------*/
        .cta-section { background-color: var(--accent-color); color: white; text-align: center; }
        .cta-section h2, .cta-section p { color: white; }
        .cta-section .btn { background-color: white; color: var(--accent-color); font-weight: 700; }
        .cta-section .btn:hover { background-color: #f0f0f0; }
        footer { text-align: center; padding: 30px; font-size: 0.9rem; color: var(--secondary-color); background: var(--surface-color); }

        /*--------------------------------------------------*/
        /* 8. Contact Form Styles */
        /*--------------------------------------------------*/
        .contact-form-section { background-color: var(--surface-color); }
        .contact-form-section h2 { text-align: center; }
        .contact-form-section .form-subtitle { text-align: center; max-width: 600px; margin: 0 auto 2rem auto; }
        .form-container { max-width: 700px; margin: 0 auto; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; color: var(--primary-color); }
        .form-group input, .form-group textarea, .form-group select {
            width: 100%;
            padding: 12px;
            font-size: 1rem;
            border: 1px solid var(--border-color);
            border-radius: 5px;
            font-family: inherit;
            box-sizing: border-box; /* Added for consistent sizing */
            background-color: white; /* Ensure select has a background */
        }
        .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
            outline: none;
            border-color: var(--accent-color);
            box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
        }
        .form-group textarea { min-height: 150px; resize: vertical; }
        .form-submit-btn { width: 100%; }
        .g-recaptcha { margin-bottom: 1.5rem; }

        /*--------------------------------------------------*/
        /* 9. Responsive Styles */
        /*--------------------------------------------------*/
        @media (max-width: 1100px) {
            .services-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
            .services-grid, .testimonial-grid { grid-template-columns: 1fr; }
            .feature-section .container { flex-direction: column; }
            .feature-section h2 { text-align: center; }
        }
        @media (max-width: 768px) {
            h1 { font-size: 2.2rem; }
            h2 { font-size: 1.8rem; }
        }
        
        /* Honeypot field styling - invisible to humans but accessible to bots */
        .honeypot-field {
            display: none !important; /* Standard way to hide fields that systems recognize as honeypots */
        }
    </style>
</head>
<body>

    <section class="hero">
        <div class="container">
            <h1>Major Label Sound for Independent Artists</h1>
            <p class="hero-subheadline">I'm a Denver-based music producer specializing in transforming your raw song ideas into professional, streaming-ready records with RIAA Diamond-certified quality.</p>
            <div class="hero-buttons">
                 <a href="#contact" class="btn">Start The Conversation</a>
                <a href="/work" class="btn btn-secondary">See My Work</a>
            </div>
        </div>
    </section>

    <section class="social-proof">
        <div class="container">
            <h3>ENGINEERING CREDITS ON DIAMOND, MULTI-PLATINUM, & GRAMMY-WINNING RECORDS</h3>
            <div class="logos">
                <img src="https://github.com/awkwardarm/website-matthewtryba/blob/main/images/album-art/Taylor%20Swift%201989.jpg?raw=true" alt="Taylor Swift 1989 Album Art">
                <img src="https://github.com/awkwardarm/website-matthewtryba/blob/main/images/album-art/Arana%20Grande%20My%20Everything.jpg?raw=true" alt="Ariana Grande My Everything Album Art">
                <img src="https://github.com/awkwardarm/website-matthewtryba/blob/main/images/album-art/1R%20Native.jpg?raw=true" alt="OneRepublic Native Album Art">
                <img src="https://github.com/awkwardarm/website-matthewtryba/blob/main/images/album-art/Adele%2025.jpg?raw=true" alt="Adele 25 Album Art">
                <img src="https://github.com/awkwardarm/website-matthewtryba/blob/main/images/album-art/Maroon%205%20V.jpg?raw=true" alt="Maroon 5 V Album Art">
                <img src="https://github.com/awkwardarm/website-matthewtryba/blob/main/images/album-art/burn-ellie-goulding.jpg?raw=true" alt="Ellie Goulding Burn Single Art">
            </div>
        </div>
    </section>
    
    <!-- Bio/Feature section moved down -->
    <section class="feature-section">
        <div class="container">
            <div class="image-content">
                <img src="https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/refs/heads/main/images/profile-photos/profile-photo-IMG_5596.jpeg" alt="Matthew Tryba in his studio">
            </div>
            <div class="text-content">
                <h2>Your Partner In Sound</h2>
                <p>My career began as an engineer for some of music's biggest names, including Ryan Tedder of OneRepublic, which gave me a masterclass in what separates a good song from a global hit. Now, I bring that same major-label process and sonic excellence to every independent artist I partner with.</p>
                <div style="text-align:center;">
                    <a href="/about" class="btn">Learn More About Me</a>
                </div>
            </div>
        </div>
    </section>
    
    <!-- Moved up: How I Can Help -->
    <section class="services" style="background-color: var(--surface-color);">
        <div class="container">
            <h2>How I Can Help</h2>
            <div class="services-grid">
                <div class="service-card">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
                    <h3>Vocal Production</h3>
                    <p>Crafting powerful, authentic vocal performances that make your song unforgettable.</p>
                </div>
                <div class="service-card">
                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                    <h3>Full Production</h3>
                    <p>An end-to-end service taking your raw idea to a commercially competitive, streaming-ready master.</p>
                </div>
                <div class="service-card">
                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="4" y2="20"></line><line x1="4" x2="4" y1="10" y2="14"></line><line x1="20" x2="20" y1="10" y2="14"></line></svg>
                    <h3>Mixing & Mastering</h3>
                    <p>Balancing and enhancing all sonic elements to achieve a polished, professional sound.</p>
                </div>
                <div class="service-card">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
                    <h3>Sync Licensing</h3>
                    <p>For select projects, I leverage industry connections to pitch your music for placement in film, TV, and ads.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="testimonials">
        <div class="container">
            <h2>What Artists Are Saying</h2>
            <div class="testimonial-grid">
                <div class="testimonial-card">
                    <p class="quote-headline">"Matthew is the best vocal producer I've found - his ear training is unmatched."</p>
                    <p class="quote-body">If you are serious about your song and want it the strongest it can be he is your guy!</p>
                    <div class="testimonial-author">
                        <img src="https://images.squarespace-cdn.com/content/v1/57f01c31d482e918dc2ca91a/8586f24a-abf9-4282-b912-701a9a4eef68/hunter+m.webp" alt="Hunter M Headshot">
                        <div class="author-info">
                            <span class="name">Hunter M.</span>
                            <span class="rating">★★★★★</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p class="quote-headline">"Matthew was a great visionary! Really brought the song I've written to life... on a song that needed direction."</p>
                    <p class="quote-body">Professional and patient. Really gave his own stamp on the song... I will be continuing to work with him on future projects!</p>
                    <div class="testimonial-author">
                        <img src="https://images.squarespace-cdn.com/content/v1/57f01c31d482e918dc2ca91a/ad81a661-a4db-4df4-b882-1e6c507be5ae/Cupnoodle.jpg" alt="Cupnoodle Headshot">
                        <div class="author-info">
                            <span class="name">Cupnoodle</span>
                            <span class="rating">★★★★★</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p class="quote-headline">"I came to Matt after being frustrated with other producers putting their own spin on my music instead of listening to what my needs were."</p>
                    <p class="quote-body">He has a great way of capitalizing on your strengths and building off of your writing style. He exceeded my expectations.</p>
                    <div class="testimonial-author">
                        <img src="https://images.squarespace-cdn.com/content/v1/57f01c31d482e918dc2ca91a/320289df-a4f8-4507-9694-4330abbbda0f/lindsey+leigh.webp" alt="Lindsey Leigh Headshot">
                        <div class="author-info">
                            <span class="name">Lindsey Leigh</span>
                            <span class="rating">★★★★★</span>
                        </div>
                    </div>
                </div>
                <div class="testimonial-card">
                    <p class="quote-headline">"I am happy to say that my voice never sounded better... He was easy to work with and great at always communicating."</p>
                    <p class="quote-body">His production was spot on... Will definitely use again.</p>
                    <div class="testimonial-author">
                        <img src="https://images.squarespace-cdn.com/content/v1/57f01c31d482e918dc2ca91a/c0e9a213-8e9b-4637-b2c9-f922e3f78a13/matteo+s+image.jpeg" alt="Matteo S Headshot">
                        <div class="author-info">
                            <span class="name">Matteo S.</span>
                            <span class="rating">★★★★★</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <section id="contact" class="contact-form-section">
        <div class="container">
            <h2>Tell Me About Your Vision</h2>
            <p class="form-subtitle">Ready to start your next project with me? Send me a message and I will get back to you as soon as possible!</p>
            <div class="form-container">
                <form action="https://formbold.com/s/3nK2A" method="POST" id="contactForm" onsubmit="return validateForm()">
                    <input type="hidden" name="_redirect" value="https://www.matthewtryba.com/thank-you-home-98jkxco9012">
                    
                    <!-- Honeypot field using a standard name that Formbold might recognize as honeypot -->
                    <div class="form-group honeypot-field">
                        <label for="_honeypot">Leave this field empty</label>
                        <input type="text" id="_honeypot" name="_honeypot" autocomplete="off" tabindex="-1">
                    </div>
                    
                    <div class="form-group">
                        <label for="name">Full Name <span style="font-weight: normal; color: #666;">(required)</span></label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email Address <span style="font-weight: normal; color: #666;">(required)</span></label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="budget">What is your approximate budget for this project? <span style="font-weight: normal; color: #666;">(required)</span></label>
                        <select id="budget" name="budget" required>
                            <option value="" disabled selected>Please select a range...</option>
                            <option value="$1,500 - $3,000 per song">$1,500 - $3,000 per song</option>
                            <option value="$3,000 - $5,000 per song">$3,000 - $5,000 per song</option>
                            <option value="$5,000 - $10,000 per song">$5,000 - $10,000 per song</option>
                            <option value="$10,000+ per song">$10,000+ per song</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="message">Your Project Details: Tell me what you would like to achieve. <span style="font-weight: normal; color: #666;">(required)</span></label>
                        <textarea id="message" name="message" rows="5" required></textarea>
                    </div>
                    <div class="g-recaptcha" data-sitekey="6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a"></div>
                    <button type="submit" class="btn form-submit-btn">Submit Details</button>
                </form>
            </div>
        </div>
    </section>
    
    <!-- Font Awesome icons (free version) -->
    <script src="https://kit.fontawesome.com/a076d05399.js" crossorigin="anonymous"></script>
    <footer>
        <div class="container">
            <p>&copy; 2025 TRYBA MUSIC, LLC. All Rights Reserved.</p>
        </div>
    </footer>

    <!-- Add validation script before the closing body tag -->
    <script>
        // Spam detection list - add new patterns here as needed
        const spamPatterns = [
            "robertduend",
            "robert duend"
            // Add more patterns as needed, e.g.,
            // "another-spam-name",
            // "yet-another-spammer"
        ];
        
        function validateForm() {
            // Get the honeypot field value
            const honeypot = document.getElementById('_honeypot').value;
            
            // Get the name field value and clean it
            // 1. Convert to lowercase
            // 2. Remove extra whitespace
            // 3. Remove non-alphanumeric characters
            const rawName = document.getElementById('name').value;
            const cleanName = rawName.toLowerCase()
                                  .replace(/\s+/g, ' ')    // Normalize spaces
                                  .trim();                 // Remove leading/trailing whitespace
            
            // Also create a stripped version with only alphanumeric chars
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
    </script>

    <!-- Only load on landing pages -->
    <script>
    if (window.location.pathname.includes('/landing-page')) {
        // Load CSS with a more specific name
        const landingCSS = document.createElement('link');
        landingCSS.rel = 'stylesheet';
        landingCSS.href = 'https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/css/landing_page_stylesheet.css';
        document.head.appendChild(landingCSS);
    }
    </script>
</body>
</html>