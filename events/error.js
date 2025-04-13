//This is to log error messages directly to my DMs
const { botAdimn } = require('../data/config.json');
const { getClient } = require('../data/clientInstance');

module.exports = {
	log: async (message) => {
		const client = getClient();
		const user = await client.users.fetch(botAdimn);
		if (message.length < 2000) user.send(message);
		else if (message.length > 2000)
			user.send('An error exceeded 2000 characters');
		else user.send('A blank error occured');
	},
};
