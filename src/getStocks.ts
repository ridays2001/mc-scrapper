import type { Page } from 'puppeteer-core';

export type StockType = 'NIFTY-500' | 'MID-100' | 'SML-50';

const pageLinks: Record<StockType, string> = {
	'NIFTY-500': 'https://www.moneycontrol.com/markets/indian-indices/top-nse-500-companies-list/7',
	'MID-100': 'https://www.moneycontrol.com/markets/indian-indices/top-nsemidcap-100-companies-list/27',
	'SML-50': 'https://www.moneycontrol.com/markets/indian-indices/top-nsesmlcap-50-companies-list/113'
};

interface Stock {
	name: string;
	link: string;
	price: number;
}

async function getStocks(page: Page, type: StockType = 'NIFTY-500'): Promise<Array<Stock>> {
	const link = pageLinks[type];
	await page.goto(link, { waitUntil: 'domcontentloaded' });

	const stocks = await page.$$eval('#indicesTableData table tbody tr', stocks => {
		return stocks.map(s => ({
			name: s.children.item(0)?.textContent,
			link: (s.children.item(0)?.firstChild as HTMLAnchorElement).href,
			price: parseFloat((s.children.item(1)?.textContent as string).replace(/,/g, ''))
		}));
	});

	if (!stocks[0].price) {
		console.log('Something went wrong. Retrying...');
		return getStocks(page, type);
	}

	return stocks as Array<Stock>;
}

export default getStocks;
