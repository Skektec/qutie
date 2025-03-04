const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '../data/general.db');
const database = new sqlite3.Database(dbPath);
const errorLog = require('./errorLog');
const { getClient } = require('../data/clientInstance');

module.exports = {
	execute: async (reaction) => {
		client = getClient();
		const botHasReacted = await reaction.users
			.fetch()
			.then((users) => users.has(client.user.id));

		if (botHasReacted) {
			return;
		}

		const nick = reaction.message.author.username;
		const userId = reaction.message.author.id;
		const channel = reaction.message.channel.id;
		const server = reaction.message.guildId;
		const text = reaction.message.content;
		const messageId = reaction.message.id;
		const time = Math.floor(reaction.message.createdTimestamp / 1000);
		const tableName = `${server}-quotes`;
		const image = reaction.message.attachments.first()?.url;

		database.run(
			`CREATE TABLE IF NOT EXISTS "${tableName}" (
        nick TEXT,
        userId TEXT,
        channel TEXT,
        server TEXT,
        text TEXT,
        messageId TEXT UNIQUE,
        time INTEGER,
		image TEXT
      )`,
			(err) => {
				if (err) errorLog.execute(`Error creating table ${tableName}:`, err);
			}
		);

		database.get(
			`SELECT 1 FROM "${tableName}" WHERE messageId = ? LIMIT 1`,
			[messageId],
			(err, row) => {
				if (err) {
					errorLog.execute(
						`Error checking for duplicate in ${tableName}:`,
						err
					);
					return;
				}

				if (row) {
					return;
				}

				const insertQuery = `
          INSERT INTO "${tableName}" (nick, userId, channel, server, text, messageId, time, image)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

				database.run(
					insertQuery,
					[nick, userId, channel, server, text, messageId, time, image],
					function (err) {
						try {
							reaction.message.react('💬');
							reaction.message.reply({
								content: `New quote added by <@${reaction.users.cache.firstKey()}> as #${
									this.lastID
								}\n"${text}" - ${nick}`,
								allowedMentions: { repliedUser: false },
							});
						} catch (err) {
							errorLog.execute(`Error replying to user: ${err}`);
						}
						if (err) {
							errorLog.execute(`Error adding quote: ${err}`);
						}
					}
				);
			}
		);
	},
};
