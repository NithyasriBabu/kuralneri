import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { db } from 'src/data/database';
import { runWebDbTask } from 'src/data/webDbQueue';
import { ThemeMode } from 'src/theme/types';

const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;

const THEME_MODE_KEY = 'theme_mode';

async function ensureSettingsTable() {
  if (Platform.OS === 'web') {
    const targetDb = await db;
    await targetDb.execAsync(TABLE_SQL);
    return targetDb;
  }

  const targetDb = db as SQLite.SQLiteDatabase;
  targetDb.execSync(TABLE_SQL);
  return targetDb;
}

export async function loadThemeMode(): Promise<ThemeMode | null> {
  return runWebDbTask(async () => {
    try {
      const targetDb = await ensureSettingsTable();

      const row =
        Platform.OS === 'web'
          ? await targetDb.getFirstAsync<{ value: string }>(
              `SELECT value FROM app_settings WHERE key = ? LIMIT 1;`,
              [THEME_MODE_KEY],
            )
          : targetDb.getFirstSync<{ value: string }>(
              `SELECT value FROM app_settings WHERE key = ? LIMIT 1;`,
              [THEME_MODE_KEY],
            );

      if (row?.value === 'dark' || row?.value === 'light') {
        return row.value;
      }

      return null;
    } catch (error) {
      console.error('Failed to load saved theme mode:', error);
      return null;
    }
  });
}

export async function saveThemeMode(mode: ThemeMode): Promise<void> {
  return runWebDbTask(async () => {
    try {
      const targetDb = await ensureSettingsTable();
      const sql = `
        INSERT INTO app_settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `;

      if (Platform.OS === 'web') {
        await targetDb.runAsync(sql, [THEME_MODE_KEY, mode]);
      } else {
        targetDb.runSync(sql, [THEME_MODE_KEY, mode]);
      }
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  });
}
