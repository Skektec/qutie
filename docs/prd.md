
# Product Requirements Document: Qutie Bot

## 1. Overview

Qutie Bot is a multi-purpose Discord bot designed to consolidate the functionality of several other bots into a single, convenient package. While its initial purpose was to replace existing bot functionalities, it has since evolved to include its own unique features. Initially created to provide a robust quote management system, its features have expanded to include birthday tracking, team formation for games, music playback, and various server utility commands. The bot aims to reduce clutter, provide a centralized solution for common Discord server needs, and introduce new and innovative features.

## 2. Objectives

*   **Consolidate Bot Functionality:** Reduce the number of bots required in a server by providing a wide range of features in a single bot.
*   **Develop New Features:** Develop and introduce new, unique features beyond just consolidating existing bot functionalities.
*   **Quote Management:** Provide a comprehensive system for saving, viewing, and managing quotes from server members.
*   **Community Engagement:** Foster a sense of community through features like birthday announcements and leaderboards.
*   **Game Integration:** Enhance the gaming experience by providing tools for team formation and map selection.
*   **Ease of Use:** Offer a user-friendly experience with intuitive slash commands and clear instructions.

## 3. Target Audience

The primary target audience for Qutie Bot is Discord server administrators and members who are looking for a versatile and feature-rich bot to enhance their server. The bot is suitable for a wide range of communities, from small groups of friends to large gaming communities.

## 4. Features

### 4.1. Quotes

*   **Add Quote:** Users can manually add a quote, attributing it to a server member or a custom nickname. An image URL can also be attached to the quote.
*   **Delete Quote:** Quotes can be deleted by their unique ID. Deleted quotes are archived for potential restoration.
*   **Display Quote:** Users can display a specific quote by its ID or view a random quote from a particular user.
*   **Quote Leaderboard:** A leaderboard (`/quoteboard`) displays the members who have been quoted the most, fostering a fun and competitive environment.
*   **Search Quote:** Users can search for quotes containing specific keywords, making it easy to find past conversations.

### 4.2. Birthdays

*   **Add Birthday:** Users can add their birthday to the bot's database.
*   **Birthday Board:** The `/birthdayboard` command displays a list of all upcoming birthdays in the server, helping members to celebrate each other's special day.

### 4.3. Games

*   **Form Team:** The `/formteam` command creates balanced teams for various games. It uses a skill-based rating system to ensure fair teams. For War Thunder, it also suggests a random map.
*   **Map Blacklist:** Server members can blacklist certain War Thunder maps from the random selection, allowing for a more customized gaming experience.

### 4.4. Music

*   **Play Music:** The `/play` command allows users to play music from YouTube, Spotify, and SoundCloud in a voice channel. The bot uses the `discord-player` library to provide a high-quality music streaming experience.
*   **Add to Queue:** The `/add` command is intended to allow users to add songs to the queue, but is currently not implemented.

### 4.5. Utility

*   **Help:** The `/help` command sends a support request to a designated channel, allowing users to get assistance with the bot or other server-related issues.
*   **Nickname:** The `/nick` command allows users with the appropriate permissions to change the nickname of other server members.
*   **Ping:** A simple `/ping` command to check the bot's responsiveness.
*   **Purge Bot Messages:** The `/purgebot` command allows server moderators to clean up the chat by deleting a specified number of messages sent by bots.
*   **Server Information:** The `/server` command provides information about the current server, such as the server name and member count.
*   **User Information:** The `/user` command displays information about the user who ran the command, including their username and join date.

## 5. Technical Requirements

*   **Platform:** Node.js
*   **Libraries:**
    *   `discord.js`: For interacting with the Discord API.
    *   `discord-player`: For music playback.
    *   `pg`: For PostgreSQL database interaction.
    *   `string-similarity`: For the quote search functionality.
    *   `axios`, `cheerio`, `node-fetch`: For making HTTP requests and parsing HTML (likely for War Thunder news and other integrations).
    *   `dotenv`: For managing environment variables.
*   **Database:** The bot uses a PostgreSQL database to store data for features like quotes and birthdays.

## 6. Error Handling

Qutie Bot has a structured error handling and logging system in place. Errors are assigned a unique code based on their type and location in the code, making it easier to diagnose and fix issues. The error code index is documented in the `README.md` file.
