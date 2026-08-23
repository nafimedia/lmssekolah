import mysql from 'mysql2/promise';

async function syncRuang() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'db_lms',
    });

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS master_ruang (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        cap VARCHAR(100) DEFAULT '36 Siswa',
        fas VARCHAR(255) DEFAULT 'Proyektor, AC',
        icon VARCHAR(20) DEFAULT '🏫',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    const [existing] = await conn.execute('SELECT COUNT(*) as cnt FROM master_ruang');
    if (existing[0].cnt === 0) {
      const initialSeed = [
        { name: "Ruang A.01", type: "Ruang Teori (Kelas VII A)", cap: "36 Siswa", fas: "Proyektor, AC, Papan Tulis", icon: "🏫" },
        { name: "Ruang A.02", type: "Ruang Teori (Kelas VIII A)", cap: "36 Siswa", fas: "Proyektor, AC, Sound System", icon: "🏫" },
        { name: "Lab IPA Terpadu", type: "Laboratorium Praktikum", cap: "40 Siswa", fas: "Mikroskop, Alat Bedah, Proyektor", icon: "🔬" },
        { name: "Lab Komputer CBT", type: "Laboratorium Komputer", cap: "40 Komputer", fas: "LAN, Server CBT, AC, UPS 10kVA", icon: "💻" },
        { name: "Perpustakaan Digital", type: "E-Library & Ruang Baca", cap: "60 Siswa", fas: "Tablet E-Library, Wi-Fi 100Mbps", icon: "📚" },
        { name: "Lapangan Olahraga Utama", type: "Fasilitas Outdoor", cap: "500 Siswa", fas: "Garis Futsal, Basket, Voli", icon: "⚽" },
      ];

      for (const s of initialSeed) {
        await conn.execute(
          'INSERT INTO master_ruang (name, type, cap, fas, icon) VALUES (?, ?, ?, ?, ?)',
          [s.name, s.type, s.cap, s.fas, s.icon]
        );
      }
    }

    const [rows] = await conn.execute('SELECT COUNT(*) as cnt FROM master_ruang');
    console.log('🎉 Master Ruang MySQL Database Berhasil Disinkronkan! Total:', rows[0].cnt);
    await conn.end();
  } catch (e) {
    console.error('❌ Error sync ruang:', e.message);
  }
}

syncRuang();
