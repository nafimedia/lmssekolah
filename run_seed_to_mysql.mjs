import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function runSeed() {
  const dbConfig = {
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT) || 3306,
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
  };

  console.log("Menghubungkan ke MySQL Laragon...", dbConfig.host, dbConfig.port);

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log("✅ Terhubung ke MySQL Server.");

    await connection.query("CREATE DATABASE IF NOT EXISTS `db_lms` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    await connection.query("USE `db_lms`;");
    console.log("✅ Database db_lms terverifikasi.");

    // Ensure tables exist
    const schemaSql = fs.readFileSync(path.resolve("db_lms.sql"), "utf-8");
    const schemaStatements = schemaSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of schemaStatements) {
      try {
        await connection.query(stmt);
      } catch (err) {
        // Ignore duplicate table errors
      }
    }
    try {
      await connection.query("ALTER TABLE `profiles` ADD COLUMN `tagline` TEXT DEFAULT NULL;");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE `profiles` ADD COLUMN `address` TEXT DEFAULT NULL;");
    } catch (e) {}
    try {
      await connection.query("ALTER TABLE `profiles` ADD COLUMN `phone` VARCHAR(32) DEFAULT NULL;");
    } catch (e) {}
    console.log("✅ Skema Tabel Terbuat & Diselaraskan.");

    // Load parsed accounts
    const rawData = fs.readFileSync(path.resolve("parsed_accounts.json"), "utf-8");
    const { students, teachers } = JSON.parse(rawData);

    console.log(`⏳ Memasukkan ${students.length} data Siswa dan ${teachers.length} data Guru...`);

    let sCount = 0;
    for (let i = 0; i < students.length; i++) {
      const s = students[i];
      const usrId = `usr-siswa-${i + 1}`;
      const email = `${s.nisn}@siswa.mtsn2cilacap.sch.id`;

      await connection.query(
        `INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`full_name\`, \`identity_type\`, \`nis_nip\`, \`class_name\`, \`role\`)
         VALUES (?, ?, 'asd123', ?, 'NISN', ?, ?, 'siswa')
         ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`), \`class_name\` = VALUES(\`class_name\`);`,
        [usrId, email, s.nama, s.nisn, s.kelas]
      );

      await connection.query(
        `INSERT INTO \`user_roles\` (\`user_id\`, \`role\`) VALUES (?, 'siswa')
         ON DUPLICATE KEY UPDATE \`role\` = 'siswa';`,
        [usrId]
      );

      await connection.query(
        `INSERT INTO \`profiles\` (\`id\`, \`user_id\`, \`full_name\`, \`nis\`, \`class_name\`)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`), \`class_name\` = VALUES(\`class_name\`);`,
        [`prof-${usrId}`, usrId, s.nama, s.nisn, s.kelas]
      );
      sCount++;
    }

    let tCount = 0;
    for (let i = 0; i < teachers.length; i++) {
      const t = teachers[i];
      const usrId = `usr-guru-${i + 1}`;
      const email = `${t.nip}@guru.mtsn2cilacap.sch.id`;

      await connection.query(
        `INSERT INTO \`users\` (\`id\`, \`email\`, \`password_hash\`, \`full_name\`, \`identity_type\`, \`nis_nip\`, \`subject_specialty\`, \`role\`)
         VALUES (?, ?, 'asd123', ?, 'NIP', ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`), \`role\` = VALUES(\`role\`);`,
        [usrId, email, t.nama, t.nip, t.jabatan_mapel, t.role]
      );

      await connection.query(
        `INSERT INTO \`user_roles\` (\`user_id\`, \`role\`) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE \`role\` = VALUES(\`role\`);`,
        [usrId, t.role]
      );

      await connection.query(
        `INSERT INTO \`profiles\` (\`id\`, \`user_id\`, \`full_name\`, \`nis\`, \`tagline\`)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE \`full_name\` = VALUES(\`full_name\`);`,
        [`prof-${usrId}`, usrId, t.nama, t.nip, t.jabatan_mapel]
      );
      tCount++;
    }

    console.log(`🎉 BERHASIL IMPOR! Total ${sCount} Akun Siswa & ${tCount} Akun Guru telah tersimpan di MySQL database db_lms.`);
    await connection.end();
  } catch (error) {
    console.error("❌ Gagal mengimpor ke MySQL:", error.message);
  }
}

runSeed();
