import { Client } from 'discord.js';
import { Player } from 'discord-player';
import { DefaultExtractors } from '@discord-player/extractor';

let client: Client | null = null;
let player: Player | null = null;

const clientInstance = {
	//Discord Bot Client
	setClient: (botClient: Client): void => {
		client = botClient;
	},
	getClient: (): Client | null => client,

	//Discord Music Player Client
	setPlayer: (discordPlayer: Player): void => {
		player = discordPlayer;
	},
	getPlayer: (): Player | null => player,

	initializePlayer: async (): Promise<Player | null> => {
		if (!client) {
			console.error('Client not initialized');
			return null;
		}

		if (player) return player;

		try {
			const newPlayer = new Player(client);
			await newPlayer.extractors.loadMulti(DefaultExtractors);

			clientInstance.setPlayer(newPlayer);

			return newPlayer;
		} catch (error) {
			console.error('Error initializing player:', error);
			return null;
		}
	}
};

module.exports = clientInstance;
