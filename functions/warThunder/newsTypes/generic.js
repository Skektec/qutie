const { EmbedBuilder } = require('discord.js');
const got = require('cloudflare-scraper').default;
const cheerio = require('cheerio');
const { getClient } = require('../../../data/clientInstance');
const newChannels = require('../../../data/newsChannels.json');
const notify = require('../../notify');

module.exports = {
	newPost: async (articleNumber) => {
		try {
			const response = await got.get(`https://warthunder.com/en/news/${articleNumber}`);
			const html = await response.body;
			const $ = cheerio.load(html);
			const x = new Date();

			// Used single character to stop multiline formatting
			const z = x.toLocaleString('en-US', { month: 'long' });
			const dateString = `${z} ${x.getDate()}, ${x.getFullYear()}`;

			const developmentEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(`[Generic] ${$('.content__title').text().trim()}`)
				.setAuthor({
					name: 'War Thunder News',
					iconURL: 'https://cdn2.steamgriddb.com/logo_thumb/40b28f4fc90cff423e2a75266497539f.png',
					url: 'https://fluxus.ddns.net'
				})
				.setURL(`https://warthunder.com/en/news/${articleNumber}`)
				.setDescription($('.g-grid .g-col.g-col--100 > p').first().text().trim())
				.setImage($('.e-figure__img').attr('src'))
				.setFooter({
					text: `Link: https://warthunder.com/en/news/${articleNumber} on ${dateString}`
				});

			client = getClient();

			newChannels.forEach((element) => {
				async function getChannel() {
					const channel = await client.channels.fetch(element.channel);
					channel.send({ embeds: [developmentEmbed] });
				}
				getChannel();
			});
		} catch (error) {
			notify.error('An error occurred:', error, 'no error code');
		}
	}
};
