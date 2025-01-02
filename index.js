const fs = require('node:fs')
const path = require('node:path')
const cron = require('node-cron')
const {
    Client,
    Events,
    Collection,
    GatewayIntentBits,
    Partials,
} = require('discord.js')
const { token, serverChannel } = require('./config.json')
const fetchquote = require('./fetchquote')
// const { channel } = require('node:diagnostics_channel');
const quotes = './quotes.json'
const birthdays = './birthdays.json'

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

const monthNames = {
    January: '01',
    February: '02',
    March: '03',
    April: '04',
    May: '05',
    June: '06',
    July: '07',
    August: '08',
    September: '09',
    October: '10',
    November: '11',
    December: '12',
}

const recentLinks = new Map()
const platforms = [
    'youtu.be',
    'youtube.com',
    'x.com',
    'vxtwitter.com',
    'fxtwitter.com',
    'fixupx.com',
]

client.on(Events.MessageReactionAdd, async (reaction, user) => {
    try {
        if (reaction.partial) await reaction.fetch()
        if (reaction.message.partial) await reaction.message.fetch()

        if (reaction.emoji.name !== '💬') return

        if (reaction.message.author.bot) return

        const botHasReacted = await reaction.users
            .fetch()
            .then((users) => users.has(client.user.id))

        if (botHasReacted) {
            return
        }

        await reaction.message.react('💬')

        const data = await fs.promises.readFile(quotes, 'utf8')
        const jsonData = JSON.parse(data)

        const existingQuote = jsonData.find(
            (quote) => quote.messageId === reaction.message.id
        )
        if (existingQuote) return
        const nextId =
            Array.isArray(jsonData) && jsonData.length > 0
                ? (Number(jsonData[jsonData.length - 1].id || 0) + 1).toString()
                : '1'

        await reaction.message.reply({
            content: `New quote added by ${user.username} as #${nextId}\n"${reaction.message.content}"`,
            allowedMentions: { repliedUser: false },
        })

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

client.on('messageCreate', (message) => {
    if (message.author.bot) return
    if (message.content.startsWith('.q')) {
        const args = message.content.slice(2).trim().split(/ +/)

        fetchquote.execute(message, args)
    }

    const foundLink = platforms.find((platform) =>
        message.content.includes(platform)
    )
    if (!foundLink) return

    console.log(`Found link: ${foundLink}, Content: ${message.content}`)

    if (recentLinks.has(message.content)) {
        const emoji = '♻️'
        try {
            message.react(emoji)
            console.log('Erm repost detected')
        } catch (error) {
            console.error('Failed to react to the message:', error)
        }
    } else {
        recentLinks.set(message.content, Date.now())

        setTimeout(() => recentLinks.delete(message.content), 43200000)
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

cron.schedule('0 12 * * *', async () => {
    try {
        console.log('Looking for birthdays today.')
        const data = await fs.promises.readFile(birthdays, 'utf8')
        const jsonData = JSON.parse(data)

        const today = new Date()
        const currentDate = `${today.getDate()}-${(today.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`
        console.log("Today's date is:", currentDate)

        for (const entry of jsonData) {
            const [day, monthName] = entry.date.split('-')
            const month = monthNames[monthName]
            const birthdayDate = `${day}-${month}`

            console.log('Checking birthday:', entry.date)
            if (birthdayDate === currentDate) {
                console.log(`Found a birthday: ${entry.nick}`)
                try {
                    const channel = await client.channels.fetch(serverChannel)
                    if (channel) {
                        console.log('Sending message to channel')
                        channel.send(`🎉 Happy Birthday <@${entry.id}>! 🎉`)
                    } else {
                        console.log('Channel not found')
                    }
                } catch (channelError) {
                    console.error('Error fetching channel:', channelError)
                }
            }
        }
    } catch (err) {
        console.error('Error reading or processing birthdays:', err)
    }
})

client.login(token)

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
        // command handling
    } else if (interaction.isAutocomplete()) {
        const command = interaction.client.commands.get(interaction.commandName)

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            )
            return
        }

        try {
            await command.autocomplete(interaction)
        } catch (error) {
            console.error(error)
        }
    }
})
