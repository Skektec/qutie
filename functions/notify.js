//This is to log error messages directly to my DMs
const { EmbedBuilder } = require("discord.js");
const { botAdimn } = require("../data/config.json");
const { getClient } = require("../data/clientInstance");

module.exports = {
  error: async (message, err, errCode) => {
    const client = getClient();
    const user = await client.users.fetch(botAdimn);

    if (err.length > 2000) err = err.substring(0, 1990) + "...";

    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("An Error Occurred")
      .addFields([
        { name: "Message", value: message || "No message provided" },
        { name: "Error", value: err || "No error message provided" },
        { name: "Error Code", value: errCode || "No error code provided" },
      ])
      .setTimestamp();

    user.send({ embeds: [errorEmbed] });
  },
  log: async (message) => {
    const client = getClient();
    const user = await client.users.fetch(botAdimn);

    user.send(message);
  },
};
