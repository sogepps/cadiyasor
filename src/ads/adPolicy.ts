import { Interstitial, MIN_AD_GAP_MS, READINGS_PER_AD } from './interstitial';
import { SHOT_MODE } from '../shots/shotMode';

let readingsSinceAd = 0;
let lastAdAt = 0;

/** A reading was completed (the answer is on screen). */
export function countReading() {
  readingsSinceAd += 1;
}

/**
 * Called when the user moves on from an answer (asks again or leaves the ritual). Shows an
 * interstitial when one is due; resolves at once otherwise, and never blocks longer than the ad.
 */
export async function maybeShowAd(): Promise<void> {
  if (SHOT_MODE) return;
  if (readingsSinceAd < READINGS_PER_AD) return;
  if (Date.now() - lastAdAt < MIN_AD_GAP_MS) return;
  const shown = await Interstitial.show();
  if (shown) {
    readingsSinceAd = 0;
    lastAdAt = Date.now();
  }
}
