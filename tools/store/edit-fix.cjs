/**
 * Works on an edit that is already open (never creates a new one, which would delete it).
 *
 *   node tools/store/edit-fix.cjs <editId> commit               commit without sending for review
 *   node tools/store/edit-fix.cjs <editId> show                 print tracks and listing count
 */
const fs = require('fs');
const crypto = require('crypto');

const PACKAGE = 'com.Soge.CadiyaSor';
const API = 'https://androidpublisher.googleapis.com/androidpublisher/v3';
const KEY = 'C:/Users/Nilvera/Downloads/sogegammon-4ec8ac70b8f6.json';
const [editId, action] = process.argv.slice(2);

async function token() {
  const key = JSON.parse(fs.readFileSync(KEY, 'utf8'));
  const now = Math.floor(Date.now() / 1000);
  const claim = { iss: key.client_email, scope: 'https://www.googleapis.com/auth/androidpublisher', aud: key.token_uri, iat: now, exp: now + 3600 };
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const u = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64(claim)}`;
  const sig = crypto.createSign('RSA-SHA256').update(u).sign(key.private_key).toString('base64url');
  const r = await fetch(claim.aud, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${u}.${sig}` }),
  });
  return (await r.json()).access_token;
}

async function call(t, method, path, body) {
  const r = await fetch(`${API}/applications/${PACKAGE}/edits/${editId}${path}`, {
    method,
    headers: { Authorization: `Bearer ${t}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${path} → ${r.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

(async () => {
  const t = await token();
  if (action === 'show') {
    const tracks = await call(t, 'GET', '/tracks/production');
    const listings = await call(t, 'GET', '/listings');
    console.log(JSON.stringify(tracks, null, 1));
    console.log(`listings: ${(listings.listings || []).length}`);
  } else if (action === 'commit') {
    await call(t, 'POST', ':commit?changesNotSentForReview=true');
    console.log('committed');
  }
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
