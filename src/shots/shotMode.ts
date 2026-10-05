/**
 * Store-screenshot build (EXPO_PUBLIC_SHOTS=1): no ads, no random intro delays, and deep links
 * `cadiyasor://shot/<scene>?locale=xx` that put the app into a fixed, photogenic state.
 */
export const SHOT_MODE = process.env.EXPO_PUBLIC_SHOTS === '1';
