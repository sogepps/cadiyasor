/**
 * The witch, standing behind her cauldron with both hands over it. Lit from below by the green
 * potion and from the upper right by the moon. The cauldron itself is a separate piece that sits
 * in front of her: its rim is at y ≈ 790 in this drawing, so everything below is hidden.
 *
 * Eye centre (for the blink overlay in the app): (455, 386) of 800 × 1000.
 */
const { taper, tip, rng } = require('./lib.cjs');

const W = 800;
const H = 1000;

/** A bony hand hanging palm-down; `inward` = +1 curls the fingers to the right, -1 to the left. */
function hand(x, y, inward) {
  const parts = [];
  parts.push(
    `M ${x - 20} ${y} L ${x + 20} ${y} C ${x + 25} ${y + 14} ${x + 29} ${y + 26} ${x + 29} ${y + 38} ` +
      `C ${x + 10} ${y + 45} ${x - 10} ${y + 45} ${x - 29} ${y + 38} C ${x - 29} ${y + 26} ${x - 25} ${y + 14} ${x - 20} ${y} Z`,
  );
  [-21, -7, 7, 21].forEach((off, i) => {
    const a1 = 90 - off * 0.75;
    const len1 = [24, 30, 30, 23][i];
    const bx = x + off;
    const by = y + 34;
    parts.push(taper(bx, by, a1, len1, 13, 10.5, 0));
    const [tx, ty] = tip(bx, by, a1, len1, 0);
    const a2 = a1 - 32 * inward;
    parts.push(taper(tx - 0.5 * inward, ty - 2, a2, [22, 27, 27, 20][i], 10.5, 3, 3 * inward));
  });
  parts.push(taper(x + 20 * inward, y + 8, inward > 0 ? 38 : 142, 34, 14, 4, -4 * inward));
  return parts;
}

/** Straggly strands of hair falling from under the brim. */
function hair() {
  const rand = rng(11);
  const back = [];
  const light = [];
  for (let i = 0; i < 16; i++) {
    const x = 300 + i * 7.5 + rand() * 6;
    const ang = 104 + rand() * 18 - i * 0.6;
    const len = 150 + rand() * 90 - Math.abs(i - 7) * 4;
    const d = taper(x, 344, ang, len, 22 - rand() * 6, 3 + rand() * 2, (rand() - 0.5) * 50);
    (i % 4 === 1 ? light : back).push(d);
  }
  return { back, light };
}

