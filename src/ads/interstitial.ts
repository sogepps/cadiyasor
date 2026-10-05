/**
 * Interstitial ads.
 *
 * One rule never bends: an ad never makes the user wait. If no ad is loaded when one is due it is
 * skipped silently and the next one starts loading, so the rituals flow the same offline or when
 * there is no fill.
 *
 * Real ad ids are used only in release builds; development and tester builds use Google's test ids
 * (seeing or tapping your own live ads can get the AdMob account suspended).
 */

import { Platform } from 'react-native';
import mobileAds, {
  AdEventType,
  AdsConsent,
  AdsConsentPrivacyOptionsRequirementStatus,
  InterstitialAd,
  MaxAdContentRating,
  TestIds,
} from 'react-native-google-mobile-ads';

/** An ad is due after every this many readings... */
export const READINGS_PER_AD = 3;
/** ...and never sooner than this after the previous one (ms). */
export const MIN_AD_GAP_MS = 60_000;

/** Tester builds (EXPO_PUBLIC_TEST_ADS=1) use Google's test ads too, never the real unit. */
const USE_TEST_ADS = __DEV__ || process.env.EXPO_PUBLIC_TEST_ADS === '1';

const AD_UNIT_ID = USE_TEST_ADS
  ? TestIds.INTERSTITIAL
  : Platform.select({
      android: 'ca-app-pub-7722268759200069/8997937943',
      default: TestIds.INTERSTITIAL,
    });

/** A fortune app for all ages: keep ad content at the general-audience level. */
const MAX_AD_CONTENT_RATING = MaxAdContentRating.PG;

/** Retry delays after a failed load (ms). */
const RETRY_DELAYS_MS = [4_000, 15_000, 60_000];

/**
 * Safety timers: if show() never opens the ad, or the "closed" event never arrives, the app must
 * not stay blocked. The second one is long so it never fires while someone is watching.
 */
const OPEN_TIMEOUT_MS = 8_000;
const VISIBLE_TIMEOUT_MS = 120_000;

class InterstitialManager {
  private ad: InterstitialAd | null = null;
  private offs: (() => void)[] = [];
  private loading = false;
  private ready = false;
  private retries = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private watchdog: ReturnType<typeof setTimeout> | null = null;
  private settle: ((shown: boolean) => void) | null = null;
  private started = false;

  /** Called once at launch: gathers consent where required, starts the SDK, preloads an ad. */
  async start(): Promise<void> {
    if (this.started) return;
    this.started = true;

    try {
      // Shows the form only in the EU/UK and regulated US states; elsewhere it passes silently.
      await AdsConsent.gatherConsent();
    } catch {
      // Consent flow failed: the SDK continues with its default behaviour.
    }

    try {
      await mobileAds().setRequestConfiguration({ maxAdContentRating: MAX_AD_CONTENT_RATING });
      await mobileAds().initialize();
    } catch {
      return;
    }

    this.load();
  }

  /**
   * Whether the user must be offered a way to change their ad consent (EU/UK and similar
   * regions). Settings shows an "Ad privacy choices" row only when this is true.
   */
  async privacyOptionsRequired(): Promise<boolean> {
    try {
      const info = await AdsConsent.getConsentInfo();
      return info.privacyOptionsRequirementStatus === AdsConsentPrivacyOptionsRequirementStatus.REQUIRED;
    } catch {
      return false;
    }
  }

  /** Opens Google's consent form again so the user can change their choice. */
  async showPrivacyOptions(): Promise<void> {
    try {
      await AdsConsent.showPrivacyOptionsForm();
    } catch {
      /* form unavailable (offline): nothing to do */
    }
  }

  /** Shows the loaded ad; resolves when it closes (or at once if none is ready) with whether it showed. */
  show(): Promise<boolean> {
    const ad = this.ad;
    if (!this.ready || !ad?.loaded) {
      // Missed this time; start loading the next one now.
      this.load();
      return Promise.resolve(false);
    }

    this.ready = false;
    return new Promise<boolean>((resolve) => {
      this.settle = resolve;
      this.arm(OPEN_TIMEOUT_MS);
      try {
        ad.show();
      } catch {
        this.finish(false);
      }
    });
  }

  /* ── internals ─────────────────────────────────────────────────────────── */

  /** Creates a fresh ad instance and starts loading it. */
  private load() {
    if (this.loading || this.ready) return;
    this.dispose();
    this.loading = true;

    const ad = InterstitialAd.createForAdRequest(AD_UNIT_ID);
    this.ad = ad;
    this.offs.push(
      ad.addAdEventListener(AdEventType.LOADED, () => {
        this.loading = false;
        this.ready = true;
        this.retries = 0;
      }),
      // The ad is open and being watched: switch to the long timer.
      ad.addAdEventListener(AdEventType.OPENED, () => {
        if (this.settle) this.arm(VISIBLE_TIMEOUT_MS);
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => this.finish(true)),
      ad.addAdEventListener(AdEventType.ERROR, () => {
        this.loading = false;
        this.ready = false;
        // If the error came while showing, release the app.
        this.finish(false);
        this.scheduleRetry();
      }),
    );

    ad.load();
  }

  /** Arms the safety timer. */
  private arm(ms: number) {
    if (this.watchdog) clearTimeout(this.watchdog);
    this.watchdog = setTimeout(() => this.finish(false), ms);
  }

  /** Resolves the pending show() and prepares the next ad. */
  private finish(shown: boolean) {
    if (this.watchdog) {
      clearTimeout(this.watchdog);
      this.watchdog = null;
    }

    const resolve = this.settle;
    this.settle = null;
    if (!resolve) return;

    resolve(shown);
    // Build the next instance after leaving the listener.
    setTimeout(() => this.load(), 0);
  }

  private scheduleRetry() {
    if (this.retryTimer) return;
    const delay = RETRY_DELAYS_MS[Math.min(this.retries, RETRY_DELAYS_MS.length - 1)];
    this.retries += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.load();
    }, delay);
  }

  private dispose() {
    for (const off of this.offs) off();
    this.offs = [];
    this.ad = null;
    this.ready = false;
    this.loading = false;
  }
}

export const Interstitial = new InterstitialManager();
