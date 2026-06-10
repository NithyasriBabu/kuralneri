/**
 * 🏛️ DATABASE QUERY MANIFEST
 * Centralized repository for all raw SQL statements across the application.
 */

/**
 * Universal parameterized data fetcher across relational tiers
 */
export const PAGINATED_KURALS = (whereClause: string) => `
    SELECT 
      k.*, 
      a.id AS adhikaram_id,
      i.id AS iyal_id,
      p.id AS paal_id,
      a.name AS adhikaram_name,
      i.name AS iyal_name,
      p.name AS paal_name,
      a.translation AS adhikaram_english_name,
      i.translation AS iyal_english_name,
      p.translation AS paal_english_name
    FROM kurals k
    JOIN adhikarams a ON k.adhikaram_id = a.id
    JOIN iyals i ON a.iyal_id = i.id
    JOIN paals p ON i.paal_id = p.id
    ${whereClause}
    ORDER BY k.id ASC
    LIMIT ? OFFSET ?;
  `;

/**
 * Get Kural by kural_id (one row per author note when notes exist)
 */
export const KURAL_BY_ID = `
  SELECT 
    k.*,
    a.id AS adhikaram_id,
    i.id AS iyal_id,
    p.id AS paal_id,
    a.name AS adhikaram_name,
    i.name AS iyal_name,
    p.name AS paal_name,
    a.translation AS adhikaram_english_name,
    i.translation AS iyal_english_name,
    p.translation AS paal_english_name,
    k.is_bookmarked
  FROM kurals k
    JOIN adhikarams a ON k.adhikaram_id = a.id
    JOIN iyals i ON a.iyal_id = i.id
    JOIN paals p ON i.paal_id = p.id
  WHERE k.id = ?;
`;

export const KURAL_NOTES_BY_ID = `
  WITH merged_notes AS (
    SELECT
      n.kural_id,
      n.text AS note_text,
      au.id AS author_id,
      au.name AS author_name,
      au.tamil_name AS author_name_tamil,
      au.short_code AS author_code,
      NULL AS note_date,
      NULL AS created_at,
      NULL AS updated_at,
      'seeded' AS note_source
    FROM notes n
    JOIN authors au ON n.author_id = au.id
    UNION ALL
    SELECT
      un.kural_id,
      un.text AS note_text,
      au.id AS author_id,
      au.name AS author_name,
      au.tamil_name AS author_name_tamil,
      au.short_code AS author_code,
      un.note_date,
      un.created_at,
      un.updated_at,
      'user' AS note_source
    FROM user_notes un
    JOIN authors au ON un.author_id = au.id
  )
  SELECT *
  FROM merged_notes
  WHERE kural_id = ?
  ORDER BY
    CASE note_source WHEN 'user' THEN 0 ELSE 1 END,
    COALESCE(updated_at, created_at, '') DESC,
    author_id ASC;
`;

/**
 * Counts match subsets for total page calculations
 */
export const KURALS_COUNT = (whereClause: string) => `
  SELECT COUNT(*) as count 
  FROM kurals k
  JOIN adhikarams a ON k.adhikaram_id = a.id
  JOIN iyals i ON a.iyal_id = i.id
  JOIN paals p ON i.paal_id = p.id
  ${whereClause};
`;

/**
 * Distinct hierarchy ids for the current active kural scope.
 */
export const DISTINCT_KURAL_FILTER_IDS = (whereClause: string) => `
  SELECT DISTINCT
    p.id AS paal_id,
    i.id AS iyal_id,
    a.id AS adhigaram_id
  FROM kurals k
  JOIN adhikarams a ON k.adhikaram_id = a.id
  JOIN iyals i ON a.iyal_id = i.id
  JOIN paals p ON i.paal_id = p.id
  ${whereClause}
  ORDER BY p.id ASC, i.id ASC, a.id ASC;
`;

/**
 * Primary Tier 1 List
 */
export const PAALS = 'SELECT * FROM paals ORDER BY id ASC;';

/**
 * Primary Tier 2 List
 */
export const IYALS = 'SELECT * FROM iyals ORDER BY paal_id ASC, id ASC;';

/**
 * Primary Tier 3 List
 */
export const ADHIGARAMS = 'SELECT * FROM adhikarams ORDER BY id ASC;';

/**
 * Tier 3 Cascading List
 */
export const ADHIGARAMS_BY_IYAL_BY_PAAL =
  'SELECT * FROM adhikarams WHERE iyal_id = ? ORDER BY id ASC;';
