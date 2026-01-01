# Squarespace Deployment Guide

## ✅ File Organization Verification

Your repository is now properly organized:

```
website-matthewtryba/
├── assets/                          ← Shared resources (CSS/JS)
│   ├── page-configs.js
│   ├── shared-scripts.js
│   ├── shared-styles.css
│   └── squarespace-overrides.css
├── docs/                            ← Documentation
│   ├── CSS-ORGANIZATION.md
│   └── SQUARESPACE-DEPLOYMENT.md    ← This file
├── images/                          ← Image assets
├── pages-landing/                   ← Landing page templates
│   ├── landing-page.html
│   ├── landing-page-template.html
│   ├── landing-page-national.html
│   └── landing-page-recording-studio.html
├── pages-main/                      ← Main site pages
│   ├── about.html
│   ├── home-page.html
│   └── work.html
└── pages-thank-you/                 ← Thank you page templates
    ├── thank-you-home.html
    ├── thank-you-studio-denver.html
    └── thank-you.html
```

---

## 🔗 CDN URLs (After Merging to Main)

### Using jsDelivr CDN (Recommended)

Once you merge your branch to `main`, these URLs will work:

```
https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/shared-styles.css
https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/squarespace-overrides.css
https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/shared-scripts.js
https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/page-configs.js
```

### Using GitHub Raw URLs (Slower)

```
https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/main/assets/shared-styles.css
https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/main/assets/squarespace-overrides.css
https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/main/assets/shared-scripts.js
https://raw.githubusercontent.com/awkwardarm/website-matthewtryba/main/assets/page-configs.js
```

---

## 📋 Squarespace Code Injection Setup

### Step 1: Navigate to Code Injection

1. Login to Squarespace
2. Go to **Settings** → **Advanced** → **Code Injection**

### Step 2: Add Header Code

Paste this in the **HEADER** section:

```html
<!-- Google Ads Verification & Tracking -->
<meta name="google-site-verification" content="C6rIbGf37oPNtwidRGBKWA6wnrsLsSVH9P4v8ZzXo9E" />

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-17389653886"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'AW-17389653886');
</script>

<!-- Global CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/shared-styles.css">

<!-- Squarespace-specific overrides -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/squarespace-overrides.css">
```

### Step 3: Add Footer Code

Paste this in the **FOOTER** section:

```html
<!-- Global JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/shared-scripts.js"></script>
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/page-configs.js"></script>
```

### Step 4: Save Changes

Click **Save** at the top of the page.

---

## 🚀 Deployment Workflow

### Before Merging to Main

1. ✅ Verify all files are in correct folders
2. ✅ Test HTML files locally (if possible)
3. ✅ Check that all paths reference `/s/` for Squarespace compatibility
4. ✅ Commit and push all changes to your feature branch

### Merging to Main

```bash
# Switch to main branch
git checkout main

# Pull latest changes
git pull origin main

# Merge your feature branch
git merge your-feature-branch

# Push to GitHub
git push origin main
```

### After Merging

1. **Wait 5-10 minutes** for jsDelivr to pick up the changes
2. Test the CDN URLs in your browser:
   - Open: `https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/shared-styles.css`
   - You should see your CSS code
3. Clear Squarespace cache (hard refresh: Cmd+Shift+R)
4. Test your landing pages

---

## 🔄 Update Workflow (After Initial Setup)

### When You Make Changes to CSS/JS:

1. Edit files in your local repository
2. Commit and push to `main`:
   ```bash
   git add assets/shared-styles.css
   git commit -m "Update hero section styles"
   git push origin main
   ```
3. **Wait 24-48 hours** for jsDelivr cache to update

### To Force Immediate Updates:

Add a version parameter to your Code Injection:

```html
<!-- Version 1.0.1 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/shared-styles.css?v=1.0.1">
```

Increment the version number (`v=1.0.2`, `v=1.0.3`, etc.) each time you need immediate updates.

---

## 📝 Creating New Landing Pages in Squarespace

### Step 1: Add New Config

Edit [`assets/page-configs.js`](../assets/page-configs.js) and add:

```javascript
'studio-denver': {
    formAction: 'https://formbold.com/s/YOUR_FORM_ID',
    redirectUrl: 'https://www.matthewtryba.com/thank-you-studio-denver',
    recaptchaSiteKey: '6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a',
    heroImage: 'https://example.com/studio-hero.jpg',
    aboutImage: 'https://example.com/studio-about.jpg'
}
```

### Step 2: Create Page in Squarespace

