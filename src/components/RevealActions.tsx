import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { IconButton, MysticButton } from './Buttons';
import { useT } from '../store/SettingsProvider';

/** Under an answer: share it, keep it in the journal's favourites, or ask again. */
export default function RevealActions({
  fav,
  onShare,
  onFav,
  onAgain,
}: {
  fav: boolean;
  onShare: () => void;
  onFav: () => void;
  onAgain: () => void;
}) {
  const t = useT();
  return (
    <Animated.View entering={FadeInDown.delay(250).duration(380)} style={styles.row}>
      <IconButton icon="share-social" label={t('reveal.share')} caption={t('reveal.share')} onPress={onShare} />
      <MysticButton label={t('reveal.again')} icon="sparkles" onPress={onAgain} style={styles.again} />
      <IconButton
        icon={fav ? 'star' : 'star-outline'}
        active={fav}
        label={fav ? t('reveal.saved') : t('reveal.save')}
        caption={fav ? t('reveal.saved') : t('reveal.save')}
        onPress={onFav}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', gap: 14, paddingHorizontal: 12 },
  again: { flexShrink: 1, marginTop: -2 },
});
