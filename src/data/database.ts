import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import detailData from 'api/detail.json';
import thirukkuralData from 'api/thirukkural.json';

const DB_NAME = 'kuralneri.db';

// Note: Handled as a Promise implicitly on Web
export const db =
  Platform.OS !== 'web' ? SQLite.openDatabaseSync(DB_NAME) : SQLite.openDatabaseAsync(DB_NAME);

const DATABASE_SCHEMA_SQL: string = `
    PRAGMA journal_mode = WAL; -- Switch to high-performance write-ahead logging
    PRAGMA foreign_keys = ON;  -- Enforce your relational structure limits
    
    CREATE TABLE IF NOT EXISTS paals (
      id INTEGER PRIMARY KEY,       -- Section number (1 = Aram, 2 = Porul, 3 = Inbam)
      name TEXT NOT NULL,           -- Tamil script name (e.g., 'அறத்துப்பால்')
      translation TEXT NOT NULL,    -- English translation (e.g., 'Virtue')
      transliteration TEXT NOT NULL -- Transliteration string (e.g., 'Araththuppaal')
    );

    CREATE TABLE IF NOT EXISTS iyals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paal_id INTEGER NOT NULL,     -- FK mapping back to parent division
      name TEXT NOT NULL,           -- Sub-section name (e.g., 'பாயிரவியல்')
      translation TEXT NOT NULL,    -- English name (e.g., 'Prologue')
      transliteration TEXT NOT NULL,
      FOREIGN KEY (paal_id) REFERENCES paals (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS adhikarams (
      id INTEGER PRIMARY KEY,       -- Global absolute chapter number (1 to 133)
      iyal_id INTEGER NOT NULL,     -- FK mapping back to parent sub-section
      name TEXT NOT NULL,           -- Chapter name (e.g., 'கடவுள் வாழ்த்து')
      translation TEXT NOT NULL,    -- English name (e.g., 'The Praise of God')
      transliteration TEXT NOT NULL,
      start INTEGER NOT NULL,       -- First Kural number (e.g., 1)
      end INTEGER NOT NULL,         -- Last Kural number (e.g., 10)
      FOREIGN KEY (iyal_id) REFERENCES iyals (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS kurals (
      id INTEGER PRIMARY KEY,        -- Global Kural number index (1 to 1330)
      adhikaram_id INTEGER NOT NULL, -- FK linking it back to its parent chapter
      text TEXT NOT NULL,            -- Kural text in Tamil script
      translation TEXT NOT NULL,    -- English textual translation
      couplet TEXT,                 -- Poetic translation verse
      explanation TEXT,             -- Full prose meaning
      line1 TEXT NOT NULL,           -- Line 1 in Tamil script
      line2 TEXT NOT NULL,           -- Line 2 in Tamil script
      transliteration1 TEXT,        -- English phonetics line 1
      transliteration2 TEXT,        -- English phonetics line 2
      FOREIGN KEY (adhikaram_id) REFERENCES adhikarams (id) ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS authors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,     -- 'M. Varadarajan', 'Solomon Pappaiah', 'M. Karunanidhi'
      short_code TEXT NOT NULL UNIQUE -- 'mv', 'sp', 'mk'
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kural_id INTEGER NOT NULL,
      author_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (kural_id) REFERENCES kurals (id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
    );
  `;

const AUTHOR_PRESETS = [
  { code: 'mv', name: 'M. Varadarajan' },
  { code: 'sp', name: 'Solomon Pappaiah' },
  { code: 'mk', name: 'M. Karunanidhi' },
];

// Define custom signature types for our runner hooks
type ExecRunner = (sql: string, params?: any[]) => number | Promise<number>;
type FetchRunner = (sql: string) => any[] | Promise<any[]>;
type SingleFetchRunner = (sql: string) => any | Promise<any>;

// Define the signature type for our new status callback logger
type LogCallback = (message: string) => void;

/**
 * Shared validator method. Checks if data records exist
 * without caring if the target database engine is sync or async.
 */
async function isDatabaseAlreadySeeded(fetchFirst: SingleFetchRunner): Promise<boolean> {
  const res = await fetchFirst('SELECT COUNT(*) as count FROM paals;');
  return !!(res && res.count > 0);
}

/**
 * This function handles pure data parsing. It doesn't know about Sync vs Async.
 * It simply executes commands through the runner hooks provided to it.
 */
