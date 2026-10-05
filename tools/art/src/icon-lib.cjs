/**
 * Shared pieces of the app icon: the witch's head and hat (cropped from witch.png) in front of a
 * big full moon, on a violet night. Used by icon*.svg.cjs.
 */
const fs = require('fs');
const path = require('path');

const ART = path.join(__dirname, '..', '..', '..', 'assets', 'art');
const png = (name) => `data:image/png;base64,${fs.readFileSync(path.join(ART, name)).toString('base64')}`;

/** Night background, full square 1024. */
const background = `
  <defs>
    <radialGradient id="night" cx="0.5" cy="0.38" r="0.8">
      <stop offset="0" stop-color="#4a2a8a"/>
      <stop offset="0.55" stop-color="#241250"/>
      <stop offset="1" stop-color="#0e0628"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#night)"/>
  <g fill="#fff3c4">
    <circle cx="170" cy="190" r="6"/><circle cx="250" cy="120" r="4"/><circle cx="820" cy="160" r="5"/>
    <circle cx="880" cy="300" r="3.5"/><circle cx="140" cy="420" r="4"/><circle cx="900" cy="560" r="4"/>
  </g>`;

/**
 * Moon + witch head. `k` scales everything around the icon centre so the adaptive foreground can
 * keep it inside the 66 % safe zone.
 */
function foreground(k = 1) {
  const t = `translate(512 512) scale(${k}) translate(-512 -512)`;
  // witch.png is 1200 × 1500 for an 800 × 1000 drawing; the head + hat live in x 150–660, y 30–520.
  const s = 1.62; // drawing units → icon pixels
  const x = 512 - 405 * s;
  const y = 470 - 300 * s;
  return `
  <defs>
    <radialGradient id="moonGlow">
      <stop offset="0.55" stop-color="#fff6d8" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#fff6d8" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="potion" cx="0.5" cy="1" r="0.9">
      <stop offset="0" stop-color="#7dffb5" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#7dffb5" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="headClip"><rect x="${x}" y="${y - 20}" width="${800 * s}" height="${(560 - 0) * s}"/></clipPath>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.82" stop-color="white"/>
      <stop offset="1" stop-color="white" stop-opacity="0"/>
    </linearGradient>
    <mask id="neckFade"><rect x="0" y="0" width="1024" height="${y + 540 * s}" fill="url(#fade)"/></mask>
  </defs>
  <g transform="${t}">
    <circle cx="560" cy="470" r="360" fill="url(#moonGlow)"/>
    <image href="${png('moon.png')}" x="300" y="210" width="520" height="520"/>
    <g clip-path="url(#headClip)" mask="url(#neckFade)">
      <image href="${png('witch.png')}" x="${x}" y="${y}" width="${800 * s}" height="${1000 * s}"/>
    </g>
    <g fill="#9dffcf">
      <path d="M 250 700 L 258 722 L 280 730 L 258 738 L 250 760 L 242 738 L 220 730 L 242 722 Z"/>
      <path d="M 800 690 L 806 706 L 822 712 L 806 718 L 800 734 L 794 718 L 778 712 L 794 706 Z"/>
      <circle cx="300" cy="820" r="6"/><circle cx="760" cy="800" r="5"/>
    </g>
  </g>`;
}

module.exports = { background, foreground, png };
