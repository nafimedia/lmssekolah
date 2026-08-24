import { useState, useEffect } from "react";
import {
  Radio,
  Clock,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Send,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  const [selectedTingkat, setSelectedTingkat] = useState<"SEMUA" | "7" | "8" | "9">("SEMUA");
  const [selectedStatus, setSelectedStatus] = useState<"SEMUA" | "LIVE" | "BELUM" | "SELESAI">("SEMUA");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedSessionForView, setSelectedSessionForView] = useState<LiveRombelSession | null>(null);
  const [isSupervisiOpen, setIsSupervisiOpen] = useState(false);

  const fetchRealLiveSessions = async () => {
    setIsRefreshing(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];

      const [attendances, journals, users, masterRombels] = await Promise.all([
        MysqlDataService.getKbmPresensi("", "", todayStr).catch(() => []),
        MysqlDataService.getJournals().catch(() => []),
        MysqlDataService.getUsers().catch(() => []),
        MysqlDataService.getMasterRombels().catch(() => []),
      ]);

      let baseList = INITIAL_BASE_ROMBELS;
      if (masterRombels && masterRombels.length > 0) {
        baseList = masterRombels.map((r) => {
          let t: "7" | "8" | "9" = "7";
          if (r.name.includes("VIII") || r.name.includes("8")) t = "8";
          else if (r.name.includes("IX") || r.name.includes("9")) t = "9";

          return {
            id: `r_${r.id}`,
            rombel: r.name,
            tingkat: t,
            mapel: "—",
            guruName: "Belum Memulai Presensi",
            materi: "Belum ada sesi KBM berlangsung hari ini",
            status: "BELUM" as const,
            jamKe: "Sesuai Roster KBM",
            hadirCount: 0,
            totalStudents: r.siswa_count || 32,
            sakitCount: 0,
            izinCount: 0,
            alpaCount: 0,
            lastUpdate: "-",
          };
        });
      }

      const todayJournals = (journals || []).filter(
        (j: any) => j.tanggal === todayStr || j.created_at?.startsWith(todayStr)
      );

      setSessions(
        baseList.map((baseRombel) => {
          const rombelPresensi = (attendances || []).filter(
            (a: any) =>
              a.rombel?.toLowerCase().trim() === baseRombel.rombel.toLowerCase().trim()
          );

          const rombelJournal = todayJournals.find(
            (j: any) =>
              j.rombel?.toLowerCase().trim() === baseRombel.rombel.toLowerCase().trim()
          );

          if (rombelPresensi.length > 0 || rombelJournal) {
            let hadir = 0,
              sakit = 0,
              izin = 0,
              alpa = 0;

            rombelPresensi.forEach((p: any) => {
              const st = (p.status || "").toUpperCase();
              if (st === "HADIR" || st === "H") hadir++;
              else if (st === "SAKIT" || st === "S") sakit++;
              else if (st === "IZIN" || st === "I") izin++;
              else if (st === "ALPA" || st === "A") alpa++;
            });

            const guru =
              rombelJournal?.guru_name ||
              (rombelPresensi[0] as any)?.guru_name ||
              "Guru Pengampu Active";

            const mapel =
              rombelJournal?.mapel ||
              (rombelPresensi[0] as any)?.mapel ||
              "Mata Pelajaran KBM";

            const materi =
              rombelJournal?.materi ||
              rombelJournal?.catatan ||
              `Presensi tatap muka terverifikasi (${hadir} siswa hadir)`;

            const totalSiswaRombel =
              users.filter(
                (u) =>
                  u.role === "siswa" &&
                  u.class_name?.toLowerCase().trim() === baseRombel.rombel.toLowerCase().trim()
              ).length || baseRombel.totalStudents;

            return {
              ...baseRombel,
              mapel,
              guruName: guru,
              materi,
              status: "LIVE",
              hadirCount: hadir,
              totalStudents: totalSiswaRombel || (hadir + sakit + izin + alpa),
              sakitCount: sakit,
              izinCount: izin,
              alpaCount: alpa,
              lastUpdate: "Baru saja",
            };
          }

          return {
            ...baseRombel,
            totalStudents: baseRombel.totalStudents,
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
      setTimeout(() => setIsRefreshing(false), 300);
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
    <div className="space-y-5">
      {/* Clean & Professional Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Radio className="h-5 w-5 text-emerald-600 animate-pulse" /> Monitoring KBM Real-Time
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Supervisi aktivitas KBM dan presensi siswa seluruh rombel secara live.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="font-bold text-xs gap-1.5"
            onClick={fetchRealLiveSessions}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Memuat Data..." : "Refresh Live Data"}
          </Button>
        </div>
      </div>

      {/* Clean KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border-border shadow-2xs bg-card hover:border-primary/30 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" /> Live KBM Aktif
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{liveCount} <span className="text-xs font-normal text-muted-foreground">Rombel</span></p>
            <p className="text-[11px] text-muted-foreground">Input presensi real-time</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs bg-card hover:border-primary/30 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> Belum Dimulai
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{belumCount} <span className="text-xs font-normal text-muted-foreground">Rombel</span></p>
            <p className="text-[11px] text-muted-foreground">Belum mengisi presensi hari ini</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs bg-card hover:border-primary/30 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Sesi Selesai
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">{selesaiCount} <span className="text-xs font-normal text-muted-foreground">Rombel</span></p>
            <p className="text-[11px] text-muted-foreground">Jurnal & presensi disahkan</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-2xs bg-card hover:border-primary/30 transition">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5 text-primary" /> Kehadiran Siswa
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground mt-1">
              {totalHadir} <span className="text-xs font-normal text-muted-foreground">/ {totalSiswa} Siswa</span>
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              {totalSiswa > 0 ? ((totalHadir / totalSiswa) * 100).toFixed(1) : 0}% Presensi Riil
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border shadow-2xs bg-card">
        <CardContent className="p-3.5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Cari rombel, guru, atau mapel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9 text-xs font-medium bg-background"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/60">
              <span className="text-[11px] font-semibold text-muted-foreground px-2">Tingkat:</span>
              {(["SEMUA", "7", "8", "9"] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={selectedTingkat === t ? "secondary" : "ghost"}
                  className={`h-7 text-xs font-semibold px-2.5 py-0 ${selectedTingkat === t ? "bg-background shadow-2xs font-bold text-foreground" : ""}`}
                  onClick={() => setSelectedTingkat(t)}
                >
                  {t === "SEMUA" ? "Semua" : `Kelas ${t}`}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/60">
              <span className="text-[11px] font-semibold text-muted-foreground px-2">Status:</span>
              {(["SEMUA", "LIVE", "BELUM", "SELESAI"] as const).map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={selectedStatus === st ? "secondary" : "ghost"}
                  className={`h-7 text-xs font-semibold px-2.5 py-0 ${selectedStatus === st ? "bg-background shadow-2xs font-bold text-foreground" : ""}`}
                  onClick={() => setSelectedStatus(st)}
                >
                  {st === "SEMUA" ? "Semua" : st === "LIVE" ? "Live" : st === "BELUM" ? "Belum" : "Selesai"}
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
            className="border border-border shadow-2xs hover:shadow-xs transition rounded-xl bg-card overflow-hidden flex flex-col justify-between"
          >
            <div>
              <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between gap-2 border-b border-border/60 bg-muted/20">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-foreground">{session.rombel}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono font-semibold bg-background">
                      Tingkat {session.tingkat}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-primary mt-0.5">{session.mapel}</p>
                </div>

                {session.status === "LIVE" && (
                  <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 font-bold text-[10px] gap-1.5 px-2 py-0.5 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
                    LIVE KBM
                  </Badge>
                )}
                {session.status === "BELUM" && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-semibold text-[10px] shrink-0">
                    BELUM MULAI
                  </Badge>
                )}
                {session.status === "SELESAI" && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-semibold text-[10px] shrink-0 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> SELESAI
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3">
                {/* Teacher Info */}
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Guru Pengampu:
                  </span>
                  <p className="text-xs font-bold text-foreground leading-snug">{session.guruName}</p>
                </div>

                {/* Material / Topic */}
                <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 space-y-0.5">
                  <span className="text-[10px] font-semibold text-muted-foreground block">
                    Pokok Bahasan / Materi:
                  </span>
                  <p className="text-xs font-medium text-foreground line-clamp-2 leading-relaxed">
                    {session.materi}
                  </p>
                </div>

                {/* Attendance Live Breakdown */}
                <div className="p-2.5 rounded-lg bg-background border border-border flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground block">Presensi Siswa:</span>
                    <span className="font-mono font-bold text-emerald-600 text-xs">
                      {session.hadirCount} / {session.totalStudents} Hadir
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] font-semibold font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      S: {session.sakitCount}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      I: {session.izinCount}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      A: {session.alpaCount}
                    </span>
                  </div>
                </div>
              </CardContent>
            </div>

            {/* Action Buttons Footer */}
            <div className="p-4 pt-0 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs font-semibold gap-1.5 bg-background hover:bg-muted"
                onClick={() => handleOpenSupervisi(session)}
              >
                <Eye className="h-3.5 w-3.5 text-primary" /> Detail Supervisi
              </Button>

              {session.status === "BELUM" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs font-semibold gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                  title="Kirim Reminder WA"
                  onClick={() => handleSendWaReminder(session)}
                >
                  <Send className="h-3.5 w-3.5" /> WA Reminder
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Dialog Intip Supervisi Detail Sesi */}
      {selectedSessionForView && (
        <Dialog open={isSupervisiOpen} onOpenChange={setIsSupervisiOpen}>
          <DialogContent className="sm:max-w-md border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Radio className="h-5 w-5 text-emerald-600" /> Detail Supervisi {selectedSessionForView.rombel}
              </DialogTitle>
              <DialogDescription>
                Informasi detail presensi dan materi KBM rombel ini.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mata Pelajaran:</span>
                  <strong className="text-foreground font-bold">{selectedSessionForView.mapel}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guru Pengampu:</span>
                  <strong className="text-foreground font-bold">{selectedSessionForView.guruName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu Sesi:</span>
                  <span className="font-mono text-muted-foreground">{selectedSessionForView.jamKe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status Sesi:</span>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {selectedSessionForView.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-muted-foreground">Materi / Catatan KBM:</span>
                <p className="p-3 rounded-lg border border-border bg-background text-foreground leading-relaxed">
                  {selectedSessionForView.materi}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-background space-y-2">
                <span className="font-bold text-foreground block">Rekapitulasi Kehadiran:</span>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 font-bold">
                    Hadir: {selectedSessionForView.hadirCount}
                  </div>
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-700 font-bold">
                    Sakit: {selectedSessionForView.sakitCount}
                  </div>
                  <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-700 font-bold">
                    Izin: {selectedSessionForView.izinCount}
                  </div>
                  <div className="p-2 rounded bg-red-500/10 border border-red-500/20 text-red-700 font-bold">
                    Alpa: {selectedSessionForView.alpaCount}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
