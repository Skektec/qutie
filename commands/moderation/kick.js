const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kicks a user.')
		.addUserOption((option) =>
			option.setName('user').setDescription('Who you want to kick.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Why you are kicking them.').setRequired(false)
		),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');

		try {
			interaction.guild.members.kick(user);
			interaction.reply({
				content: `Kicked ${user.nickname}.`,
				flags: MessageFlags.Ephemeral
			});

			const reasonEmbed = new EmbedBuilder()
				.setColor(0xffed29)
				.setTitle(`You where kicked from ${guild.name}`)
				.setDescription(`**Reason:**\n${reason}`)
				.setTimestamp();

			user.send(reasonEmbed);
		} catch {
			interaction.reply({
				content: 'Failed to kick user. (Likely invalid permissions)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
