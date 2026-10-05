/**
 * Synthesises every sound of the app from scratch, so nothing third-party ships.
 *
 *   node tools/audio/synth.mjs            writes assets/sounds/*.wav and night.mp3
 *
 * Plain additive/subtractive synthesis: sines with envelopes, filtered noise, a small Schroeder
 * reverb. Deterministic (seeded noise), so re-running gives identical files.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Mp3Encoder } from '@breezystack/lamejs';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'sounds');
const SR = 32000;
const TAU = Math.PI * 2;

let seed = 12345;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

const buf = (sec) => new Float32Array(Math.ceil(sec * SR));
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

/** One-pole filters and a biquad band-pass. */
function lowpass(x, cutoff) {
  const a = Math.exp((-TAU * cutoff) / SR);
  let y = 0;
  return x.map((v) => (y = (1 - a) * v + a * y));
}
function highpass(x, cutoff) {
  const lp = lowpass(x, cutoff);
  return x.map((v, i) => v - lp[i]);
}
function bandpass(x, f, q) {
  const w = (TAU * f) / SR;
  const alpha = Math.sin(w) / (2 * q);
  const b0 = alpha, b2 = -alpha, a0 = 1 + alpha, a1 = -2 * Math.cos(w), a2 = 1 - alpha;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x.map((v) => {
    const y = (b0 * v + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = v; y2 = y1; y1 = y;
    return y;
  });
}

/** Small Schroeder reverb: 4 combs + 2 all-passes. */
function reverb(x, mix = 0.3, size = 1) {
  const combs = [1116, 1188, 1277, 1356].map((n) => Math.round(n * size * (SR / 44100)));
  const out = new Float32Array(x.length);
  for (const n of combs) {
    const line = new Float32Array(n);
    let idx = 0, lp = 0;
    for (let i = 0; i < x.length; i++) {
      const y = line[idx];
      lp = y * 0.8 + lp * 0.2;
      line[idx] = x[i] + lp * 0.84;
      idx = (idx + 1) % n;
      out[i] += y / combs.length;
    }
  }
  for (const n of [556, 441].map((k) => Math.round(k * (SR / 44100)))) {
    const line = new Float32Array(n);
    let idx = 0;
    for (let i = 0; i < out.length; i++) {
      const b = line[idx];
      const y = -out[i] + b;
      line[idx] = out[i] + b * 0.5;
      idx = (idx + 1) % n;
      out[i] = y;
    }
  }
  return x.map((v, i) => v * (1 - mix) + out[i] * mix * 1.6);
}

function normalize(x, peak = 0.89) {
  let m = 0;
  for (const v of x) m = Math.max(m, Math.abs(v));
  const g = m > 0 ? peak / m : 1;
  return x.map((v) => v * g);
}

/** Short fade in/out so nothing clicks. */
function fades(x, inMs = 3, outMs = 20) {
  const a = Math.round((inMs / 1000) * SR), b = Math.round((outMs / 1000) * SR);
  for (let i = 0; i < a && i < x.length; i++) x[i] *= i / a;
  for (let i = 0; i < b && i < x.length; i++) x[x.length - 1 - i] *= i / b;
  return x;
}

function writeWav(name, x) {
  const data = Buffer.alloc(x.length * 2);
  x.forEach((v, i) => data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), i * 2));
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(path.join(OUT, `${name}.wav`), Buffer.concat([h, data]));
  console.log(`${name}.wav ${(x.length / SR).toFixed(2)}s ${Math.round((44 + data.length) / 1024)} KB`);
}

function writeMp3(name, x, kbps = 96) {
  const enc = new Mp3Encoder(1, SR, kbps);
  const pcm = Int16Array.from(x, (v) => Math.max(-32767, Math.min(32767, Math.round(v * 32767))));
  const chunks = [];
  for (let i = 0; i < pcm.length; i += 1152) {
    const out = enc.encodeBuffer(pcm.subarray(i, i + 1152));
    if (out.length) chunks.push(Buffer.from(out));
  }
  const end = enc.flush();
  if (end.length) chunks.push(Buffer.from(end));
  const file = Buffer.concat(chunks);
  fs.writeFileSync(path.join(OUT, `${name}.mp3`), file);
  console.log(`${name}.mp3 ${(x.length / SR).toFixed(1)}s ${Math.round(file.length / 1024)} KB`);
}

