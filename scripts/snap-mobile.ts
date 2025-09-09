import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/sports', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'snap-sports-mobile.png', fullPage: false });
  await browser.close();
})();