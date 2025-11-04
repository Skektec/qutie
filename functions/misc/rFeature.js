const { EmbedBuilder } = require('discord.js');
const { getClient } = require('../../data/clientInstance');
const { rUser } = require('../../data/config.json');

module.exports = {
	execute: async (reaction) => {
		if (reaction.emoji.name == '🍐' || reaction.emoji.name == '🍠' || reaction.emoji.name == '🌼') {
			await reaction.users.remove(rUser);
			const client = getClient();
			const user = await client.users.fetch(rUser);

			detailsList = [
				{
					emoji: '🍐',
					details: '🍐 - Alleged Copium'
				},
				{
					emoji: '🍠',
					details: '🍠 - Alleged Sexism'
				},
				{
					emoji: '🌼',
					details: '🌼 - Alleged Racism'
				}
			];

			function getDetails(detailsList) {
				return detailsList.emoji === reaction.emoji.name;
			}

			const info = detailsList.find(getDetails);

			const dateTimestamp = new Date(reaction.message.createdTimestamp).toUTCString();

			const quoteEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`${info.details}`)
				.setDescription(
					`${reaction.message.content}\n- <@${reaction.message.author}> [(Jump)](https://discordapp.com/channels/${reaction.message.guildId}/${reaction.message.channelId}/${reaction.message.id})`
				)
				.setImage(imageFromText ? imageFromText[0] : quote.image)
				.setFooter(dateTimestamp);

			user.send({ embeds: [quoteEmbed] });
		} else return;
		return;
	}
};
