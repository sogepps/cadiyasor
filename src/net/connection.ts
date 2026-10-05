import { useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import * as Network from 'expo-network';

/**
 * The app is online-only: this module tracks whether the device can reach the internet, and
 * `OfflineGate` covers the app while it cannot.
 *
 * Android reports `isInternetReachable: false` for networks it could not validate, and some
 * working networks never validate (captive DNS, blocked check servers). In that case one real
 * request decides, so a working connection is never locked out.
 */

// Google's own connectivity-check endpoints (empty 204 answers). Nothing is sent to our servers.
const PROBES = ['https://clients3.google.com/generate_204', 'https://www.gstatic.com/generate_204'];
const PROBE_TIMEOUT_MS = 5000;
/** A network handover briefly reports "offline"; wait this long before believing it. */
const OFFLINE_GRACE_MS = 1500;

let online = true;
let started = false;
/** Only the newest check may set the state. */
let checkId = 0;
const listeners = new Set<() => void>();

function set(next: boolean) {
  if (next === online) return;
  online = next;
  listeners.forEach((listener) => listener());
}

async function probe(): Promise<boolean> {
  for (const url of PROBES) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), PROBE_TIMEOUT_MS);
    try {
      await fetch(url, { method: 'HEAD', cache: 'no-store', signal: abort.signal });
      return true;
    } catch {
      // try the next one
    } finally {
      clearTimeout(timer);
    }
  }
  return false;
}

function looksOnline(state: Network.NetworkState): boolean {
  return state.isConnected !== false && state.isInternetReachable !== false;
}

async function isReachable(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    if (state.isConnected === false) return false;
    return state.isInternetReachable === false ? await probe() : true;
  } catch {
    return probe();
  }
}

/** Checks the connection now (after `delayMs`) and updates every `useOnline()`. */
export async function recheckConnection(delayMs = 0): Promise<boolean> {
  const id = ++checkId;
  if (delayMs) await new Promise((resolve) => setTimeout(resolve, delayMs));
  if (id !== checkId) return online;
  const reachable = await isReachable();
  if (id === checkId) set(reachable);
  return reachable;
}

/** Starts watching once, for the lifetime of the app. */
export function watchConnection() {
  if (started) return;
  started = true;
  void recheckConnection();
  Network.addNetworkStateListener((state) => {
    if (looksOnline(state)) {
      checkId++;
      set(true);
    } else {
      void recheckConnection(OFFLINE_GRACE_MS);
    }
  });
  // Wi-Fi is often switched on from the system settings: check again on the way back.
  AppState.addEventListener('change', (next) => {
    if (next === 'active') void recheckConnection();
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(subscribe, () => online);
}
