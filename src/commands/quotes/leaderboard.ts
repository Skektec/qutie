import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
const {} = require('discord.js');
import { database } from '../../functions/database';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('quoteboard')
		.setDescription('Creates a leaderboard of all quotes in the server.'),
	async execute(interaction) {
		await interaction.deferReply();
		const server = interaction.guildId;
		const tableName = `${server}-quotes`;

		const { rows: quotes } = await database.query(`SELECT * FROM "${tableName}"`);

		const counts: { [key: string]: number } = {};

		quotes.forEach((item) => {
			const userId = item.userid;
			counts[userId] = (counts[userId] || 0) + 1;
		});

		const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

		const leaderboardText = sortedCounts
			.map(([userId, count], index) => `${index + 1}. **<@${userId}>** - ${count} quotes`)
			.join('\n');

		const leaderboardEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('Quote Leaderboard')
			.setDescription(leaderboardText || 'No quotes yet.')
			.setFooter({ text: 'Damn, touch grass.' });

		interaction.editReply({ embeds: [leaderboardEmbed] });
	}
};
