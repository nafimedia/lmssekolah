import React, { useState, useEffect, useMemo } from "react";
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
  Maximize2,
  Minimize2,
  Wifi,
  WifiOff,
  Volume2,
  RotateCcw,
  ArrowRight,
  Check,
} from "lucide-react";
import { CBTExam, CBTQuestion } from "@/types/cbt";
import { isArabicText } from "@/utils/arabicHelper";
import { normalizeRombelName } from "@/utils/classNormalization";

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
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [raguState, setRaguState] = useState<Record<number, boolean>>({});
  const [violationCount, setViolationCount] = useState(0);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(60 * 60); // Default 60 mins
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [audioPlays, setAudioPlays] = useState<Record<string, number>>({});

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const draftStorageKey = useMemo(() => {
    if (!exam) return "";
    return `cbt_draft_${exam.id || "cbt"}_${studentName.replace(/\s+/g, "_")}`;
  }, [exam, studentName]);

  // Network Status Event Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("📶 Koneksi internet kembali terhubung.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("⚠️ Koneksi internet terputus!", {
        description: "Jawaban Anda tetap tersimpan aman di memori lokal browser.",
      });
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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

  // Initialize Timer and Recover Draft / Reset State when exam opens
  useEffect(() => {
    if (isOpen && exam) {
      // Check if a saved local draft exists for this exam (localStorage or sessionStorage)
      if (draftStorageKey) {
        try {
          const savedDraft = localStorage.getItem(draftStorageKey) || sessionStorage.getItem(draftStorageKey);
          if (savedDraft) {
            const parsed = JSON.parse(savedDraft);
            if (parsed.userAnswers && Object.keys(parsed.userAnswers).length > 0) {
              setUserAnswers(parsed.userAnswers);
              if (parsed.raguState) setRaguState(parsed.raguState);
              if (typeof parsed.timeLeftSeconds === "number" && parsed.timeLeftSeconds > 15) {
                setTimeLeftSeconds(parsed.timeLeftSeconds);
              }
              if (typeof parsed.currentIndex === "number") {
                setCurrentIndex(parsed.currentIndex);
              }
              if (typeof parsed.violationCount === "number") {
                setViolationCount(parsed.violationCount);
              } else {
                setViolationCount(0);
              }
              toast.info("💾 Draft jawaban sebelumnya berhasil dipulihkan secara otomatis.");
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              }
              return;
            }
          }
        } catch (e) {
          console.warn("Gagal memulihkan draft CBT:", e);
        }
      }

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
  }, [isOpen, exam, draftStorageKey]);

  // Real-Time Auto-Save Draft to localStorage & sessionStorage
  useEffect(() => {
    if (!isOpen || !draftStorageKey || Object.keys(userAnswers).length === 0) return;
    try {
      const payload = JSON.stringify({
        userAnswers,
        raguState,
        currentIndex,
        timeLeftSeconds,
        violationCount,
        updatedAt: new Date().toISOString(),
      });
      sessionStorage.setItem(draftStorageKey, payload);
      localStorage.setItem(draftStorageKey, payload);
    } catch (e) {
      console.warn("Gagal menyimpan auto-save draft CBT:", e);
    }
  }, [isOpen, draftStorageKey, userAnswers, raguState, currentIndex, timeLeftSeconds, violationCount]);

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

  // Memoize and prepare active questions (support randomization & question limits)
  const activeQuestions = useMemo(() => {
    if (!questions || questions.length === 0) return [];
    let list = [...questions];
    if (exam?.randomizeQuestions) {
      list = [...list].sort(() => 0.5 - Math.random());
    }
    if (exam?.questionLimit && exam.questionLimit > 0 && exam.questionLimit < list.length) {
      list = list.slice(0, exam.questionLimit);
    }
    return list;
  }, [questions, exam?.id, exam?.randomizeQuestions, exam?.questionLimit]);

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

  const isQuestionAnswered = (idx: number) => {
    const ans = userAnswers[idx];
    if (ans === undefined || ans === null) return false;
    if (typeof ans === "string") return ans.trim().length > 0;
    if (Array.isArray(ans)) return ans.length > 0;
    if (typeof ans === "object") return Object.keys(ans).length > 0;
    return true;
  };

  const answeredCount = activeQuestions.filter((_, idx) => isQuestionAnswered(idx)).length;
  const progressPercent = Math.round((answeredCount / activeQuestions.length) * 100);

  const handleSelectOption = (optionVal: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionVal,
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
    let correctCount = 0;
    let hasEssay = false;
    const detailedAnswers: Record<number, any> = {};

    activeQuestions.forEach((q, idx) => {
      const ans = userAnswers[idx];
      let isCorrect = false;
      let earnedScore = 0;
      const qPoints = q.points || 5;

      if (q.questionType === "essay") {
        hasEssay = true;
        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "essay",
          studentAnswer: ans || "",
          score: 0,
          maxPoints: qPoints,
          graded: false,
        };
      } else if (q.questionType === "pg_kompleks") {
        const keys = (q.extraData?.keyAnswers || q.correctOption?.split(",") || []).map((k: string) => k.trim().toUpperCase());
        const chosenKeys: string[] = Array.isArray(ans)
          ? ans
          : typeof ans === "string"
          ? ans.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean)
          : [];
        const optScores = (q.extraData?.optionScores || {}) as Record<string, number | undefined>;
        let scoreSum = 0;
        let allMatched = true;

        chosenKeys.forEach((ck) => {
          if (keys.includes(ck)) {
            const specificScore = optScores[ck];
            scoreSum += specificScore !== undefined ? specificScore : qPoints / Math.max(1, keys.length);
          } else {
            allMatched = false;
          }
        });
        if (chosenKeys.length !== keys.length) {
          allMatched = false;
        }

        earnedScore = Math.min(qPoints, Math.round(scoreSum));
        isCorrect = allMatched;
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "pg_kompleks",
          studentAnswer: chosenKeys,
          correctOption: keys,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      } else if (q.questionType === "merangkai_kalimat") {
        const studentSentence = (typeof ans === "string" ? ans : Array.isArray(ans) ? ans.join(" ") : "").trim();
        const targetSentence = (q.extraData?.targetSentence || q.correctOption || "").trim();
        isCorrect = studentSentence.length > 0 && studentSentence.toLowerCase().replace(/\s+/g, " ") === targetSentence.toLowerCase().replace(/\s+/g, " ");
        earnedScore = isCorrect ? qPoints : 0;
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "merangkai_kalimat",
          studentAnswer: studentSentence,
          correctOption: targetSentence,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      } else if (q.questionType === "menjodohkan") {
        const pairs: Array<{ left: string; right: string }> = q.extraData?.pairs || [];
        const studentPairs = typeof ans === "object" && ans !== null ? ans : {};
        let matchCount = 0;

        if (pairs.length > 0) {
          pairs.forEach((p, pIdx) => {
            const studentRight = (studentPairs[pIdx] || "").toString().trim().toLowerCase();
            const correctRight = p.right.trim().toLowerCase();
            if (studentRight && studentRight === correctRight) {
              matchCount++;
            }
          });
          earnedScore = Math.round((matchCount / pairs.length) * qPoints);
          isCorrect = matchCount === pairs.length;
        }
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "menjodohkan",
          studentAnswer: studentPairs,
          correctOption: pairs,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      } else if (q.questionType === "benar_salah") {
        const studentChoice = (ans || "").toString().trim().toLowerCase();
        const correctChoice = (q.correctOption || "Benar").trim().toLowerCase();
        isCorrect = studentChoice === correctChoice;
        earnedScore = isCorrect ? qPoints : 0;
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "benar_salah",
          studentAnswer: ans,
          correctOption: q.correctOption,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      } else if (q.questionType === "isian") {
        const studentText = (ans || "").toString().trim().toLowerCase();
        const targetText = (q.correctOption || "").trim().toLowerCase();
        isCorrect = studentText.length > 0 && studentText === targetText;
        earnedScore = isCorrect ? qPoints : 0;
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "isian",
          studentAnswer: ans,
          correctOption: q.correctOption,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      } else if (q.questionType === "numerik") {
        const studentNum = parseFloat(String(ans || "").replace(",", "."));
        const targetNum = parseFloat(String(q.correctOption || "0").replace(",", "."));
        const tolerance = parseFloat(String(q.extraData?.tolerance || "0")) || 0;
        if (!isNaN(studentNum) && !isNaN(targetNum) && Math.abs(studentNum - targetNum) <= tolerance) {
          isCorrect = true;
          earnedScore = qPoints;
        }
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "numerik",
          studentAnswer: ans,
          correctOption: q.correctOption,
          tolerance: q.extraData?.tolerance,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      } else if (q.questionType === "melengkapi") {
        const studentText = (ans || "").toString().trim().toLowerCase();
        const targetText = (q.extraData?.clozeAnswer || q.correctOption || "").trim().toLowerCase();
        isCorrect = studentText.length > 0 && studentText === targetText;
        earnedScore = isCorrect ? qPoints : 0;
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "melengkapi",
          studentAnswer: ans,
          correctOption: q.extraData?.clozeAnswer || q.correctOption,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      } else {
        // PG
        const studentChoice = (ans || "").toString().trim().toUpperCase();
        const correctChoice = (q.correctOption || "A").trim().toUpperCase();
        isCorrect = studentChoice === correctChoice;
        earnedScore = isCorrect ? qPoints : 0;
        scorePg += earnedScore;
        if (isCorrect) correctCount++;

        detailedAnswers[idx] = {
          questionId: q.id,
          questionText: q.questionText,
          questionType: "pg",
          studentAnswer: ans,
          correctOption: q.correctOption,
          isCorrect,
          score: earnedScore,
          maxPoints: qPoints,
        };
      }
    });

    const passingScore = exam?.passingScore || 75;
    let status: "Lulus KKM" | "Remedial" | "Perlu Dikoreksi" = "Remedial";
    if (hasEssay) {
      status = "Perlu Dikoreksi";
    } else {
      status = scorePg >= passingScore ? "Lulus KKM" : "Remedial";
    }

    return {
      scorePg,
      totalScore: scorePg,
      violationCount,
      correctCount,
      hasEssay,
      detailedAnswers,
      status,
    };
  };

  const saveCbtResultToDb = async (results: ReturnType<typeof calculateResults>) => {
    try {
      const me = MysqlAuthService.getActiveUser();
      await MysqlDataService.saveCbtResult({
        exam_id: String(exam.id || "cbt-exam-1"),
        exam_title: exam.title,
        user_id: String(me?.id || "usr-siswa-1"),
        student_name: me?.full_name || studentName,
        rombel: normalizeRombelName(me?.class_name || "Rombel 8A"),
        score: results.totalScore,
        total_correct: results.correctCount,
        total_questions: activeQuestions.length,
        essay_score: 0,
        status: results.status,
        student_answers: JSON.stringify(results.detailedAnswers),
        violations_count: results.violationCount || 0,
      });
    } catch (e) {
      console.warn("Gagal menyimpan hasil CBT ke MySQL:", e);
    }
  };

  const clearDraft = () => {
    if (draftStorageKey) {
      try {
        sessionStorage.removeItem(draftStorageKey);
        localStorage.removeItem(draftStorageKey);
      } catch {}
    }
  };

  const handleAutoSubmit = async () => {
    const results = calculateResults();
    await saveCbtResultToDb(results);
    clearDraft();
    onExamComplete(results);
    onClose();
  };

  const handleManualSubmit = async () => {
    setIsConfirmSubmitOpen(false);
    const results = calculateResults();
    await saveCbtResultToDb(results);
    clearDraft();

    if (results.hasEssay) {
      toast.success("✅ Ujian CBT Berhasil Dikumpulkan!", {
        description: "Jawaban Essay Anda akan dikoreksi dan dinilai manual oleh Guru Pengampu.",
      });
    } else {
      toast.success("✅ Ujian CBT Berhasil Dikumpulkan!", {
        description: `Skor Anda: ${results.totalScore}/100 (${results.status})`,
      });
    }

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

              {/* Timer, Fullscreen, Offline, & Violation Badges */}
              <div className="flex items-center gap-2">
                {!isOnline && (
                  <Badge
                    variant="destructive"
                    className="px-2.5 py-1 text-xs font-bold flex items-center gap-1 animate-pulse"
                  >
                    <WifiOff className="h-3.5 w-3.5" />
                    Offline (Draft Tersimpan)
                  </Badge>
                )}

                <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold px-2">
                  <CheckCircle2 className="h-3 w-3" /> Auto-Save Aktif
                </div>

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

                  {/* Question Illustration Image if available */}
                  {currentQ.imageUrl && (
                    <div className="py-2">
                      <img
                        src={currentQ.imageUrl}
                        alt="Ilustrasi Soal"
                        className="max-h-60 max-w-full rounded-xl border border-border object-contain bg-muted/20 shadow-xs"
                      />
                    </div>
                  )}

                  {/* Question Audio if available (Istima' / Listening) */}
                  {currentQ.audioUrl && (
                    <div className="py-2">
                      <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300">
                        <div className="flex items-center gap-2 font-semibold text-xs">
                          <Volume2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Audio Soal (Istima' / Listening):</span>
                        </div>
                        <audio
                          controls
                          controlsList="nodownload"
                          src={currentQ.audioUrl}
                          className="h-8 max-w-full sm:ml-auto"
                          onPlay={() => {
                            setAudioPlays((prev) => ({
                              ...prev,
                              [currentQ.id]: (prev[currentQ.id] || 0) + 1,
                            }));
                          }}
                        />
                        {audioPlays[currentQ.id] ? (
                          <span className="text-[11px] font-bold bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-800 dark:text-blue-200">
                            Diputar: {audioPlays[currentQ.id]}x
                          </span>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {/* Question Text with Arabic Khat Naskh support */}
                  {(() => {
                    const isAr = isArabicText(currentQ.questionText);
                    return (
                      <div
                        dir={isAr ? "rtl" : "ltr"}
                        className={`pt-1 text-foreground ${
                          isAr
                            ? "font-arabic text-xl sm:text-2xl leading-loose font-bold text-right"
                            : "text-base sm:text-lg font-medium leading-relaxed"
                        }`}
                      >
                        {currentQ.questionText}
                      </div>
                    );
                  })()}

                  {/* 1. Multiple Choice Options (PG Tunggal) */}
                  {currentQ.questionType === "pg" && currentQ.options && (
                    <div className="space-y-2.5 pt-2">
                      {(["A", "B", "C", "D"] as const).map((key) => {
                        const isSelected = userAnswers[currentIndex] === key;
                        const optText = currentQ.options[key] || "";
                        const isOptAr = isArabicText(optText);

                        return (
                          <div
                            key={key}
                            dir={isOptAr ? "rtl" : "ltr"}
                            onClick={() => handleSelectOption(key)}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 text-foreground ring-2 ring-emerald-500/50 shadow-sm"
                                : "border-border bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <div
                              className={`h-8 w-8 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {key}
                            </div>
                            <div className={`flex-1 ${isOptAr ? "font-arabic text-lg font-medium text-right leading-loose" : "text-sm sm:text-base"}`}>
                              {optText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Pilihan Ganda Kompleks (Multi Jawaban) */}
                  {currentQ.questionType === "pg_kompleks" && currentQ.options && (() => {
                    const chosenKeys: string[] = Array.isArray(userAnswers[currentIndex])
                      ? userAnswers[currentIndex]
                      : typeof userAnswers[currentIndex] === "string" && userAnswers[currentIndex]
                      ? userAnswers[currentIndex].split(",").map((k: string) => k.trim())
                      : [];

                    const toggleKey = (key: string) => {
                      const next = chosenKeys.includes(key)
                        ? chosenKeys.filter((k) => k !== key)
                        : [...chosenKeys, key].sort();
                      handleSelectOption(next);
                    };

                    return (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold">Centang satu atau lebih pilihan jawaban yang benar:</span>
                          <Badge variant="outline" className="text-sky-600 dark:text-sky-400 font-bold border-sky-400/40 bg-sky-500/10">
                            {chosenKeys.length} Terpilih
                          </Badge>
                        </div>
                        <div className="space-y-2.5">
                          {(["A", "B", "C", "D"] as const).map((key) => {
                            const optText = currentQ.options[key] || "";
                            if (!optText) return null;
                            const isSelected = chosenKeys.includes(key);
                            const isOptAr = isArabicText(optText);

                            return (
                              <div
                                key={key}
                                dir={isOptAr ? "rtl" : "ltr"}
                                onClick={() => toggleKey(key)}
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3.5 ${
                                  isSelected
                                    ? "bg-sky-500/10 border-sky-500 text-foreground ring-2 ring-sky-500/50 shadow-sm"
                                    : "border-border bg-card hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                <div
                                  className={`h-7 w-7 rounded-md font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-sky-600 text-white shadow-xs"
                                      : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {isSelected ? <Check className="h-4 w-4" /> : key}
                                </div>
                                <div className={`flex-1 ${isOptAr ? "font-arabic text-lg font-medium text-right leading-loose" : "text-sm sm:text-base"}`}>
                                  {optText}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 3. Merangkai Kalimat (Bahasa) */}
                  {currentQ.questionType === "merangkai_kalimat" && (() => {
                    const allWords: string[] =
                      currentQ.extraData?.scrambledWords ||
                      (currentQ.extraData?.targetSentence || currentQ.questionText || "")
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean);

                    const chosenWords: string[] = Array.isArray(userAnswers[currentIndex])
                      ? userAnswers[currentIndex]
                      : typeof userAnswers[currentIndex] === "string" && userAnswers[currentIndex].trim()
                      ? userAnswers[currentIndex].trim().split(" ")
                      : [];

                    const isAr = isArabicText(currentQ.extraData?.targetSentence || currentQ.questionText || "");

                    const addWord = (w: string) => {
                      const next = [...chosenWords, w];
                      handleSelectOption(next.join(" "));
                    };

                    const removeWordAt = (wIdx: number) => {
                      const next = chosenWords.filter((_, idx) => idx !== wIdx);
                      handleSelectOption(next.join(" "));
                    };

                    const resetWords = () => {
                      handleSelectOption("");
                    };

                    return (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold">Klik kata-kata di bawah untuk menyusun kalimat yang tepat:</span>
                          {chosenWords.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={resetWords}
                              className="h-7 text-xs text-destructive hover:bg-destructive/10 gap-1"
                            >
                              <RotateCcw className="h-3 w-3" /> Reset Susunan
                            </Button>
                          )}
                        </div>

                        {/* Assembled Sentence Box */}
                        <div
                          dir={isAr ? "rtl" : "ltr"}
                          className={`min-h-[70px] p-4 rounded-xl border-2 border-dashed ${
                            chosenWords.length > 0
                              ? "border-orange-500/60 bg-orange-500/10 dark:bg-orange-950/20"
                              : "border-border bg-muted/20"
                          } flex flex-wrap items-center gap-2`}
                        >
                          {chosenWords.length === 0 ? (
                            <span className="text-xs text-muted-foreground italic">
                              Kalimat yang Anda susun akan muncul di sini...
                            </span>
                          ) : (
                            chosenWords.map((word, wIdx) => (
                              <button
                                key={wIdx}
                                type="button"
                                onClick={() => removeWordAt(wIdx)}
                                title="Klik untuk menghapus kata ini"
                                className={`px-3 py-1 rounded-lg bg-orange-600 text-white font-bold text-xs shadow-xs hover:bg-orange-700 transition cursor-pointer flex items-center gap-1 ${
                                  isAr ? "font-arabic text-base" : ""
                                }`}
                              >
                                <span>{word}</span>
                                <span className="text-orange-200 text-[10px]">✕</span>
                              </button>
                            ))
                          )}
                        </div>

                        {/* Word Pool / Bank */}
                        <div className="space-y-2">
                          <span className="text-[11px] text-muted-foreground block font-medium">Pilihan Kata:</span>
                          <div className="flex flex-wrap gap-2" dir={isAr ? "rtl" : "ltr"}>
                            {allWords.map((word, wIdx) => {
                              // Count occurrences in chosen vs total
                              const occurrencesInTarget = allWords.filter((x) => x === word).length;
                              const occurrencesInChosen = chosenWords.filter((x) => x === word).length;
                              const isUsedUp = occurrencesInChosen >= occurrencesInTarget;

                              return (
                                <button
                                  key={wIdx}
                                  type="button"
                                  disabled={isUsedUp}
                                  onClick={() => addWord(word)}
                                  className={`px-3.5 py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                                    isUsedUp
                                      ? "opacity-30 bg-muted text-muted-foreground cursor-not-allowed border-border"
                                      : "bg-card border-border hover:border-orange-500 text-foreground hover:bg-orange-500/10 shadow-xs"
                                  } ${isAr ? "font-arabic text-base" : ""}`}
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

                  {/* 4. Menjodohkan */}
                  {currentQ.questionType === "menjodohkan" && (() => {
                    const pairs: Array<{ left: string; right: string }> = currentQ.extraData?.pairs || [];
                    const currentAns: Record<number, string> =
                      typeof userAnswers[currentIndex] === "object" && userAnswers[currentIndex] !== null
                        ? userAnswers[currentIndex]
                        : {};

                    const rightOptions = Array.from(new Set(pairs.map((p) => p.right).filter(Boolean))).sort();
                    const isAr = isArabicText(currentQ.questionText);

                    return (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold">Pilih pasangan respon tepat untuk setiap premis di bawah:</span>
                          <Badge variant="outline" className="text-indigo-600 dark:text-indigo-400 border-indigo-400/40 bg-indigo-500/10">
                            {Object.keys(currentAns).filter((k) => !!currentAns[Number(k)]).length} / {pairs.length} Terjodohkan
                          </Badge>
                        </div>

                        <div className="space-y-2.5">
                          {pairs.map((p, pIdx) => {
                            const chosenVal = currentAns[pIdx] || "";
                            return (
                              <div
                                key={pIdx}
                                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                                  chosenVal
                                    ? "bg-indigo-500/10 border-indigo-500/40 text-foreground"
                                    : "bg-card border-border text-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 flex-1">
                                  <span className="h-6 w-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                    {pIdx + 1}
                                  </span>
                                  <span className={`font-semibold text-foreground ${isAr ? "font-arabic text-base" : "text-sm"}`}>
                                    {p.left}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                                  <select
                                    value={chosenVal}
                                    onChange={(e) => {
                                      const next = { ...currentAns, [pIdx]: e.target.value };
                                      handleSelectOption(next);
                                    }}
                                    className={`h-9 w-full px-3 rounded-lg border text-xs font-semibold bg-background cursor-pointer ${
                                      chosenVal
                                        ? "border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/40"
                                        : "border-border text-muted-foreground"
                                    }`}
                                  >
                                    <option value="">-- Pilih Pasangan --</option>
                                    {rightOptions.map((opt, oIdx) => (
                                      <option key={oIdx} value={opt}>
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

                  {/* 5. Benar / Salah Options */}
                  {currentQ.questionType === "benar_salah" && (
                    <div className="grid grid-cols-2 gap-4 pt-3">
                      {["Benar", "Salah"].map((val) => {
                        const isSelected = userAnswers[currentIndex] === val;
                        return (
                          <div
                            key={val}
                            onClick={() => handleSelectOption(val)}
                            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-center gap-2 font-bold text-base ${
                              isSelected
                                ? "bg-teal-500/10 border-teal-600 text-teal-700 dark:text-teal-300 ring-2 ring-teal-500/30"
                                : "border-border bg-card hover:bg-accent text-foreground"
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="h-5 w-5 text-teal-600" />}
                            <span>{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 6. Isian Singkat */}
                  {currentQ.questionType === "isian" && (() => {
                    const ansVal = typeof userAnswers[currentIndex] === "string" ? userAnswers[currentIndex] : "";
                    const isAr = isArabicText(ansVal) || isArabicText(currentQ.questionText);
                    return (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold">Tuliskan jawaban singkat Anda:</span>
                          {isAr && (
                            <span className="text-amber-600 font-semibold font-arabic">الكتابة بالعربية (Khat Naskh)</span>
                          )}
                        </div>
                        <input
                          type="text"
                          dir={isAr ? "rtl" : "ltr"}
                          placeholder={isAr ? "اكتب الإجابة القصيرة هنا..." : "Ketik jawaban singkat Anda di sini..."}
                          value={ansVal}
                          onChange={(e) => handleSelectOption(e.target.value)}
                          className={`w-full p-3.5 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-semibold ${
                            isAr ? "font-arabic text-lg leading-loose text-right" : "text-sm"
                          }`}
                        />
                      </div>
                    );
                  })()}

                  {/* 7. Essay Input Textarea */}
                  {currentQ.questionType === "essay" && (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold">Tuliskan Jawaban Uraian Anda:</span>
                        {isArabicText(userAnswers[currentIndex] || "") && (
                          <span className="text-amber-600 font-semibold font-arabic">الكتابة بالعربية (Khat Naskh)</span>
                        )}
                      </div>
                      <textarea
                        rows={6}
                        dir={isArabicText(userAnswers[currentIndex] || "") ? "rtl" : "ltr"}
                        placeholder="Tuliskan uraian jawaban Anda di sini..."
                        value={userAnswers[currentIndex] || ""}
                        onChange={(e) => handleSelectOption(e.target.value)}
                        className={`w-full p-4 rounded-xl border border-input bg-card focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                          isArabicText(userAnswers[currentIndex] || "")
                            ? "font-arabic text-lg leading-loose text-right"
                            : "text-sm leading-relaxed"
                        }`}
                      />
                      <p className="text-[11px] text-muted-foreground">
                        *Jawaban essay tersimpan otomatis dan akan dikoreksi langsung oleh guru pengampu mata pelajaran.
                      </p>
                    </div>
                  )}

                  {/* 8. Numerik */}
                  {currentQ.questionType === "numerik" && (
                    <div className="space-y-2 pt-2">
                      <span className="font-semibold text-xs text-muted-foreground block">
                        Masukkan angka hasil perhitungan / nilai numerik:
                      </span>
                      <input
                        type="text"
                        placeholder="Contoh: 100 atau 3.14"
                        value={userAnswers[currentIndex] !== undefined ? String(userAnswers[currentIndex]) : ""}
                        onChange={(e) => handleSelectOption(e.target.value)}
                        className="w-full max-w-sm p-3.5 rounded-xl border border-input bg-card font-mono text-base font-bold text-amber-700 dark:text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      />
                    </div>
                  )}

                  {/* 9. Melengkapi Kalimat */}
                  {currentQ.questionType === "melengkapi" && (() => {
                    const ansVal = typeof userAnswers[currentIndex] === "string" ? userAnswers[currentIndex] : "";
                    const isAr = isArabicText(ansVal) || isArabicText(currentQ.questionText);
                    return (
                      <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="font-semibold">Ketikkan kata / frasa untuk melengkapi bagian rumpang [...]:</span>
                          {isAr && (
                            <span className="text-amber-600 font-semibold font-arabic">الكتابة بالعربية (Khat Naskh)</span>
                          )}
                        </div>
                        <input
                          type="text"
                          dir={isAr ? "rtl" : "ltr"}
                          placeholder={isAr ? "اكتب الكلمة المناسبة هنا..." : "Ketik kata/frasa pengisi bagian rumpang..."}
                          value={ansVal}
                          onChange={(e) => handleSelectOption(e.target.value)}
                          className={`w-full max-w-lg p-3.5 rounded-xl border border-input bg-card font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${
                            isAr ? "font-arabic text-lg leading-loose text-right" : "text-sm"
                          }`}
                        />
                      </div>
                    );
                  })()}
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
                      const isAnswered = isQuestionAnswered(idx);
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
