import { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Clock,
  HelpCircle,
  Inbox,
  Trophy,
  Play,
  FileCheck,
  AlertCircle,
  BarChart,
  ArrowRight,
  RotateCcw,
  Send,
  GitCompare,
  ToggleLeft,
  CaseSensitive,
  AlignLeft,
  Hash,
  TextCursorInput,
  Volume2,
  Image as ImageIcon,
  Sparkles,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { CbtExamRow, CbtResultRow } from "@/services/mysqlServerFns";
import { isSameClass } from "@/utils/classNormalization";
import { toast } from "sonner";
import { FormativeQuizQuestion, QuizQuestionType, QUIZ_QUESTION_TYPE_CONFIG } from "@/types/quiz";

interface KuisSiswaModuleProps {
  userProfile?: any;
}

export function KuisSiswaModule({ userProfile }: KuisSiswaModuleProps) {
  const [exams, setExams] = useState<CbtExamRow[]>([]);
  const [results, setResults] = useState<CbtResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<"semua" | "aktif" | "selesai">("semua");

  // Runner state for interactive quiz modal
  const [activeQuiz, setActiveQuiz] = useState<CbtExamRow | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, any>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizFinishedResult, setQuizFinishedResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  const me = MysqlAuthService.getActiveUser();
  const studentName = me?.full_name || userProfile?.name || "Siswa MTsN 2 Cilacap";
  const studentRombel = me?.class_name || userProfile?.class_name || userProfile?.rombelName || userProfile?.className || "VIII B";
  const studentEmail = me?.email || userProfile?.email || "siswa@mtsn2cilacap.sch.id";

  const loadData = async () => {
    setLoading(true);
    try {
      const [allExams, allResults] = await Promise.all([
        MysqlDataService.getCbtExams(),
        MysqlDataService.getCbtResults(),
      ]);

      // Murni Ujian Resmi CBT Madrasah (PTS, PAS, Asesmen Madrasah, Tryout)
      const officialExams = (allExams || []).filter(
        (e: any) => !e.class_name || e.class_name === "ALL" || isSameClass(e.class_name, studentRombel)
      );

      setExams(officialExams);
      setResults(allResults || []);
    } catch (e) {
      console.warn("Gagal memuat data ujian CBT dari MySQL:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map results by exam_id for current student
  const myResultsMap = new Map<string, CbtResultRow>();
  results.forEach((r) => {
    if (r.user_id === studentEmail || r.student_name.toLowerCase() === studentName.toLowerCase()) {
      myResultsMap.set(String(r.exam_id), r);
    }
  });

  // Calculate status per quiz
  const getQuizState = (exam: CbtExamRow) => {
    const res = myResultsMap.get(String(exam.id));
    if (res) {
      return { status: "selesai", label: `Selesai: ${res.score}/100`, color: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-bold", icon: CheckCircle2, result: res };
    }
    return { status: "aktif", label: "⚡ Sesi Live Aktif", color: "bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold animate-pulse", icon: Zap, result: null };
  };

  // Filtered list
  const filteredExams = exams.filter((ex) => {
    const { status } = getQuizState(ex);
    if (filterTab === "aktif") return status === "aktif";
    if (filterTab === "selesai") return status === "selesai";
    return true;
  });

  // Metric counters
  const totalQuizzes = exams.length;
  const liveQuizzes = exams.filter((e) => getQuizState(e).status === "aktif").length;
  const completedQuizzes = exams.filter((e) => getQuizState(e).status === "selesai").length;
  const avgScore = completedQuizzes > 0
    ? Math.round(
        Array.from(myResultsMap.values()).reduce((acc, curr) => acc + (curr.score || 0), 0) / completedQuizzes
      )
    : 0;

  const handleStartQuiz = (exam: CbtExamRow) => {
    setActiveQuiz(exam);
    setQuizAnswers({});
    setCurrentQuestionIdx(0);
    setQuizFinishedResult(null);
  };

  // Ambil butir soal asli kuis dari database MySQL
  const getExamQuizQuestions = (exam: CbtExamRow): FormativeQuizQuestion[] => {
    if (exam.questions_data) {
      try {
        const parsed = JSON.parse(exam.questions_data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item, idx) => ({
            ...item,
            id: item.id || idx + 1,
            type: (item.type as QuizQuestionType) || "PG",
            points: Number(item.points) || 10,
          }));
        }
      } catch (e) {}
    }
    return [];
  };

  const handleFinishQuiz = async () => {
    if (!activeQuiz) return;
    const questions = getExamQuizQuestions(activeQuiz);
    if (questions.length === 0) {
      return toast.error("Tidak ada butir soal kuis untuk dinilai.");
    }

    const isRefleksi = activeQuiz.type === "REFLEKSI";
    let totalMaxPoints = 0;
    let totalEarnedPoints = 0;
    let correctCount = 0;

    questions.forEach((q, idx) => {
      const qPoints = Number(q.points) || 10;
      totalMaxPoints += qPoints;
      const qType: QuizQuestionType = q.type || "PG";
      const studentAns = quizAnswers[idx];

      if (isRefleksi) {
        // Refleksi merupakan survei/umpan balik pembelajaran (non-graded)
        if (studentAns !== undefined && studentAns !== "") {
          totalEarnedPoints += qPoints;
          correctCount++;
        }
        return;
      }

      if (qType === "PG") {
        const studentChoice = (studentAns || "").toString().trim().toUpperCase();
        const correctChoice = (q.keyAnswer || "A").toString().trim().toUpperCase();
        if (studentChoice && studentChoice === correctChoice) {
          totalEarnedPoints += qPoints;
          correctCount++;
        }
      } else if (qType === "PG_KOMPLEKS") {
        const selectedKeys: string[] = Array.isArray(studentAns)
          ? studentAns.map((s: any) => String(s).trim().toUpperCase())
          : typeof studentAns === "object" && studentAns !== null
          ? Object.keys(studentAns).filter((k) => studentAns[k]).map((k) => k.trim().toUpperCase())
          : [];

        const keyAnswers = (q.keyAnswers && q.keyAnswers.length > 0
          ? q.keyAnswers
          : q.keyAnswer
          ? [q.keyAnswer]
          : ["A"]
        ).map((k: string) => k.trim().toUpperCase());

        const optScores = q.optionScores || {};
        let qScore = 0;

        selectedKeys.forEach((k) => {
          if (keyAnswers.includes(k)) {
            const scoreVal = optScores[k as keyof typeof optScores];
            if (scoreVal !== undefined && Number(scoreVal) > 0) {
              qScore += Number(scoreVal);
            } else {
              qScore += qPoints / (keyAnswers.length || 1);
            }
          }
        });

        qScore = Math.min(qPoints, Math.round(qScore));
        totalEarnedPoints += qScore;
        const allCorrectSelected = keyAnswers.every((k) => selectedKeys.includes(k));
        const noWrongSelected = selectedKeys.every((k) => keyAnswers.includes(k));
        if (allCorrectSelected && noWrongSelected && selectedKeys.length > 0) {
          correctCount++;
        }
      } else if (qType === "MERANGKAI_KALIMAT") {
        const studentArr = Array.isArray(studentAns)
          ? studentAns
          : typeof studentAns === "string"
          ? studentAns.trim().split(/\s+/)
          : [];
        const studentSentence = studentArr.join(" ").trim().toLowerCase();
        const target = (q.targetSentence || q.question || "").trim().toLowerCase();
        if (studentSentence && target && studentSentence === target) {
          totalEarnedPoints += qPoints;
          correctCount++;
        }
      } else if (qType === "BENAR_SALAH") {
        const studentChoice = (studentAns || "").toString().trim().toUpperCase();
        const correctChoice = (q.keyAnswer || "BENAR").toString().trim().toUpperCase();
        if (studentChoice && studentChoice === correctChoice) {
          totalEarnedPoints += qPoints;
          correctCount++;
        }
      } else if (qType === "ISIAN_SINGKAT" || qType === "MELENGKAPI") {
        const studentText = (studentAns || "").toString().trim().toLowerCase();
        const targetText = (q.clozeAnswer || q.keyAnswer || "").toString().trim().toLowerCase();
        if (studentText && targetText && studentText === targetText) {
          totalEarnedPoints += qPoints;
          correctCount++;
        }
      } else if (qType === "NUMERIK") {
        const studentNum = parseFloat(String(studentAns || "").replace(",", "."));
        const targetNum = parseFloat(String(q.keyAnswer || "0").replace(",", "."));
        const tolerance = parseFloat(String(q.tolerance || "0")) || 0;
        if (!isNaN(studentNum) && !isNaN(targetNum)) {
          if (Math.abs(studentNum - targetNum) <= tolerance) {
            totalEarnedPoints += qPoints;
            correctCount++;
          }
        }
      } else if (qType === "MENJODOHKAN") {
        const pairs = q.pairs || [];
        if (pairs.length > 0 && typeof studentAns === "object" && studentAns !== null) {
          let matchingCorrect = 0;
          const pairObj = studentAns as Record<number, any>;
          pairs.forEach((pair, pIdx) => {
            const studentPairVal = (pairObj[pIdx] || "").toString().trim().toLowerCase();
            const correctPairVal = pair.right.trim().toLowerCase();
            if (studentPairVal && studentPairVal === correctPairVal) {
              matchingCorrect++;
            }
          });
          const pairEarned = (matchingCorrect / pairs.length) * qPoints;
          totalEarnedPoints += pairEarned;
          if (matchingCorrect === pairs.length) {
            correctCount++;
          }
        }
      } else if (qType === "ESAI") {
        if (studentAns && String(studentAns).trim().length > 0) {
          totalEarnedPoints += qPoints;
          correctCount++;
        }
      }
    });

    const calculatedScore = isRefleksi
      ? 100
      : totalMaxPoints > 0
      ? Math.min(100, Math.round((totalEarnedPoints / totalMaxPoints) * 100))
      : 100;

    setSubmitting(true);
    try {
      await MysqlDataService.saveCbtResult({
        exam_id: String(activeQuiz.id),
        exam_title: activeQuiz.title,
        user_id: studentEmail,
        student_name: studentName,
        rombel: studentRombel,
        score: calculatedScore,
        total_correct: correctCount,
        total_questions: questions.length,
        status: "SELESAI",
      });

      setQuizFinishedResult({ score: calculatedScore, correct: correctCount, total: questions.length });
      if (isRefleksi) {
        toast.success(`🎉 Refleksi Pembelajaran Terkirim! Terima kasih atas partisipasi Anda.`);
      } else {
        toast.success(`🎉 Kuis Selesai! Skor Anda: ${calculatedScore}/100`);
      }
      loadData();
    } catch (e) {
      toast.error("Gagal menyimpan hasil kuis.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Siswa */}
      <StudentHeaderBanner
        title="Kuis Interaktif Live Saya"
        icon={Zap}
      />

      {/* Summary Metric Strip - Kompak di Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Semua Kuis</p>
            <h3 className="text-base sm:text-lg font-extrabold text-foreground">{totalQuizzes}</h3>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <Play className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Live Aktif</p>
            <h3 className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400">{liveQuizzes}</h3>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
            <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Selesai</p>
            <h3 className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{completedQuizzes}</h3>
          </div>
        </div>

        <div className="p-2.5 sm:p-3 rounded-xl border border-border bg-card shadow-2xs flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold">Rata Skor</p>
            <h3 className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">{avgScore}%</h3>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quiz List */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="p-3 sm:p-4 pb-3 border-b border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Kuis Interaktif Live Siswa
            </CardTitle>
            <CardDescription className="text-xs hidden sm:block">
              Sesi evaluasi kuis kilat yang dipublikasikan oleh guru pengampu mata pelajaran MTsN 2 Cilacap.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border text-xs overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setFilterTab("semua")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === "semua" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({totalQuizzes})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("aktif")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === "aktif" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Live ({liveQuizzes})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("selesai")}
              className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                filterTab === "selesai" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Selesai ({completedQuizzes})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
              Memuat data kuis...
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-bold text-sm text-foreground">Belum Ada Kuis Interaktif Live</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {exams.length === 0
                  ? "Belum ada sesi kuis interaktif yang dijadwalkan untuk rombel Anda. Kuis yang dipublikasikan oleh guru akan muncul di sini."
                  : "Tidak ada kuis yang sesuai dengan filter ini."}
              </p>
            </div>
          ) : (
            <>
              {/* Tampilan Kartu Mobile-First */}
              <div className="md:hidden divide-y divide-border">
                {filteredExams.map((ex) => {
                  const state = getQuizState(ex);
                  return (
                    <div key={ex.id} className="p-3.5 space-y-2.5 hover:bg-muted/20 transition">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge variant="outline" className="text-[10px] font-bold border-primary/30 text-primary py-0 px-1.5">
                              {ex.subject_name || "Mata Pelajaran"}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">Kelas VIII</span>
                          </div>
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-snug flex items-center gap-1.5">
                            <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                            {ex.title}
                          </h4>
                        </div>
                        <Badge variant="outline" className={`gap-1 px-2 py-0.5 text-[10px] shrink-0 font-bold ${state.color}`}>
                          <state.icon className="h-3 w-3" />
                          {state.label}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-amber-500" /> {ex.duration_minutes || 15}m
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">KKM {ex.passing_score || 75}</span>
                        </div>
                        <div>
                          {state.status === "aktif" ? (
                            <Button size="sm" className="h-7 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs px-3" onClick={() => handleStartQuiz(ex)}>
                              ⚡ Ikuti Kuis
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-7 text-xs font-bold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 px-3" onClick={() => handleStartQuiz(ex)}>
                              🏆 Hasil ({state.result?.score}/100)
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tabel Desktop Lengkap */}
              <table className="hidden md:table w-full text-xs text-left">
                <thead className="bg-muted/70 text-muted-foreground font-bold border-b border-border">
                  <tr>
                    <th className="p-3.5">Judul Kuis Interaktif</th>
                    <th className="p-3.5">Mata Pelajaran</th>
                    <th className="p-3.5 text-center">Durasi & KKM</th>
                    <th className="p-3.5 text-center">Status Sesi</th>
                    <th className="p-3.5 text-right">Aksi Pengerjaan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExams.map((ex) => {
                    const state = getQuizState(ex);
                    return (
                      <tr key={ex.id} className="hover:bg-muted/30 transition">
                        <td className="p-3.5 font-bold text-foreground text-sm flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                          {ex.title}
                        </td>

                        <td className="p-3.5">
                          <div className="font-semibold text-foreground">{ex.subject_name || "Mata Pelajaran"}</div>
                          <div className="text-[11px] text-muted-foreground">Sesi Kelas VIII</div>
                        </td>

                        <td className="p-3.5 text-center font-mono">
                          <div className="flex items-center justify-center gap-2 text-[11px]">
                            <Badge variant="outline" className="gap-1 border-border font-mono">
                              <Clock className="h-3 w-3 text-amber-500" /> {ex.duration_minutes || 15} Mins
                            </Badge>
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 font-bold">
                              KKM: {ex.passing_score || 75}
                            </Badge>
                          </div>
                        </td>

                        <td className="p-3.5 text-center">
                          <Badge variant="outline" className={`gap-1 px-2.5 py-1 ${state.color}`}>
                            <state.icon className="h-3.5 w-3.5" />
                            {state.label}
                          </Badge>
                        </td>

                        <td className="p-3.5 text-right">
                          {state.status === "aktif" ? (
                            <Button size="sm" className="h-8 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs" onClick={() => handleStartQuiz(ex)}>
                              ⚡ Ikuti Kuis Live
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8 text-xs font-bold border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10" onClick={() => handleStartQuiz(ex)}>
                              🏆 Lihat Hasil ({state.result?.score}/100)
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Runner Modal Kuis Interaktif */}
      {activeQuiz && (
        <Dialog open={Boolean(activeQuiz)} onOpenChange={() => setActiveQuiz(null)}>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader className="border-b border-border pb-4">
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" /> Sesi Kuis Interaktif Live: {activeQuiz.title}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Mata Pelajaran: {activeQuiz.subject_name || "Mapel"} • Durasi: {activeQuiz.duration_minutes || 15} Menit • Standar KKM: {activeQuiz.passing_score || 75}
              </DialogDescription>
            </DialogHeader>

            {quizFinishedResult ? (
              /* Hasil Akhir Kuis Selesai */
              <div className="space-y-4 py-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-500 mx-auto flex items-center justify-center">
                  <Trophy className="h-8 w-8" />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-foreground">Sesi Kuis Berhasil Diselesaikan!</h3>
                  <p className="text-xs text-muted-foreground mt-1">Hasil & skor kuis Anda telah berhasil dicatat ke sistem penilaian.</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 max-w-sm mx-auto space-y-1">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Nilai Akhir Kuis</div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {quizFinishedResult.score} / 100
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Jawaban Benar: {quizFinishedResult.correct} dari {quizFinishedResult.total} Soal
                  </div>
                </div>

                <div className="pt-2">
                  <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs" onClick={() => setActiveQuiz(null)}>
                    Tutup & Kembali ke Daftar Kuis
                  </Button>
                </div>
              </div>
            ) : (
              /* Runner Pengerjaan Soal */
              <div className="space-y-4 py-2 text-xs">
                {(() => {
                  const questions = getExamQuizQuestions(activeQuiz);
                  if (questions.length === 0) {
                    return (
                      <div className="py-8 text-center text-muted-foreground space-y-2">
                        <AlertCircle className="h-8 w-8 mx-auto text-amber-500 opacity-60" />
                        <p className="font-semibold text-xs">Belum ada butir soal kuis pada sesi ini.</p>
                      </div>
                    );
                  }

                  const q = questions[currentQuestionIdx];
                  const qType: QuizQuestionType = q.type || "PG";
                  const cfg = QUIZ_QUESTION_TYPE_CONFIG[qType] || QUIZ_QUESTION_TYPE_CONFIG.PG;
                  const currentAnswer = quizAnswers[currentQuestionIdx];

                  return (
                    <div className="space-y-4">
                      {/* Navigation bar indicator */}
                      <div className="flex items-center justify-between p-2.5 bg-muted/60 rounded-xl border border-border">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-foreground">
                            Soal #{currentQuestionIdx + 1} dari {questions.length}
                          </span>
                          <Badge variant="outline" className={`text-[9px] font-semibold ${cfg.badgeColor}`}>
                            {cfg.shortLabel}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({q.points || 10} Poin)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                          {questions.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentQuestionIdx(idx)}
                              className={`w-6 h-6 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                currentQuestionIdx === idx
                                  ? "bg-amber-500 text-slate-950 font-extrabold"
                                  : quizAnswers[idx] !== undefined
                                  ? "bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pertanyaan & Media */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-3.5 shadow-2xs">
                        {/* Audio / Voice Media */}
                        {q.audio_url && (
                          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
                            <div className="p-2 rounded-full bg-amber-500 text-slate-950 shrink-0">
                              <Volume2 className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200 mb-1">
                                Dengarkan Berkas Suara / Listening:
                              </div>
                              <audio controls src={q.audio_url} className="w-full h-8" />
                            </div>
                          </div>
                        )}

                        {/* Image Media */}
                        {q.image_url && (
                          <div className="rounded-lg overflow-hidden border border-border bg-muted/30 p-2 max-w-md mx-auto sm:mx-0">
                            <img
                              src={q.image_url}
                              alt="Lampiran Soal"
                              className="max-h-60 w-auto rounded object-contain mx-auto"
                            />
                          </div>
                        )}

                        <p className="font-bold text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {q.question}
                        </p>

                        {/* Input interaktif sesuai jenis */}
                        {qType === "PG" && (() => {
                          const options = [
                            { key: "A", text: q.optionA },
                            { key: "B", text: q.optionB },
                            { key: "C", text: q.optionC },
                            { key: "D", text: q.optionD },
                          ].filter((opt) => Boolean(opt.text));

                          return (
                            <div className="grid grid-cols-1 gap-2 pt-1">
                              {options.map((opt) => {
                                const isSelected = currentAnswer === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    type="button"
                                    onClick={() => setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: opt.key }))}
                                    className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer text-xs ${
                                      isSelected
                                        ? "border-amber-500 bg-amber-500/15 text-amber-950 dark:text-amber-100 font-bold ring-1 ring-amber-500"
                                        : "border-border hover:bg-muted/40 text-foreground"
                                    }`}
                                  >
                                    <span
                                      className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                        isSelected ? "bg-amber-500 text-slate-950" : "bg-muted text-muted-foreground"
                                      }`}
                                    >
                                      {opt.key}
                                    </span>
                                    <span className="leading-snug">{opt.text}</span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {qType === "PG_KOMPLEKS" && (() => {
                          const options = [
                            { key: "A", text: q.optionA, score: q.optionScores?.A },
                            { key: "B", text: q.optionB, score: q.optionScores?.B },
                            { key: "C", text: q.optionC, score: q.optionScores?.C },
                            { key: "D", text: q.optionD, score: q.optionScores?.D },
                          ].filter((opt) => Boolean(opt.text));

                          const selectedList: string[] = Array.isArray(currentAnswer)
                            ? currentAnswer
                            : typeof currentAnswer === "object" && currentAnswer !== null
                            ? Object.keys(currentAnswer).filter((k) => currentAnswer[k])
                            : [];

                          const toggleOption = (key: string) => {
                            const exists = selectedList.includes(key);
                            const next = exists ? selectedList.filter((k) => k !== key) : [...selectedList, key];
                            setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: next }));
                          };

                          return (
                            <div className="space-y-2 pt-1">
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 block">
                                💡 Petunjuk: Anda dapat mencentang lebih dari satu pilihan jawaban yang benar.
                              </span>
                              <div className="grid grid-cols-1 gap-2">
                                {options.map((opt) => {
                                  const isChecked = selectedList.includes(opt.key);
                                  return (
                                    <button
                                      key={opt.key}
                                      type="button"
                                      onClick={() => toggleOption(opt.key)}
                                      className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer text-xs ${
                                        isChecked
                                          ? "border-amber-500 bg-amber-500/15 text-amber-950 dark:text-amber-100 font-bold ring-1 ring-amber-500"
                                          : "border-border hover:bg-muted/40 text-foreground"
                                      }`}
                                    >
                                      <div
                                        className={`h-5 w-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 border ${
                                          isChecked
                                            ? "bg-amber-500 text-slate-950 border-amber-600"
                                            : "bg-background border-muted-foreground/30 text-transparent"
                                        }`}
                                      >
                                        {isChecked ? "✓" : ""}
                                      </div>
                                      <div className="flex-1">
                                        <span className="font-mono font-bold mr-1.5">{opt.key}.</span>
                                        <span className="leading-snug">{opt.text}</span>
                                        {opt.score !== undefined && opt.score > 0 && (
                                          <Badge variant="outline" className="ml-2 text-[9px] py-0 px-1 text-emerald-600 border-emerald-500/30">
                                            +{opt.score} Poin
                                          </Badge>
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {qType === "MERANGKAI_KALIMAT" && (() => {
                          const rawTarget = q.targetSentence || q.question || "";
                          const defaultWords: string[] = (q.scrambledWords && q.scrambledWords.length > 0)
                            ? q.scrambledWords
                            : rawTarget.split(/\s+/).filter(Boolean);

                          const arrangedWords: string[] = Array.isArray(currentAnswer)
                            ? currentAnswer
                            : typeof currentAnswer === "string" && currentAnswer.trim()
                            ? currentAnswer.trim().split(/\s+/)
                            : [];

                          const addWord = (word: string) => {
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [currentQuestionIdx]: [...arrangedWords, word],
                            }));
                          };

                          const removeWordAt = (index: number) => {
                            const next = [...arrangedWords];
                            next.splice(index, 1);
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [currentQuestionIdx]: next,
                            }));
                          };

                          const resetWords = () => {
                            setQuizAnswers((prev) => ({
                              ...prev,
                              [currentQuestionIdx]: [],
                            }));
                          };

                          return (
                            <div className="space-y-3 pt-1">
                              <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                                <span>Susun potongan kata berikut menjadi satu kalimat utuh:</span>
                                {arrangedWords.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={resetWords}
                                    className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <RotateCcw className="h-3 w-3" /> Reset Urutan
                                  </button>
                                )}
                              </div>

                              {/* Kotak Kalimat Tersusun */}
                              <div className="min-h-[52px] p-3 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 flex flex-wrap gap-1.5 items-center">
                                {arrangedWords.length === 0 ? (
                                  <span className="text-xs text-muted-foreground italic">
                                    Klik kata-kata acak di bawah untuk menyusun kalimat di sini...
                                  </span>
                                ) : (
                                  arrangedWords.map((word, wIdx) => (
                                    <button
                                      key={wIdx}
                                      type="button"
                                      onClick={() => removeWordAt(wIdx)}
                                      className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-bold text-xs shadow-xs hover:bg-rose-500 hover:text-white transition cursor-pointer flex items-center gap-1 group"
                                      title="Klik untuk kembalikan kata"
                                    >
                                      <span>{word}</span>
                                      <span className="text-[9px] opacity-70 group-hover:opacity-100">✕</span>
                                    </button>
                                  ))
                                )}
                              </div>

                              {/* Kumpulan Kata Acak yang Tersedia */}
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">Kata Tersedia:</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {defaultWords.map((word, idx) => {
                                    let usedCountBeforeThis = 0;
                                    for (let i = 0; i < idx; i++) {
                                      if (defaultWords[i] === word) usedCountBeforeThis++;
                                    }
                                    const totalUsed = arrangedWords.filter((w) => w === word).length;
                                    const isUsed = usedCountBeforeThis < totalUsed;

                                    return (
                                      <button
                                        key={idx}
                                        type="button"
                                        disabled={isUsed}
                                        onClick={() => addWord(word)}
                                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                                          isUsed
                                            ? "bg-muted text-muted-foreground/30 border-dashed border-border cursor-not-allowed line-through"
                                            : "bg-card hover:bg-muted text-foreground border-border shadow-2xs hover:border-amber-500 active:scale-95"
                                        }`}
                                      >
                                        {word}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        {qType === "MENJODOHKAN" && Array.isArray(q.pairs) && (() => {
                          const currentPairAnswers = (typeof currentAnswer === "object" && currentAnswer !== null) ? (currentAnswer as Record<number, string>) : {};
                          const rightOptions = Array.from(new Set(q.pairs.map((p) => p.right).filter(Boolean))).sort();

                          return (
                            <div className="space-y-2 pt-1">
                              <span className="text-[11px] font-medium text-muted-foreground block">
                                Pasangkan setiap premis berikut dengan jawaban yang tepat:
                              </span>
                              <div className="space-y-2">
                                {q.pairs.map((pair, pIdx) => {
                                  const selectedRight = currentPairAnswers[pIdx] || "";
                                  return (
                                    <div key={pIdx} className="p-2.5 rounded-lg bg-muted/30 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <span className="font-semibold text-foreground flex-1">{pair.left}</span>
                                      <div className="flex items-center gap-1.5 flex-1 sm:max-w-xs">
                                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
                                        <select
                                          value={selectedRight}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setQuizAnswers((prev) => ({
                                              ...prev,
                                              [currentQuestionIdx]: {
                                                ...(typeof prev[currentQuestionIdx] === "object" && prev[currentQuestionIdx] !== null ? prev[currentQuestionIdx] : {}),
                                                [pIdx]: val,
                                              },
                                            }));
                                          }}
                                          className="h-8 w-full px-2.5 rounded-md border border-border bg-background text-xs cursor-pointer"
                                        >
                                          <option value="">-- Pilih Pasangan --</option>
                                          {rightOptions.map((opt, optIdx) => (
                                            <option key={optIdx} value={opt}>
                                              {opt}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })()}

                        {qType === "BENAR_SALAH" && (
                          <div className="grid grid-cols-2 gap-3 max-w-sm pt-1">
                            <button
                              type="button"
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: "BENAR" }))}
                              className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                                currentAnswer === "BENAR"
                                  ? "border-emerald-600 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500"
                                  : "border-border bg-card hover:bg-muted text-foreground"
                              }`}
                            >
                              ✓ BENAR
                            </button>
                            <button
                              type="button"
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: "SALAH" }))}
                              className={`p-2.5 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
                                currentAnswer === "SALAH"
                                  ? "border-rose-600 bg-rose-500/20 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500"
                                  : "border-border bg-card hover:bg-muted text-foreground"
                              }`}
                            >
                              ✗ SALAH
                            </button>
                          </div>
                        )}

                        {qType === "ISIAN_SINGKAT" && (
                          <div className="pt-1">
                            <Input
                              placeholder="Ketik jawaban singkat..."
                              value={typeof currentAnswer === "string" ? currentAnswer : ""}
                              onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: e.target.value }))}
                              className="text-xs font-medium"
                            />
                          </div>
                        )}

                        {qType === "ESAI" && (
                          <div className="pt-1">
                            <Textarea
                              placeholder="Tuliskan jawaban esai Anda..."
                              value={typeof currentAnswer === "string" ? currentAnswer : ""}
                              onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: e.target.value }))}
                              className="text-xs min-h-[90px]"
                            />
                          </div>
                        )}

                        {qType === "NUMERIK" && (
                          <div className="pt-1">
                            <Input
                              type="text"
                              placeholder="Ketik nilai angka..."
                              value={currentAnswer !== undefined && currentAnswer !== null ? String(currentAnswer) : ""}
                              onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: e.target.value }))}
                              className="text-xs font-mono font-medium max-w-xs"
                            />
                          </div>
                        )}

                        {qType === "MELENGKAPI" && (
                          <div className="pt-1">
                            <Input
                              placeholder="Ketik kata / frasa pelengkap [...]..."
                              value={typeof currentAnswer === "string" ? currentAnswer : ""}
                              onChange={(e) => setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: e.target.value }))}
                              className="text-xs font-medium"
                            />
                          </div>
                        )}
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentQuestionIdx === 0}
                          onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                          className="text-xs font-bold cursor-pointer"
                        >
                          ← Soal Sebelumnya
                        </Button>

                        {currentQuestionIdx < questions.length - 1 ? (
                          <Button
                            size="sm"
                            onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                            className="text-xs font-bold bg-primary text-primary-foreground cursor-pointer"
                          >
                            Soal Selanjutnya →
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={submitting}
                            onClick={handleFinishQuiz}
                            className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs cursor-pointer"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" /> Kumpulkan Kuis Live
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
