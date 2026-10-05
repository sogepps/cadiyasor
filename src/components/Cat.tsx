import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming, withDelay, FadeIn, FadeOut } from 'react-native-reanimated';

import Txt from './Txt';
import { Sound } from '../audio/sound';
import { useT } from '../store/SettingsProvider';

const CAT = require('../../assets/art/cat.png');
const W = 300;
const H = 340;
const EYES = [
  [122, 118],
  [178, 118],
];

/** The witch's black cat: blinks now and then, meows when tapped. */
export default function Cat({ width, style }: { width: number; style?: object }) {
  const t = useT();
  const k = width / W;
  const lid = useSharedValue(1);
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      lid.value = withSequence(withTiming(0.08, { duration: 90 }), withTiming(1, { duration: 140 }));
      timer = setTimeout(blink, 2200 + Math.random() * 4200);
    };
    timer = setTimeout(blink, 1500);
    return () => clearTimeout(timer);
  }, [lid]);

  const eyeStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: lid.value }] }));

  const onPress = useCallback(() => {
    Sound.play('meow', { rate: 0.9 + Math.random() * 0.25 });
    lid.value = withSequence(withTiming(0.3, { duration: 120 }), withDelay(500, withTiming(1, { duration: 200 })));
    setTalking(true);
    setTimeout(() => setTalking(false), 1600);
  }, [lid]);

  return (
    <View style={[{ width, height: H * k }, style]}>
      {talking ? (
        <Animated.View entering={FadeIn.duration(150)} exiting={FadeOut.duration(250)} style={[styles.bubble, { bottom: H * k * 0.92 }]}>
          <Txt variant="italic" size={15} color="#221409">
            {t('witch.cat')}
          </Txt>
        </Animated.View>
      ) : null}
      <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={t('a11y.cat')}>
        <Image source={CAT} style={{ width, height: H * k }} contentFit="contain" />
        {EYES.map(([x, y], i) => (
          <Animated.View
            key={i}
            style={[styles.eye, { left: (x - 9) * k, top: (y - 6.5) * k, width: 18 * k, height: 13 * k, borderRadius: 7 * k }, eyeStyle]}
          >
            <View style={[styles.pupil, { width: 3.2 * k, height: 11 * k, borderRadius: 2 * k }]} />
          </Animated.View>
        ))}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  eye: { position: 'absolute', backgroundColor: '#ffd35a', alignItems: 'center', justifyContent: 'center', shadowColor: '#ffd35a', shadowOpacity: 0.9, shadowRadius: 6, elevation: 3 },
  pupil: { backgroundColor: '#1a0f05' },
  bubble: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#fbf6ea',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
});
