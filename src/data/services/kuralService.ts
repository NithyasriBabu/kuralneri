import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { db } from 'src/data/database';
import { runWebDbTask } from 'src/data/webDbQueue';
import {
  KuralRecord,
  PaalRecord,
  IyalRecord,
  AdhigaramRecord,
  KuralFilters,
  Taxonomy,
  AuthorNote,
} from 'src/types/types';

import {
  KURAL_BY_ID,
  KURAL_NOTES_BY_ID,
  DISTINCT_KURAL_FILTER_IDS,
  PAGINATED_KURALS,
  KURALS_COUNT,
  PAALS,
  IYALS,
  ADHIGARAMS,
} from 'src/data/queries';

let taxonomy: Taxonomy | null = null;

type KuralByIdRow = {
  id: number;
  text: string;
  line1: string;
  line2: string;
  translation: string;
  couplet: string;
  explanation: string;
  transliteration1: string;
  transliteration2: string;
  adhikaram_name: string;
  adhikaram_english_name: string;
  iyal_name: string;
  iyal_english_name: string;
  paal_name: string;
  paal_english_name: string;
  adhikaram_id: number;
  iyal_id: number;
  paal_id: number;
  is_bookmarked: number | null;
};

type UserNoteRow = {
  id: number;
  kural_id: number;
  author_id: number;
  author_name: string;
  author_name_tamil: string;
  author_code: string;
  note_text: string;
  note_date: string;
  created_at: string;
  updated_at: string;
};

type RunResult = {
  lastInsertRowId?: number;
  changes?: number;
};

function assembleKuralFromRow(row: KuralByIdRow | undefined): KuralRecord | null {
  if (!row) return null;

  return {
    id: row.id,
    text: row.text,
    translation: row.translation,
    couplet: row.couplet,
    explanation: row.explanation,
    line1: row.line1,
    line2: row.line2,
    transliteration1: row.transliteration1,
    transliteration2: row.transliteration2,
    adhikaram_name: row.adhikaram_name,
    adhikaram_english_name: row.adhikaram_english_name,
    iyal_name: row.iyal_name,
    iyal_english_name: row.iyal_english_name,
    paal_name: row.paal_name,
    paal_english_name: row.paal_english_name,
    adhikaram_id: row.adhikaram_id,
    iyal_id: row.iyal_id,
    paal_id: row.paal_id,
    is_bookmarked: Boolean(row.is_bookmarked),
  };
}

/**
 * 🛠️ Abstract cross-platform execution redundancy away completely.
 * Safely routes execution to async engines on web and sync engines on mobile.
 * Web OPFS access is serialized via runWebDbTask to avoid concurrent handle errors.
 */
async function executeSelect<T>(
  querySQL: string,
  args: SQLite.SQLiteBindParams = [],
): Promise<T[]> {
  return runWebDbTask(async () => {
    try {
      if (Platform.OS === 'web') {
        const targetDb = await db;
        return await targetDb.getAllAsync<T>(querySQL, args);
      }
      const targetDb = db as SQLite.SQLiteDatabase;
      return targetDb.getAllSync<T>(querySQL, args);
    } catch (error) {
      console.error(`❌ DB Execution Failed for Query: "${querySQL.substring(0, 50)}..."`, error);
      return [];
    }
  });
}

async function executeRun(querySQL: string, args: SQLite.SQLiteBindParams = []): Promise<void> {
  await runWebDbTask(async () => {
    try {
      if (Platform.OS === 'web') {
        const targetDb = await db;
        await targetDb.runAsync(querySQL, args);
        return;
      }
      const targetDb = db as SQLite.SQLiteDatabase;
      targetDb.runSync(querySQL, args);
    } catch (error) {
      console.error(`❌ DB Write Failed for Query: "${querySQL.substring(0, 50)}..."`, error);
    }
  });
}

async function executeRunReturningResult(
  querySQL: string,
  args: SQLite.SQLiteBindParams = [],
): Promise<RunResult> {
  return runWebDbTask(async () => {
    if (Platform.OS === 'web') {
      const targetDb = await db;
      return (await targetDb.runAsync(querySQL, args)) as RunResult;
    }
    const targetDb = db as SQLite.SQLiteDatabase;
    return targetDb.runSync(querySQL, args) as RunResult;
  });
}

function isActiveId(id?: number): id is number {
  return id != null && id > 0;
}

/**
 * Builds the dynamic SQL WHERE clause and arguments array based on active user input filters
 */
