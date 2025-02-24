let client = null;

module.exports = {
	setClient: (botClient) => {
		client = botClient;
	},
	getClient: () => client,
};
