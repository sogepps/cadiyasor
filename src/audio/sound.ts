/**
 * Sound effects, the night music and haptics behind one small singleton.
 *
 * Every sound in assets/sounds is synthesised by tools/audio/synth.cjs, so the app ships nothing
 * with a licence to worry about. Settings are pushed in with `configure()`; components only say
 * `Sound.play('reveal')`.
 */

import { AppState, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

export type SfxName =
  | 'tap'
  | 'bubble'
  | 'rub'
  | 'reveal'
  | 'laugh'
  | 'page'
  | 'thump'
  | 'whoosh'
  | 'sparkle'
  | 'meow'
  | 'card';

type HapticKind = 'light' | 'medium' | 'heavy' | 'success' | 'none';

const SFX: Record<SfxName, { source: number; volume: number; haptic: HapticKind }> = {
  tap: { source: require('../../assets/sounds/tap.wav'), volume: 0.45, haptic: 'light' },
  bubble: { source: require('../../assets/sounds/bubble.wav'), volume: 0.5, haptic: 'none' },
  rub: { source: require('../../assets/sounds/rub.wav'), volume: 0.35, haptic: 'light' },
  reveal: { source: require('../../assets/sounds/reveal.wav'), volume: 0.85, haptic: 'success' },
  laugh: { source: require('../../assets/sounds/laugh.wav'), volume: 0.8, haptic: 'none' },
  page: { source: require('../../assets/sounds/page.wav'), volume: 0.6, haptic: 'light' },
  thump: { source: require('../../assets/sounds/thump.wav'), volume: 0.8, haptic: 'heavy' },
  whoosh: { source: require('../../assets/sounds/whoosh.wav'), volume: 0.6, haptic: 'medium' },
  sparkle: { source: require('../../assets/sounds/sparkle.wav'), volume: 0.55, haptic: 'none' },
  meow: { source: require('../../assets/sounds/meow.wav'), volume: 0.7, haptic: 'light' },
  card: { source: require('../../assets/sounds/card.wav'), volume: 0.7, haptic: 'medium' },
};

const MUSIC = { source: require('../../assets/sounds/night.mp3'), volume: 0.32 };

/** Several players per effect so quick repeats (bubbles, rub ticks) overlap instead of cutting off. */
const POOL_SIZE = 2;

class SoundManager {
  private sfxOn = true;
  private musicOn = true;
  private hapticsOn = true;
  private audioModeReady = false;
  private pools = new Map<SfxName, { players: AudioPlayer[]; cursor: number }>();
  private music: AudioPlayer | null = null;
  private musicWanted = false;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') this.applyMusic();
      else this.music?.pause();
    });
  }

  configure(opts: { sounds?: boolean; music?: boolean; haptics?: boolean }) {
    if (opts.sounds !== undefined) this.sfxOn = opts.sounds;
    if (opts.haptics !== undefined) this.hapticsOn = opts.haptics;
    if (opts.music !== undefined) {
      this.musicOn = opts.music;
      this.applyMusic();
    }
  }

  /** Audible in silent mode, never interrupting other apps' audio. */
  private ensureAudioMode() {
    if (this.audioModeReady) return;
    this.audioModeReady = true;
    void setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      interruptionMode: 'mixWithOthers',
      shouldPlayInBackground: false,
    }).catch(() => {});
  }

  private pool(name: SfxName) {
    let pool = this.pools.get(name);
    if (!pool) {
      const players: AudioPlayer[] = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        try {
          const p = createAudioPlayer(SFX[name].source);
          p.volume = SFX[name].volume;
          players.push(p);
        } catch {
          /* no audio device: stay silent */
        }
      }
      pool = { players, cursor: 0 };
      this.pools.set(name, pool);
    }
    return pool;
  }

  /** Loads every effect up front so the first reveal is not late. */
  preload() {
    this.ensureAudioMode();
    (Object.keys(SFX) as SfxName[]).forEach((n) => this.pool(n));
  }

  play(name: SfxName, options?: { volume?: number; haptic?: boolean; rate?: number }) {
    this.ensureAudioMode();
    if (options?.haptic !== false) this.haptic(SFX[name].haptic);
    if (!this.sfxOn) return;
    const pool = this.pool(name);
    const player = pool.players[pool.cursor];
    if (!player) return;
    pool.cursor = (pool.cursor + 1) % pool.players.length;
    try {
      player.volume = options?.volume ?? SFX[name].volume;
      if (options?.rate) player.setPlaybackRate(options.rate);
      void player.seekTo(0);
      player.play();
    } catch {
      /* ignore */
    }
  }

  haptic(kind: HapticKind) {
    if (!this.hapticsOn || kind === 'none' || Platform.OS === 'web') return;
    try {
      if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      else
        void Haptics.impactAsync(
          kind === 'heavy' ? Haptics.ImpactFeedbackStyle.Heavy : kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
        );
    } catch {
      /* ignore */
    }
  }

  /** The night music plays while the app is open and music is on. */
  startMusic() {
    this.musicWanted = true;
    this.applyMusic();
  }

  private applyMusic() {
    this.ensureAudioMode();
    if (!this.musicWanted || !this.musicOn || AppState.currentState !== 'active') {
      this.fadeTo(0);
      return;
    }
    if (!this.music) {
      try {
        this.music = createAudioPlayer(MUSIC.source);
        this.music.loop = true;
        this.music.volume = 0;
      } catch {
        return;
      }
    }
    try {
      this.music.play();
    } catch {
      /* ignore */
    }
    this.fadeTo(MUSIC.volume);
  }

  private fadeTo(target: number) {
    const player = this.music;
    if (!player) return;
    if (this.fadeTimer) clearInterval(this.fadeTimer);
    this.fadeTimer = setInterval(() => {
      const v = player.volume + Math.sign(target - player.volume) * 0.04;
      if (Math.abs(target - player.volume) <= 0.04) {
        player.volume = target;
        if (target === 0) player.pause();
        if (this.fadeTimer) clearInterval(this.fadeTimer);
        this.fadeTimer = null;
      } else player.volume = v;
    }, 60);
  }
}

export const Sound = new SoundManager();
