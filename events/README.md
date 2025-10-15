# Bot Events

This folder contains handlers for various Discord gateway events. These files are crucial for the bot's real-time interactivity.

## Files

- **`interactionCreate.js`**: Handles all incoming interactions, which include slash commands, buttons, and select menus. This file is the central router for all command executions.
- **`onButton.js`**: Specifically handles button press interactions. This is likely used for creating interactive messages with clickable buttons.
- **`onMessage.js`**: Handles the `messageCreate` event, which is triggered every time a message is sent in a channel the bot has access to. This can be used for features like keyword detection or auto-responses.
- **`onReaction.js`**: Handles `messageReactionAdd` and `messageReactionRemove` events. This is used for features that rely on users reacting to messages with emojis.
- **`ready.js`**: Handles the `ready` event, which fires when the bot successfully logs in and is ready to start processing events. This is typically used for setup tasks, like setting the bot's status or logging a confirmation message.
