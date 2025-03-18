const { Events, MessageFlags } = require('discord.js');
const mutedUsers = require('../data/mutedUsers.json');
const fetchquote = require('./fetchquote');
const jarvis = require('../jarvis');
const sendEmoji = require('./sendEmoji');
const fs = require('fs');
// const repostDetection = require('./repostDetection');
const { exec } = require('child_process');

const words = ['uwu', 'owo', 'blahaj'];

function delay(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
	name: Events.MessageCreate,
	execute: async (message) => {
		// Just messing around with a mute function that deletes messages, not implemented.

		// if (Array.isArray(mutedUsers) && mutedUsers.includes(message.author.id)) {
		// 	message.reply({
		// 		content: 'You are muted.',
		// 		flags: MessageFlags.Ephemeral,
		// 	});

		// 	message.delete();
		// 	return;
		// }

		if (message.author.bot) return;
		if (message.content.startsWith('.q')) {
			const args = message.content.slice(2).trim().split(/ +/);

			fetchquote.execute(message, args);
		}
		if (message.content.startsWith('!p')) {
			const args = message.content.slice(3).trim().split(' ');
			const command = args.shift();
			const extraArguments = args.join(' ');

			const commandFilePath = path.join(
				__dirname,
				'commands',
				'python_commands',
				`${command}.py`
			);

			fs.access(commandFilePath, fs.constants.F_OK, (err) => {
				if (err) {
					message.reply(`Command "${command}" not found.`);
					return;
				}

				if (!extraArguments.trim()) {
					exec(`python "${commandFilePath}"`, (error, stdout, stderr) => {
						if (error) {
							message.reply(`Error: ${error.message}`);
							return;
						}
						if (stderr) {
							message.reply(`Python Error: ${stderr}`);
							return;
						}

						const response = stdout.trim();
						console.log(
							`Running command: python "${commandFilePath}" with no arguments`
						);

						if (response === '') {
							message.reply('No response from the command.');
						} else {
							message.reply(response);
						}
					});
				} else {
					exec(
						`python "${commandFilePath}" "${extraArguments}"`,
						(error, stdout, stderr) => {
							if (error) {
								message.reply(`Error: ${error.message}`);
								return;
							}
							if (stderr) {
								message.reply(`Python Error: ${stderr}`);
								return;
							}

							const response = stdout.trim();
							console.log(
								`Running command: python "${commandFilePath}" "${extraArguments}"`
							);

							if (response === '') {
								message.reply('No response from the command.');
							} else {
								message.reply(response);
							}
						}
					);
				}
			});
		}

		// if (message.embeds.length > 0) {
		// 	repostDetection.execute(message);
		// }

		if (message.content.startsWith('jarvis')) {
			jarvis.execute(message);
		}

		if (message.content.startsWith('runTest')) {
			message.channel.send({
				content: 'No test to execute.',
				flags: MessageFlags.Ephemeral,
			});
		}

		if (words.includes(message.content)) {
			sendEmoji.execute(message);
		}

		if (message.tts === true) {
			message.reply('kys');
		}
	},
};
