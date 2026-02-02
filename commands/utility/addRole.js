const {SlashCommandBuilder, MessageFlags} = require('discord.js');
const {notify} = require('../../functions/notify');

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

        try {
            member.roles.add(role);
            interaction.reply({
                content: `bwa.`,
                flags: MessageFlags.Ephemeral
            });
        } catch (e) {
            notify.error(e)
        }
    },
};
