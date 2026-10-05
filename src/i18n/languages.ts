import { getLocales } from 'expo-localization';

/**
 * Every language the app ships in.
 *
 * A locale here is a *market*, not just a language: Spain and Latin America, Portugal and Brazil,
 * France and Quebec, Taiwan and Hong Kong each have their own wording, so each is its own entry
 * with its own oracle content and UI dictionary. The code is used for both.
 */
export const LOCALE_CODES = [
  'en', 'tr', 'es-419', 'es-ES', 'pt-BR', 'pt-PT', 'fr-FR', 'fr-CA', 'de', 'it', 'nl', 'ru', 'uk', 'pl',
  'ar', 'hi', 'id', 'ja', 'ko', 'zh-CN', 'zh-TW', 'zh-HK', 'vi', 'th', 'fa', 'he', 'ur', 'bn', 'ms', 'fil',
  'af', 'sq', 'am', 'hy', 'az', 'eu', 'be', 'bg', 'my', 'ca', 'hr', 'cs', 'da', 'et', 'fi', 'gl', 'ka',
  'el', 'gu', 'hu', 'is', 'kn', 'kk', 'km', 'ky', 'lo', 'lv', 'lt', 'mk', 'ml', 'mr', 'mn', 'ne', 'no',
  'pa', 'ro', 'rm', 'sr', 'si', 'sk', 'sl', 'sw', 'sv', 'ta', 'te',
] as const;

export type LocaleCode = (typeof LOCALE_CODES)[number];

export interface LocaleInfo {
  code: LocaleCode;
  /** Name in the language itself, as shown in the picker. */
  name: string;
  flag: string;
  /** Written right to left. */
  rtl?: boolean;
  /**
   * Which bundled fonts cover the script: `full` = both Cinzel Decorative (titles) and Cormorant
   * Garamond (text); `text` = only Cormorant (Cyrillic, Vietnamese); otherwise the system font,
   * which has proper glyphs and weights for every other script.
   */
  fonts?: 'full' | 'text';
}

