const fs = require('fs');

const emojis = JSON.parse(fs.readFileSync('./data/emojis.json', 'utf-8'));

module.exports = {
	execute(message) {
		const match = emojis.find((item) => item.name === message.content);
		if (match) {
			message.channel.send(`<:${match.name}:${match.id}>`);
		} else return;
	}
};
