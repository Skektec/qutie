const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { avg1, avg2 } = require('../commands/games/formTeam');

module.exports = {
	updateTeamEmbed(team1, team2, randomMapName, randomMapUrl, winner = null) {
		const totalPoints1 = team1.reduce((sum, member) => sum + (member.points ?? 0), 0);
		const totalPoints2 = team2.reduce((sum, member) => sum + (member.points ?? 0), 0);

		return new EmbedBuilder()
			.setColor(0x0ff08b)
			.setTitle('Team Tank Battles')
			.setDescription(
				winner === 1
					? 'Team 1 win'
					: winner === 2
					? 'Team 2 win'
					: winner === 0
					? 'No Winner/Draw'
					: 'Match in progress'
			)
			.addFields(
				{
					name: winner === 1 ? 'Team 1  👑' : `Team 1 = ${totalPoints1}`,
					value: team1.map((member) => `<@${member.id}>`).join('\n') || 'No members',
					inline: true
				},
				{
					name: winner === 2 ? 'Team 2  👑' : `Team 2 = ${totalPoints2}`,
					value: team2.map((member) => `<@${member.id}>`).join('\n') || 'No members',
					inline: true
				}
			)
			.addFields({ name: 'Map is: ', value: randomMapName })
			.setImage(randomMapUrl)
			.setTimestamp();
	},

	createTeamButtons(setDisabled = false) {
		const join = new ButtonBuilder()
			.setCustomId('join')
			.setLabel('Join a Team')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(setDisabled);

		const leave = new ButtonBuilder()
			.setCustomId('leave')
			.setLabel('Leave a Team')
			.setStyle(ButtonStyle.Danger)
			.setDisabled(setDisabled);

		const newMap = new ButtonBuilder()
			.setCustomId('newmap')
			.setLabel('Roll Map')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(setDisabled);

		const rollTeam = new ButtonBuilder()
			.setCustomId('rollTeam')
			.setLabel('Roll Team')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(setDisabled);

		const team1Win = new ButtonBuilder()
			.setCustomId('team1Win')
			.setLabel('Team 1 Win')
			.setStyle(ButtonStyle.Success)
			.setDisabled(setDisabled);

		const team2Win = new ButtonBuilder()
			.setCustomId('team2Win')
			.setLabel('Team 2 Win')
			.setStyle(ButtonStyle.Success)
			.setDisabled(setDisabled);

		const noWin = new ButtonBuilder()
			.setCustomId('noWin')
			.setLabel('No Win/Draw')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(setDisabled);

		const row1 = new ActionRowBuilder().addComponents(join, leave, newMap, rollTeam);
		const row2 = new ActionRowBuilder().addComponents(team1Win, team2Win, noWin);

		return [row1, row2];
	}
};
