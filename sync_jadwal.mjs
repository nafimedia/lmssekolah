import mysql from 'mysql2/promise';

async function syncJadwal() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 3306,
      user: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'db_lms',
    });

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS jadwal_pelajaran (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hari VARCHAR(50) NOT NULL,
        jam VARCHAR(100) NOT NULL,
        mapel VARCHAR(255) NOT NULL,
        tingkat VARCHAR(100) NOT NULL,
        rombel VARCHAR(100) NOT NULL,
        guru VARCHAR(255) DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await conn.execute('TRUNCATE TABLE jadwal_pelajaran;');

    const items = [
      // --- KELAS 7A ---
      { hari: "Senin", jam: "07.30 - 08.15", mapel: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "SRIYANI KUNTARI, S.Pd" },
      { hari: "Senin", jam: "08.15 - 09.00", mapel: "PJOK", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "NUR ROCHMAN SHODIQ, S.Pd.I" },
      { hari: "Senin", jam: "09.15 - 10.00", mapel: "Bahasa Jawa", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "RINDANG FARIHA IDANA, S.Pd" },
      { hari: "Senin", jam: "10.00 - 10.45", mapel: "IPA", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "STEFI APRIONITA SETYO ARUM, S.Pd" },
      { hari: "Senin", jam: "10.45 - 11.30", mapel: "Seni Rupa", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "ISNAENI HASANAH, S.Pd.I" },
      { hari: "Selasa", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Selasa", jam: "07.45 - 08.30", mapel: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "SRIYANI KUNTARI, S.Pd" },
      { hari: "Selasa", jam: "08.30 - 09.15", mapel: "Akidah Akhlak", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "MAHMUDAH, S." },
      { hari: "Selasa", jam: "09.30 - 10.15", mapel: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "DAISAH, S.Pd" },
      { hari: "Selasa", jam: "10.15 - 11.00", mapel: "Bimbingan Konseling", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "MAULIDIA NURUL IZATI, S.Pd" },
      { hari: "Rabu", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Rabu", jam: "07.45 - 08.30", mapel: "Al Qur'an Hadis", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Rabu", jam: "08.30 - 09.15", mapel: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "DAISAH, S.Pd" },
      { hari: "Rabu", jam: "09.30 - 10.15", mapel: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
      { hari: "Kamis", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Kamis", jam: "07.45 - 08.30", mapel: "Pendidikan Kewarganegaraan", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      { hari: "Kamis", jam: "08.30 - 09.15", mapel: "Bahasa Inggris", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
      { hari: "Kamis", jam: "09.30 - 10.15", mapel: "IPS", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "NAZIHATUN ZUHRIYAH, S.Pd." },
      { hari: "Jumat", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Jumat", jam: "07.45 - 08.30", mapel: "Bahasa Arab", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "ENDAH SUPRIHATIN, S.Pd" },
      { hari: "Jumat", jam: "08.30 - 09.15", mapel: "Sejarah Kebudayaan Islam", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "H. DASIRUN, S.Ag., M.Pd.I" },
      { hari: "Sabtu", jam: "07.30 - 08.30", mapel: "Fikih", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "CARYATI," },
      { hari: "Sabtu", jam: "08.30 - 09.30", mapel: "IPA", tingkat: "Kelas VII", rombel: "Rombel 7A", guru: "STEFI APRIONITA SETYO ARUM, S.Pd" },

      // --- KELAS 7B ---
      { hari: "Senin", jam: "07.30 - 08.15", mapel: "IPA", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "STEFI APRIONITA SETYO ARUM, S.Pd" },
      { hari: "Senin", jam: "08.15 - 09.00", mapel: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "DAISAH, S.Pd" },
      { hari: "Senin", jam: "09.15 - 10.00", mapel: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "IFTI NURROHMAH, S.Pd" },
      { hari: "Senin", jam: "10.00 - 10.45", mapel: "Bahasa Jawa", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "RINDANG FARIHA IDANA, S.Pd" },
      { hari: "Senin", jam: "10.45 - 11.30", mapel: "Bimbingan Konseling", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "MAULIDIA NURUL IZATI, S.Pd" },
      { hari: "Selasa", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Selasa", jam: "07.45 - 08.30", mapel: "Bahasa Arab", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "ENDAH SUPRIHATIN, S.Pd" },
      { hari: "Selasa", jam: "08.30 - 09.15", mapel: "Bahasa Inggris", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "SASI VIVIANI, S.Pd" },
      { hari: "Selasa", jam: "09.30 - 10.15", mapel: "Pendidikan Kewarganegaraan", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      { hari: "Rabu", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Rabu", jam: "07.45 - 08.30", mapel: "IPA", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "STEFI APRIONITA SETYO ARUM, S.Pd" },
      { hari: "Rabu", jam: "08.30 - 09.15", mapel: "Seni Rupa", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "ISNAENI HASANAH, S.Pd.I" },
      { hari: "Rabu", jam: "09.30 - 10.15", mapel: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
      { hari: "Rabu", jam: "10.15 - 11.00", mapel: "Sejarah Kebudayaan Islam", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "H. DASIRUN, S.Ag., M.Pd.I" },
      { hari: "Kamis", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Kamis", jam: "07.45 - 08.30", mapel: "Fikih", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "CARYATI," },
      { hari: "Kamis", jam: "08.30 - 09.15", mapel: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "DAISAH, S.Pd" },
      { hari: "Kamis", jam: "09.30 - 10.15", mapel: "Al Qur'an Hadis", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Jumat", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "MISBAH AHMAD DANI, S.Pd" },
      { hari: "Jumat", jam: "07.45 - 08.30", mapel: "PJOK", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "NUR ROCHMAN SHODIQ, S.Pd.I" },
      { hari: "Jumat", jam: "08.30 - 09.15", mapel: "Akidah Akhlak", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "MAHMUDAH, S." },
      { hari: "Sabtu", jam: "07.30 - 08.30", mapel: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "IFTI NURROHMAH, S.Pd" },
      { hari: "Sabtu", jam: "08.30 - 09.30", mapel: "IPS", tingkat: "Kelas VII", rombel: "Rombel 7B", guru: "NAZIHATUN ZUHRIYAH, S.Pd." },

      // --- KELAS 8A ---
      { hari: "Senin", jam: "07.30 - 08.30", mapel: "PJOK", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "TEGUH WIYONO, S.Pd" },
      { hari: "Senin", jam: "08.30 - 09.30", mapel: "Sejarah Kebudayaan Islam", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "H. DASIRUN, S.Ag., M.Pd.I" },
      { hari: "Senin", jam: "09.45 - 10.45", mapel: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "SOBIYATI, S.Pd" },
      { hari: "Senin", jam: "10.45 - 11.45", mapel: "Bimbingan Konseling", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "ASROR HIDAYAT, S.Pd" },
      { hari: "Selasa", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Selasa", jam: "07.45 - 08.45", mapel: "IPA", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "NOVANTYA KARTIKAWATI, S.Pd" },
      { hari: "Selasa", jam: "09.00 - 10.00", mapel: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "SAYONO, S.Pd., M.Pd." },
      { hari: "Selasa", jam: "10.00 - 11.00", mapel: "Bahasa Inggris", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "RIDHO ANSHORI, S.Pd., M.Pd" },
      { hari: "Rabu", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Rabu", jam: "07.45 - 08.30", mapel: "Bahasa Jawa", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "RINDANG FARIHA IDANA, S.Pd" },
      { hari: "Rabu", jam: "08.30 - 09.15", mapel: "IPA", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "NOVANTYA KARTIKAWATI, S.Pd" },
      { hari: "Rabu", jam: "09.30 - 10.15", mapel: "Fikih", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "CARYATI," },
      { hari: "Rabu", jam: "10.15 - 11.00", mapel: "Bahasa Arab", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "Hj. SITI MUHSINAH, S" },
      { hari: "Kamis", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Kamis", jam: "07.45 - 08.30", mapel: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "SAYONO, S.Pd., M.Pd." },
      { hari: "Kamis", jam: "08.30 - 09.15", mapel: "Seni Rupa", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "HASIS SYARIFUDIN, S.Pd" },
      { hari: "Kamis", jam: "09.30 - 10.15", mapel: "Pendidikan Kewarganegaraan", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      { hari: "Kamis", jam: "10.15 - 11.00", mapel: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "SOBIYATI, S.Pd" },
      { hari: "Jumat", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Jumat", jam: "07.45 - 08.30", mapel: "Al Qur'an Hadis", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Jumat", jam: "08.30 - 09.15", mapel: "IPS", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "UMI KHAFSOH, S.Pd" },
      { hari: "Sabtu", jam: "07.30 - 08.30", mapel: "Akidah Akhlak", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "WAKHIBUN, S.P" },
      { hari: "Sabtu", jam: "08.30 - 09.30", mapel: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VIII", rombel: "Rombel 8A", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },

      // --- KELAS 8B ---
      { hari: "Senin", jam: "07.30 - 08.15", mapel: "Pendidikan Kewarganegaraan", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      { hari: "Senin", jam: "08.15 - 09.00", mapel: "Bahasa Arab", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "Hj. SITI MUHSINAH, S" },
      { hari: "Senin", jam: "09.15 - 10.00", mapel: "Fikih", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "CARYATI," },
      { hari: "Senin", jam: "10.00 - 10.45", mapel: "Seni Rupa", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "HASIS SYARIFUDIN, S.Pd" },
      { hari: "Senin", jam: "10.45 - 11.30", mapel: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "SOBIYATI, S.Pd" },
      { hari: "Selasa", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Selasa", jam: "07.45 - 08.30", mapel: "Bahasa Jawa", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "RINDANG FARIHA IDANA, S.Pd" },
      { hari: "Selasa", jam: "08.30 - 09.15", mapel: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "SOBIYATI, S.Pd" },
      { hari: "Selasa", jam: "09.30 - 10.15", mapel: "IPS", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "UMI KHAFSOH, S.Pd" },
      { hari: "Selasa", jam: "10.15 - 11.00", mapel: "Al Qur'an Hadis", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Rabu", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Rabu", jam: "07.45 - 08.30", mapel: "Bahasa Inggris", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "CETY MAHARSY, S.Pd" },
      { hari: "Rabu", jam: "08.30 - 09.15", mapel: "Sejarah Kebudayaan Islam", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "H. DASIRUN, S.Ag., M.Pd.I" },
      { hari: "Rabu", jam: "09.30 - 10.15", mapel: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "SOBIYATI, S.Pd" },
      { hari: "Kamis", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Kamis", jam: "07.45 - 08.30", mapel: "IPA", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "NOVANTYA KARTIKAWATI, S.Pd" },
      { hari: "Kamis", jam: "08.30 - 09.15", mapel: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "SAYONO, S.Pd., M.Pd." },
      { hari: "Kamis", jam: "09.30 - 10.15", mapel: "Akidah Akhlak", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "WAKHIBUN, S.P" },
      { hari: "Kamis", jam: "10.15 - 11.00", mapel: "Bimbingan Konseling", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "ASROR HIDAYAT, S.Pd" },
      { hari: "Jumat", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Jumat", jam: "07.45 - 08.30", mapel: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "SAYONO, S.Pd., M.Pd." },
      { hari: "Jumat", jam: "08.30 - 09.15", mapel: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
      { hari: "Sabtu", jam: "07.30 - 08.30", mapel: "IPA", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "NOVANTYA KARTIKAWATI, S.Pd" },
      { hari: "Sabtu", jam: "08.30 - 09.30", mapel: "PJOK", tingkat: "Kelas VIII", rombel: "Rombel 8B", guru: "TEGUH WIYONO, S.Pd" },

      // --- KELAS 9A ---
      { hari: "Senin", jam: "07.30 - 08.15", mapel: "Bahasa Jawa", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "RINDANG FARIHA IDANA, S.Pd" },
      { hari: "Senin", jam: "08.15 - 09.00", mapel: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
      { hari: "Senin", jam: "09.15 - 10.00", mapel: "Bahasa Inggris", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "INDAH NURROHMAH, S.Pd" },
      { hari: "Senin", jam: "10.00 - 10.45", mapel: "Sejarah Kebudayaan Islam", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "H. DASIRUN, S.Ag., M.Pd.I" },
      { hari: "Selasa", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Selasa", jam: "07.45 - 08.30", mapel: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "H. ANI YULIANI, S.Pd" },
      { hari: "Selasa", jam: "08.30 - 09.15", mapel: "IPA", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "ILHAM HABIBI, S.Pd" },
      { hari: "Selasa", jam: "09.30 - 10.15", mapel: "Pendidikan Kewarganegaraan", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      { hari: "Selasa", jam: "10.15 - 11.00", mapel: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "Hj. NANGIMAH, S." },
      { hari: "Rabu", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Rabu", jam: "07.45 - 08.30", mapel: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "Hj. NANGIMAH, S." },
      { hari: "Rabu", jam: "08.30 - 09.15", mapel: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "H. ANI YULIANI, S.Pd" },
      { hari: "Rabu", jam: "09.30 - 10.15", mapel: "Seni Rupa", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "HASIS SYARIFUDIN, S.Pd" },
      { hari: "Rabu", jam: "10.15 - 11.00", mapel: "IPS", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "ALI MANSUR, S.Pd" },
      { hari: "Kamis", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Kamis", jam: "07.45 - 08.30", mapel: "Al Qur'an Hadis", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Kamis", jam: "08.30 - 09.15", mapel: "Bahasa Arab", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "WAHYUDIN, S" },
      { hari: "Kamis", jam: "09.30 - 10.15", mapel: "Bimbingan Konseling", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "SARAH SAFIRA, S.Pd" },
      { hari: "Kamis", jam: "10.15 - 11.00", mapel: "Fikih", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "MUHTAMAM, S.Ag., M.Pd.I" },
      { hari: "Jumat", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Jumat", jam: "07.45 - 08.30", mapel: "Akidah Akhlak", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "WAKHIBUN, S.P" },
      { hari: "Jumat", jam: "08.30 - 09.15", mapel: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "H. ANI YULIANI, S.Pd" },
      { hari: "Sabtu", jam: "07.30 - 08.30", mapel: "PJOK", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "MASRUKHAN, S.Pd" },
      { hari: "Sabtu", jam: "08.30 - 09.30", mapel: "IPA", tingkat: "Kelas IX", rombel: "Rombel 9A", guru: "ILHAM HABIBI, S.Pd" },

      // --- KELAS 9B ---
      { hari: "Senin", jam: "07.30 - 08.15", mapel: "IPA", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "ILHAM HABIBI, S.Pd" },
      { hari: "Senin", jam: "08.15 - 09.00", mapel: "Bimbingan Konseling", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "SARAH SAFIRA, S.Pd" },
      { hari: "Senin", jam: "09.15 - 10.00", mapel: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "H. ANI YULIANI, S.Pd" },
      { hari: "Senin", jam: "10.00 - 10.45", mapel: "Seni Rupa", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "HASIS SYARIFUDIN, S.Pd" },
      { hari: "Senin", jam: "10.45 - 11.30", mapel: "Akidah Akhlak", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "WAKHIBUN, S.P" },
      { hari: "Selasa", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Selasa", jam: "07.45 - 08.30", mapel: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
      { hari: "Selasa", jam: "08.30 - 09.15", mapel: "Bahasa Jawa", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "RINDANG FARIHA IDANA, S.Pd" },
      { hari: "Selasa", jam: "09.30 - 10.15", mapel: "Al Qur'an Hadis", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Selasa", jam: "10.15 - 11.00", mapel: "Bahasa Arab", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "WAHYUDIN, S" },
      { hari: "Rabu", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Rabu", jam: "07.45 - 08.30", mapel: "Bahasa Inggris", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "INDAH NURROHMAH, S.Pd" },
      { hari: "Rabu", jam: "08.30 - 09.15", mapel: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "Hj. NANGIMAH, S." },
      { hari: "Rabu", jam: "09.30 - 10.15", mapel: "Sejarah Kebudayaan Islam", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "H. DASIRUN, S.Ag., M.Pd.I" },
      { hari: "Kamis", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Kamis", jam: "07.45 - 08.30", mapel: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "Hj. NANGIMAH, S." },
      { hari: "Kamis", jam: "08.30 - 09.15", mapel: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "H. ANI YULIANI, S.Pd" },
      { hari: "Kamis", jam: "09.30 - 10.15", mapel: "IPA", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "ILHAM HABIBI, S.Pd" },
      { hari: "Kamis", jam: "10.15 - 11.00", mapel: "Pendidikan Kewarganegaraan", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      { hari: "Jumat", jam: "07.00 - 07.45", mapel: "Tahfidz", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "AH. SYARIF HIDAYAH, S.Pd.I" },
      { hari: "Jumat", jam: "07.45 - 08.30", mapel: "PJOK", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "MASRUKHAN, S.Pd" },
      { hari: "Jumat", jam: "08.30 - 09.15", mapel: "Fikih", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "MUHTAMAM, S.Ag., M.Pd.I" },
      { hari: "Sabtu", jam: "07.30 - 08.30", mapel: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "H. ANI YULIANI, S.Pd" },
      { hari: "Sabtu", jam: "08.30 - 09.30", mapel: "IPS", tingkat: "Kelas IX", rombel: "Rombel 9B", guru: "ALI MANSUR, S.Pd" },
    ];

    for (const item of items) {
      await conn.execute(
        'INSERT INTO jadwal_pelajaran (hari, jam, mapel, tingkat, rombel, guru) VALUES (?, ?, ?, ?, ?, ?)',
        [item.hari, item.jam, item.mapel, item.tingkat, item.rombel, item.guru]
      );
    }

    const [rows] = await conn.execute('SELECT COUNT(*) as cnt FROM jadwal_pelajaran');
    console.log('🎉 Jadwal Pelajaran MySQL Database Berhasil Disinkronkan! Total:', rows[0].cnt);
    await conn.end();
  } catch (e) {
    console.error('❌ Error sync jadwal:', e.message);
  }
}

syncJadwal();
