import { Pool, types } from "pg";

// Parse timestamps as JS Date objects (Postgres returns strings by default)
types.setTypeParser(types.builtins.TIMESTAMP, (val) => new Date(val + "Z"));
types.setTypeParser(types.builtins.TIMESTAMPTZ, (val) => new Date(val));

const globalForDb = globalThis as unknown as { __pool?: Pool };

export function getPool(): Pool {
  if (!globalForDb.__pool) {
    globalForDb.__pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return globalForDb.__pool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const pool = getPool();
  const res = await pool.query(text, params);
  return res.rows as T[];
}

export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// Transaction helper
export async function transaction<T>(
  fn: (query: <R = any>(text: string, params?: any[]) => Promise<R[]>) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const queryFn = async <R = any>(text: string, params: any[] = []): Promise<R[]> => {
      const res = await client.query(text, params);
      return res.rows as R[]; 
    };
    const result = await fn(queryFn);
    await client.query("COMMIT");
    return result;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
