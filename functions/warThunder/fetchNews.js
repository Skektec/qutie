const axios = require('axios');
const cheerio = require('cheerio');
const warThunderLink = 'https://warthunder.com/en/news';
const fs = require('node:fs');
const notify = require('../notify');
const esport = require('./newsTypes/esport');
const development = require('./newsTypes/development');
const generic = require('./newsTypes/generic');
const event = require('./newsTypes/event');

module.exports = {
	findLinks: async () => {
		try {
			const response = await axios.get(warThunderLink);
			const html = response.data;

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

			const newsUrls = urls
				.filter((url) => /^https:\/\/warthunder\.com\/en\/news\/\d{4}/.test(url))
				.map((url) => {
					url = url
						.replace(/^https:\/\/warthunder\.com\/en\/news\/\d{4}.*#comments/, '')
						.trim()
						.toLowerCase();
					if (url != '') {
						articleNumber = url.slice(31, 35);
						articleType = url.match(/-.*/)[0].slice(1);
						return { url, articleNumber, articleType };
					} else {
						return '';
					}
				})
				.filter((url) => url !== '');

			const currentUrls = JSON.parse(fs.readFileSync('./data/newsUrls.json', 'utf8'));

			const uniqueNewsUrls = [...new Set(newsUrls)];

			const normalizedCurrentUrls = new Set(
				currentUrls.map((item) => item.url.trim().toLowerCase())
			);

			let newArticle = uniqueNewsUrls.filter((newItem) => {
				const normalizedNewUrl = newItem.url.trim().toLowerCase();

				return !normalizedCurrentUrls.has(normalizedNewUrl);
			});

			if (newArticle.length > 0) {
				const updatedUrls = currentUrls.concat(newArticle);
				fs.writeFileSync('./data/newsUrls.json', JSON.stringify(updatedUrls));

				if (newArticle[0].articleType.startsWith('esport')) {
					await esport.newPost(newArticle[0].articleNumber);
				} else if (newArticle[0].articleType.startsWith('development')) {
					await development.newPost(newArticle[0].articleNumber);
				} else if (newArticle[0].articleType.startsWith('shop-development')) {
					await development.newPost(newArticle[0].articleNumber);
				} else if (newArticle[0].articleType.startsWith('event')) {
					await event.newPost(newArticle[0].articleNumber);
				} else {
					await generic.newPost(newArticle[0].articleNumber);
				}

				// if (newArticle[0].articleType.startsWith('shop-development')) {
				// 	development.newPost(newArticle[0].articleNumber);
				// }
			}
		} catch (error) {
			notify.error('Error fetching or parsing the page:', error, 'no error code');
		}
	}
};
