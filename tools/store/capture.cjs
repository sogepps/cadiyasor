/**
 * Captures the six store screens in every locale from the screenshot build on the emulator.
 *
 *   node tools/store/capture.cjs [--only tr,de] [--screens home,cauldron]
 *
 * Needs the build made with EXPO_PUBLIC_SHOTS=1 installed. Each capture is triggered with a deep
 * link (cadiyasor://shot/<scene>?locale=<code>&…) and saved to tools/store/raw/<locale>/<scene>.png.
 * The answer (i), book page (p) and example question (q) are fixed so every language shows the same
 * moment.
 */
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ADB = path.join(process.env.LOCALAPPDATA, 'Android/Sdk/platform-tools/adb.exe');
const SERIAL = process.env.ANDROID_SERIAL || 'emulator-5554';
const PKG = 'com.Soge.CadiyaSor';
const RAW = path.join(__dirname, 'raw');
const adb = (...a) => execFileSync(ADB, ['-s', SERIAL, ...a], { maxBuffer: 64 * 1024 * 1024 });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Scene → deep-link query and how long it needs to settle (entrance animations, reveals). */
const SCENES = {
  home: { query: '', settle: 3500 },
  cauldron: { query: '&i=125&q=10', settle: 7000 },
  book: { query: '&i=17&p=237&q=12', settle: 5000 },
  ball: { query: '&i=2&q=22', settle: 6000 },
  omen: { query: '', settle: 2600 },
  journal: { query: '', settle: 2000 },
};

const LOCALES = [
  'en', 'tr', 'es-419', 'es-ES', 'pt-BR', 'pt-PT', 'fr-FR', 'fr-CA', 'de', 'it', 'nl', 'ru', 'uk', 'pl', 'ar', 'hi',
  'id', 'ja', 'ko', 'zh-CN', 'zh-TW', 'zh-HK', 'vi', 'th', 'fa', 'he', 'ur', 'bn', 'ms', 'fil', 'af', 'sq', 'am',
  'hy', 'az', 'eu', 'be', 'bg', 'my', 'ca', 'hr', 'cs', 'da', 'et', 'fi', 'gl', 'ka', 'el', 'gu', 'hu', 'is', 'kn',
  'kk', 'km', 'ky', 'lo', 'lv', 'lt', 'mk', 'ml', 'mr', 'mn', 'ne', 'no', 'pa', 'ro', 'rm', 'sr', 'si', 'sk', 'sl',
  'sw', 'sv', 'ta', 'te',
];

/** Clean status bar: 12:00, full battery and signal, no notification icons. */
function demoMode(on) {
  if (on) {
    adb('shell', 'settings', 'put', 'global', 'sysui_demo_allowed', '1');
    const cmd = (extra) => adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', ...extra);
    cmd(['-e', 'command', 'enter']);
    cmd(['-e', 'command', 'clock', '-e', 'hhmm', '2100']);
    cmd(['-e', 'command', 'battery', '-e', 'level', '100', '-e', 'plugged', 'false']);
    cmd(['-e', 'command', 'network', '-e', 'wifi', 'show', '-e', 'level', '4']);
    cmd(['-e', 'command', 'network', '-e', 'mobile', 'show', '-e', 'datatype', 'none', '-e', 'level', '4']);
    cmd(['-e', 'command', 'notifications', '-e', 'visible', 'false']);
  } else {
    adb('shell', 'am', 'broadcast', '-a', 'com.android.systemui.demo', '-e', 'command', 'exit');
  }
}

function open(scene, locale) {
  const url = `cadiyasor://shot/${scene}?locale=${locale}${SCENES[scene].query}`;
  adb('shell', 'am', 'start', '-W', '-a', 'android.intent.action.VIEW', '-d', `'${url}'`, PKG);
}

async function main() {
  const args = process.argv.slice(2);
  const pick = (flag) => (args.includes(flag) ? args[args.indexOf(flag) + 1].split(',').filter(Boolean) : null);
  const locales = pick('--only') ?? LOCALES;
  const scenes = pick('--screens') ?? Object.keys(SCENES);

  demoMode(true);
  adb('shell', 'am', 'force-stop', PKG);
  open('home', locales[0]);
  await sleep(7000);

  let n = 0;
  for (const locale of locales) {
    const dir = path.join(RAW, locale);
    fs.mkdirSync(dir, { recursive: true });
    for (const scene of scenes) {
      open(scene, locale);
      await sleep(SCENES[scene].settle);
      fs.writeFileSync(path.join(dir, `${scene}.png`), adb('exec-out', 'screencap', '-p'));
      n++;
    }
    console.log(`${locale} ✓ (${n} captures)`);
  }
  demoMode(false);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
