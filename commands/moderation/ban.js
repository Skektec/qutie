const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Bans a user.')
		.addUserOption((option) =>
			option.setName('user').setDescription('Who you want to ban.').setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Why you are banning them.').setRequired(false)
		),

	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');

		try {
			interaction.guild.members.ban(user);
			interaction.reply({
				content: `Banned ${user.nick}.`,
				flags: MessageFlags.Ephemeral
			});

			const reasonEmbed = new EmbedBuilder()
				.setColor(0xffed29)
				.setTitle(`You where banned from ${guild.name}`)
				.setDescription(`**Reason:**\n${reason}`)
				.setTimestamp();

			user.send(reasonEmbed);
		} catch {
			interaction.reply({
				content: 'Failed to ban user. (Likely invalid permissions)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
