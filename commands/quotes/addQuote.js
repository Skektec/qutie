const { SlashCommandBuilder } = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const database = new sqlite3.Database('./data/general.db');
const errorLog = require('../../events/errorLog');

// this command is slightly different from the event/addquote, it doesn't require a user.

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addquote')
		.setDescription('Manually add a quote.')
		.addStringOption((option) =>
			option
				.setName('quote')
				.setDescription('The text you want to quote.')
				.setRequired(true)
		)
		.addUserOption((option) =>
			option
				.setName('user')
				.setDescription(`The person you're quoting.`)
				.setRequired(false)
		)
		.addStringOption((option) =>
			option
				.setName('nick')
				.setDescription(`Nickname if the person isn't on the server.`)
				.setRequired(false)
		),
	execute: async (interaction) => {
		const nick = interaction.options.getString('nick');
		const user = interaction.options.getUser('user');
		const channel = interaction.channelId;
		const server = interaction.guildId;
		const messageId = interaction.id;
		const text = interaction.options.getString('quote');
		const time = Math.floor(interaction.createdTimestamp / 1000);
		const tableName = `${server}-quotes`;

		if (!user && !nick) {
			return interaction.reply({
				content: 'You must provide either a user or a nickname.',
				ephemeral: true,
			});
		}

		if (!user) {
			user = {
				id: 0,
				username: nick,
			};
		}

		database.run(
			`CREATE TABLE IF NOT EXISTS "${tableName}" (
        nick TEXT,
        userId TEXT,
        channel TEXT,
        server TEXT,
        messageId TEXT,
        text TEXT,
        time INTEGER
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
          INSERT INTO "${tableName}" (nick, userId, channel, server, text, messageId, time)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
				database.run(
					insertQuery,
					[user.username, user.id, channel, server, text, messageId, time],
					function (err) {
						if (err) {
							errorLog.execute(`Error inserting into ${tableName}:`, err);
						} else {
							interaction.reply({
								content: `New quote added by ${interaction.user} as #${this.lastID}\n"${text}" - ${user.username}`,
								allowedMentions: { repliedUser: false },
							});
						}
					}
				);
			}
		);
	},
};
