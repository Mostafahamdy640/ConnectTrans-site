import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import type { Pool as PgPool, PoolConfig } from 'pg';
const { Pool } = pg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: PgPool | undefined;
}

const poolConfig: PoolConfig = {
  host: process.env.SQL_HOST || '127.0.0.1',
  user: process.env.SQL_USER || 'postgres',
  password: process.env.SQL_PASSWORD || '',
  database: process.env.SQL_DB_NAME || 'postgres',
  max: 10,
  connectionTimeoutMillis: 15000,
};

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool(poolConfig);
    global._postgresPool.on('error', (err) => {
      console.error('[PostgreSQL Error]: Database pool encountered an error:', err.message);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

// Primary PostgreSQL source of truth using Drizzle ORM
export const db = drizzle(pool, { schema });
export { pool };
export default db;
