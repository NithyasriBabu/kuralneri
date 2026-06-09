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
      a.name AS adhikaram_name, 
      p.name AS paal_name,
      p.id AS paal_id,
      i.id AS iyal_id,
      a.id AS adhikaram_id
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
    n.text AS note_text,
    au.id AS author_id,
    au.name AS author_name,
    au.short_code AS author_code
  FROM kurals k
    JOIN adhikarams a ON k.adhikaram_id = a.id
    JOIN iyals i ON a.iyal_id = i.id
    JOIN paals p ON i.paal_id = p.id
    LEFT JOIN notes n ON k.id = n.kural_id
    LEFT JOIN authors au ON n.author_id = au.id
  WHERE k.id = ?
  ORDER BY au.id ASC;
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
