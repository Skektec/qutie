const fs = require('node:fs');
const { exec } = require('child_process');
const path = require('node:path');
const cron = require('node-cron');
const {
	Client,
	Events,
	Collection,
	GatewayIntentBits,
	Partials,
	MessageFlags,
} = require('discord.js');
const { discordToken } = require('./data/config.json');
const fetchquote = require('./events/fetchquote');
const jarvis = require('./jarvis');
const respond = require('./events/onMessage');
const addquote = require('./events/addquote');
const errorLog = require('./events/errorLog');
const { setClient } = require('./data/clientInstance');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./data/general.db');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

//Stores the client instance.
setClient(client);

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs
	.readdirSync(eventsPath)
	.filter((file) => file.endsWith('.js'));

const words = ['uwu', 'owo', 'blahaj'];

client.on(Events.MessageReactionAdd, async (reaction, user) => {
	try {
		if (reaction.partial) await reaction.fetch();
		if (reaction.message.partial) await reaction.message.fetch();
		if (reaction.message.author.bot) return;

		if (reaction.emoji.name == '💬') {
			const bot = client;
			addquote.execute(reaction, bot, user);
		}

		if (reaction.emoji.name == '♻️') {
			reaction.message.reply('Errmm Repost ♻️♻️♻️');
			reaction.message.reactions.cache
				.get('♻️')
				.remove()
				.catch((error) =>
					errorLog.execute('Failed to remove reactions:', error)
				);
		}
	} catch (error) {
		errorLog.execute('An error occurred in MessageReactionAdd:', error);
	}
});

client.on('messageCreate', (message) => {
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

	if (message.content.startsWith('jarvis')) {
		jarvis.execute(message);
	}

	if (message.content.startsWith('runTest')) {
		message.channel.send({
			content: 'No test to execute.',
			flags: MessageFlags.Ephemeral,
		});
	}
	if (message.content.startsWith('runTest')) {
		message.channel.send({
			content: 'No test to execute.',
			flags: MessageFlags.Ephemeral,
		});
	}

	if (words.includes(message.content)) {
		respond.execute(message);
	}
	if (words.includes(message.content)) {
		respond.execute(message);
	}
});

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	}
}

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

cron.schedule('0 13 * * *', async () => {
	try {
		const today = new Date();
		const currentDay = today.getDate();
		const currentMonth = today.toLocaleString('en-US', { month: 'long' });
		const currentDate = `${currentDay}-${currentMonth}`;

		db.all(
			'SELECT id, channel FROM birthdays WHERE SUBSTR(date, 1, LENGTH(date) - 5) = ?',
			[currentDate],
			async (err, rows) => {
				if (err) {
					errorLog.execute('Error querying the database:', err);
					return;
				}

				if (rows.length === 0) {
					return;
				}

				for (const row of rows) {
					try {
						const channel = await client.channels.fetch(row.channel);

						if (!channel) {
							console.log(`Channel ${row.channel} not found`);
							continue;
						}

						channel.send(`🎉 Happy Birthday <@${row.id}>! 🎉`);
						return;
					} catch (channelError) {
						errorLog.execute(
							`Error fetching channel ${row.channel}:`,
							channelError
						);
						return;
					}
				}
			}
		);
	} catch (err) {
		errorLog.execute('Error displaying birthday:', err);
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (interaction.isChatInputCommand()) {
	} else if (interaction.isAutocomplete()) {
		const command = interaction.client.commands.get(interaction.commandName);
		if (!command) {
			errorLog.execute(
				`No command matching ${interaction.commandName} was found.`
			);
			return;
		}
	}
	try {
		await command.autocomplete(interaction);
	} catch (error) {
		return;
	}
});

client.login(discordToken);
