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
		console.log('Autocomplete triggered');
		try {
			if (!interaction.isAutocomplete()) {
				console.log('Not an autocomplete interaction');
				return;
			}

			const player = useMainPlayer();
			if (!player) {
				console.log('No player found');
				await interaction.respond([]);
				return;
			}

			await player.extractors.loadMulti(DefaultExtractors);

			const query = interaction.options.getString('song');
			console.log('Autocomplete query:', query);

			if (!query) {
				console.log('No query provided');
				await interaction.respond([]);
				return;
			}

			const results = await player.search(query, {
				searchEngine: QueryType.AUTO
			});

			console.log('Search results:', results.tracks.length);

			const choices = results.tracks.slice(0, 10).map((t) => ({
				name: t.title || 'Unknown Title',
				value: t.url || '',
			}));

			await interaction.respond(choices);
		} catch (error) {
			console.error('Autocomplete error:', error);
			try {
				await interaction.respond([]);
			} catch (replyError) {
				console.error('Error responding to autocomplete:', replyError);
			}
		}
	},

	async execute(interaction) {
		try {
			await interaction.deferReply({ ephemeral: false });

			const player = useMainPlayer();
			if (!player) {
				await interaction.editReply('Music player is not initialized.');
				return;
			}

			await player.extractors.loadMulti(DefaultExtractors);

			const voiceChannel = interaction.member.voice.channel;
			if (!voiceChannel) {
				await interaction.editReply('You must be in a voice channel to play music!');
				return;
			}

			const query = interaction.options.getString('song');
			if (!query) {
				await interaction.editReply('You must provide a song name or URL to play!');
				return;
			}

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
			try {
				if (interaction.deferred || interaction.replied) {
					await interaction.editReply('An error occurred while trying to play the track.');
				} else {
					await interaction.reply('An error occurred while trying to play the track.');
				}
			} catch (replyError) {
				console.error('Error sending error reply:', replyError);
			}
		}
	},
};
