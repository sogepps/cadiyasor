import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming, type SharedValue } from 'react-native-reanimated';

/**
 * Motes of magic drifting upward from a source (the cauldron, the ball, the book). Their number
 * and brightness follow `intensity` (0…1); at rest a few still float.
 */
export default function Sparkles({
  width,
  height,
  intensity,
  color = '#9dffcf',
  count = 16,
}: {
  width: number;
  height: number;
  intensity: SharedValue<number>;
  color?: string;
  count?: number;
}) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: width * (0.15 + ((i * 53) % 70) / 100),
        drift: (((i * 29) % 40) - 20) * 0.6,
        size: 3 + ((i * 7) % 5),
        duration: 2200 + ((i * 331) % 1800),
        delay: (i * 277) % 2400,
        threshold: i / count,
      })),
    [width, count],
  );
  return (
    <View pointerEvents="none" style={{ width, height }}>
      {motes.map((m, i) => (
        <Mote key={i} {...m} height={height} intensity={intensity} color={color} />
      ))}
    </View>
  );
}

function Mote({
  x,
  drift,
  size,
  duration,
  delay,
  threshold,
  height,
  intensity,
  color,
}: {
  x: number;
  drift: number;
  size: number;
  duration: number;
  delay: number;
  threshold: number;
  height: number;
  intensity: SharedValue<number>;
  color: string;
}) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.out(Easing.quad) }), -1, false));
  }, [delay, duration, p]);
  const style = useAnimatedStyle(() => {
    // Only the first ~25 % of motes show at rest; the rest join in as the charge grows.
    const visible = Math.min(1, Math.max(0, (0.25 + intensity.value * 0.9 - threshold) * 4));
    return {
      opacity: visible * interpolate(p.value, [0, 0.15, 0.7, 1], [0, 1, 0.8, 0]),
      transform: [
        { translateX: x + Math.sin(p.value * Math.PI * 2) * drift },
        { translateY: height - p.value * height * (0.7 + intensity.value * 0.3) },
        { scale: 0.6 + intensity.value * 0.8 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.mote,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color, shadowColor: color },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  mote: { position: 'absolute', left: 0, top: 0, shadowOpacity: 1, shadowRadius: 6, elevation: 2 },
});