const strands = hair();

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-scale="1.5">
  <defs>
    <linearGradient id="robe" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#26164a"/>
      <stop offset="0.6" stop-color="#170c30"/>
      <stop offset="1" stop-color="#0d0620"/>
    </linearGradient>
    <linearGradient id="sleeve" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3a2470"/>
      <stop offset="0.7" stop-color="#281654"/>
      <stop offset="1" stop-color="#1e1042"/>
    </linearGradient>
    <linearGradient id="robeGlow" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="800">
      <stop offset="0" stop-color="#6dffb0" stop-opacity="0"/>
      <stop offset="1" stop-color="#6dffb0" stop-opacity="0.34"/>
    </linearGradient>
    <linearGradient id="hat" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#140b2a"/>
      <stop offset="0.7" stop-color="#23154a"/>
      <stop offset="1" stop-color="#3b2a78"/>
    </linearGradient>
    <linearGradient id="brim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a1b58"/>
      <stop offset="1" stop-color="#120a28"/>
    </linearGradient>
    <linearGradient id="skin" gradientUnits="userSpaceOnUse" x1="0" y1="340" x2="0" y2="790">
      <stop offset="0" stop-color="#2c5240"/>
      <stop offset="0.35" stop-color="#4b8767"/>
      <stop offset="0.72" stop-color="#78d19f"/>
      <stop offset="1" stop-color="#c2ffdc"/>
    </linearGradient>
    <linearGradient id="hair" gradientUnits="userSpaceOnUse" x1="0" y1="340" x2="0" y2="600">
      <stop offset="0" stop-color="#1c1236"/>
      <stop offset="1" stop-color="#2c1f55"/>
    </linearGradient>
    <radialGradient id="eyeGlow">
      <stop offset="0" stop-color="#fff3b0"/>
      <stop offset="0.5" stop-color="#ffd35a"/>
      <stop offset="1" stop-color="#ffb020" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6"/>
    </filter>
  </defs>

  <!-- hair behind the head -->
  <g fill="url(#hair)">${strands.back.map((d) => `<path d="${d}"/>`).join('')}</g>
  <g fill="#4a3a86" opacity="0.8">${strands.light.map((d) => `<path d="${d}"/>`).join('')}</g>

  <!-- robe -->
  <path fill="url(#robe)" d="M 296 512 C 352 492 478 490 540 510 C 600 560 630 720 650 1000 L 160 1000 C 176 720 226 560 296 512 Z"/>
  <path fill="url(#robeGlow)" d="M 296 512 C 352 492 478 490 540 510 C 600 560 630 720 650 1000 L 160 1000 C 176 720 226 560 296 512 Z"/>
  <path fill="#9a86ff" opacity="0.25" d="M 540 510 C 590 552 616 650 630 760 C 608 660 584 590 530 530 Z"/>
  <!-- a row of little buttons down the front -->
  <g fill="#f2c14e" opacity="0.8">
    <circle cx="416" cy="560" r="5"/><circle cx="418" cy="600" r="5"/><circle cx="420" cy="640" r="5"/><circle cx="422" cy="680" r="5"/>
  </g>

  <!-- neck + face (profile, facing right) -->
  <path fill="url(#skin)" d="M 398 352 L 452 352 C 462 370 470 382 480 390 C 504 402 530 414 548 424 C 553 429 549 436 540 436
    C 516 435 492 433 476 435 C 482 443 484 451 478 457 C 490 463 502 475 508 490 C 510 498 502 500 494 496
    C 474 491 452 494 436 502 L 432 506 L 390 506 L 386 486 C 380 466 378 438 380 410 C 382 388 388 368 398 352 Z"/>
  <path fill="#1d3a2d" opacity="0.4" d="M 412 420 C 430 430 440 452 436 482 C 424 470 414 450 412 420 Z"/>
  <!-- ear peeking through the hair -->
  <path fill="#3d6e55" d="M 398 398 C 386 392 378 404 384 418 C 388 428 396 430 402 424 Z"/>
  <!-- wart -->
  <circle cx="514" cy="413" r="5.5" fill="#3f7a5a"/>
  <circle cx="512.5" cy="411.5" r="2" fill="#9ae8bd" opacity="0.7"/>
  <!-- brow -->
  <path d="M 428 370 C 444 360 462 362 474 374" stroke="#10241a" stroke-width="7" stroke-linecap="round" fill="none"/>
  <!-- glowing eye -->
  <ellipse cx="455" cy="386" rx="22" ry="16" fill="url(#eyeGlow)" opacity="0.55" filter="url(#soft)"/>
  <path d="M 440 387 C 448 377 462 377 470 386 C 462 393 448 394 440 387 Z" fill="#ffd35a"/>
  <ellipse cx="457" cy="385.5" rx="2.6" ry="6" fill="#1a0f05"/>
  <!-- grin with one tooth -->
  <path d="M 478 456 C 466 466 448 467 432 458" stroke="#10241a" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M 455 463 L 462 463 L 460 473 Z" fill="#f4f0d6"/>

  <!-- spiky high collar, in front of the neck -->
  <path fill="#150b2e" d="M 314 520 L 276 452 L 334 492 L 342 438 L 384 496 L 440 500 L 492 440 L 498 496 L 550 452 L 522 522 C 460 508 380 508 314 520 Z"/>
  <path fill="#6b4bd6" opacity="0.4" d="M 492 440 L 498 496 L 550 452 L 522 522 L 508 514 L 532 472 L 500 502 Z"/>

  <!-- hat brim -->
  <path fill="url(#brim)" d="M 168 340 C 236 300 560 288 646 322 C 660 332 616 352 564 356 C 462 368 300 370 204 360 C 170 356 156 348 168 340 Z"/>
  <path fill="#8d78ff" opacity="0.35" d="M 560 300 C 606 304 640 312 646 322 C 650 328 634 336 612 342 C 626 330 604 318 560 312 Z"/>
  <!-- hat cone with the bent tip -->
  <path fill="url(#hat)" d="M 298 338 C 318 270 358 192 392 132 C 412 98 442 70 480 58 C 512 50 546 62 564 90
    C 548 80 522 78 504 86 C 474 100 464 142 470 202 C 476 252 488 300 506 338 Z"/>
  <path fill="#a792ff" opacity="0.32" d="M 470 202 C 476 252 488 300 506 338 L 494 338 C 480 300 470 256 466 206 Z"/>
  <path d="M 400 128 C 420 150 440 158 468 150" stroke="#0b0618" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
  <!-- band + buckle -->
  <path fill="#5a2fa0" d="M 310 300 C 376 290 442 290 494 298 L 505 336 C 440 328 372 328 298 336 Z"/>
  <path fill="#8a5cf0" opacity="0.5" d="M 310 300 C 376 290 442 290 494 298 L 496 305 C 440 298 372 298 309 306 Z"/>
  <rect x="382" y="295" width="42" height="38" rx="4" fill="none" stroke="#f2c14e" stroke-width="7"/>
  <rect x="382" y="295" width="42" height="38" rx="4" fill="none" stroke="#fff0b8" stroke-width="2" opacity="0.7"/>
  <!-- a little moon charm hanging from the tip -->
  <path d="M 564 90 L 566 120" stroke="#b9a7ff" stroke-width="2"/>
  <path d="M 574 126 A 12 12 0 1 1 558 118 A 9 9 0 1 0 574 126 Z" fill="#ffe89a"/>

  <!-- sleeves, reaching forward over the cauldron -->
  <path fill="url(#sleeve)" d="M 322 522 C 290 566 262 626 246 676 C 238 694 224 712 208 724 C 240 734 282 732 306 716 C 306 682 316 646 340 604 Z"/>
  <path fill="url(#sleeve)" d="M 510 522 C 542 566 570 626 586 676 C 594 694 608 712 624 724 C 592 734 550 732 526 716 C 526 682 516 646 492 604 Z"/>
  <path fill="#b6a4ff" opacity="0.28" d="M 510 522 C 542 566 570 626 586 676 C 594 694 608 712 624 724 L 612 722 C 590 700 578 660 562 616 C 548 580 530 552 510 522 Z"/>
  <path fill="#6dffb0" opacity="0.35" d="M 208 724 C 240 734 282 732 306 716 L 305 704 C 280 718 244 722 220 716 Z"/>
  <path fill="#6dffb0" opacity="0.35" d="M 624 724 C 592 734 550 732 526 716 L 527 704 C 552 718 588 722 612 716 Z"/>

  <!-- hands over the cauldron -->
  <g fill="url(#skin)">
    ${hand(258, 716, 1).map((d) => `<path d="${d}"/>`).join('\n    ')}
    ${hand(576, 716, -1).map((d) => `<path d="${d}"/>`).join('\n    ')}
  </g>
</svg>`;
