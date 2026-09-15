import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  CheckCircle2,
  Upload,
  Link2,
  FileCheck,
  X,
  ListOrdered,
  Brain,
  Trash2,
  Download,
  FileSpreadsheet,
  Library,
  ArrowLeft,
  Bookmark,
  Users,
  Pencil,
  ArrowRight,
  GitCompare,
  ToggleLeft,
  CaseSensitive,
  AlignLeft,
  Hash,
  TextCursorInput,
  Sparkles,
  Image as ImageIcon,
  Music,
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { PickElibraryDialog, ElibraryBookItem } from "./PickElibraryDialog";
import {
  FormativeQuizQuestion,
  QuizQuestionType,
  QUIZ_QUESTION_TYPE_CONFIG,
  createNewQuizQuestion,
} from "@/types/quiz";

export type ActivityTypeOption =
  | "LKPD"
  | "TUGAS_KELOMPOK"
  | "QUIZ"
  | "TUGAS_MANDIRI"
  | "PRAKTIKUM"
  | "PROYEK_P5"
  | "HAFALAN"
  | "REFLEKSI";

export interface LkpdQuestionItem {
  id: number;
  question: string;
  points: number;
}

export interface CreateActivityFormProps {
  activeRombel: string;
  activeMapel: string;
  onCancel: () => void;
  onActivityCreated: (newAct: {
    id: string;
    title: string;
    type: ActivityTypeOption;
    dueDate: string;
    status: string;
    submittedCount: number;
    totalStudents: number;
    attachment_url?: string;
    questions_data?: string;
  }) => void;
  initialData?: any | null;
  onActivityUpdated?: (updatedAct: any) => void;
}

export interface CreateActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeRombel: string;
  activeMapel: string;
  onActivityCreated: (newAct: {
    id: string;
    title: string;
    type: ActivityTypeOption;
    dueDate: string;
    status: string;
    submittedCount: number;
    totalStudents: number;
    attachment_url?: string;
    questions_data?: string;
  }) => void;
}

const categoryConfig: Record<
  ActivityTypeOption,
  {
    titleLabel: string;
    titlePlaceholder: string;
    instructionPlaceholder: string;
    showFileUpload: boolean;
    showStructuredQuestions: boolean;
    structuredQuestionsLabel: string;
    submissionMethods: { value: string; label: string }[];
  }
> = {
  LKPD: {
    titleLabel: "Judul LKPD:",
    titlePlaceholder: "Masukkan judul LKPD...",
    instructionPlaceholder: "Tuliskan petunjuk atau instruksi pengerjaan LKPD...",
    showFileUpload: true,
    showStructuredQuestions: true,
    structuredQuestionsLabel: "Lembar Butir Pertanyaan LKPD",
    submissionMethods: [
      { value: "TEXT_AND_FILE", label: "Kombinasi (Teks Digital & Unggah Berkas)" },
      { value: "TEXT_ONLY", label: "Jawaban Teks Digital Langsung" },
      { value: "FILE_ONLY", label: "Unggah Berkas PDF / Foto Lembar Kerja" },
    ],
  },
  TUGAS_KELOMPOK: {
    titleLabel: "Topik Diskusi / Kelompok:",
    titlePlaceholder: "Masukkan topik diskusi kelompok...",
    instructionPlaceholder: "Tuliskan petunjuk diskusi kelompok dan pembagian tugas...",
    showFileUpload: true,
    showStructuredQuestions: false,
    structuredQuestionsLabel: "Butir Tugas Kelompok",
    submissionMethods: [
      { value: "TEXT_AND_FILE", label: "Kombinasi (Teks Digital & Unggah Berkas)" },
      { value: "TEXT_ONLY", label: "Jawaban Teks Digital Langsung" },
      { value: "FILE_ONLY", label: "Unggah Berkas / Dokumen Kelompok" },
    ],
  },
  TUGAS_MANDIRI: {
    titleLabel: "Judul Tugas Mandiri:",
    titlePlaceholder: "Masukkan judul tugas mandiri...",
    instructionPlaceholder: "Tuliskan petunjuk atau instruksi tugas mandiri...",
    showFileUpload: true,
    showStructuredQuestions: false,
    structuredQuestionsLabel: "Butir Tugas Mandiri",
    submissionMethods: [
      { value: "TEXT_AND_FILE", label: "Kombinasi (Teks Digital & Unggah Berkas)" },
      { value: "TEXT_ONLY", label: "Jawaban Teks Digital Langsung" },
      { value: "FILE_ONLY", label: "Unggah Berkas Hasil Pengerjaan" },
    ],
  },
  QUIZ: {
    titleLabel: "Nama Kuis Formatif:",
    titlePlaceholder: "Masukkan nama kuis formatif...",
    instructionPlaceholder: "Tuliskan petunjuk atau aturan pengerjaan kuis...",
    showFileUpload: false,
    showStructuredQuestions: false,
    structuredQuestionsLabel: "Butir Soal Kuis",
    submissionMethods: [
      { value: "QUIZ_ONLINE", label: "Pengerjaan Kuis Interaktif di Aplikasi" },
    ],
  },
  PRAKTIKUM: {
    titleLabel: "Judul Praktikum & Lab:",
    titlePlaceholder: "Masukkan judul praktikum atau percobaan...",
    instructionPlaceholder: "Tuliskan tujuan praktikum, alat/bahan, dan langkah kerja...",
    showFileUpload: true,
    showStructuredQuestions: true,
    structuredQuestionsLabel: "Lembar Langkah & Pengamatan Praktikum",
    submissionMethods: [
      { value: "TEXT_AND_FILE", label: "Kombinasi (Teks Digital & Unggah Laporan)" },
      { value: "FILE_ONLY", label: "Unggah Berkas Laporan Praktikum (PDF / Foto)" },
      { value: "TEXT_ONLY", label: "Isian Teks Data Pengamatan Langsung" },
    ],
  },
  HAFALAN: {
    titleLabel: "Materi / Target Hafalan:",
    titlePlaceholder: "Masukkan materi atau target hafalan...",
    instructionPlaceholder: "Tuliskan kriteria kelancaran, tajwid, dan ketentuan setoran hafalan...",
    showFileUpload: false,
    showStructuredQuestions: true,
    structuredQuestionsLabel: "Daftar Rincian Target Butir Hafalan",
    submissionMethods: [
      { value: "TATAP_MUKA", label: "Setoran Langsung di Kelas (Tatap Muka)" },
      { value: "AUDIO_RECORDING", label: "Rekaman Audio / Suara" },
      { value: "VIDEO_RECORDING", label: "Rekaman Video" },
      { value: "KOMBINASI", label: "Bebas (Langsung / Rekaman)" },
    ],
  },
  PROYEK_P5: {
    titleLabel: "Judul Aktivitas:",
    titlePlaceholder: "Masukkan judul aktivitas...",
    instructionPlaceholder: "Tuliskan instruksi aktivitas...",
    showFileUpload: true,
    showStructuredQuestions: false,
    structuredQuestionsLabel: "Lembar Butir Aktivitas",
    submissionMethods: [
      { value: "TEXT_AND_FILE", label: "Kombinasi (Teks Digital & Unggah Berkas)" },
    ],
  },
  REFLEKSI: {
    titleLabel: "Nama Survei / Refleksi Pembelajaran:",
    titlePlaceholder: "Contoh: Survei Refleksi Pemahaman Siswa Bab 2",
    instructionPlaceholder: "Tuliskan pengantar angket atau survei refleksi siswa...",
    showFileUpload: false,
    showStructuredQuestions: false,
    structuredQuestionsLabel: "Daftar Pertanyaan Refleksi",
    submissionMethods: [
      { value: "QUIZ_ONLINE", label: "Pengisian Refleksi Interaktif di Aplikasi (Tanpa Skor)" },
    ],
  },
};

