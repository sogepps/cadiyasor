import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { localeInfo, toUpper } from '../i18n/languages';
import { useLocale } from '../store/SettingsProvider';
import { Colors, Fonts } from '../theme';

/** Set once the bundled fonts are loaded; until then (or if loading fails) the system font is used. */
let fontsAvailable = false;
export function setFontsAvailable(value: boolean) {
  fontsAvailable = value;
}

/**
 * - `display`: carved titles (Cinzel Decorative where the script allows it)
 * - `text`: body copy and answers (Cormorant Garamond)
 * - `italic`: the witch speaking
 * - `ui`: small labels, always legible
 */
export type TxtVariant = 'display' | 'text' | 'italic' | 'ui';

export interface TxtProps extends TextProps {
  variant?: TxtVariant;
  size?: number;
  color?: string;
  bold?: boolean;
  caps?: boolean;
  center?: boolean;
  /** Soft shadow for legibility over the night sky. */
  glow?: boolean | string;
}

export default function Txt({
  variant = 'text',
  size = 18,
  color = Colors.text,
  bold = false,
  caps = false,
  center = false,
  glow = false,
  style,
  children,
  ...rest
}: TxtProps) {
  const locale = useLocale();
  const fonts = fontsAvailable ? localeInfo(locale).fonts : undefined;
  // Cinzel draws lower case as small capitals, where Turkish "i" would lose its dot ("KITABI"):
  // Turkish and Azerbaijani display text is upper-cased with the locale's own rules instead.
  const dotted = variant === 'display' && fonts === 'full' && (locale === 'tr' || locale === 'az');
  const content = (caps || dotted) && typeof children === 'string' ? toUpper(children, locale) : children;

  let family: TextStyle;
  let scale = 1;
  if (variant === 'display' && fonts === 'full') {
    family = { fontFamily: dotted ? Fonts.displayPlain : Fonts.display };
    scale = dotted ? 0.86 : 0.92;
  } else if (variant === 'italic' && fonts) {
    family = { fontFamily: Fonts.textItalic };
    scale = 1.08;
  } else if (fonts && variant !== 'ui') {
    family = { fontFamily: bold || variant === 'display' ? Fonts.textBold : Fonts.text };
    // Cormorant has a small x-height; it needs a little more size to read like other fonts.
    scale = 1.12;
  } else if (fonts === 'full' || fonts === 'text') {
    family = { fontFamily: Fonts.textBold };
    scale = 1.1;
  } else {
    family = { fontWeight: bold || variant === 'display' ? '700' : '500', fontStyle: variant === 'italic' ? 'italic' : 'normal' };
  }
  const fontSize = Math.round(size * scale);

  return (
    <Text
      allowFontScaling={false}
      {...rest}
      style={[
        family,
        { fontSize, color, lineHeight: Math.round(fontSize * (fonts ? 1.22 : 1.42)) },
        caps && styles.caps,
        center && styles.center,
        glow
          ? { textShadowColor: typeof glow === 'string' ? glow : 'rgba(0,0,0,0.65)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 10 }
          : null,
        style,
      ]}
    >
      {content}
    </Text>
  );
}

const styles = StyleSheet.create({
  caps: { letterSpacing: 1.4 },
  center: { textAlign: 'center' },
});
