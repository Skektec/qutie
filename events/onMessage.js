const {Events, MessageFlags, ClientApplication} = require('discord.js');
const {botAdmin} = require('../data/config.json');
const {nvmGif, neverKysVideo, zLink} = require('../data/pubconfig.js');
// const mutedUsers = require('../data/mutedUsers.json');
const fetchquote = require('../functions/fetchquote');
const notify = require('../functions/notify');
const jarvis = require('../jarvis');
const support = require('../functions/support');
const sendEmoji = require('../functions/sendEmoji');
const messageAddQuote = require('../functions/messageAddQuote.js');
const clean = require('../functions/removeTracker');
const fs = require('fs');
const storeMessage = require('../functions/storeMessage.js');

const fetchDev = require('../functions/warThunder/fetchDev.js');
const fetchNews = require('../functions/warThunder/fetchNews.js');

// const repostDetection = require('../functions/repostDetection');
const {exec} = require('child_process');
const {json} = require('stream/consumers');

const words = ['uwu', 'owo', 'blahaj'];

function delay(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

const prevMessages = [];

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) => {
        jarvis.execute(message);

        if (message.content.startsWith('runTest')) {
            // message.reply({
            // 	content: `No test to execute.`,
            // 	flags: MessageFlags.Ephemeral
            // });'
            // fetchDev.findLinks();
            // fetchNews.findLinks();
        }

        if (message.channel == 1200118011806367825) return;

        // if (message.guild && message.guild.id === '973484576703905802') storeMessage.save(message);

        if (message.author.bot) return;

        prevMessages.push(message.content);

        if (prevMessages.length > 3) prevMessages.shift();

        if (words.includes(message.content)) sendEmoji.execute(message);

        if (message.tts === true) {
            await message.reply('kys');
            message.delete();
        }
        if (message.content.match(/—/g)) {
            await message.reply('em dash detected\nclanka clanka clanka');
        }

        if (
            prevMessages.length === 3 &&
            prevMessages.every((msg) => msg === prevMessages[0] && !message.content.startsWith('.q'))
        ) {
            message.channel.send(prevMessages[2]);
        }

        if (message.content.match(/kms|kill myself|killing myself/i)) {
            message.reply({
                content: neverKysVideo,
                allowedMentions: {repliedUser: false}
            });
        }

        // if (lowerCaseMessage.match(/zov/)) {
        // 	if (message.content.match('https://')) return;
        // 	const zMessage = message.content.replace(/c/g, 'z').replace(/s/g, 'Z');
        // 	message.channel.send(`${zMessage} 🇷🇺🇷🇺🇷🇺`);
        // 	message.channel.send('ZZZ');
        // 	delay(400);
        // 	message.channel.send('Z🇷🇺Z🇷🇺Z');
        // 	delay(400);
        // 	message.channel.send('ZZ');
        // 	message.channel.send(`${zLink}`);
        // }

        if (
            message.content.match(
                /https:\/\/x.com|https:\/\/reddit.com|https:\/\/www.reddit.com|https:\/\/instagram.com/i
            )
        ) {
            const cleanLink = await clean.execute(message);
            if (cleanLink)
                message.reply({
                    content: cleanLink,
                    allowedMentions: {repliedUser: false}
                });
            delay(2000);
            await message.suppressEmbeds(true);
            return;
        }

        if (message.content.startsWith('.answer') && message.author.id === botAdmin) {
            support.answer(message, message.content.slice(7).trim().split(/ +/));
        }

        if (message.content.toLowerCase().match(/^ok garmin,? video speichern/)) {
            const messageReply = await message.channel.messages.fetch(message.reference.messageId);
            messageAddQuote.execute(messageReply, message.author);
        }

        if (message.content.toLowerCase().startsWith('.q')) {
            if (message.content.toLowerCase().startsWith('.q help')) {
                message.reply(
                    '- /addquote - Manually add a quote.\n- /deletequote - Manually delete a quote.\n- /quoteboard - Creates a leaderboard with the amount of quotes from each user in the server.\n- /searchquote - Search for specific keywords in quotes.'
                );
            } else {
                fetchquote.execute(message, message.content.slice(2).trim().split(/ +/));
            }
        }

        if (message.content.startsWith('!p')) {
            const args = message.content.slice(3).trim().split(' ');
            const command = args.shift();
            const extraArguments = args.join(' ');

            const commandFilePath = path.join(__dirname, 'commands', 'python_commands', `${command}.py`);

            fs.access(commandFilePath, fs.constants.F_OK, (err) => {
                if (err) {
                    message.reply(`Command "${command}" not found.`);
                    return;
                }

                if (!extraArguments.trim()) {
                    exec(`python "${commandFilePath}"`, (error, stdout, stderr) => {
                        if (error) {
                            message.reply(`Error: ${error.message} (Occured in python code)`);
                            return;
                        }
                        if (stderr) {
                            message.reply(`Python Error: ${stderr}`);
                            return;
                        }

                        const response = stdout.trim();

                        if (response === '') {
                            message.reply('No response from the command.');
                        } else {
                            message.reply(response);
                        }
                    });
                } else {
                    exec(`python "${commandFilePath}" "${extraArguments}"`, (error, stdout, stderr) => {
                        if (error) {
                            message.reply(`Error: ${error.message}  (Occured in python code)`);
                            return;
                        }
                        if (stderr) {
                            message.reply(`Python Error: ${stderr}`);
                            return;
                        }

                        const response = stdout.trim();

                        if (response === '') {
                            message.reply('No response from the command.');
                        } else {
                            message.reply(response);
                        }
                    });
                }
            });
        }

        // unreliable

        // if (message.embeds.length > 0) {
        // 	repostDetection.execute(message);
        // }

        // Just messing around with a mute function that deletes messages, not implemented.
        // if (Array.isArray(mutedUsers) && mutedUsers.includes(message.author.id)) {
        // 	message.reply({
        // 		content: 'You are muted.',
        // 		flags: MessageFlags.Ephemeral,
        // 	});
        //
        // 	message.delete();
        // 	return;
        // }

        // if (message.content === "nvm") {
        //   message.reply({
        //     content: nvmGif,
        //     allowedMentions: { repliedUser: false },
        //   });
        // }
    }
};
