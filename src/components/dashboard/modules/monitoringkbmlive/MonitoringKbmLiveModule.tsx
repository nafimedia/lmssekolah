import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  UserCheck,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  MonitorCheck,
  Send,
  Sparkles,
  Inbox,
  ClipboardCheck,
  FileSpreadsheet,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { MysqlDataService } from "@/services/mysqlDataService";
import { exportToExcelXml } from "@/utils/excelExporter";
import { toast } from "sonner";

export interface LiveRombelSession {
  id: string;
  rombel: string;
  tingkat: string;
  mapel: string;
  guruName: string;
  materi: string;
  status: "SEDANG_BERLANGSUNG" | "BELUM" | "SELESAI";
  jamKe: string;
  hadirCount: number;
  totalStudents: number;
  sakitCount: number;
  izinCount: number;
  alpaCount: number;
  lastUpdate: string;
}

function normalizeRombelName(r: string): string {
  if (!r) return "Rombel 7A";
  const s = r.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
  if (s.includes("7A") || s.includes("VIIA")) return "Rombel 7A";
  if (s.includes("7B") || s.includes("VIIB")) return "Rombel 7B";
  if (s.includes("8A") || s.includes("VIIIA")) return "Rombel 8A";
  if (s.includes("8B") || s.includes("VIIIB")) return "Rombel 8B";
  if (s.includes("9A") || s.includes("IXA")) return "Rombel 9A";
  if (s.includes("9B") || s.includes("IXB")) return "Rombel 9B";
  return r;
}

