import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

import { db } from 'src/data/database';
import { KuralRecord } from 'src/types/database.types';

/**
 * Universal Data Fetcher: Retrieves a chunk of Kurals
 * along with their Chapter (Adhikaram) and Section (Paal) headers.
 */
export async function getPaginatedKurals(
  limit: number = 10,
  offset: number = 0,
): Promise<KuralRecord[]> {
  const querySQL = `
    SELECT 
      k.*, 
      a.name AS adhikaram_name, 
      p.name AS paal_name
    FROM kurals k
    JOIN adhikarams a ON k.adhikaram_id = a.id
    JOIN iyals i ON a.iyal_id = i.id
    JOIN paals p ON i.paal_id = p.id
    ORDER BY k.id ASC
    LIMIT ? OFFSET ?;
  `;

  try {
    if (Platform.OS === 'web') {
      const targetDb = await db;
      return await targetDb.getAllAsync<KuralRecord>(querySQL, [limit, offset]);
    } else {
      const targetDb = db as SQLite.SQLiteDatabase;
      return targetDb.getAllSync<KuralRecord>(querySQL, [limit, offset]);
    }
  } catch (error) {
    console.error('❌ Failed to fetch records from database:', error);
    return [];
  }
}

/**
 * Dynamically counts total rows inside the kurals table
 */
export async function getKuralsCount(): Promise<number> {
  const querySQL = `SELECT COUNT(*) as count FROM kurals;`;
  try {
    if (Platform.OS === 'web') {
      const targetDb = await db;
      const res = await targetDb.getFirstAsync<{ count: number }>(querySQL);
      return res?.count ?? 1330;
    } else {
      const targetDb = db as SQLite.SQLiteDatabase;
      const res = targetDb.getFirstSync<{ count: number }>(querySQL);
      return res?.count ?? 1330;
    }
  } catch (error) {
    console.error('❌ Failed to get total row count:', error);
    return 1330; // Safe fallback
  }
}
