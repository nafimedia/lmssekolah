-- ==========================================================================
-- LMS MTsN 2 CILACAP - SQL PATCH UPDATE SISWA KELAS 7A, 7B & WAFIQ NABILAH
-- Dijalankan di server (phpMyAdmin / MySQL Terminal)
-- ==========================================================================

USE `db_lms`;

-- 1. INSERT DATA SISWA BARU (INSERT IGNORE agar aman jika dijalankan berulang)
INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-118', '0136083098@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'AGATHA LARISSA AL SAMI', 'NISN', '0136083098', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-119', '0141369704@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'AL MEYRA ADINDA PUTRI', 'NISN', '0141369704', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-120', '3145247802@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ASFIANA KHURIL AZKIA', 'NISN', '3145247802', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-121', '0137811385@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'CANTIKA NUR FADHILAH', 'NISN', '0137811385', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-122', '0136541132@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'DELYA OKTAFIANI', 'NISN', '0136541132', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-123', '3140269358@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'EKA WULANDARI DAMAYANTI', 'NISN', '3140269358', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-124', '3144725035@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'FEBBYANA ANGELIAZAHRA TALITHA', 'NISN', '3144725035', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-125', '0148794407@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'KAYSA TAMIMATU RASYIDAH', 'NISN', '0148794407', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-126', '3148460184@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'KHANZA DELLA AULIA ASSYIFA', 'NISN', '3148460184', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-127', '0131787162@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'LIDIYA ALYA FAIZAH', 'NISN', '0131787162', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-128', '0134972755@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'MAHYA MUHIMATUL HABIBAH', 'NISN', '0134972755', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-129', '0135519651@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'MUSTIKA KHUMAIROH', 'NISN', '0135519651', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-130', '0147750516@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'NAURA ALMAIRA AZKY', 'NISN', '0147750516', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-131', '3146384161@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'NAZWA AZZAHRA', 'NISN', '3146384161', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-132', '0132059907@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'NURAINI SYA\'BANIYAH', 'NISN', '0132059907', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-133', '0131959766@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'RUINISSA SEPTIA WIDODO', 'NISN', '0131959766', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-134', '3134153354@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'SALMA NAYLIL KHASANAH', 'NISN', '3134153354', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-135', '3144817968@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'SHAKILA FAIHA FIDA PURNOMO', 'NISN', '3144817968', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-136', '0135759918@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'SINAR MALAEKA HARTONO', 'NISN', '0135759918', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-137', '0149136113@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'SIVA RATU NUR RAMADHANI', 'NISN', '0149136113', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-138', '3136473294@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'THERESIA SAFIRA ATMAJA', 'NISN', '3136473294', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-139', '0136551428@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'UFAIRA NUR AFIFA', 'NISN', '0136551428', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-140', '3136051336@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'UMMU YOHANA IZATU RIZKIA', 'NISN', '3136051336', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-141', '0139358786@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'WARIDATUN NINGMAH', 'NISN', '0139358786', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-142', '0147895384@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ZULFA ZAKIYAH PUTRI FEBRIANTO', 'NISN', '0147895384', 'VII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-143', '3141208441@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'AHMAD ALFIAN IDRIS', 'NISN', '3141208441', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-144', '3133483015@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'AHMAD WAIKAL AFIANO', 'NISN', '3133483015', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-145', '0149441434@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ALFANI NUR KHOLIFAH', 'NISN', '0149441434', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-146', '0147587114@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ALFINA NUR KHOLIFAH', 'NISN', '0147587114', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-147', '0139981772@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ALIF MUFTI HASARIN', 'NISN', '0139981772', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-148', '0148016166@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ARSENIO GALUH KHANZA', 'NISN', '0148016166', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-149', '0134967683@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ARUM EKA SYAFIYA', 'NISN', '0134967683', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-150', '0148447350@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'FAREL EFARIO SANTOSO', 'NISN', '0148447350', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-151', '0129686898@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'FARIS AKBAR ARRIZKI', 'NISN', '0129686898', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-152', '3147503186@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'FIFI AZIZATUL FAUZIAH', 'NISN', '3147503186', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-153', '0146660844@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'GHAITSAA ASAAHI HELMI', 'NISN', '0146660844', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-154', '0138228948@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'HABIBBY IBRA SETIAWAN', 'NISN', '0138228948', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-155', '3139775029@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'IRZANDYA ALIKA RAHMA SAID', 'NISN', '3139775029', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-156', '3134936518@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'JANUAR TRI SAPUTRA WAHYU FAJRIH', 'NISN', '3134936518', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-157', '0115677779@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'KALILA AIKO NURDEANA', 'NISN', '0115677779', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-158', '0138751733@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'MAHESWARI AQILAH QURRATU\'AINI', 'NISN', '0138751733', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-159', '0132498098@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'MUHAMMAD ABINAYA BASUPATI', 'NISN', '0132498098', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-160', '3130188376@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'MUHAMMAD PASHA RAMADHAN', 'NISN', '3130188376', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-161', '3131387841@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'NADA LATHIFAH', 'NISN', '3131387841', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-162', '3143935022@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'NAJMUTSTSAAQIB AHMADIKA', 'NISN', '3143935022', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-163', '0145352047@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'NUR AINI FAKHRULLOH', 'NISN', '0145352047', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-164', '0144263820@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'RISYA ALIFIA NATHA KUSTRIONO', 'NISN', '0144263820', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-165', '3144869792@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'RIZVAN FAEYZA PUTRA SETIANA', 'NISN', '3144869792', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-166', '0135643316@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'YOGI ADI SAPUTRA', 'NISN', '0135643316', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-167', '0149471305@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ZAHWA FAKHIRAH ANAM', 'NISN', '0149471305', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-168', '0147164748@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'ZIDNI ILMAN NAFIAN', 'NISN', '0147164748', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-169', '0148017704@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'MUHAMAD RIZKI RAMADHAN', 'NISN', '0148017704', 'VII-B', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

INSERT INTO `users` (`id`, `email`, `password_hash`, `full_name`, `identity_type`, `nis_nip`, `class_name`, `role`, `created_at`, `updated_at`)
VALUES ('usr-siswa-170', '26177@siswa.mtsn2cilacap.sch.id', '$2b$10$xuHvwjvlcP5ZoJAdCr/YM.9quO6AuekzV1NAArL2Exk7VmnG836iO', 'WAFIQ NABILA RAMADHANI', 'NISN', '26177', 'VIII-A', 'siswa', NOW(), NOW())
ON DUPLICATE KEY UPDATE `full_name` = VALUES(`full_name`), `class_name` = VALUES(`class_name`), `updated_at` = NOW();

-- 2. SINKRONISASI JUMLAH SISWA MASTER ROMBEL
UPDATE `master_rombels` SET `siswa_count` = 25 WHERE `code` = '7a';
UPDATE `master_rombels` SET `siswa_count` = 27 WHERE `code` = '7b';
UPDATE `master_rombels` SET `siswa_count` = 27 WHERE `code` = '8a';
UPDATE `master_rombels` SET `siswa_count` = 28 WHERE `code` = '8b';
UPDATE `master_rombels` SET `siswa_count` = 33 WHERE `code` = '9a';
UPDATE `master_rombels` SET `siswa_count` = 30 WHERE `code` = '9b';

