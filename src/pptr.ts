/*
 * References:
 * https://www.bannerbear.com/blog/ways-to-speed-up-puppeteer-screenshots/ - For puppeteer optimization.
 * https://advancedweb.hu/how-to-speed-up-puppeteer-scraping-with-parallelization/ - For parallelization guide.
 */

import type { Browser, Page } from 'puppeteer-core';
import pptr from 'puppeteer-core';

const minimalArgs = [
	'--autoplay-policy=user-gesture-required',
	'--disable-background-networking',
	'--disable-background-timer-throttling',
	'--disable-backgrounding-occluded-windows',
	'--disable-breakpad',
	'--disable-client-side-phishing-detection',
	'--disable-component-update',
	'--disable-default-apps',
	'--disable-dev-shm-usage',
	'--disable-domain-reliability',
	'--disable-extensions',
	'--disable-features=AudioServiceOutOfProcess',
	'--disable-hang-monitor',
	'--disable-ipc-flooding-protection',
	'--disable-notifications',
	'--disable-offer-store-unmasked-wallet-cards',
	'--disable-popup-blocking',
	'--disable-print-preview',
	'--disable-prompt-on-repost',
	'--disable-renderer-backgrounding',
	'--disable-setuid-sandbox',
	'--disable-speech-api',
	'--disable-sync',
	'--hide-scrollbars',
	'--ignore-gpu-blacklist',
	'--metrics-recording-only',
	'--mute-audio',
	'--no-default-browser-check',
	'--no-first-run',
	'--no-pings',
	'--no-sandbox',
	'--no-zygote',
	'--password-store=basic',
	'--use-mock-keychain'
];
const blockedDomains = ['googlesyndication.com', 'adservice.google.com'];
const disabledResources = ['image', 'imageset', 'media', 'object', 'stylesheet'];

export const withBrowser = async <T>(fn: (browser: Browser) => T) => {
	const browser = await pptr.launch({ channel: 'chrome', headless: true, args: minimalArgs, userDataDir: './pptr' });

	try {
		return await fn(browser);
	} finally {
		await browser.close();
	}
};

export const withPage =
	(browser: Browser) =>
	async <T>(fn: (page: Page) => T) => {
		const page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on('request', req => {
			if (disabledResources.includes(req.resourceType())) req.abort();
			else if (blockedDomains.some(domain => req.url().includes(domain))) req.abort();
			else req.continue();
		});

		try {
			return await fn(page);
		} finally {
			await page.close();
		}
	};
