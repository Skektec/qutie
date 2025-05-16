const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const maps = require("../data/wtMaps.json");
const error = require("../functions/error");
const {
  teamDataMap,
  getMap,
  shuffleTeam,
  updateTeamEmbed,
  createTeamButtons,
} = require("../commands/misc/formTeam");

module.exports = {
  name: "interactionCreate",
  async execute(buttonInteraction) {
    try {
      if (!buttonInteraction.isButton()) return;

      const fetchedMessage = buttonInteraction.message;

      const teamData = teamDataMap.get(fetchedMessage.id);

      if (!teamData) {
        console.error("No team data found for message ID:", fetchedMessage.id);
        console.error(
          "Current Team Data Map keys:",
          Array.from(teamDataMap.keys())
        );
        return;
      }

      const { team1, team2, randomMapName, randomMapUrl } = teamData;

      const userId = buttonInteraction.user.id;
      const username = buttonInteraction.user.username;

      try {
        await buttonInteraction.deferUpdate();
      } catch (deferError) {
        console.error("Error deferring update:", deferError);
      }

      if (buttonInteraction.customId === "newmap") {
        const newMapData = getMap(maps);

        teamData.randomMapName = newMapData.randomMapName;
        teamData.randomMapUrl = newMapData.randomMapUrl;

        const updatedTeam = updateTeamEmbed(
          team1,
          team2,
          newMapData.randomMapName,
          newMapData.randomMapUrl
        );
        await fetchedMessage.edit({ embeds: [updatedTeam] });
      }

      if (buttonInteraction.customId === "join") {
        if (
          team1.some((member) => member.id === userId) ||
          team2.some((member) => member.id === userId)
        ) {
          return;
        }

        if (team1.length <= team2.length) {
          team1.push({ id: userId, username });
        } else {
          team2.push({ id: userId, username });
        }

        shuffleTeam(team1, team2);

        const updatedTeam = updateTeamEmbed(
          team1,
          team2,
          randomMapName,
          randomMapUrl
        );
        await fetchedMessage.edit({ embeds: [updatedTeam] });
      }

      if (buttonInteraction.customId === "leave") {
        const index1 = team1.findIndex((member) => member.id === userId);
        if (index1 !== -1) team1.splice(index1, 1);

        const index2 = team2.findIndex((member) => member.id === userId);
        if (index2 !== -1) team2.splice(index2, 1);

        const updatedTeam = updateTeamEmbed(
          team1,
          team2,
          randomMapName,
          randomMapUrl
        );
        await fetchedMessage.edit({ embeds: [updatedTeam] });
      }
    } catch (error) {
      console.error("Unhandled error in button interaction:", error);
      try {
        await buttonInteraction.reply({
          content: "An error occurred while processing your interaction.",
          ephemeral: true,
        });
      } catch (replyError) {
        console.error("Error sending error reply:", replyError);
      }
    }
  },
};
