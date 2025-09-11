const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");
const { QueryType } = require("discord-player");
const { DefaultExtractors } = require("@discord-player/extractor");
const {
  getClient,
  getPlayer,
  initializePlayer,
} = require("../../data/clientInstance");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Starts playing music or shows the queue.")
    .addStringOption((option) =>
      option.setName("song").setDescription("Add a song to play.")
    ),

  async execute(interaction) {
    try {
      await interaction.deferReply();

      const player = await initializePlayer();
      if (!player) {
        await interaction.editReply("Music player is not initialized.");
        return;
      }

      const voiceChannel = interaction.member.voice.channel;
      if (!voiceChannel) {
        await interaction.editReply(
          "You must be in a voice channel to play music!"
        );
        return;
      }

      const query = interaction.options.getString("song");
      if (!query) {
        await interaction.editReply(
          "You must provide a song name or URL to play!"
        );
        return;
      }

      console.log("Searching for track:", query);

      const searchMethods = [
        { type: QueryType.YOUTUBE, name: "YouTube" },
        { type: QueryType.SPOTIFY, name: "Spotify" },
        { type: QueryType.SOUNDCLOUD, name: "SoundCloud" },
        { type: QueryType.AUTO, name: "Auto" },
      ];

      let searchResult = null;
      for (const method of searchMethods) {
        try {
          console.log(`Attempting search with ${method.name} search engine`);
          searchResult = await player.search(query, {
            requestedBy: interaction.user,
            searchEngine: method.type,
          });

          console.log(
            `${method.name} search results:`,
            searchResult.tracks.length
          );

          if (searchResult.hasTracks()) {
            break;
          }
        } catch (searchError) {
          console.error(
            `Error searching with ${method.name} search engine:`,
            searchError
          );
        }
      }

      if (!searchResult || !searchResult.hasTracks()) {
        console.log(`No tracks found for query: "${query}"`);
        console.log(
          "Search result details:",
          JSON.stringify(searchResult, null, 2)
        );
        await interaction.editReply(
          `We found no tracks for "${query}"! Try a different search query.`
        );
        return;
      }

      const track = searchResult.tracks[0];
      const queue = await player.play(voiceChannel, searchResult, {
        nodeOptions: {
          metadata: interaction.channel,
          volume: 50,
          leaveOnEmpty: true,
          leaveOnEnd: false,
        },
      });

      const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("🎵 Now Playing")
        .setDescription(`[${track.title}](${track.url})`)
        .addFields(
          { name: "Artist", value: track.author || "Unknown", inline: true },
          { name: "Duration", value: track.duration || "Unknown", inline: true }
        )
        .setThumbnail(track.thumbnail);

      await interaction.editReply({
        content: "Track added to queue!",
        embeds: [embed],
      });
    } catch (error) {
      console.error("Play command error:", error);
      try {
        if (interaction.deferred || interaction.replied) {
          await interaction.editReply(
            "An error occurred while trying to play the track."
          );
        } else {
          await interaction.reply(
            "An error occurred while trying to play the track."
          );
        }
      } catch (replyError) {
        console.error("Error sending error reply:", replyError);
      }
    }
  },
};
