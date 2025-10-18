const maps = require('../data/wtMaps.json');
const { MessageFlags } = require('discord.js');
const { teamDataMap, getMap, formTeam, winner, rollTeam } = require('../commands/games/formTeam');

const gameFiles = {
	warthunder: require('../games/warthunder'),
	nebulous: require('../games/nebulous')
};

playerRecordArray = [];

module.exports = {
	name: 'interactionCreate',
	async execute(buttonInteraction) {
		try {
			if (!buttonInteraction.isButton()) return;

			const teamData = teamDataMap.get(buttonInteraction.message.id);

			let {
				team1,
				team2,
				playerRecordArray = [],
				randomMapName,
				randomMapUrl,
				gameName = 'warthunder'
			} = teamData;

			isWinner = 3;

			const gameModule = gameFiles[gameName];

			if (!gameModule) {
				throw new Error(`Game module not found: ${gameName}`);
			}

			const userId = buttonInteraction.user.id;

			try {
				await buttonInteraction.deferUpdate();
			} catch (deferError) {
				console.error('Error deferring update:', deferError);
			}

			if (buttonInteraction.customId === 'newmap') {
				const newMapData = getMap(maps);

				teamData.randomMapName = newMapData.randomMapName;
				teamData.randomMapUrl = newMapData.randomMapUrl;

				const updatedTeam = gameModule.updateTeamEmbed(
					team1,
					team2,
					newMapData.randomMapName,
					newMapData.randomMapUrl
				);
				await fetchedMessage.edit({ embeds: [updatedTeam] });
			}

			if (buttonInteraction.customId === 'team1Win') {
				winner(team1, team2, 1, gameName);

				isWinner = 1;

				const updatedTeam = gameModule.updateTeamEmbed(
					team1,
					team2,
					randomMapName,
					randomMapUrl,
					1
				);
				const [row1, row2] = gameModule.createTeamButtons(true);
				await fetchedMessage.edit({
					embeds: [updatedTeam],
					components: [row1, row2]
				});
			}

			if (buttonInteraction.customId === 'team2Win') {
				winner(team1, team2, 2, gameName);

				isWinner = 2;

				const updatedTeam = gameModule.updateTeamEmbed(
					team1,
					team2,
					randomMapName,
					randomMapUrl,
					2
				);
				const [row1, row2] = gameModule.createTeamButtons(true);
				await fetchedMessage.edit({
					embeds: [updatedTeam],
					components: [row1, row2]
				});
			}

			if (buttonInteraction.customId === 'noWin') {
				isWinner = 0;

				const updatedTeam = gameModule.updateTeamEmbed(
					team1,
					team2,
					randomMapName,
					randomMapUrl,
					0
				);
				const [row1, row2] = gameModule.createTeamButtons(true);
				await fetchedMessage.edit({
					embeds: [updatedTeam],
					components: [row1, row2]
				});
			}

			if (buttonInteraction.customId === 'join') {
				const { team1, team2 } = await formTeam(userId, gameName, playerRecordArray);

				teamData.team1 = team1;
				teamData.team2 = team2;

				const updatedTeam = gameModule.updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
				await fetchedMessage.edit({ embeds: [updatedTeam] });
			}

			if (buttonInteraction.customId === 'leave') {
				const index1 = team1.findIndex((member) => member === userId);
				if (index1 !== -1) team1.splice(index1, 1);

				const index2 = team2.findIndex((member) => member === userId);
				if (index2 !== -1) team2.splice(index2, 1);

				const recordIndex = playerRecordArray.findIndex((record) => record.hasOwnProperty(userId));
				if (recordIndex !== -1) {
					playerRecordArray.splice(recordIndex, 1);
				}

				teamData.playerRecordArray = playerRecordArray;

				const updatedTeam = gameModule.updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
				await fetchedMessage.edit({ embeds: [updatedTeam] });
			}

			if (buttonInteraction.customId === 'rollTeam') {
				if (winner == 3) {
					const { team1, team2 } = await rollTeam(playerRecordArray);

					const updatedTeam = gameModule.updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
					await fetchedMessage.edit({ embeds: [updatedTeam] });
				} else return;
			}
		} catch (error) {
			console.error('Unhandled error in button interaction:', error);
			try {
				await buttonInteraction.reply({
					content: 'An error occurred while processing your interaction.',
					flags: MessageFlags.Ephemeral
				});
			} catch (replyError) {
				console.error('Error sending error reply:', replyError);
			}
		}
	}
};
