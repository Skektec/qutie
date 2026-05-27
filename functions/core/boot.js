const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    Init(client, token)
    {
        client.once(Events.ClientReady, (readyClient) => {
            console.log(`Ready! Logged in as ${readyClient.user.tag}`);
        });
        client.login(token);
    }
}