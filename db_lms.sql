-- LMS MTsN 2 Cilacap Dump
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `agendas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `category` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Akademik',
  `date_str` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `announcements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tag` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pengumuman Resmi',
  `date_str` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO announcements (id, title, content, tag, date_str, created_at) VALUES (1, 'Libur Maulid Nabi', 'Sekolah diliburkan Senin, 27 Juli 2026.', 'Pengumuman', '27/07/2026', '2026-08-23 15:07:26');

CREATE TABLE `assignment_submissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `assignment_id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `rombel` varchar(50) NOT NULL,
  `file_url` text,
  `notes` text,
  `score` int DEFAULT '0',
  `feedback` text,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `attendances` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_name` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'HADIR',
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `date_str` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=174 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (1, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:41:58');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (2, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:41:58');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (3, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:41:58');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (4, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:41:58');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (5, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:00');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (6, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:00');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (7, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:00');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (8, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:00');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (9, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:01');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (10, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:01');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (11, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:01');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (12, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:01');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (13, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:06');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (14, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:06');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (15, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:06');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (16, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:06');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (17, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (18, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (19, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (20, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (21, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (22, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (23, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (24, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (25, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (26, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (27, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (28, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (29, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (30, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (31, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (32, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:07');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (33, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (34, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (35, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (36, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (37, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (38, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (39, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (40, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:09');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (41, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (42, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (43, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (44, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (45, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (46, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (47, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (48, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:14');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (49, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (50, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (51, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (52, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (53, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (54, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (55, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (56, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (57, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (58, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (59, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (60, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (61, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (62, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (63, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (64, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:15');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (65, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'alpa', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:19');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (66, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:19');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (67, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:19');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (68, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:19');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (69, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'alpa', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (70, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (71, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (72, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (73, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'alpa', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (74, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (75, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (76, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:20');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (77, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'alpa', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:21');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (78, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:21');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (79, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:21');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (80, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:21');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (81, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'alpa', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:24');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (82, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:24');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (83, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:24');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (84, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:24');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (85, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'alpa', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:26');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (86, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:26');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (87, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:26');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (88, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:26');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (89, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'alpa', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:34');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (90, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:34');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (91, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:34');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (92, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:34');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (93, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:41');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (94, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:41');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (95, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:41');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (96, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:42:41');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (97, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:02');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (98, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:02');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (99, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:02');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (100, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:02');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (101, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:03');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (102, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:03');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (103, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:03');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (104, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:03');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (105, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:04');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (106, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:04');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (107, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:04');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (108, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:04');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (109, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (110, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (111, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (112, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (113, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (114, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (115, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (116, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (117, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (118, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (119, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (120, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:05');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (121, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:27');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (122, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:27');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (123, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:27');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (124, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:27');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (125, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (126, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (127, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (128, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (129, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (130, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (131, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (132, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (133, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (134, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (135, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (136, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:29');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (137, 's1', 'Ahmad Fauzi', 'Rombel 8A', 'sakit', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:36');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (138, 's2', 'Fatimah Az-Zahra', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:36');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (139, 's3', 'Muhammad Rizky', 'Rombel 8A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:36');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (140, 's4', 'Siti Nurhaliza', 'Rombel 8A', 'izin', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-19', '2026-08-19 19:43:36');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (141, 'usr-siswa-58', 'AHMAD SABIHIS', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (142, 'usr-siswa-55', 'ABIGAIL HASAN YUSUF PUTRA INDONESIA', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (143, 'usr-siswa-59', 'ALIKA SYAFA AZAHRA', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (144, 'usr-siswa-56', 'ABIMAIL HUSEN IBRAHIM PUTRA INDONESIA', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (145, 'usr-siswa-60', 'ANNISA NUR RIFA', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (146, 'usr-siswa-57', 'AHMAD NIZAM NUR FAIZIN', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (147, 'usr-siswa-61', 'AZKA APRILIA HARTONO', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (148, 'usr-siswa-62', 'CALLISTA RIZKIA PUTRI', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (149, 'usr-siswa-63', 'DURROTUN NAFISAH', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (150, 'usr-siswa-64', 'EFAN FERDIAN', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (151, 'usr-siswa-65', 'FARIQ ATHARIZZ MANAF', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (152, 'usr-siswa-66', 'GIGIH TRIDA PANGESTU', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (153, 'usr-siswa-67', 'IHSAN NUR FAIZI', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (154, 'usr-siswa-68', 'JUAN MIRZA ZAFRAN RAQILLA', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (155, 'usr-siswa-69', 'KENT FARRAS TIVADAR', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (156, 'usr-siswa-70', 'KHAIRUL NIZAM', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (157, 'usr-siswa-71', 'MUHAMMAD FAWWAS HABIBIE', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (158, 'usr-siswa-72', 'MUHAMMAD LIWA ULHAQ ALFARABI', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (159, 'usr-siswa-73', 'MUHAMMAD RIZKY RAMADHAN', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (160, 'usr-siswa-74', 'NABHAN RADINKA KEVAN PRASETYO', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (161, 'usr-siswa-75', 'NASYABEL JAUZA ASHILA', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (162, 'usr-siswa-76', 'NAURA NAZWA NUR AFIFAH', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (163, 'usr-siswa-77', 'NAZWA DELA AZZAHRA', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (164, 'usr-siswa-78', 'PRANANDA THERY HALANSYAH', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (165, 'usr-siswa-79', 'RANIS ANUGRAH RAMADHAN', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (166, 'usr-siswa-80', 'RIZKY NUR RASYDAN', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (167, 'usr-siswa-81', 'RIZQI GALIH ARROFAH', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (168, 'usr-siswa-82', 'SATRIYO LINSO WICAKSONO', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (169, 'usr-siswa-83', 'SEPTIAR DWI MUHNANDAR', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (170, 'usr-siswa-84', 'VIANDRA AISYAH SALSABILA KURNIAWAN', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (171, 'usr-siswa-85', 'VITA ANGGRAENI', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (172, 'usr-siswa-86', 'WAKHIDATUS SOLIKHAH', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');
INSERT INTO attendances (id, user_id, student_name, class_name, status, keterangan, date_str, created_at) VALUES (173, 'usr-siswa-87', 'ZAHWA LUNA BAHTIAR', 'Rombel 9A', 'hadir', 'Presensi Harian Pagi oleh Wali Kelas', '2026-08-23', '2026-08-23 22:02:13');

CREATE TABLE `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `details` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cbt_exam_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` varchar(64) NOT NULL,
  `exam_title` varchar(255) DEFAULT NULL,
  `user_id` varchar(64) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `rombel` varchar(50) NOT NULL,
  `score` decimal(5,2) DEFAULT '0.00',
  `total_correct` int DEFAULT '0',
  `total_questions` int DEFAULT '0',
  `status` varchar(50) DEFAULT 'Selesai',
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `cbt_exams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duration_minutes` int NOT NULL DEFAULT '60',
  `passing_score` int NOT NULL DEFAULT '75',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cbt_questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `exam_id` int NOT NULL,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_a` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_b` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_c` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `option_d` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `correct_option` char(1) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'A',
  `points` int NOT NULL DEFAULT '5',
  PRIMARY KEY (`id`),
  KEY `exam_id` (`exam_id`),
  CONSTRAINT `cbt_questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `cbt_exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `elibrary_books` (
  `id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `tag` varchar(50) NOT NULL,
  `size` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `url` text,
  `video_url` text,
  `audio_url` text,
  `description` text,
  `provider` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `elibrary_loans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `book_id` varchar(64) NOT NULL,
  `book_title` varchar(255) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `borrower_name` varchar(255) NOT NULL,
  `rombel` varchar(50) NOT NULL,
  `loan_date` varchar(50) NOT NULL,
  `due_date` varchar(50) NOT NULL,
  `return_date` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Dipinjam',
  `fine_amount` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gtk_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) NOT NULL,
  `doc_name` varchar(255) NOT NULL,
  `category` varchar(50) NOT NULL,
  `file_url` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `gtk_leaves` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) NOT NULL,
  `guru_name` varchar(255) NOT NULL,
  `nip_nis` varchar(50) DEFAULT NULL,
  `leave_type` varchar(50) NOT NULL,
  `start_date` varchar(50) NOT NULL,
  `end_date` varchar(50) NOT NULL,
  `reason` text NOT NULL,
  `status` varchar(50) DEFAULT 'Menunggu',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `jadwal_pelajaran` (
  `id` int NOT NULL AUTO_INCREMENT,
  `hari` varchar(50) NOT NULL,
  `jam` varchar(100) NOT NULL,
  `mapel` varchar(255) NOT NULL,
  `tingkat` varchar(100) NOT NULL,
  `rombel` varchar(100) NOT NULL,
  `guru` varchar(255) DEFAULT '',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (1, 'Senin', '07.30 - 08.15', 'Matematika', 'Kelas VII', 'Rombel 7A', 'SRIYANI KUNTARI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (2, 'Senin', '08.15 - 09.00', 'PJOK', 'Kelas VII', 'Rombel 7A', 'NUR ROCHMAN SHODIQ, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (3, 'Senin', '09.15 - 10.00', 'Bahasa Jawa', 'Kelas VII', 'Rombel 7A', 'RINDANG FARIHA IDANA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (4, 'Senin', '10.00 - 10.45', 'IPA', 'Kelas VII', 'Rombel 7A', 'STEFI APRIONITA SETYO ARUM, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (5, 'Senin', '10.45 - 11.30', 'Seni Rupa', 'Kelas VII', 'Rombel 7A', 'ISNAENI HASANAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (6, 'Selasa', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7A', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (7, 'Selasa', '07.45 - 08.30', 'Matematika', 'Kelas VII', 'Rombel 7A', 'SRIYANI KUNTARI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (8, 'Selasa', '08.30 - 09.15', 'Akidah Akhlak', 'Kelas VII', 'Rombel 7A', 'MAHMUDAH, S.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (9, 'Selasa', '09.30 - 10.15', 'Bahasa Indonesia', 'Kelas VII', 'Rombel 7A', 'DAISAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (10, 'Selasa', '10.15 - 11.00', 'Bimbingan Konseling', 'Kelas VII', 'Rombel 7A', 'MAULIDIA NURUL IZATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (11, 'Rabu', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7A', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (12, 'Rabu', '07.45 - 08.30', 'Al Qur''an Hadis', 'Kelas VII', 'Rombel 7A', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (13, 'Rabu', '08.30 - 09.15', 'Bahasa Indonesia', 'Kelas VII', 'Rombel 7A', 'DAISAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (14, 'Rabu', '09.30 - 10.15', 'Teknologi Informasi dan Komunikasi', 'Kelas VII', 'Rombel 7A', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (15, 'Kamis', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7A', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (16, 'Kamis', '07.45 - 08.30', 'Pendidikan Kewarganegaraan', 'Kelas VII', 'Rombel 7A', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (17, 'Kamis', '08.30 - 09.15', 'Bahasa Inggris', 'Kelas VII', 'Rombel 7A', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (18, 'Kamis', '09.30 - 10.15', 'IPS', 'Kelas VII', 'Rombel 7A', 'NAZIHATUN ZUHRIYAH, S.Pd.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (19, 'Jumat', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7A', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (20, 'Jumat', '07.45 - 08.30', 'Bahasa Arab', 'Kelas VII', 'Rombel 7A', 'ENDAH SUPRIHATIN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (21, 'Jumat', '08.30 - 09.15', 'Sejarah Kebudayaan Islam', 'Kelas VII', 'Rombel 7A', 'H. DASIRUN, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (22, 'Sabtu', '07.30 - 08.30', 'Fikih', 'Kelas VII', 'Rombel 7A', 'CARYATI,', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (23, 'Sabtu', '08.30 - 09.30', 'IPA', 'Kelas VII', 'Rombel 7A', 'STEFI APRIONITA SETYO ARUM, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (24, 'Senin', '07.30 - 08.15', 'IPA', 'Kelas VII', 'Rombel 7B', 'STEFI APRIONITA SETYO ARUM, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (25, 'Senin', '08.15 - 09.00', 'Bahasa Indonesia', 'Kelas VII', 'Rombel 7B', 'DAISAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (26, 'Senin', '09.15 - 10.00', 'Matematika', 'Kelas VII', 'Rombel 7B', 'IFTI NURROHMAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (27, 'Senin', '10.00 - 10.45', 'Bahasa Jawa', 'Kelas VII', 'Rombel 7B', 'RINDANG FARIHA IDANA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (28, 'Senin', '10.45 - 11.30', 'Bimbingan Konseling', 'Kelas VII', 'Rombel 7B', 'MAULIDIA NURUL IZATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (29, 'Selasa', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7B', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (30, 'Selasa', '07.45 - 08.30', 'Bahasa Arab', 'Kelas VII', 'Rombel 7B', 'ENDAH SUPRIHATIN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (31, 'Selasa', '08.30 - 09.15', 'Bahasa Inggris', 'Kelas VII', 'Rombel 7B', 'SASI VIVIANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (32, 'Selasa', '09.30 - 10.15', 'Pendidikan Kewarganegaraan', 'Kelas VII', 'Rombel 7B', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (33, 'Rabu', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7B', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (34, 'Rabu', '07.45 - 08.30', 'IPA', 'Kelas VII', 'Rombel 7B', 'STEFI APRIONITA SETYO ARUM, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (35, 'Rabu', '08.30 - 09.15', 'Seni Rupa', 'Kelas VII', 'Rombel 7B', 'ISNAENI HASANAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (36, 'Rabu', '09.30 - 10.15', 'Teknologi Informasi dan Komunikasi', 'Kelas VII', 'Rombel 7B', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (37, 'Rabu', '10.15 - 11.00', 'Sejarah Kebudayaan Islam', 'Kelas VII', 'Rombel 7B', 'H. DASIRUN, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (38, 'Kamis', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7B', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (39, 'Kamis', '07.45 - 08.30', 'Fikih', 'Kelas VII', 'Rombel 7B', 'CARYATI,', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (40, 'Kamis', '08.30 - 09.15', 'Bahasa Indonesia', 'Kelas VII', 'Rombel 7B', 'DAISAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (41, 'Kamis', '09.30 - 10.15', 'Al Qur''an Hadis', 'Kelas VII', 'Rombel 7B', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (42, 'Jumat', '07.00 - 07.45', 'Tahfidz', 'Kelas VII', 'Rombel 7B', 'MISBAH AHMAD DANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (43, 'Jumat', '07.45 - 08.30', 'PJOK', 'Kelas VII', 'Rombel 7B', 'NUR ROCHMAN SHODIQ, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (44, 'Jumat', '08.30 - 09.15', 'Akidah Akhlak', 'Kelas VII', 'Rombel 7B', 'MAHMUDAH, S.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (45, 'Sabtu', '07.30 - 08.30', 'Matematika', 'Kelas VII', 'Rombel 7B', 'IFTI NURROHMAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (46, 'Sabtu', '08.30 - 09.30', 'IPS', 'Kelas VII', 'Rombel 7B', 'NAZIHATUN ZUHRIYAH, S.Pd.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (47, 'Senin', '07.30 - 08.30', 'PJOK', 'Kelas VIII', 'Rombel 8A', 'TEGUH WIYONO, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (48, 'Senin', '08.30 - 09.30', 'Sejarah Kebudayaan Islam', 'Kelas VIII', 'Rombel 8A', 'H. DASIRUN, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (49, 'Senin', '09.45 - 10.45', 'Bahasa Indonesia', 'Kelas VIII', 'Rombel 8A', 'SOBIYATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (50, 'Senin', '10.45 - 11.45', 'Bimbingan Konseling', 'Kelas VIII', 'Rombel 8A', 'ASROR HIDAYAT, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (51, 'Selasa', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (52, 'Selasa', '07.45 - 08.45', 'IPA', 'Kelas VIII', 'Rombel 8A', 'NOVANTYA KARTIKAWATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (53, 'Selasa', '09.00 - 10.00', 'Matematika', 'Kelas VIII', 'Rombel 8A', 'SAYONO, S.Pd., M.Pd.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (54, 'Selasa', '10.00 - 11.00', 'Bahasa Inggris', 'Kelas VIII', 'Rombel 8A', 'RIDHO ANSHORI, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (55, 'Rabu', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (56, 'Rabu', '07.45 - 08.30', 'Bahasa Jawa', 'Kelas VIII', 'Rombel 8A', 'RINDANG FARIHA IDANA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (57, 'Rabu', '08.30 - 09.15', 'IPA', 'Kelas VIII', 'Rombel 8A', 'NOVANTYA KARTIKAWATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (58, 'Rabu', '09.30 - 10.15', 'Fikih', 'Kelas VIII', 'Rombel 8A', 'CARYATI,', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (59, 'Rabu', '10.15 - 11.00', 'Bahasa Arab', 'Kelas VIII', 'Rombel 8A', 'Hj. SITI MUHSINAH, S', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (60, 'Kamis', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (61, 'Kamis', '07.45 - 08.30', 'Matematika', 'Kelas VIII', 'Rombel 8A', 'SAYONO, S.Pd., M.Pd.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (62, 'Kamis', '08.30 - 09.15', 'Seni Rupa', 'Kelas VIII', 'Rombel 8A', 'HASIS SYARIFUDIN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (63, 'Kamis', '09.30 - 10.15', 'Pendidikan Kewarganegaraan', 'Kelas VIII', 'Rombel 8A', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (64, 'Kamis', '10.15 - 11.00', 'Bahasa Indonesia', 'Kelas VIII', 'Rombel 8A', 'SOBIYATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (65, 'Jumat', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (66, 'Jumat', '07.45 - 08.30', 'Al Qur''an Hadis', 'Kelas VIII', 'Rombel 8A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (67, 'Jumat', '08.30 - 09.15', 'IPS', 'Kelas VIII', 'Rombel 8A', 'UMI KHAFSOH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (68, 'Sabtu', '07.30 - 08.30', 'Akidah Akhlak', 'Kelas VIII', 'Rombel 8A', 'WAKHIBUN, S.P', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (69, 'Sabtu', '08.30 - 09.30', 'Teknologi Informasi dan Komunikasi', 'Kelas VIII', 'Rombel 8A', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (70, 'Senin', '07.30 - 08.15', 'Pendidikan Kewarganegaraan', 'Kelas VIII', 'Rombel 8B', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (71, 'Senin', '08.15 - 09.00', 'Bahasa Arab', 'Kelas VIII', 'Rombel 8B', 'Hj. SITI MUHSINAH, S', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (72, 'Senin', '09.15 - 10.00', 'Fikih', 'Kelas VIII', 'Rombel 8B', 'CARYATI,', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (73, 'Senin', '10.00 - 10.45', 'Seni Rupa', 'Kelas VIII', 'Rombel 8B', 'HASIS SYARIFUDIN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (74, 'Senin', '10.45 - 11.30', 'Bahasa Indonesia', 'Kelas VIII', 'Rombel 8B', 'SOBIYATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (75, 'Selasa', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (76, 'Selasa', '07.45 - 08.30', 'Bahasa Jawa', 'Kelas VIII', 'Rombel 8B', 'RINDANG FARIHA IDANA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (77, 'Selasa', '08.30 - 09.15', 'Bahasa Indonesia', 'Kelas VIII', 'Rombel 8B', 'SOBIYATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (78, 'Selasa', '09.30 - 10.15', 'IPS', 'Kelas VIII', 'Rombel 8B', 'UMI KHAFSOH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (79, 'Selasa', '10.15 - 11.00', 'Al Qur''an Hadis', 'Kelas VIII', 'Rombel 8B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (80, 'Rabu', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (81, 'Rabu', '07.45 - 08.30', 'Bahasa Inggris', 'Kelas VIII', 'Rombel 8B', 'CETY MAHARSY, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (82, 'Rabu', '08.30 - 09.15', 'Sejarah Kebudayaan Islam', 'Kelas VIII', 'Rombel 8B', 'H. DASIRUN, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (83, 'Rabu', '09.30 - 10.15', 'Bahasa Indonesia', 'Kelas VIII', 'Rombel 8B', 'SOBIYATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (84, 'Kamis', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (85, 'Kamis', '07.45 - 08.30', 'IPA', 'Kelas VIII', 'Rombel 8B', 'NOVANTYA KARTIKAWATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (86, 'Kamis', '08.30 - 09.15', 'Matematika', 'Kelas VIII', 'Rombel 8B', 'SAYONO, S.Pd., M.Pd.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (87, 'Kamis', '09.30 - 10.15', 'Akidah Akhlak', 'Kelas VIII', 'Rombel 8B', 'WAKHIBUN, S.P', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (88, 'Kamis', '10.15 - 11.00', 'Bimbingan Konseling', 'Kelas VIII', 'Rombel 8B', 'ASROR HIDAYAT, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (89, 'Jumat', '07.00 - 07.45', 'Tahfidz', 'Kelas VIII', 'Rombel 8B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (90, 'Jumat', '07.45 - 08.30', 'Matematika', 'Kelas VIII', 'Rombel 8B', 'SAYONO, S.Pd., M.Pd.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (91, 'Jumat', '08.30 - 09.15', 'Teknologi Informasi dan Komunikasi', 'Kelas VIII', 'Rombel 8B', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (92, 'Sabtu', '07.30 - 08.30', 'IPA', 'Kelas VIII', 'Rombel 8B', 'NOVANTYA KARTIKAWATI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (93, 'Sabtu', '08.30 - 09.30', 'PJOK', 'Kelas VIII', 'Rombel 8B', 'TEGUH WIYONO, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (94, 'Senin', '07.30 - 08.15', 'Bahasa Jawa', 'Kelas IX', 'Rombel 9A', 'RINDANG FARIHA IDANA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (95, 'Senin', '08.15 - 09.00', 'Teknologi Informasi dan Komunikasi', 'Kelas IX', 'Rombel 9A', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (96, 'Senin', '09.15 - 10.00', 'Bahasa Inggris', 'Kelas IX', 'Rombel 9A', 'INDAH NURROHMAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (97, 'Senin', '10.00 - 10.45', 'Sejarah Kebudayaan Islam', 'Kelas IX', 'Rombel 9A', 'H. DASIRUN, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (98, 'Selasa', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (99, 'Selasa', '07.45 - 08.30', 'Matematika', 'Kelas IX', 'Rombel 9A', 'H. ANI YULIANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (100, 'Selasa', '08.30 - 09.15', 'IPA', 'Kelas IX', 'Rombel 9A', 'ILHAM HABIBI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (101, 'Selasa', '09.30 - 10.15', 'Pendidikan Kewarganegaraan', 'Kelas IX', 'Rombel 9A', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (102, 'Selasa', '10.15 - 11.00', 'Bahasa Indonesia', 'Kelas IX', 'Rombel 9A', 'Hj. NANGIMAH, S.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (103, 'Rabu', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (104, 'Rabu', '07.45 - 08.30', 'Bahasa Indonesia', 'Kelas IX', 'Rombel 9A', 'Hj. NANGIMAH, S.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (105, 'Rabu', '08.30 - 09.15', 'Matematika', 'Kelas IX', 'Rombel 9A', 'H. ANI YULIANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (106, 'Rabu', '09.30 - 10.15', 'Seni Rupa', 'Kelas IX', 'Rombel 9A', 'HASIS SYARIFUDIN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (107, 'Rabu', '10.15 - 11.00', 'IPS', 'Kelas IX', 'Rombel 9A', 'ALI MANSUR, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (108, 'Kamis', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (109, 'Kamis', '07.45 - 08.30', 'Al Qur''an Hadis', 'Kelas IX', 'Rombel 9A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (110, 'Kamis', '08.30 - 09.15', 'Bahasa Arab', 'Kelas IX', 'Rombel 9A', 'WAHYUDIN, S', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (111, 'Kamis', '09.30 - 10.15', 'Bimbingan Konseling', 'Kelas IX', 'Rombel 9A', 'SARAH SAFIRA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (112, 'Kamis', '10.15 - 11.00', 'Fikih', 'Kelas IX', 'Rombel 9A', 'MUHTAMAM, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (113, 'Jumat', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9A', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (114, 'Jumat', '07.45 - 08.30', 'Akidah Akhlak', 'Kelas IX', 'Rombel 9A', 'WAKHIBUN, S.P', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (115, 'Jumat', '08.30 - 09.15', 'Matematika', 'Kelas IX', 'Rombel 9A', 'H. ANI YULIANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (116, 'Sabtu', '07.30 - 08.30', 'PJOK', 'Kelas IX', 'Rombel 9A', 'MASRUKHAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (117, 'Sabtu', '08.30 - 09.30', 'IPA', 'Kelas IX', 'Rombel 9A', 'ILHAM HABIBI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (118, 'Senin', '07.30 - 08.15', 'IPA', 'Kelas IX', 'Rombel 9B', 'ILHAM HABIBI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (119, 'Senin', '08.15 - 09.00', 'Bimbingan Konseling', 'Kelas IX', 'Rombel 9B', 'SARAH SAFIRA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (120, 'Senin', '09.15 - 10.00', 'Matematika', 'Kelas IX', 'Rombel 9B', 'H. ANI YULIANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (121, 'Senin', '10.00 - 10.45', 'Seni Rupa', 'Kelas IX', 'Rombel 9B', 'HASIS SYARIFUDIN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (122, 'Senin', '10.45 - 11.30', 'Akidah Akhlak', 'Kelas IX', 'Rombel 9B', 'WAKHIBUN, S.P', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (123, 'Selasa', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (124, 'Selasa', '07.45 - 08.30', 'Teknologi Informasi dan Komunikasi', 'Kelas IX', 'Rombel 9B', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (125, 'Selasa', '08.30 - 09.15', 'Bahasa Jawa', 'Kelas IX', 'Rombel 9B', 'RINDANG FARIHA IDANA, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (126, 'Selasa', '09.30 - 10.15', 'Al Qur''an Hadis', 'Kelas IX', 'Rombel 9B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (127, 'Selasa', '10.15 - 11.00', 'Bahasa Arab', 'Kelas IX', 'Rombel 9B', 'WAHYUDIN, S', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (128, 'Rabu', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (129, 'Rabu', '07.45 - 08.30', 'Bahasa Inggris', 'Kelas IX', 'Rombel 9B', 'INDAH NURROHMAH, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (130, 'Rabu', '08.30 - 09.15', 'Bahasa Indonesia', 'Kelas IX', 'Rombel 9B', 'Hj. NANGIMAH, S.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (131, 'Rabu', '09.30 - 10.15', 'Sejarah Kebudayaan Islam', 'Kelas IX', 'Rombel 9B', 'H. DASIRUN, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (132, 'Kamis', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (133, 'Kamis', '07.45 - 08.30', 'Bahasa Indonesia', 'Kelas IX', 'Rombel 9B', 'Hj. NANGIMAH, S.', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (134, 'Kamis', '08.30 - 09.15', 'Matematika', 'Kelas IX', 'Rombel 9B', 'H. ANI YULIANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (135, 'Kamis', '09.30 - 10.15', 'IPA', 'Kelas IX', 'Rombel 9B', 'ILHAM HABIBI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (136, 'Kamis', '10.15 - 11.00', 'Pendidikan Kewarganegaraan', 'Kelas IX', 'Rombel 9B', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (137, 'Jumat', '07.00 - 07.45', 'Tahfidz', 'Kelas IX', 'Rombel 9B', 'AH. SYARIF HIDAYAH, S.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (138, 'Jumat', '07.45 - 08.30', 'PJOK', 'Kelas IX', 'Rombel 9B', 'MASRUKHAN, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (139, 'Jumat', '08.30 - 09.15', 'Fikih', 'Kelas IX', 'Rombel 9B', 'MUHTAMAM, S.Ag., M.Pd.I', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (140, 'Sabtu', '07.30 - 08.30', 'Matematika', 'Kelas IX', 'Rombel 9B', 'H. ANI YULIANI, S.Pd', '2026-08-23 14:04:01');
INSERT INTO jadwal_pelajaran (id, hari, jam, mapel, tingkat, rombel, guru, created_at) VALUES (141, 'Sabtu', '08.30 - 09.30', 'IPS', 'Kelas IX', 'Rombel 9B', 'ALI MANSUR, S.Pd', '2026-08-23 14:04:01');

CREATE TABLE `jurnal_mengajar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guru_name` varchar(255) NOT NULL,
  `rombel` varchar(100) NOT NULL,
  `mapel` varchar(255) NOT NULL,
  `materi` varchar(255) NOT NULL,
  `tujuan_pembelajaran` text,
  `kegiatan` text,
  `catatan` text,
  `kendala` text,
  `tindak_lanjut` text,
  `tanggal` varchar(100) NOT NULL,
  `jam_ke` varchar(50) DEFAULT '07.30',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `kbm_presensi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rombel` varchar(100) NOT NULL,
  `mapel` varchar(255) NOT NULL,
  `guru_name` varchar(255) NOT NULL,
  `student_id` varchar(64) DEFAULT NULL,
  `student_nis` varchar(50) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'HADIR',
  `notes` text,
  `date_str` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `lkpd_activities` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rombel` varchar(100) NOT NULL,
  `mapel` varchar(255) NOT NULL,
  `teacher_name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'LKPD',
  `instructions` text,
  `due_date` varchar(100) NOT NULL,
  `max_score` int DEFAULT '100',
  `status` varchar(50) DEFAULT 'AKTIF',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO lkpd_activities (id, rombel, mapel, teacher_name, title, type, instructions, due_date, max_score, status, created_at) VALUES (1, 'Kelas VIII B', 'Pendidikan Kewarganegaraan', 'Guru Pengampu', 'test', 'LKPD', 'test', 'Hari ini, 15:00 WIB', 100, 'AKTIF', '2026-08-23 20:09:36');

CREATE TABLE `lkpd_grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `activity_id` varchar(100) NOT NULL,
  `student_id` varchar(100) DEFAULT NULL,
  `student_nisn` varchar(100) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `status` varchar(50) DEFAULT 'BELUM_MENGUMPULKAN',
  `score` varchar(20) DEFAULT '',
  `feedback` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `master_kktp_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kktp_minimal` int DEFAULT '75',
  `bobot_formatif` int DEFAULT '40',
  `bobot_sumatif` int DEFAULT '60',
  `rentang_a` int DEFAULT '90',
  `rentang_b` int DEFAULT '80',
  `rentang_c` int DEFAULT '75',
  `updated_by` varchar(255) DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `master_rombels` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `grade` varchar(10) NOT NULL,
  `wali_kelas` varchar(255) NOT NULL,
  `room` varchar(100) NOT NULL,
  `siswa_count` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO master_rombels (id, code, name, grade, wali_kelas, room, siswa_count, created_at) VALUES (1, 'r7a', 'Rombel 7A', 'Kelas VIII', 'MAULIDIA NURUL IZATI, S.Pd', 'Ruang Rombel', 0, '2026-08-25 12:16:37');
INSERT INTO master_rombels (id, code, name, grade, wali_kelas, room, siswa_count, created_at) VALUES (2, 'r7b', 'Rombel 7B', 'Kelas VII', 'RINDANG FARIHA IDANA, S.Pd', 'Ruang 7B', 0, '2026-08-25 12:16:37');
INSERT INTO master_rombels (id, code, name, grade, wali_kelas, room, siswa_count, created_at) VALUES (3, 'r8a', 'Rombel 8A', 'Kelas VIII', 'SOBIYATI, S.Pd', 'Ruang 8A', 0, '2026-08-25 12:16:37');
INSERT INTO master_rombels (id, code, name, grade, wali_kelas, room, siswa_count, created_at) VALUES (4, 'r8b', 'Rombel 8B', 'Kelas VIII', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', 'Ruang 8B', 0, '2026-08-25 12:16:37');
INSERT INTO master_rombels (id, code, name, grade, wali_kelas, room, siswa_count, created_at) VALUES (5, 'r9a', 'Rombel 9A', 'Kelas IX', 'NOVANTYA KARTIKAWATI, S.Pd', 'Ruang 9A', 0, '2026-08-25 12:16:37');
INSERT INTO master_rombels (id, code, name, grade, wali_kelas, room, siswa_count, created_at) VALUES (6, 'r9b', 'Rombel 9B', 'Kelas IX', 'INDAH NURROHMAH, S.Pd', 'Ruang 9B', 0, '2026-08-25 12:16:37');

CREATE TABLE `master_ruang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `cap` varchar(100) DEFAULT '36 Siswa',
  `fas` varchar(255) DEFAULT 'Proyektor, AC',
  `icon` varchar(20) DEFAULT '?',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (3, 'Lab IPA Terpadu', 'Laboratorium Praktikum', '40 Siswa', 'Mikroskop, Alat Bedah, Proyektor', '🔬', '2026-08-23 13:52:03');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (4, 'Lab Komputer CBT', 'Laboratorium Komputer', '40 Komputer', 'LAN, Server CBT, AC, UPS 10kVA', '💻', '2026-08-23 13:52:03');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (6, 'Lapangan Olahraga Utama', 'Fasilitas Outdoor', '500 Siswa', 'Garis Futsal, Basket, Voli', '⚽', '2026-08-23 13:52:03');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (7, 'Ruang Kelas VII A', 'Ruang Teori', '36 Siswa', 'Proyektor, AC', '🏫', '2026-08-23 13:54:43');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (8, 'Ruang Kelas VII B', 'Ruang Teori', '36 Siswa', 'Proyektor, AC', '🏫', '2026-08-23 13:55:01');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (9, 'Ruang Kelas VIII A', 'Ruang Teori', '36 Siswa', 'Proyektor, AC', '🏫', '2026-08-23 13:55:09');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (10, 'Ruang Kelas VIII B', 'Ruang Teori', '36 Siswa', 'Proyektor, AC', '🏫', '2026-08-23 13:55:17');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (11, 'Ruang Kelas IX A', 'Ruang Teori', '36 Siswa', 'Proyektor, AC', '🏫', '2026-08-23 13:55:24');
INSERT INTO master_ruang (id, name, type, cap, fas, icon, created_at) VALUES (12, 'Ruang Kelas IX B', 'Ruang Teori', '36 Siswa', 'Proyektor, AC', '🏫', '2026-08-23 13:55:30');

CREATE TABLE `materials` (
  `id` varchar(64) NOT NULL,
  `title` varchar(255) NOT NULL,
  `subject_name` varchar(100) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `type` varchar(50) NOT NULL,
  `size` varchar(50) DEFAULT '2.5 MB',
  `filename` varchar(255) NOT NULL,
  `file_url` text,
  `uploaded_by` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `matriks_pengampu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guru` varchar(255) NOT NULL,
  `mapel` varchar(255) NOT NULL,
  `rombel` varchar(100) NOT NULL,
  `jam` varchar(50) DEFAULT '2 JP / mgg',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (1, 'AH. SYARIF HIDAYAH, S.Pd.I', 'Al Qur''an Hadis', 'IX A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (2, 'MISBAH AHMAD DANI, S.Pd', 'Al Qur''an Hadis', 'VII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (3, 'WAKHIBUN, S.P', 'Akidah Akhlak', 'VIII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (4, 'MAHMUDAH, S.', 'Akidah Akhlak', 'VII B', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (5, 'CARYATI,', 'Fikih', 'VIII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (6, 'MUHTAMAM, S.Ag., M.Pd.I', 'Fikih', 'IX B', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (7, 'H. DASIRUN, S.Ag., M.Pd.I', 'Sejarah Kebudayaan Islam', 'VII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (8, 'ENDAH SUPRIHATIN, S.Pd', 'Bahasa Arab', 'VII A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (9, 'Hj. SITI MUHSINAH, S', 'Bahasa Arab', 'VIII A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (10, 'WAHYUDIN, S', 'Bahasa Arab', 'IX A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (11, 'SOBIYATI, S.Pd', 'Bahasa Indonesia', 'VIII A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (12, 'DAISAH, S.Pd', 'Bahasa Indonesia', 'VII A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (13, 'Hj. NANGIMAH, S.', 'Bahasa Indonesia', 'IX A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (14, 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', 'Bahasa Inggris', 'VII A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (15, 'RIDHO ANSHORI, S.Pd., M.Pd', 'Bahasa Inggris', 'VIII A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (16, 'CETY MAHARSY, S.Pd', 'Bahasa Inggris', 'VIII B', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (17, 'SASI VIVIANI, S.Pd', 'Bahasa Inggris', 'VII B', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (18, 'INDAH NURROHMAH, S.Pd', 'Bahasa Inggris', 'IX A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (19, 'SAYONO, S.Pd., M.Pd.', 'Matematika', 'VIII A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (20, 'SRIYANI KUNTARI, S.Pd', 'Matematika', 'VII A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (21, 'H. ANI YULIANI, S.Pd', 'Matematika', 'IX A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (22, 'IFTI NURROHMAH, S.Pd', 'Matematika', 'VII B', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (23, 'NOVANTYA KARTIKAWATI, S.Pd', 'Ilmu Pendidikan Alam', 'VIII A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (24, 'STEFI APRIONITA SETYO ARUM, S.Pd', 'Ilmu Pendidikan Alam', 'VII A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (25, 'ILHAM HABIBI, S.Pd', 'Ilmu Pendidikan Alam', 'IX A', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (26, 'HIKMATUL ASTRI AZKIYA, S.Pd', 'Ilmu Pendidikan Alam', 'VII B', '4 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (27, 'UMI KHAFSOH, S.Pd', 'Ilmu Pendidikan Sosial', 'VIII A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (28, 'NAZIHATUN ZUHRIYAH, S.Pd.', 'Ilmu Pendidikan Sosial', 'VII A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (29, 'ALI MANSUR, S.Pd', 'Ilmu Pendidikan Sosial', 'IX A', '3 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (30, 'ANGGUN NOVTALIA BERLIAN, S.Pd', 'Pendidikan Kewarganegaraan', 'VIII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (31, 'TEGUH WIYONO, S.Pd', 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'VIII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (32, 'NUR ROCHMAN SHODIQ, S.Pd.I', 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'VII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (33, 'MASRUKHAN, S.Pd', 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'IX A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (34, 'HASIS SYARIFUDIN, S.Pd', 'Prakarya dan Seni Budaya', 'VIII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (35, 'ISNAENI HASANAH, S.Pd.I', 'Prakarya dan Seni Budaya', 'VII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (36, 'RINDANG FARIHA IDANA, S.Pd', 'Bahasa Jawa', 'VIII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (37, 'ASROR HIDAYAT, S.Pd', 'Bimbingan dan Konseling', 'VIII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (38, 'MAULIDIA NURUL IZATI, S.Pd', 'Bimbingan dan Konseling', 'VII A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (39, 'SARAH SAFIRA, S.Pd', 'Bimbingan dan Konseling', 'IX A', '2 JP / mgg', '2026-08-23 13:43:08');
INSERT INTO matriks_pengampu (id, guru, mapel, rombel, jam, created_at) VALUES (40, 'H. SOLIHUN, S.Pd., M.Si', 'Manajemen Sekolah', 'Semua Rombel', '6 JP / mgg', '2026-08-23 13:43:08');

CREATE TABLE `meetings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `subject_id` int NOT NULL,
  `meeting_number` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `pdf_url` text COLLATE utf8mb4_unicode_ci,
  `video_url` text COLLATE utf8mb4_unicode_ci,
  `ppt_url` text COLLATE utf8mb4_unicode_ci,
  `lkpd_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  CONSTRAINT `meetings_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `p5_projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `theme` varchar(100) NOT NULL,
  `class_name` varchar(50) NOT NULL,
  `target_dimension` varchar(255) NOT NULL,
  `status` varchar(50) NOT NULL,
  `progress_pct` int DEFAULT '0',
  `date_str` varchar(50) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `profiles` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nis` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_name` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `tagline` text COLLATE utf8mb4_unicode_ci,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-1', 'usr-guru-1', 'H. SOLIHUN, S.Pd., M.Si', '197905162006041020', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Kepala Madrasah', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-10', 'usr-guru-10', 'UMI KHAFSOH, S.Pd', '197509192009012008', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Ilmu Pendidikan Sosial', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-11', 'usr-guru-11', 'WAKHIBUN, S.P', '197602012007011019', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Akidah Akhlak', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-12', 'usr-guru-12', 'SAYONO, S.Pd., M.Pd.', '197705132007101002', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Matematika', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-13', 'usr-guru-13', 'WAHYUDIN, S', '197710212007101001', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Arab', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-14', 'usr-guru-14', 'NAZIHATUN ZUHRIYAH, S.Pd.', '197804212009012004', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Ilmu Pendidikan Sosial', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-15', 'usr-guru-15', 'RIDHO ANSHORI, S.Pd., M.Pd', '197806212007101002', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Inggris', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-16', 'usr-guru-16', 'CARYATI,', '197807072007102001', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Fikih', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-17', 'usr-guru-17', 'SOBIYATI, S.Pd', '197906142007102002', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Indonesia', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-18', 'usr-guru-18', 'DAISAH, S.Pd', '198002152007102002', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Indonesia', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-19', 'usr-guru-19', 'H. ANI YULIANI, S.Pd', '198007172005012001', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Matematika', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-2', 'usr-guru-2', 'Hj. NANGIMAH, S.', '196909081998032001', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Indonesia', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-20', 'usr-guru-20', 'CETY MAHARSY, S.Pd', '198102062007102003', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Inggris', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-21', 'usr-guru-21', 'ALI MANSUR, S.Pd', '198302142023211010', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Ilmu Pendidikan Sosial', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-22', 'usr-guru-22', 'ASROR HIDAYAT, S.Pd', '198409142023211019', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bimbingan dan Konseling', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-23', 'usr-guru-23', 'NOVANTYA KARTIKAWATI, S.Pd', '199011022025212013', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Ilmu Pendidikan Alam', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-24', 'usr-guru-24', 'HASIS SYARIFUDIN, S.Pd', '199202022023211045', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Prakarya dan Seni Budaya', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-25', 'usr-guru-25', 'AH. SYARIF HIDAYAH, S.Pd.I', '199204042025051002', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Al Qur''an Hadis', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-26', 'usr-guru-26', 'STEFI APRIONITA SETYO ARUM, S.Pd', '199204152023212049', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Ilmu Pendidikan Alam', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-27', 'usr-guru-27', 'IFTI NURROHMAH, S.Pd', '199301292025212006', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Matematika', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-28', 'usr-guru-28', 'MASRUKHAN, S.Pd', '199309192023211016', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Pendidikan Jasmani, Olahraga dan Kesehatan', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-29', 'usr-guru-29', 'ENDAH SUPRIHATIN, S.Pd', '199405142019032021', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Arab', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-3', 'usr-guru-3', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', '197002272005011001', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Inggris', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-30', 'usr-guru-30', 'MAULIDIA NURUL IZATI, S.Pd', '199508182023212044', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bimbingan dan Konseling', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-31', 'usr-guru-31', 'ILHAM HABIBI, S.Pd', '199611202025211009', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Ilmu Pendidikan Alam', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-32', 'usr-guru-32', 'MISBAH AHMAD DANI, S.Pd', '199701112025211009', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Al Qur''an Hadis', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-33', 'usr-guru-33', 'SASI VIVIANI, S.Pd', '199711212025212010', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Inggris', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-34', 'usr-guru-34', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '199711302025052006', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Pendidikan Kewarganegaraan', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-35', 'usr-guru-35', 'INDAH NURROHMAH, S.Pd', '199712302024212037', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Inggris', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-36', 'usr-guru-36', 'SARAH SAFIRA, S.Pd', '199804202025052007', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bimbingan dan Konseling', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-37', 'usr-guru-37', 'HIKMATUL ASTRI AZKIYA, S.Pd', '199810202025052006', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Ilmu Pendidikan Alam', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-38', 'usr-guru-38', 'RINDANG FARIHA IDANA, S.Pd', '12345678', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Jawa', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-4', 'usr-guru-4', 'MAHMUDAH, S.', '197004082007012025', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Akidah Akhlak', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-5', 'usr-guru-5', 'Hj. SITI MUHSINAH, S', '197109302007012011', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Bahasa Arab', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-6', 'usr-guru-6', 'H. DASIRUN, S.Ag., M.Pd.I', '197311232005011004', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Sejarah Kebudayaan Islam', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-7', 'usr-guru-7', 'SRIYANI KUNTARI, S.Pd', '197311252007102001', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Matematika', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-8', 'usr-guru-8', 'TEGUH WIYONO, S.Pd', '197312112007011021', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Pendidikan Jasmani, Olahraga dan Kesehatan', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-guru-9', 'usr-guru-9', 'MUHTAMAM, S.Ag., M.Pd.I', '197405022007101003', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33', 'Fikih', NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-1', 'usr-siswa-1', 'ALIYA QIARA ABDULLAH', '0127790481', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-10', 'usr-siswa-10', 'KHAYRA TRI APRILIANI', '0134634710', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-100', 'usr-siswa-100', 'MUHAMMAD HAIKAL ASRI', '3120697873', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-101', 'usr-siswa-101', 'MUHAMMAD NAUFAL NASHIRUL HAQ', '3104661653', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-102', 'usr-siswa-102', 'MUHAMMAD SYAFI MUTAMMAM', '0128969219', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-103', 'usr-siswa-103', 'NAILA NATANIA AZZARA', '0126867483', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-104', 'usr-siswa-104', 'NAJWA NUR AFIFAH', '3130847809', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-105', 'usr-siswa-105', 'NURUL HIKMAH RAMADHANI', '0127454810', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-106', 'usr-siswa-106', 'RASYA JABBAR RIFQI RIZQULLOH', '0111843516', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-107', 'usr-siswa-107', 'REZA FADLU RAMADHANI', '3121731162', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-108', 'usr-siswa-108', 'RIDLO FAIZ MUBAROK', '0123766654', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-109', 'usr-siswa-109', 'RIFQOH TYAS AFADILA', '0115359428', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-11', 'usr-siswa-11', 'MAITSAA ATIKAH AZZAHRA', '3136366787', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-110', 'usr-siswa-110', 'SHAFA NUR AULIA', '0126845515', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-111', 'usr-siswa-111', 'SUBKHAN NAWWAF', '3122521292', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-112', 'usr-siswa-112', 'SYAFIIQOH AULIA', '3126120542', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-113', 'usr-siswa-113', 'TAHTA AGUNG RAHARTO', '0114891264', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-114', 'usr-siswa-114', 'WAHYU MAZYA FILKHIYA', '0124664078', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-115', 'usr-siswa-115', 'WINA WIJAYANTI', '3122330903', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-116', 'usr-siswa-116', 'WINDA NUR SAFIKA', '0123852660', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-117', 'usr-siswa-117', 'ZAINUN AGIL RAFA SYIBAWAIHIN', '0126865403', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-12', 'usr-siswa-12', 'MAULANA FIKRI', '0129365012', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-13', 'usr-siswa-13', 'MUHAMAD ACHSAN SANJAYA', '0138362320', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-14', 'usr-siswa-14', 'MUHAMMAD FATWA ADHWA NIYAZ', '0122054715', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-15', 'usr-siswa-15', 'NAFISAH AQILATUL HAFSOH', '0131645134', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-16', 'usr-siswa-16', 'NAKHLAH ZAHIYA PUTRI', '0123372321', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-17', 'usr-siswa-17', 'NANDA CANTIKA PUTRI MAMENTIWALO', '0124702907', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-18', 'usr-siswa-18', 'NAYLA HURY MAHFUDZ', '0121552970', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-19', 'usr-siswa-19', 'NUR LAELA SARI', '0107389917', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-2', 'usr-siswa-2', 'AQILAA AAMIRATUL YUMNA', '0132249055', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-20', 'usr-siswa-20', 'SAFIRA FIRDAYANTI SALAMAH', '3127411298', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-21', 'usr-siswa-21', 'SATRIO DAMAR LUMAKSITO', '3136185458', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-22', 'usr-siswa-22', 'SONIA USWATUL BAROROH', '3128340444', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-23', 'usr-siswa-23', 'SYALUM SAKHILA DAMAYANTI', '0132640527', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-24', 'usr-siswa-24', 'TALITA HANA NISA HUZAIFAH', '0123801767', 'VIII-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-25', 'usr-siswa-25', 'UWI JAYA SAKTI', '3136821272', 'VIII-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-26', 'usr-siswa-26', 'WIWIN EKA RINJANI', '0131398025', 'VIII-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-27', 'usr-siswa-27', 'AFFANDI ANGGIT PRATAMA', '0133420828', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-28', 'usr-siswa-28', 'AFINDA MULIA ROKHMAH', '3121224054', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-29', 'usr-siswa-29', 'AISYAH NUR WAHYUNI', '3138661737', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-3', 'usr-siswa-3', 'CITRA FEBI HASIFA', '3137647595', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-30', 'usr-siswa-30', 'ALIFAH KALTSUM ZAHRANI PURNOMO', '0139847558', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-31', 'usr-siswa-31', 'ALIZA OKTAVIANI PUTRI', '0127191673', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-32', 'usr-siswa-32', 'DAFFA ADYASTA DANISH SETYAWAN', '3133675161', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-33', 'usr-siswa-33', 'DHIYA MAITSA PUTRI NURISTA', '0126160636', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-34', 'usr-siswa-34', 'DIMAS SEPTA AZHARI', '0129348095', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-35', 'usr-siswa-35', 'DINDA IMANIAR HERLANA', '3129995907', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-36', 'usr-siswa-36', 'FARRENIA ARISTA WIDYA', '0137628608', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-37', 'usr-siswa-37', 'FAYZA ANINDYA EFENDI', '0124903582', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-38', 'usr-siswa-38', 'HANSA SABIHA', '0133645526', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-39', 'usr-siswa-39', 'HELFAN EFENDY', '0132134024', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-4', 'usr-siswa-4', 'DINA FAJRIA ASSA NASSAKI', '3130470613', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-40', 'usr-siswa-40', 'HUSNIYATUL KAUNI', '3127292377', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-41', 'usr-siswa-41', 'INTAN NUR PUTRI AULIA', '0121571848', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-42', 'usr-siswa-42', 'IQLIMATUL LAELI ADRESS', '0123419194', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-43', 'usr-siswa-43', 'IZZA GANDIT PRATAMA', '3122643827', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-44', 'usr-siswa-44', 'MARWAH AURA MAWARDHANI', '3121635074', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-45', 'usr-siswa-45', 'MIKAYLA ROJABIYA', '0139466898', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-46', 'usr-siswa-46', 'MUJAHIDAH FILLAH', '0134446670', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-47', 'usr-siswa-47', 'NOVAN APRILIANSYAH', '0138970545', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-48', 'usr-siswa-48', 'PANDAWA RAFA RAMADHAN', '0134522326', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-49', 'usr-siswa-49', 'PUTRI FITIYA AZZAHRA', '0131586460', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-5', 'usr-siswa-5', 'FAIDATUL HUSNA ASFIA', '3121802138', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-50', 'usr-siswa-50', 'RANGGA SATYA UTAMA', '0135397614', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-51', 'usr-siswa-51', 'ROHMAN LUTFI NAHAR', '0127377941', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-52', 'usr-siswa-52', 'SAYYID HAEYKAL KHABIBULLOH', '0126739408', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-53', 'usr-siswa-53', 'ZAKI RIZKI RAMADHAN', '0135932663', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-54', 'usr-siswa-54', 'ZHAVIRA AZHAAR MYCHAELA', '3124400854', 'VIII-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-55', 'usr-siswa-55', 'ABIGAIL HASAN YUSUF PUTRA INDONESIA', '3123334074', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-56', 'usr-siswa-56', 'ABIMAIL HUSEN IBRAHIM PUTRA INDONESIA', '3121121358', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-57', 'usr-siswa-57', 'AHMAD NIZAM NUR FAIZIN', '3121331541', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-58', 'usr-siswa-58', 'AHMAD SABIHIS', '0127071279', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-59', 'usr-siswa-59', 'ALIKA SYAFA AZAHRA', '3122531880', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-6', 'usr-siswa-6', 'FATHAN FAUZAN', '0135489351', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-60', 'usr-siswa-60', 'ANNISA NUR RIFA', '0127115017', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-61', 'usr-siswa-61', 'AZKA APRILIA HARTONO', '0117944345', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-62', 'usr-siswa-62', 'CALLISTA RIZKIA PUTRI', '0121576974', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-63', 'usr-siswa-63', 'DURROTUN NAFISAH', '3133575586', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-64', 'usr-siswa-64', 'EFAN FERDIAN', '0122672496', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-65', 'usr-siswa-65', 'FARIQ ATHARIZZ MANAF', '0128640614', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-66', 'usr-siswa-66', 'GIGIH TRIDA PANGESTU', '0123324835', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-67', 'usr-siswa-67', 'IHSAN NUR FAIZI', '0114924937', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-68', 'usr-siswa-68', 'JUAN MIRZA ZAFRAN RAQILLA', '0125470823', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-69', 'usr-siswa-69', 'KENT FARRAS TIVADAR', '0112174448', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-7', 'usr-siswa-7', 'JUSUF MAULANA', '0125098562', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-70', 'usr-siswa-70', 'KHAIRUL NIZAM', '0122461640', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-71', 'usr-siswa-71', 'MUHAMMAD FAWWAS HABIBIE', '0123356426', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-72', 'usr-siswa-72', 'MUHAMMAD LIWA ULHAQ ALFARABI', '3125018106', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-73', 'usr-siswa-73', 'MUHAMMAD RIZKY RAMADHAN', '3116336963', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-74', 'usr-siswa-74', 'NABHAN RADINKA KEVAN PRASETYO', '0122758258', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-75', 'usr-siswa-75', 'NASYABEL JAUZA ASHILA', '0122848349', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-76', 'usr-siswa-76', 'NAURA NAZWA NUR AFIFAH', '0129937851', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-77', 'usr-siswa-77', 'NAZWA DELA AZZAHRA', '0119436494', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-78', 'usr-siswa-78', 'PRANANDA THERY HALANSYAH', '0126195880', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-79', 'usr-siswa-79', 'RANIS ANUGRAH RAMADHAN', '0113111584', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-8', 'usr-siswa-8', 'KEVIN EFENDI', '0135221964', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-80', 'usr-siswa-80', 'RIZKY NUR RASYDAN', '0129722787', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-81', 'usr-siswa-81', 'RIZQI GALIH ARROFAH', '0129398154', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-82', 'usr-siswa-82', 'SATRIYO LINSO WICAKSONO', '0128897393', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-83', 'usr-siswa-83', 'SEPTIAR DWI MUHNANDAR', '0111194935', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-84', 'usr-siswa-84', 'VIANDRA AISYAH SALSABILA KURNIAWAN', '0128392666', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-85', 'usr-siswa-85', 'VITA ANGGRAENI', '0117385087', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-86', 'usr-siswa-86', 'WAKHIDATUS SOLIKHAH', '0129634395', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-87', 'usr-siswa-87', 'ZAHWA LUNA BAHTIAR', '0117917027', 'IX-A', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-88', 'usr-siswa-88', 'AHMAD DAFFA', '0121082428', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-89', 'usr-siswa-89', 'ARDHANI SATRIADJI AKHMAD', '0127641678', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-9', 'usr-siswa-9', 'KHARISA PUTRI ARIFA', '3135810920', 'VIII-A', '2026-08-06 17:19:09', '2026-08-06 17:19:09', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-90', 'usr-siswa-90', 'AZKA SYAFIQ NUR SHIDQI', '0125314520', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-91', 'usr-siswa-91', 'AZKIA KUSUMA AYU', '3112049996', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-92', 'usr-siswa-92', 'DAVINA NITA BAHRI', '0107113166', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-93', 'usr-siswa-93', 'DHIA WAFI AZALIA SAPUTRI', '3122014751', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-94', 'usr-siswa-94', 'ELGIA MELISSA KIRANI PUTRI', '0117138477', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-95', 'usr-siswa-95', 'GILANG AFIT SUBEKTI', '0116245748', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-96', 'usr-siswa-96', 'INDANA HILMA IKLILA', '0126090369', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-97', 'usr-siswa-97', 'LATHIFATUL AZIZAH', '3129148765', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-98', 'usr-siswa-98', 'MIKAEL EZRA EL GHAZY', '3110508918', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);
INSERT INTO profiles (id, user_id, full_name, nis, class_name, created_at, updated_at, tagline, address, phone) VALUES ('prof-usr-siswa-99', 'usr-siswa-99', 'MUHAMAD NGAFIFUDIN', '3120769475', 'IX-B', '2026-08-06 17:19:10', '2026-08-06 17:19:10', NULL, NULL, NULL);

CREATE TABLE `rapor_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `presensi_score` int NOT NULL DEFAULT '95',
  `tugas_score` int NOT NULL DEFAULT '88',
  `uts_score` int NOT NULL DEFAULT '85',
  `pas_score` int NOT NULL DEFAULT '87',
  `final_score` int NOT NULL DEFAULT '87',
  `predicate` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'A',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `rapor_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `student_assignments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `mapel` varchar(100) NOT NULL,
  `rombel` varchar(50) NOT NULL,
  `due_date` varchar(50) NOT NULL,
  `description` text,
  `author_guru` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `student_awards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `badge_category` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warning_category` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comment_text` text COLLATE utf8mb4_unicode_ci,
  `awarded_by` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `student_kbm_notes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `rombel` varchar(100) NOT NULL,
  `mapel` varchar(255) NOT NULL,
  `teacher_name` varchar(255) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'PEMBELAJARAN',
  `note` text NOT NULL,
  `date_str` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `teacher_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `grade_level` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Kelas 8',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (1, 'AGM-01', 'Al Qur''an Hadis', 'AH. SYARIF HIDAYAH, S.Pd.I', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (2, 'AGM-02', 'Akidah Akhlak', 'WAKHIBUN, S.P', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (3, 'AGM-03', 'Fikih', 'CARYATI,', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (4, 'AGM-04', 'Sejarah Kebudayaan Islam', 'H. DASIRUN, S.Ag., M.Pd.I', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (5, 'AGM-05', 'Bahasa Arab', 'ENDAH SUPRIHATIN, S.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (6, 'UMM-01', 'Bahasa Indonesia', 'SOBIYATI, S.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (7, 'UMM-02', 'Bahasa Inggris', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (8, 'UMM-03', 'Matematika', 'SAYONO, S.Pd., M.Pd.', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (9, 'UMM-04', 'Ilmu Pendidikan Alam', 'NOVANTYA KARTIKAWATI, S.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (10, 'UMM-05', 'Ilmu Pendidikan Sosial', 'UMI KHAFSOH, S.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (11, 'UMM-06', 'Pendidikan Kewarganegaraan', 'ANGGUN NOVTALIA BERLIAN, S.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (12, 'UMM-07', 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'NUR ROCHMAN SHODIQ, S.Pd.I', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (13, 'UMM-08', 'Prakarya dan Seni Budaya', 'ISNAENI HASANAH, S.Pd.I', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (14, 'MLK-01', 'Bahasa Jawa', 'RINDANG FARIHA IDANA, S.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');
INSERT INTO subjects (id, code, name, teacher_name, grade_level, created_at) VALUES (15, 'PGB-01', 'Bimbingan dan Konseling', 'ASROR HIDAYAT, S.Pd', 'Semua Tingkat', '2026-08-22 02:57:20');

CREATE TABLE `tahfidz_hafalan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `student_name` varchar(255) DEFAULT NULL,
  `nisn` varchar(50) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `juz` varchar(50) NOT NULL,
  `surah` varchar(100) NOT NULL,
  `ayat` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `nilai` varchar(50) NOT NULL,
  `ustadz` varchar(255) NOT NULL,
  `tgl` varchar(50) NOT NULL,
  `murojaah` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `tahfidz_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `juz_number` int NOT NULL DEFAULT '30',
  `surah_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verses` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Mutqin',
  `tajwid_score` int NOT NULL DEFAULT '95',
  `tester_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `tahfidz_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO tahfidz_records (id, user_id, student_name, juz_number, surah_name, verses, status, tajwid_score, tester_name, created_at) VALUES (1, 'usr-siswa-1', 'Muhammad Fairuz Maulana', 30, 'An-Naba''', '1 - 40', 'Mutqin', 98, 'Ustadz Ahmad Syukri, S.Pd.I', '2026-07-28 19:57:36');

CREATE TABLE `teacher_journals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `guru_name` varchar(255) NOT NULL,
  `mapel` varchar(100) NOT NULL,
  `rombel` varchar(50) NOT NULL,
  `tanggal` varchar(50) NOT NULL,
  `jam_ke` varchar(50) NOT NULL,
  `materi` varchar(255) NOT NULL,
  `catatan` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `year` varchar(10) DEFAULT NULL,
  `issuer` varchar(255) DEFAULT NULL,
  `file_url` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=632 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user_roles (id, user_id, role, created_at) VALUES (1, 'usr-admin-1', 'admin', '2026-07-28 19:57:36');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (2, 'usr-kamad-1', 'kamad', '2026-07-28 19:57:36');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (3, 'usr-waka-1', 'waka', '2026-07-28 19:57:36');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (4, 'usr-walikelas-1', 'walikelas', '2026-07-28 19:57:36');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (5, 'usr-guru-1', 'guru', '2026-07-28 19:57:36');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (6, 'usr-siswa-1', 'siswa', '2026-07-28 19:57:36');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (7, 'usr-admin-1', 'admin', '2026-07-28 19:58:16');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (8, 'usr-kamad-1', 'kamad', '2026-07-28 19:58:16');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (9, 'usr-waka-1', 'waka', '2026-07-28 19:58:16');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (10, 'usr-walikelas-1', 'walikelas', '2026-07-28 19:58:16');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (11, 'usr-guru-1', 'guru', '2026-07-28 19:58:16');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (12, 'usr-siswa-1', 'siswa', '2026-07-28 19:58:16');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (13, 'usr-admin-1', 'admin', '2026-07-29 03:34:30');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (14, 'usr-kamad-1', 'kamad', '2026-07-29 03:34:30');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (15, 'usr-waka-1', 'waka', '2026-07-29 03:34:30');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (16, 'usr-walikelas-1', 'walikelas', '2026-07-29 03:34:30');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (17, 'usr-guru-1', 'guru', '2026-07-29 03:34:30');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (18, 'usr-siswa-1', 'siswa', '2026-07-29 03:34:30');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (19, 'usr-admin-1', 'admin', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (20, 'usr-kamad-1', 'kamad', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (21, 'usr-waka-1', 'waka', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (22, 'usr-walikelas-1', 'walikelas', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (23, 'usr-guru-1', 'guru', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (24, 'usr-siswa-1', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (25, 'usr-siswa-1', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (26, 'usr-siswa-2', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (27, 'usr-siswa-3', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (28, 'usr-siswa-4', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (29, 'usr-siswa-5', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (30, 'usr-siswa-6', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (31, 'usr-siswa-7', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (32, 'usr-siswa-8', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (33, 'usr-siswa-9', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (34, 'usr-siswa-10', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (35, 'usr-siswa-11', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (36, 'usr-siswa-12', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (37, 'usr-siswa-13', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (38, 'usr-siswa-14', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (39, 'usr-siswa-15', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (40, 'usr-siswa-16', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (41, 'usr-siswa-17', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (42, 'usr-siswa-18', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (43, 'usr-siswa-19', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (44, 'usr-siswa-20', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (45, 'usr-siswa-21', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (46, 'usr-siswa-22', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (47, 'usr-siswa-23', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (48, 'usr-siswa-24', 'siswa', '2026-08-06 17:19:09');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (49, 'usr-siswa-25', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (50, 'usr-siswa-26', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (51, 'usr-siswa-27', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (52, 'usr-siswa-28', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (53, 'usr-siswa-29', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (54, 'usr-siswa-30', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (55, 'usr-siswa-31', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (56, 'usr-siswa-32', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (57, 'usr-siswa-33', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (58, 'usr-siswa-34', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (59, 'usr-siswa-35', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (60, 'usr-siswa-36', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (61, 'usr-siswa-37', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (62, 'usr-siswa-38', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (63, 'usr-siswa-39', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (64, 'usr-siswa-40', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (65, 'usr-siswa-41', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (66, 'usr-siswa-42', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (67, 'usr-siswa-43', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (68, 'usr-siswa-44', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (69, 'usr-siswa-45', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (70, 'usr-siswa-46', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (71, 'usr-siswa-47', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (72, 'usr-siswa-48', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (73, 'usr-siswa-49', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (74, 'usr-siswa-50', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (75, 'usr-siswa-51', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (76, 'usr-siswa-52', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (77, 'usr-siswa-53', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (78, 'usr-siswa-54', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (79, 'usr-siswa-55', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (80, 'usr-siswa-56', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (81, 'usr-siswa-57', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (82, 'usr-siswa-58', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (83, 'usr-siswa-59', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (84, 'usr-siswa-60', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (85, 'usr-siswa-61', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (86, 'usr-siswa-62', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (87, 'usr-siswa-63', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (88, 'usr-siswa-64', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (89, 'usr-siswa-65', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (90, 'usr-siswa-66', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (91, 'usr-siswa-67', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (92, 'usr-siswa-68', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (93, 'usr-siswa-69', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (94, 'usr-siswa-70', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (95, 'usr-siswa-71', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (96, 'usr-siswa-72', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (97, 'usr-siswa-73', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (98, 'usr-siswa-74', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (99, 'usr-siswa-75', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (100, 'usr-siswa-76', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (101, 'usr-siswa-77', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (102, 'usr-siswa-78', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (103, 'usr-siswa-79', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (104, 'usr-siswa-80', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (105, 'usr-siswa-81', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (106, 'usr-siswa-82', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (107, 'usr-siswa-83', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (108, 'usr-siswa-84', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (109, 'usr-siswa-85', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (110, 'usr-siswa-86', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (111, 'usr-siswa-87', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (112, 'usr-siswa-88', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (113, 'usr-siswa-89', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (114, 'usr-siswa-90', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (115, 'usr-siswa-91', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (116, 'usr-siswa-92', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (117, 'usr-siswa-93', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (118, 'usr-siswa-94', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (119, 'usr-siswa-95', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (120, 'usr-siswa-96', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (121, 'usr-siswa-97', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (122, 'usr-siswa-98', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (123, 'usr-siswa-99', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (124, 'usr-siswa-100', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (125, 'usr-siswa-101', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (126, 'usr-siswa-102', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (127, 'usr-siswa-103', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (128, 'usr-siswa-104', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (129, 'usr-siswa-105', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (130, 'usr-siswa-106', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (131, 'usr-siswa-107', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (132, 'usr-siswa-108', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (133, 'usr-siswa-109', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (134, 'usr-siswa-110', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (135, 'usr-siswa-111', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (136, 'usr-siswa-112', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (137, 'usr-siswa-113', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (138, 'usr-siswa-114', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (139, 'usr-siswa-115', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (140, 'usr-siswa-116', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (141, 'usr-siswa-117', 'siswa', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (142, 'usr-guru-1', 'kamad', '2026-08-06 17:19:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (143, 'usr-admin-1', 'admin', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (144, 'usr-kamad-1', 'kamad', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (145, 'usr-waka-1', 'waka', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (146, 'usr-walikelas-1', 'walikelas', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (147, 'usr-guru-1', 'guru', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (148, 'usr-siswa-1', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (149, 'usr-siswa-1', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (150, 'usr-siswa-2', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (151, 'usr-siswa-3', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (152, 'usr-siswa-4', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (153, 'usr-siswa-5', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (154, 'usr-siswa-6', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (155, 'usr-siswa-7', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (156, 'usr-siswa-8', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (157, 'usr-siswa-9', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (158, 'usr-siswa-10', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (159, 'usr-siswa-11', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (160, 'usr-siswa-12', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (161, 'usr-siswa-13', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (162, 'usr-siswa-14', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (163, 'usr-siswa-15', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (164, 'usr-siswa-16', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (165, 'usr-siswa-17', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (166, 'usr-siswa-18', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (167, 'usr-siswa-19', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (168, 'usr-siswa-20', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (169, 'usr-siswa-21', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (170, 'usr-siswa-22', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (171, 'usr-siswa-23', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (172, 'usr-siswa-24', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (173, 'usr-siswa-25', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (174, 'usr-siswa-26', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (175, 'usr-siswa-27', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (176, 'usr-siswa-28', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (177, 'usr-siswa-29', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (178, 'usr-siswa-30', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (179, 'usr-siswa-31', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (180, 'usr-siswa-32', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (181, 'usr-siswa-33', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (182, 'usr-siswa-34', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (183, 'usr-siswa-35', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (184, 'usr-siswa-36', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (185, 'usr-siswa-37', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (186, 'usr-siswa-38', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (187, 'usr-siswa-39', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (188, 'usr-siswa-40', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (189, 'usr-siswa-41', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (190, 'usr-siswa-42', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (191, 'usr-siswa-43', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (192, 'usr-siswa-44', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (193, 'usr-siswa-45', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (194, 'usr-siswa-46', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (195, 'usr-siswa-47', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (196, 'usr-siswa-48', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (197, 'usr-siswa-49', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (198, 'usr-siswa-50', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (199, 'usr-siswa-51', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (200, 'usr-siswa-52', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (201, 'usr-siswa-53', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (202, 'usr-siswa-54', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (203, 'usr-siswa-55', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (204, 'usr-siswa-56', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (205, 'usr-siswa-57', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (206, 'usr-siswa-58', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (207, 'usr-siswa-59', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (208, 'usr-siswa-60', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (209, 'usr-siswa-61', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (210, 'usr-siswa-62', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (211, 'usr-siswa-63', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (212, 'usr-siswa-64', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (213, 'usr-siswa-65', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (214, 'usr-siswa-66', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (215, 'usr-siswa-67', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (216, 'usr-siswa-68', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (217, 'usr-siswa-69', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (218, 'usr-siswa-70', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (219, 'usr-siswa-71', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (220, 'usr-siswa-72', 'siswa', '2026-08-06 17:19:32');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (221, 'usr-siswa-73', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (222, 'usr-siswa-74', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (223, 'usr-siswa-75', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (224, 'usr-siswa-76', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (225, 'usr-siswa-77', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (226, 'usr-siswa-78', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (227, 'usr-siswa-79', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (228, 'usr-siswa-80', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (229, 'usr-siswa-81', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (230, 'usr-siswa-82', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (231, 'usr-siswa-83', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (232, 'usr-siswa-84', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (233, 'usr-siswa-85', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (234, 'usr-siswa-86', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (235, 'usr-siswa-87', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (236, 'usr-siswa-88', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (237, 'usr-siswa-89', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (238, 'usr-siswa-90', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (239, 'usr-siswa-91', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (240, 'usr-siswa-92', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (241, 'usr-siswa-93', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (242, 'usr-siswa-94', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (243, 'usr-siswa-95', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (244, 'usr-siswa-96', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (245, 'usr-siswa-97', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (246, 'usr-siswa-98', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (247, 'usr-siswa-99', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (248, 'usr-siswa-100', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (249, 'usr-siswa-101', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (250, 'usr-siswa-102', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (251, 'usr-siswa-103', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (252, 'usr-siswa-104', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (253, 'usr-siswa-105', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (254, 'usr-siswa-106', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (255, 'usr-siswa-107', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (256, 'usr-siswa-108', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (257, 'usr-siswa-109', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (258, 'usr-siswa-110', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (259, 'usr-siswa-111', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (260, 'usr-siswa-112', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (261, 'usr-siswa-113', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (262, 'usr-siswa-114', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (263, 'usr-siswa-115', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (264, 'usr-siswa-116', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (265, 'usr-siswa-117', 'siswa', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (266, 'usr-guru-1', 'kamad', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (267, 'usr-guru-2', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (268, 'usr-guru-3', 'admin_akademik', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (269, 'usr-guru-4', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (270, 'usr-guru-5', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (271, 'usr-guru-6', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (272, 'usr-guru-7', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (273, 'usr-guru-8', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (274, 'usr-guru-9', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (275, 'usr-guru-10', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (276, 'usr-guru-11', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (277, 'usr-guru-12', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (278, 'usr-guru-13', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (279, 'usr-guru-14', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (280, 'usr-guru-15', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (281, 'usr-guru-16', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (282, 'usr-guru-17', 'walikelas', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (283, 'usr-guru-18', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (284, 'usr-guru-19', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (285, 'usr-guru-20', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (286, 'usr-guru-21', 'waka', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (287, 'usr-guru-22', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (288, 'usr-guru-23', 'walikelas', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (289, 'usr-guru-24', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (290, 'usr-guru-25', 'admin_akademik', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (291, 'usr-guru-26', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (292, 'usr-guru-27', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (293, 'usr-guru-28', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (294, 'usr-guru-29', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (295, 'usr-guru-30', 'walikelas', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (296, 'usr-guru-31', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (297, 'usr-guru-32', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (298, 'usr-guru-33', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (299, 'usr-guru-34', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (300, 'usr-guru-35', 'walikelas', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (301, 'usr-guru-36', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (302, 'usr-guru-37', 'guru', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (303, 'usr-guru-38', 'walikelas', '2026-08-06 17:19:33');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (304, 'usr-admin-1', 'admin', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (305, 'usr-kamad-1', 'kamad', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (306, 'usr-waka-1', 'waka', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (307, 'usr-walikelas-1', 'walikelas', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (308, 'usr-guru-1', 'guru', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (309, 'usr-siswa-1', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (310, 'usr-siswa-1', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (311, 'usr-siswa-2', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (312, 'usr-siswa-3', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (313, 'usr-siswa-4', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (314, 'usr-siswa-5', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (315, 'usr-siswa-6', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (316, 'usr-siswa-7', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (317, 'usr-siswa-8', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (318, 'usr-siswa-9', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (319, 'usr-siswa-10', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (320, 'usr-siswa-11', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (321, 'usr-siswa-12', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (322, 'usr-siswa-13', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (323, 'usr-siswa-14', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (324, 'usr-siswa-15', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (325, 'usr-siswa-16', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (326, 'usr-siswa-17', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (327, 'usr-siswa-18', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (328, 'usr-siswa-19', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (329, 'usr-siswa-20', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (330, 'usr-siswa-21', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (331, 'usr-siswa-22', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (332, 'usr-siswa-23', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (333, 'usr-siswa-24', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (334, 'usr-siswa-25', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (335, 'usr-siswa-26', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (336, 'usr-siswa-27', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (337, 'usr-siswa-28', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (338, 'usr-siswa-29', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (339, 'usr-siswa-30', 'siswa', '2026-08-06 17:22:54');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (340, 'usr-siswa-31', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (341, 'usr-siswa-32', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (342, 'usr-siswa-33', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (343, 'usr-siswa-34', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (344, 'usr-siswa-35', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (345, 'usr-siswa-36', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (346, 'usr-siswa-37', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (347, 'usr-siswa-38', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (348, 'usr-siswa-39', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (349, 'usr-siswa-40', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (350, 'usr-siswa-41', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (351, 'usr-siswa-42', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (352, 'usr-siswa-43', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (353, 'usr-siswa-44', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (354, 'usr-siswa-45', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (355, 'usr-siswa-46', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (356, 'usr-siswa-47', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (357, 'usr-siswa-48', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (358, 'usr-siswa-49', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (359, 'usr-siswa-50', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (360, 'usr-siswa-51', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (361, 'usr-siswa-52', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (362, 'usr-siswa-53', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (363, 'usr-siswa-54', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (364, 'usr-siswa-55', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (365, 'usr-siswa-56', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (366, 'usr-siswa-57', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (367, 'usr-siswa-58', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (368, 'usr-siswa-59', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (369, 'usr-siswa-60', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (370, 'usr-siswa-61', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (371, 'usr-siswa-62', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (372, 'usr-siswa-63', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (373, 'usr-siswa-64', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (374, 'usr-siswa-65', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (375, 'usr-siswa-66', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (376, 'usr-siswa-67', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (377, 'usr-siswa-68', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (378, 'usr-siswa-69', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (379, 'usr-siswa-70', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (380, 'usr-siswa-71', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (381, 'usr-siswa-72', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (382, 'usr-siswa-73', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (383, 'usr-siswa-74', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (384, 'usr-siswa-75', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (385, 'usr-siswa-76', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (386, 'usr-siswa-77', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (387, 'usr-siswa-78', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (388, 'usr-siswa-79', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (389, 'usr-siswa-80', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (390, 'usr-siswa-81', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (391, 'usr-siswa-82', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (392, 'usr-siswa-83', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (393, 'usr-siswa-84', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (394, 'usr-siswa-85', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (395, 'usr-siswa-86', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (396, 'usr-siswa-87', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (397, 'usr-siswa-88', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (398, 'usr-siswa-89', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (399, 'usr-siswa-90', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (400, 'usr-siswa-91', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (401, 'usr-siswa-92', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (402, 'usr-siswa-93', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (403, 'usr-siswa-94', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (404, 'usr-siswa-95', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (405, 'usr-siswa-96', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (406, 'usr-siswa-97', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (407, 'usr-siswa-98', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (408, 'usr-siswa-99', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (409, 'usr-siswa-100', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (410, 'usr-siswa-101', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (411, 'usr-siswa-102', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (412, 'usr-siswa-103', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (413, 'usr-siswa-104', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (414, 'usr-siswa-105', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (415, 'usr-siswa-106', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (416, 'usr-siswa-107', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (417, 'usr-siswa-108', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (418, 'usr-siswa-109', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (419, 'usr-siswa-110', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (420, 'usr-siswa-111', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (421, 'usr-siswa-112', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (422, 'usr-siswa-113', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (423, 'usr-siswa-114', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (424, 'usr-siswa-115', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (425, 'usr-siswa-116', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (426, 'usr-siswa-117', 'siswa', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (427, 'usr-guru-1', 'kamad', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (428, 'usr-guru-2', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (429, 'usr-guru-3', 'admin_akademik', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (430, 'usr-guru-4', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (431, 'usr-guru-5', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (432, 'usr-guru-6', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (433, 'usr-guru-7', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (434, 'usr-guru-8', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (435, 'usr-guru-9', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (436, 'usr-guru-10', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (437, 'usr-guru-11', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (438, 'usr-guru-12', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (439, 'usr-guru-13', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (440, 'usr-guru-14', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (441, 'usr-guru-15', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (442, 'usr-guru-16', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (443, 'usr-guru-17', 'walikelas', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (444, 'usr-guru-18', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (445, 'usr-guru-19', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (446, 'usr-guru-20', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (447, 'usr-guru-21', 'waka', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (448, 'usr-guru-22', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (449, 'usr-guru-23', 'walikelas', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (450, 'usr-guru-24', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (451, 'usr-guru-25', 'admin_akademik', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (452, 'usr-guru-26', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (453, 'usr-guru-27', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (454, 'usr-guru-28', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (455, 'usr-guru-29', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (456, 'usr-guru-30', 'walikelas', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (457, 'usr-guru-31', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (458, 'usr-guru-32', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (459, 'usr-guru-33', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (460, 'usr-guru-34', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (461, 'usr-guru-35', 'walikelas', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (462, 'usr-guru-36', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (463, 'usr-guru-37', 'guru', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (464, 'usr-guru-38', 'walikelas', '2026-08-06 17:22:55');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (465, 'usr-admin-1', 'admin', '2026-08-06 17:23:00');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (466, 'usr-kamad-1', 'kamad', '2026-08-06 17:23:00');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (467, 'usr-waka-1', 'waka', '2026-08-06 17:23:00');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (468, 'usr-walikelas-1', 'walikelas', '2026-08-06 17:23:00');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (469, 'usr-guru-1', 'guru', '2026-08-06 17:23:00');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (470, 'usr-siswa-1', 'siswa', '2026-08-06 17:23:00');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (471, 'usr-admin-1', 'admin', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (472, 'usr-kamad-1', 'kamad', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (473, 'usr-waka-1', 'waka', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (474, 'usr-walikelas-1', 'walikelas', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (475, 'usr-guru-1', 'guru', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (476, 'usr-siswa-1', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (477, 'usr-siswa-1', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (478, 'usr-siswa-2', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (479, 'usr-siswa-3', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (480, 'usr-siswa-4', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (481, 'usr-siswa-5', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (482, 'usr-siswa-6', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (483, 'usr-siswa-7', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (484, 'usr-siswa-8', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (485, 'usr-siswa-9', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (486, 'usr-siswa-10', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (487, 'usr-siswa-11', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (488, 'usr-siswa-12', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (489, 'usr-siswa-13', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (490, 'usr-siswa-14', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (491, 'usr-siswa-15', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (492, 'usr-siswa-16', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (493, 'usr-siswa-17', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (494, 'usr-siswa-18', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (495, 'usr-siswa-19', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (496, 'usr-siswa-20', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (497, 'usr-siswa-21', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (498, 'usr-siswa-22', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (499, 'usr-siswa-23', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (500, 'usr-siswa-24', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (501, 'usr-siswa-25', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (502, 'usr-siswa-26', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (503, 'usr-siswa-27', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (504, 'usr-siswa-28', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (505, 'usr-siswa-29', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (506, 'usr-siswa-30', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (507, 'usr-siswa-31', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (508, 'usr-siswa-32', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (509, 'usr-siswa-33', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (510, 'usr-siswa-34', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (511, 'usr-siswa-35', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (512, 'usr-siswa-36', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (513, 'usr-siswa-37', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (514, 'usr-siswa-38', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (515, 'usr-siswa-39', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (516, 'usr-siswa-40', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (517, 'usr-siswa-41', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (518, 'usr-siswa-42', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (519, 'usr-siswa-43', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (520, 'usr-siswa-44', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (521, 'usr-siswa-45', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (522, 'usr-siswa-46', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (523, 'usr-siswa-47', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (524, 'usr-siswa-48', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (525, 'usr-siswa-49', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (526, 'usr-siswa-50', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (527, 'usr-siswa-51', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (528, 'usr-siswa-52', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (529, 'usr-siswa-53', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (530, 'usr-siswa-54', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (531, 'usr-siswa-55', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (532, 'usr-siswa-56', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (533, 'usr-siswa-57', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (534, 'usr-siswa-58', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (535, 'usr-siswa-59', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (536, 'usr-siswa-60', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (537, 'usr-siswa-61', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (538, 'usr-siswa-62', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (539, 'usr-siswa-63', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (540, 'usr-siswa-64', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (541, 'usr-siswa-65', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (542, 'usr-siswa-66', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (543, 'usr-siswa-67', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (544, 'usr-siswa-68', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (545, 'usr-siswa-69', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (546, 'usr-siswa-70', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (547, 'usr-siswa-71', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (548, 'usr-siswa-72', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (549, 'usr-siswa-73', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (550, 'usr-siswa-74', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (551, 'usr-siswa-75', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (552, 'usr-siswa-76', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (553, 'usr-siswa-77', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (554, 'usr-siswa-78', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (555, 'usr-siswa-79', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (556, 'usr-siswa-80', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (557, 'usr-siswa-81', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (558, 'usr-siswa-82', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (559, 'usr-siswa-83', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (560, 'usr-siswa-84', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (561, 'usr-siswa-85', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (562, 'usr-siswa-86', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (563, 'usr-siswa-87', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (564, 'usr-siswa-88', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (565, 'usr-siswa-89', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (566, 'usr-siswa-90', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (567, 'usr-siswa-91', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (568, 'usr-siswa-92', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (569, 'usr-siswa-93', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (570, 'usr-siswa-94', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (571, 'usr-siswa-95', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (572, 'usr-siswa-96', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (573, 'usr-siswa-97', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (574, 'usr-siswa-98', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (575, 'usr-siswa-99', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (576, 'usr-siswa-100', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (577, 'usr-siswa-101', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (578, 'usr-siswa-102', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (579, 'usr-siswa-103', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (580, 'usr-siswa-104', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (581, 'usr-siswa-105', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (582, 'usr-siswa-106', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (583, 'usr-siswa-107', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (584, 'usr-siswa-108', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (585, 'usr-siswa-109', 'siswa', '2026-08-06 17:23:10');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (586, 'usr-siswa-110', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (587, 'usr-siswa-111', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (588, 'usr-siswa-112', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (589, 'usr-siswa-113', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (590, 'usr-siswa-114', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (591, 'usr-siswa-115', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (592, 'usr-siswa-116', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (593, 'usr-siswa-117', 'siswa', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (594, 'usr-guru-1', 'kamad', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (595, 'usr-guru-2', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (596, 'usr-guru-3', 'admin_akademik', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (597, 'usr-guru-4', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (598, 'usr-guru-5', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (599, 'usr-guru-6', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (600, 'usr-guru-7', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (601, 'usr-guru-8', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (602, 'usr-guru-9', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (603, 'usr-guru-10', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (604, 'usr-guru-11', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (605, 'usr-guru-12', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (606, 'usr-guru-13', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (607, 'usr-guru-14', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (608, 'usr-guru-15', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (609, 'usr-guru-16', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (610, 'usr-guru-17', 'walikelas', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (611, 'usr-guru-18', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (612, 'usr-guru-19', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (613, 'usr-guru-20', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (614, 'usr-guru-21', 'waka', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (615, 'usr-guru-22', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (616, 'usr-guru-23', 'walikelas', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (617, 'usr-guru-24', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (618, 'usr-guru-25', 'admin_akademik', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (619, 'usr-guru-26', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (620, 'usr-guru-27', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (621, 'usr-guru-28', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (622, 'usr-guru-29', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (623, 'usr-guru-30', 'walikelas', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (624, 'usr-guru-31', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (625, 'usr-guru-32', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (626, 'usr-guru-33', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (627, 'usr-guru-34', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (628, 'usr-guru-35', 'walikelas', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (629, 'usr-guru-36', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (630, 'usr-guru-37', 'guru', '2026-08-06 17:23:11');
INSERT INTO user_roles (id, user_id, role, created_at) VALUES (631, 'usr-guru-38', 'walikelas', '2026-08-06 17:23:11');

CREATE TABLE `user_sessions` (
  `id` varchar(64) NOT NULL,
  `user_id` varchar(64) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `nis_nip` varchar(50) DEFAULT NULL,
  `class_name` varchar(50) DEFAULT NULL,
  `subject_specialty` varchar(100) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at, created_at) VALUES ('sess_1787416897942_jdi49314iwan82ueqndpih', 'usr-admin-1', 'admin@mail.com', 'admin', 'Super Administrator MTsN 2', '198501012010011001', NULL, NULL, '2026-08-23 09:41:37', '2026-08-22 16:41:37');
INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at, created_at) VALUES ('sess_1787417074994_91rm97trdgagrtnnp5550j', 'usr-admin-1', 'admin@mail.com', 'admin', 'Super Administrator MTsN 2', '198501012010011001', NULL, NULL, '2026-08-23 09:44:34', '2026-08-22 16:44:34');
INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at, created_at) VALUES ('sess_1787417254177_ky84lcoyux2vx7pswo4a9', 'usr-admin-1', 'admin@mail.com', 'admin', 'Super Administrator MTsN 2', '198501012010011001', NULL, NULL, '2026-08-23 09:47:34', '2026-08-22 16:47:34');
INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at, created_at) VALUES ('sess_1787418223984_srakn04wtzlm9wcm437ako', 'usr-guru-34', '199711302025052006@guru.mtsn2cilacap.sch.id', 'guru', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '199711302025052006', NULL, 'Pendidikan Kewarganegaraan', '2026-08-23 10:03:43', '2026-08-22 17:03:43');
INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at, created_at) VALUES ('sess_1787509998948_xc4y67o8gnral63cahcll', 'usr-guru-34', '199711302025052006@guru.mtsn2cilacap.sch.id', 'guru', 'ANGGUN NOVTALIA BERLIAN, S.Pd', '199711302025052006', NULL, 'Pendidikan Kewarganegaraan', '2026-08-24 11:33:18', '2026-08-23 18:33:18');
INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at, created_at) VALUES ('sess_1787519039406_yficq7ldsr9xmcx5g1by9', 'usr-guru-17', '197906142007102002@guru.mtsn2cilacap.sch.id', 'walikelas', 'SOBIYATI, S.Pd', '197906142007102002', 'VIII A', 'Bahasa Indonesia', '2026-08-24 14:03:59', '2026-08-23 21:03:59');
INSERT INTO user_sessions (id, user_id, email, role, full_name, nis_nip, class_name, subject_specialty, expires_at, created_at) VALUES ('sess_1787580110476_kspez2msev8lqqw7jekg5b', 'usr-siswa-88', '0121082428@siswa.mtsn2cilacap.sch.id', 'siswa', 'AHMAD DAFFA', '0121082428', 'IX-B', NULL, '2026-08-25 07:01:50', '2026-08-24 14:01:50');

CREATE TABLE `users` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `identity_type` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NISN',
  `nis_nip` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_name` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subject_specialty` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'siswa',
  `avatar_url` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-admin-1', 'admin@mail.com', '$2b$10$ic413PmSqPSZu/8mWeUjd.rCvdzs6A101MneRJ0bJgpmBCZeINsWy', 'Super Administrator MTsN 2', 'NISN', '198501012010011001', NULL, NULL, 'admin', NULL, '2026-07-28 19:57:36', '2026-08-22 16:40:49');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-1', 'guru@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'H. SOLIHUN, S.Pd., M.Si', 'NISN', '198005122006042005', 'VIII A', NULL, 'kamad', NULL, '2026-07-28 19:57:36', '2026-08-06 17:23:11');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-10', '197509192009012008@guru.mtsn2cilacap.sch.id', 'asd123', 'UMI KHAFSOH, S.Pd', 'NIP', '197509192009012008', NULL, 'Ilmu Pendidikan Sosial', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-11', '197602012007011019@guru.mtsn2cilacap.sch.id', 'asd123', 'WAKHIBUN, S.P', 'NIP', '197602012007011019', NULL, 'Akidah Akhlak', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-12', '197705132007101002@guru.mtsn2cilacap.sch.id', 'asd123', 'SAYONO, S.Pd., M.Pd.', 'NIP', '197705132007101002', NULL, 'Matematika', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-13', '197710212007101001@guru.mtsn2cilacap.sch.id', 'asd123', 'WAHYUDIN, S', 'NIP', '197710212007101001', NULL, 'Bahasa Arab', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-14', '197804212009012004@guru.mtsn2cilacap.sch.id', 'asd123', 'NAZIHATUN ZUHRIYAH, S.Pd.', 'NIP', '197804212009012004', NULL, 'Ilmu Pendidikan Sosial', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-15', '197806212007101002@guru.mtsn2cilacap.sch.id', 'asd123', 'RIDHO ANSHORI, S.Pd., M.Pd', 'NIP', '197806212007101002', NULL, 'Bahasa Inggris', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-16', '197807072007102001@guru.mtsn2cilacap.sch.id', 'asd123', 'CARYATI,', 'NIP', '197807072007102001', NULL, 'Fikih', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-17', '197906142007102002@guru.mtsn2cilacap.sch.id', '$2b$10$mA25HT.eI4nMn47ayn5eG.by8IZdMtbuKG.bnAPicgQxBKQkustzu', 'SOBIYATI, S.Pd', 'NIP', '197906142007102002', 'VIII A', 'Bahasa Indonesia', 'walikelas', NULL, '2026-08-06 17:19:33', '2026-08-23 21:03:59');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-18', '198002152007102002@guru.mtsn2cilacap.sch.id', 'asd123', 'DAISAH, S.Pd', 'NIP', '198002152007102002', NULL, 'Bahasa Indonesia', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-19', '198007172005012001@guru.mtsn2cilacap.sch.id', 'asd123', 'H. ANI YULIANI, S.Pd', 'NIP', '198007172005012001', NULL, 'Matematika', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-2', '196909081998032001@guru.mtsn2cilacap.sch.id', 'asd123', 'Hj. NANGIMAH, S.', 'NIP', '196909081998032001', NULL, 'Bahasa Indonesia', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-20', '198102062007102003@guru.mtsn2cilacap.sch.id', 'asd123', 'CETY MAHARSY, S.Pd', 'NIP', '198102062007102003', NULL, 'Bahasa Inggris', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-21', '198302142023211010@guru.mtsn2cilacap.sch.id', '$2b$10$yNX051VTo2QtmwGLugJrsuGIRI3j2/1SLod.IAasap8p.C74Iv7GO', 'ALI MANSUR, S.Pd', 'NIP', '198302142023211010', NULL, 'Ilmu Pendidikan Sosial', 'waka', NULL, '2026-08-06 17:19:33', '2026-08-25 11:45:27');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-22', '198409142023211019@guru.mtsn2cilacap.sch.id', 'asd123', 'ASROR HIDAYAT, S.Pd', 'NIP', '198409142023211019', NULL, 'Bimbingan dan Konseling', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-23', '199011022025212013@guru.mtsn2cilacap.sch.id', 'asd123', 'NOVANTYA KARTIKAWATI, S.Pd', 'NIP', '199011022025212013', 'IX A', 'Ilmu Pendidikan Alam', 'walikelas', NULL, '2026-08-06 17:19:33', '2026-08-22 01:43:24');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-24', '199202022023211045@guru.mtsn2cilacap.sch.id', 'asd123', 'HASIS SYARIFUDIN, S.Pd', 'NIP', '199202022023211045', NULL, 'Prakarya dan Seni Budaya', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-25', '199204042025051002@guru.mtsn2cilacap.sch.id', '$argon2id$v=19$m=16384,t=2,p=1$DSUqY2TIlksMIjhOWgsWIQ$i6Ya+hFqtW3Pr3EcCQimdCCQ2LBSvvwOlpVzCuz4leY', 'AH. SYARIF HIDAYAH, S.Pd.I', 'NIP', '199204042025051002', NULL, 'Al Qur''an Hadis', 'admin_akademik,guru,walikelas', NULL, '2026-08-06 17:19:33', '2026-08-22 04:37:17');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-26', '199204152023212049@guru.mtsn2cilacap.sch.id', 'asd123', 'STEFI APRIONITA SETYO ARUM, S.Pd', 'NIP', '199204152023212049', NULL, 'Ilmu Pendidikan Alam', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-27', '199301292025212006@guru.mtsn2cilacap.sch.id', 'asd123', 'IFTI NURROHMAH, S.Pd', 'NIP', '199301292025212006', NULL, 'Matematika', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-28', '199309192023211016@guru.mtsn2cilacap.sch.id', 'asd123', 'MASRUKHAN, S.Pd', 'NIP', '199309192023211016', NULL, 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-29', '199405142019032021@guru.mtsn2cilacap.sch.id', 'asd123', 'ENDAH SUPRIHATIN, S.Pd', 'NIP', '199405142019032021', NULL, 'Bahasa Arab', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-3', '197002272005011001@guru.mtsn2cilacap.sch.id', '$2b$10$Hl6OoVR.E1vgXPF8k8NXHOLklruPOHD0fLt80cUDW6mrDYB19heey', 'ACHMAD MAKMUN ROSID, S.Pd., M.Pd', 'NIP', '197002272005011001', 'VIII B', 'Bahasa Inggris', 'walikelas', NULL, '2026-08-06 17:19:33', '2026-08-25 12:25:18');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-30', '199508182023212044@guru.mtsn2cilacap.sch.id', 'asd123', 'MAULIDIA NURUL IZATI, S.Pd', 'NIP', '199508182023212044', 'VII A', 'Bimbingan dan Konseling', 'walikelas', NULL, '2026-08-06 17:19:33', '2026-08-22 01:43:24');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-31', '199611202025211009@guru.mtsn2cilacap.sch.id', 'asd123', 'ILHAM HABIBI, S.Pd', 'NIP', '199611202025211009', NULL, 'Ilmu Pendidikan Alam', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-32', '199701112025211009@guru.mtsn2cilacap.sch.id', 'asd123', 'MISBAH AHMAD DANI, S.Pd', 'NIP', '199701112025211009', NULL, 'Al Qur''an Hadis', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-33', '199711212025212010@guru.mtsn2cilacap.sch.id', 'asd123', 'SASI VIVIANI, S.Pd', 'NIP', '199711212025212010', NULL, 'Bahasa Inggris', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-34', '199711302025052006@guru.mtsn2cilacap.sch.id', '$2b$10$l6505ssOOUMOKs4zek07aud.Co3EFd/5iMe/fvbbmTPFqBRiCXsmi', 'ANGGUN NOVTALIA BERLIAN, S.Pd', 'NIP', '199711302025052006', NULL, 'Pendidikan Kewarganegaraan', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-23 18:33:18');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-35', '199712302024212037@guru.mtsn2cilacap.sch.id', 'asd123', 'INDAH NURROHMAH, S.Pd', 'NIP', '199712302024212037', 'IX B', 'Bahasa Inggris', 'walikelas', NULL, '2026-08-06 17:19:33', '2026-08-22 01:43:24');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-36', '199804202025052007@guru.mtsn2cilacap.sch.id', 'asd123', 'SARAH SAFIRA, S.Pd', 'NIP', '199804202025052007', NULL, 'Bimbingan dan Konseling', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-37', '199810202025052006@guru.mtsn2cilacap.sch.id', 'asd123', 'HIKMATUL ASTRI AZKIYA, S.Pd', 'NIP', '199810202025052006', NULL, 'Ilmu Pendidikan Alam', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-38', '12345678@guru.mtsn2cilacap.sch.id', 'asd123', 'RINDANG FARIHA IDANA, S.Pd', 'NIP', '12345678', 'VII B', 'Bahasa Jawa', 'walikelas', NULL, '2026-08-06 17:19:33', '2026-08-22 01:43:24');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-4', '197004082007012025@guru.mtsn2cilacap.sch.id', 'asd123', 'MAHMUDAH, S.', 'NIP', '197004082007012025', NULL, 'Akidah Akhlak', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-5', '197109302007012011@guru.mtsn2cilacap.sch.id', 'asd123', 'Hj. SITI MUHSINAH, S', 'NIP', '197109302007012011', NULL, 'Bahasa Arab', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-6', '197311232005011004@guru.mtsn2cilacap.sch.id', 'asd123', 'H. DASIRUN, S.Ag., M.Pd.I', 'NIP', '197311232005011004', NULL, 'Sejarah Kebudayaan Islam', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-7', '197311252007102001@guru.mtsn2cilacap.sch.id', 'asd123', 'SRIYANI KUNTARI, S.Pd', 'NIP', '197311252007102001', NULL, 'Matematika', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-8', '197312112007011021@guru.mtsn2cilacap.sch.id', 'asd123', 'TEGUH WIYONO, S.Pd', 'NIP', '197312112007011021', NULL, 'Pendidikan Jasmani, Olahraga dan Kesehatan', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-guru-9', '197405022007101003@guru.mtsn2cilacap.sch.id', 'asd123', 'MUHTAMAM, S.Ag., M.Pd.I', 'NIP', '197405022007101003', NULL, 'Fikih', 'guru', NULL, '2026-08-06 17:19:33', '2026-08-06 17:19:33');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-kamad-1', 'kamad@mtsn2cilacap.sch.id', '$argon2id$v=19$m=16384,t=2,p=1$DSUqY2TIlksMIjhOWgsWIQ$9s9nFYoXBAzUa2TmQOVDx/5z9Zu1i0qgJiwaUisPPXU', 'Drs. H. Hidayatullah, M.Ag', 'NISN', '197203151998031002', NULL, NULL, 'kamad', NULL, '2026-07-28 19:57:36', '2026-08-10 14:59:58');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-1', 'siswa@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'ALIYA QIARA ABDULLAH', 'NISN', '0127790481', 'VIII-A', NULL, 'siswa', NULL, '2026-07-28 19:57:36', '2026-08-22 02:03:56');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-10', '0134634710@siswa.mtsn2cilacap.sch.id', 'asd123', 'KHAYRA TRI APRILIANI', 'NISN', '0134634710', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-100', '3120697873@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMMAD HAIKAL ASRI', 'NISN', '3120697873', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-101', '3104661653@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMMAD NAUFAL NASHIRUL HAQ', 'NISN', '3104661653', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-102', '0128969219@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMMAD SYAFI MUTAMMAM', 'NISN', '0128969219', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-103', '0126867483@siswa.mtsn2cilacap.sch.id', 'asd123', 'NAILA NATANIA AZZARA', 'NISN', '0126867483', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-104', '3130847809@siswa.mtsn2cilacap.sch.id', 'asd123', 'NAJWA NUR AFIFAH', 'NISN', '3130847809', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-105', '0127454810@siswa.mtsn2cilacap.sch.id', 'asd123', 'NURUL HIKMAH RAMADHANI', 'NISN', '0127454810', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-106', '0111843516@siswa.mtsn2cilacap.sch.id', 'asd123', 'RASYA JABBAR RIFQI RIZQULLOH', 'NISN', '0111843516', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-107', '3121731162@siswa.mtsn2cilacap.sch.id', 'asd123', 'REZA FADLU RAMADHANI', 'NISN', '3121731162', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-108', '0123766654@siswa.mtsn2cilacap.sch.id', 'asd123', 'RIDLO FAIZ MUBAROK', 'NISN', '0123766654', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-109', '0115359428@siswa.mtsn2cilacap.sch.id', 'asd123', 'RIFQOH TYAS AFADILA', 'NISN', '0115359428', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-11', '3136366787@siswa.mtsn2cilacap.sch.id', 'asd123', 'MAITSAA ATIKAH AZZAHRA', 'NISN', '3136366787', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-110', '0126845515@siswa.mtsn2cilacap.sch.id', 'asd123', 'SHAFA NUR AULIA', 'NISN', '0126845515', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-111', '3122521292@siswa.mtsn2cilacap.sch.id', 'asd123', 'SUBKHAN NAWWAF', 'NISN', '3122521292', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-112', '3126120542@siswa.mtsn2cilacap.sch.id', 'asd123', 'SYAFIIQOH AULIA', 'NISN', '3126120542', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-113', '0114891264@siswa.mtsn2cilacap.sch.id', 'asd123', 'TAHTA AGUNG RAHARTO', 'NISN', '0114891264', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-114', '0124664078@siswa.mtsn2cilacap.sch.id', 'asd123', 'WAHYU MAZYA FILKHIYA', 'NISN', '0124664078', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-115', '3122330903@siswa.mtsn2cilacap.sch.id', 'asd123', 'WINA WIJAYANTI', 'NISN', '3122330903', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-116', '0123852660@siswa.mtsn2cilacap.sch.id', 'asd123', 'WINDA NUR SAFIKA', 'NISN', '0123852660', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-117', '0126865403@siswa.mtsn2cilacap.sch.id', 'asd123', 'ZAINUN AGIL RAFA SYIBAWAIHIN', 'NISN', '0126865403', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-12', '0129365012@siswa.mtsn2cilacap.sch.id', 'asd123', 'MAULANA FIKRI', 'NISN', '0129365012', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-13', '0138362320@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMAD ACHSAN SANJAYA', 'NISN', '0138362320', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-14', '0122054715@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMMAD FATWA ADHWA NIYAZ', 'NISN', '0122054715', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-15', '0131645134@siswa.mtsn2cilacap.sch.id', 'asd123', 'NAFISAH AQILATUL HAFSOH', 'NISN', '0131645134', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-16', '0123372321@siswa.mtsn2cilacap.sch.id', 'asd123', 'NAKHLAH ZAHIYA PUTRI', 'NISN', '0123372321', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-17', '0124702907@siswa.mtsn2cilacap.sch.id', 'asd123', 'NANDA CANTIKA PUTRI MAMENTIWALO', 'NISN', '0124702907', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-18', '0121552970@siswa.mtsn2cilacap.sch.id', 'asd123', 'NAYLA HURY MAHFUDZ', 'NISN', '0121552970', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-19', '0107389917@siswa.mtsn2cilacap.sch.id', 'asd123', 'NUR LAELA SARI', 'NISN', '0107389917', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-2', '0132249055@siswa.mtsn2cilacap.sch.id', 'asd123', 'AQILAA AAMIRATUL YUMNA', 'NISN', '0132249055', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-20', '3127411298@siswa.mtsn2cilacap.sch.id', 'asd123', 'SAFIRA FIRDAYANTI SALAMAH', 'NISN', '3127411298', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-21', '3136185458@siswa.mtsn2cilacap.sch.id', 'asd123', 'SATRIO DAMAR LUMAKSITO', 'NISN', '3136185458', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-22', '3128340444@siswa.mtsn2cilacap.sch.id', 'asd123', 'SONIA USWATUL BAROROH', 'NISN', '3128340444', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-23', '0132640527@siswa.mtsn2cilacap.sch.id', 'asd123', 'SYALUM SAKHILA DAMAYANTI', 'NISN', '0132640527', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-24', '0123801767@siswa.mtsn2cilacap.sch.id', 'asd123', 'TALITA HANA NISA HUZAIFAH', 'NISN', '0123801767', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-25', '3136821272@siswa.mtsn2cilacap.sch.id', 'asd123', 'UWI JAYA SAKTI', 'NISN', '3136821272', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-26', '0131398025@siswa.mtsn2cilacap.sch.id', 'asd123', 'WIWIN EKA RINJANI', 'NISN', '0131398025', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-27', '0133420828@siswa.mtsn2cilacap.sch.id', 'asd123', 'AFFANDI ANGGIT PRATAMA', 'NISN', '0133420828', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-28', '3121224054@siswa.mtsn2cilacap.sch.id', 'asd123', 'AFINDA MULIA ROKHMAH', 'NISN', '3121224054', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-29', '3138661737@siswa.mtsn2cilacap.sch.id', '$2b$10$P4Ey9aHdAhEFGK4wkuxi/u3RQSw29GnDbFlvUsT/Inyw7l3vf5Gxu', 'AISYAH NUR WAHYUNI', 'NISN', '3138661737', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-25 12:22:30');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-3', '3137647595@siswa.mtsn2cilacap.sch.id', 'asd123', 'CITRA FEBI HASIFA', 'NISN', '3137647595', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-30', '0139847558@siswa.mtsn2cilacap.sch.id', 'asd123', 'ALIFAH KALTSUM ZAHRANI PURNOMO', 'NISN', '0139847558', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-31', '0127191673@siswa.mtsn2cilacap.sch.id', 'asd123', 'ALIZA OKTAVIANI PUTRI', 'NISN', '0127191673', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-32', '3133675161@siswa.mtsn2cilacap.sch.id', 'asd123', 'DAFFA ADYASTA DANISH SETYAWAN', 'NISN', '3133675161', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-33', '0126160636@siswa.mtsn2cilacap.sch.id', 'asd123', 'DHIYA MAITSA PUTRI NURISTA', 'NISN', '0126160636', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-34', '0129348095@siswa.mtsn2cilacap.sch.id', 'asd123', 'DIMAS SEPTA AZHARI', 'NISN', '0129348095', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-35', '3129995907@siswa.mtsn2cilacap.sch.id', 'asd123', 'DINDA IMANIAR HERLANA', 'NISN', '3129995907', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-36', '0137628608@siswa.mtsn2cilacap.sch.id', 'asd123', 'FARRENIA ARISTA WIDYA', 'NISN', '0137628608', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-37', '0124903582@siswa.mtsn2cilacap.sch.id', 'asd123', 'FAYZA ANINDYA EFENDI', 'NISN', '0124903582', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-38', '0133645526@siswa.mtsn2cilacap.sch.id', 'asd123', 'HANSA SABIHA', 'NISN', '0133645526', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-39', '0132134024@siswa.mtsn2cilacap.sch.id', 'asd123', 'HELFAN EFENDY', 'NISN', '0132134024', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-4', '3130470613@siswa.mtsn2cilacap.sch.id', 'asd123', 'DINA FAJRIA ASSA NASSAKI', 'NISN', '3130470613', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-40', '3127292377@siswa.mtsn2cilacap.sch.id', 'asd123', 'HUSNIYATUL KAUNI', 'NISN', '3127292377', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-41', '0121571848@siswa.mtsn2cilacap.sch.id', 'asd123', 'INTAN NUR PUTRI AULIA', 'NISN', '0121571848', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-42', '0123419194@siswa.mtsn2cilacap.sch.id', 'asd123', 'IQLIMATUL LAELI ADRESS', 'NISN', '0123419194', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-43', '3122643827@siswa.mtsn2cilacap.sch.id', 'asd123', 'IZZA GANDIT PRATAMA', 'NISN', '3122643827', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-44', '3121635074@siswa.mtsn2cilacap.sch.id', 'asd123', 'MARWAH AURA MAWARDHANI', 'NISN', '3121635074', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-45', '0139466898@siswa.mtsn2cilacap.sch.id', 'asd123', 'MIKAYLA ROJABIYA', 'NISN', '0139466898', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-46', '0134446670@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUJAHIDAH FILLAH', 'NISN', '0134446670', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-47', '0138970545@siswa.mtsn2cilacap.sch.id', 'asd123', 'NOVAN APRILIANSYAH', 'NISN', '0138970545', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-48', '0134522326@siswa.mtsn2cilacap.sch.id', 'asd123', 'PANDAWA RAFA RAMADHAN', 'NISN', '0134522326', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-49', '0131586460@siswa.mtsn2cilacap.sch.id', 'asd123', 'PUTRI FITIYA AZZAHRA', 'NISN', '0131586460', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-5', '3121802138@siswa.mtsn2cilacap.sch.id', 'asd123', 'FAIDATUL HUSNA ASFIA', 'NISN', '3121802138', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-50', '0135397614@siswa.mtsn2cilacap.sch.id', 'asd123', 'RANGGA SATYA UTAMA', 'NISN', '0135397614', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-51', '0127377941@siswa.mtsn2cilacap.sch.id', 'asd123', 'ROHMAN LUTFI NAHAR', 'NISN', '0127377941', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-52', '0126739408@siswa.mtsn2cilacap.sch.id', 'asd123', 'SAYYID HAEYKAL KHABIBULLOH', 'NISN', '0126739408', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-53', '0135932663@siswa.mtsn2cilacap.sch.id', 'asd123', 'ZAKI RIZKI RAMADHAN', 'NISN', '0135932663', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-54', '3124400854@siswa.mtsn2cilacap.sch.id', 'asd123', 'ZHAVIRA AZHAAR MYCHAELA', 'NISN', '3124400854', 'VIII-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-55', '3123334074@siswa.mtsn2cilacap.sch.id', '$2b$10$5q1FwYoMcITKSQdHpGFOUuBbK0XGKYxGfNQDrxucg0lJxHkAZGVt6', 'ABIGAIL HASAN YUSUF PUTRA INDONESIA', 'NISN', '3123334074', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-24 02:31:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-56', '3121121358@siswa.mtsn2cilacap.sch.id', 'asd123', 'ABIMAIL HUSEN IBRAHIM PUTRA INDONESIA', 'NISN', '3121121358', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-57', '3121331541@siswa.mtsn2cilacap.sch.id', '$2b$10$bEf7Qq2fg/egquA7Zw3zaOgVFd0FfYkH93pCNCUHl8oxeCEszPvWO', 'AHMAD NIZAM NUR FAIZIN', 'NISN', '3121331541', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-24 13:54:42');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-58', '0127071279@siswa.mtsn2cilacap.sch.id', 'asd123', 'AHMAD SABIHIS', 'NISN', '0127071279', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-59', '3122531880@siswa.mtsn2cilacap.sch.id', 'asd123', 'ALIKA SYAFA AZAHRA', 'NISN', '3122531880', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-6', '0135489351@siswa.mtsn2cilacap.sch.id', 'asd123', 'FATHAN FAUZAN', 'NISN', '0135489351', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-60', '0127115017@siswa.mtsn2cilacap.sch.id', 'asd123', 'ANNISA NUR RIFA', 'NISN', '0127115017', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-61', '0117944345@siswa.mtsn2cilacap.sch.id', 'asd123', 'AZKA APRILIA HARTONO', 'NISN', '0117944345', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-62', '0121576974@siswa.mtsn2cilacap.sch.id', 'asd123', 'CALLISTA RIZKIA PUTRI', 'NISN', '0121576974', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-63', '3133575586@siswa.mtsn2cilacap.sch.id', 'asd123', 'DURROTUN NAFISAH', 'NISN', '3133575586', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-64', '0122672496@siswa.mtsn2cilacap.sch.id', 'asd123', 'EFAN FERDIAN', 'NISN', '0122672496', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-65', '0128640614@siswa.mtsn2cilacap.sch.id', 'asd123', 'FARIQ ATHARIZZ MANAF', 'NISN', '0128640614', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-66', '0123324835@siswa.mtsn2cilacap.sch.id', 'asd123', 'GIGIH TRIDA PANGESTU', 'NISN', '0123324835', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-67', '0114924937@siswa.mtsn2cilacap.sch.id', 'asd123', 'IHSAN NUR FAIZI', 'NISN', '0114924937', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-68', '0125470823@siswa.mtsn2cilacap.sch.id', 'asd123', 'JUAN MIRZA ZAFRAN RAQILLA', 'NISN', '0125470823', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-69', '0112174448@siswa.mtsn2cilacap.sch.id', 'asd123', 'KENT FARRAS TIVADAR', 'NISN', '0112174448', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-7', '0125098562@siswa.mtsn2cilacap.sch.id', 'asd123', 'JUSUF MAULANA', 'NISN', '0125098562', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-70', '0122461640@siswa.mtsn2cilacap.sch.id', 'asd123', 'KHAIRUL NIZAM', 'NISN', '0122461640', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-71', '0123356426@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMMAD FAWWAS HABIBIE', 'NISN', '0123356426', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-72', '3125018106@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMMAD LIWA ULHAQ ALFARABI', 'NISN', '3125018106', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-73', '3116336963@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMMAD RIZKY RAMADHAN', 'NISN', '3116336963', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-74', '0122758258@siswa.mtsn2cilacap.sch.id', 'asd123', 'NABHAN RADINKA KEVAN PRASETYO', 'NISN', '0122758258', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-75', '0122848349@siswa.mtsn2cilacap.sch.id', 'asd123', 'NASYABEL JAUZA ASHILA', 'NISN', '0122848349', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-76', '0129937851@siswa.mtsn2cilacap.sch.id', 'asd123', 'NAURA NAZWA NUR AFIFAH', 'NISN', '0129937851', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-77', '0119436494@siswa.mtsn2cilacap.sch.id', 'asd123', 'NAZWA DELA AZZAHRA', 'NISN', '0119436494', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-78', '0126195880@siswa.mtsn2cilacap.sch.id', 'asd123', 'PRANANDA THERY HALANSYAH', 'NISN', '0126195880', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-79', '0113111584@siswa.mtsn2cilacap.sch.id', 'asd123', 'RANIS ANUGRAH RAMADHAN', 'NISN', '0113111584', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-8', '0135221964@siswa.mtsn2cilacap.sch.id', 'asd123', 'KEVIN EFENDI', 'NISN', '0135221964', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-80', '0129722787@siswa.mtsn2cilacap.sch.id', 'asd123', 'RIZKY NUR RASYDAN', 'NISN', '0129722787', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-81', '0129398154@siswa.mtsn2cilacap.sch.id', 'asd123', 'RIZQI GALIH ARROFAH', 'NISN', '0129398154', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-82', '0128897393@siswa.mtsn2cilacap.sch.id', 'asd123', 'SATRIYO LINSO WICAKSONO', 'NISN', '0128897393', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-83', '0111194935@siswa.mtsn2cilacap.sch.id', 'asd123', 'SEPTIAR DWI MUHNANDAR', 'NISN', '0111194935', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-84', '0128392666@siswa.mtsn2cilacap.sch.id', 'asd123', 'VIANDRA AISYAH SALSABILA KURNIAWAN', 'NISN', '0128392666', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-85', '0117385087@siswa.mtsn2cilacap.sch.id', 'asd123', 'VITA ANGGRAENI', 'NISN', '0117385087', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-86', '0129634395@siswa.mtsn2cilacap.sch.id', 'asd123', 'WAKHIDATUS SOLIKHAH', 'NISN', '0129634395', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-87', '0117917027@siswa.mtsn2cilacap.sch.id', 'asd123', 'ZAHWA LUNA BAHTIAR', 'NISN', '0117917027', 'IX-A', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-88', '0121082428@siswa.mtsn2cilacap.sch.id', '$2b$10$Lgy966OikkIoHldpjxsYN.S3lVM4MR3gqF.LNXyP3zJLJGSJta91y', 'AHMAD DAFFA', 'NISN', '0121082428', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-24 14:01:50');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-89', '0127641678@siswa.mtsn2cilacap.sch.id', 'asd123', 'ARDHANI SATRIADJI AKHMAD', 'NISN', '0127641678', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-9', '3135810920@siswa.mtsn2cilacap.sch.id', 'asd123', 'KHARISA PUTRI ARIFA', 'NISN', '3135810920', 'VIII-A', NULL, 'siswa', NULL, '2026-08-06 17:19:09', '2026-08-06 17:19:09');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-90', '0125314520@siswa.mtsn2cilacap.sch.id', 'asd123', 'AZKA SYAFIQ NUR SHIDQI', 'NISN', '0125314520', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-91', '3112049996@siswa.mtsn2cilacap.sch.id', 'asd123', 'AZKIA KUSUMA AYU', 'NISN', '3112049996', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-92', '0107113166@siswa.mtsn2cilacap.sch.id', 'asd123', 'DAVINA NITA BAHRI', 'NISN', '0107113166', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-93', '3122014751@siswa.mtsn2cilacap.sch.id', 'asd123', 'DHIA WAFI AZALIA SAPUTRI', 'NISN', '3122014751', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-94', '0117138477@siswa.mtsn2cilacap.sch.id', 'asd123', 'ELGIA MELISSA KIRANI PUTRI', 'NISN', '0117138477', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-95', '0116245748@siswa.mtsn2cilacap.sch.id', 'asd123', 'GILANG AFIT SUBEKTI', 'NISN', '0116245748', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-96', '0126090369@siswa.mtsn2cilacap.sch.id', 'asd123', 'INDANA HILMA IKLILA', 'NISN', '0126090369', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-97', '3129148765@siswa.mtsn2cilacap.sch.id', 'asd123', 'LATHIFATUL AZIZAH', 'NISN', '3129148765', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-98', '3110508918@siswa.mtsn2cilacap.sch.id', 'asd123', 'MIKAEL EZRA EL GHAZY', 'NISN', '3110508918', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-siswa-99', '3120769475@siswa.mtsn2cilacap.sch.id', 'asd123', 'MUHAMAD NGAFIFUDIN', 'NISN', '3120769475', 'IX-B', NULL, 'siswa', NULL, '2026-08-06 17:19:10', '2026-08-06 17:19:10');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-waka-1', 'waka@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'Dra. Hj. Maryam, M.Pd', 'NISN', '197508202002122001', NULL, NULL, 'waka', NULL, '2026-07-28 19:57:36', '2026-07-28 19:57:36');
INSERT INTO users (id, email, password_hash, full_name, identity_type, nis_nip, class_name, subject_specialty, role, avatar_url, created_at, updated_at) VALUES ('usr-walikelas-1', 'walikelas@mtsn2cilacap.sch.id', '$2a$10$wE99Y0M0W0v4eF3n7S8sO.V3d0T5yA0uF7rL1oN6pM2iK4j8H0g6a', 'Bpk. Hendra Wijaya, M.Sc', 'NISN', '198211102009041003', NULL, NULL, 'guru', NULL, '2026-07-28 19:57:36', '2026-08-22 01:43:24');

CREATE TABLE `wa_gateway_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `student_name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GATEWAY SENT ?',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO wa_gateway_logs (id, parent_name, phone, student_name, category, message, status, created_at) VALUES (1, 'Bpk. Suryanto', '082243317522', 'Ahmad Fauzi', 'ABSENSI_ALPHA', 'Yth. Orang Tua/Wali dari Ahmad Fauzi,

Pemberitahuan Presensi LMS MTsN 2 Cilacap tanggal Selasa, 28 Juli 2026:
Ananda Ahmad Fauzi tercatat ALPHA (BELUM CHECK-IN).

Jika ananda berhalangan sakit atau izin dinas luar, mohon unggah surat keterangan via LMS atau hubungi Wali Kelas.
Terima kasih.', 'DELIVERED', '2026-08-20 09:16:14');
INSERT INTO wa_gateway_logs (id, parent_name, phone, student_name, category, message, status, created_at) VALUES (2, 'Bpk. Suryanto', '082243317522', 'Ahmad Fauzi', 'ABSENSI_ALPHA', 'Yth. Orang Tua/Wali dari Ahmad Fauzi,

Pemberitahuan Presensi LMS MTsN 2 Cilacap tanggal Selasa, 28 Juli 2026:
Ananda Ahmad Fauzi tercatat ALPHA (BELUM CHECK-IN).

Jika ananda berhalangan sakit atau izin dinas luar, mohon unggah surat keterangan via LMS atau hubungi Wali Kelas.
Terima kasih.', 'DELIVERED', '2026-08-20 09:16:15');

SET FOREIGN_KEY_CHECKS=1;
