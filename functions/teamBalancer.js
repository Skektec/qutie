const formTeamData = require('../data/formTeamData.json');
const fileSystem = require('./fileSystem');

function saveFormTeamData() {
  fileSystem.writeFile(
    require.resolve('../data/formTeamData.json'),
    JSON.stringify(formTeamData, null, 2)
  );
}

module.exports = {
  formTeam: (team1, team2, userId, gameName) => {
    if (!formTeamData[gameName]) {
      formTeamData[gameName] = [];
    }

    if (!formTeamData.players) {
      formTeamData.players = [];
    }

    let allIds = [...team1, ...team2].map((m) => m.id);
    allIds = allIds.filter((id, idx, arr) => arr.indexOf(id) === idx);

    if (userId && !allIds.includes(userId)) {
      allIds.push(userId);

      if (!formTeamData[gameName].some((player) => player.id === userId)) {
        formTeamData[gameName].push({ id: userId, points: 1000 });
        saveFormTeamData();
      }

      if (!formTeamData.players.some((player) => player.id === userId)) {
        formTeamData.players.push({ id: userId, points: 1000 });
        saveFormTeamData();
      }
    }

    const allPlayers = allIds.map((id) => {
      const gamePlayer = formTeamData[gameName]?.find((p) => p.id === id);

      return {
        id,
        points: gamePlayer?.points ?? 1000,
      };
    });

    let bestSplit = { team1: [], team2: [] };
    let bestScore = Infinity;
    const ITERATIONS = 1000;

    for (let i = 0; i < ITERATIONS; i++) {
      const shuffled = [...allPlayers].sort(() => Math.random() - 0.5);

      const t1 = [];
      const t2 = [];
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
  },

  winner: (team1, team2, winningTeam, gameName) => {
    const winners = winningTeam === 1 ? team1 : team2;
    const losers = winningTeam === 1 ? team2 : team1;

    if (!formTeamData[gameName]) {
      formTeamData[gameName] = [];
    }

    winners.forEach((member) => {
      let player = formTeamData[gameName].find((p) => p.id === member.id);
      if (!player) {
        player = { id: member.id, points: 1023 };
        formTeamData[gameName].push(player);
      } else {
        player.points += 23;
      }
    });

    losers.forEach((member) => {
      let player = formTeamData[gameName].find((p) => p.id === member.id);
      if (!player) {
        player = { id: member.id, points: 988 };
        formTeamData[gameName].push(player);
      } else {
        player.points = Math.max(0, player.points - 12);
      }
    });

    saveFormTeamData();
  },
};
