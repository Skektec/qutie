const fs = require('node:fs')
const path = require('node:path')
const {
    Client,
    Events,
    Collection,
    GatewayIntentBits,
    Partials,
} = require('discord.js')
const { token } = require('./config.json')
const quotes = './quotes.json'

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
})

client.commands = new Collection()
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        if (reaction.partial) {
            await reaction.fetch()
        }

        if (reaction.emoji.name !== '💬') return

        if (!reaction.message.author) {
            await reaction.message.fetch()
        }

        await reaction.message.reply(
            `New quote added by ${user.username}:\n"${reaction.message.content}"`
        )

        const data = await fs.promises.readFile(quotes, 'utf8')
        const jsonData = JSON.parse(data)

        const nextId =
            Array.isArray(jsonData) && jsonData.length > 0
                ? Number(jsonData[jsonData.length - 1].id || 0) + 1
                : 1

        const newEntry = {
            id: nextId,
            nick: reaction.message.author.username,
            userId: reaction.message.author.id,
            channel: reaction.message.channel.id,
            server: reaction.message.guild.id,
            text: reaction.message.content,
            messageId: reaction.message.id,
            time: reaction.message.createdTimestamp,
        }

        jsonData.push(newEntry)

        await fs.promises.writeFile(
            quotes,
            JSON.stringify(jsonData, null, 2),
            'utf8'
        )

        console.log('Entry added successfully!')
    } catch (error) {
        console.error('An error occurred in MessageReactionAdd:', error)
    }
})

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder)
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'))
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command)
        } else {
            console.log(
                `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
            )
        }
    }
}

const eventsPath = path.join(__dirname, 'events')
const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'))

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

client.login(token)
