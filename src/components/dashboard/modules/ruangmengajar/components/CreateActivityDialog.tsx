import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Sparkles, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";

export type ActivityTypeOption =
  | "LKPD"
  | "TUGAS_KELOMPOK"
  | "QUIZ"
  | "TUGAS_MANDIRI"
  | "PRAKTIKUM"
  | "PROYEK_P5"
  | "HAFALAN";

interface CreateActivityDialogProps {
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
  }) => void;
}

export function CreateActivityDialog({
  isOpen,
  onOpenChange,
  activeRombel,
  activeMapel,
  onActivityCreated,
}: CreateActivityDialogProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ActivityTypeOption>("LKPD");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("Hari ini, 15:00 WIB");
  const [maxScore, setMaxScore] = useState("100");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submissionType, setSubmissionType] = useState("TEXT_AND_FILE");

  // Quiz Builder State
  const [quizQuestions, setQuizQuestions] = useState<
    Array<{ id: number; question: string; optionA: string; optionB: string; optionC: string; optionD: string; keyAnswer: string }>
  >([
    {
      id: 1,
      question: "Sebutkan poin utama dari pembahasan materi KBM hari ini!",
      optionA: "Pernyataan Opsi A (Benar)",
      optionB: "Pernyataan Opsi B",
      optionC: "Pernyataan Opsi C",
      optionD: "Pernyataan Opsi D",
      keyAnswer: "A",
    },
  ]);

  const activityOptions: { id: ActivityTypeOption; label: string; templateTitle: string; templateInstr: string; color: string }[] = [
    {
      id: "LKPD",
      label: "📄 LKPD Digital",
      templateTitle: "LKPD 1 — Analisis Studi Kasus Penerapan Aturan & Norma",
      templateInstr: "Bacalah uraian kasus pada Modul Ajar Bab 1, kemudian jawablah 3 pertanyaan analisis dan diskusikan dampaknya dalam masyarakat.",
      color: "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    },
    {
      id: "TUGAS_KELOMPOK",
      label: "👥 Diskusi & Kelompok",
      templateTitle: "Tugas Kelompok — Forum Diskusi & Presentasi KBM",
      templateInstr: "Buatlah poster infografis kreatif bersama kelompok (4-5 siswa), lalu persiapkan bahan presentasi singkat di depan kelas dan tulis tanggapan di forum diskusi.",
      color: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    },
    {
      id: "QUIZ",
      label: "⚡ Kuis Formatif",
      templateTitle: "Kuis Formatif Sesi 1 — Soal Pemahaman Konsep",
      templateInstr: "Kerjakan soal pilihan ganda di bawah ini secara mandiri untuk mengukur pemahaman materi KBM hari ini.",
      color: "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300",
    },
    {
      id: "TUGAS_MANDIRI",
      label: "✍️ Tugas Mandiri",
      templateTitle: "Tugas Mandiri — Ringkasan Rangkuman Materi & Latihan",
      templateInstr: "Tuliskan ringkasan poin penting dari bahan ajar hari ini dan kerjakan latihan soal no 1-5 di buku tugas.",
      color: "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    },
    {
      id: "PRAKTIKUM",
      label: "🔬 Praktikum & Lab",
      templateTitle: "Lembar Praktikum / Laporan Pengamatan Lapangan",
      templateInstr: "Catat data hasil percobaan/pengamatan, buat grafik/tabel hasil uji, lalu simpulkan sesuai metode ilmiah.",
      color: "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300",
    },
    {
      id: "PROYEK_P5",
      label: "🎯 Proyek P5 / PPRA",
      templateTitle: "Jurnal & Laporan Perkembangan Projek P5 Sesi Hari Ini",
      templateInstr: "Dokumentasikan progres aktivitas kelompok projek P5/PPRA hari ini, sertakan foto produk/kegiatan dan kendala tim.",
      color: "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300",
    },
    {
      id: "HAFALAN",
      label: "📖 Setoran Hafalan",
      templateTitle: "Setoran Hafalan & Resitasi Sesi KBM",
      templateInstr: "Siapkan hafalan target surah/ayat/hadits/kosakata hari ini dan lakukan setoran langsung kepada guru pengampu.",
      color: "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
    },
  ];

  const handleSelectType = (opt: typeof activityOptions[0]) => {
    setType(opt.id);
    if (!title.trim()) setTitle(opt.templateTitle);
    if (!instructions.trim()) setInstructions(opt.templateInstr);
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      return toast.error("Mohon lengkapi judul dan instruksi terlebih dahulu!");
    }

    if (type === "QUIZ" && quizQuestions.length === 0) {
      return toast.error("Kuis Formatif membutuhkan minimal 1 soal!");
    }

    const payload = {
      rombel: activeRombel,
      mapel: activeMapel,
      teacher_name: "Guru Pengampu",
      title: title.trim(),
      type: type,
      instructions: instructions.trim(),
      due_date: dueDate,
      max_score: Number(maxScore) || 100,
      status: "AKTIF",
      attachment_url: attachmentUrl.trim(),
      submission_type: submissionType,
      quiz_data: type === "QUIZ" ? JSON.stringify(quizQuestions) : "",
    };

    const res = await MysqlDataService.saveLkpdActivity(payload);

    const created = {
      id: res.id || "act_" + Date.now(),
      title: title.trim(),
      type: type,
      dueDate: dueDate,
      status: "AKTIF",
      submittedCount: 0,
      totalStudents: 30,
    };

    onActivityCreated(created);
    toast.success(`✅ Aktivitas "${title}" berhasil diterbitkan ke Database!`);
    setTitle("");
    setInstructions("");
    setAttachmentUrl("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-emerald-600 text-white font-bold text-[10px] gap-1">
              <Sparkles className="h-3 w-3" /> FORM AKTIVITAS KURIKULUM MERDEKA
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {activeMapel} · {activeRombel}
            </span>
          </div>

          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <Plus className="h-5 w-5 text-emerald-600" /> Buat Aktivitas Pembelajaran, Kuis, & LKPD Digital
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pilih jenis aktivitas di bawah ini. Uraian soal, kuis formatif, atau forum diskusi akan langsung aktif di layar siswa.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="py-3 space-y-4">
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

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground block">Judul Aktivitas / Kuis / LKPD:</label>
            <Input
              placeholder="Misal: LKPD 2 — Analisis Perumusan Pancasila & UUD 1945"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs font-bold"
            />
          </div>

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
                <option value="TEXT_AND_FILE">Kombinasi (Teks & Unggah Berkas)</option>
                <option value="TEXT_ONLY">Jawaban Teks Digital Langsung</option>
                <option value="FILE_ONLY">Unggah Berkas PDF / Foto Lembar Kerja</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground block">Tautan Lampiran Modul / PDF / Canva (Opsional):</label>
            <Input
              placeholder="https://drive.google.com/... atau https://canva.com/..."
              value={attachmentUrl}
              onChange={(e) => setAttachmentUrl(e.target.value)}
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground block">Petunjuk & Uraian Aktivitas:</label>
            <Textarea
              placeholder="Tuliskan petunjuk pengerjaan, instruksi kelompok, atau panduan tugas..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="text-xs min-h-[80px]"
            />
          </div>

          {/* Builder Soal Kuis Formatif (Tampil Khusus Jenis QUIZ) */}
          {type === "QUIZ" && (
            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  ⚡ Pembuat Soal Kuis Formatif ({quizQuestions.length} Soal)
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddQuizQuestion}
                  className="text-xs font-bold gap-1 border-purple-500/40 text-purple-600 hover:bg-purple-500/10 h-7"
                >
                  <Plus className="h-3.5 w-3.5" /> Tambah Soal
                </Button>
              </div>

              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
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
                        {quizQuestions.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveQuizQuestion(idx)}
                            className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                          >
                            ×
                          </Button>
                        )}
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
            </div>
          )}

          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" size="sm" className="text-xs font-bold" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Terbitkan Aktivitas Ke Siswa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
