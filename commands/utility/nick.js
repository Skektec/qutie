const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nick')
		.setDescription('Change a users nickname')
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription(`Who's nickname to change.`)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('nick')
				.setDescription('What you want to change their nickname to.')
				.setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const nick = interaction.options.getString('nick');
		message.guild.members.get(user.id).setNickname(nick);
	},
};
