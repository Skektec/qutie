const fs = require('fs');
const path = require('path');

const messageStorePath = path.join(__dirname, '../data/messageStore.ndjson');

module.exports = {
	save: async (message) => {
		const messageData = {
			id: message.id,
			content: message.content,
			author: {
				id: message.author.id,
				tag: message.author.tag
			},
			channel: message.channel.id,
			timestamp: message.createdTimestamp
		};

		const jsonString = JSON.stringify(messageData);

		fs.appendFileSync(messageStorePath, jsonString + '\n');
	}
};
