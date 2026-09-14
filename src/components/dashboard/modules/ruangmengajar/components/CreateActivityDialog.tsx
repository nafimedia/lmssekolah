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
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { PickElibraryDialog, ElibraryBookItem } from "./PickElibraryDialog";

export type ActivityTypeOption =
  | "LKPD"
  | "TUGAS_KELOMPOK"
  | "QUIZ"
  | "TUGAS_MANDIRI"
  | "PRAKTIKUM"
  | "PROYEK_P5"
  | "HAFALAN";

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

  // Quiz Builder State (Khusus tipe QUIZ)
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{ id: number; question: string; optionA: string; optionB: string; optionC: string; optionD: string; keyAnswer: string }>
  >(() => {
    if (initialData?.quiz_data) {
      try {
        const parsed = JSON.parse(initialData.quiz_data);
        if (Array.isArray(parsed)) return parsed;
      } catch { }
    }
    return [];
  });

  const activityOptions: { id: ActivityTypeOption; label: string; color: string; disabled?: boolean }[] = [
    {
      id: "LKPD",
      label: "📄 LKPD Digital",
      color: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
      disabled: false,
    },
    {
      id: "TUGAS_KELOMPOK",
      label: "👥 Diskusi & Kelompok",
      color: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
      disabled: false,
    },
    {
      id: "TUGAS_MANDIRI",
      label: "✍️ Tugas Mandiri",
      color: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
      disabled: false,
    },
    {
      id: "QUIZ",
      label: "⚡ Kuis Formatif",
      color: "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
      disabled: false,
    },
    {
      id: "PRAKTIKUM",
      label: "🔬 Praktikum & Lab",
      color: "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300",
      disabled: false,
    },
    {
      id: "HAFALAN",
      label: "📖 Setoran Hafalan",
      color: "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
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

  // Quiz Questions Handlers
  const handleAddQuizQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        keyAnswer: "A",
      },
    ]);
  };

  const handleRemoveQuizQuestion = (index: number) => {
    setQuizQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleQuizQuestionChange = (index: number, field: string, value: string) => {
    setQuizQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, [field]: value } : q))
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
      setQuizQuestions(parsed);
      toast.success(`✅ Berhasil mengimpor ${parsed.length} butir soal dari "${file.name}"!`);
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

    if (!isDraft && type === "QUIZ" && quizQuestions.length === 0) {
      return toast.error("Kuis Formatif membutuhkan minimal 1 soal sebelum diterbitkan!");
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
      max_score: maxScore || "100",
      status: targetStatus,
      attachment_url: finalAttachment,
      submission_type: submissionType,
      quiz_data: type === "QUIZ" ? JSON.stringify(quizQuestions) : "",
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
            {/* Pilihan Kategori Aktivitas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground block">Kategori Aktivitas:</label>
                <span className="text-[11px] text-muted-foreground"></span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectType(opt)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all flex items-center gap-1.5 cursor-pointer ${type === opt.id
                      ? "bg-emerald-600 text-white border-emerald-600 font-semibold shadow-2xs"
                      : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
                      }`}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
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

            {/* Builder Soal Kuis Formatif (Tampil Khusus Jenis QUIZ) */}
            {type === "QUIZ" && (
              <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Brain className="h-4 w-4 text-purple-600" /> Pembuat Soal Kuis Formatif ({quizQuestions.length} Soal Pilihan Ganda)
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                      Susun manual atau import sekaligus dari spreadsheet Excel (.xlsx / .csv).
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
                      title="Unduh format spreadsheet Excel resmi MTsN 2 Cilacap"
                    >
                      <Download className="h-3.5 w-3.5" /> Unduh Template
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

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddQuizQuestion}
                      className="text-xs font-medium gap-1 border-purple-500/40 text-purple-600 hover:bg-purple-500/10 h-7"
                    >
                      <Plus className="h-3.5 w-3.5" /> Tambah Soal
                    </Button>
                  </div>
                </div>

                {quizQuestions.length === 0 ? (
                  <div className="text-center py-5 border border-dashed border-purple-500/25 rounded-lg text-muted-foreground text-xs font-medium">
                    Belum ada butir soal kuis. Klik <strong>+ Tambah Soal</strong> atau <strong>Import Excel</strong> di atas untuk menyusun soal pilihan ganda.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quizQuestions.map((q, idx) => (
                      <div key={idx} className="p-3 rounded-lg border border-purple-200 dark:border-purple-900 bg-card space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-purple-700 dark:text-purple-300">Soal #{idx + 1}</span>
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-medium text-muted-foreground">Kunci Jawaban:</label>
                            <select
                              value={q.keyAnswer}
                              onChange={(e) => handleQuizQuestionChange(idx, "keyAnswer", e.target.value)}
                              className="h-7 px-2 rounded border border-purple-300 text-xs font-medium text-purple-700 bg-background"
                            >
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                              <option value="D">D</option>
                            </select>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoveQuizQuestion(idx)}
                              className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                              title="Hapus Butir Soal"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        <Input
                          placeholder={`Tulis pertanyaan soal #${idx + 1}...`}
                          value={q.question}
                          onChange={(e) => handleQuizQuestionChange(idx, "question", e.target.value)}
                          className="text-xs font-normal"
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Opsi A"
                            value={q.optionA}
                            onChange={(e) => handleQuizQuestionChange(idx, "optionA", e.target.value)}
                            className="text-xs font-normal"
                          />
                          <Input
                            placeholder="Opsi B"
                            value={q.optionB}
                            onChange={(e) => handleQuizQuestionChange(idx, "optionB", e.target.value)}
                            className="text-xs font-normal"
                          />
                          <Input
                            placeholder="Opsi C"
                            value={q.optionC}
                            onChange={(e) => handleQuizQuestionChange(idx, "optionC", e.target.value)}
                            className="text-xs font-normal"
                          />
                          <Input
                            placeholder="Opsi D"
                            value={q.optionD}
                            onChange={(e) => handleQuizQuestionChange(idx, "optionD", e.target.value)}
                            className="text-xs font-normal"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

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
