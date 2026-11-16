const { Events } = require('discord.js');
const displayQuote = require('../functions/quotes/displayQuote')

module.exports = {
    name: Events.MessageCreate,
    execute: async (message) =>
    {
        const args = message.content.trim().split(' ');
        
        if (message.author.bot) return;
        InterpretMessage(message, args)
    }
}

function InterpretMessage(message, args) {
    switch (args[0]){
        case (".q"):
            displayQuote.numericDisplay(args);
            break;
    }
}