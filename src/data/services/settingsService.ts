import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { db } from 'src/data/database';
import { runWebDbTask } from 'src/data/webDbQueue';
import {
  APP_SETTINGS_LANG_TOGGLE_KEYS,
  APP_SETTINGS_SCALAR_KEYS,
  AppSettings,
  AppSettingsScalar,
  DEFAULT_SETTINGS,
  EnglishFont,
  FontSizeScale,
  LangToggle,
  LangToggleKey,
  TranslationLocale,
  TamilFont,
  ThemeMode,
  ENGLISH_FONT_OPTIONS,
  FONT_SIZE_SCALE_OPTIONS,
  TAMIL_FONT_OPTIONS,
  TRANSLATION_LOCALE_OPTIONS,
} from 'src/types/settings';

type SettingsDb = SQLite.SQLiteDatabase;
type ScalarRow = { value: string };
type ToggleRow = { tamil: number; english: number };
interface ReadToggleRowResult {
  value: LangToggle | null;
  hadInvalidStoredValues: boolean;
}

const DEFAULT_SCALAR_SETTINGS: AppSettingsScalar = {
  userName: DEFAULT_SETTINGS.userName,
  userNameTamil: DEFAULT_SETTINGS.userNameTamil,
  preferredAuthorCode: DEFAULT_SETTINGS.preferredAuthorCode,
  selfNotesEnabled: DEFAULT_SETTINGS.selfNotesEnabled,
  fallbackLanguage: DEFAULT_SETTINGS.fallbackLanguage,
  themeMode: DEFAULT_SETTINGS.themeMode,
  tamilFont: DEFAULT_SETTINGS.tamilFont,
  englishFont: DEFAULT_SETTINGS.englishFont,
  fontSizeScale: DEFAULT_SETTINGS.fontSizeScale,
  customBackground: DEFAULT_SETTINGS.customBackground,
  customForeground: DEFAULT_SETTINGS.customForeground,
};

async function getSettingsDb(): Promise<SettingsDb> {
  return (await db) as SettingsDb;
}

async function withSettingsDb<T>(operation: (targetDb: SettingsDb) => Promise<T> | T): Promise<T> {
  return runWebDbTask(async () => {
    const targetDb = await getSettingsDb();
    return operation(targetDb);
  });
}

function isThemeMode(value: string): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

function isTamilFont(value: string): value is TamilFont {
  return TAMIL_FONT_OPTIONS.includes(value as TamilFont);
}

function isEnglishFont(value: string): value is EnglishFont {
  return ENGLISH_FONT_OPTIONS.includes(value as EnglishFont);
}

function isFontSizeScale(value: string): value is FontSizeScale {
  return FONT_SIZE_SCALE_OPTIONS.includes(value as FontSizeScale);
}

function isTranslationLocale(value: string): value is TranslationLocale {
  return TRANSLATION_LOCALE_OPTIONS.includes(value as TranslationLocale);
}

function coerceBoolean(value: unknown): boolean {
  return value === 1 || value === true;
}

async function readScalarRow(targetDb: SettingsDb, key: string): Promise<string | null> {
  const row =
    Platform.OS === 'web'
      ? await targetDb.getFirstAsync<ScalarRow>(
          'SELECT value FROM app_settings WHERE key = ? LIMIT 1;',
          [key],
        )
      : targetDb.getFirstSync<ScalarRow>('SELECT value FROM app_settings WHERE key = ? LIMIT 1;', [
          key,
        ]);

  return row?.value ?? null;
}

async function upsertScalarRow(targetDb: SettingsDb, key: string, value: string): Promise<void> {
  const sql = `
    INSERT INTO app_settings (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value;
  `;

  if (Platform.OS === 'web') {
    await targetDb.runAsync(sql, [key, value]);
    return;
  }

  targetDb.runSync(sql, [key, value]);
}

async function readToggleRow(
  targetDb: SettingsDb,
  key: LangToggleKey,
): Promise<ReadToggleRowResult> {
  const row =
    Platform.OS === 'web'
      ? await targetDb.getFirstAsync<ToggleRow>(
          'SELECT tamil, english FROM app_settings_lang_toggles WHERE key = ? LIMIT 1;',
          [key],
        )
      : targetDb.getFirstSync<ToggleRow>(
          'SELECT tamil, english FROM app_settings_lang_toggles WHERE key = ? LIMIT 1;',
          [key],
        );

  if (!row) return { value: null, hadInvalidStoredValues: false };

  const hadInvalidStoredValues = ![0, 1].includes(row.tamil) || ![0, 1].includes(row.english);

  return {
    value: {
      tamil: coerceBoolean(row.tamil),
      english: coerceBoolean(row.english),
    },
    hadInvalidStoredValues,
  };
}

export interface LoadSettingsResult {
  settings: AppSettings;
  hadInvalidStoredValues: boolean;
}

