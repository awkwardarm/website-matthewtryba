# Documentation

Complete guide to managing and deploying the Matthew Tryba website.

## 📚 Documentation Structure

### [OVERVIEW.md](OVERVIEW.md) - Start Here
**Read this first to understand how everything works**
- System architecture
- File structure
- How assets are loaded
- Key concepts (version tags, shared styles, configurations)
- Common tasks quick reference

### [CREATING-PAGES.md](CREATING-PAGES.md)
**Step-by-step guide to creating new pages**
- Choosing the right template
- Customizing content
- Adding page configurations
- Testing locally
- Deploying to Squarespace
- Best practices and troubleshooting

### [DEPLOYMENT.md](DEPLOYMENT.md)
**Complete deployment workflow**
- Git commit and tagging
- Pushing to GitHub
- Updating Squarespace Code Injection
- Version numbering guidelines
- Rollback procedures
- Common scenarios and troubleshooting

---

## Quick Start

**Never deployed before? Follow this order:**

1. Read [OVERVIEW.md](OVERVIEW.md) to understand the system
2. Try making a small CSS change following [DEPLOYMENT.md](DEPLOYMENT.md)
3. When ready to add a page, use [CREATING-PAGES.md](CREATING-PAGES.md)

---

## Common Questions

**How do I change site colors?**
→ Edit `assets/shared-styles.css` → See [DEPLOYMENT.md](DEPLOYMENT.md)

**How do I add a new landing page?**
→ See [CREATING-PAGES.md](CREATING-PAGES.md)

**How do I update my live site?**
→ See [DEPLOYMENT.md](DEPLOYMENT.md)

**Something broke, how do I revert?**
→ See "Rollback to Previous Version" in [DEPLOYMENT.md](DEPLOYMENT.md)

**Where are my images?**
→ See "File Structure" in [OVERVIEW.md](OVERVIEW.md)

---

## Current System Version

Last updated: January 1, 2026
Documentation version: 1.0
Live version: Check Squarespace Code Injection

---

## Need Help?

1. Check the relevant documentation file above
2. Look in the Troubleshooting sections
3. Check browser console for errors (F12)
4. Verify your Code Injection version matches GitHub tag
