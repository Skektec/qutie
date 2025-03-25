const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require('discord.js');
const maps = require('../../data/wtMaps.json');
const errorLog = require('../../events/errorLog');

const team1 = [];
const team2 = [];

module.exports = {
	data: new SlashCommandBuilder()
		.setName('formteam')
		.setDescription(
			'Forms a PvP team and get a random map for Team battles in War Thunder.'
		),

	async execute(interaction) {
		try {
			getMap = (maps) => {
				const mapNames = Object.keys(maps);
				randomMapName = mapNames[Math.floor(Math.random() * mapNames.length)];
				randomMapUrl = maps[randomMapName];
			};

			getMap(maps);

			const formedTeam = new EmbedBuilder()
				.setColor(0x0ff08b)
				.setTitle('Team Tank Battles')
				.setDescription('Team Composition and Map')
				.addFields(
					{
						name: 'Team 1',
						value: 'No members',
					},
					{
						name: 'Team 2',
						value: 'No members',
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

			const newMap = new ButtonBuilder()
				.setCustomId('newmap')
				.setLabel('Roll Map')
				.setStyle(ButtonStyle.Primary);

			const lockin = new ButtonBuilder()
				.setCustomId('lockin')
				.setLabel('Lock In')
				.setStyle(ButtonStyle.Success);

			const row = new ActionRowBuilder().addComponents(
				join,
				leave,
				newMap,
				lockin
			);

			await interaction.reply({
				embeds: [formedTeam],
				components: [row],
			});

			const fetchedMessage = await interaction.fetchReply();

			client.on('interactionCreate', async (buttonInteraction) => {
				if (!buttonInteraction.isButton()) return;

				await buttonInteraction.deferUpdate();

				if (buttonInteraction.customId === 'newmap') {
					getMap(maps);

					const updatedTeam = new EmbedBuilder()
						.setColor(0x0ff08b)
						.setTitle('Team Tank Battles')
						.setDescription('Team Composition and Map')
						.addFields(
							{
								name: 'Team 1',
								value:
									team1.map((member) => member.username).join('\n') ||
									'No members',
							},
							{
								name: 'Team 2',
								value:
									team2.map((member) => member.username).join('\n') ||
									'No members',
							}
						)
						.addFields({ name: 'Map is: ', value: randomMapName, inline: true })
						.setImage(randomMapUrl)
						.setTimestamp();

					fetchedMessage.edit({ embeds: [updatedTeam] });
				}

				const userId = buttonInteraction.user.id;
				const username = buttonInteraction.user.username;

				if (buttonInteraction.customId === 'join') {
					function shuffleTeam(team1, team2) {
						const allMembers = [...team1, ...team2];
						const shuffledMembers = allMembers.sort(() => Math.random() - 0.5);

						const half = Math.ceil(shuffledMembers.length / 2);
						team1.length = 0;
						team2.length = 0;
						team1.push(...shuffledMembers.slice(0, half));
						team2.push(...shuffledMembers.slice(half));
					}

					if (
						team1.some((member) => member.id === userId) ||
						team2.some((member) => member.id === userId)
					) {
						return;
					}

					if (team1.length <= team2.length) {
						team1.push({ id: userId, username });
					} else {
						team2.push({ id: userId, username });
					}

					shuffleTeam(team1, team2);
				}

				if (buttonInteraction.customId === 'leave') {
					const index1 = team1.findIndex((member) => member.id === userId);
					if (index1 !== -1) team1.splice(index1, 1);

					const index2 = team2.findIndex((member) => member.id === userId);
					if (index2 !== -1) team2.splice(index2, 1);
				}

				const updatedTeam = new EmbedBuilder()
					.setColor(0x0ff08b)
					.setTitle('Team Tank Battles')
					.setDescription('Team Composition and Map')
					.addFields(
						{
							name: 'Team 1',
							value:
								team1.map((member) => member.username).join('\n') ||
								'No members',
						},
						{
							name: 'Team 2',
							value:
								team2.map((member) => member.username).join('\n') ||
								'No members',
						}
					)
					.addFields({ name: 'Map is: ', value: randomMapName, inline: true })
					.setImage(randomMapUrl)
					.setTimestamp();

				fetchedMessage.edit({ embeds: [updatedTeam] });

				if (buttonInteraction.customId === 'lockin') {
					const disabledRow = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('join')
							.setLabel('Join a Team')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('leave')
							.setLabel('Leave a Team')
							.setStyle(ButtonStyle.Danger)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('newmap')
							.setLabel('Roll Map')
							.setStyle(ButtonStyle.Primary)
							.setDisabled(true),
						new ButtonBuilder()
							.setCustomId('lockin')
							.setLabel('Lock In')
							.setStyle(ButtonStyle.Success)
							.setDisabled(true)
					);

					await fetchedMessage.edit({
						components: [disabledRow],
					});

					interaction.deleteReply();
					await interaction.channel.send({ embeds: [updatedTeam] });
				}
			});
		} catch (err) {
			errorLog.execute('Error forming team: ' + err);
			console.log(err);
		}
	},
};
