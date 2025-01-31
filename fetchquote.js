const fs = require("fs");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  execute: async (message, args) => {
    const quoteId = args[0];
    const nick = args[0];

    try {
      const data = await fs.promises.readFile("./data/quotes.json", "utf8");
      const quotes = JSON.parse(data);

      if (!quotes || quotes.length === 0) {
        message.channel.send("No quotes are available.");
        return;
      }

      if ((args[0] && args[0].startsWith("<@")) || quoteId || nick) {
        let userId;
        const nick = args[0];

        if (args[0].startsWith("<@")) {
          userId = args[0].replace(/[<@!>]/g, "");
        }

        const userQuotesId = quotes.filter((q) => q.userId === userId);
        const userQuotesNick = quotes.filter((q) => q.nick === nick);

        if (userQuotesNick.length > 0) {
          const randomQuote =
            userQuotesNick[Math.floor(Math.random() * userQuotesNick.length)];

          const quoteTimestamp = randomQuote.time * 1000;
          const quoteDate = new Date(quoteTimestamp);
          const formattedDate = quoteDate.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          });

          const quoteEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`#${randomQuote.id}`)
            .setDescription(
              `${randomQuote.text} \n - <@${randomQuote.userId}> [(Jump)](https://discordapp.com/channels/${randomQuote.server}/${randomQuote.channel}/${randomQuote.messageId})`
            )
            .setFooter({
              text: `${formattedDate}`,
            });

          message.channel.send({ embeds: [quoteEmbed] });
        } else if (userQuotesId.length > 0) {
          const randomQuote =
            userQuotesId[Math.floor(Math.random() * userQuotesId.length)];

          const quoteTimestamp = randomQuote.time * 1000;
          const quoteDate = new Date(quoteTimestamp);
          const formattedDate = quoteDate.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            hour12: true,
          });

          const quoteEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle(`#${randomQuote.id}`)
            .setDescription(
              `${randomQuote.text} \n - <@${randomQuote.userId}> [(Jump)](https://discordapp.com/channels/${randomQuote.server}/${randomQuote.channel}/${randomQuote.messageId})`
            )
            .setFooter({
              text: `${formattedDate}`,
            });

          message.channel.send({ embeds: [quoteEmbed] });
        } else if (quoteId) {
          const quote = quotes.find((q) => q.id === quoteId);
          if (quote) {
            const quoteTimestamp = quote.time * 1000;
            const quoteDate = new Date(quoteTimestamp);
            const formattedDate = quoteDate.toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
              hour12: true,
            });

            const quoteEmbed = new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle(`#${quote.id}`)
              .setDescription(
                `${quote.text} \n - <@${quote.userId}> [(Jump)](https://discordapp.com/channels/${quote.server}/${quote.channel}/${quote.messageId})`
              )
              .setFooter({
                text: `${formattedDate}`,
              });

            message.channel.send({ embeds: [quoteEmbed] });
          } else {
            message.channel.send(`Quote with ID ${quoteId} not found.`);
          }
        } else {
          message.channel.send(`No quotes found for <@${userId}>.`);
        }
      } else {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        const quoteTimestamp = randomQuote.time * 1000;
        const quoteDate = new Date(quoteTimestamp);
        const formattedDate = quoteDate.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          hour12: true,
        });

        const quoteEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`#${randomQuote.id}`)
          .setDescription(
            `${randomQuote.text} \n - <@${randomQuote.userId}> [(Jump)](https://discordapp.com/channels/${randomQuote.server}/${randomQuote.channel}/${randomQuote.messageId})`
          )
          .setFooter({
            text: `${formattedDate} UTC`,
          });

        message.channel.send({ embeds: [quoteEmbed] });
      }
    } catch (err) {
      console.error("Error reading file:", err);
      message.channel.send("There was an error reading the quotes data.");
    }
  },
};
