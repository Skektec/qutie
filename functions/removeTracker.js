module.exports = {
    execute: async (message) => {
        function delay(time) {
            return new Promise((resolve) => setTimeout(resolve, time));
        }

        function suppressEmbed() {
            message.suppressEmbeds(true);
            delay(1000);
            message.suppressEmbeds(true);
        }

        let cleaned = message.content;

        if (message.content.includes('http')) {
            cleaned = cleaned.replace(
                /(https?:\/\/(?:www\.)?reddit\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
                'https://rxddit.com$2'
            );

            cleaned = cleaned.replace(
                /(https?:\/\/(?:www\.)?instagram\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
                'https://kkinstagram.com$2'
            );

            cleaned = cleaned.replace(
                /(https?:\/\/(?:www\.)?x\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
                'https://fixupx.com$2 ||'
            );

            // TODO: This can all be replaced with much simpler code
            // instead of trying to match the entire link I should look for (in twitter for example) the status/XXXXXXXXX/ and then just attach to that depending on the preceding message.

            if (cleaned === message.content) {

            } else {
                try {
                    suppressEmbed();
                    return `-# ${cleaned}`;
                } catch {
                    return `-# ${cleaned}`;
                }
            }
        } else {

        }
    }
};
