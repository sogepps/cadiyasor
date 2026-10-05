/** Splash image: the icon's moon and witch on transparent, shown on the night colour. */
const { foreground } = require('./icon-lib.cjs');

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" data-scale="1" data-out="assets/splash-icon.png">
  ${foreground(0.9)}
</svg>`;
