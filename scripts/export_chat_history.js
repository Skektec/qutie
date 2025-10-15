const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
const path = require('path');
const config = require('../data/config.json');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});

client.once('ready', async () => {
	console.log('Ready!');

	const channelIds = process.argv.slice(2);
	if (channelIds.length === 0) {
		console.log('Please provide at least one channel ID.');
		process.exit(1);
	}

	for (const channelId of channelIds) {
		const channel = await client.channels.fetch(channelId);
		if (!channel || !channel.isTextBased()) {
			console.log(`Invalid channel ID: ${channelId}`);
			continue;
		}

		let allMessages = [];
		let lastId;

		while (true) {
			const options = { limit: 100 };
			if (lastId) {
				options.before = lastId;
			}

			const messages = await channel.messages.fetch(options);
			if (messages.size === 0) {
				break;
			}

			allMessages = allMessages.concat(Array.from(messages.values()));
			lastId = messages.last().id;
		}

		const filePath = path.join(__dirname, '../data', `${channelId}.json`);
		fs.writeFileSync(filePath, JSON.stringify(allMessages, null, 2));
		console.log(`Exported ${allMessages.length} messages from ${channel.name} to ${filePath}`);
	}

	process.exit(0);
});

client.login(config.discordToken);
