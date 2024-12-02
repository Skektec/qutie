const fs = require('fs')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    execute: async (message, args) => {
        const quoteId = args[0]

        try {
            const data = await fs.promises.readFile('./quotes.json', 'utf8')
            const quotes = JSON.parse(data)

            if (!quotes || quotes.length === 0) {
                message.channel.send('No quotes are available.')
                return
            }

            if (quoteId) {
                const quote = quotes.find((q) => q.id === parseInt(quoteId))
                if (quote) {
                    const quoteTimestamp = quote.time * 1000
                    const quoteDate = new Date(quoteTimestamp)
                    const formattedDate = quoteDate.toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: true,
                    })

                    const quoteEmbed = new EmbedBuilder()
                        .setColor(0x0099ff)
                        .setTitle(`#${quote.id}`)
                        .setDescription(
                            `"${quote.text}" \n - <@${quote.userId}> [Jump](https://discordapp.com/channels/${quote.server}/${quote.channel}/${quote.messageId})`
                        )
                        .setFooter({
                            text: `${formattedDate}`,
                        })

                    message.channel.send({ embeds: [quoteEmbed] })
                } else {
                    message.channel.send(`Quote with ID ${quoteId} not found.`)
                }
            } else {
                const randomQuote =
                    quotes[Math.floor(Math.random() * quotes.length)]

                const quoteTimestamp = randomQuote.time * 1000
                const quoteDate = new Date(quoteTimestamp)
                const formattedDate = quoteDate.toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    hour12: true,
                })

                const quoteEmbed = new EmbedBuilder()
                    .setColor(0x0099ff)
                    .setTitle(`#${randomQuote.id}`)
                    .setDescription(
                        `"${randomQuote.text}" \n - <@${randomQuote.userId}> [Jump](https://discordapp.com/channels/${randomQuote.server}/${randomQuote.channel}/${randomQuote.messageId})`
                    )
                    .setFooter({
                        text: `${formattedDate}`,
                    })

                message.channel.send({ embeds: [quoteEmbed] })
            }
        } catch (err) {
            console.error('Error reading file:', err)
            message.channel.send('There was an error reading the quotes data.')
        }
    },
}
