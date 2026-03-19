const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('heighchart')
        .setDescription('Pulls up a height chart of the server.'),
    async execute(interaction) {
        const heightEmbed = new EmbedBuilder()
            .setColor(0x0099ff)
            .setTitle("Heights")
            .setImage(`https://media.discordapp.net/attachments/1034191014451236894/1484315659486892113/HeightComparison-chart.png?ex=69bdc82e&is=69bc76ae&hm=91c589955385f3ea6ba5bacf86c084dfbd24f83a3838a15f971e5d9863454ef1&=&format=webp&quality=lossless&width=1656&height=668`);

        interaction.reply(heightEmbed)
    },
};
