const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const maps = require("../../data/wtMaps.json");
const error = require("../../functions/error");
const formTeamData = require("../../data/formTeamData.json");
const mapBlacklist = require("../../data/mapBlacklist.json");
const fs = require("fs");
const path = require("path");
const { stringify } = require("querystring");

const teamDataMap = new Map();

function getMap(maps) {
  const mapNames = Object.keys(maps);
  const randomMapName = mapNames[Math.floor(Math.random() * mapNames.length)];
  const randomMapUrl = maps[randomMapName];
  return { randomMapName, randomMapUrl };
}

// math yucky
function formTeam(team1, team2, userId) {
  let allIds = [...team1, ...team2].map((m) => m.id);
  allIds = allIds.filter((id, idx, arr) => arr.indexOf(id) === idx);

  // Adds new users to db
  if (userId && !allIds.includes(userId)) {
    allIds.push(userId);

    if (!formTeamData.players.some((player) => player.id === userId)) {
      formTeamData.players.push({ id: userId, points: 1000 });
      fs.writeFileSync(
        path.join(__dirname, "../../data/formTeamData.json"),
        JSON.stringify(formTeamData, null, 2)
      );
    }
  }

  const allPlayers = allIds.map((id) => {
    const player = formTeamData.players.find((p) => p.id === id);
    return {
      id,
      points: player?.points || 1000,
    };
  });

  let bestSplit = { team1: [], team2: [] };
  let bestScore = Infinity;
  const ITERATIONS = 1000;

  for (let i = 0; i < ITERATIONS; i++) {
    const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

    const t1 = [],
      t2 = [];
    for (let j = 0; j < shuffled.length; j++) {
      if (t1.length <= t2.length) {
        t1.push(shuffled[j]);
      } else {
        t2.push(shuffled[j]);
      }
    }

    const avg1 = t1.length
      ? t1.reduce((acc, p) => acc + p.points, 0) / t1.length
      : 0;
    const avg2 = t2.length
      ? t2.reduce((acc, p) => acc + p.points, 0) / t2.length
      : 0;
    const score = Math.pow(avg1 - avg2, 2);

    if (score < bestScore) {
      bestScore = score;
      bestSplit = { team1: t1, team2: t2 };
    }
  }

  team1.length = 0;
  team2.length = 0;
  team1.push(...bestSplit.team1);
  team2.push(...bestSplit.team2);
}

function updateTeamEmbed(
  team1,
  team2,
  randomMapName,
  randomMapUrl,
  winner = null
) {
  return new EmbedBuilder()
    .setColor(0x0ff08b)
    .setTitle("Team Tank Battles")
    .setDescription(
      winner === 1
        ? "Team 1 win"
        : winner === 2
        ? "Team 2 win"
        : winner === 0
        ? "No Winner/Draw"
        : "Match in progress"
    )
    .addFields(
      {
        name: winner === 1 ? "Team 1  👑" : "Team 1",
        value:
          team1.map((member) => `<@${member.id}>`).join("\n") || "No members",
        inline: true,
      },
      {
        name: winner === 2 ? "Team 2  👑" : "Team 2",
        value:
          team2.map((member) => `<@${member.id}>`).join("\n") || "No members",
        inline: true,
      }
    )
    .addFields({ name: "Map is: ", value: randomMapName })
    .setImage(randomMapUrl)
    .setTimestamp();
}

function createTeamButtons(setDisabled = false) {
  const join = new ButtonBuilder()
    .setCustomId("join")
    .setLabel("Join a Team")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(setDisabled);

  const leave = new ButtonBuilder()
    .setCustomId("leave")
    .setLabel("Leave a Team")
    .setStyle(ButtonStyle.Danger)
    .setDisabled(setDisabled);

  const newMap = new ButtonBuilder()
    .setCustomId("newmap")
    .setLabel("Roll Map")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(setDisabled);

  const rollTeam = new ButtonBuilder()
    .setCustomId("rollTeam")
    .setLabel("Roll Team")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(setDisabled);

  const team1Win = new ButtonBuilder()
    .setCustomId("team1Win")
    .setLabel("Team 1 Win")
    .setStyle(ButtonStyle.Success)
    .setDisabled(setDisabled);

  const team2Win = new ButtonBuilder()
    .setCustomId("team2Win")
    .setLabel("Team 2 Win")
    .setStyle(ButtonStyle.Success)
    .setDisabled(setDisabled);

  const noWin = new ButtonBuilder()
    .setCustomId("noWin")
    .setLabel("No Win/Draw")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(setDisabled);

  const row1 = new ActionRowBuilder().addComponents(
    join,
    leave,
    newMap,
    rollTeam
  );
  const row2 = new ActionRowBuilder().addComponents(team1Win, team2Win, noWin);

  return [row1, row2];
}

function winner(team1, team2, winningTeam) {
  const winners = winningTeam === 1 ? team1 : team2;
  const losers = winningTeam === 1 ? team2 : team1;

  winners.forEach((member) => {
    const player = formTeamData.players.find((p) => p.id === member.id);
    if (player) player.points += 23;
  });

  losers.forEach((member) => {
    const player = formTeamData.players.find((p) => p.id === member.id);
    if (player) player.points -= 12;
  });

  fs.writeFileSync(
    path.join(__dirname, "../../data/formTeamData.json"),
    JSON.stringify(formTeamData, null, 2)
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("formteam")
    .setDescription(
      "Forms a PvP team and get a random map for Team battles in War Thunder."
    ),

  async execute(interaction) {
    try {
      const team1 = [];
      const team2 = [];

      serverId = interaction.guild.id;
      const blacklist = mapBlacklist[serverId] || [];

      do {
        ({ randomMapName, randomMapUrl } = getMap(maps));
      } while (blacklist.includes(randomMapName));

      const formedTeam = updateTeamEmbed(
        team1,
        team2,
        randomMapName,
        randomMapUrl
      );

      const [row1, row2] = createTeamButtons();

      await interaction.reply({
        embeds: [formedTeam],
        components: [row1, row2],
      });
      const message = await interaction.fetchReply();

      const messageId = message.id;

      teamDataMap.set(messageId, {
        team1,
        team2,
        randomMapName,
        randomMapUrl,
      });

      return message;
    } catch (err) {
      error.log("Error forming team: " + err);
    }
  },
  teamDataMap,
  getMap,
  formTeam,
  updateTeamEmbed,
  createTeamButtons,
  winner,
};
