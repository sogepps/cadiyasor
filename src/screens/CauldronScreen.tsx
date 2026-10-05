import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import NightSky from '../components/NightSky';
import Witch, { WITCH_ASPECT } from '../components/Witch';
import Cauldron, { CAULDRON_ASPECT } from '../components/Cauldron';
import Sparkles from '../components/Sparkles';
import SpeechBubble from '../components/SpeechBubble';
import QuestionInput from '../components/QuestionInput';
import AnswerScroll, { SCROLL_ASPECT } from '../components/AnswerScroll';
import RevealActions from '../components/RevealActions';
import ShareCard from '../components/ShareCard';
import { IconButton } from '../components/Buttons';
import Txt from '../components/Txt';
import { Sound } from '../audio/sound';
import { useRitual } from '../hooks/useRitual';
import { useRubCharge } from '../hooks/useRubCharge';
import { useT } from '../store/SettingsProvider';
import type { StringKey } from '../i18n/strings';
import { Colors, RestingPotion, ToneColors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { isWitchingHour } from '../components/NightSky';
import { SHOT_MODE } from '../shots/shotMode';
import { useShotQuestion } from '../shots/useShotQuestion';

type Props = NativeStackScreenProps<RootStackParamList, 'Cauldron'>;
type Phase = 'ask' | 'revealing' | 'reveal';

const GREETINGS: StringKey[] = ['witch.greet1', 'witch.greet2', 'witch.greet3', 'witch.greet4', 'witch.greet5', 'witch.greet6'];
const POKES: StringKey[] = ['witch.poke1', 'witch.poke2', 'witch.poke3', 'witch.poke4'];
const pickOne = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

export default function CauldronScreen({ navigation, route }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const t = useT();
  const ritual = useRitual('cauldron');
  useShotQuestion(route.params?.forced?.q, ritual.setQuestion);
  const [phase, setPhase] = useState<Phase>('ask');
  const [line, setLine] = useState<StringKey>(isWitchingHour() ? 'home.witchingHour' : pickOne(GREETINGS));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => void timers.current.push(setTimeout(fn, ms)), []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const revealed = useSharedValue(0);
  const open = useSharedValue(0);
  const orb = useSharedValue(0);

  // ── layout ────────────────────────────────────────────────────────────────
  const cw = Math.min(width * 0.64, height * 0.36);
  const ch = cw * CAULDRON_ASPECT;
  const cBottom = insets.bottom + height * 0.025;
  const cTop = height - cBottom - ch;
  const ww = cw * 1.36;
  const wh = ww * WITCH_ASPECT;
  const wTop = cTop + ch * 0.207 - wh * 0.785;
  const sw = Math.min(width * 0.94, 520);
  const sh = sw * SCROLL_ASPECT;
  const sTop = Math.max(insets.top + 70, height * 0.16) + (ritual.repeat ? 44 : 0);

  const onCharged = useCallback(() => {
    Keyboard.dismiss();
    const { repeat } = ritual.draw(route.params?.forced);
    setPhase('revealing');
    Sound.play('whoosh');
    later(() => Sound.play('laugh'), 250);
    revealed.value = withTiming(1, { duration: 500 });
    orb.value = withSequence(withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }), withTiming(2, { duration: 350 }));
    open.value = withDelay(700, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    later(() => {
      Sound.play('reveal');
      setPhase('reveal');
      if (repeat) setLine('witch.same');
    }, 1500);
  }, [later, open, orb, revealed, ritual, route.params?.forced]);

  const onRubStart = useCallback(() => {
    Keyboard.dismiss();
    setLine('witch.rubbing');
  }, []);

  const rub = useRubCharge(onCharged, phase === 'ask', onRubStart);

  // "Almost there" once the cauldron is two-thirds full.
  const almost = useCallback(() => setLine('witch.almost'), []);
  useAnimatedReaction(
    () => rub.charge.value > 0.66,
    (now, before) => {
      if (now && !before) runOnJS(almost)();
    },
  );

  // Greeting first, then the instruction.
  useEffect(() => {
    later(() => setLine((l) => (l.startsWith('witch.greet') || l === 'home.witchingHour' ? 'witch.rubHint' : l)), 2600);
  }, [later]);

  // Screenshot scenes fill the cauldron on their own.
  useEffect(() => {
    if (SHOT_MODE && route.params?.forced) later(() => rub.fill(600), 400);
  }, [later, route.params?.forced, rub]);

  const again = useCallback(async () => {
    open.value = withTiming(0, { duration: 350 });
    revealed.value = withTiming(0, { duration: 500 });
    orb.value = 0;
    await ritual.reset();
    rub.reset();
    setPhase('ask');
    setLine(pickOne(GREETINGS));
    later(() => setLine((l) => (l.startsWith('witch.greet') ? 'witch.rubHint' : l)), 2400);
  }, [later, open, orb, revealed, ritual, rub]);

  const poke = useCallback(() => {
    Keyboard.dismiss();
    if (phase !== 'ask') return;
    Sound.play('laugh', { volume: 0.5 });
    setLine(pickOne(POKES));
    later(() => setLine('witch.rubHint'), 2200);
  }, [later, phase]);

  const dim = useSharedValue(0);
  useEffect(() => {
    dim.value = withTiming(phase === 'ask' ? 0 : 1, { duration: 500 });
  }, [dim, phase]);

  const potion = ritual.reading ? ToneColors[ritual.tone].potion : RestingPotion;
  const orbColor = ritual.reading ? ToneColors[ritual.tone].glow : Colors.potion;
  const orbStart = cTop + ch * 0.2;
  const orbEnd = sTop + sh / 2;
  const orbStyle = useAnimatedStyle(() => ({
    opacity: interpolate(orb.value, [0, 0.1, 1, 2], [0, 1, 1, 0]),
    transform: [
      { translateY: interpolate(orb.value, [0, 1], [orbStart, orbEnd], 'clamp') - 60 },
      { scale: interpolate(orb.value, [0, 1, 2], [0.3, 1, 2.4]) },
    ],
  }));
  const sceneStyle = useAnimatedStyle(() => ({ opacity: dim.value * 0.5 }));

  return (
    <View style={styles.root}>
      <NightSky hillsBottom={cBottom + ch * 0.55} onPressSky={Keyboard.dismiss} moonTop={insets.top + 54} moonSize={Math.min(width * 0.17, 84)} moonRight={width * 0.03}>
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <View style={[styles.abs, { top: wTop, left: (width - ww) / 2 }]}>
            <Witch width={ww} charge={rub.charge} onPoke={poke} />
          </View>
          <View pointerEvents="none" style={[styles.abs, { left: (width - cw * 1.4) / 2, top: cTop - height * 0.3 }]}>
            <Sparkles width={cw * 1.4} height={height * 0.36} intensity={rub.charge} />
          </View>
          <GestureDetector gesture={rub.gesture}>
            <View
              style={[styles.abs, { top: cTop - ch * 0.35, left: (width - cw * 1.3) / 2, width: cw * 1.3, height: ch * 1.35, alignItems: 'center', justifyContent: 'flex-end' }]}
              accessible
              accessibilityLabel={t('a11y.cauldron')}
              accessibilityActions={[{ name: 'activate', label: t('ask.reveal') }]}
              onAccessibilityAction={() => rub.fill()}
            >
              <Cauldron width={cw} charge={rub.charge} potion={potion} revealed={revealed} />
            </View>
          </GestureDetector>
          {/* Dim the scene behind the scroll with a veil, not opacity: layers must keep hiding each other. */}
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.veil, sceneStyle]} />
        </View>
      </NightSky>

      {/* the orb that carries the answer up to the scroll */}
      <Animated.View pointerEvents="none" style={[styles.orb, { left: width / 2 - 60, backgroundColor: orbColor, shadowColor: orbColor }, orbStyle]} />

      {/* top: back, the witch's words, the question */}
      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.topRow}>
          <IconButton icon="chevron-back" label={t('common.back')} onPress={() => navigation.goBack()} size={42} />
          <Txt variant="display" size={20} color={Colors.goldSoft} glow>
            {t('home.cauldron.title')}
          </Txt>
          <View style={{ width: 42 }} />
        </View>
        {phase === 'ask' || ritual.repeat ? (
          <View style={styles.bubbleSlot}>
            <SpeechBubble text={t(line)} maxWidth={width * 0.86} />
          </View>
        ) : null}
        {phase === 'ask' ? (
          <View style={styles.inputSlot}>
            <QuestionInput value={ritual.question} onChange={ritual.setQuestion} />
            <Txt variant="ui" size={12} color={Colors.textFaint} center style={styles.revealLink}>
              {t('ask.silent')}
            </Txt>
          </View>
        ) : null}
      </View>

      {ritual.reading ? (
        <View pointerEvents="box-none" style={[styles.abs, { top: sTop, left: (width - sw) / 2, width: sw }]}>
          <AnswerScroll width={sw} answer={ritual.answer} tone={ritual.tone} question={ritual.reading.question} open={open} />
          {phase === 'reveal' ? (
            <View style={styles.actions}>
              <RevealActions fav={ritual.fav} onShare={ritual.share} onFav={ritual.toggleFav} onAgain={again} />
            </View>
          ) : null}
        </View>
      ) : null}

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
  inputSlot: { width: '100%', maxWidth: 520, marginTop: 6, alignItems: 'center' },
  revealLink: { marginTop: 6, paddingHorizontal: 10, paddingVertical: 4 },
  actions: { marginTop: 14 },
  orb: {
    position: 'absolute',
    top: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 12,
  },
  offscreen: { position: 'absolute', left: -2000, top: 0 },
  veil: { backgroundColor: '#05020f' },
});
