# Refactoring Summary

This document summarizes the refactoring changes made to the Qutie Bot codebase.

## 1. Linting

*   **ESLint Configuration:** Created a new `eslint.config.js` file to enforce a consistent code style across the project.
*   **Code Formatting:** Ran `eslint --fix` to automatically fix numerous indentation, quote style, and line break issues.

## 2. Configuration Management

*   **Separation of Concerns:** Reverted the initial merge of `pubconfig.js` and `config.json` to maintain a separation between public and private configuration.
*   **Centralized Configuration:** Created a `data/config.json` file to store sensitive data and environment-specific settings. This file is intended to be in the `.gitignore`.
*   **Help Channel:** Moved the `helpChannel` to `data/config.json`. The value is currently a placeholder and needs to be updated.

## 3. File System Abstraction

*   **Created `fileSystem.js`:** A new module was created at `functions/fileSystem.js` to abstract all file system operations.
*   **Refactored Commands:** The following commands were refactored to use the new `fileSystem.js` module:
    *   `commands/games/mapBlacklist.js`
    *   `commands/games/formTeam.js`
    *   `commands/quotes/deleteQuote.js`
*   **Error Handling:** Added error handling for file system operations within the `fileSystem.js` module.

## 4. Code Deduplication

*   **Created `autocomplete.js`:** A new module was created at `functions/autocomplete.js` to handle the shared autocomplete logic for games and maps.
*   **Refactored Commands:** The following commands were refactored to use the new `autocomplete.js` module:
    *   `commands/games/formTeam.js`
    *   `commands/games/mapBlacklist.js`

## 5. Modularity

*   **Created `teamBalancer.js`:** A new module was created at `functions/teamBalancer.js` to handle the team balancing logic from the `formTeam` command.
*   **Refactored `formTeam.js`:** The `formTeam`, `winner`, and `saveFormTeamData` functions were moved from `commands/games/formTeam.js` to the new `teamBalancer.js` module.
*   **Refactored `onButton.js`:** The `onButton.js` event handler was updated to use the new `teamBalancer.js` module.

## 6. Error Handling

*   **Database Connection:** Removed the `process.exit(1)` call from `functions/database.js` to prevent the bot from crashing if the database connection fails. The error is now logged to the console, and the application continues to run.
