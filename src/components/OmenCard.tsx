import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, FadeIn, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import Moon from './Moon';
import Txt from './Txt';
import { Sound } from '../audio/sound';
import { contentFor } from '../content';
import { dailyOmen, formatHour } from '../oracle/omen';
import { newReadingId } from '../oracle/oracle';
import { previousDay } from '../oracle/random';
import { useJournal } from '../store/JournalProvider';
import { useLocale, useSettings, useT } from '../store/SettingsProvider';
import type { StringKey } from '../i18n/strings';
import { Colors } from '../theme';
import { SHOT_MODE } from '../shots/shotMode';

const BACK = require('../../assets/art/card-back.png');
const FRONT = require('../../assets/art/card-front.png');
const ASPECT = 960 / 600;

/**
 * Today's omen as a tarot-like card: tap to turn it over. The first reveal of the day keeps the
 * streak going and writes the omen into the journal.
 */
export default function OmenCard({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { width, height } = useWindowDimensions();
  const t = useT();
  const locale = useLocale();
  const settings = useSettings();
  const journal = useJournal();
  const omen = useMemo(() => dailyOmen(contentFor(locale).omens.length, settings.salt), [locale, settings.salt]);
  const seenToday = SHOT_MODE || settings.omenDay === omen.day;
  const [turned, setTurned] = useState(seenToday);
  const flip = useSharedValue(seenToday ? 1 : 0);

  useEffect(() => {
    if (!visible) return;
    const seen = SHOT_MODE || settings.omenDay === omen.day;
    setTurned(seen);
    flip.value = seen ? 1 : 0;
  }, [visible, omen.day, settings.omenDay, flip]);

  const turn = () => {
    if (turned) return;
    setTurned(true);
    Sound.play('card');
    setTimeout(() => Sound.play('sparkle'), 380);
    flip.value = withTiming(1, { duration: 750, easing: Easing.inOut(Easing.cubic) });
    if (settings.omenDay !== omen.day) {
      settings.update((prev) => ({
        omenDay: omen.day,
        omenStreak: prev.omenDay === previousDay(omen.day) ? prev.omenStreak + 1 : 1,
      }));
      journal.add({ id: newReadingId(), ts: Date.now(), day: omen.day, mode: 'omen', question: '', index: omen.index });
    }
  };

  const cw = Math.min(width * 0.82, height * 0.62 / ASPECT, 420);
  const ch = cw * ASPECT;
  const k = cw / 600;

  const backStyle = useAnimatedStyle(() => ({
    opacity: flip.value < 0.5 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [0, 180])}deg` }],
  }));
  const frontStyle = useAnimatedStyle(() => ({
    opacity: flip.value >= 0.5 ? 1 : 0,
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(flip.value, [0, 1], [-180, 0])}deg` }],
  }));

  const omenText = contentFor(locale).omens[omen.index] ?? '';
  const phaseKey = `moon.${omen.moon.name}` as StringKey;
  const tipKey = `moonTip.${omen.moon.name}` as StringKey;
  const colorKey = `color.${omen.color.key}` as StringKey;
  const date = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(new Date());
    } catch {
      return omen.day;
    }
  }, [locale, omen.day]);
  const streak = SHOT_MODE ? 7 : settings.omenDay === omen.day ? settings.omenStreak : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel={t('common.close')} />
        <Txt variant="display" size={24} color={Colors.goldSoft} center glow style={styles.title}>
          {t('omen.title')}
        </Txt>
        <Txt variant="ui" size={13} color={Colors.textDim} center>
          {date}
        </Txt>

        <Pressable onPress={turn} style={{ width: cw, height: ch, marginTop: 14 }} accessibilityRole="button" accessibilityLabel={t('omen.tapCard')}>
          <Animated.View style={[StyleSheet.absoluteFill, styles.face, backStyle]}>
            <Image source={BACK} style={{ width: cw, height: ch }} contentFit="contain" />
            {!turned ? (
              <Animated.View entering={FadeIn.delay(400)} style={styles.tapHint}>
                <Txt variant="ui" size={13} color={Colors.goldSoft} center>
                  {t('omen.tapCard')}
                </Txt>
              </Animated.View>
            ) : null}
          </Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.face, frontStyle]}>
            <Image source={FRONT} style={{ width: cw, height: ch }} contentFit="contain" />
            <View style={[styles.inner, { paddingHorizontal: 70 * k, paddingTop: 70 * k }]}>
              <View style={styles.moonRow}>
                <Moon size={96 * k * 1.3} phase={omen.moon} />
              </View>
              <Txt variant="display" size={Math.max(14, 34 * k)} color={Colors.ink} center style={{ marginTop: 8 * k }}>
                {t(phaseKey)}
              </Txt>
              <Txt variant="italic" size={Math.max(12, 26 * k)} color={Colors.inkSoft} center numberOfLines={2}>
                {t(tipKey)}
              </Txt>
              <View style={[styles.omenBox, { height: 240 * k, marginTop: 30 * k }]}>
                <Txt variant="text" bold size={Math.max(15, 40 * k)} color={Colors.ink} center adjustsFontSizeToFit numberOfLines={5} minimumFontScale={0.55}>
                  {omenText}
                </Txt>
              </View>
              <View style={[styles.lucky, { marginTop: 26 * k }]}>
                <Lucky label={t('omen.luckyNumber')} k={k}>
                  <Txt variant="display" size={Math.max(18, 44 * k)} color={Colors.ink}>
                    {String(omen.number)}
                  </Txt>
                </Lucky>
                <Lucky label={t('omen.luckyColor')} k={k}>
                  <View style={[styles.swatch, { backgroundColor: omen.color.hex, width: 34 * k, height: 34 * k, borderRadius: 17 * k }]} />
                  <Txt variant="text" bold size={Math.max(12, 24 * k)} color={Colors.ink} center numberOfLines={1} adjustsFontSizeToFit>
                    {t(colorKey)}
                  </Txt>
                </Lucky>
                <Lucky label={t('omen.luckyHour')} k={k}>
                  <Txt variant="display" size={Math.max(15, 34 * k)} color={Colors.ink} numberOfLines={1} adjustsFontSizeToFit>
                    {formatHour(omen.hour, locale)}
                  </Txt>
                </Lucky>
              </View>
            </View>
          </Animated.View>
        </Pressable>

        {turned ? (
          <Animated.View entering={FadeIn.delay(500)} style={styles.footer}>
            {streak > 0 ? (
              <View style={styles.streak}>
                <Ionicons name="flame" size={16} color="#ff9a3a" />
                <Txt variant="ui" size={14} color={Colors.goldSoft} bold>
                  {t('omen.streak', { count: streak })}
                </Txt>
              </View>
            ) : null}
            <Txt variant="ui" size={12} color={Colors.textFaint} center>
              {t('omen.next')}
            </Txt>
          </Animated.View>
        ) : null}

        <Pressable onPress={onClose} style={styles.close} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('common.close')}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </Pressable>
      </View>
    </Modal>
  );
}

function Lucky({ label, k, children }: { label: string; k: number; children: React.ReactNode }) {
  return (
    <View style={styles.luckyCell}>
      <Txt variant="ui" size={Math.max(10, 20 * k)} color={Colors.inkSoft} center numberOfLines={2}>
        {label}
      </Txt>
      <View style={styles.luckyValue}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(5,2,14,0.94)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { marginBottom: 2 },
  face: { backfaceVisibility: 'hidden' },
  tapHint: { position: 'absolute', bottom: '8%', alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.35)' },
  inner: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center' },
  moonRow: { alignItems: 'center' },
  omenBox: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  lucky: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  luckyCell: { flex: 1, alignItems: 'center', gap: 4 },
  luckyValue: { alignItems: 'center', justifyContent: 'center', minHeight: 40, gap: 2 },
  swatch: { borderWidth: 1.5, borderColor: 'rgba(58,36,18,0.4)' },
  footer: { marginTop: 14, alignItems: 'center', gap: 6 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  close: { position: 'absolute', top: 48, right: 20, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
});
