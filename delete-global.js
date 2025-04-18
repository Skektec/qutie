const { REST, Routes } = require('discord.js');
const { clientId, discordToken } = require('./data/config.json');

const rest = new REST().setToken(discordToken);

rest
	.delete(Routes.applicationCommand(clientId, ''))
	.then(() => console.log('Successfully deleted application command'))
	.catch(console.error);
