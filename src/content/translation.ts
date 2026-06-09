import { useMemo } from 'react';

import { useSettings } from 'src/context/SettingsContext';
import { LangToggle, LangToggleKey, TranslationLocale } from 'src/types/settings';

import tamilTranslations from 'src/content/tamil.json';
import englishTranslations from 'src/content/english.json';

const TRANSLATIONS = {
  tamil: tamilTranslations,
  english: englishTranslations,
} as const;

export type TranslationKey = keyof typeof tamilTranslations;

function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

function resolveLocaleValue(
  key: TranslationKey,
  locale: TranslationLocale,
  fallbackLocale: TranslationLocale,
): string {
  const primary = TRANSLATIONS[locale][key];
  if (typeof primary === 'string' && primary.length > 0) return primary;

  const fallback = TRANSLATIONS[fallbackLocale][key];
  if (typeof fallback === 'string' && fallback.length > 0) return fallback;

  return '';
}

export function translate(
  key: TranslationKey,
  toggle: LangToggle,
  fallbackLocale: TranslationLocale,
  separator = ' / ',
): string {
  const tamil = resolveLocaleValue(key, 'tamil', fallbackLocale);
  const english = resolveLocaleValue(key, 'english', fallbackLocale);

  if (toggle.tamil && toggle.english) {
    if (tamil === english) return tamil;
    return `${tamil}${separator}${english}`;
  }

  if (toggle.tamil) return tamil;
  return english;
}

export function translateSingle(
  key: TranslationKey,
  locale: TranslationLocale,
  fallbackLocale: TranslationLocale,
): string {
  return resolveLocaleValue(key, locale, fallbackLocale);
}

export function formatTranslation(
  tamil: string,
  english: string,
  toggle: LangToggle,
  separator = ' / ',
): string {
  if (toggle.tamil && toggle.english) {
    if (tamil === english) return tamil;
    return `${tamil}${separator}${english}`;
  }

  if (toggle.tamil) return tamil;
  return english;
}

export function formatPageStatus(
  page: number,
  totalPages: number,
  toggle: LangToggle,
  fallbackLocale: TranslationLocale,
): string {
  const tamil = formatTemplate(resolveLocaleValue('pageOf', 'tamil', fallbackLocale), {
    page,
    total: totalPages,
  });
  const english = formatTemplate(resolveLocaleValue('pageOf', 'english', fallbackLocale), {
    page,
    total: totalPages,
  });

  return formatTranslation(tamil, english, toggle);
}

export function formatRangeStatus(
  start: number,
  end: number,
  toggle: LangToggle,
  fallbackLocale: TranslationLocale,
): string {
  const tamil = formatTemplate(resolveLocaleValue('kuralsRange', 'tamil', fallbackLocale), {
    start,
    end,
  });
  const english = formatTemplate(resolveLocaleValue('kuralsRange', 'english', fallbackLocale), {
    start,
    end,
  });

  return formatTranslation(tamil, english, toggle);
}

export function useTranslation(toggleKey: LangToggleKey = 'uiChrome') {
  const { settings } = useSettings();
  const toggle = settings.langToggles[toggleKey];
  const fallbackLocale = settings.fallbackLanguage;

  return useMemo(
    () => ({
      toggle,
      fallbackLocale,
      t: (key: TranslationKey) => translate(key, toggle, fallbackLocale),
      tSingle: (key: TranslationKey, locale: TranslationLocale) =>
        translateSingle(key, locale, fallbackLocale),
      format: (tamil: string, english: string) => formatTranslation(tamil, english, toggle),
      formatPageStatus: (page: number, totalPages: number) =>
        formatPageStatus(page, totalPages, toggle, fallbackLocale),
      formatRangeStatus: (start: number, end: number) =>
        formatRangeStatus(start, end, toggle, fallbackLocale),
    }),
    [toggle, fallbackLocale],
  );
}
