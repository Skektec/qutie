const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const maps = require('../../data/wtMaps.json');
const error = require('../../events/error');

const teamDataMap = new Map();

function getMap(maps) {
	const mapNames = Object.keys(maps);
	const randomMapName =
		mapNames[Math.floor(Math.random() * mapNames.length)];
	const randomMapUrl = maps[randomMapName];
	return { randomMapName, randomMapUrl };
}

function shuffleTeam(team1, team2) {
	const allMembers = [...team1, ...team2];
	const shuffledMembers = allMembers.sort(() => Math.random() - 0.5);

	const half = Math.ceil(shuffledMembers.length / 2);
	team1.length = 0;
	team2.length = 0;
	team1.push(...shuffledMembers.slice(0, half));
	team2.push(...shuffledMembers.slice(half));
}

function updateTeamEmbed(team1, team2, randomMapName, randomMapUrl) {
	return new EmbedBuilder()
		.setColor(0x0ff08b)
		.setTitle('Team Tank Battles')
		.setDescription('Team Composition and Map')
		.addFields(
			{
				name: 'Team 1',
				value: team1.map((member) => member.username).join('\n') || 'No members',
			},
			{
				name: 'Team 2',
				value: team2.map((member) => member.username).join('\n') || 'No members',
			}
		)
		.addFields({ name: 'Map is: ', value: randomMapName, inline: true })
		.setImage(randomMapUrl)
		.setTimestamp();
}

function createTeamButtons(disabled = false) {
	const join = new ButtonBuilder()
		.setCustomId('join')
		.setLabel('Join a Team')
		.setStyle(ButtonStyle.Primary)
		.setDisabled(disabled);

	const leave = new ButtonBuilder()
		.setCustomId('leave')
		.setLabel('Leave a Team')
		.setStyle(ButtonStyle.Danger)
		.setDisabled(disabled);

	const newMap = new ButtonBuilder()
		.setCustomId('newmap')
		.setLabel('Roll Map')
		.setStyle(ButtonStyle.Primary)
		.setDisabled(disabled);

	const lockin = new ButtonBuilder()
		.setCustomId('lockin')
		.setLabel('Lock In')
		.setStyle(ButtonStyle.Success)
		.setDisabled(disabled);

	return new ActionRowBuilder().addComponents(join, leave, newMap, lockin);
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('formteam')
		.setDescription(
			'Forms a PvP team and get a random map for Team battles in War Thunder.'
		),

	async execute(interaction) {
		try {
			const team1 = [];
			const team2 = [];

			const { randomMapName, randomMapUrl } = getMap(maps);

			const formedTeam = updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
			const row = createTeamButtons();

			const message = await interaction.reply({
				embeds: [formedTeam],
				components: [row],
				fetchReply: true
			});

			const messageId = message.id;

			teamDataMap.set(messageId, {
				team1,
				team2,
				randomMapName,
				randomMapUrl
			});

			return message;
		} catch (err) {
			error.log('Error forming team: ' + err);
		}
	},
	teamDataMap,
	getMap,
	shuffleTeam,
	updateTeamEmbed,
	createTeamButtons
};
