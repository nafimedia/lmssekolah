import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  BarChart3,
  Search,
  Download,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  BookOpen,
  Send,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  Lock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  Printer,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { CBTGradeAnalysisItem, CBTQuestion } from "@/types/cbt";
import { exportToExcelXml } from "@/utils/excelExporter";
import { isArabicText } from "@/utils/arabicHelper";

interface CBTGradeAnalysisProps {
  grades: CBTGradeAnalysisItem[];
  questions?: CBTQuestion[];
  userRole?: string;
  studentName?: string;
  onGradeEssay?: (
    resultId: string,
    essayScore: number,
    totalScore: number,
    status: "Lulus KKM" | "Remedial",
    studentAnswers: string
  ) => void;
  onCreateRemedialExam?: () => void;
  onSendRemedial?: (studentId: string, studentName: string) => void;
  onSendEnrichment?: (studentId: string, studentName: string) => void;
}

export const CBTGradeAnalysis: React.FC<CBTGradeAnalysisProps> = ({
  grades,
  questions = [],
  userRole = "guru",
  studentName = "ALIYA QIARA ABDULLAH",
  onGradeEssay,
  onCreateRemedialExam,
  onSendRemedial,
  onSendEnrichment,
}) => {
  const [viewMode, setViewMode] = useState<"nilai" | "butir_soal">("nilai");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRombel, setSelectedRombel] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<CBTGradeAnalysisItem | null>(null);
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);
  const [isEnrichmentModalOpen, setIsEnrichmentModalOpen] = useState(false);
  const [isEssayModalOpen, setIsEssayModalOpen] = useState(false);
  const [isBeritaAcaraOpen, setIsBeritaAcaraOpen] = useState(false);
  const [gradingStudent, setGradingStudent] = useState<CBTGradeAnalysisItem | null>(null);
  const [essayScores, setEssayScores] = useState<Record<string, number>>({});
  const [parsedEssayList, setParsedEssayList] = useState<any[]>([]);

  // Remedial & Enrichment Form State
  const [remedialNote, setRemedialNote] = useState("Kerjakan Ujian Susulan / LKPD Remedial Bab 1");
  const [enrichmentNote, setEnrichmentNote] = useState("Materi Tantangan Soal HOTS & Modul Pengayaan");

  const isSiswa = userRole === "siswa";
  const isWaliKelas = userRole === "walikelas" || userRole === "wali_kelas";
  const isGuru = userRole === "guru";
  const isExecutive = userRole === "kamad" || userRole === "waka" || userRole === "admin" || userRole === "admin_akademik";
  const canManage = isGuru || isExecutive;

  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(colKey);
      setSortDir("asc");
    }
  };

  // Dynamic Rombel List from Real Grade Records
  const availableRombels = React.useMemo(() => {
    const set = new Set<string>();
    grades.forEach((g) => {
      if (g.classRombel) set.add(g.classRombel);
    });
    return Array.from(set).sort();
  }, [grades]);

  // Grades filtered by selected rombel
  const rombelFilteredGrades = React.useMemo(() => {
    if (selectedRombel === "all") return grades;
    return grades.filter((g) => g.classRombel === selectedRombel);
  }, [grades, selectedRombel]);

  // Filter & Sort Grades by Role Scope & Search Term
  const filteredGrades = rombelFilteredGrades.filter((g) => {
    if (isSiswa) {
      return g.name.toLowerCase().includes(studentName.toLowerCase());
    }

    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.classRombel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || g.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const sortedGrades = React.useMemo(() => {
    return [...filteredGrades].sort((a, b) => {
      let valA: any = "";
      let valB: any = "";
      if (sortColumn === "name") {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortColumn === "nis") {
        valA = a.nis;
        valB = b.nis;
      } else if (sortColumn === "rombel") {
        valA = a.classRombel.toLowerCase();
        valB = b.classRombel.toLowerCase();
      } else if (sortColumn === "pg") {
        valA = a.pgScore;
        valB = b.pgScore;
      } else if (sortColumn === "essay") {
        valA = a.essayScore;
        valB = b.essayScore;
      } else if (sortColumn === "total") {
        valA = a.totalScore;
        valB = b.totalScore;
      }

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredGrades, sortColumn, sortDir]);

  // Descriptive Statistics (100% Real Database Calculations)
  const stats = React.useMemo(() => {
    const total = rombelFilteredGrades.length;
    if (total === 0) {
      return {
        total: 0,
        passed: 0,
        remedial: 0,
        passPct: 0,
        avg: 0,
        max: 0,
        min: 0,
        median: 0,
        stdDev: 0,
        isClassicalPassed: false,
      };
    }

    const scores = rombelFilteredGrades.map((g) => g.totalScore);
    const passed = rombelFilteredGrades.filter((g) => g.status === "Lulus KKM").length;
    const remedial = rombelFilteredGrades.filter((g) => g.status === "Remedial" || g.status === "Perlu Dikoreksi").length;
    const passPct = Math.round((passed / total) * 100);
    const isClassicalPassed = passPct >= 85;

    const sum = scores.reduce((acc, s) => acc + s, 0);
    const avg = +(sum / total).toFixed(1);
    const max = Math.max(...scores);
    const min = Math.min(...scores);

    const sortedScores = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sortedScores.length / 2);
    const median =
      sortedScores.length % 2 !== 0
        ? sortedScores[mid]
        : +((sortedScores[mid - 1] + sortedScores[mid]) / 2).toFixed(1);

    const variance = scores.reduce((acc, s) => acc + Math.pow(s - avg, 2), 0) / total;
    const stdDev = +Math.sqrt(variance).toFixed(2);

    return {
      total,
      passed,
      remedial,
      passPct,
      avg,
      max,
      min,
      median,
      stdDev,
      isClassicalPassed,
    };
  }, [rombelFilteredGrades]);

  const totalStudents = stats.total;
  const passedStudents = stats.passed;
  const remedialStudents = stats.remedial;
  const passPercentage = stats.passPct;
  const avgScore = stats.avg;

  // Real Item Analysis (Psychometrics & Distractor Efficiency based on student_answers JSON)
  const itemAnalysisList = React.useMemo(() => {
    const list =
      questions && questions.length > 0
        ? questions
        : Array.from({ length: 20 }).map((_, i) => ({
            id: `q-${i + 1}`,
            questionType: "pg" as const,
            questionText: `Soal Evaluasi Capaian Pembelajaran #${i + 1}`,
            options: { A: "Pilihan A", B: "Pilihan B", C: "Pilihan C", D: "Pilihan D" },
            correctOption: (["A", "B", "C", "D"] as const)[i % 4],
            points: 5,
            difficulty: (i % 3 === 0 ? "Mudah" : i % 3 === 1 ? "Sedang" : "Sukar") as any,
          }));

    const totalPeserta = rombelFilteredGrades.length;

    // Helper to find student answer for a specific question
    const findStudentAnswer = (studentAnswersRaw: string | undefined, q: CBTQuestion, qIndex: number) => {
      if (!studentAnswersRaw) return null;
      try {
        const parsed = typeof studentAnswersRaw === "string" ? JSON.parse(studentAnswersRaw) : studentAnswersRaw;
        if (!parsed) return null;

        if (parsed[qIndex]) {
          const item = parsed[qIndex];
          if (item && (String(item.questionId) === String(q.id) || item.questionText === q.questionText)) {
            return item;
          }
        }

        const values = Object.values(parsed);
        const match = values.find(
          (item: any) =>
            item && (String(item.questionId) === String(q.id) || item.questionText === q.questionText)
        );
        if (match) return match;

        if (parsed[qIndex]) return parsed[qIndex];
        return null;
      } catch {
        return null;
      }
    };

    // Sort students by totalScore descending for upper and lower group division
    const sortedStudents = [...rombelFilteredGrades].sort((a, b) => b.totalScore - a.totalScore);
    const nUpper = Math.ceil(totalPeserta / 2);
    const nLower = totalPeserta - nUpper;
    const upperStudents = sortedStudents.slice(0, nUpper);
    const lowerStudents = sortedStudents.slice(nUpper);

    return list.map((q, idx) => {
      let correctCount = 0;
      const optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, Benar: 0, Salah: 0 };
      let upperCorrect = 0;
      let lowerCorrect = 0;

      if (totalPeserta > 0) {
        upperStudents.forEach((student) => {
          const ans = findStudentAnswer(student.studentAnswers, q, idx);
          if (ans) {
            if (ans.isCorrect || (q.questionType === "essay" && Number(ans.score) > 0)) {
              upperCorrect++;
              correctCount++;
            }
            const chosen = String(ans.studentAnswer || "").trim();
            if (optionCounts[chosen] !== undefined) {
              optionCounts[chosen]++;
            }
          }
        });

        lowerStudents.forEach((student) => {
          const ans = findStudentAnswer(student.studentAnswers, q, idx);
          if (ans) {
            if (ans.isCorrect || (q.questionType === "essay" && Number(ans.score) > 0)) {
              lowerCorrect++;
              correctCount++;
            }
            const chosen = String(ans.studentAnswer || "").trim();
            if (optionCounts[chosen] !== undefined) {
              optionCounts[chosen]++;
            }
          }
        });
      }

      // Tingkat Kesukaran (P)
      const pVal = totalPeserta > 0 ? +(correctCount / totalPeserta).toFixed(2) : 0;
      const pct = Math.round(pVal * 100);

      let kesukaran = "Sedang";
      let kesukaranColor = "bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800";
      if (totalPeserta === 0) {
        kesukaran = "Belum Ada Data";
        kesukaranColor = "bg-muted text-muted-foreground border-border";
      } else if (pVal >= 0.70) {
        kesukaran = "Mudah";
        kesukaranColor = "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800";
      } else if (pVal < 0.30) {
        kesukaran = "Sukar";
        kesukaranColor = "bg-rose-500/10 text-rose-600 border-rose-300 dark:border-rose-800";
      }

      // Daya Pembeda (D)
      let dayaBeda = 0;
      let dayaBedaLabel = "-";
      let rekomendasi = "Diterima (Baik)";
      let rekColor = "text-emerald-600";

      if (totalPeserta >= 2 && nLower > 0 && nUpper > 0) {
        const pUpper = upperCorrect / nUpper;
        const pLower = lowerCorrect / nLower;
        dayaBeda = +(pUpper - pLower).toFixed(2);

        if (dayaBeda >= 0.40) {
          dayaBedaLabel = `${dayaBeda} (Sangat Baik)`;
          rekomendasi = "Diterima (Sangat Baik)";
          rekColor = "text-emerald-600";
        } else if (dayaBeda >= 0.30) {
          dayaBedaLabel = `${dayaBeda} (Baik)`;
          rekomendasi = "Diterima (Baik)";
          rekColor = "text-blue-600";
        } else if (dayaBeda >= 0.20) {
          dayaBedaLabel = `${dayaBeda} (Cukup)`;
          rekomendasi = "Perlu Revisi Sedang";
          rekColor = "text-amber-600";
        } else {
          dayaBedaLabel = `${dayaBeda} (Jelek)`;
          rekomendasi = "Perlu Dibuang / Ditulis Ulang";
          rekColor = "text-rose-600";
        }
      } else if (totalPeserta === 1) {
        dayaBedaLabel = "Perlu ≥2 Siswa";
        rekomendasi = "Menunggu Data Tambahan";
        rekColor = "text-muted-foreground";
      } else {
        dayaBedaLabel = "0.00";
        rekomendasi = "Belum Ada Pengerjaan";
        rekColor = "text-muted-foreground";
      }

      // Distractor breakdown for PG
      const distractors = ["A", "B", "C", "D"].map((opt) => {
        const count = optionCounts[opt] || 0;
        const distPct = totalPeserta > 0 ? Math.round((count / totalPeserta) * 100) : 0;
        const isKey = (q.correctOption || "A").toUpperCase() === opt;
        const isEffective = isKey || distPct >= 5;
        return {
          option: opt,
          count,
          pct: distPct,
          isKey,
          isEffective,
        };
      });

      return {
        no: idx + 1,
        id: q.id,
        pertanyaan: q.questionText || (q as any).question || `Butir Soal #${idx + 1}`,
        tipe: q.questionType === "essay" ? "Essay" : q.questionType === "benar_salah" ? "Benar/Salah" : "Pilihan Ganda",
        kunci: q.correctOption || "A",
        totalPeserta,
        correctCount,
        incorrectCount: Math.max(0, totalPeserta - correctCount),
        pct,
        kesukaran,
        kesukaranColor,
        dayaBeda,
        dayaBedaLabel,
        rekomendasi,
        rekColor,
        distractors,
      };
    });
  }, [questions, rombelFilteredGrades]);

  const mudahCount = itemAnalysisList.filter((x) => x.kesukaran === "Mudah").length;
  const sedangCount = itemAnalysisList.filter((x) => x.kesukaran === "Sedang").length;
  const sukarCount = itemAnalysisList.filter((x) => x.kesukaran === "Sukar").length;

  const handleExportGradesExcel = () => {
    const headers = ["No", "Nama Siswa", "NIS", "Rombel", "Skor PG", "Skor Essay", "Total Nilai", "Status KKM"];
    const rows = sortedGrades.map((g, idx) => [
      idx + 1,
      g.name,
      g.nis,
      g.classRombel,
      g.pgScore,
      g.essayScore,
      g.totalScore,
      g.status,
    ]);
    exportToExcelXml("Rekap_Nilai_CBT", "Nilai_CBT", headers, rows);
    toast.success("File Excel Rekap Nilai CBT Berhasil Diunduh!");
  };

  const handleExportItemAnalysisExcel = () => {
    const headers = [
      "No Soal",
      "Tipe Soal",
      "Indikator / Butir Soal",
      "Kunci",
      "Total Peserta",
      "Benar",
      "Salah",
      "% Benar (Tingkat Ketercapaian)",
      "Tingkat Kesukaran (P)",
      "Daya Pembeda (D)",
      "Pilihan A (%)",
      "Pilihan B (%)",
      "Pilihan C (%)",
      "Pilihan D (%)",
      "Status Rekomendasi",
    ];
    const rows = itemAnalysisList.map((item) => {
      const distA = item.distractors?.find((d) => d.option === "A")?.pct ?? "-";
      const distB = item.distractors?.find((d) => d.option === "B")?.pct ?? "-";
      const distC = item.distractors?.find((d) => d.option === "C")?.pct ?? "-";
      const distD = item.distractors?.find((d) => d.option === "D")?.pct ?? "-";
      return [
        item.no,
        item.tipe,
        item.pertanyaan,
        item.kunci,
        item.totalPeserta,
        item.correctCount,
        item.incorrectCount,
        `${item.pct}%`,
        item.kesukaran,
        item.dayaBedaLabel,
        `${distA}%`,
        `${distB}%`,
        `${distC}%`,
        `${distD}%`,
        item.rekomendasi,
      ];
    });
    exportToExcelXml("Analisis_Butir_Soal_CBT", "Analisis_Soal", headers, rows);
    toast.success("File Excel Analisis Butir Soal Berhasil Diunduh!");
  };

  const handleOpenRemedialModal = (item: CBTGradeAnalysisItem) => {
    setSelectedStudent(item);
    setIsRemedialModalOpen(true);
  };

  const handleOpenEnrichmentModal = (item: CBTGradeAnalysisItem) => {
    setSelectedStudent(item);
    setIsEnrichmentModalOpen(true);
  };

  const handleSendRemedialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    onSendRemedial?.(selectedStudent.id, selectedStudent.name);
    toast.success("⚡ Ujian Remedial Berhasil Dikirim!", {
      description: `Tugas/Sesi Perbaikan telah dikirim ke akun siswa: ${selectedStudent.name}`,
    });
    setIsRemedialModalOpen(false);
  };

  const handleSendEnrichmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    onSendEnrichment?.(selectedStudent.id, selectedStudent.name);
    toast.success("🌟 Modul Pengayaan HOTS Berhasil Dikirim!", {
      description: `Materi Pengayaan telah dikirim ke akun siswa: ${selectedStudent.name}`,
    });
    setIsEnrichmentModalOpen(false);
  };

  // Siswa View Layout (Personal Result Card)
  if (isSiswa) {
    const myGrade = filteredGrades[0] || grades[0];
    const isPassed = myGrade ? myGrade.status === "Lulus KKM" : false;

    return (
      <div className="space-y-6">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">Transkrip Nilai CBT Saya</CardTitle>
                  <CardDescription className="text-xs">
                    Siswa: <span className="font-semibold text-foreground">{studentName}</span> | Rombel: {myGrade?.classRombel || "Rombel 8B"}
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant={isPassed ? "default" : "destructive"}
                className={`text-xs font-bold px-3 py-1 ${
                  isPassed
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-500/10 text-amber-600 border-amber-300"
                }`}
              >
                {isPassed ? "✓ LULUS KKM (≥75)" : "⚠ PERLU REMEDIAL (<75)"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground font-semibold">Skor Pilihan Ganda (PG)</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{myGrade?.pgScore || 0}</h3>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground font-semibold">Skor Koreksi Essay</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{myGrade?.essayScore || 0}</h3>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-xs text-muted-foreground font-semibold">Total Nilai Akhir CBT</p>
                <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {myGrade?.totalScore || 0} / 100
                </h3>
              </div>
            </div>

            {/* Action Notice for Remedial or Enrichment */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                isPassed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-sm">
                {isPassed ? <Sparkles className="h-4 w-4 text-emerald-600" /> : <Zap className="h-4 w-4 text-amber-500" />}
                {isPassed ? "🌟 Selamat! Anda Lulus KKM (75)" : "⚡ Tindak Lanjut Program Remedial"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isPassed
                  ? "Capaian evaluasi Anda memenuhi batas KKM. Silakan akses Modul Pengayaan HOTS untuk pendalaman materi."
                  : "Nilai Anda di bawah KKM 75 atau belum mengikuti ujian CBT. Hubungi guru pengampu jika memerlukan sesi susulan/remedial."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode View Switcher: Rekap Nilai Siswa vs Analisis Butir Soal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="inline-flex rounded-xl border border-border p-1 bg-muted/40">
          <button
            type="button"
            onClick={() => setViewMode("nilai")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === "nilai"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📊 Rekap Nilai Siswa
          </button>
          <button
            type="button"
            onClick={() => setViewMode("butir_soal")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              viewMode === "butir_soal"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📈 Analisis Butir Soal (Item Analysis)
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Rombel Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-card px-2.5 py-1 rounded-lg border border-border">
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={selectedRombel}
              onChange={(e) => setSelectedRombel(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Rombel ({grades.length} Siswa)</option>
              {availableRombels.map((r) => (
                <option key={r} value={r}>
                  {r} ({grades.filter((g) => g.classRombel === r).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          {canManage && remedialStudents > 0 && onCreateRemedialExam && (
            <Button
              size="sm"
              onClick={onCreateRemedialExam}
              className="gap-1.5 font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
            >
              <Zap className="h-4 w-4" /> 1-Klik Buat Sesi Remedial ({remedialStudents} Siswa)
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsBeritaAcaraOpen(true)}
            className="gap-1.5 font-bold text-xs border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 shadow-2xs"
          >
            <Printer className="h-4 w-4" /> Cetak Berita Acara CBT
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={viewMode === "nilai" ? handleExportGradesExcel : handleExportItemAnalysisExcel}
            className="gap-1.5 font-bold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4" /> {viewMode === "nilai" ? "Export Excel Nilai CBT" : "Export Excel Analisis Soal"}
          </Button>
        </div>
      </div>

      {viewMode === "nilai" && (
        <>
          {/* Summary KPI Cards for Teachers & Executives (Real Descriptive Statistics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Total Peserta CBT</p>
                  <h3 className="text-2xl font-bold text-foreground mt-0.5">{stats.total} Siswa</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {selectedRombel === "all" ? "Seluruh Rombel Terdaftar" : selectedRombel}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Ketuntasan Klasikal (≥75)</p>
                  <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {stats.passPct}% ({stats.passed} Siswa)
                  </h3>
                  <p className={`text-[10px] font-semibold mt-1 ${stats.isClassicalPassed ? "text-emerald-600" : "text-amber-600"}`}>
                    {stats.isClassicalPassed ? "✓ Memenuhi Standar (≥85%)" : "⚠ Belum Tuntas (Target 85%)"}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Siswa Perlu Remedial</p>
                  <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    {stats.remedial} Siswa
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Skor Terendah: {stats.min} | Tertinggi: {stats.max}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Zap className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Rata-Rata & Sebaran Nilai</p>
                  <h3 className="text-2xl font-bold text-primary mt-0.5">{stats.avg} / 100</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Median: {stats.median} | Standar Deviasi σ: {stats.stdDev}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <BarChart3 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter & Action Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-2 max-w-lg">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama siswa, NIS, atau rombel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="Lulus KKM">Lulus KKM (≥75)</option>
                <option value="Remedial">Remedial (&lt;75)</option>
              </select>
            </div>
          </div>

      {/* Grade Table Card */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-3 pl-4 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("name")}>
                  <div className="flex items-center gap-1.5">
                    <span>Siswa</span>
                    {sortColumn === "name" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("nis")}>
                  <div className="flex items-center gap-1.5">
                    <span>NIS</span>
                    {sortColumn === "nis" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="p-3 cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("rombel")}>
                  <div className="flex items-center gap-1.5">
                    <span>Rombel</span>
                    {sortColumn === "rombel" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("pg")}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Skor PG</span>
                    {sortColumn === "pg" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("essay")}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Skor Essay</span>
                    {sortColumn === "essay" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="p-3 text-center cursor-pointer hover:bg-muted/80 select-none" onClick={() => handleSort("total")}>
                  <div className="flex items-center justify-center gap-1.5">
                    <span>Total Nilai</span>
                    {sortColumn === "total" ? (
                      sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5 text-primary" /> : <ArrowDown className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40" />
                    )}
                  </div>
                </th>
                <th className="p-3">Status KKM (75)</th>
                <th className="p-3 text-right pr-4">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedGrades.map((g) => {
                const isPassed = g.status === "Lulus KKM";
                const isPendingEssay = g.status === "Perlu Dikoreksi";

                return (
                  <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 pl-4 font-bold text-foreground">{g.name}</td>
                    <td className="p-3 text-muted-foreground font-mono">{g.nis}</td>
                    <td className="p-3 font-medium">{g.classRombel}</td>
                    <td className="p-3 text-center font-semibold">{g.pgScore}</td>
                    <td className="p-3 text-center font-semibold">{g.essayScore}</td>
                    <td className="p-3 text-center">
                      <span className="font-extrabold text-sm text-foreground">{g.totalScore}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant={isPassed ? "default" : isPendingEssay ? "outline" : "destructive"}
                          className={`text-[11px] font-bold ${
                            isPassed
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                              : isPendingEssay
                              ? "bg-blue-500/10 text-blue-600 border-blue-300 dark:border-blue-800"
                              : "bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {isPassed ? "✓ Lulus KKM" : isPendingEssay ? "✍️ Perlu Koreksi" : "⚠ Remedial"}
                        </Badge>
                        {g.violationsCount && g.violationsCount > 0 ? (
                          <Badge variant="outline" className="text-[10px] font-semibold text-red-600 bg-red-500/10 border-red-300">
                            ⚠️ {g.violationsCount}x tab
                          </Badge>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3 text-right pr-4">
                      {isPendingEssay ? (
                        <Button
                          size="sm"
                          onClick={() => {
                            setGradingStudent(g);
                            try {
                              const answers = g.studentAnswers ? JSON.parse(g.studentAnswers) : {};
                              const list = Object.entries(answers)
                                .filter(([_, val]: any) => val.questionType === "essay")
                                .map(([key, val]: any) => ({
                                  key,
                                  ...val,
                                }));
                              setParsedEssayList(list);
                              const initialScores: Record<string, number> = {};
                              list.forEach((item: any) => {
                                initialScores[item.key] = item.score || 0;
                              });
                              setEssayScores(initialScores);
                            } catch {
                              setParsedEssayList([]);
                            }
                            setIsEssayModalOpen(true);
                          }}
                          className="gap-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white h-7 px-2.5 shadow-xs"
                        >
                          <Edit3 className="h-3 w-3" /> Koreksi Essay
                        </Button>
                      ) : isPassed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEnrichmentModal(g)}
                          disabled={!isGuru && !isExecutive}
                          className="gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-500/10 h-7 px-2.5"
                        >
                          <Sparkles className="h-3 w-3" /> Kirim Pengayaan
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRemedialModal(g)}
                          disabled={!isGuru && !isExecutive}
                          className="gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 border-amber-300 hover:bg-amber-500/10 h-7 px-2.5"
                        >
                          <Zap className="h-3 w-3 text-amber-500" /> Kirim Remedial
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )}

  {viewMode === "butir_soal" && (
    <>
      {/* Summary KPI Cards for Item Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Butir Soal Evaluasi</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{itemAnalysisList.length} Soal</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kategori Mudah (P &ge; 70%)</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {mudahCount} Soal ({itemAnalysisList.length > 0 ? Math.round((mudahCount / itemAnalysisList.length) * 100) : 0}%)
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kategori Sedang (30-69%)</p>
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                {sedangCount} Soal ({itemAnalysisList.length > 0 ? Math.round((sedangCount / itemAnalysisList.length) * 100) : 0}%)
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Kategori Sukar (P &lt; 30%)</p>
              <h3 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                {sukarCount} Soal ({itemAnalysisList.length > 0 ? Math.round((sukarCount / itemAnalysisList.length) * 100) : 0}%)
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <AlertCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Item Analysis Table Card */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" /> Matriks Analisis Butir Soal (Tingkat Kesukaran & Daya Beda)
            </CardTitle>
            <CardDescription className="text-xs">
              Dihitung secara riil dari capaian evaluasi siswa yang mengikuti ujian CBT madrasah.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono font-bold bg-primary/10 text-primary border-primary/30 w-fit">
            Rata-rata Daya Serap: {avgScore}%
          </Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-3 pl-4 w-12 text-center">No</th>
                <th className="p-3">Indikator / Teks Butir Soal</th>
                <th className="p-3 text-center">Tipe</th>
                <th className="p-3 text-center w-16">Kunci</th>
                <th className="p-3 text-center">Jml Benar</th>
                <th className="p-3 text-center">Tingkat Kesukaran (P)</th>
                <th className="p-3 text-center">Daya Pembeda (D)</th>
                <th className="p-3 text-center">Sebaran Pengecoh (Distractor A-D)</th>
                <th className="p-3 text-right pr-4">Status / Rekomendasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {itemAnalysisList.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 pl-4 text-center font-mono font-bold text-muted-foreground">{item.no}</td>
                  <td className="p-3">
                    <div className="font-semibold text-foreground max-w-md truncate" title={item.pertanyaan}>
                      {item.pertanyaan}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="outline" className="text-[10px] font-medium bg-muted/40">
                      {item.tipe}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                      {item.kunci}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-semibold">
                    {item.correctCount} / {item.totalPeserta}
                  </td>
                  <td className="p-3 text-center">
                    <div className="space-y-0.5">
                      <span className="font-mono font-extrabold text-xs text-foreground">{item.pct}%</span>
                      <div>
                        <Badge variant="outline" className={`text-[10px] font-bold ${item.kesukaranColor}`}>
                          {item.kesukaran}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center font-mono text-muted-foreground font-semibold">
                    <span className="font-bold text-xs text-foreground">{item.dayaBedaLabel}</span>
                  </td>
                  <td className="p-3 text-center">
                    {item.tipe === "Pilihan Ganda" && item.distractors ? (
                      <div className="flex items-center justify-center gap-1 flex-wrap max-w-[200px] mx-auto">
                        {item.distractors.map((d) => (
                          <span
                            key={d.option}
                            title={`Opsi ${d.option}: ${d.count} siswa (${d.pct}%) ${
                              d.isKey ? "— Kunci Jawaban Benar" : d.isEffective ? "— Pengecoh Efektif" : "— Kurang Berfungsi"
                            }`}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${
                              d.isKey
                                ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold"
                                : d.count > 0
                                ? "bg-muted/60 text-muted-foreground border-border font-medium"
                                : "bg-rose-500/10 text-rose-500 border-rose-300/30 opacity-70"
                            }`}
                          >
                            {d.option}:{d.pct}%
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="p-3 text-right pr-4">
                    <span className={`font-bold text-[11px] ${item.rekColor}`}>
                      {item.rekomendasi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )}

      {/* Remedial Modal */}
      <Dialog open={isRemedialModalOpen} onOpenChange={setIsRemedialModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Zap className="h-5 w-5 text-amber-500" /> Penugasan Remedial CBT
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Kirimkan ujian susulan / tugas remedial untuk siswa:{" "}
              <span className="font-bold text-foreground">{selectedStudent?.name}</span> (Nilai: {selectedStudent?.totalScore})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendRemedialSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Instruksi & Materi Remedial</Label>
              <textarea
                rows={3}
                value={remedialNote}
                onChange={(e) => setRemedialNote(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background text-xs focus:outline-none"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRemedialModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" /> Kirim Remedial Ke Siswa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enrichment Modal */}
      <Dialog open={isEnrichmentModalOpen} onOpenChange={setIsEnrichmentModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-emerald-600" /> Penugasan Modul Pengayaan (HOTS)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Berikan materi tantangan pengayaan untuk siswa tuntas KKM:{" "}
              <span className="font-bold text-foreground">{selectedStudent?.name}</span> (Nilai: {selectedStudent?.totalScore})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendEnrichmentSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Instruksi & Materi Pengayaan</Label>
              <textarea
                rows={3}
                value={enrichmentNote}
                onChange={(e) => setEnrichmentNote(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background text-xs focus:outline-none"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEnrichmentModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" /> Kirim Modul Pengayaan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Essay Grading Modal for Teachers */}
      <Dialog open={isEssayModalOpen} onOpenChange={setIsEssayModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Edit3 className="h-5 w-5 text-blue-600" /> Koreksi Soal Essay / Uraian Siswa
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Siswa: <span className="font-bold text-foreground">{gradingStudent?.name}</span> ({gradingStudent?.classRombel}) • Nilai PG Sementara: {gradingStudent?.pgScore}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {parsedEssayList.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Tidak ada butir soal essay yang perlu dikoreksi.</p>
            ) : (
              parsedEssayList.map((item, idx) => {
                const isAnsAr = isArabicText(item.studentAnswer);
                const isQAr = isArabicText(item.questionText);
                return (
                  <div key={item.key || idx} className="p-4 rounded-xl border border-border bg-card space-y-3 shadow-xs">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs font-bold">
                        Butir Essay #{idx + 1}
                      </Badge>
                      <span className="text-xs text-muted-foreground font-semibold">
                        Poin Maks: {item.maxPoints || 10}
                      </span>
                    </div>

                    <div
                      dir={isQAr ? "rtl" : "ltr"}
                      className={`text-foreground ${isQAr ? "font-arabic text-lg font-bold" : "text-xs font-semibold"}`}
                    >
                      {item.questionText}
                    </div>

                    {/* Student Answer */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-muted-foreground block">Jawaban Siswa:</span>
                      <div
                        dir={isAnsAr ? "rtl" : "ltr"}
                        className={`p-3 rounded-lg border bg-muted/30 border-border text-foreground leading-relaxed ${
                          isAnsAr ? "font-arabic text-lg leading-loose text-right" : "text-xs"
                        }`}
                      >
                        {item.studentAnswer || <span className="italic text-muted-foreground">(Siswa tidak mengisi jawaban)</span>}
                      </div>
                    </div>

                    {/* Teacher Score Input */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <Label className="text-xs font-semibold">Beri Skor Poin:</Label>
                      <Input
                        type="number"
                        min={0}
                        max={item.maxPoints || 10}
                        value={essayScores[item.key] ?? 0}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setEssayScores((prev) => ({
                            ...prev,
                            [item.key]: val,
                          }));
                        }}
                        className="w-24 h-8 text-xs text-center font-bold"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsEssayModalOpen(false)} className="text-xs">
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                if (!gradingStudent) return;
                const totalEssay = Object.values(essayScores).reduce((a, b) => a + Number(b), 0);
                const finalTotal = gradingStudent.pgScore + totalEssay;
                const finalStatus = finalTotal >= (gradingStudent.kkm || 75) ? "Lulus KKM" : "Remedial";

                // update studentAnswers JSON
                let answersObj: any = {};
                try {
                  answersObj = gradingStudent.studentAnswers ? JSON.parse(gradingStudent.studentAnswers) : {};
                } catch {}
                parsedEssayList.forEach((item) => {
                  if (answersObj[item.key]) {
                    answersObj[item.key].score = essayScores[item.key] || 0;
                    answersObj[item.key].graded = true;
                  }
                });

                onGradeEssay?.(
                  gradingStudent.id,
                  totalEssay,
                  finalTotal,
                  finalStatus,
                  JSON.stringify(answersObj)
                );
                toast.success("✅ Nilai Essay Berhasil Disimpan & Dikalkulasi!", {
                  description: `Total Nilai Akhir: ${finalTotal}/100 (${finalStatus})`,
                });
                setIsEssayModalOpen(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4" /> Simpan Nilai Essay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Official Berita Acara & Daftar Hadir Modal */}
      <Dialog open={isBeritaAcaraOpen} onOpenChange={setIsBeritaAcaraOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Pratinjau Berita Acara & Rekapitulasi Resmi CBT
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Format dokumen resmi pelaksanaan Ujian CBT MTs Negeri 2 Cilacap siap cetak (Kemenag).
                </DialogDescription>
              </div>
              <Button
                size="sm"
                onClick={() => window.print()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-xs"
              >
                <Printer className="h-4 w-4" /> Cetak / Unduh PDF
              </Button>
            </div>
          </DialogHeader>

          {/* Printable Document Sheet */}
          <div className="p-6 bg-white text-black dark:bg-zinc-950 dark:text-zinc-100 rounded-lg border text-xs space-y-4 print:p-0 print:border-none">
            {/* Kop Surat Resmi Madrasah */}
            <div className="text-center space-y-0.5 border-b-2 border-black dark:border-white pb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h4>
              <h3 className="text-sm font-bold uppercase tracking-wider">KANTOR KEMENTERIAN AGAMA KABUPATEN CILACAP</h3>
              <h2 className="text-base font-extrabold uppercase tracking-wide">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</h2>
              <p className="text-[10px] text-zinc-600 dark:text-zinc-400">
                Jl. Kemerdekaan Barat No. 1 Kesugihan, Cilacap, Jawa Tengah 53274 | Website: mtsn2cilacap.sch.id
              </p>
            </div>

            {/* Title */}
            <div className="text-center pt-2 space-y-1">
              <h3 className="text-sm font-bold uppercase tracking-wide underline underline-offset-4">
                BERITA ACARA & DAFTAR NILAI CBT ASESMEN MADRASAH
              </h3>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                Tahun Ajaran 2026/2027 — Semester Genap
              </p>
            </div>

            {/* Exam Meta Info */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border text-[11px]">
              <div>
                <span className="font-semibold text-zinc-500">Mata Pelajaran:</span>{" "}
                <span className="font-bold">{grades[0]?.subjectName || "Mata Pelajaran Ujian"}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-500">Kelas / Rombel:</span>{" "}
                <span className="font-bold">{grades[0]?.classRombel || "Semua Rombel"}</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-500">KKM / Kriteria Ketuntasan:</span>{" "}
                <span className="font-bold">75</span>
              </div>
              <div>
                <span className="font-semibold text-zinc-500">Total Peserta Mengerjakan:</span>{" "}
                <span className="font-bold">{totalStudents} Siswa ({passedStudents} Tuntas, {remedialStudents} Remedial)</span>
              </div>
            </div>

            {/* Table of Grades */}
            <table className="w-full border-collapse border border-zinc-300 dark:border-zinc-700 text-[11px]">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800 text-left">
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center w-8">No</th>
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center w-20">NIS</th>
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2">Nama Peserta Didik</th>
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center w-16">Nilai PG</th>
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center w-16">Nilai Essay</th>
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center w-16">Nilai Akhir</th>
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center w-24">Status</th>
                  <th className="border border-zinc-300 dark:border-zinc-700 p-2 text-center w-24">Integritas</th>
                </tr>
              </thead>
              <tbody>
                {sortedGrades.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center">{idx + 1}</td>
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center font-mono">{item.nis}</td>
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 font-medium">{item.name}</td>
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center">{item.pgScore}</td>
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center">{item.essayScore}</td>
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center font-bold">{item.totalScore}</td>
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center font-semibold">
                      {item.status}
                    </td>
                    <td className="border border-zinc-300 dark:border-zinc-700 p-2 text-center text-[10px]">
                      {item.violationsCount && item.violationsCount > 0 ? (
                        <span className="text-red-600 font-semibold">{item.violationsCount}x tab</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">Tertib</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signature Block */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[11px]">
              <div>
                <p className="text-zinc-500">Mengetahui,</p>
                <p className="font-bold">Kepala MTs Negeri 2 Cilacap</p>
                <div className="h-16" />
                <p className="font-bold underline">H. DRS. SUGENG WARDOYO, M.Pd.I</p>
                <p className="text-zinc-500">NIP. 197005121997031002</p>
              </div>
              <div>
                <p className="text-zinc-500">Cilacap, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                <p className="font-bold">Guru Pengampu / Proktor CBT</p>
                <div className="h-16" />
                <p className="font-bold underline">GURU MATA PELAJARAN</p>
                <p className="text-zinc-500">NIP. -</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsBeritaAcaraOpen(false)} className="text-xs">
              Tutup
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
            >
              <Printer className="h-4 w-4" /> Cetak Berita Acara
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
