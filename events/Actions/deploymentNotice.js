const { Client, Partials } = require('discord.js');
const { botAdimn, discordToken } = require('../../data/config.json');

const client = new Client({
	intents: [],
	partials: [Partials.Message, Partials.Channel]
});

async function deploymentNotice() {
	client.login(discordToken);

	try {
		const user = await client.users.fetch(botAdimn);
		await user.send('Deployed new code successfully.');
		client.destroy();
		process.exit(0);
	} catch (err) {
		console.log(err);
		process.exit(1);
	}
}

deploymentNotice();
