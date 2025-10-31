const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('removetimeout')
		.setDescription('Removes a timeout.')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription('Who you want to remove the timeout from.')
				.setRequired(true)
		),

	async execute(interaction) {
		const user = interaction.options.getUser('user');

		try {
			user.timeout(null);
			interaction.reply({
				content: `Removed the timeout from ${user}`,
				flags: MessageFlags.Ephemeral
			});

			const reasonEmbed = new EmbedBuilder()
				.setColor(0x008000)
				.setTitle(`Your timeout was removed in ${interaction.guild.name}`)
				.setTimestamp();

			user.send(reasonEmbed);
		} catch {
			interaction.reply({
				content: 'Failed to remove the timeout from user. (Likely invalid permissions)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
