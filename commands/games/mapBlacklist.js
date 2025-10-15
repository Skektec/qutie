const { SlashCommandBuilder, AllowedMentionsTypes } = require('discord.js');
const notify = require('../../functions/notify');
const mapblacklist = require('../../data/mapBlacklist.json');
const fileSystem = require('../../functions/fileSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklistmap')
    .setDescription('Blacklist a War Thunder map from team battles command.')
    .addStringOption((option) =>
      option
        .setName('map')
        .setDescription('Select the map to blacklist.')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  const autocomplete = require('../../functions/autocomplete');

// ... (rest of the file)

  async autocomplete(interaction) {
    const serverId = interaction.guild.id;
    if (interaction.options.getFocused(true).name === 'map') {
      const maps = JSON.parse(
        fileSystem.readFile(require.resolve('../../data/wtMaps.json'))
      );
      const blacklistData = JSON.parse(
        fileSystem.readFile(require.resolve('../../data/mapBlacklist.json'))
      );
      const excludeList = blacklistData[serverId] || [];
      const choices = Object.keys(maps).filter(
        (mapName) => !excludeList.includes(mapName)
      );
      await autocomplete.createGameAutocomplete(interaction, choices);
    }
  },

  async execute(interaction) {
    const serverId = interaction.guild.id;
    map = interaction.options.getString('map');

    try {
      const blacklistDataJSON = fileSystem.readFile(
        require.resolve('../../data/mapBlacklist.json')
      );
      if (!blacklistDataJSON) {
        return interaction.reply({
          content: 'Error reading blacklist file.',
          flags: MessageFlags.Ephemeral,
        });
      }
      const blacklistData = JSON.parse(blacklistDataJSON);
      if (!blacklistData[serverId]) {
        blacklistData[serverId] = [];
      }
      if (!blacklistData[serverId].includes(map)) {
        blacklistData[serverId].push(map);
      }
      fileSystem.writeFile(
        require.resolve('../../data/mapBlacklist.json'),
        JSON.stringify(blacklistData, null, 2)
      );

      interaction.reply({
        content: `<@${interaction.user.id}> blacklisted ${map}.`,
        allowedMentions: { repliedUser: false },
      });
    } catch (err) {
      notify.error('Error blacklisting map', err, '-1x04084');
    }
  },
};
