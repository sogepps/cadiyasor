import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Reading } from '../oracle/oracle';
import { dayKey } from '../oracle/random';
import { SHOT_MODE } from '../shots/shotMode';

const STORAGE_KEY = 'cadiya-sor/journal/v1';
/** Oldest non-favourite readings are dropped beyond this. */
const MAX_READINGS = 400;

interface JournalValue {
  readings: Reading[];
  add: (reading: Reading) => void;
  toggleFav: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const JournalContext = createContext<JournalValue | null>(null);

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [readings, setReadings] = useState<Reading[]>(SHOT_MODE ? demoReadings() : []);
  const loaded = useRef(false);

  useEffect(() => {
    if (SHOT_MODE) return;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as Reading[];
        if (Array.isArray(saved)) setReadings((now) => [...now, ...saved.filter((r) => r && typeof r.id === 'string')]);
      })
      .catch(() => {})
      .finally(() => {
        loaded.current = true;
      });
  }, []);

  const commit = useCallback((fn: (prev: Reading[]) => Reading[]) => {
    setReadings((prev) => {
      const next = fn(prev);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const add = useCallback(
    (reading: Reading) =>
      commit((prev) => {
        const next = [reading, ...prev];
        if (next.length <= MAX_READINGS) return next;
        // Drop the oldest readings that are not favourites.
        let excess = next.length - MAX_READINGS;
        const kept: Reading[] = [];
        for (let i = next.length - 1; i >= 0; i--) {
          if (excess > 0 && !next[i].fav) {
            excess--;
            continue;
          }
          kept.unshift(next[i]);
        }
        return kept;
      }),
    [commit],
  );

  const toggleFav = useCallback((id: string) => commit((prev) => prev.map((r) => (r.id === id ? { ...r, fav: !r.fav } : r))), [commit]);
  const remove = useCallback((id: string) => commit((prev) => prev.filter((r) => r.id !== id)), [commit]);
  const clear = useCallback(() => commit(() => []), [commit]);

  const value = useMemo(() => ({ readings, add, toggleFav, remove, clear }), [readings, add, toggleFav, remove, clear]);
  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
}

/**
 * The journal shown in store screenshots: a few readings of each kind. `§n` is resolved to the
 * n-th example question in the current language by the journal screen.
 */
function demoReadings(): Reading[] {
  const now = Date.now();
  const at = (minutesAgo: number) => ({ ts: now - minutesAgo * 60_000, day: dayKey(new Date(now - minutesAgo * 60_000)) });
  return [
    { id: 'd1', ...at(3), mode: 'cauldron', question: '§10', index: 125, fav: true },
    { id: 'd2', ...at(40), mode: 'ball', question: '§22', index: 2 },
    { id: 'd3', ...at(95), mode: 'book', question: '§12', index: 17, page: 237, fav: true },
    { id: 'd4', ...at(300), mode: 'omen', question: '', index: 1 },
    { id: 'd5', ...at(1500), mode: 'cauldron', question: '', index: 184 },
  ];
}

export function useJournal(): JournalValue {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used inside JournalProvider');
  return ctx;
}
