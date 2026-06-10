import { useMemo } from 'react';
import { useTranslation as useI18nextTranslation } from 'react-i18next';

import i18n, { FALLBACK_LANGUAGE_CODES } from 'src/content/i18n';
import { useSettings } from 'src/context/SettingsContext';
import { LangToggle, LangToggleKey, TranslationLocale } from 'src/types/settings';

export type TranslationNamespace =
  | 'common'
  | 'filters'
  | 'pagination'
  | 'navigation'
  | 'cards'
  | 'settings'
  | 'guru';
export type TranslationKey = string;

function formatTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = values[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}

function readLocaleValue(
  namespace: TranslationNamespace,
  key: TranslationKey,
  locale: TranslationLocale,
): string {
  const localeCode = FALLBACK_LANGUAGE_CODES[locale];
  const fixedT = i18n.getFixedT(localeCode, namespace);
  const value = fixedT(key);
  return typeof value === 'string' ? value : '';
}

export function translate(
  namespace: TranslationNamespace,
  key: TranslationKey,
  toggle: LangToggle,
  fallbackLocale: TranslationLocale,
  separator = ' / ',
): string {
  const tamil =
    readLocaleValue(namespace, key, 'tamil') || readLocaleValue(namespace, key, fallbackLocale);
  const english =
    readLocaleValue(namespace, key, 'english') || readLocaleValue(namespace, key, fallbackLocale);

  if (toggle.tamil && toggle.english) {
    if (tamil === english) return tamil;
    return `${tamil}${separator}${english}`;
  }

  if (toggle.tamil) return tamil;
  return english;
}

export function translateSingle(
  namespace: TranslationNamespace,
  key: TranslationKey,
  locale: TranslationLocale,
  fallbackLocale: TranslationLocale,
): string {
  return readLocaleValue(namespace, key, locale) || readLocaleValue(namespace, key, fallbackLocale);
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
  namespace: TranslationNamespace,
  page: number,
  totalPages: number,
  toggle: LangToggle,
  fallbackLocale: TranslationLocale,
): string {
  const tamil = formatTemplate(
    readLocaleValue(namespace, 'pageOf', 'tamil') ||
      readLocaleValue(namespace, 'pageOf', fallbackLocale),
    {
      page,
      total: totalPages,
    },
  );
  const english = formatTemplate(
    readLocaleValue(namespace, 'pageOf', 'english') ||
      readLocaleValue(namespace, 'pageOf', fallbackLocale),
    {
      page,
      total: totalPages,
    },
  );

  return formatTranslation(tamil, english, toggle);
}

export function formatRangeStatus(
  namespace: TranslationNamespace,
  start: number,
  end: number,
  toggle: LangToggle,
  fallbackLocale: TranslationLocale,
): string {
  const tamil = formatTemplate(
    readLocaleValue(namespace, 'kuralsRange', 'tamil') ||
      readLocaleValue(namespace, 'kuralsRange', fallbackLocale),
    { start, end },
  );
  const english = formatTemplate(
    readLocaleValue(namespace, 'kuralsRange', 'english') ||
      readLocaleValue(namespace, 'kuralsRange', fallbackLocale),
    { start, end },
  );

  return formatTranslation(tamil, english, toggle);
}

export function useTranslation(
  toggleKey: LangToggleKey = 'uiChrome',
  namespace: TranslationNamespace = 'common',
) {
  const { i18n: i18nextInstance } = useI18nextTranslation(namespace);
  const { settings } = useSettings();
  const toggle = settings.langToggles[toggleKey];
  const fallbackLocale = settings.fallbackLanguage;

  return useMemo(
    () => ({
      toggle,
      fallbackLocale,
      i18n: i18nextInstance,
      t: (key: TranslationKey) => translate(namespace, key, toggle, fallbackLocale),
      tSingle: (key: TranslationKey, locale: TranslationLocale) =>
        translateSingle(namespace, key, locale, fallbackLocale),
      format: (tamil: string, english: string) => formatTranslation(tamil, english, toggle),
      formatPageStatus: (page: number, totalPages: number) =>
        formatPageStatus(namespace, page, totalPages, toggle, fallbackLocale),
      formatRangeStatus: (start: number, end: number) =>
        formatRangeStatus(namespace, start, end, toggle, fallbackLocale),
    }),
    [namespace, toggle, fallbackLocale, i18nextInstance],
  );
}
