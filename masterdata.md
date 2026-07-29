Untuk LMS MTsN 2 Cilacap, master data sebaiknya tidak hanya mencakup data dasar e-learning, tetapi juga terintegrasi dengan kebutuhan madrasah, EMIS, dan RDM. Berikut struktur master data yang saya rekomendasikan.

1. Master Data Akademik
Tahun Pelajaran
Semester
Kalender Akademik
Hari Libur Nasional
Hari Libur Madrasah
Jam Pelajaran
Sesi Belajar
Kurikulum (Merdeka/K13 jika masih digunakan)
Fase/Kelas
Jenjang
2. Master Data Mata Pelajaran
Mata Pelajaran
Kelompok Mata Pelajaran
Kode Mapel
Jam per Minggu
Capaian Pembelajaran (CP)
Tujuan Pembelajaran (TP)
Alur Tujuan Pembelajaran (ATP)
Modul Ajar

Pada e-learning madrasah, data ruang kelas dan mata pelajaran memang menjadi master data utama pembelajaran.

3. Master Data Kelas
Tingkat (VII, VIII, IX)
Rombel
Wali Kelas
Ruang Kelas
Kapasitas Kelas
Status Aktif
4. Master Data Guru & Pegawai
Guru
Jabatan
Status Kepegawaian
Bidang Keahlian
Sertifikasi
Beban Mengajar
NIP/NUPTK
Akun Login

Master data pegawai idealnya mencakup identitas, jabatan, status, dan data kepegawaian agar dapat dipakai lintas modul.

5. Master Data Peserta Didik
Biodata Siswa
NIS
NISN
Kelas
Status Aktif
Orang Tua/Wali
Akun Login
Foto
6. Master Data User & Hak Akses
Administrator
Kepala Madrasah
Wakil Kepala
Guru
Wali Kelas
Guru BK
Operator
Siswa
Orang Tua (opsional)

Setiap role memiliki permission berbeda.

7. Master Data Kompetensi
CP
TP
ATP
KKTP
Rubrik Penilaian
Predikat Nilai
8. Master Data Penilaian
Jenis Asesmen
Diagnostik
Formatif
Sumatif
PAS
PAT
Ujian Madrasah
Bobot Nilai
Predikat
Rentang Nilai
9. Master Data Konten Pembelajaran
Kategori Materi
Jenis Materi
PDF
Video
PPT
Link
SCORM
Tag Materi
10. Master Data Agenda
Kalender Kegiatan
Agenda Madrasah
Pengumuman
Event
Reminder
11. Master Data Presensi
Status Kehadiran
Jam Masuk
Jam Pulang
Toleransi Terlambat
Izin
Sakit
Alpha
12. Master Data Tugas & Kuis
Kategori Tugas
Kategori Kuis
Tipe Soal
Tingkat Kesulitan
Bank Soal
Tag Materi
13. Master Data Sarana
Laboratorium
Ruang Kelas
Perpustakaan
Perangkat Belajar
14. Master Data Notifikasi
Template Email
Template WhatsApp
Template Push Notification
15. Master Data Integrasi
EMIS
RDM
SIMPATIKA
SSO
Google Drive
YouTube
Zoom
Google Meet
16. Master Data Pengaturan
Profil Madrasah
Logo
NSM
NPSN
Alamat
Zona Waktu
Bahasa
Tahun Aktif
Semester Aktif
Struktur Menu "Master Data" yang saya rekomendasikan
Master Data
│
├── Akademik
│   ├── Tahun Pelajaran
│   ├── Semester
│   ├── Kalender Akademik
│   ├── Hari Libur
│   ├── Jam Pelajaran
│   └── Kurikulum
│
├── Pengguna
│   ├── Guru
│   ├── Pegawai
│   ├── Siswa
│   ├── Orang Tua
│   ├── Role
│   └── Hak Akses
│
├── Pembelajaran
│   ├── Mata Pelajaran
│   ├── Kelas
│   ├── Rombel
│   ├── Ruang
│   ├── CP
│   ├── TP
│   ├── ATP
│   └── Modul Ajar
│
├── Penilaian
│   ├── Jenis Asesmen
│   ├── KKTP
│   ├── Rubrik
│   ├── Predikat
│   └── Bobot Nilai
│
├── Konten
│   ├── Kategori Materi
│   ├── Bank Soal
│   └── Template Tugas
│
├── Presensi
│
├── Agenda
│
├── Integrasi
│
└── Pengaturan