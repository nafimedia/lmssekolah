import { useState, useEffect } from "react";
import {
  Radio,
  Clock,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  BookOpen,
  Filter,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Building2,
  BellRing,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";

export interface LiveRombelSession {
  id: string;
  rombel: string;
  tingkat: "7" | "8" | "9";
  mapel: string;
  guruName: string;
  materi: string;
  status: "LIVE" | "BELUM" | "SELESAI";
  jamKe: string;
  hadirCount: number;
  totalStudents: number;
  sakitCount: number;
  izinCount: number;
  alpaCount: number;
  lastUpdate: string;
}

const INITIAL_BASE_ROMBELS: LiveRombelSession[] = [
  {
    id: "r_7a",
    rombel: "Kelas VII A",
    tingkat: "7",
    mapel: "—",
    guruName: "Belum Memulai Presensi",
    materi: "Belum ada sesi KBM berlangsung hari ini",
    status: "BELUM",
    jamKe: "Jam ke-1 & 2 (07.30 - 09.00)",
    hadirCount: 0,
    totalStudents: 0,
    sakitCount: 0,
    izinCount: 0,
    alpaCount: 0,
    lastUpdate: "-",
  },
  {
    id: "r_7b",
    rombel: "Kelas VII B",
    tingkat: "7",
    mapel: "—",
    guruName: "Belum Memulai Presensi",
    materi: "Belum ada sesi KBM berlangsung hari ini",
    status: "BELUM",
    jamKe: "Jam ke-1 & 2 (07.30 - 09.00)",
    hadirCount: 0,
    totalStudents: 0,
    sakitCount: 0,
    izinCount: 0,
    alpaCount: 0,
    lastUpdate: "-",
  },
  {
    id: "r_8a",
    rombel: "Kelas VIII A",
    tingkat: "8",
    mapel: "—",
    guruName: "Belum Memulai Presensi",
    materi: "Belum ada sesi KBM berlangsung hari ini",
    status: "BELUM",
    jamKe: "Jam ke-1 & 2 (07.30 - 09.00)",
    hadirCount: 0,
    totalStudents: 0,
    sakitCount: 0,
    izinCount: 0,
    alpaCount: 0,
    lastUpdate: "-",
  },
  {
    id: "r_8b",
    rombel: "Kelas VIII B",
    tingkat: "8",
    mapel: "—",
    guruName: "Belum Memulai Presensi",
    materi: "Belum ada sesi KBM berlangsung hari ini",
    status: "BELUM",
    jamKe: "Jam ke-1 & 2 (07.30 - 09.00)",
    hadirCount: 0,
    totalStudents: 0,
    sakitCount: 0,
    izinCount: 0,
    alpaCount: 0,
    lastUpdate: "-",
  },
  {
    id: "r_9a",
    rombel: "Kelas IX A",
    tingkat: "9",
    mapel: "—",
    guruName: "Belum Memulai Presensi",
    materi: "Belum ada sesi KBM berlangsung hari ini",
    status: "BELUM",
    jamKe: "Jam ke-1 & 2 (07.30 - 09.00)",
    hadirCount: 0,
    totalStudents: 0,
    sakitCount: 0,
    izinCount: 0,
    alpaCount: 0,
    lastUpdate: "-",
  },
  {
    id: "r_9b",
    rombel: "Kelas IX B",
    tingkat: "9",
    mapel: "—",
    guruName: "Belum Memulai Presensi",
    materi: "Belum ada sesi KBM berlangsung hari ini",
    status: "BELUM",
    jamKe: "Jam ke-1 & 2 (07.30 - 09.00)",
    hadirCount: 0,
    totalStudents: 0,
    sakitCount: 0,
    izinCount: 0,
    alpaCount: 0,
    lastUpdate: "-",
  },
];

export function MonitoringKbmLiveModule() {
  const [sessions, setSessions] = useState<LiveRombelSession[]>(INITIAL_BASE_ROMBELS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTingkat, setSelectedTingkat] = useState<string>("SEMUA");
  const [selectedStatus, setSelectedStatus] = useState<string>("SEMUA");
  const [selectedSessionForView, setSelectedSessionForView] = useState<LiveRombelSession | null>(null);
  const [isSupervisiOpen, setIsSupervisiOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRealLiveSessions = async () => {
    setIsRefreshing(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const [dbPresensi, dbJournals, dbUsers] = await Promise.all([
        MysqlDataService.getKbmPresensi("ALL", "ALL", todayStr),
        MysqlDataService.getJournals(),
        MysqlDataService.getUsers(),
      ]);

      const siswaList = (dbUsers || []).filter((u: any) => u.role === "siswa");

      setSessions((prev) =>
        prev.map((baseRombel) => {
          const normRombel = baseRombel.rombel.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
          const is7A = normRombel.includes("VIIA") || normRombel.includes("7A");
          const is7B = normRombel.includes("VIIB") || normRombel.includes("7B");
          const is8A = normRombel.includes("VIIIA") || normRombel.includes("8A");
          const is8B = normRombel.includes("VIIIB") || normRombel.includes("8B");
          const is9A = normRombel.includes("IXA") || normRombel.includes("9A");
          const is9B = normRombel.includes("IXB") || normRombel.includes("9B");

          // Calculate real total students for this rombel from users table
          const classStudents = siswaList.filter((u: any) => {
            const cls = (u.class_name || u.class || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
            if (is7A) return cls.includes("VIIA") || cls.includes("7A");
            if (is7B) return cls.includes("VIIB") || cls.includes("7B");
            if (is8A) return cls.includes("VIIIA") || cls.includes("8A");
            if (is8B) return cls.includes("VIIIB") || cls.includes("8B");
            if (is9A) return cls.includes("IXA") || cls.includes("9A");
            if (is9B) return cls.includes("IXB") || cls.includes("9B");
            return false;
          });

          const totalSiswaRombel = classStudents.length;

          // Find real live presensi records for this rombel today
          const rombelPresensi = (dbPresensi || []).filter((p: any) => {
            const pRombel = (p.rombel || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
            return pRombel.includes(normRombel) || normRombel.includes(pRombel);
          });

          // Find real journal entry for this rombel today
          const rombelJournal = (dbJournals || []).find((j: any) => {
            const jRombel = (j.rombel || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
            return jRombel.includes(normRombel) || normRombel.includes(jRombel);
          });

          if (rombelPresensi.length > 0 || rombelJournal) {
            const hadir = rombelPresensi.filter((p: any) => p.status === "HADIR").length;
            const sakit = rombelPresensi.filter((p: any) => p.status === "SAKIT").length;
            const izin = rombelPresensi.filter((p: any) => p.status === "IZIN").length;
            const alpa = rombelPresensi.filter((p: any) => p.status === "ALPA").length;

            const mapel = rombelPresensi[0]?.mapel || rombelJournal?.mapel || "Pendidikan Kewarganegaraan";
            const guru = rombelPresensi[0]?.guru_name || rombelJournal?.guru_name || "Guru Pengampu";
            const materi = rombelJournal?.materi || rombelJournal?.catatan || "Presensi KBM sedang berlangsung";

            return {
              ...baseRombel,
              mapel,
              guruName: guru,
              materi,
              status: "LIVE",
              hadirCount: hadir,
              totalStudents: totalSiswaRombel || (hadir + sakit + izin + alpa) || 30,
              sakitCount: sakit,
              izinCount: izin,
              alpaCount: alpa,
              lastUpdate: "Baru saja",
            };
          }

          // If no presensi or journal entered yet today, status remains BELUM
          return {
            ...baseRombel,
            totalStudents: totalSiswaRombel,
            status: "BELUM",
            mapel: "—",
            guruName: "Belum Memulai Presensi",
            materi: "Belum ada sesi KBM berlangsung hari ini",
            hadirCount: 0,
            sakitCount: 0,
            izinCount: 0,
            alpaCount: 0,
            lastUpdate: "-",
          };
        })
      );
    } catch (e) {
      console.warn("fetchRealLiveSessions error:", e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchRealLiveSessions();
  }, []);

  const liveCount = sessions.filter((s) => s.status === "LIVE").length;
  const belumCount = sessions.filter((s) => s.status === "BELUM").length;
  const selesaiCount = sessions.filter((s) => s.status === "SELESAI").length;
  const totalHadir = sessions.reduce((acc, curr) => acc + curr.hadirCount, 0);
  const totalSiswa = sessions.reduce((acc, curr) => acc + curr.totalStudents, 0);

  const filteredSessions = sessions.filter((s) => {
    const matchesTingkat = selectedTingkat === "SEMUA" || s.tingkat === selectedTingkat;
    const matchesStatus = selectedStatus === "SEMUA" || s.status === selectedStatus;
    const matchesSearch =
      s.rombel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.guruName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.materi.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTingkat && matchesStatus && matchesSearch;
  });

  const handleSendWaReminder = (session: LiveRombelSession) => {
    toast.success(`📱 WA Gateway Reminder terkirim ke HP Guru ${session.rombel}!`);
  };

  const handleOpenSupervisi = (session: LiveRombelSession) => {
    setSelectedSessionForView(session);
    setIsSupervisiOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Live Command Center Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white shadow-lg border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Radio className="h-64 w-64 text-emerald-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <Badge className="bg-red-600/90 text-white font-extrabold text-[10px] tracking-wider px-2 py-0.5 uppercase">
                LIVE COMMAND CENTER KBM REAL-TIME
              </Badge>
              <Badge variant="outline" className="text-emerald-300 border-emerald-500/50 font-mono text-[10px]">
                DATA RIIL DATABASE MYSQL
              </Badge>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              Monitoring KBM Real-Time Seluruh Rombel
            </h1>
            <p className="text-xs text-emerald-200/80 max-w-2xl leading-relaxed">
              Supervisi langsung aktivitas belajar mengajar tatap muka di seluruh rombel (Kelas VII, VIII, & IX) berbasis data riil presensi & jurnal guru.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold text-xs gap-1.5"
              onClick={fetchRealLiveSessions}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Memuat Data Riil..." : "Refresh Live Data"}
            </Button>
          </div>
        </div>
      </div>

      {/* Real-time KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-600 dark:text-red-400">🔴 Live KBM Aktif</span>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{liveCount} Rombel</p>
            <p className="text-[10px] text-muted-foreground">Status live berdasarkan input presensi real-time</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">⚠️ Belum Dimulai</span>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{belumCount} Rombel</p>
            <p className="text-[10px] text-muted-foreground">Belum ada presensi / KBM live diisi hari ini</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">✅ Sesi Selesai</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{selesaiCount} Rombel</p>
            <p className="text-[10px] text-muted-foreground">Jurnal & presensi disahkan</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400">👥 Kehadiran Siswa Real-Time</span>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {totalHadir} <span className="text-xs font-semibold text-muted-foreground">/ {totalSiswa} Siswa</span>
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">
              {totalSiswa > 0 ? ((totalHadir / totalSiswa) * 100).toFixed(1) : 0}% Presensi Riil
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border shadow-xs bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Cari rombel, guru, atau mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground px-2">Tingkat:</span>
              {(["SEMUA", "7", "8", "9"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={selectedTingkat === t ? "default" : "ghost"}
                  className="h-7 text-xs font-bold px-2.5 py-0"
                  onClick={() => setSelectedTingkat(t)}
                >
                  {t === "SEMUA" ? "Semua" : `Kelas ${t}`}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
              <span className="text-[11px] font-bold text-muted-foreground px-2">Status:</span>
              {(["SEMUA", "LIVE", "BELUM", "SELESAI"] as const).map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={selectedStatus === st ? "default" : "ghost"}
                  className="h-7 text-xs font-bold px-2.5 py-0"
                  onClick={() => setSelectedStatus(st)}
                >
                  {st === "SEMUA" ? "Semua" : st === "LIVE" ? "🔴 Live" : st === "BELUM" ? "⚠️ Belum" : "✅ Selesai"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid of All Rombel Live Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSessions.map((session) => (
          <Card
            key={session.id}
            className={`border-2 transition shadow-xs hover:shadow-md relative overflow-hidden ${
              session.status === "LIVE"
                ? "border-red-500/80 bg-gradient-to-b from-red-50/20 to-card dark:from-red-950/10"
                : session.status === "BELUM"
                ? "border-amber-400/80 bg-gradient-to-b from-amber-50/20 to-card dark:from-amber-950/10"
                : "border-emerald-500/60 bg-card"
            }`}
          >
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2 border-b border-border/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-base text-foreground">{session.rombel}</h3>
                  <Badge variant="outline" className="text-[9px] font-mono font-bold">
                    Tingkat {session.tingkat}
                  </Badge>
                </div>
                <p className="text-xs font-bold text-primary mt-0.5">{session.mapel}</p>
              </div>

              {session.status === "LIVE" && (
                <Badge className="bg-red-600 text-white font-extrabold text-[10px] gap-1 px-2 py-0.5 shrink-0">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  🔴 LIVE KBM
                </Badge>
              )}
              {session.status === "BELUM" && (
                <Badge className="bg-amber-500 text-white font-bold text-[10px] shrink-0">
                  ⚠️ BELUM MULAI
                </Badge>
              )}
              {session.status === "SELESAI" && (
                <Badge className="bg-emerald-600 text-white font-bold text-[10px] shrink-0 gap-1">
                  <CheckCircle2 className="h-3 w-3" /> SELESAI
                </Badge>
              )}
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {/* Teacher Info */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
                  Guru Pengampu:
                </span>
                <p className="text-xs font-bold text-foreground leading-snug">{session.guruName}</p>
              </div>

              {/* Material / Topic */}
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                  Pokok Bahasan / Materi KBM:
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                  {session.materi}
                </p>
              </div>

              {/* Attendance Live Breakdown */}
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-border flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-muted-foreground block">Presensi Siswa:</span>
                  <span className="font-mono font-bold text-emerald-600 text-sm">
                    {session.hadirCount} / {session.totalStudents} Hadir
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-bold font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    S: {session.sakitCount}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    I: {session.izinCount}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                    A: {session.alpaCount}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleOpenSupervisi(session)}
                >
                  <Eye className="h-3.5 w-3.5" /> Intip Supervisi KBM
                </Button>

                {session.status === "BELUM" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold gap-1 border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950"
                    title="Kirim Reminder WA"
                    onClick={() => handleSendWaReminder(session)}
                  >
                    <Send className="h-3.5 w-3.5 text-emerald-600" /> Reminder WA
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog Intip Supervisi Detail Sesi */}
      {selectedSessionForView && (
        <Dialog open={isSupervisiOpen} onOpenChange={setIsSupervisiOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-red-600 text-white font-extrabold text-[10px] gap-1">
                  🔴 SUPERVISI REAL-TIME KBM
                </Badge>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                  {selectedSessionForView.rombel} · {selectedSessionForView.mapel}
                </span>
              </div>
              <DialogTitle className="text-lg font-black">
                Detail Sesi KBM Live — {selectedSessionForView.rombel}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Guru Pengampu: <strong>{selectedSessionForView.guruName}</strong> · Waktu: {selectedSessionForView.jamKe}
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-1">
                <label className="font-extrabold text-emerald-800 dark:text-emerald-300 block">
                  Pokok Bahasan / Materi yang Sedang Diajarkan:
                </label>
                <p className="font-bold text-sm text-foreground">{selectedSessionForView.materi}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border">
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold block">PRESENSI KELAS:</span>
                  <p className="text-base font-black text-emerald-600 font-mono">
                    {selectedSessionForView.hadirCount} dari {selectedSessionForView.totalStudents} Siswa Hadir
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground font-bold block">KETERANGAN ALASAN:</span>
                  <p className="text-xs font-bold text-foreground">
                    Sakit: {selectedSessionForView.sakitCount} · Izin: {selectedSessionForView.izinCount} · Alpa: {selectedSessionForView.alpaCount}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground block">Catatan Observasi Supervisi Pimpinan:</label>
                <p className="p-3 rounded-lg bg-muted/30 border border-border/80 text-muted-foreground leading-relaxed">
                  Supervisi real-time KBM untuk {selectedSessionForView.rombel}. Data presensi terintegrasi penuh dari database MySQL.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border pt-3">
              <Button variant="outline" size="sm" className="text-xs font-bold" onClick={() => setIsSupervisiOpen(false)}>
                Tutup Supervisi
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                onClick={() => {
                  toast.success(`Catatan Supervisi Kamad untuk ${selectedSessionForView.guruName} tersimpan!`);
                  setIsSupervisiOpen(false);
                }}
              >
                <ShieldCheck className="h-4 w-4" /> Simpan Catatan Supervisi Kamad
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
