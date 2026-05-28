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
      p.name AS paal_name
    FROM kurals k
    JOIN adhikarams a ON k.adhikaram_id = a.id
    JOIN iyals i ON a.iyal_id = i.id
    JOIN paals p ON i.paal_id = p.id
    ${whereClause}
    ORDER BY k.id ASC
    LIMIT ? OFFSET ?;
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
