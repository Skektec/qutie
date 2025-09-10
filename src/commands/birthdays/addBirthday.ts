import {
	SlashCommandBuilder,
	MessageFlags,
	AutocompleteInteraction,
	ChatInputCommandInteraction
} from 'discord.js';
import { database } from '../../functions/database';
const notify = require('../../functions/notify');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addbirthday')
		.setDescription('Add your birthday.')
		.addStringOption((option) =>
			option.setName('day').setDescription('Enter the day of your birthday.').setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('month')
				.setDescription('Select the month of your birthday.')
				.setAutocomplete(true)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option.setName('year').setDescription('Enter the year of your birthday.').setRequired(true)
		),

	async autocomplete(interaction: AutocompleteInteraction) {
		const focusedOption = interaction.options.getFocused(true);

		let choices: string[] = [];
		if (focusedOption.name === 'month') {
			choices = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			];
		}

		const filtered = choices.filter((choice) =>
			choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
		);

		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	},

	async execute(interaction: ChatInputCommandInteraction) {
		const day = interaction.options.get('day')?.value as string;
		const month = interaction.options.get('month')?.value as string;
		const year = interaction.options.get('year')?.value as string;

		const dayNum = parseInt(day);
		if (isNaN(dayNum) || dayNum < 1 || dayNum > 31 || dayNum % 1 !== 0) {
			return interaction.reply({
				content: `Please enter a valid day (1-31).`,
				flags: MessageFlags.Ephemeral
			});
		}

		const validMonths = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		];

		if (!validMonths.includes(month)) {
			return interaction.reply({
				content: 'Please select a valid month (e.g., August).',
				flags: MessageFlags.Ephemeral
			});
		}

		const yearNum = parseInt(year);
		if (
			isNaN(yearNum) ||
			year.length !== 4 ||
			yearNum < 1900 ||
			yearNum > new Date().getFullYear()
		) {
			return interaction.reply({
				content: `Please enter a valid year (e.g., 1990-${new Date().getFullYear()}).`,
				flags: MessageFlags.Ephemeral
			});
		}

		const user = interaction.user;
		const date = `${day}-${month}-${year}`;
		const channelId = interaction.channel?.id;
		const serverId = interaction.guild?.id;

		if (!channelId || !serverId) {
			return interaction.reply({
				content: 'This command can only be used in a server channel.',
				flags: MessageFlags.Ephemeral
			});
		}

		const monthToNumber = {
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

		function getMonthNumber(month: string): number | null {
			return monthToNumber[month as keyof typeof monthToNumber] || null;
		}

		const correctedDay = day.length === 1 ? '0' + day : day;
		const dateNum = `${getMonthNumber(month)}${correctedDay}${year}`;

		try {
			await database.query(
				`CREATE TABLE IF NOT EXISTS birthdays (
          id TEXT PRIMARY KEY,
          nick TEXT,
          date TEXT,
          channel TEXT,
          server TEXT,
          dateNum INTEGER
        )`
			);

			const { rows: existingRows } = await database.query('SELECT * FROM birthdays WHERE id = $1', [
				user.id
			]);
			const existing = existingRows[0];

			if (existing) {
				await database.query(
					'UPDATE birthdays SET nick = $1, date = $2, channel = $3, server = $4, dateNum = $5 WHERE id = $6',
					[user.username, date, channelId, serverId, dateNum, user.id]
				);

				console.log(`Updated ${user.username}'s birthday.`);
				await interaction.reply({
					content: `Your birthday has been updated to ${date}! 🎉`,
					flags: MessageFlags.Ephemeral
				});
			} else {
				await database.query(
					'INSERT INTO birthdays (id, nick, date, channel, server, dateNum) VALUES ($1, $2, $3, $4, $5, $6)',
					[user.id, user.username, date, channelId, serverId, dateNum]
				);

				console.log(`Added ${user.username}'s birthday.`);
				await interaction.reply({
					content: `${user.username}'s birthday (${date}) has been added! 🎉`
				});
			}
		} catch (err) {
			notify.error('Error in addBirthday.js)', err, '-1x01178');
			return interaction.reply({
				content: 'An error occurred while saving your birthday. Please try again later.',
				flags: MessageFlags.Ephemeral
			});
		}
	}
};
