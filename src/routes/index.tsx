import { useState } from "react";
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
  Award,
  FileText,
  CheckCircle2,
  ShieldCheck,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Star,
  Zap,
  PlayCircle,
  BarChart3,
  HelpCircle,
  LogIn,
  Clock,
  Lock,
  BookMarked,
  LayoutDashboard,
  Check,
  Building2,
  Book,
  FileSpreadsheet,
  Layers,
  HeartHandshake,
  Activity,
  Menu,
  X,
  FileCheck,
  MapPin,
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
      { name: "description", content: "Portal Learning Management System & SIAKAD resmi MTs Negeri 2 Cilacap. Berbasis Kurikulum Merdeka Kemenag Edition." },
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
    color: "from-teal-500 to-emerald-600",
    description: "Akses materi pembelajaran 1–18 pertemuan, ujian CBT online, setoran hafalan Tahfidz, dan e-Rapor.",
    features: [
      "Materi Pembelajaran 1–18 (PDF, Video Tutorial, LKPD)",
      "CBT Ujian Online dengan Token & Timer Countdown Real-time",
      "Modul Tahfidz Tracker (Juz 30, 29, & 1)",
      "Presensi One-Click & Forum Diskusi Kelas",
      "E-Rapor Digital & Akses E-Library Murottal",
    ],
  },
  {
    id: "guru",
    title: "Guru Pengampu",
    badge: "Ruang Mengajar",
    icon: BookOpen,
    color: "from-emerald-600 to-teal-700",
    description: "Kelola perangkat ajar, bank soal CBT, penilaian otomatis, serta program remedial dan pengayaan.",
    features: [
      "Manajemen Struktur Pertemuan 1–18 Per Rombel",
      "Bank Soal CBT (Pilihan Ganda, Essay, Isian Singkat)",
      "Auto-grading Skor PG & Analisis KKM (75)",
      "Fitur 1-Click Kirim Remedial & Pengayaan",
      "Input Nilai Tugas & Rekap Presensi Otomatis",
    ],
  },
  {
    id: "walikelas",
    title: "Wali Kelas",
    badge: "Monitoring Rombel",
    icon: Users,
    color: "from-cyan-600 to-teal-600",
    description: "Pantau perkembangan akademik rombel, rekap presensi harian, dan cetak PDF E-Rapor resmi.",
    features: [
      "Dashboard Khusus Rekapitulasi Rombel",
      "Monitoring Kehadiran & Catatan Wali Kelas",
      "Pengesahan Nilai Akademik & Ekstrakurikuler",
      "Cetak PDF E-Rapor Official Kop Kemenag",
      "Export Excel Rekap Nilai Rapor Class Level",
    ],
  },
  {
    id: "kamad",
    title: "Kepala Madrasah",
    badge: "Executive Dashboard",
    icon: Building2,
    color: "from-amber-500 to-emerald-600",
    description: "Executive monitoring 948+ siswa, statistik presensi 96.8%, progress mengajar guru, dan e-Rapor.",
    features: [
      "Statistik Real-time 948 Siswa & 50+ Pendidik",
      "Grafik Kehadiran & Early Warning System (EWS)",
      "Monitoring Kelancaran Ujian CBT Online",
      "Pengesahan Digital E-Rapor Madrasah",
      "Laporan Monitoring Kinerja Akademik",
    ],
  },
  {
    id: "waka",
    title: "Waka Kurikulum",
    badge: "Validasi Kurikulum",
    icon: Layers,
    color: "from-teal-600 to-emerald-700",
    description: "Validasi Perangkat Ajar (CP, TP, ATP, Modul Ajar), matriks pengampu mapel, dan jadwal pelajaran.",
    features: [
      "Validasi Perangkat Ajar Guru (CP, TP, ATP, Modul Ajar)",
      "Monitoring Kelengkapan Pertemuan 1–18",
      "Matriks Penugasan Pengampu Mapel",
      "Pengaturan Bobot Penilaian Rapor (10-30-30-30)",
      "Evaluasi Ketuntasan Pembelajaran Semester",
    ],
  },
  {
    id: "admin_akademik",
    title: "Admin Akademik",
    badge: "SIAKAD Engine",
    icon: LayoutDashboard,
    color: "from-emerald-700 to-cyan-700",
    description: "Kelola Master Data Siswa, Guru, Rombel, Master Jadwal, dan SIAKAD 4-Step Wizard Kenaikan Kelas.",
    features: [
      "Master Data Siswa, Guru, Tingkat Kelas, & Rombel",
      "Pengaturan Master Jadwal & Tahun Ajaran Active",
      "SIAKAD 4-Step Wizard Kenaikan Kelas Massal",
      "Manajemen Pengumuman Resmi & E-Library",
      "Import / Export Data Excel Terintegrasi",
    ],
  },
  {
    id: "admin",
    title: "Super Admin",
    badge: "System Core",
    icon: ShieldCheck,
    color: "from-teal-700 to-indigo-800",
    description: "Kontrol penuh sistem, audit trail aktivitas, backup & restore database SQL, dan status server.",
    features: [
      "Pengaturan Sistem & Manajemen RBAC 7 Roles",
      "Monitoring Status Server (CPU, RAM, SSD, MySQL Engine)",
      "Audit Log Trail Aktivitas Seluruh Pengguna",
      "Backup Database (.SQL) 1-Click & Restore Fail-Safe",
      "Pengaturan Mode Keamanan & Session Token",
    ],
  },
];

