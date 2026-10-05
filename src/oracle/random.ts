/** FNV-1a: a stable 32-bit hash of a string (same on every device and every run). */
export function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Small seeded generator (mulberry32) for reproducible picks. */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Local calendar day, e.g. "2026-09-27": the unit the witch's memory and the daily omen use. */
export function dayKey(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** The day before `key`. */
export function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d - 1));
}

/**
 * A question reduced to what makes it "the same question": case, punctuation, emoji and spacing
 * don't count. Works for every script (letters and marks of any language are kept).
 */
export function normalizeQuestion(question: string): string {
  return question.toLowerCase().normalize('NFKC').replace(NOT_A_LETTER, ' ').trim();
}

/** Anything that is not a letter, mark or digit in any script; plain ASCII punctuation if the engine lacks \p{…}. */
const NOT_A_LETTER: RegExp = (() => {
  try {
    return new RegExp('[^\\p{L}\\p{M}\\p{N}]+', 'gu');
  } catch {
    return /[\s!-/:-@[-`{-~¡-¿«»“”‘’„…·،؟。、！？]+/g;
  }
})();
