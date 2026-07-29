# 📋 Spesifikasi Teknis & Panduan Implementasi: Modul Penilaian & CBT Engine
**LMS & SIAKAD Integrated MTs Negeri 2 Cilacap**
*Versi Dokumentasi: 1.1.0 | Standar: Penilaian & CBT Mandiri*

---

## 📌 1. Pendahuluan & Tujuan Modul

Modul **Penilaian & Computer-Based Test (CBT)** merupakan salah satu komponen inti (*core module*) dalam LMS MTs Negeri 2 Cilacap yang menghubungkan proses evaluasi pembelajaran, bank soal interaktif, pelaksanaan ujian *real-time* berbasis komputer, penilaian otomatis (*auto-grading*), analisis ketuntasan KKM (75), serta program remedial dan pengayaan 1-click. Sistem ini difokuskan penuh pada mesin evaluasi & CBT tanpa membutuhkan modul E-Rapor.

---

## 🎯 2. Fitur Utama Modul Penilaian & CBT

### A. Bank Soal & Manajemen Tipe Soal
- **Multi-Tipe Soal:** Support Pilihan Ganda (opsi A-D), Essay / Uraian, dan Isian Singkat.
- **Bobot Skor Custom:** Pengaturan poin/skor per butir soal.
- **Tingkat Kesulitan:** Klasifikasi soal (Mudah, Sedang, Sukar).
- **Import / Export Template Excel:** Memudahkan guru mengunggah puluhan soal sekaligus via file Excel.

### B. Mesin Pelaksanaan Ujian (CBT Exam Player Engine)
- **Verifikasi Token Sesi Ujian:** Siswa wajib memasukkan token resmi (contoh: `MTS2-MAT`) yang diterbitkan oleh proktor/guru.
- **Timer Countdown Real-Time:** Timer hitung mundur otomatis dengan peringatan visual saat sisa 5 menit.
- **Acak Soal & Acak Opsi Jawaban:** Menghindari pola kecurangan antarsiswa.
- **Navigasi Grid Soal Interaktif:** Indikator warna status soal:
  - 🟩 **Hijau:** Terjawab
  - 🟨 **Kuning:** Ragu-Ragu
  - ⬜ **Abu-abu:** Belum Terjawab
- **Sistem Keamanan Anti-Kecurangan (Anti-Cheating Security):**
  - Deteksi perpindahan tab browser (`visibilitychange` / `window blur`). Jika berpindah tab 3 kali, sistem otomatis **mengunci ujian dan menguji-submit jawaban secara otomatis**.
  - Disable Klik Kanan (Context Menu), Copy-Paste, dan shortcut Print Screen.
- **Auto-Save Jawaban Local & Remote:** Mencegah hilangnya jawaban jika koneksi internet terputus atau mati listrik.

### C. Penilaian, Auto-Grading & Analisis KKM (75)
- **Auto-Grading Soal Pilihan Ganda:** Skor PG dihitung otomatis secara *instant* setelah ujian disubmit.
- **Antarmuka Koreksi Essay:** Modul khusus bagi guru untuk memberikan nilai pada soal essay/uraian.
- **Analisis Ketuntasan KKM Otomatis:**
  - Standard KKM Madrasah = **75**.
  - Auto-segmentasi siswa: **Tuntas (≥ 75)** vs **Remedial (< 75)**.
- **Fitur Tindak Lanjut 1-Click:**
  - ⚡ **Kirim Ujian/Tugas Remedial:** Mengirimkan sesi perbaikan untuk siswa di bawah KKM.
  - 🌟 **Kirim Pengayaan:** Memberikan tugas/materi tantangan bagi siswa yang telah lulus KKM.

---

## 🗄️ 3. Skema Database MySQL / Supabase (`db_lms.sql`)

