# Creating New Pages

## Quick Start

1. Copy an existing template
2. Update content and configuration
3. Add to `page-configs.js`
4. Deploy to Squarespace

---

## Step 1: Choose a Template

### Landing Pages
Use: `pages-landing/landing-page-template.html`

**When to use:**
- Lead generation campaigns
- Specific service offerings
- Geographic targeting (e.g., "Denver Recording Studio")
- A/B testing different messaging

**Features:**
- Hero section with image
- Social proof (album art)
- Testimonials
- Contact form with reCAPTCHA

### Main Site Pages
Use: `pages-main/home-page.html`

**When to use:**
- Main navigation pages
- General service descriptions
- About/Work portfolio pages

**Features:**
- Services grid
- Feature sections
- Full production showcase

### Thank You Pages
Use: `pages-thank-you/thank-you-home.html`

**When to use:**
- Form submission confirmations
- Download delivery
- Next steps after contact

---

## Step 2: Copy and Customize Template

### Example: Creating "landing-page-los-angeles.html"

```bash
# Copy the template
cd pages-landing
cp landing-page-national.html landing-page-los-angeles.html
```

### Update the HTML

**1. Change the page title:**
```html
<title>Matthew Tryba | Music Producer in Los Angeles</title>
```

**2. Update the hero headline:**
```html
<h1>Los Angeles Music Production</h1>
<p class="hero-subheadline">Professional music production in the heart of LA...</p>
```

**3. Update the page-specific script at the bottom:**
```html
<script>
    document.addEventListener('DOMContentLoaded', function() {
        const pageConfig = getPageConfig('la-landing'); // Changed from 'national-landing'
        
        document.getElementById('contact-form').action = pageConfig.formAction;
        document.getElementById('form-redirect').value = pageConfig.redirectUrl;
        document.querySelector('.g-recaptcha').setAttribute('data-sitekey', pageConfig.recaptchaSiteKey);
        document.getElementById('hero-image').src = pageConfig.heroImage;
        document.getElementById('about-image').src = pageConfig.aboutImage;
    });
</script>
```

---

## Step 3: Add Configuration

Edit `assets/page-configs.js` and add your new page:

```javascript
const PAGE_CONFIGS = {
    'main-landing': { ... },
    'national-landing': { ... },
    'recording-studio': { ... },
    
    // Add your new page here
    'la-landing': {
        formAction: 'https://formbold.com/s/3nKg0',
        redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-la',
        recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
        heroImage: 'https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/main/images/profile-photos/profile-photo-IMG_5596.jpeg',
        aboutImage: 'https://github.com/awkwardarm/website-matthewtryba/blob/main/images/profile-photos/profile-photo-IMG_5507.jpeg?raw=true'
    }
};
```

**Important fields:**
- `formAction` - Where the form submits (Formbold endpoint)
- `redirectUrl` - Where users go after submission (add `?source=` for tracking)
- `recaptchaSiteKey` - Your Google reCAPTCHA key
- `heroImage` / `aboutImage` - Image URLs from GitHub

---

## Step 4: Test Locally

**1. Uncomment local asset paths:**
```html
<!-- Load Assets for Local Preview, Comment out when deploying -->
<link rel="stylesheet" href="../assets/shared-styles.css"> 
<script src="../assets/shared-scripts.js"></script>  
<script src="../assets/page-configs.js"></script>
```

**2. Open in browser:**
```bash
# macOS
open pages-landing/landing-page-los-angeles.html

# Or just double-click the file
```

**3. Test the form:**
- Fill out all fields
- Submit and verify redirect works
- Check reCAPTCHA loads correctly

---

## Step 5: Deploy to Squarespace

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions.

**Quick version:**

1. **Comment out local paths** in your HTML:
```html
<!-- Load Assets for Local Preview, Comment out when deploying -->
<!-- <link rel="stylesheet" href="../assets/shared-styles.css"> 
<script src="../assets/shared-scripts.js"></script>  
<script src="../assets/page-configs.js"></script>  -->
```

2. **Copy the HTML content** (everything in `<body>`)

3. **In Squarespace:**
   - Add new page
   - Add a Code Block
   - Paste your HTML
   - Save and publish

---

## Page-Specific Customization

### Adding Page-Only Styles

If you need styles that ONLY apply to this page, add them in the `<style>` section:

```html
<style>
    /* Page-specific overrides */
    .hero {
        background-color: #f0f0f0; /* LA page only */
    }
</style>
```

### Using Different Images

Update the `page-configs.js` to point to different images:

```javascript
'la-landing': {
    heroImage: 'https://raw.githubusercontent.com/.../la-studio.jpeg',
    aboutImage: 'https://raw.githubusercontent.com/.../la-profile.jpeg'
}
```

### Changing Form Destination

To send form submissions to a different endpoint:

```javascript
'la-landing': {
    formAction: 'https://formbold.com/s/DIFFERENT_ID',
    redirectUrl: 'https://www.matthewtryba.com/thank-you-la',
    // ...
}
```

---

## Best Practices

### ✅ Do:
- Use semantic page config names (`la-landing`, `nashville-studio`, etc.)
- Add `?source=` tracking to redirect URLs
- Test forms locally before deploying
- Comment out local asset paths before copying to Squarespace
- Use version tags for deployments

### ❌ Don't:
- Duplicate CSS in page-specific `<style>` tags (use shared-styles.css)
- Hardcode form actions in HTML (use page-configs.js)
- Forget to add new pages to page-configs.js
- Deploy without testing locally first

---

## Troubleshooting

**Form doesn't submit:**
- Check `formAction` URL is correct
- Verify reCAPTCHA key is valid
- Check browser console for JavaScript errors

**Images don't load:**
- Verify GitHub image URLs are correct
- Use `?raw=true` at end of GitHub URLs
- Check that images exist in your repo

**Styles look wrong:**
- Verify Code Injection has correct version tag
- Hard refresh browser (Cmd+Option+I → Right-click reload → Empty Cache and Hard Reload)
- Check that local asset paths are commented out

**Config not found:**
- Verify page name in `getPageConfig('page-name')` matches key in `page-configs.js`
- Check for typos in config names
- Ensure `page-configs.js` was deployed with correct version tag
