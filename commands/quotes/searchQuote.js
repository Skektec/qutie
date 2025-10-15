const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const stringSimilarity = require('string-similarity');
const database = require('../../functions/database');
const notify = require('../../functions/notify');

// TODO: Apparently still finicky

module.exports = {
  data: new SlashCommandBuilder()
    .setName('searchquote')
    .setDescription('Search for specific keywords in quotes.')
    .addStringOption((option) =>
      option.setName('keywords').setDescription('Keywords').setRequired(true)
    )
    .addStringOption((option) =>
      option.setName('from').setDescription('From').setRequired(false)
    )
    .addStringOption((option) =>
      option.setName('to').setDescription('To').setRequired(false)
    ),

  async execute(interaction) {
    let search = interaction.options.getString('keywords');
    let from = interaction.options.getString('from');
    let to = interaction.options.getString('to');

    if (from > to)
      return interaction.reply({
        content: 'Invalid Range',
        flags: MessageFlags.Ephemeral,
      });

    if (!from) from = 0;
    if (!to) to = 20;

    try {
      const server = interaction.guildId;
      const tableName = `${server}-quotes`;

      const { rows: quotesArray } = await database.query(
        `
        SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum
        FROM "${tableName}"
        `
      );

      const matches = quotesArray.filter((quote) => {
        const similarResult = stringSimilarity.compareTwoStrings(
          quote.text,
          search
        );
        return similarResult > 0.35;
      });

      const matchesArray = [];
      matches.slice(from, to).forEach((match) => {
        matchesArray.push(match);
      });

      const matchesText = matchesArray
        .map(
          (match) => `"${match.text}" - <@${match.userid}> as #${match.rownum}`
        )
        .join('\n');

      const foundMatches = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle('Searched for: ' + search)
        .addFields({
          name: 'Matches:',
          value: matchesText || 'None Found',
          inline: true,
        });

      interaction.reply({ embeds: [foundMatches] });
    } catch (err) {
      notify.error('Error searching for quotes.', err, '1x13078');
      interaction.reply({
        content:
          'Search failed, try reducing the range if you are setting it high.',
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
