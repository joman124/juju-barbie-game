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
  // LESSON=0 skips the first-time walkthrough so the pointing hand stays out of the pictures.
  if (process.env.LESSON === '0') await ctx.addInitScript(() => { localStorage.setItem('jfs.flag.lesson', 'true'); localStorage.setItem('jfs.flag.tapped', 'true'); });
  await page.goto(BASE);
  await page.waitForTimeout(700);

  if (scenario === 'tour') {
    await shot('01-title');
    await tap('.btn-play'); await page.waitForTimeout(900);
    await shot('02-pick');
    await tap('.card', Number(process.env.DOLL || 0)); await page.waitForTimeout(1300);
    await shot('03-studio');
    await tap('.tile', 4); await page.waitForTimeout(500);
    await tap('.cat', 2); await page.waitForTimeout(500);
    await tap('.tile', 3); await page.waitForTimeout(600);
    await shot('04-dress');
    await tap('.cat', 4); await page.waitForTimeout(700);
    await tap('.tile', 1); await page.waitForTimeout(500);
    await shot('05-hats');
    await tap('.cat', 5); await page.waitForTimeout(500);
    await tap('.tile', 4); await page.waitForTimeout(300);
    await tap('.tile', 11); await page.waitForTimeout(500);
    await shot('05b-extras');
    await tap('.cat', 6); await page.waitForTimeout(700);
    await tap('.tile', 4); await page.waitForTimeout(600);
    await shot('06-hair');
    await tap('.cat', 7); await page.waitForTimeout(400);
    await tap('.tile', 6); await page.waitForTimeout(600);
    await shot('07-haircolor');
    await tap('.cat', 8); await page.waitForTimeout(700);
    await tap('.tile', 2); await page.waitForTimeout(400);
    await tap('.tile', 9); await page.waitForTimeout(600);
    await shot('08-makeup');
    await tap('.cat', 9); await page.waitForTimeout(500);
    await tap('.tile', 4); await page.waitForTimeout(500);
    await shot('08b-cheeks');
    await tap('.cat', 10); await page.waitForTimeout(700);
    await tap('.tile', 2); await page.waitForTimeout(400);
    await tap('.tile', 11); await page.waitForTimeout(600);
    await shot('09-nails');
    await tap('.cat', 11); await page.waitForTimeout(500);
    await tap('.tile', 3); await page.waitForTimeout(600);
    await shot('10-pets');
    await tap('.btn-show');
    const at = async (ms, name, before) => { await page.waitForTimeout(ms); if (before) await before(); await shot(name); };
    await at(1200, '11-show-curtain');
    await at(2900, '12-show-walk');
    await at(3400, '13-show-facecam');
    await at(2600, '14-show-walk2', async () => { await page.touchscreen.tap(300, 300); await page.waitForTimeout(200); });
    await at(2300, '15-show-bigmove');
    await at(1900, '16-show-nailcam');
    await at(2300, '17-show-finale');
    await at(4200, '18-show-end');
    await tap('.save-btn'); await page.waitForTimeout(1300);
    await shot('19-show-saved');
    await tap('.save-btn'); await page.waitForTimeout(800);
    await shot('20-lookbook');
    await tap('.look-card'); await page.waitForTimeout(700);
    await shot('21-detail');
  }
  if (scenario === 'starters') {
    // Every doll in her starter look: straight to the runway, frames along the way.
    for (let d = 0; d < 6; d++) {
      await tap('.btn-play'); await page.waitForTimeout(800);
      await tap('.card', d); await page.waitForTimeout(1300);
      await shot(`s${d}-studio`);
      await tap('.btn-show'); await page.waitForTimeout(4300);
      await shot(`s${d}-walk1`);
      await page.waitForTimeout(300);
      await shot(`s${d}-walk2`);
      await page.waitForTimeout(7900);
      await shot(`s${d}-bigmove`);
      await page.waitForTimeout(8500);
      await shot(`s${d}-end`);
      await tap('.save-btn'); await page.waitForTimeout(1200);
      await tap('.show-bar .btn', 3); await page.waitForTimeout(700);
      await tap('.corner-tl .btn'); await page.waitForTimeout(700);
    }
    await tap('.corner-bl .btn'); await page.waitForTimeout(800);
    await shot('book-grid');
  }
  if (scenario === 'surprise') {
    await tap('.btn-play'); await page.waitForTimeout(800);
    await tap('.card', Number(process.env.DOLL || 3)); await page.waitForTimeout(1300);
    for (let i = 0; i < 8; i++) {
      await tap('.stage-bar .btn', 1); await page.waitForTimeout(700);
      await shot(`surprise-${i}`);
    }
    await tap('.stage-bar .btn', 0); await page.waitForTimeout(700);
    await shot('surprise-reset');
  }
  if (scenario === 'hint') {
    await page.waitForTimeout(6600);
    await shot('hint-title');
    await tap('.btn-play'); await page.waitForTimeout(7200);
    await shot('hint-pick');
  }
  if (scenario === 'gate') {
    // Make a look, open it in the lookbook, hold the grown-up lock, save and delete.
    await tap('.btn-play'); await page.waitForTimeout(800);
    await tap('.card', 4); await page.waitForTimeout(1300);
    await tap('.btn-show'); await page.waitForTimeout(21500);
    console.log('looks before tapping the heart:', await page.evaluate(() => JSON.parse(localStorage.getItem('jfs.looks.v1') || '[]').length));
    await tap('.save-btn'); await page.waitForTimeout(1300);
    console.log('looks after tapping the heart:', await page.evaluate(() => JSON.parse(localStorage.getItem('jfs.looks.v1') || '[]').length));
    await tap('.save-btn'); await page.waitForTimeout(800);
    await tap('.look-card'); await page.waitForTimeout(700);
    const box = await page.locator('.grown-lock').boundingBox();
    // a quick tap must NOT open the grown-up panel
    await page.touchscreen.tap(box.x + 30, box.y + 30); await page.waitForTimeout(500);
    console.log('panel after quick tap:', await page.locator('.grown.on').count());
    await page.mouse.move(box.x + 30, box.y + 30); await page.mouse.down(); await page.waitForTimeout(1500);
    await shot('gate-holding');
    await page.waitForTimeout(1900); await page.mouse.up(); await page.waitForTimeout(400);
    console.log('panel after 3s hold:', await page.locator('.grown.on').count());
    await shot('gate-open');
    const png = await page.evaluate(async () => {
      const m = await import('/src/photo.ts');
      const s = JSON.parse(localStorage.getItem('jfs.looks.v1'));
      const blob = await m.lookPng(s[0].look);
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = ''; for (const b of buf) bin += String.fromCharCode(b);
      return { size: blob.size, type: blob.type, b64: btoa(bin) };
    });
    fs.writeFileSync(path.join(OUT, 'saved-picture.png'), Buffer.from(png.b64, 'base64'));
    console.log('png bytes:', png.size, png.type);
    const [download] = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), tap('.grown-btn', 0)]);
    console.log('save produced a file:', download ? download.suggestedFilename() : 'no');
    await page.waitForTimeout(500);
    await tap('.grown-btn', 1); await page.waitForTimeout(600);
    console.log('looks left after delete:', await page.locator('.look-card').count());
    await shot('gate-after-delete');
  }
  if (errors.length) console.log('ERRORS:\n' + errors.join('\n'));
  else console.log('no console errors');
  await browser.close();
})();
