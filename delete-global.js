const { REST, Routes } = require("discord.js");
const { clientId, discordToken, guildId } = require("./data/config.json");

const rest = new REST().setToken(discordToken);

// rest
//   .delete(Routes.applicationCommand(clientId, ""))
//   .then(() => console.log("Successfully deleted application command"))
//   .catch(console.error);

// For resetting duplicate guild commands
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: [] });
