const database = require('./database');
const notify = require('./notify');
const { getClient } = require('../data/clientInstance');

module.exports = {
  execute: async (reaction) => {
    const client = getClient();

    try {
      botHasReacted = await reaction.users.fetch().then((users) => users.has(client.user.id));
    } catch {
      botHasReacted = null;
    }

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

    try {
      await database.query(
        `CREATE TABLE IF NOT EXISTS "${tableName}" (
          nick TEXT,
          userId TEXT,	
          channel TEXT,
          server TEXT,
          text TEXT,
          messageId TEXT UNIQUE,
          time BIGINT,
          image TEXT
        )`
      );

      const { rowCount } = await database.query(
        `SELECT 1 FROM "${tableName}" WHERE messageId = $1 LIMIT 1`,
        [messageId]
      );
      if (rowCount > 0) {
        return;
      }

      const insertQuery = `
        INSERT INTO "${tableName}" (nick, userId, channel, server, text, messageId, time, image)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      await database.query(insertQuery, [
        nick,
        userId,
        channel,
        server,
        text,
        messageId,
        time,
        image
      ]);

      const { rows } = await database.query(
        `
        SELECT rownum FROM (
          SELECT messageId, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
          FROM "${tableName}"
        ) sub
        WHERE messageId = $1
        `,
        [messageId]
      );
      const rownum = rows[0]?.rownum;

      await reaction.message.react('💬');

      let quotedContent;
      if (text && image) {
        quotedContent = `${text} \n ${image}`;
      } else {
        quotedContent = text || image;
      }

      if (quotedContent.length > 1900) quotedContent = quotedContent.substring(0, 1900) + '...';

      await reaction.message.reply({
        content: `New quote added by <@${reaction.users.cache.firstKey()}> as #${rownum}\n"${quotedContent}" - <@${userId}>`,
        allowedMentions: { repliedUser: false }
      });
    } catch (err) {
      notify.error('Error adding quote', err, '0x000000');
    }
  }
};
