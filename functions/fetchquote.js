const { EmbedBuilder } = require('discord.js');
const database = require('../functions/database');
const notify = require('../functions/notify');

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
				hour12: true
			});

			const imageFromText = quote.text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);

			const quoteEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle(`Quote #${quote.rownum}`)
				.setDescription(
					`${quote.text}\n- <@${quote.userid}> [(Jump)](https://discordapp.com/channels/${serverId}/${quote.channel}/${quote.messageid})`
				)
				.setImage(imageFromText ? imageFromText[0] : quote.image)
				.setFooter({ text: formattedDate });

			if (quote.image && quote.image.match(/\.(mp4|mov|webm|avi|mkv|wmv|flv|mpeg|mpg|gif)/i)) {
				const quoteMessage = `**Quote #${quote.rownum}**\n${quote.text}\n${quote.image}\n- <@${quote.userid}> [(Jump)](https://discordapp.com/channels/${serverId}/${quote.channel}/${quote.messageid})`;
				message.channel.send(quoteMessage);
			} else {
				message.channel.send({ embeds: [quoteEmbed], allowedMentions: { User: false } });
			}
		};

		const { rowCount } = await database.query(
			`SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
			[tableName]
		);
		if (!rowCount) {
			message.channel.send('No quotes are available for this server.');
			return;
		}

		let query;
		let params = [];
		let useAll = false;

		if (!isNaN(entryNumber)) {
			query = `
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
          FROM "${tableName}"
        ) sub
        WHERE rownum = $1
      `;
			params.push(entryNumber);
		} else if (args[0] && args[0].startsWith('<@')) {
			const userId = args[0].replace(/[<@!>]/g, '');
			query = `
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
          FROM "${tableName}"
        ) sub
        WHERE userid = $1
      `;
			params.push(userId);
			useAll = true;
		} else if (args[0] && args[0].toLowerCase() === 'latest') {
			let count = 0;
			try {
				const { rows } = await database.query(`SELECT COUNT(*)::int AS count FROM "${tableName}"`);
				count = rows[0]?.count || 0;
			} catch (err) {
				count = 0;
				notify.error('Error fetching latest quote:', err, '0x000000');
			}

			query = `
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
          FROM "${tableName}"
        ) sub
        WHERE rownum = $1
      `;
			params.push(count);
			useAll = true;
		} else if (nick) {
			query = `
  SELECT * FROM (
    SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
    FROM "${tableName}"
  ) sub
  WHERE nick = $1
`;
			params.push(nick);
			useAll = true;
		} else {
			query = `
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
          FROM "${tableName}"
        ) sub
        ORDER BY RANDOM() LIMIT 1
      `;
		}

		try {
			const { rows } = await database.query(query, params);
			if (!rows.length) {
				message.channel.send(useAll ? 'No matching quotes found.' : 'No matching quote found.');
				return;
			}
			const quote = useAll ? rows[Math.floor(Math.random() * rows.length)] : rows[0];
			sendQuoteEmbed(quote);
		} catch (err) {
			notify.error(`Error querying ${tableName}:`, err, '0x000000');
			message.channel.send('An error occurred while retrieving quotes.');
		}
	}
};
