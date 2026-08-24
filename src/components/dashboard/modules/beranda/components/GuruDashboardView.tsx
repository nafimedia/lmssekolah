import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckSquare, LineChart, BookOpen, Bot, ArrowRight, PencilLine, ClipboardCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { getTeacherAssignedSubjects, isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { CardStatsSkeleton } from "@/components/dashboard/components/ModuleSkeleton";

interface GuruDashboardViewProps {
  userName: string;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function GuruDashboardView({ userName, currentDayName, formattedTime, setActiveTab }: GuruDashboardViewProps) {
  const [selectedJadwalModal, setSelectedJadwalModal] = useState<any>(null);
  const [selectedTugasModal, setSelectedTugasModal] = useState<any>(null);
  const [selectedCapaianModal, setSelectedCapaianModal] = useState<any>(null);

  const [jadwalHariIni, setJadwalHariIni] = useState<any[]>([]);
  const [tugasPerluDiperiksa, setTugasPerluDiperiksa] = useState<any[]>([]);
  const [journalCount, setJournalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const me = MysqlAuthService.getActiveUser();
  const assignedSubjects = getTeacherAssignedSubjects();
  const activeSubjectName = assignedSubjects && assignedSubjects.length > 0 ? assignedSubjects.join(", ") : "Mapel Pengampu";

  useEffect(() => {
    async function loadRealData() {
      setIsLoading(true);
      try {
        const currentUser = MysqlAuthService.getActiveUser();
        const [dbJadwal, dbLkpd, dbJournals] = await Promise.all([
          MysqlDataService.getJadwalList(),
          MysqlDataService.getLkpdActivities("ALL", "ALL"),
          MysqlDataService.getJournals(),
        ]);

        // 1. Filter schedule for active teacher
        const myNameLower = (currentUser?.full_name || userName || "").toLowerCase().trim();
        const myNip = (currentUser?.nis_nip || "").trim();

        const allTeacherSchedule = (dbJadwal || []).filter((j: any) => {
          const jGuruLower = (j.guru || j.teacher_name || "").toLowerCase().trim();
          const isMyName = jGuruLower.includes(myNameLower) || myNameLower.includes(jGuruLower);
          const isMyNip = myNip && jGuruLower.includes(myNip);
          const isMySubject = isSubjectAllowedForUser(j.mapel || j.subject_name || "");

          return isMyName || isMyNip || isMySubject;
        });

        const todayTeacherSchedule = allTeacherSchedule.filter((j: any) => {
          return (j.hari || "").toLowerCase().trim() === currentDayName.toLowerCase().trim();
        });

        setJadwalHariIni(todayTeacherSchedule.length > 0 ? todayTeacherSchedule : allTeacherSchedule);

        // 2. Filter LKPD activities for teacher assigned subjects
        const myLkpd = (dbLkpd || []).filter((act: any) => isSubjectAllowedForUser(act.mapel || act.subject || ""));
        setTugasPerluDiperiksa(myLkpd);

        // 3. Count journals completed by this teacher
        const myJournals = (dbJournals || []).filter((j: any) => {
          const jGuruLower = (j.guru_name || j.guru || "").toLowerCase().trim();
          return jGuruLower.includes(myNameLower) || myNameLower.includes(jGuruLower);
        });
        setJournalCount(myJournals.length);

      } catch (e) {
        console.warn("GuruDashboardView error loading data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRealData();
  }, [currentDayName, userName]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Guru Pengampu
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Selamat Datang, {userName} · Pengampu {activeSubjectName} · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ({formattedTime} WIB)
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
            onClick={() => setActiveTab?.("ruang_mengajar")}
          >
            <PencilLine className="h-4 w-4" /> Masuk Ruang Mengajar
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="font-bold text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
            onClick={() => setActiveTab?.("nilai")}
          >
            <ClipboardCheck className="h-4 w-4" /> Penilaian Kelas
          </Button>
        </div>
      </div>

      {isLoading ? (
        <CardStatsSkeleton count={3} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 hover:border-emerald-500/60 transition cursor-pointer"
            onClick={() => jadwalHariIni.length > 0 && setSelectedJadwalModal(jadwalHariIni[0])}
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                <span>Jadwal Mengajar Saya Hari Ini</span>
                <CalendarClock className="h-4 w-4" />
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {jadwalHariIni.length} Sesi KBM
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {jadwalHariIni.length > 0 ? `${jadwalHariIni.map((j: any) => j.rombel).join(" & ")} (${activeSubjectName})` : `Tidak ada jadwal KBM (${activeSubjectName})`}
              </div>
              <div>{jadwalHariIni.length > 0 ? `Sesi aktif: ${jadwalHariIni[0]?.jam || jadwalHariIni[0]?.jam_ke || "Sesuai Roster"}` : "Hari ini tidak ada jam mengajar terdaftar"}</div>
            </CardContent>
          </Card>

          <Card
            className="border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 hover:border-blue-500/60 transition cursor-pointer"
            onClick={() => tugasPerluDiperiksa.length > 0 && setSelectedTugasModal(tugasPerluDiperiksa[0])}
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>Tugas & LKPD Saya</span>
                <CheckSquare className="h-4 w-4" />
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {tugasPerluDiperiksa.length} Berkas
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {tugasPerluDiperiksa.length > 0 ? `${tugasPerluDiperiksa.length} Tugas LKPD Digital` : "Belum ada tugas pending"}
              </div>
              <div>{tugasPerluDiperiksa.length > 0 ? "Perlu penilaian & koreksi nilai harian" : "Semua tugas di mapel pengampu telah diperiksa"}</div>
            </CardContent>
          </Card>

          <Card
            className="border-purple-500/30 bg-purple-50/50 dark:bg-purple-950/20 hover:border-purple-500/60 transition cursor-pointer"
            onClick={() => setSelectedCapaianModal({ materi: activeSubjectName, journalCount })}
          >
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                <span>Jurnal Mengajar Terisi</span>
                <LineChart className="h-4 w-4" />
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {`${journalCount} Jurnal`}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div className="font-bold text-slate-800 dark:text-slate-200">{journalCount > 0 ? `${journalCount} Pertemuan KBM Tercatat` : "Belum ada jurnal terisi"}</div>
              <div>Tersimpan di database MySQL KBM</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-emerald-600" /> Agenda KBM & Jadwal Mengajar Hari Ini ({currentDayName})
              </CardTitle>
              <Button size="sm" variant="ghost" className="text-xs font-bold text-emerald-600 gap-1" onClick={() => setActiveTab?.("jadwal")}>
                Lihat Jadwal <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {jadwalHariIni.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div className="text-2xl">☕</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tidak ada jadwal mengajar terdaftar untuk Anda pada hari {currentDayName}.
                  </div>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Anda dapat menggunakan waktu ini untuk mengoreksi tugas LKPD, menginput nilai harian, atau membuat Perangkat Ajar PDF.
                  </p>
                </div>
              ) : (
                jadwalHariIni.map((j, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{j.mapel || j.subject_name || activeSubjectName} ({j.rombel})</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">⏰ {j.jam || j.jam_ke || "Jam ke-1 & 2"} · 📍 Ruang {j.ruang || j.room || j.rombel}</div>
                    </div>
                    <Badge className={j.status === "AKTIF" ? "bg-emerald-600 text-white font-bold text-xs" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs"}>
                      {j.status || "Terjadwal"}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs bg-slate-900 text-white">
            <CardHeader className="p-4 border-b border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-400" /> Asisten AI Guru MTsN 2
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">
                Butuh bantuan menyusun Modul Ajar PDF atau Bank Soal CBT? Asisten AI siap membantu secara instan!
              </p>
              <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5" onClick={() => setActiveTab?.("asisten_ai")}>
                ✨ Buka Asisten AI Pembelajaran
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedJadwalModal} onOpenChange={() => setSelectedJadwalModal(null)}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-emerald-600" /> Detail Sesi Mengajar
            </DialogTitle>
            <DialogDescription className="text-xs">
              Sesi: {selectedJadwalModal?.jam || selectedJadwalModal?.jam_ke || "Jam KBM"} · {selectedJadwalModal?.rombel}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 text-xs py-2">
            <div>Mata Pelajaran: <strong>{selectedJadwalModal?.mapel || selectedJadwalModal?.subject_name || activeSubjectName}</strong></div>
            <div>Ruang Kelas: <strong>{selectedJadwalModal?.ruang || selectedJadwalModal?.room || selectedJadwalModal?.rombel}</strong></div>
            <div>Status KBM: <strong className="text-emerald-600">{selectedJadwalModal?.status || "Terjadwal"}</strong></div>
          </div>
          <DialogFooter>
            <Button size="sm" onClick={() => setSelectedJadwalModal(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
