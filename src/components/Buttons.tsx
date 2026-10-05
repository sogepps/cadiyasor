import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import Txt from './Txt';
import { Sound } from '../audio/sound';
import { Colors } from '../theme';
import { useDirectionalIcon } from '../i18n/rtl';

/** The big gold-rimmed action button ("ASK AGAIN"). */
export function MysticButton({
  label,
  onPress,
  icon,
  style,
  small,
}: {
  label: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  return (
    <Pressable
      onPress={() => {
        Sound.play('tap');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.mysticWrap, { transform: [{ scale: pressed ? 0.96 : 1 }] }, style]}
    >
      <LinearGradient colors={['#ffe4a0', '#d49a3a', '#8a5a1c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.rim}>
        <LinearGradient colors={['#5a2fa0', '#2d1462']} style={[styles.inner, small && styles.innerSmall]}>
          {icon ? <Ionicons name={icon} size={small ? 18 : 22} color={Colors.goldSoft} /> : null}
          <Txt variant="display" size={small ? 15 : 19} color={Colors.goldSoft} caps numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
            {label}
          </Txt>
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

/** A round glass icon button (settings, journal, back, share, save). */
export function IconButton({
  icon,
  onPress,
  label,
  active,
  size = 46,
  style,
  caption,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  label: string;
  active?: boolean;
  size?: number;
  style?: StyleProp<ViewStyle>;
  caption?: string;
}) {
  const directional = useDirectionalIcon();
  return (
    <Pressable
      onPress={() => {
        Sound.play('tap');
        onPress();
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.iconWrap, { opacity: pressed ? 0.75 : 1 }, style]}
    >
      <View
        style={[
          styles.icon,
          { width: size, height: size, borderRadius: size / 2 },
          active && { borderColor: Colors.gold, backgroundColor: 'rgba(242,193,78,0.18)' },
        ]}
      >
        <Ionicons name={directional(icon)} size={size * 0.48} color={active ? Colors.gold : Colors.text} />
      </View>
      {caption ? (
        <Txt variant="ui" size={12} color={Colors.textDim} center numberOfLines={1} style={styles.caption}>
          {caption}
        </Txt>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  mysticWrap: {
    alignSelf: 'center',
    borderRadius: 999,
    shadowColor: '#f2c14e',
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  rim: { borderRadius: 999, padding: 2.5 },
  inner: { borderRadius: 999, paddingHorizontal: 30, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  innerSmall: { paddingHorizontal: 20, paddingVertical: 9 },
  iconWrap: { alignItems: 'center' },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(22,11,48,0.7)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,228,160,0.35)',
  },
  caption: { marginTop: 4, maxWidth: 90 },
});
