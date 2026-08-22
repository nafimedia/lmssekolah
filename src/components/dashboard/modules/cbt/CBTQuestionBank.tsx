import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Brain,
  Plus,
  Search,
  Upload,
  Download,
  FileSpreadsheet,
  Check,
  ShieldCheck,
  Lock,
  Sparkles,
  Trash2,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";
import { CBTQuestion, QuestionType } from "@/types/cbt";

interface CBTQuestionBankProps {
  questions: CBTQuestion[];
  userRole?: string;
  onAddQuestion?: (question: CBTQuestion) => void;
}

export const CBTQuestionBank: React.FC<CBTQuestionBankProps> = ({
  questions,
  userRole = "guru",
  onAddQuestion,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Question Form State
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<QuestionType>("pg");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctKey, setCorrectKey] = useState<"A" | "B" | "C" | "D">("A");
  const [qPoints, setQPoints] = useState("5");
  const [qDifficulty, setQDifficulty] = useState<"Mudah" | "Sedang" | "Sukar">("Sedang");

  const isSiswa = userRole === "siswa";
  const isWaliKelas = userRole === "walikelas" || userRole === "wali_kelas";
  const canManageBank = userRole === "guru" || userRole === "waka" || userRole === "admin" || userRole === "admin_akademik";

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.mapel && q.mapel.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = selectedType === "all" || q.questionType === selectedType;

    return matchesSearch && matchesType;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) {
      return toast.error("Teks butir soal tidak boleh kosong!");
    }

    const newQuestion: CBTQuestion = {
      id: String(Date.now()),
      questionType: qType,
      questionText: qText,
      options: {
        A: optA || "Pilihan A",
        B: optB || "Pilihan B",
        C: optC || "Pilihan C",
        D: optD || "Pilihan D",
      },
      correctOption: correctKey,
      points: parseInt(qPoints, 10) || 5,
      difficulty: qDifficulty,
      mapel: "Matematika",
      author: "SAYONO, S.Pd., M.Pd.",
    };

    onAddQuestion?.(newQuestion);
    toast.success("✅ Butir Soal CBT Baru Berhasil Ditambahkan!");
    setIsAddModalOpen(false);

    // Reset Form
    setQText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
  };

  const handleSimulatedImportExcel = () => {
    toast.success("📊 Import 20 Butir Soal Excel Berhasil!", {
      description: "Seluruh soal telah tervalidasi & diimpor ke Bank Soal CBT.",
    });
    setIsImportModalOpen(false);
  };

  // RBAC Access Lock View for Siswa
  if (isSiswa) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Akses Terkunci: Bank Soal & Kunci Jawaban</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
              Sebagai <span className="font-semibold text-foreground">Siswa</span>, Anda tidak memiliki hak akses untuk melihat kerahasiaan Bank Soal. Akses ini hanya diperuntukkan bagi Guru Pengampu & Waka Kurikulum.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-600">
            🔒 PROTEKSI INTEGRITAS SOAL CBT
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kata kunci soal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-none"
          >
            <option value="all">Semua Tipe Soal</option>
            <option value="pg">Pilihan Ganda</option>
            <option value="essay">Essay / Uraian</option>
            <option value="isian">Isian Singkat</option>
          </select>
        </div>

        {canManageBank && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="gap-1.5 font-semibold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            >
              <Upload className="h-4 w-4" /> Import Template Excel
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="h-4 w-4" /> Tambah Soal Manual
            </Button>
          </div>
        )}
      </div>

      {/* Question Items List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => (
          <Card key={q.id} className="border-border bg-card hover:border-emerald-500/50 transition-all">
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[11px] font-bold">
                    Soal #{idx + 1}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:border-emerald-800"
                  >
                    {q.questionType === "pg" ? "Pilihan Ganda" : q.questionType === "essay" ? "Essay" : "Isian"}
                  </Badge>
                  <Badge variant="outline" className="text-[11px]">
                    Tingkat: {q.difficulty || "Sedang"}
                  </Badge>
                  <Badge variant="secondary" className="text-[11px] font-mono">
                    Bobot: {q.points || 5} Poin
                  </Badge>
                </div>

                <div className="text-sm sm:text-base font-semibold text-foreground leading-relaxed pt-1">
                  {q.questionText}
                </div>

                {/* Display Options for Multiple Choice */}
                {q.questionType === "pg" && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                    {(["A", "B", "C", "D"] as const).map((key) => {
                      const isCorrect = q.correctOption === key;
                      return (
                        <div
                          key={key}
                          className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                            isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-medium"
                              : "bg-muted/30 border-border text-muted-foreground"
                          }`}
                        >
                          <span
                            className={`h-5 w-5 rounded font-bold text-[11px] flex items-center justify-center ${
                              isCorrect ? "bg-emerald-600 text-white" : "bg-muted border"
                            }`}
                          >
                            {key}
                          </span>
                          <span className="truncate">{q.options[key]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {canManageBank && (
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => toast.info("Edit Soal")}>
                    <Edit3 className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => toast.success("Soal Dihapus!")}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Question Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Brain className="h-5 w-5 text-emerald-600" /> Tambah Butir Soal CBT
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Input pertanyaan, opsi jawaban, kunci jawaban, dan bobot poin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Teks Pertanyaan / Soal</Label>
              <textarea
                rows={3}
                placeholder="Tuliskan soal ujian secara jelas..."
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Tipe Soal</Label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                >
                  <option value="pg">Pilihan Ganda</option>
                  <option value="essay">Essay / Uraian</option>
                  <option value="isian">Isian Singkat</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Tingkat Kesulitan</Label>
                <select
                  value={qDifficulty}
                  onChange={(e) => setQDifficulty(e.target.value as any)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                >
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sukar">Sukar</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Bobot Poin</Label>
                <Input
                  type="number"
                  value={qPoints}
                  onChange={(e) => setQPoints(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Options Input (Only for PG) */}
            {qType === "pg" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <Label className="text-xs font-semibold text-foreground">Opsi Jawaban & Kunci Jawaban</Label>
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const stateVal = key === "A" ? optA : key === "B" ? optB : key === "C" ? optC : optD;
                  const setStateFn = key === "A" ? setOptA : key === "B" ? setOptB : key === "C" ? setOptC : setOptD;

                  return (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectKey(key)}
                        className={`h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center transition-colors shrink-0 ${
                          correctKey === key
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-500"
                            : "bg-muted text-muted-foreground border hover:bg-accent"
                        }`}
                      >
                        {key}
                      </button>
                      <Input
                        placeholder={`Teks pilihan jawaban ${key}...`}
                        value={stateVal}
                        onChange={(e) => setStateFn(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  );
                })}
                <p className="text-[11px] text-muted-foreground">
                  *Klik tombol huruf (A/B/C/D) untuk menentukan Kunci Jawaban Benar.
                </p>
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                <Sparkles className="h-4 w-4" /> Simpan Ke Bank Soal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Excel Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" /> Import Bank Soal via Excel
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Unggah berkas spreadsheet format .XLSX / .CSV sesuai template resmi MTsN 2 Cilacap.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="p-4 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/50 transition-colors bg-muted/20">
              <Upload className="h-8 w-8 text-emerald-600" />
              <div className="text-xs font-semibold text-foreground">Drag & Drop berkas Excel di sini</div>
              <p className="text-[11px] text-muted-foreground">atau klik untuk memilih file dari komputer Anda</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("Template Excel Terunduh!")}
              className="w-full text-xs gap-1.5 font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> Unduh Format Template Excel (.xlsx)
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)} className="text-xs">
              Batal
            </Button>
            <Button size="sm" onClick={handleSimulatedImportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
              <Check className="h-4 w-4" /> Unggah & Impor Soal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
