const ai = require('./functions/ai');
const pubconfig = require('./data/pubconfig.js');
const gif = require('./jarvis_commands/gif');
const notify = require('./functions/notify');

const serverContext = {};

module.exports = {
  execute: async (message) => {
    const serverId = message.guild.id;

    if (!serverContext[serverId]) {
      serverContext[serverId] = [];
    }

    serverContext[serverId].push({
      role: 'user',
      content: `${message.author.username}: ${message.content}`
    });
    if (serverContext[serverId].length > 15) {
      serverContext[serverId].shift();
    }

    if (!message.content.startsWith('grok')) return;

    try {
      const messageReply = message.reference?.messageId
        ? await message.channel.messages.fetch(message.reference.messageId)
        : null;

      let imageUrl = '';
      let imageDesc = '';

      if (message.attachments.size >= 1) {
        imageUrl = await [...message.attachments.entries()][0][1].attachment;
      }

      if (messageReply?.attachments.size >= 1) {
        imageUrl = await [...messageReply.attachments.entries()][0][1].attachment;
      }

      if (imageUrl != '') {
        imageDesc = await ai.describeImage(imageUrl);
      }

      const commandSen = `User Input: ${message.content}, Message they replied to: ${
        messageReply?.content
      },\n Image description (if applicable): ${imageDesc}, \n replied messages embed description: ${
        messageReply?.embeds[0]?.description
      }.
			Last 15 chat messages as context: ${serverContext[serverId]
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n')}`;

      const context = [{ role: 'system', content: pubconfig.prompt }, ...serverContext[serverId]];
      const content = await ai.chat(commandSen, context);

      const gifCommand = content.match(/\$\$gif of (.*?)\$\$/);
      const truth = content.match(/\$\$answer:\s*(.*?)\s*\$\$/);
      const truth2 = content.match(/\$\$answer:\s*(.*?)/);

      if (gifCommand) {
        gif.execute(gifCommand, message);
      }
      if (truth) {
        message.reply(truth?.[1]);
      } else if (truth2) message.reply(truth2?.[1]);
    } catch (err) {
      notify.error('Error in jarvis.js', err, '-1x40113');
    }
  }
};
