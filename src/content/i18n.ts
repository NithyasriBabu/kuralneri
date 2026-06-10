import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import tamilTranslations from 'src/content/tamil.json';
import englishTranslations from 'src/content/english.json';

export const i18nResources = {
  ta: tamilTranslations,
  en: englishTranslations,
} as const;

export const FALLBACK_LANGUAGE_CODES = {
  tamil: 'ta',
  english: 'en',
} as const;

void i18n.use(initReactI18next).init({
  resources: i18nResources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'filters', 'pagination', 'navigation', 'cards', 'settings', 'guru'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
