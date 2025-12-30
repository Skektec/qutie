const { Events, ActivityType } = require('discord.js');
const error = require('./error');
const { setPlayer } = require('../data/clientInstance');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		client.on('ready', function (readyClient) {
			// Discord Player Initialization
			const { Player } = require('discord-player');
			const player = new Player(readyClient);
			
			// Store the player in clientInstance
			setPlayer(player);
		});

		console.log('Player ready');

		const sendNotif = async () => {
			let serverCount = client.guilds.cache.size;
			let message = `<@${botAdimn}>! I am online in ${serverCount} servers!`;
			// The only error log without extra information
			error.log(message);
		};

		client.user.setPresence({
			activities: [
				{
					name: 'with you',
					type: ActivityType.Playing,
				},
			],
		});

		console.log(`Ready! Logged in as ${client.user.tag}`);
		// sendNotif();
	},
};
