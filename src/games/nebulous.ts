import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

module.exports = {
	updateTeamEmbed(team1, team2, randomMapName, randomMapUrl, winner = null) {
		return new EmbedBuilder()
			.setColor(0x00ffff)
			.setTitle('Team Fleet Battles')
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
					name: winner === 1 ? 'Team 1  👑' : 'Team 1',
					value: team1.map((member) => `<@${member.id}>`).join('\n') || 'No members',
					inline: true
				},
				{
					name: winner === 2 ? 'Team 2  👑' : 'Team 2',
					value: team2.map((member) => `<@${member.id}>`).join('\n') || 'No members',
					inline: true
				}
			)
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

		const row1 = new ActionRowBuilder().addComponents(join, leave, rollTeam);
		const row2 = new ActionRowBuilder().addComponents(team1Win, team2Win, noWin);

		return [row1, row2];
	}
};
