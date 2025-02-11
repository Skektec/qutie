const { tenorToken } = require('../data/config.json')

module.exports = {
    execute: async (message) => {
        const commandSen = message.content.split(' ')

        const ofIndex = commandSen.indexOf('of')

        if (ofIndex === -1 || ofIndex === commandSen.length - 1) {
            message.reply('What am I searching?')
            return
        }

        const searchTerm = commandSen.slice(ofIndex + 1).join(' ')

        try {
            const fetch = (await import('node-fetch')).default

            const response = await fetch(
                `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(
                    searchTerm
                )}&key=${tenorToken}&limit=1`
            )

            const data = await response.json()

            if (data.results && data.results.length > 0) {
                const gifUrl = data.results[0].url
                message.reply(gifUrl)
            } else {
                message.reply('No GIFs found for your search term.')
            }
        } catch (error) {
            console.error('Error fetching GIF:', error)
            message.reply('An error occurred while fetching the GIF.')
        }
    },
}
