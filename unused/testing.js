import { load } from 'cheerio';

const response = await fetch(`https://warthunder.com/en/news/9753`);
const html = await response.text();
const $ = load(html);

console.log($('.g-col.g-col--100').eq(1).find('p').next('h2').text());