export const LOCALES: readonly LocaleInfo[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', fonts: 'full' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷', fonts: 'full' },
  { code: 'es-419', name: 'Español (Latinoamérica)', flag: '🇲🇽', fonts: 'full' },
  { code: 'es-ES', name: 'Español (España)', flag: '🇪🇸', fonts: 'full' },
  { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷', fonts: 'full' },
  { code: 'pt-PT', name: 'Português (Portugal)', flag: '🇵🇹', fonts: 'full' },
  { code: 'fr-FR', name: 'Français (France)', flag: '🇫🇷', fonts: 'full' },
  { code: 'fr-CA', name: 'Français (Canada)', flag: '🇨🇦', fonts: 'full' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', fonts: 'full' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', fonts: 'full' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱', fonts: 'full' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', fonts: 'text' },
  { code: 'uk', name: 'Українська', flag: '🇺🇦', fonts: 'text' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱', fonts: 'full' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', fonts: 'full' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: '繁體中文（台灣）', flag: '🇹🇼' },
  { code: 'zh-HK', name: '繁體中文（香港）', flag: '🇭🇰' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳', fonts: 'text' },
  { code: 'th', name: 'ไทย', flag: '🇹🇭' },
  { code: 'fa', name: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'he', name: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'ur', name: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾', fonts: 'full' },
  { code: 'fil', name: 'Filipino', flag: '🇵🇭', fonts: 'full' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦', fonts: 'full' },
  { code: 'sq', name: 'Shqip', flag: '🇦🇱', fonts: 'full' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
  { code: 'hy', name: 'Հայերեն', flag: '🇦🇲' },
  { code: 'az', name: 'Azərbaycan', flag: '🇦🇿', fonts: 'full' },
  { code: 'eu', name: 'Euskara', flag: '🇪🇸', fonts: 'full' },
  { code: 'be', name: 'Беларуская', flag: '🇧🇾', fonts: 'text' },
  { code: 'bg', name: 'Български', flag: '🇧🇬', fonts: 'text' },
  { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'ca', name: 'Català', flag: '🇪🇸', fonts: 'full' },
  { code: 'hr', name: 'Hrvatski', flag: '🇭🇷', fonts: 'full' },
  { code: 'cs', name: 'Čeština', flag: '🇨🇿', fonts: 'full' },
  { code: 'da', name: 'Dansk', flag: '🇩🇰', fonts: 'full' },
  { code: 'et', name: 'Eesti', flag: '🇪🇪', fonts: 'full' },
  { code: 'fi', name: 'Suomi', flag: '🇫🇮', fonts: 'full' },
  { code: 'gl', name: 'Galego', flag: '🇪🇸', fonts: 'full' },
  { code: 'ka', name: 'ქართული', flag: '🇬🇪' },
  { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'hu', name: 'Magyar', flag: '🇭🇺', fonts: 'full' },
  { code: 'is', name: 'Íslenska', flag: '🇮🇸', fonts: 'full' },
  { code: 'kn', name: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿', fonts: 'text' },
  { code: 'km', name: 'ខ្មែរ', flag: '🇰🇭' },
  { code: 'ky', name: 'Кыргызча', flag: '🇰🇬', fonts: 'text' },
  { code: 'lo', name: 'ລາວ', flag: '🇱🇦' },
  { code: 'lv', name: 'Latviešu', flag: '🇱🇻', fonts: 'full' },
  { code: 'lt', name: 'Lietuvių', flag: '🇱🇹', fonts: 'full' },
  { code: 'mk', name: 'Македонски', flag: '🇲🇰', fonts: 'text' },
  { code: 'ml', name: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'mn', name: 'Монгол', flag: '🇲🇳', fonts: 'text' },
  { code: 'ne', name: 'नेपाली', flag: '🇳🇵' },
  { code: 'no', name: 'Norsk', flag: '🇳🇴', fonts: 'full' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ro', name: 'Română', flag: '🇷🇴', fonts: 'full' },
  { code: 'rm', name: 'Rumantsch', flag: '🇨🇭', fonts: 'full' },
  { code: 'sr', name: 'Српски', flag: '🇷🇸', fonts: 'text' },
  { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  { code: 'sk', name: 'Slovenčina', flag: '🇸🇰', fonts: 'full' },
  { code: 'sl', name: 'Slovenščina', flag: '🇸🇮', fonts: 'full' },
  { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', fonts: 'full' },
  { code: 'sv', name: 'Svenska', flag: '🇸🇪', fonts: 'full' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
];

const BY_CODE = new Map<string, LocaleInfo>(LOCALES.map((l) => [l.code, l]));

export function localeInfo(code: string): LocaleInfo {
  return BY_CODE.get(code) ?? BY_CODE.get('en')!;
}

export function isLocaleCode(code: unknown): code is LocaleCode {
  return typeof code === 'string' && BY_CODE.has(code);
}

/** Latin America, as Google Play and Android group it for Spanish. */
const SPAIN = new Set(['ES', 'AD', 'GQ']);
const PORTUGAL = new Set(['PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL', 'MO']);

/**
 * Maps a BCP 47 tag from the device ("es-MX", "pt-PT", "zh-Hant-HK", "iw", "in-ID") to the locale
 * the app should start in. Unknown languages fall back to English.
 */
export function matchLocale(tag: string | null | undefined, regionHint?: string | null): LocaleCode {
  const parts = (tag ?? '').replace(/_/g, '-').split('-').filter(Boolean);
  let lang = (parts[0] ?? '').toLowerCase();
  const rest = parts.slice(1);
  const script = rest.find((p) => p.length === 4)?.toLowerCase();
  const region = (rest.find((p) => p.length === 2 || /^\d{3}$/.test(p)) ?? regionHint ?? '').toUpperCase();

  // Legacy codes Android still reports on some devices.
  if (lang === 'iw') lang = 'he';
  if (lang === 'in') lang = 'id';
  if (lang === 'nb' || lang === 'nn') lang = 'no';
  if (lang === 'tl') lang = 'fil';

  switch (lang) {
    case 'es':
      return SPAIN.has(region) ? 'es-ES' : 'es-419';
    case 'pt':
      return PORTUGAL.has(region) ? 'pt-PT' : 'pt-BR';
    case 'fr':
      return region === 'CA' ? 'fr-CA' : 'fr-FR';
    case 'zh':
      if (region === 'HK' || region === 'MO') return 'zh-HK';
      if (region === 'TW' || script === 'hant') return 'zh-TW';
      return 'zh-CN';
    default:
      return isLocaleCode(lang) ? lang : 'en';
  }
}

/** The locale that best matches the phone's language settings. */
export function detectLocale(): LocaleCode {
  try {
    const first = getLocales()[0];
    return matchLocale(first?.languageTag, first?.regionCode);
  } catch {
    return 'en';
  }
}

/**
 * Locale-aware upper case. `toUpperCase()` turns Turkish "i" into "I" instead of "İ", so Turkish
 * and Azerbaijani map the dotted/dotless pair first. Scripts without case are returned unchanged
 * by `toUpperCase()` anyway.
 */
export function toUpper(text: string, code: string): string {
  if (code === 'tr' || code === 'az') return text.replace(/i/g, 'İ').replace(/ı/g, 'I').toUpperCase();
  return text.toUpperCase();
}
