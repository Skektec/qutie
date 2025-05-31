module.exports = {
  execute: async (message) => {
    let cleaned = message.content;

    if (message.content.includes("http")) {
      await message.suppressEmbeds(true);

      cleaned = cleaned.replace(
        /(https?:\/\/(?:www\.)?reddit\.com\/[\w\/.-]+)(?:\?[^\/\s]*)?/gi,
        "https://rxddit.com$1"
      );

      cleaned = cleaned.replace(
        /(https?:\/\/(?:www\.)?x\.com\/[\w\/.-]+)(?:\?[^\/\s]*)?/gi,
        "https://fixupx.com$1"
      );

      return cleaned;
    }

    return cleaned;
  },
};
