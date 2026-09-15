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
import { normalizeRombelName } from "@/utils/classNormalization";
import { isSameTeacher } from "@/utils/teacherNameResolver";

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

        // Clean name normalization helper function
        const cleanName = (name: string) =>
          name
            .toLowerCase()
            .replace(/\b(s\.pd|m\.pd|s\.ag|m\.pd\.i|s\.p|h\.|hj\.|s\.pd\.i|m\.si|drs|dra|st|kom)\b/gi, "")
            .replace(/[^a-z0-9\s]/gi, " ")
            .replace(/\s+/g, " ")
            .trim();

        const myRawName = (currentUser?.full_name || userName || "").trim();
        const myCleanName = cleanName(myRawName);
        const myNip = (currentUser?.nis_nip || "").trim();

        const isTeacherMatch = (targetGuruRaw: string) => {
          const raw = (targetGuruRaw || "").trim();
          if (!raw) return false;
          if (myNip && raw.includes(myNip)) return true;
          if (isSameTeacher(raw, myRawName)) return true;

          const cleanTarget = cleanName(raw);
          if (!cleanTarget || !myCleanName) return false;

          if (cleanTarget === myCleanName) return true;
          if (myCleanName.length >= 5 && cleanTarget.includes(myCleanName)) return true;
          if (cleanTarget.length >= 5 && myCleanName.includes(cleanTarget)) return true;

          return false;
        };

        const allTeacherSchedule = (dbJadwal || []).filter((j: any) =>
          isTeacherMatch(j.guru || j.teacher_name || "")
        );

        const todayTeacherSchedule = allTeacherSchedule.filter((j: any) => {
          return (j.hari || "").toLowerCase().trim() === currentDayName.toLowerCase().trim();
        });

        setJadwalHariIni(todayTeacherSchedule);

        // 2. Filter LKPD activities for teacher assigned subjects
        const myLkpd = (dbLkpd || []).filter((act: any) => isSubjectAllowedForUser(act.mapel || act.subject || ""));
        setTugasPerluDiperiksa(myLkpd);

        // 3. Count journals completed by this teacher
        const myJournals = (dbJournals || []).filter((j: any) =>
          isTeacherMatch(j.guru_name || j.guru || "")
        );
        setJournalCount(myJournals.length);

      } catch (e) {
        console.warn("GuruDashboardView error loading data:", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadRealData();
  }, [currentDayName, userName]);

  const uniqueRombelsHariIni = Array.from(new Set(jadwalHariIni.map((j: any) => normalizeRombelName(j.rombel)).filter(Boolean)));
  const rombelsTextDisplay = uniqueRombelsHariIni.join(", ");
  const uniqueMapelsHariIni = Array.from(new Set(jadwalHariIni.map((j: any) => j.mapel).filter(Boolean)));
  const mapelsTextDisplay = uniqueMapelsHariIni.length > 0 ? uniqueMapelsHariIni.join(", ") : activeSubjectName;

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Dashboard Guru Pengampu
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Selamat Datang, <span className="font-medium text-foreground">{userName}</span> · Pengampu {activeSubjectName} · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ({formattedTime})
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            size="sm"
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shadow-2xs px-3"
            onClick={() => setActiveTab?.("ruang_mengajar")}
          >
            <PencilLine className="h-3.5 w-3.5" /> Masuk Ruang Mengajar
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 font-medium text-xs gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 px-3"
            onClick={() => setActiveTab?.("nilai")}
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Penilaian Kelas
          </Button>
        </div>
      </div>

      {isLoading ? (
        <CardStatsSkeleton count={3} />
      ) : (
        /* Horizontal Compact Metric Strip (~42px) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
          <div
            className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-emerald-500/50 transition-colors"
            onClick={() => jadwalHariIni.length > 0 && setSelectedJadwalModal(jadwalHariIni[0])}
          >
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CalendarClock className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Jadwal Mengajar Hari Ini</p>
                <span className="text-[10px] text-emerald-600 font-semibold font-mono">{currentDayName}</span>
              </div>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5 truncate">
                {jadwalHariIni.length} Sesi KBM <span className="text-xs font-normal text-muted-foreground">({rombelsTextDisplay || "Nihil"})</span>
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-blue-500/50 transition-colors"
            onClick={() => tugasPerluDiperiksa.length > 0 && setSelectedTugasModal(tugasPerluDiperiksa[0])}
          >
            <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <CheckSquare className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Tugas & LKPD</p>
                <span className="text-[10px] text-blue-600 font-semibold">Aktif</span>
              </div>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5 truncate">
                {tugasPerluDiperiksa.length} Berkas <span className="text-xs font-normal text-muted-foreground">(Perlu Dinilai)</span>
              </p>
            </div>
          </div>

          <div
            className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs cursor-pointer hover:border-purple-500/50 transition-colors"
            onClick={() => setSelectedCapaianModal({ materi: activeSubjectName, journalCount })}
          >
            <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <LineChart className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground font-medium leading-none">Jurnal Mengajar</p>
                <span className="text-[10px] text-purple-600 font-semibold">Tercatat</span>
              </div>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5 truncate">
                {journalCount} Jurnal Pertemuan
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
            <CardHeader className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-xs sm:text-sm font-bold flex items-center gap-2 min-w-0 truncate">
                <CalendarClock className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="truncate">Agenda KBM & Jadwal ({currentDayName})</span>
              </CardTitle>
              <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-600 gap-1 px-2 shrink-0 hover:bg-emerald-500/10" onClick={() => setActiveTab?.("jadwal")}>
                <span className="hidden sm:inline">Lihat Jadwal</span><span className="sm:hidden">Jadwal</span> <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 space-y-2.5">
              {jadwalHariIni.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                  <div className="text-2xl">☕</div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tidak ada jadwal mengajar terdaftar untuk Anda pada hari {currentDayName}.
                  </div>
                </div>
              ) : (
                jadwalHariIni.map((j, idx) => (
                  <div key={idx} className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">{j.mapel || j.subject_name || activeSubjectName} ({j.rombel})</div>
                      <div className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5 truncate">⏰ {j.jam || j.jam_ke || "Jam ke-1 & 2"} · 📍 Ruang {j.ruang || j.room || j.rombel}</div>
                    </div>
                    <Badge className={`shrink-0 ${j.status === "AKTIF" ? "bg-emerald-600 text-white font-bold text-[10px] sm:text-xs" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px] sm:text-xs"}`}>
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
                Butuh bantuan menyusun Bahan Ajar atau Bank Soal CBT? Asisten AI siap membantu secara instan!
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
