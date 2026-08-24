// Use globalThis singleton pattern to prevent dev server HMR from spawning multiple connection pools
declare global {
  var __mysqlPool: any | undefined;
}

let pool: any = null;

if (typeof window === 'undefined') {
  if (!globalThis.__mysqlPool) {
    const mysql = await import('mysql2/promise');
    globalThis.__mysqlPool = mysql.default.createPool({
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'db_lms',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Graceful shutdown: close MySQL pool connections on termination signals
    const closePool = async (signal: string) => {
      if (globalThis.__mysqlPool) {
        console.log(`[Graceful Shutdown] Received ${signal}. Closing MySQL connection pool...`);
        try {
          await globalThis.__mysqlPool.end();
          globalThis.__mysqlPool = undefined;
          console.log('[Graceful Shutdown] MySQL connection pool closed cleanly.');
        } catch (err) {
          console.error('[Graceful Shutdown Error]:', err);
        }
      }
    };

    process.once('SIGTERM', () => closePool('SIGTERM'));
    process.once('SIGINT', () => closePool('SIGINT'));
  }

  pool = globalThis.__mysqlPool;
}

export async function query<T = any[]>(sql: string, params?: any[]): Promise<T> {
  if (!pool) return [] as unknown as T;
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (err: any) {
    console.error(`[MySQL Query Error]: ${err?.message || err}`);
    throw err;
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T[]>(sql, params);
  if (Array.isArray(rows) && rows.length > 0) {
    return rows[0] as T;
  }
  return null;
}

export async function execute(sql: string, params?: any[]): Promise<any> {
  if (!pool) return { affectedRows: 0 };
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (err: any) {
    console.error(`[MySQL Execute Error]: ${err?.message || err}`);
    throw err;
  }
}

export async function withTransaction<T>(callback: (conn: any) => Promise<T>): Promise<T> {
  if (!pool) throw new Error("Koneksi database tidak tersedia");
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default pool;
