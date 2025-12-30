const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const error = require('../../events/error');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purgebot')
		.setDescription('Purges a set amount of bot messages.')
		.addIntegerOption((option) =>
			option
				.setName('amount')
				.setDescription('The amount of messages to be deleted. (Max 20)')
				.setRequired(true)
		),

	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');
		const channel = interaction.channel;

		if (amount < 1 || amount > 20) {
			return interaction.reply({
				content: 'Please specify a number between 1 and 20.',
				flags: MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const messages = await channel.messages.fetch({ limit: 20 });

			const botMessages = messages
				.filter((msg) => msg.author.bot)
				.first(amount);

			if (!botMessages.length) {
				return interaction.editReply({
					content: 'No bot messages found to delete.',
				});
			}

			await channel.bulkDelete(botMessages, true);

			interaction.editReply({
				content: `Deleted ${botMessages.length} bot messages.`,
			});
		} catch (error) {
			error.log('Error deleting bot messages:', error);
			interaction.editReply({
				content: 'Failed to delete messages. Make sure I have permissions!',
			});
		}
	},
};
