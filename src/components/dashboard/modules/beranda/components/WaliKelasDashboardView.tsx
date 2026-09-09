import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserCheck,
  AlertTriangle,
  Calendar,
  Clock,
  BookOpen,
  Send,
  Printer,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  BookMarked,
  Sparkles,
  School,
  CheckCircle2,
  PhoneCall,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { isSameClass, resolveWaliKelasRombel } from "@/utils/classNormalization";
import { toast } from "sonner";

interface WaliKelasDashboardViewProps {
  userName: string;
  currentDayName: string;
  formattedTime: string;
  setActiveTab?: (key: string) => void;
}

export function WaliKelasDashboardView({
  userName,
  currentDayName,
  formattedTime,
  setActiveTab,
}: WaliKelasDashboardViewProps) {
  const activeUser = MysqlAuthService.getActiveUser();

  // Clean Rombel name (e.g. "Kelas VIII A")
  const rombelName = useMemo(() => {
    return resolveWaliKelasRombel(activeUser || { full_name: userName }, null, "kelas");
  }, [userName, activeUser]);

  const [students, setStudents] = useState<any[]>([]);
  const [todayPresensi, setTodayPresensi] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [studentNotes, setStudentNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const [dbUsers, dbPresensi, dbJadwal, dbNotes] = await Promise.all([
        MysqlDataService.getUsers(),
        MysqlDataService.getKbmPresensi("ALL", "ALL", todayStr),
        MysqlDataService.getJadwalList(),
        MysqlDataService.getStudentKbmNotes("ALL", "ALL"),
      ]);

      // Filter real students for this rombel
      const classStudents = (dbUsers || []).filter((u: any) => {
        if (u.role !== "siswa") return false;
        return isSameClass(u.class_name || u.class, rombelName);
      });
      setStudents(classStudents);

      // Filter today presensi for this rombel
      const classPresensi = (dbPresensi || []).filter((p: any) => {
        return isSameClass(p.rombel, rombelName);
      });
      setTodayPresensi(classPresensi);

      // Filter today schedule for this rombel and day
      const classJadwal = (dbJadwal || []).filter((j: any) => {
        const matchDay = (j.hari || "").toLowerCase().trim() === currentDayName.toLowerCase().trim();
        return matchDay && isSameClass(j.rombel, rombelName);
      });
      setTodaySchedule(classJadwal);

      // Filter student notes for this rombel
      const classNotes = (dbNotes || []).filter((n: any) => {
        return isSameClass(n.rombel, rombelName);
      });
      setStudentNotes(classNotes);
    } catch (e) {
      console.warn("WaliKelasDashboardView loadRealData error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, [rombelName, currentDayName]);

  // Attendance Metrics
  const hadirCount = todayPresensi.filter((p) => p.status === "HADIR").length;
  const sakitCount = todayPresensi.filter((p) => p.status === "SAKIT").length;
  const izinCount = todayPresensi.filter((p) => p.status === "IZIN").length;
  const alpaCount = todayPresensi.filter((p) => p.status === "ALPA").length;
  const totalStudents = students.length;
  const hadirPercentage = totalStudents > 0 ? ((hadirCount / totalStudents) * 100).toFixed(1) : "0.0";

  const handleDirectWaReminder = (note: any) => {
    const matchedStudent = students.find((s) =>
      (s.full_name || "").toLowerCase().includes((note.student_name || "").toLowerCase()) ||
      (note.student_name || "").toLowerCase().includes((s.full_name || "").toLowerCase())
    );
    const phone = matchedStudent?.phone || "";
    if (!phone || phone === "-" || phone.trim().length < 8) {
      toast.error(`Nomor WhatsApp orang tua ananda ${note.student_name} belum terdata di sistem. Silakan lengkapi di tab Manajemen Kelas.`);
      return;
    }

    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    } else if (!cleanPhone.startsWith("62")) {
      cleanPhone = "62" + cleanPhone;
    }

    const message = `Assalamu'alaikum Wr. Wb. Yth. Bapak/Ibu Wali dari ananda ${note.student_name} (${rombelName}). Kami dari pihak Wali Kelas menyampaikan catatan KBM dari Guru Mapel ${note.mapel}: "${note.notes}". Mohon dapat menjadi perhatian dan motivasi belajar ananda bersama di rumah. Terima kasih. - MTsN 2 Cilacap`;

    MysqlDataService.saveWaLog({
      parent_name: matchedStudent?.parent_name || `Wali Siswa ${note.student_name}`,
      phone: cleanPhone,
      student_name: note.student_name,
      category: "REMINDER CATATAN SISWA",
      message,
      status: "TERKIRIM",
    }).catch(() => {});

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank");
    toast.success(`Membuka WhatsApp untuk menghubungi Orang Tua ${note.student_name}...`);
  };

  return (
    <div className="space-y-4 text-slate-800 dark:text-slate-200 font-sans">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Dashboard Wali Kelas <Badge className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5">{rombelName}</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoring presensi, agenda KBM, dan perkembangan belajar siswa binaan <span className="font-medium text-foreground">{rombelName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs gap-1.5 shadow-2xs px-3"
            onClick={() => setActiveTab && setActiveTab("kehadiran")}
          >
            <UserCheck className="h-3.5 w-3.5" /> Kelola Presensi Kelas
          </Button>
        </div>
      </div>

      {/* Horizontal Compact Metric Strip (~42px) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Siswa Binaan</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{totalStudents} Siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Hadir Hari Ini</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{hadirCount}/{totalStudents} <span className="text-[11px] text-emerald-600 font-mono">({hadirPercentage}%)</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Sakit / Izin</p>
            <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{sakitCount + izinCount} Siswa</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
          <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${alpaCount > 0 ? "bg-rose-500/15 text-rose-600" : "bg-emerald-500/15 text-emerald-600"}`}>
            <AlertTriangle className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground font-medium leading-none">Alpa Hari Ini</p>
            <p className={`text-sm font-bold leading-tight mt-0.5 ${alpaCount > 0 ? "text-rose-600 font-bold" : "text-emerald-600"}`}>{alpaCount} Siswa</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Schedule & Real-time KBM Today */}
        <div className="lg:col-span-2 space-y-6">
          {/* Schedule Today Card */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Jadwal KBM {rombelName} — {currentDayName}
                </CardTitle>
                <CardDescription className="text-xs">
                  Mata pelajaran dan alokasi guru pengampu di {rombelName} hari ini
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                onClick={() => setActiveTab && setActiveTab("jadwal")}
              >
                Lihat Semua <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {todaySchedule.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl bg-muted/20">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold text-muted-foreground">
                    Tidak ada jadwal KBM tatap muka untuk {rombelName} pada hari {currentDayName}.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {todaySchedule.map((item, idx) => {
                    const rawJam = String(item.jam || "").trim();
                    const matchNum = rawJam.match(/Jam\s*(\d+)/i) || rawJam.match(/^(\d+)/);
                    const jamNum = matchNum ? matchNum[1] : String(idx + 1);

                    const matchTime = rawJam.match(/\(([^)]+)\)/) || rawJam.match(/(\d{2}[.:]\d{2}\s*-\s*\d{2}[.:]\d{2})/);
                    const timeRange = matchTime ? matchTime[1].trim() : rawJam || "07.30 - 08.10";

                    return (
                      <div
                        key={item.id || idx}
                        className="p-3 rounded-xl bg-card border border-border flex items-center justify-between gap-3 shadow-2xs hover:border-emerald-500/50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex flex-col items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
                            <span className="text-[9px] font-semibold text-muted-foreground leading-none">Ke-</span>
                            <span className="text-sm font-bold font-mono leading-none">{jamNum}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-foreground">{item.mapel}</h4>
                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1.5 mt-0.5">
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{item.guru || "Guru Pengampu"}</span>
                            </p>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-xs font-mono font-bold bg-muted/40 border-border text-foreground px-2.5 py-1 flex items-center gap-1.5 shrink-0">
                          <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{timeRange}</span>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student KBM Notes & Behavior Alerts */}
          <Card className="border-border shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  Catatan Pembinaan & Sikap Siswa
                </CardTitle>
                <CardDescription className="text-xs">
                  Rekapitulasi catatan guru pengampu mengenai siswa di {rombelName}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {studentNotes.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-border rounded-xl bg-muted/20">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-muted-foreground">
                    Belum ada catatan pembinaan kedisiplinan di {rombelName}. Seluruh siswa terpantau kondusif.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {studentNotes.slice(0, 4).map((note, idx) => (
                    <div
                      key={note.id || idx}
                      className="p-3 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{note.student_name}</span>
                          <Badge variant="outline" className="text-[9px] font-semibold border-amber-400 text-amber-700">
                            {note.mapel}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{note.notes}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 shrink-0 gap-1"
                        onClick={() => handleDirectWaReminder(note)}
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> WA Ortus
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Quick Action Shortcuts for Homeroom Teacher */}
        <div className="space-y-6">
          <Card className="border-border shadow-xs bg-gradient-to-b from-card to-muted/20">
            <CardHeader className="p-4 pb-2 border-b border-border/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Pintasan Wali Kelas {rombelName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5">
              <Button
                variant="outline"
                className="w-full justify-start text-xs font-bold gap-2.5 h-10 border-border hover:border-emerald-500/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                onClick={() => setActiveTab && setActiveTab("kehadiran")}
              >
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>Rekap Presensi Rombel</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-bold gap-2.5 h-10 border-border hover:border-blue-500/60 hover:bg-blue-50/40 dark:hover:bg-blue-950/20"
                onClick={() => setActiveTab && setActiveTab("nilai")}
              >
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                <span>Laporan Rapor & Nilai Rombel</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-bold gap-2.5 h-10 border-border hover:border-amber-500/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/20"
                onClick={() => setActiveTab && setActiveTab("progress")}
              >
                <TrendingUp className="h-4 w-4 text-amber-600" />
                <span>Progress Capain Pembelajaran</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-bold gap-2.5 h-10 border-border hover:border-emerald-500/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20"
                onClick={() => setActiveTab && setActiveTab("tahfidz")}
              >
                <BookMarked className="h-4 w-4 text-emerald-600" />
                <span>Setoran Tahfidz Rombel</span>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start text-xs font-bold gap-2.5 h-10 border-border hover:border-purple-500/60 hover:bg-purple-50/40 dark:hover:bg-purple-950/20"
                onClick={() => setActiveTab && setActiveTab("pengumuman")}
              >
                <Send className="h-4 w-4 text-purple-600" />
                <span>Kirim Pengumuman Kelas</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
