import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { db } from 'src/data/database';
import {
  KuralRecord,
  PaalRecord,
  IyalRecord,
  AdhigaramRecord,
  KuralFilters,
  Taxonomy,
} from 'src/types/types';

// Change your query import to this:
import { PAGINATED_KURALS, KURALS_COUNT, PAALS, IYALS, ADHIGARAMS } from 'src/data/queries';

let taxonomy: Taxonomy | null = null;

/**
 * 🛠️ Abstract cross-platform execution redundancy away completely.
 * Safely routes execution to async engines on web and sync engines on mobile.
 */
async function executeSelect<T>(querySQL: string, args: any[] = []): Promise<T[]> {
  try {
    if (Platform.OS === 'web') {
      const targetDb = await db;
      return await targetDb.getAllAsync<T>(querySQL, args);
    } else {
      const targetDb = db as SQLite.SQLiteDatabase;
      return targetDb.getAllSync<T>(querySQL, args);
    }
  } catch (error) {
    console.error(`❌ DB Execution Failed for Query: "${querySQL.substring(0, 50)}..."`, error);
    return [];
  }
}

function isActiveId(id?: number): boolean {
  return id != null && id > 0;
}

/**
 * Builds the dynamic SQL WHERE clause and arguments array based on active user input filters
 */
function buildFilterClause(filters?: KuralFilters): { whereClause: string; args: any[] } {
  const clauses: string[] = [];
  const args: any[] = [];

  if (!filters) return { whereClause: '', args };

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
