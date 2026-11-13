// Renders the app icons from the artwork. Needs the dev server running (npm run dev).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const out = path.join(process.cwd(), 'public', 'icons');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const [name, size] of [['icon-512.png', 512], ['icon-192.png', 192], ['apple-touch-icon.png', 180]]) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    await page.goto((process.env.BASE || 'http://localhost:5173/') + 'sheet.html?show=icon');
    await page.waitForTimeout(400);
    await page.addStyleTag({ content: '*{animation:none !important}' });
    await page.screenshot({ path: path.join(out, name) });
    await page.close();
  }
  await browser.close();
  console.log('icons written to', out);
})();
