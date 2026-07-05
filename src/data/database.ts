import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { runWebDbTask } from 'src/data/webDbQueue';
import detailData from 'api/detail.json';
import thirukkuralData from 'api/thirukkural.json';

const DB_NAME = 'kuralneri.db';

export const CURRENT_SCHEMA_VERSION = 2;
export const CURRENT_CONTENT_VERSION = 1;

export type SeedStatus = 'empty' | 'in_progress' | 'ready';

export interface DatabaseInitResult {
  schemaVersion: number;
  contentVersion: number;
  didMigrateSchema: boolean;
  didRefreshContent: boolean;
  didSeedFreshDatabase: boolean;
}

export interface DatabaseMigrationStep {
  toVersion: number;
  run: (database: SQLite.SQLiteDatabase) => Promise<void>;
}

type DbRow = Record<string, unknown>;
type MetaKey = 'schema_version' | 'content_version' | 'seed_status' | 'seed_completed_at';

type AppMetaRow = {
  key: MetaKey;
  value: string;
};

type BundledPaal = {
  number: number;
  name: string;
  translation: string;
  transliteration: string;
  chapterGroup?: {
    detail?: BundledIyal[];
  };
};

type BundledIyal = {
  number: number;
  name: string;
  translation: string;
  transliteration: string;
  chapters?: {
    detail?: BundledAdhikaram[];
  };
};

type BundledAdhikaram = {
  number: number;
  name: string;
  translation: string;
  transliteration: string;
  start: number;
  end: number;
};

type BundledKural = {
  id: number;
  line1?: string;
  line2?: string;
  translation?: string;
  couplet?: string;
  explanation?: string;
  transliteration1?: string;
  transliteration2?: string;
  mv?: string;
  sp?: string;
  mk?: string;
};

type AdhikaramRangeRow = { id: number; start: number; end: number };
type BookmarkRow = { id: number };
type ScalarRow = { count: number };

const bundledParts = detailData as { parts: BundledPaal[] };
const bundledKurals = thirukkuralData as BundledKural[];

// Note: Handled as a Promise implicitly on Web
export const db =
  Platform.OS !== 'web' ? SQLite.openDatabaseSync(DB_NAME) : SQLite.openDatabaseAsync(DB_NAME);

