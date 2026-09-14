import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Trophy,
  BookOpen,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  Building2,
  Clock,
  FileText,
  CalendarCheck,
  Medal,
} from "lucide-react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";
import { getDeadlineStatus } from "@/utils/deadlineHelper";

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
  const [myBadges, setMyBadges] = useState<any[]>([]);
  const [liveSession, setLiveSession] = useState<any | null>(null);

  const handleOpenRuangBelajar = (mapel?: string) => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", "ruangbelajar");
      if (mapel && mapel.trim()) {
        url.searchParams.set("mapel", mapel.trim());
      } else {
        url.searchParams.delete("mapel");
      }
      window.history.pushState({}, "", url.toString());
      window.dispatchEvent(new Event("popstate"));
    }
    setActiveTab?.("tugas");
  };

  useEffect(() => {
    async function loadSiswaRealData() {
      try {
        const currentUser = MysqlAuthService.getActiveUser();
        const currentClass = normalizeRombelName(currentUser?.class_name || "Kelas 8A");
        const todayStr = new Date().toISOString().split("T")[0];
        const [dbPresensi, dbTugas, dbJadwal, dbSessions, dbSubmissions, dbAwards, dbAchievements] = await Promise.all([
          MysqlDataService.getKbmPresensi("ALL", "ALL", todayStr),
          MysqlDataService.getLkpdActivities(currentClass, "ALL", true),
          MysqlDataService.getJadwalList(),
          MysqlDataService.getActiveKbmSessions(),
          MysqlDataService.getSubmissions(),
          MysqlDataService.getAwards().catch(() => []),
          MysqlDataService.getUserAchievements().catch(() => []),
        ]);

        // 1. Match Attendance
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

        // Strict filter: non-draft and matching student's class
        const validTugas = (dbTugas || []).filter((t: any) => {
          const isDraft = (t.status || "").toUpperCase() === "DRAF";
          const classMatches = !t.rombel || t.rombel === "ALL" || isSameClass(t.rombel, currentClass);
          return !isDraft && classMatches;
        });
        setMyTugasList(validTugas);

        // 2. Match Submissions
        const mySubs = (dbSubmissions || []).filter((s: any) => {
          const matchNis = s.student_nis && currentUser?.nis_nip && s.student_nis === currentUser.nis_nip;
          const matchName =
            s.student_name &&
            currentUser?.full_name &&
            s.student_name.toLowerCase().trim() === currentUser.full_name.toLowerCase().trim();
          return matchNis || matchName;
        });
        setMySubmissions(mySubs);

        // 3. Match Live KBM Session
        const liveSess = (dbSessions || []).find(
          (s: any) => s.status === "SEDANG_BERLANGSUNG" && isSameClass(s.rombel || "", currentClass)
        );
        setLiveSession(liveSess || null);

        // 4. Match Today's Schedule for Class
        const classSchedule = (dbJadwal || []).filter((j: any) => {
          const matchDay = (j.hari || "").toLowerCase().trim() === currentDayName.toLowerCase().trim();
          return matchDay && isSameClass(j.rombel || j.class_name, currentClass);
        });
        setJadwalToday(classSchedule);

        // 5. Match Awards & Achievements (Badges)
        const studentAwards = (dbAwards || [])
          .filter((a: any) => {
            const matchName =
              a.student_name &&
              currentUser?.full_name &&
              a.student_name.toLowerCase().trim() === currentUser.full_name.toLowerCase().trim();
            const matchNis = a.student_nis && currentUser?.nis_nip && a.student_nis === currentUser.nis_nip;
            const matchId = a.student_id && currentUser?.id && String(a.student_id) === String(currentUser.id);
            return matchName || matchNis || matchId;
          })
          .filter((a: any) => a.badge_category && !a.warning_category)
          .map((a: any) => ({
            title: a.badge_category,
            category: "Apresiasi Guru",
            subtitle: a.comment_text || "Lencana Resmi Madrasah",
            icon: "⭐",
          }));

        const studentAchievements = (dbAchievements || [])
          .filter((ach: any) => {
            const matchId = ach.user_id && currentUser?.id && String(ach.user_id) === String(currentUser.id);
            const matchName =
              ach.user_name &&
              currentUser?.full_name &&
              ach.user_name.toLowerCase().trim() === currentUser.full_name.toLowerCase().trim();
            return matchId || matchName;
          })
          .map((ach: any) => ({
            title: ach.title,
            category: ach.category || "Prestasi & Juara",
            subtitle: ach.issuer || "Penghargaan Madrasah",
            icon: "🏆",
          }));

        setMyBadges([...studentAwards, ...studentAchievements]);
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
        studentClass={siswaClass}
        studentNisn={siswaNisn}
      />

      {/* Real-Time Alert: KBM Live Session in Student's Class */}
      {liveSession && (
        <Card className="border-2 border-emerald-500 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/20 shadow-xs">
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white grid place-items-center shrink-0 shadow-2xs animate-pulse">
                <GraduationCap className="h-4 w-4" />
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
              onClick={() => handleOpenRuangBelajar(liveSession.mapel)}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Masuk Ruang Belajar</span>
              <span className="sm:hidden">Ruang Belajar</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 1. SEKSI KEHADIRAN (Presensi Hari Ini) */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="p-3 sm:p-4 border-b border-border/80 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${presensiStatus === "HADIR" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}>
              <CalendarCheck className="h-4 w-4" />
            </div>
            <CardTitle className="text-xs sm:text-sm font-bold truncate">
              1. Kehadiran Hari Ini ({currentDayName})
            </CardTitle>
          </div>
          <Badge
            className={`font-bold text-xs px-2.5 py-1 shrink-0 ${presensiStatus === "HADIR"
                ? "bg-emerald-600 text-white"
                : presensiStatus === "SAKIT" || presensiStatus === "IZIN"
                  ? "bg-blue-600 text-white"
                  : "bg-amber-500 text-slate-950 font-extrabold"
              }`}
          >
            {presensiStatus === "HADIR" ? "✔ HADIR" : presensiStatus || "BELUM ABSEN"}
          </Badge>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-muted/40 border border-border/70">
            <div className="space-y-1">
              <div className="text-xs font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 ${presensiStatus === "HADIR" ? "text-emerald-600" : "text-amber-500"}`} />
                <span>
                  {presensiStatus === "HADIR"
                    ? `Alhamdulillah, kehadiran Anda tercatat pada ${presensiToday?.time || presensiToday?.jam || formattedTime} WIB.`
                    : "Presensi kehadiran harian belum terkonfirmasi oleh guru pengampu di kelas."}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {presensiStatus === "HADIR"
                  ? `Kehadiran resmi tersimpan di sistem presensi madrasah untuk rombel ${siswaClass}.`
                  : ``}
              </p>
            </div>
            <div className="text-xs font-semibold text-muted-foreground shrink-0 flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span>{formattedTime} WIB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. SEKSI TUGAS DAN LKPD */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="p-3 sm:p-4 border-b border-border flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <CardTitle className="text-xs sm:text-sm font-bold whitespace-nowrap">
                2. Tugas dan LKPD
              </CardTitle>
              {myTugasList.length === 0 ? (
                <Badge variant="outline" className="text-muted-foreground border-border text-[10px] font-semibold bg-muted/40">
                  Belum Ada Tugas
                </Badge>
              ) : pendingTasks.length > 0 ? (
                <Badge className="bg-amber-600 text-white text-[10px] font-bold">
                  {pendingTasks.length} Belum Dikumpulkan
                </Badge>
              ) : (
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold">
                  Semua Selesai
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-semibold text-blue-600 gap-1 hover:bg-blue-500/10 shrink-0 px-2"
            onClick={() => setActiveTab?.("tugas")}
          >
            <span className="hidden sm:inline">Buka Modul</span><span className="sm:hidden">Buka</span> <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {myTugasList.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-1.5">
              <FileText className="h-7 w-7 text-muted-foreground/40" />
              <div className="text-xs font-bold text-foreground">
                Belum Ada Tugas / LKPD Aktif
              </div>
              <div className="text-[11px] text-muted-foreground max-w-sm">
                Guru pengampu belum menerbitkan tugas atau LKPD untuk rombel {siswaClass}.
              </div>
            </div>
          ) : pendingTasks.length === 0 ? (
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
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 sm:p-3.5 rounded-xl border border-border bg-card hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold border-blue-500/30 text-blue-600">
                        {task.mapel || task.subject || "Mata Pelajaran"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                        {task.type || "LKPD Digital"}
                      </Badge>
                      {task.teacher_name && task.teacher_name !== "Guru Pengampu" && (
                        <span className="text-[11px] text-muted-foreground truncate">
                          • {task.teacher_name}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-foreground truncate">
                      {task.title}
                    </div>
                    {(() => {
                      const dl = getDeadlineStatus(task.due_date || task.deadline, task.created_at);
                      return (
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
                          <span>Batas Pengumpulan:</span>
                          <span className={dl.textColor}>
                            {dl.isOverdue && <span className="font-bold mr-1">⚠️ Terlewat:</span>}
                            {dl.isToday && <span className="font-bold mr-1">⏳ Hari ini:</span>}
                            {dl.displayText}
                          </span>
                        </div>
                      );
                    })()}
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

      {/* 3. SEKSI JADWAL HARI INI */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="p-3 sm:p-4 border-b border-border flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0">
              <CalendarClock className="h-4 w-4" />
            </div>
            <CardTitle className="text-xs sm:text-sm font-bold truncate">
              3. Jadwal Hari Ini ({currentDayName})
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-bold text-emerald-600 gap-1 hover:bg-emerald-500/10 px-2 shrink-0"
            onClick={() => setActiveTab?.("jadwal")}
          >
            <span className="hidden sm:inline">Jadwal Lengkap</span><span className="sm:hidden">Lengkap</span> <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 space-y-2.5">
          {jadwalToday.length === 0 ? (
            <div className="text-xs text-muted-foreground italic py-6 text-center border border-dashed rounded-xl border-border bg-muted/10">
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
                  className="p-3 sm:p-3.5 rounded-xl border border-border bg-muted/20 hover:border-emerald-500/80 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all shadow-2xs space-y-2.5 group"
                  onClick={() => handleOpenRuangBelajar(displayMapel)}
                >
                  {/* Baris Atas: Jam KBM (Kiri) & Ruang / Kelas (Kanan) */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-7 px-2.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold text-xs inline-flex items-center gap-1.5 border border-emerald-500/30 shrink-0">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{displayJam}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold text-muted-foreground border-border bg-background/80 shrink-0 gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      <span>{displayRuang}</span>
                    </Badge>
                  </div>

                  {/* Baris Bawah: Mapel, Guru & Tombol Aksi */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-foreground truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {displayMapel}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                        <UserCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{displayGuru}</span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold self-start sm:self-center gap-1.5 shadow-2xs shrink-0 h-7 px-2.5 rounded-lg transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRuangBelajar(displayMapel);
                      }}
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Buka Ruang Belajar →
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* 4. SEKSI KOLEKSI LENCANA */}
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="p-3 sm:p-4 border-b border-border flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0">
              <Trophy className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xs sm:text-sm font-bold whitespace-nowrap">
                4. Koleksi Lencana & Prestasi
              </CardTitle>
              {myBadges.length > 0 && (
                <Badge className="bg-amber-500 text-slate-950 font-bold text-[10px]">
                  {myBadges.length} Lencana Aktif
                </Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs font-semibold text-amber-600 dark:text-amber-400 gap-1 hover:bg-amber-500/10 px-2 shrink-0"
            onClick={() => setActiveTab?.("profil")}
          >
            <span className="hidden sm:inline">Buka Portofolio</span><span className="sm:hidden">Portofolio</span> <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {myBadges.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center gap-1.5">
              <Medal className="h-7 w-7 text-muted-foreground/40" />
              <div className="text-xs font-bold text-foreground">
                Belum Ada Lencana Prestasi
              </div>
              <p className="text-[11px] text-muted-foreground max-w-sm">
                Lencana penghargaan dan apresiasi belajar dari guru akan ditampilkan di sini.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {myBadges.map((b, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition flex items-start gap-3 shadow-2xs"
                >
                  <div className="text-2xl shrink-0">{b.icon || "🏅"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className="text-[9px] font-bold border-amber-500/40 text-amber-600 dark:text-amber-400">
                        {b.category || "Prestasi"}
                      </Badge>
                      <Badge className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0">
                        Aktif
                      </Badge>
                    </div>
                    <div className="font-bold text-xs text-foreground truncate mt-1">{b.title}</div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{b.subtitle || "Terverifikasi Madrasah"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
