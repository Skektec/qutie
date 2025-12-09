const got = require('cloudflare-scraper').default;
const cheerio = require('cheerio');
const warThunderLink = 'https://warthunder.com/en/game/changelog/';
const fs = require('node:fs');
const notify = require('../notify');
const devblog = require('./development/devblog');

module.exports = {
    findLinks: async () => {
        try {
            const response = await got.get(warThunderLink);
            const html = response.body;
            const $ = cheerio.load(html);

            const urls = [];
            const targetHostname = new URL(warThunderLink).hostname;

            $('a').each((index, element) => {
                const href = $(element).attr('href');

                if (href) {
                    try {
                        const fullUrl = new URL(href, warThunderLink);

                        if (fullUrl.hostname === targetHostname) {
                            urls.push(fullUrl.href);
                        }
                    } catch (error) {
                        console.error(error);
                    }
                }
            });

            const devblogUrls = urls
                .filter((url) =>
                    /^https:\/\/warthunder\.com\/en\/game\/changelog\/current\/\d{4}/.test(url)
                )
                .map((url) => {
                    url = url
                        .replace(
                            /^https:\/\/warthunder\.com\/en\/game\/changelog\/current\/\d{4}.*#comments/,
                            ''
                        )
                        .trim()
                        .toLowerCase();
                    if (url != '') {
                        articleNumber = url.slice(49, 53);
                        return {url, articleNumber};
                    } else {
                        return '';
                    }
                })
                .filter((url) => url !== '');

            const currentUrls = JSON.parse(fs.readFileSync('./data/devblogUrls.json', 'utf8'));

            const uniqueUrls = [...new Set(devblogUrls)];

            const normalizedCurrentUrls = new Set(
                currentUrls.map((item) => item.url.trim().toLowerCase())
            );

            let newArticle = uniqueUrls.filter((newItem) => {
                const normalizedNewUrl = newItem.url.trim().toLowerCase();

                return !normalizedCurrentUrls.has(normalizedNewUrl);
            });

            if (newArticle.length > 0) {
                const updatedUrls = currentUrls.concat(newArticle);

                fs.writeFileSync('./data/devblogUrls.json', JSON.stringify(updatedUrls));

                newArticle.forEach(article => devblog.newPost(article.articleNumber)
                )

            }

            return newArticle.length;
        } catch (error) {
            notify.error('Error fetching or parsing the page:', error, 'no error code');
        }
    }
};
