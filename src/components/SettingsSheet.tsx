import React, { useEffect, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_VERSION, PRIVACY_POLICY_URL } from '../config';
import { localeInfo } from '../i18n/languages';
import { Sound } from '../audio/sound';
import { Interstitial } from '../ads/interstitial';
import { useSettings, useT } from '../store/SettingsProvider';
import LanguagePicker from './LanguagePicker';
import Txt from './Txt';
import { Colors } from '../theme';
import { useDirectionalIcon } from '../i18n/rtl';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function Row({ icon, label, children, onPress }: { icon: IconName; label: string; children?: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={Colors.goldSoft} />
      </View>
      <Txt variant="text" bold size={17} style={styles.rowLabel} numberOfLines={2}>
        {label}
      </Txt>
      {children}
    </Pressable>
  );
}

function Toggle({ icon, label, value, onChange }: { icon: IconName; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row icon={icon} label={label}>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.18)', true: 'rgba(242,193,78,0.55)' }}
        thumbColor={value ? Colors.gold : '#bbb'}
        accessibilityLabel={label}
      />
    </Row>
  );
}

/** Language, music, sounds, vibration, privacy — a sheet rising from the bottom. */
export default function SettingsSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useT();
  const settings = useSettings();
  const insets = useSafeAreaInsets();
  const slide = useSharedValue(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [adChoices, setAdChoices] = useState(false);

  useEffect(() => {
    slide.value = withSpring(visible ? 1 : 0, { damping: 18, stiffness: 160 });
    if (visible) void Interstitial.privacyOptionsRequired().then(setAdChoices);
  }, [visible, slide]);

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: (1 - slide.value) * 520 }] }));
  const info = localeInfo(settings.locale);
  const directional = useDirectionalIcon();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('common.close')} />
      <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }, sheetStyle]}>
        <View style={styles.grabber} />
        <View style={styles.header}>
          <Txt variant="display" size={22} color={Colors.goldSoft}>
            {t('settings.title')}
          </Txt>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.close')}>
            <Ionicons name="close" size={24} color={Colors.textDim} />
          </Pressable>
        </View>

        <Row icon="language" label={t('settings.language')} onPress={() => setPickerOpen(true)}>
          <Txt variant="ui" size={14} color={Colors.textDim} numberOfLines={1} style={styles.langValue}>
            {info.flag} {info.name}
          </Txt>
          <Ionicons name={directional('chevron-forward')} size={18} color={Colors.textDim} />
        </Row>
        <View style={styles.divider} />
        <Toggle icon="musical-notes" label={t('settings.music')} value={settings.music} onChange={(v) => settings.update({ music: v })} />
        <Toggle
          icon="volume-high"
          label={t('settings.sounds')}
          value={settings.sounds}
          onChange={(v) => {
            settings.update({ sounds: v });
            if (v) setTimeout(() => Sound.play('sparkle', { volume: 0.4 }), 50);
          }}
        />
        <Toggle
          icon="phone-portrait"
          label={t('settings.haptics')}
          value={settings.haptics}
          onChange={(v) => {
            settings.update({ haptics: v });
            if (v) setTimeout(() => Sound.haptic('medium'), 50);
          }}
        />
        <View style={styles.divider} />
        <Row icon="shield-checkmark-outline" label={t('settings.privacy')} onPress={() => void Linking.openURL(PRIVACY_POLICY_URL)}>
          <Ionicons name="open-outline" size={16} color={Colors.textDim} />
        </Row>
        {adChoices ? (
          <Row icon="options-outline" label={t('settings.adChoices')} onPress={() => void Interstitial.showPrivacyOptions()}>
            <Ionicons name={directional('chevron-forward')} size={18} color={Colors.textDim} />
          </Row>
        ) : null}

        <Txt variant="italic" size={14} color={Colors.textDim} center style={styles.disclaimer}>
          {t('settings.disclaimer')}
        </Txt>
        <Txt variant="ui" size={12} color={Colors.textFaint} center>
          {t('settings.version', { version: APP_VERSION })}
        </Txt>
      </Animated.View>
      <LanguagePicker visible={pickerOpen} onClose={() => setPickerOpen(false)} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(4,2,12,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#150a2e',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,228,160,0.3)',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  grabber: { alignSelf: 'center', width: 44, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(90,47,160,0.55)', alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1 },
  langValue: { maxWidth: 150 },
  divider: { height: 1, backgroundColor: 'rgba(255,228,160,0.15)', marginVertical: 4 },
  disclaimer: { marginTop: 14, marginBottom: 6, paddingHorizontal: 10 },
});
