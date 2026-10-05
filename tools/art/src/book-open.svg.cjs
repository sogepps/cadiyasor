/**
 * The grimoire lying open: two aged pages with faint diagrams on the left page. The app writes the
 * answer on the right page and the page number under it. 760 × 480.
 * Right page text box: x 404–690, y 90–350. Left page number at (200, 392), right at (548, 392).
 */
const { rng } = require('./lib.cjs');

const rand = rng(8);
const scribbles = [];
for (let i = 0; i < 9; i++) {
  const y = 250 + i * 13;
  const x0 = 110 + rand() * 20;
  const x1 = 300 - rand() * 60;
  scribbles.push(`<path d="M ${x0} ${y} C ${(x0 + x1) / 2} ${y - 3} ${(x0 + x1) / 2} ${y + 3} ${x1} ${y}" stroke="#7a5a3a" stroke-width="2" opacity="0.28" fill="none"/>`);
}

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="480" viewBox="0 0 760 480" data-scale="1.5">
  <defs>
    <linearGradient id="left" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" stop-color="#b49a6c"/>
      <stop offset="0.12" stop-color="#e8d6ae"/>
      <stop offset="0.85" stop-color="#f3e5c2"/>
      <stop offset="1" stop-color="#dcc79c"/>
    </linearGradient>
    <linearGradient id="right" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#b49a6c"/>
      <stop offset="0.12" stop-color="#ecdcb6"/>
      <stop offset="0.85" stop-color="#f6e9c8"/>
      <stop offset="1" stop-color="#dfcaa0"/>
    </linearGradient>
    <filter id="paper" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.05" numOctaves="4" seed="12" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.12  0 0 0 0.5 -0.1" result="g"/>
      <feComposite in="g" in2="SourceGraphic" operator="in"/>
    </filter>
    <filter id="blur"><feGaussianBlur stdDeviation="10"/></filter>
  </defs>
  <ellipse cx="380" cy="446" rx="340" ry="24" fill="#000" opacity="0.45" filter="url(#blur)"/>
  <!-- cover peeking out under the pages -->
  <path d="M 20 70 C 150 56 300 60 380 84 C 460 60 610 56 740 70 L 740 420 C 610 408 460 410 380 432 C 300 410 150 408 20 420 Z" fill="#4a1838"/>
  <!-- page stacks -->
  <path d="M 34 76 C 160 62 300 66 380 90 L 380 424 C 300 402 160 400 34 412 Z" fill="#c9b083"/>
  <path d="M 726 76 C 600 62 460 66 380 90 L 380 424 C 460 402 600 400 726 412 Z" fill="#c9b083"/>
  <!-- left page -->
  <path d="M 42 70 C 170 56 306 62 380 86 L 380 418 C 306 396 170 394 42 404 Z" fill="url(#left)"/>
  <path d="M 42 70 C 170 56 306 62 380 86 L 380 418 C 306 396 170 394 42 404 Z" fill="#000" filter="url(#paper)"/>
  <!-- right page -->
  <path d="M 718 70 C 590 56 454 62 380 86 L 380 418 C 454 396 590 394 718 404 Z" fill="url(#right)"/>
  <path d="M 718 70 C 590 56 454 62 380 86 L 380 418 C 454 396 590 394 718 404 Z" fill="#000" filter="url(#paper)"/>
  <!-- gutter shadow -->
  <path d="M 356 84 L 380 90 L 404 84 L 404 420 L 380 426 L 356 420 Z" fill="#6a4a2a" opacity="0.25"/>
  <!-- left page: moon-phase diagram and scribbles -->
  <g stroke="#7a5a3a" stroke-width="2" fill="none" opacity="0.4">
    <circle cx="210" cy="170" r="62"/>
    <circle cx="210" cy="170" r="84" stroke-dasharray="4 8"/>
    <path d="M 210 86 L 210 254 M 126 170 L 294 170"/>
  </g>
  <g fill="#7a5a3a" opacity="0.4">
    <circle cx="210" cy="86" r="10"/><path d="M 294 160 A 10 10 0 1 1 294 180 A 6 10 0 1 0 294 160 Z"/>
    <path d="M 210 244 A 10 10 0 1 0 210 264 A 10 10 0 1 0 210 244 Z" opacity="0.3"/><path d="M 126 160 A 10 10 0 1 0 126 180 A 6 10 0 1 1 126 160 Z"/>
  </g>
  ${scribbles.join('')}
  <!-- ribbon bookmark -->
  <path d="M 676 74 L 676 470 L 688 456 L 700 470 L 700 72 Z" fill="#7a1f4a"/>
  <path d="M 676 74 L 676 470 L 682 463 L 682 74 Z" fill="#b0346c" opacity="0.6"/>
</svg>`;
