import pptr from 'puppeteer-core';

// Chrome args for faster processing.
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
const disabledResources = ['image', 'imageset', 'media', 'object', 'stylesheet'];
const blockedDomains = ['googlesyndication.com', 'adservice.google.com'];

async function getPage() {
	const browser = await pptr.launch({ channel: 'chrome', headless: true, args: minimalArgs, userDataDir: './pptr' });
	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', req => {
		if (disabledResources.includes(req.resourceType())) req.abort();
		else if (blockedDomains.some(domain => req.url().includes(domain))) req.abort();
		else req.continue();
	});

	return page;
}

export default getPage;
