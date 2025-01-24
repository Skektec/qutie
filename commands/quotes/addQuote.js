const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs').promises
const quotes = './quotes.json'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addquote')
        .setDescription('Manually add a quote.')
        .addStringOption((option) =>
            option
                .setName('quote')
                .setDescription('The text you want to quote.')
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription(`The person you're quoting.`)
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('nick')
                .setDescription(`Nickname if the person isn't on the server.`)
                .setRequired(false)
        ),

    async execute(interaction) {
        const quote = interaction.options.getString('quote')
        const user = interaction.options.getUser('user')
        const nick = interaction.options.getUser('nick')

        if (!user && !nick) {
            return interaction.reply({
                content: 'You must provide either a user or a nickname.',
                ephemeral: true,
            })
        }

        let userObject

        if (!user) {
            userObject = {
                id: 0,
                username: nick,
            }
        } else {
            userObject = {
                id: user.id,
                username: user.username,
            }
        }

        const data = await fs.readFile(quotes, 'utf8')
        const jsonData = JSON.parse(data)

        const nextId =
            Array.isArray(jsonData) && jsonData.length > 0
                ? (Number(jsonData[jsonData.length - 1].id || 0) + 1).toString()
                : '1'

        const newEntry = {
            id: nextId,
            nick: user.username,
            userId: user.id,
            channel: interaction.channelId,
            server: interaction.guildId,
            text: quote,
            time: Math.floor(interaction.createdTimestamp / 1000),
        }

        jsonData.push(newEntry)

        await fs.writeFile(quotes, JSON.stringify(jsonData, null, 2), 'utf8')

        await interaction.reply(`Quote added: "${quote}" - ${user.username}`)
        console.log(`Quote added: "${quote}" - ${user.username}`)
    },
}
