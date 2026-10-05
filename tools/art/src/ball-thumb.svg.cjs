/** The whole crystal ball (stand + misty sphere + glass) in one picture, for the home tile. */
const { png } = require('./icon-lib.cjs');

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700" data-scale="0.8">
  <defs>
    <radialGradient id="ball" cx="0.45" cy="0.4" r="0.6">
      <stop offset="0" stop-color="#8a5ae0"/>
      <stop offset="0.6" stop-color="#3a1a7a"/>
      <stop offset="1" stop-color="#14072e"/>
    </radialGradient>
    <radialGradient id="mist1" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#5fe0d0" stop-opacity="0.7"/>
      <stop offset="1" stop-color="#5fe0d0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mist2" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ff7ac8" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#ff7ac8" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="c"><circle cx="300" cy="290" r="230"/></clipPath>
  </defs>
  <image href="${png('ball-stand.png')}" x="0" y="0" width="600" height="700"/>
  <g clip-path="url(#c)">
    <circle cx="300" cy="290" r="230" fill="url(#ball)"/>
    <circle cx="240" cy="320" r="170" fill="url(#mist1)"/>
    <circle cx="370" cy="250" r="150" fill="url(#mist2)"/>
  </g>
  <image href="${png('ball-glass.png')}" x="0" y="0" width="600" height="700"/>
</svg>`;
