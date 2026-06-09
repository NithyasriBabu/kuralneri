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
  note_text: string | null;
  author_id: number | null;
  author_name: string | null;
  author_code: string | null;
  is_bookmarked: number | null;
};

function assembleKuralFromRows(rows: KuralByIdRow[]): KuralRecord | null {
  if (!rows.length) return null;

  const head = rows[0];
  const notes: AuthorNote[] = [];
  const seenAuthorIds = new Set<number>();

  for (const row of rows) {
    if (row.author_id == null || !row.note_text || seenAuthorIds.has(row.author_id)) {
      continue;
    }
    seenAuthorIds.add(row.author_id);
    notes.push({
      author_id: row.author_id,
      author_name: row.author_name ?? '',
      author_code: row.author_code ?? '',
      note_text: row.note_text,
    });
  }

  return {
    id: head.id,
    text: head.text,
    translation: head.translation,
    couplet: head.couplet,
    explanation: head.explanation,
    line1: head.line1,
    line2: head.line2,
    transliteration1: head.transliteration1,
    transliteration2: head.transliteration2,
    adhikaram_name: head.adhikaram_name,
    adhikaram_english_name: head.adhikaram_english_name,
    iyal_name: head.iyal_name,
    iyal_english_name: head.iyal_english_name,
    paal_name: head.paal_name,
    paal_english_name: head.paal_english_name,
    adhikaram_id: head.adhikaram_id,
    iyal_id: head.iyal_id,
    paal_id: head.paal_id,
    is_bookmarked: Boolean(head.is_bookmarked),
    notes: notes.length > 0 ? notes : undefined,
  };
}

/**
 * 🛠️ Abstract cross-platform execution redundancy away completely.
 * Safely routes execution to async engines on web and sync engines on mobile.
 * Web OPFS access is serialized via runWebDbTask to avoid concurrent handle errors.
 */
async function executeSelect<T>(querySQL: string, args: any[] = []): Promise<T[]> {
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

async function executeRun(querySQL: string, args: any[] = []): Promise<void> {
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

function isActiveId(id?: number): boolean {
  return id != null && id > 0;
}

/**
 * Builds the dynamic SQL WHERE clause and arguments array based on active user input filters
 */
function buildFilterClause(filters?: KuralFilters & { isBookmarked?: boolean }): {
  whereClause: string;
  args: any[];
} {
  const clauses: string[] = [];
  const args: any[] = [];

  if (!filters) return { whereClause: '', args };

  // Dynamic filter check for our updated column pattern
  if (filters.isBookmarked) {
    clauses.push(`k.is_bookmarked = 1`);
  }

  if (isActiveId(filters.paalId)) {
    clauses.push(`i.paal_id = ?`);
    args.push(filters.paalId);
  }
  if (isActiveId(filters.iyalId)) {
    clauses.push(`a.iyal_id = ?`);
    args.push(filters.iyalId);
  }
  if (isActiveId(filters.adhigaramId)) {
    clauses.push(`k.adhikaram_id = ?`);
    args.push(filters.adhigaramId);
  }

  const search = filters.search?.trim();
  if (search) {
    if (!Number.isNaN(Number(search))) {
      clauses.push('k.id = ?');
      args.push(Number(search));
    } else {
      clauses.push(
        '(k.line1 LIKE ? OR k.line2 LIKE ? OR k.translation LIKE ? OR k.explanation LIKE ?)',
      );
      const pattern = `%${search}%`;
      args.push(pattern, pattern, pattern, pattern);
    }
  }

  const whereClause = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { whereClause, args };
}

export const getKuralById = async (id: number): Promise<KuralRecord | null> => {
  const rows = await executeSelect<KuralByIdRow>(KURAL_BY_ID, [id]);
  return assembleKuralFromRows(rows);
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
