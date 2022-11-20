import bluebird from 'bluebird';
import { writeFile } from 'fs/promises';

import getIncome from './getIncome';
import getROCE from './getROCE';
import type { StockType } from './getStocks';
import getStocks from './getStocks';
import { withBrowser, withPage } from './pptr';

interface StockDetails {
	name: string;
	price: number;
	roce: Array<{ year: number; data: number }>;
	income: Array<{ year: number; data: number }>;
}

const time = (old: number) => `${Math.round((Date.now() - old) / 1000)}s`;

// Set the type of stocks you want to fetch.
const type = 'SML-50' as StockType;

(async function () {
	const details = await withBrowser(async browser => {
		const stocks = await withPage(browser)(page => getStocks(page, type));
		const start = Date.now();
		let i = 1;
		return bluebird.map(
			stocks,
			(stock, _j, length) => {
				return withPage(browser)(async page => {
					const t1 = Date.now();
					const roce = await getROCE(page, stock.link);
					const income = await getIncome(page, stock.link);

					console.log(`✅ (${i++}/${length}) ${stock.name} [Took: ${time(t1)} | Total: ${time(start)}]`);
					return {
						name: stock.name,
						price: stock.price,
						roce,
						income
					} as StockDetails;
				});
			},
			{ concurrency: 4 }
		);
	});

	// Write the details into a JSON file.
	await writeFile(`details-${type}.json`, JSON.stringify(details, undefined, 4));
})();
