const database = require("../database");
const EmbedBuilder = require("discord.js");

module.exports = {
    numericDisplay: async (message, args) =>
    {
        const tableName = `${message.guildId}-quotes`;
        console.log(args)

        // Database query builder
        
        let databaseQuery = "";
        let queryParameters = [];
        let useAll = false;
                
        let s;
        args[1] ? s = args[1] : s = null;
        switch (true){
            case isNaN(s):
                // is s a number check
                databaseQuery = `WHERE rownum = $1`;
                queryParameters.push(args[1]);
                break;
            case /latest/.test(s):
                // text "latest" check
                queryParameters = `WHERE rownum = $1`; // Currently uses similar method to the rest, but I think I could do order by and fetch the first?
                databaseQuery.push(count);
                useAll = true;
                break;
            case /help/.test(s):
                // text "help" check
                message.reply("- /addquote - Manually add a quote.\n- /deletequote - Manually delete a quote.\n- /quoteboard - Creates a leaderboard with the amount of quotes from each user in the server.\n- /searchquote - Search for specific keywords in quotes.");
                return;
            case /[<@!>]/g.test(s):
                // user mentions check
                const userId = args[0].replace(/[<@!>]/g, '');
                databaseQuery = `WHERE userid = $1`;
                queryParameters.push(userId);
                useAll = true;
                break;
            case s: // when it reaches here it should fallback to nickname check
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
