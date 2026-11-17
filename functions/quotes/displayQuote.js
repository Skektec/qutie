const database = require("../database");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    numericDisplay: async (message, args) =>
    {
        const tableName = `${message.guildId}-quotes`;

        // Database query builder
        
        let databaseQuery = "";
        let queryParameters = [];
        let useAll = false;
                
        let s;
        args[1] ? s = args[1] : s = undefined;
        
        switch (true){
            case !isNaN(s):
                // is s a number check
                databaseQuery = `WHERE rownum = $1`;
                queryParameters.push(args[1]);
                break;
            case /latest/.test(s):
                // text "latest" check
                // Currently uses similar method to the rest, but I think I could do order by and fetch the first?
                
                let count = 0;
                try {
                    const {rows} = await database.query(`SELECT COUNT(*) ::int AS count
                                                     FROM "${tableName}"`);
                    count = rows[0]?.count;
                } catch (err) {
                    message.reply('Error fetching latest quote, are there any quotes?');
                }

                databaseQuery = `WHERE rownum = $1`;
                queryParameters.push(count);
                useAll = true;
                break;
            case /help/.test(s):
                // text "help" check
                message.reply("__Slash Commands__\n" +
                    "- /addquote - Manually add a quote.\n" +
                    "- /deletequote - Manually delete a quote.\n" +
                    "- /quoteboard - Creates a leaderboard with the amount of quotes from each user in the server.\n" +
                    "- /searchquote - Search for specific keywords in quotes.\n" +
                    "__Prefix Commands__\n" +
                    "- .q - Fetches a random Quote.\n" +
                    "- .q XX - Fetches the quote with the associated number.\n" +
                    "- .q latest - Fetches the most recent quote.\n" +
                    "- .q @mention - Fetches a quote from the mentioned member.\n"+
                    "- .q nickname - Fetches a quote from the associated nickname.\n" +
                    "- .q help - Sends this message.\n" 
                );
                return;
            case /[<@!>]/g.test(s):
                // user mentions check
                const userId = args[1].replace(/[<@!>]/g, '');
                databaseQuery = `WHERE userid = $1`;
                queryParameters.push(userId);
                useAll = true;
                break;
            case s !== undefined: // when it reaches here it should fallback to nickname check
                // does s exist check
                databaseQuery = `WHERE nick = $1`;
                queryParameters.push(s);
                useAll = true;
                break;
            default: // otherwise it does a random quote
                databaseQuery = `ORDER BY RANDOM() LIMIT 1`;
                break;
        }

        databaseQuery = `SELECT * FROM (SELECT *, ROW_NUMBER() OVER (ORDER BY time ASC) AS rownum FROM "${tableName}") sub ${databaseQuery}`
        
        callDb(databaseQuery, queryParameters, useAll, message);
    }
}

async function callDb(databaseQuery, queryParameters, useAll, message) {
    try {
            const {rows} = await database.query(databaseQuery, queryParameters);
            if (!rows.length) {
                message.channel.send(useAll ? 'No matching quotes found.' : 'No matching quote found.');
                return;
            }
            const quote = useAll ? rows[Math.floor(Math.random() * rows.length)] : rows[0];
            sendQuoteEmbed(quote, message);
    } catch (err) {
        message.channel.send('An error occurred while retrieving quotes.');
        console.error(err)
    }
}

const sendQuoteEmbed = (quote, message) => {
    if (!quote) {
        message.channel.send('No matching quote found.');
        return;
    }

    const quoteTimestamp = quote.time * 1000;
    const quoteDate = new Date(quoteTimestamp);
    const formattedDate = quoteDate.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    const imageFromText = quote.text.match(/(https?:\/\/\S+\.(jpg|jpeg|png|gif))/i);
    
    const quoteEmbed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`Quote #${quote.rownum}`)
        .setDescription(
            `${quote.text}\n- <@${quote.userid}> [(Jump)](https://discordapp.com/channels/${message.guild_id}/${quote.channel}/${quote.messageid})`
        )
        .setImage(imageFromText ? imageFromText[0] : quote.image)
        .setFooter({text: formattedDate});

    if (quote.image && quote.image.match(/\.(mp4|mov|webm|avi|mkv|wmv|flv|mpeg|mpg|gif|ogg)/i)) {
        const quoteMessage = `**Quote #${quote.rownum}**\n${quote.text}\n${quote.image}\n- <@${quote.userid}> [(Jump)](https://discordapp.com/channels/${message.guild_id}/${quote.channel}/${quote.messageid})`;
        message.channel.send(quoteMessage);
    } else {
        message.channel.send({embeds: [quoteEmbed], allowedMentions: {User: false}});
    }
};
