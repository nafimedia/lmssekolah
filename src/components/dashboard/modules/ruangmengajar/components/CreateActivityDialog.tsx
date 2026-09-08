import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Plus,
  Sparkles,
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
} from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { downloadQuizTemplateExcel, parseQuizExcelFile } from "@/utils/quizExcelHelper";
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

export function CreateActivityForm({
  activeRombel,
  activeMapel,
  onCancel,
  onActivityCreated,
}: CreateActivityFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityTypeOption>("LKPD");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [maxScore, setMaxScore] = useState("100");
  const [submissionType, setSubmissionType] = useState("TEXT_AND_FILE");

  // Attachment State (Physical File Upload or URL or E-Library)
  const [uploadMode, setUploadMode] = useState<"FILE" | "URL" | "ELIBRARY">("FILE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isPickElibOpen, setIsPickElibOpen] = useState(false);
  const [selectedElibraryBook, setSelectedElibraryBook] = useState<ElibraryBookItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Structured Questions Builder for LKPD, Praktikum, Tugas Mandiri (100% Bersih / Murni Kosong)
  const [lkpdQuestions, setLkpdQuestions] = useState<LkpdQuestionItem[]>([]);

  // Quiz Builder State (Khusus tipe QUIZ - 100% Bersih / Murni Kosong)
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{ id: number; question: string; optionA: string; optionB: string; optionC: string; optionD: string; keyAnswer: string }>
  >([]);

  const activityOptions: { id: ActivityTypeOption; label: string; color: string }[] = [
    {
      id: "LKPD",
      label: "📄 LKPD Digital",
      color: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    },
    {
      id: "TUGAS_KELOMPOK",
      label: "👥 Diskusi & Kelompok",
      color: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    },
    {
      id: "QUIZ",
      label: "⚡ Kuis Formatif",
      color: "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
    },
    {
      id: "TUGAS_MANDIRI",
      label: "✍️ Tugas Mandiri",
      color: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    },
    {
      id: "PRAKTIKUM",
      label: "🔬 Praktikum & Lab",
      color: "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300",
    },
    {
      id: "PROYEK_P5",
      label: "🎯 Proyek P5 / PPRA",
      color: "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
    },
    {
      id: "HAFALAN",
      label: "📖 Setoran Hafalan",
      color: "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
    },
  ];

  const handleSelectType = (opt: typeof activityOptions[0]) => {
    setType(opt.id);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      return toast.error("Mohon lengkapi judul dan instruksi terlebih dahulu!");
    }

    if (type === "QUIZ" && quizQuestions.length === 0) {
      return toast.error("Kuis Formatif membutuhkan minimal 1 soal!");
    }

    // Tentukan finalAttachmentUrl: Jika mode upload file lokal, kirim fileBase64
    let finalAttachment = "";
    if (uploadMode === "FILE" && fileBase64) {
      finalAttachment = fileBase64;
    } else if ((uploadMode === "URL" || uploadMode === "ELIBRARY") && attachmentUrl.trim()) {
      finalAttachment = attachmentUrl.trim();
    }

    // Format questions_data jika tipe LKPD / Praktikum / Tugas Mandiri
    const isQuestionType = type === "LKPD" || type === "PRAKTIKUM" || type === "TUGAS_MANDIRI";
    const questionsDataStr = isQuestionType && lkpdQuestions.length > 0 ? JSON.stringify(lkpdQuestions) : "";

    const activeUser = MysqlAuthService.getActiveUser();
    const resolvedTeacherName = activeUser?.full_name || "Guru Pengampu";

    const payload = {
      rombel: activeRombel,
      mapel: activeMapel,
      teacher_name: resolvedTeacherName,
      title: title.trim(),
      type: type,
      instructions: instructions.trim(),
      due_date: dueDate,
      max_score: Number(maxScore) || 100,
      status: "AKTIF",
      attachment_url: finalAttachment,
      submission_type: submissionType,
      quiz_data: type === "QUIZ" ? JSON.stringify(quizQuestions) : "",
      questions_data: questionsDataStr,
    };

    const res = await MysqlDataService.saveLkpdActivity(payload);

    const created = {
      id: res.id || "act_" + Date.now(),
      title: title.trim(),
      type: type,
      dueDate: dueDate,
      status: "AKTIF",
      submittedCount: 0,
      totalStudents: 0,
      attachment_url: finalAttachment.startsWith("data:") ? "/uploads/lkpd/..." : finalAttachment,
      questions_data: questionsDataStr,
    };

    onActivityCreated(created);
    toast.success(`✅ Aktivitas "${title}" berhasil diterbitkan!`);
    setTitle("");
    setInstructions("");
    setSelectedFile(null);
    setFileBase64("");
    setAttachmentUrl("");
    setSelectedElibraryBook(null);
    onCancel();
  };

  const isQuestionType = type === "LKPD" || type === "PRAKTIKUM" || type === "TUGAS_MANDIRI";

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
                <Sparkles className="h-3 w-3" /> FORM AKTIVITAS KURIKULUM MERDEKA
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {activeMapel} · {activeRombel}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2 text-foreground">
                <Plus className="h-5 w-5 text-emerald-600" /> Buat Aktivitas Pembelajaran, Kuis, & LKPD Digital
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Pilih jenis aktivitas di bawah ini. Anda dapat mengunggah berkas PDF LKPD fisik, membuat butir soal esai, atau kuis pilihan ganda yang langsung aktif di layar siswa.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button type="button" variant="outline" size="sm" className="text-xs font-semibold" onClick={onCancel}>
                Batal
              </Button>
              <Button
                type="submit"
                form="create-activity-form"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5"
              >
                <CheckCircle2 className="h-4 w-4" /> Terbitkan Aktivitas
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form id="create-activity-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Pilihan Jenis Aktivitas */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground block">Pilih Jenis Aktivitas Pembelajaran:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activityOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectType(opt)}
                  className={`p-2.5 rounded-lg border text-left text-xs font-bold transition flex items-center justify-between gap-1.5 ${
                    type === opt.id ? `${opt.color} ring-2 ring-primary shadow-xs` : "border-border bg-background hover:bg-muted/50"
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {type === opt.id && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Judul Aktivitas */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground block">Judul Aktivitas / Kuis / LKPD:</label>
            <Input
              placeholder="Misal: LKPD 2 — Analisis Perumusan Pancasila & UUD 1945"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs font-bold"
            />
          </div>

          {/* Pengaturan Batas Waktu, Bobot Skor, dan Metode Pengumpulan */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground block">Batas Pengumpulan:</label>
              <Input
                placeholder="Misal: Hari ini, 15:00 WIB"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground block">Bobot Skor Maksimal:</label>
              <Input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="text-xs font-mono font-bold text-emerald-600"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground block">Metode Pengumpulan Siswa:</label>
              <select
                value={submissionType}
                onChange={(e) => setSubmissionType(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="TEXT_AND_FILE">Kombinasi (Teks Digital & Unggah Berkas)</option>
                <option value="TEXT_ONLY">Jawaban Teks Digital Langsung</option>
                <option value="FILE_ONLY">Unggah Berkas PDF / Foto Lembar Kerja</option>
              </select>
            </div>
          </div>

          {/* 📄 FITUR BARU: Lampiran Berkas LKPD Fisik (File Server Disk) vs URL Eksternal */}
          <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" /> Lembar Kerja / Bahan Ajar Pendukung (Opsional):
              </label>

              {/* Tab Selector Mode Upload */}
              <div className="flex items-center gap-1 bg-muted p-0.5 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setUploadMode("FILE")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center gap-1 ${
                    uploadMode === "FILE"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="h-3 w-3" /> Unggah Berkas Fisik
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("ELIBRARY")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center gap-1 ${
                    uploadMode === "ELIBRARY"
                      ? "bg-background text-purple-700 dark:text-purple-300 shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Library className="h-3 w-3 text-purple-600" /> Dari E-Library
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode("URL")}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition flex items-center gap-1 ${
                    uploadMode === "URL"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Link2 className="h-3 w-3" /> Tautan Link Eksternal
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
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 rounded-xl cursor-pointer bg-card/60 hover:bg-emerald-500/5 transition text-center"
                  >
                    <Upload className="h-7 w-7 text-emerald-600 mb-1.5" />
                    <span className="text-xs font-bold text-foreground">Klik untuk memilih berkas LKPD (PDF / DOCX)</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Berkas fisik akan otomatis disimpan ke File Server (`/uploads/lkpd/`)
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-bold text-foreground truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Berkas siap diterbitkan ke File Server
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFile}
                      className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 shrink-0"
                    >
                      <X className="h-4 w-4" />
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
                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-500/40 hover:border-purple-500 rounded-xl cursor-pointer bg-purple-500/5 hover:bg-purple-500/10 transition text-center"
                  >
                    <Library className="h-7 w-7 text-purple-600 mb-1.5" />
                    <span className="text-xs font-bold text-foreground">Klik untuk memilih Referensi / Buku dari E-Library</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Pilih dari koleksi buku paket digital, modul, audio, atau video MTsN 2 Cilacap tanpa upload ulang
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-purple-500/40 bg-purple-50 dark:bg-purple-950/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Library className="h-5 w-5 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate">{selectedElibraryBook.title}</p>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold text-purple-600 border-purple-300">
                            {selectedElibraryBook.type || "PDF"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {selectedElibraryBook.tag || "Umum"} · {selectedElibraryBook.size || "Koleksi E-Library"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsPickElibOpen(true)}
                        className="h-7 px-2 text-[11px] font-bold text-purple-700 dark:text-purple-300"
                      >
                        Ganti
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleClearElibraryBook}
                        className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploadMode === "URL" && (
              <div className="space-y-1">
                <Input
                  placeholder="Contoh: https://drive.google.com/... atau https://canva.com/..."
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  className="text-xs font-mono"
                />
                <p className="text-[10px] text-muted-foreground">
                  Tempel tautan Google Drive, Canva, atau lembar kerja digital online lainnya.
                </p>
              </div>
            )}
          </div>

          {/* Petunjuk & Uraian Aktivitas */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground block">Petunjuk & Deskripsi Aktivitas:</label>
            <Textarea
              placeholder="Tuliskan petunjuk pengerjaan, instruksi kelompok, atau panduan tugas..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="text-xs min-h-[75px]"
            />
          </div>

          {/* 📋 FITUR BARU: Builder Lembar Soal / Butir Pertanyaan LKPD Terstruktur */}
          {isQuestionType && (
            <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <ListOrdered className="h-4 w-4 text-emerald-600" /> Lembar Butir Pertanyaan / Tugas Terstruktur ({lkpdQuestions.length} Butir)
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Siswa akan menjawab pertanyaan-pertanyaan ini satu per satu secara terstruktur di layar mereka.
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddLkpdQuestion}
                  className="text-xs font-bold gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 h-7"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Butir
                </Button>
              </div>

              {lkpdQuestions.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-emerald-500/20 rounded-lg text-muted-foreground text-xs">
                  Tidak ada butir soal spesifik (siswa menjawab bebas sesuai deskripsi umum). Klik tombol di atas untuk menambah pertanyaan.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {lkpdQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-emerald-700 dark:text-emerald-300">Pertanyaan #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-semibold text-muted-foreground">Bobot Poin:</label>
                          <Input
                            type="number"
                            value={q.points}
                            onChange={(e) => handleLkpdQuestionChange(idx, "points", Number(e.target.value) || 0)}
                            className="h-7 w-16 text-center text-xs font-mono font-bold text-emerald-600"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveLkpdQuestion(idx)}
                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                            title="Hapus Butir Soal"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <Textarea
                        placeholder={`Tuliskan instruksi atau pertanyaan butir #${idx + 1}...`}
                        value={q.question}
                        onChange={(e) => handleLkpdQuestionChange(idx, "question", e.target.value)}
                        className="text-xs min-h-[50px]"
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
                  <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-purple-600" /> Pembuat Soal Kuis Formatif ({quizQuestions.length} Soal Pilihan Ganda)
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
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
                    onClick={() => downloadQuizTemplateExcel()}
                    className="text-[11px] font-bold gap-1 border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-500/10 h-7"
                    title="Unduh format spreadsheet Excel resmi MTsN 2 Cilacap"
                  >
                    <Download className="h-3 w-3" /> Unduh Template
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => excelInputRef.current?.click()}
                    className="text-[11px] font-bold gap-1 border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 h-7"
                    title="Import soal langsung dari file Excel atau CSV"
                  >
                    <FileSpreadsheet className="h-3 w-3 text-emerald-600" /> Import Excel
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddQuizQuestion}
                    className="text-[11px] font-bold gap-1 border-purple-500/40 text-purple-600 hover:bg-purple-500/10 h-7"
                  >
                    <Plus className="h-3 w-3" /> Tambah Soal
                  </Button>
                </div>
              </div>

              {quizQuestions.length === 0 ? (
                <div className="text-center py-5 border border-dashed border-purple-500/25 rounded-lg text-muted-foreground text-xs font-medium">
                  Belum ada butir soal kuis. Klik <strong>+ Tambah Soal</strong> atau <strong>Import Excel</strong> di atas untuk menyusun soal pilihan ganda.
                </div>
              ) : (
                <div className="space-y-3 pr-1">
                  {quizQuestions.map((q, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-purple-200 dark:border-purple-900 bg-card space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-purple-700 dark:text-purple-300">Soal #{idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-muted-foreground">Kunci Jawaban:</label>
                          <select
                            value={q.keyAnswer}
                            onChange={(e) => handleQuizQuestionChange(idx, "keyAnswer", e.target.value)}
                            className="h-7 px-2 rounded border border-purple-300 text-xs font-bold text-purple-700 bg-background"
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
                        className="text-xs font-bold"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Opsi A"
                          value={q.optionA}
                          onChange={(e) => handleQuizQuestionChange(idx, "optionA", e.target.value)}
                          className="text-xs"
                        />
                        <Input
                          placeholder="Opsi B"
                          value={q.optionB}
                          onChange={(e) => handleQuizQuestionChange(idx, "optionB", e.target.value)}
                          className="text-xs"
                        />
                        <Input
                          placeholder="Opsi C"
                          value={q.optionC}
                          onChange={(e) => handleQuizQuestionChange(idx, "optionC", e.target.value)}
                          className="text-xs"
                        />
                        <Input
                          placeholder="Opsi D"
                          value={q.optionD}
                          onChange={(e) => handleQuizQuestionChange(idx, "optionD", e.target.value)}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" size="sm" className="text-xs font-semibold px-4" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 px-5">
              <CheckCircle2 className="h-4 w-4" /> Terbitkan Aktivitas Ke Siswa
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
