import { Pool, PoolClient } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('FATAL: DATABASE_URL environment variable is not set.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const query = (text: string, params?: unknown[]) => pool.query(text, params);

/**
 * Execute multiple queries inside a single PostgreSQL transaction.
 * All queries succeed together or all roll back on error.
 *
 * Usage:
 *   await withTransaction(async (client) => {
 *     await client.query('INSERT INTO ...', [...]);
 *     await client.query('UPDATE ...', [...]);
 *   });
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default pool;
