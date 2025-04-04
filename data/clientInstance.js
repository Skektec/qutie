const { Player } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');

let client = null;
let player = null;

module.exports = {
	//Discord Bot Client
	setClient: (botClient) => {
		client = botClient;
	},
	getClient: () => client,

	//Discord Music Player Client
	setPlayer: (discordPlayer) => {
		player = discordPlayer;
	},
	getPlayer: () => player,

	initializePlayer: () => {
		if (!client) {
			console.error('Client not initialized');
			return null;
		}

		if (player) {
			console.log('Using existing player');
			return player;
		}

		try {
			const newPlayer = new Player(client);
			
			newPlayer.extractors.register(DefaultExtractors);
			
			console.log('Registering extractors');
			newPlayer.extractors.loadDefault();
			
			setPlayer(newPlayer);
			console.log('Player initialized successfully with extractors');
			return newPlayer;
		} catch (error) {
			console.error('Error initializing player:', error);
			return null;
		}
	}
};
