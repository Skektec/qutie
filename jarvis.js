const OpenAI = require('openai');
const config = require('./data/config.json');
const pubconfig = require('./data/pubconfig.js');
const gif = require('./jarvis_commands/gif');
const notify = require('./functions/notify');
// const { Context } = require('discord-player');

const aiClient = new OpenAI({
	apiKey: config.aiKey,
	baseURL: 'https://api.x.ai/v1',
	timeout: 360000
});

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

			if (message.attachments.size >= 1) {
				imageUrl = await [...message.attachments.entries()][0][1].attachment;
			}

			if (messageReply?.attachments.size >= 1) {
				imageUrl = await [...messageReply.attachments.entries()][0][1].attachment;
			}

			if (imageUrl != '') {
				const imageResponse = await aiClient.chat.completions.create({
					model: 'grok-4-fast-non-reasoning',
					messages: [
						{
							role: 'user',
							content: [
								{
									type: 'image_url',
									image_url: {
										url: imageUrl,
										detail: 'medium'
									}
								},
								{
									type: 'text',
									text: 'Describe this image accurately and briefly for a LLM'
								}
							]
						}
					]
				});

				let imageDesc = 'N/A';
				imageDesc = imageResponse.choices[0].message.content;
			}

			const commandSen = `User Input: ${message.content}, Message they replied to: ${
				messageReply?.content
			},\n Image description (if applicable): ${imageDesc}, \n replied messages embed description: ${
				messageReply?.embeds[0]?.description
			}.
			Last 15 chat messages as context: ${serverContext[serverId]
				.map((msg) => `${msg.role}: ${msg.content}`)
				.join('\n')}`;
			const chatResponse = await aiClient.chat.completions.create({
				model: 'grok-4-fast-non-reasoning',
				messages: [
					{
						role: 'system',
						content: pubconfig.prompt
					},
					{
						role: 'user',
						content: commandSen
					}
				]
			});

			const content = chatResponse.choices[0].message.content;

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