function buildFilterClause(filters?: KuralFilters & { isBookmarked?: boolean }): {
  whereClause: string;
  args: SQLite.SQLiteBindValue[];
} {
  const clauses: string[] = [];
  const args: SQLite.SQLiteBindValue[] = [];

  if (!filters) return { whereClause: '', args };

  // Dynamic filter check for our updated column pattern
  if (filters.isBookmarked) {
    clauses.push(`k.is_bookmarked = 1`);
  }

  const paalId = filters.paalId;
  if (isActiveId(paalId)) {
    clauses.push(`i.paal_id = ?`);
    args.push(paalId);
  }
  const iyalId = filters.iyalId;
  if (isActiveId(iyalId)) {
    clauses.push(`a.iyal_id = ?`);
    args.push(iyalId);
  }
  const adhigaramId = filters.adhigaramId;
  if (isActiveId(adhigaramId)) {
    clauses.push(`k.adhikaram_id = ?`);
    args.push(adhigaramId);
  }

  const search = filters.search?.trim();
  if (search) {
    if (!Number.isNaN(Number(search))) {
      clauses.push('k.id = ?');
      args.push(Number(search));
    } else {
      clauses.push(
        `(
          k.line1 LIKE ? OR
          k.line2 LIKE ? OR
          k.translation LIKE ? OR
          k.explanation LIKE ? OR
          EXISTS (
            SELECT 1 FROM notes n
            WHERE n.kural_id = k.id AND n.text LIKE ?
          ) OR
          EXISTS (
            SELECT 1 FROM user_notes un
            WHERE un.kural_id = k.id AND un.text LIKE ?
          )
        )`,
      );
      const pattern = `%${search}%`;
      args.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereClause, args };
}

export const getKuralById = async (id: number): Promise<KuralRecord | null> => {
  const rows = await executeSelect<KuralByIdRow>(KURAL_BY_ID, [id]);
  return assembleKuralFromRow(rows[0]);
};

export async function isKuralBookmarked(id: number): Promise<boolean> {
  const rows = await executeSelect<{ is_bookmarked: number }>(
    'SELECT is_bookmarked FROM kurals WHERE id = ? LIMIT 1;',
    [id],
  );
  return rows[0]?.is_bookmarked === 1;
}

export async function setKuralBookmarkStatus(id: number, bookmarked: boolean): Promise<boolean> {
  const statusValue = bookmarked ? 1 : 0;
  await executeRun('UPDATE kurals SET is_bookmarked = ? WHERE id = ?;', [statusValue, id]);
  return bookmarked;
}

export async function toggleKuralBookmark(id: number): Promise<boolean> {
  const nextStatus = !(await isKuralBookmarked(id));
  return setKuralBookmarkStatus(id, nextStatus);
}

async function getSelfAuthorId(): Promise<number> {
  const rows = await executeSelect<{ id: number }>(
    'SELECT id FROM authors WHERE short_code = ? LIMIT 1;',
    ['self'],
  );
  return rows[0]?.id ?? 1;
}

function getLocalDateString(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTimestampString(date = new Date()): string {
  return date.toISOString();
}

export async function getUserNotesForKural(kuralId: number): Promise<AuthorNote[]> {
  const rows = await executeSelect<UserNoteRow>(
    `
      SELECT
        un.id,
        un.kural_id,
        un.author_id,
        au.name AS author_name,
        au.tamil_name AS author_name_tamil,
        au.short_code AS author_code,
        un.text AS note_text,
        un.note_date,
        un.created_at,
        un.updated_at
      FROM user_notes un
      JOIN authors au ON un.author_id = au.id
      WHERE un.kural_id = ?
      ORDER BY un.note_date DESC, un.updated_at DESC, un.id DESC;
    `,
    [kuralId],
  );

  return rows.map((row) => ({
    author_id: row.author_id,
    author_name: row.author_name,
    author_name_tamil: row.author_name_tamil,
    author_code: row.author_code,
    note_text: row.note_text,
    note_source: 'user',
    note_date: row.note_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function getKuralNotesById(kuralId: number): Promise<AuthorNote[]> {
  const rows = await executeSelect<UserNoteRow & { note_source: 'seeded' | 'user' }>(
    KURAL_NOTES_BY_ID,
    [kuralId],
  );

  return rows.map((row) => ({
    author_id: row.author_id,
    author_name: row.author_name,
    author_name_tamil: row.author_name_tamil,
    author_code: row.author_code,
    note_text: row.note_text,
    note_source: row.note_source,
    note_date: row.note_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export async function listUserNotesForKural(kuralId: number): Promise<AuthorNote[]> {
  return getUserNotesForKural(kuralId);
}

export async function saveUserNote(kuralId: number, text: string): Promise<AuthorNote | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const authorId = await getSelfAuthorId();
  const now = new Date();
  const noteDate = getLocalDateString(now);
  const timestamp = getTimestampString(now);

  const existing = await executeSelect<UserNoteRow>(
    `
      SELECT
        un.id,
        un.kural_id,
        un.author_id,
        au.name AS author_name,
        au.tamil_name AS author_name_tamil,
        au.short_code AS author_code,
        un.text AS note_text,
        un.note_date,
        un.created_at,
        un.updated_at
      FROM user_notes un
      JOIN authors au ON un.author_id = au.id
      WHERE un.kural_id = ? AND un.note_date = ? AND un.author_id = ?
      LIMIT 1;
    `,
    [kuralId, noteDate, authorId],
  );

  if (existing[0]) {
    await executeRun(
      `
        UPDATE user_notes
        SET text = ?, updated_at = ?, note_date = ?
        WHERE id = ?;
      `,
      [trimmed, timestamp, noteDate, existing[0].id],
    );
    return {
      author_id: existing[0].author_id,
      author_name: existing[0].author_name,
      author_name_tamil: existing[0].author_name_tamil,
      author_code: existing[0].author_code,
      note_text: trimmed,
      note_source: 'user',
      note_date: noteDate,
      created_at: existing[0].created_at,
      updated_at: timestamp,
    };
  }

  const result = await executeRunReturningResult(
    `
      INSERT INTO user_notes (kural_id, author_id, note_date, text, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?);
    `,
    [kuralId, authorId, noteDate, trimmed, timestamp, timestamp],
  );

  return {
    author_id: authorId,
    author_name: 'You',
    author_name_tamil: 'நீங்கள்',
    author_code: 'self',
    note_text: trimmed,
    note_source: 'user',
    note_date: noteDate,
    created_at: timestamp,
    updated_at: timestamp,
  };
}

export async function deleteUserNote(kuralId: number): Promise<void> {
  const authorId = await getSelfAuthorId();
  const noteDate = getLocalDateString();
  await executeRun(
    'DELETE FROM user_notes WHERE kural_id = ? AND author_id = ? AND note_date = ?;',
    [kuralId, authorId, noteDate],
  );
}

/**
 * Universal Data Fetcher: Retrieves a chunk of Kurals
 * filtered by search queries and active hierarchical category selections.
 */
export async function getPaginatedKurals(
  limit: number = 10,
  offset: number = 0,
  filters?: KuralFilters,
): Promise<KuralRecord[]> {
  const { whereClause, args } = buildFilterClause(filters);
  return executeSelect<KuralRecord>(PAGINATED_KURALS(whereClause), [...args, limit, offset]);
}

/**
 * Dynamically counts total rows matching current structural search conditions
 */
export async function getKuralsCount(filters?: KuralFilters): Promise<number> {
  const { whereClause, args } = buildFilterClause(filters);
  const results = await executeSelect<{ count: number }>(KURALS_COUNT(whereClause), args);
  return results[0]?.count ?? 0;
}

type DistinctKuralFilterRow = {
  paal_id: number;
  iyal_id: number;
  adhigaram_id: number;
};

export async function getDistinctKuralFilterIds(
  filters?: KuralFilters,
): Promise<DistinctKuralFilterRow[]> {
  const { whereClause, args } = buildFilterClause(filters);
  return executeSelect<DistinctKuralFilterRow>(DISTINCT_KURAL_FILTER_IDS(whereClause), args);
}

export async function loadTaxonomy(): Promise<Taxonomy> {
  if (taxonomy) return taxonomy;
  const [paals, iyals, adhigarams] = await Promise.all([
    executeSelect<PaalRecord>(PAALS),
    executeSelect<IyalRecord>(IYALS),
    executeSelect<AdhigaramRecord>(ADHIGARAMS),
  ]);
  taxonomy = { paals, iyals, adhigarams };
  return taxonomy;
}

export function getTaxonomy(): Taxonomy | null {
  return taxonomy;
}

export function getIyalOptions(paalId = 0): IyalRecord[] {
  if (!taxonomy) return [];
  return paalId > 0 ? taxonomy.iyals.filter((i) => i.paal_id === paalId) : taxonomy.iyals;
}
export function getAdhigaramOptions(paalId = 0, iyalId = 0): AdhigaramRecord[] {
  if (!taxonomy) return [];
  if (iyalId > 0) {
    return taxonomy.adhigarams.filter((a) => a.iyal_id === iyalId);
  }
  if (paalId > 0) {
    const iyalIds = new Set(taxonomy.iyals.filter((i) => i.paal_id === paalId).map((i) => i.id));
    return taxonomy.adhigarams.filter((a) => iyalIds.has(a.iyal_id));
  }
  return taxonomy.adhigarams;
}

export function getPaalIdForIyal(iyalId: number): number | undefined {
  return taxonomy?.iyals.find((i) => i.id === iyalId)?.paal_id;
}
export function getParentsForAdhigaram(
  adhigaramId: number,
): { paalId: number; iyalId: number } | null {
  const chapter = taxonomy?.adhigarams.find((a) => a.id === adhigaramId);
  if (!chapter) return null;
  const paalId = getPaalIdForIyal(chapter.iyal_id);
  if (!paalId) return null;
  return { paalId, iyalId: chapter.iyal_id };
}
