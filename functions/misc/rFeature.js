const { getClient } = require('../../data/clientInstance');
const { rUser } = require('../../data/config.json');

module.exports = {
	execute: async (reaction) => {
		if (reaction.emoji.name == '🍐' || reaction.emoji.name == '🍠' || reaction.emoji.name == '🌼') {
			const client = getClient();
			const user = await client.users.fetch(rUser);

			user.send(
				`${reaction.emoji.name}\n"${reaction.message.content}" - ${
					reaction.message.author
				}\n-# At ${new Date(reaction.message.createdTimestamp)}`
			);
		} else return;
		return;
	}
};
