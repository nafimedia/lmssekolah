import { useState, useEffect } from "react";
import { Play, CheckCircle2, Clock, Calendar, Users, DoorOpen, Sparkles, CheckSquare, Square, XCircle, BookOpen, Video, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { isSameClass } from "@/utils/classNormalization";

interface KbmHeaderBannerProps {
  activeRombel: string;
  activeMapel: string;
  activeTab?: string;
  onSelectTab?: (tab: "jurnal" | "presensi" | "materi" | "aktivitas" | "catatan_siswa" | "riwayat") => void;
  onStartSession?: () => void;
}

export function KbmHeaderBanner({ activeRombel, activeMapel, activeTab, onSelectTab, onStartSession }: KbmHeaderBannerProps) {
  const [isSessionLive, setIsSessionLive] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const [isPresensiDone, setIsPresensiDone] = useState(false);
  const [isJurnalDone, setIsJurnalDone] = useState(false);
  const [isMateriDone, setIsMateriDone] = useState(true);
  const [presensiCountStr, setPresensiCountStr] = useState("0 Siswa");

  const [isScheduledToday, setIsScheduledToday] = useState(true);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let isMounted = true;
    const me = MysqlAuthService.getActiveUser();
    const myNip = (me?.nis_nip || "").trim();

    const cleanName = (name: string) =>
      name
        .toLowerCase()
        .replace(/\b(s\.pd|m\.pd|s\.ag|m\.pd\.i|s\.p|h\.|hj\.|s\.pd\.i|m\.si|drs|dra|st|kom)\b/gi, "")
        .replace(/[^a-z0-9\s]/gi, " ")
        .replace(/\s+/g, " ")
        .trim();

    const myCleanName = cleanName(me?.full_name || "");

    const isTeacherMatch = (targetGuruRaw: string) => {
      const raw = (targetGuruRaw || "").trim();
      if (!raw) return false;
      if (myNip && raw.includes(myNip)) return true;
      const cleanTarget = cleanName(raw);
      if (!cleanTarget || !myCleanName) return false;
      if (cleanTarget === myCleanName) return true;
      if (myCleanName.length >= 5 && cleanTarget.includes(myCleanName)) return true;
      if (cleanTarget.length >= 5 && myCleanName.includes(cleanTarget)) return true;
      return false;
    };

    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const activeDay = dayNames[new Date().getDay()];

    Promise.all([
      MysqlDataService.getActiveKbmSessions(),
      MysqlDataService.getJadwalPelajaran(),
    ]).then(([sessions, schedules]) => {
      if (!isMounted) return;
      if (sessions) {
        const cleanRombel = activeRombel.trim();
        const matched = sessions.find(
          (s: any) => isSameClass(s.rombel || "", cleanRombel) && s.mapel?.toLowerCase() === activeMapel.trim().toLowerCase()
        );
        if (matched) {
          if (matched.status === "SEDANG_BERLANGSUNG") {
            setIsSessionLive(true);
            setSessionCompleted(false);
          } else if (matched.status === "SELESAI") {
            setIsSessionLive(false);
            setSessionCompleted(true);
          }
        } else {
          setIsSessionLive(false);
          setSessionCompleted(false);
        }
      }

      if (schedules && schedules.length > 0) {
        const hasSched = schedules.some((j: any) => {
          const isDayMatch = (j.hari || "").toLowerCase().trim() === activeDay.toLowerCase().trim();
          const isRombelMatch = isSameClass(j.rombel || j.kelas || "", activeRombel.trim());
          const isMapelMatch = (j.mapel || "").toLowerCase().trim() === activeMapel.trim().toLowerCase();
          const isGuruMatch = isTeacherMatch(j.guru || j.teacher_name || "");
          return isDayMatch && isRombelMatch && isMapelMatch && isGuruMatch;
        });
        setIsScheduledToday(hasSched);
      } else {
        setIsScheduledToday(true);
      }
    });

    Promise.all([
      MysqlDataService.getKbmPresensi(activeRombel, activeMapel, todayStr),
      MysqlDataService.getJournals(),
    ]).then(([presRows, journals]) => {
      if (!isMounted) return;

      if (presRows && presRows.length > 0) {
        setIsPresensiDone(true);
        const hadirCount = presRows.filter((r: any) => r.status === "HADIR").length;
        setPresensiCountStr(`${hadirCount}/${presRows.length} Hadir`);
      } else {
        setIsPresensiDone(false);
        setPresensiCountStr("Isi Kehadiran");
      }

      if (journals && journals.length > 0) {
        const hasJournalToday = journals.some(
          (j: any) =>
            isSameClass(j.rombel || "", activeRombel) &&
            (j.mapel?.toLowerCase() === activeMapel.toLowerCase() || j.topic || j.materi)
        );
        setIsJurnalDone(hasJournalToday);
      } else {
        setIsJurnalDone(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [activeRombel, activeMapel, todayStr]);

  const completedStepsCount = (isPresensiDone ? 1 : 0) + (isMateriDone ? 1 : 0) + (isJurnalDone ? 1 : 0);
  const progressPct = Math.round((completedStepsCount / 3) * 100);

  const handleToggleSession = async () => {
    const me = MysqlAuthService.getActiveUser();
    const cleanRombel = activeRombel.trim();
    const cleanMapel = activeMapel.trim();
    const sessionId = `sess_${cleanRombel.replace(/\s+/g, "_")}_${cleanMapel.replace(/\s+/g, "_")}`;

    if (!isSessionLive && !sessionCompleted) {
      setIsSessionLive(true);
      toast.success(`🟢 Sesi KBM ${activeRombel} (${activeMapel}) RESMI DIMULAI! Selamat mengajar!`);
      await MysqlDataService.saveActiveKbmSession({
        id: sessionId,
        rombel: cleanRombel,
        mapel: cleanMapel,
        guru_name: me?.full_name || "Guru Pengampu",
        status: "SEDANG_BERLANGSUNG",
        date_str: todayStr,
      });
    } else if (isSessionLive) {
      setIsSessionLive(false);
      setSessionCompleted(true);
      toast.success(`🏁 Sesi KBM ${activeRombel} (${activeMapel}) RESMI DISELESAIKAN! Rekap KBM tersimpan.`);
      await MysqlDataService.saveActiveKbmSession({
        id: sessionId,
        rombel: cleanRombel,
        mapel: cleanMapel,
        guru_name: me?.full_name || "Guru Pengampu",
        status: "SELESAI",
        date_str: todayStr,
      });
    } else {
      setSessionCompleted(false);
      setIsSessionLive(true);
      toast.info(`Sesi KBM ${activeRombel} dibuka kembali.`);
      await MysqlDataService.saveActiveKbmSession({
        id: sessionId,
        rombel: cleanRombel,
        mapel: cleanMapel,
        guru_name: me?.full_name || "Guru Pengampu",
        status: "SEDANG_BERLANGSUNG",
        date_str: todayStr,
      });
    }
  };

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDayName = dayNames[new Date().getDay()];
  const formattedTodayDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Card className={`border-2 transition-all shadow-md ${
      isSessionLive
        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
        : sessionCompleted
        ? "border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20"
        : isScheduledToday
        ? "border-primary/40 bg-card"
        : "border-slate-300 dark:border-slate-800 bg-slate-500/5"
    }`}>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`font-extrabold text-xs px-3 py-1 gap-1.5 ${
                isSessionLive
                  ? "bg-emerald-600 text-white animate-pulse"
                  : sessionCompleted
                  ? "bg-blue-600 text-white"
                  : isScheduledToday
                  ? "bg-amber-600 text-white"
                  : "bg-slate-500 text-white"
              }`}>
                {isSessionLive && <><Sparkles className="h-3.5 w-3.5" /> SESI KBM BERLANGSUNG (LIVE)</>}
                {sessionCompleted && <><CheckCircle2 className="h-3.5 w-3.5" /> SESI KBM SELESAI</>}
                {!isSessionLive && !sessionCompleted && isScheduledToday && <><Clock className="h-3.5 w-3.5" /> KBM SIAP DIMULAI</>}
                {!isSessionLive && !sessionCompleted && !isScheduledToday && <><XCircle className="h-3.5 w-3.5" /> TIDAK ADA JADWAL HARI INI ({currentDayName})</>}
              </Badge>

              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 font-mono">
                <Calendar className="h-3.5 w-3.5 text-primary" /> {currentDayName}, {formattedTodayDate} · Jam KBM Aktif
              </span>
            </div>

            <h2 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
              <DoorOpen className="h-5 w-5 text-primary" /> {activeRombel} — {activeMapel}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {isScheduledToday
                ? "30 Siswa Terdaftar · Sesi KBM Tatap Muka Resmi · Kurikulum Merdeka MTsN 2 Cilacap"
                : `Mata pelajaran ${activeMapel} (${activeRombel}) tidak memiliki jadwal KBM terdaftar pada hari ${currentDayName} ini.`}
            </p>
          </div>

          <Button
            size="lg"
            className={`font-black text-xs gap-2 px-6 py-3 shadow-md transition-all ${
              isSessionLive
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : sessionCompleted
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
            onClick={handleToggleSession}
          >
            {isSessionLive ? (
              <>
                <CheckCircle2 className="h-5 w-5" /> Selesaikan Sesi KBM
              </>
            ) : sessionCompleted ? (
              <>
                <Sparkles className="h-5 w-5" /> Buka Sesi KBM Kembali
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" /> Mulai Sesi Mengajar Harian
              </>
            )}
          </Button>
        </div>

        {/* Guided 3-Step Workflow Bar with Interactive Checkboxes */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> Alur Terpandu Sesi KBM Harian (Ceklis Progres):
            </span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {completedStepsCount}/3 Langkah Selesai ({progressPct}%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* STEP 1: PRESENSI SISWA */}
            <button
              type="button"
              onClick={() => onSelectTab?.("presensi")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeTab === "presensi"
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/30"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 font-bold transition-all ${
                  isPresensiDone ? "bg-emerald-600 text-white shadow-xs" : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {isPresensiDone ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </div>
                <div>
                  <span className="font-bold text-xs block text-foreground">Langkah 1: Presensi Siswa</span>
                  <span className="text-[10px] text-muted-foreground font-medium">{presensiCountStr}</span>
                </div>
              </div>
              <Badge className={`text-[9px] font-extrabold gap-1 ${
                isPresensiDone ? "bg-emerald-600 text-white" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
              }`}>
                {isPresensiDone ? "✓ Presensi Terisi" : "⏳ Isi Presensi"}
              </Badge>
            </button>

            {/* STEP 2: MATERI & LKPD */}
            <button
              type="button"
              onClick={() => onSelectTab?.("materi")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeTab === "materi" || activeTab === "aktivitas"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500/30"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 font-bold transition-all ${
                  isMateriDone ? "bg-blue-600 text-white shadow-xs" : "bg-muted text-muted-foreground border border-border"
                }`}>
                  {isMateriDone ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </div>
                <div>
                  <span className="font-bold text-xs block text-foreground">Langkah 2: Materi & LKPD</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Bahan ajar hari ini</span>
                </div>
              </div>
              <Badge className={`text-[9px] font-extrabold gap-1 ${
                isMateriDone ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {isMateriDone ? "✓ Materi Siap" : "⏳ Buka Bahan"}
              </Badge>
            </button>

            {/* STEP 3: JURNAL & REFLEKSI */}
            <button
              type="button"
              onClick={() => onSelectTab?.("jurnal")}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                activeTab === "jurnal"
                  ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xs ring-1 ring-amber-500/30"
                  : "border-border bg-background hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-lg grid place-items-center shrink-0 font-bold transition-all ${
                  isJurnalDone ? "bg-amber-600 text-white shadow-xs" : "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                }`}>
                  {isJurnalDone ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                </div>
                <div>
                  <span className="font-bold text-xs block text-foreground">Langkah 3: Jurnal & Refleksi</span>
                  <span className="text-[10px] text-muted-foreground font-medium">Simpan ringkasan KBM</span>
                </div>
              </div>
              <Badge className={`text-[9px] font-extrabold gap-1 ${
                isJurnalDone ? "bg-amber-600 text-white" : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30"
              }`}>
                {isJurnalDone ? "✓ Jurnal Terisi" : "⏳ Tulis Jurnal"}
              </Badge>
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
