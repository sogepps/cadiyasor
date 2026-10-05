/** Back of the daily omen card: midnight blue with a gold sun-moon-eye pattern. 600 × 960. */
const rays = [];
for (let i = 0; i < 24; i++) {
  const a = (i / 24) * Math.PI * 2;
  const r0 = 118;
  const r1 = i % 2 ? 150 : 176;
  rays.push(`M ${(300 + Math.cos(a) * r0).toFixed(1)} ${(480 + Math.sin(a) * r0).toFixed(1)} L ${(300 + Math.cos(a) * r1).toFixed(1)} ${(480 + Math.sin(a) * r1).toFixed(1)}`);
}
const stars = [];
for (let i = 0; i < 16; i++) {
  const x = 70 + ((i * 97) % 460);
  const y = 90 + ((i * 173) % 780);
  if (Math.hypot(x - 300, y - 480) < 200) continue;
  stars.push(`<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#f2c14e" opacity="0.7"/>`);
}

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="960" viewBox="0 0 600 960" data-scale="1">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#241257"/>
      <stop offset="1" stop-color="#0e0628"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe4a0"/>
      <stop offset="0.5" stop-color="#e0a940"/>
      <stop offset="1" stop-color="#a86a1c"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="592" height="952" rx="36" fill="url(#bg)"/>
  <rect x="26" y="26" width="548" height="908" rx="24" fill="none" stroke="url(#gold)" stroke-width="5"/>
  <rect x="42" y="42" width="516" height="876" rx="16" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.7"/>
  ${stars.join('')}
  <path d="${rays.join(' ')}" stroke="url(#gold)" stroke-width="5" stroke-linecap="round"/>
  <circle cx="300" cy="480" r="104" fill="none" stroke="url(#gold)" stroke-width="5"/>
  <path d="M 356 404 A 92 92 0 1 0 356 556 A 76 76 0 1 1 356 404 Z" fill="url(#gold)"/>
  <path d="M 246 480 C 270 452 330 452 354 480 C 330 508 270 508 246 480 Z" fill="none" stroke="url(#gold)" stroke-width="4"/>
  <circle cx="300" cy="480" r="14" fill="url(#gold)"/>
  <g fill="url(#gold)">
    <path d="M 300 90 L 308 112 L 330 120 L 308 128 L 300 150 L 292 128 L 270 120 L 292 112 Z"/>
    <path d="M 300 810 L 308 832 L 330 840 L 308 848 L 300 870 L 292 848 L 270 840 L 292 832 Z"/>
  </g>
</svg>`;
