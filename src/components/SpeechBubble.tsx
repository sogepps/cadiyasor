import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import Txt from './Txt';
import { Colors } from '../theme';

/**
 * What the witch says. A new line pops in with a little bounce; the tail points down at her.
 */
export default function SpeechBubble({ text, maxWidth, visible = true }: { text: string; maxWidth: number; visible?: boolean }) {
  const pop = useSharedValue(0);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (!visible) {
      pop.value = withTiming(0, { duration: 160 });
      return;
    }
    pop.value = withSequence(withTiming(0.85, { duration: 90 }), withTiming(1, { duration: 220, easing: Easing.out(Easing.back(2)) }));
    setShown(text);
  }, [text, visible, pop]);

  const style = useAnimatedStyle(() => ({ opacity: Math.min(1, pop.value * 1.4), transform: [{ scale: 0.85 + pop.value * 0.15 }] }));

  return (
    <Animated.View pointerEvents="none" style={[styles.wrap, { maxWidth }, style]}>
      <View style={styles.bubble}>
        <Txt variant="italic" size={18} color={Colors.bubbleInk} center>
          {shown}
        </Txt>
      </View>
      <View style={styles.tail} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  bubble: {
    backgroundColor: Colors.bubble,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 2,
    borderColor: 'rgba(90,47,160,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tail: {
    width: 18,
    height: 18,
    marginTop: -10,
    backgroundColor: Colors.bubble,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(90,47,160,0.35)',
  },
});
