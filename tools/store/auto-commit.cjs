/**
 * Waits for the owner to finish the App content declarations (Data safety, content rating…), then
 * commits the prepared edit without sending it for review.
 *
 *   node tools/store/auto-commit.cjs <editId> [hours]
 *
 * Every 5 minutes it tries the commit. While Play refuses because a declaration is missing it keeps
 * waiting (each new reason is logged once). Only if the edit itself is gone (deleted, expired, or
 * replaced by a newer edit) does it upload everything again, once, and wait on the new edit.
 */
const { execFileSync, spawnSync } = require('child_process');
const path = require('path');

let [editId, hoursArg] = process.argv.slice(2);
const deadline = Date.now() + (Number(hoursArg) || 20) * 3600 * 1000;
const ROOT = path.join(__dirname, '..', '..');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stamp = () => new Date().toLocaleTimeString('tr-TR');
const seen = new Set();
let reuploaded = false;

function tryCommit(id) {
  try {
    execFileSync(process.execPath, [path.join(__dirname, 'edit-fix.cjs'), id, 'commit'], { stdio: 'pipe' });
    return { ok: true };
  } catch (e) {
    return { ok: false, message: String(e.stderr || e.message) };
  }
}

/** The edit no longer exists (as opposed to Play refusing it for a missing declaration). */
const editGone = (msg) => /→ 404|not found|editAlreadyCommitted|expired|has been deleted|does not exist/i.test(msg);

function fullUpload() {
  console.log(`[${stamp()}] edit ${editId} is gone: uploading everything again`);
  const r = spawnSync(
    process.execPath,
    [
      path.join(__dirname, 'play-upload.cjs'),
      '--details',
      '--listings',
      '--bundle',
      path.join(ROOT, 'dist/CadiyaSor-2.0.0-vc10.aab'),
      '--notes',
      path.join(__dirname, 'release-notes.json'),
      '--ready',
    ],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  const out = `${r.stdout}\n${r.stderr}`;
  const m = out.match(/edit (\d+)/);
  if (/edit committed/.test(out)) return { committed: true };
  return { committed: false, editId: m ? m[1] : null, tail: out.slice(-400) };
}

(async () => {
  console.log(`[${stamp()}] watching edit ${editId}`);
  while (Date.now() < deadline) {
    const r = tryCommit(editId);
    if (r.ok) {
      console.log(`[${stamp()}] COMMITTED edit ${editId}: listings, graphics and the 2.0.0 release are saved in Play Console (not sent for review)`);
      return;
    }
    const reason = r.message.replace(/\s+/g, ' ').slice(0, 300);
    if (editGone(reason) && !reuploaded) {
      reuploaded = true;
      const up = fullUpload();
      if (up.committed) {
        console.log(`[${stamp()}] COMMITTED after re-upload`);
        return;
      }
      if (!up.editId) {
        console.log(`[${stamp()}] re-upload failed: ${up.tail}`);
        return;
      }
      editId = up.editId;
      console.log(`[${stamp()}] re-uploaded into edit ${editId}; waiting`);
    } else if (!seen.has(reason)) {
      seen.add(reason);
      console.log(`[${stamp()}] waiting: ${reason}`);
    }
    await sleep(5 * 60 * 1000);
  }
  console.log(`[${stamp()}] gave up waiting; edit ${editId} still open`);
})();
