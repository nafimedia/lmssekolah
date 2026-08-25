import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Send,
  Flag,
  Lock,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { CBTExam, CBTQuestion } from "@/types/cbt";

interface CBTExamPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: CBTExam | null;
  questions: CBTQuestion[];
  studentName?: string;
  onExamComplete: (result: { scorePg: number; totalScore: number; violationCount: number }) => void;
}

export const CBTExamPlayerModal: React.FC<CBTExamPlayerModalProps> = ({
  isOpen,
  onClose,
  exam,
  questions,
  studentName = "ALIYA QIARA ABDULLAH",
  onExamComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [raguState, setRaguState] = useState<Record<number, boolean>>({});
  const [violationCount, setViolationCount] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(60 * 60); // Default 60 mins
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Initialize Timer and Reset State when exam opens
  useEffect(() => {
    if (isOpen && exam) {
      setCurrentIndex(0);
      setUserAnswers({});
      setRaguState({});
      setViolationCount(0);
      setTimeLeftSeconds((exam.durationMinutes || 60) * 60);
      // Automatically attempt native fullscreen when starting exam
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    }
  }, [isOpen, exam]);

  // Real-Time Countdown Timer Ticker
  useEffect(() => {
    if (!isOpen || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.warning("⏰ WAKTU UJIAN HABIS!", {
            description: "Jawaban Anda dikirimkan secara otomatis oleh sistem.",
          });
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeftSeconds]);

  // Anti-Cheating Tab Switch Violation Listener
  useEffect(() => {
    if (!isOpen) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolationCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            toast.error("🔒 UJIAN DIKUNCI OTOMATIS!", {
              description:
                "Anda terdeteksi melakukan kecurangan (meninggalkan tab ujian 3x). Ujian dihentikan & jawaban dikirim.",
              duration: 8000,
            });
            handleAutoSubmit();
          } else {
            toast.error(`⚠️ PERINGATAN KECURANGAN TAB-SWITCH (${next}/3)!`, {
              description:
                "Dilarang meninggalkan tab ujian CBT! Jika mencapai 3x, ujian akan dikunci otomatis!",
              duration: 5000,
            });
          }
          return next;
        });
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    return () => window.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const activeQuestions = questions && questions.length > 0 ? questions : [];

  if (!isOpen || !exam) return null;

  if (activeQuestions.length === 0) {
    return createPortal(
      <div className="fixed inset-0 z-[99999] bg-background w-screen h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="p-8 border border-dashed border-border rounded-xl max-w-md space-y-4 bg-card">
          <ShieldAlert className="h-10 w-10 text-amber-500 mx-auto" />
          <h3 className="text-lg font-bold text-foreground">Belum Ada Soal Terpublikasi</h3>
          <p className="text-xs text-muted-foreground">
            Sesi ujian <strong>{exam.title}</strong> belum memiliki butir soal terdaftar pada database. Silakan hubungi proktor / guru pengampu.
          </p>
          <Button size="sm" onClick={onClose} className="font-bold text-xs">
            Tutup Portal CBT
          </Button>
        </div>
      </div>,
      document.body
    );
  }

  const currentQ = activeQuestions[currentIndex] || activeQuestions[0];

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round((answeredCount / activeQuestions.length) * 100);

  const handleSelectOption = (optionKey: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionKey,
    }));
  };

  const toggleRagu = () => {
    setRaguState((prev) => ({
      ...prev,
      [currentIndex]: !prev[currentIndex],
    }));
  };

  const calculateResults = () => {
    let scorePg = 0;
    activeQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctOption) {
        scorePg += q.points || 5;
      }
    });
    return {
      scorePg,
      totalScore: scorePg,
      violationCount,
    };
  };

  const saveCbtResultToDb = async (results: { scorePg: number; totalScore: number; violationCount: number }) => {
    try {
      const me = MysqlAuthService.getActiveUser();
      let correctCount = 0;
      activeQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctOption) correctCount++;
      });

      await MysqlDataService.saveCbtResult({
        exam_id: exam.id || "cbt-exam-1",
        exam_title: exam.title,
        user_id: me?.id || "usr-siswa-1",
        student_name: me?.full_name || studentName,
        rombel: (me as any)?.class_name || "VIII A",
        score: results.totalScore,
        total_correct: correctCount,
        total_questions: activeQuestions.length,
        status: results.totalScore >= (exam.passingScore || 75) ? "LULUS" : "REMEDIAL",
      });
    } catch (e) {
      console.warn("Gagal menyimpan hasil CBT ke MySQL:", e);
    }
  };

  const handleAutoSubmit = async () => {
    const results = calculateResults();
    await saveCbtResultToDb(results);
    onExamComplete(results);
    onClose();
  };

  const handleManualSubmit = async () => {
    setIsConfirmSubmitOpen(false);
    const results = calculateResults();
    await saveCbtResultToDb(results);
    toast.success("✅ CBT Ujian Berhasil Disubmit & Tersimpan ke MySQL!", {
      description: `Nilai Anda: ${results.totalScore}/100 (${results.totalScore >= (exam.passingScore || 75) ? "LULUS KKM" : "REMEDIAL"})`,
    });
    onExamComplete(results);
    onClose();
  };

  return (
    <>
      {isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-background w-screen h-screen min-h-screen flex flex-col p-0 m-0 overflow-hidden text-foreground">
            {/* Header Panel */}
            <div className="bg-muted/40 border-b border-border p-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold">
                  CBT
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground leading-tight">{exam.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    Mapel: {exam.mapel} | Siswa: <span className="font-semibold text-foreground">{studentName}</span>
                  </p>
                </div>
              </div>

              {/* Timer, Fullscreen, & Violation Badges */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleFullscreen}
                  className="h-8 text-xs font-bold gap-1 bg-background border-border hover:bg-accent"
                  title="Toggle Mode Layar Penuh (Fullscreen)"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 text-primary" /> : <Maximize2 className="h-3.5 w-3.5 text-primary" />}
                  <span className="hidden sm:inline">{isFullscreen ? "Keluar Fullscreen" : "Mode Fullscreen"}</span>
                </Button>

                <Badge
                  variant={timeLeftSeconds < 300 ? "destructive" : "outline"}
                  className={`px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 ${
                    timeLeftSeconds < 300 ? "animate-pulse" : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Sisa Waktu: {formatTime(timeLeftSeconds)}
                </Badge>

                <Badge
                  variant={violationCount > 0 ? "destructive" : "secondary"}
                  className="px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Tab-Switch: {violationCount}/3
                </Badge>

                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-1.5 font-bold text-xs"
                  onClick={() => setIsConfirmSubmitOpen(true)}
                >
                  <Send className="h-3.5 w-3.5" /> Selesai Ujian
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-muted h-1.5 shrink-0">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Main Exam Workspace Layout */}
            <div
              className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border"
              onContextMenu={(e) => e.preventDefault()}
              onCopy={(e) => {
                e.preventDefault();
                toast.error("⚠️ Dilarang menyalin teks soal CBT!");
              }}
            >
              {/* Left: Question Content & Options (3 Cols) */}
              <div className="lg:col-span-3 p-5 sm:p-6 overflow-y-auto flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
                    <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5">
                      Soal No. {currentIndex + 1} dari {activeQuestions.length}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[11px] font-medium">
                        Poin: {currentQ.points || 5}
                      </Badge>
                      <Badge variant="outline" className="text-[11px]">
                        {currentQ.difficulty || "Sedang"}
                      </Badge>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div className="text-base sm:text-lg font-medium text-foreground leading-relaxed">
                    {currentQ.questionText}
                  </div>

                  {/* Multiple Choice Options */}
                  {currentQ.questionType === "pg" && currentQ.options && (
                    <div className="space-y-2.5 pt-2">
                      {(["A", "B", "C", "D"] as const).map((key) => {
                        const isSelected = userAnswers[currentIndex] === key;
                        return (
                          <div
                            key={key}
                            onClick={() => handleSelectOption(key)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-foreground ring-1 ring-emerald-500/50 shadow-sm"
                                : "border-border bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div
                              className={`h-7 w-7 rounded-lg font-bold text-xs flex items-center justify-center transition-colors ${
                                isSelected
                                  ? "bg-emerald-600 text-white"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {key}
                            </div>
                            <div className="text-sm sm:text-base font-normal flex-1">
                              {currentQ.options[key]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bottom Control Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex((prev) => prev - 1)}
                    className="gap-1.5 font-semibold text-xs"
                  >
                    <ChevronLeft className="h-4 w-4" /> Sebelum
                  </Button>

                  <Button
                    variant={raguState[currentIndex] ? "default" : "outline"}
                    size="sm"
                    onClick={toggleRagu}
                    className={`gap-1.5 font-bold text-xs ${
                      raguState[currentIndex]
                        ? "bg-amber-500 hover:bg-amber-600 text-black border-amber-500"
                        : "text-amber-600 dark:text-amber-400 border-amber-400/40 hover:bg-amber-500/10"
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    {raguState[currentIndex] ? "Ragu-Ragu (Aktif)" : "Tandai Ragu-Ragu"}
                  </Button>

                  <Button
                    variant="default"
                    size="sm"
                    disabled={currentIndex === activeQuestions.length - 1}
                    onClick={() => setCurrentIndex((prev) => prev + 1)}
                    className="gap-1.5 font-semibold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Berikutnya <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Right: Question Navigation Grid (1 Col) */}
              <div className="lg:col-span-1 p-4 bg-muted/20 flex flex-col justify-between overflow-y-auto space-y-4">
                <div>
                  <h3 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Navigasi Soal Ujian
                  </h3>

                  <div className="grid grid-cols-5 gap-2">
                    {activeQuestions.map((q, idx) => {
                      const isCurrent = idx === currentIndex;
                      const isAnswered = !!userAnswers[idx];
                      const isRagu = !!raguState[idx];

                      let btnStyle = "bg-card border-border text-muted-foreground hover:border-emerald-500";
                      if (isRagu) {
                        btnStyle = "bg-amber-500 text-black border-amber-600 font-bold shadow-sm";
                      } else if (isAnswered) {
                        btnStyle = "bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm";
                      }

                      if (isCurrent) {
                        btnStyle += " ring-2 ring-emerald-500 ring-offset-2 ring-offset-background";
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIndex(idx)}
                          className={`h-9 w-full rounded-lg text-xs font-semibold border flex items-center justify-center transition-all ${btnStyle}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-emerald-600" />
                      <span>Terjawab ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-amber-500" />
                      <span>Ragu-Ragu ({Object.values(raguState).filter(Boolean).length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded bg-card border border-border" />
                      <span>Belum Terjawab ({activeQuestions.length - answeredCount})</span>
                    </div>
                  </div>
                </div>

                {/* Status Alert Footer */}
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-snug space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Sistem Anti-Cheat Aktif
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Dilarang membuka tab lain atau aplikasi pendukung saat ujian berlangsung.
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Confirmation Submit Modal */}
      <Dialog open={isConfirmSubmitOpen} onOpenChange={setIsConfirmSubmitOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Konfirmasi Selesai Ujian CBT
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Apakah Anda yakin ingin menyelesaikan dan mengirimkan seluruh jawaban CBT ini?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3">
            <div className="p-3 rounded-lg bg-muted/40 text-xs space-y-1.5 border border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Soal:</span>
                <span className="font-bold text-foreground">{activeQuestions.length} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sudah Dijawab:</span>
                <span className="font-bold text-emerald-600">{answeredCount} Soal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Belum Dijawab:</span>
                <span className="font-bold text-amber-600">{activeQuestions.length - answeredCount} Soal</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsConfirmSubmitOpen(false)} className="text-xs font-semibold">
              Batal & Lanjut Kerjakan
            </Button>
            <Button variant="default" size="sm" onClick={handleManualSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ya, Submit Jawaban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
