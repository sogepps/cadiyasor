import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import NightSky from '../components/NightSky';
import SpeechBubble from '../components/SpeechBubble';
import QuestionInput from '../components/QuestionInput';
import RevealActions from '../components/RevealActions';
import ShareCard from '../components/ShareCard';
import Sparkles from '../components/Sparkles';
import { IconButton } from '../components/Buttons';
import Txt from '../components/Txt';
import { Sound } from '../audio/sound';
import { useRitual } from '../hooks/useRitual';
import { useShake } from '../hooks/useShake';
import { useT } from '../store/SettingsProvider';
import { Colors, ToneColors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { SHOT_MODE } from '../shots/shotMode';
import { useShotQuestion } from '../shots/useShotQuestion';

type Props = NativeStackScreenProps<RootStackParamList, 'Ball'>;
type Phase = 'ask' | 'reveal';

const STAND = require('../../assets/art/ball-stand.png');
const GLASS = require('../../assets/art/ball-glass.png');
const FRAME_ASPECT = 700 / 600;
/** Sphere in the 600 × 700 stand drawing. */
const SPHERE = { cx: 300, cy: 290, r: 230 };

const MIST = [
  { color: '#b48cff', scale: 1.1, orbit: 0.28, speed: 1, phase: 0 },
  { color: '#5fe0d0', scale: 0.85, orbit: 0.34, speed: -1.4, phase: 2.1 },
  { color: '#ff7ac8', scale: 0.75, orbit: 0.3, speed: 1.8, phase: 4.2 },
  { color: '#ffffff', scale: 0.5, orbit: 0.18, speed: -2.3, phase: 1 },
];

/**
 * The crystal ball: shake the phone or swirl the mist with a finger; when the mist is stirred
 * enough, a yes / no / unclear answer surfaces inside the glass.
 */
export default function BallScreen({ navigation, route }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const t = useT();
  const ritual = useRitual('ball');
  useShotQuestion(route.params?.forced?.q, ritual.setQuestion);
  const [phase, setPhase] = useState<Phase>('ask');
  const [stirring, setStirring] = useState(false);
  const lastShakeSound = useRef(0);

  const energy = useSharedValue(0);
  const spin = useSharedValue(0);
  const revealed = useSharedValue(0);
  const flash = useSharedValue(0);
  const active = useSharedValue(true);

  // ── layout ────────────────────────────────────────────────────────────────
  const D = Math.min(width * 0.82, height * 0.44);
  const fw = D * (600 / (SPHERE.r * 2));
  const fh = fw * FRAME_ASPECT;
  const k = fw / 600;
  const fTop = Math.max(insets.top + 200, height - insets.bottom - 150 - fh);
  const sx = (width - fw) / 2 + SPHERE.cx * k - D / 2;
  const sy = fTop + SPHERE.cy * k - D / 2;

  useFrameCallback((frame) => {
    const dt = (frame.timeSincePreviousFrame ?? 16) / 1000;
    spin.value += dt * (0.25 + energy.value * 3.2);
    if (active.value && energy.value > 0 && energy.value < 1) energy.value = Math.max(0, energy.value - dt * 0.12);
  });

  const reveal = useCallback(
    (forced?: { index: number }) => {
      if (phase !== 'ask') return;
      active.value = false;
      Keyboard.dismiss();
      ritual.draw(forced);
      setPhase('reveal');
      setStirring(false);
      Sound.play('sparkle');
      setTimeout(() => Sound.play('reveal'), 200);
      flash.value = withSequence(withTiming(1, { duration: 180 }), withTiming(0, { duration: 700 }));
      revealed.value = withTiming(1, { duration: 900 });
      energy.value = withTiming(0.35, { duration: 1200 });
    },
    [active, energy, flash, phase, revealed, ritual],
  );

  const onFull = useCallback(() => reveal(), [reveal]);
  useAnimatedReaction(
    () => energy.value >= 1,
    (full, before) => {
      if (full && !before && active.value) runOnJS(onFull)();
    },
  );

  const startStir = useCallback(() => {
    Keyboard.dismiss();
    setStirring(true);
  }, []);

  const addEnergy = useCallback(
    (amount: number) => {
      if (!active.value) return;
      energy.value = Math.min(1, energy.value + amount);
    },
    [active, energy],
  );

  useShake(
    (strength) => {
      if (phase !== 'ask') return;
      if (!stirring) startStir();
      addEnergy(strength * 0.06);
      const now = Date.now();
      if (now - lastShakeSound.current > 380) {
        lastShakeSound.current = now;
        Sound.play('rub', { volume: 0.35 });
      }
    },
    phase === 'ask',
  );

  const swirl = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin(() => {
          if (active.value) runOnJS(startStir)();
        })
        .onChange((e) => {
          if (!active.value) return;
          energy.value = Math.min(1, energy.value + Math.sqrt(e.changeX * e.changeX + e.changeY * e.changeY) / 1400);
        }),
    [active, energy, startStir],
  );

  useEffect(() => {
    if (SHOT_MODE && route.params?.forced) setTimeout(() => reveal(route.params?.forced), 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const again = useCallback(async () => {
    revealed.value = withTiming(0, { duration: 400 });
    energy.value = withTiming(0, { duration: 400 });
    await ritual.reset();
    active.value = true;
    setPhase('ask');
  }, [active, energy, revealed, ritual]);

  const tone = ToneColors[ritual.tone];
  const answerStyle = useAnimatedStyle(() => ({ opacity: revealed.value, transform: [{ scale: interpolate(revealed.value, [0, 1], [0.6, 1]) }] }));
  const tintStyle = useAnimatedStyle(() => ({ opacity: revealed.value * 0.3 }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));
  const line = ritual.repeat && phase === 'reveal' ? t('witch.same') : stirring ? t('ball.swirling') : t('ball.hint');

  return (
    <View style={styles.root}>
      <NightSky hillsBottom={height * 0.1} onPressSky={Keyboard.dismiss} moonTop={insets.top + 54} moonSize={Math.min(width * 0.17, 84)} moonRight={width * 0.03}>
        <View pointerEvents="none" style={[styles.abs, { left: sx - D * 0.15, top: sy - D * 0.2 }]}>
          <Sparkles width={D * 1.3} height={D * 0.9} intensity={energy} color="#d9c2ff" count={12} />
        </View>
      </NightSky>

      <View style={[styles.abs, { left: (width - fw) / 2, top: fTop, width: fw, height: fh }]}>
        <Image source={STAND} style={{ width: fw, height: fh }} contentFit="contain" />
      </View>

      <GestureDetector gesture={swirl}>
        <View
          style={[styles.abs, styles.sphere, { left: sx, top: sy, width: D, height: D, borderRadius: D / 2 }]}
          accessible
          accessibilityLabel={t('a11y.ball')}
          accessibilityActions={[{ name: 'activate', label: t('ask.reveal') }]}
          onAccessibilityAction={() => reveal()}
        >
          <Svg width={D} height={D} style={StyleSheet.absoluteFill}>
            <Defs>
              <RadialGradient id="ball" cx="45%" cy="40%" r="60%">
                <Stop offset="0" stopColor="#6a3fc0" />
                <Stop offset="0.6" stopColor="#2d1462" />
                <Stop offset="1" stopColor="#12062e" />
              </RadialGradient>
            </Defs>
            <Circle cx={D / 2} cy={D / 2} r={D / 2} fill="url(#ball)" />
          </Svg>
          {MIST.map((m, i) => (
            <MistBlob key={i} size={D} {...m} spin={spin} energy={energy} />
          ))}
          <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: tone.glow }, tintStyle]} />
          <Animated.View style={[StyleSheet.absoluteFill, styles.flash, flashStyle]} />
          {ritual.reading ? (
            <Animated.View style={[StyleSheet.absoluteFill, styles.answerWrap, { padding: D * 0.17 }, answerStyle]}>
              <Txt variant="display" size={D * 0.085} color="#ffffff" center glow={tone.glow} adjustsFontSizeToFit numberOfLines={4} minimumFontScale={0.5}>
                {ritual.answer}
              </Txt>
            </Animated.View>
          ) : null}
        </View>
      </GestureDetector>

      <View pointerEvents="none" style={[styles.abs, { left: (width - fw) / 2, top: fTop, width: fw, height: fh }]}>
        <Image source={GLASS} style={{ width: fw, height: fh }} contentFit="contain" />
      </View>

      {phase === 'reveal' && ritual.reading ? (
        <View style={[styles.actions, { bottom: insets.bottom + 24 }]}>
          <RevealActions fav={ritual.fav} onShare={ritual.share} onFav={ritual.toggleFav} onAgain={again} />
        </View>
      ) : null}

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.topRow}>
          <IconButton icon="chevron-back" label={t('common.back')} onPress={() => navigation.goBack()} size={42} />
          <Txt variant="display" size={20} color={Colors.goldSoft} glow>
            {t('home.ball.title')}
          </Txt>
          <View style={{ width: 42 }} />
        </View>
        {phase === 'ask' || ritual.repeat ? (
          <View style={styles.bubbleSlot}>
            <SpeechBubble text={line} maxWidth={width * 0.86} />
          </View>
        ) : null}
        {phase === 'ask' ? (
          <View style={styles.inputSlot}>
            <QuestionInput value={ritual.question} onChange={ritual.setQuestion} />
          </View>
        ) : ritual.reading?.question ? (
          <Txt variant="italic" size={17} color={Colors.text} center numberOfLines={2} glow style={styles.question}>
            “{ritual.reading.question}”
          </Txt>
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

/** One soft cloud of mist circling inside the glass; faster and brighter when stirred. */
function MistBlob({
  size,
  color,
  scale,
  orbit,
  speed,
  phase,
  spin,
  energy,
}: {
  size: number;
  color: string;
  scale: number;
  orbit: number;
  speed: number;
  phase: number;
  spin: SharedValue<number>;
  energy: SharedValue<number>;
}) {
  const blob = size * scale;
  const style = useAnimatedStyle(() => {
    const a = spin.value * speed + phase;
    const r = size * orbit * (0.7 + energy.value * 0.4);
    return {
      opacity: 0.35 + energy.value * 0.45,
      transform: [
        { translateX: size / 2 - blob / 2 + Math.cos(a) * r },
        { translateY: size / 2 - blob / 2 + Math.sin(a) * r * 0.8 },
        { scale: 0.9 + Math.sin(a * 1.7) * 0.12 + energy.value * 0.2 },
      ],
    };
  });
  return (
    <Animated.View pointerEvents="none" style={[styles.blob, { width: blob, height: blob }, style]}>
      <Svg width={blob} height={blob}>
        <Defs>
          <RadialGradient id={`m${color.slice(1)}`} cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={color} stopOpacity="0.8" />
            <Stop offset="0.5" stopColor={color} stopOpacity="0.3" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={blob / 2} cy={blob / 2} r={blob / 2} fill={`url(#m${color.slice(1)})`} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.night0 },
  abs: { position: 'absolute' },
  sphere: { overflow: 'hidden' },
  blob: { position: 'absolute', left: 0, top: 0 },
  flash: { backgroundColor: '#ffffff' },
  answerWrap: { alignItems: 'center', justifyContent: 'center' },
  actions: { position: 'absolute', left: 0, right: 0 },
  top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: 16, alignItems: 'center' },
  topRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bubbleSlot: { marginTop: 10, alignItems: 'center' },
  inputSlot: { width: '100%', maxWidth: 520, marginTop: 6 },
  question: { marginTop: 10, paddingHorizontal: 12 },
  offscreen: { position: 'absolute', left: -2000, top: 0 },
});
