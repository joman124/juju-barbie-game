// Dev helper: drive the game with touch input and save screenshots.
// Usage: node scripts/play.cjs <scenario> [landscape|portrait]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = process.env.SHOTS || path.join(process.cwd(), 'shots');
const BASE = process.env.BASE || 'http://localhost:5173/';
const [, , scenario = 'tour', orient = 'landscape'] = process.argv;
const size = orient === 'portrait' ? { width: 768, height: 1024 } : { width: 1024, height: 768 };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGE ERROR: ' + e.message));
  const shot = async (name) => { await page.screenshot({ path: path.join(OUT, `${orient}-${name}.png`) }); };
  const tap = async (sel, nth = 0) => {
    // Buttons pulse and wobble, so tap by position instead of waiting for them to hold still.
    const box = await page.locator(sel).nth(nth).boundingBox();
    if (!box) throw new Error('not found: ' + sel);
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  };
  await page.goto(BASE);
  await page.waitForTimeout(700);

  if (scenario === 'tour') {
    await shot('01-title');
    await tap('.btn-play'); await page.waitForTimeout(900);
    await shot('02-pick');
    await tap('.card', Number(process.env.DOLL || 0)); await page.waitForTimeout(1300);
    await shot('03-studio');
    await tap('.tile', 4); await page.waitForTimeout(500);
    await tap('.subtab', 2); await page.waitForTimeout(500);
    await tap('.tile', 3); await page.waitForTimeout(600);
    await shot('04-dress');
    await tap('.tab', 1); await page.waitForTimeout(400);
    await tap('.tile', 1); await page.waitForTimeout(500);
    await shot('05-acc');
    await tap('.tab', 2); await page.waitForTimeout(700);
    await tap('.tile', 4); await page.waitForTimeout(600);
    await shot('06-hair');
    await tap('.subtab', 1); await page.waitForTimeout(400);
    await tap('.tile', 4); await page.waitForTimeout(600);
    await shot('07-haircolor');
    await tap('.tab', 3); await page.waitForTimeout(700);
    await tap('.tile', 2); await page.waitForTimeout(400);
    await tap('.subtab', 1); await page.waitForTimeout(400);
    await tap('.tile', 1); await page.waitForTimeout(600);
    await shot('08-makeup');
    await tap('.tab', 4); await page.waitForTimeout(700);
    await tap('.tile', 2); await page.waitForTimeout(400);
    await tap('.subtab', 1); await page.waitForTimeout(400);
    await tap('.tile', 3); await page.waitForTimeout(600);
    await shot('09-nails');
    await tap('.tab', 5); await page.waitForTimeout(500);
    await tap('.tile', 3); await page.waitForTimeout(600);
    await shot('10-pets');
    await tap('.btn-show'); await page.waitForTimeout(1200);
    await shot('11-show-curtain');
    await page.waitForTimeout(2300);
    await shot('12-show-far');
    await page.waitForTimeout(2600);
    await page.touchscreen.tap(300, 300);
    await page.waitForTimeout(250);
    await shot('13-show-mid');
    await page.waitForTimeout(3400);
    await shot('14-show-near');
    await page.waitForTimeout(1500);
    await shot('15-show-wave');
    await page.waitForTimeout(2200);
    await shot('16-show-photo');
    await page.waitForTimeout(2000);
    await shot('17-show-end');
    await tap('.book-btn'); await page.waitForTimeout(800);
    await shot('18-lookbook');
    await tap('.look-card'); await page.waitForTimeout(700);
    await shot('19-detail');
  }
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  else console.log('no console errors');
  await browser.close();
})();
