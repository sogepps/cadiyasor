/** What an answer means: it colours the potion, the scroll's glow and the seal. */
export type Tone = 'yes' | 'no' | 'maybe' | 'act';

/** The oracle texts of one locale, in the same order as tools/tx/src/catalog.json. */
export interface OracleContent {
  answers: string[];
  ball: string[];
  omens: string[];
  questions: string[];
}

/** The three rituals, plus the daily omen (which also lands in the journal). */
export type Mode = 'cauldron' | 'book' | 'ball' | 'omen';
