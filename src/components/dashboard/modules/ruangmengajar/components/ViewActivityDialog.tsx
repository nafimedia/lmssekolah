import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Users,
  Brain,
  CheckCircle2,
  Save,
  Check,
  Lock,
  ExternalLink,
  MessageSquare,
  Send,
  Star,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  BookOpen,
  Target,
  PenTool,
  ArrowRight,
  Volume2,
  Image as ImageIcon,
  Sparkles,
  Database,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService, LkpdDiscussionRow, PeerAssessmentRow } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";
import { QuizQuestionType, QUIZ_QUESTION_TYPE_CONFIG } from "@/types/quiz";
import { isArabicText } from "@/utils/arabicHelper";

export interface ActivityDetail {
  id: string;
  title: string;
  type: "LKPD" | "TUGAS_KELOMPOK" | "QUIZ" | "REFLEKSI" | string;
  instructions?: string;
  dueDate: string;
  status: string;
  submittedCount: number;
  totalStudents: number;
  attachment_url?: string;
  submission_type?: string;
  quiz_data?: string;
  questions_data?: string;
  peer_assessment_enabled?: number | boolean;
}

interface StudentGradeRow {
  id: string;
  nisn: string;
  name: string;
  status: string;
  score: string;
  feedback: string;
}

interface ViewActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ActivityDetail | null;
  activeRombel: string;
  activeMapel: string;
}

