import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

/**
 * Calls `onShake(strength)` while the phone is being shaken. Strength is how far the acceleration
 * jumped from the last sample (in g). No permission is needed for the accelerometer.
 */
export function useShake(onShake: (strength: number) => void, enabled: boolean) {
  const handler = useRef(onShake);
  handler.current = onShake;

  useEffect(() => {
    if (!enabled) return;
    let last: { x: number; y: number; z: number } | null = null;
    let sub: { remove: () => void } | null = null;
    try {
      Accelerometer.setUpdateInterval(60);
      sub = Accelerometer.addListener((a) => {
        if (last) {
          const jump = Math.abs(a.x - last.x) + Math.abs(a.y - last.y) + Math.abs(a.z - last.z);
          if (jump > 0.9) handler.current(jump);
        }
        last = a;
      });
    } catch {
      /* no sensor (emulator, web): swirling still works */
    }
    return () => sub?.remove();
  }, [enabled]);
}
