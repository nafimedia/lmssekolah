const mysql = require('mysql2/promise');

async function syncMatriks() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost', user: 'root', password: '', database: 'db_lms'
    });

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS matriks_pengampu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        guru VARCHAR(255) NOT NULL,
        mapel VARCHAR(255) NOT NULL,
        rombel VARCHAR(100) NOT NULL,
        jam VARCHAR(50) DEFAULT '2 JP / mgg',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.execute('TRUNCATE TABLE matriks_pengampu;');

    const items = [
      { guru: "AH. SYARIF HIDAYAH, S.Pd.I", mapel: "Al Qur'an Hadis", rombel: "IX A", jam: "2 JP / mgg" },
      { guru: "MISBAH AHMAD DANI, S.Pd", mapel: "Al Qur'an Hadis", rombel: "VII A", jam: "2 JP / mgg" },
      { guru: "WAKHIBUN, S.P", mapel: "Akidah Akhlak", rombel: "VIII A", jam: "2 JP / mgg" },
      { guru: "MAHMUDAH, S.", mapel: "Akidah Akhlak", rombel: "VII B", jam: "2 JP / mgg" },
      { guru: "CARYATI,", mapel: "Fikih", rombel: "VIII A", jam: "2 JP / mgg" },
      { guru: "MUHTAMAM, S.Ag., M.Pd.I", mapel: "Fikih", rombel: "IX B", jam: "2 JP / mgg" },
      { guru: "H. DASIRUN, S.Ag., M.Pd.I", mapel: "Sejarah Kebudayaan Islam", rombel: "VII A", jam: "2 JP / mgg" },
      { guru: "ENDAH SUPRIHATIN, S.Pd", mapel: "Bahasa Arab", rombel: "VII A", jam: "3 JP / mgg" },
      { guru: "Hj. SITI MUHSINAH, S", mapel: "Bahasa Arab", rombel: "VIII A", jam: "3 JP / mgg" },
      { guru: "WAHYUDIN, S", mapel: "Bahasa Arab", rombel: "IX A", jam: "3 JP / mgg" },
      { guru: "SOBIYATI, S.Pd", mapel: "Bahasa Indonesia", rombel: "VIII A", jam: "4 JP / mgg" },
      { guru: "DAISAH, S.Pd", mapel: "Bahasa Indonesia", rombel: "VII A", jam: "4 JP / mgg" },
      { guru: "Hj. NANGIMAH, S.", mapel: "Bahasa Indonesia", rombel: "IX A", jam: "4 JP / mgg" },
      { guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", mapel: "Bahasa Inggris", rombel: "VII A", jam: "3 JP / mgg" },
      { guru: "RIDHO ANSHORI, S.Pd., M.Pd", mapel: "Bahasa Inggris", rombel: "VIII A", jam: "3 JP / mgg" },
      { guru: "CETY MAHARSY, S.Pd", mapel: "Bahasa Inggris", rombel: "VIII B", jam: "3 JP / mgg" },
      { guru: "SASI VIVIANI, S.Pd", mapel: "Bahasa Inggris", rombel: "VII B", jam: "3 JP / mgg" },
      { guru: "INDAH NURROHMAH, S.Pd", mapel: "Bahasa Inggris", rombel: "IX A", jam: "3 JP / mgg" },
      { guru: "SAYONO, S.Pd., M.Pd.", mapel: "Matematika", rombel: "VIII A", jam: "4 JP / mgg" },
      { guru: "SRIYANI KUNTARI, S.Pd", mapel: "Matematika", rombel: "VII A", jam: "4 JP / mgg" },
      { guru: "H. ANI YULIANI, S.Pd", mapel: "Matematika", rombel: "IX A", jam: "4 JP / mgg" },
      { guru: "IFTI NURROHMAH, S.Pd", mapel: "Matematika", rombel: "VII B", jam: "4 JP / mgg" },
      { guru: "NOVANTYA KARTIKAWATI, S.Pd", mapel: "Ilmu Pendidikan Alam", rombel: "VIII A", jam: "4 JP / mgg" },
      { guru: "STEFI APRIONITA SETYO ARUM, S.Pd", mapel: "Ilmu Pendidikan Alam", rombel: "VII A", jam: "4 JP / mgg" },
      { guru: "ILHAM HABIBI, S.Pd", mapel: "Ilmu Pendidikan Alam", rombel: "IX A", jam: "4 JP / mgg" },
      { guru: "HIKMATUL ASTRI AZKIYA, S.Pd", mapel: "Ilmu Pendidikan Alam", rombel: "VII B", jam: "4 JP / mgg" },
      { guru: "UMI KHAFSOH, S.Pd", mapel: "Ilmu Pendidikan Sosial", rombel: "VIII A", jam: "3 JP / mgg" },
      { guru: "NAZIHATUN ZUHRIYAH, S.Pd.", mapel: "Ilmu Pendidikan Sosial", rombel: "VII A", jam: "3 JP / mgg" },
      { guru: "ALI MANSUR, S.Pd", mapel: "Ilmu Pendidikan Sosial", rombel: "IX A", jam: "3 JP / mgg" },
      { guru: "ANGGUN NOVTALIA BERLIAN, S.Pd", mapel: "Pendidikan Kewarganegaraan", rombel: "VIII A", jam: "2 JP / mgg" },
      { guru: "TEGUH WIYONO, S.Pd", mapel: "Pendidikan Jasmani, Olahraga dan Kesehatan", rombel: "VIII A", jam: "2 JP / mgg" },
      { guru: "NUR ROCHMAN SHODIQ, S.Pd.I", mapel: "Pendidikan Jasmani, Olahraga dan Kesehatan", rombel: "VII A", jam: "2 JP / mgg" },
      { guru: "MASRUKHAN, S.Pd", mapel: "Pendidikan Jasmani, Olahraga dan Kesehatan", rombel: "IX A", jam: "2 JP / mgg" },
      { guru: "HASIS SYARIFUDIN, S.Pd", mapel: "Prakarya dan Seni Budaya", rombel: "VIII A", jam: "2 JP / mgg" },
      { guru: "ISNAENI HASANAH, S.Pd.I", mapel: "Prakarya dan Seni Budaya", rombel: "VII A", jam: "2 JP / mgg" },
      { guru: "RINDANG FARIHA IDANA, S.Pd", mapel: "Bahasa Jawa", rombel: "VIII A", jam: "2 JP / mgg" },
      { guru: "ASROR HIDAYAT, S.Pd", mapel: "Bimbingan dan Konseling", rombel: "VIII A", jam: "2 JP / mgg" },
      { guru: "MAULIDIA NURUL IZATI, S.Pd", mapel: "Bimbingan dan Konseling", rombel: "VII A", jam: "2 JP / mgg" },
      { guru: "SARAH SAFIRA, S.Pd", mapel: "Bimbingan dan Konseling", rombel: "IX A", jam: "2 JP / mgg" },
      { guru: "H. SOLIHUN, S.Pd., M.Si", mapel: "Manajemen Sekolah", rombel: "Semua Rombel", jam: "6 JP / mgg" },
    ];

    for (const item of items) {
      await conn.execute('INSERT INTO matriks_pengampu (guru, mapel, rombel, jam) VALUES (?, ?, ?, ?)', [item.guru, item.mapel, item.rombel, item.jam]);
    }

    const [rows] = await conn.execute('SELECT COUNT(*) as cnt FROM matriks_pengampu');
    console.log('🎉 Matriks Pengampu MySQL Database Berhasil Disinkronkan! Total:', rows[0].cnt);
    await conn.end();
  } catch (e) {
    console.error('❌ Error sync matriks:', e.message);
  }
}

syncMatriks();
