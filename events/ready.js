const { Events, ActivityType } = require('discord.js');
const notify = require('../functions/notify');
const { setPlayer } = require('../data/clientInstance');
const { botAdimn } = require('../data/config.json');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    client.on('ready', function (readyClient) {
      // Discord Player Initialization
      const { Player } = require('discord-player');
      const player = new Player(readyClient);

      // Store the player in clientInstance
      setPlayer(player);
    });

    console.log('Player ready');

    sendNotif = () => {
      try {
        let serverCount = client.guilds.cache.size;
        let message = `<@${botAdimn}>! I am online in ${serverCount} servers!`;
        notify.log(message);
      } catch (err) {
        notify.error('Online notif failed.', err, '0x000000');
      }
    };

    client.user.setPresence({
      activities: [
        {
          name: 'with you',
          type: ActivityType.Playing
        }
      ]
    });

    console.log(`Ready! Logged in as ${client.user.tag}`);
    // sendNotif();
  }
};
