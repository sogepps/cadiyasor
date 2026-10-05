import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View, type ImageSourcePropType } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import NightSky, { isWitchingHour } from '../components/NightSky';
import Cat from '../components/Cat';
import OmenCard from '../components/OmenCard';
import SettingsSheet from '../components/SettingsSheet';
import { IconButton } from '../components/Buttons';
import Txt from '../components/Txt';
import { Sound } from '../audio/sound';
import { moonPhase } from '../oracle/moon';
import { dayKey } from '../oracle/random';
import { useSettings, useT } from '../store/SettingsProvider';
import type { StringKey } from '../i18n/strings';
import { Colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { useDirectionalIcon } from '../i18n/rtl';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const CAULDRON = require('../../assets/art/cauldron.png');
const BOOK = require('../../assets/art/book-closed.png');
const BALL = require('../../assets/art/ball-thumb.png');
const CARD = require('../../assets/art/card-back.png');

/** Late October to the first of November. */
function isHalloween(d = new Date()) {
  return (d.getMonth() === 9 && d.getDate() >= 24) || (d.getMonth() === 10 && d.getDate() <= 1);
}

/** The witch's lair: title, today's omen, and the three ways to ask. */
export default function HomeScreen({ navigation, route }: Props) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const t = useT();
  const settings = useSettings();
  const [omenOpen, setOmenOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const phase = useMemo(() => moonPhase(), []);
  const seen = settings.omenDay === dayKey();

  useEffect(() => {
    if (route.params?.omen) setOmenOpen(true);
  }, [route.params?.omen]);

  const glow = useSharedValue(0);
  useEffect(() => {
    glow.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow]);
  const cardGlow = useAnimatedStyle(() => ({ shadowOpacity: seen ? 0.2 : 0.35 + glow.value * 0.5, borderColor: seen ? Colors.hairline : `rgba(242,193,78,${0.45 + glow.value * 0.45})` }));

  const catW = Math.min(width * 0.15, 80);
  const compact = height - insets.top - insets.bottom < 700;
  const groundH = width * (720 / 1080);
  const banner: StringKey | null = isWitchingHour() ? 'home.witchingHour' : isHalloween() ? 'home.halloween' : null;

  const go = (screen: 'Cauldron' | 'Book' | 'Ball') => {
    Sound.play('whoosh', { volume: 0.4 });
    navigation.navigate(screen);
  };

  return (
    <View style={styles.root}>
      <NightSky ground moonTop={insets.top + 56} moonSize={Math.min(width * 0.15, 76)} moonRight={width * 0.035}>
        <View style={[styles.cat, { left: width * (170 / 1080) - catW / 2, bottom: groundH * (1 - 482 / 720) - 4 }]}>
          <Cat width={catW} />
        </View>
      </NightSky>

      {/* Not a ScrollView: the sky behind (moon, cat) must stay tappable. Short screens get compact tiles. */}
      <View pointerEvents="box-none" style={[styles.scroll, { paddingTop: insets.top + 8 }, compact && styles.scrollCompact]}>
        <View style={styles.topRow}>
          <IconButton icon="settings-outline" label={t('home.settings')} onPress={() => setSettingsOpen(true)} size={44} />
          <IconButton icon="reader-outline" label={t('home.journal')} onPress={() => navigation.navigate('Journal')} size={44} />
        </View>

        <Animated.View entering={FadeInDown.duration(700)} style={[styles.titleBlock, { paddingHorizontal: Math.min(width * 0.19, 96) }]} pointerEvents="none">
          <Txt variant="display" size={Math.min(46, width * 0.11)} color={Colors.goldSoft} center glow="rgba(242,193,78,0.55)" numberOfLines={2} adjustsFontSizeToFit>
            {t('app.name')}
          </Txt>
          <Txt variant="italic" size={20} color={Colors.text} center glow>
            {t('app.tagline')}
          </Txt>
          <View style={styles.moonLine}>
            <Ionicons name="moon" size={13} color={Colors.moon} />
            <Txt variant="ui" size={13} color={Colors.textDim}>
              {t('home.tonight', { phase: t(`moon.${phase.name}` as StringKey) })}
            </Txt>
          </View>
          {banner ? (
            <Txt variant="italic" size={16} color="#ffb3f0" center glow style={styles.banner}>
              {t(banner)}
            </Txt>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(600)}>
          <Pressable
            onPress={() => {
              Sound.play('card', { volume: 0.4 });
              setOmenOpen(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('home.omen.title')}
          >
            <Animated.View style={[styles.omen, cardGlow]}>
              <Image source={CARD} style={styles.omenCard} contentFit="contain" />
              <View style={styles.omenText}>
                <Txt variant="display" size={19} color={Colors.goldSoft} numberOfLines={1} adjustsFontSizeToFit>
                  {t('home.omen.title')}
                </Txt>
                <Txt variant="ui" size={13} color={Colors.textDim} numberOfLines={2}>
                  {seen ? t('home.omen.seen') : t('home.omen.tap')}
                </Txt>
              </View>
              {seen && settings.omenStreak > 0 ? (
                <View style={styles.streak}>
                  <Ionicons name="flame" size={16} color="#ff9a3a" />
                  <Txt variant="ui" size={15} color={Colors.goldSoft} bold>
                    {String(settings.omenStreak)}
                  </Txt>
                </View>
              ) : (
                <Ionicons name="sparkles" size={22} color={Colors.gold} />
              )}
            </Animated.View>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).duration(600)}>
          <Tile big compact={compact} image={CAULDRON} aspect={560 / 600} title={t('home.cauldron.title')} sub={t('home.cauldron.sub')} onPress={() => go('Cauldron')} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(360).duration(600)} style={styles.pair} pointerEvents="box-none">
          <Tile compact={compact} image={BOOK} aspect={480 / 640} title={t('home.book.title')} sub={t('home.book.sub')} onPress={() => go('Book')} />
          <Tile compact={compact} image={BALL} aspect={700 / 600} title={t('home.ball.title')} sub={t('home.ball.sub')} onPress={() => go('Ball')} />
        </Animated.View>
      </View>

      <OmenCard visible={omenOpen} onClose={() => setOmenOpen(false)} />
      <SettingsSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

function Tile({
  image,
  aspect,
  title,
  sub,
  onPress,
  big,
  compact,
}: {
  image: ImageSourcePropType;
  aspect: number;
  title: string;
  sub: string;
  onPress: () => void;
  big?: boolean;
  compact?: boolean;
}) {
  const art = (big ? 104 : 74) * (compact ? 0.72 : 1);
  const directional = useDirectionalIcon();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${sub}`} style={({ pressed }) => [big ? styles.tileBig : styles.tileSmall, { transform: [{ scale: pressed ? 0.97 : 1 }] }]}>
      <LinearGradient colors={['rgba(90,47,160,0.55)', 'rgba(22,11,48,0.82)']} style={[styles.tile, big ? styles.tileRow : styles.tileCol, compact && !big && styles.tileColCompact]}>
        <Image source={image} style={{ width: big ? art * 1.2 : art, height: (big ? art * 1.2 : art) * aspect }} contentFit="contain" />
        <View style={big ? styles.tileTextBig : styles.tileTextSmall}>
          <Txt variant="display" size={big ? 22 : 17} color={Colors.goldSoft} center={!big} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
            {title}
          </Txt>
          <Txt variant="ui" size={13} color={Colors.textDim} center={!big} numberOfLines={2}>
            {sub}
          </Txt>
        </View>
        {big ? <Ionicons name={directional('chevron-forward')} size={22} color={Colors.goldSoft} /> : null}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.night0 },
  scroll: { flex: 1, paddingHorizontal: 18, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center' },
  scrollCompact: { gap: 9 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between' },
  titleBlock: { alignItems: 'center', marginTop: 6, marginBottom: 4 },
  moonLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  banner: { marginTop: 6 },
  omen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(22,11,48,0.78)',
    shadowColor: '#f2c14e',
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  omenCard: { width: 40, height: 64 },
  omenText: { flex: 1, gap: 2 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,154,58,0.15)' },
  pair: { flexDirection: 'row', gap: 14 },
  tileBig: { width: '100%' },
  tileSmall: { flex: 1 },
  tile: { borderRadius: 22, borderWidth: 1.5, borderColor: 'rgba(255,228,160,0.3)', overflow: 'hidden' },
  tileRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16 },
  tileCol: { alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 10, minHeight: 158, justifyContent: 'center' },
  tileColCompact: { minHeight: 140, paddingVertical: 10, gap: 4 },
  tileTextBig: { flex: 1, gap: 4 },
  tileTextSmall: { gap: 4, alignItems: 'center' },
  cat: { position: 'absolute' },
});
