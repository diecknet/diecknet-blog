const { format, formatISO, getYear } = require("date-fns");
const pluginRss = require("@11ty/eleventy-plugin-rss");
const pluginToc = require("eleventy-plugin-toc");
const i18n = require("eleventy-plugin-i18n");
const { MD5 } = require("crypto-js");
const { URL } = require("url");
const { readFileSync } = require("fs");
const siteconfig = require("./content/_data/siteconfig.js");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const syntaxHighlightLineNumbers = require("@akumzy/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {
    // Set Markdown library
    eleventyConfig.setLibrary(
        "md",
        markdownIt({
            html: true,
            xhtmlOut: true,
            linkify: true,
            typographer: true
        }).use(markdownItAnchor)
    );

    // Define passthrough for assets
    eleventyConfig.addPassthroughCopy("assets");

    // Add watch target for JS files (needed for JS bundling in dev mode)
    eleventyConfig.addWatchTarget("./assets/js/");
    // And to make this work we've to disable the .gitignore usage of eleventy.
    eleventyConfig.setUseGitIgnore(false);

    // syntax highlighting
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(syntaxHighlightLineNumbers, {
        showLineNumbers: true,
        alwaysWrapLineHighlights: false
    });

    // Add 3rd party plugins
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(pluginToc);

    // multi language
    eleventyConfig.addPlugin(i18n, {
        translations: {
            hello: {
                en: "Hello",
                de: "Hallo"
            }
        },
        fallbackLocales: {
            en: "de",
            de: "en"
        }
    });

    // custom link liquid filter, from https://github.com/11ty/eleventy/issues/544#issuecomment-496752551
    eleventyConfig.addLiquidTag("link", function (liquidEngine) {
        return {
            parse: function (tagToken, remainTokens) {
                this.path = tagToken.args;
            },
            render: function (scope, hash) {
                let isQuoted =
                    this.path.charAt(0) === "'" || this.path.charAt(0) === '"';
                let path = isQuoted
                    ? liquidEngine.evalValue(this.path, scope)
                    : this.path;

                // This is cheating a little bit because it‘s using the `collections.all` object
                // Anything not in the `all` collection won’t resolve
                let results = scope.contexts[0].collections.all.filter(
                    function (tmpl) {
                        return tmpl.inputPath === path;
                    }
                );
                if (results.length) {
                    return Promise.resolve(results[0].url);
                }
                return Promise.reject(
                    `Template ${path} not found in \`link\` shortcode.`
                );
            }
        };
    });

    // Define 11ty template formats
    eleventyConfig.setTemplateFormats([
        "njk",
        "md",
        "svg",
        "jpg",
        "css",
        "png"
    ]);

    // Generate excerpt from first paragraph
    eleventyConfig.addShortcode("excerpt", (article) =>
        extractExcerpt(article)
    );

    // Set absolute url
    eleventyConfig.addNunjucksFilter("absoluteUrl", (path) => {
        return new URL(path, siteconfig.url).toString();
    });

    // Extract reading time
    eleventyConfig.addNunjucksFilter("readingTime", (wordcount) => {
        let readingTime = Math.ceil(wordcount / 220);
        if (readingTime === 1) {
            return readingTime + " minute";
        }
        return readingTime + " minutes";
    });

    // Extract word count
    eleventyConfig.addNunjucksFilter("formatWords", (wordcount) => {
        return wordcount.toLocaleString("en");
    });

    // Returns CSS class for home page link / posts page link
    eleventyConfig.addNunjucksFilter("isHomeLink", function (url, pattern) {
        return (pattern === "/" && url === "/") ||
            (pattern === "/" && url.startsWith("/posts")) ||
            (pattern === "/" && url.startsWith("/de/2")) ||
            (pattern === "/" && url.startsWith("/en/2"))
            ? "active"
            : "";
    });

    // Returns CSS class for active page link
    eleventyConfig.addNunjucksFilter("isActiveLink", function (url, pattern) {
        return url.length > 1 && url.startsWith(pattern) ? "active" : "";
    });

    // Format dates for sitemap
    eleventyConfig.addNunjucksFilter("sitemapdate", function (date) {
        return format(date, "yyyy-MM-dd");
    });

    // Format dates for JSON-LD
    eleventyConfig.addNunjucksFilter("isodate", function (date) {
        return formatISO(date);
    });

    // Extracts the year from a post
    eleventyConfig.addNunjucksFilter("year", function (post) {
        if (post && post.date) {
            return getYear(post.date);
        }
        return "n/a";
    });

    // Extracts the day of a date
    eleventyConfig.addNunjucksFilter("day", function (date) {
        return format(date, "dd");
    });

    // Extracts the month of a date
    eleventyConfig.addNunjucksFilter("month", function (date) {
        return format(date, "MMM");
    });

    // Extracts readable date of a date
    eleventyConfig.addNunjucksFilter("readableDate", function (date) {
        return format(date, "MMM dd, yyyy");
    });

    // Add custom hash for cache busting
    const hashes = new Map();
    eleventyConfig.addNunjucksFilter("addHash", function (absolutePath) {
        const cached = hashes.get(absolutePath);
        if (cached) {
            return `${absolutePath}?hash=${cached}`;
        }
        const fileContent = readFileSync(`${process.cwd()}${absolutePath}`, {
            encoding: "utf-8"
        }).toString();
        const hash = MD5(fileContent.toString());
        hashes.set(absolutePath, hash);
        return `${absolutePath}?hash=${hash}`;
    });

    // Create custom collection for getting the newest 5 updates
    eleventyConfig.addCollection("recents", function (collectionApi) {
        return collectionApi.getAllSorted().reverse().slice(0, 5);
    });

    // Plugin for setting _blank and rel=noopener on external links in markdown content
    eleventyConfig.addPlugin(require("./_11ty/external-links.js"));

    // Plugin for transforming images
    eleventyConfig.addPlugin(require("./_11ty/srcset.js"));

    // Plugin for minifying HTML
    eleventyConfig.addPlugin(require("./_11ty/html-minify.js"));

    return {
        dir: {
            // Consolidating everything below the `content` folder
            input: "content"
        }
    };
};

// Taken from here => https://keepinguptodate.com/pages/2019/06/creating-blog-with-eleventy/
function extractExcerpt(article) {
    if (!Object.prototype.hasOwnProperty.call(article, "templateContent")) {
        console.warn(
            'Failed to extract excerpt: Document has no property "templateContent".'
        );
        return null;
    }

    const content = article.templateContent;

    const excerpt = content.slice(0, content.indexOf("\n"));

    return excerpt;
}
