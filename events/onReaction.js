const { Events } = require('discord.js');
const notify = require('../functions/notify');
const reactAddQuote = require('../functions/reactAddQuote');
const rFeature = require('../functions/misc/rFeature');
const { rUser } = require('../data/config.json');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction) {
		if (reaction.partial) {
			try {
				await reaction.fetch();
			} catch (error) {
				notify.error('Something went wrong when fetching the message', error, 'no error code');
				return;
			}
		}

		try {
			if (reaction.message.author.bot) return;

			if (reaction.emoji.name == '💬') {
				reactAddQuote.execute(reaction);
			}

			if (reaction.users.cache.firstKey() == rUser) {
				rFeature.execute(reaction);
			}

			if (reaction.emoji.name == '♻️') {
				reaction.message.reply({
					content: 'Errmm Repost ♻️♻️♻️',
					allowedMentions: { repliedUser: false }
				});
				reaction.message.reactions.cache
					.get('♻️')
					.remove()
					.catch((error) =>
						console.log(
							'Failed to remove reactions:',
							error,
							'Most likely removed by user already.'
						)
					);
			}
		} catch (err) {
			notify.error('An error occurred in MessageReactionAdd.', err, '-1x24034');
		}
	}
};
