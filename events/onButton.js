const maps = require("../data/wtMaps.json");
const { MessageFlags } = require("discord.js");
const {
  teamDataMap,
  getMap,
  formTeam,
  updateTeamEmbed,
  winner,
  createTeamButtons,
} = require("../commands/misc/formTeam");

module.exports = {
  name: "interactionCreate",
  async execute(buttonInteraction) {
    try {
      if (!buttonInteraction.isButton()) return;

      const fetchedMessage = buttonInteraction.message;

      const teamData = teamDataMap.get(fetchedMessage.id);

      const { team1, team2, randomMapName, randomMapUrl } = teamData;

      const userId = buttonInteraction.user.id;

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

      if (buttonInteraction.customId === "team1Win") {
        const updatedTeam = updateTeamEmbed(
          team1,
          team2,
          randomMapName,
          randomMapUrl,
          1
        );
        const [row1, row2] = createTeamButtons(true);
        await fetchedMessage.edit({
          embeds: [updatedTeam],
          components: [row1, row2],
        });

        const winningTeam = 1;
        winner(team1, team2, winningTeam);
      }

      if (buttonInteraction.customId === "team2Win") {
        const updatedTeam = updateTeamEmbed(
          team1,
          team2,
          randomMapName,
          randomMapUrl,
          2
        );
        const [row1, row2] = createTeamButtons(true);
        await fetchedMessage.edit({
          embeds: [updatedTeam],
          components: [row1, row2],
        });

        const winningTeam = 2;
        winner(team1, team2, winningTeam);
      }

      if (buttonInteraction.customId === "noWin") {
        const updatedTeam = updateTeamEmbed(
          team1,
          team2,
          randomMapName,
          randomMapUrl,
          0
        );
        const [row1, row2] = createTeamButtons(true);
        await fetchedMessage.edit({
          embeds: [updatedTeam],
          components: [row1, row2],
        });
      }

      if (buttonInteraction.customId === "join") {
        formTeam(team1, team2, userId);

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

      if (buttonInteraction.customId === "rollTeam") {
        formTeam(team1, team2, team1[0]?.id || team2[0]?.id);

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
          flags: MessageFlags.Ephemeral,
        });
      } catch (replyError) {
        console.error("Error sending error reply:", replyError);
      }
    }
  },
};
