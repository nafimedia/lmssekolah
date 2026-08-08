let pool: any = null;

if (typeof window === 'undefined') {
  const mysql = await import('mysql2/promise');
  pool = mysql.default.createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'db_lms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
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

export default pool;
