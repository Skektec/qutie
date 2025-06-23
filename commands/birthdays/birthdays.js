const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const database = require("../../functions/database");
const notify = require("../../functions/notify");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("birthdayboard")
    .setDescription("Presents a list of all birthdays."),

  async execute(interaction) {
    try {
      const server = interaction.guildId;
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;
      const currentDay = today.getDate();

      const { rows: outputBirthdays } = await database.query(
        "SELECT * FROM birthdays WHERE server = $1",
        [server]
      );

      const sortedDates = outputBirthdays
        .map((b) => {
          const dateParts = b.date.split("-");
          const birthDay = parseInt(dateParts[0]);
          const birthMonthName = dateParts[1].trim();
          const birthYear = parseInt(dateParts[2]);

          const monthMap = {
            January: 1,
            February: 2,
            March: 3,
            April: 4,
            May: 5,
            June: 6,
            July: 7,
            August: 8,
            September: 9,
            October: 10,
            November: 11,
            December: 12,
          };

          const birthMonth = monthMap[birthMonthName];

          let currentAge = currentYear - birthYear;

          if (
            currentMonth < birthMonth ||
            (currentMonth === birthMonth && currentDay < birthDay)
          ) {
            currentAge--;
          }

          return {
            ...b,
            dateNum: parseInt(b.datenum),
            currentAge,
            birthMonth,
            birthDay,
          };
        })
        .sort((a, b) => {
          const aMonthDay = a.birthMonth * 100 + a.birthDay;
          const bMonthDay = b.birthMonth * 100 + b.birthDay;
          const currentMonthDay = currentMonth * 100 + currentDay;

          if (aMonthDay >= currentMonthDay && bMonthDay < currentMonthDay)
            return -1;
          if (aMonthDay < currentMonthDay && bMonthDay >= currentMonthDay)
            return 1;
          return aMonthDay - bMonthDay;
        });

      const birthdayList =
        sortedDates.length > 0
          ? sortedDates
              .map((b) => {
                const displayDate = b.date.replace(/-/g, " ");

                const user =
                  b.id && b.id !== "0" ? `<@${b.id}>` : b.nick || "unknown";
                return `${user} - ${displayDate} (${b.currentAge})`;
              })
              .join("\n")
          : "No birthdays found.";

      const birthdayEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Birthdays")
        .setDescription(birthdayList);

      await interaction.reply({ embeds: [birthdayEmbed] });
    } catch (err) {
      notify.error("Database error", err, "1x02100");
      await interaction.reply({
        content: `Error: ${err.message} (Occured in birthday code)`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
