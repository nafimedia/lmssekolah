import { useState, useEffect } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import {
  Users,
  Building2,
  BookOpen,
  Sparkles,
  UserCheck,
  LineChart,
  GraduationCap,
  MonitorCheck,
  ScrollText,
  CalendarClock,
  PencilLine,
  CalendarDays,
  Bot,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  CheckCircle2,
  Award,
  Bell,
  CheckSquare,
  Activity,
  FileCheck,
  MessageCircle,
  Database,
  Lock,
  Cpu,
  Server,
  FolderTree,
  FileSpreadsheet,
  BarChart3,
  Bookmark,
  Check,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRealtimeCalendar } from "@/hooks/useRealtimeCalendar";

interface BerandaModuleProps {
  activeRole: string;
  userProfile?: any;
  dbStats?: any;
  setActiveTab?: (key: string) => void;
}

export function BerandaModule({
  activeRole,
  userProfile,
  dbStats,
  setActiveTab,
}: BerandaModuleProps) {
  const {
    currentMonthName,
    currentYear,
    formattedTime,
    currentDayName,
  } = useRealtimeCalendar();

  const [liveStats, setLiveStats] = useState<any>(null);

  // Modals for Teacher Dashboard Interactive Details
  const [selectedJadwalModal, setSelectedJadwalModal] = useState<any>(null);
  const [selectedTugasModal, setSelectedTugasModal] = useState<any>(null);
  const [selectedCapaianModal, setSelectedCapaianModal] = useState<any>(null);

  useEffect(() => {
    MysqlDataService.getDatabaseStats().then((res) => setLiveStats(res));
  }, []);

  const activeUser = MysqlAuthService.getActiveUser();
  const userName = activeUser?.full_name || userProfile?.name || userProfile?.full_name || "SOBIYATI, S.Pd";

  const stats = {
    totalUsers: liveStats?.totalUsers || dbStats?.totalUsers || 159,
    siswaCount: liveStats?.siswaCount || dbStats?.siswaCount || 117,
    guruStafCount: liveStats?.guruStafCount || dbStats?.guruStafCount || 42,
    totalRombel: liveStats?.totalRombel || dbStats?.totalRombel || 27,
    totalMapel: liveStats?.totalMapel || dbStats?.totalMapel || 18,
    cbtExamsCount: liveStats?.cbtExamsCount || dbStats?.cbtExamsCount || 12,
  };

  const role = (activeRole || "").toLowerCase().trim();

  // =========================================================================
  // 1. DASHBOARD GURU PENGAMPU
  // =========================================================================
  if (role === "guru" || role === "teacher") {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard Guru Pengampu
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Selamat Datang, {userName} · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} ({formattedTime} WIB)
            </p>
          </div>

          <Button
            size="sm"
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 h-9 shrink-0 shadow-xs"
            onClick={() => setActiveTab?.("ruang_mengajar")}
          >
            <BookOpen className="h-4 w-4" /> Masuk Ruang Mengajar
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-400/50 transition cursor-pointer space-y-1.5"
            onClick={() => setActiveTab?.("jadwal")}
          >
            <div className="text-xs font-semibold text-slate-500">Jadwal Mengajar Hari Ini</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">2 Kelas</div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              Lihat rincian <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          <div
            className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 hover:border-amber-500/70 transition cursor-pointer space-y-1.5"
            onClick={() => setActiveTab?.("tugas")}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Tugas Belum Dinilai</span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">12 Submisi</div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              Koreksi sekarang <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          <div
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-400/50 transition cursor-pointer space-y-1.5"
            onClick={() => setActiveTab?.("agenda")}
          >
            <div className="text-xs font-semibold text-slate-500">Agenda Akademik</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">3 Event Dekat</div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              Lihat agenda <ArrowRight className="h-3 w-3" />
            </div>
          </div>

          <div
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-400/50 transition cursor-pointer space-y-1.5"
            onClick={() => setActiveTab?.("asisten_ai")}
          >
            <div className="text-xs font-semibold text-slate-500">Asisten AI Mengajar</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">6 Tools</div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              Buka AI Assistant <ArrowRight className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Operational Grid: Jadwal KBM + Urgent Tasks */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Jadwal Mengajar Hari Ini ({currentDayName})</h2>
              <button type="button" className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer" onClick={() => setActiveTab?.("jadwal")}>
                Lihat Semua →
              </button>
            </div>

            <div
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-600/60 transition cursor-pointer space-y-2"
              onClick={() => {
                setSelectedJadwalModal({
                  mapel: "Al Qur'an Hadis",
                  rombel: "Kelas VIII A",
                  jam: "07:30 - 09:00 WIB (Jam 1-2)",
                  ruang: "Ruang A.02",
                  materi: "Pertemuan 2 — Tajwid Mad Silah Qashirah",
                  statusSiswa: "26 Siswa Terdaftar (26 Hadir, 0 Alpa)",
                });
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">07:30 - 09:00 WIB · Jam 1-2</span>
                <span className="text-slate-400 font-mono text-[11px]">Ruang A.02</span>
              </div>
              <div className="font-extrabold text-base text-slate-900 dark:text-slate-100">Al Qur'an Hadis (Kelas VIII A)</div>
              <div className="text-xs text-slate-500">Materi: Pertemuan 2 — Tajwid Mad Silah Qashirah</div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-1 flex items-center gap-1">Lihat detail <ArrowRight className="h-3 w-3" /></div>
            </div>

            <div
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-600/60 transition cursor-pointer space-y-2"
              onClick={() => {
                setSelectedJadwalModal({
                  mapel: "Fikih",
                  rombel: "Kelas IX C",
                  jam: "10:15 - 11:45 WIB (Jam 5-6)",
                  ruang: "Ruang C.04",
                  materi: "Pertemuan 2 — Ketentuan & Syarat Sah Sembelihan Qurban",
                  statusSiswa: "31 Siswa Terdaftar (31 Hadir, 0 Alpa)",
                });
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-600 dark:text-slate-400">10:15 - 11:45 WIB · Jam 5-6</span>
                <span className="text-slate-400 font-mono text-[11px]">Ruang C.04</span>
              </div>
              <div className="font-extrabold text-base text-slate-900 dark:text-slate-100">Fikih (Kelas IX C)</div>
              <div className="text-xs text-slate-500">Materi: Pertemuan 2 — Ketentuan Qurban</div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-1 flex items-center gap-1">Lihat detail <ArrowRight className="h-3 w-3" /></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Hal yang Perlu Dikerjakan</h2>
              <button type="button" className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer" onClick={() => setActiveTab?.("tugas")}>
                Koreksi Tugas →
              </button>
            </div>

            <div
              className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 hover:border-amber-500/70 transition cursor-pointer space-y-2"
              onClick={() => {
                setSelectedTugasModal({
                  title: "LKPD Pertemuan 2: Resume Tajwid Mad Silah (VIII A)",
                  mapel: "Al Qur'an Hadis",
                  rombel: "VIII A",
                  deadline: "Hari ini, 23:59 WIB",
                  count: "26 / 26 Submisi Terkumpul",
                });
              }}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-700 dark:text-amber-400">⚠️ PERLU KOREKSI SEGERA</span>
                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">12 Submisi</span>
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">LKPD Pertemuan 2: Resume Tajwid Mad Silah (VIII A)</div>
              <div className="text-xs text-slate-500">Batas Pengumpulan: Hari ini, 23:59 WIB</div>
              <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 pt-1 flex items-center gap-1">Mulai koreksi <ArrowRight className="h-3 w-3" /></div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-slate-400/50 transition cursor-pointer space-y-2" onClick={() => setActiveTab?.("agenda")}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">AGENDA MADRASAH</span>
                <span className="text-xs font-mono text-slate-400">15-20 Ags 2026</span>
              </div>
              <div className="font-bold text-sm text-slate-900 dark:text-slate-100">CBT Ujian Tengah Semester (PTS) Ganjil</div>
              <div className="text-xs text-slate-500">Batas Pengunggahan Soal CBT: 10 Agustus 2026</div>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 pt-1 flex items-center gap-1">Lihat agenda <ArrowRight className="h-3 w-3" /></div>
            </div>
          </div>
        </div>

        {/* Supporting Info */}
        <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <LineChart className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Capaian Rombel Ajar Saya
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { mapel: "Al Qur'an Hadis", classCode: "Kelas VIII A", status: "16 Pertemuan", kkm: "95.2% KKM" },
                { mapel: "Al Qur'an Hadis", classCode: "Kelas VIII B", status: "15 Pertemuan", kkm: "92.0% KKM" },
                { mapel: "Fikih", classCode: "Kelas IX C", status: "18 Pertemuan", kkm: "97.5% KKM" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center hover:border-emerald-500/60 cursor-pointer transition"
                  onClick={() => setSelectedCapaianModal(item)}
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">{item.mapel}</div>
                    <div className="text-[11px] text-slate-500">{item.classCode} · {item.status}</div>
                  </div>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{item.kkm}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Agenda KBM Minggu Ini
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">Jumat, 21 Ags · Kuis Formatif Tajwid</div>
                <div className="text-slate-500">Evaluasi Mad Silah Qashirah Kelas VIII B.</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Bell className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Pengumuman Kurikulum
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">📌 Batas Upload Bank Soal CBT</div>
                <p className="text-slate-500 leading-relaxed">
                  Bank Soal CBT PTS Ganjil diserahkan paling lambat 10 Agustus 2026.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. DIALOG INTERAKTIF: DETAIL JADWAL KBM */}
        <Dialog open={!!selectedJadwalModal} onOpenChange={(o) => !o && setSelectedJadwalModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" /> Detail KBM & Rincian Pertemuan
              </DialogTitle>
              <DialogDescription className="text-xs">
                Informasi jadwal KBM, lokasi kelas, materi pembelajaran, dan presensi.
              </DialogDescription>
            </DialogHeader>

            {selectedJadwalModal && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px]">{selectedJadwalModal.rombel}</Badge>
                  <div className="font-bold text-base text-slate-900 dark:text-slate-100 mt-1">{selectedJadwalModal.mapel}</div>
                  <div className="text-slate-600 dark:text-slate-400 font-mono">🕒 {selectedJadwalModal.jam} · 🏫 {selectedJadwalModal.ruang}</div>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Pokok Bahasan Materi:</div>
                  <p className="p-2.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium">
                    {selectedJadwalModal.materi}
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Status Presensi Rombel:</div>
                  <div className="font-mono text-emerald-600 font-bold">{selectedJadwalModal.statusSiswa}</div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedJadwalModal(null)}>
                Tutup
              </Button>
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5"
                onClick={() => {
                  setSelectedJadwalModal(null);
                  setActiveTab?.("ruang_mengajar");
                  toast.success(`🚀 Masuk ke Ruang Mengajar: ${selectedJadwalModal?.mapel}`);
                }}
              >
                <BookOpen className="h-4 w-4" /> Masuk Ruang Mengajar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 2. DIALOG INTERAKTIF: DETAIL KOREKSI TUGAS */}
        <Dialog open={!!selectedTugasModal} onOpenChange={(o) => !o && setSelectedTugasModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
                <PencilLine className="h-5 w-5 text-amber-500" /> Detail & Rincian Submisi Tugas
              </DialogTitle>
              <DialogDescription className="text-xs">
                Informasi pengumpulan tugas LKPD dan penugasan siswa.
              </DialogDescription>
            </DialogHeader>

            {selectedTugasModal && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedTugasModal.title}</div>
                  <div className="text-amber-800 dark:text-amber-300 font-medium">📌 Batas: {selectedTugasModal.deadline}</div>
                  <div className="text-slate-600 dark:text-slate-400 font-mono font-bold pt-1">📊 {selectedTugasModal.count}</div>
                </div>

                <div className="space-y-1.5">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">Submisi Terbaru Masuk:</div>
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 flex justify-between">
                      <span>1. ALIYA QIARA ABDULLAH</span>
                      <Badge variant="outline" className="text-emerald-600 bg-emerald-50 text-[10px]">Terubah ke PDF (95)</Badge>
                    </div>
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 flex justify-between">
                      <span>2. CITRA FEBI HASIFA</span>
                      <Badge variant="outline" className="text-amber-600 bg-amber-50 text-[10px]">Perlu Koreksi</Badge>
                    </div>
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-900 flex justify-between">
                      <span>3. AQILAA AAMIRATUL YUMNA</span>
                      <Badge variant="outline" className="text-amber-600 bg-amber-50 text-[10px]">Perlu Koreksi</Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedTugasModal(null)}>
                Tutup
              </Button>
              <Button
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5"
                onClick={() => {
                  setSelectedTugasModal(null);
                  setActiveTab?.("tugas");
                  toast.success("📝 Buka Halaman Penilaian & Koreksi Tugas");
                }}
              >
                <PencilLine className="h-4 w-4" /> Buka Koreksi Tugas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 3. DIALOG INTERAKTIF: DETAIL CAPAIAN ROMBEL */}
        <Dialog open={!!selectedCapaianModal} onOpenChange={(o) => !o && setSelectedCapaianModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-emerald-600" /> Detail Capaian KKM Rombel
              </DialogTitle>
              <DialogDescription className="text-xs">
                Rincian persentase ketuntasan KKM dan pertemuan KBM rombel.
              </DialogDescription>
            </DialogHeader>

            {selectedCapaianModal && (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <div className="font-bold text-base text-slate-900 dark:text-slate-100">{selectedCapaianModal.mapel} ({selectedCapaianModal.classCode})</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-mono font-bold text-sm">🏆 Ketuntasan: {selectedCapaianModal.kkm}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">Rata-rata Formatif</div>
                    <div className="font-extrabold text-sm text-slate-900 dark:text-slate-100">88.5</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500">Rata-rata Sumatif</div>
                    <div className="font-extrabold text-sm text-emerald-600">92.0</div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedCapaianModal(null)}>
                Tutup
              </Button>
              <Button
                size="sm"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1.5"
                onClick={() => {
                  setSelectedCapaianModal(null);
                  setActiveTab?.("ruang_mengajar");
                  toast.success("📊 Buka Rekap E-Rapor Rombel");
                }}
              >
                <LineChart className="h-4 w-4" /> Buka Rekap E-Rapor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // =========================================================================
  // 2. DASHBOARD WALI KELAS (WITH STATISTICAL BAR / PROGRESS CHART)
  // =========================================================================
  if (role === "walikelas" || role === "wali_kelas") {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard Wali Kelas 8A
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pembinaan Rombongan Belajar 8A ({userName}) · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 h-9 shrink-0 shadow-xs" onClick={() => setActiveTab?.("kehadiran")}>
            <UserCheck className="h-4 w-4" /> Presensi Harian Pagi
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5 cursor-pointer" onClick={() => setActiveTab?.("kehadiran")}>
            <div className="text-xs font-semibold text-slate-500">Kehadiran Siswa 8A</div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">96.9%</div>
            <div className="text-xs font-semibold text-slate-500">31 dari 32 Siswa Hadir Hari Ini</div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 space-y-1.5 cursor-pointer" onClick={() => setActiveTab?.("kehadiran")}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Catatan Tidak Hadir</span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">1 Siswa Alpa</div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">Kirim WA Alert Ortu <Send className="h-3 w-3" /></div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5 cursor-pointer" onClick={() => setActiveTab?.("nilai")}>
            <div className="text-xs font-semibold text-slate-500">Progress E-Rapor 8A</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">32 Siswa</div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">Verifikasi Rapor →</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5 cursor-pointer" onClick={() => setActiveTab?.("tahfidz")}>
            <div className="text-xs font-semibold text-slate-500">Setoran Tahfidz 8A</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">28 Tuntas</div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">Buka Setoran →</div>
          </div>
        </div>

        {/* 📊 BAR CHART / STATISTIK KHUSUS WALI KELAS */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Analisis Statistik Kehadiran & Mutu Nilai Rombel 8A
            </h2>
            <span className="text-xs text-slate-400 font-mono">Bulan Agustus 2026</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            {/* Visual Bar 1: Rekapitulasi Presensi */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Komposisi Presensi Siswa 8A (639 Jam-Siswa)</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>🟢 Hadir Mengajar</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">96.9% (620)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "96.9%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>🔵 Izin Sakit</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">2.1% (13)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: "2.1%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>🔴 Alpa (Tanpa Ket.)</span>
                    <span className="font-bold text-rose-600">1.0% (6)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-rose-600 rounded-full" style={{ width: "1.0%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Bar 2: Distribusi Nilai Rapor */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Distribusi Predikat E-Rapor Kelas 8A (32 Siswa)</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Sangat Baik</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">56.2% (18 Siswa)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "56.2%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Baik</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">43.8% (14 Siswa)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: "43.8%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Columns Supporting Info */}
        <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Detail Alpa Siswa 8A
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Muhammad Rizky</div>
                  <div className="text-slate-500">Status: <strong className="text-rose-600">Alpa</strong></div>
                </div>
                <Button size="sm" variant="outline" className="text-[11px] h-7 font-bold border-amber-500/40 text-amber-700" onClick={() => toast.success("WA Alert Dikirim!")}>
                  WA Alert
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Agenda Paguyuban 8A
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">📌 Silaturahmi Orang Tua 8A</div>
                <p className="text-slate-500">Sabtu, 29 Agustus 2026 di Ruang B.01.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Progress Tahfidz 8A
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">28 Siswa Juz 30 Tuntas</span>
                <span className="font-mono font-bold text-emerald-700">87.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. DASHBOARD SISWA
  // =========================================================================
  if (role === "siswa" || role === "student") {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard Siswa (Kelas VIII A)
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Selamat Datang, {userProfile?.name || "ABIGAIL HASAN YUSUF PRAYOGA"} · MTsN 2 Cilacap ({currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })})
            </p>
          </div>
          <Badge variant="outline" className="border-emerald-600 text-emerald-800 dark:text-emerald-300 font-bold text-xs py-1.5 px-3">
            ✓ PRESENSI HARI INI: HADIR (Dicatat Wali Kelas)
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Persentase Kehadiran Saya</div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">95.2%</div>
            <div className="text-xs text-slate-400">Resmi Terdata di E-Rapor</div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("tugas")}>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">Tugas Belum Dikumpulkan</div>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">1 LKPD</div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">Kumpulkan tugas →</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("nilai")}>
            <div className="text-xs font-semibold text-slate-500">Nilai Rata-rata Saya</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">87.8 (Sangat Baik)</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Lihat rekap nilai →</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("tahfidz")}>
            <div className="text-xs font-semibold text-slate-500">Setoran Tahfidz Qur'an</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Juz 30 Tuntas</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Surah Abasa v.42</div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. DASHBOARD SUPERADMIN (WITH SYSTEM & USER STATISTICAL BARS)
  // =========================================================================
  if (role === "admin" || role === "superadmin") {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard Superadmin
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Infrastruktur Sistem, Hak Akses, Backup Database & Audit Log · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 h-9 shrink-0 shadow-xs" onClick={() => toast.success("Backup DB MySQL Ditrigger!")}>
            <Database className="h-4 w-4" /> Trigger Backup DB
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("users")}>
            <div className="text-xs font-semibold text-slate-500">Total Pengguna Terdaftar</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{stats.siswaCount} Siswa</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">{stats.guruStafCount} Guru · {stats.totalUsers} Total Akun MySQL</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Status Server & Database</div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">MySQL Online</div>
            <div className="text-xs text-slate-500 font-medium">Latensi 14ms · RAM 32%</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Pengguna Aktif Realtime</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">142 User</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">0 Security Threats</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Backup Otomatis DB</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">02:00 WIB</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">✓ Status Tuntas (42 MB)</div>
          </div>
        </div>

        {/* 📊 BAR CHART / STATISTIK KHUSUS SUPERADMIN */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Statistik Keaktifan Pengguna & Resource Usage System
            </h2>
            <span className="text-xs text-slate-400 font-mono">Live Monitoring</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            {/* Visual Bar 1: User Login Ratio per Role */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Rasio Keaktifan Login per Role (Hari Ini)</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Guru & Staf Pengampu ({stats.guruStafCount}/{stats.guruStafCount})</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">100% Active</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Siswa MTsN ({stats.siswaCount}/{stats.siswaCount})</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">100% Active</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600/80 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Wali Murid / Ortu (740/948)</span>
                    <span className="font-bold text-slate-500">78.0%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: "78.0%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Bar 2: System Health & Storage */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Kapasitas Memory & Storage Database MySQL</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>RAM Server Utilization</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">32% (3.2 GB / 10 GB)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "32%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Database MySQL Storage Size</span>
                    <span className="font-bold text-slate-600">0.4% (42 MB / 10 GB)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: "10%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Columns Supporting Info */}
        <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Log Keamanan Realtime
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">DB Sync SIAKAD</div>
                  <div className="text-slate-500">948 akun terverifikasi</div>
                </div>
                <span className="font-mono text-emerald-700 font-bold">✓ OK</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Resource Infrastructure
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Node Server Status</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">HEALTHY</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Hak Akses Role
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Role Permissions Master</span>
                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">SYNCED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // DASHBOARD EKSEKUTIF (KEPALA MADRASAH & WAKA KURIKULUM)
  // =========================================================================
  if (role === "waka" || role === "kamad" || role === "kepala" || role === "eksekutif") {
    const isWaka = role === "waka";
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        {/* Header Bar Eksekutif */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {isWaka ? "Dashboard Eksekutif Waka Kurikulum" : "Dashboard Eksekutif Kepala Madrasah"}
              </h1>
              <Badge className="bg-emerald-600 text-white font-mono text-[10px] font-bold">
                EXECUTIVE OVERVIEW
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Monitoring real-time ketercapaian Kurikulum Merdeka, verifikasi Modul Ajar, presensi KBM, & kinerja GTK MTsN 2 Cilacap.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 h-9 shadow-xs"
              onClick={() => setActiveTab?.("modul_ajar")}
            >
              <FileCheck className="h-4 w-4" /> Verifikasi Modul Ajar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 border-emerald-500/30 h-9"
              onClick={() => setActiveTab?.("nilai")}
            >
              <GraduationCap className="h-4 w-4" /> Laporan E-Rapor
            </Button>
          </div>
        </div>

        {/* 4 Metric Cards Ringkasan Eksekutif */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5 shadow-xs">
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Ketercapaian Kurikulum</span>
              <span className="text-base">📊</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">94.2%</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Target Semester Ganjil Tercapai</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5 shadow-xs cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab?.("modul_ajar")}>
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Modul Ajar Terverifikasi</span>
              <span className="text-base">📄</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">11 / 14 Mapel</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">78.5% Terverifikasi Waka</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5 shadow-xs cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab?.("kehadiran")}>
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Rata-Rata Presensi Siswa</span>
              <span className="text-base">👥</span>
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">96.8%</div>
            <div className="text-[11px] text-slate-500 font-medium">948 Siswa Aktif Terdaftar</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1.5 shadow-xs cursor-pointer hover:border-emerald-500/50 transition" onClick={() => setActiveTab?.("sdm_gtk")}>
            <div className="text-xs font-semibold text-slate-500 flex items-center justify-between">
              <span>Beban Kerja GTK (24JP)</span>
              <span className="text-base">🏆</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">54 / 54 Guru</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">100% Memenuhi TPG</div>
          </div>
        </div>

        {/* 2 Visual Progress Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart 1: Progress Verifikasi Perangkat Pembelajaran Per Rumpun Mapel */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Verifikasi Perangkat Pembelajaran per Rumpun Mapel
              </h2>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">Waka Audit</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Rumpun Keagamaan (Quran, Akidah, Fiqih, SKI, B. Arab)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">100% (5/5 Mapel)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Rumpun Umum (Matematika, IPA, B. Indo, B. Inggris, IPS, PKn, IT)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">85.7% (6/7 Mapel)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: "85.7%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Muatan Lokal & Pengembangan (B. Jawa, Tahfidz Qur'an)</span>
                  <span className="font-bold text-teal-600 dark:text-teal-400">90.0% (2/2 Mapel)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: "90%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Chart 2: Presensi Real-Time per Jenjang Kelas */}
          <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Presensi Real-Time Siswa per Jenjang (948 Siswa)
              </h2>
              <span className="text-xs text-slate-400 font-mono">Live Attendance</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Tingkat VII (9 Rombel - 318 Siswa)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">97.5% Hadir</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: "97.5%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Tingkat VIII (9 Rombel - 315 Siswa)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">96.2% Hadir</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: "96.2%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Tingkat IX (9 Rombel - 315 Siswa)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">96.7% Hadir</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full transition-all duration-500" style={{ width: "96.7%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Aksi Cepat Eksekutif (Quick Action Cards) */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Aksi Cepat Pengawasan Eksekutif
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500/50 transition cursor-pointer space-y-1.5"
              onClick={() => setActiveTab?.("perangkat_pembelajaran")}
            >
              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>📁 Perangkat Pembelajaran</span>
                <span>→</span>
              </div>
              <p className="text-slate-500">Kelola CP, ATP, Modul Ajar PDF 1-18 per Mapel.</p>
            </div>

            <div
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500/50 transition cursor-pointer space-y-1.5"
              onClick={() => setActiveTab?.("tahfidz_report")}
            >
              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>🎓 Laporan Tahfidz Qur'an</span>
                <span>→</span>
              </div>
              <p className="text-slate-500">Rekapitulasi capaian hafalan juz siswa madrasah.</p>
            </div>

            <div
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500/50 transition cursor-pointer space-y-1.5"
              onClick={() => setActiveTab?.("kokurikuler_report")}
            >
              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>🎯 Laporan Kokurikuler P5</span>
                <span>→</span>
              </div>
              <p className="text-slate-500">Monitoring proyek Profil Pelajar Pancasila Rahmatan lil 'Alamin.</p>
            </div>

            <div
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-emerald-500/50 transition cursor-pointer space-y-1.5"
              onClick={() => setActiveTab?.("cbt")}
            >
              <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                <span>💻 Monitoring CBT & Ujian</span>
                <span>→</span>
              </div>
              <p className="text-slate-500">Live monitoring sesi ujian online & anti-cheat CBT.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. DASHBOARD ADMIN AKADEMIK (WITH ROMBEL DISTRIBUTIONS BAR)
  // =========================================================================
  if (role === "admin_akademik" || role === "akademik") {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard Admin Akademik
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Master Data Rombel, Katalog Mapel, Ploting Jam KBM & NISN · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 h-9 shrink-0 shadow-xs" onClick={() => setActiveTab?.("siakad")}>
            <Building2 className="h-4 w-4" /> Kelola Akademik Madrasah
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("siakad")}>
            <div className="text-xs font-semibold text-slate-500">Master Rombel & Kelas</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">27 Rombel</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Tingkat VII, VIII, & IX</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("siakad")}>
            <div className="text-xs font-semibold text-slate-500">Katalog Mata Pelajaran</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">10 Mapel</div>
            <div className="text-xs text-slate-500 font-medium">Kurikulum Merdeka Kemenag</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Ploting Guru Pengampu</div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">54/54 Guru</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">100% Jam Terploting</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("agenda")}>
            <div className="text-xs font-semibold text-slate-500">Kalender Akademik TA</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">18 Pertemuan</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Ganjil 2026/2027</div>
          </div>
        </div>

        {/* 📊 BAR CHART / STATISTIK KHUSUS ADMIN AKADEMIK */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Analisis Distribusi Siswa & Kelengkapan Ploting KBM per Tingkat
            </h2>
            <span className="text-xs text-slate-400 font-mono">SIAKAD Sync</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            {/* Visual Bar 1: Distribusi Siswa per Tingkat */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Distribusi Siswa per Tingkat Rombel (948 Siswa)</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Tingkat VII (9 Rombel - A s/d I)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">33.5% (318 Siswa)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "33.5%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Tingkat VIII (9 Rombel - A s/d I)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">33.2% (315 Siswa)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600/90 rounded-full" style={{ width: "33.2%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Tingkat IX (9 Rombel - A s/d I)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">33.2% (315 Siswa)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600/90 rounded-full" style={{ width: "33.2%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Bar 2: Status Ploting & VervalPD */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Status Kelengkapan Ploting KBM & VervalPD NISN</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Ploting Guru Pengampu Mapel</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">100% (54/54 Guru)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Verifikasi NISN VervalPD Kemenag</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">100% (948/948 Siswa)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Columns Supporting Info */}
        <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FolderTree className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Verifikasi NISN Siswa
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">VervalPD Kemenag</div>
                  <div className="text-slate-500">948 NISN Terdaftar</div>
                </div>
                <span className="font-mono font-bold text-emerald-700">✓ 100% VALID</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Distribusi Rombel
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">27 Rombongan Belajar</div>
                <p className="text-slate-500">Tingkat VII (9), VIII (9), IX (9).</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Master Ruang Kelas
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Total Ruang Kelas</span>
                <span className="font-mono font-bold text-emerald-700">27 Ruang</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 6. DASHBOARD KEPALA MADRASAH (WITH TEACHER PRESENCE & MUTU KKM BARS)
  // =========================================================================
  if (role === "kamad" || role === "kepala_madrasah") {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Dashboard Kepala Madrasah
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Pengawasan Kinerja Kelembagaan, Pengesahan Jurnal & Mutu KBM · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 h-9 shrink-0 shadow-xs" onClick={() => toast.success("5 Jurnal Mengajar Disahkan!")}>
            <FileCheck className="h-4 w-4" /> Sahkan Semua Jurnal
          </Button>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("rekap_presensi")}>
            <div className="text-xs font-semibold text-slate-500">Kehadiran Guru Hari Ini</div>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">98.1%</div>
            <div className="text-xs text-emerald-700 font-semibold">53 / 54 Guru Hadir Mengajar</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Kehadiran Siswa Total</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">96.8%</div>
            <div className="text-xs text-slate-500 font-medium">918 dari 948 Siswa Hadir</div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 space-y-1 cursor-pointer" onClick={() => toast.info("Membuka 5 Jurnal Menunggu Pengesahan...")}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Persetujuan Jurnal Mengajar</span>
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">5 Jurnal</div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">Sahkan Jurnal sekarang →</div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
            <div className="text-xs font-semibold text-slate-500">Indeks Mutu KKM Madrasah</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">95.2%</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Tuntas KKM (≥75)</div>
          </div>
        </div>

        {/* 📊 BAR CHART / STATISTIK KHUSUS KEPALA MADRASAH */}
        <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Analisis Tren Disiplin Guru & Ketuntasan Mutu KKM Madrasah
            </h2>
            <span className="text-xs text-slate-400 font-mono">Eksekutif Rekap</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6 text-xs">
            {/* Visual Bar 1: Tren Presensi Guru per Bulan */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Tren Kehadiran Guru Mengajar (Target 95.0%)</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Agustus 2026 (Bulan Ini)</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">98.1% (53/54 Guru)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "98.1%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Juli 2026</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">97.8% (52/54 Guru)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600/90 rounded-full" style={{ width: "97.8%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Bar 2: Ketuntasan KKM per Rumpun Mapel */}
            <div className="space-y-2.5">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Indeks Mutu KKM per Rumpun Pelajaran</div>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Rumpun PAI & Bahasa Arab</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">96.5% Tuntas KKM</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: "96.5%" }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Rumpun MIPA & Umum</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">94.2% Tuntas KKM</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: "94.2%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Columns Supporting Info */}
        <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Kedisiplinan Guru
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100">Presensi Guru Bulan Ini</div>
                  <div className="text-slate-500">53 Hadir Tepat Waktu</div>
                </div>
                <span className="font-mono font-bold text-emerald-700">98.1%</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Kebijakan & SK Mengajar
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
                <div className="font-bold text-slate-900 dark:text-slate-100">📌 SK Beban Mengajar Guru</div>
                <p className="text-slate-500">SK Resmi Nomor MTs.02/PP.00.5/08/2026 disahkan.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Award className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Kinerja Madrasah
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                <span className="font-bold text-slate-900 dark:text-slate-100">Akreditasi Madrasah</span>
                <span className="font-mono font-bold text-emerald-700">A (Unggul)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 7. DASHBOARD WAKA KURIKULUM (WITH MODUL AJAR & BANK SOAL BARS)
  // =========================================================================
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-200 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Waka Kurikulum
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Monitoring Kurikulum Merdeka, Pelaksanaan CBT & Bank Soal · {currentDayName}, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs gap-1.5 h-9 shrink-0 shadow-xs" onClick={() => setActiveTab?.("cbt")}>
          <MonitorCheck className="h-4 w-4" /> Monitoring CBT Live
        </Button>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("cbt")}>
          <div className="text-xs font-semibold text-slate-500">Monitoring CBT Online Live</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">2 Sesi Ujian</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">PAT Al-Quran Hadits & Math</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("progress")}>
          <div className="text-xs font-semibold text-slate-500">Progres Perangkat Ajar Guru</div>
          <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">92.5%</div>
          <div className="text-xs text-slate-500 font-medium">Modul Ajar & RPP Terupload</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1 font-sans">
          <div className="text-xs font-semibold text-slate-500">Ketuntasan KKM Pembelajaran</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">95.8%</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Rata-rata Tingkat 7, 8, & 9</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 space-y-1 cursor-pointer" onClick={() => setActiveTab?.("cbt")}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Bank Soal CBT Masuk</span>
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">48 / 50 Mapel</div>
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">2 Mapel Belum Upload →</div>
        </div>
      </div>

      {/* 📊 BAR CHART / STATISTIK KHUSUS WAKA KURIKULUM */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Analisis Kelengkapan Modul Ajar Guru & Readiness Ujian CBT PTS Ganjil
          </h2>
          <span className="text-xs text-slate-400 font-mono">Kurikulum Merdeka</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6 text-xs">
          {/* Visual Bar 1: Progress Modul Ajar per Tingkat */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-700 dark:text-slate-300">Upload Modul Ajar CP/TP/ATP (Target 100%)</div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Tingkat VII (9 Rombel)</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">100% (18/18 Modul)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Tingkat VIII (9 Rombel)</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">88.8% (16/18 Modul)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600/80 rounded-full" style={{ width: "88.8%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Tingkat IX (9 Rombel)</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">94.4% (17/18 Modul)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600/90 rounded-full" style={{ width: "94.4%" }} />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Bar 2: Kelengkapan Bank Soal CBT */}
          <div className="space-y-2.5">
            <div className="font-semibold text-slate-700 dark:text-slate-300">Status Penyerahan Bank Soal CBT PTS Ganjil (50 Mapel)</div>
            
            <div className="space-y-2">
              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Soal Terverifikasi & Siap CBT</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">96.0% (48 Mapel)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: "96.0%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1">
                  <span>Menunggu Review / Upload Guru</span>
                  <span className="font-bold text-amber-700 dark:text-amber-400">4.0% (2 Mapel)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "4.0%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Columns Supporting Info */}
      <div className="grid md:grid-cols-3 gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Modul Ajar Kurikulum
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900 dark:text-slate-100">Tingkat VII (Kurikulum Merdeka)</div>
                <div className="text-slate-500">18 Pertemuan CP/TP</div>
              </div>
              <span className="font-mono text-emerald-700 font-bold">100% OK</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Jadwal Ujian & CBT
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">📌 Gladi Bersih Simulasi CBT PTS</div>
              <p className="text-slate-500">Gladi bersih dilaksanakan tanggal 12-14 Agustus 2026.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" /> Validasi Bank Soal
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
              <span className="font-bold text-slate-900 dark:text-slate-100">Soal Verifikasi Tim Editor</span>
              <span className="font-mono font-bold text-emerald-700">48 Mapel Valid</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
