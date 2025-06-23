const { EmbedBuilder } = require("discord.js");
const { getClient } = require("../data/clientInstance");
client = getClient();

module.exports = {
  answer: async (message, args) => {
    const channelId = args[0];
    const reply = args.slice(1).join(" ");

    const channel = await client.channels.fetch(channelId);

    try {
      const supportEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("**Qutie Support**")
        .addFields({ name: "Reply:", value: reply })
        .setFooter({ text: `Answered by ${message.author.username}` });

      channel.send({ embeds: [supportEmbed] });
    } catch (err) {
      message.channel.send(`Reply failed: ${err}`);
    }
  },
};