```sql
-- 1. Tabel Sesi Ujian CBT
CREATE TABLE IF NOT EXISTS `cbt_exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `subject_name` VARCHAR(191) NOT NULL,
  `class_name` VARCHAR(64) NOT NULL DEFAULT 'VIII A',
  `token` VARCHAR(32) NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `passing_score` INT NOT NULL DEFAULT 75,
  `randomize_questions` TINYINT(1) DEFAULT 1,
  `randomize_options` TINYINT(1) DEFAULT 1,
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `status` ENUM('Draft', 'Terjadwal', 'Dibuka', 'Selesai') DEFAULT 'Dibuka',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabel Bank Soal CBT
CREATE TABLE IF NOT EXISTS `cbt_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `question_type` ENUM('pg', 'essay', 'isian') DEFAULT 'pg',
  `question_text` TEXT NOT NULL,
  `option_a` TEXT DEFAULT NULL,
  `option_b` TEXT DEFAULT NULL,
  `option_c` TEXT DEFAULT NULL,
  `option_d` TEXT DEFAULT NULL,
  `correct_option` CHAR(1) DEFAULT 'A',
  `points` INT NOT NULL DEFAULT 5,
  `difficulty` ENUM('Mudah', 'Sedang', 'Sukar') DEFAULT 'Sedang',
  FOREIGN KEY (`exam_id`) REFERENCES `cbt_exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabel Sesi Ujian Siswa (Student Exam Attempts)
CREATE TABLE IF NOT EXISTS `cbt_student_exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `student_name` VARCHAR(191) NOT NULL,
  `start_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `end_time` DATETIME DEFAULT NULL,
  `score_pg` INT DEFAULT 0,
  `score_essay` INT DEFAULT 0,
  `total_score` INT DEFAULT 0,
  `violation_count` INT DEFAULT 0,
  `status` ENUM('Sedang Mengerjakan', 'Selesai', 'Dikunci System') DEFAULT 'Sedang Mengerjakan',
  `is_passed` TINYINT(1) DEFAULT 0,
  FOREIGN KEY (`exam_id`) REFERENCES `cbt_exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabel Jawaban Siswa
CREATE TABLE IF NOT EXISTS `cbt_student_answers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_exam_id` INT NOT NULL,
  `question_id` INT NOT NULL,
  `answer_given` TEXT DEFAULT NULL,
  `is_ragu` TINYINT(1) DEFAULT 0,
  `is_correct` TINYINT(1) DEFAULT NULL,
  `points_awarded` INT DEFAULT 0,
  FOREIGN KEY (`student_exam_id`) REFERENCES `cbt_student_exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `cbt_questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 👥 4. Matriks Akses Multi-Role (RBAC)

| Peran (Role) | Hak Akses & Fitur di Modul Penilaian & CBT |
| :--- | :--- |
| **Siswa** | - Memasukkan Token Ujian<br>- Mengerjakan Ujian CBT (Timer, Grid, Flag Ragu)<br>- Melihat Hasil Nilai & Status KKM (Tuntas / Remedial) |
| **Guru Pengampu** | - Kelola Sesi Ujian (Buat, Edit, Buka, Tutup Sesi & Reset Token)<br>- Kelola Bank Soal (PG & Essay, Import Excel)<br>- Koreksi Manual Nilai Essay<br>- Mengirim Ujian Remedial & Pengayaan |
| **Wali Kelas** | - Monitoring Nilai CBT Rombel binaan<br>- Evaluasi Ketuntasan KKM Kelas |
| **Waka Kurikulum** | - Validasi Kualitas Bank Soal & Distribusi Bobot<br>- Live Monitoring Pelaksanaan CBT Seluruh Kelas<br>- Audit Log Nilai Akademik |
| **Kepala Madrasah** | - Executive Monitoring Dashboard CBT Live<br>- Rekap Statistik Kelulusan & Nilai Rata-rata per Mapel |
| **Super Admin / Admin Akademik**| - Reset Sesi Siswa (jika terjadi kendala teknis/pemadaman listrik)<br>- Backup & Restore Data Ujian (.SQL & Excel) |

---

## 🚀 5. Struktur Komponen Modular

- `CBTLiveSession.tsx` (Daftar & Pelaksanaan Ujian Siswa / Proktor)
- `CBTQuestionBank.tsx` (Manajemen Bank Soal & Modal Import Template Excel)
- `CBTGradeAnalysis.tsx` (Analisis KKM 75, Remedial & Pengayaan 1-Click)
- `CBTExamPlayerModal.tsx` (Fullscreen Player Ujian + Anti-Cheat Tab-Switch 3x)
- `CBTModule.tsx` (Main Wrapper Sub-Tabs Penilaian & CBT)
