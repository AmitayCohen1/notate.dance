import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:3002/';
const out = process.argv[3] || 'shot.png';
const clicks = (process.argv[4] || '').split(',').filter(Boolean);

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
await page.goto(url, { waitUntil: 'networkidle' });
for (const sel of clicks) {
  try { await page.getByText(sel, { exact: false }).first().click({ timeout: 2000 }); }
  catch (e) { console.log('click failed:', sel, e.message); }
  await page.waitForTimeout(400);
}
await page.waitForTimeout(600);
await page.screenshot({ path: out, fullPage: true });
console.log('errors:', errors.length ? JSON.stringify(errors, null, 2) : 'none');
await browser.close();
