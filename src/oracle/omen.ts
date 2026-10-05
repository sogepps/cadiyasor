import { moonPhase, type MoonPhase } from './moon';
import { dayKey, hash, seeded } from './random';

export const LUCKY_COLORS = [
  { key: 'red', hex: '#e2453c' },
  { key: 'orange', hex: '#f08a2c' },
  { key: 'gold', hex: '#f2c14e' },
  { key: 'green', hex: '#3fbf73' },
  { key: 'turquoise', hex: '#2ec4c4' },
  { key: 'blue', hex: '#3f7fe0' },
  { key: 'purple', hex: '#8a55e0' },
  { key: 'pink', hex: '#ec6fae' },
  { key: 'silver', hex: '#c9cfdb' },
  { key: 'white', hex: '#f6f3ea' },
  { key: 'black', hex: '#1a1424' },
  { key: 'brown', hex: '#8a5a34' },
] as const;

export type LuckyColor = (typeof LUCKY_COLORS)[number];

export interface DailyOmen {
  day: string;
  /** Index into the omens list. */
  index: number;
  number: number;
  color: LuckyColor;
  /** Hour of the day, 0–23. */
  hour: number;
  moon: MoonPhase;
}

/** Today's omen for this install: fixed for the whole day, new at midnight, different per phone. */
export function dailyOmen(omenCount: number, salt: string, date = new Date()): DailyOmen {
  const day = dayKey(date);
  const rand = seeded(hash(`omen|${day}|${salt}`));
  return {
    day,
    index: Math.floor(rand() * omenCount),
    number: 1 + Math.floor(rand() * 99),
    color: LUCKY_COLORS[Math.floor(rand() * LUCKY_COLORS.length)],
    // Lucky hours between 7:00 and 23:00, when people are awake to use them.
    hour: 7 + Math.floor(rand() * 17),
    moon: moonPhase(date),
  };
}

/** "21:00" / "9 PM" in the user's language. */
export function formatHour(hour: number, localeTag: string): string {
  const d = new Date(2000, 0, 1, hour, 0);
  try {
    return new Intl.DateTimeFormat(localeTag, { hour: 'numeric', minute: '2-digit' }).format(d);
  } catch {
    return `${String(hour).padStart(2, '0')}:00`;
  }
}
