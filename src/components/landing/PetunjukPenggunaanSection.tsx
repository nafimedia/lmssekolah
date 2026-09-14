import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Users,
  Search,
  ChevronRight,
  Printer,
  HelpCircle,
  Building2,
  BookMarked,
  Key,
  Check,
  AlertTriangle,
  Info,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export interface GuideStep {
  id: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  category: "siswa" | "guru" | "walikelas" | "kamad" | "admin";
  description: string;
  bulletPoints: string[];
  tips: string;
  screenPath?: string;
  routeHint: string;
}

export const GUIDE_DATA: GuideStep[] = [
  // --- SISWA ---
  {
    id: "siswa-1",
    stepNumber: 1,
    category: "siswa",
    title: "Login & Akses Ruang Belajar Siswa",
    subtitle: "Masuk ke portal dengan NISN / Email resmi",
    description: "Siswa masuk menggunakan NISN yang telah didaftarkan madrasah beserta kata sandi yang diberikan wali kelas.",
    bulletPoints: [
      "Buka halaman utama LMS lalu klik tombol 'Masuk Portal'.",
      "Ketikkan NISN (atau email siswa) dan kata sandi Anda.",
      "Klik tombol 'Masuk Sekarang' untuk langsung diarahkan ke Dashboard Siswa.",
      "Cek status kelas dan wali kelas pada kartu profil di bagian atas.",
    ],
    tips: "Jika lupa kata sandi, hubungi Wali Kelas atau Admin Madrasah untuk reset instan.",
    routeHint: "/auth -> /dashboard",
  },
  {
    id: "siswa-2",
    stepNumber: 2,
    category: "siswa",
    title: "Mengikuti KBM Live & Presensi Mandiri",
    subtitle: "Presensi kehadiran dan akses materi pertemuan 1–18",
    description: "Setiap jam pelajaran dimulai, siswa dapat melihat status KBM aktif dan melakukan presensi online.",
    bulletPoints: [
      "Pilih menu 'Ruang Belajar' atau 'Kehadiran' di sidebar navigasi.",
      "Lihat jadwal mapel hari ini dan banner KBM yang sedang berlangsung.",
      "Klik tombol 'Konfirmasi Kehadiran' pada sesi yang aktif.",
      "Buka tab 'Materi' untuk mengunduh modul PDF atau menonton video pengantar.",
    ],
    tips: "Presensi hanya dapat dikonfirmasi saat sesi KBM telah dibuka oleh Guru Pengampu.",
    routeHint: "/dashboard?tab=ruangbelajar",
  },
  {
    id: "siswa-3",
    stepNumber: 3,
    category: "siswa",
    title: "Mengerjakan Ujian CBT Online",
    subtitle: "Penilaian Harian, UTS, dan PAS berbasis komputer",
    description: "Akses engine CBT anti-curang dengan timer otomatis dan rekap nilai instan.",
    bulletPoints: [
      "Buka modul 'CBT Ujian Online' di sidebar dashboard.",
      "Pilih jadwal ujian aktif sesuai mapel yang diujikan.",
      "Masukkan Token Ujian yang diberikan guru pengampu di kelas.",
      "Jawab soal pilihan ganda maupun essay dengan tenang sebelum timer habis.",
      "Klik 'Kumpulkan Jawaban' dan konfirmasi penyelesaian ujian.",
    ],
    tips: "Pastikan koneksi internet stabil. Jawaban otomatis tersimpan setiap kali Anda memilih opsi soal.",
    routeHint: "/dashboard?tab=cbt",
  },
  {
    id: "siswa-4",
    stepNumber: 4,
    category: "siswa",
    title: "Murojaah & Setoran Tahfidz Al-Qur'an",
    subtitle: "Tracking hafalan Juz 30, 29, dan 1",
    description: "Pantau kemajuan hafalan ayat suci Al-Qur'an dan lihat riwayat penilaian tajwid.",
    bulletPoints: [
      "Akses modul 'Tahfidz Al-Qur'an' di menu utama siswa.",
      "Pilih surat dan ayat yang telah disetorkan kepada Ustadz / Guru Pembina.",
      "Lihat status penilaian: Mutqin (Lancar), Murojaah, atau Perlu Perbaikan.",
      "Unduh dan cetak 'Kartu Setoran Hafalan' format resmi madrasah.",
    ],
    tips: "Dengarkan audio qari interaktif pada e-Library Tahfidz untuk mempermudah menghafal.",
    routeHint: "/dashboard?tab=tahfidz",
  },
  {
    id: "siswa-5",
    stepNumber: 5,
    category: "siswa",
    title: "Melihat Rapor Akademik & Nilai Akhir",
    subtitle: "Transkrip nilai formatif, sumatif, dan capaian pembelajaran",
    description: "Melihat grafik perkembangan belajar dan mencetak lembar e-Rapor Kurikulum Merdeka.",
    bulletPoints: [
      "Buka menu 'E-Rapor / Nilai' pada navigasi siswa.",
      "Periksa rekap nilai per mata pelajaran beserta catatan capaian kompetensi.",
      "Lihat predikat kelulusan KKTP (Kriteria Ketercapaian Tujuan Pembelajaran).",
      "Klik tombol 'Cetak / Unduh Rapor PDF' jika semester telah ditutup.",
    ],
    tips: "Nilai yang ditampilkan murni bersumber dari rekap penilaian asli database madrasah.",
    routeHint: "/dashboard?tab=rapor",
  },

  // --- GURU MAPEL ---
  {
    id: "guru-1",
    stepNumber: 1,
    category: "guru",
    title: "Membuka Ruang Belajar KBM Live",
    subtitle: "Memulai sesi mengajar, presensi kelas, dan materi",
    description: "Guru membuka sesi KBM aktif agar siswa di kelas dapat melihat materi dan melakukan absensi.",
    bulletPoints: [
      "Buka menu 'Ruang Mengajar' di sidebar guru.",
      "Pilih Rombel (misal: Kelas VII A) dan Mata Pelajaran yang diampu.",
      "Pilih nomor pertemuan (1–18) dan topik materi yang diajarkan.",
      "Klik 'Buka Sesi KBM Live' untuk mengaktifkan status kelas.",
      "Lakukan checklist kehadiran siswa pada tab 'Presensi Siswa'.",
    ],
    tips: "Gunakan fitur 'Tandai Semua Hadir' untuk mempercepat presensi awal rombel.",
    routeHint: "/dashboard?tab=ruangmengajar",
  },
  {
    id: "guru-2",
    stepNumber: 2,
    category: "guru",
    title: "Mengisi Jurnal Mengajar Harian",
    subtitle: "Pencatatan materi, jam ke, dan catatan kejadian kelas",
    description: "Kewajiban administratif jurnal mengajar tersimpan permanen di database madrasah.",
    bulletPoints: [
      "Pada menu 'Ruang Mengajar', klik tab 'Jurnal Mengajar'.",
      "Klik tombol '+ Buat Jurnal Baru'.",
      "Isikan materi pokok, jam pelajaran, dan catatan perkembangan siswa di kelas.",
      "Klik 'Simpan Jurnal'. Jurnal otomatis tersinkron ke supervisi Kepala Madrasah.",
    ],
    tips: "Jurnal KBM yang terisi otomatis menjadi bukti kinerja pada laporan supervisi Kamad.",
    routeHint: "/dashboard?tab=ruangmengajar",
  },
  {
    id: "guru-3",
    stepNumber: 3,
    category: "guru",
    title: "Mengelola Bank Soal & Mengadakan CBT",
    subtitle: "Input soal PG, essay, dan rilis token ujian",
    description: "Buat bank soal ujian kurikulum merdeka dan pantau siswa yang sedang mengerjakan secara real-time.",
    bulletPoints: [
      "Masuk ke menu 'CBT & Asesmen' -> 'Bank Soal'.",
      "Klik '+ Tambah Bank Soal' atau gunakan 'Import Soal Excel'.",
      "Tentukan bobot nilai, kunci jawaban, dan durasi pengerjaan.",
      "Jadwalkan ujian dan terbitkan Token Ujian resmi untuk dibagikan ke siswa.",
      "Pantau layar 'Monitoring Peserta Ujian' saat ujian berlangsung.",
    ],
    tips: "Nilai pilihan ganda otomatis dikoreksi sistem seketika siswa menyelesaikan ujian.",
    routeHint: "/dashboard?tab=cbt",
  },
  {
    id: "guru-4",
    stepNumber: 4,
    category: "guru",
    title: "Input Nilai Rapor & Analisis KKTP",
    subtitle: "Perhitungan nilai akhir formatif dan sumatif semester",
    description: "Kalkulasi otomatis nilai siswa terhadap batas ketuntasan KKTP madrasah (75).",
    bulletPoints: [
      "Pilih menu 'Pengolahan Nilai / Rapor' di sidebar.",
      "Pilih kelas dan mata pelajaran yang Anda ampu.",
      "Input nilai tugas formatif dan sumatif lingkup materi.",
      "Sistem otomatis menampilkan status 'Tuntas' atau 'Perlu Remedial'.",
      "Klik 'Simpan Nilai Rapor' untuk diserahkan ke Wali Kelas.",
    ],
    tips: "Tersedia fitur 'Kirim Notifikasi WA Nilai' ke orang tua siswa yang belum tuntas.",
    routeHint: "/dashboard?tab=rapor",
  },

  // --- WALI KELAS ---
  {
    id: "walikelas-1",
    stepNumber: 1,
    category: "walikelas",
    title: "Manajemen Data Kelas Binaan",
    subtitle: "Pantau daftar 30–32 siswa rombel binaan Anda",
    description: "Wali kelas memiliki hak kelola profil siswa, data orang tua/wali, dan rekap kehadiran rombel.",
    bulletPoints: [
      "Buka menu 'Manajemen Kelas' di sidebar Wali Kelas.",
      "Rombel binaan Anda otomatis terdeteksi dari database (misal: Rombel VIII A).",
      "Lihat daftar siswa lengkap dengan NISN, jenis kelamin, dan kontak ortu.",
      "Perbarui nomor WhatsApp orang tua untuk integrasi broadcast pesan otomatis.",
    ],
    tips: "Gunakan tombol 'Cetak Absensi Format Kemenag' untuk berkas administrasi fisik kelas.",
    routeHint: "/dashboard?tab=manajemenkelas",
  },
  {
    id: "walikelas-2",
    stepNumber: 2,
    category: "walikelas",
    title: "Validasi Leger Nilai & Cetak Rapor",
    subtitle: "Rekap seluruh mapel dan cetak buku rapor lengkap",
    description: "Kompilasi nilai seluruh guru pengampu menjadi Buku Leger dan lembar rapor resmi.",
    bulletPoints: [
      "Buka menu 'E-Rapor Kelas' di sidebar navigasi.",
      "Cek kelengkapan input nilai dari seluruh 15 guru mata pelajaran.",
      "Buka tab 'Buku Leger' untuk melihat peringkat kelas dan nilai rata-rata.",
      "Isikan catatan perkembangan wali kelas dan predikat ekstrakurikuler.",
      "Klik 'Cetak Seluruh Rapor Kelas' untuk mengunduh berkas cetak resmi.",
    ],
    tips: "Pastikan seluruh guru pengampu telah menyelesaikan input nilai sebelum validasi akhir.",
    routeHint: "/dashboard?tab=rapor",
  },

  // --- KEPALA MADRASAH ---
  {
    id: "kamad-1",
    stepNumber: 1,
    category: "kamad",
    title: "Supervisi KBM Live & Kehadiran Guru",
    subtitle: "Monitoring transparansi proses belajar mengajar secara real-time",
    description: "Kepala Madrasah dapat memantau ruang kelas mana yang sedang aktif dan memeriksa jurnal mengajar guru.",
    bulletPoints: [
      "Buka menu 'Supervisi KBM Live' pada portal Kepala Madrasah.",
      "Pantau ringkasan kelas aktif, jumlah guru mengajar, dan tingkat kehadiran hari ini.",
      "Klik tombol 'Pantau Kelas' pada salah satu rombel untuk melihat presensi dan materi.",
      "Periksa kepatuhan pengisian Jurnal Harian Guru dari tabel rekapitulasi.",
    ],
    tips: "Supervisi bersifat read-only terproteksi untuk menjamin keaslian data ruang mengajar.",
    routeHint: "/dashboard?tab=monitoringkbm",
  },
  {
    id: "kamad-2",
    stepNumber: 2,
    category: "kamad",
    title: "Evaluasi Mutu & Grafik Kinerja Akademik",
    subtitle: "Dashboard capaian prestasi dan ketuntasan madrasah",
    description: "Melihat ringkasan statistik komprehensif seluruh jenjang kelas VII, VIII, dan IX.",
    bulletPoints: [
      "Buka 'Dashboard Kepala Madrasah' di beranda utama.",
      "Tinjau grafik rata-rata nilai per jenjang dan tingkat kelulusan KKTP.",
      "Lihat capaian Tahfidz Quran madrasah (santri mutqin & total hafalan juz).",
      "Unduh laporan berkala untuk keperluan rapat dinas Kemenag.",
    ],
    tips: "Semua data grafik dihitung secara live dari database MySQL madrasah.",
    routeHint: "/dashboard",
  },

  // --- ADMINISTRATOR ---
  {
    id: "admin-1",
    stepNumber: 1,
    category: "admin",
    title: "Manajemen Akun Pengguna & Hak Akses",
    subtitle: "Pengelolaan kredensial siswa, guru, wali kelas, dan pimpinan",
    description: "Mengontrol keamanan akun, reset kata sandi, dan pembagian peran akun terpadu.",
    bulletPoints: [
      "Buka menu 'Manajemen Pengguna' di portal admin.",
      "Filter pengguna berdasarkan peran (Guru, Siswa, Wali Kelas, Kamad).",
      "Gunakan tombol '+ Tambah Pengguna' atau 'Reset Password' jika ada kendala.",
      "Atur penugasan mata pelajaran utama dan rombel binaan.",
    ],
    tips: "Sistem menggunakan standar keamanan enkripsi tinggi untuk seluruh kredensial akun.",
    routeHint: "/admin -> Tab Pengguna",
  },
  {
    id: "admin-2",
    stepNumber: 2,
    category: "admin",
    title: "Konfigurasi SIAKAD & Master Data",
    subtitle: "Master Rombel, Mata Pelajaran, dan Pengaturan KKTP",
    description: "Fondasi data akademik madrasah tersimpan rapi di database MySQL.",
    bulletPoints: [
      "Buka menu 'SIAKAD Master Data' di panel admin.",
      "Kelola daftar kelas (7A s.d. 9B) dan penugasan SK Wali Kelas resmi.",
      "Atur struktur 15 mata pelajaran resmi dan alokasi JP per minggu.",
      "Konfigurasi standar ketuntasan belajar pada tab 'Skema KKTP'.",
    ],
    tips: "Perubahan master data otomatis merefleksikan seluruh modul di sisi guru dan siswa.",
    routeHint: "/admin -> Tab SIAKAD",
  },
];

