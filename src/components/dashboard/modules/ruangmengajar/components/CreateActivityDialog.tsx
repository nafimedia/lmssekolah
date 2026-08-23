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
      templateTitle: "Tugas Kelompok — Poster Infografis & Presentasi KBM",
      templateInstr: "Buatlah poster infografis kreatif bersama kelompok (4-5 siswa), lalu persiapkan bahan presentasi singkat di depan kelas.",
      color: "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300",
    },
    {
      id: "QUIZ",
      label: "⚡ Kuis Formatif",
      templateTitle: "Kuis Formatif Sesi 1 — 10 Soal Pemahaman Konsep",
      templateInstr: "Kerjakan 10 soal pilihan ganda secara mandiri untuk mengukur pemahaman materi KBM hari ini.",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !instructions.trim()) {
      return toast.error("Mohon lengkapi judul dan instruksi LKPD terlebih dahulu!");
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
    toast.success(`✅ Aktivitas "${title}" berhasil disimpan ke Database!`);
    setTitle("");
    setInstructions("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <Plus className="h-5 w-5 text-emerald-600" /> Buat Aktivitas Pembelajaran & LKPD Baru
          </DialogTitle>
          <DialogDescription className="text-xs">
            Pilih jenis aktivitas pembelajaran di bawah ini. Uraian soal & lembar kerja akan langsung terhubung ke layar siswa.
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
            <label className="text-xs font-bold text-foreground block">Judul Aktivitas / LKPD:</label>
            <Input
              placeholder="Misal: LKPD 2 — Analisis Perumusan Pancasila & UUD 1945"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
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
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground block">Petunjuk & Uraian Soal LKPD:</label>
            <Textarea
              placeholder="Tuliskan petunjuk pengerjaan, soal kasus, atau tautan bahan rujukan untuk siswa..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" size="sm" className="text-xs font-bold" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
              <CheckCircle2 className="h-4 w-4" /> Terbitkan LKPD Ke Siswa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
