/**
 * Pushes the store listing, graphics and (optionally) the app bundle to Google Play through the
 * Play Developer API, as one edit.
 *
 *   node tools/store/play-upload.cjs --listings [--only tr-TR,de-DE] [--no-images]
 *   node tools/store/play-upload.cjs --details
 *   node tools/store/play-upload.cjs --bundle <app-release.aab> [--notes notes.json]
 *   node tools/store/play-upload.cjs --ready         (draft production release → full rollout, still unsent)
 *   node tools/store/play-upload.cjs --read          (prints what Play currently holds)
 *   add --dry-run to any of them to see what would be sent
 *
 * The bundle goes to the production track as a DRAFT release: it waits in Play Console until the
 * owner presses "Send for review" there. Nothing here publishes anything.
 *
 * Auth: the service-account key given by --key or GOOGLE_PLAY_KEY (default: the sogegammon key the
 * account already uses). The account must have access to this app in Play Console.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const APP = JSON.parse(fs.readFileSync(path.join(ROOT, 'app.json'), 'utf8')).expo;
const PACKAGE = APP.android.package;
const LISTINGS = process.env.STORE_OUT || 'C:/Users/Nilvera/Desktop/CadiyaSor-GooglePlay';
const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const UPLOAD = 'https://androidpublisher.googleapis.com/upload/androidpublisher/v3';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const keyFile = value('--key') || process.env.GOOGLE_PLAY_KEY || 'C:/Users/Nilvera/Downloads/sogegammon-4ec8ac70b8f6.json';
const only = (value('--only') || '').split(',').filter(Boolean);
const dryRun = flag('--dry-run');

/** Play takes plain "af" for Afrikaans; folder names follow HomeParty's convention otherwise. */
const PLAY_CODE = { 'af-ZA': 'af' };

