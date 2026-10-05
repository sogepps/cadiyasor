import { I18nManager } from 'react-native';

import { localeInfo } from './languages';
import { useLocale } from '../store/SettingsProvider';

/**
 * Right-to-left support without restarting the app.
 *
 * React Native's `I18nManager.forceRTL` only takes effect after a cold start, which would leave
 * someone who picks Arabic in the language menu with a mirrored layout only the next time they open
 * the game. Instead the native layout is pinned to LTR and the root view gets `direction: 'rtl'`
 * for RTL locales: Yoga then lays out every row, `start`/`end` margin and absolute `start` position
 * mirrored, immediately. Only things Yoga cannot know about — glyph icons that mean a direction
 * and physical swipe directions — are handled here.
 */
export function pinNativeLayoutToLtr() {
  I18nManager.allowRTL(false);
  if (I18nManager.isRTL) I18nManager.forceRTL(false);
}

export function useIsRtl(): boolean {
  return Boolean(localeInfo(useLocale()).rtl);
}

/** +1 in LTR, −1 in RTL: multiply horizontal motion by this so "forward" follows the language. */
export function useDirectionSign(): 1 | -1 {
  return useIsRtl() ? -1 : 1;
}

const MIRRORED_ICONS: Record<string, string> = {
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
  'arrow-back-circle': 'arrow-forward-circle',
  'arrow-forward-circle': 'arrow-back-circle',
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'play-skip-forward': 'play-skip-back',
};

/** The icon to draw for `name` in the current direction. */
export function useDirectionalIcon() {
  const rtl = useIsRtl();
  return <T extends string>(name: T): T => (rtl ? ((MIRRORED_ICONS[name] as T | undefined) ?? name) : name);
}
