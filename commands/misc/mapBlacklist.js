const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("blacklistmap")
    .setDescription("Blacklist a War Thunder map from team battles command.")
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Select the map to blacklist.")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction) {
    const serverId = interaction.guild.id;
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === "map") {
      const maps = JSON.parse(
        fs.readFileSync(require.resolve("../../data/wtMaps.json"), "utf8")
      );
      const blacklistData = JSON.parse(
        fs.readFileSync(require.resolve("../../data/mapBlacklist.json"), "utf8")
      );
      const excludeList = blacklistData[serverId] || [];

      const choices = Object.keys(maps).filter(
        (mapName) => !excludeList.includes(mapName)
      );

      await interaction.respond(
        choices.map((choice) => ({ name: choice, value: choice }))
      );
    }
  },

  async execute(interaction) {
    map = interaction.options.getUser("map");

    fs.writeFileSync(serverId.map);
  },
};
