import React, { useState } from "react";
import { MysqlDataService } from "@/services/mysqlDataService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MonitorCheck, Brain, BarChart3, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { CBTLiveSession } from "./CBTLiveSession";
import { CBTQuestionBank } from "./CBTQuestionBank";
import { CBTGradeAnalysis } from "./CBTGradeAnalysis";
import { CBTExamPlayerModal } from "./CBTExamPlayerModal";
import { CBTExam, CBTQuestion, CBTGradeAnalysisItem } from "@/types/cbt";
import { isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";

interface CBTModuleProps {
  userRole?: string;
  studentName?: string;
}

export const CBTModule: React.FC<CBTModuleProps> = ({
  userRole = "siswa",
  studentName = "Muhammad Fairuz Maulana",
}) => {
  const [activeTab, setActiveTab] = useState<"sesi" | "bank_soal" | "analisis">("sesi");

  // State Ujian Active Sessions
  const [exams, setExams] = useState<CBTExam[]>([
    {
      id: "1",
      title: "CBT PAS Semester Ganjil - Matematika",
      mapel: "Matematika",
      kelas: "VIII A",
      durasi: "90",
      durationMinutes: 90,
      soalCount: 20,
      token: "MTS2-MAT",
      passingScore: 75,
      status: "Dibuka",
    },
    {
      id: "2",
      title: "CBT PTS Ganjil - Fiqih & Keagamaan",
      mapel: "Fiqih",
      kelas: "VIII A",
      durasi: "60",
      durationMinutes: 60,
      soalCount: 15,
      token: "MTS2-FQH",
      passingScore: 75,
      status: "Dibuka",
    },
    {
      id: "3",
      title: "Try Out ASPD - Bahasa Indonesia",
      mapel: "Bahasa Indonesia",
      kelas: "IX A",
      durasi: "120",
      durationMinutes: 120,
      soalCount: 40,
      token: "MTS2-IND",
      passingScore: 75,
      status: "Terjadwal",
    },
  ]);

  React.useEffect(() => {
    MysqlDataService.getCbtExams().then((dbExams) => {
      if (dbExams && dbExams.length > 0) {
        const mapped = dbExams.map((e) => ({
          id: String(e.id || Date.now()),
          title: e.title,
          mapel: e.subject_name || "Mata Pelajaran",
          kelas: "VIII A",
          durasi: String(e.duration_minutes || 90),
          durationMinutes: e.duration_minutes || 90,
          soalCount: 20,
          token: e.token,
          passingScore: e.passing_score || 75,
          status: "Dibuka" as const,
        }));
        setExams(mapped);
      }
    });

    MysqlDataService.getCbtResults().then((dbResults) => {
      if (dbResults && dbResults.length > 0) {
        const mapped = dbResults.map((r: any) => ({
          id: String(r.id),
          name: r.student_name || "Siswa",
          nis: r.student_nis || "-",
          classRombel: r.class_name || "VIII A",
          subjectName: r.subject_name || "Mata Pelajaran",
          pgScore: r.score || 0,
          essayScore: 0,
          totalScore: r.score || 0,
          status: (r.score >= 75 ? "Lulus KKM" : "Remedial") as "Lulus KKM" | "Remedial",
          kkm: 75,
        }));
        setGradeAnalysis(mapped);
      }
    });
  }, []);

  // State Bank Soal
  const [questions, setQuestions] = useState<CBTQuestion[]>([]);

  // State Analisis Nilai KKM
  const [gradeAnalysis, setGradeAnalysis] = useState<CBTGradeAnalysisItem[]>([]);

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
    // Dynamically update grade analysis for logged in student
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
          classRombel: "VIII A",
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
        return "Wali Kelas 8A";
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

  const isGuruRole = userRole === "guru" || (userRole || "").includes("guru");
  const visibleExams = isGuruRole ? exams.filter((e) => isSubjectAllowedForUser(e.mapel || "")) : exams;
  const visibleQuestions = isGuruRole ? questions.filter((q) => isSubjectAllowedForUser(q.mapel || "")) : questions;
  const visibleGradeAnalysis = isGuruRole ? gradeAnalysis.filter((g) => isSubjectAllowedForUser(g.subjectName || "")) : gradeAnalysis;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <MonitorCheck className="h-6 w-6 text-emerald-600" /> CBT Engine & Assessment Center
            </h1>
            <Badge variant="outline" className="text-xs font-mono font-bold border-emerald-500/30 text-emerald-600">
              <ShieldCheck className="h-3 w-3 mr-1" /> RBAC: {getRoleLabel()}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Mesin Ujian Berbasis Komputer, Bank Soal Multi-Type, Anti-Cheat 3x, & Analisis Ketuntasan KKM (75)
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
