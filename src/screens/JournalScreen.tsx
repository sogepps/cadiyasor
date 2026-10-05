import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { IconButton } from '../components/Buttons';
import Txt from '../components/Txt';
import { answerTone, ballTone, contentFor } from '../content';
import type { Mode, Tone } from '../content/types';
import type { Reading } from '../oracle/oracle';
import { useJournal } from '../store/JournalProvider';
import { useLocale, useT } from '../store/SettingsProvider';
import type { StringKey } from '../i18n/strings';
import { Sound } from '../audio/sound';
import { Colors, ToneColors } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Journal'>;

const MODE_ICON: Record<Mode, React.ComponentProps<typeof Ionicons>['name']> = {
  cauldron: 'flask',
  book: 'book',
  ball: 'planet',
  omen: 'moon',
};
const MODE_TITLE: Record<Mode, StringKey> = {
  cauldron: 'home.cauldron.title',
  book: 'home.book.title',
  ball: 'home.ball.title',
  omen: 'home.omen.title',
};

/** Every reading so far, newest first, in the current language; star the ones worth keeping. */
export default function JournalScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const t = useT();
  const locale = useLocale();
  const journal = useJournal();
  const [favOnly, setFavOnly] = useState(false);
  const content = contentFor(locale);

  const data = useMemo(() => (favOnly ? journal.readings.filter((r) => r.fav) : journal.readings), [favOnly, journal.readings]);
  const fmt = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    } catch {
      return null;
    }
  }, [locale]);

  const textOf = (r: Reading): { text: string; tone: Tone } => {
    if (r.mode === 'ball') return { text: content.ball[r.index] ?? '', tone: ballTone(r.index) };
    if (r.mode === 'omen') return { text: content.omens[r.index] ?? '', tone: 'maybe' };
    return { text: content.answers[r.index] ?? '', tone: answerTone(r.index) };
  };

  const clearAll = () =>
    Alert.alert(t('journal.clear'), t('journal.clearConfirm'), [
      { text: t('journal.cancel'), style: 'cancel' },
      { text: t('journal.delete'), style: 'destructive', onPress: () => journal.clear() },
    ]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#070514', '#150c34', '#2c1757']} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="chevron-back" label={t('common.back')} onPress={() => navigation.goBack()} size={42} />
        <Txt variant="display" size={22} color={Colors.goldSoft} glow numberOfLines={1} adjustsFontSizeToFit style={styles.title}>
          {t('journal.title')}
        </Txt>
        <View style={{ width: 42 }} />
      </View>

      <View style={styles.filters}>
        {[false, true].map((fav) => (
          <Pressable
            key={String(fav)}
            onPress={() => {
              Sound.play('tap');
              setFavOnly(fav);
            }}
            style={[styles.chip, favOnly === fav && styles.chipOn]}
            accessibilityRole="button"
            accessibilityState={{ selected: favOnly === fav }}
          >
            {fav ? <Ionicons name="star" size={14} color={favOnly ? Colors.night0 : Colors.gold} /> : null}
            <Txt variant="ui" bold size={14} color={favOnly === fav ? Colors.night0 : Colors.text}>
              {fav ? t('journal.favorites') : t('journal.all')}
            </Txt>
          </Pressable>
        ))}
        <Txt variant="ui" size={12} color={Colors.textFaint} style={styles.count}>
          {t('journal.count', { count: journal.readings.length })}
        </Txt>
      </View>

      <FlatList
        data={data}
        keyExtractor={(r) => r.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 30 }]}
        ListFooterComponent={
          journal.readings.length > 0 ? (
            <Pressable onPress={clearAll} style={styles.clear} accessibilityRole="button">
              <Ionicons name="trash" size={16} color="#ff9a8a" />
              <Txt variant="ui" bold size={14} color="#ff9a8a">
                {t('journal.clear')}
              </Txt>
            </Pressable>
          ) : null
        }
        ListEmptyComponent={
          <Animated.View entering={FadeIn} style={styles.empty}>
            <Ionicons name="moon-outline" size={46} color={Colors.textFaint} />
            <Txt variant="italic" size={18} color={Colors.textDim} center>
              {t('journal.empty')}
            </Txt>
          </Animated.View>
        }
        renderItem={({ item }) => {
          const { text, tone } = textOf(item);
          return (
            <Animated.View layout={LinearTransition} entering={FadeIn} style={[styles.card, { borderStartColor: ToneColors[tone].glow }]}>
              <View style={styles.cardTop}>
                <Ionicons name={MODE_ICON[item.mode]} size={15} color={Colors.goldSoft} />
                <Txt variant="ui" size={12} color={Colors.goldSoft} numberOfLines={1} style={styles.flex}>
                  {t(MODE_TITLE[item.mode])}
                  {item.page ? ` · ${t('book.page', { page: item.page })}` : ''}
                </Txt>
                <Txt variant="ui" size={12} color={Colors.textFaint}>
                  {fmt ? fmt.format(new Date(item.ts)) : item.day}
                </Txt>
              </View>
              {item.mode !== 'omen' ? (
                <Txt variant="italic" size={15} color={Colors.textDim} numberOfLines={3}>
                  {item.question ? `“${item.question.startsWith('§') ? content.questions[Number(item.question.slice(1))] : item.question}”` : t('journal.silentQuestion')}
                </Txt>
              ) : null}
              <Txt variant={item.mode === 'omen' ? 'text' : 'display'} bold size={item.mode === 'omen' ? 17 : 18} color={Colors.text}>
                {text}
              </Txt>
              <View style={styles.cardActions}>
                <Pressable
                  onPress={() => {
                    Sound.play('tap');
                    journal.toggleFav(item.id);
                  }}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={item.fav ? t('reveal.saved') : t('reveal.save')}
                >
                  <Ionicons name={item.fav ? 'star' : 'star-outline'} size={20} color={item.fav ? Colors.gold : Colors.textDim} />
                </Pressable>
                <Pressable onPress={() => journal.remove(item.id)} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('journal.delete')}>
                  <Ionicons name="trash-outline" size={19} color={Colors.textFaint} />
                </Pressable>
              </View>
            </Animated.View>
          );
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.night0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  title: { flex: 1, textAlign: 'center', marginHorizontal: 8 },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, marginTop: 14, marginBottom: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: Colors.hairline },
  chipOn: { backgroundColor: Colors.gold, borderColor: Colors.gold },
  count: { marginStart: 'auto' },
  list: { padding: 16, gap: 12 },
  empty: { alignItems: 'center', gap: 14, marginTop: 80, paddingHorizontal: 30 },
  card: {
    borderRadius: 18,
    padding: 14,
    gap: 6,
    backgroundColor: 'rgba(22,11,48,0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,228,160,0.18)',
    borderStartWidth: 4,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flex: { flex: 1 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 22, marginTop: 2 },
  clear: {
    marginTop: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(40,10,20,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255,154,138,0.4)',
  },
});
