/**
 * The grimoire, closed, seen from slightly above: thick leather cover, brass corners, a clasp and
 * a glowing moon-eye sigil the app can pulse. 640 × 480. Sigil centre (320, 222).
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480" data-scale="1.5">
  <defs>
    <linearGradient id="leather" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#6b2a4e"/>
      <stop offset="0.5" stop-color="#4a1838"/>
      <stop offset="1" stop-color="#2a0c22"/>
    </linearGradient>
    <linearGradient id="pages" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f1e2bd"/>
      <stop offset="1" stop-color="#c9b083"/>
    </linearGradient>
    <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffe4a0"/>
      <stop offset="0.5" stop-color="#d49a3a"/>
      <stop offset="1" stop-color="#8a5a1c"/>
    </linearGradient>
    <radialGradient id="sigilGlow">
      <stop offset="0" stop-color="#b8ffda" stop-opacity="0.9"/>
      <stop offset="1" stop-color="#6dffb0" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="2" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.28 0" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="blur"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <!-- shadow -->
  <ellipse cx="320" cy="440" rx="270" ry="26" fill="#000" opacity="0.45" filter="url(#blur)"/>
  <!-- page block (the thickness) -->
  <path d="M 70 360 L 76 404 C 200 424 440 424 564 404 L 570 360 Z" fill="url(#pages)"/>
  <g stroke="#b39a6c" stroke-width="1.4" opacity="0.7">
    <path d="M 78 372 C 200 390 440 390 562 372"/><path d="M 78 382 C 200 400 440 400 562 382"/><path d="M 78 392 C 200 410 440 410 562 392"/>
  </g>
  <!-- back cover edge -->
  <path d="M 60 404 C 200 430 440 430 580 404 L 580 414 C 440 440 200 440 60 414 Z" fill="#2a0c22"/>
  <!-- front cover -->
  <path d="M 58 70 C 200 50 440 50 582 70 L 578 364 C 440 384 200 384 62 364 Z" fill="url(#leather)"/>
  <path d="M 58 70 C 200 50 440 50 582 70 L 578 364 C 440 384 200 384 62 364 Z" fill="#000" filter="url(#grain)"/>
  <!-- spine ridges -->
  <path d="M 58 70 L 62 364 L 84 366 L 80 68 Z" fill="#2e0e25"/>
  <g stroke="#8a3a66" stroke-width="3" opacity="0.8"><path d="M 60 120 L 82 120"/><path d="M 60 220 L 82 220"/><path d="M 61 320 L 83 320"/></g>
  <!-- tooled border -->
  <path d="M 110 96 C 220 82 420 82 540 96 L 536 338 C 420 352 220 352 114 338 Z" fill="none" stroke="#c98a3a" stroke-width="3" opacity="0.7"/>
  <path d="M 122 108 C 222 96 418 96 528 108 L 525 326 C 418 338 222 338 126 326 Z" fill="none" stroke="#c98a3a" stroke-width="1.5" opacity="0.5"/>
  <!-- sigil: an eye inside a crescent, with stars -->
  <circle cx="320" cy="222" r="120" fill="url(#sigilGlow)" opacity="0.35"/>
  <path d="M 388 170 A 84 84 0 1 0 388 274 A 66 66 0 1 1 388 170 Z" fill="none" stroke="#9dffcf" stroke-width="5"/>
  <path d="M 262 222 C 290 186 350 186 378 222 C 350 258 290 258 262 222 Z" fill="none" stroke="#9dffcf" stroke-width="5"/>
  <circle cx="320" cy="222" r="18" fill="#9dffcf"/>
  <circle cx="320" cy="222" r="7" fill="#2a0c22"/>
  <g fill="#9dffcf">
    <path d="M 320 120 L 324 132 L 336 136 L 324 140 L 320 152 L 316 140 L 304 136 L 316 132 Z"/>
    <path d="M 320 292 L 323 301 L 332 304 L 323 307 L 320 316 L 317 307 L 308 304 L 317 301 Z"/>
    <path d="M 214 222 L 217 231 L 226 234 L 217 237 L 214 246 L 211 237 L 202 234 L 211 231 Z" transform="translate(0,-12)"/>
  </g>
  <!-- brass corners -->
  <path d="M 540 64 L 582 70 L 581 118 C 570 100 556 84 540 64 Z" fill="url(#brass)"/>
  <path d="M 578 318 L 578 364 L 534 370 C 552 352 566 338 578 318 Z" fill="url(#brass)"/>
  <path d="M 84 66 L 58 70 L 59 110 C 66 94 74 80 84 66 Z" fill="url(#brass)"/>
  <!-- clasp -->
  <path d="M 574 190 L 612 186 C 622 186 626 196 626 222 C 626 248 622 258 612 258 L 574 254 Z" fill="#3a1030"/>
  <rect x="592" y="204" width="30" height="36" rx="6" fill="url(#brass)"/>
  <circle cx="607" cy="222" r="6" fill="#5a3410"/>
</svg>`;
