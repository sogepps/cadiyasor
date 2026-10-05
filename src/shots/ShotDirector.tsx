import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import type { NavigationContainerRefWithCurrent } from '@react-navigation/native';

import { isLocaleCode } from '../i18n/languages';
import { useSettings } from '../store/SettingsProvider';
import type { RootStackParamList } from '../navigation/types';
import { SHOT_MODE } from './shotMode';

/**
 * Screenshot scenes, driven by deep links in the shots build:
 *   cadiyasor://shot/<home|omen|cauldron|book|ball|journal>?locale=tr&i=12&p=237
 * `i` fixes the answer index (and `p` the book page) so every language shows the same moment.
 */
export function useShotDirector(nav: NavigationContainerRefWithCurrent<RootStackParamList>) {
  const { update } = useSettings();

  useEffect(() => {
    if (!SHOT_MODE) return;
    const handle = (url: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      if (parsed.hostname !== 'shot' && !parsed.path?.startsWith('shot')) return;
      const scene = (parsed.path ?? '').replace(/^shot\/?/, '') || (parsed.hostname === 'shot' ? parsed.path ?? '' : '');
      const q = parsed.queryParams ?? {};
      if (isLocaleCode(q.locale)) update({ locale: q.locale });
      const num = (v: unknown) => (v === undefined ? undefined : Number(v));
      const forced = q.i !== undefined ? { index: Number(q.i), page: num(q.p), q: num(q.q) } : undefined;
      const go = () => {
        if (!nav.isReady()) return setTimeout(go, 200);
        switch (scene) {
          case 'cauldron':
            nav.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Cauldron', params: { forced } }] });
            break;
          case 'book':
            nav.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Book', params: { forced } }] });
            break;
          case 'ball':
            nav.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Ball', params: { forced } }] });
            break;
          case 'journal':
            nav.reset({ index: 1, routes: [{ name: 'Home' }, { name: 'Journal' }] });
            break;
          case 'omen':
            nav.reset({ index: 0, routes: [{ name: 'Home', params: { omen: true } }] });
            break;
          default:
            nav.reset({ index: 0, routes: [{ name: 'Home' }] });
        }
      };
      go();
    };
    void Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener('url', (e) => handle(e.url));
    return () => sub.remove();
  }, [nav, update]);
}
