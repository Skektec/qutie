const { Client, Partials } = require('discord.js');
const { botAdimn, discordToken } = require('../../data/config.json');

const client = new Client({
	intents: [],
	partials: [Partials.Message, Partials.Channel]
});

async function deploymentNotice() {
	client.login(discordToken);
	client.once('ready', async () => {
		const user = await client.users.fetch(botAdimn);
		await user.send('Deployed new code successfully.');
	});
	client.destroy();
	process.exit(0);
}

deploymentNotice();
