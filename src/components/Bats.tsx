import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

const BAT = require('../../assets/art/bat.png');

interface Flight {
  id: number;
  fromLeft: boolean;
  y: number;
  size: number;
  duration: number;
}

export interface BatsHandle {
  /** Sends a small colony across the sky (tapping the moon does this). */
  swarm: () => void;
}

/** Bats that now and then flap across the sky; `swarm()` releases a whole colony. */
const Bats = forwardRef<BatsHandle, { width: number; height: number; auto?: boolean }>(function Bats({ width, height, auto = true }, ref) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const nextId = useRef(0);

  const launch = useCallback(
    (count: number, spread: number) => {
      const fromLeft = Math.random() < 0.5;
      const baseY = height * (0.08 + Math.random() * 0.25);
      const add: Flight[] = Array.from({ length: count }, (_, i) => ({
        id: nextId.current++,
        fromLeft,
        y: baseY + (Math.random() - 0.5) * spread,
        size: 26 + Math.random() * 22,
        duration: 5200 + Math.random() * 2500 + i * 180,
      }));
      setFlights((f) => [...f, ...add]);
    },
    [height],
  );

  useImperativeHandle(ref, () => ({ swarm: () => launch(7, height * 0.18) }), [launch, height]);

  useEffect(() => {
    if (!auto) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(() => {
        launch(1 + Math.floor(Math.random() * 2), 40);
        schedule();
      }, 9000 + Math.random() * 12000);
    };
    timer = setTimeout(() => {
      launch(2, 40);
      schedule();
    }, 2500);
    return () => clearTimeout(timer);
  }, [auto, launch]);

  const done = useCallback((id: number) => setFlights((f) => f.filter((x) => x.id !== id)), []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {flights.map((f) => (
        <Bat key={f.id} flight={f} width={width} onDone={done} />
      ))}
    </View>
  );
});

export default Bats;

function Bat({ flight, width, onDone }: { flight: Flight; width: number; onDone: (id: number) => void }) {
  const t = useSharedValue(0);
  const flap = useSharedValue(1);
  useEffect(() => {
    t.value = withTiming(1, { duration: flight.duration, easing: Easing.linear });
    flap.value = withRepeat(withSequence(withTiming(0.35, { duration: 110 }), withTiming(1, { duration: 130 })), -1, false);
    const timer = setTimeout(() => onDone(flight.id), flight.duration + 100);
    return () => clearTimeout(timer);
  }, [flight, t, flap, onDone]);

  const style = useAnimatedStyle(() => {
    const x = flight.fromLeft ? -80 + t.value * (width + 160) : width + 80 - t.value * (width + 160);
    const y = flight.y + Math.sin(t.value * Math.PI * 4) * 16;
    return {
      transform: [{ translateX: x }, { translateY: y }, { scaleX: flight.fromLeft ? 1 : -1 }, { scaleY: flap.value }],
    };
  });

  return (
    <Animated.View style={[styles.bat, { width: flight.size, height: flight.size / 2 }, style]}>
      <Image source={BAT} style={{ width: flight.size, height: flight.size / 2 }} contentFit="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bat: { position: 'absolute', left: 0, top: 0 },
});
