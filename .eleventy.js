module.exports = function (eleventyConfig) {
    // Static assets copied straight into the built site
    eleventyConfig.addPassthroughCopy({ "assets": "assets" });
    eleventyConfig.addPassthroughCopy({ "images": "images" });
    // Cloudflare Pages redirect rules
    eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
    eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

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
