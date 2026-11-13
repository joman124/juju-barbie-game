// Usage: node scripts/shot.cjs <url-path> <out.png> [width] [height]
const { chromium } = require('playwright');
(async () => {
  const [, , path, out, w = '1500', h = '900'] = process.argv;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') console.log('console error:', m.text()); });
  page.on('pageerror', (e) => console.log('page error:', e.message));
  await page.goto('http://localhost:5173/' + path);
  await page.waitForTimeout(600);
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
})();
