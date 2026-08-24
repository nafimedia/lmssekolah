import { useState, useEffect } from "react";
import {
  Zap,
  CheckCircle2,
  Clock,
  HelpCircle,
  Inbox,
  Sparkles,
  Trophy,
  Play,
  FileCheck,
  AlertCircle,
  BarChart,
  ArrowRight,
  RotateCcw,
  Send,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { CbtExamRow, CbtResultRow } from "@/services/mysqlServerFns";
import { toast } from "sonner";

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
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [quizFinishedResult, setQuizFinishedResult] = useState<{ score: number; correct: number; total: number } | null>(null);

  const studentName = userProfile?.name || "Siswa MTsN 2 Cilacap";
  const studentRombel = userProfile?.rombelName || userProfile?.className || "VIII A";
  const studentEmail = userProfile?.email || "siswa@mtsn2cilacap.sch.id";

  const loadData = async () => {
    setLoading(true);
    try {
      const [allExams, allResults] = await Promise.all([
        MysqlDataService.getCbtExams(),
        MysqlDataService.getCbtResults(),
      ]);
      setExams(allExams || []);
      setResults(allResults || []);
    } catch (e) {
      console.warn("Gagal memuat data kuis dari MySQL:", e);
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

  // Sample interactive questions generator for demo quiz runner
  const generateQuizQuestions = (exam: CbtExamRow) => {
    return [
      {
        id: 1,
        question: `Berdasarkan materi ${exam.subject_name || "Mata Pelajaran"}, apa prinsip utama yang harus diperhatikan dalam pelaksanaan kaidah pembelajaran?`,
        options: [
          "A. Menghafal seluruh materi tanpa pemahaman",
          "B. Memahami konsep, mempraktikkan, dan menerapkan adab",
          "C. Mengabaikan instruksi guru pengampu",
          "D. Hanya mengerjakan saat ujian akhir semester",
        ],
        correct: 1, // B
      },
      {
        id: 2,
        question: `Berapa batas waktu ketuntasan standar KKM Kurikulum Merdeka yang berlaku di MTsN 2 Cilacap?`,
        options: [
          "A. 60 Poin",
          "B. 70 Poin",
          "C. 75 Poin",
          "D. 85 Poin",
        ],
        correct: 2, // C
      },
      {
        id: 3,
        question: `Sikap terbaik yang ditunjukkan oleh seorang siswa mulia saat mengikuti sesi kuis interaktif adalah?`,
        options: [
          "A. Jujur, teliti, dan berdoa sebelum mengerjakan",
          "B. Terburu-buru tanpa membaca soal",
          "C. Bertanya jawaban kepada teman",
          "D. Mengosongkan lembar jawaban",
        ],
        correct: 0, // A
      },
    ];
  };

  const handleFinishQuiz = async () => {
    if (!activeQuiz) return;
    const questions = generateQuizQuestions(activeQuiz);
    let correctCount = 0;

    questions.forEach((q, idx) => {
      if (quizAnswers[idx] !== undefined && Number(quizAnswers[idx]) === q.correct) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
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
      toast.success(`🎉 Kuis Selesai! Skor Anda: ${calculatedScore}/100`);
      loadData();
    } catch (e) {
      toast.error("Gagal menyimpan hasil kuis ke MySQL DB.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Siswa */}
      <StudentHeaderBanner
        title="Kuis Interaktif Live Saya"
        subtitle="Ikuti kuis interaktif kelas, latihan soal mandiri, dan pantau riwayat skor kuis kilat Anda."
        icon={Zap}
        statusText="Kuis Live Ready"
        statusVariant="success"
      />

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Semua Kuis</p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">{totalQuizzes}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Play className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Live Sesi Aktif</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{liveQuizzes}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Selesai Dikerjakan</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{completedQuizzes}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-sm hover:shadow transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground font-semibold">Rata-Rata Skor</p>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{avgScore}%</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Quiz List */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-3 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" /> Daftar Sesi Kuis Interaktif Live Siswa
            </CardTitle>
            <CardDescription className="text-xs">
              Sesi evaluasi kuis kilat yang dipublikasikan oleh guru pengampu mata pelajaran MTsN 2 Cilacap.
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border text-xs w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterTab("semua")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterTab === "semua" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua ({totalQuizzes})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("aktif")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterTab === "aktif" ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Live Aktif ({liveQuizzes})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("selesai")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
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
              Memuat data kuis dari server database MySQL...
            </div>
          ) : filteredExams.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
              <div className="font-bold text-sm text-foreground">Belum Ada Kuis Interaktif Live Terdaftar</div>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                {exams.length === 0
                  ? "Database MySQL belum mencatat sesi kuis interaktif terdaftar. Kuis yang dipublikasikan oleh guru pengampu akan muncul di sini secara otomatis."
                  : "Tidak ada kuis yang sesuai dengan filter kategori ini."}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left">
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
                  <p className="text-xs text-muted-foreground mt-1">Hasil & skor kuis Anda telah dicatat secara permanen ke database MySQL.</p>
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
                  const questions = generateQuizQuestions(activeQuiz);
                  const q = questions[currentQuestionIdx];
                  return (
                    <div className="space-y-4">
                      {/* Navigation bar indicator */}
                      <div className="flex items-center justify-between p-2.5 bg-muted/60 rounded-xl border border-border">
                        <span className="font-bold text-xs text-foreground">
                          Soal Pertanyaan #{currentQuestionIdx + 1} dari {questions.length}
                        </span>
                        <div className="flex items-center gap-1">
                          {questions.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCurrentQuestionIdx(idx)}
                              className={`w-6 h-6 rounded-md text-[10px] font-bold transition ${
                                currentQuestionIdx === idx
                                  ? "bg-amber-500 text-slate-950"
                                  : quizAnswers[idx] !== undefined
                                  ? "bg-emerald-500/30 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {idx + 1}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Pertanyaan */}
                      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
                        <p className="font-bold text-sm text-foreground leading-relaxed">
                          {q.question}
                        </p>

                        <RadioGroup
                          value={quizAnswers[currentQuestionIdx] !== undefined ? String(quizAnswers[currentQuestionIdx]) : ""}
                          onValueChange={(val) => {
                            setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: val }));
                          }}
                          className="space-y-2 pt-2"
                        >
                          {q.options.map((opt, oIdx) => (
                            <div
                              key={oIdx}
                              className={`flex items-center space-x-3 p-3 rounded-xl border transition cursor-pointer ${
                                quizAnswers[currentQuestionIdx] === String(oIdx)
                                  ? "border-amber-500 bg-amber-500/10 font-bold"
                                  : "border-border hover:bg-muted/40"
                              }`}
                              onClick={() => {
                                setQuizAnswers((prev) => ({ ...prev, [currentQuestionIdx]: String(oIdx) }));
                              }}
                            >
                              <RadioGroupItem value={String(oIdx)} id={`opt-${oIdx}`} />
                              <Label htmlFor={`opt-${oIdx}`} className="text-xs cursor-pointer flex-1">
                                {opt}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      {/* Action buttons footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentQuestionIdx === 0}
                          onClick={() => setCurrentQuestionIdx((prev) => Math.max(0, prev - 1))}
                          className="text-xs font-bold"
                        >
                          ← Soal Sebelumnya
                        </Button>

                        {currentQuestionIdx < questions.length - 1 ? (
                          <Button
                            size="sm"
                            onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                            className="text-xs font-bold bg-primary text-primary-foreground"
                          >
                            Soal Selanjutnya →
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            disabled={submitting}
                            onClick={handleFinishQuiz}
                            className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs"
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
