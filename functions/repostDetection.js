const { Mistral } = require("@mistralai/mistralai");
const prompt = require("../data/pubconfig.json").embedDetectPrompt;
const notify = require("./functions/notify");
const { mistralToken } = require("../data/config.json");
const client = new Mistral({ apiKey: mistralToken });

const serverHistories = {};

module.exports = {
  execute: async (message) => {
    if (!message.guild) return;
    const guildId = message.guild.id;

    if (!serverHistories[guildId]) {
      serverHistories[guildId] = [];
    }

    const embed = message.embeds[0]?.data?.description || "";
    if (!embed) return;

    if (!message.embeds[0]?.data?.description) return;

    let aiOutput;

    try {
      const history = serverHistories[guildId];

      history.push({ role: "user", content: embed });

      if (history.length > 15) {
        history.shift();
      }

      const chatResponse = await client.chat.complete({
        model: "mistral-small-latest",
        messages: [{ role: "system", content: prompt }, ...history],
      });

      aiOutput = chatResponse.choices[0]?.message?.content;

      history.push({ role: "assistant", content: aiOutput });
    } catch (err) {
      notify.error("Repost Detection Error: " + err);
      return;
    }

    if (embed && aiOutput.includes("$$repost$$")) {
      message.reply("Errmm Repost ♻️♻️♻️");
    }
  },
};
