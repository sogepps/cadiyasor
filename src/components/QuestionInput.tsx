import React, { useCallback } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Txt from './Txt';
import { contentFor } from '../content';
import { Sound } from '../audio/sound';
import { useLocale, useT } from '../store/SettingsProvider';
import { localeInfo } from '../i18n/languages';
import { Colors, Fonts } from '../theme';

/**
 * Where the question goes — optional: the witch reads minds too. The dice suggests a question for
 * anyone who can't think of one.
 */
export default function QuestionInput({
  value,
  onChange,
  editable = true,
}: {
  value: string;
  onChange: (text: string) => void;
  editable?: boolean;
}) {
  const t = useT();
  const locale = useLocale();
  const rtl = Boolean(localeInfo(locale).rtl);
  const fonts = localeInfo(locale).fonts;

  const idea = useCallback(() => {
    const qs = contentFor(locale).questions;
    let next = qs[Math.floor(Math.random() * qs.length)];
    for (let i = 0; next === value && i < 5; i++) next = qs[Math.floor(Math.random() * qs.length)];
    Sound.play('sparkle', { volume: 0.35 });
    onChange(next);
  }, [locale, onChange, value]);

  return (
    <View style={styles.wrap}>
      <View style={styles.field}>
        <Ionicons name="moon" size={18} color={Colors.gold} style={styles.lead} />
        <TextInput
          value={value}
          onChangeText={onChange}
          editable={editable}
          placeholder={t('ask.placeholder')}
          placeholderTextColor={Colors.textFaint}
          maxLength={140}
          multiline
          submitBehavior="blurAndSubmit"
          returnKeyType="done"
          style={[
            styles.input,
            fonts ? { fontFamily: Fonts.textItalic, fontSize: 19 } : { fontStyle: 'italic', fontSize: 17 },
            { textAlign: rtl ? 'right' : 'left', writingDirection: rtl ? 'rtl' : 'ltr' },
          ]}
          accessibilityLabel={t('ask.placeholder')}
        />
        {value ? (
          <Pressable onPress={() => onChange('')} hitSlop={10} accessibilityLabel={t('common.close')}>
            <Ionicons name="close-circle" size={20} color={Colors.textFaint} />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={idea} style={styles.idea} accessibilityRole="button" accessibilityLabel={t('ask.idea')} hitSlop={6}>
        <Ionicons name="dice" size={16} color={Colors.goldSoft} />
        <Txt variant="ui" size={13} color={Colors.goldSoft}>
          {t('ask.idea')}
        </Txt>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', alignItems: 'center', gap: 6 },
  field: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: 'rgba(16,8,36,0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,228,160,0.38)',
  },
  lead: { opacity: 0.9 },
  input: { flex: 1, color: Colors.text, paddingVertical: 8, maxHeight: 84 },
  idea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(90,47,160,0.45)',
  },
});
