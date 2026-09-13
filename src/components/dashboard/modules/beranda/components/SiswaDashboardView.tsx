import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trophy, BookOpen, CalendarClock, ArrowRight, CheckCircle2, UserCheck, Building2, Clock, Sparkles, FileText } from "lucide-react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";

import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";

interface SiswaDashboardViewProps {
  userName: string;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function SiswaDashboardView({ userName, currentDayName, formattedTime, setActiveTab }: SiswaDashboardViewProps) {
  const me = MysqlAuthService.getActiveUser();
  const rawClass = me?.class_name || "Kelas 8A";
  const siswaClass = normalizeRombelName(rawClass);
  const siswaNisn = me?.nis_nip || "";
  const [presensiToday, setPresensiToday] = useState<any>(null);
  const [myTugasList, setMyTugasList] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [jadwalToday, setJadwalToday] = useState<any[]>([]);

  const [liveSession, setLiveSession] = useState<any | null>(null);

  useEffect(() => {
    async function loadSiswaRealData() {
      try {
        const currentUser = MysqlAuthService.getActiveUser();
        const currentClass = normalizeRombelName(currentUser?.class_name || "Kelas 8A");
        const todayStr = new Date().toISOString().split("T")[0];
        const [dbPresensi, dbTugas, dbJadwal, dbSessions, dbSubmissions] = await Promise.all([
          MysqlDataService.getKbmPresensi("ALL", "ALL", todayStr),
          MysqlDataService.getLkpdActivities(currentClass, "ALL"),
          MysqlDataService.getJadwalList(),
          MysqlDataService.getActiveKbmSessions(),
          MysqlDataService.getSubmissions(),
        ]);

        const myPres = (dbPresensi || []).find((p: any) => {
          const cleanDbName = (p.student_name || "").toLowerCase().trim();
          const cleanUserName = (userName || "").toLowerCase().trim();
          const cleanUserFullName = (currentUser?.full_name || "").toLowerCase().trim();
          const matchName =
            cleanDbName === cleanUserName ||
            cleanDbName === cleanUserFullName ||
            (cleanUserName && cleanDbName.includes(cleanUserName));
          const matchNis =
            p.student_nis &&
            currentUser?.nis_nip &&
            (p.student_nis === currentUser.nis_nip || p.student_nis === currentUser.id);
          return matchName || matchNis;
        });
        setPresensiToday(myPres);
        setMyTugasList(dbTugas || []);

        const mySubs = (dbSubmissions || []).filter((s: any) => {
          const matchNis = s.student_nis && currentUser?.nis_nip && s.student_nis === currentUser.nis_nip;
          const matchName =
            s.student_name &&
            currentUser?.full_name &&
            s.student_name.toLowerCase().trim() === currentUser.full_name.toLowerCase().trim();
          return matchNis || matchName;
        });
        setMySubmissions(mySubs);

        const liveSess = (dbSessions || []).find(
          (s: any) => s.status === "SEDANG_BERLANGSUNG" && isSameClass(s.rombel || "", currentClass)
        );
        setLiveSession(liveSess || null);

        const classSchedule = (dbJadwal || []).filter((j: any) => {
          const matchDay = (j.hari || "").toLowerCase().trim() === currentDayName.toLowerCase().trim();
          return matchDay && isSameClass(j.rombel || j.class_name, currentClass);
        });
        setJadwalToday(classSchedule);
      } catch (e) {
        console.warn("loadSiswaRealData error:", e);
      }
    }

    loadSiswaRealData();
    const handleFocus = () => {
      loadSiswaRealData();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [userName, siswaClass, currentDayName]);

  const presensiStatus = presensiToday?.status ? String(presensiToday.status).toUpperCase() : null;
  const statusText = presensiStatus
    ? `Presensi Hari Ini: ${presensiStatus}`
    : "Presensi Hari Ini: BELUM ABSEN";
  const statusVariant: "success" | "warning" | "info" | "neutral" = presensiStatus === "HADIR"
    ? "success"
    : presensiStatus === "SAKIT" || presensiStatus === "IZIN"
    ? "info"
    : presensiStatus === "ALPA"
    ? "warning"
    : "warning";

  const submittedTaskIds = new Set(mySubmissions.map((s: any) => String(s.assignment_id)));
  const pendingTasks = myTugasList.filter((t: any) => !submittedTaskIds.has(String(t.id)));

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200 font-sans">
      <StudentHeaderBanner
        title={`Ruang Belajar — ${userName}`}
        subtitle={`Portal akademik siswa MTsN 2 Cilacap • ${currentDayName}, ${formattedTime}`}
        icon={GraduationCap}
        studentNisn={siswaNisn}
        statusText={statusText}
        statusVariant={statusVariant}
      />

      {/* Real-Time Alert: KBM Live Session in Student's Class */}
      {liveSession && (
        <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20 shadow-xs">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center shrink-0 shadow-2xs animate-pulse">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 animate-pulse">
                    ● SESI KBM LIVE SEDANG AKTIF
                  </Badge>
                  <span className="text-xs font-semibold text-muted-foreground">{siswaClass}</span>
                </div>
                <h3 className="text-sm font-bold text-foreground tracking-tight">
                  {liveSession.guru_name || "Guru Pengampu"} sedang mengajar {liveSession.mapel}
                </h3>
              </div>
            </div>
            <Button
              size="sm"
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shrink-0 shadow-2xs px-3"
              onClick={() => setActiveTab?.("tugas")}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Buka LKPD / Tugas</span>
              <span className="sm:hidden">Buka KBM</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Horizontal Compact Metric Strip (~42px) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${presensiStatus === "HADIR" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Kehadiran Presensi</p>
              <span className="text-[10px] text-muted-foreground font-mono">{siswaClass}</span>
            </div>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
              {presensiStatus || "BELUM ABSEN"}
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-blue-500/50 transition-colors"
          onClick={() => setActiveTab?.("tugas")}
        >
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <BookOpen className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Tugas & LKPD Digital</p>
              <span className="text-[10px] text-blue-600 font-semibold">Buka →</span>
            </div>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5 truncate">
              {pendingTasks.length} Belum Dikumpulkan <span className="text-xs font-normal text-muted-foreground">({myTugasList.length} Total)</span>
            </p>
          </div>
        </div>

        <div
          className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-amber-500/50 transition-colors"
          onClick={() => setActiveTab?.("profil")}
        >
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Status Akademik</p>
              <span className="text-[10px] text-amber-600 font-semibold">Profil →</span>
            </div>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">
              Siswa Aktif <span className="text-xs font-normal text-muted-foreground">({siswaClass})</span>
            </p>
          </div>
        </div>
      </div>

      {/* To-Do List: Tasks & LKPD Pending Submission */}
      <Card className="border-border shadow-xs">
        <CardHeader className="p-3 sm:p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="h-4 w-4 text-blue-600 shrink-0" />
            <CardTitle className="text-xs sm:text-sm font-bold">
              Tugas & LKPD Perlu Dikerjakan
            </CardTitle>
            {pendingTasks.length > 0 ? (
              <Badge className="bg-amber-600 text-white text-[10px] font-bold">
                {pendingTasks.length} Belum Dikumpulkan
              </Badge>
            ) : (
              <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                Semua Selesai
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-semibold text-blue-600 gap-1 self-end sm:self-center"
            onClick={() => setActiveTab?.("tugas")}
          >
            Lihat Semua Tugas <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {pendingTasks.length === 0 ? (
            <div className="p-5 text-center rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 flex flex-col items-center justify-center gap-1.5">
              <CheckCircle2 className="h-7 w-7 text-emerald-600" />
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Alhamdulillah! Semua Tugas & LKPD Kelas Anda Sudah Selesai
              </div>
              <div className="text-[11px] text-muted-foreground">
                Tidak ada tugas tertunggak untuk kelas {siswaClass}. Pantau terus jadwal KBM berikutnya.
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingTasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-600">
                        {task.mapel || task.subject || "Mata Pelajaran"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                        {task.type || "LKPD Digital"}
                      </Badge>
                      {task.teacher_name && task.teacher_name !== "Guru Pengampu" && (
                        <span className="text-[11px] text-muted-foreground">
                          • {task.teacher_name}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-foreground">
                      {task.title}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>Batas Pengumpulan: <strong className="text-foreground">{task.due_date || task.deadline || "Hari ini"}</strong></span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 self-start sm:self-center shrink-0 shadow-2xs"
                    onClick={() => setActiveTab?.("tugas")}
                  >
                    Kerjakan Sekarang <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-emerald-600" /> Jadwal Belajar {siswaClass} Hari Ini ({currentDayName})
          </CardTitle>
          <Button size="sm" variant="ghost" className="text-xs font-bold text-emerald-600 gap-1" onClick={() => setActiveTab?.("jadwal")}>
            Jadwal Lengkap <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {jadwalToday.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-4 text-center border border-dashed rounded-xl border-slate-200 dark:border-slate-800">
              Tidak ada jadwal mata pelajaran terdaftar untuk {siswaClass} pada hari {currentDayName}.
            </div>
          ) : (
            jadwalToday.map((j, idx) => {
              const displayJam = j.jam || j.jam_ke || `Jam ke-${idx + 1}`;
              const displayMapel = j.mapel || j.subject_name || "Mata Pelajaran";
              const displayGuru = j.guru || j.teacher_name || "Guru Pengampu";
              const displayRuang = j.rombel || j.ruang || siswaClass;

              return (
                <div
                  key={j.id || idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 hover:border-emerald-500/80 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  onClick={() => setActiveTab?.("asesmen")}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{displayJam}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                        {displayMapel}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> {displayGuru}
                        </span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" /> {displayRuang}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-emerald-600 text-white border border-emerald-500/30 text-[11px] font-bold self-start sm:self-center gap-1.5 shadow-2xs">
                    <BookOpen className="h-3.5 w-3.5" /> Buka Mapel / Tugas →
                  </Badge>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
