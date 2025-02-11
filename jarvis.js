const path = require('path')

module.exports = {
    execute: (message) => {
        const commandSen = message.content.split(' ')

        // Spliting the sentence into each element
        commandSen.shift()

        const commandArray = []
        for (let i = 0; i < commandSen.length; i++) {
            commandArray.push(`${commandSen[i]}`)
        }

        runCommand(commandArray, message)
    },
}

const runCommand = (commandArray, message) => {
    const commandWord = commandArray[0]

    // executes a command file matching the word if it exists
    // else looks at the next word.
    if (commandWord == 'ping' || commandWord == 'gif') {
        const commandPath = path.join(
            __dirname,
            'jarvis_commands',
            `${commandWord}.js`
        )
        const command = require(commandPath)

        if (command && typeof command.execute === 'function') {
            command.execute(message)
        } else {
            message.reply(`Command "${commandWord}" not found or invalid.`)
        }
    } else if (commandArray.length > 0) {
        commandArray.shift()
        runCommand(commandArray, message)
    }
}
