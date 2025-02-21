const { Events } = require('discord.js');
const { serverChannel } = require('../data/config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('with your mom', { type: 1 });

		async () => {
			await client.guilds.cache.fetch();
			let serverCount = client.guilds.cache.size;
			client.channels.cache
				.get(serverChannel)
				.send(`<@703303649870217309>! I am online in ${serverCount} servers!`);
		};
	},
};
