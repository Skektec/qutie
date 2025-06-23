const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const database = require("../../functions/database");
const notify = require("../../functions/notify");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addquote")
    .setDescription("Manually add a quote.")
    .addStringOption((option) =>
      option
        .setName("quote")
        .setDescription("The text you want to quote.")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(`The person you're quoting.`)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("nick")
        .setDescription(`Nickname if the person isn't on the server.`)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("imageurl")
        .setDescription("Image URL that you want in the quote.")
        .setRequired(false)
    ),
  execute: async (interaction) => {
    const nick = interaction.options.getString("nick");
    let user = interaction.options.getUser("user");
    const channel = interaction.channelId;
    const server = interaction.guildId;
    const messageId = interaction.id;
    const text = interaction.options.getString("quote");
    const time = Math.floor(interaction.createdTimestamp / 1000);
    const image = interaction.options.getString("imageurl");
    const tableName = `${server}-quotes`;

    if (!text && !image) {
      return interaction.reply({
        content: "You must provide something to quote.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!user && !nick) {
      return interaction.reply({
        content: "You must provide either a user or a nickname.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (!user) {
      user = {
        id: 0,
        username: nick,
      };
    }

    try {
      await database.query(
        `CREATE TABLE IF NOT EXISTS "${tableName}" (
          nick TEXT,
          userId TEXT,
          channel TEXT,
          server TEXT,
          messageId TEXT PRIMARY KEY,
          text TEXT,
          time BIGINT,
          image TEXT
        )`
      );

      const { rowCount } = await database.query(
        `SELECT 1 FROM "${tableName}" WHERE messageId = $1 LIMIT 1`,
        [messageId]
      );
      if (rowCount > 0) {
        return interaction.reply({
          content: "This quote already exists.",
          flags: MessageFlags.Ephemeral,
        });
      }

      await database.query(
        `INSERT INTO "${tableName}" (nick, userId, channel, server, text, messageId, time, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [user.username, user.id, channel, server, text, messageId, time, image]
      );

      let quotedContent = text && image ? `${text} \n ${image}` : text || image;

      await interaction.reply({
        content: `New quote added by ${interaction.user}\n"${quotedContent}" - ${user.username}`,
        allowedMentions: { repliedUser: false },
      });
    } catch (err) {
      notify.error(`Error inserting into ${tableName}.`, err, "1x09103");
      await interaction.reply({
        content: "There was an error adding the quote.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
