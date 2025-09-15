// Import the SDK
import { DiscordSDK } from '@discord/embedded-app-sdk';
const { clientId } = require('../../data/config.json');

import './style.css';
import rocketLogo from '/rocket.png';

// Instantiate the SDK
const discordSdk = new DiscordSDK(clientId);

setupDiscordSdk().then(() => {
	console.log('Discord SDK is ready');
});

async function setupDiscordSdk() {
	await discordSdk.ready();
}

document.querySelector('#app').innerHTML = `
  <div>
    <img src="${rocketLogo}" class="logo" alt="Discord" />
    <h1>Hello, World!</h1>
  </div>
`;
