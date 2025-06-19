const { EmbedBuilder } = require("discord.js");
const database = require("../functions/database");
const error = require("../functions/error");

module.exports = {
  execute: async (message, args) => {
    const serverId = message.guildId;
    const tableName = `${serverId}-quotes`;
    const entryNumber = parseInt(args[0]);
    const nick = args[0];

    const sendQuoteEmbed = (quote) => {
      if (!quote) {
        message.channel.send("No matching quote found.");
        return;
      }

      const quoteTimestamp = quote.time * 1000;
      const quoteDate = new Date(quoteTimestamp);
      const formattedDate = quoteDate.toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      });

      const image = quote.text.match(/(https?:\/\/\.)\S+/gi);

      const quoteEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Quote #${quote.rownum}`)
        .setDescription(
          `${quote.text} \n - <@${quote.userid}> [(Jump)](https://discordapp.com/channels/${serverId}/${quote.channel}/${quote.messageid})`
        )
        .setImage(image || quote.image)
        .setFooter({ text: `${formattedDate}` });

      message.channel.send({ embeds: [quoteEmbed] });
    };

    const { rowCount } = await database.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name = $1`,
      [tableName]
    );
    if (!rowCount) {
      message.channel.send("No quotes are available for this server.");
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
    } else if (args[0] && args[0].startsWith("<@")) {
      const userId = args[0].replace(/[<@!>]/g, "");
      query = `
        SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
        FROM "${tableName}"
        WHERE userid = $1
      `;
      params.push(userId);
      useAll = true;
    } else if (nick) {
      query = `
        SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
        FROM "${tableName}"
        WHERE nick = $1
      `;
      params.push(nick);
      useAll = true;
    } else {
      // Random quote
      query = `
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
          FROM "${tableName}"
        ) sub
        ORDER BY RANDOM() LIMIT 1
      `;
    }

    try {
      if (useAll) {
        const { rows } = await database.query(query, params);
        if (!rows.length) {
          message.channel.send("No matching quotes found.");
          return;
        }
        const quote = rows[Math.floor(Math.random() * rows.length)];
        sendQuoteEmbed(quote);
      } else {
        const { rows } = await database.query(query, params);
        if (!rows.length) {
          message.channel.send("No matching quote found.");
          return;
        }
        sendQuoteEmbed(rows[0]);
      }
    } catch (err) {
      error.log(`Error querying ${tableName}:`, err);
      message.channel.send("An error occurred while retrieving quotes.");
    }
  },
};
