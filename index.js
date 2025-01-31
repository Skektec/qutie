const fs = require("node:fs");
const { exec } = require("child_process");
const path = require("node:path");
const cron = require("node-cron");
const {
  Client,
  Events,
  Collection,
  GatewayIntentBits,
  Partials,
} = require("discord.js");
const { discordToken, serverChannel } = require("./data/config.json");
const fetchquote = require("./fetchquote");
const quotes = "./data/quotes.json";
const birthdays = "./data/birthdays.json";
const jarvis = require("./jarvis");
const respond = require("./events/onMessage");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js"));

const words = ["uwu", "owo", "blahaj"];

const monthNames = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  try {
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();
    if (reaction.message.author.bot) return;

    if (reaction.emoji.name == "💬") {
      const botHasReacted = await reaction.users
        .fetch()
        .then((users) => users.has(client.user.id));

      if (botHasReacted) {
        return;
      }

      await reaction.message.react("💬");

      const data = await fs.promises.readFile(quotes, "utf8");
      const jsonData = JSON.parse(data);

      const existingQuote = jsonData.find(
        (quote) => quote.messageId === reaction.message.id
      );
      if (existingQuote) return;
      const nextId =
        Array.isArray(jsonData) && jsonData.length > 0
          ? (Number(jsonData[jsonData.length - 1].id || 0) + 1).toString()
          : "1";

      await reaction.message.reply({
        content: `New quote added by ${user.username} as #${nextId}\n"${reaction.message.content}"`,
        allowedMentions: { repliedUser: false },
      });

      const newEntry = {
        id: nextId,
        nick: reaction.message.author.username,
        userId: reaction.message.author.id,
        channel: reaction.message.channel.id,
        server: reaction.message.guild.id,
        text: reaction.message.content,
        messageId: reaction.message.id,
        time: Math.floor(reaction.message.createdTimestamp / 1000),
      };

      jsonData.push(newEntry);

      await fs.promises.writeFile(
        quotes,
        JSON.stringify(jsonData, null, 2),
        "utf8"
      );

      console.log("Entry added successfully!");
    }

    if (reaction.emoji.name == "♻️") {
      reaction.message.reply("Errmm Repost ♻️♻️♻️");
    }
  } catch (error) {
    console.error("An error occurred in MessageReactionAdd:", error);
  }
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;
  if (message.content.startsWith(".q")) {
    const args = message.content.slice(2).trim().split(/ +/);

    fetchquote.execute(message, args);
  }

  if (message.content.startsWith("!p")) {
    const args = message.content.slice(3).trim().split(" ");
    const command = args.shift();
    const extraArguments = args.join(" ");

    const commandFilePath = path.join(
      __dirname,
      "commands",
      "python_commands",
      `${command}.py`
    );

    fs.access(commandFilePath, fs.constants.F_OK, (err) => {
      if (err) {
        message.reply(`Command "${command}" not found.`);
        return;
      }

      if (!extraArguments.trim()) {
        exec(`python "${commandFilePath}"`, (error, stdout, stderr) => {
          if (error) {
            message.reply(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            message.reply(`Python Error: ${stderr}`);
            return;
          }

          const response = stdout.trim();
          console.log(
            `Running command: python "${commandFilePath}" with no arguments`
          );

          if (response === "") {
            message.reply("No response from the command.");
          } else {
            message.reply(response);
          }
        });
      } else {
        exec(
          `python "${commandFilePath}" "${extraArguments}"`,
          (error, stdout, stderr) => {
            if (error) {
              message.reply(`Error: ${error.message}`);
              return;
            }
            if (stderr) {
              message.reply(`Python Error: ${stderr}`);
              return;
            }

            const response = stdout.trim();
            console.log(
              `Running command: python "${commandFilePath}" "${extraArguments}"`
            );

            if (response === "") {
              message.reply("No response from the command.");
            } else {
              message.reply(response);
            }
          }
        );
      }
    });
  }

  if (message.content.startsWith("jarvis")) {
    jarvis.execute(message);
  }

  if (words.includes(message.content)) {
    respond.execute(message);
  }
});

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

cron.schedule("0 13 * * *", async () => {
  try {
    console.log("Looking for birthdays today.");
    const data = await fs.promises.readFile(birthdays, "utf8");
    const jsonData = JSON.parse(data);

    const today = new Date();
    const currentDate = `${today.getDate()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;

    for (const entry of jsonData) {
      const [day, monthName] = entry.date.split("-");
      const month = monthNames[monthName];
      const birthdayDate = `${day}-${month}`;

      if (birthdayDate === currentDate) {
        console.log(`Found a birthday: ${entry.nick}`);
        try {
          const channel = await client.channels.fetch(serverChannel);
          if (channel) {
            console.log("Sending birthday message to channel");
            channel.send(`🎉 Happy Birthday <@${entry.id}>! 🎉`);
          } else {
            console.log("Channel not found");
          }
        } catch (channelError) {
          console.error("Error fetching channel:", channelError);
        }
      }
    }
  } catch (err) {
    console.error("Error reading or processing birthdays:", err);
  }
});

client.login(discordToken);

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
  } else if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});
