import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MonitorCheck, Brain, BarChart3, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { CBTLiveSession } from "./CBTLiveSession";
import { CBTQuestionBank } from "./CBTQuestionBank";
import { CBTGradeAnalysis } from "./CBTGradeAnalysis";
import { CBTExamPlayerModal } from "./CBTExamPlayerModal";
import { CBTExam, CBTQuestion, CBTGradeAnalysisItem } from "@/types/cbt";

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

  // State Bank Soal
  const [questions, setQuestions] = useState<CBTQuestion[]>([
    {
      id: "1",
      questionType: "pg",
      questionText: "Hasil dari ( -12 ) × 4 + 72 ÷ ( -6 ) adalah ...",
      options: { A: "-60", B: "-36", C: "36", D: "60" },
      correctOption: "A",
      points: 5,
      difficulty: "Sedang",
      mapel: "Matematika",
      author: "Pak Hendra",
    },
    {
      id: "2",
      questionType: "pg",
      questionText: "Dua suku berikutnya dari barisan 3, 7, 11, 15, ... adalah ...",
      options: { A: "18, 22", B: "19, 23", C: "19, 24", D: "20, 25" },
      correctOption: "B",
      points: 5,
      difficulty: "Mudah",
      mapel: "Matematika",
      author: "Pak Hendra",
    },
    {
      id: "3",
      questionType: "pg",
      questionText: "Persamaan garis yang melalui titik (2, 5) dan bergradien 3 adalah ...",
      options: { A: "y = 3x - 1", B: "y = 3x + 1", C: "y = 3x - 5", D: "y = 3x + 5" },
      correctOption: "A",
      points: 5,
      difficulty: "Sedang",
      mapel: "Matematika",
      author: "Pak Hendra",
    },
    {
      id: "4",
      questionType: "essay",
      questionText: "Jelaskan perbedaan antara syarat sah dan rukun shalat dalam fikih ibadah!",
      options: { A: "", B: "", C: "", D: "" },
      correctOption: "A",
      points: 15,
      difficulty: "Sukar",
      mapel: "Fiqih",
      author: "CARYATI,",
    },
  ]);

  // State Analisis Nilai KKM
  const [gradeAnalysis, setGradeAnalysis] = useState<CBTGradeAnalysisItem[]>([
    {
      id: "1",
      name: "Muhammad Fairuz Maulana",
      nis: "2026001",
      classRombel: "VIII A",
      subjectName: "Matematika",
      pgScore: 85,
      essayScore: 10,
      totalScore: 95,
      status: "Lulus KKM",
      kkm: 75,
    },
    {
      id: "2",
      name: "Siti Aisyah Putri",
      nis: "2026002",
      classRombel: "VIII A",
      subjectName: "Matematika",
      pgScore: 80,
      essayScore: 10,
      totalScore: 90,
      status: "Lulus KKM",
      kkm: 75,
    },
    {
      id: "3",
      name: "Ahmad Dani Prasetya",
      nis: "2026003",
      classRombel: "VIII A",
      subjectName: "Matematika",
      pgScore: 55,
      essayScore: 10,
      totalScore: 65,
      status: "Remedial",
      kkm: 75,
    },
    {
      id: "4",
      name: "Rizky Ramadhan",
      nis: "2026004",
      classRombel: "VIII A",
      subjectName: "Matematika",
      pgScore: 60,
      essayScore: 10,
      totalScore: 70,
      status: "Remedial",
      kkm: 75,
    },
  ]);

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
          exams={exams}
          userRole={userRole}
          onStartExam={handleStartExam}
          onCreateExam={handleCreateExam}
        />
      )}

      {activeTab === "bank_soal" && (
        <CBTQuestionBank
          questions={questions}
          userRole={userRole}
          onAddQuestion={handleAddQuestion}
        />
      )}

      {activeTab === "analisis" && (
        <CBTGradeAnalysis
          grades={gradeAnalysis}
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
