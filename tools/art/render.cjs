/**
 * Renders the hand-drawn SVG art to PNG with the installed Chrome.
 *
 *   node tools/art/render.cjs [name ...]       render src/<name>.svg (all when no name is given)
 *   node tools/art/render.cjs --preview name   also write out/<name>.preview.png on a dark backdrop
 *
 * Every SVG declares its own width/height; `data-scale` on the root <svg> sets the output
 * resolution (default 1). Output goes to assets/art/<name>.png unless `data-out` says otherwise.
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..', '..');
const SRC = path.join(__dirname, 'src');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const args = process.argv.slice(2);
const preview = args.includes('--preview');
const names = args.filter((a) => !a.startsWith('--'));
const all = fs
  .readdirSync(SRC)
  .filter((f) => /\.svg(\.cjs)?$/.test(f))
  .map((f) => f.replace(/\.svg(\.cjs)?$/, ''));
const todo = names.length ? names : all;

/** A piece is either a plain src/<name>.svg or a generator src/<name>.svg.cjs exporting the SVG string. */
function load(name) {
  const plain = path.join(SRC, `${name}.svg`);
  if (fs.existsSync(plain)) return fs.readFileSync(plain, 'utf8');
  const gen = path.join(SRC, `${name}.svg.cjs`);
  delete require.cache[require.resolve(gen)];
  return require(gen);
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-color-profile=srgb'] });
  const page = await browser.newPage();
  for (const name of todo) {
    const svg = load(name);
    const w = Number(svg.match(/<svg[^>]*\swidth="(\d+)"/)[1]);
    const h = Number(svg.match(/<svg[^>]*\sheight="(\d+)"/)[1]);
    const scale = Number(svg.match(/<svg[^>]*\sdata-scale="([\d.]+)"/)?.[1] ?? 1);
    const outRel = svg.match(/<svg[^>]*\sdata-out="([^"]+)"/)?.[1] ?? `assets/art/${name}.png`;
    const out = path.join(ROOT, outRel);
    fs.mkdirSync(path.dirname(out), { recursive: true });

    await page.setViewport({ width: w, height: h, deviceScaleFactor: scale });
    const html = (bg) =>
      `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:${bg};}svg{display:block}</style></head><body>${svg}</body></html>`;
    await page.setContent(html('transparent'), { waitUntil: 'load' });
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    if (preview) {
      await page.setContent(html('#1b1233'), { waitUntil: 'load' });
      await page.screenshot({ path: path.join(__dirname, 'out', `${name}.preview.png`), clip: { x: 0, y: 0, width: w, height: h } });
    }
    console.log(`${name} → ${path.relative(ROOT, out)} (${w * scale}×${h * scale})`);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
