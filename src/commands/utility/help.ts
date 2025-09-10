import { SlashCommandBuilder, MessageFlags } from 'discord.js';
const { helpChannel } = require('../../data/config.json');
const { getClient } = require('../../data/clientInstance');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Opens a help chat.')
		.addStringOption((option) =>
			option.setName('question').setDescription('What is the issue?').setRequired(true)
		),
	async execute(interaction) {
		const client = getClient();

		const question = interaction.options.getString('question');
		const fromChannel = interaction.channel;
		const supportChannel = await client.channels.fetch(helpChannel);

		supportChannel.send(`Support requested from: ${fromChannel.id}\n **Question:** ${question}`);

		await interaction.reply({
			content: 'Ticket sent.',
			Flags: MessageFlags.Ephemeral
		});
	}
};
