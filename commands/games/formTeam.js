const { SlashCommandBuilder } = require('discord.js');
const teamGames = require('../../data/teamGames.json');
const maps = require('../../data/wtMaps.json');
const notify = require('../../functions/notify');
const formTeamData = require('../../data/formTeamData.json');
const mapBlacklist = require('../../data/mapBlacklist.json');

const fs = require('fs');
const path = require('path');

const teamDataMap = new Map();

function getMap(maps) {
	const mapNames = Object.keys(maps);
	const randomMapName = mapNames[Math.floor(Math.random() * mapNames.length)];
	const randomMapUrl = maps[randomMapName];
	return { randomMapName, randomMapUrl };
}

// math yucky
function formTeam(team1, team2, userId, gameName) {
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
			points: gamePlayer?.points ?? 1000
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

		const avg1 = t1.length ? t1.reduce((acc, p) => acc + p.points, 0) / t1.length : 0;
		const avg2 = t2.length ? t2.reduce((acc, p) => acc + p.points, 0) / t2.length : 0;
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

function winner(team1, team2, winningTeam, gameName) {
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
}

function saveFormTeamData() {
	const dir = path.dirname(path.join(__dirname, '../../data/formTeamData.json'));
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	fs.writeFileSync(
		path.join(__dirname, '../../data/formTeamData.json'),
		JSON.stringify(formTeamData, null, 2)
	);
}

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

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'game') {
			const searchQuery = focusedOption.value.toLowerCase();

			const choices = Object.keys(teamGames)
				.filter((gameName) => gameName.toLowerCase().includes(searchQuery))
				.sort((a, b) => {
					const aStartsWith = a.toLowerCase().startsWith(searchQuery);
					const bStartsWith = b.toLowerCase().startsWith(searchQuery);
					if (aStartsWith && !bStartsWith) return -1;
					if (!aStartsWith && bStartsWith) return 1;
					return a.localeCompare(b);
				})
				.slice(0, 25);

			await interaction.respond(choices.map((choice) => ({ name: choice, value: choice })));
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
