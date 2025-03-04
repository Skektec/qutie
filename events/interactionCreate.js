const { Events } = require('discord.js');
const errorLog = require('./errorLog');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				errorLog.execute(
					`No command matching ${interaction.commandName} was found.`
				);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				errorLog.execute(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				} else {
					await interaction.reply({
						content: 'There was an error while executing this command!',
						ephemeral: true,
					});
				}
			}
		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				errorLog.execute(
					`No command matching ${interaction.commandName} was found.`
				);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				errorLog.execute(
					`Error executing autocomplete for ${interaction.commandName}: ${error.message}`,
					error
				);
				console.error(error);
			}
		}
	},
};