const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
const midi = (name) => {
  const m = name.match(/^([A-G]#?)(\d)$/);
  return NOTE[m[1]] + 12 * (Number(m[2]) + 1);
};

/** A bell / music-box strike: inharmonic partials with their own decays. */
function bell(out, start, f, amp, decay = 1.2, partials = [[1, 1, 1], [2.0, 0.35, 0.6], [3.01, 0.18, 0.4], [4.2, 0.1, 0.25], [5.4, 0.06, 0.18]]) {
  const s0 = Math.round(start * SR);
  const len = Math.min(out.length - s0, Math.round(decay * 5 * SR));
  for (const [ratio, a, d] of partials) {
    const fr = f * ratio;
    if (fr > SR / 2.2) continue;
    for (let i = 0; i < len; i++) {
      const t = i / SR;
      out[s0 + i] += amp * a * Math.sin(TAU * fr * t) * env(t, 0.002, decay * d);
    }
  }
}

/* ── effects ───────────────────────────────────────────────────────────────── */

function tap() {
  const x = buf(0.09);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = Math.sin(TAU * 1250 * t) * env(t, 0.001, 0.012) * 0.8 + noise() * env(t, 0.0005, 0.004) * 0.25;
  }
  return fades(normalize(lowpass(x, 5000), 0.6));
}

function bubble() {
  const x = buf(0.35);
  const pop = (start, f0, f1, dur, amp) => {
    const s = Math.round(start * SR);
    let ph = 0;
    for (let i = 0; i < dur * SR && s + i < x.length; i++) {
      const t = i / SR;
      const f = f0 * (f1 / f0) ** (t / dur);
      ph += (TAU * f) / SR;
      x[s + i] += Math.sin(ph) * env(t, 0.003, dur * 0.35) * amp;
    }
  };
  pop(0, 260, 780, 0.09, 1);
  pop(0.11, 340, 980, 0.07, 0.6);
  pop(0.2, 220, 640, 0.1, 0.45);
  return fades(normalize(reverb(x, 0.18, 0.6), 0.7));
}

function rub() {
  const x = buf(0.32);
  for (let k = 0; k < 7; k++) {
    const f = 2400 + rnd() * 3600;
    const s = Math.round(rnd() * 0.12 * SR);
    for (let i = 0; s + i < x.length; i++) {
      const t = i / SR;
      x[s + i] += Math.sin(TAU * f * t) * env(t, 0.004, 0.05) * 0.3;
    }
  }
  const hiss = bandpass(Float32Array.from(x, () => noise()), 5000, 2);
  for (let i = 0; i < x.length; i++) x[i] += hiss[i] * env(i / SR, 0.03, 0.08) * 0.12;
  return fades(normalize(reverb(x, 0.3, 0.8), 0.5));
}

function reveal() {
  const x = buf(3.2);
  // rising shimmer
  for (let i = 0; i < 0.6 * SR; i++) {
    const t = i / SR;
    const f = 600 + 2400 * (t / 0.6) ** 2;
    x[i] += Math.sin(TAU * f * t) * 0.08 * (t / 0.6);
  }
  // arpeggio of bells: A minor add9 up to the octave
  ['A5', 'C6', 'E6', 'B6', 'A6'].forEach((n, k) => bell(x, 0.35 + k * 0.09, hz(midi(n)), 0.55 - k * 0.04, 1.1));
  // warm pad under it
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const e = env(t, 0.4, 1.2) * 0.12;
    x[i] += e * (Math.sin(TAU * 220 * t) + Math.sin(TAU * 329.6 * t * 1.002) * 0.7 + Math.sin(TAU * 440 * t * 0.998) * 0.5);
  }
  return fades(normalize(reverb(x, 0.42, 1.1), 0.85), 5, 200);
}

function sparkle() {
  const x = buf(1.4);
  for (let k = 0; k < 14; k++) {
    const f = hz(midi(['E6', 'A6', 'B6', 'C7', 'E7'][k % 5])) * (1 + (rnd() - 0.5) * 0.01);
    bell(x, k * 0.05 + rnd() * 0.02, f, 0.25 * (1 - k / 18), 0.35, [[1, 1, 1], [2.76, 0.2, 0.4]]);
  }
  return fades(normalize(reverb(x, 0.45, 0.9), 0.6), 3, 150);
}

function page() {
  const x = buf(0.9);
  const n = Float32Array.from(x, () => noise());
  const b = bandpass(n, 3200, 0.8);
  for (let k = 0; k < 9; k++) {
    const s = Math.round((0.02 + k * 0.075 + rnd() * 0.02) * SR);
    for (let i = 0; i < 0.07 * SR && s + i < x.length; i++) {
      const t = i / SR;
      x[s + i] += b[s + i] * env(t, 0.004, 0.018) * (0.6 + rnd() * 0.4);
    }
  }
  return fades(normalize(highpass(x, 700), 0.6));
}

