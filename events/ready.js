const { Events } = require('discord.js');
const errorLog = require('./errorLog');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		const sendNotif = async () => {
			let serverCount = client.guilds.cache.size;
			let message = `<@703303649870217309>! I am online in ${serverCount} servers!`;
			errorLog.execute(message);
		};

		console.log(`Ready! Logged in as ${client.user.tag}`);
		client.user.setActivity('with your mom', { type: 1 });
		sendNotif();
	},
};
