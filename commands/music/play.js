const {
	SlashCommandBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');
const { Player, QueryType, useMainPlayer } = require('discord-player');
const { DefaultExtractors } = require('@discord-player/extractor');
const { getClient } = require('../../data/clientInstance');

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
		try {
			const player = useMainPlayer();
			await player.extractors.loadMulti(DefaultExtractors);

			const query = interaction.options.getString('song', true);
			if (!query) {
				return interaction.respond([]);
			}

			const results = await player.search(query, {
				searchEngine: QueryType.AUTO
			});

			return interaction.respond(
				results.tracks.slice(0, 10).map((t) => ({
					name: t.title || 'Unknown Title',
					value: t.url || '',
				}))
			);
		} catch (error) {
			console.error('Autocomplete error:', error);
			return interaction.respond([]);
		}
	},

	async execute(interaction) {
		try {
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
				searchEngine: QueryType.AUTO
			});

			if (!searchResult.hasTracks()) {
				await interaction.editReply(`We found no tracks for "${query}"!`);
				return;
			}

			const track = searchResult.tracks[0];
			const queue = await player.play(voiceChannel, searchResult, {
				nodeOptions: {
					metadata: interaction.channel,
					volume: 50, 
					leaveOnEmpty: true,
					leaveOnEnd: false
				},
			});

			const embed = new EmbedBuilder()
				.setColor('#0099ff')
				.setTitle('🎵 Now Playing')
				.setDescription(`[${track.title}](${track.url})`)
				.addFields(
					{ name: 'Artist', value: track.author || 'Unknown', inline: true },
					{ name: 'Duration', value: track.duration || 'Unknown', inline: true }
				)
				.setThumbnail(track.thumbnail);

			await interaction.editReply({ 
				content: 'Track added to queue!', 
				embeds: [embed] 
			});
		} catch (error) {
			console.error('Play command error:', error);
			await interaction.editReply('An error occurred while trying to play the track.');
		}
	},
};
