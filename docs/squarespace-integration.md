# Centralized Code Management for Squarespace Landing Pages

This guide will help you implement a centralized code structure for your landing pages on Squarespace, allowing you to maintain forms, styles, and spam filters in a single location while deploying them across multiple landing pages.

## Table of Contents
1. [Understanding the Architecture](#understanding-the-architecture)
2. [Setting Up Your Central Code Repository](#setting-up-your-central-code-repository)
3. [Hosting Your Files](#hosting-your-files)
4. [Squarespace Integration](#squarespace-integration)
5. [Creating New Landing Pages](#creating-new-landing-pages)
6. [Customizing Landing Pages](#customizing-landing-pages)
7. [Tracking and Analytics](#tracking-and-analytics)
8. [Troubleshooting](#troubleshooting)

## Understanding the Architecture

Our solution uses three main components:
- **Centralized CSS**: Single stylesheet for all landing pages
- **Form Handler JS**: Handles form validation and spam detection
- **Form Template JS**: Dynamically injects your form HTML

This approach allows you to:
- Update forms across all pages by changing one file
- Maintain a single spam detection system
- Track conversions from different sources
- Easily create new landing pages

## Setting Up Your Central Code Repository

You need three key files:

### 1. Landing Pages CSS (`landing-pages.css`)
Contains all styling for your landing pages.

### 2. Form Handler JS (`form-handler.js`)
Handles form validation and spam detection.

### 3. Form Template JS (`form-template.js`)
Contains your form HTML template and injection logic.

## Hosting Your Files

You have several options for hosting these files:

### Option 1: GitHub + jsDelivr (Recommended)

jsDelivr is a free, fast, and reliable CDN for open-source projects that works seamlessly with GitHub repositories.

#### Step-by-Step GitHub + jsDelivr Setup:

1. **Create or use an existing GitHub repository**
   - Make sure your repository is public (jsDelivr requires this)
   - Organize your files in a clear structure (e.g., `/css/landing-pages.css`, `/js/form-handler.js`)

2. **Push your files to the repository**
   ```bash
   git add landing-pages.css form-handler.js form-template.js
   git commit -m "Add landing page resources"
   git push origin main
   ```

3. **Access your files via jsDelivr**
   - Basic format: `https://cdn.jsdelivr.net/gh/username/repository@version/file`
   - Example: `https://cdn.jsdelivr.net/gh/matthewtryba/website-resources@main/js/form-handler.js`

4. **URL structure options:**
   - Use a specific version/tag: `@v1.0.0`
   - Use a specific commit: `@2cdf3fa`
   - Use a branch: `@main`
   
   Your URLs would look like:

   - CSS: `https://cdn.jsdelivr.net/gh/username/repo@version/landing-pages.css`
   - JS: `https://cdn.jsdelivr.net/gh/username/repo@version/form-handler.js`
   - JS: `https://cdn.jsdelivr.net/gh/username/repo@version/form-template.js`

5. **Versioning Best Practices**
   - Use GitHub releases/tags for proper versioning (`@v1.0.0`, `@v1.1.0`)
   - This allows you to update files while ensuring existing pages don't break
   - Create a new tag each time you make significant changes

6. **Purging the Cache (if needed)**
   - If you've updated a file and need to refresh the CDN: `https://purge.jsdelivr.net/gh/username/repo@version/file`
   - Or visit: [https://www.jsdelivr.com/tools/purge](https://www.jsdelivr.com/tools/purge)

7. **Monitoring**
   - You can monitor usage statistics at: [https://www.jsdelivr.com/package/gh/username/repo](https://www.jsdelivr.com/package/gh/username/repo)

#### Benefits of jsDelivr:
- Global CDN with high availability
- Automatic minification by adding `.min` before the extension
- Combine multiple files with: `https://cdn.jsdelivr.net/combine/gh/user/repo@version/file1,gh/user/repo@version/file2`

Replace `username`, `repo`, and `version` with your GitHub username, repository name, and the release version or branch name.

### Option 2: Self-Hosting
Host the files on your own server or a cloud storage service that allows direct linking.

## Squarespace Integration

To integrate with Squarespace:
1. Go to **Settings** > **Advanced** > **Code Injection**.
2. In the **Header** section, add your CSS link:
   ```html
   <link rel="landing_page_stylesheet" href="YOUR_CSS_URL">
   ```
3. In the **Footer** section, add your JS links:
   ```html
   <script src="YOUR_FORM_HANDLER_JS_URL"></script>
   <script src="YOUR_FORM_TEMPLATE_JS_URL"></script>
   ```

## Creating New Landing Pages

1. Duplicate an existing landing page or create a new one.
2. In the page settings, set the **Page Type** to **Blank**.
3. Add a **Code Block** to the page.
4. In the code block, add the HTML for your form using the template syntax:
   ```html
   <!-- Add your form HTML here -->
   ```

## Customizing Landing Pages

To customize styles or scripts for a specific landing page:
- Add custom CSS in the **Page Header Code Injection**.
- Add page-specific JavaScript in the **Page Footer Code Injection**.

## Tracking and Analytics

For tracking conversions and analytics:
- Use Google Tag Manager or similar tools.
- Add your tracking code in the **Header** or **Footer** code injection as required.

## Troubleshooting

Common issues and solutions:
- **Form not submitting**: Check JavaScript console for errors.
- **Styles not applying**: Ensure CSS file is correctly linked and has no syntax errors.
- **Spam submissions**: Adjust spam filter settings in the form handler JS.

For further assistance, consult the [Squarespace Help Center](https://support.squarespace.com/) or relevant developer documentation.