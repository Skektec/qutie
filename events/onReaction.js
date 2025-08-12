const { Events } = require('discord.js');
const notify = require('../functions/notify');
const reactAddQuote = require('../functions/reactAddQuote');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction) {
		try {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
			if (reaction.message.author.bot) return;

			if (reaction.emoji.name == '💬') {
				reactAddQuote.execute(reaction);
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
