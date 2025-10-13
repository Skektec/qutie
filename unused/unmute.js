const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const notify = require('./functions/notify');

const mutedUsersPath = path.join(__dirname, '../../data/mutedUsers.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Unmutes a user.')
		.addUserOption((option) =>
			option.setName('user').setDescription('Who is being unmuted?').setRequired(true)
		),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const userId = user.id;

		fs.readFile(mutedUsersPath, 'utf8', (err, data) => {
			if (err) {
				notify.error('Error reading file', err, '0x000000');
				return interaction.reply({
					content: 'Failed to read muted users.',
					flags: MessageFlags.Ephemeral
				});
			}

			let mutedUsers = [];

			if (data) {
				try {
					mutedUsers = JSON.parse(data);
				} catch (parseErr) {
					notify.error('Error parsing JSON', parseErr, '0x000000');
					return;
				}
			}

			if (!mutedUsers.includes(userId)) {
				return interaction.reply({
					content: `${user.username} is not muted.`,
					flags: MessageFlags.Ephemeral
				});
			}

			mutedUsers = mutedUsers.filter((id) => id !== userId);

			fs.writeFile(mutedUsersPath, JSON.stringify(mutedUsers, null, 4), 'utf8', (writeErr) => {
				if (writeErr) {
					notify.error('Error unmuting user', writeErr, '0x000000');
					interaction.reply({
						content: 'Failed to unmute the user.',
						flags: MessageFlags.Ephemeral
					});
				} else {
					notify.error('Unmuted', user.username, '0x000000');
					interaction.reply({
						content: `Unmuted ${user.username}.`,
						flags: MessageFlags.Ephemeral
					});
				}
			});
		});
	}
};
