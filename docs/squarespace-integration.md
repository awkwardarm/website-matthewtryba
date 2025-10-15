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
1. Push your files to your GitHub repository
2. Use jsDelivr to serve them as a CDN

Your URLs would look like:

- CSS: `https://cdn.jsdelivr.net/gh/username/repo@version/landing-pages.css`
- JS: `https://cdn.jsdelivr.net/gh/username/repo@version/form-handler.js`
- JS: `https://cdn.jsdelivr.net/gh/username/repo@version/form-template.js`

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