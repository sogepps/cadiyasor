/**
 * A stone altar with two candles (flames drawn by the app) for the grimoire to rest on.
 * 800 × 520. Book rests on the top surface at y ≈ 140. Candle wick tips: (96, 150) and (706, 176).
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520" data-scale="1.5">
  <defs>
    <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a3162"/>
      <stop offset="1" stop-color="#15102a"/>
    </linearGradient>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#5a4c94"/>
      <stop offset="1" stop-color="#2e2654"/>
    </linearGradient>
    <linearGradient id="wax" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#d8c9a4"/>
      <stop offset="0.6" stop-color="#f4ead0"/>
      <stop offset="1" stop-color="#bfae88"/>
    </linearGradient>
    <radialGradient id="warm" cx="0.5" cy="0" r="1">
      <stop offset="0" stop-color="#ffb347" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffb347" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="6" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.5 -0.15" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <!-- pedestal -->
  <path d="M 230 200 L 570 200 L 540 440 L 260 440 Z" fill="url(#stone)"/>
  <path d="M 230 200 L 570 200 L 540 440 L 260 440 Z" fill="#000" filter="url(#grain)"/>
  <path d="M 200 440 L 600 440 L 620 500 L 180 500 Z" fill="#1c1636"/>
  <!-- carved rune on the pedestal -->
  <g stroke="#7dffb5" stroke-width="4" fill="none" opacity="0.5" stroke-linecap="round">
    <path d="M 400 260 L 400 380 M 370 290 L 400 320 L 430 290 M 372 350 L 428 350"/>
  </g>
  <!-- slab -->
  <path d="M 120 150 L 680 150 L 700 200 L 100 200 Z" fill="url(#top)"/>
  <path d="M 100 200 L 700 200 L 700 222 L 100 222 Z" fill="#241d44"/>
  <path d="M 120 150 L 680 150 L 700 200 L 100 200 Z" fill="url(#warm)"/>
  <!-- candles -->
  <path d="M 72 200 L 72 160 C 72 150 120 150 120 160 L 120 200 Z" fill="url(#wax)"/>
  <path d="M 72 160 C 80 170 84 178 82 190" stroke="#fff8e6" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M 96 160 L 96 150" stroke="#2a1a0a" stroke-width="3"/>
  <path d="M 684 200 L 684 186 C 684 176 728 176 728 186 L 728 200 Z" fill="url(#wax)"/>
  <path d="M 706 186 L 706 176" stroke="#2a1a0a" stroke-width="3"/>
</svg>`;
