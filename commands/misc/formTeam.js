const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const maps = require('../../data/wtMaps.json');
const errorLog = require('../../events/errorLog');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('formteam')
		.setDescription(
			'Forms a PvP team and get a random map for Team battles in War Thunder.'
		)
		.addRoleOption((option) =>
			option
				.setName('role')
				.setDescription('Which role to select participants from.')
				.setRequired(true)
		),
	async execute(interaction) {
		try {
			await interaction.guild.members.fetch();
			const role = interaction.options.getRole('role');
			const members = Array.from(role.members.values());

			for (let i = members.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[members[i], members[j]] = [members[j], members[i]];
			}

			const team1 = [];
			const team2 = [];

			members.forEach((member, index) => {
				if (index % 2 === 0) {
					team1.push(member);
				} else {
					team2.push(member);
				}
			});

			const mapNames = Object.keys(maps);
			const randomMapName =
				mapNames[Math.floor(Math.random() * mapNames.length)];
			const randomMapUrl = maps[randomMapName];

			const formedTeam = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle('Team Tank Battles')
				.setDescription('Team Composition and Map')
				.addFields(
					{
						name: 'Team 1',
						value:
							team1.map((member) => member.user.username).join('\n') ||
							'No members',
					},
					{
						name: 'Team 2',
						value:
							team2.map((member) => member.user.username).join('\n') ||
							'No members',
					}
				)
				.addFields({ name: 'Map is: ', value: randomMapName, inline: true })
				.setImage(randomMapUrl)
				.setTimestamp();

			interaction.reply({ embeds: [formedTeam] });
		} catch (err) {
			errorLog.execute('Error forming team: ' + err);
			console.log(err);
		}
	},
};
