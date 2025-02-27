const prompt = require('../data/pubconfig.json').embedDetectPrompt;

module.exports = {
	execute: async (message) => {
		content = message.embeds[0].data.description;

		try {
			const chatResponse = await client.chat.complete({
				model: 'mistral-small-latest',
				messages: [
					{
						role: 'system',
						content: prompt,
					},
					{
						role: 'user',
						content: content,
					},
				],
			});

			content = chatResponse.choices[0].message.content;
		} catch (err) {
			errorLog.execute('Repost Detection Error: ' + err);
		}

		const match = content.match(/\$\$repost\$\$/);

		if (chatResponse && match) {
			message.reply('Errmm Repost ♻️♻️♻️');
		}
	},
};
