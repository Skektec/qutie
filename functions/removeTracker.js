module.exports = {
	execute: async (message) => {
		function delay(time) {
			return new Promise((resolve) => setTimeout(resolve, time));
		}

		let cleaned = message.content;

		if (message.content.includes('http')) {
			cleaned = cleaned.replace(
				/(https?:\/\/(?:www\.)?reddit\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
				'https://rxddit.com$2'
			);

			cleaned = cleaned.replace(
				/(https?:\/\/(?:www\.)?instagram\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
				'https://uuinstagram.com$2'
			);

			cleaned = cleaned.replace(
				/(https?:\/\/(?:www\.)?x\.com(\/[\w\/.-]+))(?:\?[^\s]*)?/gi,
				'https://fixupx.com$2'
			);

			if (cleaned === message.content) {
				return;
			} else {
				try {
					await message.suppressEmbeds(true);
					delay(600);
					return `-# ${cleaned}`;
				} catch {
					return `-# ${cleaned}`;
				}
			}
		} else {
			return;
		}
	}
};
