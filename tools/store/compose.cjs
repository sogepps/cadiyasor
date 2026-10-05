/**
 * Builds the Google Play store graphics for every Play locale.
 *
 *   node tools/store/compose.cjs [--only de-DE,tr-TR]
 *
 * Inputs
 *   tools/store/raw/<locale>/<screen>.png   emulator captures from capture.cjs
 *   src/i18n/ui/<locale>.json               app name and tagline
 *   listing: tools/tx/out/<locale>/listing.json (en/tr: tools/tx/src/listing.<en|tr>.json)
 *
 * Output (one folder per Play locale, the layout play-upload.cjs reads)
 *   Desktop/CadiyaSor-GooglePlay/<play>/uygulama-adi.txt, kisa-aciklama.txt, tam-aciklama.txt,
 *   ozellik-grafik-1024x500.png, ekran-goruntuleri/01.png … 06.png
 *
 * Pages are laid out in HTML and rendered by the installed Chrome (puppeteer-core): Chrome shapes
 * every script correctly and loads the app's own fonts.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const puppeteer = require('puppeteer-core');

const ROOT = path.join(__dirname, '..', '..');
const TX = path.join(ROOT, 'tools/tx');
const RAW = path.join(__dirname, 'raw');
const TMP = path.join(__dirname, 'tmp');
const OUT = process.env.STORE_OUT || 'C:/Users/Nilvera/Desktop/CadiyaSor-GooglePlay';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SCREENS = ['home', 'cauldron', 'book', 'ball', 'omen', 'journal'];

/** Play Console listing language → the app locale whose texts and captures it uses. */
const PLAY = {
  af: 'af', sq: 'sq', am: 'am', ar: 'ar', 'hy-AM': 'hy', 'az-AZ': 'az', 'bn-BD': 'bn', 'eu-ES': 'eu', be: 'be',
  bg: 'bg', 'my-MM': 'my', ca: 'ca', 'zh-HK': 'zh-HK', 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', hr: 'hr', 'cs-CZ': 'cs',
  'da-DK': 'da', 'nl-NL': 'nl', 'en-AU': 'en', 'en-CA': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-IN': 'en',
  'en-SG': 'en', 'en-ZA': 'en', et: 'et', fil: 'fil', 'fi-FI': 'fi', 'fr-CA': 'fr-CA', 'fr-FR': 'fr-FR',
  'gl-ES': 'gl', 'ka-GE': 'ka', 'de-DE': 'de', 'el-GR': 'el', gu: 'gu', 'iw-IL': 'he', 'hi-IN': 'hi',
  'hu-HU': 'hu', 'is-IS': 'is', id: 'id', 'it-IT': 'it', 'ja-JP': 'ja', 'kn-IN': 'kn', kk: 'kk', 'km-KH': 'km',
  'ko-KR': 'ko', 'ky-KG': 'ky', 'lo-LA': 'lo', lv: 'lv', lt: 'lt', 'mk-MK': 'mk', 'ms-MY': 'ms', ms: 'ms',
  'ml-IN': 'ml', 'mr-IN': 'mr', 'mn-MN': 'mn', 'ne-NP': 'ne', 'no-NO': 'no', fa: 'fa', 'fa-AE': 'fa',
  'fa-AF': 'fa', 'fa-IR': 'fa', 'pl-PL': 'pl', 'pt-BR': 'pt-BR', 'pt-PT': 'pt-PT', pa: 'pa', ro: 'ro', rm: 'rm',
  'ru-RU': 'ru', sr: 'sr', 'si-LK': 'si', sk: 'sk', sl: 'sl', 'es-419': 'es-419', 'es-ES': 'es-ES',
  'es-US': 'es-419', sw: 'sw', 'sv-SE': 'sv', 'ta-IN': 'ta', 'te-IN': 'te', th: 'th', 'tr-TR': 'tr', uk: 'uk',
  ur: 'ur', vi: 'vi',
};

