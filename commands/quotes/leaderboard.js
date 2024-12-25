const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Creates a leaderboard of all quotes in the server.'),
    async execute(interaction) {
        await interaction.deferReply()

        fs.readFile('./quotes.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err)
                interaction.editReply(
                    'There was an error reading the quotes data.'
                )
                return
            }

            const quotes = JSON.parse(data)
            const counts = {}

            quotes.forEach((item) => {
                const userId = item.userId
                counts[userId] = (counts[userId] || 0) + 1
            })

            const sortedCounts = Object.entries(counts).sort(
                (a, b) => b[1] - a[1]
            )

            const leaderboardText = sortedCounts
                .map(
                    ([userId, count], index) =>
                        `${index + 1}. **<@${userId}>** - ${count} quotes`
                )
                .join('\n')

            const leaderboardEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Quote Leaderboard')
                .setDescription(leaderboardText || 'No quotes yet.')
                .setFooter({ text: 'This is just so guh.' })

            interaction.editReply({ embeds: [leaderboardEmbed] })

            console.log('Quote leaderboard presented')
        })
    },
}
