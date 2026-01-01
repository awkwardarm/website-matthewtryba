# CSS Organization Guide

## File Structure

### 1. `shared-styles.css` - Global Styles
**Purpose:** Reusable styles that apply across all landing pages and thank you pages.

**Contains:**
- Typography (h1, h2, h3, p)
- Buttons (.btn, .pill-button)
- Sections (hero, testimonials, contact, etc.)
- Form styles (general)
- Responsive breakpoints
- Global animations (shimmer effect)

**When to edit:** When you want a change to affect ALL pages.

---

### 2. `squarespace-overrides.css` - Block-Specific Overrides
**Purpose:** Squarespace-specific CSS that targets individual blocks by their ID.

**Contains:**
- Block-specific form customizations
- Squarespace builder element overrides
- Any CSS that uses `#block-yui_...` selectors

**When to edit:** When you need to customize a specific Squarespace block.

**⚠️ Important:** Block IDs change when you duplicate blocks in Squarespace. Always verify the ID.

---

### 3. Inline `<style>` in Template Files
**Purpose:** Page-specific overrides that only apply to one landing page.

**Contains:**
- Custom colors for A/B tests
- Layout tweaks for specific campaigns
- Temporary experimental styles

**When to edit:** When you need a one-off change for a single page.

---

## Squarespace Setup

### Option A: Code Injection (Recommended)
**Settings > Advanced > Code Injection**

**Header:**
```html
<link rel="stylesheet" href="https://YOUR-DOMAIN.com/s/shared-styles.css">
<link rel="stylesheet" href="https://YOUR-DOMAIN.com/s/squarespace-overrides.css">
```

### Option B: Custom CSS Panel
**Design > Custom CSS**

Paste contents of `squarespace-overrides.css` directly here.
Link `shared-styles.css` via Code Injection.

---

## Common Patterns

### Using the Shimmer Button
```html
<a href="#contact" class="pill-button">Start Your Project</a>
```

### Using the Standard Button
```html
<a href="#contact" class="btn">Bring Your Music to Life</a>
```

### Customizing Checkbox Label Text
Edit in `squarespace-overrides.css`:
```css
#block-YOUR-ID .form-item.field.email .option label:after {
    content: "Your custom text here";
}
```

---

## Troubleshooting

### Block ID Changed?
1. Inspect the element in browser DevTools
2. Find the block ID (starts with `#block-yui_`)
3. Update in `squarespace-overrides.css`

### Style Not Applying?
1. Check browser cache (hard refresh: Cmd+Shift+R)
2. Verify CSS file is loading (check Network tab)
3. Check CSS specificity (may need `!important`)

### Button Looks Wrong?
1. Check if both `.btn` and `.pill-button` classes are applied
2. Verify shimmer animation is enabled
3. Clear Squarespace cache
