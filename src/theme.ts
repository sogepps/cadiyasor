import type { Tone } from './content/types';

/** Moonlit night, violet haze, emerald potion, old gold. */
export const Colors = {
  night0: '#070514',
  night1: '#150c34',
  night2: '#2c1757',
  night3: '#3b1f63',
  moon: '#f6efd2',
  gold: '#f2c14e',
  goldSoft: '#ffe4a0',
  potion: '#6dffb0',
  violet: '#9a7bff',
  violetDeep: '#5a2fa0',
  text: '#f3ecff',
  textDim: 'rgba(243,236,255,0.74)',
  textFaint: 'rgba(243,236,255,0.46)',
  ink: '#3a2412',
  inkSoft: '#6a4a2a',
  panel: 'rgba(22,11,48,0.78)',
  panelStrong: 'rgba(16,8,36,0.94)',
  hairline: 'rgba(255,228,160,0.28)',
  bubble: '#fbf6ea',
  bubbleInk: '#221409',
} as const;

/** Colour of the potion, the scroll's glow and the wax seal for each kind of answer. */
export const ToneColors: Record<Tone, { glow: string; seal: string; potion: [string, string, string] }> = {
  yes: { glow: '#5fd08a', seal: '#2e7d4f', potion: ['#e2ffef', '#3fe08d', '#0f6a3e'] },
  no: { glow: '#ff5b4a', seal: '#8c1d18', potion: ['#ffe2dc', '#ff5b4a', '#7a1410'] },
  maybe: { glow: '#ffc24b', seal: '#8a5a11', potion: ['#fff4d6', '#ffc24b', '#8a5a11'] },
  act: { glow: '#4fc3f7', seal: '#1b4f8a', potion: ['#e0f6ff', '#4fc3f7', '#154a80'] },
};

/** The resting potion before an answer: witch green. */
export const RestingPotion: [string, string, string] = ['#d8ffe9', '#3fe08d', '#0f6a3e'];

export const Fonts = {
  display: 'CinzelDecorative_700Bold',
  displayBlack: 'CinzelDecorative_900Black',
  /** Plain Cinzel capitals for Turkish and Azerbaijani, whose dotted İ the decorative cut lacks in small caps. */
  displayPlain: 'Cinzel_700Bold',
  text: 'CormorantGaramond_600SemiBold',
  textBold: 'CormorantGaramond_700Bold',
  textItalic: 'CormorantGaramond_600SemiBold_Italic',
} as const;

export const Space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const Radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

/** Answer size on the scroll / page: short answers big, long ones smaller. */
export function answerFontSize(text: string, box: number): number {
  const n = [...text].length;
  const base = n <= 8 ? 0.15 : n <= 16 ? 0.12 : n <= 26 ? 0.1 : n <= 38 ? 0.085 : 0.072;
  return Math.round(box * base);
}
