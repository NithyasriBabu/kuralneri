import { KuralSegmentedOption } from 'src/components/common/KuralSegmentedControl';
import {
  ColorScheme,
  FontSizeScale,
  TranslationLocale,
  ThemeMode,
} from 'src/types/settings';

type Translate = (key: string) => string;
type TranslateSingle = (key: string, fallback: TranslationLocale) => string;

export function createAuthorOptions(t: Translate): KuralSegmentedOption<string>[] {
  return [
    { label: t('allAuthors'), value: '' },
    { label: t('authorMVaradarajan'), value: 'mv' },
    { label: t('authorSolomonPappaiah'), value: 'sp' },
    { label: t('authorMKarunanidhi'), value: 'mk' },
  ];
}

export function createLanguageOptions(
  tSingle: TranslateSingle,
): KuralSegmentedOption<TranslationLocale>[] {
  return [
    { label: tSingle('tamilLanguage', 'tamil'), value: 'tamil' },
    { label: tSingle('englishLanguage', 'english'), value: 'english' },
  ];
}

export function createColorSchemeOptions(t: Translate): KuralSegmentedOption<ColorScheme>[] {
  return [
    { label: t('earthySage'), value: 'earthySage' },
    { label: t('sandstone'), value: 'sandstone' },
    { label: t('forest'), value: 'forest' },
    { label: t('ocean'), value: 'ocean' },
    { label: t('plum'), value: 'plum' },
    { label: t('highContrast'), value: 'highContrast' },
    { label: t('nightOcean'), value: 'nightOcean' },
    { label: t('terracotta'), value: 'terracotta' },
    { label: t('lavender'), value: 'lavender' },
    { label: t('monochrome'), value: 'monochrome' },
  ];
}

export function createAppearanceOptions(t: Translate): KuralSegmentedOption<ThemeMode>[] {
  return [
    { label: `☀ ${t('light')}`, value: 'light' },
    { label: `☾ ${t('dark')}`, value: 'dark' },
    { label: `⚙ ${t('system')}`, value: 'system' },
  ];
}

export function createFontSizeOptions(t: Translate): KuralSegmentedOption<FontSizeScale>[] {
  return [
    { label: t('small'), value: 'small' },
    { label: t('medium'), value: 'medium' },
    { label: t('large'), value: 'large' },
    { label: t('xlarge'), value: 'xlarge' },
  ];
}
