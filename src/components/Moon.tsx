import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from 'react-native-svg';
import { Image } from 'expo-image';

import type { MoonPhase } from '../oracle/moon';

const TEXTURE = require('../../assets/art/moon.png');

/**
 * Tonight's real moon: the full-moon texture with the unlit part painted over in night blue.
 * The terminator is a half-ellipse whose width follows cos(phase), mirrored for a waning moon.
 */
export default function Moon({
  size,
  phase,
  onPress,
  label,
}: {
  size: number;
  phase: MoonPhase;
  onPress?: () => void;
  label?: string;
}) {
  const shadow = useMemo(() => {
    const r = size / 2;
    const c = size / 2;
    const k = Math.cos(2 * Math.PI * phase.fraction); // 1 new … -1 full
    const a = Math.abs(k) * r;
    // Waxing: dark on the left. Left semicircle top→bottom, then the terminator back to the top.
    const sweep = k > 0 ? 0 : 1;
    const d = `M ${c} ${c - r} A ${r} ${r} 0 0 0 ${c} ${c + r} A ${a} ${r} 0 0 ${sweep} ${c} ${c - r} Z`;
    return { d, mirror: !phase.waxing };
  }, [size, phase.fraction, phase.waxing]);

  const glow = size * 2.2;
  const content = (
    <View style={{ width: size, height: size }}>
      <View pointerEvents="none" style={[styles.glow, { width: glow, height: glow, left: (size - glow) / 2, top: (size - glow) / 2 }]}>
        <Svg width={glow} height={glow}>
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" r="50%">
              <Stop offset="0.3" stopColor="#fff6d8" stopOpacity={0.35 * (0.35 + phase.illumination * 0.65)} />
              <Stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={glow / 2} cy={glow / 2} r={glow / 2} fill="url(#g)" />
        </Svg>
      </View>
      <Image source={TEXTURE} style={{ width: size, height: size }} contentFit="contain" />
      <Svg width={size} height={size} style={[StyleSheet.absoluteFill, shadow.mirror && styles.mirror]}>
        <Path d={shadow.d} fill="#0d0826" fillOpacity={0.9} />
      </Svg>
    </View>
  );

  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} hitSlop={16} accessibilityRole="button" accessibilityLabel={label}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  mirror: { transform: [{ scaleX: -1 }] },
});
