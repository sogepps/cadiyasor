/**
 * Parchment scroll the answer is written on: aged paper with burnt edges between two wooden
 * rollers. 900 × 760. Text area: x 150–750, y 170–560. Wax seal centre (450, 610) — coloured by
 * the app with the answer's tone.
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="760" viewBox="0 0 900 760" data-scale="1.2">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#e2cb98"/>
      <stop offset="0.12" stop-color="#f4e6c4"/>
      <stop offset="0.5" stop-color="#f8eccf"/>
      <stop offset="0.88" stop-color="#f1e0b8"/>
      <stop offset="1" stop-color="#d9bf88"/>
    </linearGradient>
    <radialGradient id="edge" cx="0.5" cy="0.5" r="0.7">
      <stop offset="0.6" stop-color="#8a5a24" stop-opacity="0"/>
      <stop offset="1" stop-color="#6a3a12" stop-opacity="0.55"/>
    </radialGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8a5a34"/>
      <stop offset="0.45" stop-color="#c88a54"/>
      <stop offset="1" stop-color="#4a2a14"/>
    </linearGradient>
    <linearGradient id="roll" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#c9ab74"/>
      <stop offset="0.5" stop-color="#f3e3bc"/>
      <stop offset="1" stop-color="#a88a58"/>
    </linearGradient>
    <filter id="fibres" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="4" seed="17" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.33  0 0 0 0 0.12  0 0 0 0.55 -0.12" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="blur"><feGaussianBlur stdDeviation="14"/></filter>
  </defs>
  <ellipse cx="450" cy="712" rx="360" ry="26" fill="#000" opacity="0.35" filter="url(#blur)"/>
  <!-- sheet with ragged sides -->
  <path d="M 110 92 L 790 92 C 796 150 784 200 792 260 C 800 320 786 380 794 440 C 800 500 786 560 792 668 L 108 668
    C 114 580 100 520 106 460 C 112 400 98 340 106 280 C 112 220 100 160 110 92 Z" fill="url(#paper)"/>
  <path d="M 110 92 L 790 92 C 796 150 784 200 792 260 C 800 320 786 380 794 440 C 800 500 786 560 792 668 L 108 668
    C 114 580 100 520 106 460 C 112 400 98 340 106 280 C 112 220 100 160 110 92 Z" fill="#000" filter="url(#fibres)"/>
  <path d="M 110 92 L 790 92 C 796 150 784 200 792 260 C 800 320 786 380 794 440 C 800 500 786 560 792 668 L 108 668
    C 114 580 100 520 106 460 C 112 400 98 340 106 280 C 112 220 100 160 110 92 Z" fill="url(#edge)"/>
  <!-- decorative ink border -->
  <path d="M 150 140 L 750 140 M 150 620 L 750 620" stroke="#6a4020" stroke-width="2" opacity="0.5"/>
  <g fill="#6a4020" opacity="0.55">
    <path d="M 450 124 L 456 136 L 468 140 L 456 144 L 450 156 L 444 144 L 432 140 L 444 136 Z"/>
    <circle cx="410" cy="140" r="3"/><circle cx="490" cy="140" r="3"/>
  </g>
  <!-- top roller -->
  <rect x="80" y="54" width="740" height="62" rx="31" fill="url(#roll)"/>
  <rect x="40" y="66" width="46" height="38" rx="10" fill="url(#wood)"/>
  <rect x="814" y="66" width="46" height="38" rx="10" fill="url(#wood)"/>
  <circle cx="34" cy="85" r="18" fill="url(#wood)"/><circle cx="866" cy="85" r="18" fill="url(#wood)"/>
  <!-- bottom roller -->
  <rect x="80" y="646" width="740" height="62" rx="31" fill="url(#roll)"/>
  <rect x="40" y="658" width="46" height="38" rx="10" fill="url(#wood)"/>
  <rect x="814" y="658" width="46" height="38" rx="10" fill="url(#wood)"/>
  <circle cx="34" cy="677" r="18" fill="url(#wood)"/><circle cx="866" cy="677" r="18" fill="url(#wood)"/>
</svg>`;