export function ViewActivityDialog({
  isOpen,
  onOpenChange,
  activity,
  activeRombel,
  activeMapel,
}: ViewActivityDialogProps) {
  const [grades, setGrades] = useState<StudentGradeRow[]>([]);
  const [discussions, setDiscussions] = useState<LkpdDiscussionRow[]>([]);
  const [peerAssessments, setPeerAssessments] = useState<PeerAssessmentRow[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isExportingToCbt, setIsExportingToCbt] = useState(false);
  const isAllowed = isSubjectAllowedForUser(activeMapel);

  const activeUser = MysqlAuthService.getActiveUser();

  useEffect(() => {
    if (!isOpen || !activity) return;

    let isMounted = true;
    Promise.all([
      MysqlDataService.getLkpdGrades(activity.id),
      MysqlDataService.getUsers(),
      MysqlDataService.getLkpdDiscussions(activity.id),
      MysqlDataService.getPeerAssessments(activity.id),
    ]).then(([savedGrades, users, discList, peerList]) => {
      if (!isMounted) return;
      if (discList) setDiscussions(discList);
      if (peerList) setPeerAssessments(peerList);

      const siswaList = (users || []).filter((u: any) => u.role === "siswa");

      const normActive = activeRombel.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
      const is7A = normActive.includes("VIIA") || normActive.includes("7A");
      const is7B = normActive.includes("VIIB") || normActive.includes("7B");
      const is8A = normActive.includes("VIIIA") || normActive.includes("8A");
      const is8B = normActive.includes("VIIIB") || normActive.includes("8B");
      const is9A = normActive.includes("IXA") || normActive.includes("9A");
      const is9B = normActive.includes("IXB") || normActive.includes("9B");

      const matched = siswaList.filter((u: any) => {
        const cls = (u.class_name || u.class || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
        if (is7A) return cls.includes("VIIA") || cls.includes("7A");
        if (is7B) return cls.includes("VIIB") || cls.includes("7B");
        if (is8A) return cls.includes("VIIIA") || cls.includes("8A");
        if (is8B) return cls.includes("VIIIB") || cls.includes("8B");
        if (is9A) return cls.includes("IXA") || cls.includes("9A");
        if (is9B) return cls.includes("IXB") || cls.includes("9B");
        return cls === normActive || cls.includes(normActive) || normActive.includes(cls);
      });

      if (matched.length > 0) {
        setGrades(
          matched.map((u: any, idx: number) => {
            const nisn = u.nis_nip || u.nis || "-";
            const match = savedGrades?.find(
              (g) => g.student_nisn === nisn || (g.student_name && g.student_name.toLowerCase() === (u.full_name || u.name).toLowerCase())
            );
            return {
              id: u.id || `g_${idx}`,
              nisn: nisn,
              name: u.full_name || u.name,
              status: match?.status || "BELUM MENGUMPULKAN",
              score: match?.score ? String(match.score) : "",
              feedback: match?.feedback || "",
            };
          })
        );
      } else {
        setGrades([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeRombel, activity]);

  if (!activity) return null;

  const handleStatusChange = (id: string, status: string) => {
    if (!isAllowed) return;
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
  };

  const handleScoreChange = (id: string, score: string) => {
    if (!isAllowed) return;
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, score } : g)));
  };

  const handleFeedbackChange = (id: string, feedback: string) => {
    if (!isAllowed) return;
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, feedback } : g)));
  };

  const handleSendDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activity) return;

    const payload = {
      activity_id: activity.id,
      user_name: activeUser?.full_name || "Guru Pengampu",
      user_role: activeUser?.role || "guru",
      message: newMessage.trim(),
    };

    const res = await MysqlDataService.postLkpdDiscussion(payload);
    if (res.success) {
      setDiscussions((prev) => [
        ...prev,
        {
          id: res.id || String(Date.now()),
          activity_id: activity.id,
          user_name: payload.user_name,
          user_role: payload.user_role,
          message: payload.message,
          created_at: "Baru saja",
        },
      ]);
      setNewMessage("");
      toast.success("💬 Pesan diskusi berhasil terkirim!");
    }
  };

  const handleSaveGrades = async () => {
    if (!activity) return;
    if (!isAllowed) {
      return toast.error("Akses Ditolak: Anda hanya memiliki hak akses Lihat pada Mata Pelajaran ini.");
    }
    const dbGrades = grades.map((g) => ({
      activity_id: activity.id,
      student_id: g.id,
      student_nisn: g.nisn,
      student_name: g.name,
      status: g.status,
      score: g.score,
      feedback: g.feedback,
    }));

    await MysqlDataService.saveLkpdGradesBatch(activity.id, dbGrades);
    toast.success(`✅ Nilai "${activity.title}" berhasil disimpan & tersinkronisasi ke Penilaian Kelas!`);
    onOpenChange(false);
  };

  // Parse Quiz Data if available
  let parsedQuizQuestions: any[] = [];
  if (activity.quiz_data) {
    try {
      parsedQuizQuestions = JSON.parse(activity.quiz_data);
    } catch (e) {
      parsedQuizQuestions = [];
    }
  }

  const handleExportToCbtBank = async () => {
    if (!parsedQuizQuestions || parsedQuizQuestions.length === 0) {
      toast.error("Tidak ada butir soal kuis untuk disalin!");
      return;
    }

    setIsExportingToCbt(true);
    try {
      const quizToCbtType: Record<string, string> = {
        PG: "pg",
        PG_KOMPLEKS: "pg_kompleks",
        MERANGKAI_KALIMAT: "merangkai_kalimat",
        MENJODOHKAN: "menjodohkan",
        BENAR_SALAH: "benar_salah",
        ISIAN_SINGKAT: "isian",
        ESAI: "essay",
        NUMERIK: "numerik",
        MELENGKAPI: "melengkapi",
      };

      // Pastikan paket ujian CBT untuk mapel ini tersedia
      let targetExamId: number | string = 1;
      try {
        const exams = await MysqlDataService.getCbtExams();
        const existingExam = exams.find(
          (e: any) => e.title === activity.title || (e.subject_name === activeMapel && e.class_name === activeRombel)
        );
        if (existingExam && existingExam.id) {
          targetExamId = existingExam.id;
        } else {
          const createExamRes = await MysqlDataService.saveCbtExam({
            title: activity.title || `Kuis ${activeMapel}`,
            subject_name: activeMapel || "Umum",
            token: Math.random().toString(36).substring(2, 8).toUpperCase(),
            duration_minutes: 60,
            passing_score: 75,
            class_name: activeRombel || "Semua Kelas",
            randomize_questions: 0,
            randomize_options: 0,
            question_limit: 0,
          });
          if (createExamRes.id) {
            targetExamId = createExamRes.id;
          }
        }
      } catch (examErr) {
        console.warn("Auto-create CBT exam skipped, using default exam_id:", examErr);
      }

      let successCount = 0;
      for (const q of parsedQuizQuestions) {
        const cbtType = quizToCbtType[q.type] || "pg";
        const extraObj = {
          keyAnswers: q.keyAnswers,
          optionScores: q.optionScores,
          targetSentence: q.targetSentence,
          scrambledWords: q.scrambledWords,
          pairs: q.pairs,
          tolerance: q.tolerance,
          clozeAnswer: q.clozeAnswer,
        };

        const res = await MysqlDataService.saveCbtQuestion({
          exam_id: targetExamId,
          question_text: q.question || "",
          question_type: cbtType,
          image_url: q.imageUrl || q.image_url || undefined,
          audio_url: q.audioUrl || q.audio_url || undefined,
          option_a: q.optionA || "",
          option_b: q.optionB || "",
          option_c: q.optionC || "",
          option_d: q.optionD || "",
          correct_option: q.keyAnswer || "A",
          points: Number(q.points) || 10,
          extra_data: JSON.stringify(extraObj),
        });

        if (res && res.success) {
          successCount++;
        }
      }

      toast.success(`🎉 Berhasil menyalin ${successCount} dari ${parsedQuizQuestions.length} butir soal ke Bank Soal CBT!`);
    } catch (e) {
      console.error("Export to CBT failed:", e);
      toast.error("Terjadi kendala saat menyalin soal ke Bank Soal CBT.");
    } finally {
      setIsExportingToCbt(false);
    }
  };

  // Parse LKPD Questions if available
  let parsedLkpdQuestions: any[] = [];
  if (activity.questions_data) {
    try {
      parsedLkpdQuestions = JSON.parse(activity.questions_data);
    } catch (e) {
      parsedLkpdQuestions = [];
    }
  }

  // Group peer assessment by student (evaluatee)
  const peerAssessmentByStudent = useMemo(() => {
    const map: Record<string, {
      evaluations: PeerAssessmentRow[];
      avgScore: number;
      avgKeaktifan: number;
      avgKerjasama: number;
      avgTanggungJawab: number;
      avgSikap: number;
    }> = {};

    for (const pa of peerAssessments) {
      const key = (pa.evaluatee_nisn || pa.evaluatee_name || "").toLowerCase().trim();
      if (!map[key]) {
        map[key] = {
          evaluations: [],
          avgScore: 0,
          avgKeaktifan: 0,
          avgKerjasama: 0,
          avgTanggungJawab: 0,
          avgSikap: 0,
        };
      }
      map[key].evaluations.push(pa);
    }

    for (const key in map) {
      const list = map[key].evaluations;
      const total = list.length;
      if (total > 0) {
        map[key].avgKeaktifan = Number((list.reduce((acc, c) => acc + Number(c.score_keaktifan || 0), 0) / total).toFixed(1));
        map[key].avgKerjasama = Number((list.reduce((acc, c) => acc + Number(c.score_kerjasama || 0), 0) / total).toFixed(1));
        map[key].avgTanggungJawab = Number((list.reduce((acc, c) => acc + Number(c.score_tanggung_jawab || 0), 0) / total).toFixed(1));
        map[key].avgSikap = Number((list.reduce((acc, c) => acc + Number(c.score_sikap || 0), 0) / total).toFixed(1));
        map[key].avgScore = Number((list.reduce((acc, c) => acc + Number(c.average_score || 0), 0) / total).toFixed(2));
      }
    }

    return map;
  }, [peerAssessments]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-semibold gap-1">
                {activity.type === "LKPD" && <FileText className="h-3 w-3 text-emerald-600" />}
                {activity.type === "TUGAS_KELOMPOK" && <Users className="h-3 w-3 text-blue-600" />}
                {activity.type === "TUGAS_MANDIRI" && <PenTool className="h-3 w-3 text-emerald-600" />}
                {activity.type === "QUIZ" && <Brain className="h-3 w-3 text-purple-600" />}
                {activity.type === "REFLEKSI" && <Sparkles className="h-3 w-3 text-amber-500" />}
                {activity.type === "PRAKTIKUM" && <FlaskConical className="h-3 w-3 text-teal-600" />}
                {activity.type === "PROYEK_P5" && <Target className="h-3 w-3 text-rose-600" />}
                {activity.type === "HAFALAN" && <BookOpen className="h-3 w-3 text-indigo-600" />}
                {activity.type === "LKPD"
                  ? "📄 LKPD Digital"
                  : activity.type === "TUGAS_KELOMPOK"
                  ? "👥 Diskusi Kelompok"
                  : activity.type === "TUGAS_MANDIRI"
                  ? "✍️ Tugas Mandiri"
                  : activity.type === "QUIZ"
                  ? "⚡ Kuis Formatif"
                  : activity.type === "REFLEKSI"
                  ? "✨ Refleksi & Umpan Balik"
                  : activity.type === "PRAKTIKUM"
                  ? "🔬 Praktikum & Lab"
                  : activity.type === "PROYEK_P5"
                  ? "🎯 Kegiatan Kokurikuler"
                  : activity.type === "HAFALAN"
                  ? "📖 Setoran Hafalan"
                  : activity.type}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                {activeMapel} · {activeRombel}
              </span>
            </div>

            {!isAllowed && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold text-[10px] gap-1">
                <Lock className="h-3 w-3" /> 🔒 Hanya Dibaca (Bukan Pengampu Mapel)
              </Badge>
            )}
          </div>

          <DialogTitle className="text-lg font-bold">{activity.title}</DialogTitle>
          <DialogDescription className="text-xs">
            Batas Waktu: {activity.dueDate} · Progres Pengumpulan: {grades.filter((g) => g.status === "TERKUMPUL").length}/{grades.length || activity.totalStudents} Siswa
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" /> Petunjuk & Deskripsi Aktivitas
              </h4>

              {activity.attachment_url && (
                <a
                  href={activity.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-md border border-emerald-500/40 shadow-2xs"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-600" />
                  {activity.attachment_url.startsWith("/uploads/") ? "📄 Buka Lembar PDF LKPD (File Server)" : "🔗 Buka Lampiran Eksternal"}
                </a>
              )}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {activity.instructions || "Tuliskan petunjuk pengerjaan dan bahan rujukan..."}
            </p>
          </div>

          {/* Tampilan Butir Soal Terstruktur LKPD / Praktikum */}
          {parsedLkpdQuestions.length > 0 && (
            <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  {activity.type === "PRAKTIKUM"
                    ? `Lembar Langkah & Pengamatan Praktikum (${parsedLkpdQuestions.length} Butir Soal)`
                    : activity.type === "HAFALAN"
                    ? `Target Ayat & Butir Setoran Hafalan (${parsedLkpdQuestions.length} Butir)`
                    : activity.type === "PROYEK_P5"
                    ? `Tahapan & Lembar Kerja Proyek (${parsedLkpdQuestions.length} Butir)`
                    : `Lembar Butir Pertanyaan / Tugas Terstruktur (${parsedLkpdQuestions.length} Butir Soal)`}
                </h4>
                <Badge variant="outline" className="text-[10px] font-bold border-emerald-400 text-emerald-700 dark:text-emerald-300">
                  Total {parsedLkpdQuestions.reduce((acc, q) => acc + (Number(q.points) || 0), 0)} Poin
                </Badge>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {parsedLkpdQuestions.map((q: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-card text-xs space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        Pertanyaan #{idx + 1}
                      </span>
                      <Badge className="bg-emerald-600 text-white font-semibold text-[10px] tabular-nums">
                        Bobot: {q.points || 0} Poin
                      </Badge>
                    </div>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{q.question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tampilan Soal Kuis Formatif & Refleksi Pembelajaran */}
          {(activity.type === "QUIZ" || activity.type === "REFLEKSI") && parsedQuizQuestions.length > 0 && (
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/30 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-bold text-xs text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                  {activity.type === "REFLEKSI" ? <Sparkles className="h-4 w-4 text-amber-500" /> : <Brain className="h-4 w-4 text-purple-600" />}
                  {activity.type === "REFLEKSI" ? "Butir Instrumen Refleksi & Umpan Balik" : "Butir Soal Kuis Formatif"} ({parsedQuizQuestions.length} Butir)
                </h4>
                <div className="flex items-center gap-2">
                  {activity.type === "QUIZ" && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={isExportingToCbt || !isAllowed}
                      onClick={handleExportToCbtBank}
                      className="h-7 text-xs font-semibold gap-1.5 border-blue-400/60 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                      title="Salin seluruh butir soal kuis ini ke Bank Soal CBT Madrasah"
                    >
                      <Database className="h-3.5 w-3.5 text-blue-600" />
                      {isExportingToCbt ? "Menyalin ke CBT..." : "Salin ke Bank Soal CBT"}
                    </Button>
                  )}
                  <Badge variant="outline" className="text-[10px] font-bold border-purple-400 text-purple-700 dark:text-purple-300">
                    {activity.type === "REFLEKSI" ? "Non-Graded (Survei Respon)" : `Total ${parsedQuizQuestions.reduce((acc: number, q: any) => acc + (Number(q.points) || 10), 0)} Poin`}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                {parsedQuizQuestions.map((q: any, idx: number) => {
                  const qType = (q.type as QuizQuestionType) || "PG";
                  const cfg = QUIZ_QUESTION_TYPE_CONFIG[qType] || QUIZ_QUESTION_TYPE_CONFIG.PG;

                  return (
                    <div key={idx} className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-card text-xs space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-700 dark:text-purple-300">
                            #{idx + 1}
                          </span>
                          <Badge variant="outline" className={`text-[9px] font-semibold ${cfg.badgeColor}`}>
                            {cfg.shortLabel}
                          </Badge>
                        </div>
                        <Badge className="bg-purple-600/10 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-semibold text-[10px] tabular-nums">
                          {q.points || 10} Poin
                        </Badge>
                      </div>

                      {/* Media Lampiran Soal (Audio & Gambar) */}
                      {(q.audio_url || q.image_url) && (
                        <div className="flex flex-wrap items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/60">
                          {q.audio_url && (
                            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                              <Volume2 className="h-4 w-4 text-purple-600 shrink-0" />
                              <audio controls src={q.audio_url} className="h-7 w-full max-w-xs" />
                            </div>
                          )}
                          {q.image_url && (
                            <div className="flex items-center gap-2">
                              <ImageIcon className="h-4 w-4 text-purple-600 shrink-0" />
                              <a
                                href={q.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative block"
                              >
                                <img
                                  src={q.image_url}
                                  alt="Gambar Soal"
                                  className="h-14 w-auto rounded border border-border object-contain group-hover:opacity-80 transition"
                                />
                                <span className="text-[9px] text-primary underline block mt-0.5">Buka Gambar</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {(() => {
                        const isQAr = isArabicText(q.question);
                        return (
                          <div
                            dir={isQAr ? "rtl" : "ltr"}
                            className={`font-medium whitespace-pre-wrap ${
                              isQAr
                                ? "font-arabic text-base sm:text-lg leading-loose font-bold text-right text-foreground"
                                : "text-foreground leading-relaxed"
                            }`}
                          >
                            {q.question}
                          </div>
                        );
                      })()}

                      {/* Detail per jenis soal */}
                      {qType === "PG" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                          {(["A", "B", "C", "D"] as const).map((optKey) => {
                            const propName = `option${optKey}` as "optionA" | "optionB" | "optionC" | "optionD";
                            const optVal = q[propName] || "";
                            const isOptAr = isArabicText(optVal);
                            const isKey = q.keyAnswer === optKey;
                            return (
                              <span
                                key={optKey}
                                dir={isOptAr ? "rtl" : "ltr"}
                                className={`p-1 rounded ${
                                  isKey ? "font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" : ""
                                } ${isOptAr ? "font-arabic text-sm text-right leading-loose" : ""}`}
                              >
                                {optKey}. {optVal} {isKey && "✓ (Kunci)"}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {qType === "PG_KOMPLEKS" && (() => {
                        const keyAns = (q.keyAnswers && q.keyAnswers.length > 0
                          ? q.keyAnswers
                          : q.keyAnswer
                          ? [q.keyAnswer]
                          : ["A"]
                        ).map((k: string) => k.toUpperCase());

                        const optScores = q.optionScores || {};

                        const opts = [
                          { key: "A", text: q.optionA, score: optScores.A },
                          { key: "B", text: q.optionB, score: optScores.B },
                          { key: "C", text: q.optionC, score: optScores.C },
                          { key: "D", text: q.optionD, score: optScores.D },
                        ].filter((o) => Boolean(o.text));

                        return (
                          <div className="space-y-1.5 pt-1 border-t border-border/50 text-[11px]">
                            <span className="font-semibold text-purple-700 dark:text-purple-300 block text-[10px]">
                              Opsi Pilihan Ganda Kompleks & Kunci Benar:
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {opts.map((opt) => {
                                const isKey = keyAns.includes(opt.key);
                                return (
                                  <div
                                    key={opt.key}
                                    className={`p-1.5 rounded flex items-center justify-between gap-1.5 ${
                                      isKey ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold" : "bg-muted/30 text-muted-foreground"
                                    }`}
                                  >
                                    <span className="leading-snug">
                                      {opt.key}. {opt.text}
                                    </span>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {opt.score !== undefined && opt.score > 0 && (
                                        <Badge variant="outline" className="text-[9px] py-0 px-1 border-emerald-500/40 text-emerald-600">
                                          +{opt.score} pt
                                        </Badge>
                                      )}
                                      {isKey && <Check className="h-3 w-3 text-emerald-600" />}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {qType === "MERANGKAI_KALIMAT" && (
                        <div className="space-y-1.5 pt-1 border-t border-border/50 text-[11px]">
                          <span className="font-semibold text-purple-700 dark:text-purple-300 block text-[10px]">
                            Kunci Kalimat Lengkap:
                          </span>
                          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 font-bold">
                            "{q.targetSentence || q.question}"
                          </div>
                          {Array.isArray(q.scrambledWords) && q.scrambledWords.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1 text-[10px]">
                              <span className="text-muted-foreground font-semibold">Kata Acak:</span>
                              {q.scrambledWords.map((w: string, wIdx: number) => (
                                <Badge key={wIdx} variant="secondary" className="text-[9px] py-0 px-1.5 font-normal">
                                  {w}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {qType === "MENJODOHKAN" && Array.isArray(q.pairs) && (
                        <div className="space-y-1.5 pt-1 border-t border-border/50 text-[11px]">
                          <span className="font-semibold text-muted-foreground block text-[10px]">Pasangan Premis & Kunci:</span>
                          <div className="grid grid-cols-1 gap-1">
                            {q.pairs.map((p: any, pIdx: number) => (
                              <div key={pIdx} className="flex items-center gap-2 bg-muted/40 p-1.5 rounded">
                                <span className="font-medium text-foreground">{p.left}</span>
                                <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.right}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {qType === "BENAR_SALAH" && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px]">
                          <span className="text-muted-foreground">Kunci Jawaban:</span>
                          <Badge className={q.keyAnswer === "BENAR" ? "bg-emerald-600 text-white font-bold" : "bg-rose-600 text-white font-bold"}>
                            {q.keyAnswer === "BENAR" ? "✓ BENAR" : "✗ SALAH"}
                          </Badge>
                        </div>
                      )}

                      {qType === "ISIAN_SINGKAT" && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px]">
                          <span className="text-muted-foreground">Kunci Jawaban Singkat:</span>
                          <span className="font-bold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                            {q.keyAnswer}
                          </span>
                        </div>
                      )}

                      {qType === "ESAI" && (
                        <div className="space-y-1 pt-1 border-t border-border/50 text-[11px]">
                          <span className="text-muted-foreground font-semibold text-[10px]">Rubrik Acuan Penilaian:</span>
                          <p className="text-muted-foreground italic bg-muted/30 p-2 rounded leading-relaxed">
                            {q.rubrik || "(Belum ada rubrik tertulis - penilaian kualitatif oleh guru)"}
                          </p>
                        </div>
                      )}

                      {qType === "NUMERIK" && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px]">
                          <span className="text-muted-foreground">Kunci Nilai:</span>
                          <span className="font-bold tabular-nums text-indigo-700 dark:text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded">
                            {q.keyAnswer} {q.tolerance ? `(± ${q.tolerance})` : "(Tepat)"}
                          </span>
                        </div>
                      )}

                      {qType === "MELENGKAPI" && (
                        <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-[11px]">
                          <span className="text-muted-foreground">Kunci Kata Pengisi:</span>
                          <span className="font-bold text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded">
                            {q.clozeAnswer || q.keyAnswer}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ruang Diskusi Interaktif (Real-time Live Comments) */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/20 dark:bg-blue-950/10 space-y-3">
            <h4 className="font-bold text-xs text-blue-800 dark:text-blue-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-blue-600" /> Ruang Diskusi & Tanya Jawab Interaktif</span>
              <span className="text-[11px] font-medium tabular-nums text-muted-foreground">{discussions.length} Tanggapan</span>
            </h4>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {discussions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-3">Belum ada diskusi / pertanyaan dari siswa. Kirim tanggapan pertama di bawah!</p>
              ) : (
                discussions.map((d, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-card border border-border text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        {d.user_name}
                        <Badge variant="outline" className="text-[9px] font-semibold px-1.5 py-0">
                          {d.user_role}
                        </Badge>
                      </span>
                      <span className="text-[10px] text-muted-foreground">{d.created_at || "Terkirim"}</span>
                    </div>
                    <p className="text-muted-foreground">{d.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendDiscussion} className="flex gap-2">
              <Input
                placeholder="Tulis tanggapan diskusi atau instruksi kelompok..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="text-xs font-normal"
              />
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1 shrink-0">
                <Send className="h-3.5 w-3.5" /> Kirim
              </Button>
            </form>
          </div>

          {/* Rekapitulasi Penilaian Antarteman (Peer Assessment) */}
          {(activity.peer_assessment_enabled || activity.type === "TUGAS_KELOMPOK" || peerAssessments.length > 0) && (
            <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-amber-900 dark:text-amber-200">
                      Rekapitulasi Penilaian Antarteman (Peer Assessment)
                    </h4>
                    <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
                      Hasil evaluasi rekan satu kelompok/kelas berbasis 4 pilar karakter Kurikulum Merdeka.
                    </p>
                  </div>
                </div>
                <Badge className="bg-amber-600 text-white font-semibold text-[10px] tabular-nums">
                  {peerAssessments.length} Total Penilaian Masuk
                </Badge>
              </div>

              {peerAssessments.length === 0 ? (
                <div className="p-4 rounded-lg bg-background/80 border border-amber-200 dark:border-amber-900/60 text-center text-xs text-muted-foreground italic">
                  Belum ada peserta didik yang mengirimkan penilaian antarteman untuk aktivitas ini.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
                  {Object.entries(peerAssessmentByStudent).map(([key, data]) => {
                    const studentName = data.evaluations[0]?.evaluatee_name || key;
                    const studentNisn = data.evaluations[0]?.evaluatee_nisn || "-";
                    return (
                      <div key={key} className="p-3 rounded-lg border border-border bg-card text-xs space-y-2 shadow-2xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-border/60 pb-2">
                          <div>
                            <span className="font-bold text-foreground text-xs">{studentName}</span>
                            <span className="text-[10px] text-muted-foreground font-medium tabular-nums ml-2">NISN: {studentNisn}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] font-bold text-amber-600 dark:text-amber-400 border-amber-300 gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                              {data.avgScore} / 4.0 ({data.evaluations.length} Teman Menilai)
                            </Badge>
                            <Badge className="bg-emerald-600 text-white text-[10px] font-bold tabular-nums">
                              Konversi: {Math.round((data.avgScore / 4) * 100)} / 100
                            </Badge>
                          </div>
                        </div>

                        {/* Nilai 4 Aspek */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                          <div className="p-1.5 rounded-md bg-muted/40 text-center">
                            <span className="text-muted-foreground text-[10px] block">Keaktifan</span>
                            <span className="font-bold text-emerald-600">{data.avgKeaktifan} ★</span>
                          </div>
                          <div className="p-1.5 rounded-md bg-muted/40 text-center">
                            <span className="text-muted-foreground text-[10px] block">Kerjasama</span>
                            <span className="font-bold text-blue-600">{data.avgKerjasama} ★</span>
                          </div>
                          <div className="p-1.5 rounded-md bg-muted/40 text-center">
                            <span className="text-muted-foreground text-[10px] block">Tanggung Jawab</span>
                            <span className="font-bold text-amber-600">{data.avgTanggungJawab} ★</span>
                          </div>
                          <div className="p-1.5 rounded-md bg-muted/40 text-center">
                            <span className="text-muted-foreground text-[10px] block">Sikap & Tasamuh</span>
                            <span className="font-bold text-teal-600">{data.avgSikap} ★</span>
                          </div>
                        </div>

                        {/* Catatan Masukan Teman */}
                        <div className="pt-1 space-y-1">
                          <span className="text-[10px] font-semibold text-muted-foreground block">Catatan & Masukan Teman:</span>
                          <div className="space-y-1">
                            {data.evaluations.filter((ev) => ev.feedback && ev.feedback.trim() !== "").map((ev, fIdx) => (
                              <div key={fIdx} className="p-1.5 rounded bg-muted/30 text-[11px] text-muted-foreground italic flex items-start gap-1.5">
                                <span className="font-semibold not-italic text-foreground text-[10px]">Dari {ev.evaluator_name}:</span>
                                <span>"{ev.feedback}"</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Student Grading Table */}
          <div className="space-y-2">
            <h4 className="font-semibold text-xs text-foreground flex items-center justify-between">
              <span>Lembar Pemeriksaan & Input Nilai Siswa ({activeRombel}):</span>
              <span className="text-[11px] text-emerald-600 font-semibold tabular-nums">
                {grades.filter((g) => g.score !== "").length}/{grades.length} Terpasang Nilai
              </span>
            </h4>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/60 text-left font-semibold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">NISN & Nama Siswa</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 w-28 text-center">Nilai (0-100)</th>
                    <th className="py-2.5 px-3">Catatan Umpan Balik / Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground text-xs">
                        Belum ada data siswa terdaftar untuk <strong>{activeRombel}</strong> dalam database.
                      </td>
                    </tr>
                  ) : (
                    grades.map((g) => (
                      <tr key={g.id} className="hover:bg-muted/30 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-foreground">{g.name}</div>
                          <div className="text-[10px] text-muted-foreground font-medium tabular-nums">{g.nisn}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <select
                            disabled={!isAllowed}
                            className={`h-7 rounded-md border text-[11px] font-normal px-2 ${
                              g.status === "TERKUMPUL"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : g.status === "DIPERIKSA"
                                ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300"
                                : "bg-muted text-muted-foreground border-border"
                            } ${!isAllowed ? "opacity-60 cursor-not-allowed" : ""}`}
                            value={g.status}
                            onChange={(e) => handleStatusChange(g.id, e.target.value)}
                          >
                            <option value="BELUM MENGUMPULKAN">BELUM MENGUMPULKAN</option>
                            <option value="TERKUMPUL">TERKUMPUL</option>
                            <option value="DIPERIKSA">DIPERIKSA</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            type="number"
                            placeholder="0-100"
                            disabled={!isAllowed}
                            value={g.score}
                            onChange={(e) => handleScoreChange(g.id, e.target.value)}
                            className={`h-7 text-xs font-semibold tabular-nums text-center border-emerald-300 dark:border-emerald-800 ${
                              !isAllowed ? "opacity-60 cursor-not-allowed bg-muted" : ""
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            placeholder={isAllowed ? "Tuliskan apresiasi / catatan umpan balik..." : "Pengisian umpan balik terkunci (Hanya Pengampu)"}
                            disabled={!isAllowed}
                            value={g.feedback}
                            onChange={(e) => handleFeedbackChange(g.id, e.target.value)}
                            className={`h-7 text-xs font-normal bg-background/80 border-border ${
                              !isAllowed ? "opacity-60 cursor-not-allowed bg-muted" : ""
                            }`}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button variant="outline" size="sm" className="text-xs font-semibold" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          {isAllowed ? (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
              onClick={handleSaveGrades}
            >
              <Save className="h-4 w-4" /> Simpan Nilai & Sync Ke Penilaian Kelas
            </Button>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold text-xs gap-1.5 py-1.5 px-3">
              <Lock className="h-3.5 w-3.5" /> Akses Edit Terkunci (Bukan Mapel Pengampu)
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
