const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, '../../data/general.db');
const db = new Database(dbPath);
const errorLog = require('../../events/errorLog');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('addbirthday')
		.setDescription('Add your birthday.')
		.addStringOption((option) =>
			option
				.setName('day')
				.setDescription('Enter the day of your birthday.')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('month')
				.setDescription('Select the month of your birthday.')
				.setAutocomplete(true)
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('year')
				.setDescription('Enter the year of your birthday.')
				.setRequired(true)
		),

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		let choices = [];
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
				'December',
			];
		}

		const filtered = choices.filter((choice) =>
			choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
		);

		await interaction.respond(
			filtered.map((choice) => ({ name: choice, value: choice }))
		);
	},

	async execute(interaction) {
		const day = interaction.options.getString('day');
		const month = interaction.options.getString('month');
		const year = interaction.options.getString('year');

		if (isNaN(day) || day < 1 || day > 31 || day % 1 !== 0) {
			return interaction.reply({
				content: 'Please enter a valid day (1–31).',
				flags: MessageFlags.Ephemeral,
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
			'December',
		];

		if (!validMonths.includes(month)) {
			return interaction.reply({
				content: 'Please enter a valid month (e.g., August).',
				flags: MessageFlags.Ephemeral,
			});
		}

		if (
			isNaN(year) ||
			year.length !== 4 ||
			year < 1900 ||
			year > new Date().getFullYear()
		) {
			return interaction.reply({
				content: 'Please enter a valid year (e.g., 1990).',
				flags: MessageFlags.Ephemeral,
			});
		}

		const user = interaction.user;
		const date = `${day}-${month}-${year}`;
		const channelId = interaction.channel.id;
		const serverId = interaction.guild.id;

		try {
			db.prepare(
				`CREATE TABLE IF NOT EXISTS birthdays (
          id TEXT PRIMARY KEY,
          nick TEXT,
          date TEXT,
          channel TEXT,
          server TEXT 
        )`
			).run();

			const existing = db
				.prepare('SELECT * FROM birthdays WHERE id = ?')
				.get(user.id);

			if (existing) {
				db.prepare(
					'UPDATE birthdays SET nick = ?, date = ?, channel = ?, server = ? WHERE id = ?'
				).run(user.username, date, channelId, serverId, user.id);

				console.log(`Updated ${user.username}'s birthday.`);
				await interaction.reply({
					content: `Your birthday has been updated to ${date}! 🎉`,
					flags: MessageFlags.Ephemeral,
				});
			} else {
				db.prepare(
					'INSERT INTO birthdays (id, nick, date, channel, server) VALUES (?, ?, ?, ?, ?)'
				).run(user.id, user.username, date, channelId, serverId);

				console.log(`Added ${user.username}'s birthday.`);
				await interaction.reply({
					content: `Your birthday (${date}) has been added! 🎉`,
					flags: MessageFlags.Ephemeral,
				});
			}
		} catch (err) {
			errorLog.execute(err);
			return interaction.reply({
				content:
					'An error occurred while saving your birthday. Please try again later.',
				flags: MessageFlags.Ephemeral,
			});
		}
	},
};
