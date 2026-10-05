/**
 * Crystal-ball stand: three brass dragon claws on a round velvet base. The glass sphere itself is
 * drawn by the app (so the mist can swirl inside it) and then covered by ball-glass.png.
 * 600 × 700. Sphere: centre (300, 290), radius 230.
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700" data-scale="1.5">
  <defs>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#6a4212"/>
      <stop offset="0.4" stop-color="#d49a3a"/>
      <stop offset="0.6" stop-color="#ffe4a0"/>
      <stop offset="1" stop-color="#7a4a16"/>
    </linearGradient>
    <linearGradient id="velvet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6b2a8e"/>
      <stop offset="1" stop-color="#2a0c40"/>
    </linearGradient>
    <filter id="blur"><feGaussianBlur stdDeviation="12"/></filter>
  </defs>
  <ellipse cx="300" cy="664" rx="230" ry="26" fill="#000" opacity="0.5" filter="url(#blur)"/>
  <!-- base -->
  <path d="M 110 600 C 110 570 490 570 490 600 L 470 650 C 470 672 130 672 130 650 Z" fill="url(#velvet)"/>
  <ellipse cx="300" cy="598" rx="190" ry="28" fill="#8a3cb8"/>
  <path d="M 130 650 C 130 672 470 672 470 650" stroke="url(#brass)" stroke-width="8" fill="none"/>
  <ellipse cx="300" cy="598" rx="190" ry="28" fill="none" stroke="url(#brass)" stroke-width="8"/>
  <!-- collar the ball sits in -->
  <path d="M 180 560 C 180 520 420 520 420 560 L 404 600 C 404 616 196 616 196 600 Z" fill="url(#brass)"/>
  <ellipse cx="300" cy="546" rx="126" ry="20" fill="#3a2410"/>
  <!-- claws (behind the glass on the far side, in front on the near side) -->
  <path d="M 150 560 C 110 520 90 460 100 400 C 108 440 126 470 150 486 C 150 510 156 540 176 562 Z" fill="url(#brass)"/>
  <path d="M 450 560 C 490 520 510 460 500 400 C 492 440 474 470 450 486 C 450 510 444 540 424 562 Z" fill="url(#brass)"/>
  <path d="M 100 400 L 92 380 L 108 392 Z M 500 400 L 508 380 L 492 392 Z" fill="#ffe4a0"/>
  <!-- gems -->
  <circle cx="300" cy="580" r="12" fill="#6dffb0"/><circle cx="296" cy="576" r="4" fill="#e8fff2"/>
  <circle cx="220" cy="578" r="7" fill="#b78cff"/><circle cx="380" cy="578" r="7" fill="#b78cff"/>
</svg>`;
