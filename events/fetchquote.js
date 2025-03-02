const sqlite3 = require('sqlite3').verbose();
const { EmbedBuilder } = require('discord.js');
const database = new sqlite3.Database('./data/general.db');
const errorLog = require('./errorLog');

module.exports = {
	execute: async (message, args) => {
		const serverId = message.guildId;
		const tableName = `${serverId}-quotes`;
		const entryNumber = parseInt(args[0]);
		const nick = args[0];

		const sendQuoteEmbed = (quote) => {
			if (!quote) {
				message.channel.send('No matching quote found.');
				return;
			}

			const quoteTimestamp = quote.time * 1000;
			const quoteDate = new Date(quoteTimestamp);
			const formattedDate = quoteDate.toLocaleString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: 'numeric',
				minute: 'numeric',
				second: 'numeric',
				hour12: true,
			});

			const image = quote.text.match(/(https?:\/\/\.)\S+/gi);

			const quoteEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Quote #${quote.row_num}`)
				.setDescription(
					`${quote.text} \n - <@${quote.userId}> [(Jump)](https://discordapp.com/channels/${serverId}/${quote.channel}/${quote.messageId})`
				)
				.setImage(image || quote.image)
				.setFooter({ text: `${formattedDate}` });

			message.channel.send({ embeds: [quoteEmbed] });
		};

		database.get(
			`SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
			[tableName],
			(err, row) => {
				if (err) {
					errorLog.execute(`Error checking table ${tableName}:`, err);
					message.channel.send('An error occurred while fetching quotes.');
					return;
				}
				if (!row) {
					message.channel.send('No quotes are available for this server.');
					return;
				}

				let query;
				let params = [];
				let useAll = false;

				if (!isNaN(entryNumber)) {
					query = `
            SELECT *, rowid as row_num 
            FROM "${tableName}" WHERE rowid = ?
          `;
					params.push(entryNumber);
				} else if (args[0] && args[0].startsWith('<@')) {
					const userId = args[0].replace(/[<@!>]/g, '');
					query = `
            SELECT *, rowid as row_num 
            FROM "${tableName}" WHERE userId = ?
          `;
					params.push(userId);
					useAll = true;
				} else if (nick) {
					query = `
            SELECT *, rowid as row_num 
            FROM "${tableName}" WHERE nick = ?
          `;
					params.push(nick);
					useAll = true;
				} else {
					query = `
            SELECT *, rowid as row_num 
            FROM "${tableName}" ORDER BY RANDOM() LIMIT 1
          `;
				}

				if (useAll) {
					database.all(query, params, (err, rows) => {
						if (err) {
							errorLog.execute(`Error querying ${tableName}:`, err);
							message.channel.send(
								'An error occurred while retrieving quotes.'
							);
							return;
						}

						if (!rows || rows.length === 0) {
							message.channel.send('No matching quotes found.');
							return;
						}

						const quote = rows[Math.floor(Math.random() * rows.length)];
						sendQuoteEmbed(quote);
					});
				} else {
					database.get(query, params, (err, row) => {
						if (err) {
							errorLog.execute(`Error querying ${tableName}:`, err);
							message.channel.send(
								'An error occurred while retrieving quotes.'
							);
							return;
						}

						if (!row) {
							message.channel.send('No matching quote found.');
							return;
						}

						sendQuoteEmbed(row);
					});
				}
			}
		);
	},
};
