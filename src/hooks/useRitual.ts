import { useCallback, useMemo, useRef, useState } from 'react';
import type { View } from 'react-native';
import * as StoreReview from 'expo-store-review';

import { answerTone, ballTone, contentFor } from '../content';
import type { Mode, Tone } from '../content/types';
import { countReading, maybeShowAd } from '../ads/adPolicy';
import { drawAnswer, newReadingId, type Reading } from '../oracle/oracle';
import { dayKey } from '../oracle/random';
import { shareReading, STORE_LINK } from '../oracle/share';
import { useJournal } from '../store/JournalProvider';
import { useLocale, useSettings, useT } from '../store/SettingsProvider';
import { SHOT_MODE } from '../shots/shotMode';

/** Ask for a store review once, after this many readings (Google decides whether to show it). */
const REVIEW_AFTER = 6;

/**
 * Everything a ritual screen shares: the question, drawing the answer, writing it in the journal,
 * saving/sharing it and moving on to the next question (where an ad may be due).
 */
export function useRitual(mode: Exclude<Mode, 'omen'>) {
  const t = useT();
  const locale = useLocale();
  const settings = useSettings();
  const journal = useJournal();
  const [question, setQuestionState] = useState('');
  const questionRef = useRef('');
  const setQuestion = useCallback((q: string) => {
    questionRef.current = q;
    setQuestionState(q);
  }, []);
  const [reading, setReading] = useState<Reading | null>(null);
  const [repeat, setRepeat] = useState(false);
  const cardRef = useRef<View>(null);

  const draw = useCallback(
    (forced?: { index: number; page?: number }) => {
      const q = questionRef.current.trim();
      const day = dayKey();
      const today = journal.readings.filter((r) => r.day === day);
      const pick = forced ? { ...forced, repeat: false } : drawAnswer(mode, q, settings.salt, today);
      let next: Reading;
      const earlier = pick.repeat ? today.find((r) => r.mode === mode && r.index === pick.index && r.question.trim().length > 0) : undefined;
      if (earlier) next = earlier;
      else {
        next = { id: newReadingId(), ts: Date.now(), day, mode, question: q, index: pick.index, page: pick.page };
        if (!SHOT_MODE) journal.add(next);
      }
      countReading();
      settings.update((prev) => ({ readings: prev.readings + 1 }));
      setReading(next);
      setRepeat(pick.repeat);
      return { reading: next, repeat: pick.repeat };
    },
    [journal, mode, settings],
  );

  const reset = useCallback(async () => {
    await maybeShowAd();
    setReading(null);
    setRepeat(false);
    if (!SHOT_MODE && settings.readings >= REVIEW_AFTER && !settings.reviewAsked) {
      settings.update({ reviewAsked: true });
      try {
        if (await StoreReview.hasAction()) await StoreReview.requestReview();
      } catch {
        /* not available: fine */
      }
    }
  }, [settings]);

  const content = contentFor(locale);
  const answer = reading ? (mode === 'ball' ? content.ball[reading.index] : content.answers[reading.index]) ?? '' : '';
  const tone: Tone = reading ? (mode === 'ball' ? ballTone(reading.index) : answerTone(reading.index)) : 'maybe';
  const fav = Boolean(reading && journal.readings.find((r) => r.id === reading.id)?.fav);

  const toggleFav = useCallback(() => {
    if (reading) journal.toggleFav(reading.id);
  }, [journal, reading]);

  const share = useCallback(
    () => shareReading(cardRef, t('share.message', { answer, link: STORE_LINK })),
    [answer, t],
  );

  return useMemo(
    () => ({ question, setQuestion, reading, repeat, draw, reset, answer, tone, fav, toggleFav, share, cardRef }),
    [question, setQuestion, reading, repeat, draw, reset, answer, tone, fav, toggleFav, share],
  );
}
