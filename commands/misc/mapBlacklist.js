const { SlashCommandBuilder, AllowedMentionsTypes } = require("discord.js");
const error = require("../../functions/error");
const mapblacklist = require("../../data/mapBlacklist.json");
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
      try {
        const maps = JSON.parse(
          fs.readFileSync(require.resolve("../../data/wtMaps.json"), "utf8")
        );
        const blacklistData = JSON.parse(
          fs.readFileSync(
            require.resolve("../../data/mapBlacklist.json"),
            "utf8"
          )
        );
        const excludeList = blacklistData[serverId] || [];
        const searchQuery = focusedOption.value.toLowerCase();

        const choices = Object.keys(maps)
          .filter(
            (mapName) =>
              !excludeList.includes(mapName) &&
              mapName.toLowerCase().includes(searchQuery)
          )
          .sort((a, b) => {
            const aStartsWith = a.toLowerCase().startsWith(searchQuery);
            const bStartsWith = b.toLowerCase().startsWith(searchQuery);
            if (aStartsWith && !bStartsWith) return -1;
            if (!aStartsWith && bStartsWith) return 1;
            return a.localeCompare(b);
          })
          .slice(0, 25);

        await interaction.respond(
          choices.map((choice) => ({ name: choice, value: choice }))
        );
      } catch (err) {
        error.log("Error in blacklist autocomplete: " + err);
      }
    }
  },

  async execute(interaction) {
    const serverId = interaction.guild.id;
    map = interaction.options.getString("map");

    try {
      const blacklistData = JSON.parse(
        fs.readFileSync(require.resolve("../../data/mapBlacklist.json"), "utf8")
      );
      if (!blacklistData[serverId]) {
        blacklistData[serverId] = [];
      }
      if (!blacklistData[serverId].includes(map)) {
        blacklistData[serverId].push(map);
      }
      fs.writeFileSync(
        require.resolve("../../data/mapBlacklist.json"),
        JSON.stringify(blacklistData, null, 2)
      );

      interaction.reply({
        content: `<@${interaction.user.id}> blacklisted ${map}.`,
        allowedMentions: { repliedUser: false },
      });
    } catch (err) {
      error.log("Error blacklisting map: " + err);
    }
  },
};
