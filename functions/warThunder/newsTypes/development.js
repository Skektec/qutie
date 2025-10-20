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

			const developmentEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle(`[Development] ${$('.content__title').text().trim()}`)
				.setAuthor({
					name: 'War Thunder News',
					iconURL:
						'https://static-cdn.jtvnw.net/jtv_user_pictures/b86366d8-5b92-4d28-b840-c2fd10f07716-profile_image-70x70.png',
					url: 'https://fluxus.ddns.net'
				})
				.setURL(`https://warthunder.com/en/news/${articleNumber}`)
				.setDescription()
				.addFields()
				.setImage($('img[class=e-video__media]').attr('src'))
				.setFooter({ text: `Link: https://warthunder.com/en/news/${articleNumber}` });

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
