//This is to log error messages directly to my DMs
const { botAdimn } = require('../data/config.json');
const { getClient } = require('../data/clientInstance');

module.exports = {
	execute: async (message) => {
		const client = getClient();
		const user = await client.users.fetch(botAdimn);
		if (message) user.send(message);
		else user.send('A blank error occured');
	},
};
