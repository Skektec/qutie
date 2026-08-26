const fs = require('node:fs');
const path = require('node:path');
const cron = require('node-cron');
const {Client, Collection, GatewayIntentBits, Partials} = require('discord.js');
const {discordToken} = require('./data/config.json');
const notify = require('./functions/notify');
// const {setClient} = require('./data/clientInstance');
const database = require('./functions/database');

// Creates client instance.
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

// Stores the client instance.
// Old thing to handle issues gracefully by still being able to send me a DM
// I don't think it worked, so I'll disable it for now
// setClient(client);

// We create a new command collection
client.commands = new Collection();
// Store the path for the commands folder
const foldersPath = path.join(__dirname, 'commands');
// Store all the subfolders inside this path
const commandFolders = fs.readdirSync(foldersPath);

// Get the events folder path
const eventsPath = path.join(__dirname, 'events');
// Store all the .js files
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

// In this loop we look for all the command files in the command folders we stored previously
for (const folder of commandFolders) {
    // Get the command subfolder path
    const commandsPath = path.join(foldersPath, folder);
    // Look inside for all .js files
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    
    // In this loop we get each command file and check + register it.
    for (const file of commandFiles) {
        // Get file path
        const filePath = path.join(commandsPath, file);
        // Require said path
        const command = require(filePath);
        // Check that the command has the required elements
        if ('data' in command && 'execute' in command) {
            // Set the command as available
            client.commands.set(command.data.name, command);
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            );
        }
    }
}

// Here we do the same as previously but for events.
for (const file of eventFiles) {
    // Get path
    const filePath = path.join(eventsPath, file);
    // Require path
    const event = require(filePath);
    // If the event happens once (usually at startup)
    // Else every time it happens
    if (event.once) {
        // Subscribe it to its relevant event.
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        // Subscribe it to its relevant event.
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// This scheduler checked the database for birthdays
// I'll break it down into its own file
cron.schedule('0 13 * * *', async () => {
    try {
        const today = new Date();
        const currentDate = `${today.getDate()}-${today.toLocaleString('en-US', {month: 'long'})}`;

        database.query(
            `SELECT *
             FROM birthdays
             WHERE date LIKE '%${currentDate}%'`,
            async (err, result) => {
                if (err) {
                    notify.error('Error querying the database:', err, '1x36079');
                    return;
                }

                const rows = result.rows;

                if (rows.length === 0) {
                    return;
                }

                for (const row of rows) {
                    try {

                        const dateLength = row.date.length;
                        if (row.date.slice(0, dateLength - 5) !== currentDate) return;

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
            }
        );
    } catch (err) {
        notify.error('Error displaying birthday:', err, '2x36112');
    }
});

// These schedulers were for War thunder news, which will become its own bot.
// cron.schedule('10 * * * *', async () => {
//     fetchNews.findLinks();
//     fetchDev.findLinks();
// });
// cron.schedule('30 * * * *', async () => {
//     fetchNews.findLinks();
//     fetchDev.findLinks();
// });
// cron.schedule('50 * * * *', async () => {
//     fetchNews.findLinks();
//     fetchDev.findLinks();
// });

// Logs in bot.
client.login(discordToken);
