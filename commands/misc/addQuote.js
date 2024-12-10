const { SlashCommandBuilder } = require("discord.js");
const fs = require('fs').promises;
const quotes = './quotes.json';

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addquote")
    .setDescription("Manually add a quote.")
    .addStringOption(option =>
      option.setName('quote')
        .setDescription('The text you want to quote.')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription(`The person you're quoting.`)
        .setRequired(true)),

  async execute(interaction) {
    const quote = interaction.options.getString('quote');
    const user = interaction.options.getUser('user');

    const data = await fs.readFile(quotes, 'utf8');
    const jsonData = JSON.parse(data);

    const nextId =
      Array.isArray(jsonData) && jsonData.length > 0
        ? (Number(jsonData[jsonData.length - 1].id || 0) + 1).toString()
        : '1';

    const newEntry = {
      id: nextId,
      nick: user.username,
      userId: user.id,
      channel: interaction.channelId,
      server: interaction.guildId,
      text: quote,
      time: interaction.createdTimestamp, 
    };

    jsonData.push(newEntry);

    await fs.writeFile(quotes, JSON.stringify(jsonData, null, 2), 'utf8');

    await interaction.reply(`Quote added: "${quote}" by ${user.username}`);
  },
};
