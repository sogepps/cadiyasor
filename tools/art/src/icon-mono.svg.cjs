/** Themed (monochrome) icon: the witch's head and hat as a white silhouette. */
const { foreground } = require('./icon-lib.cjs');

module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024" data-scale="1" data-out="assets/adaptive-icon-monochrome.png">
  <defs>
    <filter id="white"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
  </defs>
  <g filter="url(#white)">${foreground(0.7).replace(/<image href="data:image\/png;base64,[^"]*" x="300"[^>]*\/>/, '').replace(/<circle cx="560" cy="470" r="360"[^>]*\/>/, '')}</g>
</svg>`;
