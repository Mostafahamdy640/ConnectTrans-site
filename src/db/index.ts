import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import type { Pool as PgPool, PoolConfig } from 'pg';
const { Pool } = pg;
import * as schema from './schema.ts';

declare global {
  var _postgresPool: PgPool | undefined;
}

const isUrlValid = Boolean(
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith('postgres://') || process.env.DATABASE_URL.startsWith('postgresql://'))
);

const poolConfig: PoolConfig = isUrlValid
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.SQL_HOST || process.env.PGHOST || '127.0.0.1',
      user: process.env.SQL_USER || process.env.PGUSER || 'postgres',
      password: process.env.SQL_PASSWORD || process.env.PGPASSWORD || '',
      database: process.env.SQL_DB_NAME || process.env.PGDATABASE || 'postgres',
      port: Number(process.env.SQL_PORT || process.env.PGPORT || 5432),
      max: 15,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
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