export function PetunjukPenggunaanSection() {
  const [selectedRole, setSelectedRole] = useState<"siswa" | "guru" | "walikelas" | "kamad" | "admin">("siswa");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalStep, setActiveModalStep] = useState<GuideStep | null>(null);

  const filteredSteps = useMemo(() => {
    return GUIDE_DATA.filter((step) => {
      const matchesRole = step.category === selectedRole;
      if (!searchQuery.trim()) return matchesRole;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = step.title.toLowerCase().includes(q);
      const inDesc = step.description.toLowerCase().includes(q);
      const inPoints = step.bulletPoints.some((p) => p.toLowerCase().includes(q));
      const inTips = step.tips.toLowerCase().includes(q);

      return (matchesRole || q.length >= 3) && (inTitle || inDesc || inPoints || inTips);
    });
  }, [selectedRole, searchQuery]);

  const roleMeta = {
    siswa: {
      title: "Panduan Siswa",
      badge: "Ruang Belajar & CBT",
      icon: GraduationCap,
      color: "from-teal-500 to-emerald-600",
      intro: "Panduan lengkap bagi peserta didik MTsN 2 Cilacap untuk belajar, presensi, ujian, dan cek nilai.",
    },
    guru: {
      title: "Panduan Guru",
      badge: "KBM Live & Bank Soal",
      icon: BookOpen,
      color: "from-emerald-600 to-teal-700",
      intro: "Tata cara mengajar, input jurnal, kelola bank soal CBT, dan pengolahan nilai Kurikulum Merdeka.",
    },
    walikelas: {
      title: "Panduan Wali Kelas",
      badge: "Manajemen Rombel & Leger",
      icon: Users,
      color: "from-cyan-600 to-blue-600",
      intro: "Petunjuk pembinaan rombel binaan, komunikasi ortu, dan validasi cetak buku rapor semester.",
    },
    kamad: {
      title: "Panduan Kepala Madrasah",
      badge: "Supervisi & Eksekutif",
      icon: Building2,
      color: "from-amber-500 to-orange-600",
      intro: "Pengawasan mutu akademik, supervisi ruang kelas live, dan evaluasi capaian madrasah.",
    },
    admin: {
      title: "Panduan Administrator",
      badge: "Sistem & Master Data",
      icon: Key,
      color: "from-purple-600 to-indigo-600",
      intro: "Panduan teknis konfigurasi SIAKAD, pengelolaan akun pengguna, dan integrasi WhatsApp Gateway.",
    },
  };

  const currentRoleInfo = roleMeta[selectedRole];
  const CurrentIcon = currentRoleInfo.icon;

  const handlePrint = () => {
    window.print();
  };

  return (
    <section id="panduan" className="py-20 sm:py-24 bg-slate-100/70 dark:bg-slate-950/70 border-t border-slate-200/80 dark:border-teal-900/40 relative transition-colors duration-300">
      {/* Background glow accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-teal-500/10 dark:bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-4">
          <Badge className="bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700/50 px-3.5 py-1 text-xs font-bold tracking-wide shadow-xs">
            <BookMarked className="w-3.5 h-3.5 mr-1.5 inline text-teal-600 dark:text-teal-400" />
            PUSAT PANDUAN & BUKU MANUAL SISTEM
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Petunjuk Penggunaan <span className="bg-gradient-to-r from-teal-700 via-emerald-600 to-amber-600 dark:from-teal-300 dark:via-emerald-200 dark:to-amber-300 bg-clip-text text-transparent">LMS MTsN 2 Cilacap</span>
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Alur panduan operasional langkah demi langkah bagi seluruh pemangku kepentingan madrasah, dilengkapi tips praktis dan navigasi menu cepat.
          </p>

          {/* Laravel Docs Portal Banner CTA */}
          <div className="max-w-xl mx-auto pt-2">
            <Link
              to="/docs"
              className="group flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-amber-500/10 border border-teal-500/25 hover:border-teal-500/50 shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-teal-600 text-white shadow-sm shrink-0 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      Portal Dokumentasi Resmi (/docs)
                    </span>
                    <Badge className="bg-teal-600 text-white text-[9px] px-1.5 py-0 uppercase tracking-wider font-semibold">
                      Laravel Docs Style
                    </Badge>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                    Baca panduan lengkap 3-kolom disertai tangkapan layar (screenshot) asli sistem dan pencarian cepat Ctrl+K.
                  </p>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform">
                <span>Buka</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>

          {/* Quick Search Bar */}
          <div className="max-w-md mx-auto pt-2">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Cari petunjuk (contoh: CBT, Presensi, Rapor, Jurnal)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900/90 border-slate-300 dark:border-teal-800/60 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl focus-visible:ring-teal-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Role Tab Buttons */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10">
          {(["siswa", "guru", "walikelas", "kamad", "admin"] as const).map((rKey) => {
            const r = roleMeta[rKey];
            const Icon = r.icon;
            const isActive = selectedRole === rKey;

            return (
              <button
                key={rKey}
                onClick={() => setSelectedRole(rKey)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 border ${
                  isActive
                    ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white border-teal-500 shadow-md shadow-teal-500/25 scale-105"
                    : "bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-teal-500/40 hover:text-slate-900 dark:hover:text-white shadow-xs"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{r.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Role Intro Banner */}
        <div className="mb-8 p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-slate-900/90 dark:via-teal-950/40 dark:to-slate-900/90 border border-slate-200 dark:border-teal-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg dark:shadow-xl transition-colors duration-300">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentRoleInfo.color} flex items-center justify-center text-white font-bold shadow-md shrink-0`}>
              <CurrentIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{currentRoleInfo.title}</h3>
                <Badge variant="outline" className="border-teal-500/50 text-teal-700 dark:text-teal-300 text-[10px] bg-teal-50/50 dark:bg-transparent">
                  {currentRoleInfo.badge}
                </Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-xl">{currentRoleInfo.intro}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Cetak / Simpan PDF
            </Button>
          </div>
        </div>

        {/* Step-by-Step Interactive Cards Grid */}
        {filteredSteps.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
            <HelpCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">Tidak ada petunjuk yang sesuai dengan kata kunci &quot;{searchQuery}&quot;</p>
            <Button
              variant="link"
              onClick={() => setSearchQuery("")}
              className="text-xs text-teal-600 dark:text-teal-400 mt-2"
            >
              Tampilkan Semua Petunjuk
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSteps.map((step) => (
              <Card
                key={step.id}
                className="bg-white dark:bg-slate-900/90 border-slate-200 dark:border-teal-900/50 hover:border-teal-500/60 transition-all duration-300 rounded-2xl shadow-md dark:shadow-xl flex flex-col justify-between group hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Step Header Badge & Route */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-600 text-white font-black text-xs shadow-sm">
                      {step.stepNumber}
                    </span>
                    <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300/90 bg-slate-100 dark:bg-slate-950/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 truncate max-w-[170px]">
                      {step.routeHint}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors leading-snug">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{step.subtitle}</p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {step.description}
                  </p>

                  {/* Key Action Bullets Preview */}
                  <ul className="space-y-1.5 pt-1 text-xs text-slate-700 dark:text-slate-300">
                    {step.bulletPoints.slice(0, 3).map((bp, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{bp}</span>
                      </li>
                    ))}
                    {step.bulletPoints.length > 3 && (
                      <li className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold pl-5">
                        +{step.bulletPoints.length - 3} langkah lainnya...
                      </li>
                    )}
                  </ul>

                  {/* Quick Tip Box */}
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{step.tips}</span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveModalStep(step)}
                    className="w-full text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-white hover:bg-teal-100/50 dark:hover:bg-teal-950/60 gap-1.5 justify-center rounded-xl"
                  >
                    <span>Buka Panduan Lengkap</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Popup Detail Langkah Panduan */}
        <Dialog open={!!activeModalStep} onOpenChange={(open) => !open && setActiveModalStep(null)}>
          <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-teal-800 text-slate-900 dark:text-slate-100 rounded-2xl shadow-2xl p-6">
            {activeModalStep && (
              <div className="space-y-5">
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-teal-600 text-white font-black text-xs">
                      Langkah {activeModalStep.stepNumber}
                    </Badge>
                    <span className="text-xs font-mono text-teal-700 dark:text-teal-300">
                      Target Menu: {activeModalStep.routeHint}
                    </span>
                  </div>
                  <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {activeModalStep.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    {activeModalStep.subtitle}
                  </DialogDescription>
                </DialogHeader>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  {activeModalStep.description}
                </p>

                {/* Urutan Langkah */}
                <div className="space-y-2">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                    Tahapan Pelaksanaan:
                  </h5>
                  <div className="space-y-2">
                    {activeModalStep.bulletPoints.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 font-bold shrink-0 text-[11px]">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Box Tips */}
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-amber-800 dark:text-amber-300 mb-0.5">Catatan Penting:</span>
                    <span>{activeModalStep.tips}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveModalStep(null)}
                    className="border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 text-xs"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
