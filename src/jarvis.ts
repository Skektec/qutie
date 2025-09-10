import { Mistral } from '@mistralai/mistralai';
const config = require('./data/config.json');
const pubconfig = require('./data/pubconfig');
const gif = require('./jarvis_commands/gif');
const notify = require('./functions/notify');

const aiClient = new Mistral({ apiKey: config.mistralToken });

module.exports = {
	execute: async (message: any) => {
		try {
			const messageIn = message.content.replace(/^grok\s*/i, 'jarvis');
			const messageReply = message.reference?.messageId
				? await message.channel.messages.fetch(message.reference.messageId)
				: null;
			const commandSen = `User Input: ${messageIn}, Message they replied to: ${messageReply}`;
			const chatResponse = await aiClient.chat.complete({
				model: 'mistral-small-latest',
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

			const content = chatResponse.choices?.[0]?.message?.content;

			if (!content || typeof content !== 'string') {
				console.error('Invalid content received from AI');
				return;
			}

			const gifCommand = content.match(/\$\$gif of (.*?)\$\$/);
			const truth = content.match(/\$\$answer:\s*(.*?)\s*\$\$/);

			if (gifCommand) {
				gif.execute(gifCommand, message);
			}
			if (truth) {
				message.reply(truth?.[1]);
			}
		} catch (err) {
			notify.error('Error in jarvis.js', err, '-1x40039');
		}
	}
};
