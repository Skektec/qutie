const { SlashCommandBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('launch')
		.setDescription('Starts our activity in this text channel!'),

	async execute(interaction) {
		const applicationId = interaction.client.user.id;

		const rest = new REST({ version: '10' }).setToken(interaction.client.token);

		try {
			await rest.post(`/interactions/${interaction.id}/${interaction.token}/callback`, {
				body: {
					type: 12,
					data: {
						application_id: applicationId
					}
				}
			});
		} catch (error) {
			console.error('Error launching activity:', error);

			await interaction.followUp({
				content: 'Sorry, I was unable to start the activity.',
				ephemeral: true
			});
		}
	}
};
