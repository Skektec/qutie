const { SlashCommandBuilder } = require('discord.js');
const { helpChannel } = require('../../data/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Opens a help chat.')
		.addStringOption((option) =>
			option
				.setName('question')
				.setDescription('What is the issue?')
				.setRequired(true)
		),
	async execute(interaction) {
		const question = interaction.options.getInteger('question');
		const fromChannel = interaction.channel;
		const supportChannel = await client.channels.fetch(helpChannel);

		supportChannel.send(
			`Support requested from: ${fromChannel.id}\n Question: ${question}`
		);
	},
};