function thump() {
  const x = buf(0.7);
  let ph = 0;
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    const f = 60 + 90 * Math.exp(-t / 0.03);
    ph += (TAU * f) / SR;
    x[i] = Math.sin(ph) * env(t, 0.002, 0.12) + noise() * env(t, 0.001, 0.02) * 0.4;
  }
  return fades(normalize(reverb(lowpass(x, 1800), 0.2, 0.7), 0.85));
}

function whoosh() {
  const x = buf(1.1);
  const n = Float32Array.from(x, () => noise());
  const out = buf(1.1);
  // sweep a band-pass through the noise in short blocks
  const block = 256;
  for (let s = 0; s < x.length; s += block) {
    const t = s / x.length;
    const f = 300 + 2600 * Math.sin(Math.PI * t) ** 1.5;
    const seg = bandpass(n.subarray(Math.max(0, s - 512), s + block), f, 1.4);
    for (let i = 0; i < block && s + i < x.length; i++) out[s + i] = seg[seg.length - block + i] * Math.sin(Math.PI * t) ** 2;
  }
  return fades(normalize(reverb(out, 0.25, 0.8), 0.75), 10, 80);
}

function card() {
  const x = buf(0.45);
  const n = Float32Array.from(x, () => noise());
  const b = bandpass(n, 2200, 0.7);
  for (let i = 0; i < x.length; i++) {
    const t = i / SR;
    x[i] = b[i] * (env(t, 0.01, 0.05) * 0.8 + env(Math.max(0, t - 0.12), 0.005, 0.03) * 0.9 * (t > 0.12 ? 1 : 0));
  }
  bell(x, 0.14, hz(midi('E6')), 0.25, 0.4);
  return fades(normalize(x, 0.7));
}

/**
 * Formant synthesis of a voice syllable: a glottal pulse train shaped by three vowel resonances.
 * Used for the cat and the witch's cackle.
 */
function voice(out, start, dur, f0From, f0To, formants, amp, breath = 0.15) {
  const s0 = Math.round(start * SR);
  const n = Math.round(dur * SR);
  const src = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f0 = f0From * (f0To / f0From) ** (t / dur) * (1 + 0.02 * Math.sin(TAU * 6 * t));
    ph += f0 / SR;
    if (ph >= 1) ph -= 1;
    // Rosenberg-like pulse: smooth opening, sharp closing
    const g = ph < 0.4 ? 0.5 * (1 - Math.cos(Math.PI * (ph / 0.4))) : ph < 0.55 ? Math.cos((Math.PI / 2) * ((ph - 0.4) / 0.15)) : 0;
    src[i] = g - 0.25 + noise() * breath;
  }
  let y = new Float32Array(n);
  for (const [f, q, g] of formants) {
    const b = bandpass(src, f, q);
    for (let i = 0; i < n; i++) y[i] += b[i] * g;
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const e = Math.min(1, t / 0.012) * Math.min(1, (dur - t) / 0.03);
    if (s0 + i < out.length) out[s0 + i] += y[i] * e * amp;
  }
}

function meow() {
  const x = buf(0.9);
  // "mi-aa-ow": the vowel formants glide while the pitch rises then falls
  const steps = 12;
  for (let k = 0; k < steps; k++) {
    const t = k / steps;
    const f1 = 350 + 550 * Math.sin(Math.PI * t);
    const f2 = 2100 - 900 * t;
    const p0 = 520 + 260 * Math.sin(Math.PI * t * 0.8);
    const p1 = 520 + 260 * Math.sin(Math.PI * (t + 1 / steps) * 0.8);
    voice(x, 0.05 + t * 0.6, 0.6 / steps + 0.02, p0, p1, [[f1, 5, 1], [f2, 8, 0.6], [3400, 10, 0.25]], 0.9, 0.08);
  }
  return fades(normalize(reverb(x, 0.15, 0.6), 0.7), 5, 60);
}

