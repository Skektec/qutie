const { EmbedBuilder } = require('discord.js');
const cheerio = require('cheerio');
const { getClient } = require('../../../data/clientInstance');
const newChannels = require('../../../data/newsChannels.json');
const notify = require('../../notify');

module.exports = {
	newPost: async (articleNumber) => {
		try {
			const response = await fetch(`https://warthunder.com/en/news/${articleNumber}`);
			const html = await response.text();
			const $ = cheerio.load(html);

			let weekend1 = [];
			let weekend2 = [];

			$('h3:contains("Weekend 1")')
				.next('ul')
				.find('li')
				.each((index, element) => {
					task = $(element).text().trim();
					weekend1.push(task);
				});

			$('h3:contains("Weekend 2")')
				.next('ul')
				.find('li')
				.each((index, element) => {
					task = $(element).text().trim();
					weekend2.push(task);
				});

			const esportEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(`[Esport] ${$('.content__title').text().trim()}`)
				.setAuthor({
					name: 'War Thunder News',
					iconURL:
						'https://static-cdn.jtvnw.net/jtv_user_pictures/b86366d8-5b92-4d28-b840-c2fd10f07716-profile_image-70x70.png',
					url: 'https://fluxus.ddns.net'
				})
				.setURL(`https://warthunder.com/en/news/${articleNumber}`)
				.setDescription($('.g-grid .g-col.g-col--100 > p').first().text().trim())
				.addFields(
					{
						name: $('h3:contains("Weekend 1")').text(),
						value: weekend1.map((task) => `- ${task}`).join('\n'),
						inline: true
					},
					{
						name: $('h3:contains("Weekend 2")').text(),
						value: weekend2.map((task) => `- ${task}`).join('\n'),
						inline: true
					}
				)
				.setImage($('img[class=e-video__media]').attr('src'))
				.setFooter({ text: `Link: https://warthunder.com/en/news/${articleNumber}` });

			client = getClient();

			newChannels.forEach((element) => {
				async function getChannel() {
					let ping = null;

					if (
						$('.content__title')
							.text()
							.trim()
							.match(/.*Winner.*/)
					) {
						ping = null;
					} else {
						ping = `<@&${element.role}>`;
					}

					const channel = await client.channels.fetch(element.channel);
					channel.send({ content: ping, embeds: [esportEmbed] });
				}
				getChannel();
			});
		} catch (error) {
			notify.error('An error occurred:', error, 'no error code');
		}
	}
};
