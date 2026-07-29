import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log("🚀 Initializing Laragon MySQL database setup for db_lms...");

  const host = process.env.DATABASE_HOST || 'localhost';
  const port = Number(process.env.DATABASE_PORT) || 3306;
  const user = process.env.DATABASE_USER || 'root';
  const password = process.env.DATABASE_PASSWORD || '';
  const database = process.env.DATABASE_NAME || 'db_lms';

  try {
    // 1. Connect without database first to ensure db_lms exists
    const rootConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    });

    console.log(`📡 Connected to Laragon MySQL server at ${host}:${port}`);

    const sqlFilePath = path.join(process.cwd(), 'db_lms.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

    console.log("📄 Executing db_lms.sql schema & seed script...");
    await rootConnection.query(sqlContent);
    await rootConnection.end();

    console.log("✅ SUCCESS: Database `db_lms` successfully created & seeded with initial data!");
    
    // Verify content
    const dbConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
    });

    const [users] = await dbConnection.query('SELECT id, email, full_name, role FROM users');
    console.log("👥 Seeded Users in db_lms:");
    console.table(users);

    const [subjects] = await dbConnection.query('SELECT id, code, name FROM subjects');
    console.log("📚 Seeded Subjects:");
    console.table(subjects);

    await dbConnection.end();
  } catch (err) {
    console.error("❌ ERROR setting up Laragon MySQL database:", err);
  }
}

seed();
