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
  {
    id: "pendahuluan",
    title: "Pendahuluan",
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
          "Aplikasi ini menghubungkan seluruh ekosistem madrasah, mulai dari Siswa, Guru Mata Pelajaran, Wali Kelas, Guru BK, Orang Tua, hingga Kepala Madrasah dalam satu portal terintegrasi.",
        ],
        callouts: [
          {
            type: "info",
            title: "Prinsip Keandalan Sistem",
            text: "Seluruh data tersimpan secara aman pada pangkalan data MySQL resmi madrasah, dan seluruh berkas fisik materi disimpan pada media penyimpanan terproteksi.",
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
        title: "Panduan Masuk Portal (Login)",
        category: "Pendahuluan",
        role: "semua",
        lead: "Tata cara autentikasi dan masuk ke akun LMS MTsN 2 Cilacap dengan aman sesuai peran yang ditetapkan.",
        content: [
          "Setiap pengguna (Siswa, Guru, Tenaga Kependidikan) telah memiliki akun resmi terdaftar. Anda dapat masuk menggunakan alamat email madrasah atau NIP/NISN yang telah diverifikasi.",
        ],
        steps: [
          {
            number: 1,
            title: "Buka Halaman Masuk Portal",
            description: "Klik tombol 'Masuk Portal' di sudut kanan atas Landing Page atau kunjungi tautan resmi /auth.",
          },
          {
            number: 2,
            title: "Masukkan Akun & Kata Sandi",
            description: "Ketik Email resmi, NISN (untuk Siswa), atau NIP (untuk Guru & Tenaga Kependidikan), kemudian masukkan kata sandi Anda.",
          },
          {
            number: 3,
            title: "Pilih Ruang Peran (Multi-Role)",
            description: "Jika Anda memiliki lebih dari satu peran (misal: Guru sekaligus Wali Kelas), sistem akan menampilkan pilihan peran saat Anda masuk.",
          },
        ],
        screenshot: {
          src: "/docs/screenshots/auth_portal.png",
          alt: "Tangkapan Layar Halaman Masuk Portal MTsN 2 Cilacap",
          caption: "Halaman Masuk Portal resmi MTsN 2 Cilacap dengan dukungan multi-identitas (Email, NIP, NISN) dan enkripsi aman.",
        },
        callouts: [
          {
            type: "warning",
            title: "Keamanan Kata Sandi",
            text: "Jangan pernah memberitahukan kata sandi Anda kepada orang lain. Jika lupa kata sandi, hubungi Tim Administrator IT Madrasah untuk reset.",
          },
        ],
        subsections: [
          { id: "langkah-login", title: "Langkah-Langkah Masuk" },
          { id: "tips-keamanan", title: "Tips Keamanan Akun" },
        ],
      },
    ],
  },
  {
    id: "siswa",
    title: "Panduan Siswa",
    iconName: "GraduationCap",
    sections: [
      {
        id: "siswa-dashboard",
        slug: "siswa-dashboard",
        title: "Ruang Belajar & Dashboard Siswa",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Pusat aktivitas belajar mandiri, pemantauan tugas, jadwal kelas, dan pengumuman harian madrasah.",
        content: [
          "Setelah berhasil masuk, siswa akan langsung diarahkan ke Ruang Belajar. Di sini ditampilkan ringkasan presensi harian, materi yang perlu dipelajari, dan jadwal ujian terdekat.",
          "Navigasi antar mata pelajaran dapat diakses dengan mudah melalui bilah menu tab di bagian atas.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_dashboard.png",
          alt: "Dashboard Siswa LMS MTsN 2 Cilacap",
          caption: "Tampilan beranda siswa: Menampilkan kartu ringkasan KBM, tugas aktif, dan capaian kompetensi.",
        },
        steps: [
          {
            number: 1,
            title: "Isi Kehadiran / Presensi",
            description: "Lakukan konfirmasi kehadiran harian pada kartu presensi kelas dengan sekali klik.",
          },
          {
            number: 2,
            title: "Pilih Mata Pelajaran",
            description: "Buka menu 'Materi Pelajaran' dan pilih mata pelajaran yang sedang berlangsung sesuai jadwal.",
          },
          {
            number: 3,
            title: "Pelajari Bahan Ajar",
            description: "Unduh atau baca modul materi 1–18 pertemuan, tonton video pengantar, dan selesaikan latihan mandiri.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Tips Belajar Teratur",
            text: "Periksa daftar tugas dan tenggat waktu pengumpulan setiap pagi agar tidak ada materi atau tugas yang terlewat.",
          },
        ],
        subsections: [
          { id: "fitur-utama-siswa", title: "Fitur Utama Dashboard" },
          { id: "alur-belajar-harian", title: "Alur Belajar Harian" },
        ],
      },
      {
        id: "siswa-cbt",
        slug: "siswa-cbt",
        title: "Ujian Online CBT (Computer-Based Test)",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Petunjuk lengkap mengikuti asesmen sumatif, penilaian harian, dan ujian semester secara daring.",
        content: [
          "Modul CBT LMS MTsN 2 Cilacap dilengkapi sistem token pengawas, pengatur waktu mundur presisi, dan penyimpanan jawaban otomatis per butir soal.",
          "Jawaban Anda tersimpan otomatis setiap kali Anda memilih opsi jawaban, sehingga aman dari risiko putus koneksi internet.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_cbt.png",
          alt: "Antarmuka Ujian Online CBT Siswa",
          caption: "Ruang Ujian Online CBT: Menampilkan navigasi nomor soal, waktu tersisa, dan opsi ragu-ragu.",
        },
        steps: [
          {
            number: 1,
            title: "Masuk ke Menu CBT",
            description: "Pilih menu 'Ujian CBT' pada dashboard siswa saat jadwal ujian telah dibuka oleh guru.",
          },
          {
            number: 2,
            title: "Masukkan Token Ujian",
            description: "Ketik kode token 6 karakter yang dibagikan oleh guru pengawas kelas, lalu klik 'Mulai Ujian'.",
          },
          {
            number: 3,
            title: "Kerjakan Soal dengan Tenang",
            description: "Gunakan panel nomor soal di sisi kanan untuk berpindah soal. Warna hijau menandakan soal sudah terjawab.",
          },
          {
            number: 4,
            title: "Selesaikan & Konfirmasi Ujian",
            description: "Pada nomor soal terakhir, klik tombol 'Selesai Ujian' dan lakukan konfirmasi pengiriman lembar jawaban.",
          },
        ],
        callouts: [
          {
            type: "warning",
            title: "Perhatian Selama Ujian",
            text: "Dilarang membuka tab baru atau meninggalkan peramban. Sistem mendeteksi perpindahan jendela dan dapat mengunci sesi ujian Anda secara otomatis.",
          },
        ],
        subsections: [
          { id: "persiapan-ujian", title: "Persiapan Sebelum Ujian" },
          { id: "langkah-mengerjakan", title: "Langkah Pengerjaan Soal" },
          { id: "penanganan-kendala", title: "Penanganan Kendala Teknis" },
        ],
      },
      {
        id: "siswa-tahfidz",
        slug: "siswa-tahfidz",
        title: "Setoran Hafalan Al-Qur'an (Tahfidz Tracker)",
        category: "Panduan Siswa",
        role: "siswa",
        lead: "Pemantauan riwayat setoran hafalan Juz 30, Juz 29, dan target capaian hafalan madrasah.",
        content: [
          "Madrasah Tsanawiyah Negeri 2 Cilacap membekali seluruh siswa dengan program tahfidz terstruktur. Melalui modul ini, siswa dan orang tua dapat memantau perkembangan ayat dan surat yang telah disetorkan kepada ustadz/ustadzah pembimbing.",
        ],
        screenshot: {
          src: "/docs/screenshots/siswa_tahfidz.png",
          alt: "Tracker Hafalan Tahfidz Siswa MTsN 2 Cilacap",
          caption: "Tracker Hafalan Tahfidz: Memantau target juz, predikat kelancaran, dan catatan perbaikan tajwid.",
        },
        steps: [
          {
            number: 1,
            title: "Buka Tab Tahfidz",
            description: "Akses tab 'Tahfidz Al-Qur'an' di bilah atas ruang belajar siswa.",
          },
          {
            number: 2,
            title: "Lihat Status Hafalan",
            description: "Periksa surat dan ayat terakhir yang telah tuntas diuji dan disahkan oleh penguji.",
          },
          {
            number: 3,
            title: "Baca Catatan Tajwid & Makhorijul Huruf",
            description: "Pelajari catatan evaluasi dari guru pembimbing untuk menyempurnakan bacaan pada setoran berikutnya.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Motivasi Tahfidz",
            text: "Targetkan murojaah minimal 1 maqro' setiap hari untuk menjaga kelancaran hafalan Anda.",
          },
        ],
        subsections: [
          { id: "target-hafalan", title: "Target Hafalan Tingkat MTs" },
          { id: "riwayat-setoran", title: "Melihat Riwayat Setoran" },
        ],
      },
    ],
  },
  {
    id: "guru",
    title: "Panduan Guru Pengampu",
    iconName: "BookMarked",
    sections: [
      {
        id: "guru-ruang-mengajar",
        slug: "guru-ruang-mengajar",
        title: "Ruang Mengajar & Kelola Pertemuan (1–18)",
        category: "Panduan Guru",
        role: "guru",
        lead: "Pusat tata kelola pembelajaran digital, penyusunan materi ajar, dan penilaian siswa.",
        content: [
          "Guru pengampu mata pelajaran memiliki akses lengkap ke Ruang Mengajar untuk menyusun alur pembelajaran terstruktur 1 hingga 18 pertemuan per semester sesuai standar Kurikulum Merdeka.",
          "Setiap pertemuan dapat dilengkapi bahan ajar PDF, tautan video interaktif, petunjuk LKPD, dan tugas mandiri.",
        ],
        screenshot: {
          src: "/docs/screenshots/guru_dashboard.png",
          alt: "Ruang Mengajar Guru MTsN 2 Cilacap",
          caption: "Dashboard Guru Pengampu: Mengelola mata pelajaran ampunan, bank soal, dan kehadiran kelas.",
        },
        steps: [
          {
            number: 1,
            title: "Pilih Rombel & Mata Pelajaran",
            description: "Klik rombongan belajar (rombel) yang Anda ampu dari daftar kelas aktif.",
          },
          {
            number: 2,
            title: "Pilih Pertemuan Pembelajaran",
            description: "Pilih nomor pertemuan (1 s.d. 18) yang akan diatur materinya.",
          },
          {
            number: 3,
            title: "Unggah Bahan Ajar & Tugas",
            description: "Lampirkan berkas dokumen modul (PDF) atau tautan materi pengayaan untuk diakses siswa.",
          },
          {
            number: 4,
            title: "Pantau Ketuntasan Belajar Siswa",
            description: "Periksa daftar siswa yang telah menyelesaikan materi dan berikan umpan balik penilaian.",
          },
        ],
        callouts: [
          {
            type: "info",
            title: "Penyimpanan Berkas Bahan Ajar",
            text: "Berkas modul PDF yang Anda unggah otomatis disimpan secara aman di direktori server dan dapat diunduh kapan saja oleh siswa binaan.",
          },
        ],
        subsections: [
          { id: "struktur-kbm", title: "Struktur KBM 18 Pertemuan" },
          { id: "unggah-materi", title: "Cara Unggah Bahan Ajar" },
          { id: "penilaian-tugas", title: "Input Nilai & Umpan Balik" },
        ],
      },
    ],
  },
  {
    id: "kamad",
    title: "Panduan Kepala Madrasah",
    iconName: "Building2",
    sections: [
      {
        id: "kamad-dashboard",
        slug: "kamad-dashboard",
        title: "Dashboard Eksekutif & Pemantauan KBM",
        category: "Panduan Kepala Madrasah",
        role: "kamad",
        lead: "Pemantauan real-time aktivitas belajar mengajar madrasah, presensi guru & siswa, serta capaian akademik.",
        content: [
          "Kepala Madrasah memiliki ruang pantau eksekutif (*Executive Overview*) untuk melihat denyut aktivitas madrasah secara langsung.",
          "Informasi disajikan dalam bentuk indikator kinerja utama (KPI): rekap kehadiran siswa harian, persentase kehadiran guru mengajar, status pelaksanaan CBT, dan progres ketercapaian materi ajar.",
        ],
        screenshot: {
          src: "/docs/screenshots/kamad_dashboard.png",
          alt: "Dashboard Eksekutif Kepala Madrasah",
          caption: "Executive Dashboard: Ringkasan statistik kehadiran, aktivitas KBM terkini, dan laporan madrasah.",
        },
        steps: [
          {
            number: 1,
            title: "Pantau Ringkasan Harian",
            description: "Periksa grafik kehadiran siswa dan guru pada hari berjalan.",
          },
          {
            number: 2,
            title: "Inspeksi KBM Per Tingkat",
            description: "Buka tab kelas (Kelas VII, VIII, IX) untuk melihat rombel mana yang sedang melangsungkan pembelajaran aktif.",
          },
          {
            number: 3,
            title: "Tinjau Laporan & Evaluasi",
            description: "Unduh rekap berkala capaian nilai dan kehadiran untuk bahan rapat evaluasi dewan guru.",
          },
        ],
        callouts: [
          {
            type: "tip",
            title: "Transparansi Data",
            text: "Seluruh data kehadiran dan hasil ujian terhubung secara real-time langsung dengan pangkalan data tanpa perlu menunggu rekap manual.",
          },
        ],
        subsections: [
          { id: "indikator-kpi", title: "Indikator Utama (KPI)" },
          { id: "pemantauan-kbm", title: "Monitoring KBM Langsung" },
        ],
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ & Bantuan",
    iconName: "HelpCircle",
    sections: [
      {
        id: "faq-kendala",
        slug: "faq-kendala",
        title: "Pertanyaan Umum & Solusi Kendala",
        category: "Bantuan & FAQ",
        role: "semua",
        lead: "Jawaban atas pertanyaan yang sering diajukan seputar penggunaan LMS MTsN 2 Cilacap.",
        content: [
          "Berikut adalah solusi cepat untuk kendala yang paling sering ditemui pengguna saat mengoperasikan LMS.",
        ],
        steps: [
          {
            number: 1,
            title: "Bagaimana jika lupa kata sandi?",
            description: "Hubungi wali kelas atau staf admin madrasah untuk melakukan reset kata sandi akun Anda.",
          },
          {
            number: 2,
            title: "Apakah ujian CBT bisa dikerjakan lewat smartphone?",
            description: "Bisa. Antarmuka LMS MTsN 2 Cilacap sepenuhnya responsif dan dapat diakses dari smartphone, tablet, maupun laptop/komputer.",
          },
          {
            number: 3,
            title: "Bagaimana jika koneksi internet terputus saat CBT?",
            description: "Jangan panik. Masuk kembali ke halaman CBT. Jawaban yang telah Anda klik sebelumnya tersimpan aman di server, dan waktu ujian akan melanjutkan sisa waktu Anda.",
          },
        ],
        callouts: [
          {
            type: "info",
            title: "Layanan Bantuan Madrasah",
            text: "Untuk kendala teknis lebih lanjut, kunjungi Ruang IT MTs Negeri 2 Cilacap pada jam operasional madrasah.",
          },
        ],
        subsections: [
          { id: "faq-akun", title: "Masalah Akun & Login" },
          { id: "faq-cbt", title: "Kendala Saat Ujian Online" },
          { id: "kontak-bantuan", title: "Kontak Tim IT Madrasah" },
        ],
      },
    ],
  },
];
