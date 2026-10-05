/**
 * Face of the daily omen card: parchment with an ornate gold frame. The app fills it with the moon
 * phase, the omen text and the lucky number/colour/hour. 600 × 960.
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="960" viewBox="0 0 600 960" data-scale="1">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7ebcd"/>
      <stop offset="1" stop-color="#ead5a8"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe4a0"/>
      <stop offset="0.5" stop-color="#d49a3a"/>
      <stop offset="1" stop-color="#8a5a1c"/>
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.6" stop-color="#8a5a24" stop-opacity="0"/>
      <stop offset="1" stop-color="#8a5a24" stop-opacity="0.35"/>
    </radialGradient>
    <filter id="fibres" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.015 0.05" numOctaves="4" seed="4" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.33  0 0 0 0 0.12  0 0 0 0.4 -0.1" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect x="4" y="4" width="592" height="952" rx="36" fill="url(#paper)"/>
  <rect x="4" y="4" width="592" height="952" rx="36" fill="#000" filter="url(#fibres)"/>
  <rect x="4" y="4" width="592" height="952" rx="36" fill="url(#vignette)"/>
  <rect x="24" y="24" width="552" height="912" rx="24" fill="none" stroke="url(#gold)" stroke-width="6"/>
  <rect x="40" y="40" width="520" height="880" rx="16" fill="none" stroke="url(#gold)" stroke-width="1.5" opacity="0.8"/>
  <!-- corner flourishes -->
  <g fill="url(#gold)">
    <path d="M 40 110 C 40 70 70 40 110 40 C 80 56 60 80 56 110 Z"/>
    <path d="M 560 110 C 560 70 530 40 490 40 C 520 56 540 80 544 110 Z"/>
    <path d="M 40 850 C 40 890 70 920 110 920 C 80 904 60 880 56 850 Z"/>
    <path d="M 560 850 C 560 890 530 920 490 920 C 520 904 540 880 544 850 Z"/>
  </g>
</svg>`;
