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
			await user.timeout(length);
			interaction.reply({
				content: `Timed ${user.username} out for ${length}.`,
				flags: MessageFlags.Ephemeral
			});

			if (reason) {
				const reasonEmbed = new EmbedBuilder()
					.setColor(0xffed29)
					.setTitle(`${user.username} was timed out in ${guild.name} for ${length} seconds.`)
					.setDescription(`**Reason:**\n${reason}`)
					.setTimestamp();

				interaction.channel.send(reasonEmbed);
			}
			return;
		} catch {
			interaction.reply({
				content: 'Failed to timeout user. (Likely invalid permissions)',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
