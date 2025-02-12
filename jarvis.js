const { Mistral } = require('@mistralai/mistralai');
const config = require('./data/config.json');
const gif = require('./jarvis_commands/gif');

const client = new Mistral({ apiKey: config.mistralToken });

module.exports = {
	execute: async (message) => {
		console.log(message.content + '2');
		try {
			// console.log('Sending to mistral: ' + message.content);
			const chatResponse = await client.chat.complete({
				model: 'mistral-small-latest',
				messages: [
					{
						role: 'system',
						content: config.prompt,
					},
					{
						role: 'user',
						content: message.content,
					},
				],
			});

			const content = chatResponse.choices[0].message.content;
			console.log(content + '3');

			// for (let i = 0; i < content.length; i += 2000) {
			// 	await message.channel.send(content.slice(i, i + 2000));
			// }

			const match = content.match(/\$\$gif of (.*?)\$\$/);

			if (match) {
				gif.execute(match);
			}
		} catch (err) {
			console.error('Error:', err);
		}
	},
};
