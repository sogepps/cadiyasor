/**
 * The witch's black cat, sitting and looking at the viewer, tail curled around its paws.
 * 300 × 340. Eyes are drawn by the app (so it can blink): left eye (122, 118), right eye (178, 118),
 * each about 17 × 12.
 */
module.exports = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="340" viewBox="0 0 300 340" data-scale="2">
  <defs>
    <linearGradient id="fur" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0c0718"/>
      <stop offset="0.75" stop-color="#150d2c"/>
      <stop offset="1" stop-color="#2a1d58"/>
    </linearGradient>
  </defs>
  <!-- tail -->
  <path fill="url(#fur)" d="M 206 300 C 262 300 286 262 270 222 C 262 202 244 196 236 206 C 250 214 262 240 250 262 C 238 284 214 286 196 284 Z"/>
  <!-- body -->
  <path fill="url(#fur)" d="M 150 150 C 110 150 92 190 90 240 C 88 280 96 306 110 316 L 190 316 C 204 306 212 280 210 240 C 208 190 190 150 150 150 Z"/>
  <!-- front paws -->
  <ellipse cx="126" cy="318" rx="20" ry="10" fill="#120a26"/>
  <ellipse cx="174" cy="318" rx="20" ry="10" fill="#120a26"/>
  <!-- head -->
  <path fill="url(#fur)" d="M 96 70 L 112 104 C 100 116 96 130 98 142 C 102 166 126 178 150 178 C 174 178 198 166 202 142 C 204 130 200 116 188 104 L 204 70 L 170 92 C 158 88 142 88 130 92 Z"/>
  <!-- inner ears -->
  <path d="M 104 80 L 114 100 L 126 94 Z" fill="#5a2f6e" opacity="0.8"/>
  <path d="M 196 80 L 186 100 L 174 94 Z" fill="#5a2f6e" opacity="0.8"/>
  <!-- moonlit rim on the right -->
  <path d="M 204 70 L 188 104 C 200 116 204 130 202 142 C 200 158 190 170 176 176 C 192 166 198 150 196 136 C 194 122 186 110 178 104 Z" fill="#8d7bf0" opacity="0.4"/>
  <path d="M 190 170 C 204 200 212 240 208 290 C 206 270 200 210 184 176 Z" fill="#8d7bf0" opacity="0.35"/>
  <!-- nose and whiskers -->
  <path d="M 144 140 L 156 140 L 150 147 Z" fill="#c07aa8"/>
  <g stroke="#6a5aa8" stroke-width="1.6" opacity="0.7" stroke-linecap="round">
    <path d="M 132 146 L 88 138"/><path d="M 132 150 L 90 154"/>
    <path d="M 168 146 L 212 138"/><path d="M 168 150 L 210 154"/>
  </g>
  <!-- a tiny collar with a moon tag -->
  <path d="M 118 172 C 138 182 162 182 182 172" stroke="#6d3fc9" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M 158 186 A 9 9 0 1 1 146 178 A 7 7 0 1 0 158 186 Z" fill="#ffd35a"/>
</svg>`;
