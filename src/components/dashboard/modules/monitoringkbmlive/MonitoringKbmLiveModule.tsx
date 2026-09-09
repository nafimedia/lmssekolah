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
  if (!r) return "Kelas 7A";
  const s = r.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
  if (s.includes("7A") || s.includes("VIIA")) return "Kelas 7A";
  if (s.includes("7B") || s.includes("VIIB")) return "Kelas 7B";
  if (s.includes("8A") || s.includes("VIIIA")) return "Kelas 8A";
  if (s.includes("8B") || s.includes("VIIIB")) return "Kelas 8B";
  if (s.includes("9A") || s.includes("IXA")) return "Kelas 9A";
  if (s.includes("9B") || s.includes("IXB")) return "Kelas 9B";
  return r.replace(/rombel/gi, "Kelas").trim();
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
            rombel: normalizeRombelName(sch.rombel || sch.kelas || "-"),
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
    <div className="space-y-4">
      {/* 1. Header Ringkas & Lega */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" /> Pemantauan KBM Langsung
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Supervisi real time pembelajaran tatap muka di kelas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-semibold gap-1.5 border-border hover:bg-muted shadow-2xs"
            onClick={loadLiveData}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            <span>Perbarui Data</span>
          </Button>
        </div>
      </div>

      {/* 2. Modern Segmented Tab Bar */}
      <div className="flex items-center border-b border-border/70 pb-2.5">
        <div className="bg-muted/60 p-1 rounded-xl border border-border/80 inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode("live")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === "live"
              ? "bg-background text-foreground font-bold shadow-xs border border-border/60"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
          >
            <Activity className={`h-3.5 w-3.5 ${viewMode === "live" ? "text-emerald-600" : "opacity-60"}`} />
            <span>Sesi KBM Live ({activeSessionsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("jurnal")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${viewMode === "jurnal"
              ? "bg-background text-foreground font-bold shadow-xs border border-border/60"
              : "text-muted-foreground hover:text-foreground hover:bg-background/40"
              }`}
          >
            <ClipboardCheck className={`h-3.5 w-3.5 ${viewMode === "jurnal" ? "text-purple-600" : "opacity-60"}`} />
            <span>Checklist Jurnal Guru ({journalCompliance.filledCount}/{journalCompliance.totalScheduled})</span>
          </button>
        </div>
      </div>

      {/* 3. Compact Metrics Strip (Horizontal ~44px) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="flex items-center gap-2.5 px-3 py-2 bg-card border border-border/80 rounded-xl shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
            <MonitorCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Total Kelas</div>
            <div className="text-sm font-extrabold text-foreground truncate">{totalSessionsCount} Kelas</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 bg-card border border-border/80 rounded-xl shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 grid place-items-center shrink-0 font-bold">
            <Activity className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Sedang KBM Live</div>
            <div className="text-sm font-extrabold text-teal-600 dark:text-teal-400 truncate">{activeSessionsCount} Sesi</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 bg-card border border-border/80 rounded-xl shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Selesai Hari Ini</div>
            <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 truncate">{completedSessionsCount} Sesi</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 bg-card border border-border/80 rounded-xl shadow-2xs">
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Jurnal Guru</div>
            <div className="text-sm font-extrabold text-purple-600 dark:text-purple-400 truncate">
              {journalCompliance.filledCount}/{journalCompliance.totalScheduled} Guru
            </div>
          </div>
        </div>
      </div>

      {/* 4. Content Area */}
      {viewMode === "live" ? (
        isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Memuat data monitoring KBM live...</div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1.5">
            <Inbox className="h-7 w-7 text-muted-foreground/40 mx-auto" />
            <div className="font-semibold text-foreground text-sm">Belum Ada Sesi KBM Terjadwal Hari Ini</div>
            <p>Tidak ada sesi KBM live yang sedang berlangsung untuk saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredSessions.map((session) => {
              const isLive = session.status === "SEDANG_BERLANGSUNG";
              const isDone = session.status === "SELESAI";
              return (
                <div
                  key={session.id}
                  className={`p-3.5 rounded-xl border transition-all bg-card shadow-2xs flex flex-col justify-between gap-2.5 ${isLive
                    ? "border-emerald-500/50 bg-emerald-500/[0.02] ring-1 ring-emerald-500/20"
                    : "border-border/80 hover:border-border"
                    }`}
                >
                  {/* Baris Atas: Kelas & Mapel + Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] shrink-0">
                        {session.rombel}
                      </span>
                      <span className="font-bold text-sm text-foreground truncate">
                        {session.mapel}
                      </span>
                    </div>

                    <div className="shrink-0">
                      {isLive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          KBM LIVE
                        </span>
                      ) : isDone ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground border border-border/80">
                          ✓ Selesai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 text-muted-foreground border border-border/60">
                          Belum Mulai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Baris Tengah: Info Guru */}
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="text-foreground font-semibold">Guru:</span>
                    <span className="font-medium text-foreground/90">{session.guruName}</span>
                  </div>

                  {/* Baris Bawah: Presensi Siswa & Tombol Akhiri */}
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground text-[11px]">
                      Presensi Siswa: <strong className="text-foreground font-bold">{session.hadirCount} / {session.totalStudents} Hadir</strong>
                    </span>

                    {isLive && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-6 text-[10px] font-bold px-2.5 gap-1 shadow-2xs cursor-pointer"
                        onClick={() => handleCloseSession(session)}
                      >
                        <CheckCircle2 className="h-3 w-3" /> Akhiri KBM
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Journal Compliance Checklist View */
        <Card className="border-border bg-card shadow-xs">
          <div className="p-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 bg-muted/20">
            <div className="text-xs font-bold text-foreground flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-purple-600" />
              <span>Checklist Jurnal Mengajar Hari Ini ({journalCompliance.filledCount}/{journalCompliance.totalScheduled} Guru Terisi)</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Cari guru, mapel, kelas..."
                  className="pl-8 h-8 text-xs bg-background"
                  value={jurnalSearch}
                  onChange={(e) => setJurnalSearch(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs font-bold gap-1 text-emerald-600 border-emerald-500/30"
                onClick={() => {
                  const headers = ["Nama Guru", "Mata Pelajaran", "Kelas", "Status Jurnal", "Catatan Materi"];
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
                <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
              </Button>
            </div>
          </div>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                  <tr>
                    <th className="py-3 px-4">Nama Guru Terjadwal</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Kelas</th>
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
