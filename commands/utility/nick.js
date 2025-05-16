const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const error = require("../../functions/error");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Change a users nickname")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription(`Who's nickname to change.`)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nick")
        .setDescription("What you want to change their nickname to.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const nick = interaction.options.getString("nick");
    const guild = interaction.guild;

    const member = await guild.members.fetch(user.id);

    try {
      if (member.manageable) {
        member.setNickname(nick);
        interaction.reply({
          content: `Nickname changed.`,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        interaction.reply({
          content: `I don't have the permissions for that.`,
          flags: MessageFlags.Ephemeral,
        });
      }
    } catch (error) {
      error.log("Nickname change error: " + error);
      interaction.reply({
        content: "Something went wrong, developer notified.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
