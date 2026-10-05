/**
 * The iron cauldron on its fire logs. The mouth (inner ellipse) is left dark: the app draws the
 * glowing, bubbling potion on top of it so it can change colour with the answer.
 *
 * Mouth ellipse in this 600 × 560 drawing: centre (300, 150), rx 196, ry 34.
 */
const W = 600;
const H = 560;

const rivets = [];
for (let i = 0; i < 13; i++) {
  const t = (i + 0.5) / 13;
  const x = 70 + t * 460;
  const k = (x - 300) / 240;
  const y = 262 + 34 * Math.sqrt(Math.max(0, 1 - k * k));
  rivets.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="#4b4178"/><circle cx="${(x - 1.5).toFixed(1)}" cy="${(y - 1.5).toFixed(1)}" r="2" fill="#a597e6" opacity="0.8"/>`);
}

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" data-scale="1.5">
  <defs>
    <radialGradient id="belly" cx="0.68" cy="0.3" r="0.85">
      <stop offset="0" stop-color="#4a4078"/>
      <stop offset="0.35" stop-color="#29224a"/>
      <stop offset="0.8" stop-color="#120e24"/>
      <stop offset="1" stop-color="#0a0816"/>
    </radialGradient>
    <linearGradient id="bellyGlow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6dffb0" stop-opacity="0.32"/>
      <stop offset="0.3" stop-color="#6dffb0" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="fireLight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.6" stop-color="#ff8a2a" stop-opacity="0"/>
      <stop offset="1" stop-color="#ff8a2a" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="lip" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#2a2350"/>
      <stop offset="0.55" stop-color="#3e3470"/>
      <stop offset="0.85" stop-color="#8676d6"/>
      <stop offset="1" stop-color="#3a3068"/>
    </linearGradient>
    <linearGradient id="log" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7a4a2a"/>
      <stop offset="1" stop-color="#3a2012"/>
    </linearGradient>
    <radialGradient id="ember" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffd27a"/>
      <stop offset="0.5" stop-color="#ff7a1a"/>
      <stop offset="1" stop-color="#ff4a00" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur8" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
    <mask id="ring">
      <rect width="${W}" height="${H}" fill="white"/>
      <ellipse cx="300" cy="150" rx="196" ry="34" fill="black"/>
    </mask>
  </defs>

  <!-- fire glow on the ground -->
  <ellipse cx="300" cy="520" rx="220" ry="34" fill="url(#ember)" opacity="0.7" filter="url(#blur8)"/>

  <!-- logs -->
  <g>
    <path d="M 120 520 L 470 488 C 486 487 492 506 478 512 L 132 548 C 112 550 104 524 120 520 Z" fill="url(#log)"/>
    <path d="M 140 488 L 478 526 C 494 528 492 552 474 552 L 130 516 C 112 512 120 486 140 488 Z" fill="url(#log)"/>
    <ellipse cx="124" cy="532" rx="12" ry="16" fill="#c9884a"/><ellipse cx="124" cy="532" rx="6" ry="9" fill="#8a5530"/>
    <ellipse cx="480" cy="539" rx="12" ry="14" fill="#c9884a"/><ellipse cx="480" cy="539" rx="6" ry="8" fill="#8a5530"/>
    <ellipse cx="300" cy="512" rx="80" ry="12" fill="#ffb347" opacity="0.8" filter="url(#blur8)"/>
  </g>

  <!-- legs -->
  <path d="M 150 440 L 190 452 L 170 506 C 166 512 150 512 148 504 Z" fill="#161229"/>
  <path d="M 450 440 L 410 452 L 430 506 C 434 512 450 512 452 504 Z" fill="#1e1838"/>
  <path d="M 282 470 L 318 470 L 312 520 C 310 526 290 526 288 520 Z" fill="#191431"/>

  <!-- side lugs -->
  <path d="M 70 196 C 30 196 26 250 64 256" stroke="#2e2656" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M 530 196 C 570 196 574 250 536 256" stroke="#5a4d9c" stroke-width="16" fill="none" stroke-linecap="round"/>

  <!-- belly -->
  <path d="M 84 158 C 22 240 36 420 172 468 C 240 486 360 486 428 468 C 564 420 578 240 516 158 Z" fill="url(#belly)"/>
  <path d="M 84 158 C 22 240 36 420 172 468 C 240 486 360 486 428 468 C 564 420 578 240 516 158 Z" fill="url(#bellyGlow)"/>
  <path d="M 84 158 C 22 240 36 420 172 468 C 240 486 360 486 428 468 C 564 420 578 240 516 158 Z" fill="url(#fireLight)"/>
  <!-- moonlight streak -->
  <path d="M 470 190 C 520 240 526 330 490 400 C 506 330 500 260 460 206 Z" fill="#c3b6ff" opacity="0.28"/>
  <!-- iron band with rivets -->
  <path d="M 58 250 C 140 300 460 300 542 250 L 546 272 C 460 322 140 322 54 272 Z" fill="#1c1734"/>
  <path d="M 58 250 C 140 300 460 300 542 250 L 543 256 C 460 306 140 306 57 256 Z" fill="#5c4f9c" opacity="0.6"/>
  ${rivets.join('\n  ')}

  <!-- lip -->
  <g mask="url(#ring)">
    <ellipse cx="300" cy="156" rx="238" ry="54" fill="#0e0b1e"/>
    <ellipse cx="300" cy="150" rx="236" ry="50" fill="url(#lip)"/>
    <ellipse cx="300" cy="146" rx="222" ry="42" fill="none" stroke="#b7a9ff" stroke-width="3" opacity="0.35"/>
  </g>
  <!-- the mouth: dark until the app pours the potion in -->
  <ellipse cx="300" cy="150" rx="196" ry="34" fill="#06140d"/>
  <ellipse cx="300" cy="150" rx="196" ry="34" fill="none" stroke="#6dffb0" stroke-width="4" opacity="0.45"/>
</svg>`;
