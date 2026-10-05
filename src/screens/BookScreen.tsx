import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import NightSky from '../components/NightSky';
import SpeechBubble from '../components/SpeechBubble';
import QuestionInput from '../components/QuestionInput';
import RevealActions from '../components/RevealActions';
import ShareCard from '../components/ShareCard';
import Sparkles from '../components/Sparkles';
import CandleFlame from '../components/CandleFlame';
import { IconButton } from '../components/Buttons';
import Txt from '../components/Txt';
import { Sound } from '../audio/sound';
import { useRitual } from '../hooks/useRitual';
import { useT } from '../store/SettingsProvider';
import { answerFontSize, Colors, ToneColors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { SHOT_MODE } from '../shots/shotMode';
import { useShotQuestion } from '../shots/useShotQuestion';

type Props = NativeStackScreenProps<RootStackParamList, 'Book'>;
type Phase = 'closed' | 'holding' | 'open';

const ALTAR = require('../../assets/art/altar.png');
const CLOSED = require('../../assets/art/book-closed.png');
const OPEN = require('../../assets/art/book-open.png');
const ALTAR_ASPECT = 520 / 800;
const CLOSED_ASPECT = 480 / 640;
const OPEN_ASPECT = 480 / 760;
/** How long the book must be held before it may open (ms). */
const MIN_HOLD = 900;

/**
 * The Book of Answers: hold the grimoire while thinking of the question — its pages riffle and the
 * sigil glows — then let go, and it falls open at the page with your answer.
 */
export default function BookScreen({ navigation, route }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const t = useT();
  const ritual = useRitual('book');
  useShotQuestion(route.params?.forced?.q, ritual.setQuestion);
  const [phase, setPhase] = useState<Phase>('closed');
  const heldSince = useRef(0);
  const riffle = useRef<ReturnType<typeof setInterval> | null>(null);

  const energy = useSharedValue(0);
  const shake = useSharedValue(0);
  const opened = useSharedValue(0);

  // ── layout ────────────────────────────────────────────────────────────────
  const aw = Math.min(width * 1.02, 560);
  const ah = aw * ALTAR_ASPECT;
  const aBottom = insets.bottom - ah * 0.06;
  const aTop = height - aBottom - ah;
  const bw = aw * 0.6;
  const bh = bw * CLOSED_ASPECT;
  const bTop = aTop + ah * (150 / 520) - bh * 0.9;
  const ow = Math.min(width * 0.98, 560);
  const oh = ow * OPEN_ASPECT;
  const oTop = Math.max(insets.top + 96, height * 0.2);
  const ok = ow / 760;

  const stopRiffle = () => {
    if (riffle.current) clearInterval(riffle.current);
    riffle.current = null;
  };
  useEffect(() => stopRiffle, []);

  const openBook = useCallback(
    (forced?: { index: number; page?: number }) => {
      stopRiffle();
      Keyboard.dismiss();
      ritual.draw(forced);
      setPhase('open');
      Sound.play('thump');
      setTimeout(() => Sound.play('reveal'), 350);
      cancelAnimation(shake);
      shake.value = withTiming(0, { duration: 120 });
      energy.value = withTiming(0, { duration: 600 });
      opened.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    },
    [energy, opened, ritual, shake],
  );

  const onPressIn = useCallback(() => {
    if (phase !== 'closed') return;
    Keyboard.dismiss();
    heldSince.current = Date.now();
    setPhase('holding');
    energy.value = withTiming(1, { duration: 2400 });
    shake.value = withRepeat(withSequence(withTiming(1, { duration: 70 }), withTiming(-1, { duration: 70 })), -1, true);
    Sound.play('page');
    riffle.current = setInterval(() => Sound.play('page', { volume: 0.4, haptic: true }), 420);
  }, [energy, phase, shake]);

  const onPressOut = useCallback(() => {
    if (phase !== 'holding') return;
    if (Date.now() - heldSince.current >= MIN_HOLD) {
      openBook();
      return;
    }
    stopRiffle();
    cancelAnimation(shake);
    shake.value = withTiming(0, { duration: 100 });
    energy.value = withTiming(0, { duration: 500 });
    setPhase('closed');
  }, [energy, openBook, phase, shake]);

  useEffect(() => {
    if (SHOT_MODE && route.params?.forced) setTimeout(() => openBook(route.params?.forced), 400);
  }, [openBook, route.params?.forced]);

  const again = useCallback(async () => {
    opened.value = withTiming(0, { duration: 400 });
    await ritual.reset();
    Sound.play('thump', { volume: 0.4 });
    setPhase('closed');
  }, [opened, ritual]);

  const closedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opened.value, [0, 0.35], [1, 0], 'clamp'),
    transform: [
      { translateX: shake.value * 2.5 * energy.value },
      { rotate: `${shake.value * 0.8 * energy.value}deg` },
      { scale: 1 + energy.value * 0.04 - opened.value * 0.1 },
    ],
  }));
  const sigilStyle = useAnimatedStyle(() => ({ opacity: 0.25 + energy.value * 0.75, transform: [{ scale: 0.8 + energy.value * 0.5 }] }));
  const openStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opened.value, [0.25, 0.7], [0, 1], 'clamp'),
    transform: [{ translateY: interpolate(opened.value, [0, 1], [oh * 0.4, 0]) }, { scale: interpolate(opened.value, [0, 1], [0.6, 1]) }],
  }));
  // One animated style per view.
  const inkStyle = useAnimatedStyle(() => ({ opacity: interpolate(opened.value, [0.7, 1], [0, 1], 'clamp') }));
  const pageStyle = useAnimatedStyle(() => ({ opacity: interpolate(opened.value, [0.7, 1], [0, 1], 'clamp') }));
  const prevPageStyle = useAnimatedStyle(() => ({ opacity: interpolate(opened.value, [0.7, 1], [0, 1], 'clamp') }));

  const line = phase === 'holding' ? t('book.holding') : ritual.repeat ? t('witch.same') : t('book.hint');
  const tone = ToneColors[ritual.tone];

  return (
    <View style={styles.root}>
      <NightSky hillsBottom={ah * 0.55} onPressSky={Keyboard.dismiss} moonTop={insets.top + 54} moonSize={Math.min(width * 0.17, 84)} moonRight={width * 0.03}>
        <Image source={ALTAR} style={[styles.abs, { left: (width - aw) / 2, top: aTop, width: aw, height: ah }]} contentFit="contain" />
        <CandleFlame x={(width - aw) / 2 + (96 / 800) * aw} y={aTop + (150 / 520) * ah} height={ah * 0.14} />
        <CandleFlame x={(width - aw) / 2 + (706 / 800) * aw} y={aTop + (176 / 520) * ah} height={ah * 0.12} delay={200} />
        <View pointerEvents="none" style={[styles.abs, { left: (width - bw * 1.3) / 2, top: bTop - height * 0.3 }]}>
          <Sparkles width={bw * 1.3} height={height * 0.36} intensity={energy} color="#ffd98a" />
        </View>
      </NightSky>

      {/* the closed book you hold */}
      <Animated.View style={[styles.abs, { left: (width - bw) / 2, top: bTop, width: bw, height: bh }, closedStyle]} pointerEvents={phase === 'open' ? 'none' : 'auto'}>
        <Pressable
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.book')}
          accessibilityActions={[{ name: 'activate', label: t('ask.reveal') }]}
          onAccessibilityAction={() => openBook()}
        >
          <Animated.View pointerEvents="none" style={[styles.sigil, { left: bw * 0.5 - bw * 0.22, top: bh * (222 / 480) - bw * 0.22, width: bw * 0.44, height: bw * 0.44, borderRadius: bw * 0.22 }, sigilStyle]} />
          <Image source={CLOSED} style={{ width: bw, height: bh }} contentFit="contain" />
        </Pressable>
      </Animated.View>

      {/* the open book with the answer */}
      {ritual.reading ? (
        <Animated.View pointerEvents="box-none" style={[styles.abs, { top: oTop, left: (width - ow) / 2, width: ow }, openStyle]}>
          {ritual.reading.question ? (
            <Txt variant="italic" size={17} color={Colors.text} center numberOfLines={2} glow style={styles.question}>
              “{ritual.reading.question}”
            </Txt>
          ) : null}
          <View style={{ width: ow, height: oh }}>
            <View style={[styles.pageGlow, { backgroundColor: tone.glow, left: 404 * ok, top: 90 * ok, width: 286 * ok, height: 260 * ok }]} />
            <Image source={OPEN} style={{ width: ow, height: oh }} contentFit="contain" />
            <Animated.View style={[styles.abs, { left: 410 * ok, top: 96 * ok, width: 266 * ok, height: 250 * ok, alignItems: 'center', justifyContent: 'center' }, inkStyle]}>
              <Txt variant="display" size={answerFontSize(ritual.answer, 280 * ok) * 1.7} color={Colors.ink} center adjustsFontSizeToFit numberOfLines={5} minimumFontScale={0.5}>
                {ritual.answer}
              </Txt>
            </Animated.View>
            <Animated.View style={[styles.abs, { left: 470 * ok, top: 372 * ok, width: 160 * ok, alignItems: 'center' }, pageStyle]}>
              <Txt variant="italic" size={Math.max(12, 26 * ok)} color={Colors.inkSoft}>
                {t('book.page', { page: ritual.reading.page ?? 1 })}
              </Txt>
            </Animated.View>
            <Animated.View style={[styles.abs, { left: 130 * ok, top: 372 * ok, width: 140 * ok, alignItems: 'center' }, prevPageStyle]}>
              <Txt variant="italic" size={Math.max(12, 26 * ok)} color={Colors.inkSoft}>
                {String((ritual.reading.page ?? 2) - 1)}
              </Txt>
            </Animated.View>
          </View>
          {phase === 'open' ? (
            <View style={styles.actions}>
              <RevealActions fav={ritual.fav} onShare={ritual.share} onFav={ritual.toggleFav} onAgain={again} />
            </View>
          ) : null}
        </Animated.View>
      ) : null}

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.topRow}>
          <IconButton icon="chevron-back" label={t('common.back')} onPress={() => navigation.goBack()} size={42} />
          <Txt variant="display" size={20} color={Colors.goldSoft} glow>
            {t('home.book.title')}
          </Txt>
          <View style={{ width: 42 }} />
        </View>
        {phase !== 'open' || ritual.repeat ? (
          <View style={styles.bubbleSlot}>
            <SpeechBubble text={line} maxWidth={width * 0.86} />
          </View>
        ) : null}
        {phase !== 'open' ? (
          <View style={styles.inputSlot}>
            <QuestionInput value={ritual.question} onChange={ritual.setQuestion} editable={phase === 'closed'} />
          </View>
        ) : null}
      </View>

      {ritual.reading ? (
        <View style={styles.offscreen} pointerEvents="none">
          <ShareCard ref={ritual.cardRef} answer={ritual.answer} tone={ritual.tone} question={ritual.reading.question} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.night0 },
  abs: { position: 'absolute' },
  top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 16, alignItems: 'center' },
  topRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bubbleSlot: { marginTop: 10, alignItems: 'center' },
  inputSlot: { width: '100%', maxWidth: 520, marginTop: 6 },
  sigil: { position: 'absolute', backgroundColor: 'rgba(157,255,207,0.45)', shadowColor: '#9dffcf', shadowOpacity: 1, shadowRadius: 30, elevation: 10 },
  question: { marginBottom: 8, paddingHorizontal: 12 },
  pageGlow: { position: 'absolute', borderRadius: 999, opacity: 0.35, shadowColor: '#fff', shadowOpacity: 1, shadowRadius: 40 },
  actions: { marginTop: 14 },
  offscreen: { position: 'absolute', left: -2000, top: 0 },
});