export function CreateActivityForm({
  activeRombel,
  activeMapel,
  onCancel,
  onActivityCreated,
  initialData,
  onActivityUpdated,
}: CreateActivityFormProps) {
  const isEditing = Boolean(initialData?.id);
  const [title, setTitle] = useState(initialData?.title || "");
  const [type, setType] = useState<ActivityTypeOption>(initialData?.type || "LKPD");
  const currentConfig = categoryConfig[type] || categoryConfig.LKPD;
  const [instructions, setInstructions] = useState(initialData?.instructions || "");
  const [dueDateDate, setDueDateDate] = useState("");
  const [dueDateTime, setDueDateTime] = useState("23:59");
  const [maxScore, setMaxScore] = useState(String(initialData?.max_score || initialData?.maxScore || "100"));
  const [submissionType, setSubmissionType] = useState(initialData?.submission_type || "TEXT_AND_FILE");
  const [peerAssessmentEnabled, setPeerAssessmentEnabled] = useState(Boolean(initialData?.peer_assessment_enabled));

  // Helper untuk memformat tanggal & jam batas pengumpulan yang rapi dan konsisten
  const formatDueDateTime = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return "";
    try {
      const [year, month, day] = dateStr.split("-");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const monthName = months[parseInt(month, 10) - 1] || month;
      const timePart = timeStr ? `${timeStr} WIB` : "23:59 WIB";
      return `${parseInt(day, 10)} ${monthName} ${year}, ${timePart}`;
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  };

  // Attachment State (Physical File Upload or URL or E-Library)
  const [uploadMode, setUploadMode] = useState<"FILE" | "URL" | "ELIBRARY">("FILE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isPickElibOpen, setIsPickElibOpen] = useState(false);
  const [selectedElibraryBook, setSelectedElibraryBook] = useState<ElibraryBookItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Structured Questions Builder for LKPD, Praktikum, Tugas Mandiri
  const [lkpdQuestions, setLkpdQuestions] = useState<LkpdQuestionItem[]>(() => {
    if (initialData?.questions_data) {
      try {
        const parsed = JSON.parse(initialData.questions_data);
        if (Array.isArray(parsed)) return parsed;
      } catch { }
    }
    return [];
  });

  // Quiz Builder State (Khusus tipe QUIZ - Campuran / Multi-Type)
  const [quizQuestions, setQuizQuestions] = useState<FormativeQuizQuestion[]>(() => {
    if (initialData?.quiz_data) {
      try {
        const parsed = JSON.parse(initialData.quiz_data);
        if (Array.isArray(parsed)) {
          return parsed.map((item, idx) => ({
            ...item,
            id: item.id || idx + 1,
            type: (item.type as QuizQuestionType) || "PG",
            points: Number(item.points) || 10,
          }));
        }
      } catch { }
    }
    return [];
  });

  const [selectedQuestionTypeToAdd, setSelectedQuestionTypeToAdd] = useState<QuizQuestionType>("PG");

  const activityOptions: { id: ActivityTypeOption; label: string; color: string; disabled?: boolean }[] = [
    {
      id: "LKPD",
      label: "📄 LKPD Digital (Lembar Kerja Peserta Didik)",
      color: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
      disabled: false,
    },
    {
      id: "QUIZ",
      label: "⚡ Kuis Formatif Interaktif (9 Variasi Soal)",
      color: "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      disabled: false,
    },
    {
      id: "REFLEKSI",
      label: "💬 Umpan Balik & Refleksi Pembelajaran (Non-Graded)",
      color: "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
      disabled: false,
    },
    {
      id: "TUGAS_MANDIRI",
      label: "✍️ Tugas Mandiri Siswa",
      color: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
      disabled: false,
    },
    {
      id: "TUGAS_KELOMPOK",
      label: "👥 Diskusi & Tugas Kelompok",
      color: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
      disabled: false,
    },
    {
      id: "PRAKTIKUM",
      label: "🔬 Praktikum & Observasi Lapangan",
      color: "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300",
      disabled: false,
    },
    {
      id: "HAFALAN",
      label: "📖 Setoran Hafalan / Tahfidz",
      color: "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
      disabled: false,
    },
    {
      id: "PROYEK_P5",
      label: "🌱 Proyek P5-PPRA Madrasah",
      color: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
      disabled: false,
    },
  ];

  const handleSelectType = (opt: typeof activityOptions[0]) => {
    if (opt.disabled) return;
    setType(opt.id);
    const config = categoryConfig[opt.id] || categoryConfig.LKPD;
    if (opt.id === "TUGAS_KELOMPOK") {
      setPeerAssessmentEnabled(true);
    } else {
      setPeerAssessmentEnabled(false);
    }
    if (config.submissionMethods[0]) {
      setSubmissionType(config.submissionMethods[0].value);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFileBase64(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setFileBase64("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSelectElibraryForActivity = (book: ElibraryBookItem) => {
    setSelectedElibraryBook(book);
    const targetUrl = book.url || book.video_url || book.audio_url || "";
    setAttachmentUrl(targetUrl);
    setIsPickElibOpen(false);
    toast.success(`Buku "${book.title}" terpilih sebagai referensi aktivitas!`);
  };

  const handleClearElibraryBook = () => {
    setSelectedElibraryBook(null);
    setAttachmentUrl("");
  };

  // LKPD Questions Handlers
  const handleAddLkpdQuestion = () => {
    setLkpdQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        question: "",
        points: 25,
      },
    ]);
  };

  const handleRemoveLkpdQuestion = (index: number) => {
    setLkpdQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLkpdQuestionChange = (index: number, field: keyof LkpdQuestionItem, value: any) => {
    setLkpdQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q))
    );
  };

  // Quiz Questions Handlers (Multi-Type / Campuran)
  const handleAddQuizQuestion = (type: QuizQuestionType = "PG") => {
    setQuizQuestions((prev) => [
      ...prev,
      createNewQuizQuestion(type, prev.length + 1),
    ]);
  };

  const handleQuizQuestionTypeChange = (index: number, newType: QuizQuestionType) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== index) return q;
        const base = createNewQuizQuestion(newType, q.id);
        return {
          ...base,
          question: q.question,
          points: q.points || base.points,
        };
      })
    );
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setQuizQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuizQuestionChange = (index: number, field: keyof FormativeQuizQuestion, value: any) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q))
    );
  };

  const handleAddMatchingPair = (qIndex: number) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentPairs = q.pairs ? [...q.pairs] : [];
        currentPairs.push({ id: `p_${Date.now()}_${currentPairs.length + 1}`, left: "", right: "" });
        return { ...q, pairs: currentPairs };
      })
    );
  };

  const handleRemoveMatchingPair = (qIndex: number, pairIndex: number) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentPairs = (q.pairs || []).filter((_, pIdx) => pIdx !== pairIndex);
        return { ...q, pairs: currentPairs };
      })
    );
  };

  const handleMatchingPairChange = (qIndex: number, pairIndex: number, side: "left" | "right", value: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentPairs = q.pairs ? [...q.pairs] : [];
        if (currentPairs[pairIndex]) {
          currentPairs[pairIndex] = { ...currentPairs[pairIndex], [side]: value };
        }
        return { ...q, pairs: currentPairs };
      })
    );
  };

  const handleUploadMediaForQuestion = (qIndex: number, mediaType: "image" | "audio") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept =
      mediaType === "image"
        ? "image/png,image/jpeg,image/jpg,image/webp"
        : "audio/mp3,audio/wav,audio/m4a,audio/ogg";
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      toast.info(`Mengunggah berkas ${mediaType === "image" ? "gambar" : "suara"}...`);
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const dataUrl = evt.target?.result as string;
        if (!dataUrl) return;
        try {
          if (mediaType === "image") {
            const res = await MysqlDataService.uploadQuizImage(file.name, dataUrl);
            if (res.success && res.imageUrl) {
              handleQuizQuestionChange(qIndex, "image_url", res.imageUrl);
              toast.success("Gambar soal berhasil disisipkan!");
            } else {
              toast.error("Gagal mengunggah gambar soal.");
            }
          } else {
            const res = await MysqlDataService.uploadQuizAudio(file.name, dataUrl);
            if (res.success && res.audioUrl) {
              handleQuizQuestionChange(qIndex, "audio_url", res.audioUrl);
              toast.success("Audio soal berhasil disisipkan!");
            } else {
              toast.error("Gagal mengunggah audio soal.");
            }
          }
        } catch (err) {
          toast.error("Gagal memproses berkas media.");
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleTogglePgKompleksKey = (qIndex: number, optionKey: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentKeys = q.keyAnswers ? [...q.keyAnswers] : [q.keyAnswer || "A"];
        const exists = currentKeys.includes(optionKey);
        const updatedKeys = exists ? currentKeys.filter((k) => k !== optionKey) : [...currentKeys, optionKey];
        if (updatedKeys.length === 0) return q;
        return {
          ...q,
          keyAnswers: updatedKeys,
        };
      })
    );
  };

  const handlePgKompleksScoreChange = (qIndex: number, optionKey: "A" | "B" | "C" | "D", scoreVal: number) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const currentScores = q.optionScores ? { ...q.optionScores } : { A: 0, B: 0, C: 0, D: 0 };
        currentScores[optionKey] = scoreVal;
        const sumPoints =
          (currentScores.A || 0) + (currentScores.B || 0) + (currentScores.C || 0) + (currentScores.D || 0);
        return {
          ...q,
          optionScores: currentScores,
          points: sumPoints > 0 ? sumPoints : q.points,
        };
      })
    );
  };

  const handleTargetSentenceChange = (qIndex: number, text: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const words = text.trim().split(/\s+/).filter(Boolean);
        return {
          ...q,
          targetSentence: text,
          scrambledWords: words,
        };
      })
    );
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { parseQuizExcelFile } = await import("@/utils/quizExcelHelper");
      const parsed = await parseQuizExcelFile(file);
      if (parsed.length === 0) {
        return toast.error("Tidak ada soal yang valid ditemukan pada berkas Excel.");
      }
      const formatted: FormativeQuizQuestion[] = parsed.map((p, idx) => ({
        id: p.id || idx + 1,
        type: "PG",
        question: p.question,
        optionA: p.optionA,
        optionB: p.optionB,
        optionC: p.optionC,
        optionD: p.optionD,
        keyAnswer: p.keyAnswer,
        points: 10,
      }));
      setQuizQuestions(formatted);
      toast.success(`✅ Berhasil mengimpor ${formatted.length} butir soal dari "${file.name}"!`);
    } catch (err: any) {
      console.error("Gagal import file kuis Excel:", err);
      toast.error(`Gagal membaca berkas Excel: ${err?.message || "Format tidak sesuai"}`);
    } finally {
      if (excelInputRef.current) {
        excelInputRef.current.value = "";
      }
    }
  };

  const handleSaveActivity = async (isDraft: boolean = false) => {
    if (!title.trim()) {
      return toast.error("Mohon isi judul aktivitas terlebih dahulu!");
    }
    if (!isDraft && !instructions.trim()) {
      return toast.error("Mohon lengkapi petunjuk / instruksi aktivitas sebelum menerbitkan!");
    }

    if (!isDraft && (type === "QUIZ" || type === "REFLEKSI")) {
      if (quizQuestions.length === 0) {
        return toast.error("Kuis Formatif / Refleksi membutuhkan minimal 1 butir pertanyaan sebelum diterbitkan!");
      }
      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i];
        if (!q.question.trim()) {
          return toast.error(`Mohon lengkapi teks pertanyaan pada butir soal #${i + 1}!`);
        }
        if (q.type === "MENJODOHKAN" && (!q.pairs || q.pairs.some((p) => !p.left.trim() || !p.right.trim()))) {
          return toast.error(`Mohon lengkapi semua pasangan premis & respon pada butir soal #${i + 1}!`);
        }
        if (q.type === "MERANGKAI_KALIMAT" && (!q.targetSentence || !q.targetSentence.trim())) {
          return toast.error(`Mohon tuliskan kalimat target pada butir soal #${i + 1}!`);
        }
      }
    }

    // Tentukan finalAttachmentUrl: Jika mode upload file lokal, kirim fileBase64
    let finalAttachment = "";
    if (uploadMode === "FILE" && fileBase64) {
      finalAttachment = fileBase64;
    } else if ((uploadMode === "URL" || uploadMode === "ELIBRARY") && attachmentUrl.trim()) {
      finalAttachment = attachmentUrl.trim();
    }

    // Format questions_data jika tipe mendukung butir pertanyaan terstruktur
    const isQuestionType = categoryConfig[type]?.showStructuredQuestions ?? false;
    const questionsDataStr = isQuestionType && lkpdQuestions.length > 0 ? JSON.stringify(lkpdQuestions) : "";

    const activeUser = MysqlAuthService.getActiveUser();
    const resolvedTeacherName = activeUser?.full_name || "Guru Pengampu";

    const resolvedDueDate = dueDateDate
      ? formatDueDateTime(dueDateDate, dueDateTime)
      : initialData?.dueDate || initialData?.due_date || "Sesuai Jadwal KBM";

    const targetStatus = isDraft ? "DRAF" : "AKTIF";

    const payload = {
      rombel: initialData?.rombel || activeRombel,
      mapel: initialData?.mapel || activeMapel,
      teacher_name: resolvedTeacherName,
      title: title.trim(),
      type: type,
      instructions: instructions.trim() || "(Belum ada petunjuk tugas)",
      due_date: resolvedDueDate,
      max_score: type === "REFLEKSI" ? "0" : (maxScore || "100"),
      status: targetStatus,
      attachment_url: finalAttachment,
      submission_type: submissionType,
      quiz_data: (type === "QUIZ" || type === "REFLEKSI") ? JSON.stringify(quizQuestions) : "",
      questions_data: questionsDataStr,
      peer_assessment_enabled: type === "TUGAS_KELOMPOK" && peerAssessmentEnabled ? 1 : 0,
    };

    if (isEditing && initialData?.id) {
      await MysqlDataService.updateLkpdActivity({ id: initialData.id, ...payload });
      const updated = {
        ...initialData,
        ...payload,
        id: String(initialData.id),
        dueDate: resolvedDueDate,
      };
      onActivityUpdated?.(updated);
      if (isDraft) {
        toast.success(`💾 Draf aktivitas "${title}" berhasil diperbarui!`);
      } else {
        toast.success(`✅ Aktivitas "${title}" berhasil diperbarui dan diterbitkan!`);
      }
    } else {
      const res = await MysqlDataService.saveLkpdActivity(payload);
      const created = {
        id: res.id || "act_" + Date.now(),
        title: title.trim(),
        type: type,
        dueDate: resolvedDueDate,
        status: targetStatus,
        submittedCount: 0,
        totalStudents: 0,
        attachment_url: finalAttachment.startsWith("data:") ? "/uploads/lkpd/..." : finalAttachment,
        questions_data: questionsDataStr,
      };
      onActivityCreated(created);
      if (isDraft) {
        toast.success(`💾 Aktivitas "${title}" berhasil disimpan sebagai draf!`);
      } else {
        toast.success(`✅ Aktivitas "${title}" berhasil diterbitkan ke siswa!`);
      }
    }

    setTitle("");
    setInstructions("");
    setDueDateDate("");
    setDueDateTime("23:59");
    setMaxScore("100");
    setPeerAssessmentEnabled(false);
    setSelectedFile(null);
    setFileBase64("");
    setAttachmentUrl("");
    setSelectedElibraryBook(null);
    onCancel();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSaveActivity(false);
  };

  const isQuestionType = categoryConfig[type]?.showStructuredQuestions ?? false;

  return (
    <>
      <Card className="border-border shadow-xs bg-card">
        <CardHeader className="border-b border-border pb-4 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="gap-2 text-xs font-semibold hover:bg-muted -ml-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Tugas & LKPD
            </Button>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white font-semibold text-[11px] gap-1 px-2.5 py-0.5">
                <FileText className="h-3 w-3" />
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {activeMapel} · {activeRombel}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
              {isEditing ? <Pencil className="h-5 w-5 text-emerald-600" /> : <Plus className="h-5 w-5 text-emerald-600" />}
              {isEditing ? "Edit Aktivitas / LKPD" : "Buat Tugas & LKPD Baru"}
            </CardTitle>

            <div className="flex items-center gap-2 shrink-0">
              <Button type="button" variant="outline" size="sm" className="text-xs font-medium" onClick={onCancel}>
                Batal
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs font-medium gap-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => handleSaveActivity(true)}
              >
                <Bookmark className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" /> Simpan Draf
              </Button>
              <Button
                type="submit"
                form="create-activity-form"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" /> Terbitkan Aktivitas
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form id="create-activity-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Pilihan Kategori Aktivitas (Dropdown Ringkas Hemat Tempat) */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-muted/40 border border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground block">
                  Kategori Aktivitas Pembelajaran:
                </label>
                <Badge variant="outline" className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 border-emerald-500/40 bg-background">
                  {activityOptions.find((o) => o.id === type)?.label || type}
                </Badge>
              </div>
              <select
                value={type}
                onChange={(e) => {
                  const selectedOpt = activityOptions.find((o) => o.id === e.target.value);
                  if (selectedOpt) handleSelectType(selectedOpt);
                }}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs hover:border-emerald-500/50 transition"
              >
                {activityOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sakelar Penilaian Antarteman (Peer Assessment) - Khusus Diskusi & Tugas Kelompok */}
            {type === "TUGAS_KELOMPOK" && (
              <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2.5 animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <label htmlFor="toggle-peer-assessment" className="text-xs font-semibold text-foreground cursor-pointer block">
                        Aktifkan Penilaian Antarteman (Peer Assessment)
                      </label>
                      <span className="text-[11px] text-muted-foreground block">
                        Peserta didik saling menilai keaktifan, kerjasama, tanggung jawab, dan sikap sesama anggota kelompok.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    id="toggle-peer-assessment"
                    checked={peerAssessmentEnabled}
                    onChange={(e) => setPeerAssessmentEnabled(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                  />
                </div>

                {peerAssessmentEnabled && (
                  <div className="pt-2 border-t border-border/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-background border border-border/60">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 block">1. Keaktifan</span>
                      <span className="text-muted-foreground text-[10px]">Inisiatif ide & keaktifan diskusi</span>
                    </div>
                    <div className="p-2 rounded-lg bg-background border border-border/60">
                      <span className="font-semibold text-blue-700 dark:text-blue-400 block">2. Kerjasama</span>
                      <span className="text-muted-foreground text-[10px]">Kekompakan & kontribusi tugas</span>
                    </div>
                    <div className="p-2 rounded-lg bg-background border border-border/60">
                      <span className="font-semibold text-amber-700 dark:text-amber-400 block">3. Tanggung Jawab</span>
                      <span className="text-muted-foreground text-[10px]">Menyelesaikan bagian tepat waktu</span>
                    </div>
                    <div className="p-2 rounded-lg bg-background border border-border/60">
                      <span className="font-semibold text-teal-700 dark:text-teal-400 block">4. Sikap & Tasamuh</span>
                      <span className="text-muted-foreground text-[10px]">Menghargai pendapat teman</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Judul Aktivitas */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">{currentConfig.titleLabel}</label>
              <Input
                placeholder={currentConfig.titlePlaceholder}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-xs font-normal"
              />
            </div>

            {/* Pengaturan Batas Waktu, Nilai Maksimal, dan Metode Pengumpulan */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">Batas Pengumpulan:</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    type="date"
                    value={dueDateDate}
                    onChange={(e) => setDueDateDate(e.target.value)}
                    className="text-xs font-normal"
                    title="Pilih Tanggal Batas Pengumpulan"
                  />
                  <Input
                    type="time"
                    value={dueDateTime}
                    onChange={(e) => setDueDateTime(e.target.value)}
                    className="text-xs font-normal"
                    title="Pilih Jam Batas Pengumpulan"
                  />
                </div>
                {dueDateDate ? (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                    🗓️ {formatDueDateTime(dueDateDate, dueDateTime)}
                  </p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">Nilai Maksimal:</label>
                <select
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-700 dark:text-emerald-400"
                >
                  <option value="100">100 (Skala 100 / Poin Penuh)</option>
                  <option value="80">80 (Skala 80)</option>
                  <option value="60">60 (Skala 60)</option>
                  <option value="50">50 (Skala 50)</option>
                  <option value="A">Predikat A (Sangat Baik)</option>
                  <option value="B">Predikat B (Baik)</option>
                  <option value="C">Predikat C (Cukup)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground block">Metode Pengumpulan Siswa:</label>
                <select
                  value={submissionType}
                  onChange={(e) => setSubmissionType(e.target.value)}
                  disabled={type === "QUIZ"}
                  className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-75 disabled:bg-muted"
                >
                  {currentConfig.submissionMethods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lampiran Berkas LKPD Fisik vs E-Library vs URL Eksternal */}
            {currentConfig.showFileUpload && (
              <div className="space-y-2.5 p-3 rounded-xl border border-border/80 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-emerald-600" /> Lembar Kerja / Bahan Pendukung (Opsional):
                  </label>

                  {/* Tab Selector Mode Upload */}
                  <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setUploadMode("FILE")}
                      className={`px-2.5 py-1 text-xs rounded-md transition flex items-center gap-1.5 ${uploadMode === "FILE"
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground font-medium"
                        }`}
                    >
                      <Upload className="h-3.5 w-3.5" /> Unggah Berkas
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("ELIBRARY")}
                      className={`px-2.5 py-1 text-xs rounded-md transition flex items-center gap-1.5 ${uploadMode === "ELIBRARY"
                        ? "bg-background text-purple-700 dark:text-purple-300 shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground font-medium"
                        }`}
                    >
                      <Library className="h-3.5 w-3.5 text-purple-600" /> Dari E-Library
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode("URL")}
                      className={`px-2.5 py-1 text-xs rounded-md transition flex items-center gap-1.5 ${uploadMode === "URL"
                        ? "bg-background text-foreground shadow-2xs font-semibold"
                        : "text-muted-foreground hover:text-foreground font-medium"
                        }`}
                    >
                      <Link2 className="h-3.5 w-3.5" /> Tautan Web
                    </button>
                  </div>
                </div>

                {uploadMode === "FILE" && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden"
                      id="lkpd-file-input"
                    />

                    {!selectedFile ? (
                      <label
                        htmlFor="lkpd-file-input"
                        className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-border hover:border-emerald-500 rounded-lg cursor-pointer bg-card/60 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition text-center"
                      >
                        <Upload className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-foreground">Pilih berkas pendukung dari perangkat (PDF, Word, Gambar)</span>
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-foreground truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFile}
                          className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10 shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {uploadMode === "ELIBRARY" && (
                  <div className="space-y-2">
                    {!selectedElibraryBook ? (
                      <div
                        onClick={() => setIsPickElibOpen(true)}
                        className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-purple-500/40 hover:border-purple-500 rounded-lg cursor-pointer bg-purple-500/5 hover:bg-purple-500/10 transition text-center"
                      >
                        <Library className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium text-foreground">Pilih referensi buku/modul dari E-Library madrasah</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded-lg border border-purple-500/40 bg-purple-50 dark:bg-purple-950/30">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Library className="h-4 w-4 text-purple-600 shrink-0" />
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-semibold text-foreground truncate">{selectedElibraryBook.title}</p>
                              <Badge variant="outline" className="text-[9px] uppercase font-semibold text-purple-600 border-purple-300">
                                {selectedElibraryBook.type || "PDF"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsPickElibOpen(true)}
                            className="h-6 px-2 text-[11px] font-medium text-purple-700 dark:text-purple-300"
                          >
                            Ganti
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClearElibraryBook}
                            className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/10 shrink-0"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {uploadMode === "URL" && (
                  <div className="space-y-1">
                    <Input
                      placeholder="Masukkan tautan Google Drive atau materi online..."
                      value={attachmentUrl}
                      onChange={(e) => setAttachmentUrl(e.target.value)}
                      className="text-xs font-normal"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Petunjuk & Deskripsi Aktivitas */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground block">Petunjuk & Deskripsi:</label>
              <Textarea
                placeholder={currentConfig.instructionPlaceholder}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="text-xs font-normal min-h-[75px]"
              />
            </div>

            {/* Builder Lembar Soal / Butir Pertanyaan Terstruktur */}
            {isQuestionType && (
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <ListOrdered className="h-4 w-4 text-emerald-600" />
                      {currentConfig.structuredQuestionsLabel} ({lkpdQuestions.length} Butir)
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddLkpdQuestion}
                    className="text-xs font-medium gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 h-7"
                  >
                    <Plus className="h-3.5 w-3.5" /> Tambah Butir
                  </Button>
                </div>

                {lkpdQuestions.length === 0 ? (
                  <div className="text-center py-3.5 border border-dashed border-emerald-500/20 rounded-lg text-muted-foreground text-xs font-medium">
                    Belum ada butir pertanyaan spesifik. Klik "+ Tambah Butir" jika ingin menambahkan butir soal.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {lkpdQuestions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-card space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-300">Butir #{idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-medium text-muted-foreground">Bobot Poin:</label>
                            <Input
                              type="number"
                              value={q.points}
                              onChange={(e) => handleLkpdQuestionChange(idx, "points", Number(e.target.value) || 0)}
                              className="h-7 w-16 text-center text-xs font-mono font-medium text-emerald-600"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveLkpdQuestion(idx)}
                              className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                              title="Hapus Butir"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <Textarea
                          placeholder={`Tuliskan instruksi atau pertanyaan butir #${idx + 1}...`}
                          value={q.question}
                          onChange={(e) => handleLkpdQuestionChange(idx, "question", e.target.value)}
                          className="text-xs font-normal min-h-[50px]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Builder Soal Kuis Formatif & Refleksi Siswa (Multi-Type) */}
            {(type === "QUIZ" || type === "REFLEKSI") && (() => {
              const totalQuizPoints = quizQuestions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
              return (
                <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3.5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          {type === "REFLEKSI" ? (
                            <>
                              <MessageSquare className="h-4 w-4 text-rose-600" /> Instrumen Refleksi & Umpan Balik
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 text-purple-600" /> Pembuat Soal Kuis Formatif
                            </>
                          )}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-bold border-purple-400 text-purple-700 dark:text-purple-300">
                          {quizQuestions.length} Butir Pertanyaan
                        </Badge>
                        {type === "REFLEKSI" ? (
                          <Badge className="bg-rose-600 text-white font-sans text-[10px]">
                            Non-Graded (Refleksi)
                          </Badge>
                        ) : (
                          <Badge className="bg-purple-600 text-white font-mono text-[10px]">
                            Total {totalQuizPoints} Poin
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                        {type === "REFLEKSI"
                          ? "Instrumen umpan balik, refleksi materi KBM, dan angket pemahaman siswa (tanpa penilaian skor)."
                          : "Mendukung 9 variasi jenis soal (Pilihan Ganda, PG Kompleks, Merangkai Kalimat, Menjodohkan, Benar/Salah, Isian, Esai, Numerik, Melengkapi)."}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <input
                        type="file"
                        ref={excelInputRef}
                        onChange={handleImportExcel}
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        id="excel-quiz-input"
                      />

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            const { downloadQuizTemplateExcel } = await import("@/utils/quizExcelHelper");
                            downloadQuizTemplateExcel();
                          } catch (err) {
                            toast.error("Gagal mengunduh template Excel");
                          }
                        }}
                        className="text-xs font-medium gap-1 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 h-7"
                        title="Unduh format template Excel"
                      >
                        <Download className="h-3.5 w-3.5" /> Template
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => excelInputRef.current?.click()}
                        className="text-xs font-medium gap-1 border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 h-7"
                        title="Import soal langsung dari file Excel atau CSV"
                      >
                        <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Import Excel
                      </Button>
                    </div>
                  </div>

                  {/* Dropdown Tambah Butir Soal Baru (Ringkas & Tidak Sesak) */}
                  <div className="p-3 rounded-lg bg-card border border-purple-200 dark:border-purple-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5 text-purple-600" /> Tambah Butir Soal Baru:
                      </span>
                      <p className="text-[11px] text-muted-foreground">Pilih jenis soal atau instrumen refleksi:</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={selectedQuestionTypeToAdd}
                        onChange={(e) => setSelectedQuestionTypeToAdd(e.target.value as QuizQuestionType)}
                        className="h-8 rounded-lg border border-purple-300 dark:border-purple-800 bg-background px-2.5 text-xs font-semibold text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500"
                      >
                        <option value="PG">🔘 Pilihan Ganda (A-D)</option>
                        <option value="PG_KOMPLEKS">☑️ Pilihan Ganda Kompleks (Multi Jawaban)</option>
                        <option value="MERANGKAI_KALIMAT">🔤 Merangkai Kalimat (Bahasa)</option>
                        <option value="MENJODOHKAN">🔗 Menjodohkan</option>
                        <option value="BENAR_SALAH">⚖️ Benar / Salah</option>
                        <option value="ISIAN_SINGKAT">✍️ Teks Singkat</option>
                        <option value="ESAI">📝 Esai / Paragraf</option>
                        <option value="NUMERIK">🔢 Numerik</option>
                        <option value="MELENGKAPI">🔲 Melengkapi Kalimat</option>
                      </select>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddQuizQuestion(selectedQuestionTypeToAdd)}
                        className="h-8 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold gap-1 px-3 shadow-2xs cursor-pointer shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" /> + Tambah Soal
                      </Button>
                    </div>
                  </div>

                  {quizQuestions.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-purple-500/25 rounded-lg text-muted-foreground text-xs font-medium space-y-1">
                      <p>Belum ada butir soal yang ditambahkan.</p>
                      <p className="text-[11px] text-muted-foreground">
                        Pilih jenis soal dari dropdown di atas lalu klik "+ Tambah Soal" atau gunakan tombol Import Excel.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {quizQuestions.map((q, idx) => {
                        const qType = q.type || "PG";
                        const typeCfg = QUIZ_QUESTION_TYPE_CONFIG[qType] || QUIZ_QUESTION_TYPE_CONFIG.PG;

                        return (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-card space-y-3 text-xs shadow-2xs"
                          >
                            {/* Baris Atas: Soal #, Type Selector, Points, Delete */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-purple-700 dark:text-purple-300">
                                  Soal #{idx + 1}
                                </span>
                                <Badge variant="outline" className={`text-[10px] font-semibold ${typeCfg.badgeColor}`}>
                                  {typeCfg.shortLabel}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                  <span>Jenis:</span>
                                  <select
                                    value={qType}
                                    onChange={(e) => handleQuizQuestionTypeChange(idx, e.target.value as QuizQuestionType)}
                                    className="h-7 px-2 rounded border border-purple-300 dark:border-purple-800 text-[11px] font-medium text-foreground bg-background cursor-pointer"
                                  >
                                    <option value="PG">Pilihan Ganda (A-D)</option>
                                    <option value="PG_KOMPLEKS">PG Kompleks (Multi Jawaban)</option>
                                    <option value="MERANGKAI_KALIMAT">Merangkai Kalimat (Bahasa)</option>
                                    <option value="MENJODOHKAN">Menjodohkan</option>
                                    <option value="BENAR_SALAH">Benar / Salah</option>
                                    <option value="ISIAN_SINGKAT">Teks Singkat</option>
                                    <option value="ESAI">Esai / Paragraf</option>
                                    <option value="NUMERIK">Numerik</option>
                                    <option value="MELENGKAPI">Melengkapi Kalimat</option>
                                  </select>
                                </div>

                                {type !== "REFLEKSI" && (
                                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                                    <span>Bobot:</span>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={q.points ?? 10}
                                      onChange={(e) => handleQuizQuestionChange(idx, "points", parseInt(e.target.value, 10) || 0)}
                                      className="h-7 w-16 text-center text-xs font-mono font-medium text-purple-700 dark:text-purple-300"
                                    />
                                    <span className="font-mono text-[10px]">Poin</span>
                                  </div>
                                )}

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveQuizQuestion(idx)}
                                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 cursor-pointer"
                                  title="Hapus Butir Soal"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Pertanyaan / Teks Soal */}
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-semibold text-muted-foreground">
                                {qType === "BENAR_SALAH"
                                  ? "Pernyataan / Teks Evaluasi:"
                                  : qType === "MELENGKAPI"
                                  ? "Teks Kalimat Rumpang (gunakan tanda [...] untuk bagian rumpang):"
                                  : qType === "MERANGKAI_KALIMAT"
                                  ? "Petunjuk / Instruksi Merangkai Kalimat:"
                                  : "Pertanyaan / Instruksi Soal:"}
                              </label>
                              <Textarea
                                placeholder={
                                  qType === "MELENGKAPI"
                                    ? "Contoh: Ibu kota Republik Indonesia berada di wilayah [...]."
                                    : qType === "BENAR_SALAH"
                                    ? "Tuliskan pernyataan yang perlu dinilai kebenarannya..."
                                    : qType === "MERANGKAI_KALIMAT"
                                    ? "Contoh: Susunlah potongan kata acak berikut agar membentuk kalimat yang padu dan benar!"
                                    : `Tuliskan pertanyaan soal #${idx + 1}...`
                                }
                                value={q.question}
                                onChange={(e) => handleQuizQuestionChange(idx, "question", e.target.value)}
                                className="text-xs font-normal min-h-[50px]"
                              />

                              {/* Toolbar Sisipkan Gambar & Audio MP3 */}
                              <div className="flex items-center gap-2 pt-1 flex-wrap">
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUploadMediaForQuestion(idx, "image")}
                                  className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground border-border hover:border-blue-400"
                                >
                                  <ImageIcon className="h-3 w-3 text-blue-500" />
                                  {q.image_url ? "Ganti Gambar Soal" : "+ Sisipkan Gambar (PNG/JPEG)"}
                                </Button>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUploadMediaForQuestion(idx, "audio")}
                                  className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground border-border hover:border-amber-400"
                                >
                                  <Music className="h-3 w-3 text-amber-500" />
                                  {q.audio_url ? "Ganti Voice / Audio" : "+ Sisipkan Voice / Listening (MP3)"}
                                </Button>
                              </div>

                              {/* Pratinjau Media Gambar & Audio Terpasang */}
                              {(q.image_url || q.audio_url) && (
                                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-1.5">
                                  {q.image_url && (
                                    <div className="relative group shrink-0">
                                      <img
                                        src={q.image_url}
                                        alt="Lampiran Soal"
                                        className="h-16 w-24 object-contain rounded-md border border-border bg-background"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleQuizQuestionChange(idx, "image_url", "")}
                                        className="h-4 w-4 p-0 absolute -top-1.5 -right-1.5 rounded-full shadow-xs text-[10px]"
                                        title="Hapus Gambar"
                                      >
                                        <X className="h-2.5 w-2.5" />
                                      </Button>
                                    </div>
                                  )}

                                  {q.audio_url && (
                                    <div className="flex-1 flex items-center gap-2 w-full max-w-sm">
                                      <audio controls src={q.audio_url} className="h-8 w-full" />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleQuizQuestionChange(idx, "audio_url", "")}
                                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 shrink-0"
                                        title="Hapus Audio"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Form Khusus Sesuai Jenis Soal */}

                            {/* 1.0 PILIHAN GANDA KOMPLEKS (Multi Jawaban) */}
                            {qType === "PG_KOMPLEKS" && (() => {
                              const currentKeys = q.keyAnswers || ["A"];
                              const scores = q.optionScores || { A: 5, B: 5, C: 0, D: 0 };
                              const options: { key: "A" | "B" | "C" | "D"; prop: "optionA" | "optionB" | "optionC" | "optionD" }[] = [
                                { key: "A", prop: "optionA" },
                                { key: "B", prop: "optionB" },
                                { key: "C", prop: "optionC" },
                                { key: "D", prop: "optionD" },
                              ];

                              return (
                                <div className="space-y-2.5 pt-1 border-t border-border/50">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-semibold text-muted-foreground">
                                      Opsi Jawaban (Centang opsi yang benar & tentukan skornya):
                                    </label>
                                    <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                                      {currentKeys.length} Kunci Benar Terpilih
                                    </span>
                                  </div>

                                  <div className="space-y-2">
                                    {options.map((opt) => {
                                      const isCorrect = currentKeys.includes(opt.key);
                                      const score = scores[opt.key] ?? 0;

                                      return (
                                        <div
                                          key={opt.key}
                                          className={`p-2 rounded-lg border transition flex items-center gap-2 text-xs ${
                                            isCorrect
                                              ? "border-sky-500/60 bg-sky-500/10 dark:bg-sky-950/20"
                                              : "border-border bg-background"
                                          }`}
                                        >
                                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                            <input
                                              type="checkbox"
                                              checked={isCorrect}
                                              onChange={() => handleTogglePgKompleksKey(idx, opt.key)}
                                              className="rounded border-border text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                                            />
                                            <span className={`font-bold w-4 text-center ${isCorrect ? "text-sky-700 dark:text-sky-300 font-extrabold" : "text-muted-foreground"}`}>
                                              {opt.key}.
                                            </span>
                                          </label>

                                          <Input
                                            placeholder={`Teks Opsi ${opt.key}...`}
                                            value={q[opt.prop] || ""}
                                            onChange={(e) => handleQuizQuestionChange(idx, opt.prop, e.target.value)}
                                            className="text-xs flex-1 h-8"
                                          />

                                          {type !== "REFLEKSI" && (
                                            <div className="flex items-center gap-1 shrink-0">
                                              <span className="text-[10px] text-muted-foreground font-medium">Skor:</span>
                                              <Input
                                                type="number"
                                                min={0}
                                                value={score}
                                                onChange={(e) => handlePgKompleksScoreChange(idx, opt.key, parseInt(e.target.value, 10) || 0)}
                                                className="h-8 w-14 text-center text-xs font-mono font-bold text-sky-700 dark:text-sky-300"
                                              />
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground italic">
                                    * Siswa dapat memilih lebih dari satu jawaban (checkbox). Skor kuis otomatis mengakumulasi bobot opsi benar yang dipilih.
                                  </p>
                                </div>
                              );
                            })()}

                            {/* 1.1 MERANGKAI KALIMAT (BAHASA) */}
                            {qType === "MERANGKAI_KALIMAT" && (() => {
                              const words = q.scrambledWords && q.scrambledWords.length > 0
                                ? q.scrambledWords
                                : (q.targetSentence || "").trim().split(/\s+/).filter(Boolean);

                              return (
                                <div className="space-y-2.5 pt-1 border-t border-border/50">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground">
                                      Kalimat Target yang Benar (Sesuai Urutan Tepat):
                                    </label>
                                    <Input
                                      placeholder="Contoh: Siswa madrasah belajar giat setiap hari / Al-ilmu nurun yahtadi bihil insan"
                                      value={q.targetSentence || ""}
                                      onChange={(e) => handleTargetSentenceChange(idx, e.target.value)}
                                      className="text-xs font-medium border-orange-300 dark:border-orange-800"
                                    />
                                  </div>

                                  {words.length > 0 && (
                                    <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-300 dark:border-orange-900/50 space-y-1.5">
                                      <span className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 block">
                                        Pratinjau Potongan Kata ({words.length} Kata yang Akan Diacak untuk Siswa):
                                      </span>
                                      <div className="flex flex-wrap gap-1.5">
                                        {words.map((w, wIdx) => (
                                          <Badge key={wIdx} variant="secondary" className="bg-background text-foreground border border-orange-400 font-normal text-xs px-2 py-0.5">
                                            {w}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  <p className="text-[10px] text-muted-foreground italic">
                                    * Pada lembar pengerjaan siswa, kata-kata di atas otomatis diacak. Siswa mengklik kata untuk merangkai kalimat kembali.
                                  </p>
                                </div>
                              );
                            })()}

                            {/* 1.2 PILIHAN GANDA TUNGGAL */}
                            {qType === "PG" && (
                              <div className="space-y-2 pt-1 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold text-muted-foreground">Opsi Pilihan Jawaban:</label>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Kunci Benar:</span>
                                    <select
                                      value={q.keyAnswer || "A"}
                                      onChange={(e) => handleQuizQuestionChange(idx, "keyAnswer", e.target.value)}
                                      className="h-6 px-2 rounded border border-emerald-400 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-background cursor-pointer"
                                    >
                                      <option value="A">Opsi A</option>
                                      <option value="B">Opsi B</option>
                                      <option value="C">Opsi C</option>
                                      <option value="D">Opsi D</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-5 text-center font-bold ${q.keyAnswer === "A" ? "text-emerald-600" : "text-muted-foreground"}`}>A.</span>
                                    <Input
                                      placeholder="Pilihan A"
                                      value={q.optionA || ""}
                                      onChange={(e) => handleQuizQuestionChange(idx, "optionA", e.target.value)}
                                      className={`text-xs ${q.keyAnswer === "A" ? "border-emerald-500 bg-emerald-50/20" : ""}`}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-5 text-center font-bold ${q.keyAnswer === "B" ? "text-emerald-600" : "text-muted-foreground"}`}>B.</span>
                                    <Input
                                      placeholder="Pilihan B"
                                      value={q.optionB || ""}
                                      onChange={(e) => handleQuizQuestionChange(idx, "optionB", e.target.value)}
                                      className={`text-xs ${q.keyAnswer === "B" ? "border-emerald-500 bg-emerald-50/20" : ""}`}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-5 text-center font-bold ${q.keyAnswer === "C" ? "text-emerald-600" : "text-muted-foreground"}`}>C.</span>
                                    <Input
                                      placeholder="Pilihan C"
                                      value={q.optionC || ""}
                                      onChange={(e) => handleQuizQuestionChange(idx, "optionC", e.target.value)}
                                      className={`text-xs ${q.keyAnswer === "C" ? "border-emerald-500 bg-emerald-50/20" : ""}`}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className={`w-5 text-center font-bold ${q.keyAnswer === "D" ? "text-emerald-600" : "text-muted-foreground"}`}>D.</span>
                                    <Input
                                      placeholder="Pilihan D"
                                      value={q.optionD || ""}
                                      onChange={(e) => handleQuizQuestionChange(idx, "optionD", e.target.value)}
                                      className={`text-xs ${q.keyAnswer === "D" ? "border-emerald-500 bg-emerald-50/20" : ""}`}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 2. MENJODOHKAN */}
                            {qType === "MENJODOHKAN" && (
                              <div className="space-y-2 pt-1 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                  <label className="text-[11px] font-semibold text-muted-foreground">
                                    Daftar Pasangan (Premis Kiri ↔ Pasangan Tepat Kanan):
                                  </label>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddMatchingPair(idx)}
                                    className="text-[11px] font-medium gap-1 h-6 px-2 border-emerald-400 text-emerald-700 dark:text-emerald-300 cursor-pointer"
                                  >
                                    <Plus className="h-3 w-3" /> Tambah Pasangan
                                  </Button>
                                </div>

                                <div className="space-y-2">
                                  {(q.pairs || []).map((pair, pIdx) => (
                                    <div key={pIdx} className="flex items-center gap-2">
                                      <span className="text-[11px] font-bold text-muted-foreground w-4 text-center">
                                        {pIdx + 1}.
                                      </span>
                                      <Input
                                        placeholder="Premis / Istilah Kiri..."
                                        value={pair.left}
                                        onChange={(e) => handleMatchingPairChange(idx, pIdx, "left", e.target.value)}
                                        className="text-xs flex-1"
                                      />
                                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <Input
                                        placeholder="Pasangan Jawaban Tepat Kanan..."
                                        value={pair.right}
                                        onChange={(e) => handleMatchingPairChange(idx, pIdx, "right", e.target.value)}
                                        className="text-xs flex-1 border-emerald-300 dark:border-emerald-800"
                                      />
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleRemoveMatchingPair(idx, pIdx)}
                                        disabled={(q.pairs || []).length <= 2}
                                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 shrink-0 cursor-pointer"
                                        title="Hapus Pasangan"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                  * Pada tampilan siswa, pilihan respon kanan otomatis diacak untuk dijodohkan.
                                </p>
                              </div>
                            )}

                            {/* 3. BENAR / SALAH */}
                            {qType === "BENAR_SALAH" && (
                              <div className="space-y-1.5 pt-1 border-t border-border/50">
                                <label className="text-[11px] font-semibold text-muted-foreground">Kunci Jawaban Pernyataan:</label>
                                <div className="flex items-center gap-3">
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleQuizQuestionChange(idx, "keyAnswer", "BENAR")}
                                    variant={q.keyAnswer === "BENAR" ? "default" : "outline"}
                                    className={`text-xs font-bold gap-1.5 h-8 px-4 cursor-pointer ${
                                      q.keyAnswer === "BENAR"
                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                        : "border-border text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    ✓ BENAR
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => handleQuizQuestionChange(idx, "keyAnswer", "SALAH")}
                                    variant={q.keyAnswer === "SALAH" ? "default" : "outline"}
                                    className={`text-xs font-bold gap-1.5 h-8 px-4 cursor-pointer ${
                                      q.keyAnswer === "SALAH"
                                        ? "bg-rose-600 hover:bg-rose-700 text-white"
                                        : "border-border text-foreground hover:bg-muted"
                                    }`}
                                  >
                                    ✗ SALAH
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* 4. TEKS SINGKAT */}
                            {qType === "ISIAN_SINGKAT" && (
                              <div className="space-y-1.5 pt-1 border-t border-border/50">
                                <label className="text-[11px] font-semibold text-muted-foreground">Kunci Jawaban Singkat:</label>
                                <Input
                                  placeholder="Masukkan kata / frasa jawaban singkat pasti..."
                                  value={q.keyAnswer || ""}
                                  onChange={(e) => handleQuizQuestionChange(idx, "keyAnswer", e.target.value)}
                                  className="text-xs font-medium border-purple-300 dark:border-purple-800"
                                />
                                <p className="text-[10px] text-muted-foreground italic">
                                  * Koreksi otomatis membandingkan teks jawaban siswa secara case-insensitive (mengabaikan huruf besar/kecil & spasi lebih).
                                </p>
                              </div>
                            )}

                            {/* 5. ESAI / PARAGRAF */}
                            {qType === "ESAI" && (
                              <div className="space-y-1.5 pt-1 border-t border-border/50">
                                <label className="text-[11px] font-semibold text-muted-foreground">
                                  Rubrik Penilaian / Kunci Acuan Guru (Opsional):
                                </label>
                                <Textarea
                                  placeholder="Tuliskan kata kunci / panduan penilaian esai untuk acuan guru..."
                                  value={q.rubrik || ""}
                                  onChange={(e) => handleQuizQuestionChange(idx, "rubrik", e.target.value)}
                                  className="text-xs font-normal min-h-[50px]"
                                />
                                <p className="text-[10px] text-muted-foreground italic">
                                  * Jawaban esai siswa tersimpan dan dinilai secara manual oleh guru melalui lembar penilaian.
                                </p>
                              </div>
                            )}

                            {/* 6. NUMERIK */}
                            {qType === "NUMERIK" && (
                              <div className="space-y-2 pt-1 border-t border-border/50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground">Nilai Kunci Jawaban (Angka):</label>
                                    <Input
                                      type="text"
                                      placeholder="Contoh: 100 atau 3.14"
                                      value={q.keyAnswer || ""}
                                      onChange={(e) => handleQuizQuestionChange(idx, "keyAnswer", e.target.value)}
                                      className="text-xs font-mono font-medium border-indigo-300 dark:border-indigo-800"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-muted-foreground">Toleransi Nilai (± Margin):</label>
                                    <Input
                                      type="number"
                                      step="any"
                                      min={0}
                                      placeholder="0 (isi 0 jika harus persis)"
                                      value={q.tolerance ?? 0}
                                      onChange={(e) => handleQuizQuestionChange(idx, "tolerance", parseFloat(e.target.value) || 0)}
                                      className="text-xs font-mono"
                                    />
                                  </div>
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                  * Jawaban siswa dinilai benar jika nilai berada pada rentang [Kunci - Toleransi, Kunci + Toleransi].
                                </p>
                              </div>
                            )}

                            {/* 7. MELENGKAPI KALIMAT */}
                            {qType === "MELENGKAPI" && (
                              <div className="space-y-1.5 pt-1 border-t border-border/50">
                                <label className="text-[11px] font-semibold text-muted-foreground">
                                  Kunci Kata / Frasa Pengisi Bagian Kosong:
                                </label>
                                <Input
                                  placeholder="Masukkan kata/frasa pengisi bagian rumpang [...]..."
                                  value={q.clozeAnswer || q.keyAnswer || ""}
                                  onChange={(e) => {
                                    handleQuizQuestionChange(idx, "clozeAnswer", e.target.value);
                                    handleQuizQuestionChange(idx, "keyAnswer", e.target.value);
                                  }}
                                  className="text-xs font-medium border-teal-300 dark:border-teal-800"
                                />
                                <p className="text-[10px] text-muted-foreground italic">
                                  * Siswa akan diminta mengetikkan kata/frasa pengisi pada bagian rumpang kalimat.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button type="button" variant="outline" size="sm" className="text-xs font-medium px-4" onClick={onCancel}>
                Batal
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="text-xs font-medium gap-1.5 px-4 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                onClick={() => handleSaveActivity(true)}
              >
                <Bookmark className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                {isEditing ? "Perbarui Draf" : "Simpan Draf"}
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 px-5 shadow-xs cursor-pointer">
                <CheckCircle2 className="h-4 w-4" />
                {isEditing ? "Perbarui & Terbitkan Sekarang" : "Terbitkan Aktivitas Ke Siswa"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <PickElibraryDialog
        isOpen={isPickElibOpen}
        onOpenChange={setIsPickElibOpen}
        activeRombel={activeRombel}
        activeMapel={activeMapel}
        onSelectBook={handleSelectElibraryForActivity}
      />
    </>
  );
}

export function CreateActivityDialog({
  isOpen,
  onOpenChange,
  activeRombel,
  activeMapel,
  onActivityCreated,
}: CreateActivityDialogProps) {
  if (!isOpen) return null;
  return (
    <CreateActivityForm
      activeRombel={activeRombel}
      activeMapel={activeMapel}
      onCancel={() => onOpenChange(false)}
      onActivityCreated={(act) => {
        onActivityCreated(act);
        onOpenChange(false);
      }}
    />
  );
}
