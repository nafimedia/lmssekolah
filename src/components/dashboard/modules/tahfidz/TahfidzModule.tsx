import React, { useState, useEffect, useMemo } from "react";
import {
  BookMarked,
  Download,
  CheckCircle2,
  Users,
  Award,
  Calendar,
  BookOpen,
  Star,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Inbox,
  AlertTriangle,
  Clock,
  Check,
  RotateCcw,
  Search,
  Filter,
  Plus,
  Eye,
  BellRing,
  Medal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService, HafalanRow } from "@/services/mysqlDataService";
import { exportToExcelXml } from "@/utils/excelExporter";
import { normalizeRombelName, isSameClass } from "@/utils/classNormalization";
import {
  QURAN_JUZ_30_SURAHS,
  QURAN_JUZ_29_SURAHS,
  TAHFIDZ_GRADE_TARGETS,
  calculateFinalScore,
  SurahMeta,
} from "@/services/quranMasterData";
import { toast } from "sonner";

export interface TahfidzModuleProps {
  activeRole?: string;
  userProfile?: any;
}

export function TahfidzModule({ activeRole, userProfile }: TahfidzModuleProps = {}) {
  const isSiswa = activeRole === "siswa";
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isGuru = activeRole === "guru" || activeRole === "teacher" || activeRole === "pembina";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik";

  const userRombelRaw = userProfile?.class_name || userProfile?.class || (isWaliKelas ? "Rombel 8B" : "Rombel 8B");
  const activeRombel = normalizeRombelName(userRombelRaw);

  const [activeTab, setActiveTab] = useState<"dashboard" | "ziyadah" | "murojaah" | "progress" | "riwayat" | "monitoring" | "badges">("dashboard");
  const [selectedJuz, setSelectedJuz] = useState<string>("Juz 30");

  const [hafalanList, setHafalanList] = useState<HafalanRow[]>([]);
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states for Ziyadah (Hafalan Baru)
  const [isZiyadahOpen, setIsZiyadahOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedSurahName, setSelectedSurahName] = useState("An-Naba'");
  const [ayatStart, setAyatStart] = useState("1");
  const [ayatEnd, setAyatEnd] = useState("20");
  const [scoreKelancaran, setScoreKelancaran] = useState(90);
  const [scoreTajwid, setScoreTajwid] = useState(85);
  const [scoreMakhraj, setScoreMakhraj] = useState(88);
  const [scoreFashahah, setScoreFashahah] = useState(87);
  const [scoreAdab, setScoreAdab] = useState(95);
  const [ziyadahNotes, setZiyadahNotes] = useState("");
  const [statusEvaluasi, setStatusEvaluasi] = useState<"Lulus" | "Lulus Bersyarat" | "Mengulang">("Lulus");

  // Form states for Murojaah
  const [isMurojaahOpen, setIsMurojaahOpen] = useState(false);
  const [murojaahSurah, setMurojaahSurah] = useState("An-Naba'");
  const [murojaahAyat, setMurojaahAyat] = useState("1 - 40 (Full)");
  const [murojaahStatus, setMurojaahStatus] = useState<"Mutqin" | "Lancar" | "Perlu Pengulangan">("Mutqin");
  const [murojaahNotes, setMurojaahNotes] = useState("");

  // Detail Modal
  const [selectedHafalanDetail, setSelectedHafalanDetail] = useState<HafalanRow | null>(null);

  const calculatedNilaiAkhir = useMemo(() => {
    return calculateFinalScore(scoreKelancaran, scoreTajwid, scoreMakhraj, scoreFashahah, scoreAdab);
  }, [scoreKelancaran, scoreTajwid, scoreMakhraj, scoreFashahah, scoreAdab]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dbHafalan, dbUsers] = await Promise.all([
        MysqlDataService.getHafalan(),
        MysqlDataService.getUsers(),
      ]);

      const siswaList = (dbUsers || []).filter((u: any) => u.role === "siswa");
      setRealStudents(siswaList);

      let records = dbHafalan || [];

      // Filter by Wali Kelas class if role is walikelas
      if (isWaliKelas) {
        const waliStudents = siswaList.filter((s: any) => isSameClass(s.class_name || s.class, activeRombel));
        const waliNisns = new Set(waliStudents.map((s: any) => s.nis_nip || s.nis));
        const waliNames = new Set(waliStudents.map((s: any) => (s.full_name || s.name || "").toLowerCase()));

        records = records.filter((h) => {
          const matchClass = isSameClass(h.class_name || "", activeRombel);
          const matchNisn = h.nisn && waliNisns.has(h.nisn);
          const matchName = h.student_name && waliNames.has(h.student_name.toLowerCase());
          return matchClass || matchNisn || matchName;
        });
      }

      // Filter for Siswa self-view
      if (isSiswa && userProfile) {
        const meName = (userProfile.full_name || userProfile.name || "").toLowerCase();
        const meNisn = userProfile.nis_nip || userProfile.nis;
        records = records.filter(
          (h) => (h.student_name && h.student_name.toLowerCase() === meName) || (h.nisn && h.nisn === meNisn)
        );
      }

      setHafalanList(records);
    } catch {
      setHafalanList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeRole, activeRombel]);

  const filteredByJuz = useMemo(() => {
    return hafalanList.filter((h) => (h.juz || "").toLowerCase().includes(selectedJuz.toLowerCase()));
  }, [hafalanList, selectedJuz]);

  const ziyadahRecords = useMemo(() => {
    return hafalanList.filter((h) => h.jenis_setoran === "ziyadah" || !h.murojaah || h.murojaah === "Lancar");
  }, [hafalanList]);

  const murojaahRecords = useMemo(() => {
    return hafalanList.filter((h) => h.jenis_setoran === "murojaah" || h.murojaah === "Mutqin" || h.murojaah === "Murojaah");
  }, [hafalanList]);

  // Overall statistics
  const avgGrade = useMemo(() => {
    if (hafalanList.length === 0) return 0;
    const sum = hafalanList.reduce((acc, h) => acc + (parseInt(h.nilai || "85") || 85), 0);
    return Math.round(sum / hafalanList.length);
  }, [hafalanList]);

  const mutqinCount = useMemo(() => {
    return hafalanList.filter((h) => h.status === "Mutqin" || h.murojaah === "Mutqin").length;
  }, [hafalanList]);

  // Active Quran Surah list based on selectedJuz
  const activeQuranSurahs = useMemo(() => {
    if (selectedJuz === "Juz 29") return QURAN_JUZ_29_SURAHS;
    return QURAN_JUZ_30_SURAHS;
  }, [selectedJuz]);

  // Handle Input Ziyadah Save
  const handleSaveZiyadah = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = realStudents.find((s) => String(s.id) === selectedStudentId) || realStudents[0];
    const studentName = student ? (student.full_name || student.name) : (userProfile?.name || "Siswa MTsN 2");
    const nisn = student ? (student.nis_nip || student.nis || "-") : "12123301000288";
    const className = student ? (student.class_name || student.class || activeRombel) : activeRombel;

    const newRecord: HafalanRow = {
      student_name: studentName,
      nisn: nisn,
      class_name: className,
      juz: selectedJuz,
      surah: selectedSurahName,
      ayat: `${ayatStart} - ${ayatEnd}`,
      status: statusEvaluasi,
      nilai: `${calculatedNilaiAkhir} (Komponen)`,
      ustadz: userProfile?.name || "AH. SYARIF HIDAYAH, S.Pd.I",
      tgl: new Date().toLocaleDateString("id-ID"),
      murojaah: "Lancar",
      jenis_setoran: "ziyadah",
      score_kelancaran: scoreKelancaran,
      score_tajwid: scoreTajwid,
      score_makhraj: scoreMakhraj,
      score_fashahah: scoreFashahah,
      score_adab: scoreAdab,
      notes: ziyadahNotes,
    };

    const res = await MysqlDataService.saveHafalan(newRecord);
    if (res) {
      toast.success(`✨ Setoran Ziyadah QS. ${selectedSurahName} (${ayatStart}-${ayatEnd}) berhasil disimpan ke Database MySQL!`);
      await loadData();
      setIsZiyadahOpen(false);
    } else {
      toast.error("Gagal menyimpan setoran ke database.");
    }
  };

  // Handle Input Murojaah Save
  const handleSaveMurojaah = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = realStudents.find((s) => String(s.id) === selectedStudentId) || realStudents[0];
    const studentName = student ? (student.full_name || student.name) : (userProfile?.name || "Siswa MTsN 2");
    const nisn = student ? (student.nis_nip || student.nis || "-") : "12123301000288";
    const className = student ? (student.class_name || student.class || activeRombel) : activeRombel;

    const newRecord: HafalanRow = {
      student_name: studentName,
      nisn: nisn,
      class_name: className,
      juz: selectedJuz,
      surah: murojaahSurah,
      ayat: murojaahAyat,
      status: murojaahStatus,
      nilai: murojaahStatus === "Mutqin" ? "95 (Mutqin)" : "85 (Lancar)",
      ustadz: userProfile?.name || "AH. SYARIF HIDAYAH, S.Pd.I",
      tgl: new Date().toLocaleDateString("id-ID"),
      murojaah: murojaahStatus,
      jenis_setoran: "murojaah",
      notes: murojaahNotes,
    };

    const res = await MysqlDataService.saveHafalan(newRecord);
    if (res) {
      toast.success(`📖 Record Murojaah QS. ${murojaahSurah} (${murojaahStatus}) berhasil dicatat!`);
      await loadData();
      setIsMurojaahOpen(false);
    } else {
      toast.error("Gagal mencatat murojaah.");
    }
  };

  const handleExportExcel = () => {
    if (hafalanList.length === 0) {
      toast.error("Belum ada data setoran untuk di-export.");
      return;
    }
    const headers = ["No", "NISN", "Nama Siswa", "Rombel", "Juz", "Surah", "Ayat", "Jenis Setoran", "Nilai Akhir", "Status Evaluasi", "Penguji"];
    const rows = hafalanList.map((h, idx) => [
      idx + 1,
      h.nisn || "-",
      h.student_name || "-",
      h.class_name || "-",
      h.juz,
      h.surah,
      h.ayat,
      h.jenis_setoran?.toUpperCase() || "ZIYADAH",
      h.nilai,
      h.status,
      h.ustadz,
    ]);
    exportToExcelXml("Laporan_Setoran_Tahfidz_MTsN2Cilacap", "Setoran_Tahfidz", headers, rows);
    toast.success("File Excel Laporan Tahfidz Berhasil Diunduh!");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner per Role */}
      {isSiswa ? (
        <StudentHeaderBanner
          title="Modul & Portal Setoran Tahfidz Saya"
          subtitle="Tracking Target Hafalan Al-Qur'an, Evaluasi Multi-Komponen Tajwid, Murojaah, & Kartu Digital"
          icon={BookMarked}
          statusText="Target: Mutqin & Tuntas"
          statusVariant="success"
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              {isWaliKelas ? `Monitoring Tahfidz Siswa ${activeRombel}` : "Modul Keagamaan Tahfidz Al-Qur'an"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isWaliKelas
                ? `Laporan pencatatan Ziyadah, Murojaah, dan evaluasi tajwid khusus siswa Rombel ${activeRombel}.`
                : "Pengelolaan Target Hafalan, Setoran Baru (Ziyadah), Murojaah, & Penilaian 5 Komponen MTsN 2 Cilacap."}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
              onClick={handleExportExcel}
              disabled={hafalanList.length === 0}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
            </Button>

            {!isWaliKelas && !isSiswa && (
              <>
                <Button
                  size="sm"
                  className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  onClick={() => setIsZiyadahOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> + Setoran Baru (Ziyadah)
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-bold border-teal-500/40 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 shadow-xs"
                  onClick={() => setIsMurojaahOpen(true)}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> + Catat Murojaah
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tabs Sub-Nav Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit flex-wrap">
        {[
          { id: "dashboard", label: "Dashboard & Target", icon: BookMarked },
          { id: "progress", label: "Visual Progress Surah", icon: Star },
          { id: "riwayat", label: "Riwayat Setoran", icon: Calendar },
          { id: "monitoring", label: "Alert & Pembinaan", icon: BellRing },
          { id: "badges", label: "Achievement Badges", icon: Medal },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === t.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Selector Target Juz */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <span className="text-xs font-bold text-muted-foreground mr-1">Target Juz Aktif:</span>
        {["Juz 30", "Juz 29", "Juz 1"].map((j) => (
          <Button
            key={j}
            size="sm"
            variant={selectedJuz === j ? "default" : "outline"}
            className={`text-xs font-bold gap-1 ${selectedJuz === j ? "bg-emerald-600 text-white" : ""}`}
            onClick={() => setSelectedJuz(j)}
          >
            <BookOpen className="h-3.5 w-3.5" /> {j}
          </Button>
        ))}
      </div>

      {/* TAB 1: Dashboard & Target */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Target Overview Card */}
          <Card className="border-border shadow-xs bg-gradient-to-r from-emerald-500/10 via-card to-card">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Target Tahfidz Kurikulum MTsN 2 Cilacap ({selectedJuz})
                </div>
                <div className="text-xl font-extrabold text-foreground">
                  {TAHFIDZ_GRADE_TARGETS.VIII.description}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target disesuaikan per jenjang kelas. Penilaian Ziyadah mengacu pada 5 komponen tajwid & kelancaran.
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center min-w-[90px]">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">RATA-RATA</div>
                  <div className="text-xl font-extrabold font-mono text-emerald-600">{avgGrade > 0 ? avgGrade : "—"}</div>
                </div>

                <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-500/10 text-center min-w-[90px]">
                  <div className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">MUTQIN</div>
                  <div className="text-xl font-extrabold font-mono text-teal-600">{mutqinCount} Siswa</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary Cards Ziyadah vs Murojaah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ziyadah Card */}
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" /> Setoran Baru (Ziyadah)
                </CardTitle>
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">{ziyadahRecords.length} Record</Badge>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">Memuat data Ziyadah...</div>
                ) : ziyadahRecords.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1">
                    <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                    <div className="font-semibold text-foreground">Belum Ada Setoran Ziyadah</div>
                    <p className="text-[11px]">Database belum menerima masukan setoran hafalan baru.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {ziyadahRecords.slice(0, 5).map((r, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-foreground">QS. {r.surah} ({r.ayat})</div>
                          <div className="text-[11px] text-muted-foreground">{r.student_name} • {r.tgl}</div>
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                          {r.nilai}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Murojaah Card */}
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-teal-600" /> Pengulangan (Murojaah)
                </CardTitle>
                <Badge className="bg-teal-600 text-white font-bold text-[10px]">{murojaahRecords.length} Record</Badge>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">Memuat data Murojaah...</div>
                ) : murojaahRecords.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1">
                    <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                    <div className="font-semibold text-foreground">Belum Ada Record Murojaah</div>
                    <p className="text-[11px]">Database belum menerima pencatatan murojaah hafalan.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {murojaahRecords.slice(0, 5).map((r, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-foreground">QS. {r.surah} ({r.ayat})</div>
                          <div className="text-[11px] text-muted-foreground">{r.student_name} • {r.tgl}</div>
                        </div>
                        <Badge variant="outline" className="bg-teal-500/10 text-teal-600 border-teal-500/30 font-bold">
                          {r.murojaah || r.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: Visual Progress Surah */}
      {activeTab === "progress" && (
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Visual Progress Surah & Ayat ({selectedJuz})</span>
              <Badge className="bg-emerald-600 text-white font-bold text-xs">{activeQuranSurahs.length} Surah</Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Checklist ketuntasan hafalan per Surah: ✅ Tuntas Mutqin, 🔄 Sedang Dihafal, ⏳ Belum Setor.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeQuranSurahs.map((surah) => {
                const isCompleted = hafalanList.some(
                  (h) => h.surah.toLowerCase().includes(surah.latin.toLowerCase()) && (h.status === "Mutqin" || h.status === "Lulus")
                );
                const isInProgress = hafalanList.some(
                  (h) => h.surah.toLowerCase().includes(surah.latin.toLowerCase()) && !isCompleted
                );

                return (
                  <div
                    key={surah.number}
                    className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${
                      isCompleted
                        ? "border-emerald-500/40 bg-emerald-500/10"
                        : isInProgress
                        ? "border-amber-500/40 bg-amber-500/10"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-muted-foreground">No. {surah.number}</span>
                      {isCompleted ? (
                        <Badge className="bg-emerald-600 text-white text-[10px]">✅ Mutqin</Badge>
                      ) : isInProgress ? (
                        <Badge className="bg-amber-600 text-white text-[10px]">🔄 Ziyadah</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">⏳ Belum</Badge>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center justify-between">
                        <span>{surah.latin}</span>
                        <span className="font-serif font-semibold text-emerald-700 dark:text-emerald-300">{surah.name}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{surah.numberOfAyah} Ayat • {surah.translation}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Riwayat Setoran */}
      {activeTab === "riwayat" && (
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Riwayat Transaksi Setoran Tahfidz</CardTitle>
              <CardDescription className="text-xs">Daftar rekam setoran Ziyadah & Murojaah yang tersimpan di MySQL Database.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat data riwayat setoran...</div>
            ) : filteredByJuz.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">Belum Ada Transaksi Setoran untuk {selectedJuz}</div>
                <p>Database saat ini tidak memiliki rekam setoran terdaftar pada target juz ini.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Rombel</th>
                    <th className="py-3 px-4">Surah & Ayat</th>
                    <th className="py-3 px-4 text-center">Jenis Setoran</th>
                    <th className="py-3 px-4 text-center">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredByJuz.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 text-center font-mono font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{item.student_name || "Siswa"}</td>
                      <td className="py-3 px-4 text-muted-foreground font-semibold">{item.class_name || activeRombel}</td>
                      <td className="py-3 px-4 font-bold text-foreground">QS. {item.surah} ({item.ayat})</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className={item.jenis_setoran === "murojaah" ? "border-teal-500/30 text-teal-600 bg-teal-500/10 font-bold" : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-bold"}>
                          {(item.jenis_setoran || "Ziyadah").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-600">{item.nilai}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">{item.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-600 gap-1" onClick={() => setSelectedHafalanDetail(item)}>
                          <Eye className="h-3.5 w-3.5" /> Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Monitoring Alert */}
      {activeTab === "monitoring" && (
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BellRing className="h-5 w-5 text-amber-500" /> Monitoring Alert & Pembinaan Tahfidz
            </CardTitle>
            <CardDescription className="text-xs">
              Deteksi otomatis siswa yang belum pernah menyetor, perlu pengulangan, atau memerlukan perhatian khusus.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Memuat data monitoring...</div>
            ) : hafalanList.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                <div className="font-semibold text-foreground">Tidak Ada Warning / Alert Aktif</div>
                <p className="text-[11px]">Database saat ini tidak menemukan catatan pembinaan tahfidz yang memerlukan tindakan darurat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {hafalanList.filter((h) => h.status === "Mengulang" || h.status === "Perlu Pengulangan").map((h, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold text-foreground">{h.student_name} ({h.class_name})</div>
                        <div className="text-muted-foreground">Perlu Mengulang Setoran QS. {h.surah} ({h.ayat})</div>
                      </div>
                    </div>
                    <Badge className="bg-amber-600 text-white font-bold">{h.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 5: Achievement Badges */}
      {activeTab === "badges" && (
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Medal className="h-5 w-5 text-amber-500" /> Gallery Achievement Badges Tahfidz
            </CardTitle>
            <CardDescription className="text-xs">
              Penghargaan otomatis atas pencapaian target hafalan mutqin dan konsistensi setoran.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "🌟 Hafal 1 Juz Mutqin", desc: "Berhasil menyelesaikan 1 Juz hafalan dengan predikat Mutqin.", active: mutqinCount > 0 },
                { title: "🏆 Murojaah Terbaik", desc: "Konsisten mengulang hafalan tanpa kesalahan makhraj.", active: murojaahRecords.length > 0 },
                { title: "⚡ 10x Setoran Lancar", desc: "Telah menyelesaikan minimal 10 kali setoran ziyadah lancar.", active: ziyadahRecords.length >= 10 },
              ].map((b, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border text-center space-y-2 ${
                    b.active ? "border-amber-500/40 bg-amber-500/10" : "border-border opacity-50 bg-muted/20"
                  }`}
                >
                  <Medal className={`h-8 w-8 mx-auto ${b.active ? "text-amber-500" : "text-muted-foreground"}`} />
                  <div className="font-bold text-sm text-foreground">{b.title}</div>
                  <p className="text-xs text-muted-foreground">{b.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog Input Ziyadah (Hafalan Baru) */}
      <Dialog open={isZiyadahOpen} onOpenChange={setIsZiyadahOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-600" /> Input Setoran Baru (Ziyadah) - {selectedJuz}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Catat hafalan ayat baru dengan penilaian 5 komponen (Kelancaran, Tajwid, Makhraj, Fashahah, Adab).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveZiyadah} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pilih Siswa Setoran</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {realStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.name} ({s.class_name || s.class})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs font-semibold">Nama Surah</Label>
                <select
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                  value={selectedSurahName}
                  onChange={(e) => setSelectedSurahName(e.target.value)}
                >
                  {activeQuranSurahs.map((s) => (
                    <option key={s.number} value={s.latin}>
                      {s.number}. {s.latin} ({s.numberOfAyah} Ayat)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Ayat Mulai</Label>
                <Input type="number" min={1} value={ayatStart} onChange={(e) => setAyatStart(e.target.value)} className="h-8 text-xs" />
              </div>

              <div>
                <Label className="text-xs font-semibold">Ayat Selesai</Label>
                <Input type="number" min={1} value={ayatEnd} onChange={(e) => setAyatEnd(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            {/* 5 Component Scoring Sliders */}
            <div className="p-3 bg-muted/40 border border-border rounded-xl space-y-3">
              <div className="font-bold text-xs text-foreground flex justify-between">
                <span>Penilaian 5 Komponent Tajwid:</span>
                <span className="text-emerald-600 font-mono font-extrabold text-sm">Nilai Akhir: {calculatedNilaiAkhir}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground">Kelancaran (30%)</div>
                  <Input type="number" max={100} value={scoreKelancaran} onChange={(e) => setScoreKelancaran(Number(e.target.value))} className="h-7 text-xs text-center font-mono font-bold" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground">Tajwid (25%)</div>
                  <Input type="number" max={100} value={scoreTajwid} onChange={(e) => setScoreTajwid(Number(e.target.value))} className="h-7 text-xs text-center font-mono font-bold" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground">Makhraj (20%)</div>
                  <Input type="number" max={100} value={scoreMakhraj} onChange={(e) => setScoreMakhraj(Number(e.target.value))} className="h-7 text-xs text-center font-mono font-bold" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground">Fashahah (15%)</div>
                  <Input type="number" max={100} value={scoreFashahah} onChange={(e) => setScoreFashahah(Number(e.target.value))} className="h-7 text-xs text-center font-mono font-bold" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-muted-foreground">Adab (10%)</div>
                  <Input type="number" max={100} value={scoreAdab} onChange={(e) => setScoreAdab(Number(e.target.value))} className="h-7 text-xs text-center font-mono font-bold" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Status Evaluasi</Label>
                <select className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold" value={statusEvaluasi} onChange={(e) => setStatusEvaluasi(e.target.value as any)}>
                  <option value="Lulus">Lulus</option>
                  <option value="Lulus Bersyarat">Lulus Bersyarat</option>
                  <option value="Mengulang">Mengulang</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Catatan Guru Penguji</Label>
                <Input placeholder="Tuliskan apresiasi/catatan tajwid..." value={ziyadahNotes} onChange={(e) => setZiyadahNotes(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsZiyadahOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">Simpan Setoran Ziyadah</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Input Murojaah */}
      <Dialog open={isMurojaahOpen} onOpenChange={setIsMurojaahOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-teal-600" /> Catat Pengulangan Hafalan (Murojaah)
            </DialogTitle>
            <DialogDescription className="text-xs">Pencatatan kelancaran murojaah surah yang pernah dihafal sebelumnya.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMurojaah} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Pilih Siswa Murojaah</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {realStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || s.name} ({s.class_name || s.class})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-semibold">Surah Murojaah</Label>
                <select
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                  value={murojaahSurah}
                  onChange={(e) => setMurojaahSurah(e.target.value)}
                >
                  {activeQuranSurahs.map((s) => (
                    <option key={s.number} value={s.latin}>{s.latin}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Cakupan Ayat</Label>
                <Input value={murojaahAyat} onChange={(e) => setMurojaahAyat(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status Kelancaran Murojaah</Label>
              <select className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold" value={murojaahStatus} onChange={(e) => setMurojaahStatus(e.target.value as any)}>
                <option value="Mutqin">Mutqin (Hafal Sempurna / Luar Kepala)</option>
                <option value="Lancar">Lancar (Ada Lupa Kecil 1-2 Ayat)</option>
                <option value="Perlu Pengulangan">Perlu Pengulangan (Banyak Ragu/Salah)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Catatan Tambahan Murojaah</Label>
              <Input placeholder="Tuliskan catatan perbaikan..." value={murojaahNotes} onChange={(e) => setMurojaahNotes(e.target.value)} className="h-8 text-xs" />
            </div>

            <DialogFooter className="pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsMurojaahOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold">Simpan Record Murojaah</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Detail Setoran */}
      {selectedHafalanDetail && (
        <Dialog open={!!selectedHafalanDetail} onOpenChange={() => setSelectedHafalanDetail(null)}>
          <DialogContent className="sm:max-w-md border-border bg-card">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-emerald-600" /> Detail Evaluasi Setoran Tahfidz
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Nama Siswa:</span>
                <strong className="text-foreground">{selectedHafalanDetail.student_name} ({selectedHafalanDetail.class_name})</strong>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Target Juz & Surah:</span>
                <strong className="text-foreground">{selectedHafalanDetail.juz} - QS. {selectedHafalanDetail.surah} ({selectedHafalanDetail.ayat})</strong>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Jenis Setoran:</span>
                <Badge className="bg-emerald-600 text-white font-bold text-[10px]">
                  {(selectedHafalanDetail.jenis_setoran || "Ziyadah").toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Nilai Akhir & Status:</span>
                <strong className="text-emerald-600 font-bold">{selectedHafalanDetail.nilai} — {selectedHafalanDetail.status}</strong>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-muted-foreground">Penguji & Tanggal:</span>
                <span className="text-muted-foreground">{selectedHafalanDetail.ustadz} • {selectedHafalanDetail.tgl}</span>
              </div>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedHafalanDetail(null)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export function LaporanTahfidzEksekutif({ activeRole, userProfile }: TahfidzModuleProps) {
  return <TahfidzModule activeRole={activeRole} userProfile={userProfile} />;
}
