const { Client, Partials } = require('discord.js');
const { botAdimn, discordToken } = require('../../data/config.json');

const client = new Client({
	intents: [],
	partials: [Partials.Message, Partials.Channel]
});

async function deploymentNotice() {
	client.once('ready', async () => {
		try {
			const user = await client.users.fetch(botAdimn);
			await user.send('Deployed new code successfully.');

			client.destroy();
			process.exit(0);
		} catch (err) {
			console.error('ERROR during message send/fetch:', err);
			client.destroy();
			process.exit(1);
		}
	});

	try {
		await client.login(discordToken);
	} catch (loginError) {
		console.error('FATAL ERROR: Discord login failed:', loginError);
		process.exit(1);
	}
}

deploymentNotice();
