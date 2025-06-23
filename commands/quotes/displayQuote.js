const { SlashCommandBuilder } = require("discord.js");
const fetchquote = require("../../functions/fetchquote");

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

module.exports = {
  data: new SlashCommandBuilder()
    .setName("displayquote")
    .setDescription("Display a quote.")
    .addStringOption((option) =>
      option
        .setName("server")
        .setDescription(`Server ID of the server you want the quote from.`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("userid")
        .setDescription(`User ID of who you want to quote.`)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("number")
        .setDescription("The number of the quote.")
        .setRequired(false)
    ),

  async execute(interaction) {
    const guild = interaction.options.getString("server");
    const id = interaction.options.getString("number");
    let user = interaction.options.getString("userid");

    if (!Number.isInteger(user) || !Number.isInteger(id)) {
      if (id & user) interaction.reply("Please only use 1 field.");
      else {
        let args = [];
        if (id) args = [id];
        if (user) args = [`<@${user}>`];

        let channel = [];
        let guildId = [];
        let message = { channel, guildId };
        message.channel = interaction.channel;

        if (!guild) message.guildId = interaction.guildId;
        else message.guildId = guild;

        interaction.reply("Displaying quote.");
        await delay(1000);
        interaction.deleteReply();
        fetchquote.execute(message, args);
      }
    } else {
      interaction.reply("Please enter only integers.");
    }
  },
};
