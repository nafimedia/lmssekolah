export interface DocStep {
  number: number;
  title: string;
  description: string;
}

export interface DocCallout {
  type: "tip" | "info" | "warning";
  title?: string;
  text: string;
}

export interface DocScreenshot {
  src: string;
  alt: string;
  caption: string;
}

export interface DocSection {
  id: string;
  slug: string;
  title: string;
  category: string;
  role: "semua" | "siswa" | "guru" | "walikelas" | "kamad" | "orangtua" | "admin";
  lead: string;
  content: string[];
  steps?: DocStep[];
  callouts?: DocCallout[];
  screenshot?: DocScreenshot;
  subsections?: { id: string; title: string }[];
}

export interface DocCategory {
  id: string;
  title: string;
  iconName: string;
  sections: DocSection[];
}

export const DOCS_DATA: DocCategory[] = [
  // ================= 1. PENDAHULUAN =================
  {
    id: "pendahuluan",
    title: "Pendahuluan & Ekosistem",
    iconName: "BookOpen",
    sections: [
      {
        id: "tentang-lms",
        slug: "tentang-lms",
        title: "Tentang LMS MTsN 2 Cilacap",
        category: "Pendahuluan",
        role: "semua",
        lead: "Selamat datang di Portal Learning Management System (LMS) & SIAKAD resmi Madrasah Tsanawiyah Negeri 2 Cilacap.",
        content: [
          "LMS MTsN 2 Cilacap dirancang khusus untuk memfasilitasi kegiatan belajar mengajar berbasis Kurikulum Merdeka Kemenag secara terpadu, transparan, dan modern.",
          "Aplikasi ini menghubungkan seluruh ekosistem madrasah, mulai dari Siswa, Guru Mata Pelajaran, Wali Kelas, Waka Kurikulum, hingga Kepala Madrasah dalam satu portal terintegrasi tanpa sekat birokrasi manual.",
          "Sistem beroperasi di atas arsitektur basis data MySQL resmi madrasah, dilengkapi sistem keamanan enkripsi kata sandi dan manajemen hak akses terdistribusi.",
        ],
        screenshot: {
          src: "/docs/screenshots/docs_overview.png",
          alt: "Beranda Utama LMS MTsN 2 Cilacap",
          caption: "Portal terpadu LMS & SIAKAD resmi MTsN 2 Cilacap dengan arsitektur Kurikulum Merdeka Kemenag.",
        },
        callouts: [
          {
            type: "info",
            title: "Prinsip Keandalan Sistem",
            text: "Seluruh data tersimpan aman pada database MySQL resmi madrasah. Berkas fisik materi (PDF, Video, LKPD) disimpan langsung di File Server Disk untuk menjamin performa akses yang cepat.",
          },
        ],
        subsections: [
          { id: "tujuan-sistem", title: "Tujuan Sistem" },
          { id: "ekosistem-pengguna", title: "Ekosistem Pengguna" },
        ],
      },
      {
        id: "masuk-portal",
        slug: "masuk-portal",
        title: "Panduan Masuk Portal (Multi-Identitas)",
        category: "Pendahuluan",
        role: "semua",
        lead: "Tata cara autentikasi dan masuk ke akun LMS MTsN 2 Cilacap dengan aman sesuai peran yang ditetapkan.",
        content: [
          "Setiap pengguna (Siswa, Guru, Tenaga Kependidikan) telah memiliki akun resmi terdaftar. Anda dapat masuk menggunakan alamat email madrasah, NIP resmi (GTK), atau NISN (Siswa) yang telah diverifikasi.",
          "Sistem mendukung sesi multi-peran (misalnya seorang Guru yang juga mengemban amanah sebagai Wali Kelas) sehingga Anda dapat beralih ruang kerja dengan mudah tanpa login ulang.",
        ],
        screenshot: {
          src: "/docs/screenshots/auth_portal.png",
          alt: "Tangkapan Layar Halaman Masuk Portal MTsN 2 Cilacap",
          caption: "Halaman Masuk Portal resmi MTsN 2 Cilacap dengan dukungan login fleksibel (Email, NIP, NISN).",
        },
        steps: [
          {
            number: 1,
            title: "Buka Halaman Masuk Portal",
            description: "Klik tombol 'Masuk Portal' di sudut kanan atas Landing Page atau kunjungi tautan resmi /auth.",
          },
          {
            number: 2,
            title: "Masukkan Akun & Kata Sandi",
            description: "Ketik Email resmi, NISN (untuk Siswa), atau NIP (untuk Guru), kemudian masukkan kata sandi Anda.",
          },
          {
            number: 3,
            title: "Pilih Ruang Peran (Multi-Role)",
            description: "Jika Anda memiliki lebih dari satu peran (misal: Guru sekaligus Wali Kelas), sistem akan menampilkan pilihan peran saat Anda masuk.",
          },
        ],
        callouts: [
          {
            type: "warning",
            title: "Keamanan Kata Sandi",
            text: "Jangan pernah membagikan kata sandi Anda kepada pihak lain. Jika mengalami kendala lupa sandi, hubungi Staf Administrator IT Madrasah untuk verifikasi reset.",
          },
        ],
        subsections: [
          { id: "langkah-login", title: "Langkah-Langkah Masuk" },
          { id: "tips-keamanan", title: "Tips Keamanan Akun" },
        ],
      },
    ],
  },

  // ================= 2. PANDUAN SISWA =================
  {
    id: "siswa",
    title: "Panduan Siswa",
    iconName: "GraduationCap",
    sections: [
      {
        id: "siswa-dashboard",
        slug: "siswa-dashboard",
        title: "Ruang Belajar Siswa & Presensi Harian",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Pusat aktivitas belajar mandiri, konfirmasi kehadiran harian, jadwal kelas, dan pengumuman madrasah.",
        content: [
          "Setelah berhasil masuk, siswa akan langsung diarahkan ke Ruang Belajar. Di beranda ini ditampilkan ringkasan presensi harian, kartu mata pelajaran aktif, batas waktu tugas terdekat, dan jadwal ujian.",
          "Navigasi antar modul belajar dapat diakses melalui bilah menu di sisi kiri layar ponsel maupun komputer.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_dashboard.png",
          alt: "Dashboard Siswa LMS MTsN 2 Cilacap",
          caption: "Beranda Ruang Belajar Siswa: Menampilkan status presensi hari ini, kartu KBM berjalan, dan jadwal kelas.",
        },
        steps: [
          {
            number: 1,
            title: "Isi Presensi Harian Kelas",
            description: "Lakukan konfirmasi kehadiran harian pada kartu presensi kelas dengan satu klik pada tombol 'Konfirmasi Hadir'.",
          },
          {
            number: 2,
            title: "Lihat Jadwal Pelajaran Hari Ini",
            description: "Periksa urutan jam pelajaran dan nama guru pengampu yang dijadwalkan pada hari aktif.",
          },
          {
            number: 3,
            title: "Pelajari Materi Pertemuan",
            description: "Buka menu 'Materi & Modul Ajar' untuk mengunduh modul PDF, membaca instruksi guru, atau menyimak video pembelajaran.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Disiplin Presensi",
            text: "Pastikan melakukan presensi sebelum jam KBM pertama dimulai agar tidak terhitung terlambat pada rekap absensi madrasah.",
          },
        ],
        subsections: [
          { id: "fitur-utama-siswa", title: "Fitur Utama Ruang Belajar" },
          { id: "alur-belajar-harian", title: "Alur Belajar Harian" },
        ],
      },
      {
        id: "siswa-bahan-ajar",
        slug: "siswa-bahan-ajar",
        title: "Bahan Ajar & Alur Belajar Bertahap (Tandai Selesai)",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Panduan menyimak materi aneka format (teks langsung, video, dokumen, audio), belajar bertahap sesuai nomor langkah, dan membuka materi berikutnya.",
        content: [
          "Siswa dapat mengakses seluruh bahan pembelajaran yang dibagikan oleh guru mata pelajaran melalui menu 'Bahan Ajar & Materi' pada bilah navigasi Ruang Belajar.",
          "Materi pembelajaran disusun bertahap (Langkah #1, #2, #3, ...). Pada mode Belajar Mandiri / PR, siswa membuka Langkah #1 terlebih dahulu, membaca rangkuman atau menonton video penjelasan, kemudian menekan tombol 'Tandai Selesai' (Mark as Done).",
          "Setelah tombol ditekan, status penyelesaian akan otomatis tercatat di server madrasah dan materi Langkah #2 langsung terbuka untuk dipelajari.",
          "Jika materi berstatus '🔒 Terkunci oleh Guru', materi tersebut sedang dikunci khusus oleh guru pengampu dan baru dapat diakses saat sesi tatap muka di kelas dibuka kembali oleh guru.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_bahan_ajar.png",
          alt: "Bahan Ajar Ruang Belajar Siswa",
          caption: "Menu Bahan Ajar Siswa: Urutan langkah pembelajaran (#1, #2), badge indikator mode Tatap Muka/Mandiri, dan status kunci bertahap.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Menu 'Bahan Ajar & Materi'",
            description: "Klik menu Bahan Ajar pada navigasi Ruang Belajar dan pilih mata pelajaran atau jenjang kelas.",
          },
          {
            number: 2,
            title: "Pilih Materi yang Siap Dipelajari",
            description: "Klik tombol 'Pelajari Materi' pada kartu bahan ajar yang berstatus terbuka (Langkah #1).",
          },
          {
            number: 3,
            title: "Simak Konten Materi",
            description: "Baca rangkuman teks catatan guru, tonton tayangan video YouTube/MP4, dengarkan audio, atau unduh berkas modul PDF pendukung.",
          },
          {
            number: 4,
            title: "Klik 'Tandai Selesai' (Mode Mandiri)",
            description: "Setelah selesai mempelajari materi, klik tombol hijau '✔ Tandai Selesai (Buka Langkah Berikutnya)' di bagian bawah dialog baca.",
          },
          {
            number: 5,
            title: "Langkah Berikutnya Terbuka Otomatis",
            description: "Kartu Langkah #1 akan berstatus '✅ Selesai' dan materi Langkah #2 otomatis terbuka untuk dapat dipelajari.",
          },
        ],
        callouts: [
          {
            type: "info",
            title: "Fungsi Tombol 'Tandai Selesai'",
            text: "Tombol ini mencatat riwayat progres belajar mandiri Anda secara permanen ke database madrasah sekaligus membuka kunci materi langkah berikutnya.",
          },
          {
            type: "warning",
            title: "Hak Veto Gembok Guru (Master Lock)",
            text: "Jika guru mengunci materi tertentu di kelas, materi tersebut tetap berstatus '🔒 Terkunci oleh Guru' meskipun Anda telah menandai selesai langkah-langkah sebelumnya.",
          },
        ],
        subsections: [
          { id: "alur-belajar-mandiri", title: "Alur Pembukaan Langkah Bertahap" },
          { id: "ragam-media-siswa", title: "Ragam Media Pembelajaran" },
        ],
      },
      {
        id: "siswa-tugas",
        slug: "siswa-tugas",
        title: "Pengerjaan & Pengumpulan Tugas / LKPD",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Panduan menyimak instruksi Lembar Kerja Peserta Didik (LKPD), mengunggah dokumen jawaban, dan memantau nilai.",
        content: [
          "Setiap guru mata pelajaran dapat memberikan tugas terstruktur maupun lembar kerja interaktif (LKPD) yang memiliki batas waktu (deadline) tertentu.",
          "Siswa dapat membaca petunjuk soal, mengunduh lampiran materi dari guru, lalu mengunggah berkas jawaban dalam format PDF, gambar dokumen, maupun teks langsung.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_tugas.png",
          alt: "Modul Tugas & Submisi LKPD Siswa",
          caption: "Modul Tugas Siswa: Daftar tugas aktif, status pengumpulan, batas waktu, dan umpan balik guru.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Menu 'Tugas & Submisi LKPD'",
            description: "Akses menu Tugas pada sidebar navigasi untuk melihat seluruh daftar lembar kerja yang diberikan guru.",
          },
          {
            number: 2,
            title: "Baca Instruksi & Unduh Berkas",
            description: "Klik pada kartu tugas untuk membaca petunjuk pengerjaan dan mengunduh berkas lampiran jika disediakan guru.",
          },
          {
            number: 3,
            title: "Unggah Lembar Jawaban",
            description: "Pilih berkas jawaban Anda (PDF/Gambar/Dokumen) pada kolom unggahan, lalu klik 'Kirim Jawaban'.",
          },
          {
            number: 4,
            title: "Pantau Nilai & Catatan Guru",
            description: "Setelah guru memeriksa jawaban Anda, nilai dan catatan koreksi akan langsung muncul pada kartu riwayat tugas.",
          },
        ],
        callouts: [
          {
            type: "warning",
            title: "Perhatikan Batas Waktu (Deadline)",
            text: "Kirimkan tugas sebelum tenggat waktu berakhir. Sistem akan menandai tugas yang dikirim terlambat secara otomatis.",
          },
        ],
        subsections: [
          { id: "alur-tugas", title: "Alur Pengerjaan Tugas" },
          { id: "format-file", title: "Format Berkas yang Didukung" },
        ],
      },
      {
        id: "siswa-peer-assessment",
        slug: "siswa-peer-assessment",
        title: "Penilaian Antarteman (Peer Assessment)",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Panduan memberikan evaluasi dan apresiasi objektif kepada rekan sekelompok dalam aktivitas tugas kelompok digital.",
        content: [
          "Pada tugas kelompok yang mengaktifkan fitur Penilaian Antarteman, siswa berkesempatan memberikan evaluasi dan apresiasi terhadap peran serta anggota kelompoknya.",
          "Penilaian antarteman bertujuan menumbuhkan budaya refleksi, kejujuran, sportivitas, dan rasa saling menghargai sesuai Profil Pelajar Pancasila dan Profil Pelajar Rahmatan Lil 'Alamin (P5-PPRA).",
          "Setiap siswa menilai rekannya berdasarkan 4 pilar dimensi utama: (1) Keaktifan & Inisiatif Ide, (2) Kerjasama & Kontribusi Tim, (3) Tanggung Jawab Penyelesaian Tugas, dan (4) Sikap Menghargai Pendapat Rekan.",
          "Penilaian yang Anda berikan bersifat rahasia antar-siswa untuk menjaga kenyamanan dan objektivitas, namun dapat ditinjau oleh guru pengampu sebagai salah satu komponen asesmen proses.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_peer_assessment.png",
          alt: "Modal Penilaian Antarteman Siswa",
          caption: "Jendela Penilaian Antarteman: Pemilihan rekan kelompok, pemberian bintang 1–4 per aspek kriteria, dan pesan apresiasi motivasi.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Modul 'Tugas & Submisi LKPD'",
            description: "Pilih menu Tugas pada Ruang Belajar untuk melihat daftar tugas kelompok yang sedang berlangsung.",
          },
          {
            number: 2,
            title: "Klik Tombol 'Beri Nilai Teman'",
            description: "Pada baris tugas kelompok yang bertanda lencana 'Penilaian Antarteman Aktif', klik tombol bertanda bintang 'Beri Nilai Teman'.",
          },
          {
            number: 3,
            title: "Pilih Nama Rekan yang Ingin Dinilai",
            description: "Pilih nama teman sekelompok dari daftar dropdown yang tersedia.",
          },
          {
            number: 4,
            title: "Tentukan Rating Bintang (1–4 Bintang)",
            description: "Berikan bintang 1 (Kurang) sampai 4 (Sangat Baik) pada 4 aspek: Keaktifan, Kerjasama, Tanggung Jawab, dan Sikap.",
          },
          {
            number: 5,
            title: "Tuliskan Pesan Apresiasi & Kirim",
            description: "Ketik kalimat masukan atau motivasi yang membangun di kolom umpan balik, lalu klik tombol 'Kirim Penilaian Antarteman'.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Prinsip Kejujuran & Akhlakul Karimah",
            text: "Berikanlah penilaian secara adil, objektif, dan bertanggung jawab berdasarkan pengamatan nyata selama bekerjasama dalam tim tanpa rasa pilih kasih.",
          },
        ],
        subsections: [
          { id: "kriteria-peer", title: "4 Dimensi Kriteria Penilaian" },
          { id: "kerahasiaan-nilai", title: "Kerahasiaan & Umpan Balik" },
        ],
      },
      {
        id: "siswa-cbt",
        slug: "siswa-cbt",
        title: "Ujian Online CBT (Token, Timer & Navigasi Soal)",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Petunjuk lengkap mengikuti asesmen sumatif, penilaian harian, dan ujian semester secara daring di ruang CBT.",
        content: [
          "Modul CBT LMS MTsN 2 Cilacap dirancang dengan sistem pengawas token, penghitung mundur waktu presisi (countdown timer), dan mekanisme auto-save jawaban instan per nomor soal.",
          "Pilihan jawaban Anda tersimpan otomatis di server setiap kali Anda memilih opsi, sehingga tidak ada data jawaban yang hilang jika peramban tidak sengaja ter-refresh.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_cbt.png",
          alt: "Antarmuka Ujian Online CBT Siswa",
          caption: "Ruang Ujian Online CBT: Panel nomor soal interaktif, penghitung waktu mundur, dan tombol status ragu-ragu.",
        },
        steps: [
          {
            number: 1,
            title: "Masuk ke Menu 'CBT Ujian Online'",
            description: "Pilih menu CBT pada dashboard saat jadwal ujian telah diaktifkan oleh guru pengawas.",
          },
          {
            number: 2,
            title: "Masukkan Token 6 Karakter",
            description: "Ketik kode token ujian yang dibagikan oleh guru pengawas di ruang kelas, lalu klik 'Mulai Ujian'.",
          },
          {
            number: 3,
            title: "Kerjakan Butir Soal dengan Tenang",
            description: "Gunakan panel nomor soal di sebelah kanan untuk berpindah soal. Kotak hijau menandakan soal sudah terjawab, kuning menandakan ragu-ragu.",
          },
          {
            number: 4,
            title: "Selesaikan & Konfirmasi Pengiriman",
            description: "Pada butir soal terakhir, klik tombol 'Selesai Ujian' dan centang persetujuan konfirmasi untuk mengakhiri sesi tes.",
          },
        ],
        callouts: [
          {
            type: "warning",
            title: "Proctoring & Integritas Ujian",
            text: "Dilarang membuka tab baru atau beralih aplikasi selama tes berlangsung. Sistem mendeteksi perpindahan jendela dan dapat mengunci lembar ujian Anda.",
          },
        ],
        subsections: [
          { id: "persiapan-cbt", title: "Persiapan Sebelum Ujian" },
          { id: "navigasi-cbt", title: "Menggunakan Panel Soal" },
          { id: "kendala-koneksi", title: "Jika Koneksi Terputus" },
        ],
      },
      {
        id: "siswa-tahfidz",
        slug: "siswa-tahfidz",
        title: "Setoran Hafalan Al-Qur'an (Tahfidz Tracker)",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Pemantauan riwayat setoran hafalan Juz 30, Juz 29, predikat tajwid, dan target capaian madrasah.",
        content: [
          "Madrasah Tsanawiyah Negeri 2 Cilacap membekali seluruh siswa dengan program unggulan Tahfidz Al-Qur'an. Melalui modul tracker ini, siswa dan wali murid dapat memantau setiap surat dan ayat yang telah diujikan secara transparan.",
          "Setiap setoran dinilai langsung oleh ustadz/ustadzah pembimbing dengan kriteria kelancaran (Mutqin / Ziyadah / Murojaah) serta catatan tajwid.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_tahfidz.png",
          alt: "Tracker Hafalan Tahfidz Siswa MTsN 2 Cilacap",
          caption: "Tracker Hafalan Tahfidz: Pemantauan capaian Juz 30, status kelancaran surat, dan riwayat setoran guru.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Tab 'Setoran Tahfidz Qur'an'",
            description: "Akses menu Tahfidz pada bilah navigasi untuk melihat rekap hafalan Anda.",
          },
          {
            number: 2,
            title: "Periksa Progres Bar Juz",
            description: "Lihat persentase tuntas Juz 30/29 dan surat terakhir yang telah disahkan oleh penguji.",
          },
          {
            number: 3,
            title: "Pelajari Catatan Tajwid & Makhorijul Huruf",
            description: "Baca evaluasi perbaikan dari guru pembimbing untuk menyempurnakan bacaan pada setoran berikutnya.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Tips Murojaah Konsisten",
            text: "Luangkan waktu murojaah minimal 15 menit setiap ba'da subuh dan maghrib untuk mempertahankan kelancaran ayat yang sudah disetor.",
          },
        ],
        subsections: [
          { id: "target-juz", title: "Target Hafalan Tingkat MTs" },
          { id: "evaluasi-tajwid", title: "Memahami Predikat Setoran" },
        ],
      },
      {
        id: "siswa-rapor",
        slug: "siswa-rapor",
        title: "Rekap Nilai & E-Rapor Digital Siswa",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Transparansi capaian kompetensi belajar per mata pelajaran, nilai formatif, sumatif, dan hasil rapor semester.",
        content: [
          "Melalui menu Rekap Nilai, siswa dapat melihat transparansi penilaian akademik secara langsung tanpa menunggu akhir semester.",
          "Nilai disajikan lengkap dengan deskripsi capaian tertinggi dan aspek materi yang memerlukan penguatan mandiri.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_rapor.png",
          alt: "Tampilan Rekap Nilai Siswa",
          caption: "Rekap Nilai Siswa: Daftar nilai per mata pelajaran, capaian formatif-sumatif, dan deskripsi kompetensi.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Menu 'Rekap Nilai Saya'",
            description: "Pilih menu Rekap Nilai pada sidebar untuk menampilkan rangkuman nilai seluruh mata pelajaran.",
          },
          {
            number: 2,
            title: "Tinjau Nilai Per Tujuan Pembelajaran",
            description: "Klik pada mata pelajaran tertentu untuk melihat rincian nilai tugas, LKPD, dan penilaian harian.",
          },
        ],
        subsections: [
          { id: "deskripsi-capaian", title: "Memahami Deskripsi Capaian" },
        ],
      },
    ],
  },

  // ================= 3. PANDUAN GURU PENGAMPU =================
  {
    id: "guru",
    title: "Panduan Guru Pengampu",
    iconName: "BookMarked",
    sections: [
      {
        id: "guru-ruang-mengajar",
        slug: "guru-ruang-mengajar",
        title: "Ruang Mengajar (Struktur 1–18 Pertemuan)",
        category: "Panduan Guru",
        role: "guru",
        lead: "Pusat tata kelola KBM digital guru: pengelolaan alur materi per semester, navigasi kelas ampunan, dan modul ajar.",
        content: [
          "Ruang Mengajar dirancang fleksibel untuk memudahkan guru menyusun alur 1 hingga 18 pertemuan per semester sesuai standar Kurikulum Merdeka Kemenag.",
          "Navigasi tab terpadu satu baris memudahkan guru berpindah antara menu Presensi, Jurnal, Materi, Tugas & LKPD, Catatan, dan Riwayat KBM.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_ruangmengajar.png",
          alt: "Ruang Mengajar Guru MTsN 2 Cilacap",
          caption: "Ruang Mengajar KBM Live: Pemilihan rombel ampunan, navigasi 1–18 pertemuan, dan bilah tab ringkas.",
        },
        steps: [
          {
            number: 1,
            title: "Pilih Rombongan Belajar (Kelas)",
            description: "Pilih kelas yang sedang Anda ajar (misal: 7A, 8B, 9C) melalui dropdown pemilih rombel di bagian atas.",
          },
          {
            number: 2,
            title: "Pilih Nomor Pertemuan KBM",
            description: "Klik nomor pertemuan pembelajaran yang akan diaktifkan (Pertemuan 1 sampai 18).",
          },
          {
            number: 3,
            title: "Kelola Konten Pembelajaran",
            description: "Gunakan tab-tab yang tersedia untuk mengunggah bahan ajar PDF, membagikan video pengantar, dan menyusun tugas.",
          },
        ],
        callouts: [
          {
            type: "info",
            title: "Penyimpanan Berkas Bahan Ajar",
            text: "Seluruh modul ajar (PDF/Dokumen) disimpan langsung di folder penyimpanan server madrasah dan terproteksi dari akses luar.",
          },
        ],
        subsections: [
          { id: "pilih-kelas", title: "Memilih Rombel & Pertemuan" },
          { id: "navigasi-tab", title: "Fungsi Tab Ruang Mengajar" },
        ],
      },
      {
        id: "guru-presensi-jurnal",
        slug: "guru-presensi-jurnal",
        title: "Presensi Siswa & Jurnal KBM Harian Guru",
        category: "Panduan Guru",
        role: "guru",
        lead: "Pencatatan kehadiran siswa secara real-time dan pengisian jurnal mengajar digital langsung dari ruang kelas.",
        content: [
          "Guru pengampu dapat mencatat kehadiran setiap siswa per jam pelajaran dengan status: Hadir (H), Sakit (S), Izin (I), atau Alfa (A).",
          "Setelah absensi dilakukan, guru mengisi Jurnal Mengajar yang memuat ringkasan materi pokok yang diajarkan, metode pembelajaran, serta catatan khusus kejadian di kelas.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_jurnal.png",
          alt: "Presensi dan Jurnal Mengajar Guru",
          caption: "Presensi & Jurnal KBM: Pencatatan status absensi siswa per jam pelajaran dan rekap jurnal digital.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Tab 'Presensi'",
            description: "Pada halaman Ruang Mengajar, klik tab Presensi untuk memunculkan daftar nama siswa di rombel terpilih.",
          },
          {
            number: 2,
            title: "Tandai Kehadiran Siswa",
            description: "Klik tombol status H, S, I, atau A pada setiap baris nama siswa. Terdapat tombol cepat 'Hadir Semua' untuk efisiensi.",
          },
          {
            number: 3,
            title: "Buka Tab 'Jurnal' & Isi Pokok Bahasan",
            description: "Ketik materi pokok yang dibahas pada pertemuan ini dan catat jika ada kendala atau apresiasi khusus terhadap siswa.",
          },
          {
            number: 4,
            title: "Simpan Sesi KBM",
            description: "Klik tombol 'Simpan & Sinkronisasi Jurnal'. Data otomatis terhubung ke pemantauan KBM Live Kepala Madrasah.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Sinkronisasi Real-Time",
            text: "Pengisian jurnal KBM yang tepat waktu memungkinkan pimpinan madrasah mengetahui status pembelajaran kelas secara langsung.",
          },
        ],
        subsections: [
          { id: "langkah-presensi", title: "Alur Presensi Kelas" },
          { id: "pengisian-jurnal", title: "Format Jurnal Mengajar" },
        ],
      },
      {
        id: "guru-bahan-ajar",
        slug: "guru-bahan-ajar",
        title: "Bahan Ajar KBM: 6 Format, Urutan Belajar, & Mode Akses",
        category: "Panduan Guru",
        role: "guru",
        lead: "Penyusunan bahan ajar multimedia variatif (Dokumen, Video, Teks Langsung, Web, Audio MP3, Gambar), pengaturan langkah KBM, dan kontrol buka-tutup akses siswa.",
        content: [
          "Bahan ajar KBM mendukung 6 ragam format media pembelajaran modern: (1) Dokumen PDF/Word/PPT, (2) Video YouTube atau berkas MP4/WebM, (3) Teks Catatan / Rangkuman Langsung yang diketik guru langsung di LMS tanpa perlu membuat PDF, (4) Tautan Web eksternal (Simulasi PhET/Canva/Artikel), (5) Audio MP3 (Listening bahasa/murattal Al-Qur'an), dan (6) Gambar / Infografis.",
          "Guru dapat menyusun alur pembelajaran terstruktur menggunakan nomor urut langkah tayang (Langkah #1, Langkah #2, Langkah #3, dst.) sehingga materi tersusun rapi otomatis di layar peserta didik.",
          "Tersedia 2 pilihan sistem kontrol akses: (A) Mode Tatap Muka di Kelas, di mana guru memegang kendali buka-tutup gembok secara langsung saat jam pelajaran; atau (B) Mode Mandiri / PR, di mana siswa harus mempelajari materi dan menekan tombol 'Tandai Selesai' untuk membuka langkah berikutnya secara berurutan.",
          "Guru memiliki Hak Veto (Master Lock). Jika materi tertentu dikunci oleh guru (status: Terkunci), materi tersebut tetap tertutup bagi siswa meskipun siswa telah menyelesaikan seluruh materi langkah sebelumnya.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_bahan_ajar_form.png",
          alt: "Formulir Unggah dan Susun Bahan Ajar KBM Guru",
          caption: "Editor Bahan Ajar Guru: 6 pilihan format bahan ajar, penomoran urutan tayang (Langkah Ke-), dan pemilihan sistem kontrol akses siswa.",
        },
        steps: [
          {
            number: 1,
            title: "Akses Tab 'Materi' pada Ruang Mengajar",
            description: "Pilih rombel ampunan dan buka tab 'Materi & Bahan Ajar' untuk mengelola materi KBM pada pertemuan aktif.",
          },
          {
            number: 2,
            title: "Klik '+ Tambah Modul / Bahan Ajar'",
            description: "Pilih salah satu dari 6 format bahan ajar yang ingin dibagikan kepada peserta didik.",
          },
          {
            number: 3,
            title: "Tentukan Urutan Tayang (Langkah Ke-)",
            description: "Isikan nomor urut langkah pembelajaran (misal: 1 untuk rangkuman apersepsi, 2 untuk video pengantar, 3 untuk pendalaman dokumen).",
          },
          {
            number: 4,
            title: "Pilih Mode Akses Siswa",
            description: "Pilih 'Tatap Muka di Kelas' untuk kendali manual saklar gembok atau 'Mandiri / PR' untuk pembukaan bertahap via tombol 'Tandai Selesai'.",
          },
          {
            number: 5,
            title: "Pantau Rekapitulasi Siswa Selesai",
            description: "Periksa indikator 'x Siswa Selesai' pada setiap kartu materi untuk mengevaluasi ketuntasan belajar mandiri siswa.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Ketik Rangkuman Tanpa Perlu Buat PDF",
            text: "Gunakan format 'Teks Catatan Langsung' untuk memberikan apersepsi atau poin-poin inti materi secara instan tanpa perlu mengetik di Word lalu mengonversinya ke PDF.",
          },
          {
            type: "info",
            title: "Penyimpanan Berkas Fisik di Server Disk",
            text: "Seluruh berkas fisik (PDF, Video MP4, Audio MP3) otomatis tersimpan rapi di File Server Disk (/uploads/modul_ajar/) madrasah dan terindeks di database MySQL.",
          },
        ],
        subsections: [
          { id: "format-bahan-ajar", title: "6 Ragam Format Bahan Ajar" },
          { id: "mode-kontrol-akses", title: "Perbedaan Mode Tatap Muka vs Mandiri" },
          { id: "master-lock-guru", title: "Hak Veto Gembok Guru (Master Lock)" },
        ],
      },
      {
        id: "guru-tugas-lkpd",
        slug: "guru-tugas-lkpd",
        title: "Kelola Tugas & LKPD (In-Page Card Editor Baru)",
        category: "Panduan Guru",
        role: "guru",
        lead: "Penyusunan Lembar Kerja Peserta Didik (LKPD) modern langsung di halaman tanpa pop-up dialog yang mengganggu.",
        content: [
          "Fitur pembuatan LKPD telah ditingkatkan menjadi In-Page Card Editor penuh. Guru dapat mengetik judul tugas, petunjuk pengerjaan, menentukan batas waktu pengumpulan, dan melampirkan berkas soal secara leluasa.",
          "Guru juga dapat langsung memeriksa submisi jawaban yang dikirim siswa, memberikan nilai numerik (0–100), dan menuliskan catatan perbaikan.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_lkpd.png",
          alt: "In-Page Card Editor Pembuatan LKPD Guru",
          caption: "Editor LKPD Baru: Form in-page yang luas, pengaturan batas pengumpulan, lampiran dokumen, dan kriteria penilaian.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Tab 'Tugas & LKPD'",
            description: "Klik tab 'Tugas & LKPD' pada Ruang Mengajar pertemuan aktif.",
          },
          {
            number: 2,
            title: "Klik 'Buat LKPD Baru'",
            description: "Formulir editor lebar akan terbuka langsung di halaman tanpa dialog modal.",
          },
          {
            number: 3,
            title: "Isi Rincian Tugas & Batas Waktu",
            description: "Ketik judul lembar kerja, instruksi lengkap, tentukan tenggat waktu (deadline), dan pilih format lampiran yang diizinkan.",
          },
          {
            number: 4,
            title: "Terbitkan LKPD",
            description: "Klik tombol 'Simpan & Terbitkan'. Tugas langsung muncul di dashboard Ruang Belajar seluruh siswa di rombel tersebut.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Instruksi yang Jelas",
            text: "Gunakan format penomoran yang rapi pada kolom instruksi agar siswa dapat mengerjakan tahapan lembar kerja dengan terstruktur.",
          },
        ],
        subsections: [
          { id: "editor-lkpd", title: "Menggunakan Card Editor" },
          { id: "koreksi-jawaban", title: "Menilai Jawaban Siswa" },
        ],
      },
      {
        id: "guru-peer-assessment",
        slug: "guru-peer-assessment",
        title: "Penilaian Antarteman (Peer Assessment) Tugas Kelompok",
        category: "Panduan Guru",
        role: "guru",
        lead: "Aktivasi instrumen penilaian antarteman pada tugas kelompok dan pemantauan rekapitulasi skor 4 pilar sikap secara transparan.",
        content: [
          "Kurikulum Merdeka Kemenag mendorong asesmen formatif yang partisipatif, salah satunya melalui Penilaian Antarteman (Peer Assessment) pada penugasan kolaboratif dan proyek kelompok.",
          "Saat menyusun atau mengedit tugas bertipe 'Kelompok', guru cukup mencentang opsi 'Aktifkan Penilaian Antarteman (Peer Assessment)'. Sistem secara otomatis menyiapkan instrumen 4 dimensi: Keaktifan, Kerjasama, Tanggung Jawab, dan Sikap.",
          "Hasil penilaian antarteman dihimpun secara otomatis dalam bentuk Rekapitulasi Rata-Rata Bintang (1–4) dan dikonversi langsung ke skala puluhan/ratusan (0–100) lengkap dengan jumlah penilai serta catatan kualitatif antar-siswa.",
          "Informasi ini memberikan gambaran komprehensif bagi guru untuk menilai kontribusi riil tiap individu di dalam kelompok, bukan hanya hasil produk akhir kelompok.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_peer_assessment.png",
          alt: "Rekapitulasi Penilaian Antarteman Guru",
          caption: "Panel Rekapitulasi Penilaian Antarteman: Konversi skala 0–100, rincian 4 pilar dimensi, jumlah penilai, dan kutipan umpan balik siswa.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Tab 'Tugas & LKPD' di Ruang Mengajar",
            description: "Akses pertemuan KBM yang sedang aktif dan pilih menu Tugas & LKPD.",
          },
          {
            number: 2,
            title: "Pilih Kategori Tugas 'Diskusi & Kelompok'",
            description: "Klik 'Buat LKPD Baru' atau klik ikon edit pada tugas yang sudah ada, lalu pilih kategori 'Diskusi & Kelompok'.",
          },
          {
            number: 3,
            title: "Centang 'Aktifkan Penilaian Antarteman'",
            description: "Centang kotak opsi Peer Assessment agar tombol penilaian antarteman muncul di aplikasi siswa peserta rombel.",
          },
          {
            number: 4,
            title: "Buka Detail Jawaban Siswa & Lihat Rekap",
            description: "Klik 'Lihat Submisi' pada tugas. Di dalam dialog penilaian, buka kartu 'Rekapitulasi Penilaian Antarteman' untuk memantau skor rata-rata tiap siswa.",
          },
        ],
        callouts: [
          {
            type: "info",
            title: "Konversi Nilai Otomatis",
            text: "Nilai bintang 1 sampai 4 dikonversi secara matematis menjadi rentang nilai 0–100 untuk mempermudah guru menggabungkannya ke dalam nilai formatif rapor.",
          },
          {
            type: "tip",
            title: "Supervisi Kerjasama Tim",
            text: "Gunakan catatan umpan balik antarteman untuk mengidentifikasi siswa yang membutuhkan pendampingan khusus dalam bersosialisasi dan bekerja sama.",
          },
        ],
        subsections: [
          { id: "aktivasi-peer", title: "Cara Mengaktifkan Peer Assessment" },
          { id: "rekap-guru", title: "Membaca Rekapitulasi & Konversi Nilai" },
        ],
      },
      {
        id: "guru-cbt-banksoal",
        slug: "guru-cbt-banksoal",
        title: "Bank Soal & Pelaksanaan Ujian CBT Guru",
        category: "Panduan Guru",
        role: "guru",
        lead: "Manajemen butir soal asesmen, penyusunan paket ujian, pembuatan token 6 digit, dan monitoring tes berlangsung.",
        content: [
          "Modul CBT Guru menyediakan bank soal komprehensif yang mendukung ragam tipe soal Kurikulum Merdeka: Pilihan Ganda Tunggal, Pilihan Ganda Kompleks, Benar/Salah, Menjodohkan, dan Esai.",
          "Guru dapat mengaktifkan jadwal ujian, menetapkan durasi pengerjaan, men-generate token ujian kelas, dan memantau status siswa yang sedang mengerjakan secara real-time.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_cbt.png",
          alt: "Manajemen CBT dan Bank Soal Guru",
          caption: "Pusat Ujian CBT Guru: Pengelolaan bank soal, pembuatan jadwal asesmen, dan generate token ujian.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Menu 'CBT / Ujian'",
            description: "Pilih menu CBT pada navigasi untuk membuka daftar paket asesmen aktif.",
          },
          {
            number: 2,
            title: "Susun Butir Soal",
            description: "Tambahkan butir soal baru, tentukan kunci jawaban, skor bobot, serta pembahasan.",
          },
          {
            number: 3,
            title: "Aktifkan Sesi & Buat Token",
            description: "Pilih kelas sasaran, tentukan durasi (misal: 60 menit), lalu klik 'Generate Token'. Bagikan kode 6 digit tersebut kepada siswa.",
          },
          {
            number: 4,
            title: "Pantau Lembar Jawaban Live",
            description: "Lihat daftar siswa yang telah login, progres persentase nomor yang telah dikerjakan, dan nilai yang terhitung otomatis.",
          },
        ],
        subsections: [
          { id: "tipe-soal", title: "Ragam Bentuk Soal CBT" },
          { id: "token-pengawas", title: "Pengaturan Token Ujian" },
        ],
      },
      {
        id: "guru-penilaian",
        slug: "guru-penilaian",
        title: "Pengolahan Nilai Formatif & Sumatif",
        category: "Panduan Guru",
        role: "guru",
        lead: "Pencatatan nilai per Tujuan Pembelajaran (TP) sesuai bobot Kurikulum Merdeka untuk integrasi ke E-Rapor.",
        content: [
          "Sistem secara otomatis menghimpun rekapitulasi nilai tugas, LKPD, penilaian harian, dan ujian CBT.",
          "Guru dapat menetapkan deskripsi ketercapaian kompetensi untuk masing-masing siswa sebelum nilai diserahkan ke Wali Kelas.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_penilaian.png",
          alt: "Modul Rekap Nilai dan Leger Guru",
          caption: "Rekap Nilai Guru: Input capaian TP formatif, sumatif tengah/akhir semester, dan leger nilai kelas.",
        },
        steps: [
          {
            number: 1,
            title: "Pilih Menu 'Rekap Nilai & Leger Rapor'",
            description: "Akses lembar penilaian mata pelajaran ampunan Anda.",
          },
          {
            number: 2,
            title: "Lengkapi Capaian Tujuan Pembelajaran (TP)",
            description: "Isi nilai formatif setiap materi pokok dan nilai sumatif akhir semester.",
          },
          {
            number: 3,
            title: "Kirim Nilai ke Wali Kelas",
            description: "Klik tombol 'Finalisasi & Setor ke Wali Kelas' untuk mengunci nilai raport rombel.",
          },
        ],
        subsections: [
          { id: "bobot-nilai", title: "Skema Bobot Penilaian" },
        ],
      },
    ],
  },

  // ================= 4. PANDUAN WALI KELAS =================
  {
    id: "walikelas",
    title: "Panduan Wali Kelas",
    iconName: "Building2",
    sections: [
      {
        id: "walikelas-rapor",
        slug: "walikelas-rapor",
        title: "E-Rapor Kurikulum Merdeka & Bobot Penilaian",
        category: "Panduan Wali Kelas",
        role: "walikelas",
        lead: "Kompilasi nilai seluruh mata pelajaran, validasi capaian kompetensi, dan pengolahan rapor semester rombel binaan.",
        content: [
          "Wali Kelas memegang peranan kunci dalam mengompilasi nilai dari seluruh guru mata pelajaran yang mengajar di rombelnya.",
          "Sistem E-Rapor otomatis menyusun deskripsi kompetensi tertinggi (yang dikuasai dengan sangat baik) serta kompetensi yang masih perlu ditingkatkan berdasarkan input TP dari guru pengampu.",
        ],
        screenshot: {
          src: "/docs/screenshots/walikelas_rapor.png",
          alt: "Halaman E-Rapor Kurikulum Merdeka Wali Kelas",
          caption: "E-Rapor Wali Kelas: Kompilasi nilai formatif-sumatif rombel dan verifikasi deskripsi capaian kompetensi.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Menu 'Laporan Rapor'",
            description: "Pilih menu Laporan Rapor pada sidebar untuk melihat rombel binaan Anda (contoh: Kelas 8A).",
          },
          {
            number: 2,
            title: "Periksa Status Pengumpulan Nilai Guru",
            description: "Pastikan seluruh guru mata pelajaran telah menyetorkan nilai formatif dan sumatif kelas Anda.",
          },
          {
            number: 3,
            title: "Verifikasi Kalimat Capaian Kompetensi",
            description: "Periksa redaksi deskripsi capaian hasil belajar siswa dan sesuaikan jika diperlukan narasi khusus.",
          },
        ],
        callouts: [
          {
            type: "info",
            title: "Standar Kurikulum Merdeka Kemenag",
            text: "Deskripsi capaian rapor menggunakan formulasi narasi kompetensi positif yang memotivasi perkembangan siswa.",
          },
        ],
        subsections: [
          { id: "kompilasi-nilai", title: "Alur Kompilasi Nilai" },
          { id: "verifikasi-deskripsi", title: "Verifikasi Narasi Capaian" },
        ],
      },
      {
        id: "walikelas-catatan",
        slug: "walikelas-catatan",
        title: "Catatan Sikap, Ekstrakurikuler & Presensi Rombel",
        category: "Panduan Wali Kelas",
        role: "walikelas",
        lead: "Pengisian catatan motivasi wali kelas, capaian kegiatan ekstrakurikuler, dan rekapitulasi ketidakhadiran.",
        content: [
          "Selain nilai akademik mata pelajaran, rapor resmi memuat rekapitulasi ketidakhadiran siswa (Sakit, Izin, Alfa) selama satu semester.",
          "Wali Kelas juga menuliskan Catatan Wali Kelas yang memberikan motivasi belajar personal bagi setiap anak serta mencatat keikutsertaan kegiatan ekstrakurikuler.",
        ],
        screenshot: {
          src: "/docs/screenshots/walikelas_catatan.png",
          alt: "Input Catatan Wali Kelas dan Presensi Rombel",
          caption: "Form Catatan Wali Kelas: Rekapitulasi absensi S/I/A, catatan perkembangan sikap, dan kegiatan ekstrakurikuler.",
        },
        steps: [
          {
            number: 1,
            title: "Pilih Siswa Binaan",
            description: "Pilih nama siswa dari tabel data rombel kelas Anda.",
          },
          {
            number: 2,
            title: "Input Rekap Presensi Semester",
            description: "Sistem otomatis menghitung data dari presensi harian guru, namun wali kelas dapat melakukan sinkronisasi akhir data Sakit, Izin, dan Tanpa Keterangan.",
          },
          {
            number: 3,
            title: "Tulis Catatan Wali Kelas",
            description: "Ketik catatan pembinaan yang memotivasi siswa untuk terus berprestasi dan berakhlakul karimah.",
          },
          {
            number: 4,
            title: "Simpan Catatan",
            description: "Klik tombol 'Simpan Rapor Siswa' untuk memperbarui data buku rapor.",
          },
        ],
        subsections: [
          { id: "rekap-presensi", title: "Rekapitulasi Kehadiran" },
          { id: "contoh-catatan", title: "Contoh Catatan Wali Kelas" },
        ],
      },
      {
        id: "walikelas-cetak",
        slug: "walikelas-cetak",
        title: "Cetak Buku Rapor Digital Siswa",
        category: "Panduan Wali Kelas",
        role: "walikelas",
        lead: "Pratinjau cetak lembar rapor resmi berformat Kemenag: Cover, Biodata Peserta Didik, Nilai Akademik, dan Lampiran.",
        content: [
          "Buku Rapor Digital MTsN 2 Cilacap siap dicetak dalam format standar A4 lengkap dengan identitas madrasah, barcode validasi, dan ruang tanda tangan Kepala Madrasah serta Wali Kelas.",
          "Wali kelas dapat mencetak per siswa maupun mencetak satu kelas secara massal (batch print) ke format PDF.",
        ],
        screenshot: {
          src: "/docs/screenshots/walikelas_rapor.png",
          alt: "Pratinjau Cetak Rapor Digital Siswa",
          caption: "Pratinjau Cetak E-Rapor: Tata letak siap cetak sesuai juknis Kemenag lengkap dengan tanda tangan digital.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Lembar Rapor Siswa",
            description: "Klik tombol ikon 'Cetak Rapor' pada baris siswa yang bersangkutan.",
          },
          {
            number: 2,
            title: "Periksa Pratinjau Dokumen",
            description: "Pastikan seluruh nilai mata pelajaran, presensi, dan catatan wali kelas telah terisi lengkap.",
          },
          {
            number: 3,
            title: "Cetak / Simpan PDF",
            description: "Klik tombol 'Cetak PDF' di bagian atas jendela. Anda dapat langsung mencetaknya ke printer atau menyimpannya sebagai arsip dokumen digital.",
          },
        ],
        subsections: [
          { id: "kelengkapan-rapor", title: "Kelengkapan Berkas Rapor" },
          { id: "cetak-massal", title: "Tips Cetak Rapor Satu Kelas" },
        ],
      },
    ],
  },

  // ================= 5. PANDUAN KEPALA MADRASAH =================
  {
    id: "kamad",
    title: "Panduan Kepala Madrasah",
    iconName: "Building2",
    sections: [
      {
        id: "kamad-dashboard",
        slug: "kamad-dashboard",
        title: "Dashboard Eksekutif & Statistik Akademik",
        category: "Panduan Kepala Madrasah",
        role: "kamad",
        lead: "Pemantauan ringkasan denyut aktivitas madrasah secara real-time: kehadiran guru & siswa, kemajuan KBM, dan grafik asesmen.",
        content: [
          "Kepala Madrasah memiliki ruang pantau eksekutif (Executive Overview) yang menyajikan indikator kinerja utama madrasah secara transparan.",
          "Data langsung terhubung dengan aktivitas riil di kelas tanpa rekapitulasi manual: persentase guru yang sedang mengajar, rekap kehadiran siswa hari ini, dan ketercapaian jam mengajar.",
        ],
        screenshot: {
          src: "/docs/screenshots/kamad_dashboard.png",
          alt: "Dashboard Eksekutif Kepala Madrasah MTsN 2 Cilacap",
          caption: "Executive Dashboard: Ringkasan indikator kinerja utama, statistik GTK, kehadiran harian, dan grafik akademik.",
        },
        steps: [
          {
            number: 1,
            title: "Pantau Ringkasan Harian",
            description: "Buka dashboard kamad untuk melihat jumlah siswa hadir, guru yang sedang bertugas, dan kelas yang sedang berlangsung.",
          },
          {
            number: 2,
            title: "Tinjau Distribusi Keterlaksanaan KBM",
            description: "Periksa persentase ketercapaian materi dari 18 pertemuan per rombel di setiap tingkatan kelas (VII, VIII, IX).",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Keputusan Berbasis Data",
            text: "Gunakan grafik statistik kehadiran dan nilai sebagai bahan pertimbangan objektif dalam rapat pembinaan dan evaluasi dewan guru.",
          },
        ],
        subsections: [
          { id: "indikator-kpi", title: "Indikator Kunci (KPI)" },
        ],
      },
      {
        id: "kamad-monitoring",
        slug: "kamad-monitoring",
        title: "Pemantauan KBM Live Real-Time",
        category: "Panduan Kepala Madrasah",
        role: "kamad",
        lead: "Pengawasan kelas yang sedang melangsungkan pembelajaran aktif detik per detik di seluruh tingkatan madrasah.",
        content: [
          "Fitur Monitoring KBM Live memungkinkan pimpinan madrasah mengetahui rombel mana yang sedang aktif belajar, siapa guru pengampunya, jam pelajaran ke berapa, materi apa yang sedang diajarkan, serta berapa siswa yang hadir saat itu juga.",
          "Sistem memberikan status visual: 'KBM Aktif (Hijau)', 'Istirahat (Kuning)', atau 'Belum Dimulai (Abu-abu)'.",
        ],
        screenshot: {
          src: "/docs/screenshots/kamad_monitoring.png",
          alt: "Monitoring KBM Live Kepala Madrasah",
          caption: "Monitoring KBM Live: Inspeksi langsung status kelas aktif, materi jurnal guru, dan kehadiran siswa detik per detik.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Menu '🔴 Pantau KBM Langsung'",
            description: "Pilih menu Pantau KBM Langsung pada navigasi utama pimpinan.",
          },
          {
            number: 2,
            title: "Filter Berdasarkan Tingkat / Waktu",
            description: "Pilih filter Kelas VII, VIII, atau IX untuk memfokuskan pengawasan rombel tertentu.",
          },
          {
            number: 3,
            title: "Inspeksi Jurnal Mengajar Guru",
            description: "Klik pada kartu rombel yang aktif untuk melihat materi pokok bahasan yang baru saja diinput guru di jurnal digitalnya.",
          },
        ],
        subsections: [
          { id: "status-kbm", title: "Status Kelas KBM Live" },
          { id: "supervisi-jurnal", title: "Supervisi Jurnal Mengajar" },
        ],
      },
    ],
  },

  // ================= 6. PANDUAN ADMINISTRATOR & KURIKULUM =================
  {
    id: "admin",
    title: "Panduan Administrator & Kurikulum",
    iconName: "Layers",
    sections: [
      {
        id: "admin-masterdata",
        slug: "admin-masterdata",
        title: "Pengelolaan Master Data & Jadwal Pelajaran",
        category: "Panduan Administrator",
        role: "admin",
        lead: "Tata kelola data pokok akademik: tahun ajaran aktif, data GTK, siswa, rombongan belajar, dan plotting jadwal pelajaran.",
        content: [
          "Administrator Sistem dan Waka Kurikulum memiliki akses penuh untuk mengatur kalender akademik madrasah, melakukan impor data siswa dan guru dari format Excel, serta menyusun jadwal KBM mingguan.",
          "Sistem juga terintegrasi dengan WhatsApp Gateway resmi madrasah untuk pengiriman notifikasi kehadiran instan ke nomor wali murid.",
        ],
        screenshot: {
          src: "/docs/screenshots/admin_masterdata.png",
          alt: "Manajemen Master Data dan Jadwal Pelajaran",
          caption: "Pusat Data Pokok Madrasah: Manajemen data pengguna, rombel, tahun akademik, dan integrasi WhatsApp Gateway.",
        },
        steps: [
          {
            number: 1,
            title: "Kelola Data Pokok Siswa & GTK",
            description: "Akses menu Data Pokok Akademik untuk menambah, memperbarui, atau mengimpor data peserta didik baru.",
          },
          {
            number: 2,
            title: "Atur Tahun Akademik & Semester",
            description: "Tentukan semester aktif (Ganjil/Genap) untuk mengunci periode penilaian yang sedang berjalan.",
          },
          {
            number: 3,
            title: "Plotting Jadwal Mengajar Guru",
            description: "Distribusikan jam pelajaran guru pengampu per rombel sesuai pemenuhan beban 24 jam mengajar.",
          },
        ],
        callouts: [
          {
            type: "warning",
            title: "Kehati-hatian Master Data",
            text: "Perubahan tahun ajaran atau rombongan belajar memengaruhi riwayat penilaian aktif. Lakukan pencadangan (backup) sebelum melakukan pembaruan massal.",
          },
        ],
        subsections: [
          { id: "impor-data", title: "Impor Data Melalui Excel" },
          { id: "wa-gateway", title: "Integrasi WhatsApp Gateway" },
        ],
      },
    ],
  },

  // ================= 7. FAQ & BANTUAN =================
  {
    id: "faq",
    title: "FAQ & Bantuan Teknis",
    iconName: "HelpCircle",
    sections: [
      {
        id: "faq-kendala",
        slug: "faq-kendala",
        title: "Pertanyaan Umum & Solusi Kendala",
        category: "Bantuan & FAQ",
        role: "semua",
        lead: "Jawaban atas pertanyaan yang sering diajukan dan solusi cepat untuk kendala operasional LMS MTsN 2 Cilacap.",
        content: [
          "Berikut adalah rangkuman solusi cepat atas kendala yang paling umum dialami pengguna dalam pengoperasian sehari-hari.",
        ],
        screenshot: {
          src: "/docs/screenshots/auth_portal.png",
          alt: "Bantuan Masuk Portal & Pemulihan Akun",
          caption: "Pusat Pemulihan Akun: Gunakan NIP/NISN resmi jika lupa email terdaftar Anda.",
        },
        steps: [
          {
            number: 1,
            title: "Bagaimana jika lupa kata sandi?",
            description: "Untuk Siswa, silakan melapor ke Wali Kelas Anda. Untuk Guru dan Tenaga Kependidikan, hubungi Tim Administrator IT Madrasah di Ruang Server untuk reset instan.",
          },
          {
            number: 2,
            title: "Apakah ujian CBT dapat dikerjakan melalui HP/Smartphone?",
            description: "Ya, sistem CBT LMS MTsN 2 Cilacap sepenuhnya responsif dan dapat diakses dengan lancar melalui peramban HP Android maupun iPhone.",
          },
          {
            number: 3,
            title: "Bagaimana jika koneksi internet terputus di tengah pengerjaan ujian CBT?",
            description: "Tenang, jangan panik. Seluruh jawaban yang telah Anda klik tersimpan aman di server secara otomatis. Segera sambungkan kembali koneksi, refresh halaman tes, dan waktu ujian Anda akan melanjutkan sisa waktu sebelumnya.",
          },
          {
            number: 4,
            title: "Mengapa token ujian CBT dinyatakan tidak valid atau kadaluarsa?",
            description: "Pastikan penulisan 6 karakter token sudah sesuai huruf besar/kecilnya dan sesi ujian telah resmi dibuka oleh guru pengawas kelas.",
          },
        ],
        callouts: [
          {
            type: "info",
            title: "Layanan Bantuan Madrasah",
            text: "Untuk kendala perangkat keras atau jaringan madrasah, silakan berkonsultasi langsung ke Ruang IT MTs Negeri 2 Cilacap pada jam kerja efektif.",
          },
        ],
        subsections: [
          { id: "faq-login", title: "Kendala Login & Sandi" },
          { id: "faq-cbt", title: "Kendala Teknis CBT Online" },
          { id: "faq-kontak", title: "Kontak Tim IT Madrasah" },
        ],
      },
    ],
  },
];