function laugh() {
  const x = buf(2.2);
  // "hee-hee-hee-heh-heh-HAAA": a high, nasal cackle that climbs down
  const syll = [
    [0.0, 0.13, 880, 820, 'i'],
    [0.2, 0.13, 900, 830, 'i'],
    [0.4, 0.13, 860, 790, 'i'],
    [0.6, 0.13, 800, 730, 'e'],
    [0.8, 0.14, 740, 660, 'e'],
    [1.0, 0.5, 700, 470, 'a'],
  ];
  const vowels = { i: [[330, 6, 1], [2500, 9, 0.7], [3300, 10, 0.4]], e: [[520, 6, 1], [2000, 9, 0.6], [2800, 10, 0.35]], a: [[850, 5, 1], [1300, 7, 0.7], [2700, 10, 0.3]] };
  for (const [s, d, a, b, v] of syll) {
    // the "h": breathy onset
    for (let i = 0; i < 0.05 * SR; i++) x[Math.round(s * SR) + i] += noise() * 0.12 * (1 - i / (0.05 * SR));
    voice(x, s + 0.03, d, a, b, vowels[v], 1, 0.22);
  }
  return fades(normalize(reverb(highpass(x, 180), 0.3, 1.0), 0.8), 5, 150);
}

/* ── music: a slow music-box waltz in A minor over a dark pad ────────────── */

function night() {
  const bpm = 88;
  const beat = 60 / bpm;
  const bars = 16;
  const len = bars * 3 * beat;
  const tail = 4;
  const x = buf(len + tail);

  const melody = [
    [['E5', 1], ['A5', 1], ['C6', 1]], [['B5', 2], ['A5', 1]], [['G#5', 1], ['A5', 1], ['B5', 1]], [['E5', 3]],
    [['F5', 1], ['A5', 1], ['D6', 1]], [['C6', 2], ['B5', 1]], [['A5', 1], ['G#5', 1], ['E5', 1]], [['A5', 3]],
    [['C6', 1], ['B5', 1], ['A5', 1]], [['G#5', 1], ['F5', 1], ['E5', 1]], [['D5', 1], ['F5', 1], ['A5', 1]], [['G#5', 3]],
    [['A5', 1], ['C6', 1], ['E6', 1]], [['D6', 2], ['C6', 1]], [['B5', 1], ['G#5', 1], ['B5', 1]], [['A5', 3]],
  ];
  const chords = ['Am', 'Am', 'E', 'E', 'Dm', 'Am', 'E', 'Am', 'Am', 'E', 'Dm', 'E', 'Am', 'Dm', 'E', 'Am'];
  const CH = { Am: ['A2', 'A3', 'C4', 'E4'], E: ['E2', 'G#3', 'B3', 'E4'], Dm: ['D2', 'A3', 'D4', 'F4'] };

  melody.forEach((bar, b) => {
    let t = b * 3 * beat;
    for (const [n, d] of bar) {
      bell(x, t, hz(midi(n)), 0.34, 1.5);
      t += d * beat;
    }
    const [bass, ...tri] = CH[chords[b]];
    bell(x, b * 3 * beat, hz(midi(bass)), 0.3, 2.2, [[1, 1, 1], [2, 0.3, 0.5], [3, 0.1, 0.3]]);
    for (const k of [1, 2]) tri.forEach((n) => bell(x, (b * 3 + k) * beat, hz(midi(n)), 0.07, 0.9));
  });

  // pad: detuned low sines following the chord roots, slowly breathing
  const pad = buf(len + tail);
  chords.forEach((c, b) => {
    const [root, fifth] = CH[c];
    const s = Math.round(b * 3 * beat * SR);
    const n = Math.round(3 * beat * SR);
    for (let i = 0; i < n; i++) {
      const t = (s + i) / SR;
      const xf = Math.min(1, i / (0.3 * SR), (n - i) / (0.3 * SR));
      const v = Math.sin(TAU * hz(midi(root)) * 2 * t) + 0.6 * Math.sin(TAU * hz(midi(fifth)) * t * 1.003) + 0.4 * Math.sin(TAU * hz(midi(root)) * 3 * t * 0.997);
      pad[s + i] += v * 0.05 * xf * (0.8 + 0.2 * Math.sin(TAU * 0.25 * t));
    }
  });
  for (let i = 0; i < x.length; i++) x[i] += pad[i];

  const wet = reverb(x, 0.4, 1.25);
  // wrap the tail into the start for a seamless loop
  const loop = new Float32Array(Math.round(len * SR));
  for (let i = 0; i < wet.length; i++) loop[i % loop.length] += wet[i];
  return normalize(lowpass(loop, 7000), 0.8);
}

fs.mkdirSync(OUT, { recursive: true });
const effects = { tap, bubble, rub, reveal, sparkle, page, thump, whoosh, card, meow, laugh };
const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(effects)) if (!only.length || only.includes(name)) writeWav(name, fn());
if (!only.length || only.includes('night')) writeMp3('night', night());
