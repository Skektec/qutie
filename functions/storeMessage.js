const db = require('./database.js');
const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-gcm';
const keyHex = process.env.STORINGSTRING;

module.exports = {
	save: async (message) => {
		if (!keyHex) {
			throw new Error('STORING-STRING is not set in the .env file.');
		}

		function encrypt(text) {
			const iv = crypto.randomBytes(16);
			const cipher = crypto.createCipheriv(algorithm, key, iv);
			let encrypted = cipher.update(text, 'utf8', 'hex');
			encrypted += cipher.final('hex');
			const authTag = cipher.getAuthTag();
			return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
		}

		const queryText = `
            INSERT INTO "MessageStore" (nick, userId, channel, server, text, messageId, time)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;

		const EncryptedMessage = encrypt(message.content);

		const values = [
			message.author.username,
			message.author.id,
			message.channel.id,
			message.guild.id,
			EncryptedMessage,
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
