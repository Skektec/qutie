const { SlashCommandBuilder } = require('discord.js')
const fetchquote = require('../../fetchquote')

const delay = (ms) => new Promise((res) => setTimeout(res, ms))

module.exports = {
    data: new SlashCommandBuilder()
        .setName('displayquote')
        .setDescription('Display a quote.')
        .addUserOption((option) =>
            option
                .setName('user')
                .setDescription(`UserId wrapped in <@ >`)
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName('id')
                .setDescription('The ID of the quote.')
                .setRequired(false)
        ),

    async execute(interaction) {
        const id = interaction.options.getString('id')
        const user = interaction.options.getString('user')

        if (id & user) interaction.reply('Please only use 1 field.')
        else {
            args = [id] || user
            let channel = []
            let message = { channel }
            message.channel = interaction.channel
            fetchquote.execute(message, args)
            interaction.reply('Displaying quote.')
            await delay(600)
            interaction.deleteReply()
        }
        return
    },
}
