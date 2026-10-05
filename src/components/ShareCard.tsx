import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';

import Txt from './Txt';
import type { Tone } from '../content/types';
import { answerFontSize, Colors, ToneColors } from '../theme';
import { useT } from '../store/SettingsProvider';

const SCROLL = require('../../assets/art/scroll.png');
const MOON = require('../../assets/art/moon.png');
const HAT = require('../../assets/icon.png');

export const SHARE_W = 360;
export const SHARE_H = 450;

/**
 * The picture that gets shared: the answer on its scroll under the moon, the question above it and
 * the app's name below. Rendered off-screen and captured with react-native-view-shot.
 */
const ShareCard = forwardRef<View, { answer: string; tone: Tone; question?: string }>(function ShareCard({ answer, tone, question }, ref) {
  const t = useT();
  const sw = SHARE_W * 0.9;
  const sh = sw * (760 / 900);
  const k = sw / 900;
  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      <LinearGradient colors={['#070514', '#1e1044', '#3b1f63']} style={StyleSheet.absoluteFill} />
      <Image source={MOON} style={styles.moon} />
      {[...Array(18)].map((_, i) => (
        <View key={i} style={[styles.star, { left: (i * 97) % SHARE_W, top: (i * 53) % 160, opacity: 0.4 + ((i * 7) % 6) / 10 }]} />
      ))}
      <View style={styles.header}>
        <Txt variant="display" size={26} color={Colors.goldSoft} center glow="rgba(242,193,78,0.5)">
          {t('app.name')}
        </Txt>
        {question ? (
          <Txt variant="italic" size={16} color={Colors.text} center numberOfLines={3} style={styles.q}>
            “{question}”
          </Txt>
        ) : null}
      </View>
      <View style={{ width: sw, height: sh, alignSelf: 'center' }}>
        <View style={[styles.glow, { backgroundColor: ToneColors[tone].glow }]} />
        <Image source={SCROLL} style={{ width: sw, height: sh }} contentFit="contain" />
        <View style={[styles.textBox, { left: 160 * k, right: 160 * k, top: 170 * k, bottom: 200 * k }]}>
          <Txt variant="display" size={answerFontSize(answer, 600 * k) * 1.5} color={Colors.ink} center adjustsFontSizeToFit numberOfLines={4} minimumFontScale={0.5}>
            {answer}
          </Txt>
        </View>
      </View>
      <View style={styles.footer}>
        <Image source={HAT} style={styles.icon} />
        <Txt variant="ui" size={12} color={Colors.textDim}>
          {t('app.name')} · {t('app.tagline')} · Google Play
        </Txt>
      </View>
    </View>
  );
});

export default ShareCard;

const styles = StyleSheet.create({
  card: { width: SHARE_W, height: SHARE_H, overflow: 'hidden', justifyContent: 'space-between', paddingVertical: 16 },
  moon: { position: 'absolute', right: 22, top: 18, width: 56, height: 56 },
  star: { position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 22, gap: 6 },
  q: { opacity: 0.9 },
  glow: { position: 'absolute', left: '15%', right: '15%', top: '20%', bottom: '20%', borderRadius: 999, opacity: 0.35 },
  textBox: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  icon: { width: 22, height: 22, borderRadius: 6 },
});
