/**
 * Foreground: dark ground with a gnarled tree on the left, crooked gravestones, a fence and grass,
 * in near-black silhouette with a violet moonlit rim. 1080 × 720, anchored to the screen bottom.
 * The cat sits on the big gravestone at about (860, 440).
 */
const { rng, branch, taper } = require('./lib.cjs');

const W = 1080;
const H = 720;
const rand = rng(3);

const tree = [];
tree.push(taper(118, 520, -84, 190, 64, 38, 14));
branch(tree, rand, 132, 340, -110, 130, 34, 5);
branch(tree, rand, 130, 350, -58, 150, 30, 5);
branch(tree, rand, 124, 420, -150, 90, 20, 3);

const grass = [];
for (let i = 0; i < 180; i++) {
  const x = rand() * W;
  const base = 470 + Math.sin(x / 140) * 18 + rand() * 12;
  const h = 14 + rand() * 30;
  grass.push(taper(x, base + 6, -90 + (rand() - 0.5) * 50, h, 5, 0.8, (rand() - 0.5) * 8));
}

function stone(x, y, w, h, tilt) {
  return `<g transform="rotate(${tilt} ${x} ${y})"><path d="M ${x - w / 2} ${y} L ${x - w / 2} ${y - h + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${y - h + w / 2} L ${x + w / 2} ${y} Z" fill="#120a26"/>
    <path d="M ${x + w / 2 - 6} ${y - h + w / 2} A ${w / 2 - 6} ${w / 2 - 6} 0 0 0 ${x} ${y - h + 6} A ${w / 2} ${w / 2} 0 0 1 ${x + w / 2} ${y - h + w / 2} L ${x + w / 2} ${y} L ${x + w / 2 - 6} ${y} Z" fill="#7b68d8" opacity="0.35"/>
    <path d="M ${x - 8} ${y - h * 0.62} L ${x + 8} ${y - h * 0.62} M ${x} ${y - h * 0.72} L ${x} ${y - h * 0.42}" stroke="#2a1d52" stroke-width="5" stroke-linecap="round"/></g>`;
}

const fence = [];
for (let i = 0; i < 7; i++) {
  const x = 330 + i * 34;
  const t = (rand() - 0.5) * 8;
  fence.push(`<path transform="rotate(${t} ${x} 470)" d="M ${x - 5} 470 L ${x - 5} 408 L ${x} 396 L ${x + 5} 408 L ${x + 5} 470 Z" fill="#0f0822"/>`);
}

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-scale="1">
  <defs>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#140b2a"/>
      <stop offset="0.4" stop-color="#0b0618"/>
      <stop offset="1" stop-color="#05030c"/>
    </linearGradient>
  </defs>
  <!-- fence behind the graves -->
  ${fence.join('')}
  <path d="M 320 424 L 540 428 M 320 452 L 540 450" stroke="#0f0822" stroke-width="7"/>
  <!-- the tree -->
  <g fill="#0b0619">${tree.map((d) => `<path d="${d}"/>`).join('')}</g>
  <path d="M 150 520 C 152 460 150 400 138 344 L 146 344 C 160 400 164 460 162 520 Z" fill="#6f5ccc" opacity="0.35"/>
  <!-- a swing hanging from the low branch -->
  <!-- ground -->
  <path fill="url(#soil)" d="M 0 480 C 140 456 260 474 400 470 C 560 466 660 486 820 474 C 940 466 1010 470 1080 462 L 1080 ${H} L 0 ${H} Z"/>
  <path d="M 0 480 C 140 456 260 474 400 470 C 560 466 660 486 820 474 C 940 466 1010 470 1080 462" stroke="#5d4ab8" stroke-width="3" fill="none" opacity="0.45"/>
  <!-- gravestones -->
  ${stone(640, 478, 52, 78, -6)}
  ${stone(730, 474, 40, 56, 8)}
  ${stone(870, 470, 96, 150, -3)}
  <!-- grass -->
  <g fill="#0b0619">${grass.map((d) => `<path d="${d}"/>`).join('')}</g>
  <!-- tiny glowing mushrooms -->
  <g>
    <ellipse cx="230" cy="486" rx="12" ry="7" fill="#7dffb5" opacity="0.9"/><rect x="227" y="486" width="6" height="12" fill="#cfe8dc"/>
    <ellipse cx="252" cy="492" rx="8" ry="5" fill="#7dffb5" opacity="0.8"/><rect x="250" y="492" width="4" height="9" fill="#cfe8dc"/>
    <ellipse cx="970" cy="478" rx="10" ry="6" fill="#b78cff" opacity="0.9"/><rect x="967" y="478" width="5" height="11" fill="#e2d8ff"/>
  </g>
</svg>`;
