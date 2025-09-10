import { database } from './functions/database';
const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const { discordToken } = require('./data/config.json');
const notify = require('./functions/notify');
const { setClient } = require('./data/clientInstance');

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

//Stores the client instance.
setClient(client);

(client as any).commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.ts'));

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			(client as any).commands.set(command.data.name, command);
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
		client.once(event.name, (...args: any[]) => event.execute(...args));
	} else {
		client.on(event.name, (...args: any[]) => event.execute(...args));
	}
}

cron.schedule('0 13 * * *', async () => {
	try {
		const today = new Date();
		const currentDate = `${today.getDate()}-${today.toLocaleString('en-US', { month: 'long' })}`;

		try {
			const result = await database.query(
				`SELECT * FROM birthdays WHERE date LIKE '%${currentDate}%'`
			);
			const rows = result.rows;

			if (rows.length === 0) {
				return;
			}

			for (const row of rows) {
				try {
					const birthdayUser = row.id && row.id !== '0' ? `<@${row.id}>` : row.nick || 'unknown';
					const channel = await client.channels.fetch(row.channel);

					if (!channel) {
						console.log(`Channel ${row.channel} not found`);
						continue;
					}

					channel.send(`🎉 Happy Birthday ${birthdayUser}! 🎉`);
					return;
				} catch (channelError) {
					notify.error(
						`Error fetching channel ${row.channel} or id ${row.id} or nick ${row.nick}:`,
						channelError,
						'4x36104'
					);
					return;
				}
			}
		} catch (err) {
			notify.error('Error querying the database:', err, '1x36095');
		}
	} catch (err) {
		notify.error('Error displaying birthday:', err, '2x36098');
	}
});

client.login(discordToken);
