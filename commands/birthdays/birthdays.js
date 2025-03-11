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
			const currentMonth = today.getMonth() + 1;
			const currentDay = today.getDate();

			const outputBirthdays = db
				.prepare('SELECT * FROM birthdays WHERE server = ?')
				.all(server);

			const sortedDates = outputBirthdays
				.map((b) => {
					const dateParts = b.date.split('-');
					const birthDay = parseInt(dateParts[0]);
					const birthMonthName = dateParts[1].trim();
					const birthYear = parseInt(dateParts[2]);

					const monthMap = {
						January: 1,
						February: 2,
						March: 3,
						April: 4,
						May: 5,
						June: 6,
						July: 7,
						August: 8,
						September: 9,
						October: 10,
						November: 11,
						December: 12,
					};

					const birthMonth = monthMap[birthMonthName];

					let currentAge = currentYear - birthYear;

					if (
						currentMonth < birthMonth ||
						(currentMonth === birthMonth && currentDay < birthDay)
					) {
						currentAge--;
					}

					return {
						...b,
						dateNum: parseInt(b.dateNum),
						currentAge,
						birthMonth,
						birthDay,
					};
				})
				.sort((a, b) => {
					const aMonthDay = a.birthMonth * 100 + a.birthDay;
					const bMonthDay = b.birthMonth * 100 + b.birthDay;
					const currentMonthDay = currentMonth * 100 + currentDay;

					if (aMonthDay >= currentMonthDay && bMonthDay < currentMonthDay)
						return -1;
					if (aMonthDay < currentMonthDay && bMonthDay >= currentMonthDay)
						return 1;
					return aMonthDay - bMonthDay;
				});

			const birthdayList =
				sortedDates.length > 0
					? sortedDates
							.map((b) => `<@${b.id}> - \`${b.date}\` (${b.currentAge})`)
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
