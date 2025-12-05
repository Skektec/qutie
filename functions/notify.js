//This is to log error messages directly to my DMs
const { EmbedBuilder } = require('discord.js');
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const { botAdmin } = require('../data/config.json');
const { getClient, setClient } = require('../data/clientInstance');
const { discordToken } = require('../data/config.json');

module.exports = {
	error: async (message, err, errCode) => {
		try {
			try {
				client = getClient();
				user = await client.users.fetch(botAdmin);
			} catch {
				client = new Client({
					intents: [
						GatewayIntentBits.Guilds,
						GatewayIntentBits.GuildMessages,
						GatewayIntentBits.GuildMembers,
						GatewayIntentBits.GuildMessageReactions,
						GatewayIntentBits.MessageContent,
						GatewayIntentBits.GuildVoiceStates
					],
					partials: [Partials.Message, Partials.Channel, Partials.Reaction]
				});

				setClient(client);
				client = getClient();

				client.login(discordToken);

				user = await client.users.fetch(botAdmin);
			}

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
		} catch (err) {
			console.error('Error in notify.error:', err, '0x000000');
		}
	},
	log: async (message) => {
		const user = await client.users.fetch(botAdmin);

		user.send(message);
	}
};
