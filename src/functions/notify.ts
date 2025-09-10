//This is to log error messages directly to my DMs
import { EmbedBuilder } from 'discord.js';
const { botAdimn } = require('../data/config.json');
const { getClient } = require('../data/clientInstance');

module.exports = {
	error: async (message: string, err: any, errCode: string) => {
		try {
			const client = getClient();
			const user = await client.users.fetch(botAdimn);

			let errorMessage = 'No error message provided';
			if (err) {
				if (typeof err === 'string') {
					errorMessage = err;
				} else if (err.message) {
					errorMessage = err.message;
					if (err.stack) {
						errorMessage += `\n\nStack trace:\n${err.stack}`;
					}
				} else {
					errorMessage = JSON.stringify(err, Object.getOwnPropertyNames(err));
				}
			}

			if (errorMessage.length > 1000) {
				errorMessage = errorMessage.substring(0, 990) + '...';
			}

			const errorEmbed = new EmbedBuilder()
				.setColor(0xff0000)
				.setTitle('An Error Occurred')
				.addFields(
					{ name: 'Message', value: String(message || 'No message provided').substring(0, 1024) },
					{ name: 'Error', value: errorMessage.substring(0, 1024) },
					{
						name: 'Error Code',
						value: String(errCode || 'No error code provided').substring(0, 1024)
					}
				)
				.setTimestamp();

			await user.send({ embeds: [errorEmbed] });
		} catch (error) {
			console.error('Error in notify.error:', error);
		}
	},
	log: async (message: string) => {
		const client = getClient();
		const user = await client.users.fetch(botAdimn);

		user.send(message);
	}
};
