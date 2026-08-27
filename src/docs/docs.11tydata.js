/**
 * Defaults for the client documents under /docs/.
 *
 * These pages started as Claude Design print sheets and are shared with clients
 * as links rather than PDFs. They are UNLISTED, not private: noindex keeps them
 * out of Google and out of sitemap.xml, but anyone holding the link can read
 * them. Never put confidential material in this directory.
 *
 * templateEngineOverride: false — .eleventy.js sets htmlTemplateEngine: "njk",
 * so a document containing a literal {{ or {% would otherwise break the build.
 * Turning the engine off makes document bodies inert; base.njk still renders
 * normally, which is why `permalink` below is a function rather than a template
 * string and why the last-updated date is rendered by the layout, not the page.
 */
module.exports = {
    layout: "base.njk",
    noindex: true,
    docPage: true,
    templateEngineOverride: false,
    permalink: (data) => `/docs/${data.page.fileSlug}/`
};
