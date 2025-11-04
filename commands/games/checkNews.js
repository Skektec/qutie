const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fetchDev = require('../../functions/warThunder/fetchDev');
const fetchNews = require('../../functions/warThunder/fetchNews');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('checknews')
		.setDescription('Check for News from the War Thunder website.'),

	async execute(interaction) {
		const devCount = fetchDev.findLinks();
		const newsCount = fetchNews.findLinks();

		interaction.message.reply({
			content: `Found ${newsCount} News links and ${devCount} Update links!\n-# New posts will be sent in your news channel.`,
			flags: MessageFlags.Ephemeral
		});
	}
};
