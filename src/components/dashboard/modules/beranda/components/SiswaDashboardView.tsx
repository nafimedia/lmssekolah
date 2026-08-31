import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trophy, BookOpen, CalendarClock, ArrowRight, CheckCircle2, UserCheck, Building2, Clock } from "lucide-react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";

import { isSameClass } from "@/utils/classNormalization";

interface SiswaDashboardViewProps {
  userName: string;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function SiswaDashboardView({ userName, currentDayName, formattedTime, setActiveTab }: SiswaDashboardViewProps) {
  const me = MysqlAuthService.getActiveUser();
  const siswaClass = me?.class_name || "Rombel 8A";
  const siswaNisn = me?.nis_nip || "";
  const [presensiToday, setPresensiToday] = useState<any>(null);
  const [myTugasList, setMyTugasList] = useState<any[]>([]);
  const [jadwalToday, setJadwalToday] = useState<any[]>([]);

  const [liveSession, setLiveSession] = useState<any | null>(null);

  useEffect(() => {
    async function loadSiswaRealData() {
      try {
        const currentUser = MysqlAuthService.getActiveUser();
        const currentClass = currentUser?.class_name || "Rombel 8A";
        const todayStr = new Date().toISOString().split("T")[0];
        const [dbPresensi, dbTugas, dbJadwal, dbSessions] = await Promise.all([
          MysqlDataService.getKbmPresensi("ALL", "ALL", todayStr),
          MysqlDataService.getLkpdActivities(currentClass, "ALL"),
          MysqlDataService.getJadwalList(),
          MysqlDataService.getActiveKbmSessions(),
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

  return (
    <div className="space-y-6">
      <StudentHeaderBanner
        title={`Ruang Belajar — ${userName}`}
        subtitle={`Portal akademik siswa MTsN 2 Cilacap • ${currentDayName}, ${formattedTime} WIB`}
        icon={GraduationCap}
        studentNisn={siswaNisn}
        statusText={statusText}
        statusVariant={statusVariant}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all"
          onClick={() => setActiveTab?.("kehadiran")}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Kehadiran Presensi Saya</span>
              <CheckCircle2 className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {presensiStatus || "BELUM ABSEN"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>{siswaClass} · Teratat di sistem presensi madrasah</span>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Lihat →</span>
          </CardContent>
        </Card>

        <Card
          className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all"
          onClick={() => setActiveTab?.("asesmen")}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
              <span>Tugas & LKPD Digital</span>
              <BookOpen className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>{myTugasList.length} Tugas</span>
              <Badge className="bg-blue-600 text-white text-[10px] font-bold">Buka Tugas</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>Tersedia untuk dikerjakan di {siswaClass}</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">Kerjakan →</span>
          </CardContent>
        </Card>

        <Card
          className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20 cursor-pointer hover:scale-[1.01] hover:shadow-md transition-all"
          onClick={() => setActiveTab?.("profil")}
        >
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Status Keaktifan Siswa</span>
              <Trophy className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Siswa Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
            <span>MTs Negeri 2 Cilacap</span>
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Profil →</span>
          </CardContent>
        </Card>
      </div>

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
                    <div className="h-9 px-3 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 whitespace-nowrap">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      <span>{displayJam}</span>
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        {displayMapel}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> {displayGuru}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <Building2 className="h-3.5 w-3.5 text-slate-400" /> {displayRuang}
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
