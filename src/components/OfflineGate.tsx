import React, { useState } from 'react';
import { BackHandler, Modal, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Txt from './Txt';
import { MysticButton } from './Buttons';
import { recheckConnection, useOnline } from '../net/connection';
import { useIsRtl } from '../i18n/rtl';
import { useT } from '../store/SettingsProvider';
import { Colors, Radius, Space } from '../theme';
import { SHOT_MODE } from '../shots/shotMode';

/** Covers the whole app while there is no internet; the witch only answers online. */
export default function OfflineGate() {
  const online = useOnline();
  const t = useT();
  const rtl = useIsRtl();
  const [checking, setChecking] = useState(false);

  const retry = async () => {
    if (checking) return;
    setChecking(true);
    await recheckConnection();
    setChecking(false);
  };

  // The screenshot build has no gate.
  if (SHOT_MODE) return null;

  return (
    <Modal
      visible={!online}
      transparent
      animationType="fade"
      statusBarTranslucent
      // Back leaves the app; there is nothing to go back to while offline.
      onRequestClose={() => BackHandler.exitApp()}
    >
      <View style={[styles.root, { direction: rtl ? 'rtl' : 'ltr' }]}>
        <View style={styles.card}>
          <Ionicons name="cloud-offline" size={56} color={Colors.goldSoft} />
          <Txt variant="display" size={22} color={Colors.goldSoft} center>
            {t('net.title')}
          </Txt>
          <Txt size={19} color={Colors.textDim} center>
            {t('net.desc')}
          </Txt>
          <MysticButton label={t('net.retry')} icon="refresh" onPress={() => void retry()} style={[styles.button, checking && styles.busy]} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7,5,20,0.92)',
  },
  card: {
    width: '86%',
    maxWidth: 380,
    alignItems: 'center',
    gap: Space.md,
    padding: Space.xl,
    borderRadius: Radius.lg,
    backgroundColor: Colors.panelStrong,
    borderWidth: 1.5,
    borderColor: Colors.hairline,
  },
  button: { alignSelf: 'stretch', marginTop: Space.sm },
  busy: { opacity: 0.5 },
});
