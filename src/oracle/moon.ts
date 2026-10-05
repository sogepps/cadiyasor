/**
 * The real phase of the moon, computed on the device (no network): age since a known new moon,
 * modulo the mean synodic month. Accurate to well under a day, which is all a witch needs.
 */

const SYNODIC_DAYS = 29.530588853;
/** New moon of 2000-01-06 18:14 UTC. */
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14);

export const PHASES = [
  'new',
  'waxingCrescent',
  'firstQuarter',
  'waxingGibbous',
  'full',
  'waningGibbous',
  'lastQuarter',
  'waningCrescent',
] as const;

export type PhaseName = (typeof PHASES)[number];

export interface MoonPhase {
  /** 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. */
  fraction: number;
  /** Lit part of the disc, 0…1. */
  illumination: number;
  /** True while the lit part grows (lit side on the right, seen from the northern hemisphere). */
  waxing: boolean;
  name: PhaseName;
}

export function moonPhase(date = new Date()): MoonPhase {
  const days = (date.getTime() - KNOWN_NEW_MOON_MS) / 86_400_000;
  const fraction = (((days / SYNODIC_DAYS) % 1) + 1) % 1;
  const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
  const name = PHASES[Math.floor(fraction * 8 + 0.5) % 8];
  return { fraction, illumination, waxing: fraction < 0.5, name };
}
