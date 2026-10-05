/**
 * Far horizon: rolling hills with a crooked witch tower and a few pines, in hazy violet so the
 * foreground reads in front of it. 1080 × 640, anchored to the bottom of the sky.
 */
const { rng } = require('./lib.cjs');

const W = 1080;
const H = 640;
const rand = rng(7);

function pines(n, y0, spread, hMin, hMax, fill) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = spread[0] + rand() * (spread[1] - spread[0]);
    const h = hMin + rand() * (hMax - hMin);
    const w = h * (0.28 + rand() * 0.08);
    const y = y0 + rand() * 20;
    out.push(`<path fill="${fill}" d="M ${x} ${y - h} L ${x + w * 0.5} ${y - h * 0.55} L ${x + w * 0.3} ${y - h * 0.55} L ${x + w * 0.65} ${y - h * 0.2} L ${x + w * 0.4} ${y - h * 0.2} L ${x + w * 0.6} ${y} L ${x - w * 0.6} ${y} L ${x - w * 0.4} ${y - h * 0.2} L ${x - w * 0.65} ${y - h * 0.2} L ${x - w * 0.3} ${y - h * 0.55} L ${x - w * 0.5} ${y - h * 0.55} Z"/>`);
  }
  return out.join('');
}

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-scale="1">
  <defs>
    <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a2468"/>
      <stop offset="1" stop-color="#2a1850"/>
    </linearGradient>
    <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#26164a"/>
      <stop offset="1" stop-color="#1a0f36"/>
    </linearGradient>
    <radialGradient id="window">
      <stop offset="0" stop-color="#ffe7a0"/>
      <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- farthest ridge -->
  <path fill="url(#far)" d="M 0 330 C 120 280 220 300 330 270 C 440 240 520 300 640 285 C 760 270 860 220 960 250 C 1020 268 1060 262 1080 255 L 1080 ${H} L 0 ${H} Z"/>
  ${pines(14, 300, [560, 1060], 40, 70, '#2f1c5a')}

  <!-- the witch tower on the hill -->
  <g fill="#1f1240">
    <path d="M 812 236 L 818 120 L 806 120 L 838 40 L 874 120 L 862 120 L 868 236 Z"/>
    <path d="M 838 40 L 842 20 L 850 36 Z"/>
    <path d="M 792 250 C 810 226 870 226 890 250 Z"/>
    <path d="M 858 170 L 900 150 L 906 188 L 862 200 Z"/>
    <path d="M 874 150 L 890 118 L 912 150 Z"/>
  </g>
  <rect x="832" y="140" width="10" height="16" rx="5" fill="#ffd27a"/>
  <rect x="838" y="190" width="9" height="14" rx="4" fill="#ffd27a" opacity="0.8"/>
  <circle cx="837" cy="148" r="22" fill="url(#window)" opacity="0.6"/>

  <!-- middle hills -->
  <path fill="url(#mid)" d="M 0 420 C 100 380 190 400 290 372 C 400 340 470 390 580 396 C 700 402 790 360 900 372 C 980 380 1040 400 1080 392 L 1080 ${H} L 0 ${H} Z"/>
  ${pines(18, 410, [0, 520], 50, 95, '#1d1140')}
</svg>`;
