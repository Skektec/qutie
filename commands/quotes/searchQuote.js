const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs/promises')
const { EmbedBuilder } = require('discord.js')
const quotes = './quotes.json'
const stringSimilarity = require('string-similarity')
const { match } = require('assert')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('searchquote')
        .setDescription('Search for specific keywords in quotes.')
        .addStringOption((option) =>
            option
                .setName('keywords')
                .setDescription('Keywords')
                .setRequired(true)
        ),

    async execute(interaction) {
        const search = interaction.options.getString('keywords')

        try {
            const data = await fs.readFile(quotes, 'utf8')
            const quotesArray = JSON.parse(data)

            const matches = quotesArray.filter((quote) => {
                const similarResult = stringSimilarity.compareTwoStrings(
                    quote.text,
                    search
                )
                return similarResult > 0.35
            })

            const matchesArray = []
            matches.forEach((match) => {
                matchesArray.push(match)
            })

            const matchesText = matchesArray
                .map((match) => `"${match.text}" - #${match.id}`)
                .join('\n')

            const foundMatches = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Searched for: ' + search)
                .addFields({
                    name: 'Matches:',
                    value: matchesText,
                    inline: true,
                })

            interaction.reply({ embeds: [foundMatches] })
        } catch (err) {
            console.error('Error: ' + err)
        }
    },
}
