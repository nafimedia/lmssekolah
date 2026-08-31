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
import { MysqlAuthService } from "@/services/mysqlAuthService";
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
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik" || activeRole === "kepala_madrasah";

  const activeUser = MysqlAuthService.getActiveUser();
  const rawClass = userProfile?.assignedClass || userProfile?.class_name || userProfile?.class || activeUser?.class_name;
  let binaanRombel = "Rombel 8A";
  if (rawClass && rawClass !== "Semua" && rawClass !== "Semua Rombel") {
    binaanRombel = normalizeRombelName(rawClass);
  } else {
    const name = (activeUser?.full_name || userProfile?.name || "").toLowerCase();
    const cleanNip = (activeUser?.nis_nip || "").trim();
    if (name.includes("achmad makmun") || cleanNip.includes("272005011001")) binaanRombel = "Rombel 8B";
    else if (name.includes("sobiyati")) binaanRombel = "Rombel 8A";
    else if (name.includes("novantya")) binaanRombel = "Rombel 9A";
    else if (name.includes("indah nurrohmah")) binaanRombel = "Rombel 9B";
    else if (name.includes("maulidia")) binaanRombel = "Rombel 7A";
    else if (name.includes("rindang")) binaanRombel = "Rombel 7B";
  }

  const activeRombel = isWaliKelas ? binaanRombel : normalizeRombelName(rawClass || "Rombel 8B");

  const [activeTab, setActiveTab] = useState<"dashboard" | "rekap_siswa" | "progress" | "riwayat" | "monitoring" | "badges">(
    isExecutive ? "rekap_siswa" : "dashboard"
  );
  const [selectedJuz, setSelectedJuz] = useState<string>("Juz 30");
  const [selectedRombel, setSelectedRombel] = useState<string>(isWaliKelas ? binaanRombel : isExecutive ? "ALL" : activeRombel);
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  // Form states for Murojaah
  const [isMurojaahOpen, setIsMurojaahOpen] = useState(false);

  // Detail Modal
  const [selectedHafalanDetail, setSelectedHafalanDetail] = useState<HafalanRow | null>(null);
  const [selectedStudentHistoryModal, setSelectedStudentHistoryModal] = useState<any | null>(null);

  const calculatedNilaiAkhir = useMemo(() => {
    return calculateFinalScore(scoreKelancaran, scoreTajwid, scoreMakhraj, scoreFashahah, scoreAdab);
  }, [scoreKelancaran, scoreTajwid, scoreMakhraj, scoreFashahah, scoreAdab]);

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
  }, [activeRole]);

  // Compute list of dynamic rombel options
  const rombelOptions = useMemo(() => {
    const set = new Set<string>(["Rombel 7A", "Rombel 7B", "Rombel 8A", "Rombel 8B", "Rombel 9A", "Rombel 9B"]);
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
      const matchRombel = selectedRombel === "ALL" || isSameClass(hRombel, selectedRombel);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        (h.student_name && h.student_name.toLowerCase().includes(q)) ||
        (h.surah && h.surah.toLowerCase().includes(q)) ||
        (h.nisn && h.nisn.toLowerCase().includes(q)) ||
        hRombel.toLowerCase().includes(q);
      return matchRombel && matchQuery;
    });
  }, [hafalanList, selectedRombel, searchQuery]);

  const filteredByJuz = useMemo(() => {
    return filteredHafalan.filter((h) => (h.juz || "").toLowerCase().includes(selectedJuz.toLowerCase()));
  }, [filteredHafalan, selectedJuz]);

  const ziyadahRecords = useMemo(() => {
    return filteredHafalan.filter((h) => h.jenis_setoran === "ziyadah" || !h.murojaah || h.murojaah === "Lancar");
  }, [filteredHafalan]);

  const murojaahRecords = useMemo(() => {
    return filteredHafalan.filter((h) => h.jenis_setoran === "murojaah" || h.murojaah === "Mutqin" || h.murojaah === "Murojaah");
  }, [filteredHafalan]);

  // Overall statistics based on selected Rombel
  const avgGrade = useMemo(() => {
    if (filteredHafalan.length === 0) return 0;
    const sum = filteredHafalan.reduce((acc, h) => acc + (parseInt(h.nilai || "85", 10) || 85), 0);
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
          (h.nisn && h.nisn.toLowerCase() === sNis)
      );

      const totalSetoran = matchedRecords.length;
      const lastRecord = matchedRecords[matchedRecords.length - 1] || null;
      const surahTerakhir = lastRecord ? `QS. ${lastRecord.surah} (${lastRecord.ayat})` : "Belum ada setoran";
      const isMutqin = matchedRecords.some((h) => h.status === "Mutqin" || h.murojaah === "Mutqin" || h.status === "Lulus");

      let studentAvg = 0;
      if (totalSetoran > 0) {
        const sum = matchedRecords.reduce((acc, curr) => acc + (parseInt(curr.nilai || "85", 10) || 85), 0);
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
    };

    try {
      await MysqlDataService.saveHafalan(newRecord);
      toast.success("✅ Setoran Ziyadah Baru Berhasil Disimpan ke MySQL Database!");
      setIsZiyadahOpen(false);
      loadData();
    } catch {
      toast.error("Gagal menyimpan setoran ke database.");
    }
  };

  const handleExportExcel = () => {
    if (filteredHafalan.length === 0) {
      toast.error("Belum ada data setoran untuk di-export.");
      return;
    }
    const headers = ["No", "NISN", "Nama Siswa", "Rombel", "Juz", "Surah", "Ayat", "Jenis Setoran", "Nilai Akhir", "Status Evaluasi", "Penguji"];
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
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                <BookMarked className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                {selectedRombel === "ALL"
                  ? "Monitoring Laporan Tahfidz Al-Qur'an (Seluruh Kelas)"
                  : `Monitoring Tahfidz - ${selectedRombel}`}
              </h1>
              <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/30 text-emerald-600">
                <ShieldCheck className="h-3 w-3 mr-1" /> RBAC: {isExecutive ? "Executive Monitoring (Kamad/Waka)" : isWaliKelas ? "Wali Kelas" : "Guru Tahfidz"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isExecutive
                ? "Pengawasan Capaian Hafalan Al-Qur'an Eksekutif Kamad & Waka Kurikulum per Rombel dan per Siswa"
                : "Pengelolaan Target Hafalan, Setoran Baru (Ziyadah), Murojaah, & Penilaian 5 Komponen MTsN 2 Cilacap."}
            </p>
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

      {/* Rombel Filter & Executive Controls (For Kamad, Waka, Admin, Teachers) */}
      {!isSiswa && (
        <Card className="border-border shadow-xs bg-card p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-0.5">Pilih Rombel / Mode Tahfidz</label>
                {isWaliKelas ? (
                  <div className="h-9 px-3 rounded-md border border-emerald-500/50 bg-emerald-500/10 flex items-center gap-2 font-extrabold text-xs text-emerald-700 dark:text-emerald-300">
                    <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Rombel Binaan: {binaanRombel}</span>
                  </div>
                ) : (
                  <select
                    className="h-9 rounded-md border border-emerald-500/40 bg-background px-3 text-xs font-bold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    value={selectedRombel}
                    onChange={(e) => setSelectedRombel(e.target.value)}
                  >
                    {isExecutive && (
                      <option value="ALL" className="font-bold">
                        ✨ Semua Rombel (Monitoring Eksekutif Kamad & Waka)
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
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari siswa, NISN, atau surah..."
                  className="pl-8 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isExecutive && (
                <Badge variant="secondary" className="hidden sm:inline-flex bg-emerald-600/10 text-emerald-600 border border-emerald-500/30 px-3 py-1.5 font-bold text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1" /> Executive Monitoring
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Executive Tahfidz KPI Summary Cards (Kamad & Waka View) */}
      {isExecutive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Siswa Peserta Tahfidz</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{filteredStudents.length} Siswa</h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Siswa terdaftar aktif</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Setoran Terdaftar</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{filteredHafalan.length} Record</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Ziyadah & Murojaah MySQL</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Rata-Rata Nilai Tahfidz</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{avgGrade > 0 ? `${avgGrade} Poin` : "0 Poin"}</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Evaluasi 5 komponen tajwid</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Target Lulus Mutqin</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{mutqinCount} Record</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Hafalan lancar & mutqin</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <GraduationCap className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs Sub-Nav Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit flex-wrap">
        {[
          { id: "dashboard", label: "Dashboard & Target", icon: BookMarked },
          { id: "rekap_siswa", label: "Rekap Capaian Siswa", icon: Users },
          { id: "progress", label: "Visual Progress Surah", icon: Star },
          { id: "riwayat", label: "Riwayat Setoran", icon: Calendar },
          { id: "monitoring", label: "Alert & Pembinaan", icon: BellRing },
          { id: "badges", label: "Achievement Badges", icon: Medal },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === t.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Selector Target Juz (hanya untuk tab yang relevan: dashboard, progress, riwayat) */}
      {(activeTab === "dashboard" || activeTab === "progress" || activeTab === "riwayat") && (
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
      )}

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
                  <div className="text-xl font-extrabold font-mono text-emerald-600">{avgGrade > 0 ? `${avgGrade} Poin` : "0 Poin"}</div>
                </div>

                <div className="p-3 rounded-xl border border-teal-500/30 bg-teal-500/10 text-center min-w-[90px]">
                  <div className="text-[10px] font-bold text-teal-700 dark:text-teal-300 uppercase">MUTQIN</div>
                  <div className="text-xl font-extrabold font-mono text-teal-600">{mutqinCount} Record</div>
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
                    <p className="text-[11px]">Belum ada masukan setoran hafalan baru.</p>
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
                    <p className="text-[11px]">Belum ada pencatatan murojaah hafalan.</p>
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

      {/* TAB REKAP SISWA: Matrix Capaian Tahfidz Siswa per Rombel */}
      {activeTab === "rekap_siswa" && (
        <Card className="border-border shadow-xs bg-card overflow-hidden">
          <CardHeader className="p-4 pb-3 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" /> Matrix Capaian Tahfidz Per Siswa
              </CardTitle>
              <CardDescription className="text-xs">
                Rekapitulasi total setoran, surah terakhir, rata-rata nilai tajwid, dan status kelancaran siswa.
              </CardDescription>
            </div>
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
                const isCompleted = filteredHafalan.some(
                  (h) => h.surah.toLowerCase().includes(surah.latin.toLowerCase()) && (h.status === "Mutqin" || h.status === "Lulus")
                );
                const isInProgress = filteredHafalan.some(
                  (h) => h.surah.toLowerCase().includes(surah.latin.toLowerCase()) && !isCompleted
                );

                return (
                  <div
                    key={surah.number}
                    className={`p-3 rounded-xl border transition flex flex-col justify-between space-y-2 ${isCompleted
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
              <CardDescription className="text-xs">Daftar rekam setoran Ziyadah & Murojaah resmi madrasah.</CardDescription>
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
            ) : filteredHafalan.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto" />
                <div className="font-semibold text-foreground">Tidak Ada Warning / Alert Aktif</div>
                <p className="text-[11px]">Database saat ini tidak menemukan catatan pembinaan tahfidz yang memerlukan tindakan darurat.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredHafalan.filter((h) => h.status === "Mengulang" || h.status === "Perlu Pengulangan").map((h, idx) => (
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
                  className={`p-4 rounded-xl border text-center space-y-2 ${b.active ? "border-amber-500/40 bg-amber-500/10" : "border-border opacity-50 bg-muted/20"
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

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsZiyadahOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1">
                <Check className="h-4 w-4" /> Simpan Ziyadah MySQL
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
                <div className="text-muted-foreground">NISN: {selectedHafalanDetail.nisn} • Rombel: {selectedHafalanDetail.class_name || activeRombel}</div>
                <div className="font-semibold text-emerald-600">QS. {selectedHafalanDetail.surah} (Ayat {selectedHafalanDetail.ayat}) • {selectedHafalanDetail.juz}</div>
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

              <div className="text-muted-foreground text-[11px]">
                Penguji / Ustadz: <span className="font-semibold text-foreground">{selectedHafalanDetail.ustadz}</span> • Tanggal: {selectedHafalanDetail.tgl}
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
                  <div className="text-xs text-muted-foreground">NISN: {selectedStudentHistoryModal.nis} • {selectedStudentHistoryModal.rombel}</div>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold">
                  {selectedStudentHistoryModal.totalSetoran} Record
                </Badge>
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                {selectedStudentHistoryModal.matchedRecords.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground italic border border-dashed border-border rounded-xl">
                    (Belum ada rekam setoran hafalan pada database)
                  </div>
                ) : (
                  selectedStudentHistoryModal.matchedRecords.map((h: HafalanRow, idx: number) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex justify-between items-center font-bold">
                        <span>QS. {h.surah} ({h.ayat})</span>
                        <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600">
                          {h.nilai}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>Jenis: {(h.jenis_setoran || "Ziyadah").toUpperCase()} • Status: {h.status}</span>
                        <span>{h.tgl}</span>
                      </div>
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
