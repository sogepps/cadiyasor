/**
 * Tiny adb helper for driving the emulator from scripts and taking scaled screenshots.
 *
 *   node tools/qa/adb.cjs shot <name>            → scratch/<name>.png (432 px wide) and full-size copy
 *   node tools/qa/adb.cjs tap <x> <y>             (device pixels)
 *   node tools/qa/adb.cjs text "<text>"           (ASCII only)
 *   node tools/qa/adb.cjs key <KEYCODE>
 *   node tools/qa/adb.cjs dump                    → visible texts with their centre coordinates
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ADB = path.join(process.env.LOCALAPPDATA, 'Android/Sdk/platform-tools/adb.exe');
const SERIAL = process.env.ANDROID_SERIAL || 'emulator-5554';
const OUT = process.env.QA_OUT || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });

const adb = (...args) => execFileSync(ADB, ['-s', SERIAL, ...args], { maxBuffer: 64 * 1024 * 1024 });

async function shot(name) {
  const png = adb('exec-out', 'screencap', '-p');
  const full = path.join(OUT, `${name}.full.png`);
  fs.writeFileSync(full, png);
  const sharp = require(require.resolve('sharp', { paths: ['E:/Soge/HomeParty'] }));
  await sharp(png).resize(432).toFile(path.join(OUT, `${name}.png`));
  console.log(path.join(OUT, `${name}.png`));
}

function dump() {
  const remote = `/sdcard/ui-${Date.now()}.xml`;
  try {
    adb('shell', 'uiautomator', 'dump', remote);
  } catch {
    console.log('(dump failed — screen is probably animating)');
    return;
  }
  let xml = '';
  try {
    xml = adb('shell', 'cat', remote).toString('utf8');
  } catch {
    console.log('(no dump — the screen is animating)');
    return;
  }
  adb('shell', 'rm', remote);
  const re = /text="([^"]*)"[^>]*?content-desc="([^"]*)"[^>]*?bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/g;
  for (const m of xml.matchAll(re)) {
    const label = m[1] || m[2];
    if (!label) continue;
    const cx = Math.round((+m[3] + +m[5]) / 2);
    const cy = Math.round((+m[4] + +m[6]) / 2);
    console.log(`${cx},${cy}\t${label}`);
  }
}

(async () => {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'shot') await shot(args[0] || 'shot');
  else if (cmd === 'tap') adb('shell', 'input', 'tap', args[0], args[1]);
  else if (cmd === 'text') adb('shell', 'input', 'text', args[0].replace(/ /g, '%s'));
  else if (cmd === 'key') adb('shell', 'input', 'keyevent', args[0]);
  else if (cmd === 'swipe') adb('shell', 'input', 'swipe', ...args);
  else if (cmd === 'dump') dump();
  else console.log('usage: shot|tap|text|key|swipe|dump');
})();
