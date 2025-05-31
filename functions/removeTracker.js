module.exports = {
  execute: async (message) => {
    let cleaned = message.content;

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
  },
};
