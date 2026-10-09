module.exports = function (eleventyConfig) {
    // Static assets copied straight into the built site
    eleventyConfig.addPassthroughCopy({ "assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "images": "images" });
    // Cloudflare Pages redirect rules
    eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
    eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
    // Cache-buster for /assets links (?v=...): changes on every deploy, so browsers
    // fetch the new scripts and styles instead of a copy cached for up to 4 hours.
    // Cloudflare Pages provides the commit SHA; local builds use the time.
    eleventyConfig.addGlobalData("assetVersion",
        (process.env.CF_PAGES_COMMIT_SHA || "").slice(0, 7) || String(Date.now()));

    return {
        dir: {
            input: "src",
            includes: "_includes",
            output: "_site"
        },
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk"
    };
};
