/**
 * A band of soft ground fog that tiles horizontally (the app scrolls two copies side by side).
 * 1080 × 360, white with varying alpha; the app tints it with opacity.
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="360" viewBox="0 0 1080 360" data-scale="1">
  <defs>
    <filter id="cloud" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0046 0.012" numOctaves="4" seed="5" stitchTiles="stitch" result="n"/>
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 2.6 -1.05" result="a"/>
      <feGaussianBlur in="a" stdDeviation="4"/>
    </filter>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="white" stop-opacity="0"/>
      <stop offset="0.45" stop-color="white" stop-opacity="1"/>
      <stop offset="1" stop-color="white" stop-opacity="0.7"/>
    </linearGradient>
    <mask id="m"><rect width="1080" height="360" fill="url(#fade)"/></mask>
  </defs>
  <rect width="1080" height="360" filter="url(#cloud)" mask="url(#m)"/>
</svg>`;
