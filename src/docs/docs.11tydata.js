/**
 * Defaults for the client documents, published at an unguessable base path.
 *
 * These pages started as Claude Design print sheets and are shared with clients
 * as links rather than PDFs. They are UNLISTED, not private: noindex keeps them
 * out of Google and out of sitemap.xml, but anyone holding the link can read
 * them. Never put confidential material in this directory.
 *
 * THE BASE PATH IS A SECRET AND MUST NEVER BE HARDCODED HERE.
 * This repo is public on GitHub — anything written into this file is visible to
 * anyone. The random path segment is supplied at build time by the DOCS_BASE
 * environment variable, set only in the Cloudflare Pages project's dashboard
 * (Settings -> Environment variables, both Production and Preview), never
 * committed. `npm run serve` has no such variable, so it falls back to the
 * literal "docs" for local development; a Cloudflare Pages build (detected via
 * the CF_PAGES variable Cloudflare injects automatically) fails loudly instead
 * of silently falling back, so a missing variable can never ship the guessable
 * default to production.
 *
 * templateEngineOverride: false — .eleventy.js sets htmlTemplateEngine: "njk",
 * so a document containing a literal {{ or {% would otherwise break the build.
 * Turning the engine off makes document bodies inert; base.njk still renders
 * normally, which is why `permalink` below is a function rather than a template
 * string and why the last-updated date is rendered by the layout, not the page.
 * index.html is the one file in this directory that re-enables njk (its own
 * front matter overrides this), so it can build its links from `docsBase`
 * below rather than needing the secret written into its source.
 */
const DOCS_BASE = process.env.DOCS_BASE || (process.env.CF_PAGES ? null : "docs");

if (DOCS_BASE === null) {
    throw new Error(
        "DOCS_BASE environment variable is not set. Every Cloudflare Pages build " +
        "(production and preview) requires it, so the client-documents path is " +
        "never silently published at the guessable default '/docs/'. Set it in " +
        "the Pages project's Environment Variables and retry the deploy."
    );
}

module.exports = {
    layout: "base.njk",
    noindex: true,
    docPage: true,
    templateEngineOverride: false,
    docsBase: DOCS_BASE,
    // page.fileSlug for an index.html resolves to the *parent directory name*
    // ("docs"), not "index" -- an Eleventy quirk so sibling index files don't
    // collide. Check the actual source filename instead.
    permalink: (data) =>
        data.page.inputPath.endsWith("/index.html")
            ? `/${DOCS_BASE}/`
            : `/${DOCS_BASE}/${data.page.fileSlug}/`
};
