import { writeFile } from 'fs/promises';
import getIncome from './getIncome';
import getROCE from './getROCE';
import getStocks from './getStocks';
import getPage from './getPage';

interface Details {
	name: string;
	price: number;
	roce: Record<number, number>;
	income: Record<number, number>;
}

const time = (t2: number, t1: number) => `${Math.round((t2 - t1) / 1000)}s`;

(async function () {
	const start = Date.now();
	const page = await getPage();

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

	// Close the browser.
	await page.browser().close();

	// Write the details into a JSON file.
	await writeFile('details.json', JSON.stringify(details, undefined, 4));
})();
