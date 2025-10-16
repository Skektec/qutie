const { SlashCommandBuilder } = require('discord.js');
const { exec } = require('child_process');
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

function calculateTeams(param, callback) {
	exec(`python ./math.py ${param}`, (error, stdout, stderr) => {
		if (error) {
			console.error('Python error:', error);
			return callback(null);
		}
		if (stderr) {
			console.error('Python stderr:', stderr);
		}
		callback(stdout.trim());
	});
}

function formTeam(team1, team2, userId, gameName) {
	formTeamData[gameName] = [];

	if (!formTeamData[gameName].includes(userId)) {
		if (!formTeamData[gameName].some((player) => player.id === userId)) {
			formTeamData[gameName].push({ id: userId, points: 1000 });
			saveFormTeamData();
		}
	}

	let players = [];

	players.push(userId);

	players.forEach((userId) => {
		formTeamData[gameName];
	});

	calculateTeams(text, (output) => {
		// do something with output
		console.log('Python output:', output);
	});
}

function winner(team1, team2, winningTeam, gameName) {
	const winners = winningTeam === 1 ? team1 : team2;
	const losers = winningTeam === 1 ? team2 : team1;

	formTeamData[gameName] = [];

	winners.forEach((member) => {
		let player = formTeamData[gameName].find((p) => p.id === member.id);

		player.points += 23;
	});

	losers.forEach((member) => {
		let player = formTeamData[gameName].find((p) => p.id === member.id);

		player.points = Math.max(0, player.points - 12);
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
