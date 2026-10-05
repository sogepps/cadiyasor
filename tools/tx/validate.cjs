/**
 * Validates one locale's oracle content, UI strings and store listing.
 *
 *   node tools/tx/validate.cjs <set> [content|ui|listing|all]
 *
 * Prints OK when the files pass. Errors must be fixed; warnings are for a human to look at.
 */
const fs = require('fs');
const path = require('path');

const TX = __dirname;
const [set, what = 'all'] = process.argv.slice(2);
const sets = JSON.parse(fs.readFileSync(path.join(TX, 'sets.json'), 'utf8'));
if (!set || !sets[set]) {
  console.error(`usage: node tools/tx/validate.cjs <set> [content|ui|listing|all]\nsets: ${Object.keys(sets).join(' ')}`);
  process.exit(2);
}

const errors = [];
const warnings = [];
const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    errors.push(`${path.relative(TX, file)}: not valid JSON (${e.message})`);
    return null;
  }
};
const len = (s) => [...s].length;

/** Longest text a list may hold before the app has to shrink it too far (characters). */
const LIMITS = { answers: 64, ball: 48, omens: 130, questions: 70 };

function checkContent() {
  const catalog = readJson(path.join(TX, 'src/catalog.json'));
  const content = readJson(path.join(TX, `out/${set}/content.json`));
  if (!catalog || !content) return;
  for (const [list, max] of Object.entries(LIMITS)) {
    const source = catalog[list];
    const mine = content[list];
    if (!Array.isArray(mine)) {
      errors.push(`content.json: "${list}" must be an array of strings`);
      continue;
    }
    if (mine.length !== source.length) errors.push(`content.json: "${list}" has ${mine.length} items, the source has ${source.length}`);
    const seen = new Map();
    mine.forEach((t, i) => {
      const en = source[i]?.en;
      if (typeof t !== 'string' || !t.trim()) return errors.push(`${list}[${i}] (${en}): empty or not a string`);
      if (t !== t.trim()) errors.push(`${list}[${i}] (${en}): leading/trailing spaces`);
      if (/[\n\r\t]/.test(t)) errors.push(`${list}[${i}] (${en}): contains a line break or tab`);
      if (len(t) > max) errors.push(`${list}[${i}] (${en}): ${len(t)} characters, keep it under ${max}`);
      if (t === en && en.length > 14 && set !== 'en') warnings.push(`${list}[${i}]: identical to English "${en}"`);
      if (list !== 'omens' && /[.。]$/.test(t) && !/\.\.\.$/.test(t) && !/[.。]$/.test(en)) {
        warnings.push(`${list}[${i}] (${en}): ends with a full stop; the English has none`);
      }
      const key = t.toLowerCase();
      if (seen.has(key)) errors.push(`${list}[${i}] (${en}) and ${list}[${seen.get(key)}] (${source[seen.get(key)]?.en}) are both "${t}" - make them different`);
      seen.set(key, i);
    });
  }
  for (const key of Object.keys(content)) if (!(key in LIMITS)) errors.push(`content.json: unknown key "${key}"`);
}

function checkUi() {
  const file = path.join(TX, `out/${set}/ui.json`);
  if (!fs.existsSync(file)) return errors.push('ui.json does not exist yet');
  const ref = readJson(path.join(TX, '..', '..', 'src/i18n/ui/en.json'));
  const ui = readJson(file);
  if (!ref || !ui) return;
  for (const key of Object.keys(ref)) {
    if (!(key in ui)) errors.push(`ui.json: missing key ${key}`);
    else if (typeof ui[key] !== 'string' || !ui[key].trim()) errors.push(`ui.json: ${key} is empty`);
    else {
      const need = (ref[key].match(/\{\{\w+\}\}/g) ?? []).sort().join(',');
      const have = (ui[key].match(/\{\{\w+\}\}/g) ?? []).sort().join(',');
      if (need !== have) errors.push(`ui.json: ${key} placeholders ${have || '(none)'} but English has ${need || '(none)'}`);
      if (ui[key] === ref[key] && ref[key].length > 12 && !/^[\d\s{}.:/+-]*$/.test(ref[key])) {
        warnings.push(`ui.json: ${key} is identical to English`);
      }
      if (/^(home\.\w+\.title|home\.journal|reveal\.(share|save|saved))$/.test(key) && len(ui[key]) > 22) {
        warnings.push(`ui.json: ${key} is ${len(ui[key])} characters - it sits on a small button (aim for <= 18)`);
      }
    }
  }
  for (const key of Object.keys(ui)) if (!(key in ref)) errors.push(`ui.json: unknown key ${key}`);
}

function checkListing() {
  const file = path.join(TX, `out/${set}/listing.json`);
  if (!fs.existsSync(file)) return errors.push('listing.json does not exist yet');
  const l = readJson(file);
  if (!l) return;
  const limits = { title: 30, short: 80, full: 4000 };
  for (const [k, max] of Object.entries(limits)) {
    if (typeof l[k] !== 'string' || !l[k].trim()) errors.push(`listing.json: ${k} is missing`);
    else if (len(l[k]) > max) errors.push(`listing.json: ${k} is ${len(l[k])} characters, Google Play allows ${max}`);
  }
  if (!Array.isArray(l.shots) || l.shots.length !== 6) errors.push('listing.json: shots must be an array of 6 captions');
  else
    l.shots.forEach((s, i) => {
      if (!s || typeof s.title !== 'string' || typeof s.sub !== 'string') errors.push(`listing.json: shots[${i}] needs title and sub`);
      else {
        if (len(s.title) > 28) warnings.push(`listing.json: shots[${i}].title is ${len(s.title)} characters - it must fit on a screenshot (aim for <= 24)`);
        if (len(s.sub) > 60) warnings.push(`listing.json: shots[${i}].sub is ${len(s.sub)} characters (aim for <= 52)`);
      }
    });
  if (typeof l.feature !== 'string' || !l.feature.trim()) errors.push('listing.json: feature (feature-graphic slogan) is missing');
  else if (len(l.feature) > 40) warnings.push(`listing.json: feature is ${len(l.feature)} characters (aim for <= 34)`);
  if (/[<>]/.test(l.full ?? '')) warnings.push('listing.json: full description contains < or > - Play shows them literally');
  for (const k of Object.keys(l)) if (!['title', 'short', 'full', 'feature', 'shots'].includes(k)) errors.push(`listing.json: unknown key ${k}`);
}

if (what === 'content' || what === 'all') checkContent();
if (what === 'ui' || what === 'all') checkUi();
if (what === 'listing' || what === 'all') checkListing();

for (const w of warnings) console.log(`warning: ${w}`);
for (const e of errors) console.log(`ERROR: ${e}`);
if (errors.length) {
  console.log(`${set}: ${errors.length} error(s)`);
  process.exit(1);
}
console.log(`${set} ${what}: OK${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
