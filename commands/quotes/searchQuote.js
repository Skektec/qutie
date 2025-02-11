const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const stringSimilarity = require("string-similarity");
const path = require("path");
const Database = require("better-sqlite3");
const dbPath = path.resolve(__dirname, "../../data/general.db");
const db = new Database(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("searchquote")
    .setDescription("Search for specific keywords in quotes.")
    .addStringOption((option) =>
      option.setName("keywords").setDescription("Keywords").setRequired(true)
    ),

  async execute(interaction) {
    const search = interaction.options.getString("keywords");

    try {
      const server = interaction.guildId;
      const tableName = `${server}-quotes`;

      const quotesArray = db
        .prepare(`SELECT *, rowid FROM "${tableName}"`)
        .all();

      const matches = quotesArray.filter((quote) => {
        const similarResult = stringSimilarity.compareTwoStrings(
          quote.text,
          search
        );
        return similarResult > 0.35;
      });

      const matchesArray = [];
      matches.forEach((match) => {
        matchesArray.push(match);
      });

      const matchesText = matchesArray
        .map((match) => `"${match.text}" - #${match.rowid}`)
        .join("\n");

      const foundMatches = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Searched for: " + search)
        .addFields({
          name: "Matches:",
          value: matchesText,
          inline: true,
        });

      interaction.reply({ embeds: [foundMatches] });
    } catch (err) {
      console.error("Error: " + err);
    }
  },
};
