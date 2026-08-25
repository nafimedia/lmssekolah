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
import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";

interface CBTModuleProps {
  userRole?: string;
  studentName?: string;
}

export const CBTModule: React.FC<CBTModuleProps> = ({
  userRole = "siswa",
  studentName = "Muhammad Fairuz Maulana",
}) => {
  const isExecutive = userRole === "kamad" || userRole === "waka" || userRole === "admin" || userRole === "kepala_madrasah" || userRole === "admin_akademik";
  const isGuruRole = userRole === "guru" || (userRole || "").includes("guru");

  const [activeTab, setActiveTab] = useState<"sesi" | "bank_soal" | "analisis">("sesi");
  const [selectedRombel, setSelectedRombel] = useState<string>(isExecutive ? "ALL" : "Rombel 8B");
  const [searchQuery, setSearchQuery] = useState<string>("");

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
    ])
      .then(([dbExams, dbResults, rombels]) => {
        if (!isMounted) return;

        if (rombels && rombels.length > 0) {
          setMasterRombels(rombels);
        }

        if (dbExams && dbExams.length > 0) {
          const mapped = dbExams.map((e: any) => ({
            id: String(e.id || Date.now()),
            title: e.title,
            mapel: e.subject_name || "Mata Pelajaran",
            kelas: normalizeRombelName(e.class_name || "Rombel 8A"),
            durasi: String(e.duration_minutes || 90),
            durationMinutes: e.duration_minutes || 90,
            soalCount: e.total_questions || 20,
            token: e.token || "MTS2-CBT",
            passingScore: e.passing_score || 75,
            status: (e.status || "Dibuka") as any,
          }));
          setExams(mapped);
        } else {
          setExams([]);
        }

        if (dbResults && dbResults.length > 0) {
          const mapped = dbResults.map((r: any) => ({
            id: String(r.id),
            name: r.student_name || "Siswa",
            nis: r.student_nis || "-",
            classRombel: normalizeRombelName(r.class_name || "Rombel 8A"),
            subjectName: r.subject_name || "Mata Pelajaran",
            pgScore: r.score || 0,
            essayScore: 0,
            totalScore: r.score || 0,
            status: (r.score >= 75 ? "Lulus KKM" : "Remedial") as "Lulus KKM" | "Remedial",
            kkm: 75,
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

  // Compute list of dynamic rombel options
  const rombelOptions = useMemo(() => {
    const set = new Set<string>(["Rombel 7A", "Rombel 7B", "Rombel 8A", "Rombel 8B", "Rombel 9A", "Rombel 9B"]);
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

  const handleCreateExam = (newExam: Partial<CBTExam>) => {
    setExams((prev) => [newExam as CBTExam, ...prev]);
  };

  const handleAddQuestion = (newQ: CBTQuestion) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  const handleExamComplete = (result: { scorePg: number; totalScore: number; violationCount: number }) => {
    const isPassed = result.totalScore >= 75;
    setGradeAnalysis((prev) => {
      const exists = prev.some((g) => g.name === studentName);
      if (exists) {
        return prev.map((g) =>
          g.name === studentName
            ? {
                ...g,
                pgScore: result.scorePg,
                totalScore: result.totalScore,
                status: isPassed ? "Lulus KKM" : "Remedial",
              }
            : g
        );
      }
      return [
        ...prev,
        {
          id: String(Date.now()),
          name: studentName,
          nis: "2026099",
          classRombel: "Rombel 8B",
          subjectName: activeExam?.mapel || "Matematika",
          pgScore: result.scorePg,
          essayScore: 0,
          totalScore: result.totalScore,
          status: isPassed ? "Lulus KKM" : "Remedial",
          kkm: 75,
        },
      ];
    });
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
      {userRole === "siswa" ? (
        <StudentHeaderBanner
          title="CBT Ujian Online Saya"
          subtitle="Portal Ujian Berbasis Komputer (CBT), pengerjaan tes, token kuis, dan analisis nilai"
          icon={MonitorCheck}
          statusText="Sistem CBT Aktif (Anti-Cheat 3x)"
          statusVariant="success"
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
                <MonitorCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                {selectedRombel === "ALL"
                  ? "Monitoring CBT Engine & Assessment Center (Seluruh Kelas)"
                  : `Monitoring CBT Engine - ${selectedRombel}`}
              </h1>
              <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/30 text-emerald-600">
                <ShieldCheck className="h-3 w-3 mr-1" /> RBAC: {getRoleLabel()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isExecutive
                ? "Dashboard Pengawasan Ujian Eksekutif Kamad & Waka Kurikulum untuk Audit Sesi CBT & Analisis Ketuntasan KKM (Real Data Database)"
                : "Mesin Ujian Berbasis Komputer, Bank Soal Multi-Type, Anti-Cheat 3x, & Analisis Ketuntasan KKM (75)"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
              onClick={() => toast.success("Template Bank Soal Excel Diunduh!")}
            >
              <Download className="h-3.5 w-3.5" /> Template Excel
            </Button>
          </div>
        </div>
      )}

      {/* Rombel Filter & Executive Controls (For Kamad, Waka, Admin, Teachers) */}
      {userRole !== "siswa" && (
        <Card className="border-border shadow-xs bg-card p-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Filter className="h-5 w-5" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-0.5">Pilih Rombel / Mode CBT</label>
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
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari sesi ujian, mapel, atau token..."
                  className="pl-8 h-9 text-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {isExecutive && (
                <Badge variant="secondary" className="hidden sm:inline-flex bg-emerald-600/10 text-emerald-600 border border-emerald-500/30 px-3 py-1.5 font-bold text-xs">
                  <Building2 className="h-3.5 w-3.5 mr-1" /> Monitoring Kamad & Waka
                </Badge>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Executive CBT Summary Cards for Kamad & Waka */}
      {isExecutive && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Sesi CBT Live Active</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{cbtOverallStats.activeExamsCount} Sesi</h3>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">Live proctor sesi ujian</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <MonitorCheck className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Total Peserta Siswa CBT</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{cbtOverallStats.totalResults} Peserta</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Hasil ujian dari database</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Rata-Rata Nilai CBT</p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{cbtOverallStats.avgScoreMadrasah} Poin</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Data real dari database</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-xs bg-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Kelulusan KKM CBT (&ge;75)</p>
                <h3 className="text-2xl font-bold text-foreground mt-1">{cbtOverallStats.passPercentage}%</h3>
                <p className="text-[11px] text-muted-foreground font-medium mt-0.5">Batas lulus KKM 75</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <GraduationCap className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sub-Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === "sesi" ? "default" : "outline"}
          className={`gap-2 text-xs font-bold ${
            activeTab === "sesi" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
          onClick={() => setActiveTab("sesi")}
        >
          <MonitorCheck className="h-3.5 w-3.5" /> 1. Sesi Ujian Live CBT
        </Button>
        <Button
          size="sm"
          variant={activeTab === "bank_soal" ? "default" : "outline"}
          className={`gap-2 text-xs font-bold ${
            activeTab === "bank_soal" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
          onClick={() => setActiveTab("bank_soal")}
        >
          <Brain className="h-3.5 w-3.5" /> 2. Bank Soal & Tipe Soal
        </Button>
        <Button
          size="sm"
          variant={activeTab === "analisis" ? "default" : "outline"}
          className={`gap-2 text-xs font-bold ${
            activeTab === "analisis" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
          onClick={() => setActiveTab("analisis")}
        >
          <BarChart3 className="h-3.5 w-3.5" /> 3. Analisis KKM (75) & Remedial
        </Button>
      </div>

      {/* Tab Panels */}
      {activeTab === "sesi" && (
        <CBTLiveSession
          exams={visibleExams}
          userRole={userRole}
          onStartExam={handleStartExam}
          onCreateExam={handleCreateExam}
        />
      )}

      {activeTab === "bank_soal" && (
        <CBTQuestionBank
          questions={visibleQuestions}
          userRole={userRole}
          onAddQuestion={handleAddQuestion}
        />
      )}

      {activeTab === "analisis" && (
        <CBTGradeAnalysis
          grades={visibleGradeAnalysis}
          userRole={userRole}
          studentName={studentName}
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
