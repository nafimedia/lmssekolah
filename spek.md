# Spesifikasi Teknis System LMS MTs Negeri 2 Cilacap

Dokumen ini memuat spesifikasi lengkap arsitektur teknis, teknologi, matriks peran (RBAC), modul utama, dan infrastruktur dari **Learning Management System (LMS) MTs Negeri 2 Cilacap**.

---

## 📌 Identitas Sistem & Teknologi Utama

- **Nama Sistem:** Learning Management System (LMS) & SIAKAD Integrated MTs Negeri 2 Cilacap
- **Versi Sistem:** v2.5.0-Production (Kurikulum Merdeka Kemenag Edition)
- **Arsitektur Rute:** Single-Page Route / Unified Dashboard Route (`/dashboard`) dengan **Shadcn UI Sidebar**.
- **Desain Theme System:** **Lovable Native Theme System** (OKLCH Color Space dengan Semantic Tokens: Hijau Tosca Madrasah + Aksen Emas di Light Mode & Indigo Slate di Dark Mode).

### 🛠️ Tech Stack & Library
| Komponen | Teknologi / Library | Keterangan |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18.x + TypeScript | SPA & SSR Reactive Architecture |
| **Build Engine** | Vite v6.4 / Nitro v2.10 | Blazing-fast HMR & Nitro SSR Bundle |
| **Routing System** | TanStack Router v1.x | File-based type-safe routing |
| **Styling & Design** | Tailwind CSS + Lucide Icons | Responsive Glassmorphism & Modern UI |
| **UI Components** | Shadcn UI + Radix UI Primitives | Accessible Accessible Component Library |
| **Authentication & DB**| Supabase Cloud Auth + Local Demo Session | Fail-safe dual authentication engine |
| **Notification System**| Sonner Toast Manager | Real-time feedback notification |

---

## 👥 Arsitektur Peran Pengguna (7 Roles RBAC Matrix)

Sistem membatasi hak akses dan tampilan sidebar secara ketat (*strict scope isolation*) untuk 7 peran pengguna:

1. **Super Administrator (`admin`)**:
   - Pengaturan sistem utama, Manajemen pengguna & perizinan role, Audit Log Aktivitas, Backup & Restore Database, Monitoring Server, Pengaturan Tahun Ajaran & Semester.
2. **Administrator Akademik (`admin_akademik`)**:
   - Pengelolaan data Guru, Siswa, Tingkat Kelas, Rombel, Master Mapel, Master Jadwal, Pengumuman Resmi, Perpustakaan Digital, dan Import/Export Data Excel.
3. **Kepala Madrasah (`kamad`)**:
   - Executive Dashboard Monitoring (Statistik 948 Siswa, Grafik Kehadiran 96.8%, Progress Pembelajaran Guru, Monitoring CBT, Catatan Akademik, & Pengesahan E-Rapor).
4. **Waka Kurikulum (`waka`)**:
   - Validasi Perangkat Ajar (CP, TP, ATP, Modul Ajar), Monitoring Alur Pertemuan 1–18, Matriks Pengampu Mapel, Monitoring Jadwal & Penilaian.
5. **Wali Kelas (`walikelas`)**:
   - Dashboard Khusus Rombel (contoh: Rombel VIII A), Rekap Presensi Siswa, Catatan Wali Kelas, Evaluasi KKM, Pengesahan E-Rapor & Cetak PDF Rapor Official.
6. **Guru Pengampu (`guru`)**:
   - Ruang Mengajar Terisolasi: Mengelola Pertemuan 1–18 (PDF, Video, PPT, LKPD), Presensi Digital, Forum Diskusi, Tugas, Kuis, Bank Soal CBT, Auto-grading Remedial & Pengayaan.
7. **Siswa (`siswa`)**:
   - Ruang Belajar Terisolasi: Mengakses Pertemuan 1–18, Video Tutorial, LKPD, Presensi One-Click, Forum Diskusi, CBT Ujian Online (Timer & Token), Modul Tahfidz Al-Qur'an, E-Rapor, & E-Library.

---

## 📚 Alur Pembelajaran 1–18 (Meeting Structure Flow)

Setiap Mata Pelajaran tersusun sistematis dalam 18 Pertemuan:

```text
[ LOGIN 7 ROLES ]
      │
      ▼
[ DASHBOARD UTAMA BERDASARKAN ROLE ]
      │
      ▼
[ MATA PELAJARAN (CP, TP, ATP, Modul Ajar, Kontrak Belajar) ]
      │
      ├─► PERTEMUAN 1 - 8 (Tujuan, PDF, Video, PPT, LKPD, Presensi, Forum, Tugas, Kuis)
      │
      ├─► PERTEMUAN 9: EVALUASI CBT UTS (Ujian Tengah Semester)
      │
      ├─► PERTEMUAN 10 - 17 (Pembelajaran Lanjutan & Praktikum LKPD)
      │
      ├─► PERTEMUAN 18: EVALUASI CBT PAS (Ujian Akhir Semester)
      │
      ▼
[ REKAP NILAI, REMEDIAL / PENGAYAAN KKM (75) ]
      │
      ▼
[ E-RAPOR MADRASAH & CETAK PDF / EXPORT EXCEL ]
```