/** Cinzel Decorative covers these (titles); Cormorant Garamond also covers Cyrillic and Vietnamese. */
const LATIN = new Set([
  'en', 'tr', 'es-419', 'es-ES', 'pt-BR', 'pt-PT', 'fr-FR', 'fr-CA', 'de', 'it', 'nl', 'pl', 'id', 'ms', 'fil', 'af',
  'sq', 'eu', 'ca', 'hr', 'cs', 'da', 'et', 'fi', 'gl', 'hu', 'is', 'lv', 'lt', 'no', 'ro', 'rm', 'sk', 'sl', 'sw', 'sv', 'az',
]);
const CORMORANT = new Set([...LATIN, 'ru', 'uk', 'be', 'bg', 'mk', 'sr', 'kk', 'ky', 'mn', 'vi']);
const RTL = new Set(['ar', 'fa', 'ur', 'he']);

function scriptFont(locale) {
  if (CORMORANT.has(locale)) return "'Cormorant Garamond'";
  const map = {
    'zh-CN': "'Microsoft YaHei'", 'zh-TW': "'Microsoft JhengHei'", 'zh-HK': "'Microsoft JhengHei'",
    ja: "'Yu Gothic'", ko: "'Malgun Gothic'", th: "'Leelawadee UI'", lo: "'Noto Sans Lao'",
    km: "'Noto Sans Khmer'", si: "'Noto Sans Sinhala'", my: "'Myanmar Text'", am: "'Ebrima'",
    hi: "'Nirmala UI'", mr: "'Nirmala UI'", ne: "'Nirmala UI'", bn: "'Nirmala UI'", gu: "'Nirmala UI'",
    pa: "'Nirmala UI'", ta: "'Nirmala UI'", te: "'Nirmala UI'", kn: "'Nirmala UI'", ml: "'Nirmala UI'",
  };
  return map[locale] ?? "'Segoe UI'";
}

/** Turkish and Azerbaijani need a dotted capital İ, which the decorative cut draws poorly: plain Cinzel, upper-cased. */
const PLAIN_CAPS = new Set(['tr', 'az']);
const titleFontFor = (locale) => (PLAIN_CAPS.has(locale) ? "'Cinzel'" : LATIN.has(locale) ? "'Cinzel Decorative'" : scriptFont(locale));
const upperFor = (text, locale) => (PLAIN_CAPS.has(locale) ? String(text).toLocaleUpperCase(locale) : text);

const fileUrl = (p) => pathToFileURL(p).href;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const art = (name) => fileUrl(path.join(ROOT, 'assets/art', name));

function fontFaces() {
  const nm = path.join(ROOT, 'node_modules/@expo-google-fonts');
  const fsrc = path.join(__dirname, 'node_modules/@fontsource');
  const face = (family, file, weight, style = 'normal') =>
    `@font-face{font-family:'${family}';src:url('${fileUrl(file)}');font-weight:${weight};font-style:${style};}`;
  return [
    face('Cinzel Decorative', path.join(nm, 'cinzel-decorative/700Bold/CinzelDecorative_700Bold.ttf'), 700),
    face('Cinzel Decorative', path.join(nm, 'cinzel-decorative/900Black/CinzelDecorative_900Black.ttf'), 900),
    face('Cinzel', path.join(nm, 'cinzel/700Bold/Cinzel_700Bold.ttf'), 700),
    face('Cinzel', path.join(nm, 'cinzel/900Black/Cinzel_900Black.ttf'), 900),
    face('Cormorant Garamond', path.join(nm, 'cormorant-garamond/600SemiBold/CormorantGaramond_600SemiBold.ttf'), 600),
    face('Cormorant Garamond', path.join(nm, 'cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf'), 700),
    face('Cormorant Garamond', path.join(nm, 'cormorant-garamond/600SemiBold_Italic/CormorantGaramond_600SemiBold_Italic.ttf'), 600, 'italic'),
    face('Noto Sans Khmer', path.join(fsrc, 'noto-sans-khmer/files/noto-sans-khmer-khmer-700-normal.woff2'), 700),
    face('Noto Sans Lao', path.join(fsrc, 'noto-sans-lao/files/noto-sans-lao-lao-700-normal.woff2'), 700),
    face('Noto Sans Sinhala', path.join(fsrc, 'noto-sans-sinhala/files/noto-sans-sinhala-sinhala-700-normal.woff2'), 700),
  ].join('\n');
}

