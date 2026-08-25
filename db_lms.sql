-- ============================================================
-- DATABASE SCHEMA & INITIAL DATA: db_lms (MTsN 2 Cilacap)
-- Laragon / MySQL Environment
-- ============================================================

CREATE DATABASE IF NOT EXISTS `db_lms` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_lms`;

-- 1. Tabel Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `identity_type` VARCHAR(16) NOT NULL DEFAULT 'NISN',
  `nis_nip` VARCHAR(64) DEFAULT NULL,
  `class_name` VARCHAR(64) DEFAULT NULL,
  `subject_specialty` VARCHAR(191) DEFAULT NULL,
  `role` VARCHAR(32) NOT NULL DEFAULT 'siswa',
  `avatar_url` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel User Roles
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `role` VARCHAR(32) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Profiles
CREATE TABLE IF NOT EXISTS `profiles` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL UNIQUE,
  `full_name` VARCHAR(191) NOT NULL,
  `nis` VARCHAR(64) DEFAULT NULL,
  `class_name` VARCHAR(64) DEFAULT NULL,
  `tagline` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Subjects (Mata Pelajaran)
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'Keagamaan',
  `teacher_name` VARCHAR(191) NOT NULL,
  `grade_level` VARCHAR(32) NOT NULL DEFAULT 'Kelas 8',
  `jp` INT NOT NULL DEFAULT 2,
  `kkm` INT NOT NULL DEFAULT 75,
  `status` VARCHAR(32) NOT NULL DEFAULT 'Aktif',
  `icon` VARCHAR(16) DEFAULT '📖',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Meetings (Alur Pertemuan 1-18)
CREATE TABLE IF NOT EXISTS `meetings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `meeting_number` INT NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `pdf_url` TEXT DEFAULT NULL,
  `video_url` TEXT DEFAULT NULL,
  `ppt_url` TEXT DEFAULT NULL,
  `lkpd_url` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel CBT Exams (Ujian Online)
CREATE TABLE IF NOT EXISTS `cbt_exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `subject_name` VARCHAR(191) NOT NULL,
  `token` VARCHAR(32) NOT NULL,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `passing_score` INT NOT NULL DEFAULT 75,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel CBT Questions
CREATE TABLE IF NOT EXISTS `cbt_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `question_text` TEXT NOT NULL,
  `option_a` TEXT NOT NULL,
  `option_b` TEXT NOT NULL,
  `option_c` TEXT NOT NULL,
  `option_d` TEXT NOT NULL,
  `correct_option` CHAR(1) NOT NULL DEFAULT 'A',
  `points` INT NOT NULL DEFAULT 5,
  FOREIGN KEY (`exam_id`) REFERENCES `cbt_exams`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Tabel Tahfidz Records
CREATE TABLE IF NOT EXISTS `tahfidz_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `student_name` VARCHAR(191) NOT NULL,
  `juz_number` INT NOT NULL DEFAULT 30,
  `surah_name` VARCHAR(191) NOT NULL,
  `verses` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'Mutqin',
  `tajwid_score` INT NOT NULL DEFAULT 95,
  `tester_name` VARCHAR(191) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Tabel E-Rapor Records
CREATE TABLE IF NOT EXISTS `rapor_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `student_name` VARCHAR(191) NOT NULL,
  `subject_name` VARCHAR(191) NOT NULL,
  `presensi_score` INT NOT NULL DEFAULT 95,
  `tugas_score` INT NOT NULL DEFAULT 88,
  `uts_score` INT NOT NULL DEFAULT 85,
  `pas_score` INT NOT NULL DEFAULT 87,
  `final_score` INT NOT NULL DEFAULT 87,
  `predicate` VARCHAR(4) NOT NULL DEFAULT 'A',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Tabel Announcements (Pengumuman)
CREATE TABLE IF NOT EXISTS `announcements` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `content` TEXT NOT NULL,
  `tag` VARCHAR(64) NOT NULL DEFAULT 'Pengumuman Resmi',
  `date_str` VARCHAR(64) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Tabel Agendas (Agenda & Kalender Akademik)
CREATE TABLE IF NOT EXISTS `agendas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(191) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(64) NOT NULL DEFAULT 'Akademik',
  `date_str` VARCHAR(64) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Tabel Attendances (Presensi Siswa)
CREATE TABLE IF NOT EXISTS `attendances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `student_name` VARCHAR(191) NOT NULL,
  `class_name` VARCHAR(64) NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'HADIR',
  `keterangan` TEXT DEFAULT NULL,
  `date_str` VARCHAR(32) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Tabel Student Awards (Badge & Warning Pembinaan)
