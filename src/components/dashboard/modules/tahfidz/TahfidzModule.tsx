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
  Building2,
  GraduationCap,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { exportToExcelXml } from "@/utils/excelExporter";
import { normalizeRombelName, isSameClass, resolveWaliKelasRombel } from "@/utils/classNormalization";
import {
  QURAN_JUZ_30_SURAHS,
  QURAN_JUZ_29_SURAHS,
  QURAN_JUZ_1_SURAHS,
  TAHFIDZ_GRADE_TARGETS,
  calculateFinalScore,
  getTahfidzTarget,
  getGradeLevel,
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
  const isExecutive =
    activeRole === "kamad" ||
    activeRole === "waka" ||
    activeRole === "admin" ||
    activeRole === "admin_akademik" ||
    activeRole === "kepala_madrasah";

  const activeUser = MysqlAuthService.getActiveUser();
  const rawClass =
    userProfile?.assignedClass ||
    userProfile?.class_name ||
    userProfile?.class ||
    activeUser?.class_name;
  const binaanRombel = resolveWaliKelasRombel(activeUser || userProfile, null, "kelas");
  const activeRombel = isWaliKelas ? binaanRombel : normalizeRombelName(rawClass || "Kelas 8B");

  // Dynamic Grade Level
  const studentGrade = useMemo(() => {
    return getGradeLevel(rawClass || activeRombel);
  }, [rawClass, activeRombel]);

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "rekap_siswa" | "progress" | "riwayat" | "kartu_tahfidz" | "monitoring" | "badges"
  >(isExecutive ? "rekap_siswa" : "dashboard");

  const [selectedJuz, setSelectedJuz] = useState<string>("Juz 30");
  const [selectedRombel, setSelectedRombel] = useState<string>(
    isWaliKelas ? binaanRombel : isExecutive ? "ALL" : activeRombel
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Visual Progress selector for Teacher
  const [selectedStudentForVisual, setSelectedStudentForVisual] = useState<string>("ALL");

  useEffect(() => {
    if (isWaliKelas) {
      setSelectedRombel(binaanRombel);
    }
  }, [isWaliKelas, binaanRombel]);

  const [hafalanList, setHafalanList] = useState<HafalanRow[]>([]);
  const [realStudents, setRealStudents] = useState<any[]>([]);
  const [masterRombels, setMasterRombels] = useState<any[]>([]);
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
  const [formJuz, setFormJuz] = useState("Juz 30");

  // Form states for Murojaah (Pengulangan Hafalan)
  const [isMurojaahOpen, setIsMurojaahOpen] = useState(false);
  const [murojaahStudentId, setMurojaahStudentId] = useState("");
  const [murojaahJuz, setMurojaahJuz] = useState("Juz 30");
  const [murojaahSurahName, setMurojaahSurahName] = useState("An-Naba'");
  const [murojaahAyatStart, setMurojaahAyatStart] = useState("1");
  const [murojaahAyatEnd, setMurojaahAyatEnd] = useState("40");
  const [murojaahStatus, setMurojaahStatus] = useState<"Mutqin" | "Lancar" | "Perlu Pengulangan">("Mutqin");
  const [murojaahNilai, setMurojaahNilai] = useState(95);
  const [murojaahNotes, setMurojaahNotes] = useState("");

  // Detail Modal
  const [selectedHafalanDetail, setSelectedHafalanDetail] = useState<HafalanRow | null>(null);
  const [selectedStudentHistoryModal, setSelectedStudentHistoryModal] = useState<any | null>(null);

  const calculatedNilaiAkhir = useMemo(() => {
    return calculateFinalScore(scoreKelancaran, scoreTajwid, scoreMakhraj, scoreFashahah, scoreAdab);
  }, [scoreKelancaran, scoreTajwid, scoreMakhraj, scoreFashahah, scoreAdab]);

  // Dynamic Target based on Grade and Selected Juz
  const activeTarget = useMemo(() => {
    const cls =
      userProfile?.assignedClass ||
      userProfile?.class_name ||
      userProfile?.class ||
      activeUser?.class_name ||
      activeRombel;
    return getTahfidzTarget(cls, selectedJuz);
  }, [userProfile, activeUser, activeRombel, selectedJuz]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dbHafalan, dbUsers, rombels] = await Promise.all([
        MysqlDataService.getHafalan().catch(() => []),
        MysqlDataService.getUsers().catch(() => []),
        MysqlDataService.getMasterRombels().catch(() => []),
      ]);

      if (rombels && rombels.length > 0) {
        setMasterRombels(rombels);
      }

      const siswaList = (dbUsers || []).filter((u: any) => u.role === "siswa");
      setRealStudents(siswaList);

      let records = dbHafalan || [];

      // Filter for Siswa self-view
      if (isSiswa) {
        const meName = (userProfile?.full_name || userProfile?.name || activeUser?.full_name || "").toLowerCase();
        const meNisn = userProfile?.nis_nip || userProfile?.nis || activeUser?.nis_nip;
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
  }, [activeRole]);

  // Compute list of dynamic rombel options
  const rombelOptions = useMemo(() => {
    const set = new Set<string>(["Kelas 7A", "Kelas 7B", "Kelas 8A", "Kelas 8B", "Kelas 9A", "Kelas 9B"]);
    masterRombels.forEach((r) => {
      if (r.name) set.add(normalizeRombelName(r.name));
      if (r.code) set.add(normalizeRombelName(r.code));
    });
    realStudents.forEach((s) => {
      const r = s.class_name || s.class;
      if (r) set.add(normalizeRombelName(r));
    });
    hafalanList.forEach((h) => {
      if (h.class_name) set.add(normalizeRombelName(h.class_name));
    });
    return Array.from(set).sort();
  }, [masterRombels, realStudents, hafalanList]);

  // Filtered Students by Selected Rombel & Search Query
  const filteredStudents = useMemo(() => {
    return realStudents.filter((s: any) => {
      const sRombel = normalizeRombelName(s.class_name || s.class || "Rombel 8B");
      const matchRombel = selectedRombel === "ALL" || isSameClass(sRombel, selectedRombel);
      const q = searchQuery.toLowerCase().trim();
      const sName = (s.full_name || s.name || "").toLowerCase();
      const sNis = (s.nis_nip || s.nis || "").toLowerCase();
      const matchQuery = !q || sName.includes(q) || sNis.includes(q) || sRombel.toLowerCase().includes(q);
      return matchRombel && matchQuery;
    });
  }, [realStudents, selectedRombel, searchQuery]);

  // Filtered Hafalan Records by Selected Rombel & Search Query
  const filteredHafalan = useMemo(() => {
    return hafalanList.filter((h) => {
      const hRombel = normalizeRombelName(h.class_name || "Rombel 8B");
      const matchRombel = isSiswa || selectedRombel === "ALL" || isSameClass(hRombel, selectedRombel);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (h.student_name && h.student_name.toLowerCase().includes(q)) ||
        (h.surah && h.surah.toLowerCase().includes(q)) ||
        (h.nisn && h.nisn.toLowerCase().includes(q)) ||
        hRombel.toLowerCase().includes(q);
      return matchRombel && matchQuery;
    });
  }, [hafalanList, isSiswa, selectedRombel, searchQuery]);

  const filteredByJuz = useMemo(() => {
    if (selectedJuz === "Semua Juz") return filteredHafalan;
    return filteredHafalan.filter((h) => (h.juz || "").toLowerCase().includes(selectedJuz.toLowerCase()));
  }, [filteredHafalan, selectedJuz]);

  const ziyadahRecords = useMemo(() => {
    return filteredHafalan.filter((h) => h.jenis_setoran === "ziyadah" || (!h.jenis_setoran && (!h.murojaah || h.murojaah === "Lancar")));
  }, [filteredHafalan]);

  const murojaahRecords = useMemo(() => {
    return filteredHafalan.filter((h) => h.jenis_setoran === "murojaah" || h.murojaah === "Mutqin" || h.murojaah === "Murojaah" || h.murojaah === "Perlu Pengulangan");
  }, [filteredHafalan]);

  // Overall statistics based on selected Rombel / Student
  const avgGrade = useMemo(() => {
    if (filteredHafalan.length === 0) return 0;
    const sum = filteredHafalan.reduce((acc, h) => {
      const parsed = parseInt(String(h.nilai || "85").replace(/[^0-9]/g, ""), 10) || 85;
      return acc + parsed;
    }, 0);
    return Math.round(sum / filteredHafalan.length);
  }, [filteredHafalan]);

  const mutqinCount = useMemo(() => {
    return filteredHafalan.filter((h) => h.status === "Mutqin" || h.murojaah === "Mutqin" || h.status === "Lulus").length;
  }, [filteredHafalan]);

  // Comprehensive Student Tahfidz Summary Matrix (For Executive & Teacher Monitoring)
  const studentTahfidzSummary = useMemo(() => {
    return filteredStudents.map((student: any) => {
      const sName = (student.full_name || student.name || "").toLowerCase();
      const sNis = (student.nis_nip || student.nis || "").toLowerCase();
      const sRombel = normalizeRombelName(student.class_name || student.class || "Rombel 8B");

      const matchedRecords = hafalanList.filter(
        (h) =>
          (h.student_name && h.student_name.toLowerCase() === sName) ||
          (h.nisn && h.nisn === sNis)
      );

      const totalSetoran = matchedRecords.length;
      const lastRecord = matchedRecords[0] || null;
      const surahTerakhir = lastRecord ? `QS. ${lastRecord.surah} (${lastRecord.ayat})` : "Belum ada setoran";
      const isMutqin = matchedRecords.some((h) => h.status === "Mutqin" || h.murojaah === "Mutqin" || h.status === "Lulus");

      let studentAvg = 0;
      if (totalSetoran > 0) {
        const sum = matchedRecords.reduce((acc, curr) => {
          const p = parseInt(String(curr.nilai || "85").replace(/[^0-9]/g, ""), 10) || 85;
          return acc + p;
        }, 0);
        studentAvg = Math.round(sum / totalSetoran);
      }

      return {
        id: student.id,
        rawStudent: student,
        name: student.full_name || student.name,
        nis: student.nis_nip || student.nis || "-",
        rombel: sRombel,
        totalSetoran,
        surahTerakhir,
        avgScore: studentAvg,
        statusMurojaah: isMutqin ? "Mutqin (Lancar)" : totalSetoran > 0 ? "Dalam Proses" : "Belum Setor (0 Poin)",
        matchedRecords,
      };
    });
  }, [filteredStudents, hafalanList]);

  // Active Quran Surah list based on selectedJuz
  const activeQuranSurahs = useMemo(() => {
    if (selectedJuz === "Juz 29") return QURAN_JUZ_29_SURAHS;
    if (selectedJuz === "Juz 1") return QURAN_JUZ_1_SURAHS;
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
      juz: formJuz || (selectedJuz === "Semua Juz" ? "Juz 30" : selectedJuz),
      surah: selectedSurahName,
      ayat: `${ayatStart} - ${ayatEnd}`,
      status: statusEvaluasi,
      nilai: `${calculatedNilaiAkhir} (Komponen)`,
      ustadz: userProfile?.name || activeUser?.full_name || "AH. SYARIF HIDAYAH, S.Pd.I",
      tgl: new Date().toLocaleDateString("id-ID"),
      murojaah: "Lancar",
      jenis_setoran: "ziyadah",
      score_kelancaran: scoreKelancaran,
      score_tajwid: scoreTajwid,
      score_makhraj: scoreMakhraj,
      score_fashahah: scoreFashahah,
      score_adab: scoreAdab,
      notes: ziyadahNotes || undefined,
    };

    try {
      await MysqlDataService.saveHafalan(newRecord);
      toast.success("✅ Setoran Ziyadah Baru Berhasil Disimpan!");
      setIsZiyadahOpen(false);
      setZiyadahNotes("");
      loadData();
    } catch {
      toast.error("Gagal menyimpan setoran ke database.");
    }
  };

  // Handle Input Murojaah Save
  const handleSaveMurojaah = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = realStudents.find((s) => String(s.id) === murojaahStudentId) || realStudents[0];
    const studentName = student ? (student.full_name || student.name) : (userProfile?.name || "Siswa MTsN 2");
    const nisn = student ? (student.nis_nip || student.nis || "-") : "12123301000288";
    const className = student ? (student.class_name || student.class || activeRombel) : activeRombel;

    const newRecord: HafalanRow = {
      student_name: studentName,
      nisn: nisn,
      class_name: className,
      juz: murojaahJuz || (selectedJuz === "Semua Juz" ? "Juz 30" : selectedJuz),
      surah: murojaahSurahName,
      ayat: `${murojaahAyatStart} - ${murojaahAyatEnd}`,
      status: murojaahStatus,
      nilai: `${murojaahNilai} (Murojaah)`,
      ustadz: userProfile?.name || activeUser?.full_name || "AH. SYARIF HIDAYAH, S.Pd.I",
      tgl: new Date().toLocaleDateString("id-ID"),
      murojaah: murojaahStatus,
      jenis_setoran: "murojaah",
      notes: murojaahNotes || undefined,
    };

    try {
      await MysqlDataService.saveHafalan(newRecord);
      toast.success("✅ Catatan Murojaah Berhasil Disimpan!");
      setIsMurojaahOpen(false);
      setMurojaahNotes("");
      loadData();
    } catch {
      toast.error("Gagal menyimpan catatan murojaah ke database.");
    }
  };

  const handleExportExcel = () => {
    if (filteredHafalan.length === 0) {
      toast.error("Belum ada data setoran untuk di-export.");
      return;
    }
    const headers = ["No", "NISN", "Nama Siswa", "Rombel", "Juz", "Surah", "Ayat", "Jenis Setoran", "Nilai Akhir", "Status Evaluasi", "Penguji", "Catatan"];
    const rows = filteredHafalan.map((h, idx) => [
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
      h.notes || "-",
    ]);
    exportToExcelXml("Laporan_Setoran_Tahfidz_MTsN2Cilacap", "Setoran_Tahfidz", headers, rows);
    toast.success("File Excel Laporan Tahfidz Berhasil Diunduh!");
  };

  // Navigation tabs based on Role
  const navTabs = useMemo(() => {
    if (isSiswa) {
      return [
        { id: "dashboard", label: "Ringkasan & Target", icon: BookMarked },
        { id: "progress", label: "Progres Surah", icon: Star },
        { id: "riwayat", label: "Riwayat Setoran", icon: Calendar },
        { id: "kartu_tahfidz", label: "Kartu Mutaba'ah", icon: BookOpen },
        { id: "monitoring", label: "Catatan Guru", icon: BellRing },
        { id: "badges", label: "Lencana Prestasi", icon: Medal },
      ];
    }
    return [
      { id: "dashboard", label: "Ringkasan & Target", icon: BookMarked },
      { id: "rekap_siswa", label: "Rekap Capaian Siswa", icon: Users },
      { id: "progress", label: "Progres Surah", icon: Star },
      { id: "riwayat", label: "Riwayat Setoran", icon: Calendar },
      { id: "monitoring", label: "Peringatan & Pembinaan", icon: BellRing },
      { id: "badges", label: "Lencana Prestasi", icon: Medal },
    ];
  }, [isSiswa]);

  return (
    <div className="space-y-6">
      {/* Header Banner per Role */}
      {isSiswa ? (
        <StudentHeaderBanner
          title="Tahfidz & Hafalan Qur'an"
          icon={BookMarked}
          studentClass={userProfile?.class_name || activeUser?.class_name || activeRombel}
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
              <BookMarked className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              {selectedRombel === "ALL"
                ? "Monitoring Laporan Tahfidz Al-Qur'an (Seluruh Kelas)"
                : `Monitoring Tahfidz - ${selectedRombel}`}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
              onClick={handleExportExcel}
              disabled={filteredHafalan.length === 0}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
            </Button>

            {!isWaliKelas && !isSiswa && (
              <>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs px-3"
                  onClick={() => setIsZiyadahOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" /> Setoran Baru (Ziyadah)
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs font-semibold border-teal-500/40 text-teal-600 dark:text-teal-400 hover:bg-teal-500/10 px-3"
                  onClick={() => setIsMurojaahOpen(true)}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Catat Murojaah
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Kelas Filter & Search Bar */}
      {!isSiswa && (
        <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 shadow-2xs text-xs">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Pilih Kelas:</span>
            {isWaliKelas ? (
              <div className="h-8 px-2.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Kelas Binaan: {binaanRombel}</span>
              </div>
            ) : (
              <select
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/50 transition min-w-[200px]"
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
              >
                {isExecutive && (
                  <option value="ALL" className="font-bold">
                    ✨ Semua Kelas (Monitoring Madrasah)
                  </option>
                )}
                {rombelOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Cari siswa, NISN, surah..."
              className="pl-8 h-8 text-xs rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Horizontal Compact Metric Strip (~42px) */}
      {isExecutive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Siswa Peserta</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{filteredStudents.length} Siswa Aktif</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Setoran</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{filteredHafalan.length} Record</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Award className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Rata-Rata Nilai</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{avgGrade > 0 ? `${avgGrade} Poin` : "0 Poin"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Lulus Mutqin</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{mutqinCount} Record</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Sub-Nav Navigation (Segmented Pill Style) */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 overflow-x-auto max-w-full no-scrollbar shrink-0">
        {navTabs.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={activeTab === t.id ? "default" : "ghost"}
            onClick={() => setActiveTab(t.id as any)}
            className={`h-7 px-2.5 rounded-lg text-xs font-bold gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === t.id
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            <span>{t.label}</span>
          </Button>
        ))}
      </div>

      {/* Selector Filter Data Juz 1 - 30 Dropdown */}
      {(activeTab === "dashboard" || activeTab === "progress" || activeTab === "riwayat") && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-bold text-foreground">Filter Data Juz:</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <select
              className="h-8 sm:h-9 flex-1 sm:flex-initial sm:min-w-[200px] rounded-lg border border-emerald-500/40 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-xs cursor-pointer"
              value={selectedJuz}
              onChange={(e) => setSelectedJuz(e.target.value)}
            >
              <option value="Semua Juz">✨ Semua Juz (Juz 1 s.d. 30)</option>
              {Array.from({ length: 30 }, (_, i) => `Juz ${i + 1}`).map((j) => (
                <option key={j} value={j}>
                  📖 {j}
                </option>
              ))}
            </select>
            {selectedJuz !== "Semua Juz" && (
              <Badge variant="secondary" className="text-[10px] sm:text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                Menampilkan {selectedJuz}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* TAB 1: Dashboard & Target */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Target Overview Card */}
          <Card className="border-border shadow-xs bg-gradient-to-r from-emerald-500/10 via-card to-card">
            <CardContent className="p-3.5 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
                <div className="text-lg sm:text-xl font-bold text-foreground">
                  {selectedJuz === "Semua Juz"
                    ? "Target & Capaian Hafalan Al-Qur'an"
                    : `Capaian & Evaluasi Setoran ${selectedJuz}`}
                </div>
                {selectedJuz !== "Semua Juz" && (
                  <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/40 text-emerald-600">
                    {selectedJuz}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center min-w-[90px]">
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">RATA-RATA</div>
                  <div className="text-xl font-bold font-mono text-emerald-600">{avgGrade > 0 ? `${avgGrade} Poin` : "0 Poin"}</div>
                </div>

                <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-500/10 text-center min-w-[90px]">
                  <div className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">MUTQIN</div>
                  <div className="text-xl font-bold font-mono text-teal-600">{mutqinCount} Record</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary Cards Ziyadah vs Murojaah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ziyadah Card */}
            <Card className="border-border shadow-xs bg-card">
              <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" /> Hafalan Baru (Ziyadah)
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
                    <p className="text-[11px]">Belum ada setoran hafalan baru.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {ziyadahRecords.slice(0, 5).map((r, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-foreground">QS. {r.surah} ({r.ayat})</div>
                          <div className="text-[11px] text-muted-foreground">{r.student_name} • {r.class_name || activeRombel}</div>
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
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-teal-600" /> Ulang Hafalan (Muroja'ah)
                </CardTitle>
                <Badge className="bg-teal-600 text-white font-bold text-[10px]">{murojaahRecords.length} Record</Badge>
              </CardHeader>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">Memuat data Murojaah...</div>
                ) : murojaahRecords.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1">
                    <Inbox className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                    <div className="font-semibold text-foreground">Belum Ada Catatan Muroja'ah</div>
                    <p className="text-[11px]">Belum ada pencatatan ulang hafalan.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                    {murojaahRecords.slice(0, 5).map((r, i) => (
                      <div key={i} className="p-3 rounded-lg border border-border bg-muted/30 flex justify-between items-center text-xs">
                        <div>
                          <div className="font-bold text-foreground">QS. {r.surah} ({r.ayat})</div>
                          <div className="text-[11px] text-muted-foreground">{r.student_name} • {r.class_name || activeRombel}</div>
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

      {/* TAB REKAP SISWA: Matrix Capaian Tahfidz Siswa per Rombel (Hanya untuk Guru, Wali Kelas, Kamad) */}
      {!isSiswa && activeTab === "rekap_siswa" && (
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> Matrix Capaian Tahfidz Per Siswa
              </CardTitle>
            <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/30 text-emerald-600">
              {studentTahfidzSummary.length} Siswa Terdaftar
            </Badge>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat rekap capaian siswa...</div>
            ) : studentTahfidzSummary.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">Tidak Ada Siswa Ditemukan</div>
                <p>Belum ada data siswa terdaftar pada rombel ini.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">NISN / NIS</th>
                    <th className="py-3 px-4">Rombel</th>
                    <th className="py-3 px-4 text-center">Total Setoran</th>
                    <th className="py-3 px-4">Surah Terakhir</th>
                    <th className="py-3 px-4 text-center">Rata-Rata Nilai</th>
                    <th className="py-3 px-4 text-center">Status Murojaah</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {studentTahfidzSummary.map((s, idx) => (
                    <tr key={s.id || idx} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 text-center font-mono font-medium">{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-foreground">{s.name}</td>
                      <td className="py-3 px-4 text-muted-foreground font-mono">{s.nis}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">{s.rombel}</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-700 dark:text-emerald-300">
                        {s.totalSetoran} Record
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">{s.surahTerakhir}</td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-600">
                        {s.avgScore > 0 ? `${s.avgScore} Poin` : "0 Poin"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            s.totalSetoran > 0
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold"
                              : "bg-slate-500/10 text-slate-500 border-slate-300 font-normal"
                          }
                        >
                          {s.statusMurojaah}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs font-bold text-emerald-600 gap-1"
                          onClick={() => setSelectedStudentHistoryModal(s)}
                        >
                          <Eye className="h-3.5 w-3.5" /> Detail Setoran
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

      {/* TAB 2: Visual Progress Surah */}
      {activeTab === "progress" && (
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <span>Progres Surah & Ayat ({selectedJuz})</span>
              <Badge className="bg-emerald-600 text-white font-bold text-xs">{activeQuranSurahs.length} Surah</Badge>
            </CardTitle>

            {!isSiswa && (
              <div className="flex items-center gap-2">
                <Label className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Filter Siswa:</Label>
                <select
                  className="h-8 rounded-md border border-border bg-background px-2 text-xs font-bold text-foreground"
                  value={selectedStudentForVisual}
                  onChange={(e) => setSelectedStudentForVisual(e.target.value)}
                >
                  <option value="ALL">✨ Rangkuman Seluruh Siswa Rombel</option>
                  {filteredStudents.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeQuranSurahs.map((surah) => {
                let relevantRecords = filteredHafalan;
                if (!isSiswa && selectedStudentForVisual !== "ALL") {
                  const sObj = filteredStudents.find((s: any) => String(s.id) === selectedStudentForVisual);
                  const sName = (sObj?.full_name || sObj?.name || "").toLowerCase();
                  const sNis = (sObj?.nis_nip || sObj?.nis || "").toLowerCase();
                  relevantRecords = filteredHafalan.filter(
                    (h) =>
                      (h.student_name && h.student_name.toLowerCase() === sName) ||
                      (h.nisn && h.nisn.toLowerCase() === sNis)
                  );
                }

                const isCompleted = relevantRecords.some(
                  (h) => h.surah.toLowerCase().includes(surah.latin.toLowerCase()) && (h.status === "Mutqin" || h.status === "Lulus")
                );
                const isInProgress = relevantRecords.some(
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
                        <Badge className="bg-amber-600 text-white text-[10px]">🔄 Berproses</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-muted-foreground">⏳ Belum</Badge>
                      )}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-foreground flex items-center justify-between">
                        <span>{surah.latin}</span>
                        <span className="font-semibold text-base text-emerald-700 dark:text-emerald-300">{surah.name}</span>
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
            <CardTitle className="text-base font-bold">
              {isSiswa ? "Riwayat Setoran Hafalan" : "Riwayat Setoran Tahfidz"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-muted-foreground">Memuat data riwayat setoran...</div>
            ) : filteredByJuz.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2 m-4">
                <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                <div className="font-semibold text-foreground text-sm">
                  Belum Ada Transaksi Setoran {selectedJuz === "Semua Juz" ? "Tercatat" : `untuk ${selectedJuz}`}
                </div>
                <p>Belum ada catatan setoran hafalan pada target juz ini.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    {!isSiswa && <th className="py-3 px-4">Nama Siswa</th>}
                    {!isSiswa && <th className="py-3 px-4">Rombel</th>}
                    <th className="py-3 px-4">Tanggal</th>
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
                      {!isSiswa && <td className="py-3 px-4 font-bold text-foreground">{item.student_name || "Siswa"}</td>}
                      {!isSiswa && <td className="py-3 px-4 text-muted-foreground font-semibold">{item.class_name || activeRombel}</td>}
                      <td className="py-3 px-4 text-muted-foreground font-mono">{item.tgl}</td>
                      <td className="py-3 px-4 font-bold text-foreground">QS. {item.surah} ({item.ayat})</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            item.jenis_setoran === "murojaah"
                              ? "border-teal-500/30 text-teal-600 bg-teal-500/10 font-bold"
                              : "border-emerald-500/30 text-emerald-600 bg-emerald-500/10 font-bold"
                          }
                        >
                          {(item.jenis_setoran || "Ziyadah").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-extrabold text-emerald-600">{item.nilai}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-600 text-white font-bold text-[10px]">{item.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs font-bold text-emerald-600 gap-1"
                          onClick={() => setSelectedHafalanDetail(item)}
                        >
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

      {/* TAB KARTU MUTABA'AH DIGITAL (KHUSUS SISWA & BISA DICETAK RESMI) */}
      {isSiswa && activeTab === "kartu_tahfidz" && (
        <div className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs font-bold border-blue-500/40 text-blue-600 hover:bg-blue-500/10 shadow-xs"
              onClick={() => {
                window.print();
                toast.success("🖨️ Membuka jendela cetak Kartu Mutaba'ah...");
              }}
            >
              <Printer className="h-4 w-4" /> Cetak Kartu Mutaba'ah
            </Button>
          </div>

          <Card className="border-border shadow-md bg-card overflow-hidden">
            <div className="p-6 bg-white text-slate-950 font-sans space-y-6 print:p-0">
              {/* Header Kartu Kop Resmi Madrasah */}
              <div className="border-b-2 border-slate-900 pb-4">
                <div className="flex items-center gap-4">
                  <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-16 w-16 object-contain shrink-0" />
                  <div className="text-center flex-1 pr-16">
                    <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">
                      KEMENTERIAN AGAMA REPUBLIK INDONESIA
                    </div>
                    <div className="text-lg font-black text-slate-950 uppercase tracking-tight">
                      KANTOR KEMENTERIAN AGAMA KABUPATEN CILACAP
                    </div>
                    <div className="text-base font-extrabold text-emerald-800 uppercase">
                      MADRASAH TSANAWIYAH NEGERI 2 CILACAP
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      Jl. KH. Siradj No. 20, Sidareja, Cilacap • Telp: (0280) 523123 • Email: mtsn2cilacap@kemenag.go.id
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-300 text-center">
                  <span className="text-sm font-black uppercase tracking-wide text-slate-900 bg-slate-100 px-4 py-1 rounded-full border border-slate-300 inline-block">
                    KARTU KENDALI & MUTABA'AH TAHFIDZ AL-QUR'AN
                  </span>
                </div>
              </div>

              {/* Data Identitas Siswa */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-32 py-1 font-semibold text-slate-600">Nama Lengkap</td>
                      <td className="w-4 py-1 font-bold">:</td>
                      <td className="py-1 font-extrabold text-slate-900">
                        {userProfile?.full_name || userProfile?.name || activeUser?.full_name || "AFINDA MULIA ROKHMAH"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-600">NISN / NIS</td>
                      <td className="py-1 font-bold">:</td>
                      <td className="py-1 font-mono font-bold text-slate-900">
                        {userProfile?.nis_nip || userProfile?.nis || activeUser?.nis_nip || "-"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-600">Kelas / Rombel</td>
                      <td className="py-1 font-bold">:</td>
                      <td className="py-1 font-bold text-slate-900">
                        {userProfile?.class_name || activeUser?.class_name || activeRombel}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="w-36 py-1 font-semibold text-slate-600">Program Pembinaan</td>
                      <td className="w-4 py-1 font-bold">:</td>
                      <td className="py-1 font-bold text-emerald-800">Tahfidz Al-Qur'an (Ziyadah & Murojaah)</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-600">Guru Pembina</td>
                      <td className="py-1 font-bold">:</td>
                      <td className="py-1 font-bold text-slate-900">AH. SYARIF HIDAYAH, S.Pd.I</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-slate-600">Tahun Ajaran</td>
                      <td className="py-1 font-bold">:</td>
                      <td className="py-1 font-bold text-slate-900">2026/2027 (Semester Gasal)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ringkasan Statistik Siswa */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Total Setoran</div>
                  <div className="text-xl font-black text-slate-900 mt-0.5">{filteredHafalan.length} Record</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-emerald-700">Predikat Mutqin</div>
                  <div className="text-xl font-black text-emerald-700 mt-0.5">{mutqinCount} Surah</div>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg text-center">
                  <div className="text-[10px] uppercase font-bold text-teal-700">Rata-Rata Nilai</div>
                  <div className="text-xl font-black text-teal-700 mt-0.5">{avgGrade > 0 ? `${avgGrade} Poin` : "0 Poin"}</div>
                </div>
              </div>

              {/* Tabel Transkrip Setoran */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rekam Riwayat Setoran Ziyadah & Murojaah Resmi:
                </div>
                <table className="w-full text-xs border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                      <th className="p-2 border-r border-slate-300 text-center w-10">No</th>
                      <th className="p-2 border-r border-slate-300 text-left w-24">Tanggal</th>
                      <th className="p-2 border-r border-slate-300 text-left">Surah & Ayat</th>
                      <th className="p-2 border-r border-slate-300 text-center w-20">Juz</th>
                      <th className="p-2 border-r border-slate-300 text-center w-24">Jenis</th>
                      <th className="p-2 border-r border-slate-300 text-center w-20">Nilai</th>
                      <th className="p-2 border-r border-slate-300 text-center w-24">Status</th>
                      <th className="p-2 border-r border-slate-300 text-left">Catatan Guru</th>
                      <th className="p-2 text-center w-24">Paraf</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHafalan.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-400 italic font-medium">
                          (Belum ada rekam data setoran yang divalidasi oleh Guru Pembimbing)
                        </td>
                      </tr>
                    ) : (
                      filteredHafalan.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-300">
                          <td className="p-2 border-r border-slate-300 text-center font-mono">{idx + 1}</td>
                          <td className="p-2 border-r border-slate-300 text-slate-700">{item.tgl}</td>
                          <td className="p-2 border-r border-slate-300 font-bold text-slate-900">
                            QS. {item.surah} ({item.ayat})
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center">{item.juz}</td>
                          <td className="p-2 border-r border-slate-300 text-center uppercase font-semibold text-[10px]">
                            {item.jenis_setoran || "Ziyadah"}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center font-black text-emerald-700">
                            {item.nilai}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">{item.status}</td>
                          <td className="p-2 border-r border-slate-300 text-slate-600 text-[11px]">
                            {item.notes || "-"}
                          </td>
                          <td className="p-2 text-center font-bold text-slate-700">✓ Valid</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tanda Tangan Pengesahan 3 Pihak */}
              <div className="grid grid-cols-3 gap-2 text-xs pt-6 text-slate-800 border-t border-slate-300">
                <div className="text-center space-y-10">
                  <div>
                    Mengetahui,
                    <br />
                    Orang Tua / Wali Siswa
                  </div>
                  <div className="font-bold underline text-slate-950">( .......................... )</div>
                </div>
                <div className="text-center space-y-10">
                  <div>
                    Cilacap, 8 September 2026
                    <br />
                    Guru Pembina Tahfidz
                  </div>
                  <div className="font-bold underline text-slate-950">AH. SYARIF HIDAYAH, S.Pd.I</div>
                </div>
                <div className="text-center space-y-10">
                  <div>
                    Mengetahui,
                    <br />
                    Kepala MTsN 2 Cilacap
                  </div>
                  <div className="font-bold underline text-slate-950">H. SOLIHUN, S.Pd., M.Si.</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: Monitoring Alert & Pembinaan */}
      {activeTab === "monitoring" && (
        <Card className="border-border shadow-xs bg-card">
          <CardHeader className="p-4 pb-3 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <BellRing className="h-5 w-5 text-amber-500" />
              {isSiswa ? "Catatan Guru Pembina" : "Peringatan & Pembinaan Tahfidz"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="p-6 text-center text-xs text-muted-foreground">Memuat data catatan...</div>
            ) : isSiswa ? (
              filteredHafalan.filter((h) => h.status === "Mengulang" || h.status === "Perlu Pengulangan" || h.notes).length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <div className="font-bold text-foreground text-sm">Alhamdulillah, Belum Ada Catatan Perbaikan</div>
                  <p className="text-[11px] max-w-md mx-auto">
                    Setoran hafalanmu berjalan baik dan lancar. Belum ada catatan perbaikan khusus dari guru. Pertahankan hafalanmu!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredHafalan
                    .filter((h) => h.status === "Mengulang" || h.status === "Perlu Pengulangan" || h.notes)
                    .map((h, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start justify-between text-xs gap-3">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <div className="font-bold text-foreground">QS. {h.surah} ({h.ayat}) • {h.juz}</div>
                            <div className="text-muted-foreground">Status: <span className="font-semibold text-amber-700 dark:text-amber-300">{h.status}</span></div>
                            {h.notes && (
                              <div className="p-2 bg-background/60 rounded-md border border-amber-500/20 text-foreground font-medium text-[11px] mt-1">
                                💬 Catatan Guru: "{h.notes}"
                              </div>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-amber-600 text-white font-bold shrink-0">{h.status}</Badge>
                      </div>
                    ))}
                </div>
              )
            ) : filteredHafalan.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                <div className="font-semibold text-foreground">Tidak Ada Warning / Alert Aktif</div>
                <p className="text-[11px]">Tidak ada catatan pembinaan khusus yang memerlukan tindakan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHafalan
                  .filter((h) => h.status === "Mengulang" || h.status === "Perlu Pengulangan" || h.notes)
                  .map((h, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-bold text-foreground">{h.student_name} ({h.class_name})</div>
                          <div className="text-muted-foreground">
                            QS. {h.surah} ({h.ayat}) {h.notes ? `• ${h.notes}` : "Perlu Pengulangan Murojaah"}
                          </div>
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
              <Medal className="h-5 w-5 text-amber-500" /> Koleksi Lencana Prestasi Tahfidz
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "🌟 Hafal 1 Juz Mutqin", desc: "Tuntas menghafal 1 Juz dengan lancar dan tajwid baik.", active: mutqinCount > 0 },
                { title: "🏆 Muroja'ah Rajin", desc: "Rutin mengulang dan menjaga hafalan tanpa kendala makhraj.", active: murojaahRecords.length > 0 },
                { title: "⚡ 10x Setoran Lancar", desc: "Telah berhasil setor hafalan minimal 10 kali tanpa kendala.", active: ziyadahRecords.length >= 10 },
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
            <div className="grid grid-cols-2 gap-2">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pilihan Juz (1 - 30)</Label>
                <select
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                  value={formJuz}
                  onChange={(e) => setFormJuz(e.target.value)}
                >
                  {Array.from({ length: 30 }, (_, i) => `Juz ${i + 1}`).map((j) => (
                    <option key={j} value={j}>
                      📖 {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-semibold">Surah Target</Label>
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cakupan Ayat</Label>
                <div className="flex items-center gap-1">
                  <Input
                    className="h-8 text-xs font-mono text-center"
                    placeholder="Awal"
                    value={ayatStart}
                    onChange={(e) => setAyatStart(e.target.value)}
                  />
                  <span>-</span>
                  <Input
                    className="h-8 text-xs font-mono text-center"
                    placeholder="Akhir"
                    value={ayatEnd}
                    onChange={(e) => setAyatEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Component Scoring */}
            <div className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
              <div className="font-bold text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
                <span>Penilaian 5 Komponen Tajwid & Adab</span>
                <span className="font-mono text-sm font-extrabold">{calculatedNilaiAkhir} Poin</span>
              </div>

              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                <div>
                  <Label className="text-[10px]">Kelancaran</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs font-bold text-center"
                    value={scoreKelancaran}
                    onChange={(e) => setScoreKelancaran(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Tajwid</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs font-bold text-center"
                    value={scoreTajwid}
                    onChange={(e) => setScoreTajwid(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Makhraj</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs font-bold text-center"
                    value={scoreMakhraj}
                    onChange={(e) => setScoreMakhraj(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Fashahah</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs font-bold text-center"
                    value={scoreFashahah}
                    onChange={(e) => setScoreFashahah(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-[10px]">Adab</Label>
                  <Input
                    type="number"
                    className="h-7 text-xs font-bold text-center"
                    value={scoreAdab}
                    onChange={(e) => setScoreAdab(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status Evaluasi</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                value={statusEvaluasi}
                onChange={(e) => setStatusEvaluasi(e.target.value as any)}
              >
                <option value="Lulus">Lulus (Tuntas & Mutqin)</option>
                <option value="Lulus Bersyarat">Lulus Bersyarat (Catatan Murojaah)</option>
                <option value="Mengulang">Mengulang (Perlu Pembinaan)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Catatan Evaluasi / Arahan Tajwid (Opsional)</Label>
              <Textarea
                placeholder="Misal: Perbaiki mad lazim pada ayat 15, makhraj huruf Shad sudah baik..."
                className="text-xs min-h-[50px]"
                value={ziyadahNotes}
                onChange={(e) => setZiyadahNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsZiyadahOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1">
                <Check className="h-4 w-4" /> Simpan Ziyadah
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Input Murojaah (Pengulangan Hafalan) */}
      <Dialog open={isMurojaahOpen} onOpenChange={setIsMurojaahOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-teal-600" /> Catat Murojaah (Pengulangan Hafalan) - {selectedJuz}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Catat evaluasi pengulangan hafalan siswa untuk memastikan predikat kelancaran & Mutqin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMurojaah} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pilih Siswa Setoran</Label>
                <select
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                  value={murojaahStudentId}
                  onChange={(e) => setMurojaahStudentId(e.target.value)}
                >
                  {realStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.name} ({s.class_name || s.class})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Pilihan Juz (1 - 30)</Label>
                <select
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                  value={murojaahJuz}
                  onChange={(e) => setMurojaahJuz(e.target.value)}
                >
                  {Array.from({ length: 30 }, (_, i) => `Juz ${i + 1}`).map((j) => (
                    <option key={j} value={j}>
                      📖 {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5 col-span-2">
                <Label className="text-xs font-semibold">Surah yang Dimurojaah</Label>
                <select
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                  value={murojaahSurahName}
                  onChange={(e) => setMurojaahSurahName(e.target.value)}
                >
                  {activeQuranSurahs.map((s) => (
                    <option key={s.number} value={s.latin}>
                      {s.number}. {s.latin} ({s.numberOfAyah} Ayat)
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Cakupan Ayat</Label>
                <div className="flex items-center gap-1">
                  <Input
                    className="h-8 text-xs font-mono text-center"
                    placeholder="Awal"
                    value={murojaahAyatStart}
                    onChange={(e) => setMurojaahAyatStart(e.target.value)}
                  />
                  <span>-</span>
                  <Input
                    className="h-8 text-xs font-mono text-center"
                    placeholder="Akhir"
                    value={murojaahAyatEnd}
                    onChange={(e) => setMurojaahAyatEnd(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Status Kelancaran Murojaah</Label>
                <select
                  className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs font-bold"
                  value={murojaahStatus}
                  onChange={(e) => setMurojaahStatus(e.target.value as any)}
                >
                  <option value="Mutqin">Mutqin (Sangat Lancar & Kuat)</option>
                  <option value="Lancar">Lancar (Catatan Ringan)</option>
                  <option value="Perlu Pengulangan">Perlu Pengulangan (Belum Lancar)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Nilai Evaluasi (0 - 100)</Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-bold"
                  value={murojaahNilai}
                  onChange={(e) => setMurojaahNilai(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Catatan Evaluasi / Arahan Guru (Opsional)</Label>
              <Textarea
                placeholder="Misal: Tingkatkan kelancaran pada ayat 10-15..."
                className="text-xs min-h-[50px]"
                value={murojaahNotes}
                onChange={(e) => setMurojaahNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsMurojaahOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1">
                <Check className="h-4 w-4" /> Simpan Murojaah
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Detail Setoran Single Record */}
      <Dialog open={!!selectedHafalanDetail} onOpenChange={(o) => !o && setSelectedHafalanDetail(null)}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600" /> Detail Evaluasi Setoran Tahfidz
            </DialogTitle>
            <DialogDescription className="text-xs">
              Transkrip rincian nilai komponen tajwid, fashahah, dan adab setoran.
            </DialogDescription>
          </DialogHeader>

          {selectedHafalanDetail && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1">
                <div className="font-bold text-sm text-foreground">{selectedHafalanDetail.student_name}</div>
                <div className="text-muted-foreground">
                  NISN: {selectedHafalanDetail.nisn} • Rombel: {selectedHafalanDetail.class_name || activeRombel}
                </div>
                <div className="font-semibold text-emerald-600">
                  QS. {selectedHafalanDetail.surah} (Ayat {selectedHafalanDetail.ayat}) • {selectedHafalanDetail.juz}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="text-muted-foreground text-[10px]">NILAI AKHIR</div>
                  <div className="text-lg font-black text-emerald-600">{selectedHafalanDetail.nilai}</div>
                </div>
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="text-muted-foreground text-[10px]">STATUS EVALUASI</div>
                  <div className="text-xs font-bold text-foreground mt-1">{selectedHafalanDetail.status}</div>
                </div>
              </div>

              {/* Detail 5 Komponen jika ada */}
              {selectedHafalanDetail.score_kelancaran ? (
                <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                  <div className="font-bold text-emerald-700 dark:text-emerald-300 text-[11px]">Rincian 5 Komponen Tajwid:</div>
                  <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                    <div className="p-1 rounded bg-background border">
                      <div className="text-muted-foreground text-[9px]">Lancar</div>
                      <div className="font-bold text-emerald-600">{selectedHafalanDetail.score_kelancaran}</div>
                    </div>
                    <div className="p-1 rounded bg-background border">
                      <div className="text-muted-foreground text-[9px]">Tajwid</div>
                      <div className="font-bold text-emerald-600">{selectedHafalanDetail.score_tajwid}</div>
                    </div>
                    <div className="p-1 rounded bg-background border">
                      <div className="text-muted-foreground text-[9px]">Makhraj</div>
                      <div className="font-bold text-emerald-600">{selectedHafalanDetail.score_makhraj}</div>
                    </div>
                    <div className="p-1 rounded bg-background border">
                      <div className="text-muted-foreground text-[9px]">Fashahah</div>
                      <div className="font-bold text-emerald-600">{selectedHafalanDetail.score_fashahah}</div>
                    </div>
                    <div className="p-1 rounded bg-background border">
                      <div className="text-muted-foreground text-[9px]">Adab</div>
                      <div className="font-bold text-emerald-600">{selectedHafalanDetail.score_adab}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {selectedHafalanDetail.notes && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-foreground text-xs">
                  <span className="font-bold text-amber-700 dark:text-amber-300">Catatan Guru: </span>
                  {selectedHafalanDetail.notes}
                </div>
              )}

              <div className="text-muted-foreground text-[11px]">
                Penguji / Guru: <span className="font-semibold text-foreground">{selectedHafalanDetail.ustadz}</span> • Tanggal: {selectedHafalanDetail.tgl}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Detail Rekap Setoran Siswa (Student History Modal) */}
      <Dialog open={!!selectedStudentHistoryModal} onOpenChange={(o) => !o && setSelectedStudentHistoryModal(null)}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" /> Transkrip Complete Setoran Siswa
            </DialogTitle>
            <DialogDescription className="text-xs">
              Rekam jejak seluruh setoran Ziyadah dan Murojaah yang pernah dilakukan oleh siswa ini.
            </DialogDescription>
          </DialogHeader>

          {selectedStudentHistoryModal && (
            <div className="space-y-4 py-2 text-xs">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-extrabold text-sm text-foreground">{selectedStudentHistoryModal.name}</div>
                  <div className="text-xs text-muted-foreground">
                    NISN: {selectedStudentHistoryModal.nis} • {selectedStudentHistoryModal.rombel}
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold">
                  {selectedStudentHistoryModal.totalSetoran} Record
                </Badge>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {selectedStudentHistoryModal.matchedRecords.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-xl">
                    (Belum ada catatan setoran hafalan)
                  </div>
                ) : (
                  selectedStudentHistoryModal.matchedRecords.map((h: HafalanRow, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span>
                          QS. {h.surah} ({h.ayat})
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                          {h.nilai}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>
                          Jenis: {(h.jenis_setoran || "Ziyadah").toUpperCase()} • Status: {h.status}
                        </span>
                        <span>{h.tgl}</span>
                      </div>
                      {h.notes && (
                        <div className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                          Catatan: {h.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LaporanTahfidzEksekutif(props: TahfidzModuleProps) {
  return <TahfidzModule {...props} />;
}
