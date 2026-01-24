# Creating New Pages

## Quick Start

1. Copy an existing template
2. Update content and configuration
3. Add to `page-configs.js`
4. Set up Google Ads conversion tracking
5. Deploy to Squarespace

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
- `redirectUrl` - Where users go after submission (**Must include `?source=` parameter for tracking**)
- `recaptchaSiteKey` - Your Google reCAPTCHA key
- `heroImage` / `aboutImage` - Image URLs from GitHub

---

## Step 4: Set Up Google Ads Conversion Tracking

**Critical for measuring campaign ROI!** Each landing page needs unique tracking.

### Add Source Parameter to Redirect URL

The `?source=` parameter identifies which landing page generated the conversion.

**Format:**
```
https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-CAMPAIGN-NAME
```

**Examples:**
```javascript
'la-landing': {
    redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-la'
}

'nashville-studio': {
    redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-nashville-studio'
}

'google-ads-test-a': {
    redirectUrl: 'https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-google-ads-test-a'
}
```

### Naming Convention for Source Parameter

Use this format: `landing-page-[campaign-identifier]`

**Good examples:**
- `landing-page-la` (geographic)
- `landing-page-nashville-studio` (service + location)
- `landing-page-vocal-production` (service-specific)
- `landing-page-summer-promo-2026` (campaign)
- `landing-page-google-ads-test-a` (A/B testing)

**Why this matters:**
- Google Ads tracks conversions based on the thank-you page URL
- The `?source=` parameter lets you identify which ad/campaign drove the conversion
- You can see conversion data per landing page in Google Ads reports

### Set Up Google Ads Conversion Tracking

**In Google Ads:**

1. **Go to:** Tools & Settings → Measurement → Conversions
2. **Create new conversion action:**
   - Conversion name: `Form Submit - LA Landing Page` (match your landing page)
   - Category: Lead
   - Value: Assign estimated lead value
   - Count: One (per conversion)
   
3. **Set conversion URL:**
   - Use your thank-you page URL with source parameter
   - Example: `https://www.matthewtryba.com/thank-you-8399akkgak3214?source=landing-page-la`
   - Match should be: `URL equals` or `URL contains landing-page-la`

4. **Verify tracking:**
   - Test submit form on your new landing page
   - Check that conversion appears in Google Ads within 24 hours
   - Verify source parameter is being tracked

### Google Tag Manager (Optional but Recommended)

If using GTM for advanced tracking:

1. Create a **Custom Event Trigger** for form submissions
2. Add **Data Layer Variable** to capture the source parameter
3. Send conversion event to Google Ads with source as a custom parameter

**Example data layer push:**
```javascript
dataLayer.push({
    'event': 'form_submission',
    'landing_page': 'la-landing',
    'source': 'landing-page-la'
});
```

### Verify Google Ads Tag is Active

Your global Google Ads tag loads via Code Injection (already set up):

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17389653886"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-17389653886');
</script>
```

This tag is **site-wide** and tracks all pages automatically. You don't need to add it to individual pages.

### Testing Conversion Tracking

**After deploying your new landing page:**

1. **Submit a test form** on your new landing page
2. **Check Google Ads** (Tools → Conversions → All conversions)
3. **Verify:**
   - Conversion appears within 24 hours
   - Source parameter is captured
   - Attributed to correct campaign

**Troubleshooting:**
- If conversion doesn't appear: Check thank-you page URL matches exactly
- If wrong campaign: Verify source parameter is unique per landing page
- If no attribution: Ensure Google Ads tag is firing (use Chrome DevTools → Network tab)

---

## Step 5: Test Locally

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
- **Verify the redirect URL includes the correct `?source=` parameter**

---

## Step 6: Update CHANGELOG.md

Before deploying, document your new landing page in `CHANGELOG.md`:

```markdown
## [1.0.4] - 2026-01-02

### Added
- New Los Angeles landing page (`landing-page-los-angeles.html`)
  - Configured for LA-specific Google Ads campaigns
  - Custom hero image and copy for LA market
  - Tracking parameter: `?source=landing-page-la`
```

**This helps you:**
- Track when pages were created
- Remember which campaigns are active
- See version history at a glance

---

## Step 7: Deploy to Squarespace

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
