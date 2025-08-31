const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const database = require('../../functions/database');
const notify = require('../../functions/notify');

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

			const { rows: outputBirthdays } = await database.query(
				'SELECT * FROM birthdays WHERE server = $1',
				[server]
			);

			const currentMonthDay = currentMonth * 100 + currentDay; // Today's month/day as a number

			const taggedBirthdays = outputBirthdays
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
						December: 12
					};

					const birthMonth = monthMap[birthMonthName];
					const birthMonthDay = birthMonth * 100 + birthDay;

					let currentAge = currentYear - birthYear;
					if (currentMonth < birthMonth || (currentMonth === birthMonth && currentDay < birthDay)) {
						currentAge--;
					}

					// Tag as upcoming if birthday is today or later
					const isUpcoming = birthMonthDay >= currentMonthDay;

					return {
						...b,
						dateNum: parseInt(b.datenum),
						currentAge,
						birthMonth,
						birthDay,
						birthMonthDay,
						isUpcoming
					};
				})
				// Sort: upcoming birthdays first, then past, both by soonest
				.sort((a, b) => {
					if (a.isUpcoming !== b.isUpcoming) {
						return a.isUpcoming ? -1 : 1;
					}
					return a.birthMonthDay - b.birthMonthDay;
				});

			let birthdayList = '';
			if (taggedBirthdays.length > 0) {
				let separatorInserted = false;
				birthdayList = taggedBirthdays
					.map((b) => {
						const displayDate = b.date.replace(/-/g, ' ');
						const user = b.id && b.id !== '0' ? `<@${b.id}>` : b.nick || 'unknown';
						const line = `${user} - ${displayDate} (${b.currentAge})`;

						// Insert separator when first past birthday is encountered
						if (!separatorInserted && !b.isUpcoming) {
							separatorInserted = true;
							return `=========${currentYear + 1}=========\n${line}`;
						}
						return line;
					})
					.join('\n');
			} else {
				birthdayList = 'No birthdays found.';
			}

			const birthdayEmbed = new EmbedBuilder()
				.setColor(0x0099ff)
				.setTitle('Birthdays')
				.setDescription(birthdayList);

			await interaction.reply({ embeds: [birthdayEmbed] });
		} catch (err) {
			notify.error('Database error', err, '1x02100');
			await interaction.reply({
				content: `Error: ${err.message} (Occurred in birthday code)`,
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
