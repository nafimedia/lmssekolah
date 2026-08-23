import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Trophy, BookOpen, CalendarClock, ArrowRight, CheckCircle2 } from "lucide-react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";

interface SiswaDashboardViewProps {
  userName: string;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function SiswaDashboardView({ userName, currentDayName, formattedTime, setActiveTab }: SiswaDashboardViewProps) {
  const me = MysqlAuthService.getActiveUser();
  const siswaClass = me?.class_name || "Kelas VIII A";
  const [presensiToday, setPresensiToday] = useState<any>(null);
  const [myTugasList, setMyTugasList] = useState<any[]>([]);
  const [jadwalToday, setJadwalToday] = useState<any[]>([]);

  useEffect(() => {
    async function loadSiswaRealData() {
      try {
        const currentUser = MysqlAuthService.getActiveUser();
        const currentClass = currentUser?.class_name || "Kelas VIII A";
        const todayStr = new Date().toISOString().split("T")[0];
        const [dbPresensi, dbTugas, dbJadwal] = await Promise.all([
          MysqlDataService.getKbmPresensi(currentClass, "ALL", todayStr),
          MysqlDataService.getLkpdActivities(currentClass, "ALL"),
          MysqlDataService.getJadwalList(),
        ]);

        const myPres = (dbPresensi || []).find((p: any) => p.student_name === userName || p.student_nis === currentUser?.nis_nip);
        setPresensiToday(myPres);
        setMyTugasList(dbTugas || []);

        const classSchedule = (dbJadwal || []).filter((j: any) => {
          const matchDay = (j.hari || "").toLowerCase().trim() === currentDayName.toLowerCase().trim();
          const jCls = (j.rombel || "").toUpperCase().replace("-", " ").trim();
          const myCls = currentClass.toUpperCase().replace("-", " ").trim();
          return matchDay && (jCls.includes(myCls) || myCls.includes(jCls));
        });
        setJadwalToday(classSchedule);
      } catch (e) {
        console.warn("loadSiswaRealData error:", e);
      }
    }
    loadSiswaRealData();
  }, [userName, siswaClass, currentDayName]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" /> Ruang Belajar Siswa
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Selamat Belajar, {userName} · {siswaClass} · {currentDayName}, {formattedTime} WIB
          </p>
        </div>

        <Badge className={`font-extrabold text-xs px-3 py-1 self-start sm:self-auto ${
          presensiToday?.status === "HADIR"
            ? "bg-emerald-600 text-white"
            : presensiToday?.status
            ? "bg-amber-500 text-white"
            : "bg-muted text-muted-foreground"
        }`}>
          📍 Presensi Hari Ini: {presensiToday?.status || "BELUM TERISI"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
              <span>Kehadiran Presensi Saya</span>
              <CheckCircle2 className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {presensiToday?.status || "BELUM ABSEN"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400">
            {siswaClass} · Teratat di sistem presensi madrasah
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
              <span>Tugas & LKPD Digital</span>
              <BookOpen className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {myTugasList.length} Tugas
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400">
            Tersedia untuk dikerjakan di {siswaClass}
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center justify-between">
              <span>Status Keaktifan Siswa</span>
              <Trophy className="h-4 w-4" />
            </CardDescription>
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
              Siswa Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-slate-600 dark:text-slate-400">
            MTs Negeri 2 Cilacap
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
            <div className="text-xs text-slate-500 italic py-3 text-center">
              Tidak ada jadwal mata pelajaran terdaftar untuk {siswaClass} pada hari {currentDayName}.
            </div>
          ) : (
            jadwalToday.map((j, idx) => (
              <div key={j.id || idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs">
                    {j.jam_ke || "Jam KBM"} · {j.subject_name || j.mapel || "Mata Pelajaran"} ({j.teacher_name || j.guru || "Guru Pengampu"})
                  </div>
                  <div className="text-[11px] text-slate-500">Ruang {j.ruang || j.rombel || siswaClass}</div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px]">Tercatat</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
