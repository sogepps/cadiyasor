/**
 * Full-moon texture with soft maria and craters. The app masks it into the real phase of tonight.
 * 512 × 512, the disc fills the square.
 */
const { rng } = require('./lib.cjs');

const rand = rng(21);
const craters = [];
for (let i = 0; i < 26; i++) {
  const a = rand() * Math.PI * 2;
  const r = Math.sqrt(rand()) * 210;
  const x = 256 + Math.cos(a) * r;
  const y = 256 + Math.sin(a) * r;
  const s = 5 + rand() * 18;
  craters.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${s.toFixed(1)}" fill="#cfc4a4" opacity="0.55"/><circle cx="${(x + s * 0.18).toFixed(1)}" cy="${(y + s * 0.18).toFixed(1)}" r="${(s * 0.8).toFixed(1)}" fill="#f7f0d8" opacity="0.5"/>`);
}

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" data-scale="1">
  <defs>
    <radialGradient id="disc" cx="0.42" cy="0.38" r="0.62">
      <stop offset="0" stop-color="#fffbe9"/>
      <stop offset="0.7" stop-color="#f3ead0"/>
      <stop offset="1" stop-color="#d9cca8"/>
    </radialGradient>
    <filter id="maria" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="9" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.62  0 0 0 0 0.58  0 0 0 0 0.5  0 0 0 -2.4 1.4"/>
    </filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="3" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0.35 0"/>
    </filter>
    <clipPath id="c"><circle cx="256" cy="256" r="254"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="512" height="512" fill="url(#disc)"/>
    <rect width="512" height="512" filter="url(#maria)" opacity="0.55"/>
    ${craters.join('')}
    <rect width="512" height="512" filter="url(#grain)"/>
  </g>
</svg>`;
