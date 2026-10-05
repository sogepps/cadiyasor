import type { RefObject } from 'react';
import { Share, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { SHARE_H, SHARE_W } from '../components/ShareCard';

export const STORE_LINK = 'https://play.google.com/store/apps/details?id=com.Soge.CadiyaSor';

/**
 * Shares a reading as a picture (the share card); if the picture cannot be made or shared, falls
 * back to plain text with the store link.
 */
export async function shareReading(card: RefObject<View | null>, fallbackText: string): Promise<boolean> {
  try {
    if (card.current && (await Sharing.isAvailableAsync())) {
      const uri = await captureRef(card, { format: 'png', quality: 1, result: 'tmpfile', width: SHARE_W * 3, height: SHARE_H * 3 });
      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: fallbackText });
      return true;
    }
  } catch {
    /* fall through to text */
  }
  try {
    await Share.share({ message: fallbackText });
    return true;
  } catch {
    return false;
  }
}
