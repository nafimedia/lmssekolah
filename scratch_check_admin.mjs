import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function checkAdmin() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST || "localhost",
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || "root",
      password: process.env.DATABASE_PASSWORD || "",
      database: process.env.DATABASE_NAME || "db_lms",
    });

    const [rows] = await conn.execute("SELECT id, email, nis_nip, role, password_hash FROM users");
    console.log("TOTAL USERS IN DB:", rows.length);
    console.log("USERS:", JSON.stringify(rows.slice(0, 10), null, 2));

    const hashFn = bcrypt.default?.hashSync || bcrypt.hashSync;
    const adminHash = hashFn("asd123", 10);

    // Upsert guaranteed super admin user
    await conn.execute(
      `INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, role)
       VALUES ('usr-admin-1', 'admin@mail.com', ?, 'Super Administrator MTsN 2', 'NIP', '198501012010011001', 'admin')
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = 'admin'`,
      [adminHash]
    );

    console.log("✅ Admin user admin@mail.com / 198501012010011001 reset with password 'asd123' and bcrypt hash successfully!");

    await conn.end();
  } catch (err) {
    console.error("DB Query Error:", err);
  }
}

checkAdmin();
