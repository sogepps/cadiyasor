import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { detectLocale, LOCALES, type LocaleCode, type LocaleInfo } from '../i18n/languages';
import { Sound } from '../audio/sound';
import { useSettings, useT } from '../store/SettingsProvider';
import Txt from './Txt';
import { Colors } from '../theme';

/** Full-screen language list with search; the phone's own language comes first. */
export default function LanguagePicker({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useT();
  const { locale, update } = useSettings();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const device = detectLocale();
    const ordered: LocaleInfo[] = [...LOCALES.filter((l) => l.code === device), ...LOCALES.filter((l) => l.code !== device)];
    const q = query.trim().toLowerCase();
    return q ? ordered.filter((l) => l.name.toLowerCase().includes(q) || l.code.toLowerCase().includes(q)) : ordered;
  }, [query]);

  const choose = (code: LocaleCode) => {
    Sound.play('sparkle', { volume: 0.4 });
    update({ locale: code });
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Ionicons name="language" size={22} color={Colors.goldSoft} />
          <Txt variant="display" size={22} color={Colors.goldSoft} style={styles.title}>
            {t('settings.language')}
          </Txt>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel={t('common.close')}>
            <Ionicons name="close" size={26} color={Colors.textDim} />
          </Pressable>
        </View>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={Colors.textDim} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('settings.searchLanguage')}
            placeholderTextColor={Colors.textFaint}
            style={styles.input}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
        <FlatList
          data={data}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const active = item.code === locale;
            return (
              <Pressable onPress={() => choose(item.code)} style={[styles.row, active && styles.rowActive]} accessibilityRole="button" accessibilityState={{ selected: active }}>
                <Txt variant="ui" size={22}>
                  {item.flag}
                </Txt>
                <Txt variant="ui" bold size={16} style={styles.name} numberOfLines={1}>
                  {item.name}
                </Txt>
                {active ? <Ionicons name="checkmark-circle" size={22} color={Colors.gold} /> : null}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0e0726', paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  title: { flex: 1 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: Colors.hairline,
    marginBottom: 10,
  },
  input: { flex: 1, color: Colors.text, fontSize: 16, paddingVertical: 10 },
  list: { paddingBottom: 40, gap: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)' },
  rowActive: { backgroundColor: 'rgba(242,193,78,0.14)', borderWidth: 1, borderColor: 'rgba(242,193,78,0.6)' },
  name: { flex: 1 },
});
