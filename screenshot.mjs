import puppeteer from 'puppeteer';
import { readdir, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const OUT_DIR = join(__dirname, 'temporary screenshots');

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

if (!existsSync(OUT_DIR)) await mkdir(OUT_DIR, { recursive: true });

const existing = await readdir(OUT_DIR).catch(() => []);
const nums = existing
  .map(f => f.match(/^screenshot-(\d+)/))
  .filter(Boolean)
  .map(m => parseInt(m[1]));
const next = nums.length ? Math.max(...nums) + 1 : 1;

const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outPath = join(OUT_DIR, filename);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

// Force all reveals visible and trigger counters to their target values
await page.evaluate(() => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  document.querySelectorAll('[data-counter]').forEach(el => {
    const target = parseFloat(el.dataset.counter);
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(target).includes('.');
    el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
  });
});
await new Promise(r => setTimeout(r, 900));

await page.screenshot({ path: outPath, fullPage: true });
await browser.close();

console.log(`Saved: ${outPath}`);
