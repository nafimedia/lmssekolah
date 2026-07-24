# Rencana Implementasi Komprehensif: LMS MTs Negeri 2 Cilacap

Rencana kerja dan *roadmap* pembangunan **Learning Management System (LMS) MTs Negeri 2 Cilacap** berbasis skala prioritas secara bertahap, mendukung 7 role pengguna, struktur pembelajaran Pertemuan 1–18, CBT Engine, Modul Tahfidz, E-Rapor, dan Executive Dashboard.

---

## 📌 Catatan Utama Desain System

> [!NOTE]
> Tema tampilan bawaan (**Default Theme**) menggunakan **Tema Lovable Native** (OKLCH Color Space dengan palet Hijau Tosca Madrasah + Aksen Emas di Light Mode & Indigo Slate di Dark Mode).

---

## 👥 Arsitektur Peran Pengguna (7 Roles)

1. **Super Administrator:** Pengaturan sistem, Manajemen pengguna & role/permission, Backup & Restore, Audit Log, Pengaturan Tahun Ajaran, Semester, Kelas, Mapel, Monitoring Server, Pengaturan Modul.
2. **Administrator Akademik:** Kelola Guru, Siswa, Kelas, Rombel, Jadwal, Pengumuman, Perpustakaan Digital, Import/Export data, Monitoring Aktivitas.
3. **Kepala Madrasah:** Executive Dashboard (Statistik Siswa, Guru, Kelas, Grafik Kehadiran & Nilai, Progress Pembelajaran Guru, Monitoring CBT, Tugas, & Laporan Akademik).
4. **Waka Kurikulum:** Validasi materi, Monitoring Perangkat Ajar, Progress Pembelajaran, Jadwal, & Penilaian.
5. **Wali Kelas:** Dashboard Kelas, Kehadiran Siswa, Monitoring Nilai & Progress Belajar, Catatan Siswa, E-Rapor & Cetak Laporan.
6. **Guru:** Dashboard Mengajar, Kelola Materi Pertemuan 1-18 (PDF, Video, PPT, LKPD), Presensi, Forum Diskusi, Tugas, Kuis, CBT Bank Soal, Penilaian (Remedial & Pengayaan), Rekap Nilai, & Export Excel.
7. **Siswa:** Dashboard Belajar, Jadwal, Materi Pertemuan 1-18, Video, Forum, Presensi, Tugas, Kuis, CBT, Progress Belajar, Modul Tahfidz, E-Rapor, Perpustakaan Digital, Profil, & Badge Prestasi.

---

## 📚 Struktur Pembelajaran Alur Matakuliah / Pelajaran

```text
LOGIN
 ↓
DASHBOARD (Pengumuman, Jadwal Hari Ini, Mapel, Tugas, CBT, Nilai, Progress, Tahfidz, Perpus, Profil)
 ↓
MATA PELAJARAN (Deskripsi, CP, TP, ATP, Modul Ajar, Kontrak Belajar, Buku Digital)
 ↓
PERTEMUAN 1 s/d 9 (Setiap Pertemuan: Tujuan, PDF, Video, PPT, LKPD, Forum, Presensi, Tugas, Kuis)
 ↓
CBT UTS (Ujian Tengah Semester)
 ↓
PERTEMUAN 10 s/d 18
 ↓
CBT PAS (Ujian Akhir Semester)
 ↓
REKAP NILAI & PROGRESS (Ketuntasan KKM / Remedial)
 ↓
E-RAPOR & SELESAI
```

---

## 🎯 Skala Prioritas Implementasi Bertahap (Roadmap)

### 🔹 TAHAP 1: Core System & Multi-Role Architecture (SELESAI ✅)
- [x] Konfigurasi Tema Lovable sebagai **Default Theme** (OKLCH Semantic Tokens).
- [x] Penguatan sistem Autentikasi Supabase & Security Guarding per role.
- [x] Implementasi 7 Role Switcher / Role Layout: Super Admin, Admin Akademik, Kamad, Waka Kurikulum, Wali Kelas, Guru, dan Siswa.
- [x] Dashboard utama masing-masing role dengan widget statistik eksekutif & peran khusus.

### 🔹 TAHAP 2: Modul Akademik & Struktur Pembelajaran 1–18 (SELESAI ✅)
- [x] Manajemen Master Data (Tahun Ajaran, Semester, Kelas, Rombel, Jadwal, & Mapel).
- [x] Struktur Pertemuan 1 s/d 18 per Mata Pelajaran (CP, TP, ATP, Modul Ajar, Kontrak Belajar).
- [x] Penyelenggaraan Modul Pembelajaran per Pertemuan: Upload PDF, Video, PPT, LKPD, Presensi Digital, dan Forum Diskusi.

### 🔹 TAHAP 3: Assessment & Computer-Based Test (CBT) Engine (Sedang Dikembangkan 🚀)
- [ ] Bank Soal & Manajemen Tipe Soal (Pilihan Ganda, Essay, Isian).
- [ ] Mesin Ujian CBT (Timer real-time, Random Soal & Random Jawaban, Token Ujian, Auto-Submit).
- [ ] Analisis Butir Soal, KKM, serta Sistem Remedial & Pengayaan otomatis.

### 🔹 TAHAP 4: Modul Keagamaan Tahfidz & E-Rapor (Akan Datang ⏳)
- [ ] Modul Tahfidz Al-Qur'an (Target Hafalan, Progress Setoran Ayat, & Murojaah).
- [ ] Sistem Penilaian & E-Rapor Madrasah (Perhitungan Bobot Tugas + CBT + Kehadiran).
- [ ] Cetak & Export Laporan Hasil Belajar (PDF & Excel).

### 🔹 TAHAP 5: Digital Library & Gamifikasi (Akan Datang ⏳)
- [ ] Perpustakaan Digital (E-book, Buku Digital Madrasah, Bookmark, & Riwayat Membaca).
- [ ] Sistem Gamifikasi (Badge Prestasi, Achievement, Progress Bar Ketuntasan).

### 🔹 TAHAP 6: Executive Dashboard & Early Warning System (Akan Datang ⏳)
- [ ] Executive Dashboard Monitoring Kepala Madrasah & Waka Kurikulum.
- [ ] Early Warning System (Peringatan otomatis untuk siswa di bawah KKM & kehadiran rendah).
- [ ] Audit Trail Log Aktivitas & Backup/Restore Data.

---

## 🧪 Rencana Verifikasi & Pengujian

1. **Uji Peran & Keamanan Rute:**
   Memastikan login sebagai Siswa, Guru, Wali Kelas, Kamad, atau Admin mengarahkan ke antarmuka dan hak akses yang sesuai tanpa *security leak*.
2. **Uji Alur Pembelajaran 1–18:**
   Memastikan berkas PDF, Video, PPT, LKPD, dan Presensi pada tiap pertemuan 1–18 dapat diakses dan diisi dengan sempurna.
3. **Uji CBT & Auto-Grading:**
   Pengujian ujian CBT online (Timer, Random Soal, Token, & Auto Submit) dengan *confetti feedback* dan kalkulasi nilai presisi.
4. **Uji Build & Performa:**
   Memastikan kompilasi `npx vite build` 100% bebas dari error dan berjalan lancar di server lokal/production.
