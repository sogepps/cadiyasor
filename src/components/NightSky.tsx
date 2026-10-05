import React, { useMemo, useRef } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import Bats, { type BatsHandle } from './Bats';
import Fog from './Fog';
import Moon from './Moon';
import Stars from './Stars';
import { moonPhase } from '../oracle/moon';
import { Sound } from '../audio/sound';
import { useT } from '../store/SettingsProvider';

const HILLS = require('../../assets/art/hills.png');
const GROUND = require('../../assets/art/ground.png');
const HILLS_ASPECT = 640 / 1080;
const GROUND_ASPECT = 720 / 1080;

/** Between midnight and 3 a.m. the sky turns a deeper magenta: the witching hour. */
export function isWitchingHour(date = new Date()) {
  return date.getHours() < 3;
}

/**
 * The shared backdrop: sky gradient, twinkling stars, tonight's real moon (tap it and the bats come
 * out), far hills with the witch tower, drifting fog and, on the home screen, the graveyard ground.
 */
export default function NightSky({
  ground = false,
  hillsBottom,
  moonTop,
  moonSize,
  moonRight,
  onPressSky,
  children,
}: {
  ground?: boolean;
  /** Where the hills sit, from the bottom of the screen. */
  hillsBottom?: number;
  moonTop?: number;
  moonSize?: number;
  moonRight?: number;
  /** Tapping the empty sky (used to put the keyboard away). */
  onPressSky?: () => void;
  children?: React.ReactNode;
}) {
  const { width, height } = useWindowDimensions();
  const t = useT();
  const bats = useRef<BatsHandle>(null);
  const phase = useMemo(() => moonPhase(), []);
  const witching = isWitchingHour();

  const hillsH = width * HILLS_ASPECT;
  const groundH = width * GROUND_ASPECT;
  const hb = hillsBottom ?? (ground ? groundH * 0.32 : height * 0.12);
  const size = moonSize ?? Math.min(width * 0.26, 130);

  return (
    <View style={StyleSheet.absoluteFill}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onPressSky} disabled={!onPressSky} accessible={false}>
        <LinearGradient
          colors={witching ? ['#0a0414', '#2a0b3a', '#57195e', '#6a2168'] : ['#070514', '#150c34', '#2c1757', '#3b1f63']}
          locations={[0, 0.42, 0.78, 1]}
          style={StyleSheet.absoluteFill}
        />
        <Stars width={width} height={height * 0.7} />
      </Pressable>
      <View style={[styles.moon, { top: moonTop ?? height * 0.07, right: moonRight ?? width * 0.1 }]}>
        <Moon
          size={size}
          phase={phase}
          label={t('a11y.moon')}
          onPress={() => {
            Sound.play('whoosh');
            bats.current?.swarm();
          }}
        />
      </View>
      <Bats ref={bats} width={width} height={height} />
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <Image source={HILLS} style={[styles.layer, { bottom: hb, width, height: hillsH }]} contentFit="fill" />
        {/* the hills' base continues down to whatever stands in front of them */}
        <View style={[styles.layer, { bottom: 0, width, height: hb + 2, backgroundColor: '#1a0f36' }]} />
        <Fog width={width} bottom={hb - hillsH * 0.08} height={hillsH * 0.45} opacity={0.22} duration={80000} />
        {ground ? <Image source={GROUND} style={[styles.layer, { bottom: 0, width, height: groundH }]} contentFit="fill" /> : null}
      </View>
      {children}
      <Fog width={width} bottom={-height * 0.02} height={height * 0.16} opacity={ground ? 0.16 : 0.2} duration={55000} reverse />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0 },
  moon: { position: 'absolute' },
});
