# Local Development & Preview Guide

## Preview HTML Pages with CSS in VS Code

Since your landing pages use `/s/` paths (for Squarespace), they won't display CSS correctly when opened directly. Here's how to preview them locally:

### Method 1: Using Live Server (Easiest)

1. **Open a PREVIEW file:**
   - Files ending in `-PREVIEW.html` use relative paths (`../assets/`) that work locally
   - Example: `landing-page-national-PREVIEW.html`

2. **Start Live Server:**
   - Right-click the PREVIEW HTML file
   - Select "Open with Live Server"
   - Your browser will open with full CSS formatting

### Method 2: Generate Preview Files

Run this command to create preview versions of all landing pages:

```bash
# In the pages-landing directory
for file in landing-page*.html; do
  if [[ ! $file =~ (PREVIEW|OLD|template) ]]; then
    cp "$file" "${file%.html}-PREVIEW.html"
    # Replace /s/ with ../assets/
    sed -i '' 's|href="/s/|href="../assets/|g' "${file%.html}-PREVIEW.html"
    sed -i '' 's|src="/s/|src="../assets/|g' "${file%.html}-PREVIEW.html"
  fi
done
```

Or manually:
1. Duplicate any landing page
2. Add `-PREVIEW` to the filename
3. Change `/s/` to `../assets/` in:
   - CSS links
   - JavaScript script tags

### Important Notes

- ✅ **PREVIEW files** = For local development only (gitignored)
- ✅ **Regular files** = For Squarespace deployment (use `/s/` paths)
- ✅ **OLD files** = Backup versions (gitignored)

### File Organization

```
pages-landing/
├── landing-page.html                    ← Squarespace version (/s/ paths)
├── landing-page-PREVIEW.html            ← Local preview (../assets/ paths)
├── landing-page-national.html           ← Squarespace version
├── landing-page-national-PREVIEW.html   ← Local preview
└── ...
```

---

## Quick Commands

### Create Preview File
```bash
cp landing-page-national.html landing-page-national-PREVIEW.html
sed -i '' 's|href="/s/|href="../assets/|g' landing-page-national-PREVIEW.html
sed -i '' 's|src="/s/|src="../assets/|g' landing-page-national-PREVIEW.html
```

### Clean Up Preview Files
```bash
rm *-PREVIEW.html *-OLD.html
```

---

## Workflow

1. **Edit** the main file (e.g., `landing-page-national.html`)
2. **Create/Update** the preview version for testing
3. **Preview** with Live Server
4. **Commit** only the main file (PREVIEW files are gitignored)
5. **Deploy** to Squarespace (use CDN URLs in Code Injection)
