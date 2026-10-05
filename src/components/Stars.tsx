import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { seeded } from '../oracle/random';

const GROUPS = 3;

/**
 * A field of stars in three groups that twinkle out of step — lively, but only three animated
 * values for the whole sky.
 */
export default function Stars({ width, height, count = 70 }: { width: number; height: number; count?: number }) {
  const stars = useMemo(() => {
    const rand = seeded(42);
    return Array.from({ length: count }, (_, i) => {
      const big = rand() < 0.12;
      return {
        x: rand() * width,
        // denser near the top of the sky
        y: rand() ** 1.6 * height,
        r: big ? 1.6 + rand() * 1.2 : 0.6 + rand() * 0.9,
        o: 0.35 + rand() * 0.65,
        g: i % GROUPS,
        warm: rand() < 0.25,
      };
    });
  }, [width, height, count]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: GROUPS }, (_, g) => (
        <TwinkleGroup key={g} index={g}>
          {stars
            .filter((s) => s.g === g)
            .map((s, i) => (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: s.x - s.r,
                  top: s.y - s.r,
                  width: s.r * 2,
                  height: s.r * 2,
                  borderRadius: s.r,
                  opacity: s.o,
                  backgroundColor: s.warm ? '#ffe9b0' : '#e8e4ff',
                }}
              />
            ))}
        </TwinkleGroup>
      ))}
    </View>
  );
}

function TwinkleGroup({ index, children }: { index: number; children: React.ReactNode }) {
  const v = useSharedValue(1);
  useEffect(() => {
    v.value = withDelay(index * 900, withRepeat(withTiming(0.35, { duration: 1800 + index * 500, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, [index, v]);
  const style = useAnimatedStyle(() => ({ opacity: v.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, style]}>{children}</Animated.View>;
}
