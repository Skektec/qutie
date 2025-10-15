# Epic: Configuration and Deployment

This epic focuses on improving the configuration and deployment of the Qutie Bot.

## Stories

*   **Story: Secure Configuration**
    *   **Description:** As a developer, I want to have a clear separation between public and private configuration so that I can keep sensitive information secure.
    *   **Tasks:**
        *   [x] Create a `config.json` file for sensitive data.
        *   [x] Add `config.json` to the `.gitignore` file.

*   **Story: Centralized Configuration**
    *   **Description:** As a developer, I want to have a centralized configuration for the bot so that it is easier to manage different environments.
    *   **Tasks:**
        *   [x] Move the `helpChannel` to `config.json`.
        *   [ ] Move all other environment-specific variables to `config.json`.
