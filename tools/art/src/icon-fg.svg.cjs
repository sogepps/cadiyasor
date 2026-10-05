/** Adaptive icon foreground: moon + witch inside the 66 % safe zone, transparent around it. */
const { foreground } = require('./icon-lib.cjs');

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" data-scale="1" data-out="assets/adaptive-icon-foreground.png">
  ${foreground(0.7)}
</svg>`;
