import type { Page } from 'puppeteer-core';

async function get5YearData(page: Page) {
	// The first row of the table has information on all the years.
	const years = await page.$eval('#new-format table tbody tr:first-child', tr => {
		const yrs = [] as Array<number>;
		for (let i = 1; i <= 5; i++) {
			const yr = tr.children.item(i)?.textContent as string;
			if (yr == undefined) break;
			yrs.push(parseInt(yr.replace(/[^0-9]/g, ''), 10));
		}
		return yrs;
	});

	// The 20th row of the table has ROCE information.
	const income = await page.$eval('#new-format table tbody tr:nth-child(4)', tr => {
		const inc = [] as Array<number>;
		for (let i = 1; i <= 5; i++) {
			const data = tr.children.item(i)?.textContent as string;
			if (data == undefined) break;
			inc.push(parseFloat(data.replace(/,/g, '')));
		}
		return inc;
	});

	const data = {} as Record<number, number>;
	for (let i = 0; i < years.length; i++) {
		data[years[i]] = income[i];
	}

	return data;
}

async function getIncome(page: Page, link: string) {
	await page.goto(link, { waitUntil: 'domcontentloaded' });
	const yearlyLink = await page.$eval(
		'#consolidated li a[title="Yearly Results"]',
		el => (el as HTMLAnchorElement).href
	);

	await page.goto(yearlyLink, { waitUntil: 'domcontentloaded' });

	// Get data of first 5 years.
	const data1 = await get5YearData(page);

	const yearlyLink2 = await page.$eval('ul.pagination li:last-child a', el => (el as HTMLAnchorElement).href);

	if (!yearlyLink2 || !yearlyLink2.startsWith('https://')) return data1;

	await page.goto(yearlyLink2, { waitUntil: 'domcontentloaded' });

	// Get data of next 5 years.
	const data2 = await get5YearData(page);

	// Merge both into one object.
	const data = { ...data1, ...data2 };
	return data;
}

export default getIncome;
