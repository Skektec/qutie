const { SlashCommandBuilder } = require('discord.js');
const ai = require('../../functions/ai');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chat')
    .setDescription('Chat with the AI.')
    .addStringOption((option) =>
      option.setName('message').setDescription('The message to send to the AI.').setRequired(true)
    ),

  async execute(interaction) {
    const message = interaction.options.getString('message');
    const response = await ai.chat(message);
    await interaction.reply(response);
  },
};
