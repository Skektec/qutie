module.exports = {
  execute: async (message) => {
    let cleaned = message.content;

    if (
      message.content.match(/x.com|reddit.com/i) |
      message.content.match(/\?t=|\?utm_source/i)
    ) {
      message.suppressEmbeds(true);

      cleaned = cleaned.replace(
        /(https?:\/\/(?:www\.)?reddit\.com\/[^\s?]+)(\?utm[^\s]*)?/gi,
        "$1"
      );

      cleaned = cleaned.replace(
        /(https?:\/\/(?:www\.)?x\.com\/[^\s?]+)\?t=[^\s&]+[^\s]*/gi,
        "$1"
      );

      cleaned = cleaned.replace(
        /https?:\/\/(?:www\.)?x\.com/gi,
        "https://fixupx.com"
      );
      cleaned = cleaned.replace(
        /https?:\/\/(?:www\.)?reddit\.com/gi,
        "https://rxddit.com"
      );

      return cleaned;
    }
  },
};