export function MonitoringKbmLiveModule() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterTingkat, setFilterTingkat] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"live" | "jurnal">("live");
  const [jurnalSearch, setJurnalSearch] = useState<string>("");

  const [rombelSessions, setRombelSessions] = useState<LiveRombelSession[]>([]);
  const [journalCompliance, setJournalCompliance] = useState<{
    totalScheduled: number;
    filledCount: number;
    pendingCount: number;
    teachers: {
      guru: string;
      mapel: string;
      rombel: string;
      hasFilled: boolean;
      materi?: string;
    }[];
  }>({
    totalScheduled: 0,
    filledCount: 0,
    pendingCount: 0,
    teachers: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshedTime, setLastRefreshedTime] = useState<string>("");

  const handleCloseSession = async (session: LiveRombelSession) => {
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await MysqlDataService.saveActiveKbmSession({
        id: session.id,
        rombel: session.rombel,
        mapel: session.mapel,
        guru_name: session.guruName,
        status: "SELESAI",
        date_str: todayStr,
      });

      if (res) {
        toast.success(`✅ Sesi KBM ${session.rombel} (${session.mapel}) berhasil diakhiri!`);
        loadLiveData();
      } else {
        toast.error("Gagal memperbarui status KBM.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan saat menutup sesi KBM.");
    }
  };

  const loadLiveData = async () => {
    setIsLoading(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const [activeSessions, scheduleList, attendances, users, journals] = await Promise.all([
        MysqlDataService.getActiveKbmSessions(),
        MysqlDataService.getJadwalPelajaran(),
        MysqlDataService.getAttendances(),
        MysqlDataService.getUsers(),
        MysqlDataService.getJournals(),
      ]);

      setLastRefreshedTime(new Date().toLocaleTimeString("id-ID") + " WIB");

      const studentUsers = (users || []).filter((u: any) => u.role === "siswa");
      const activeDay = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][new Date().getDay()] || "Kamis";

      // Today's schedule
      const todaySchedules = (scheduleList || []).filter((s: any) => s.hari === activeDay || s.hari === "Kamis");
      
      const rombelMap: Record<string, LiveRombelSession> = {};

      // 1. Process active sessions started by teachers
      (activeSessions || []).forEach((sess: any, idx: number) => {
        const rawRombel = sess.rombel;
        if (!rawRombel) return;
        const normalizedRombel = normalizeRombelName(rawRombel);
        const normKey = normalizedRombel.toUpperCase().replace(/\s+/g, "");

        // Verify if session date matches today's date
        const sessDate = sess.date_str || "";
        const isTodaySession = sessDate === todayStr || !sessDate;
        const isLiveToday = sess.status === "SEDANG_BERLANGSUNG" && isTodaySession;

        // Find students in this rombel
        const rombelStudents = studentUsers.filter((u: any) => {
          const cls = (u.class_name || u.class || "").toUpperCase().replace(/\s+/g, "");
          return cls.includes(normKey) || normKey.includes(cls);
        });

        // Find attendance records
        const rombelAttendances = (attendances || []).filter((a: any) => {
          const cls = (a.class_name || "").toUpperCase().replace(/\s+/g, "");
          return cls.includes(normKey) || normKey.includes(cls);
        });

        const hadir = rombelAttendances.filter((a: any) => a.status?.toLowerCase() === "hadir").length;
        const sakit = rombelAttendances.filter((a: any) => a.status?.toLowerCase() === "sakit").length;
        const izin = rombelAttendances.filter((a: any) => a.status?.toLowerCase() === "izin").length;
        const alpa = rombelAttendances.filter((a: any) => a.status?.toLowerCase() === "alpa").length;

        if (!rombelMap[normalizedRombel] || isLiveToday) {
          rombelMap[normalizedRombel] = {
            id: sess.id || `sess_${idx}`,
            rombel: normalizedRombel,
            tingkat: normalizedRombel.includes("7") ? "7" : normalizedRombel.includes("9") ? "9" : "8",
            mapel: sess.mapel || "Mata Pelajaran",
            guruName: sess.guru_name || "Guru Pengampu",
            materi: isLiveToday ? "Sesi KBM Tatap Muka Sedang Berlangsung" : "Sesi KBM Selesai",
            status: isLiveToday ? "SEDANG_BERLANGSUNG" : "SELESAI",
            jamKe: "Jam KBM Aktif Hari Ini",
            hadirCount: hadir,
            totalStudents: rombelStudents.length,
            sakitCount: sakit,
            izinCount: izin,
            alpaCount: alpa,
            lastUpdate: new Date().toLocaleTimeString("id-ID") + " WIB",
          };
        }
      });

      // 2. Also map schedules if not started yet
      todaySchedules.forEach((sch: any, idx: number) => {
        const rawRombel = sch.rombel || sch.kelas;
        if (!rawRombel) return;
        const normalizedRombel = normalizeRombelName(rawRombel);
        const normKey = normalizedRombel.toUpperCase().replace(/\s+/g, "");
        if (!rombelMap[normalizedRombel]) {
          const schStudents = studentUsers.filter((u: any) => {
            const cls = (u.class_name || u.class || "").toUpperCase().replace(/\s+/g, "");
            return cls.includes(normKey) || normKey.includes(cls);
          });

          rombelMap[normalizedRombel] = {
            id: `sch_${idx}`,
            rombel: normalizedRombel,
            tingkat: normalizedRombel.includes("7") ? "7" : normalizedRombel.includes("9") ? "9" : "8",
            mapel: sch.mapel || "Mata Pelajaran",
            guruName: sch.guru || "Guru Pengampu",
            materi: "Jadwal Pelajaran Terdaftar (Belum Presensi)",
            status: "BELUM",
            jamKe: sch.jam || "Jam Ke-1",
            hadirCount: 0,
            totalStudents: schStudents.length,
            sakitCount: 0,
            izinCount: 0,
            alpaCount: 0,
            lastUpdate: new Date().toLocaleTimeString("id-ID") + " WIB",
          };
        }
      });

      // 3. Process teacher journal compliance for today's schedules
      const teacherScheduleMap: Record<string, { guru: string; mapel: string; rombel: string; hasFilled: boolean; materi?: string }> = {};

      todaySchedules.forEach((sch: any) => {
        const gName = (sch.guru || "").trim();
        if (!gName) return;

        const gLower = gName.toLowerCase();
        const matchedJournal = (journals || []).find((j: any) => {
          const jLower = (j.guru_name || "").toLowerCase();
          return jLower.includes(gLower) || gLower.includes(jLower);
        });

        const key = `${gName}_${sch.rombel || sch.kelas || ""}_${sch.mapel || ""}`;
        if (!teacherScheduleMap[key]) {
          teacherScheduleMap[key] = {
            guru: gName,
            mapel: sch.mapel || "Mata Pelajaran",
            rombel: sch.rombel || sch.kelas || "-",
            hasFilled: !!matchedJournal,
            materi: matchedJournal?.materi,
          };
        }
      });

      const teacherList = Object.values(teacherScheduleMap);
      const filled = teacherList.filter((t) => t.hasFilled).length;
      setJournalCompliance({
        totalScheduled: teacherList.length,
        filledCount: filled,
        pendingCount: teacherList.length - filled,
        teachers: teacherList,
      });

      setRombelSessions(Object.values(rombelMap));
    } catch (e) {
      console.warn("Failed loading live KBM data:", e);
      setRombelSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLiveData();
    const handleFocus = () => {
      loadLiveData();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  const filteredSessions = rombelSessions.filter((s) => {
    if (filterStatus !== "ALL" && s.status !== filterStatus) return false;
    if (filterTingkat !== "ALL" && s.tingkat !== filterTingkat) return false;
    return true;
  });

  const totalSessionsCount = rombelSessions.length;
  const activeSessionsCount = rombelSessions.filter((s) => s.status === "SEDANG_BERLANGSUNG").length;
  const completedSessionsCount = rombelSessions.filter((s) => s.status === "SELESAI").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Pemantauan KBM Langsung
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
            onClick={loadLiveData}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} /> Perbarui Data
          </Button>
        </div>
      </div>

      {/* Stat Cards Overview (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/5 via-card to-card border-emerald-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center shrink-0 font-bold">
              <MonitorCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Rombel Terpantau</div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalSessionsCount} Rombel</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/5 via-card to-card border-teal-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 grid place-items-center shrink-0 font-bold">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">KBM Sedang Berlangsung</div>
              <div className="text-xl font-extrabold text-teal-600 dark:text-teal-400">{activeSessionsCount} Sesi Berlangsung</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 via-card to-card border-blue-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center shrink-0 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">KBM Selesai Hari Ini</div>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{completedSessionsCount} Sesi Tuntas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/5 via-card to-card border-purple-500/20 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 grid place-items-center shrink-0 font-bold">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Kepatuhan Jurnal Guru</div>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">
                {journalCompliance.filledCount}/{journalCompliance.totalScheduled} Guru
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={viewMode === "live" ? "default" : "outline"}
          className={`text-xs font-bold gap-1.5 ${viewMode === "live" ? "bg-emerald-600 text-white" : ""}`}
          onClick={() => setViewMode("live")}
        >
          <Activity className="h-3.5 w-3.5" /> Sesi KBM Live ({activeSessionsCount})
        </Button>
        <Button
          size="sm"
          variant={viewMode === "jurnal" ? "default" : "outline"}
          className={`text-xs font-bold gap-1.5 ${viewMode === "jurnal" ? "bg-purple-600 text-white" : ""}`}
          onClick={() => setViewMode("jurnal")}
        >
          <ClipboardCheck className="h-3.5 w-3.5" /> Checklist Jurnal KBM Hari Ini ({journalCompliance.filledCount}/{journalCompliance.totalScheduled})
        </Button>
      </div>

      {/* Conditional Content by ViewMode */}
      {viewMode === "live" ? (
        isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Memuat data monitoring KBM live...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
            <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <div className="font-semibold text-foreground text-sm">Belum Ada Sesi KBM Live Berlangsung</div>
            <p>Tidak ada sesi KBM live yang sedang berlangsung untuk saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <Card key={session.id} className="border-border hover:border-emerald-500/40 transition shadow-xs bg-card">
                <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
                  <div>
                    <Badge className="bg-emerald-600 text-white text-[10px] mb-1">{session.rombel}</Badge>
                    <CardTitle className="text-base font-bold">{session.mapel}</CardTitle>
                    <CardDescription className="text-xs">Guru: {session.guruName}</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-500/30 font-bold text-[10px]">
                    {session.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground font-medium">
                    <span>
                      Presensi Siswa: <strong className="text-foreground">{session.hadirCount} / {session.totalStudents} Siswa Hadir</strong>
                    </span>
                    {session.status === "SEDANG_BERLANGSUNG" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-[11px] font-bold px-3 gap-1 shadow-2xs self-start sm:self-center"
                        onClick={() => handleCloseSession(session)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Akhiri Sesi KBM
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        /* Journal Compliance Checklist View */
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-purple-600" /> Checklist Kepatuhan Pengisian Jurnal Mengajar
              </CardTitle>
              <CardDescription className="text-xs">
                Daftar guru yang terjadwal KBM hari ini beserta status pengisian jurnal di database.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-60">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari guru, mapel, rombel..."
                  className="pl-9 h-8 text-xs"
                  value={jurnalSearch}
                  onChange={(e) => setJurnalSearch(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold gap-1 text-emerald-600 border-emerald-500/30"
                onClick={() => {
                  const headers = ["Nama Guru", "Mata Pelajaran", "Rombel", "Status Jurnal", "Catatan Materi"];
                  const rows = journalCompliance.teachers.map((t) => [
                    t.guru,
                    t.mapel,
                    t.rombel,
                    t.hasFilled ? "Sudah Diisi" : "Belum Mengisi",
                    t.materi || "-",
                  ]);
                  exportToExcelXml("Checklist_Kepatuhan_Jurnal_Hari_Ini", "Jurnal_KBM", headers, rows);
                  toast.success("Rekapitulasi Jurnal Mengajar Berhasil Diunduh!");
                }}
              >
                <FileSpreadsheet className="h-4 w-4" /> Export Excel
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Nama Guru Terjadwal</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Rombel</th>
                    <th className="py-3 px-4 text-center">Status Pengisian</th>
                    <th className="py-3 px-4">Materi Pembelajaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {journalCompliance.teachers
                    .filter((t) => {
                      if (!jurnalSearch) return true;
                      const q = jurnalSearch.toLowerCase();
                      return (
                        t.guru.toLowerCase().includes(q) ||
                        t.mapel.toLowerCase().includes(q) ||
                        t.rombel.toLowerCase().includes(q)
                      );
                    })
                    .map((item, idx) => (
                      <tr key={`${item.guru}_${idx}`} className="hover:bg-muted/20 transition">
                        <td className="py-3 px-4 font-bold text-foreground">{item.guru}</td>
                        <td className="py-3 px-4 font-medium">{item.mapel}</td>
                        <td className="py-3 px-4 font-mono font-semibold">{item.rombel}</td>
                        <td className="py-3 px-4 text-center">
                          {item.hasFilled ? (
                            <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
                              <Check className="h-3 w-3" /> Sudah Terisi
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10 font-bold text-[10px]">
                              ⏳ Belum Terisi
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground italic">
                          {item.materi || (item.hasFilled ? "Tercatat di sistem" : "-")}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
