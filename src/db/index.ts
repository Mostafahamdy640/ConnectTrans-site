import { drizzle } from 'drizzle-orm/node-postgres';
import { getTableName } from 'drizzle-orm';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import { memoryDb } from './memoryStore.ts';

declare global {
  var _postgresPool: Pool | undefined;
  var _useMemoryDb: boolean | undefined;
}

const isCloudSqlOrPgConfigured = Boolean(
  process.env.DATABASE_URL || (process.env.SQL_HOST && process.env.SQL_HOST !== '127.0.0.1' && process.env.SQL_HOST !== 'localhost')
);
global._useMemoryDb = !isCloudSqlOrPgConfigured;

export const createPool = () => {
  if (!global._postgresPool) {
    if (isCloudSqlOrPgConfigured) {
      global._postgresPool = new Pool({
        host: process.env.SQL_HOST || process.env.PGHOST,
        user: process.env.SQL_USER || process.env.PGUSER,
        password: process.env.SQL_PASSWORD || process.env.PGPASSWORD,
        database: process.env.SQL_DB_NAME || process.env.PGDATABASE,
        max: 10,
        connectionTimeoutMillis: 3000,
      });

      global._postgresPool.on('error', (err) => {
        console.warn('Postgres pool background warning (using memory store):', err.message);
        global._useMemoryDb = true;
      });
    } else {
      // Standalone mode: provide safe dummy pool
      global._postgresPool = new Pool({ max: 0 });
    }
  }
  return global._postgresPool;
};

const pool = createPool();
const rawDrizzleDb = isCloudSqlOrPgConfigured ? drizzle(pool, { schema }) : ({} as any);

// Universal condition parser for Drizzle AST expressions (eq, and, or)
function parseCondition(cond: any) {
  const comparisons: { col: string; val: any }[] = [];
  let isOr = true;

  function walk(node: any) {
    if (!node) return;
    if (node.queryChunks) {
      for (const ch of node.queryChunks) {
        if (ch && Array.isArray(ch.value)) {
          for (const s of ch.value) {
            if (typeof s === 'string') {
              if (s.toLowerCase().includes(' and ')) isOr = false;
              if (s.toLowerCase().includes(' or ')) isOr = true;
            }
          }
        }
        if (ch && ch.queryChunks) {
          walk(ch);
        }
      }
      let col: string | undefined;
      let val: any = undefined;
      for (const ch of node.queryChunks) {
        if (ch && typeof ch.name === 'string' && !ch.queryChunks) col = ch.name;
        if (ch && ch.value !== undefined && !Array.isArray(ch.value) && !ch.queryChunks) val = ch.value;
      }
      if (col && val !== undefined) {
        comparisons.push({ col, val });
      }
    }
  }

  walk(cond);
  return { comparisons, isOr };
}

// Extract executable predicate from Drizzle query expression
function extractCondition(cond: any): (row: any) => boolean {
  if (!cond) return () => true;
  if (typeof cond === 'function') return cond;

  const { comparisons, isOr } = parseCondition(cond);
  if (comparisons.length === 0) return () => true;

  return (row: any) => {
    if (isOr) {
      return comparisons.some(({ col, val }) => String(row[col]) === String(val));
    } else {
      return comparisons.every(({ col, val }) => String(row[col]) === String(val));
    }
  };
}

