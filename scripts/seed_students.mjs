import mysql from 'mysql2/promise';
import xlsxMod from 'xlsx';
import bcryptMod from 'bcryptjs';
import path from 'path';

const xlsx = xlsxMod.default || xlsxMod;
const bcrypt = bcryptMod.default || bcryptMod;

async function seedStudents() {
  console.log('===============================================================');
  console.log('🚀 LMS MTsN 2 CILACAP — SEEDER SISWA KELAS 7 & TAMBAHAN KHUSUS');
  console.log('===============================================================');

  const excelPath = path.join(process.cwd(), 'DAFTAR KELAS 7, 8 DAN 9.xlsx');
  console.log(`📂 Membaca berkas Excel: ${excelPath}`);

  const wb = xlsx.readFile(excelPath);

  // 1. Ambil data Kelas 7 (hanya 7A dan 7B)
  const sheet7 = wb.Sheets['KELAS 7'];
  if (!sheet7) {
    throw new Error('Sheet "KELAS 7" tidak ditemukan dalam berkas Excel!');
  }
  const data7 = xlsx.utils.sheet_to_json(sheet7, { header: 1 });

  const targetStudentsK7 = [];
  for (let i = 10; i < data7.length; i++) {
    const row = data7[i];
    if (!row || !row[1]) continue;

    const no = row[0];
    const rawName = String(row[1]).trim();
    const noIndukRaw = row[2] ? String(row[2]).trim() : '';
    const nisnRaw = row[3] ? String(row[3]).trim() : '';
    const jkRaw = row[4] ? String(row[4]).trim().toUpperCase() : 'L';
    const kelasRaw = row[5] ? String(row[5]).trim().toUpperCase() : '';

    if (kelasRaw === '7A' || kelasRaw === '7B') {
      const className = kelasRaw === '7A' ? 'VII-A' : 'VII-B';
      const cleanNisn = nisnRaw.replace(/[^0-9]/g, '');
      const cleanInduk = noIndukRaw.replace(/[^0-9]/g, '');

      targetStudentsK7.push({
        fullName: rawName.toUpperCase(),
        noInduk: noIndukRaw,
        nisn: cleanNisn || cleanInduk,
        gender: jkRaw === 'P' ? 'Perempuan' : 'Laki-laki',
        className,
        rombelCode: kelasRaw.toLowerCase(), // '7a' or '7b'
      });
    }
  }

  console.log(`✅ Berhasil mengekstrak ${targetStudentsK7.length} siswa Kelas 7 dari Excel:`);
  console.log(`   - 7A: ${targetStudentsK7.filter((s) => s.rombelCode === '7a').length} siswa`);
  console.log(`   - 7B: ${targetStudentsK7.filter((s) => s.rombelCode === '7b').length} siswa`);

  // 2. Cari Siswa Tambahan Kelas 8A: Wafiq Nabilah
  const sheet8 = wb.Sheets['KELAS 8'];
  let wafiqStudent = null;
  if (sheet8) {
    const data8 = xlsx.utils.sheet_to_json(sheet8, { header: 1 });
    for (let i = 10; i < data8.length; i++) {
      const row = data8[i];
      if (!row || !row[1]) continue;
      const name = String(row[1]).trim();
      if (name.toUpperCase().includes('WAFIQ') && name.toUpperCase().includes('NABILA')) {
        const noInduk = row[2] ? String(row[2]).trim() : '26177';
        const nisn = row[3] ? String(row[3]).trim().replace(/[^0-9]/g, '') : noInduk;
        wafiqStudent = {
          fullName: name.toUpperCase(),
          noInduk,
          nisn: nisn || noInduk || '26177',
          gender: 'Perempuan',
          className: 'VIII-A',
          rombelCode: '8a',
        };
        break;
      }
    }
  }

  if (wafiqStudent) {
    console.log(`✅ Ditemukan siswa tambahan Kelas 8A: ${wafiqStudent.fullName} (Induk/NISN: ${wafiqStudent.nisn})`);
  } else {
    wafiqStudent = {
      fullName: 'WAFIQ NABILA RAMADHANI',
      noInduk: '26177',
      nisn: '26177',
      gender: 'Perempuan',
      className: 'VIII-A',
      rombelCode: '8a',
    };
    console.log(`ℹ️ Menggunakan data Wafiq Nabilah dari data registrasi: ${wafiqStudent.fullName}`);
  }

  // 3. Cari Siswa Tambahan Kelas 9B: Zainun Agil
  const sheet9 = wb.Sheets['KELAS 9'];
  let zainunStudent = null;
  if (sheet9) {
    const data9 = xlsx.utils.sheet_to_json(sheet9, { header: 1 });
    for (let i = 10; i < data9.length; i++) {
      const row = data9[i];
      if (!row || !row[1]) continue;
      const name = String(row[1]).trim();
      if (name.toUpperCase().includes('ZAINUN') && name.toUpperCase().includes('AGIL')) {
        const noInduk = row[2] ? String(row[2]).trim() : '240265';
        const nisn = row[3] ? String(row[3]).trim().replace(/[^0-9]/g, '') : '0126865403';
        zainunStudent = {
          fullName: name.toUpperCase(),
          noInduk,
          nisn: nisn || '0126865403',
          gender: 'Laki-laki',
          className: 'IX-B',
          rombelCode: '9b',
        };
        break;
      }
    }
  }

  if (zainunStudent) {
    console.log(`✅ Ditemukan siswa Kelas 9B: ${zainunStudent.fullName} (NISN: ${zainunStudent.nisn})`);
  }

  // 4. Hubungkan ke Database MySQL
  console.log('\n🔌 Menghubungkan ke database MySQL db_lms...');
  const conn = await mysql.createConnection({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'db_lms',
  });

  // Password hash default: asd123
  const hashFn = bcrypt.hashSync || bcrypt.default?.hashSync;
  const passwordHash = hashFn('asd123', 10);

  // Ambil semua pengguna siswa yang sudah ada untuk menghindari duplikasi
  const [existingUsers] = await conn.execute('SELECT id, email, nis_nip, full_name, class_name FROM users');
  const existingMap = new Map();
  let maxIdIndex = 0;

  for (const u of existingUsers) {
    if (u.nis_nip) existingMap.set(String(u.nis_nip).trim(), u);
    if (u.email) existingMap.set(String(u.email).toLowerCase().trim(), u);
    if (u.full_name) existingMap.set(String(u.full_name).toUpperCase().trim(), u);

    const m = String(u.id).match(/^usr-siswa-(\d+)$/);
    if (m) {
      const val = parseInt(m[1], 10);
      if (val > maxIdIndex) maxIdIndex = val;
    }
  }

  console.log(`📊 Indeks ID siswa tertinggi saat ini: usr-siswa-${maxIdIndex}`);

  // Gabungkan semua target siswa yang akan di-seed
  const allStudentsToProcess = [...targetStudentsK7, wafiqStudent];
  if (zainunStudent) {
    allStudentsToProcess.push(zainunStudent);
  }

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const s of allStudentsToProcess) {
    const email = `${s.nisn}@siswa.mtsn2cilacap.sch.id`;
    const existing =
      existingMap.get(s.nisn) ||
      existingMap.get(email.toLowerCase()) ||
      existingMap.get(s.fullName);

    if (existing) {
      // Siswa sudah ada, pastikan rombel dan nama sesuai
      if (existing.class_name !== s.className) {
        await conn.execute(
          'UPDATE users SET class_name = ?, full_name = ?, updated_at = NOW() WHERE id = ?',
          [s.className, s.fullName, existing.id]
        );
        updatedCount++;
      } else {
        skippedCount++;
      }
    } else {
      // Siswa baru, lakukan insert
      maxIdIndex++;
      const newId = `usr-siswa-${maxIdIndex}`;

      await conn.execute(
        `INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'NISN', ?, ?, 'siswa', NOW(), NOW())`,
        [newId, email, passwordHash, s.fullName, s.nisn, s.className]
      );

      existingMap.set(s.nisn, { id: newId, email, full_name: s.fullName, class_name: s.className });
      insertedCount++;
    }
  }

  console.log('\n===============================================================');
  console.log('🎉 HASIL SEEDING SISWA KE DATABASE:');
  console.log(`   - Siswa Baru Berhasil Ditambahkan : ${insertedCount}`);
  console.log(`   - Siswa Diperbarui Kelas/Namanya : ${updatedCount}`);
  console.log(`   - Siswa Sudah Terdaftar (Dilewati): ${skippedCount}`);
  console.log('===============================================================');

  // 5. Sinkronisasi master_rombels siswa_count
  console.log('\n🔄 Menyinkronkan jumlah siswa pada master_rombels...');
  const [counts] = await conn.execute(
    `SELECT class_name, COUNT(*) as total FROM users WHERE role = 'siswa' GROUP BY class_name`
  );

  for (const c of counts) {
    let rombelCode = '';
    const norm = (c.class_name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (norm === 'VIIA' || norm === '7A') rombelCode = '7a';
    else if (norm === 'VIIB' || norm === '7B') rombelCode = '7b';
    else if (norm === 'VIIIA' || norm === '8A') rombelCode = '8a';
    else if (norm === 'VIIIB' || norm === '8B') rombelCode = '8b';
    else if (norm === 'IXA' || norm === '9A') rombelCode = '9a';
    else if (norm === 'IXB' || norm === '9B') rombelCode = '9b';

    if (rombelCode) {
      await conn.execute('UPDATE master_rombels SET siswa_count = ? WHERE code = ?', [
        c.total,
        rombelCode,
      ]);
      console.log(`   - Rombel ${c.class_name} (${rombelCode}): ${c.total} Siswa`);
    }
  }

  const [rombels] = await conn.execute('SELECT code, name, siswa_count, wali_kelas FROM master_rombels');
  console.log('\n📋 Data Master Rombel Terkini di Database:');
  console.table(rombels);

  await conn.end();
  console.log('\n✅ SEEDER SELESAI DENGAN SUKSES!');
}

seedStudents().catch((err) => {
  console.error('\n❌ SEEDER GAGAL:', err);
  process.exit(1);
});