async function parseAndSeedDataset(execute: ExecRunner, fetchAll: FetchRunner, onLog: LogCallback) {
  const authorMap = new Map<string, number>();

  // A. Seed Authors
  onLog('📝 Registering commentary authors...');
  for (const author of AUTHOR_PRESETS) {
    const rowId = await execute(`INSERT INTO authors (name, short_code) VALUES (?, ?);`, [
      author.name,
      author.code,
    ]);
    authorMap.set(author.code, rowId);
  }

  // B. Seed Structural Subsections from detail.json
  onLog('🗂️ Generating structural sections (Paals, Iyals, Adhikarams)...');
  for (const part of detailData.parts) {
    await execute(
      `INSERT INTO paals (id, name, translation, transliteration) VALUES (?, ?, ?, ?);`,
      [part.number, part.name, part.translation, part.transliteration],
    );

    const iyalList = part.chapterGroup?.detail || [];
    for (const iyal of iyalList) {
      const iyalRowId = await execute(
        `INSERT INTO iyals (paal_id, name, translation, transliteration) VALUES (?, ?, ?, ?);`,
        [part.number, iyal.name, iyal.translation, iyal.transliteration],
      );

      const chapterList = iyal.chapters?.detail || [];
      for (const chap of chapterList) {
        await execute(
          `INSERT INTO adhikarams (id, iyal_id, name, translation, transliteration, start, end) VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            chap.number,
            iyalRowId,
            chap.name,
            chap.translation,
            chap.transliteration,
            chap.start,
            chap.end,
          ],
        );
      }
    }
  }

  // C. Seed Coupled Verses & Authors Notes from thirukkural.json
  onLog('🚀 Synchronizing 1,330 Thirukkurals and commentaries...');
  const localAdhikarams = await fetchAll('SELECT id, start, end FROM adhikarams');

  let count = 0;
  for (const item of thirukkuralData) {
    try {
      onLog(`🖋️ Seeding verses: parsing ${count} / 1330 couplets...`);
      const match = localAdhikarams.find((a) => item.id >= a.start && item.id <= a.end);
      if (!match) continue;

      // 1. Safe extraction of lines
      const line1Safe = item.line1 || '';
      const line2Safe = item.line2 || '';
      const combinedText = [line1Safe, line2Safe].join(' ').trim();

      await execute(
        `INSERT INTO kurals (id, adhikaram_id, text, translation, couplet, explanation, line1, line2, transliteration1, transliteration2) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          item.id,
          match.id,
          combinedText.trim(),
          item.translation || '',
          item.couplet || '',
          item.explanation || '',
          item.line1,
          item.line2,
          item.transliteration1 || '',
          item.transliteration2 || '',
        ],
      );

      const noteSQL = `INSERT INTO notes (kural_id, author_id, text) VALUES (?, ?, ?);`;
      if (item.mv) await execute(noteSQL, [item.id, authorMap.get('mv')!, item.mv]);
      if (item.sp) await execute(noteSQL, [item.id, authorMap.get('sp')!, item.sp]);
      if (item.mk) await execute(noteSQL, [item.id, authorMap.get('mk')!, item.mk]);

      count++;
      // Update loading text every 100 entries so we don't slow down the thread with too many UI renders
      if (count % 100 === 0 || count === 1330) {
        onLog(`🖋️ Seeding verses: parsed ${count} / 1330 couplets...`);
      }
    } catch (kuralError: any) {
      // Intercept the loop error context and pass an explicit telemetry printout down to your terminal logger
      const failingId = item?.id ?? 'UNKNOWN_ID';
      const failingL1 = item?.line1 ?? 'UNDEFINED_L1';
      const failingL2 = item?.line2 ?? 'UNDEFINED_L2';

      onLog(
        `🚨 CRASH AT KURAL ID [${failingId}]! L1: "${failingL1}", L2: "${failingL2}". Reason: ${kuralError.message}`,
      );

      // Rethrow to stop execution block or use 'continue' if you'd prefer to skip bad entries and keep seeding
      throw kuralError;
    }
  }
}

export const setupDatabase = async (onLog: LogCallback) => {
  try {
    if (Platform.OS === 'web') {
      const targetDb = await db;

      console.log('databasePath:', targetDb.databasePath);
      console.log('default dir:', SQLite.defaultDatabaseDirectory);

      // Initialize core tables
      await targetDb.execAsync(DATABASE_SCHEMA_SQL);

      // Utilize shared helper with async context wrapper
      const isSeeded = await isDatabaseAlreadySeeded(
        async (sql) => await targetDb.getFirstAsync<any>(sql),
      );
      if (isSeeded) {
        onLog('✨ Database fully synchronized.');
        return;
      }

      onLog('🌐 Web sandbox environment verified. Opening transaction channels...');
      await targetDb.withTransactionAsync(async () => {
        await parseAndSeedDataset(
          async (sql, params) => (await targetDb.runAsync(sql, params || [])).lastInsertRowId,
          async (sql) => await targetDb.getAllAsync<any>(sql),
          onLog,
        );
      });
      if (__DEV__) await exportDatabaseToFile(targetDb);
    } else {
      const targetDb = db as SQLite.SQLiteDatabase;

      // Initialize core tables
      targetDb.execSync(DATABASE_SCHEMA_SQL);

      // Utilize shared helper with sync context wrapper
      const isSeeded = await isDatabaseAlreadySeeded((sql) => targetDb.getFirstSync<any>(sql));
      if (isSeeded) {
        onLog('✨ Database fully synchronized.');
        return;
      }

      onLog('🚀 Mobile storage verified. Locking write threads...');
      targetDb.withTransactionSync(() => {
        parseAndSeedDataset(
          (sql, params) => targetDb.runSync(sql, params || []).lastInsertRowId,
          (sql) => targetDb.getAllSync<any>(sql),
          onLog,
        );
      });
    }

    console.log('✅ Kuralneri database initialized successfully on target platform.');
  } catch (error) {
    console.error('❌ Universal Database Bootstrapping Failed:', error);
  }
};

export async function exportDatabaseToFile(
  database: SQLite.SQLiteDatabase,
  filename = DB_NAME,
): Promise<void> {
  if (Platform.OS !== 'web') return;
  const bytes = await database.serializeAsync();
  const blob = new Blob([bytes as BlobPart], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
