const { Events } = require('discord.js');
const error = require('./error');
const addquote = require('./addquote');

module.exports = {
	name: Events.MessageReactionAdd,
	async execute(reaction) {
		try {
			if (reaction.partial) await reaction.fetch();
			if (reaction.message.partial) await reaction.message.fetch();
			if (reaction.message.author.bot) return;

			if (reaction.emoji.name == '💬') {
				addquote.execute(reaction);
			}

			if (reaction.emoji.name == '♻️') {
				reaction.message.reply('Errmm Repost ♻️♻️♻️');
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
		} catch (error) {
			error.log('An error occurred in MessageReactionAdd:', error);
		}
	},
};
