import { useState, useEffect } from "react";
import { Play, CheckCircle2, Clock, Calendar, DoorOpen, Sparkles, XCircle } from "lucide-react";
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
  onProgressChange?: (progress: { isPresensiDone: boolean; isJurnalDone: boolean; presensiCountStr: string }) => void;
}

export function KbmHeaderBanner({ activeRombel, activeMapel, activeTab, onSelectTab, onStartSession, onProgressChange }: KbmHeaderBannerProps) {
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
      const presDone = Boolean(presRows && presRows.length > 0);
      setIsPresensiDone(presDone);
      let countStr = "Isi Kehadiran";
      if (presRows && presRows.length > 0) {
        const hadirCount = presRows.filter((r: any) => r.status === "HADIR").length;
        countStr = `${hadirCount}/${presRows.length} Hadir`;
      }
      setPresensiCountStr(countStr);

      const jurDone = Boolean(
        journals &&
          journals.length > 0 &&
          journals.some(
            (j: any) =>
              isSameClass(j.rombel || "", activeRombel) &&
              (j.mapel?.toLowerCase() === activeMapel.toLowerCase() || j.topic || j.materi)
          )
      );
      setIsJurnalDone(jurDone);

      onProgressChange?.({
        isPresensiDone: presDone,
        isJurnalDone: jurDone,
        presensiCountStr: countStr,
      });
    });

    return () => {
      isMounted = false;
    };
  }, [activeRombel, activeMapel, todayStr]);

  const handleToggleSession = async () => {
    const me = MysqlAuthService.getActiveUser();
    const cleanRombel = activeRombel.trim();
    const cleanMapel = activeMapel.trim();
    const sessionId = `sess_${cleanRombel.replace(/\s+/g, "_")}_${cleanMapel.replace(/\s+/g, "_")}`;

    const isAdminRole = me?.role === "admin" || me?.role === "superadmin" || me?.role === "admin_akademik" || me?.role === "kamad" || me?.role === "waka";
    const guruName = !isAdminRole && me?.full_name ? me.full_name : "Guru Pengampu";

    if (!isSessionLive && !sessionCompleted) {
      setIsSessionLive(true);
      toast.success(`🟢 Sesi KBM ${activeRombel} (${activeMapel}) RESMI DIMULAI! Selamat mengajar!`);
      await MysqlDataService.saveActiveKbmSession({
        id: sessionId,
        rombel: cleanRombel,
        mapel: cleanMapel,
        guru_name: guruName,
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
        guru_name: guruName,
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
        guru_name: guruName,
        status: "SEDANG_BERLANGSUNG",
        date_str: todayStr,
      });
    }
  };

  const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const currentDayName = dayNames[new Date().getDay()];
  const formattedTodayDate = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Card className={`border transition-all shadow-sm ${
      isSessionLive
        ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
        : sessionCompleted
        ? "border-blue-500/50 bg-blue-50/30 dark:bg-blue-950/20"
        : isScheduledToday
        ? "border-border bg-card"
        : "border-slate-300 dark:border-slate-800 bg-slate-500/5"
    }`}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`font-semibold text-xs px-2.5 py-0.5 gap-1.5 ${
                isSessionLive
                  ? "bg-emerald-600 text-white animate-pulse"
                  : sessionCompleted
                  ? "bg-blue-600 text-white"
                  : isScheduledToday
                  ? "bg-amber-600 text-white"
                  : "bg-slate-500 text-white"
              }`}>
                {isSessionLive && <><Sparkles className="h-3 w-3" /> SESI KBM BERLANGSUNG (LIVE)</>}
                {sessionCompleted && <><CheckCircle2 className="h-3 w-3" /> SESI KBM SELESAI</>}
                {!isSessionLive && !sessionCompleted && isScheduledToday && <><Clock className="h-3 w-3" /> KBM SIAP DIMULAI</>}
                {!isSessionLive && !sessionCompleted && !isScheduledToday && <><XCircle className="h-3 w-3" /> TIDAK ADA JADWAL HARI INI ({currentDayName})</>}
              </Badge>

              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 font-mono">
                <Calendar className="h-3.5 w-3.5 text-primary" /> {currentDayName}, {formattedTodayDate}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
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
            className={`font-semibold text-xs gap-2 px-5 py-2.5 shadow-sm transition-all shrink-0 ${
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
                <CheckCircle2 className="h-4 w-4" /> Selesaikan Sesi KBM
              </>
            ) : sessionCompleted ? (
              <>
                <Sparkles className="h-4 w-4" /> Buka Sesi KBM Kembali
              </>
            ) : (
              <>
                <Play className="h-4 w-4 fill-current" /> Mulai Sesi Mengajar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
