const { getClient } = require('../../data/clientInstance');
const { rUser } = require('../../data/config.json');

module.exports = {
	execute: async (reaction) => {
		if (reaction.emoji.name == '🍐' || reaction.emoji.name == '🍠' || reaction.emoji.name == '🌼') {
			await reaction.users.remove(rUser);
			const client = getClient();
			const user = await client.users.fetch(rUser);

			detailsList = [
				{
					emoji: '🍐',
					details: '🍐 - Alleged Copium'
				},
				{
					emoji: '🍠',
					details: '🍠 - Alleged Sexism'
				},
				{
					emoji: '🌼',
					details: '🌼 - Alleged Racism'
				}
			];

			function getDetails(detailsList) {
				return detailsList.emoji === reaction.emoji.name;
			}

			const info = detailsList.find(getDetails);

			user.send(
				`${info.details} - \n"${reaction.message.content}" - ${
					reaction.message.author
				}\n-# At ${new Date(reaction.message.createdTimestamp)}`
			);
		} else return;
		return;
	}
};