async function upsertToggleRow(
  targetDb: SettingsDb,
  key: LangToggleKey,
  value: LangToggle,
): Promise<void> {
  const sql = `
    INSERT INTO app_settings_lang_toggles (key, tamil, english)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET
      tamil = excluded.tamil,
      english = excluded.english;
  `;

  const tamil = value.tamil ? 1 : 0;
  const english = value.english ? 1 : 0;

  if (Platform.OS === 'web') {
    await targetDb.runAsync(sql, [key, tamil, english]);
    return;
  }

  targetDb.runSync(sql, [key, tamil, english]);
}

async function clearSettingsRows(targetDb: SettingsDb): Promise<void> {
  if (Platform.OS === 'web') {
    await targetDb.runAsync('DELETE FROM app_settings;');
    await targetDb.runAsync('DELETE FROM app_settings_lang_toggles;');
    return;
  }

  targetDb.runSync('DELETE FROM app_settings;');
  targetDb.runSync('DELETE FROM app_settings_lang_toggles;');
}

function buildDefaultSettings(): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    langToggles: {
      ...DEFAULT_SETTINGS.langToggles,
    },
  };
}

async function persistScalarPatch(
  targetDb: SettingsDb,
  patch: Partial<AppSettingsScalar>,
): Promise<void> {
  for (const key of APP_SETTINGS_SCALAR_KEYS) {
    const value = patch[key];
    if (value === undefined) continue;
    await upsertScalarRow(targetDb, key, String(value));
  }
}

async function persistTogglePatch(
  targetDb: SettingsDb,
  key: LangToggleKey,
  value: LangToggle,
): Promise<void> {
  await upsertToggleRow(targetDb, key, value);
}

// ─── public API ─────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<LoadSettingsResult> {
  return withSettingsDb(async (targetDb) => {
    const loaded = buildDefaultSettings();
    let hadInvalidStoredValues = false;

    for (const key of APP_SETTINGS_SCALAR_KEYS) {
      const rawValue = await readScalarRow(targetDb, key);
      if (rawValue === null) continue;

      switch (key) {
        case 'userName':
          loaded.userName = rawValue;
          break;
        case 'userNameTamil':
          loaded.userNameTamil = rawValue;
          break;
        case 'preferredAuthorCode':
          loaded.preferredAuthorCode = rawValue;
          break;
        case 'selfNotesEnabled':
          loaded.selfNotesEnabled = rawValue === '1' || rawValue === 'true';
          break;
        case 'fallbackLanguage':
          if (isTranslationLocale(rawValue)) loaded.fallbackLanguage = rawValue;
          else hadInvalidStoredValues = true;
          break;
        case 'themeMode':
          if (isThemeMode(rawValue)) loaded.themeMode = rawValue;
          else hadInvalidStoredValues = true;
          break;
        case 'tamilFont':
          if (isTamilFont(rawValue)) loaded.tamilFont = rawValue;
          else hadInvalidStoredValues = true;
          break;
        case 'englishFont':
          if (isEnglishFont(rawValue)) loaded.englishFont = rawValue;
          else hadInvalidStoredValues = true;
          break;
        case 'fontSizeScale':
          if (isFontSizeScale(rawValue)) loaded.fontSizeScale = rawValue;
          else hadInvalidStoredValues = true;
          break;
        case 'customBackground':
          loaded.customBackground = rawValue;
          break;
        case 'customForeground':
          loaded.customForeground = rawValue;
          break;
      }
    }

    for (const key of APP_SETTINGS_LANG_TOGGLE_KEYS) {
      const row = await readToggleRow(targetDb, key);
      hadInvalidStoredValues ||= row.hadInvalidStoredValues;
      if (row.value === null) continue;
      loaded.langToggles[key] = row.value;
    }

    return { settings: loaded, hadInvalidStoredValues };
  });
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  return withSettingsDb(async (targetDb) => {
    await persistScalarPatch(targetDb, settings);
    for (const key of APP_SETTINGS_LANG_TOGGLE_KEYS) {
      await persistTogglePatch(targetDb, key, settings.langToggles[key]);
    }
  });
}

export async function saveSettingsPatch(patch: Partial<AppSettingsScalar>): Promise<void> {
  return withSettingsDb(async (targetDb) => {
    await persistScalarPatch(targetDb, patch);
  });
}

export async function saveLangToggle(key: LangToggleKey, value: LangToggle): Promise<void> {
  return withSettingsDb(async (targetDb) => {
    await persistTogglePatch(targetDb, key, value);
  });
}

export async function resetAllSettings(): Promise<void> {
  return withSettingsDb(async (targetDb) => {
    await clearSettingsRows(targetDb);
    await persistScalarPatch(targetDb, DEFAULT_SCALAR_SETTINGS);
    for (const key of APP_SETTINGS_LANG_TOGGLE_KEYS) {
      await persistTogglePatch(targetDb, key, DEFAULT_SETTINGS.langToggles[key]);
    }
  });
}

/**
 * Wipe bookmarks from the kurals. Called from the Reset section.
 */
export async function clearAllBookmarks(): Promise<void> {
  return runWebDbTask(async () => {
    const sql = 'UPDATE kurals set is_bookmarked = 0;';
    if (Platform.OS === 'web') {
      const targetDb = await db;
      await targetDb.runAsync(sql);
      return;
    }

    const targetDb = db as SQLite.SQLiteDatabase;
    targetDb.runSync(sql);
  });
}