function LandingPage() {
  const [activeRole, setActiveRole] = useState("siswa");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const selectedRoleData = ROLE_PREVIEWS.find((r) => r.id === activeRole) || ROLE_PREVIEWS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-teal-500 selection:text-white font-sans antialiased overflow-x-hidden">
      {/* Dynamic Background Ambient Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-emerald-500/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[130px]" />
      </div>

      {/* Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-teal-900/40 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 blur opacity-40 group-hover:opacity-75 transition duration-300"></div>
              <img
                src={logoAsset.url}
                alt="Logo MTsN 2 Cilacap"
                className="relative h-9 w-9 sm:h-11 sm:w-11 rounded-full object-cover border border-teal-400/30 bg-slate-900 p-0.5 sm:p-1"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-xl tracking-tight bg-gradient-to-r from-teal-300 via-emerald-200 to-amber-300 bg-clip-text text-transparent truncate">
                  LMS MTsN 2 Cilacap
                </span>
                <Badge className="hidden md:inline-flex bg-teal-950 text-teal-300 border-teal-700/50 text-[10px] px-2 py-0.5 shrink-0">
                  v2.5 Kemenag
                </Badge>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 font-medium truncate">Learning Management System & SIAKAD</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-teal-300 transition-colors">
              Beranda
            </a>
            <a href="#fitur" className="hover:text-teal-300 transition-colors">
              Fitur Unggulan
            </a>
            <a href="#alur" className="hover:text-teal-300 transition-colors">
              Alur 18 Pertemuan
            </a>
            <a href="#roles" className="hover:text-teal-300 transition-colors">
              Akses Portal 7 Role
            </a>
            <a href="#faq" className="hover:text-teal-300 transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button
              asChild
              className="relative group bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold shadow-lg shadow-teal-900/40 rounded-xl px-3 sm:px-5 py-2 sm:py-2.5 transition-all duration-300 border border-teal-400/30 text-xs sm:text-sm shrink-0"
            >
              <Link to="/auth" className="flex items-center gap-1.5 sm:gap-2">
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5" />
                <span className="hidden sm:inline">Masuk / Register</span>
                <span className="sm:hidden">Masuk</span>
              </Link>
            </Button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-900/95 border-b border-teal-900/50 px-4 pt-3 pb-6 space-y-3 text-sm font-medium">
            <a
              href="#hero"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-200 hover:text-teal-300"
            >
              Beranda
            </a>
            <a
              href="#fitur"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-200 hover:text-teal-300"
            >
              Fitur Unggulan
            </a>
            <a
              href="#alur"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-200 hover:text-teal-300"
            >
              Alur 18 Pertemuan
            </a>
            <a
              href="#roles"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-200 hover:text-teal-300"
            >
              Akses Portal 7 Role
            </a>
            <a
              href="#faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-200 hover:text-teal-300"
            >
              FAQ
            </a>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="relative pt-6 pb-16 sm:pt-12 sm:pb-20 md:pt-20 md:pb-28 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-5 sm:space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-full bg-teal-950/80 border border-teal-500/40 text-teal-300 text-[11px] sm:text-sm font-medium shadow-inner shadow-teal-500/10 max-w-full leading-snug">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-pulse shrink-0" />
                <span className="truncate">Portal Pembelajaran Digital Modern MTsN 2 Cilacap</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight sm:leading-[1.15]">
                Educating The Future Generation with{" "}
                <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                  Islamic & Tech Excellence
                </span>
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Platform LMS & SIAKAD Terpadu berstandar Kurikulum Merdeka Kemenag. Dilengkapi Computer-Based Test (CBT) Real-time, Modul Tahfidz Al-Qur&apos;an, dan Otomatisasi E-Rapor Madrasah.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-extrabold text-sm sm:text-base shadow-xl shadow-teal-500/25 rounded-xl px-6 sm:px-8 py-3.5 sm:py-6 transition-all duration-300 hover:scale-[1.03]"
                >
                  <Link to="/auth" className="flex items-center justify-center gap-2 sm:gap-3">
                    <span>Masuk ke Portal LMS</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto border-teal-500/40 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-xs sm:text-base rounded-xl px-5 sm:px-7 py-3.5 sm:py-6 backdrop-blur-sm"
                >
                  <a href="#fitur" className="flex items-center justify-center gap-2">
                    <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-teal-400" />
                    <span>Jelajahi Fitur</span>
                  </a>
                </Button>
              </div>

              {/* Quick Role Badges */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
                  Terintegrasi 7 Peran Pengguna (RBAC Matrix):
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-1.5 sm:gap-2">
                  {["🎓 Siswa", "👨‍🏫 Guru", "👥 Wali Kelas", "🏫 Kamad", "📋 Waka Kurikulum", "💼 Admin Akademik", "⚡ Super Admin"].map((role, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[11px] sm:text-xs font-medium hover:border-teal-500/40 transition-colors"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Visual Hero Banner Image */}
            <div className="lg:col-span-6 relative">
              <div className="relative group">
                {/* Glow Backdrop */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500 opacity-40 blur-xl group-hover:opacity-75 transition duration-1000"></div>

                {/* Banner Wrapper Frame */}
                <div className="relative rounded-2xl overflow-hidden border border-teal-500/30 bg-slate-900 shadow-2xl">
                  {/* Window Bar Header */}
                  <div className="bg-slate-950/90 px-4 py-3 border-b border-teal-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                      <span className="ml-2 text-xs font-mono text-slate-400">lms.mtsn2cilacap.sch.id</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-400 bg-emerald-950/50">
                      LIVE SYSTEM
                    </Badge>
                  </div>

                  {/* Main Banner Image */}
                  <div className="relative">
                    <img
                      src="/hero-banner.png"
                      alt="Banner LMS MTsN 2 Cilacap"
                      className="w-full h-auto object-cover transform transition duration-700 hover:scale-[1.02]"
                    />

                    {/* Floating Overlay Widgets */}
                    {/* Top Left Widget */}
                    <div className="absolute top-4 left-4 bg-slate-950/90 backdrop-blur-md border border-teal-500/40 rounded-xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          <p className="text-xs font-bold text-white">948+ Siswa Aktif</p>
                        </div>
                        <p className="text-[10px] text-slate-400">MTsN 2 Cilacap</p>
                      </div>
                    </div>

                    {/* Top Right Widget */}
                    <div className="absolute top-4 right-4 bg-slate-950/90 backdrop-blur-md border border-amber-500/40 rounded-xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">CBT Exam Engine</p>
                        <p className="text-[10px] text-amber-300 font-mono">Timer: 00:58:42</p>
                      </div>
                    </div>

                    {/* Bottom Left Widget */}
                    <div className="absolute bottom-4 left-4 bg-slate-950/90 backdrop-blur-md border border-teal-500/40 rounded-xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400">
                        <BookMarked className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Tahfidz Al-Qur&apos;an</p>
                        <p className="text-[10px] text-teal-300">Juz 30, 29, 1 — 98 Mumtaz</p>
                      </div>
                    </div>

                    {/* Bottom Right Widget */}
                    <div className="absolute bottom-4 right-4 bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 rounded-xl p-3 shadow-xl hidden sm:flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">E-Rapor Kemenag</p>
                        <p className="text-[10px] text-emerald-300">Official Kop & PDF Export</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section className="py-10 border-y border-teal-900/40 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-950/50 border border-teal-900/30">
              <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                948+
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Siswa Terdaftar</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-teal-900/30">
              <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-emerald-300 to-amber-300 bg-clip-text text-transparent">
                50+
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Pendidik & Staff</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-teal-900/30">
              <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                96.8%
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">Presensi Digital</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/50 border border-teal-900/30">
              <p className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
                100%
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">E-Rapor Kemenag</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fitur Unggulan System Grid */}
      <section id="fitur" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-teal-950 text-teal-300 border-teal-700/50 px-3 py-1 text-xs">
              TEKNOLOGI PEMBELAJARAN
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Fitur Unggulan System LMS MTsN 2 Cilacap
            </h2>
            <p className="text-slate-400 text-base">
              Dirancang secara komprehensif untuk mendukung kegiatan belajar mengajar, evaluasi CBT, hingga administrasi madrasah modern.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="bg-slate-900/80 border-teal-900/40 hover:border-teal-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-slate-950" />
                </div>
                <CardTitle className="text-xl text-white">Computer-Based Test (CBT)</CardTitle>
                <CardDescription className="text-slate-400">
                  Engine Ujian Online Lengkap dengan Token Sesi, Live Countdown Timer, Acak Soal & Opsi, Auto-grading skor PG, serta analisis Remedial KKM (75).
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 2 */}
            <Card className="bg-slate-900/80 border-teal-900/40 hover:border-teal-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <BookMarked className="w-6 h-6 text-slate-950" />
                </div>
                <CardTitle className="text-xl text-white">Modul Tahfidz Al-Qur&apos;an</CardTitle>
                <CardDescription className="text-slate-400">
                  Pencatatan setoran hafalan siswa (Juz 30, 29, 1), status Mutqin & Murojaah, penilaian Tajwid (Mumtaz), serta cetak Kartu Murojaah PDF Digital.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 3 */}
            <Card className="bg-slate-900/80 border-teal-900/40 hover:border-teal-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-slate-950" />
                </div>
                <CardTitle className="text-xl text-white">Struktur 18 Pertemuan</CardTitle>
                <CardDescription className="text-slate-400">
                  Alur materi terstruktur per semester (PDF, Video Tutorial, PPT, LKPD), Presensi One-Click, serta Forum Diskusi interaktif antar siswa & guru.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 4 */}
            <Card className="bg-slate-900/80 border-teal-900/40 hover:border-teal-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-emerald-600 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6 text-slate-950" />
                </div>
                <CardTitle className="text-xl text-white">E-Rapor Kurikulum Merdeka</CardTitle>
                <CardDescription className="text-slate-400">
                  Formulasi bobot nilai (Presensi 10% + Tugas 30% + UTS 30% + PAS 30%), Kop Resmi Kemenag MTsN 2 Cilacap, dan Cetak PDF Official.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 5 */}
            <Card className="bg-slate-900/80 border-teal-900/40 hover:border-teal-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-600 to-indigo-600 flex items-center justify-center text-white font-bold mb-3 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl text-white">Strict RBAC 7 Roles</CardTitle>
                <CardDescription className="text-slate-400">
                  Isolasi hak akses antarmuka yang presisi untuk Super Admin, Admin Akademik, Kamad, Waka Kurikulum, Wali Kelas, Guru, dan Siswa.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Card 6 */}
            <Card className="bg-slate-900/80 border-teal-900/40 hover:border-teal-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/10 group">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 flex items-center justify-center text-slate-950 font-bold mb-3 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                  <Activity className="w-6 h-6 text-slate-950" />
                </div>
                <CardTitle className="text-xl text-white">Early Warning System (EWS)</CardTitle>
                <CardDescription className="text-slate-400">
                  Notifikasi otomatis mendeteksi siswa di bawah KKM (&lt; 75) dan persentase kehadiran rendah (&lt; 80%) untuk tindakan cepat wali kelas & guru.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Alur Pembelajaran 1–18 Visual */}
      <section id="alur" className="py-20 bg-slate-900/50 border-y border-teal-900/40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <Badge className="bg-emerald-950 text-emerald-300 border-emerald-700/50 px-3 py-1 text-xs">
              MEKANISME KURIKULUM
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Alur Pembelajaran Terstruktur 1–18 Pertemuan
            </h2>
            <p className="text-slate-400 text-base">
              Setiap mata pelajaran dikelola secara konsisten dalam siklus 18 pertemuan per semester.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            <div className="bg-slate-950/80 p-6 rounded-2xl border border-teal-800/40 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-white text-lg">Pertemuan 1–8</h3>
              <p className="text-xs text-slate-400">
                Penyampaian Tujuan Pembelajaran, PDF Modul, Video Tutorial, PPT, LKPD, Presensi One-Click, & Forum Diskusi.
              </p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-amber-500/50 relative space-y-3 shadow-lg shadow-amber-500/10">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-amber-300 text-lg">Pertemuan 9: CBT UTS</h3>
              <p className="text-xs text-slate-400">
                Evaluasi Tengah Semester menggunakan CBT Exam Engine dengan Security Token & Timer Countdown.
              </p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-teal-800/40 relative space-y-3">
              <div className="w-8 h-8 rounded-full bg-teal-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-white text-lg">Pertemuan 10–17</h3>
              <p className="text-xs text-slate-400">
                Pembelajaran Lanjutan, Praktikum LKPD, Pengayaan & Auto Remedial bagi siswa di bawah KKM (75).
              </p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-amber-500/50 relative space-y-3 shadow-lg shadow-amber-500/10">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                4
              </div>
              <h3 className="font-bold text-amber-300 text-lg">Pertemuan 18: CBT PAS</h3>
              <p className="text-xs text-slate-400">
                Evaluasi Akhir Semester CBT PAS untuk penentuan nilai akhir & kelulusan mata pelajaran.
              </p>
            </div>

            <div className="bg-slate-950/80 p-6 rounded-2xl border border-emerald-500/50 relative space-y-3 shadow-lg shadow-emerald-500/10">
              <div className="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 font-bold flex items-center justify-center text-sm">
                5
              </div>
              <h3 className="font-bold text-emerald-300 text-lg">E-Rapor Official</h3>
              <p className="text-xs text-slate-400">
                Kalkulasi Otomatis (10-30-30-30), Pengesahan Wali Kelas & Kamad, serta Cetak PDF Kop Resmi Kemenag.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Akses Portal 7 Peran (Interactive Showcase) */}
      <section id="roles" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <Badge className="bg-teal-950 text-teal-300 border-teal-700/50 px-3 py-1 text-xs">
              RBAC MATRIX
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Portal Akses Terisolasi Khusus 7 Peran
            </h2>
            <p className="text-slate-400 text-base">
              Setiap pengguna mendapatkan ruang kerja terisolasi yang disesuaikan persis dengan wewenang dan tugasnya.
            </p>
          </div>

          {/* Role Tabs Nav */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {ROLE_PREVIEWS.map((r) => {
              const IconComp = r.icon;
              const isActive = activeRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveRole(r.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 border ${
                    isActive
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-slate-950 border-teal-300 shadow-lg shadow-teal-500/20"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:border-teal-500/40 hover:text-white"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{r.title}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Role Detail Display */}
          <div className="bg-slate-900/90 border border-teal-800/50 rounded-2xl p-6 sm:p-10 shadow-2xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950 border border-teal-700/50 text-teal-300 text-xs font-semibold">
                  <Badge variant="outline" className="border-teal-500 text-teal-300 text-[10px]">
                    {selectedRoleData.badge}
                  </Badge>
                  <span>Scope Isolation Active</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Peran {selectedRoleData.title}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {selectedRoleData.description}
                </p>

                <div className="space-y-2.5 pt-2">
                  {selectedRoleData.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-200">
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <Check className="w-4 h-4" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button
                    asChild
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl px-6"
                  >
                    <Link to="/auth">Masuk Sebagai {selectedRoleData.title}</Link>
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-sm p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-teal-700/40 text-center space-y-4 shadow-xl">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 mx-auto flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/30">
                    {(() => {
                      const IconC = selectedRoleData.icon;
                      return <IconC className="w-8 h-8 text-slate-950" />;
                    })()}
                  </div>
                  <h4 className="text-xl font-bold text-white">{selectedRoleData.title} Dashboard</h4>
                  <p className="text-xs text-slate-400">
                    Akses aman dengan autentikasi murni MySQL Database Engine & Session.
                  </p>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-left text-xs font-mono text-teal-300">
                    Scope: /{selectedRoleData.id === "admin" ? "admin" : "dashboard"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="py-20 bg-slate-900/40 border-t border-teal-900/40 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <Badge className="bg-amber-950 text-amber-300 border-amber-700/50 px-3 py-1 text-xs">
              PUSAT BANTUAN
            </Badge>
            <h2 className="text-3xl font-black text-white">Pertanyaan Sering Diajukan (FAQ)</h2>
            <p className="text-slate-400 text-sm">Informasi penting seputar penggunaan LMS MTsN 2 Cilacap</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-slate-800 rounded-xl px-4 bg-slate-900/80">
              <AccordionTrigger className="text-white hover:text-teal-300 font-semibold text-left">
                Bagaimana cara mendapatkan akun login LMS MTsN 2 Cilacap?
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 text-sm leading-relaxed">
                Akun untuk Siswa dan Guru dibuat secara resmi oleh Admin Akademik MTsN 2 Cilacap. Anda juga dapat menggunakan tombol &quot;Masuk / Register&quot; di halaman Login untuk melakukan pendaftaran mandiri yang akan diverifikasi oleh admin.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-slate-800 rounded-xl px-4 bg-slate-900/80">
              <AccordionTrigger className="text-white hover:text-teal-300 font-semibold text-left">
                Apakah CBT Ujian Online dapat diakses melalui Smartphone / Tablet?
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 text-sm leading-relaxed">
                Ya, CBT Exam Engine didesain 100% responsif dan ringan, sehingga sangat nyaman digunakan baik melalui smartphone, tablet, maupun laptop/komputer. Fitur Security Token dan Live Countdown Timer bekerja secara otomatis.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-slate-800 rounded-xl px-4 bg-slate-900/80">
              <AccordionTrigger className="text-white hover:text-teal-300 font-semibold text-left">
                Bagaimana penilaian E-Rapor Kurikulum Merdeka dihitung?
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 text-sm leading-relaxed">
                Penilaian E-Rapor menggunakan formulasi bobot resmi Kemenag: Presensi (10%) + Tugas/LKPD (30%) + UTS (30%) + PAS (30%). Rapor dapat dicetak dalam format PDF resmi lengkap dengan Kop MTsN 2 Cilacap.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-slate-800 rounded-xl px-4 bg-slate-900/80">
              <AccordionTrigger className="text-white hover:text-teal-300 font-semibold text-left">
                Apa saja target hafalan pada Modul Tahfidz Al-Qur&apos;an?
              </AccordionTrigger>
              <AccordionContent className="text-slate-300 text-sm leading-relaxed">
                Target hafalan utama meliputi Juz 30 (Juz &apos;Amma), Juz 29 (Juz Tabarak), dan Juz 1 (Al-Baqarah). Penilaian mencakup kelancaran (Mutqin/Murojaah) serta nilai Tajwid dengan fasilitas Cetak Kartu Murojaah PDF.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-teal-900 via-emerald-800 to-teal-950 p-8 sm:p-14 border border-teal-500/40 shadow-2xl text-center space-y-6">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent pointer-events-none"></div>

            <Badge className="bg-teal-950 text-teal-300 border-teal-400/40 px-3 py-1 text-xs">
              SELAMAT DATANG DI ERA DIGITAL
            </Badge>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-3xl mx-auto">
              Siap Memulai Pengalaman Belajar Digital Terbaik di MTsN 2 Cilacap?
            </h2>

            <p className="text-teal-100 text-base sm:text-lg max-w-2xl mx-auto">
              Akses portal LMS sekarang juga untuk memulai pembelajaran, mengerjakan ujian CBT, dan memantau perkembangan akademik.
            </p>

            <div className="pt-4 flex justify-center">
              <Button
                asChild
                size="lg"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-lg px-8 py-6 rounded-2xl shadow-xl shadow-amber-400/20 transition-all hover:scale-105"
              >
                <Link to="/auth" className="flex items-center gap-3">
                  <span>Masuk Ke Akun Anda</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Official Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <img src={logoAsset.url} alt="Logo MTsN 2 Cilacap" className="h-9 w-9 rounded-full bg-white p-1" />
              <span className="font-extrabold text-lg text-white">MTs Negeri 2 Cilacap</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Learning Management System & SIAKAD Integrated v2.5.0-Production. Berstandar Kurikulum Merdeka Kemenag Edition. Unggul dalam Prestasi, Anggun dalam Akhlak, Terdepan dalam Teknologi.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Navigasi Cepat</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-teal-300">
                  Beranda
                </a>
              </li>
              <li>
                <a href="#fitur" className="hover:text-teal-300">
                  Fitur Unggulan
                </a>
              </li>
              <li>
                <a href="#alur" className="hover:text-teal-300">
                  Alur 18 Pertemuan
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-teal-300">
                  Portal 7 Role
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-sm mb-3">Kontak & Lokasi</h4>
            <div className="text-xs text-slate-400 leading-relaxed space-y-2">
              <p className="font-semibold text-slate-200">Madrasah Tsanawiyah Negeri 2 Cilacap</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  Jl. Karangpucung - Sidareja, Purbayasa, Sindangbarang, Kec. Karangpucung, Kabupaten Cilacap, Jawa Tengah 53255
                </span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1">
                Kementerian Agama Republik Indonesia
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© 2026 MTs Negeri 2 Cilacap. Hak Cipta Dilindungi Undang-Undang.</p>
          <p className="mt-2 sm:mt-0 font-mono text-[11px] text-teal-500/70">Powered by LMS & SIAKAD Engine v2.5</p>
        </div>
      </footer>
    </div>
  );
}