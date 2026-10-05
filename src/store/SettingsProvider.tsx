import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { detectLocale, isLocaleCode, type LocaleCode } from '../i18n/languages';
import { translate, type StringKey } from '../i18n/strings';

const STORAGE_KEY = 'cadiya-sor/settings/v2';

export interface Settings {
  locale: LocaleCode;
  music: boolean;
  sounds: boolean;
  haptics: boolean;
  /** Random per install: makes a question's daily answer and the daily omen personal to this phone. */
  salt: string;
  /** Last day the daily omen was opened, and how many days in a row that has happened. */
  omenDay: string;
  omenStreak: number;
  /** Readings done ever — used to ask for a store review once, after a few. */
  readings: number;
  reviewAsked: boolean;
}

const DEFAULTS: Settings = {
  locale: detectLocale(),
  music: true,
  sounds: true,
  haptics: true,
  salt: Math.random().toString(36).slice(2, 10),
  omenDay: '',
  omenStreak: 0,
  readings: 0,
  reviewAsked: false,
};

interface SettingsContextValue extends Settings {
  update: (patch: Partial<Settings> | ((prev: Settings) => Partial<Settings>)) => void;
  /** Saved settings have been read, so the first frame is drawn in the right language. */
  hydrated: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!alive) return;
        if (!raw) {
          // First launch: persist the salt right away so it never changes.
          void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULTS)).catch(() => {});
          return;
        }
        try {
          const saved = JSON.parse(raw) as Partial<Settings>;
          setSettings((prev) => ({
            ...prev,
            ...saved,
            locale: isLocaleCode(saved.locale) ? saved.locale : prev.locale,
            salt: typeof saved.salt === 'string' && saved.salt ? saved.salt : prev.salt,
          }));
        } catch {
          /* corrupt record: keep the defaults */
        }
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setHydrated(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback<SettingsContextValue['update']>((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) };
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<SettingsContextValue>(() => ({ ...settings, update, hydrated }), [settings, update, hydrated]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

export function useLocale(): LocaleCode {
  return useSettings().locale;
}

export function useT() {
  const locale = useLocale();
  return useCallback((key: StringKey, params?: Record<string, string | number>) => translate(locale, key, params), [locale]);
}
