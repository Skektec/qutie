const notify = require('./notify');

module.exports = {
  createGameAutocomplete: async (interaction, choices) => {
    const focusedOption = interaction.options.getFocused(true);
    const searchQuery = focusedOption.value.toLowerCase();

    const filteredChoices = choices
      .filter((choice) => choice.toLowerCase().includes(searchQuery))
      .sort((a, b) => {
        const aStartsWith = a.toLowerCase().startsWith(searchQuery);
        const bStartsWith = b.toLowerCase().startsWith(searchQuery);
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        return a.localeCompare(b);
      })
      .slice(0, 25);

    try {
      await interaction.respond(
        filteredChoices.map((choice) => ({ name: choice, value: choice }))
      );
    } catch (err) {
      notify.error('Error in autocomplete', err, '5x00000');
    }
  },
};
