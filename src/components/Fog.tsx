import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

const FOG = require('../../assets/art/fog.png');

/** A drifting band of fog: two copies of a seamless strip scrolling sideways, forever. */
export default function Fog({ width, bottom, height, opacity = 0.22, duration = 60000, reverse = false }: {
  width: number;
  bottom: number;
  height: number;
  opacity?: number;
  duration?: number;
  reverse?: boolean;
}) {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
  }, [duration, x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: (reverse ? x.value - 1 : -x.value) * width }] }));
  return (
    <View pointerEvents="none" style={[styles.band, { bottom, height, opacity }]}>
      <Animated.View style={[styles.row, { width: width * 2 }, style]}>
        <Image source={FOG} style={{ width, height }} contentFit="fill" />
        <Image source={FOG} style={{ width, height }} contentFit="fill" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: { position: 'absolute', left: 0, right: 0, overflow: 'hidden' },
  row: { flexDirection: 'row' },
});
