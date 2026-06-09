import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { db } from 'src/data/database';
import { runWebDbTask } from 'src/data/webDbQueue';
import { AppSettings, DEFAULT_SETTINGS } from 'src/types/settings';

const SETTINGS_KEY = 'app_settings_v1';

// ─── helpers ────────────────────────────────────────────────────────────────

async function readRow(key: string): Promise<string | null> {
  return runWebDbTask(async () => {
    try {
      if (Platform.OS === 'web') {
        const targetDb = await db;
        const row = await targetDb.getFirstAsync<{ value: string }>(
          'SELECT value FROM app_settings WHERE key = ? LIMIT 1;',
          [key],
        );
        return row?.value ?? null;
      }
      const targetDb = db as SQLite.SQLiteDatabase;
      const row = targetDb.getFirstSync<{ value: string }>(
        'SELECT value FROM app_settings WHERE key = ? LIMIT 1;',
        [key],
      );
      return row?.value ?? null;
    } catch {
      return null;
    }
  });
}

async function writeRow(key: string, value: string): Promise<void> {
  return runWebDbTask(async () => {
    const sql = `
      INSERT INTO app_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value;
    `;
    try {
      if (Platform.OS === 'web') {
        const targetDb = await db;
        await targetDb.runAsync(sql, [key, value]);
      } else {
        const targetDb = db as SQLite.SQLiteDatabase;
        targetDb.runSync(sql, [key, value]);
      }
    } catch (e) {
      console.error('settingsService.writeRow failed:', e);
    }
  });
}

async function deleteRow(key: string): Promise<void> {
  return runWebDbTask(async () => {
    const sql = 'DELETE FROM app_settings WHERE key = ?;';
    try {
      if (Platform.OS === 'web') {
        const targetDb = await db;
        await targetDb.runAsync(sql, [key]);
      } else {
        const targetDb = db as SQLite.SQLiteDatabase;
        targetDb.runSync(sql, [key]);
      }
    } catch (e) {
      console.error('settingsService.deleteRow failed:', e);
    }
  });
}

// ─── public API ─────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  const raw = await readRow(SETTINGS_KEY);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    // Deep merge so new keys added to DEFAULT_SETTINGS are always present
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      langToggles: {
        ...DEFAULT_SETTINGS.langToggles,
        ...(parsed.langToggles ?? {}),
      },
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await writeRow(SETTINGS_KEY, JSON.stringify(settings));
}

export async function resetAllSettings(): Promise<void> {
  await deleteRow(SETTINGS_KEY);
}

/**
 * Wipe bookmarks from the kurals. Called from the Reset section.
 */
export async function clearAllBookmarks(): Promise<void> {
  return runWebDbTask(async () => {
    const sql = 'UPDATE kurals set is_bookmarked = 0;';
    try {
      if (Platform.OS === 'web') {
        const targetDb = await db;
        await targetDb.runAsync(sql);
      } else {
        const targetDb = db as SQLite.SQLiteDatabase;
        targetDb.runSync(sql);
      }
    } catch (e) {
      console.error('clearAllBookmarks failed:', e);
    }
  });
}
