const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('timeout')
		.setDescription('Times a user out.')
		.addUserOption((option) =>
			option.setName('user').setDescription('Who you want to timeout.').setRequired(true)
		)
		.addIntegerOption((option) =>
			option
				.setName('length')
				.setDescription('How long they will be timed out for. (In seconds)')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('reason').setDescription('Why you are timing them out.').setRequired(false)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason');
		const length = interaction.options.getInteger('length');

		try {
			user.timeout(length);
			interaction.reply({
				content: `Timed ${user.nick} out for ${length}.`,
				flags: MessageFlags.Ephemeral
			});

			const reasonEmbed = new EmbedBuilder()
				.setColor(0xffed29)
				.setTitle(`You were timed out from ${guild.name} for ${length} seconds.`)
				.setDescription(`**Reason:**\n${reason}`)
				.setTimestamp();

			user.send(reasonEmbed);
		} catch {
			interaction.reply({
				content: 'Failed to timeout user. (Likely invalid permissions)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
