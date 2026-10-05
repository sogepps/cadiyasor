/** 512 × 512 hi-res icon for the Play listing. */
const { background, foreground } = require('./icon-lib.cjs');

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" data-scale="0.5" data-out="store/icon-512.png">
  ${background}
  ${foreground(1)}
</svg>`;
