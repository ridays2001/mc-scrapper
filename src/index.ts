import pptr from 'puppeteer-core';
import { writeFile } from 'fs/promises';
import getIncome from './getIncome';
import getROCE from './getROCE';
import getStocks from './getStocks';

interface Details {
	name: string;
	price: number;
	roce: Record<number, number>;
	income: Record<number, number>;
}

const time = (t2: number, t1: number) => `${Math.round((t2 - t1) / 1000)}s`;

const disabledResources = ['image', 'imageset', 'media', 'object', 'stylesheet'];
(async function () {
	const start = Date.now();
	const browser = await pptr.launch({ channel: 'chrome' });
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', req => {
		if (disabledResources.includes(req.resourceType())) req.abort();
		else req.continue();
	});

	const stocks = await getStocks(page, 'SML-50');
	const details = {} as Record<string, Details>;

	for (let i = 0; i < stocks.length; i++) {
		const t1 = Date.now();
		const stock = stocks[i];
		const roce = await getROCE(page, stock.link);
		const income = await getIncome(page, stock.link);
		details[stock.name] = {
			name: stock.name,
			price: stock.price,
			roce,
			income
		};
		const t2 = Date.now();
		console.log(`✅ (${i + 1}/${stocks.length}) ${stock.name} [Took: ${time(t2, t1)} | Total: ${time(t2, start)}]`);
	}
	await browser.close();
	await writeFile('details.json', JSON.stringify(details, undefined, 4));
})();
