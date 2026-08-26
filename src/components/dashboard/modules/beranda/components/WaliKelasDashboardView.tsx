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
import { isSameClass } from "@/utils/classNormalization";
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

  // Clean Rombel name (e.g. "Kelas IX A")
  const rombelName = useMemo(() => {
    const cleanName = (userName || activeUser?.full_name || "").toLowerCase();
    const cleanNip = (activeUser?.nis_nip || "").trim();

    if (cleanName.includes("achmad makmun") || cleanNip.includes("272005011001")) return "Kelas VIII B";
    if (cleanName.includes("misbah") || cleanName.includes("maulidia")) return "Kelas VII A";
    if (cleanName.includes("endah") || cleanName.includes("rindang")) return "Kelas VII B";
    if (cleanName.includes("sobiyati")) return "Kelas VIII A";
    if (cleanName.includes("sobiyati")) return "Kelas IX A";
    if (cleanName.includes("sayono")) return "Kelas IX B";

    const rawRombel = activeUser?.class_name || "IX-A";
    const clean = rawRombel.toUpperCase().replace("-", " ").trim();
    if (clean.includes("7A") || clean.includes("VII A")) return "Kelas VII A";
    if (clean.includes("7B") || clean.includes("VII B")) return "Kelas VII B";
    if (clean.includes("8A") || clean.includes("VIII A")) return "Kelas VIII A";
    if (clean.includes("8B") || clean.includes("VIII B")) return "Kelas VIII B";
    if (clean.includes("9A") || clean.includes("IX A")) return "Kelas IX A";
    if (clean.includes("9B") || clean.includes("IX B")) return "Kelas IX B";
    return `Kelas ${rawRombel}`;
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

  return (
    <div className="space-y-6">
      {/* Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/50">
        <div>
          <h1 className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
            Dashboard Wali Kelas <Badge className="bg-emerald-600 text-white font-extrabold text-xs">{rombelName}</Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoring presensi, agenda KBM, dan perkembangan belajar siswa binaan {rombelName}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs"
            onClick={() => setActiveTab && setActiveTab("kehadiran")}
          >
            <UserCheck className="h-4 w-4" /> Kelola Presensi Kelas
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards - Presensi & Total Siswa Rombel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Total Siswa Binaan</span>
              <Users className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{totalStudents} <span className="text-xs font-medium text-muted-foreground">Siswa</span></p>
            <p className="text-[10px] text-muted-foreground font-medium">Terdaftar aktif di database {rombelName}</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">Hadir Hari Ini</span>
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{hadirCount} <span className="text-xs font-medium text-muted-foreground">/ {totalStudents} Siswa</span></p>
            <p className="text-[10px] text-emerald-600 font-bold font-mono">{hadirPercentage}% Tingkat Kehadiran</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Sakit / Izin</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{sakitCount + izinCount} <span className="text-xs font-medium text-muted-foreground">Siswa</span></p>
            <p className="text-[10px] text-muted-foreground">Sakit: {sakitCount} | Izin: {izinCount}</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 dark:text-red-400">Alpa (Perlu Perhatian)</span>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{alpaCount} <span className="text-xs font-medium text-muted-foreground">Siswa</span></p>
            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold">
              {alpaCount > 0 ? "⚠️ Memerlukan follow-up Wali Kelas" : "✅ Nihil Alpa Hari Ini"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs flex flex-col items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
                            <span className="text-[9px] font-bold text-muted-foreground leading-none">Ke-</span>
                            <span className="text-sm font-black font-mono leading-none">{jamNum}</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-extrabold text-foreground">{item.mapel}</h4>
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
                          <span className="font-extrabold text-foreground">{note.student_name}</span>
                          <Badge variant="outline" className="text-[9px] font-bold border-amber-400 text-amber-700">
                            {note.mapel}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{note.notes}</p>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-950 shrink-0 gap-1"
                        onClick={() => toast.success(`📱 Reminder terkirim ke Orang Tua ${note.student_name}`)}
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
