const { Events, MessageFlags } = require('discord.js');
const error = require('./error');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				error.log(
					`No command matching ${interaction.commandName} was found.`
				);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				error.log(`Error:, ${error}, (Interaction Create Event Error)`);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: 'There was an error while executing this command!',
						flags: MessageFlags.Ephemeral,
					});
				} else {
					await interaction.reply({
						content: 'There was an error while executing this command!',
						flags: MessageFlags.Ephemeral,
					});
				}
			}
		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);
			if (!command) {
				error.log(
					`No command matching ${interaction.commandName} was found.`
				);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				error.log(
					`Error executing autocomplete for ${interaction.commandName}: ${error.message}`,
					error
				);
				console.error(error);
			}
		}
	},
};
