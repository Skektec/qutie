const {SlashCommandBuilder} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Give a member a role.')
        .addUserOption((option) =>
            option
                .setName('member')
                .setDescription('Who is getting the role?')
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const role = member.guild.roles.cache.find(role => role.id === 973496514917842975);
        member.roles.add(role);
    },
};
