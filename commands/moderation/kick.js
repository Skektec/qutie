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

		const huh = interaction;

		try {
			huh.guild.members.kick(user);
			huh.reply({
				content: `Kicked ${user.username}.`,
				flags: MessageFlags.Ephemeral
			});

			if (reason) {
				const reasonEmbed = new EmbedBuilder()
					.setColor(0xffed29)
					.setTitle(`${user.username} was kicked from ${interaction.guild.name}`)
					.setDescription(`**Reason:**\n${reason}`)
					.setTimestamp();

				interaction.channel.send(reasonEmbed);
			}
			return;
		} catch (err) {
			console.error(err);
			interaction.reply({
				content: 'Failed to kick user. (Likely invalid permissions)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