CREATE TABLE IF NOT EXISTS `student_awards` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_name` VARCHAR(191) NOT NULL,
  `badge_category` VARCHAR(128) DEFAULT NULL,
  `warning_category` VARCHAR(128) DEFAULT NULL,
  `comment_text` TEXT DEFAULT NULL,
  `awarded_by` VARCHAR(191) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Tabel WA Gateway Logs
CREATE TABLE IF NOT EXISTS `wa_gateway_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_name` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(32) NOT NULL,
  `student_name` VARCHAR(191) NOT NULL,
  `category` VARCHAR(64) NOT NULL,
  `message` TEXT NOT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'GATEWAY SENT 🟢',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Tabel Audit Logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(64) DEFAULT NULL,
  `user_name` VARCHAR(191) DEFAULT NULL,
  `action` VARCHAR(191) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED INITIAL DATA (7 AKUN ROLE UTAMA)
-- Password hash untuk 'asd123' / 'AdminMTsN2Cilacap2026!'
-- ============================================================

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `nis_nip`, `class_name`, `role`) VALUES
('usr-admin-1', 'admin@mail.com', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'Super Administrator MTsN 2', '198501012010011001', NULL, 'admin'),
('usr-kamad-1', 'kamad@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'Drs. H. Hidayatullah, M.Ag', '197203151998031002', NULL, 'kamad'),
('usr-waka-1', 'waka@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'Dra. Hj. Maryam, M.Pd', '197508202002122001', NULL, 'waka'),
('usr-walikelas-1', 'walikelas@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'Bpk. Hendra Wijaya, M.Sc', '198211102009041003', 'VIII A', 'walikelas'),
('usr-guru-1', 'guru@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'Dra. Hj. Siti Rahmah, M.Pd', '198005122006042005', 'VIII A', 'guru'),
('usr-siswa-1', 'siswa@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'ALIYA QIARA ABDULLAH', '0127790481', 'VIII-A', 'siswa')
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`);

INSERT INTO `user_roles` (`user_id`, `role`) VALUES
('usr-admin-1', 'admin'),
('usr-kamad-1', 'kamad'),
('usr-waka-1', 'waka'),
('usr-walikelas-1', 'walikelas'),
('usr-guru-1', 'guru'),
('usr-siswa-1', 'siswa')
ON DUPLICATE KEY UPDATE `role` = VALUES(`role`);

-- Seed Initial Subjects
INSERT INTO `subjects` (`id`, `code`, `name`, `category`, `teacher_name`, `grade_level`, `jp`, `kkm`, `status`, `icon`) VALUES
(1, 'AGM-01', 'Al-Quran Hadits', 'Keagamaan', 'Dra. Hj. Siti Rahmah, M.Pd', 'Kelas 8', 2, 75, 'Aktif', '📖'),
(2, 'AGM-02', 'Akidah Akhlak', 'Keagamaan', 'Ust. Abdul Halim, S.Ag', 'Kelas 8', 2, 75, 'Aktif', '🕌'),
(3, 'AGM-03', 'Fiqih', 'Keagamaan', 'Dra. Hj. Siti Rahmah, M.Pd', 'Kelas 8', 2, 75, 'Aktif', '⚖️'),
(4, 'AGM-04', 'Sejarah Kebudayaan Islam', 'Keagamaan', 'Drs. KH. Mahmud Ridwan', 'Kelas 8', 2, 75, 'Aktif', '🏛️'),
(5, 'AGM-05', 'Bahasa Arab', 'Keagamaan', 'Ustadzah Nurul Hidayah, S.Pd.I', 'Kelas 8', 3, 75, 'Aktif', '🗣️'),
(6, 'UMM-01', 'Matematika', 'Umum', 'Bapak Hendra Wijaya, M.Sc', 'Kelas 8', 4, 75, 'Aktif', '📐'),
(7, 'UMM-02', 'Ilmu Pengetahuan Alam', 'Umum', 'Ibu Ratna Dewi, M.Pd', 'Kelas 8', 4, 75, 'Aktif', '🔬'),
(8, 'UMM-06', 'Informatika & Coding', 'Umum', 'H. Ahmad Syukri, S.Kom', 'Kelas 8', 2, 75, 'Aktif', '💻')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Initial Tahfidz Record
INSERT INTO `tahfidz_records` (`id`, `user_id`, `student_name`, `juz_number`, `surah_name`, `verses`, `status`, `tajwid_score`, `tester_name`) VALUES
(1, 'usr-siswa-1', 'Muhammad Fairuz Maulana', 30, 'An-Naba\'', '1 - 40', 'Mutqin', 98, 'Ustadz Ahmad Syukri, S.Pd.I')
ON DUPLICATE KEY UPDATE `student_name` = VALUES(`student_name`);

-- Seed Initial Announcements
INSERT INTO `announcements` (`id`, `title`, `content`, `tag`, `date_str`) VALUES
(1, 'Pelaksanaan Asesmen Sumatif Akhir Semester (ASAS) TA 2026/2027', 'Diberitahukan kepada seluruh siswa-siswi MTsN 2 Cilacap bahwa pelaksanaan ASAS berbasis CBT akan dimulai pada hari Senin mendatang. Harap persiapkan kartu ujian dan perangkat masing-masing.', 'Pengumuman Resmi', '29 Juli 2026')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);

-- Seed Initial Agendas
INSERT INTO `agendas` (`id`, `title`, `description`, `category`, `date_str`) VALUES
(1, 'Rapat Koordinasi Evaluasi Pembelajaran & E-Rapor', 'Rapat pleno dewan guru bersama Waka Kurikulum mengenai persiapan penerbitan E-Rapor digital.', 'Akademik', '30 Juli 2026')
ON DUPLICATE KEY UPDATE `title` = VALUES(`title`);
