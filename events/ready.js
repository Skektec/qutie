const { Events } = require('discord.js');
const { serverChannel, guildId } = require('../data/config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		const sendNotif = async () => {
			const guild = await client.guilds.fetch(guildId);
			const channel = await guild.channels.fetch(serverChannel);

			let serverCount = client.guilds.cache.size;
			channel.send(
				`<@703303649870217309>! I am online in ${serverCount} servers!`
			);
		};

		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('with your mom', { type: 1 });
		sendNotif();
	},
};
