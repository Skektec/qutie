const { SlashCommandBuilder } = require('discord.js');
const errorLog = require('../../events/errorLog');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../../data/general.db');
const database = new Database(dbPath);
const deletedQuotesPath = path.resolve(
	__dirname,
	'../../data/deletedQuotes.json'
);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deletequote')
		.setDescription('Manually delete a quote.')
		.addStringOption((option) =>
			option
				.setName('id')
				.setDescription('The ID of the quote to delete.')
				.setAutocomplete(true)
				.setRequired(true)
		),

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'id') {
			try {
				const row = database
					.prepare(
						`SELECT rowid FROM "${interaction.guild.id}-quotes" ORDER BY rowid DESC LIMIT 1`
					)
					.get();

				if (!row) {
					return await interaction.respond([
						{ name: 'No row found', value: '0' },
					]);
				}

				await interaction.respond([
					{ name: String(row.rowid), value: String(row.rowid) },
				]);
			} catch (err) {
				errorLog.execute('Delete Autocomplete error: ' + err.message);
			}
		}
	},

	async execute(interaction) {
		const id = interaction.options.getString('id');

		try {
			const selectStmt = database.prepare(
				`SELECT * FROM "${interaction.guild.id}-quotes" WHERE rowid = ?`
			);
			const quote = selectStmt.get(id);

			if (!quote) {
				return await interaction.reply(`No quote found with ID: #${id}`);
			}

			let deletedQuotes = [];
			try {
				if (fs.existsSync(deletedQuotesPath)) {
					const fileData = fs.readFileSync(deletedQuotesPath, 'utf8').trim();
					deletedQuotes = fileData ? JSON.parse(fileData) : [];
				}
			} catch (err) {
				errorLog.execute('Error reading deletedQuotes.json: ' + err.message);
				deletedQuotes = [];
			}

			deletedQuotes.push({ id, guildId: interaction.guild.id, ...quote });

			try {
				fs.writeFileSync(
					deletedQuotesPath,
					JSON.stringify(deletedQuotes, null, 2)
				);
			} catch (err) {
				errorLog.execute('Error saving deletedQuotes.json: ' + err.message);
			}

			const deleteStmt = database.prepare(
				`DELETE FROM "${interaction.guild.id}-quotes" WHERE rowid = ?`
			);
			deleteStmt.run(id);

			await interaction.reply(`Deleted quote: #${id} - "${quote.text}"`);
		} catch (err) {
			errorLog.execute('Delete Func Error: ' + err.message);
			await interaction.reply({
				content: 'An error occurred while deleting the quote.',
				allowedMentions: { repliedUser: false },
			});
		}
	},
};