/** Shrinks every [data-fit] element until it fits its box in at most N lines. */
const FIT_SCRIPT = `
  for (const el of document.querySelectorAll('[data-fit]')) {
    const maxLines = Number(el.dataset.lines || 2);
    let size = parseFloat(getComputedStyle(el).fontSize);
    const lh = () => parseFloat(getComputedStyle(el).lineHeight) || size * 1.1;
    while (size > 18 && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > lh() * maxLines + 2)) {
      size -= 2; el.style.fontSize = size + 'px';
    }
  }
  window.__fitted = true;`;

const ACCENTS = ['#f2c14e', '#6dffb0', '#ff9ad5', '#9ad8ff', '#ffd98a', '#c9a8ff'];

function stars(n, w, h, seed) {
  let s = seed;
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: n }, () => {
    const size = r() < 0.15 ? 4 + r() * 3 : 1.5 + r() * 2;
    return `<i style="left:${(r() * w).toFixed(0)}px;top:${(r() ** 1.5 * h).toFixed(0)}px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;opacity:${(0.35 + r() * 0.65).toFixed(2)}"></i>`;
  }).join('');
}

function shotHtml({ locale, index, title, sub, raw }) {
  const latin = LATIN.has(locale);
  const rtl = RTL.has(locale);
  const accent = ACCENTS[index % ACCENTS.length];
  const titleFont = titleFontFor(locale);
  const bodyFont = scriptFont(locale);
  const subStyle = CORMORANT.has(locale) ? 'font-style:italic;font-weight:600;font-size:60px' : 'font-weight:700;font-size:48px';
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
${fontFaces()}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#070514}
body{position:relative;font-family:${bodyFont},'Segoe UI',sans-serif;color:#f3ecff}
.bg{position:absolute;inset:0;background:
  radial-gradient(ellipse 700px 600px at 50% 110%, ${accent}40, transparent 70%),
  linear-gradient(180deg,#070514 0%,#150c34 40%,#2c1757 80%,#3b1f63 100%)}
.stars i{position:absolute;border-radius:50%;background:#efe9ff;box-shadow:0 0 6px #fff}
.moon{position:absolute;right:70px;top:90px;width:170px;height:170px;border-radius:50%;background:url('${art('moon.png')}') center/cover;
  box-shadow:0 0 70px 24px rgba(255,246,216,.35)}
.cap{position:absolute;left:80px;right:80px;top:80px;height:360px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:18px}
.title{width:100%;font-family:${titleFont},serif;font-weight:${latin ? 900 : 800};font-size:${latin ? 108 : 100}px;line-height:${latin ? 1.08 : 1.2};
  background:linear-gradient(180deg,#fff6d6 0%,${accent} 55%,#c98a1c 100%);-webkit-background-clip:text;background-clip:text;color:transparent;
  filter:drop-shadow(0 0 20px ${accent}77) drop-shadow(0 5px 0 rgba(0,0,0,.5));overflow-wrap:anywhere;text-wrap:balance}
.sub{width:100%;text-wrap:balance;${subStyle};line-height:1.25;color:#f3ecff;opacity:.95;text-shadow:0 3px 14px rgba(0,0,0,.7)}
.phone{position:absolute;left:181px;top:470px;width:718px;height:1440px;border-radius:64px;background:#0b0816;
  box-shadow:0 0 0 3px rgba(242,193,78,.6),0 0 70px ${accent}66,0 40px 80px rgba(0,0,0,.7);padding:14px}
.screen{width:690px;height:1412px;border-radius:52px;overflow:hidden;position:relative;background:#000}
.screen img{width:100%;height:100%;object-fit:cover;object-position:top;display:block}
.cam{position:absolute;top:26px;left:50%;width:22px;height:22px;margin-left:-11px;border-radius:50%;background:#050505;box-shadow:inset 0 0 0 3px #1a1a1a}
</style></head><body>
<div class="bg"></div><div class="stars">${stars(60, 1080, 700, index + 7)}</div>
<div class="cap" style="${locale === 'ja' ? 'word-break:auto-phrase' : ''}"><div class="title" dir="${rtl ? 'rtl' : 'ltr'}" data-fit data-lines="2">${esc(upperFor(title, locale))}</div><div class="sub" dir="${rtl ? 'rtl' : 'ltr'}" data-fit data-lines="2">${esc(sub)}</div></div>
<div class="phone"><div class="screen"><img src="${fileUrl(raw)}"></div><div class="cam"></div></div>
<script>document.fonts.ready.then(()=>{${FIT_SCRIPT}})</script>
</body></html>`;
}

function featureHtml({ locale, name, tagline, slogan }) {
  const latin = LATIN.has(locale);
  const rtl = RTL.has(locale);
  const titleFont = titleFontFor(locale);
  const bodyFont = scriptFont(locale);
  const side = rtl ? 'left' : 'right';
  const textSide = rtl ? 'right' : 'left';
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><style>
${fontFaces()}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1024px;height:500px;overflow:hidden;background:#070514}
body{position:relative;font-family:${bodyFont},'Segoe UI',sans-serif;color:#f3ecff}
.bg{position:absolute;inset:0;background:radial-gradient(ellipse 520px 420px at ${rtl ? '22%' : '78%'} 60%, rgba(109,255,176,.28), transparent 70%),linear-gradient(180deg,#070514 0%,#1b0f40 55%,#3b1f63 100%)}
.stars i{position:absolute;border-radius:50%;background:#efe9ff;box-shadow:0 0 6px #fff}
.moon{position:absolute;${side}:250px;top:26px;width:150px;height:150px;border-radius:50%;background:url('${art('moon.png')}') center/cover;box-shadow:0 0 60px 20px rgba(255,246,216,.35)}
.hills{position:absolute;left:0;right:0;bottom:-40px;height:260px;background:url('${art('hills.png')}') center bottom/100% 100% no-repeat;opacity:.9}
.witch{position:absolute;${side}:40px;bottom:-40px;width:380px;height:475px;background:url('${art('witch.png')}') center/contain no-repeat}
.pot{position:absolute;${side}:95px;bottom:-26px;width:270px;height:252px;background:url('${art('cauldron.png')}') center/contain no-repeat}
.potion{position:absolute;${side}:${95 + 270 * (104 / 600)}px;bottom:${-26 + 252 * (1 - 184 / 560)}px;width:${270 * (392 / 600)}px;height:${270 * (68 / 600)}px;border-radius:50%;
  background:radial-gradient(#e2ffef,#3fe08d 55%,#0f6a3e);box-shadow:0 0 40px 14px rgba(109,255,176,.55)}
.text{position:absolute;${textSide}:56px;top:60px;width:520px;display:flex;flex-direction:column;gap:12px;text-align:${rtl ? 'right' : 'left'}}
.name{font-family:${titleFont},serif;font-weight:${latin ? 900 : 800};font-size:${latin ? 78 : 72}px;line-height:1.08;
  background:linear-gradient(180deg,#fff6d6,#f2c14e 60%,#c98a1c);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 18px rgba(242,193,78,.5))}
.tag{font-size:38px;${CORMORANT.has(locale) ? 'font-style:italic;font-weight:600' : 'font-weight:700'};color:#f3ecff;opacity:.95}
.slogan{margin-top:14px;align-self:${rtl ? 'flex-end' : 'flex-start'};padding:12px 26px;border-radius:999px;background:rgba(16,8,36,.75);border:2px solid rgba(242,193,78,.6);
  font-weight:700;font-size:32px;color:#ffe4a0;white-space:nowrap;max-width:520px}
</style></head><body>
<div class="bg"></div><div class="stars">${stars(45, 1024, 330, 3)}</div><div class="moon"></div><div class="hills"></div>
<div class="witch"></div><div class="pot"></div><div class="potion"></div>
<div class="text" dir="${rtl ? 'rtl' : 'ltr'}"><div class="name" data-fit data-lines="2">${esc(upperFor(name, locale))}</div><div class="tag" data-fit data-lines="1">${esc(tagline)}</div><div class="slogan" data-fit data-lines="1">${esc(slogan)}</div></div>
<script>document.fonts.ready.then(()=>{${FIT_SCRIPT}})</script>
</body></html>`;
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

function textsFor(locale) {
  const ui = readJson(path.join(ROOT, `src/i18n/ui/${locale}.json`));
  const listingPath = ['en', 'tr'].includes(locale) ? path.join(TX, `src/listing.${locale}.json`) : path.join(TX, `out/${locale}/listing.json`);
  return { ui, listing: readJson(listingPath) };
}

async function render(browser, html, file, width, height, out) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(fileUrl(file), { waitUntil: 'load' });
  await page.waitForFunction('window.__fitted === true', { timeout: 20000 });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await page.screenshot({ path: out, type: 'png', clip: { x: 0, y: 0, width, height } });
  await page.close();
}

async function main() {
  const args = process.argv.slice(2);
  const onlyArg = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';
  const only = onlyArg.split(',').filter(Boolean);
  const plays = Object.keys(PLAY).filter((p) => !only.length || only.includes(p));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--hide-scrollbars', '--allow-file-access-from-files', '--font-render-hinting=none'],
    userDataDir: path.join(TMP, 'chrome-profile'),
  });

  const rendered = new Map();
  let done = 0;
  for (const play of plays) {
    const locale = PLAY[play];
    const dest = path.join(OUT, play);
    const shotsDir = path.join(dest, 'ekran-goruntuleri');
    fs.mkdirSync(shotsDir, { recursive: true });
    const { ui, listing } = textsFor(locale);

    fs.writeFileSync(path.join(dest, 'uygulama-adi.txt'), listing.title.trim() + '\n');
    fs.writeFileSync(path.join(dest, 'kisa-aciklama.txt'), listing.short.trim() + '\n');
    fs.writeFileSync(path.join(dest, 'tam-aciklama.txt'), listing.full.trim() + '\n');

    if (!rendered.has(locale)) {
      const base = path.join(TMP, 'png', locale);
      for (let i = 0; i < SCREENS.length; i++) {
        const raw = path.join(RAW, locale, `${SCREENS[i]}.png`);
        if (!fs.existsSync(raw)) throw new Error(`missing capture ${raw}`);
        const shot = listing.shots[i];
        await render(browser, shotHtml({ locale, index: i, title: shot.title, sub: shot.sub, raw }), path.join(TMP, 'html', locale, `${i + 1}.html`), 1080, 1920, path.join(base, `0${i + 1}.png`));
      }
      await render(
        browser,
        featureHtml({ locale, name: ui['app.name'], tagline: ui['app.tagline'], slogan: listing.feature }),
        path.join(TMP, 'html', locale, 'feature.html'),
        1024,
        500,
        path.join(base, 'feature.png'),
      );
      rendered.set(locale, base);
    }

    const base = rendered.get(locale);
    for (let i = 1; i <= SCREENS.length; i++) fs.copyFileSync(path.join(base, `0${i}.png`), path.join(shotsDir, `0${i}.png`));
    fs.copyFileSync(path.join(base, 'feature.png'), path.join(dest, 'ozellik-grafik-1024x500.png'));
    done++;
    console.log(`${String(done).padStart(2)}/${plays.length} ${play} (${locale})`);
  }
  await browser.close();
  fs.copyFileSync(path.join(ROOT, 'store/icon-512.png'), path.join(OUT, 'uygulama-simgesi-512.png'));
  console.log(`written to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
