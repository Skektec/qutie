import { SlashCommandBuilder } from 'discord.js';
const notify = require('../../functions/notify');
const path = require('path');
const fs = require('fs');
import { database } from '../../functions/database';
const deletedQuotesPath = path.resolve(__dirname, '../../data/deletedQuotes.json');

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
				const { rows } = await database.query(
					`SELECT COUNT(*)::int AS count FROM "${interaction.guild.id}-quotes"`
				);
				const count = rows[0]?.count || 0;
				if (!count) {
					return await interaction.respond([{ name: 'No row found', value: '0' }]);
				}
				await interaction.respond([{ name: String(count), value: String(count) }]);
			} catch (err) {
				notify.error('Delete Autocomplete error: ', err, '5x10041');
			}
		}
	},

	async execute(interaction) {
		const rownum = parseInt(interaction.options.getString('id'));
		const tableName = `${interaction.guild.id}-quotes`;

		try {
			const { rows } = await database.query(
				`
        SELECT * FROM (
          SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
          FROM "${tableName}"
        ) sub
        WHERE rownum = $1
        `,
				[rownum]
			);
			const quote = rows[0];

			if (!quote) {
				return await interaction.reply(`No quote found with ID: #${rownum}`);
			}

			let deletedQuotes = [];
			try {
				if (fs.existsSync(deletedQuotesPath)) {
					const fileData = fs.readFileSync(deletedQuotesPath, 'utf8').trim();
					deletedQuotes = fileData ? JSON.parse(fileData) : [];
				}
			} catch (err) {
				notify.error('Error reading deletedQuotes.json.', err, '6x10074');
				deletedQuotes = [];
			}

			deletedQuotes.push({
				id: rownum,
				guildId: interaction.guild.id,
				...quote
			});

			try {
				fs.writeFileSync(deletedQuotesPath, JSON.stringify(deletedQuotes, null, 2));
			} catch (err) {
				notify.error('Error saving deletedQuotes.json.', err, '6x10090');
			}

			await database.query(`DELETE FROM "${tableName}" WHERE messageId = $1`, [quote.messageid]);

			await interaction.reply(`Deleted quote: #${rownum} - "${quote.text}"`);
		} catch (err) {
			notify.error('Delete Func Error.', err, '-1x10099');
			await interaction.reply({
				content: 'An error occurred while deleting the quote.',
				allowedMentions: { repliedUser: false }
			});
		}
	}
};
