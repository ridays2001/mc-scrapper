import bluebird from 'bluebird';
import { readFile, writeFile } from 'fs/promises';

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
const type = 'NIFTY-500' as StockType;

// TODO: read the JSON file and edit its contents rather than writing completely new.
async function main() {
	const details = await withBrowser(async browser => {
		const stocks = await withPage(browser)(page => getStocks(page, type));
		const start = Date.now();
		let i = 1;
		return bluebird.map(
			stocks,
			(stock, _, length) => {
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
}

async function convert() {
	const converted = [];
	const json = JSON.parse(await readFile(`details-${type}.json`, 'utf-8'));
	for (const company of json) {
		const data = {} as Record<string, any>;
		data.name = company.name;
		data.price = company.price;
		for (const r of company.roce) data[`roce-${r.year}`] = r.data;
		for (const i of company.income) data[`income-${i.year}`] = i.data;
		converted.push(data);
	}
	await writeFile(`details-converted-${type}.json`, JSON.stringify(converted, undefined, 4));
}
convert();
