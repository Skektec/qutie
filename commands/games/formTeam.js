const {SlashCommandBuilder} = require('discord.js');
const {exec} = require('child_process');
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
    return {randomMapName, randomMapUrl};
}

function calculateTeamsPy(param1, param2) {
    return new Promise((resolve, reject) => {
        exec(`python3 ./commands/games/math.py ${param1} ${param2}`, (error, stdout, stderr) => {
            if (error) {
                console.error('Python error:', error);
                return null;
            }
            if (stderr) {
                console.error('Python stderr:', stderr);
            }
            console.log('STDOUT:', stdout);
            resolve(stdout.trim());
        });
    });
}

async function formTeam(userId, gameName, playerRecordArray) {
    if (!formTeamData[gameName]) {
        formTeamData[gameName] = [];
    }

    const playerExists = formTeamData[gameName].some((player) => player.id === userId);

    if (!playerExists) {
        formTeamData[gameName].push({id: userId, points: 1000});
        saveFormTeamData();
    }

    const playerRecord = formTeamData[gameName].find((x) => x.id === userId);

    if (!playerRecordArray.some((record) => record.hasOwnProperty(userId))) {
        playerRecordArray.push({[playerRecord.id]: playerRecord.points});
    }

    if (playerRecordArray.length < 2) {
        team1 = [userId];
        team2 = [];
    }

    if (playerRecordArray.length >= 2) {
        let players = Object.assign(
            {},
            ...playerRecordArray.map((x) => {
                const idKey = Object.keys(x)[0];
                return {[idKey]: x[idKey]};
            })
        );

        const std = 30;
        const playerArg = JSON.stringify(players);

        const output = await calculateTeamsPy(playerArg, std);

        const teams = output.slice(2, -2);
        const splitTeams = teams.split('), (').filter(Boolean);

        if (splitTeams.length >= 2) {
            const assignIds = (teamString) => {
                return teamString
                    .split(',')
                    .map((id) => id.replace(/'/g, '').trim())
                    .filter(Boolean);
            };

            team1 = assignIds(splitTeams[0]);
            team2 = assignIds(splitTeams[1]);
        }
    }

    console.log('Team 1:', team1, '\nTeam 2:', team2);

    return {team1, team2};
}

async function rollTeam(playerRecordArray) {
    team1 = [];
    team2 = [];

    let players = Object.assign(
        {},
        ...playerRecordArray.map((x) => {
            const idKey = Object.keys(x)[0];
            return {[idKey]: x[idKey]};
        })
    );

    const std = 30;
    const playerArg = JSON.stringify(players);

    const output = await calculateTeamsPy(playerArg, std);

    const teams = output.slice(2, -2);
    const splitTeams = teams.split('), (').filter(Boolean);

    if (playerRecordArray.length < 2) {
        team1 = [userId];
        team2 = [];
    }

    if (splitTeams.length >= 2) {
        const assignIds = (teamString) => {
            return teamString
                .split(',')
                .map((id) => id.replace(/'/g, '').trim())
                .filter(Boolean);
        };

        team1 = assignIds(splitTeams[0]);
        team2 = assignIds(splitTeams[1]);
    }

    return {team1, team2};
}

function winner(team1, team2, winningTeam, gameName) {
    const winners = winningTeam === 1 ? team1 : team2;
    const losers = winningTeam === 1 ? team2 : team1;

    winners.forEach((member) => {
        let player = formTeamData[gameName].find((p) => p.id === member);
        player.points += 23;
    });

    losers.forEach((member) => {
        let player = formTeamData[gameName].find((p) => p.id === member);
        player.points = Math.max(0, player.points - 12);
    });

    saveFormTeamData();
}

function saveFormTeamData() {
    const dir = path.dirname(path.join(__dirname, '../../data/formTeamData.json'));
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
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

            await interaction.respond(choices.map((choice) => ({name: choice, value: choice})));
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
                ({randomMapName, randomMapUrl} = getMap(maps));
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
                playerRecordArray: [],
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
    winner,
    rollTeam
};