---

## ⚡ Spesifikasi Modul Utama System

### 1. SIAKAD Academic Master Data & Workflow Engine
- **Tahun Ajaran & Periode:** Aktif 1 TA (misal 2026/2027 Ganjil), TA sebelumnya tersimpan sebagai Arsip.
- **Katalog Mapel Persisten:** Mapel dibuat 1x saja dan berlaku secara permanen lintas tahun ajaran.
- **Hierarki Data:** `Tingkat Kelas (Kelas VII, VIII, IX) ➔ Rombel (VII A, VII B, VIII A, dst) ➔ Jadwal Pelajaran Rombel`.
- **Matriks Pengampu Mapel:** Kombinasi `Guru + Mapel + Rombel`.
- **SIAKAD 4-Step Wizard:** Otomatisasi Kenaikan Kelas Massal, Re-assign Wali Kelas, & Re-assign Pengampu untuk Pergantian Tahun Ajaran Baru.

### 2. Assessment & Computer-Based Test (CBT) Engine
- **Bank Soal & Tipe Soal:** Pilihan Ganda (A-E), Essay Uraian, & Isian Singkat dengan Bobot Skor.
- **Full Exam Player Engine:**
  - Security Verification Token Sesi Ujian (misal `MTS2-MAT`).
  - Live Timer Countdown Real-Time (`58:42`).
  - Acak Soal & Acak Opsi Jawaban per Siswa.
  - Penanda Checkbox Ragu-Ragu (`🟨`).
  - Navigasi Grid Soal 1–20 (Hijau = Terjawab, Kuning = Ragu, Abu-abu = Belum).
  - Auto-Submit & Auto-Grading Skor PG.
- **Analisis KKM (75) & Remedial:** Sistem otomatis memisahkan siswa Lulus KKM vs Remedial dengan tombol `⚡ Kirim Remedial` & `🌟 Pengayaan`.

### 3. Modul Keagamaan Tahfidz Al-Qur'an
- **Target Hafalan:** Filter `Juz 30 (Juz 'Amma)`, `Juz 29 (Juz Tabarak)`, dan `Juz 1 (Al-Baqarah)`.
- **Form Modal Setoran Hafalan:** Input Surah, Ayat, Status (*Mutqin, Lancar, Murojaah*), Nilai Tajwid (*98 Mumtaz*), & Penguji.
- **Cetak Kartu Murojaah PDF Digital.**

### 4. E-Rapor Madrasah Kurikulum Merdeka Kemenag
- **Formulasi Bobot Nilai:** Presensi 10% + Tugas 30% + UTS 30% + PAS 30%.
- **Preview & Cetak PDF Official Kemenag:** Kop Resmi Kemenag MTsN 2 Cilacap, Nilai Akademik, Nilai Sikap, Ekstrakurikuler, Tahfidz, & Tanda Tangan Digital.
- **Export Excel Rekap Nilai Rapor Rombel.**

### 5. Digital Library & Gamifikasi (E-Resources)
- **E-Library:** Filter PDF Modul, Video Tutorial, Audio Murottal, Interaktif, & E-Book dengan Modal Unggah Berkas.
- **Gamifikasi:** Progress Ketuntasan Pembelajaran & Badge Prestasi.

### 6. Executive Dashboard, Audit Log & Early Warning System (EWS)
- **Early Warning System (EWS):** Peringatan otomatis ambulan untuk siswa di bawah KKM (< 75) & Kehadiran rendah (< 80%).
- **Health Server Monitoring:** CPU, RAM, SSD, & Supabase Status.
- **Audit Trail Log:** Rekap aktivitas real-time per user.
- **Backup & Restore DB:** Tombol `💾 Backup Database System (.SQL)` & Restore.

---

## 🖥️ Spesifikasi Server & Infrastruktur Deployment

| Parameter | Spesifikasi Direkomendasikan | Minimum Spesifikasi |
| :--- | :--- | :--- |
| **OS Server** | Ubuntu 22.04 LTS / Debian 12 | Ubuntu 20.04 LTS |
| **Node.js Environment** | Node.js v22.x LTS / v24.x (Terbaru & Tercepat) | Node.js v18.x / v20.x LTS |
| **Control Panel** | aaPanel (Versi Terbaru) | aaPanel / PM2 CLI |
| **Web Server / Proxy** | Nginx 1.24 (Reverse Proxy `127.0.0.1:3000`)| Nginx 1.22 |
| **SSL Certificate** | Let's Encrypt Free SSL (Force HTTPS) | Custom SSL |
| **Process Manager** | PM2 Manager | Node process / Systemd |
