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
	getPlayer: () => player
};
