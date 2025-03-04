const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const errorLog = require('../../events/errorLog');

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
		const guild = interaction.guild;

		try {
			const member = await guild.members.fetch(user.id);
			member.setNickname(nick);
		} catch (error) {
			errorLog.execute('Nickname change error: ' + error);
			interaction.reply({
				content: 'Make sure the bot has the correct permissions.',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
