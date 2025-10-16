const { Client, Partials } = require('discord.js');
const { botAdimn, discordToken } = require('../../data/config.json');

const client = new Client({
	intents: [],
	partials: [Partials.Message, Partials.Channel]
});

async function deploymentNotice() {
	client.login(discordToken);
	const user = await client.users.fetch(botAdimn);
	await user.send('Deployed new code successfully.');
}

deploymentNotice();
