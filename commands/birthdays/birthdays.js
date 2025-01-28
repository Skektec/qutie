const { SlashCommandBuilder } = require('discord.js')
const fs = require('fs')
const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('birthdayboard')
        .setDescription('Presents a list of all birthdays.'),

    async execute(interaction) {
        await interaction.deferReply()

        fs.readFile('./data/birthdays.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err)
                interaction.editReply(
                    'There was an error reading the birthdays data.'
                )
                return
            }

            let jsonData = []
            try {
                jsonData = JSON.parse(data)
            } catch (err) {
                console.error('Error parsing JSON:', err)
                interaction.editReply(
                    'There was an error processing the birthdays data.'
                )
                return
            }

            const birthdayList = jsonData
                .map((entry) => `<@${entry.id}>: ${entry.date}`)
                .join('\n')

            const birthdayEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Birthdays')
                .setDescription(birthdayList || 'No birthdays found.')

            interaction.editReply({ embeds: [birthdayEmbed] })

            console.log('Birthdays shown')
        })
    },
}
