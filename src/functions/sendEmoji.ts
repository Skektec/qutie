import * as fs from 'fs';
import * as path from 'path';

const emojisPath = path.join(__dirname, '../data/emojis.json');
const emojis = JSON.parse(fs.readFileSync(emojisPath, 'utf-8'));

module.exports = {
	execute(message) {
		const match = emojis.find((item) => item.name === message.content);
		if (match) {
			message.channel.send(`<:${match.name}:${match.id}>`);
		} else return;
	}
};
