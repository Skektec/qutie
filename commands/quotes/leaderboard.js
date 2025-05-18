const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const path = require("path");
const Database = require("better-sqlite3");
const dbPath = path.resolve(__dirname, "../../data/general.db");
const db = new Database(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("quoteboard")
    .setDescription("Creates a leaderboard of all quotes in the server."),
  async execute(interaction) {
    await interaction.deferReply();
    const server = interaction.guildId;
    const tableName = `${server}-quotes`;

    const quotes = db.prepare(`SELECT * FROM "${tableName}"`).all();

    const counts = {};

    quotes.forEach((item) => {
      const userId = item.userId;
      counts[userId] = (counts[userId] || 0) + 1;
    });

    const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    const leaderboardText = sortedCounts
      .map(
        ([userId, count], index) =>
          `${index + 1}. **<@${userId}>** - ${count} quotes`
      )
      .join("\n");

    const leaderboardEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Quote Leaderboard")
      .setDescription(leaderboardText || "No quotes yet.")
      .setFooter({ text: "Damn, touch grass." });

    interaction.editReply({ embeds: [leaderboardEmbed] });
  },
};
