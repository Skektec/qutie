const { Mistral } = require("@mistralai/mistralai");
const config = require("./data/config.json");
const pubconfig = require("./data/pubconfig.json");
const gif = require("./jarvis_commands/gif");
const notify = require("./functions/notify");

const client = new Mistral({ apiKey: config.mistralToken });

module.exports = {
  execute: async (message) => {
    try {
      const commandSen = message.content.replace(/^jarvis\s*/i, "");
      const chatResponse = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [
          {
            role: "system",
            content: pubconfig.prompt,
          },
          {
            role: "user",
            content: commandSen,
          },
        ],
      });

      const content = chatResponse.choices[0].message.content;

      // for (let i = 0; i < content.length; i += 2000) {
      // 	await message.channel.send(content.slice(i, i + 2000));
      // }

      const match = content.match(/\$\$gif of (.*?)\$\$/);

      if (match) {
        gif.execute(match, message);
      }
    } catch (err) {
      notify.error("Error in jarvis.js", err, "-1x40039");
    }
  },
};
