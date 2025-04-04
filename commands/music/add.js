const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Adds a song to the playlist.'),
	async execute(interaction) {
		interaction.channel.send('Still being worked on');
	},
};
