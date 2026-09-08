import { useState, useEffect } from "react";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import logoAsset from "@/assets/logo-mtsn2.png.asset.json";
import {
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  LogIn,
  BookMarked,
  LayoutDashboard,
  Check,
  Building2,
  Layers,
  Menu,
  X,
  FileCheck,
  MapPin,
  Sun,
  Moon,
  FileText,
  HelpCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export const Route = createFileRoute("/")({
  ssr: false,
  beforeLoad: async () => {
    const user = MysqlAuthService.getActiveUser();
    if (user) {
      const isAdmin = user.role === "admin" || user.email?.toLowerCase() === "admin@mail.com";
      throw redirect({ to: (isAdmin ? "/admin" : "/dashboard") as any });
    }
  },
  head: () => ({
    meta: [
      { title: "LMS MTsN 2 Cilacap — Portal Pembelajaran & SIAKAD Digital" },
      { name: "description", content: "Portal Pembelajaran & SIAKAD resmi MTs Negeri 2 Cilacap. Berstandar Kurikulum Merdeka Kementerian Agama Republik Indonesia." },
      { property: "og:title", content: "LMS MTsN 2 Cilacap" },
      { property: "og:description", content: "Portal pembelajaran digital modern MTsN 2 Cilacap." },
    ],
  }),
  component: LandingPage,
});

const ROLE_PREVIEWS = [
  {
    id: "siswa",
    title: "Siswa",
    badge: "Ruang Belajar",
    icon: GraduationCap,
    description: "Akses materi KBM pertemuan 1–18, ujian CBT online real-time, tracker setoran hafalan Tahfidz, dan e-Rapor digital.",
    features: [
      "Materi pertemuan 1–18 (PDF, Video Edukasi, & LKPD)",
      "CBT Ujian Online dengan Token Keamanan & Timer",
      "Pencatatan Setoran Tahfidz (Juz 30, 29, & 1)",
      "Presensi Mandiri Sesi KBM & Forum Diskusi Kelas",
      "Pratinjau Hasil Nilai & Unduh E-Rapor Digital",
    ],
  },
  {
    id: "guru",
    title: "Guru Pengampu",
    badge: "Ruang Mengajar",
    icon: BookOpen,
    description: "Kelola KBM interaktif harian, input jurnal mengajar, presensi real-time, bank soal CBT, serta evaluasi ketuntasan TP.",
    features: [
      "Sesi KBM Live dengan Jurnal & Presensi Kelas",
      "Pembuatan LKPD In-Page & Bahan Ajar Digital",
      "Bank Soal CBT (Pilihan Ganda & Uraian)",
      "Analisis Otomatis Nilai Remedial KKM (75)",
      "Penilaian KBM Terhubung Langsung ke Leger Rapor",
    ],
  },
  {
    id: "walikelas",
    title: "Wali Kelas",
    badge: "Kelas Binaan",
    icon: Users,
    description: "Pantau perkembangan akademik siswa rombel binaan, absensi harian, catatan bimbingan, dan cetak lembar e-Rapor resmi.",
    features: [
      "Monitoring Kehadiran & Ketuntasan Siswa Rombel",
      "Catatan Perkembangan & Observasi Wali Kelas",
      "Pemberian Nilai Sikap & Ekstrakurikuler",
      "Cetak E-Rapor Format Standar Resmi Kemenag",
      "Export Rekap Nilai dan Leger Rapor ke Excel",
    ],
  },
  {
    id: "kamad",
    title: "Kepala Madrasah",
    badge: "Supervisi & Kebijakan",
    icon: Building2,
    description: "Supervisi langsung jalannya KBM madrasah, pemantauan kehadiran GTK & siswa, monitoring CBT, serta pengesahan akhir e-Rapor.",
    features: [
      "Executive Dashboard Keterlaksanaan KBM Harian",
      "Monitoring Ujian CBT Online se-Madrasah Real-Time",
      "Statistik Kehadiran Siswa & Tenaga Pendidik",
      "Persetujuan & Pengesahan Digital Rapor Madrasah",
      "Laporan Kinerja Akademik Berkala",
    ],
  },
  {
    id: "waka",
    title: "Waka Kurikulum",
    badge: "Kurikulum Merdeka",
    icon: Layers,
    description: "Verifikasi perangkat ajar guru (CP, TP, ATP, Modul Ajar), penataan jadwal KBM, dan pemantauan distribusi kurikulum.",
    features: [
      "Verifikasi & Pengesahan Modul Ajar Guru Pengampu",
      "Validasi Kelengkapan Bahan Ajar Pertemuan 1–18",
      "Pengaturan Distribusi Mata Pelajaran & Jadwal KBM",
      "Pengawasan Bobot Penilaian Rapor Madrasah",
      "Evaluasi Ketuntasan Kurikulum Merdeka",
    ],
  },
  {
    id: "admin_akademik",
    title: "Admin Akademik",
    badge: "Layanan SIAKAD",
    icon: LayoutDashboard,
    description: "Pengelolaan master data madrasah, pendataan siswa & rombel, akun pengguna, jadwal KBM, dan proses kenaikan kelas.",
    features: [
      "Master Data Siswa, Guru, & Rombongan Belajar",
      "Penetapan Tahun Ajaran & Jadwal Pelajaran Aktif",
      "Manajemen Akun & Kenaikan Kelas Siswa",
      "Import / Export Data Pokok Format Excel",
      "Pengumuman Resmi & E-Library Madrasah",
    ],
  },
  {
    id: "admin",
    title: "Super Admin",
    badge: "Pusat Pengaturan",
    icon: ShieldCheck,
    description: "Pengaturan sistem terpusat, keamanan autentikasi, cadangan database, dan pengelolaan seluruh hak akses pengguna.",
    features: [
      "Pengaturan Hak Akses Multi-Role Terproteksi",
      "Audit Log Aktivitas Pengguna & Keamanan Sistem",
      "Sinkronisasi & Backup Database Madrasah",
      "Konfigurasi Parameter Aplikasi Terpadu",
    ],
  },
];

function LandingPage() {
  const [activeRole, setActiveRole] = useState("siswa");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Synchronized Light & Dark Mode state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lms_theme");
      if (saved) return saved === "dark";
      return (
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("lms_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("lms_theme", "light");
    }
  }, [isDark]);

  const selectedRoleData = ROLE_PREVIEWS.find((r) => r.id === activeRole) || ROLE_PREVIEWS[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased overflow-x-hidden transition-colors duration-300">
      {/* Background Subtle Gradient & Grid Texture */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000006_1px,transparent_1px),linear-gradient(to_bottom,#00000006_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-950/85 border-b border-border/80 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & School Name */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0 flex-1 md:flex-initial">
            <img
              src={logoAsset.url}
              alt="Logo MTsN 2 Cilacap"
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-emerald-500/30 bg-white p-0.5 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight text-foreground truncate">
                  <span className="hidden sm:inline">MTs Negeri 2 Cilacap</span>
                  <span className="sm:hidden">MTsN 2 Cilacap</span>
                </span>
                <Badge className="hidden md:inline-flex bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50 text-[10px] px-2 py-0.5 font-medium shrink-0">
                  LMS & SIAKAD
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden lg:block">Portal Pembelajaran Kurikulum Merdeka Kemenag</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#pilar" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Keunggulan
            </a>
            <a href="#alur" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Alur Belajar
            </a>
            <a href="#roles" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              Portal Peran
            </a>
            <Link to="/docs" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
              <span>Buku Panduan</span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Docs
              </span>
            </Link>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons & Theme Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </Button>

            <Button
              asChild
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-2.5 sm:px-4 h-8 sm:h-9 rounded-lg sm:rounded-xl shadow-xs"
            >
              <Link to="/auth" className="flex items-center gap-1 sm:gap-1.5">
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Masuk<span className="hidden sm:inline"> Portal</span></span>
              </Link>
            </Button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus:outline-none shrink-0"
              aria-label="Buka Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-foreground" /> : <Menu className="w-5 h-5 text-foreground" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 space-y-2 text-xs font-semibold shadow-lg">
            <a
              href="#pilar"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-foreground hover:text-emerald-600 border-b border-border/50"
            >
              <span>Keunggulan Sistem</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
            <a
              href="#alur"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-foreground hover:text-emerald-600 border-b border-border/50"
            >
              <span>Alur Belajar 18 Pertemuan</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
            <a
              href="#roles"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-foreground hover:text-emerald-600 border-b border-border/50"
            >
              <span>Portal Akses Peran</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
            <Link
              to="/docs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-foreground hover:text-emerald-600 border-b border-border/50"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buku Panduan Penggunaan</span>
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">/docs</Badge>
            </Link>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-foreground hover:text-emerald-600"
            >
              <span>Pusat Bantuan (FAQ)</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-8 pb-14 sm:pt-14 sm:pb-20 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              {/* Official Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Portal Resmi Pembelajaran & SIAKAD Digital</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.2]">
                Mewujudkan Pembelajaran Madrasah Modern, Unggul, & Berakhlak Mulia
              </h1>

              {/* Concise Description */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
                Platform terpadu MTs Negeri 2 Cilacap berstandar Kurikulum Merdeka Kemenag. Mengintegrasikan ruang KBM interaktif pertemuan 1–18, evaluasi CBT online real-time, pencatatan Tahfidz Al-Qur&apos;an, dan otomatisasi E-Rapor madrasah.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl px-6 py-3 shadow-sm transition-all"
                >
                  <Link to="/auth" className="flex items-center justify-center gap-2">
                    <span>Masuk ke Portal LMS</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-border bg-card hover:bg-muted text-foreground font-semibold text-sm rounded-xl px-5 py-3 shadow-2xs"
                >
                  <Link to="/docs" className="flex items-center justify-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Buku Panduan Penggunaan</span>
                  </Link>
                </Button>
              </div>

              {/* Quick Feature Pills */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> KBM 18 Pertemuan
                </span>
                <span className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> CBT Auto-Grading (KKM 75)
                </span>
                <span className="flex items-center gap-1.5 bg-card border border-border px-2.5 py-1 rounded-lg">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Tahfidz & E-Rapor PDF
                </span>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-md">
                {/* Browser Frame Header */}
                <div className="bg-muted/60 px-4 py-2.5 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-[11px] font-mono text-muted-foreground">lms.mtsn2cilacap.sch.id</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-semibold">
                    STATUS AKTIF
                  </Badge>
                </div>

                {/* Hero Banner Preview */}
                <div className="relative">
                  <img
                    src="/hero-banner.png"
                    alt="Pratinjau Antarmuka LMS MTsN 2 Cilacap"
                    className="w-full h-auto object-cover"
                  />

                  {/* Clean Floating Pills on image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 flex-wrap">
                    <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-2.5 py-1.5 shadow-sm flex items-center gap-2 text-[11px]">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-foreground">Ujian Online CBT</span>
                    </div>
                    <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-2.5 py-1.5 shadow-sm flex items-center gap-2 text-[11px]">
                      <BookMarked className="w-3.5 h-3.5 text-teal-600" />
                      <span className="font-semibold text-foreground">Modul Tahfidz</span>
                    </div>
                    <div className="bg-background/90 backdrop-blur-md border border-border rounded-lg px-2.5 py-1.5 shadow-sm flex items-center gap-2 text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold text-foreground">E-Rapor Kemenag</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Pilar Ekosistem Madrasah Digital (Bento Grid Padat & Berbobot) */}
      <section id="pilar" className="py-14 border-t border-border bg-muted/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50 text-xs font-semibold">
              4 PILAR UTAMA
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Ekosistem Pembelajaran Terintegrasi
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Seluruh kebutuhan proses belajar mengajar, asesmen, pembinaan akhlak, dan administrasi nilai terangkum dalam 4 pilar inti.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Pilar 1 */}
            <Card className="border-border bg-card shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  Ruang KBM 18 Pertemuan
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                  Penyampaian materi terstruktur per semester (PDF, Video, PPT, LKPD), konfirmasi presensi real-time, dan forum interaksi kelas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                  <Badge variant="outline" className="text-[10px] font-normal">Modul Ajar PDF</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Presensi One-Click</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Tugas & LKPD</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pilar 2 */}
            <Card className="border-border bg-card shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <Zap className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  CBT Exam Engine
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                  Ujian online aman dengan Token Sesi, Timer Countdown, koreksi otomatis pilihan ganda, dan deteksi siswa remedial di bawah KKM 75.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                  <Badge variant="outline" className="text-[10px] font-normal">Token Keamanan</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Timer Real-Time</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Auto-Grading</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pilar 3 */}
            <Card className="border-border bg-card shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center mb-3">
                  <BookMarked className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  Modul Tahfidz Al-Qur&apos;an
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                  Pencatatan setoran hafalan siswa (Juz 30, 29, & 1), verifikasi predikat Mutqin & Murojaah, serta fasilitas cetak Kartu Murojaah PDF.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                  <Badge variant="outline" className="text-[10px] font-normal">Juz 30, 29, 1</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Predikat Mutqin</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Kartu Murojaah PDF</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Pilar 4 */}
            <Card className="border-border bg-card shadow-xs hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <CardHeader className="p-5 pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
                  <FileCheck className="w-5 h-5" />
                </div>
                <CardTitle className="text-base font-bold text-foreground">
                  SIAKAD & E-Rapor Kemenag
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                  Formulasi bobot nilai resmi (Presensi 10% + Tugas 30% + UTS 30% + PAS 30%), pengesahan Wali Kelas & Kamad, serta cetak PDF Kop Resmi.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/60">
                  <Badge variant="outline" className="text-[10px] font-normal">Format Kemenag</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Kop Resmi Madrasah</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal">Export Excel</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Alur Pembelajaran 1–18 Pertemuan */}
      <section id="alur" className="py-14 border-t border-border bg-card relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50 text-xs font-semibold">
              SIKLUS SEMESTER
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Alur Belajar Terstruktur 18 Pertemuan
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Setiap mata pelajaran dikelola secara konsisten dalam siklus 18 pertemuan terstandar per semester.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h3 className="font-bold text-sm text-foreground">Pertemuan 1–8</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Penyampaian TP, Modul Ajar PDF, Video, LKPD, Presensi Online, & Forum Diskusi.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">Pertemuan 9: CBT UTS</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluasi Tengah Semester CBT dengan Token Keamanan & Live Countdown Timer.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-background space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h3 className="font-bold text-sm text-foreground">Pertemuan 10–17</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Materi lanjutan, praktikum LKPD, pengayaan materi, & bimbingan remedial KKM 75.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 space-y-2">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                4
              </div>
              <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300">Pertemuan 18: CBT PAS</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Evaluasi Akhir Semester CBT untuk penentuan nilai capaian belajar semester.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                5
              </div>
              <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">E-Rapor Official</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Perhitungan otomatis (10-30-30-30), pengesahan Kamad, & cetak PDF resmi Kemenag.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Akses Portal 7 Peran (Interactive Selector) */}
      <section id="roles" className="py-14 border-t border-border bg-muted/20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50 text-xs font-semibold">
              HAK AKSES TERPADU
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Portal Akses Sesuai Peran Anda
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Setiap warga madrasah memiliki ruang kerja mandiri yang telah disesuaikan dengan tugas pokok dan fungsinya.
            </p>
          </div>

          {/* Role Filter Chips */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {ROLE_PREVIEWS.map((r) => {
              const IconComp = r.icon;
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-card text-foreground border-border hover:border-emerald-500/40"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Role Display Card */}
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                  {(() => {
                    const IconComp = selectedRoleData.icon;
                    return <IconComp className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      Peran {selectedRoleData.title}
                    </h3>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                      {selectedRoleData.badge}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedRoleData.description}</p>
                </div>
              </div>

              <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0">
                <Link to="/auth">Masuk Sebagai {selectedRoleData.title}</Link>
              </Button>
            </div>

            {/* Role Features List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {selectedRoleData.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pusat Panduan Penggunaan (/docs Callout Banner) */}
      <section className="py-12 border-t border-border bg-card relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pusat Dokumentasi Resmi</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Butuh Panduan Lengkap Penggunaan LMS?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
                Pelajari tutorial langkah-demi-langkah pengoperasian sistem untuk Siswa, Guru Pengampu, Wali Kelas, Kepala Madrasah, dan Admin di halaman dokumentasi interaktif.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-2.5">
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs">
                <Link to="/docs" className="flex items-center gap-2">
                  <span>Buka Buku Panduan LMS</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Ringkas (4 Pertanyaan Krusial) */}
      <section id="faq" className="py-14 border-t border-border bg-muted/20 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 space-y-2">
            <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700/50 text-xs font-semibold">
              FAQ
            </Badge>
            <h2 className="text-2xl font-bold text-foreground">Pertanyaan Sering Diajukan</h2>
            <p className="text-xs text-muted-foreground">Informasi penting seputar akses dan operasional LMS MTsN 2 Cilacap</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="border border-border rounded-xl px-4 bg-card shadow-2xs">
              <AccordionTrigger className="text-foreground hover:text-emerald-600 font-semibold text-xs sm:text-sm text-left">
                Bagaimana cara mendapatkan akun login LMS MTsN 2 Cilacap?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                Akun Siswa dan Guru dibuat secara resmi oleh Admin Akademik MTsN 2 Cilacap. Siswa dapat login menggunakan NISN dan kata sandi yang dibagikan oleh wali kelas.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-border rounded-xl px-4 bg-card shadow-2xs">
              <AccordionTrigger className="text-foreground hover:text-emerald-600 font-semibold text-xs sm:text-sm text-left">
                Apakah CBT Ujian Online dapat diakses lancar melalui Smartphone / Tablet?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                Ya, engine CBT LMS dirancang 100% responsif dan ringan sehingga lancar diakses melalui browser HP, tablet, maupun komputer/laptop tanpa perlu menginstal aplikasi tambahan.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-border rounded-xl px-4 bg-card shadow-2xs">
              <AccordionTrigger className="text-foreground hover:text-emerald-600 font-semibold text-xs sm:text-sm text-left">
                Bagaimana formula perhitungan nilai E-Rapor Kurikulum Merdeka?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                Nilai rapor dihitung otomatis menggunakan formula standar Kemenag: Presensi KBM (10%) + Rata-rata Tugas/LKPD (30%) + UTS (30%) + PAS (30%). Rapor dapat dicetak langsung dalam format PDF resmi dengan Kop Madrasah.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-border rounded-xl px-4 bg-card shadow-2xs">
              <AccordionTrigger className="text-foreground hover:text-emerald-600 font-semibold text-xs sm:text-sm text-left">
                Apa target dan cakupan hafalan pada Modul Tahfidz Al-Qur&apos;an?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-xs leading-relaxed">
                Target hafalan utama meliputi Juz 30 (Juz &apos;Amma), Juz 29 (Juz Tabarak), dan Juz 1 (Al-Baqarah). Setiap setoran dicatat lengkap dengan predikat kelancaran (Mutqin/Murojaah) dan dapat dicetak sebagai Kartu Murojaah PDF.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer Resmi */}
      <footer className="bg-slate-950 border-t border-slate-900 py-10 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img src={logoAsset.url} alt="Logo MTsN 2 Cilacap" className="h-8 w-8 rounded-full bg-white p-0.5" />
              <span className="font-bold text-base text-white">MTs Negeri 2 Cilacap</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Portal Pembelajaran & Layanan Akademik Digital MTs Negeri 2 Cilacap. Berstandar Kurikulum Merdeka Kementerian Agama Republik Indonesia.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white text-xs mb-2.5">Navigasi Utama</h4>
            <ul className="space-y-1.5 text-xs">
              <li><a href="#pilar" className="hover:text-emerald-400">Keunggulan Sistem</a></li>
              <li><a href="#alur" className="hover:text-emerald-400">Alur Belajar 18 Pertemuan</a></li>
              <li><a href="#roles" className="hover:text-emerald-400">Portal Peran</a></li>
              <li><Link to="/docs" className="hover:text-emerald-400">Buku Panduan Penggunaan</Link></li>
              <li><a href="#faq" className="hover:text-emerald-400">Pusat Bantuan</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white text-xs mb-2.5">Kontak & Lokasi</h4>
            <div className="text-xs text-slate-400 leading-relaxed space-y-1.5">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Jl. Karangpucung - Sidareja, Purbayasa, Sindangbarang, Kec. Karangpucung, Cilacap, Jawa Tengah 53255
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-0.5">Kementerian Agama Republik Indonesia</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 MTs Negeri 2 Cilacap. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="mt-1 sm:mt-0 text-emerald-400/80 font-medium">Portal Resmi Madrasah Digital</p>
        </div>
      </footer>
    </div>
  );
}