import { useEffect } from 'react';

import { contentFor } from '../content';
import { useLocale } from '../store/SettingsProvider';
import { SHOT_MODE } from './shotMode';

/** Screenshot scenes type one of the example questions into the box (shot mode only). */
export function useShotQuestion(index: number | undefined, setQuestion: (q: string) => void) {
  const locale = useLocale();
  useEffect(() => {
    if (!SHOT_MODE || index === undefined) return;
    setQuestion(contentFor(locale).questions[index] ?? '');
  }, [index, locale, setQuestion]);
}
