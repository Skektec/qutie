import { Events, ActivityType, Client } from 'discord.js';
const { Player } = require('discord-player');
const notify = require('../functions/notify');
const { setPlayer } = require('../data/clientInstance');
const { botAdimn } = require('../data/config.json');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client: Client) {
		const player = new Player(client);
		setPlayer(player);

		console.log('Player ready');

		// try {
		//     let serverCount = client.guilds.cache.size;
		//     let message = `<@${botAdimn}>! I am online in ${serverCount} servers!`;
		//     notify.log(message);
		// } catch (err) {
		//     notify.error('Online notif failed.', err, '');
		// }

		client.user?.setPresence({
			activities: [
				{
					name: 'with you',
					type: ActivityType.Playing
				}
			]
		});

		console.log(`Ready! Logged in as ${client.user?.tag}`);
	}
};
