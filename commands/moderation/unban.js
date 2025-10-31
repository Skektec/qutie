const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Unbans a user.')
		.addUserOption((option) =>
			option.setName('user').setDescription('Who you want to unban.').setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');

		try {
			await interaction.guild.members.unban(user);
			interaction.reply({
				content: `Unbanned ${user.username}.`
			});
		} catch {
			interaction.reply({
				content: 'Failed to unban user. (Likely invalid permissions)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
