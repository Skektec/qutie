const sqlite3 = require("sqlite3").verbose();
const database = new sqlite3.Database("./data/general.db");

module.exports = {
  execute: async (reaction, bot, user) => {
    const ogBastard = user;
    const botHasReacted = await reaction.users
      .fetch()
      .then((users) => users.has(bot.user.id));

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

    database.run(
      `CREATE TABLE IF NOT EXISTS "${tableName}" (
        nick TEXT,
        userId TEXT,
        channel TEXT,
        server TEXT,
        text TEXT,
        messageId TEXT UNIQUE,
        time INTEGER
      )`,
      (err) => {
        if (err) console.error(`Error creating table ${tableName}:`, err);
      }
    );

    database.get(
      `SELECT 1 FROM "${tableName}" WHERE messageId = ? LIMIT 1`,
      [messageId],
      (err, row) => {
        if (err) {
          console.error(`Error checking for duplicate in ${tableName}:`, err);
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
          [nick, userId, channel, server, text, messageId, time],
          function (err) {
            if (err) {
              console.error(`Error inserting into ${tableName}:`, err);
            } else {
              reaction.message.react("💬");
              reaction.message.reply({
                content: `New quote added by ${ogBastard.username} as #${this.lastID}\n"${text}"`,
                allowedMentions: { repliedUser: false },
              });
            }
          }
        );
      }
    );
  },
};
