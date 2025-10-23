import { load } from 'cheerio';

const response = await fetch(`https://warthunder.com/en/game/changelog/current/1796`);
const html = await response.text();
const $ = load(html);

try {
	let headings = [];
	let changesBlock = [];

	$('.g-col.g-col--100')
		.eq(1)
		.find('h2')
		.each((index, element) => {
			const item = $(element).text().trim();
			headings.push(item);
		});

	function getInfo(item) {
		let text = [];

		$(`h2:contains(${item})`)
			.next('ul')
			.find('li')
			.each((index, element) => {
				const item = $(element).text().trim();
				text.push(item);
			});

		const heading = item;
		const block = {
			heading,
			text
		};
		changesBlock.push(block);
	}

	headings.forEach((item) => getInfo(item));

	console.log(changesBlock);
} catch (error) {
	console.log('error', error);
}
