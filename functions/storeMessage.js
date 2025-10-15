const db = require('./database.js');
const crypto = require('crypto');
require('dotenv').config();

const algorithm = 'aes-256-gcm';
const keyHex = process.env.STORINGSTRING;

module.exports = {
	save: async (message) => {
		if (!keyHex) {
			throw new Error('STORINGSTRING is not set in the .env file.');
		}
		const key = Buffer.from(keyHex, 'hex');
		if (key.length !== 32) {
			throw new Error('Invalid key length. ENCRYPTION_KEY must be a 32-byte hex string.');
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
            INSERT INTO "MessageStore" (nick, userId, channel, server, text, messageId, time, reply)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

		const EncryptedMessage = encrypt(message.content);

		if (message.reference) {
			reply = await message.channel.messages.fetch(message.reference.messageId);
			repliedMessage = reply.content;
		} else {
			reply = null;
		}

		try {
			EncryptedReply = `${encrypt(repliedMessage)} - ${reply.author.username}`;
		} catch {
			EncryptedReply = null;
		}

		const values = [
			message.author.username,
			message.author.id,
			message.channel.id,
			message.guild.id,
			EncryptedMessage,
			message.id,
			message.createdTimestamp,
			EncryptedReply
		];

		try {
			await db.query(queryText, values);
		} catch (error) {
			console.error('Error saving message to database:', error);
		}
	}
};
