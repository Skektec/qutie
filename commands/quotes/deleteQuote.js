const { SlashCommandBuilder } = require('discord.js');
const { serverChannel } = require('../../data/config.json');
const fs = require('fs').promises;
const quotes = './data/quotes.json';
const errorLog = require('../../events/errorLog');

//TODO: Hang on this should insure that the quote is only deleted from the correct server?
const channel = serverChannel;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('deletequote')
		.setDescription('Manually delete a quote.')
		.addStringOption((option) =>
			option
				.setName('id')
				.setDescription('The ID of the quote deleted.')
				.setAutocomplete(true)
				.setRequired(true)
		),

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);

		let choices = [];
		if (focusedOption.name === 'id') {
			const data = await fs.readFile(quotes, 'utf8');
			const jsonData = JSON.parse(data);

			choices =
				Array.isArray(jsonData) && jsonData.length > 0
					? [Number(jsonData[jsonData.length - 1].id || 0).toString()]
					: ['1'];
		}

		const filtered = choices.filter((choice) =>
			choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
		);

		await interaction.respond(
			filtered.map((choice) => ({ name: choice, value: choice }))
		);
	},

	async execute(interaction) {
		const removeId = interaction.options.getString('id');

		try {
			const data = await fs.readFile(quotes, 'utf8');
			const quotesArray = JSON.parse(data);

			const updatedQuotes = quotesArray.filter(
				(quote) => quote.id !== removeId
			);

			if (updatedQuotes.length === quotesArray.length) {
				await interaction.reply(`No quote found with ID #${removeId}.`);
				return;
			}

			await fs.writeFile(quotes, JSON.stringify(updatedQuotes, null, 4));

			await interaction.reply(`Quote with ID #${removeId} has been removed.`);
			console.log(`Quote ${removeId} deleted`);
		} catch (err) {
			errorLog.execute('Error removing quote:', err);
			await interaction.reply('An error occurred while removing the quote.');
		}
	},
};
