const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const notify = require("../../functions/notify");

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
        .setDescription(
          "What you want to change their nickname to. (Limit 32 characters)"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const nick = interaction.options.getString("nick");
    const guild = interaction.guild;

    const member = await guild.members.fetch(user.id);

    try {
      if (member.manageable && nick.length <= 32) {
        member.setNickname(nick);
        interaction.reply({
          content: `Nickname changed.`,
          flags: MessageFlags.Ephemeral,
        });
      } else if (nick.length > 32) {
        interaction.reply({
          content: `Nickname is too long. (Limit 32 characters)`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      } else {
        interaction.reply({
          content: `I don't have the permissions for that.`,
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    } catch (error) {
      notify.error("Nickname change error.", error, "2x15041");
      interaction.reply({
        content: "Something went wrong, developer notified.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