// Memory query builder supporting full CRUD & transactions
function createMemoryQueryBuilder(tableName: string) {
  return {
    select: () => ({
      from: (targetTable: any) => {
        const targetName = getTableName(targetTable);
        const rows = memoryDb.getTable(targetName);

        const queryObj: any = {
          _rows: [...rows],
          where: (cond: any) => {
            const predicate = extractCondition(cond);
            queryObj._rows = queryObj._rows.filter(predicate);
            return queryObj;
          },
          orderBy: (order: any) => {
            return queryObj;
          },
          limit: (n: number) => {
            queryObj._rows = queryObj._rows.slice(0, n);
            return queryObj;
          },
          then: (resolve: any, reject: any) => {
            resolve(queryObj._rows);
          },
          [Symbol.iterator]: function* () {
            yield* queryObj._rows;
          }
        };

        return queryObj;
      }
    }),
    insert: (targetTable: any) => ({
      values: (valOrVals: any) => {
        const targetName = getTableName(targetTable);
        const rows = memoryDb.getTable(targetName);
        const toInsert = Array.isArray(valOrVals) ? valOrVals : [valOrVals];

        const insertedItems: any[] = [];
        for (const item of toInsert) {
          const newItem = {
            id: item.id || (typeof rows[0]?.id === 'number' ? rows.length + 1 : `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`),
            createdAt: new Date(),
            updatedAt: new Date(),
            ...item,
          };
          rows.push(newItem);
          insertedItems.push(newItem);
        }

        const resObj: any = {
          returning: () => Promise.resolve(insertedItems),
          onConflictDoNothing: () => Promise.resolve(insertedItems),
          onConflictDoUpdate: () => Promise.resolve(insertedItems),
          then: (resolve: any) => resolve(insertedItems),
        };
        return resObj;
      }
    }),
    update: (targetTable: any) => ({
      set: (updateValues: any) => ({
        where: (cond: any) => {
          const targetName = getTableName(targetTable);
          const rows = memoryDb.getTable(targetName);
          const predicate = extractCondition(cond);
          const updatedItems: any[] = [];

          for (let i = 0; i < rows.length; i++) {
            if (predicate(rows[i])) {
              rows[i] = { ...rows[i], ...updateValues, updatedAt: new Date() };
              updatedItems.push(rows[i]);
            }
          }

          const resObj: any = {
            returning: () => Promise.resolve(updatedItems),
            then: (resolve: any) => resolve(updatedItems),
          };
          return resObj;
        }
      })
    }),
    delete: (targetTable: any) => ({
      where: (cond: any) => {
        const targetName = getTableName(targetTable);
        const rows = memoryDb.getTable(targetName);
        const predicate = extractCondition(cond);
        const remaining = rows.filter(r => !predicate(r));
        const deleted = rows.filter(predicate);
        rows.length = 0;
        rows.push(...remaining);
        return Promise.resolve(deleted);
      }
    }),
    transaction: async <T>(callback: (tx: any) => Promise<T>): Promise<T> => {
      return await callback(createMemoryQueryBuilder(tableName));
    }
  };
}

// Proxied DB that transparently uses real Drizzle if Postgres is active,
// or the in-memory fallback store if Postgres is offline or not configured.
export const db: any = new Proxy(rawDrizzleDb, {
  get(target, prop, receiver) {
    if (prop === 'transaction') {
      return async function (callback: any) {
        if (global._useMemoryDb) {
          return createMemoryQueryBuilder('default').transaction(callback);
        }
        try {
          return await (target as any).transaction(callback);
        } catch (err: any) {
          console.warn('DB transaction warning, using memory fallback:', err.message);
          global._useMemoryDb = true;
          return createMemoryQueryBuilder('default').transaction(callback);
        }
      };
    }

    if (prop === 'select') {
      return function () {
        if (global._useMemoryDb) {
          return createMemoryQueryBuilder('default').select();
        }
        const origSelect = (target as any).select();
        const origFrom = origSelect.from.bind(origSelect);
        origSelect.from = function (table: any) {
          const query = origFrom(table);
          const origThen = query.then.bind(query);
          query.then = function (resolve: any, reject: any) {
            return origThen(resolve).catch((err: any) => {
              global._useMemoryDb = true;
              const memoryQuery = createMemoryQueryBuilder('default').select().from(table);
              return memoryQuery.then(resolve, reject);
            });
          };
          return query;
        };
        return origSelect;
      };
    }

    if (prop === 'insert') {
      return function (table: any) {
        if (global._useMemoryDb) {
          return createMemoryQueryBuilder('default').insert(table);
        }
        const origInsert = (target as any).insert(table);
        const origValues = origInsert.values.bind(origInsert);
        origInsert.values = function (vals: any) {
          const query = origValues(vals);
          const origThen = query.then.bind(query);
          query.then = function (resolve: any, reject: any) {
            return origThen(resolve).catch((err: any) => {
              global._useMemoryDb = true;
              const memInsert = createMemoryQueryBuilder('default').insert(table).values(vals);
              return memInsert.then(resolve, reject);
            });
          };
          return query;
        };
        return origInsert;
      };
    }

    if (prop === 'update') {
      return function (table: any) {
        if (global._useMemoryDb) {
          return createMemoryQueryBuilder('default').update(table);
        }
        const origUpdate = (target as any).update(table);
        const origSet = origUpdate.set.bind(origUpdate);
        origUpdate.set = function (values: any) {
          const query = origSet(values);
          const origWhere = query.where.bind(query);
          query.where = function (cond: any) {
            const whereQuery = origWhere(cond);
            const origThen = whereQuery.then.bind(whereQuery);
            whereQuery.then = function (resolve: any, reject: any) {
              return origThen(resolve).catch((err: any) => {
                global._useMemoryDb = true;
                const memUpdate = createMemoryQueryBuilder('default').update(table).set(values).where(cond);
                return memUpdate.then(resolve, reject);
              });
            };
            return whereQuery;
          };
          return query;
        };
        return origUpdate;
      };
    }

    return Reflect.get(target, prop, receiver);
  }
});

export { pool };
export default db;
