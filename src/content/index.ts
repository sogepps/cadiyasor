import type { LocaleCode } from '../i18n/languages';
import { CONTENT_SETS } from './content.gen';
import { ANSWER_TONES, BALL_TONES } from './tones.gen';
import type { OracleContent, Tone } from './types';

export type { Mode, OracleContent, Tone } from './types';

const cache = new Map<string, OracleContent>();

/**
 * Oracle texts for a locale. A locale whose translation is not finished falls back to English, so
 * every index is always valid.
 */
export function contentFor(locale: LocaleCode): OracleContent {
  const hit = cache.get(locale);
  if (hit) return hit;
  const load = CONTENT_SETS[locale] ?? CONTENT_SETS.en!;
  const content = load() as OracleContent;
  cache.set(locale, content);
  return content;
}

export const ANSWER_COUNT = ANSWER_TONES.length;
export const BALL_COUNT = BALL_TONES.length;

export function answerTone(index: number): Tone {
  return ANSWER_TONES[index] ?? 'maybe';
}

export function ballTone(index: number): Tone {
  return BALL_TONES[index] ?? 'maybe';
}
