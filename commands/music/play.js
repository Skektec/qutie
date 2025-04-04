const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const { Player, QueryType, useMainPlayer } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { getClient } = require('../../data/clientInstance');

const client = getClient();
const player = new Player(client);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Starts playing music or shows the queue.')
		.addStringOption((option) =>
			option
				.setName('song')
				.setDescription('Add a song to play.')
				.setAutocomplete(true)
		),

	async autocompleteRun(interaction) {
		const player = useMainPlayer();
		await player.extractors.loadMulti(DefaultExtractors);

		const query = interaction.options.getString('song', true);
		if (!query) {
			return interaction.respond([]);
		}

		const results = await player.search(query);

		return interaction.respond(
			results.tracks.slice(0, 10).map((t) => ({
				name: t.title || 'Unknown Title',
				value: t.url || '',
			}))
		);
	},

	async execute(interaction) {
		const player = useMainPlayer();
		await player.extractors.loadMulti(DefaultExtractors);

		const voiceChannel = interaction.member.voice.channel;
		if (!voiceChannel) {
			await interaction.reply('You must be in a voice channel to play music!');
			return;
		}

		const query = interaction.options.getString('song', true);
		if (!query) {
			await interaction.reply('You must provide a song name or URL to play!');
			return;
		}

		await interaction.deferReply();

		const searchResult = await player.search(query, {
			requestedBy: interaction.user,
		});

		if (!searchResult.hasTracks()) {
			await interaction.editReply(`We found no tracks for "${query}"!`);
			return;
		}

		await player.play(voiceChannel, searchResult, {
			nodeOptions: {
				metadata: interaction.channel,
				// You can add more options here
			},
		});

		await interaction.editReply({ content: `Loading your track(s)...` });
	},
};
