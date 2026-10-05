/**
 * Composes art pieces on a night sky to judge them together.
 *
 *   node tools/art/preview.cjs <scene.html> <out.png> [width] [height]
 */
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const [html, out, w = 540, h = 1170] = process.argv.slice(2);

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--allow-file-access-from-files'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: Number(w), height: Number(h), deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve(html)).href, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: out });
  await browser.close();
})();
