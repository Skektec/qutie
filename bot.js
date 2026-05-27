const { Client, Events, GatewayIntentBits } = require('discord.js');
const { discordToken } = require('./data/config.json');s

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    client
    Init(client, discordToken);   
