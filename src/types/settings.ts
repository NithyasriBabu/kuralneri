/**
 * All persisted user preferences for Kuralneri.
 */

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme =
  | 'earthySage'
  | 'sandstone'
  | 'forest'
  | 'ocean'
  | 'plum'
  | 'highContrast'
  | 'nightOcean'
  | 'terracotta'
  | 'lavender'
  | 'monochrome';
export type TranslationLocale = 'tamil' | 'english';
export type SetupLanguageChoice = TranslationLocale | 'both';
export type OnboardingStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type KuralListDisplayMode = 'responsive' | 'full' | 'compact';

export type TamilFont = 'MuktaMalar' | 'Latha' | 'Catamaran' | 'ArimaMadurai';

export type EnglishFont = 'Inter' | 'Merriweather' | 'SourceSerif';

export type FontSizeScale = 'small' | 'medium' | 'large' | 'xlarge';
export const TAMIL_FONT_OPTIONS = [
  'MuktaMalar',
  'Latha',
  'Catamaran',
  'ArimaMadurai',
] as const satisfies readonly TamilFont[];
export const ENGLISH_FONT_OPTIONS = [
  'Inter',
  'Merriweather',
  'SourceSerif',
] as const satisfies readonly EnglishFont[];
export const FONT_SIZE_SCALE_OPTIONS = [
  'small',
  'medium',
  'large',
  'xlarge',
] as const satisfies readonly FontSizeScale[];
export const TRANSLATION_LOCALE_OPTIONS = [
  'tamil',
  'english',
] as const satisfies readonly TranslationLocale[];

/** Per-section language visibility — at least one must be true */
export interface LangToggle {
  tamil: boolean;
  english: boolean;
}

/** Keys matching places in the app that show bilingual content */
export type LangToggleKey =
  | 'kuralCard' // Tamil couplet lines + English translation on cards
  | 'commentary' // Commentary/notes section in detail view
  | 'filterLabels' // Filter dropdown labels and toolbar controls
  | 'navLabels' // Bottom/top nav tab labels
  | 'uiChrome' // App chrome, controls, empty states, and dialogs
  | 'sectionHeaders'; // Section headers (இன்றைய அதிகாரம் / Wisdom of the Day)

export type LangToggles = Record<LangToggleKey, LangToggle>;

export interface AppSettings {
  userName: string;
  userNameTamil: string;
  preferredAuthorCode: string; // 'mv' | 'sp' | 'mk' | '' (all)
  selfNotesEnabled: boolean;
  fallbackLanguage: TranslationLocale;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  tamilFont: TamilFont;
  englishFont: EnglishFont;
  fontSizeScale: FontSizeScale;
  onboardingStatus: OnboardingStatus;
  onboardingStep: number;
  kuralListDisplayMode: KuralListDisplayMode;
  compactShowTamil: true;
  compactShowTaxonomy: boolean;
  compactShowTranslation: boolean;
  compactShowExplanation: boolean;
  compactShowBookmark: boolean;
  langToggles: LangToggles;
}

export type AppSettingsScalar = Omit<AppSettings, 'langToggles'>;
export type AppSettingsScalarKey = keyof AppSettingsScalar;

export const APP_SETTINGS_SCALAR_KEYS = [
  'userName',
  'userNameTamil',
  'preferredAuthorCode',
  'selfNotesEnabled',
  'fallbackLanguage',
  'themeMode',
  'colorScheme',
  'tamilFont',
  'englishFont',
  'fontSizeScale',
  'onboardingStatus',
  'onboardingStep',
  'kuralListDisplayMode',
  'compactShowTamil',
  'compactShowTaxonomy',
  'compactShowTranslation',
  'compactShowExplanation',
  'compactShowBookmark',
] as const satisfies readonly AppSettingsScalarKey[];

export const APP_SETTINGS_LANG_TOGGLE_KEYS = [
  'kuralCard',
  'commentary',
  'filterLabels',
  'navLabels',
  'uiChrome',
  'sectionHeaders',
] as const satisfies readonly LangToggleKey[];

export const DEFAULT_LANG_TOGGLES: LangToggles = {
  kuralCard: { tamil: true, english: true },
  commentary: { tamil: false, english: true },
  filterLabels: { tamil: true, english: true },
  navLabels: { tamil: true, english: true },
  uiChrome: { tamil: true, english: true },
  sectionHeaders: { tamil: true, english: true },
};

export const DEFAULT_SETTINGS: AppSettings = {
  userName: '',
  userNameTamil: '',
  preferredAuthorCode: '',
  selfNotesEnabled: true,
  fallbackLanguage: 'english',
  themeMode: 'system',
  colorScheme: 'earthySage',
  tamilFont: 'MuktaMalar',
  englishFont: 'Inter',
  fontSizeScale: 'medium',
  onboardingStatus: 'not_started',
  onboardingStep: 0,
  kuralListDisplayMode: 'responsive',
  compactShowTamil: true,
  compactShowTaxonomy: true,
  compactShowTranslation: false,
  compactShowExplanation: false,
  compactShowBookmark: true,
  langToggles: DEFAULT_LANG_TOGGLES,
};

export const FONT_SIZE_MULTIPLIERS: Record<FontSizeScale, number> = {
  small: 0.85,
  medium: 1,
  large: 1.2,
  xlarge: 1.45,
};

export const TAMIL_FONT_FAMILIES: Record<TamilFont, string> = {
  MuktaMalar: 'MuktaMalar-Regular',
  Latha: 'Latha',
  Catamaran: 'Catamaran-Regular',
  ArimaMadurai: 'ArimaMadurai-Regular',
};

export const ENGLISH_FONT_FAMILIES: Record<EnglishFont, string> = {
  Inter: 'Inter-Regular',
  Merriweather: 'Merriweather-Regular',
  SourceSerif: 'SourceSerif-Regular',
};
