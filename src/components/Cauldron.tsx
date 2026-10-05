import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { RestingPotion } from '../theme';

const POT = require('../../assets/art/cauldron.png');
const FLAME = require('../../assets/art/flame.png');
export const CAULDRON_ASPECT = 560 / 600;
/** The mouth of the pot in the 600 × 560 drawing. */
const MOUTH = { cx: 300, cy: 150, rx: 196, ry: 34 };

/**
 * The cauldron: iron pot on its fire, a glowing potion that bubbles harder the more it is rubbed,
 * and turns the colour of the answer when it comes.
 */
export default function Cauldron({
  width,
  charge,
  potion,
  revealed,
}: {
  width: number;
  charge: SharedValue<number>;
  /** Colours of the answer's potion (centre, middle, edge); the resting green shows until `revealed`. */
  potion: [string, string, string];
  revealed: SharedValue<number>;
}) {
  const k = width / 600;
  const mouth = { cx: MOUTH.cx * k, cy: MOUTH.cy * k, rx: MOUTH.rx * k, ry: MOUTH.ry * k };

  // One animated style per view: Reanimated styles must not be shared between components.
  const answerGlowStyle = useAnimatedStyle(() => ({ opacity: revealed.value }));
  const answerSurfaceStyle = useAnimatedStyle(() => ({ opacity: revealed.value }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + charge.value * 0.55 + revealed.value * 0.3,
    transform: [{ scale: 0.9 + charge.value * 0.25 }],
  }));
  const glowSize = mouth.rx * 3.2;

  return (
    <View style={{ width, height: width * CAULDRON_ASPECT }}>
      {/* light rising from the potion */}
      <Animated.View
        pointerEvents="none"
        style={[styles.abs, { left: mouth.cx - glowSize / 2, top: mouth.cy - glowSize * 0.72, width: glowSize, height: glowSize }, glowStyle]}
      >
        <PotionGlow size={glowSize} colors={RestingPotion} />
        <Animated.View style={[StyleSheet.absoluteFill, answerGlowStyle]}>
          <PotionGlow size={glowSize} colors={potion} />
        </Animated.View>
      </Animated.View>

      <Flames width={width} charge={charge} />
      <Image source={POT} style={{ width, height: width * CAULDRON_ASPECT }} contentFit="contain" />

      {/* the potion surface */}
      <View pointerEvents="none" style={[styles.abs, { left: mouth.cx - mouth.rx, top: mouth.cy - mouth.ry, width: mouth.rx * 2, height: mouth.ry * 2 }]}>
        <PotionSurface rx={mouth.rx} ry={mouth.ry} colors={RestingPotion} />
        <Animated.View style={[StyleSheet.absoluteFill, answerSurfaceStyle]}>
          <PotionSurface rx={mouth.rx} ry={mouth.ry} colors={potion} />
        </Animated.View>
        <Bubbles rx={mouth.rx} ry={mouth.ry} charge={charge} />
      </View>
    </View>
  );
}

function PotionSurface({ rx, ry, colors }: { rx: number; ry: number; colors: [string, string, string] }) {
  return (
    <Svg width={rx * 2} height={ry * 2}>
      <Defs>
        <RadialGradient id={`p${colors[1].slice(1)}`} cx="50%" cy="45%" rx="55%" ry="60%">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="0.55" stopColor={colors[1]} />
          <Stop offset="1" stopColor={colors[2]} />
        </RadialGradient>
      </Defs>
      <Ellipse cx={rx} cy={ry} rx={rx - 1} ry={ry - 1} fill={`url(#p${colors[1].slice(1)})`} />
    </Svg>
  );
}

function PotionGlow({ size, colors }: { size: number; colors: [string, string, string] }) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id={`g${colors[1].slice(1)}`} cx="50%" cy="72%" rx="50%" ry="50%">
          <Stop offset="0" stopColor={colors[1]} stopOpacity="0.75" />
          <Stop offset="0.45" stopColor={colors[1]} stopOpacity="0.25" />
          <Stop offset="1" stopColor={colors[1]} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Ellipse cx={size / 2} cy={size / 2} rx={size / 2} ry={size / 2} fill={`url(#g${colors[1].slice(1)})`} />
    </Svg>
  );
}

/** Bubbles rising and popping on the surface, faster and bigger with the charge. */
function Bubbles({ rx, ry, charge }: { rx: number; ry: number; charge: SharedValue<number> }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + i;
        const r = 0.2 + ((i * 37) % 60) / 100;
        return { x: rx + Math.cos(a) * rx * r * 0.85, y: ry + Math.sin(a) * ry * r * 0.7, size: 6 + ((i * 13) % 9), delay: i * 230 };
      }),
    [rx, ry],
  );
  return (
    <>
      {bubbles.map((b, i) => (
        <Bubble key={i} {...b} charge={charge} />
      ))}
    </>
  );
}

function Bubble({ x, y, size, delay, charge }: { x: number; y: number; size: number; delay: number; charge: SharedValue<number> }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) }), -1, false));
  }, [delay, p]);
  const style = useAnimatedStyle(() => {
    const s = size * (0.6 + charge.value * 0.9);
    const grow = interpolate(p.value, [0, 0.8, 0.9, 1], [0.2, 1, 1.25, 0]);
    return {
      width: s,
      height: s,
      borderRadius: s / 2,
      left: x - s / 2,
      top: y - s / 2 - p.value * (3 + charge.value * 8),
      opacity: interpolate(p.value, [0, 0.1, 0.85, 1], [0, 0.9, 0.9, 0]) * (0.55 + charge.value * 0.45),
      transform: [{ scale: grow }],
    };
  });
  return <Animated.View style={[styles.bubble, style]} />;
}

function Flames({ width, charge }: { width: number; charge: SharedValue<number> }) {
  const k = width / 600;
  const flames = [
    { x: 240, s: 0.9, d: 0 },
    { x: 300, s: 1.15, d: 120 },
    { x: 362, s: 0.95, d: 240 },
    { x: 200, s: 0.6, d: 60 },
    { x: 402, s: 0.62, d: 180 },
  ];
  return (
    <>
      {flames.map((f, i) => (
        <Flame key={i} left={f.x * k} bottom={width * CAULDRON_ASPECT - 520 * k} scale={f.s * k} delay={f.d} charge={charge} />
      ))}
    </>
  );
}

function Flame({ left, bottom, scale, delay, charge }: { left: number; bottom: number; scale: number; delay: number; charge: SharedValue<number> }) {
  const f = useSharedValue(1);
  useEffect(() => {
    f.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.18, { duration: 140 }),
          withTiming(0.9, { duration: 170 }),
          withTiming(1.08, { duration: 120 }),
          withTiming(0.95, { duration: 160 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, f]);
  const w = 120 * scale;
  const h = 200 * scale;
  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: h / 2 }, { scaleY: f.value * (1 + charge.value * 0.35) }, { translateY: -h / 2 }, { scaleX: 1 / f.value }],
  }));
  return (
    <Animated.View pointerEvents="none" style={[styles.abs, { left: left - w / 2, bottom, width: w, height: h }, style]}>
      <Image source={FLAME} style={{ width: w, height: h }} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  bubble: { position: 'absolute', backgroundColor: 'rgba(235,255,244,0.85)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.9)' },
});
