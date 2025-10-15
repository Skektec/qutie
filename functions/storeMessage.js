const db = require('./database.js');

module.exports = {
	save: async (message) => {
		const queryText = `
            INSERT INTO "MessageStore" (nick, userId, channel, server, text, messageId, time)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

		const values = [
			message.author.username,
			message.author.id,
			message.channel.id,
			message.guild.id,
			message.content,
			message.id,
			message.createdTimestamp
		];

		try {
			await db.query(queryText, values);
		} catch (error) {
			console.error('Error saving message to database:', error);
		}
	}
};
