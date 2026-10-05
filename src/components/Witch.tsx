import React, { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { useT } from '../store/SettingsProvider';

const WITCH = require('../../assets/art/witch.png');
export const WITCH_ASPECT = 1000 / 800;
/** Where the cauldron rim meets her, as a fraction of her height. */
export const WITCH_RIM = 0.79;

/**
 * The witch behind her cauldron. She breathes, blinks, leans in while the cauldron is rubbed and
 * can be poked.
 */
export default function Witch({
  width,
  charge,
  onPoke,
  dimmed,
}: {
  width: number;
  charge: SharedValue<number>;
  onPoke?: () => void;
  dimmed?: SharedValue<number>;
}) {
  const t = useT();
  const k = width / 800;
  const breath = useSharedValue(0);
  const lid = useSharedValue(0);

  useEffect(() => {
    breath.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    let timer: ReturnType<typeof setTimeout>;
    const blink = () => {
      lid.value = withSequence(withTiming(1, { duration: 80 }), withTiming(0, { duration: 120 }));
      timer = setTimeout(blink, 2500 + Math.random() * 3500);
    };
    timer = setTimeout(blink, 1800);
    return () => clearTimeout(timer);
  }, [breath, lid]);

  const body = useAnimatedStyle(() => ({
    opacity: dimmed ? interpolate(dimmed.value, [0, 1], [1, 0.45]) : 1,
    transform: [
      { translateY: interpolate(breath.value, [0, 1], [0, -5 * k * 2]) + charge.value * 10 * k },
      { scale: 1 + charge.value * 0.03 },
    ],
  }));
  const lidStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: lid.value }] }));

  return (
    <Animated.View style={[{ width, height: width * WITCH_ASPECT }, body]}>
      <Pressable onPress={onPoke} accessibilityRole="button" accessibilityLabel={t('a11y.witch')} style={StyleSheet.absoluteFill}>
        <Image source={WITCH} style={{ width, height: width * WITCH_ASPECT }} contentFit="contain" />
        <Animated.View
          style={[
            styles.lid,
            { left: (455 - 19) * k, top: (386 - 11) * k, width: 38 * k, height: 22 * k, borderRadius: 11 * k },
            lidStyle,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  lid: { position: 'absolute', backgroundColor: '#3a6a51' },
});
