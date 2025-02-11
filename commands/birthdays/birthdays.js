const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const path = require("path");
const Database = require("better-sqlite3");
const dbPath = path.resolve(__dirname, "../../data/general.db");
const db = new Database(dbPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthdayboard")
    .setDescription("Presents a list of all birthdays."),

  async execute(interaction) {
    try {
      const server = interaction.guildId;

      const outputBirthdays = db
        .prepare("SELECT * FROM birthdays WHERE server = ?")
        .all(server);

      const birthdayList =
        outputBirthdays.length > 0
          ? outputBirthdays.map((b) => `🎂 ${b.nick} - ${b.date}`).join("\n")
          : "No birthdays found.";

      const birthdayEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Birthdays")
        .setDescription(birthdayList);

      await interaction.reply({ embeds: [birthdayEmbed] });
    } catch (err) {
      console.error("Database error:", err);
      await interaction.reply({
        content: `Error: ${err.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
