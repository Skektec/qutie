module.exports = {
  execute: async (message) => {
    function delay(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    let cleaned = message.content;

    if (message.content.includes("http")) {
      cleaned = cleaned.replace(
        /(https?:\/\/(?:www\.)?reddit\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
        "https://rxddit.com$2"
      );

      cleaned = cleaned.replace(
        /(https?:\/\/(?:www\.)?x\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
        "https://fixupx.com$2"
      );

      if (cleaned === message.content) {
        return;
      } else {
        delay(1000);
        await message.suppressEmbeds(true);
        return cleaned;
      }
    }
  },
};
