import { useState } from "react";
import {
  Users,
  Building2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Activity,
  UserCheck,
  BarChart3,
  LineChart,
  GraduationCap,
  MonitorCheck,
  ScrollText,
  CalendarClock,
  PencilLine,
  CalendarDays,
  Bot,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  Laptop,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BerandaModuleProps {
  activeRole: string;
  userProfile?: any;
  dbStats?: any;
  setActiveTab?: (key: string) => void;
}

export function BerandaModule({
  activeRole,
  userProfile,
  dbStats,
  setActiveTab,
}: BerandaModuleProps) {
  const [timeframe, setTimeframe] = useState<"harian" | "mingguan" | "bulanan">("harian");
  const [hasEnrolled, setHasEnrolled] = useState(false);
  const [studentXp, setStudentXp] = useState(890);

  const statsData = {
    harian: {
      guru: { val: "98.1%", detail: "53 dari 54 Guru Hadir Hari Ini" },
      siswa: { val: "96.8%", detail: "918 dari 948 Siswa Hadir Hari Ini" },
      kbm: { val: "94.2%", detail: "42 dari 45 Jam KBM Efektif Terlaksana" },
      kkm: { val: "92.5%", detail: "Siswa Tuntas Nilai KKM (≥75)" },
    },
    mingguan: {
      guru: { val: "97.8%", detail: "Rata-rata Kehadiran Guru Minggu Ini" },
      siswa: { val: "96.2%", detail: "Rata-rata Kehadiran Siswa Minggu Ini" },
      kbm: { val: "93.5%", detail: "Capaian Penugasan & KBM Minggu Ini" },
      kkm: { val: "91.8%", detail: "Ketuntasan KKM Rata-rata Mingguan" },
    },
    bulanan: {
      guru: { val: "98.4%", detail: "Rata-rata Kehadiran Guru Bulan Juli" },
      siswa: { val: "96.5%", detail: "Rata-rata Kehadiran Siswa Bulan Juli" },
      kbm: { val: "95.0%", detail: "Capaian Penugasan Bulan Juli" },
      kkm: { val: "93.2%", detail: "Ketuntasan KKM Rata-rata Bulanan" },
    },
  };

  const currentStats = statsData[timeframe];

  // Super Administrator & Admin Akademik Dashboard
  if (activeRole === "admin" || activeRole === "admin_akademik") {
    return (
      <div className="space-y-6">
        {/* Banner Admin Control Center */}
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 text-white p-6 lg:p-8 shadow-xl border border-emerald-500/30">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> CONTROL CENTER SUPER ADMINISTRATOR
            </Badge>
            <Badge variant="outline" className="bg-black/30 text-emerald-300 border-emerald-400/40 text-xs font-mono">
              MTs NEGERI 2 CILACAP • SYSTEM V2.4
            </Badge>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold flex items-center gap-2">
            Assalamu'alaikum, {userProfile?.name || "Ahmad Hidayat, S.Pd."} 🛡️
          </h2>
          {userProfile?.tagline && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs text-emerald-200 font-medium">
              <span>💬 Motto:</span>
              <span className="italic font-semibold text-white">"{userProfile.tagline}"</span>
            </div>
          )}
          <p className="mt-2 text-sm text-slate-200 max-w-3xl leading-relaxed">
            Pusat kendali master data SIAKAD, pengelolaan 7 role hak akses pengguna, pemantauan server CBT, serta integrasi WhatsApp Gateway EWS Madrasah.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md"
              onClick={() => setActiveTab?.("siakad")}
            >
              <Building2 className="h-4 w-4" /> Kelola SIAKAD Master Data
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs gap-1.5"
              onClick={() => setActiveTab?.("users")}
            >
              <Users className="h-4 w-4" /> Kelola 7 Role Pengguna
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs gap-1.5"
              onClick={() => setActiveTab?.("cbt")}
            >
              <Laptop className="h-4 w-4" /> Monitor Engine CBT
            </Button>
          </div>
        </div>

        {/* 4 Stat Overview Cards (Live Real Database Synchronized) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border hover:border-emerald-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("users")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  Total Pengguna Terdaftar <Badge className="bg-emerald-600/20 text-emerald-600 dark:text-emerald-300 text-[9px] px-1 py-0 font-mono">DB Sync</Badge>
                </div>
                <div className="text-xl font-bold font-mono text-emerald-500">
                  {dbStats?.totalUsers ? `${dbStats.totalUsers} Akun` : "6 Akun"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {dbStats?.siswaCount ?? 1} Siswa • {dbStats?.guruStafCount ?? 5} Guru & Staf
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-blue-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("siakad")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  Rombel & Kelas Aktif <Badge className="bg-blue-600/20 text-blue-600 dark:text-blue-300 text-[9px] px-1 py-0 font-mono">DB Sync</Badge>
                </div>
                <div className="text-xl font-bold font-mono text-blue-500">
                  {dbStats?.totalRombel ? `${dbStats.totalRombel} Rombel` : "1 Rombel"}
                </div>
                <div className="text-[10px] text-muted-foreground">Tingkat VIII (Kelas VIII A)</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-purple-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("siakad")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-purple-500/15 text-purple-500 grid place-items-center font-bold">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  Katalog Mapel Persisten <Badge className="bg-purple-600/20 text-purple-600 dark:text-purple-300 text-[9px] px-1 py-0 font-mono">DB Sync</Badge>
                </div>
                <div className="text-xl font-bold font-mono text-purple-500">
                  {dbStats?.totalMapel ? `${dbStats.totalMapel} Mapel` : "3 Mapel"}
                </div>
                <div className="text-[10px] text-muted-foreground">Kurikulum Merdeka</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-amber-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("cbt")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                  Status Tahun Ajaran <Badge className="bg-amber-600/20 text-amber-600 dark:text-amber-300 text-[9px] px-1 py-0 font-mono">DB Sync</Badge>
                </div>
                <div className="text-xl font-bold font-mono text-amber-500">2026/2027</div>
                <div className="text-[10px] text-muted-foreground">🟢 Sesi Ganjil Aktif</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health & Security Monitoring Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" /> System Health & Database Performance
              </CardTitle>
              <CardDescription className="text-xs">
                Status infrastruktur server local Laragon MySQL & konektivitas real-time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/40 border border-border flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-foreground">Database Engine</div>
                  <div className="text-muted-foreground font-mono">MySQL 8.0 • `db_lms` Local</div>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-[10px]">🟢 CONNECTED (2ms)</Badge>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-foreground">CBT Live Engine Session</div>
                  <div className="text-muted-foreground font-mono">Anti-cheat & Tab switch active</div>
                </div>
                <Badge className="bg-blue-600 text-white font-mono text-[10px]">READY (0 Active Lock)</Badge>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border flex justify-between items-center text-xs">
                <div>
                  <div className="font-bold text-foreground">WhatsApp Gateway EWS Service</div>
                  <div className="text-muted-foreground font-mono">Target: Orang Tua & Presensi</div>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-[10px]">🟢 ONLINE (+62812...)</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Matrix Hak Akses (RBAC 7 Roles)
              </CardTitle>
              <CardDescription className="text-xs">
                Pengisolasian wewenang pengguna sesuai keputusan pimpinan madrasah.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {[
                { r: "Super Admin", p: "Akses Penuh Semua Modul & Pengaturan System", c: "bg-emerald-600 text-white" },
                { r: "Admin Akademik", p: "Kelola Master Data, Mapel, Rombel, & Pengampu", c: "bg-teal-600 text-white" },
                { r: "Kepala Madrasah", p: "Monitoring Executive, Audit Nilai, & EWS Rekap", c: "bg-blue-600 text-white" },
                { r: "Waka Kurikulum", p: "Master Data, Jadwal, CBT Proctor, & Asesmen", c: "bg-indigo-600 text-white" },
                { r: "Wali Kelas", p: "Monitoring 8A, Presensi Siswa, & E-Rapor Verification", c: "bg-purple-600 text-white" },
                { r: "Guru Pengampu", p: "Input Nilai, Bank Soal CBT, Terbitkan Asesmen, LKPD", c: "bg-amber-600 text-white" },
                { r: "Siswa", p: "Ruang Belajar, Kerjakan CBT, Cek Nilai, & Presensi", c: "bg-sky-600 text-white" },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-md bg-muted/20 border border-border/40">
                  <span className="font-bold text-foreground">{item.r}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground hidden sm:inline">{item.p}</span>
                    <Badge className={`text-[10px] ${item.c}`}>ACTIVE</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Executive Dashboard (Kepala Madrasah & Waka Kurikulum)
  if (activeRole === "kamad" || activeRole === "waka") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white p-6 lg:p-8 shadow-xl border border-emerald-500/30">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
              EXECUTIVE MONITORING DASHBOARD
            </Badge>
            <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10 text-xs font-semibold">
              <span className="text-slate-300 px-2 text-[11px]">Rekap Periode:</span>
              <button
                onClick={() => setTimeframe("harian")}
                className={`px-3 py-1 rounded-lg transition ${
                  timeframe === "harian" ? "bg-emerald-500 text-white font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                ⚡ Harian (Hari Efektif)
              </button>
              <button
                onClick={() => setTimeframe("mingguan")}
                className={`px-3 py-1 rounded-lg transition ${
                  timeframe === "mingguan" ? "bg-emerald-500 text-white font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                📅 Mingguan
              </button>
              <button
                onClick={() => setTimeframe("bulanan")}
                className={`px-3 py-1 rounded-lg transition ${
                  timeframe === "bulanan" ? "bg-emerald-500 text-white font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                🗓️ Bulanan
              </button>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold">
            {activeRole === "kamad" ? "Assalamu'alaikum, Bapak Kepala Madrasah 🏛️" : "Assalamu'alaikum, Waka Kurikulum 📐"}
          </h2>
          <p className="mt-2 text-sm text-slate-200 max-w-3xl leading-relaxed">
            Statistik Pembelajaran Hari Efektif MTsN 2 Cilacap: Pemantauan presensi guru & siswa, efektivitas penugasan KBM, ketercapaian KKM, serta progress rombel.
          </p>
        </div>

        {/* Section Header Statistik Pembelajaran Hari Efektif / Per Hari */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Statistik Pembelajaran {timeframe === "harian" ? "Hari Efektif (Per Hari)" : timeframe === "mingguan" ? "Rekap Mingguan" : "Rekap Bulanan"}
            </h3>
            <p className="text-xs text-muted-foreground">Persentase real-time 4 indikator utama efektivitas madrasah.</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-bold gap-1 shrink-0"
            onClick={() => setActiveTab?.("progress")}
          >
            <LineChart className="h-3.5 w-3.5 text-primary" /> Lihat Rekap Detail di Sidebar →
          </Button>
        </div>

        {/* 4 Cards Statistik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border hover:border-emerald-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold shrink-0">
                <UserCheck className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">Prosentase Kehadiran Guru</div>
                <div className="text-2xl font-extrabold font-mono text-emerald-500">{currentStats.guru.val}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentStats.guru.detail}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-blue-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">Prosentase Kehadiran Siswa</div>
                <div className="text-2xl font-extrabold font-mono text-blue-500">{currentStats.siswa.val}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentStats.siswa.detail}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-purple-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-500/15 text-purple-500 grid place-items-center font-bold shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">Pembelajaran & Penugasan</div>
                <div className="text-2xl font-extrabold font-mono text-purple-500">{currentStats.kbm.val}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentStats.kbm.detail}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-amber-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">Ketercapaian Ketuntasan (KKM)</div>
                <div className="text-2xl font-extrabold font-mono text-amber-500">{currentStats.kkm.val}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentStats.kkm.detail}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Monitoring Cards */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" /> Progress Pembelajaran Perangkat Ajar Guru
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-primary font-bold" onClick={() => setActiveTab?.("progress")}>
                Lihat Semua →
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { mapel: "Al-Quran Hadits", teacher: "Dra. Hj. Siti Rahmah", status: "18 Pertemuan (100%)", c: "text-emerald-500" },
                { mapel: "Akidah Akhlak", teacher: "Ust. Abdul Halim, S.Ag", status: "16 Pertemuan (88%)", c: "text-blue-500" },
                { mapel: "Matematika", teacher: "Bapak Hendra Wijaya", status: "15 Pertemuan (83%)", c: "text-amber-500" },
                { mapel: "Informatika & Coding", teacher: "H. Ahmad Syukri, S.Kom", status: "18 Pertemuan (100%)", c: "text-emerald-500" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/50 text-sm">
                  <div>
                    <div className="font-bold text-foreground">{row.mapel}</div>
                    <div className="text-xs text-muted-foreground">{row.teacher}</div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-xs font-bold ${row.c}`}>
                    {row.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MonitorCheck className="h-5 w-5 text-emerald-500" /> Monitoring Sesi Ujian CBT Online
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-primary font-bold" onClick={() => setActiveTab?.("cbt")}>
                Portal CBT →
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">CBT PAT Al-Quran Hadits (Kelas 8)</div>
                  <div className="text-xs text-muted-foreground">32 Siswa Mengerjakan • Latensi Server 14ms</div>
                </div>
                <Badge className="bg-emerald-600 text-white">AKTIF</Badge>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">CBT PAT Matematika (Kelas 9)</div>
                  <div className="text-xs text-muted-foreground">128 Siswa Selesai • Rata-rata Nilai 84.5</div>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">SELESAI</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Wali Kelas Dashboard
  if (activeRole === "walikelas" || activeRole === "wali_kelas") {
    const waliStatsData = {
      harian: {
        siswa: { val: "96.9%", detail: "31 dari 32 Siswa 8A Hadir Hari Ini" },
        kbm: { val: "94.5%", detail: "Submisi Tugas LKPD Kelas 8A Selesai" },
        kkm: { val: "93.8%", detail: "Siswa 8A Tuntas Nilai KKM (≥75)" },
      },
      mingguan: {
        siswa: { val: "96.2%", detail: "Rata-rata Kehadiran Siswa 8A Minggu Ini" },
        kbm: { val: "93.8%", detail: "Submisi Tugas Kelas 8A Minggu Ini" },
        kkm: { val: "92.5%", detail: "Ketuntasan KKM Siswa 8A Minggu Ini" },
      },
      bulanan: {
        siswa: { val: "96.8%", detail: "Rata-rata Kehadiran Siswa 8A Bulan Juli" },
        kbm: { val: "95.2%", detail: "Submisi Tugas Kelas 8A Bulan Juli" },
        kkm: { val: "94.0%", detail: "Ketuntasan KKM Siswa 8A Bulan Juli" },
      },
    };

    const currentWaliStats = waliStatsData[timeframe];

    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-950 text-white p-6 lg:p-8 shadow-xl border border-blue-500/30">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              DASHBOARD WALI KELAS 8A
            </Badge>
            <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-xl border border-white/10 text-xs font-semibold">
              <span className="text-slate-300 px-2 text-[11px]">Rekap Periode:</span>
              <button
                onClick={() => setTimeframe("harian")}
                className={`px-3 py-1 rounded-lg transition ${
                  timeframe === "harian" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                ⚡ Harian (Hari Efektif)
              </button>
              <button
                onClick={() => setTimeframe("mingguan")}
                className={`px-3 py-1 rounded-lg transition ${
                  timeframe === "mingguan" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                📅 Mingguan
              </button>
              <button
                onClick={() => setTimeframe("bulanan")}
                className={`px-3 py-1 rounded-lg transition ${
                  timeframe === "bulanan" ? "bg-blue-600 text-white font-bold shadow-sm" : "text-slate-300 hover:text-white"
                }`}
              >
                🗓️ Bulanan
              </button>
            </div>
          </div>

          <h2 className="text-2xl lg:text-3xl font-extrabold">Assalamu'alaikum, Wali Kelas 8A 📋</h2>
          <p className="mt-2 text-sm text-slate-200 max-w-3xl leading-relaxed">
            Statistik Pembelajaran Hari Efektif Rombel 8A: Pemantauan presensi siswa 8A, ketuntasan submisi penugasan KBM, evaluasi KKM, serta pengesahan E-Rapor Madrasah.
          </p>
        </div>

        {/* Section Header Statistik Pembelajaran Kelas 8A */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Statistik Pembelajaran Rombel 8A {timeframe === "harian" ? "(Hari Efektif)" : timeframe === "mingguan" ? "(Rekap Mingguan)" : "(Rekap Bulanan)"}
            </h3>
            <p className="text-xs text-muted-foreground">Persentase real-time 3 indikator utama binaan kelas 8A.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs font-bold gap-1" onClick={() => setActiveTab?.("progress")}>
              <LineChart className="h-3.5 w-3.5 text-primary" /> Progress Belajar 8A →
            </Button>
          </div>
        </div>

        {/* 3 Cards Statistik Kelas 8A */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border hover:border-blue-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold shrink-0">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">Kehadiran Siswa Kelas 8A</div>
                <div className="text-2xl font-extrabold font-mono text-blue-500">{currentWaliStats.siswa.val}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentWaliStats.siswa.detail}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-purple-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-purple-500/15 text-purple-500 grid place-items-center font-bold shrink-0">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">Pembelajaran & Penugasan 8A</div>
                <div className="text-2xl font-extrabold font-mono text-purple-500">{currentWaliStats.kbm.val}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentWaliStats.kbm.detail}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-amber-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold shrink-0">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground font-semibold">Ketuntasan KKM Siswa 8A</div>
                <div className="text-2xl font-extrabold font-mono text-amber-500">{currentWaliStats.kkm.val}</div>
                <div className="text-[11px] text-muted-foreground truncate">{currentWaliStats.kkm.detail}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Wali Kelas Monitoring Cards */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" /> Progress Capaian Pembelajaran Siswa 8A
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-primary font-bold" onClick={() => setActiveTab?.("progress")}>
                Lihat Rincian →
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Ahmad Fauzi", nis: "0081928371", cp: "95% Tuntas", status: "Sangat Baik", c: "text-emerald-500" },
                { name: "Anisa Rahma", nis: "0081928372", cp: "90% Tuntas", status: "Baik", c: "text-blue-500" },
                { name: "Muhammad Fairuz", nis: "0081928374", cp: "98% Tuntas", status: "Sangat Baik", c: "text-emerald-500" },
                { name: "Zaid bin Tsabit", nis: "0081928375", cp: "100% Tuntas", status: "Mumtaz", c: "text-emerald-500" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/50 text-sm">
                  <div>
                    <div className="font-bold text-foreground">{row.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">NISN: {row.nis}</div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-xs font-bold ${row.c}`}>
                    {row.cp}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ScrollText className="h-5 w-5 text-emerald-500" /> Status Pengesahan E-Rapor Kelas 8A
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-primary font-bold" onClick={() => setActiveTab?.("nilai")}>
                Buka Rekap Nilai →
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">Formulasi Nilai Kurikulum Merdeka</div>
                  <div className="text-xs text-muted-foreground">Formatif (1-3) + Sumatif (1-3) + Tugas + Rata2 Kuis</div>
                </div>
                <Badge className="bg-emerald-600 text-white">TERVERIFIKASI</Badge>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">Cetak & Export Excel Rombel 8A</div>
                  <div className="text-xs text-muted-foreground">32 Lembar Rapor Official Kemenag Siap Unduh</div>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">SIAP CETAK</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Guru Pengampu Dashboard
  if (activeRole === "guru") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-950 text-white p-6 lg:p-8 shadow-xl border border-emerald-500/30">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3">
            DASHBOARD GURU PENGAMPU
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">{`Assalamu'alaikum, ${userProfile?.name || "Bpk/Ibu Guru"} 👨‍🏫`}</h2>
          <p className="mt-2 text-sm text-slate-200 max-w-3xl leading-relaxed">
            Portal KBM Guru: Pengingat jadwal tatap muka hari ini, pemeriksaan submisi LKPD siswa, penyusunan Pusat Asesmen, serta pemanfaatan Asisten AI & Tools Pembelajaran.
          </p>
        </div>

        {/* 4 Overview Quick Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border hover:border-emerald-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("jadwal")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Jadwal Mengajar Hari Ini</div>
                <div className="text-lg font-bold font-mono text-emerald-500">2 Kelas (8A & 9C)</div>
                <div className="text-[10px] text-muted-foreground">Klik rincian jam & kelas →</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-amber-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("tugas")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold">
                <PencilLine className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Tugas Belum Dinilai</div>
                <div className="text-lg font-bold font-mono text-amber-500">12 Submisi LKPD</div>
                <div className="text-[10px] text-muted-foreground">Klik mulai koreksi →</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-purple-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("agenda")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-purple-500/15 text-purple-500 grid place-items-center font-bold">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Reminder Agenda & CBT</div>
                <div className="text-lg font-bold font-mono text-purple-500">3 Event Dekat</div>
                <div className="text-[10px] text-muted-foreground">Klik kalender akademik →</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:border-blue-500/50 transition cursor-pointer" onClick={() => setActiveTab?.("asisten_ai")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Asisten AI Mengajar</div>
                <div className="text-lg font-bold font-mono text-blue-500">6 Tools Aktif</div>
                <div className="text-[10px] text-muted-foreground">ChatGPT, NotebookLM, dll →</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 1: Pengingat Jadwal Mengajar Hari Ini & Submisi Belum Dinilai */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-emerald-500" /> Pengingat Jadwal Mengajar Hari Ini (Selasa)
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-emerald-500 font-bold" onClick={() => setActiveTab?.("jadwal")}>
                Lihat Semua Jadwal →
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div
                className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition cursor-pointer"
                onClick={() => toast.info("Rincian KBM: Al-Quran Hadits Kelas VIII A • Pertemuan 16: Hukum Bacaan Mad Silah & Mad Badal • Ruang A.02")}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-emerald-600 text-white font-mono text-[10px] mb-1">⏰ 07:30 - 09:00 WIB (Jam 1-2)</Badge>
                    <div className="font-bold text-sm text-foreground">{"Al-Quran Hadits (Kelas VIII A)"}</div>
                    <div className="text-xs text-muted-foreground">Materi: Pertemuan 16 - Tajwid Mad Silah • Ruang A.02</div>
                  </div>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] font-bold">
                    🔍 Klik Detail KBM
                  </Badge>
                </div>
              </div>

              <div
                className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 transition cursor-pointer"
                onClick={() => toast.info("Rincian KBM: Fiqih Kelas IX C • Pertemuan 18: Syarat Sembelihan Hewan Kurban • Ruang C.04")}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="bg-blue-600 text-white font-mono text-[10px] mb-1">⏰ 10:15 - 11:45 WIB (Jam 5-6)</Badge>
                    <div className="font-bold text-sm text-foreground">Fiqih Kebangsaan (Kelas IX C)</div>
                    <div className="text-xs text-muted-foreground">Materi: Pertemuan 18 - Ketentuan Sembelihan • Ruang C.04</div>
                  </div>
                  <Badge variant="outline" className="text-blue-500 border-blue-500/30 text-[10px] font-bold">
                    🔍 Klik Detail KBM
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <PencilLine className="h-5 w-5 text-amber-500" /> Submisi Tugas Belum Dinilai & Reminder Agenda
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs text-amber-500 font-bold" onClick={() => setActiveTab?.("tugas")}>
                Koreksi Tugas →
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">LKPD Pertemuan 15: Resume Tajwid VIII A</div>
                  <div className="text-xs text-muted-foreground">8 Submisi Siswa Menunggu Koreksi & Input Nilai</div>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0" onClick={() => setActiveTab?.("tugas")}>
                  Koreksi (8)
                </Button>
              </div>

              <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">📅 CBT Ujian PTS Ganjil - 15 s/d 20 Agustus 2026</div>
                  <div className="text-xs text-muted-foreground">Batas Pengunggahan Bank Soal CBT: 10 Agustus 2026</div>
                </div>
                <Button size="sm" variant="outline" className="text-xs font-bold border-purple-500/30 text-purple-500 shrink-0" onClick={() => setActiveTab?.("agenda")}>
                  Detail Agenda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin Akademik Dashboard
  if (activeRole === "admin_akademik") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 lg:p-8 shadow-xl border border-indigo-500/30">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-3">
            DASHBOARD ADMIN AKADEMIK
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Assalamu'alaikum, Admin Akademik 💼</h2>
          <p className="mt-2 text-sm text-slate-200 max-w-2xl leading-relaxed">
            Pengelolaan jadwal pelajaran, plotting rombel & kelas, perpustakaan digital, serta pengumuman resmi madrasah.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Master Siswa</div>
                <div className="text-xl font-bold font-mono">948 Siswa</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Master Guru</div>
                <div className="text-xl font-bold font-mono">54 Guru</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Total Rombel</div>
                <div className="text-xl font-bold font-mono text-emerald-500">24 Rombel</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Tahun Ajaran</div>
                <div className="text-xl font-bold font-mono text-amber-500">2026/2027 Ganjil</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Siswa & Default Dashboard (Ruang Belajar Siswa)
  const handleEnrollSiswa = () => {
    setHasEnrolled(true);
    setStudentXp((prev) => prev + 10);
    toast.success("Presensi Harian Berhasil! Status Anda tercatat HADIR DI KELAS.", {
      description: "🎉 Selamat! Anda memperoleh bonus +10 XP Poin Prestasi hari ini!",
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner Siswa & Gamifikasi XP Level */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 text-white p-6 lg:p-8 shadow-xl border border-blue-500/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                🎓 SISWA KELAS VIII A • NISN: 0081928371
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold font-mono">
                ⭐ {studentXp} XP • LEVEL 4 (PEJUANG ILMU)
              </Badge>
              {hasEnrolled ? (
                <Badge className="bg-emerald-600 text-white font-bold animate-pulse">
                  🟢 PRESENSI HARI INI: HADIR DI KELAS (07.15 WIB)
                </Badge>
              ) : (
                <Badge variant="outline" className="text-amber-400 border-amber-400/40">
                  ⚠️ BELUM ENROLL PRESENSI HARI INI
                </Badge>
              )}
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold">{"Assalamu'alaikum, Ahmad Fauzi 👋"}</h2>
            <p className="mt-1.5 text-sm text-slate-200 max-w-2xl leading-relaxed">
              Selamat belajar di LMS MTsN 2 Cilacap! Kumpulkan Poin Prestasi XP dari presensi, tugas, & kuis untuk meningkatkan peringkat Rombel 8A.
            </p>
          </div>

          <div className="shrink-0">
            {hasEnrolled ? (
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg gap-2 cursor-default">
                <CheckCircle2 className="h-5 w-5" /> Presensi Hari Ini (+10 XP)
              </Button>
            ) : (
              <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold shadow-lg animate-bounce gap-2" onClick={handleEnrollSiswa}>
                <UserCheck className="h-5 w-5" /> ⚡ Enroll Presensi Harian (+10 XP)
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Lencana Badge & Catatan Warning Pengingat Siswa */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Card Lencana Apresiasi Guru */}
        <Card className="border-border bg-amber-500/10 border-amber-500/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Trophy className="h-4 w-4 text-amber-500" /> Lencana Badge Apresiasi Saya (3 Badge)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 p-2 text-xs font-bold gap-1">
                ⭐ Siswa Aktif & Responsif
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 p-2 text-xs font-bold gap-1">
                🏆 Nilai Perfect 100
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30 p-2 text-xs font-bold gap-1">
                🌟 Hafalan Mutqin Juz 30
              </Badge>
            </div>
            <div className="text-[11px] text-muted-foreground italic pt-1">
              "Pujian Dra. Hj. Siti Rahmah: Mas Ahmad sangat aktif bertanya dan hafalan Al-Qur'an lancar!"
            </div>
          </CardContent>
        </Card>

        {/* Card Catatan Warning Pengingat */}
        <Card className="border-border bg-destructive/10 border-destructive/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Catatan Warning & Pengingat Tugas (1 Catatan)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-2">
            <div className="p-2.5 rounded-lg bg-background/80 border border-destructive/20 text-xs">
              <div className="font-bold text-destructive flex items-center justify-between">
                <span>⚠️ Belum Mengumpulkan LKPD Pertemuan 15</span>
                <Button size="sm" variant="ghost" className="h-6 text-[10px] text-destructive font-bold p-0" onClick={() => setActiveTab?.("tugas")}>
                  Kirim Sekarang →
                </Button>
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                Catatan Ust. Abdul Halim: Harap segera mengumpulkan rangkuman Akidah Akhlak sebelum jam 15.00 WIB.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pengingat Jadwal Hari Ini & Tugas Baru */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Card 1: Pengingat Jadwal KBM Hari Ini */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-500" /> Pengingat Jadwal Pelajaran Hari Ini (Selasa)
            </CardTitle>
            <Button size="sm" variant="ghost" className="text-xs text-blue-500 font-bold" onClick={() => setActiveTab?.("jadwal")}>
              Jadwal Lengkap →
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div
              className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/15 transition cursor-pointer"
              onClick={() => toast.info("Detail KBM: Al-Quran Hadits (Pertemuan 16: Tajwid Mad Silah) • Guru: Dra. Hj. Siti Rahmah • Ruang A.02")}
            >
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-blue-600 text-white font-mono text-[10px] mb-1">⏰ 07:30 - 09:00 WIB (Jam 1-2)</Badge>
                  <div className="font-bold text-sm text-foreground">{"Al-Quran Hadits (Kelas VIII A)"}</div>
                  <div className="text-xs text-muted-foreground">Materi: Pertemuan 16 - Tajwid Mad Silah • Ruang A.02</div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-blue-500 border-blue-500/30">
                  🔍 Detail KBM
                </Button>
              </div>
            </div>

            <div
              className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15 transition cursor-pointer"
              onClick={() => toast.info("Detail KBM: IPA Terpadu (Pertemuan 14: Organ Pernapasan Manusia) • Guru: Ibu Ratna Dewi • Lab IPA")}
            >
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px] mb-1">⏰ 09:15 - 10:45 WIB (Jam 3-4)</Badge>
                  <div className="font-bold text-sm text-foreground">IPA Terpadu (Kelas VIII A)</div>
                  <div className="text-xs text-muted-foreground">Materi: Pertemuan 14 - Sistem Pernapasan • Lab IPA</div>
                </div>
                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-emerald-500 border-emerald-500/30">
                  🔍 Detail KBM
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tugas Baru yang Perlu Dikerjakan */}
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <PencilLine className="h-5 w-5 text-amber-500" /> Tugas Baru & Kuis Belum Dikerjakan
            </CardTitle>
            <Button size="sm" variant="ghost" className="text-xs text-amber-500 font-bold" onClick={() => setActiveTab?.("tugas")}>
              Semua Penugasan →
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
              <div>
                <Badge className="bg-amber-500 text-black text-[10px] font-bold mb-1">⏳ DEADLINE: 30 JULI 2026</Badge>
                <div className="font-bold text-sm text-foreground">LKPD Pertemuan 16: Resume Tajwid Mad Silah</div>
                <div className="text-xs text-muted-foreground">Al-Quran Hadits • 1 Submisi Berkas PDF</div>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0" onClick={() => setActiveTab?.("tugas")}>
                Kerjakan →
              </Button>
            </div>

            <div className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 flex justify-between items-center">
              <div>
                <Badge className="bg-purple-500 text-white text-[10px] font-bold mb-1">📝 KUIS INTERAKTIF</Badge>
                <div className="font-bold text-sm text-foreground">Kuis Bab 3: Sistem Pernapasan Manusia</div>
                <div className="text-xs text-muted-foreground">IPA Terpadu • 10 Soal Pilihan Ganda (15 Menit)</div>
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0" onClick={() => setActiveTab?.("quiz")}>
                Mulai Kuis →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
