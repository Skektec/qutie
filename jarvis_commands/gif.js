const { tenorToken } = require('../data/config.json');
const errorLog = require('../events/errorLog');

module.exports = {
	execute: async (match, message) => {
		const searchTerm = match[1];

		try {
			const fetch = (await import('node-fetch')).default;

			const response = await fetch(
				`https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
					searchTerm
				)}&key=${tenorToken}&limit=1`
			);

			const data = await response.json();

			if (data.results && data.results.length > 0) {
				const gifUrl = data.results[0].url;
				message.channel.send(gifUrl);
			} else {
				message.channel.send('No GIFs found for your search term.');
			}
		} catch (error) {
			errorLog.execute('Error fetching GIF:', error);
			message.reply('An error occurred while fetching the GIF.');
		}
	},
};