const DATABASE_SCHEMA_SQL = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS paals (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    translation TEXT NOT NULL,
    transliteration TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS iyals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paal_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    translation TEXT NOT NULL,
    transliteration TEXT NOT NULL,
    FOREIGN KEY (paal_id) REFERENCES paals (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS adhikarams (
    id INTEGER PRIMARY KEY,
    iyal_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    translation TEXT NOT NULL,
    transliteration TEXT NOT NULL,
    start INTEGER NOT NULL,
    end INTEGER NOT NULL,
    FOREIGN KEY (iyal_id) REFERENCES iyals (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS kurals (
    id INTEGER PRIMARY KEY,
    adhikaram_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    translation TEXT NOT NULL,
    couplet TEXT,
    explanation TEXT,
    line1 TEXT NOT NULL,
    line2 TEXT NOT NULL,
    transliteration1 TEXT,
    transliteration2 TEXT,
    is_bookmarked INTEGER DEFAULT 0,
    FOREIGN KEY (adhikaram_id) REFERENCES adhikarams (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    tamil_name TEXT NOT NULL DEFAULT '',
    short_code TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kural_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    FOREIGN KEY (kural_id) REFERENCES kurals (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kural_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    note_date TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (kural_id) REFERENCES kurals (id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors (id) ON DELETE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_user_notes_kural_day
    ON user_notes (kural_id, note_date);

  CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_settings_lang_toggles (
    key TEXT PRIMARY KEY,
    tamil INTEGER NOT NULL CHECK (tamil IN (0, 1)),
    english INTEGER NOT NULL CHECK (english IN (0, 1))
  );

  CREATE TABLE IF NOT EXISTS chat_sessions (
    session_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary_text TEXT NOT NULL DEFAULT '',
    summary_updated_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    last_active_at TEXT NOT NULL,
    message_count INTEGER NOT NULL DEFAULT 0,
    context_limit INTEGER NOT NULL DEFAULT 30,
    is_closed INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS chat_message_roles (
    code TEXT PRIMARY KEY
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    intent_label TEXT NOT NULL DEFAULT 'other',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (role) REFERENCES chat_message_roles (code),
    FOREIGN KEY (session_id) REFERENCES chat_sessions (session_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chat_citations (
    message_id INTEGER NOT NULL,
    kural_id INTEGER NOT NULL,
    citation_order INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (message_id, kural_id),
    FOREIGN KEY (message_id) REFERENCES chat_messages (id) ON DELETE CASCADE,
    FOREIGN KEY (kural_id) REFERENCES kurals (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id
    ON chat_messages (session_id, id DESC);

  CREATE INDEX IF NOT EXISTS idx_chat_messages_session_created_at
    ON chat_messages (session_id, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_chat_citations_kural_id
    ON chat_citations (kural_id);
`;

const AUTHOR_PRESETS = [
  { code: 'self', name: 'You', tamilName: 'நீங்கள்' },
  { code: 'mv', name: 'M. Varadarajan', tamilName: 'மு. வரதராசன்' },
  { code: 'sp', name: 'Solomon Pappaiah', tamilName: 'சொ. பாப்பையா' },
  { code: 'mk', name: 'M. Karunanidhi', tamilName: 'மு. கருணாநிதி' },
] as const;

const DEFAULT_META_ROWS: readonly AppMetaRow[] = [
  { key: 'schema_version', value: '0' },
  { key: 'content_version', value: '0' },
  { key: 'seed_status', value: 'empty' },
  { key: 'seed_completed_at', value: '' },
];

const MIGRATIONS: readonly DatabaseMigrationStep[] = [
  {
    toVersion: 1,
    run: async (database) => {
      await ensureAuthorTamilNameColumn(database);
      await ensureChatMessageRoles(database);
      await ensureUserNotesIndexes(database);
    },
  },
  {
    toVersion: 2,
    run: async (database) => {
      await ensureKuralBookmarkColumn(database);
    },
  },
];

function nowIso(): string {
  return new Date().toISOString();
}

function isValidSeedStatus(value: string): value is SeedStatus {
  return value === 'empty' || value === 'in_progress' || value === 'ready';
}

async function executeSql(database: SQLite.SQLiteDatabase, sql: string): Promise<void> {
  if (Platform.OS === 'web') {
    await database.execAsync(sql);
    return;
  }

  database.execSync(sql);
}

async function runSql(
  database: SQLite.SQLiteDatabase,
  sql: string,
  params: SQLite.SQLiteBindParams = [],
): Promise<void> {
  if (Platform.OS === 'web') {
    await database.runAsync(sql, params);
    return;
  }

  database.runSync(sql, params);
}

async function getFirstRow<Row extends DbRow>(
  database: SQLite.SQLiteDatabase,
  sql: string,
  params: SQLite.SQLiteBindParams = [],
): Promise<Row | null> {
  if (Platform.OS === 'web') {
    return (await database.getFirstAsync<Row>(sql, params)) ?? null;
  }

  return database.getFirstSync<Row>(sql, params) ?? null;
}

async function getAllRows<Row extends DbRow>(
  database: SQLite.SQLiteDatabase,
  sql: string,
  params: SQLite.SQLiteBindParams = [],
): Promise<Row[]> {
  if (Platform.OS === 'web') {
    return database.getAllAsync<Row>(sql, params);
  }

  return database.getAllSync<Row>(sql, params);
}

async function ensureDatabaseSchema(database: SQLite.SQLiteDatabase): Promise<void> {
  await executeSql(database, DATABASE_SCHEMA_SQL);
}

async function ensureMetaDefaults(database: SQLite.SQLiteDatabase): Promise<void> {
  for (const row of DEFAULT_META_ROWS) {
    await runSql(
      database,
      `
        INSERT INTO app_meta (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO NOTHING;
      `,
      [row.key, row.value],
    );
  }
}

async function readMeta(database: SQLite.SQLiteDatabase): Promise<Record<MetaKey, string>> {
  const rows = await getAllRows<AppMetaRow>(
    database,
    'SELECT key, value FROM app_meta WHERE key IN (?, ?, ?, ?);',
    ['schema_version', 'content_version', 'seed_status', 'seed_completed_at'],
  );

  const meta: Record<MetaKey, string> = {
    schema_version: '0',
    content_version: '0',
    seed_status: 'empty',
    seed_completed_at: '',
  };

  for (const row of rows) {
    meta[row.key] = row.value;
  }

  return meta;
}

async function writeMeta(
  database: SQLite.SQLiteDatabase,
  patch: Partial<Record<MetaKey, string>>,
): Promise<void> {
  for (const [key, value] of Object.entries(patch) as Array<[MetaKey, string | undefined]>) {
    if (value === undefined) continue;
    await runSql(
      database,
      `
        INSERT INTO app_meta (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `,
      [key, value],
    );
  }
}

async function ensureAuthorTamilNameColumn(database: SQLite.SQLiteDatabase): Promise<void> {
  const rows = await getAllRows<{ name: string }>(database, 'PRAGMA table_info(authors);');
  const hasColumn = rows.some((row) => row.name === 'tamil_name');
  if (hasColumn) return;

  await executeSql(database, 'ALTER TABLE authors ADD COLUMN tamil_name TEXT NOT NULL DEFAULT "";');
}

async function ensureAuthorPresets(database: SQLite.SQLiteDatabase): Promise<void> {
  for (const author of AUTHOR_PRESETS) {
    await runSql(
      database,
      `
        INSERT INTO authors (name, tamil_name, short_code)
        VALUES (?, ?, ?)
        ON CONFLICT(short_code) DO UPDATE SET
          name = excluded.name,
          tamil_name = excluded.tamil_name;
      `,
      [author.name, author.tamilName, author.code],
    );
  }
}

async function ensureUserNotesIndexes(database: SQLite.SQLiteDatabase): Promise<void> {
  await executeSql(
    database,
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_user_notes_kural_day ON user_notes (kural_id, note_date);',
  );
}

async function ensureKuralBookmarkColumn(database: SQLite.SQLiteDatabase): Promise<void> {
  const rows = await getAllRows<{ name: string }>(database, 'PRAGMA table_info(kurals);');
  const hasColumn = rows.some((row) => row.name === 'is_bookmarked');
  if (hasColumn) return;

  await executeSql(database, 'ALTER TABLE kurals ADD COLUMN is_bookmarked INTEGER DEFAULT 0;');
  await executeSql(database, 'UPDATE kurals SET is_bookmarked = 0 WHERE is_bookmarked IS NULL;');
}

async function ensureChatMessageRoles(database: SQLite.SQLiteDatabase): Promise<void> {
  await runSql(
    database,
    `
      INSERT OR IGNORE INTO chat_message_roles (code)
      VALUES (?), (?);
    `,
    ['user', 'guru'],
  );
}

async function readBookmarkIds(database: SQLite.SQLiteDatabase): Promise<number[]> {
  const rows = await getAllRows<BookmarkRow>(
    database,
    'SELECT id FROM kurals WHERE is_bookmarked = 1 ORDER BY id ASC;',
  );
  return rows.map((row) => row.id);
}

async function restoreBookmarkIds(
  database: SQLite.SQLiteDatabase,
  bookmarkIds: number[],
): Promise<void> {
  for (const id of bookmarkIds) {
    await runSql(database, 'UPDATE kurals SET is_bookmarked = 1 WHERE id = ?;', [id]);
  }
}

async function upsertCorpusRows(database: SQLite.SQLiteDatabase): Promise<void> {
  const structuralParts = bundledParts.parts;

  await ensureAuthorPresets(database);

  for (const part of structuralParts) {
    await runSql(
      database,
      `
        INSERT INTO paals (id, name, translation, transliteration)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          translation = excluded.translation,
          transliteration = excluded.transliteration;
      `,
      [part.number, part.name, part.translation, part.transliteration],
    );

    for (const iyal of part.chapterGroup?.detail ?? []) {
      await runSql(
        database,
        `
          INSERT INTO iyals (id, paal_id, name, translation, transliteration)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET
            paal_id = excluded.paal_id,
            name = excluded.name,
            translation = excluded.translation,
            transliteration = excluded.transliteration;
        `,
        [iyal.number, part.number, iyal.name, iyal.translation, iyal.transliteration],
      );

      for (const chapter of iyal.chapters?.detail ?? []) {
        await runSql(
          database,
          `
            INSERT INTO adhikarams (id, iyal_id, name, translation, transliteration, start, end)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              iyal_id = excluded.iyal_id,
              name = excluded.name,
              translation = excluded.translation,
              transliteration = excluded.transliteration,
              start = excluded.start,
              end = excluded.end;
          `,
          [
            chapter.number,
            iyal.number,
            chapter.name,
            chapter.translation,
            chapter.transliteration,
            chapter.start,
            chapter.end,
          ],
        );
      }
    }
  }

  const localAdhikarams = await getAllRows<AdhikaramRangeRow>(
    database,
    'SELECT id, start, end FROM adhikarams ORDER BY id ASC;',
  );
  const bookmarkIds = await readBookmarkIds(database);

  for (const kural of bundledKurals) {
    const adhikaram = localAdhikarams.find((row) => kural.id >= row.start && kural.id <= row.end);
    if (!adhikaram) continue;

    const line1 = kural.line1 || '';
    const line2 = kural.line2 || '';
    const text = [line1, line2].join(' ').trim();

    await runSql(
      database,
      `
        INSERT INTO kurals (
          id,
          adhikaram_id,
          text,
          translation,
          couplet,
          explanation,
          line1,
          line2,
          transliteration1,
          transliteration2
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          adhikaram_id = excluded.adhikaram_id,
          text = excluded.text,
          translation = excluded.translation,
          couplet = excluded.couplet,
          explanation = excluded.explanation,
          line1 = excluded.line1,
          line2 = excluded.line2,
          transliteration1 = excluded.transliteration1,
          transliteration2 = excluded.transliteration2;
      `,
      [
        kural.id,
        adhikaram.id,
        text,
        kural.translation || '',
        kural.couplet || '',
        kural.explanation || '',
        line1,
        line2,
        kural.transliteration1 || '',
        kural.transliteration2 || '',
      ],
    );
  }

  await executeSql(database, 'DELETE FROM notes;');

  for (const kural of bundledKurals) {
    const adhikaram = localAdhikarams.find((row) => kural.id >= row.start && kural.id <= row.end);
    if (!adhikaram) continue;

    if (kural.mv) {
      await runSql(
        database,
        'INSERT INTO notes (kural_id, author_id, text) VALUES (?, (SELECT id FROM authors WHERE short_code = ? LIMIT 1), ?);',
        [kural.id, 'mv', kural.mv],
      );
    }
    if (kural.sp) {
      await runSql(
        database,
        'INSERT INTO notes (kural_id, author_id, text) VALUES (?, (SELECT id FROM authors WHERE short_code = ? LIMIT 1), ?);',
        [kural.id, 'sp', kural.sp],
      );
    }
    if (kural.mk) {
      await runSql(
        database,
        'INSERT INTO notes (kural_id, author_id, text) VALUES (?, (SELECT id FROM authors WHERE short_code = ? LIMIT 1), ?);',
        [kural.id, 'mk', kural.mk],
      );
    }
  }

  await restoreBookmarkIds(database, bookmarkIds);
}

async function runSchemaMigrations(
  database: SQLite.SQLiteDatabase,
  currentVersion: number,
): Promise<{
  nextVersion: number;
  didMigrateSchema: boolean;
}> {
  let schemaVersion = currentVersion;
  let didMigrateSchema = false;

  for (const migration of MIGRATIONS) {
    if (schemaVersion >= migration.toVersion) continue;
    if (Platform.OS === 'web') {
      await database.withTransactionAsync(async () => {
        await migration.run(database);
      });
    } else {
      await migration.run(database);
    }
    schemaVersion = migration.toVersion;
    didMigrateSchema = true;
  }

  return { nextVersion: schemaVersion, didMigrateSchema };
}

async function initializeDatabase(database: SQLite.SQLiteDatabase): Promise<DatabaseInitResult> {
  await ensureDatabaseSchema(database);
  await ensureMetaDefaults(database);
  await ensureAuthorTamilNameColumn(database);
  await ensureKuralBookmarkColumn(database);
  await ensureChatMessageRoles(database);
  await ensureAuthorPresets(database);
  await ensureUserNotesIndexes(database);

  const initialMeta = await readMeta(database);
  const initialSchemaVersion = Number(initialMeta.schema_version) || 0;
  const initialContentVersion = Number(initialMeta.content_version) || 0;
  const initialSeedStatus = isValidSeedStatus(initialMeta.seed_status)
    ? initialMeta.seed_status
    : 'empty';

  const didSeedFreshDatabase =
    (await getFirstRow<ScalarRow>(database, 'SELECT COUNT(*) AS count FROM kurals;'))?.count === 0;

  const needsSchemaMigration = initialSchemaVersion < CURRENT_SCHEMA_VERSION;
  const needsContentRefresh =
    initialContentVersion < CURRENT_CONTENT_VERSION || initialSeedStatus === 'in_progress';
  const needsInitWork =
    needsSchemaMigration || needsContentRefresh || initialSeedStatus !== 'ready';

  if (!needsInitWork) {
    return {
      schemaVersion: initialSchemaVersion,
      contentVersion: initialContentVersion,
      didMigrateSchema: false,
      didRefreshContent: false,
      didSeedFreshDatabase: false,
    };
  }

  await writeMeta(database, { seed_status: 'in_progress' });

  let schemaVersion = initialSchemaVersion;
  let didMigrateSchema = false;

  if (needsSchemaMigration) {
    const migrationResult = await runSchemaMigrations(database, initialSchemaVersion);
    schemaVersion = migrationResult.nextVersion;
    didMigrateSchema = migrationResult.didMigrateSchema;
    await writeMeta(database, { schema_version: String(schemaVersion) });
  }

  const didRefreshContent =
    initialSeedStatus === 'in_progress' ||
    (!didSeedFreshDatabase && initialContentVersion < CURRENT_CONTENT_VERSION);
  if (needsContentRefresh || didSeedFreshDatabase) {
    if (Platform.OS === 'web') {
      await database.withTransactionAsync(async () => {
        await upsertCorpusRows(database);
      });
    } else {
      await upsertCorpusRows(database);
    }
    await writeMeta(database, { content_version: String(CURRENT_CONTENT_VERSION) });
  }

  const completedAt = nowIso();
  await writeMeta(database, {
    schema_version: String(CURRENT_SCHEMA_VERSION),
    content_version: String(CURRENT_CONTENT_VERSION),
    seed_status: 'ready',
    seed_completed_at: completedAt,
  });

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    contentVersion: CURRENT_CONTENT_VERSION,
    didMigrateSchema,
    didRefreshContent,
    didSeedFreshDatabase,
  };
}

export const setupDatabase = async (
  onLog: (message: string) => void,
): Promise<DatabaseInitResult> =>
  runWebDbTask(async () => {
    const targetDb = await db;

    onLog('Opening SQLite database...');

    try {
      const result = await initializeDatabase(targetDb);
      onLog('Database ready.');
      return result;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  });

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
