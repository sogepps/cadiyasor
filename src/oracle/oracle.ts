import { ANSWER_COUNT, BALL_COUNT } from '../content';
import type { Mode } from '../content/types';
import { dayKey, hash, normalizeQuestion } from './random';

/** One reading, as the journal keeps it. Texts are looked up by index so they follow the language. */
export interface Reading {
  id: string;
  ts: number;
  day: string;
  mode: Mode;
  /** What the user typed; empty when they asked in silence. */
  question: string;
  /** Index into answers (cauldron, book), ball or omens. */
  index: number;
  /** Book page the answer was found on. */
  page?: number;
  fav?: boolean;
}

export interface Pick {
  index: number;
  page?: number;
  /** The same question was already asked today in this ritual: the witch remembers. */
  repeat: boolean;
}

/** Answers drawn lately without a question, kept out of the next few random draws. */
const recent: number[] = [];
const RECENT_LIMIT = 40;

function randomIndex(count: number): number {
  const avoid = new Set(recent.slice(-Math.min(RECENT_LIMIT, count - 1)));
  let index = Math.floor(Math.random() * count);
  for (let tries = 0; avoid.has(index) && tries < 50; tries++) index = Math.floor(Math.random() * count);
  recent.push(index);
  if (recent.length > RECENT_LIMIT * 2) recent.splice(0, recent.length - RECENT_LIMIT);
  return index;
}

/**
 * Draws the answer for a ritual.
 *
 * A typed question gets a fixed answer for the day: the seed is the question, the day and this
 * install's salt, so asking again today gives the same reply (and the witch says so), while
 * another phone — or tomorrow — reads a different fate. A silent question gets a fresh random
 * answer that avoids recent ones.
 */
export function drawAnswer(mode: Exclude<Mode, 'omen'>, question: string, salt: string, today: Reading[]): Pick {
  const count = mode === 'ball' ? BALL_COUNT : ANSWER_COUNT;
  const norm = normalizeQuestion(question);
  const day = dayKey();

  if (norm) {
    const earlier = today.find((r) => r.mode === mode && r.day === day && normalizeQuestion(r.question) === norm);
    if (earlier) return { index: earlier.index, page: earlier.page, repeat: true };
    const seed = hash(`${mode}|${day}|${norm}|${salt}`);
    return { index: seed % count, page: mode === 'book' ? pageFor(seed) : undefined, repeat: false };
  }

  const index = randomIndex(count);
  return { index, page: mode === 'book' ? pageFor(hash(`${index}|${Date.now()}`)) : undefined, repeat: false };
}

/** A believable page number in a very thick grimoire. */
function pageFor(seed: number): number {
  return 13 + (Math.floor(seed / 7) % 654);
}

export function newReadingId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e9).toString(36)}`;
}