1. Go to **Pages** → Click **+**
2. Select **Blank Page**
3. Name it (e.g., "Landing - Denver Studio")
4. Click **Add Section** → **Code**

### Step 3: Paste HTML

Copy from [`pages-landing/landing-page-template.html`](../pages-landing/landing-page-template.html) but:

**⚠️ Remove these tags:**
- `<!DOCTYPE html>`
- `<html>`, `</html>`
- `<head>`, `</head>`
- `<body>`, `</body>`

**Only paste the content inside `<body>`:**

```html
<section class="hero">
    <!-- ... all sections ... -->
</section>

<!-- ... -->

<footer>
    <p>&copy; 2025 TRYBA MUSIC, LLC. All Rights Reserved.</p>
</footer>

<!-- Scripts -->
<script src="https://www.google.com/recaptcha/api.js" async defer></script>
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/shared-scripts.js"></script>
<script src="https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@main/assets/page-configs.js"></script>

<script>
    // CHANGE THIS to match your new config
    const pageConfig = getPageConfig('studio-denver');
    
    document.getElementById('contact-form').action = pageConfig.formAction;
    document.getElementById('form-redirect').value = pageConfig.redirectUrl;
    document.querySelector('.g-recaptcha').setAttribute('data-sitekey', pageConfig.recaptchaSiteKey);
    document.getElementById('hero-image').src = pageConfig.heroImage;
    document.getElementById('about-image').src = pageConfig.aboutImage;
</script>
```

### Step 4: Configure Code Block

1. Click the **gear icon** (⚙️) on the code block
2. Set **Display Mode** to **HTML**
3. Click **Apply**

---

## ✅ Pre-Deployment Checklist

Before merging to main and deploying to Squarespace:

- [ ] All CSS files are in `assets/` folder
- [ ] All JS files are in `assets/` folder
- [ ] HTML files reference `/s/` paths (for Squarespace)
- [ ] [`page-configs.js`](../assets/page-configs.js) has all necessary configs
- [ ] [`shared-styles.css`](../assets/shared-styles.css) includes all global styles
- [ ] [`squarespace-overrides.css`](../assets/squarespace-overrides.css) has block-specific CSS
- [ ] All changes committed to Git
- [ ] Branch merged to `main`
- [ ] Changes pushed to GitHub
- [ ] CDN URLs tested in browser
- [ ] Code Injection added to Squarespace

---

## 🐛 Troubleshooting

### CSS Not Loading

**Problem:** Styles aren't applying
**Solutions:**
1. Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
2. Check browser console (F12) for errors
3. Verify CDN URL in browser (should show CSS code)
4. Check that Code Injection is saved
5. Try adding `?v=1` to CSS URL to bypass cache

### JavaScript Not Working

**Problem:** Forms not submitting, spam detection not working
**Solutions:**
1. Check browser console for JavaScript errors
2. Verify [`page-configs.js`](../assets/page-configs.js) is loading before initialization script
3. Make sure `getPageConfig()` function name matches
4. Check that form element IDs match JavaScript selectors

### Images Not Loading

**Problem:** Hero or about images not showing
**Solutions:**
1. Verify image URLs in [`page-configs.js`](../assets/page-configs.js)
2. Check that image URLs are publicly accessible
3. Make sure `id="hero-image"` and `id="about-image"` are in HTML
4. Check browser console for 404 errors

### Changes Not Appearing

**Problem:** Updated CSS/JS not showing on site
**Solutions:**
1. Verify changes are committed and pushed to `main` branch
2. Wait 10-30 minutes for jsDelivr cache
3. Add version parameter: `?v=2`, `?v=3`, etc.
4. Clear Squarespace site cache
5. Try incognito/private browsing mode

---

## 📊 Testing Checklist

After deployment:

- [ ] Test on desktop Chrome
- [ ] Test on desktop Safari
- [ ] Test on mobile Safari (iOS)
- [ ] Test on mobile Chrome (Android)
- [ ] Submit test form (use your own email)
- [ ] Verify spam detection works
- [ ] Check reCAPTCHA loads
- [ ] Test all CTA buttons link correctly
- [ ] Verify redirect after form submission
- [ ] Check responsive design on mobile

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors (F12 → Console tab)
2. Review this documentation
3. Check [`docs/CSS-ORGANIZATION.md`](CSS-ORGANIZATION.md)
4. Verify all CDN URLs are accessible in browser
5. Test in incognito mode to rule out caching

---

**Last Updated:** January 2026
**Repository:** https://github.com/awkwardarm/website-matthewtryba
