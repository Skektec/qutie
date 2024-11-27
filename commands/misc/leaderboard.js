const { SlashCommandBuilder } = require("discord.js");
const axios = require("axios");

async function fetcher(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching JSON data:", error);
    return null;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Creates a leaderboard of all quotes in the server."),
  async execute(interaction) {
    const serverId = interaction.guild?.id;

    const url = `https://admin.ub3r-b0t.com/api/quotes/${serverId}`;
    console.log(url);

    const data = await fetcher(url);

    if (data) {
      console.log("Fetched data:", data);

      await interaction.reply(`Leaderboard data: ${JSON.stringify(data)}`);
    } else {
      await interaction.reply("Failed to fetch leaderboard data");
    }
  },
};
