import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const FLAME = require('../../assets/art/flame.png');

/** A small flickering flame whose base sits at (x, y). */
export default function CandleFlame({ x, y, height, delay = 0 }: { x: number; y: number; height: number; delay?: number }) {
  const f = useSharedValue(1);
  useEffect(() => {
    f.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1.15, { duration: 160 }), withTiming(0.92, { duration: 190 }), withTiming(1.06, { duration: 140 }), withTiming(0.97, { duration: 170 })),
        -1,
        true,
      ),
    );
  }, [delay, f]);
  const w = height * 0.6;
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: height / 2 }, { scaleY: f.value }, { translateY: -height / 2 }, { scaleX: 1 / Math.sqrt(f.value) }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.abs, { left: x - w / 2, top: y - height * 0.95, width: w, height }, style]}>
      <Image source={FLAME} style={{ width: w, height }} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({ abs: { position: 'absolute' } });
