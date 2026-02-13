# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-02-13

### Changed
- Removed budget dropdown from contact forms
  - Commented out budget field in `home-page.html` and `landing-page-national.html`
  - Reduces friction for potential leads
- Updated service cards grid layout in `home-page.html`
  - Changed from 4-column to 3-column layout after removing sync licensing service
- Improved testimonial quotation mark styling in `shared-styles.css`
  - Reduced quotation mark size from 3rem to 1.9rem for better proportions
  - Added closing quotation marks after quote-body text
  - Ensured consistent styling between opening and closing quotes
  - Refactored CSS to eliminate duplication

## [1.0.3] - 2026-01-02

### Added
- Light/dark mode toggle in `shared-styles.css`
  - Light mode active by default
  - Dark mode available via commenting/uncommenting `:root` color variables
  - Supports quick theme switching for testing and deployment

### Changed
- Updated documentation suite:
  - Created `docs/README.md` as navigation hub
  - Created `docs/OVERVIEW.md` with system architecture
  - Created `docs/CREATING-PAGES.md` with step-by-step page creation guide
  - Created `docs/DEPLOYMENT.md` with Git workflow and Squarespace deployment
  - Removed outdated documentation files (CSS-ORGANIZATION.md, SQUARESPACE-DEPLOYMENT.md, LOCAL-PREVIEW.md)

## [1.0.2] - 2026-01-02

### Changed
- Converted `home-page.html` to use centralized asset system
  - Reduced inline CSS from ~200 lines to ~75 lines
  - Now uses `shared-styles.css` with page-specific overrides
  - Improved maintainability and consistency across site

## [1.0.1] - 2026-01-02

### Changed
- Reorganized asset loading in HTML pages
  - Moved `<link>` and `<script>` tags from bottom of `<body>` to `<head>` section
  - Improved deployment management with centralized asset references
  - Added clear comment instructions for local vs production paths

### Fixed
- Hero image loading issue on landing pages
  - Added local script paths (`../assets/`) alongside Squarespace paths
  - Properly loads `page-configs.js` and `shared-scripts.js` for both local preview and production

## [1.0.0] - 2026-01-01

### Added
- Initial versioned release
- Centralized asset system with jsDelivr CDN
- `shared-styles.css` for consistent styling across all pages
- `shared-scripts.js` for form validation and spam detection
- `page-configs.js` for page-specific configuration management
- Google reCAPTCHA integration (site key: 6LehErsrAAAAANJRw4ksp2u26JgHkqQZ6yCoW24a)
- Google Analytics/Ads tracking (AW-17389653886)
- Formbold form submission integration

### Technical
- Squarespace deployment via Code Injection with jsDelivr CDN
- Git version tags for controlled deployments and cache management
- DOMContentLoaded event pattern for reliable JavaScript initialization

---

## Version Tag Format

This project uses [Semantic Versioning](https://semver.org/):
- **MAJOR.MINOR.PATCH** (e.g., v1.0.3)
- **MAJOR**: Breaking changes or major redesigns
- **MINOR**: New features, non-breaking changes
- **PATCH**: Bug fixes, documentation updates, minor tweaks

## Deployment Reference

Each version tag corresponds to a specific jsDelivr CDN URL:
```
https://cdn.jsdelivr.net/gh/awkwardarm/website-matthewtryba@v1.0.3/assets/
```

Update the version in Squarespace Code Injection to deploy changes.
