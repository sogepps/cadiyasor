/** One flame tongue for the cauldron fire and the candles; the app stacks and flickers several. 120 × 200, base at (60, 190). */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="200" viewBox="0 0 120 200" data-scale="1">
  <defs>
    <linearGradient id="outer" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#ff5a1a"/>
      <stop offset="0.6" stop-color="#ff9a2a"/>
      <stop offset="1" stop-color="#ffcf5a" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="inner" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#fff4c2"/>
      <stop offset="1" stop-color="#ffd35a" stop-opacity="0.4"/>
    </linearGradient>
    <filter id="b"><feGaussianBlur stdDeviation="2.5"/></filter>
  </defs>
  <path filter="url(#b)" fill="url(#outer)" d="M 60 8 C 70 44 104 78 104 128 C 104 164 84 190 60 190 C 36 190 16 164 16 128 C 16 96 38 78 46 50 C 50 64 56 70 60 74 C 62 52 58 30 60 8 Z"/>
  <path filter="url(#b)" fill="url(#inner)" d="M 60 80 C 66 104 84 122 84 146 C 84 170 72 184 60 184 C 48 184 36 170 36 146 C 36 124 54 110 60 80 Z"/>
</svg>`;
