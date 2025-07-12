const maps = require('../data/wtMaps.json');
const { MessageFlags } = require('discord.js');
const { teamDataMap, getMap, formTeam, winner } = require('../commands/misc/formTeam');

const gameFiles = {
	warthunder: require('../games/warthunder'),
	nebulous: require('../games/nebulous')
};

module.exports = {
	name: 'interactionCreate',
	async execute(buttonInteraction) {
		try {
			if (!buttonInteraction.isButton()) return;

			const fetchedMessage = buttonInteraction.message;

			const teamData = teamDataMap.get(fetchedMessage.id);

			const { team1, team2, randomMapName, randomMapUrl, gameName = 'warthunder' } = teamData;

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
				formTeam(team1, team2, userId, gameName);

				const updatedTeam = gameModule.updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
				await fetchedMessage.edit({ embeds: [updatedTeam] });
			}

			if (buttonInteraction.customId === 'leave') {
				const index1 = team1.findIndex((member) => member.id === userId);
				if (index1 !== -1) team1.splice(index1, 1);

				const index2 = team2.findIndex((member) => member.id === userId);
				if (index2 !== -1) team2.splice(index2, 1);

				const updatedTeam = gameModule.updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
				await fetchedMessage.edit({ embeds: [updatedTeam] });
			}

			if (buttonInteraction.customId === 'rollTeam') {
				formTeam(team1, team2, team1[0]?.id || team2[0]?.id, gameName);

				const updatedTeam = gameModule.updateTeamEmbed(team1, team2, randomMapName, randomMapUrl);
				await fetchedMessage.edit({ embeds: [updatedTeam] });
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
