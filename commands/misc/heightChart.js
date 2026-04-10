const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heightchart')
        .setDescription('Pulls up a height chart of the server.'),
    async execute(interaction) {
        const heightEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Heights")
            .setImage(`https://drive.usercontent.google.com/download?id=1XLiMBCQe6jQ3eTdkHvEbBxrRdoLn893s`)
            .setFooter({text: "Aww cuties"});

        interaction.reply({embeds: [heightEmbed]})
    },
};
