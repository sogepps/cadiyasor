/** Small helpers shared by the SVG generators. */

/** Deterministic pseudo-random numbers so every render is identical. */
function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n) => Math.round(n * 10) / 10;

/**
 * A tapered, slightly bent limb (finger, claw, branch, strand of hair) as a closed path.
 * `ang` in degrees (0 = right, 90 = down), `bend` pushes the middle sideways.
 */
function taper(x, y, ang, len, w0, w1, bend = 0) {
  const a = (ang * Math.PI) / 180;
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const nx = -dy;
  const ny = dx;
  const mx = x + dx * len * 0.5 + nx * bend;
  const my = y + dy * len * 0.5 + ny * bend;
  const tx = x + dx * len + nx * bend * 0.6;
  const ty = y + dy * len + ny * bend * 0.6;
  const wm = (w0 + w1) / 2;
  return (
    `M ${f(x + (nx * w0) / 2)} ${f(y + (ny * w0) / 2)} ` +
    `Q ${f(mx + (nx * wm) / 2)} ${f(my + (ny * wm) / 2)} ${f(tx + (nx * w1) / 2)} ${f(ty + (ny * w1) / 2)} ` +
    `Q ${f(tx + dx * w1 * 1.2)} ${f(ty + dy * w1 * 1.2)} ${f(tx - (nx * w1) / 2)} ${f(ty - (ny * w1) / 2)} ` +
    `Q ${f(mx - (nx * wm) / 2)} ${f(my - (ny * wm) / 2)} ${f(x - (nx * w0) / 2)} ${f(y - (ny * w0) / 2)} Z`
  );
}

/** Endpoint of a taper() — where to attach the next segment. */
function tip(x, y, ang, len, bend = 0) {
  const a = (ang * Math.PI) / 180;
  return [x + Math.cos(a) * len - Math.sin(a) * bend * 0.6, y + Math.sin(a) * len + Math.cos(a) * bend * 0.6];
}

/** Recursive gnarled branch, returned as a list of taper paths. */
function branch(out, rand, x, y, ang, len, w, depth) {
  const bend = (rand() - 0.5) * len * 0.35;
  out.push(taper(x, y, ang, len, w, w * 0.62, bend));
  if (depth <= 0 || w < 1.4) return;
  const [ex, ey] = tip(x, y, ang, len, bend);
  const kids = depth > 2 ? 2 + (rand() < 0.4 ? 1 : 0) : 2;
  for (let i = 0; i < kids; i++) {
    const spread = (i - (kids - 1) / 2) * (28 + rand() * 22) + (rand() - 0.5) * 16;
    branch(out, rand, ex, ey, ang + spread, len * (0.62 + rand() * 0.2), w * 0.62, depth - 1);
  }
}

module.exports = { rng, taper, tip, branch, f };
