const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const maps = require('../data/wtMaps.json');
const errorLog = require('../events/errorLog');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('formteam')
		.setDescription(
			'Forms a PvP team and get a random map for Team battles in War Thunder.'
		),

	async execute(interaction) {
		try {
			const members = [
				{ user: { username: 'skek' } },
				{ user: { username: 'cyne' } },
				{ user: { username: 'mia' } },
				{ user: { username: 'karno' } },
				{ user: { username: 'blu' } },
				{ user: { username: 'kspace' } },
			];

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
				.setColor(0x0ff08b)
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

			const join = new ButtonBuilder()
				.setCustomId('join')
				.setLabel('Join a Team')
				.setStyle(ButtonStyle.Primary);

			const leave = new ButtonBuilder()
				.setCustomId('leave')
				.setLabel('Leave a Team')
				.setStyle(ButtonStyle.Danger);

			const row = new ActionRowBuilder().addComponents(join, leave);

			interaction.reply({ embeds: [formedTeam], components: [row] });

			// client.on('interactionCreate', (interaction) => {
			// 	if (!interaction.isButton()) return;
			// 	const members = interaction.authorizingIntegrationOwners;
			// });
		} catch (err) {
			errorLog.execute('Error forming team: ' + err);
			console.log(err);
		}
	},
};
