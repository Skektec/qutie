// Import the SDK
import { DiscordSDK } from '@discord/embedded-app-sdk';
const { clientId } = require('../../data/config.json');

import './style.css';
import rocketLogo from '/rocket.png';

// Instantiate the SDK
const discordSdk = new DiscordSDK(clientId);

console.log('Attempting to set up Discord SDK...');
setupDiscordSdk().then(() => {
	console.log('✅ Discord SDK is ready and connected!');
});

async function setupDiscordSdk() {
	console.log('Awaiting Discord SDK to be ready...');
	await discordSdk.ready();
	console.log('⭐ Discord SDK has successfully connected.');
	console.log(`Connected with user ID: ${discordSdk.user.id}`);
}

document.querySelector('#app').innerHTML = `
  <div>
    <img src="${rocketLogo}" class="logo" alt="Discord" />
    <h1>Hello, World!</h1>
  </div>
`;
