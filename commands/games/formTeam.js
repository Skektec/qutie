const { SlashCommandBuilder } = require('discord.js');
const teamGames = require('../../data/teamGames.json');
const maps = require('../../data/wtMaps.json');
const notify = require('../../functions/notify');
const formTeamData = require('../../data/formTeamData.json');
const mapBlacklist = require('../../data/mapBlacklist.json');

const teamBalancer = require('../../functions/teamBalancer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('formteam')
    .setDescription('Forms a PvP team and get a random map for Team battles in War Thunder.')
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('What game do we need a team for.')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  const autocomplete = require('../../functions/autocomplete');

// ... (rest of the file)

  async autocomplete(interaction) {
    if (interaction.options.getFocused(true).name === 'game') {
      await autocomplete.createGameAutocomplete(interaction, Object.keys(teamGames));
    }
  },

  //TODO: Add lock team/map button

  async execute(interaction) {
    try {
      const gameName = interaction.options.getString('game');
      const gameModuleName = teamGames[gameName] || gameName.replace(/\s+/g, '').toLowerCase();
      const game = require(`../../games/${gameModuleName}.js`);

      if (
        typeof game.updateTeamEmbed !== 'function' ||
				typeof game.createTeamButtons !== 'function'
      ) {
        throw new Error(`Game module "${gameName}" is missing required exports.`);
      }

      const team1 = [];
      const team2 = [];

      const serverId = interaction.guild.id;
      const blacklist = mapBlacklist[serverId] || [];

      let randomMapName, randomMapUrl;
      do {
        ({ randomMapName, randomMapUrl } = getMap(maps));
      } while (blacklist.includes(randomMapName));

      const formedTeam = game.updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
      const [row1, row2] = game.createTeamButtons();

      await interaction.reply({
        embeds: [formedTeam],
        components: [row1, row2]
      });

      const message = await interaction.fetchReply();
      const messageId = message.id;

      teamDataMap.set(messageId, {
        team1,
        team2,
        randomMapName,
        randomMapUrl,
        gameName: gameModuleName
      });

      return message;
    } catch (err) {
      notify.error('Error forming team', err, '-1x03245');
      await interaction.reply({
        content: `❌ Failed to form team for game: ${interaction.options.getString('game')}`
      });
    }
  },

  teamDataMap,
  getMap,
  formTeam,
  winner
};
