const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs').promises
const quotes = './data/birthdays.json'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addbirthday')
        .setDescription('Add your birthday.')
        .addStringOption((option) =>
            option
                .setName('day')
                .setDescription('Enter the day of your birthday.')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('month')
                .setDescription('Select the month of your birthday.')
                .setAutocomplete(true)
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('year')
                .setDescription('Enter the year of your birthday.')
                .setRequired(true)
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        let choices = []
        if (focusedOption.name === 'month') {
            choices = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December',
            ]
        }

        const filtered = choices.filter((choice) =>
            choice.toLowerCase().startsWith(focusedOption.value.toLowerCase())
        )

        await interaction.respond(
            filtered.map((choice) => ({ name: choice, value: choice }))
        )
    },

    async execute(interaction) {
        const day = interaction.options.getString('day')
        const month = interaction.options.getString('month')
        const year = interaction.options.getString('year')

        if (isNaN(day) || day < 1 || day > 31 || day % 1 != 0) {
            return interaction.reply({
                content: 'Please enter a valid day (1–31).',
                ephemeral: true,
            })
        }

        const validMonths = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ]

        if (!validMonths.includes(month)) {
            return interaction.reply({
                content: 'Please enter a valid month (e.g., August).',
                ephemeral: true,
            })
        }

        if (
            isNaN(year) ||
            year.length !== 4 ||
            year < 1900 ||
            year > new Date().getFullYear()
        ) {
            return interaction.reply({
                content: 'Please enter a valid year (e.g., 1990).',
                ephemeral: true,
            })
        }

        const user = interaction.user
        const newEntry = {
            nick: user.username,
            id: user.id,
            date: `${day}-${month}-${year}`,
        }

        try {
            let jsonData

            try {
                const data = await fs.readFile(quotes, 'utf8')
                jsonData = data ? JSON.parse(data) : []
            } catch {
                jsonData = []
            }

            const existingEntryIndex = jsonData.findIndex(
                (entry) => entry.id === user.id
            )

            if (existingEntryIndex !== -1) {
                jsonData[existingEntryIndex] = newEntry
                console.log(`Updated ${interaction.user.username}'s birthday.`)

                await interaction.reply({
                    content: `Your birthday has been updated to ${newEntry.date}! 🎉`,
                    ephemeral: true,
                })
            } else {
                jsonData.push(newEntry)
                console.log(`Added ${interaction.user.username}'s birthday.`)

                await interaction.reply({
                    content: `Your birthday (${newEntry.date}) has been added! 🎉`,
                    ephemeral: true,
                })
            }

            await fs.writeFile(
                quotes,
                JSON.stringify(jsonData, null, 2),
                'utf8'
            )
        } catch (err) {
            console.error(err)
            return interaction.reply({
                content:
                    'An error occurred while saving your birthday. Please try again later.',
                ephemeral: true,
            })
        }
    },
}
