const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, '../../data/general.db');
const db = new Database(dbPath);
const errorLog = require('../../events/errorLog');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('birthdayboard')
		.setDescription('Presents a list of all birthdays.'),

	async execute(interaction) {
		try {
			const server = interaction.guildId;
			const today = new Date();
			const currentYear = today.getFullYear();

			const outputBirthdays = db
				.prepare('SELECT * FROM birthdays WHERE server = ?')
				.all(server);

			const currentDate = parseInt(
				`${today.getMonth() + 1}${today.getDate()}${currentYear}`
			);

			const sortedDates = outputBirthdays
				.map((b) => {
					let dateNum = b.dateNum;

					if (dateNum && dateNum.length === 7) {
						dateNum = '0' + dateNum;
					}

					const birthYear = parseInt(b.date.slice(-4));
					const birthMonth = parseInt(b.date.slice(1, 2));
					const birthDay = parseInt(b.date.slice(3, 5));

					const today = new Date();
					const currentYear = today.getFullYear();
					const currentMonth = today.getMonth() + 1;
					const currentDay = today.getDate();

					let currentAge = currentYear - birthYear;

					if (
						birthMonth > currentMonth ||
						(birthMonth === currentMonth && birthDay > currentDay)
					) {
						currentAge -= 1;
					}

					return { ...b, dateNum: parseInt(dateNum), currentAge };
				})
				.sort((a, b) => {
					if (a.dateNum >= currentDate && b.dateNum < currentDate) return -1;
					if (a.dateNum < currentDate && b.dateNum >= currentDate) return 1;
					return a.dateNum - b.dateNum;
				});

			const birthdayList =
				sortedDates.length > 0
					? sortedDates
							.map(
								(b) =>
									`<@${b.id}> - \`${b.date}\` (${b.currentAge}) - ${b.dateNum}`
							)
							.join('\n')
					: 'No birthdays found.';

			const birthdayEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle('Birthdays')
				.setDescription(birthdayList);

			await interaction.reply({ embeds: [birthdayEmbed] });
		} catch (err) {
			errorLog.execute('Database error:', err);
			await interaction.reply({
				content: `Error: ${err.message}`,
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
