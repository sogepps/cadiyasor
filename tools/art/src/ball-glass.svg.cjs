/**
 * Glass reflections laid over the crystal ball: rim shading, a window-shaped highlight and a small
 * sparkle. Same 600 × 700 frame as ball-stand.png; sphere centre (300, 290), radius 230.
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700" data-scale="1.5">
  <defs>
    <radialGradient id="rim" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.72" stop-color="#1a0c30" stop-opacity="0"/>
      <stop offset="0.95" stop-color="#1a0c30" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#d9c9ff" stop-opacity="0.7"/>
    </radialGradient>
    <linearGradient id="hi" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.75"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="b2"><feGaussianBlur stdDeviation="2"/></filter>
  </defs>
  <circle cx="300" cy="290" r="230" fill="url(#rim)"/>
  <path d="M 160 180 C 190 110 260 80 320 84 C 260 100 214 140 196 200 C 190 214 170 212 160 180 Z" fill="url(#hi)" filter="url(#b2)"/>
  <ellipse cx="400" cy="420" rx="60" ry="22" transform="rotate(-38 400 420)" fill="#ffffff" opacity="0.12"/>
  <g fill="#ffffff" opacity="0.9">
    <path d="M 214 150 L 218 164 L 232 168 L 218 172 L 214 186 L 210 172 L 196 168 L 210 164 Z"/>
  </g>
</svg>`;
