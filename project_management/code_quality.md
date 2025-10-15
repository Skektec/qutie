# Epic: Code Quality and Maintainability

This epic focuses on improving the overall quality and maintainability of the Qutie Bot codebase.

## Stories

*   **Story: Consistent Code Style**
    *   **Description:** As a developer, I want to have a consistent code style across the project so that the code is easier to read and maintain.
    *   **Tasks:**
        *   [x] Create an `eslint.config.js` file with basic rules.
        *   [x] Run `eslint --fix` to automatically fix a large number of style issues.

*   **Story: Abstract File System Operations**
    *   **Description:** As a developer, I want to abstract file system operations into a dedicated module so that I can improve modularity and error handling.
    *   **Tasks:**
        *   [x] Create a `functions/fileSystem.js` module to handle all file system operations.
        *   [x] Refactor `commands/games/mapBlacklist.js`, `commands/games/formTeam.js`, and `commands/quotes/deleteQuote.js` to use the new `fileSystem.js` module.
        *   [x] Add error handling for file system operations.

*   **Story: Remove Duplicated Code in Autocomplete**
    *   **Description:** As a developer, I want to remove duplicated code in the autocomplete functions so that the code is easier to maintain.
    *   **Tasks:**
        *   [x] Create a `functions/autocomplete.js` module to handle the shared autocomplete logic for games and maps.
        *   [x] Refactor `commands/games/formTeam.js` and `commands/games/mapBlacklist.js` to use the new `autocomplete.js` module.

*   **Story: Improve Modularity of `formTeam.js`**
    *   **Description:** As a developer, I want to improve the modularity of the `formTeam.js` command so that the code is easier to understand and maintain.
    *   **Tasks:**
        *   [x] Create a `functions/teamBalancer.js` module to handle the team balancing logic.
        *   [x] Refactor `commands/games/formTeam.js` and `events/onButton.js` to use the new `teamBalancer.js` module.

*   **Story: Improve Error Handling in Database Connection**
    *   **Description:** As a developer, I want to improve the error handling in the database connection so that the bot is more resilient.
    *   **Tasks:**
        *   [x] Remove the `process.exit(1)` call from `functions/database.js` to prevent the bot from crashing if the database connection fails.
