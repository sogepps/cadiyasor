import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import Txt from './Txt';
import type { Tone } from '../content/types';
import { answerFontSize, Colors, ToneColors } from '../theme';

const SCROLL = require('../../assets/art/scroll.png');
export const SCROLL_ASPECT = 760 / 900;

/**
 * The parchment the answer is written on. `open` (0…1) unrolls it from its top roller; the ink and
 * the wax seal (in the answer's colour) appear at the end.
 */
export default function AnswerScroll({
  width,
  answer,
  tone,
  question,
  open,
  onPress,
}: {
  width: number;
  answer: string;
  tone: Tone;
  question?: string;
  open: SharedValue<number>;
  onPress?: () => void;
}) {
  const height = width * SCROLL_ASPECT;
  const k = width / 900;
  const colors = ToneColors[tone];

  const sheet = useAnimatedStyle(() => ({
    opacity: interpolate(open.value, [0, 0.08, 1], [0, 1, 1]),
    transform: [
      { translateY: -height / 2 },
      { scaleY: interpolate(open.value, [0, 0.7], [0.12, 1], 'clamp') },
      { translateY: height / 2 },
    ],
  }));
  // One animated style per view.
  const ink = useAnimatedStyle(() => ({ opacity: interpolate(open.value, [0.65, 1], [0, 1], 'clamp') }));
  const sealInk = useAnimatedStyle(() => ({ opacity: interpolate(open.value, [0.65, 1], [0, 1], 'clamp') }));
  const glow = useAnimatedStyle(() => ({ opacity: interpolate(open.value, [0.5, 1], [0, 0.9], 'clamp') }));

  const box = 600 * k;
  const fontSize = answerFontSize(answer, box);
  const glowSize = width * 1.25;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <Animated.View pointerEvents="none" style={[styles.glow, { width: glowSize, height: glowSize, left: (width - glowSize) / 2, top: (height - glowSize) / 2 }, glow]}>
        <Svg width={glowSize} height={glowSize}>
          <Defs>
            <RadialGradient id={`s${tone}`} cx="50%" cy="50%" r="50%">
              <Stop offset="0.35" stopColor={colors.glow} stopOpacity="0.5" />
              <Stop offset="1" stopColor={colors.glow} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={glowSize / 2} cy={glowSize / 2} r={glowSize / 2} fill={`url(#s${tone})`} />
        </Svg>
      </Animated.View>
      <Animated.View style={[{ width, height }, sheet]}>
        <Image source={SCROLL} style={{ width, height }} contentFit="contain" />
        <Animated.View style={[styles.text, { left: 160 * k, right: 160 * k, top: 160 * k, bottom: 190 * k }, ink]}>
          {question ? (
            <Txt variant="italic" size={Math.max(13, 30 * k)} color={Colors.inkSoft} center numberOfLines={2} style={styles.question}>
              “{question}”
            </Txt>
          ) : null}
          <View style={styles.answerBox}>
            <Txt variant="display" size={fontSize} color={Colors.ink} center adjustsFontSizeToFit numberOfLines={4} minimumFontScale={0.5}>
              {answer}
            </Txt>
          </View>
        </Animated.View>
        <Animated.View style={[styles.seal, { left: 450 * k - 34 * k, top: 610 * k - 34 * k, width: 68 * k, height: 68 * k, borderRadius: 34 * k, backgroundColor: colors.seal }, sealInk]}>
          <View style={[styles.sealInner, { width: 46 * k, height: 46 * k, borderRadius: 23 * k, borderColor: 'rgba(255,255,255,0.35)' }]}>
            <Txt variant="display" size={24 * k} color="rgba(255,255,255,0.85)">
              ☾
            </Txt>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  text: { position: 'absolute', alignItems: 'center' },
  question: { marginBottom: 4, opacity: 0.85 },
  answerBox: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  seal: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  sealInner: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
