import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useKeepAwake } from 'expo-keep-awake';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNavigationContainerRef, DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { CinzelDecorative_700Bold, CinzelDecorative_900Black } from '@expo-google-fonts/cinzel-decorative';
import { Cinzel_700Bold } from '@expo-google-fonts/cinzel';
import {
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold,
} from '@expo-google-fonts/cormorant-garamond';

import { setFontsAvailable } from './src/components/Txt';
import { Colors } from './src/theme';
import { Sound } from './src/audio/sound';
import { Interstitial } from './src/ads/interstitial';
import { pinNativeLayoutToLtr, useIsRtl } from './src/i18n/rtl';
import { SettingsProvider, useSettings } from './src/store/SettingsProvider';
import { JournalProvider } from './src/store/JournalProvider';
import HomeScreen from './src/screens/HomeScreen';
import CauldronScreen from './src/screens/CauldronScreen';
import BookScreen from './src/screens/BookScreen';
import BallScreen from './src/screens/BallScreen';
import JournalScreen from './src/screens/JournalScreen';
import type { RootStackParamList } from './src/navigation/types';
import { SHOT_MODE } from './src/shots/shotMode';
import { useShotDirector } from './src/shots/ShotDirector';
import OfflineGate from './src/components/OfflineGate';
import { watchConnection } from './src/net/connection';

// Direction is applied per locale on the root view (see src/i18n/rtl.ts), never natively.
pinNativeLayoutToLtr();
void SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const navTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Colors.night0, card: Colors.night1, text: Colors.text, border: Colors.hairline, primary: Colors.gold },
};

/** Pushes the sound settings into the sound manager and starts the night music. */
function AudioBridge() {
  const { sounds, music, haptics, hydrated } = useSettings();
  useEffect(() => {
    Sound.configure({ sounds, music, haptics });
  }, [sounds, music, haptics]);
  // After the first frame: creating ~30 audio players is slow on low-end phones and must not hold
  // the splash screen.
  useEffect(() => {
    if (!hydrated) return;
    const music = setTimeout(() => Sound.startMusic(), 600);
    const sfx = setTimeout(() => Sound.preload(), 1500);
    return () => {
      clearTimeout(music);
      clearTimeout(sfx);
    };
  }, [hydrated]);
  return null;
}

function Navigation() {
  const { hydrated } = useSettings();
  const rtl = useIsRtl();
  useShotDirector(navigationRef);

  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync().catch(() => {});
  }, [hydrated]);

  // Nothing until saved settings are read, so the first frame is already in the right language.
  if (!hydrated) return <View style={styles.splash} />;

  return (
    <View style={[styles.flex, { direction: rtl ? 'rtl' : 'ltr' }]}>
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: Colors.night0 } }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Cauldron" component={CauldronScreen} options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="Book" component={BookScreen} options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="Ball" component={BallScreen} options={{ animation: 'fade_from_bottom' }} />
          <Stack.Screen name="Journal" component={JournalScreen} options={{ animation: 'slide_from_right' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  // Rubbing and holding take a while; the screen must not dim meanwhile.
  useKeepAwake();

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    CinzelDecorative_700Bold,
    CinzelDecorative_900Black,
    Cinzel_700Bold,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) setFontsAvailable(true);
  }, [fontsLoaded]);

  // The app is online-only; the gate below covers it while there is no connection.
  useEffect(() => {
    if (!SHOT_MODE) watchConnection();
  }, []);

  useEffect(() => {
    // Consent + SDK start + first ad preload, a moment after launch: the first ad is only due after
    // three readings, and the SDK's start-up work must not compete with the first frame.
    // The screenshot build shows no ads.
    if (SHOT_MODE) return;
    const timer = setTimeout(() => void Interstitial.start(), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Fall back to the system font if the fonts fail: the app must never hang on a font.
  if (!fontsLoaded && !fontError) return <View style={styles.splash} />;

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <SettingsProvider>
          <JournalProvider>
            <AudioBridge />
            <Navigation />
            <OfflineGate />
            <StatusBar style="light" />
          </JournalProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  splash: { flex: 1, backgroundColor: Colors.night0 },
});