async function accessToken() {
  const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: key.token_uri,
    iat: now,
    exp: now + 3600,
  };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64(claim)}`;
  const sig = crypto.createSign('RSA-SHA256').update(unsigned).sign(key.private_key).toString('base64url');
  const res = await fetch(claim.aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`token: ${res.status} ${JSON.stringify(body)}`);
  return body.access_token;
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function call(token, method, url, body, contentType = 'application/json', attempt = 1) {
  const res = await fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': contentType } : {}) },
    body: body ? (contentType === 'application/json' ? JSON.stringify(body) : body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) {
    if (RETRYABLE.has(res.status) && attempt <= 5) {
      await sleep(2000 * 2 ** (attempt - 1));
      return call(token, method, url, body, contentType, attempt + 1);
    }
    throw new Error(`${method} ${url.replace(API, '').replace(UPLOAD, '')} → ${res.status} ${text.slice(0, 500)}`);
  }
  return text ? JSON.parse(text) : {};
}

function listingsOnDisk() {
  return fs
    .readdirSync(LISTINGS)
    .filter((n) => fs.statSync(path.join(LISTINGS, n)).isDirectory())
    .filter((n) => !only.length || only.includes(n))
    .map((n) => {
      const dir = path.join(LISTINGS, n);
      const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8').trim();
      const shots = path.join(dir, 'ekran-goruntuleri');
      return {
        language: PLAY_CODE[n] ?? n,
        title: read('uygulama-adi.txt'),
        shortDescription: read('kisa-aciklama.txt'),
        fullDescription: read('tam-aciklama.txt'),
        feature: path.join(dir, 'ozellik-grafik-1024x500.png'),
        screenshots: fs.readdirSync(shots).filter((f) => f.endsWith('.png')).sort().map((f) => path.join(shots, f)),
      };
    });
}

async function main() {
  if (dryRun) {
    if (flag('--listings')) {
      for (const l of listingsOnDisk()) {
        console.log(`${l.language.padEnd(7)} ${l.title.padEnd(32)} short ${[...l.shortDescription].length} full ${[...l.fullDescription].length} shots ${l.screenshots.length}`);
      }
    }
    console.log('dry run — nothing sent');
    return;
  }

  const token = await accessToken();
  const edit = await call(token, 'POST', `${API}/applications/${PACKAGE}/edits`);
  const base = `${API}/applications/${PACKAGE}/edits/${edit.id}`;
  console.log(`edit ${edit.id}`);

  if (value('--commit')) {
    await call(token, 'DELETE', base);
    await call(token, 'POST', `${API}/applications/${PACKAGE}/edits/${value('--commit')}:commit?changesNotSentForReview=true`);
    console.log('committed edit ' + value('--commit'));
    return;
  }

  if (flag('--read')) {
    const details = await call(token, 'GET', `${base}/details`);
    const listings = await call(token, 'GET', `${base}/listings`);
    const tracks = await call(token, 'GET', `${base}/tracks`);
    console.log(JSON.stringify({ details, languages: (listings.listings || []).map((l) => l.language), tracks }, null, 2));
    await call(token, 'DELETE', base);
    return;
  }

  if (flag('--details')) {
    await call(token, 'PATCH', `${base}/details`, {
      defaultLanguage: 'tr-TR',
      contactEmail: 'sogepps@gmail.com',
      contactWebsite: 'https://sogepps.tr/cadiyasor/',
    });
    console.log('details set');
  }

  if (flag('--listings')) {
    const listings = listingsOnDisk();
    const failed = [];
    let n = 0;
    for (const l of listings) {
      const lb = `${base}/listings/${l.language}`;
      try {
        await call(token, 'PUT', lb, {
          language: l.language,
          title: l.title,
          shortDescription: l.shortDescription,
          fullDescription: l.fullDescription,
        });
        if (!flag('--no-images')) {
          for (const type of ['featureGraphic', 'phoneScreenshots']) await call(token, 'DELETE', `${lb}/${type}`);
          const up = (type, file) =>
            call(token, 'POST', `${UPLOAD}/applications/${PACKAGE}/edits/${edit.id}/listings/${l.language}/${type}?uploadType=media`, fs.readFileSync(file), 'image/png');
          await up('featureGraphic', l.feature);
          for (const shot of l.screenshots) await up('phoneScreenshots', shot);
        }
        console.log(`  ${String(++n).padStart(2)}/${listings.length} ${l.language} ✓`);
      } catch (e) {
        failed.push(`${l.language}: ${String(e.message).split('\n')[0]}`);
        console.log(`  -- ${l.language} FAILED`);
      }
    }
    // The hi-res icon lives on the default listing.
    if (!flag('--no-images') && !only.length) {
      await call(token, 'DELETE', `${base}/listings/tr-TR/icon`).catch(() => {});
      await call(
        token,
        'POST',
        `${UPLOAD}/applications/${PACKAGE}/edits/${edit.id}/listings/tr-TR/icon?uploadType=media`,
        fs.readFileSync(path.join(ROOT, 'store/icon-512.png')),
        'image/png',
      );
      console.log('icon uploaded');
    }
    if (failed.length) console.log(`failed:\n  ${failed.join('\n  ')}`);
  }

  if (flag('--bundle')) {
    const aab = value('--bundle');
    const bundle = await call(
      token,
      'POST',
      `${UPLOAD}/applications/${PACKAGE}/edits/${edit.id}/bundles?uploadType=media`,
      fs.readFileSync(aab),
      'application/octet-stream',
    );
    console.log(`bundle uploaded: versionCode ${bundle.versionCode}`);
    const notesFile = value('--notes');
    const releaseNotes = notesFile ? JSON.parse(fs.readFileSync(notesFile, 'utf8')) : [];
    await call(token, 'PUT', `${base}/tracks/production`, {
      track: 'production',
      releases: [
        {
          name: `${APP.version} (${bundle.versionCode})`,
          versionCodes: [String(bundle.versionCode)],
          status: 'draft',
          releaseNotes,
        },
      ],
    });
    console.log('production release saved as DRAFT — publish it from Play Console');
  }

  if (flag('--ready')) {
    // Turns the draft production release into a full rollout. With changesNotSentForReview it only joins
    // the "changes not yet sent for review" list; the owner still presses "Send for review".
    const track = await call(token, 'GET', `${base}/tracks/production`);
    const draft = (track.releases || []).find((r) => r.status === 'draft');
    if (!draft) throw new Error('no draft release on production');
    await call(token, 'PUT', `${base}/tracks/production`, {
      track: 'production',
      releases: [{ ...draft, status: 'completed' }],
    });
    console.log(`release ${draft.name} ready (full rollout, not sent for review)`);
  }

  // This app's changes go through review; the owner sends them from Play Console, so commit without sending.
  await call(token, 'POST', `${base}:commit?changesNotSentForReview=true`);
  console.log('edit committed');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
