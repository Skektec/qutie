const { EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const { getClient } = require('../../../data/clientInstance');
const newChannels = require('../../../data/newsChannels.json');
const notify = require('../../notify');

module.exports = {
	newPost: async (articleNumber) => {
		try {
			const response = await fetch(
				`https://warthunder.com/en/game/changelog/current/${articleNumber}`
			);
			const html = await response.text();
			const $ = cheerio.load(html);
			const x = new Date();

			// Used single character to stop multiline formatting
			const z = x.toLocaleString('en-US', { month: 'long' });
			const dateString = `${z} ${x.getDate()}, ${x.getFullYear()}`;

			let headings = [];
			let changesBlock = [];

			$('.g-col.g-col--100')
				.eq(1)
				.find('h2')
				.each((index, element) => {
					const item = $(element).text().trim();
					headings.push(item);
				});

			function getInfo(item) {
				let text = [];

				$(`h2:contains(${item})`)
					.next('ul')
					.find('li')
					.each((index, element) => {
						const item = $(element).text().trim();
						text.push(`- ${item}`);
					});

				const textString = text.join('\n');

				const block = {
					name: item,
					value: textString,
					inline: false
				};
				changesBlock.push(block);
			}

			headings.forEach((item) => getInfo(item));

			const developmentEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(`Server ${$('.content__title').text().trim()}`)
				.setAuthor({
					name: 'War Thunder Changelogs',
					iconURL: 'https://cdn2.steamgriddb.com/logo_thumb/40b28f4fc90cff423e2a75266497539f.png',
					url: 'https://fluxus.ddns.net'
				})
				.setURL(`https://warthunder.com/en/game/changelog/current/${articleNumber}`)
				.setFields(changesBlock)
				.setImage($('.e-figure__img').attr('src'))
				.setFooter({
					text: `Link: https://warthunder.com/en/game/changelog/current/${articleNumber} on ${dateString}`
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
