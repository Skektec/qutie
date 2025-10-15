const { Mistral } = require('@mistralai/mistralai');
const prompt = require('../data/pubconfig.js').embedDetectPrompt;
const notify = require('./functions/notify');
const { mistralToken } = require('../data/config.json');
const client = new Mistral({ apiKey: mistralToken });

// not used as its unreliable

const serverHistories = {};

module.exports = {
  execute: async (message) => {
    const guildId = message.guild.id;

    if (!serverHistories[guildId]) {
      serverHistories[guildId] = [];
    }

    if (!message.embeds[0]?.data?.description) return;

    const embed = message.embeds[0]?.data?.description;

    let aiOutput;

    try {
      const history = serverHistories[guildId];

      history.push({ role: 'user', content: embed });

      if (history.length > 15) {
        history.shift();
      }

      const chatResponse = await client.chat.complete({
        model: 'mistral-small-latest',
        messages: [{ role: 'system', content: prompt }, ...history]
      });

      aiOutput = chatResponse.choices[0]?.message?.content;

      history.push({ role: 'assistant', content: aiOutput });
    } catch (err) {
      notify.error('Repost Detection Error', err, '0x000000');
      return;
    }

    if (embed && aiOutput.includes('$$repost$$')) {
      message.reply('Errmm Repost ♻️♻️♻️');
    }
  }
};
