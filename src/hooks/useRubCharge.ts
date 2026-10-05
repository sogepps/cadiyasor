import { useCallback, useEffect, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { Sound } from '../audio/sound';

/** Distance the finger must travel over the cauldron to fill it (px). */
const RUB_TARGET = 950;

/** A shimmer tick and a light buzz every this many px — the feel of rubbing. */
const TICK_STEP = 90;

/**
 * "Rub the cauldron".
 *
 * Holding still is not enough: the finger has to travel. The distance fills `charge` from 0 to 1;
 * lifting the finger lets it drain slowly after a short pause, so rubbing in separate strokes works too. When it is full, `onCharged` fires once. `fill()` does
 * the same for people who can't rub (the accessible "reveal" button) and for screenshots.
 */
export function useRubCharge(onCharged: () => void, enabled: boolean, onRubStart?: () => void) {
  const travel = useSharedValue(0);
  const lastTick = useSharedValue(0);
  const rubbing = useSharedValue(0);
  const fired = useSharedValue(false);
  const active = useSharedValue(false);

  const charge = useDerivedValue(() => Math.min(1, travel.value / RUB_TARGET));

  // Flip a flag instead of rebuilding the Gesture: a rebuilt gesture stopped receiving touches
  // on the second round.
  useEffect(() => {
    active.value = enabled;
  }, [enabled, active]);

  const tick = useCallback(() => Sound.play('rub', { volume: 0.25 + Math.random() * 0.15 }), []);
  const done = useCallback(() => onCharged(), [onCharged]);

  useAnimatedReaction(
    () => charge.value >= 1,
    (full, previous) => {
      if (full && !previous && !fired.value) {
        fired.value = true;
        runOnJS(done)();
      }
    },
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .shouldCancelWhenOutside(false)
        .onBegin(() => {
          if (!active.value || fired.value) return;
          cancelAnimation(travel);
          rubbing.value = 1;
          lastTick.value = travel.value;
          if (onRubStart) runOnJS(onRubStart)();
        })
        .onChange((e) => {
          if (!active.value || fired.value) return;
          travel.value += Math.sqrt(e.changeX * e.changeX + e.changeY * e.changeY);
          if (travel.value - lastTick.value > TICK_STEP) {
            lastTick.value = travel.value;
            runOnJS(tick)();
          }
        })
        .onFinalize(() => {
          rubbing.value = 0;
          if (!fired.value && travel.value > 0) {
            // A short pause between strokes must not lose the progress: wait, then drain slowly.
            travel.value = withDelay(900, withTiming(0, { duration: 2600, easing: Easing.in(Easing.quad) }));
          }
        }),
    [tick, onRubStart, active, fired, travel, rubbing, lastTick],
  );

  const reset = useCallback(() => {
    cancelAnimation(travel);
    travel.value = 0;
    lastTick.value = 0;
    rubbing.value = 0;
    fired.value = false;
  }, [travel, lastTick, rubbing, fired]);

  /** Fills the cauldron without rubbing. */
  const fill = useCallback(
    (duration = 1400) => {
      if (fired.value) return;
      cancelAnimation(travel);
      travel.value = withTiming(RUB_TARGET, { duration, easing: Easing.inOut(Easing.quad) });
    },
    [fired, travel],
  );

  return { gesture, charge, rubbing, reset, fill };
}
