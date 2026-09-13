import React, { useState, useEffect, useMemo } from "react";
import { MysqlDataService } from "@/services/mysqlDataService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MonitorCheck, Brain, BarChart3, Download, ShieldCheck, Building2, Users, Filter, Search, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { CBTLiveSession } from "./CBTLiveSession";
import { CBTQuestionBank } from "./CBTQuestionBank";
import { CBTGradeAnalysis } from "./CBTGradeAnalysis";
import { CBTExamPlayerModal } from "./CBTExamPlayerModal";
import { CBTExam, CBTQuestion, CBTGradeAnalysisItem } from "@/types/cbt";
import { isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { isSameClass, normalizeRombelName, resolveWaliKelasRombel } from "@/utils/classNormalization";

import { MysqlAuthService } from "@/services/mysqlAuthService";

interface CBTModuleProps {
  userRole?: string;
  studentName?: string;
  trialBadge?: string;
}

export const CBTModule: React.FC<CBTModuleProps> = ({
  userRole = "siswa",
  studentName = "Siswa Madrasah",
  trialBadge,
}) => {
  const isExecutive = userRole === "kamad" || userRole === "waka" || userRole === "admin" || userRole === "kepala_madrasah" || userRole === "admin_akademik";
  const isGuruRole = userRole === "guru" || (userRole || "").includes("guru");
  const isWaliKelas = userRole === "walikelas" || (userRole || "").includes("walikelas");

  const me = MysqlAuthService.getActiveUser();
  const rawClass = me?.class_name;

  const binaanRombel = resolveWaliKelasRombel(me, null, "kelas");

  const defaultRombel = isWaliKelas ? binaanRombel : normalizeRombelName(rawClass || "Kelas 8A");

  const [activeTab, setActiveTab] = useState<"sesi" | "bank_soal" | "analisis">("sesi");
  const [selectedRombel, setSelectedRombel] = useState<string>(isWaliKelas ? binaanRombel : isExecutive ? "ALL" : defaultRombel);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (isWaliKelas) {
      setSelectedRombel(binaanRombel);
    }
  }, [isWaliKelas, binaanRombel]);

  // State Ujian Active Sessions & Results
  const [exams, setExams] = useState<CBTExam[]>([]);
  const [gradeAnalysis, setGradeAnalysis] = useState<CBTGradeAnalysisItem[]>([]);
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);
  const [masterRombels, setMasterRombels] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      MysqlDataService.getCbtExams().catch(() => []),
      MysqlDataService.getCbtResults().catch(() => []),
      MysqlDataService.getMasterRombels().catch(() => []),
      MysqlDataService.getCbtQuestions().catch(() => []),
    ])
      .then(([dbExams, dbResults, rombels, dbQuestions]) => {
        if (!isMounted) return;

        if (rombels && rombels.length > 0) {
          setMasterRombels(rombels);
        }

        if (dbQuestions && dbQuestions.length > 0) {
          const mappedQ: CBTQuestion[] = dbQuestions.map((q: any) => ({
            id: String(q.id),
            examId: String(q.exam_id || "1"),
            questionType: (q.question_type || "pg") as any,
            questionText: q.question_text || "",
            imageUrl: q.image_url || undefined,
            audioUrl: q.audio_url || undefined,
            options: {
              A: q.option_a || "",
              B: q.option_b || "",
              C: q.option_c || "",
              D: q.option_d || "",
            },
            correctOption: q.correct_option || "A",
            points: Number(q.points) || 5,
            difficulty: "Sedang",
            author: me?.full_name || "Guru Pengampu",
            mapel: "Umum",
          }));
          setQuestions(mappedQ);
        } else {
          setQuestions([]);
        }

        if (dbExams && dbExams.length > 0) {
          const mapped = dbExams.map((e: any) => ({
            id: String(e.id || Date.now()),
            title: e.title,
            mapel: e.subject_name || "Mata Pelajaran",
            kelas: normalizeRombelName(e.class_name || "Rombel 8A"),
            durasi: String(e.duration_minutes || 60),
            durationMinutes: e.duration_minutes || 60,
            soalCount: e.total_questions || 20,
            token: e.token || "MTS2-CBT",
            passingScore: e.passing_score || 75,
            status: (e.status || "Dibuka") as any,
            randomizeQuestions: Boolean(e.randomize_questions),
            randomizeOptions: Boolean(e.randomize_options),
            questionLimit: Number(e.question_limit || 0),
            isRemedial: Boolean(e.is_remedial),
            parentExamId: e.parent_exam_id || null,
          }));
          setExams(mapped);
        } else {
          setExams([]);
        }

        if (dbResults && dbResults.length > 0) {
          const mapped = dbResults.map((r: any) => ({
            id: String(r.id),
            examId: String(r.exam_id || "1"),
            name: r.student_name || "Siswa",
            nis: r.student_nis || r.nis || "-",
            classRombel: normalizeRombelName(r.rombel || r.class_name || "Rombel 8A"),
            subjectName: r.subject_name || "Mata Pelajaran",
            pgScore: Number(r.score || 0) - Number(r.essay_score || 0),
            essayScore: Number(r.essay_score || 0),
            totalScore: Number(r.score || 0),
            status: (r.status || (r.score >= 75 ? "Lulus KKM" : "Remedial")) as any,
            kkm: 75,
            studentAnswers: r.student_answers,
            violationsCount: Number(r.violations_count || 0),
          }));
          setGradeAnalysis(mapped);
        } else {
          setGradeAnalysis([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute list of dynamic class options
  const rombelOptions = useMemo(() => {
    const set = new Set<string>(["Kelas 7A", "Kelas 7B", "Kelas 8A", "Kelas 8B", "Kelas 9A", "Kelas 9B"]);
    masterRombels.forEach((r) => {
      if (r.name) set.add(normalizeRombelName(r.name));
      if (r.code) set.add(normalizeRombelName(r.code));
    });
    exams.forEach((e) => {
      if (e.kelas) set.add(normalizeRombelName(e.kelas));
    });
    gradeAnalysis.forEach((g) => {
      if (g.classRombel) set.add(normalizeRombelName(g.classRombel));
    });
    return Array.from(set).sort();
  }, [masterRombels, exams, gradeAnalysis]);

  // Executive CBT Summary Statistics (Kamad & Waka View)
  const cbtOverallStats = useMemo(() => {
    const activeExamsCount = exams.filter((e) => e.status === "Dibuka").length;
    const totalResults = gradeAnalysis.length;
    const totalScoreSum = gradeAnalysis.reduce((acc, g) => acc + g.totalScore, 0);
    const avgScoreMadrasah = totalResults > 0 ? Math.round(totalScoreSum / totalResults) : 0;
    const passedCount = gradeAnalysis.filter((g) => g.status === "Lulus KKM").length;
    const passPercentage = totalResults > 0 ? Math.round((passedCount / totalResults) * 100) : 0;

    return {
      totalRombel: rombelOptions.length,
      activeExamsCount,
      totalResults,
      avgScoreMadrasah,
      passPercentage,
    };
  }, [exams, gradeAnalysis, rombelOptions]);

  // Exam Player State
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<CBTExam | null>(null);

  const handleStartExam = (exam: CBTExam) => {
    setActiveExam(exam);
    setIsPlayerOpen(true);
  };

  const handleCreateExam = async (newExam: Partial<CBTExam>) => {
    try {
      const res = await MysqlDataService.saveCbtExam({
        title: newExam.title || "Ujian CBT Baru",
        subject_name: newExam.mapel || "Matematika",
        token: (newExam.token || "MTS2-NEW").toUpperCase(),
        duration_minutes: newExam.durationMinutes || 60,
        passing_score: newExam.passingScore || 75,
        class_name: newExam.kelas || "Semua Kelas",
        randomize_questions: newExam.randomizeQuestions ? 1 : 0,
        randomize_options: newExam.randomizeOptions ? 1 : 0,
        question_limit: newExam.questionLimit || 0,
        is_remedial: newExam.isRemedial ? 1 : 0,
        parent_exam_id: newExam.parentExamId || null,
      });

      const examObj: CBTExam = {
        id: String(res.id || Date.now()),
        title: newExam.title || "Ujian CBT Baru",
        mapel: newExam.mapel || "Matematika",
        kelas: normalizeRombelName(newExam.kelas || "Semua Kelas"),
        token: (newExam.token || "MTS2-NEW").toUpperCase(),
        durationMinutes: newExam.durationMinutes || 60,
        passingScore: newExam.passingScore || 75,
        soalCount: 20,
        status: "Dibuka",
        randomizeQuestions: newExam.randomizeQuestions,
        randomizeOptions: newExam.randomizeOptions,
        questionLimit: newExam.questionLimit,
        isRemedial: newExam.isRemedial,
      };

      setExams((prev) => [examObj, ...prev]);
    } catch (e) {
      console.warn("Gagal menyimpan ujian CBT ke MySQL:", e);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      await MysqlDataService.deleteCbtExam(examId);
      setExams((prev) => prev.filter((e) => e.id !== examId));
      toast.success("Sesi ujian CBT berhasil dihapus.");
    } catch (e) {
      console.warn("Gagal menghapus ujian CBT:", e);
    }
  };

  const handleAddQuestion = async (newQ: CBTQuestion) => {
    try {
      const res = await MysqlDataService.saveCbtQuestion({
        exam_id: Number(newQ.examId) || (activeExam?.id ? Number(activeExam.id) : 1),
        question_text: newQ.questionText,
        question_type: newQ.questionType || "pg",
        image_url: newQ.imageUrl,
        audio_url: newQ.audioUrl,
        option_a: newQ.options.A || "",
        option_b: newQ.options.B || "",
        option_c: newQ.options.C || "",
        option_d: newQ.options.D || "",
        correct_option: newQ.correctOption,
        points: newQ.points,
      });
      const savedQ = { ...newQ, id: String(res.id || newQ.id) };
      setQuestions((prev) => [savedQ, ...prev]);
    } catch (err) {
      console.warn("Gagal menyimpan butir soal CBT ke MySQL:", err);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await MysqlDataService.deleteCbtQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      toast.success("Butir soal berhasil dihapus dari Bank Soal.");
    } catch (err) {
      console.warn("Gagal menghapus butir soal:", err);
    }
  };

  const handleGradeEssay = async (
    resultId: string,
    essayScore: number,
    totalScore: number,
    status: "Lulus KKM" | "Remedial",
    studentAnswers: string
  ) => {
    try {
      await MysqlDataService.gradeCbtEssay({
        result_id: resultId,
        essay_score: essayScore,
        total_score: totalScore,
        status,
        student_answers: studentAnswers,
      });

      setGradeAnalysis((prev) =>
        prev.map((g) =>
          g.id === resultId
            ? {
                ...g,
                essayScore,
                totalScore,
                status,
                studentAnswers,
              }
            : g
        )
      );
    } catch (e) {
      console.warn("Gagal mengupdate nilai essay:", e);
    }
  };

  const handleCreateRemedialExam = async () => {
    const parentExam = exams[0];
    if (!parentExam) return toast.error("Belum ada ujian induk yang dapat diremedialkan.");

    const remToken = `${parentExam.token.replace(/-REM.*$/, "")}-REM`;
    await handleCreateExam({
      title: `[REMEDIAL] ${parentExam.title.replace(/^\[REMEDIAL\]\s*/, "")}`,
      mapel: parentExam.mapel,
      kelas: parentExam.kelas,
      token: remToken,
      durationMinutes: parentExam.durationMinutes,
      passingScore: parentExam.passingScore,
      randomizeQuestions: true,
      randomizeOptions: true,
      questionLimit: parentExam.questionLimit,
      isRemedial: true,
      parentExamId: Number(parentExam.id) || null,
    });
    toast.success(`⚡ Sesi Remedial Berhasil Dibuat! Token: ${remToken}`);
  };

  const handleExamComplete = (result: { scorePg: number; totalScore: number; violationCount: number }) => {
    // Refresh results from DB
    MysqlDataService.getCbtResults()
      .then((dbResults) => {
        if (dbResults && dbResults.length > 0) {
          const mapped = dbResults.map((r: any) => ({
            id: String(r.id),
            examId: String(r.exam_id || "1"),
            name: r.student_name || "Siswa",
            nis: r.student_nis || r.nis || "-",
            classRombel: normalizeRombelName(r.rombel || r.class_name || "Rombel 8A"),
            subjectName: r.subject_name || "Mata Pelajaran",
            pgScore: Number(r.score || 0) - Number(r.essay_score || 0),
            essayScore: Number(r.essay_score || 0),
            totalScore: Number(r.score || 0),
            status: (r.status || (r.score >= 75 ? "Lulus KKM" : "Remedial")) as any,
            kkm: 75,
            studentAnswers: r.student_answers,
          }));
          setGradeAnalysis(mapped);
        }
      })
      .catch(() => {});
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "siswa":
        return "Siswa (Peserta CBT)";
      case "guru":
        return "Guru Pengampu";
      case "walikelas":
      case "wali_kelas":
        return "Wali Kelas";
      case "waka":
        return "Waka Kurikulum";
      case "kamad":
        return "Kepala Madrasah";
      case "admin_akademik":
        return "Admin Akademik";
      case "admin":
        return "Super Administrator";
      default:
        return userRole;
    }
  };

  // Filtered Exams by Subject Permission & Selected Rombel
  const visibleExams = useMemo(() => {
    return exams.filter((e) => {
      const matchSubject = !isGuruRole || isSubjectAllowedForUser(e.mapel || "");
      const matchRombel = selectedRombel === "ALL" || isSameClass(e.kelas || "", selectedRombel);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.mapel.toLowerCase().includes(q) ||
        e.token.toLowerCase().includes(q) ||
        e.kelas.toLowerCase().includes(q);
      return matchSubject && matchRombel && matchQuery;
    });
  }, [exams, isGuruRole, selectedRombel, searchQuery]);

  // Filtered Questions
  const visibleQuestions = useMemo(() => {
    return isGuruRole ? questions.filter((q) => isSubjectAllowedForUser(q.mapel || "")) : questions;
  }, [questions, isGuruRole]);

  // Filtered Grade Analysis by Subject Permission & Selected Rombel
  const visibleGradeAnalysis = useMemo(() => {
    return gradeAnalysis.filter((g) => {
      const matchSubject = !isGuruRole || isSubjectAllowedForUser(g.subjectName || "");
      const matchRombel = selectedRombel === "ALL" || isSameClass(g.classRombel || "", selectedRombel);
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.nis.toLowerCase().includes(q) ||
        g.classRombel.toLowerCase().includes(q) ||
        g.subjectName.toLowerCase().includes(q);
      return matchSubject && matchRombel && matchQuery;
    });
  }, [gradeAnalysis, isGuruRole, selectedRombel, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      {userRole === "siswa" ? (
        <StudentHeaderBanner
          title="Ujian CBT & Asesmen Digital"
          icon={MonitorCheck}
          studentNisn={me?.nis_nip}
          statusText="CBT Engine Siap Digunakan"
          statusVariant="success"
        />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <MonitorCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isWaliKelas
                  ? `Monitoring CBT Engine — ${binaanRombel}`
                  : selectedRombel === "ALL"
                    ? "Monitoring CBT Engine & Assessment Center (Seluruh Kelas)"
                    : `Monitoring CBT Engine — ${selectedRombel}`}
              </span>
              {trialBadge && (
                <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground border-border bg-muted/40 font-mono">
                  {trialBadge}
                </Badge>
              )}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold border-border px-3 text-muted-foreground hover:text-foreground"
              onClick={() => toast.success("Template Bank Soal Excel Diunduh!")}
            >
              <Download className="h-3.5 w-3.5" /> Template Excel
            </Button>
          </div>
        </div>
      )}

      {/* Kelas Filter & Search Bar */}
      {userRole !== "siswa" && (
        <div className="p-2.5 rounded-xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 shadow-2xs text-xs">
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Filter Kelas:</span>
            {isWaliKelas ? (
              <div className="h-8 px-2.5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 flex items-center gap-1.5 font-bold text-xs text-emerald-700 dark:text-emerald-300">
                <Building2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{binaanRombel}</span>
              </div>
            ) : (
              <select
                className="h-8 rounded-lg border border-border bg-background px-2.5 text-xs font-semibold text-foreground cursor-pointer hover:border-primary/50 transition min-w-[200px]"
                value={selectedRombel}
                onChange={(e) => setSelectedRombel(e.target.value)}
              >
                {isExecutive && (
                  <option value="ALL" className="font-bold">
                    ✨ Semua Kelas (Seluruh Madrasah)
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

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari ujian, mapel, token..."
                className="pl-8 h-8 text-xs rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Compact Metric Strip (~42px) for Kamad & Waka */}
      {isExecutive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-muted/30 border border-border/80 rounded-xl p-2 text-xs">
          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <MonitorCheck className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Sesi CBT Aktif</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{cbtOverallStats.activeExamsCount} Sesi Live</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Users className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Total Peserta CBT</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{cbtOverallStats.totalResults} Siswa</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BarChart3 className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Rata-Rata Nilai</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-tight mt-0.5">{cbtOverallStats.avgScoreMadrasah} Poin</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-background/90 rounded-lg border border-border/50 shadow-2xs">
            <div className="h-7 w-7 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <GraduationCap className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium leading-none">Kelulusan KKM (≥75)</p>
              <p className="text-sm font-bold text-foreground leading-tight mt-0.5">{cbtOverallStats.passPercentage}% Lulus</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tabs Navigation (Segmented Pill Style) */}
      <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/70 h-9 w-fit">
        <Button
          size="sm"
          variant={activeTab === "sesi" ? "default" : "ghost"}
          className={`gap-1.5 text-xs font-bold h-7 px-3 rounded-lg ${activeTab === "sesi" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("sesi")}
        >
          <MonitorCheck className="h-3.5 w-3.5" /> 1. Sesi Ujian Live CBT
        </Button>
        {userRole !== "siswa" && (
          <Button
            size="sm"
            variant={activeTab === "bank_soal" ? "default" : "ghost"}
            className={`gap-1.5 text-xs font-bold h-7 px-3 rounded-lg ${activeTab === "bank_soal" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab("bank_soal")}
          >
            <Brain className="h-3.5 w-3.5" /> 2. Bank Soal
          </Button>
        )}
        <Button
          size="sm"
          variant={activeTab === "analisis" ? "default" : "ghost"}
          className={`gap-1.5 text-xs font-bold h-7 px-3 rounded-lg ${activeTab === "analisis" ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs" : "text-muted-foreground hover:text-foreground"}`}
          onClick={() => setActiveTab("analisis")}
        >
          <BarChart3 className="h-3.5 w-3.5" /> {userRole === "siswa" ? "2. Riwayat Nilai CBT Saya" : "3. Analisis KKM & Remedial"}
        </Button>
      </div>

      {/* Tab Panels */}
      {activeTab === "sesi" && (
        <CBTLiveSession
          exams={visibleExams}
          userRole={userRole}
          onStartExam={handleStartExam}
          onCreateExam={handleCreateExam}
          onDeleteExam={handleDeleteExam}
        />
      )}

      {activeTab === "bank_soal" && (
        <CBTQuestionBank
          questions={visibleQuestions}
          userRole={userRole}
          onAddQuestion={handleAddQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}

      {activeTab === "analisis" && (
        <CBTGradeAnalysis
          grades={visibleGradeAnalysis}
          questions={visibleQuestions}
          userRole={userRole}
          studentName={studentName}
          onGradeEssay={handleGradeEssay}
          onCreateRemedialExam={handleCreateRemedialExam}
        />
      )}

      {/* Live CBT Exam Player Modal */}
      <CBTExamPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        exam={activeExam}
        questions={questions}
        studentName={studentName}
        onExamComplete={handleExamComplete}
      />
    </div>
  );
};
