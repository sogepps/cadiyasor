/**
 * UI strings. English (`ui/en.json`) is the reference key set; every other locale has a JSON
 * dictionary with the same keys, produced by the translation pipeline in tools/tx. A key missing
 * from a dictionary falls back to English.
 *
 * `{{name}}` placeholders are filled by `translate()`.
 */

import en from './ui/en.json';
import { DICTIONARIES } from './dictionaries.gen';
import type { LocaleCode } from './languages';

export type StringKey = keyof typeof en;
export type Dictionary = Record<StringKey, string>;

export const EN: Dictionary = en;

const cache = new Map<string, Partial<Dictionary>>();

export function dictionaryFor(locale: LocaleCode): Partial<Dictionary> {
  const hit = cache.get(locale);
  if (hit) return hit;
  const load = DICTIONARIES[locale];
  const dict = (load ? load() : EN) as Partial<Dictionary>;
  cache.set(locale, dict);
  return dict;
}

export function translate(locale: LocaleCode, key: StringKey, params?: Record<string, string | number>): string {
  let text: string = dictionaryFor(locale)[key] ?? EN[key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{{${name}}}`).join(String(value));
    }
  }
  return text;
}
