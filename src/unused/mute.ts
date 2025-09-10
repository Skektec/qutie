const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
// Commented out bc it was causing issues in used code
// const notify = require('./functions/notify');

const mutedUsersPath = path.join(__dirname, '../../data/mutedUsers.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mutes a user by deleting their messages.')
		.addUserOption((option) =>
			option.setName('user').setDescription('Who is being muted?').setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const userId = user.id;

		fs.readFile(mutedUsersPath, 'utf8', (err, data) => {
			let mutedUsers = [];

			if (!err && data) {
				try {
					mutedUsers = JSON.parse(data);
				} catch (parseErr) {
					notify.error(`Error parsing muted users JSON: ${parseErr}`);
					return interaction.reply({
						content: 'Corrupted mute data.',
						flags: MessageFlags.Ephemeral
					});
				}
			}

			if (mutedUsers.includes(userId)) {
				return interaction.reply({
					content: `${user.username} is already muted.`,
					flags: MessageFlags.Ephemeral
				});
			}

			mutedUsers.push(userId);

			fs.writeFile(mutedUsersPath, JSON.stringify(mutedUsers, null, 4), 'utf8', (writeErr) => {
				if (writeErr) {
					notify.error(`Error muting user: ${writeErr}`);
					return interaction.reply({
						content: 'Failed to mute the user.',
						flags: MessageFlags.Ephemeral
					});
				}

				notify.error(`Muted ${user.username}`);
				interaction.reply({
					content: `${user.username} has been muted.`,
					flags: MessageFlags.Ephemeral
				});
			});
		});
	}
};
