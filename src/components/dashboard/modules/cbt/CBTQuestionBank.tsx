import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Save,
  Trash2,
  Edit3,
  FileCheck,
  X,
  Volume2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { CBTQuestion, QuestionType } from "@/types/cbt";
import { filterSubjectsForUser, ALL_SCHOOL_SUBJECTS } from "@/services/teacherSubjectAccess";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { isArabicText } from "@/utils/arabicHelper";

export const CBT_QUESTION_TYPES_CONFIG: Record<
  QuestionType,
  { label: string; shortLabel: string; badgeColor: string; icon: string }
> = {
  pg: {
    label: "Pilihan Ganda Tunggal (A-D)",
    shortLabel: "PG Tunggal",
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    icon: "🔘",
  },
  pg_kompleks: {
    label: "Pilihan Ganda Kompleks (Multi Jawaban)",
    shortLabel: "PG Kompleks",
    badgeColor: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30",
    icon: "☑️",
  },
  merangkai_kalimat: {
    label: "Merangkai Kalimat (Bahasa)",
    shortLabel: "Rangkai Kalimat",
    badgeColor: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/30",
    icon: "🔤",
  },
  menjodohkan: {
    label: "Menjodohkan (Matching Pairs)",
    shortLabel: "Menjodohkan",
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30",
    icon: "🔗",
  },
  benar_salah: {
    label: "Benar / Salah",
    shortLabel: "Benar / Salah",
    badgeColor: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30",
    icon: "⚖️",
  },
  isian: {
    label: "Teks Singkat (Isian)",
    shortLabel: "Isian Singkat",
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
    icon: "✍️",
  },
  essay: {
    label: "Esai / Uraian (Koreksi Guru)",
    shortLabel: "Esai / Uraian",
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
    icon: "📝",
  },
  numerik: {
    label: "Numerik (Angka & Toleransi)",
    shortLabel: "Numerik",
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
    icon: "🔢",
  },
  melengkapi: {
    label: "Melengkapi Kalimat Rumpang",
    shortLabel: "Melengkapi",
    badgeColor: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30",
    icon: "🔲",
  },
};

interface CBTQuestionBankProps {
  questions: CBTQuestion[];
  userRole?: string;
  onAddQuestion?: (question: CBTQuestion) => void;
  onDeleteQuestion?: (questionId: string) => void;
}

export const CBTQuestionBank: React.FC<CBTQuestionBankProps> = ({
  questions,
  userRole = "guru",
  onAddQuestion,
  onDeleteQuestion,
}) => {
  const allowedMapels = filterSubjectsForUser(ALL_SCHOOL_SUBJECTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New Question Form State
  const [qText, setQText] = useState("");
  const [qType, setQType] = useState<QuestionType>("pg");
  const [qMapel, setQMapel] = useState<string>(allowedMapels[0] || "Matematika");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctKey, setCorrectKey] = useState<string>("A");
  const [qPoints, setQPoints] = useState("5");
  const [qDifficulty, setQDifficulty] = useState<"Mudah" | "Sedang" | "Sukar">("Sedang");
  const [qImageUrl, setQImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [qAudioUrl, setQAudioUrl] = useState("");
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [forceArabicMode, setForceArabicMode] = useState(false);

  // Extra state for AKM 9 Types
  const [pgKompleksKeys, setPgKompleksKeys] = useState<string[]>(["A"]);
  const [pgKompleksScores, setPgKompleksScores] = useState<Record<string, number>>({ A: 5, B: 5, C: 0, D: 0 });
  const [targetSentence, setTargetSentence] = useState("");
  const [matchingPairs, setMatchingPairs] = useState<Array<{ left: string; right: string }>>([
    { left: "", right: "" },
    { left: "", right: "" },
  ]);
  const [isianAnswer, setIsianAnswer] = useState("");
  const [numericKey, setNumericKey] = useState("");
  const [numericTolerance, setNumericTolerance] = useState(0);

  const resetForm = () => {
    setQText("");
    setOptA("");
    setOptB("");
    setOptC("");
    setOptD("");
    setQImageUrl("");
    setQAudioUrl("");
    setForceArabicMode(false);
    setCorrectKey("A");
    setPgKompleksKeys(["A"]);
    setPgKompleksScores({ A: 5, B: 5, C: 0, D: 0 });
    setTargetSentence("");
    setMatchingPairs([
      { left: "", right: "" },
      { left: "", right: "" },
    ]);
    setIsianAnswer("");
    setNumericKey("");
    setNumericTolerance(0);
  };

  const isCurrentArabic = forceArabicMode || isArabicText(qText) || qMapel.toLowerCase().includes("arab");

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      return toast.error("Ukuran berkas gambar maksimal 5 MB!");
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await MysqlDataService.uploadCbtImage(file.name, dataUrl);
        if (res.success && res.imageUrl) {
          setQImageUrl(res.imageUrl);
          toast.success("Gambar soal berhasil diunggah ke server disk!");
        } else {
          toast.error("Gagal mengunggah berkas gambar.");
        }
      } catch {
        toast.error("Terjadi kendala saat menyimpan gambar.");
      } finally {
        setIsUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      return toast.error("Ukuran berkas audio maksimal 15 MB!");
    }

    setIsUploadingAudio(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await MysqlDataService.uploadCbtAudio(file.name, dataUrl);
        if (res.success && res.audioUrl) {
          setQAudioUrl(res.audioUrl);
          toast.success("Audio soal (Istima'/Listening) berhasil diunggah ke server disk!");
        } else {
          toast.error("Gagal mengunggah berkas audio.");
        }
      } catch {
        toast.error("Terjadi kendala saat menyimpan audio.");
      } finally {
        setIsUploadingAudio(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) {
      return toast.error("Teks butir soal tidak boleh kosong!");
    }

    let finalOptions = { A: optA.trim(), B: optB.trim(), C: optC.trim(), D: optD.trim() };
    let finalKey = correctKey;
    let extraData: CBTQuestion["extraData"] = undefined;

    if (qType === "pg") {
      if (!optA.trim() || !optB.trim() || !optC.trim() || !optD.trim()) {
        return toast.error("Semua opsi pilihan jawaban (A, B, C, D) harus diisi!");
      }
    } else if (qType === "pg_kompleks") {
      if (!optA.trim() || !optB.trim()) {
        return toast.error("Minimal opsi A dan B harus diisi untuk PG Kompleks!");
      }
      if (pgKompleksKeys.length === 0) {
        return toast.error("Pilih minimal 1 kunci jawaban yang benar untuk PG Kompleks!");
      }
      finalKey = pgKompleksKeys.join(",");
      extraData = {
        keyAnswers: pgKompleksKeys,
        optionScores: pgKompleksScores,
      };
    } else if (qType === "merangkai_kalimat") {
      if (!targetSentence.trim()) {
        return toast.error("Kalimat target yang benar harus diisi!");
      }
      const words = targetSentence.trim().split(/\s+/).filter(Boolean);
      if (words.length < 2) {
        return toast.error("Kalimat target harus memiliki minimal 2 kata!");
      }
      finalOptions = { A: "", B: "", C: "", D: "" };
      finalKey = targetSentence.trim();
      extraData = {
        targetSentence: targetSentence.trim(),
        scrambledWords: words,
      };
    } else if (qType === "menjodohkan") {
      if (matchingPairs.length < 2) {
        return toast.error("Minimal harus ada 2 pasang premis dan jawaban untuk soal menjodohkan!");
      }
      for (const p of matchingPairs) {
        if (!p.left.trim() || !p.right.trim()) {
          return toast.error("Semua baris premis kiri dan pasangan kanan harus diisi!");
        }
      }
      finalOptions = { A: "", B: "", C: "", D: "" };
      finalKey = JSON.stringify(matchingPairs.map((p) => p.right));
      extraData = {
        pairs: matchingPairs,
      };
    } else if (qType === "benar_salah") {
      finalOptions = { A: "Benar", B: "Salah", C: "", D: "" };
      finalKey = correctKey === "Salah" ? "Salah" : "Benar";
    } else if (qType === "isian") {
      if (!isianAnswer.trim()) {
        return toast.error("Kunci jawaban teks singkat harus diisi!");
      }
      finalOptions = { A: "", B: "", C: "", D: "" };
      finalKey = isianAnswer.trim();
    } else if (qType === "essay") {
      finalOptions = { A: "", B: "", C: "", D: "" };
      finalKey = "Koreksi Manual Guru";
    } else if (qType === "numerik") {
      if (!numericKey.trim()) {
        return toast.error("Nilai angka kunci jawaban harus diisi!");
      }
      finalOptions = { A: "", B: "", C: "", D: "" };
      finalKey = numericKey.trim();
      extraData = {
        tolerance: numericTolerance,
      };
    } else if (qType === "melengkapi") {
      if (!isianAnswer.trim()) {
        return toast.error("Kunci kata/frasa pengisi bagian rumpang harus diisi!");
      }
      finalOptions = { A: "", B: "", C: "", D: "" };
      finalKey = isianAnswer.trim();
      extraData = {
        clozeAnswer: isianAnswer.trim(),
      };
    }

    const activeUser = MysqlAuthService.getActiveUser();
    const newQuestion: CBTQuestion = {
      id: String(Date.now()),
      questionType: qType,
      questionText: qText.trim(),
      imageUrl: qImageUrl || undefined,
      audioUrl: qAudioUrl || undefined,
      options: finalOptions,
      correctOption: finalKey,
      points: parseInt(qPoints, 10) || 5,
      difficulty: qDifficulty,
      mapel: qMapel || allowedMapels[0] || "Matematika",
      author: activeUser?.full_name || "Guru Pengampu",
      extraData,
    };

    onAddQuestion?.(newQuestion);
    toast.success("✅ Butir Soal CBT Baru Berhasil Ditambahkan!");
    setIsAddModalOpen(false);
    resetForm();
  };

  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleRealImportExcel = async () => {
    if (!selectedExcelFile) {
      return toast.error("Silakan pilih berkas Excel (.xlsx / .csv) terlebih dahulu!");
    }

    try {
      setImporting(true);
      const { parseCbtExcelFile } = await import("@/utils/quizExcelHelper");
      const parsed = await parseCbtExcelFile(selectedExcelFile);
      if (parsed.length === 0) {
        return toast.error("Tidak ada data butir soal yang valid dalam berkas Excel.");
      }

      const activeUser = MysqlAuthService.getActiveUser();
      parsed.forEach((item: any, index: number) => {
        const newQuestion: CBTQuestion = {
          id: `cbt_q_${Date.now()}_${index}`,
          questionText: item.question,
          questionType: item.questionType || "pg",
          mapel: qMapel,
          options: {
            A: item.optionA,
            B: item.optionB,
            C: item.optionC,
            D: item.optionD,
          },
          correctOption: item.keyAnswer,
          points: item.points || 5,
          difficulty: "Sedang",
          author: activeUser?.full_name || "Guru Pengampu",
          extraData: item.extraData,
        };
        onAddQuestion?.(newQuestion);
      });

      toast.success(`📊 Berhasil mengimpor ${parsed.length} butir soal dari "${selectedExcelFile.name}"!`);
      setSelectedExcelFile(null);
      setIsImportModalOpen(false);
    } catch (err: any) {
      console.error("Gagal import Excel CBT:", err);
      toast.error(`Gagal membaca berkas Excel: ${err?.message || "Format tidak sesuai"}`);
    } finally {
      setImporting(false);
    }
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
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari kata kunci soal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs h-9"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-none shrink-0"
          >
            <option value="all">Semua Tipe Soal (9 Ragam AKM)</option>
            <option value="pg">🔘 Pilihan Ganda Tunggal (A-D)</option>
            <option value="pg_kompleks">☑️ PG Kompleks (Multi Jawaban)</option>
            <option value="merangkai_kalimat">🔤 Merangkai Kalimat (Bahasa)</option>
            <option value="menjodohkan">🔗 Menjodohkan (Matching)</option>
            <option value="benar_salah">⚖️ Benar / Salah</option>
            <option value="isian">✍️ Teks Singkat (Isian)</option>
            <option value="essay">📝 Esai / Uraian</option>
            <option value="numerik">🔢 Numerik</option>
            <option value="melengkapi">🔲 Melengkapi Kalimat</option>
          </select>
        </div>

        {canManageBank && (
          <div className="flex flex-col xs:flex-row sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="gap-1.5 font-semibold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 flex-1 sm:flex-none justify-center h-9"
            >
              <Upload className="h-4 w-4" /> Import Template Excel
            </Button>

            <Button
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs flex-1 sm:flex-none justify-center h-9"
            >
              <Plus className="h-4 w-4" /> Tambah Soal Manual
            </Button>
          </div>
        )}
      </div>

      {/* Question Items List */}
      <div className="space-y-3">
        {filteredQuestions.map((q, idx) => {
          const isQArabic = isArabicText(q.questionText);
          const typeCfg = CBT_QUESTION_TYPES_CONFIG[q.questionType] || CBT_QUESTION_TYPES_CONFIG.pg;

          return (
            <Card key={q.id} className="border-border bg-card hover:border-emerald-500/50 transition-all shadow-xs">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[11px] font-bold">
                      Soal #{idx + 1}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-[11px] font-semibold ${typeCfg.badgeColor}`}
                    >
                      {typeCfg.icon} {typeCfg.shortLabel}
                    </Badge>
                    {isQArabic && (
                      <Badge variant="outline" className="text-[10px] font-semibold border-amber-500/40 text-amber-600 dark:text-amber-400">
                        🇸🇦 Teks Bahasa Arab
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[11px]">
                      Tingkat: {q.difficulty || "Sedang"}
                    </Badge>
                    <Badge variant="secondary" className="text-[11px] font-mono">
                      Bobot: {q.points || 5} Poin
                    </Badge>
                  </div>

                  {/* Question Image if uploaded */}
                  {q.imageUrl && (
                    <div className="pt-2">
                      <img
                        src={q.imageUrl}
                        alt="Ilustrasi Soal"
                        className="max-h-48 max-w-full rounded-lg border border-border object-contain bg-muted/20"
                      />
                    </div>
                  )}

                  {/* Question Audio if uploaded */}
                  {q.audioUrl && (
                    <div className="pt-2">
                      <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300">
                        <div className="flex items-center gap-1.5 font-semibold text-xs">
                          <Volume2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                          <span>Audio Soal (Istima' / Listening):</span>
                        </div>
                        <audio controls src={q.audioUrl} className="h-8 max-w-full sm:ml-auto" />
                      </div>
                    </div>
                  )}

                  <div
                    dir={isQArabic ? "rtl" : "ltr"}
                    className={`pt-1 text-foreground ${isQArabic
                      ? "font-arabic text-xl leading-loose font-bold"
                      : "text-sm sm:text-base font-semibold leading-relaxed"
                      }`}
                  >
                    {q.questionText}
                  </div>

                  {/* 1. Display Options for Pilihan Ganda Tunggal */}
                  {q.questionType === "pg" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs">
                      {(["A", "B", "C", "D"] as const).map((key) => {
                        const isCorrect = q.correctOption === key;
                        const optText = q.options[key] || "";
                        const isOptArabic = isArabicText(optText);
                        return (
                          <div
                            key={key}
                            dir={isOptArabic ? "rtl" : "ltr"}
                            className={`p-2.5 rounded-lg border flex items-center gap-2 ${isCorrect
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-700 dark:text-emerald-300 font-medium"
                              : "bg-muted/30 border-border text-muted-foreground"
                              }`}
                          >
                            <span
                              className={`h-5 w-5 rounded font-bold text-[11px] flex items-center justify-center shrink-0 ${isCorrect ? "bg-emerald-600 text-white" : "bg-muted border"
                                }`}
                            >
                              {key}
                            </span>
                            <span className={`truncate ${isOptArabic ? "font-arabic text-sm" : ""}`}>{optText}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 2. Display for PG Kompleks */}
                  {q.questionType === "pg_kompleks" && (
                    <div className="space-y-1.5 pt-2 text-xs">
                      <span className="text-[11px] font-semibold text-muted-foreground block">
                        Opsi PG Kompleks & Kunci Terpilih:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(["A", "B", "C", "D"] as const).map((key) => {
                          const optText = q.options?.[key] || "";
                          if (!optText) return null;
                          const keys = q.extraData?.keyAnswers || q.correctOption?.split(",") || [];
                          const isKey = keys.includes(key);
                          const score = q.extraData?.optionScores?.[key];
                          const isOptArabic = isArabicText(optText);
                          return (
                            <div
                              key={key}
                              dir={isOptArabic ? "rtl" : "ltr"}
                              className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${isKey
                                ? "bg-sky-500/10 border-sky-500/50 text-sky-800 dark:text-sky-200 font-medium"
                                : "bg-muted/30 border-border text-muted-foreground"
                                }`}
                            >
                              <div className="flex items-center gap-2 truncate">
                                <span
                                  className={`h-5 w-5 rounded font-bold text-[11px] flex items-center justify-center shrink-0 ${isKey ? "bg-sky-600 text-white" : "bg-muted border"
                                    }`}
                                >
                                  {key}
                                </span>
                                <span className={`truncate ${isOptArabic ? "font-arabic text-sm" : ""}`}>{optText}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {score !== undefined && score > 0 && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-1 border-sky-500/40 text-sky-600">
                                    +{score} pt
                                  </Badge>
                                )}
                                {isKey && <Check className="h-3.5 w-3.5 text-sky-600" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. Display for Merangkai Kalimat */}
                  {q.questionType === "merangkai_kalimat" && (
                    <div className="space-y-1.5 pt-2 text-xs">
                      <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-300 block">
                        Kalimat Lengkap (Kunci Tepat):
                      </span>
                      <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-foreground font-semibold">
                        "{q.extraData?.targetSentence || q.correctOption}"
                      </div>
                      {Array.isArray(q.extraData?.scrambledWords) && q.extraData.scrambledWords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-muted-foreground font-medium">Potongan Kata:</span>
                          {q.extraData.scrambledWords.map((w: string, wIdx: number) => (
                            <Badge key={wIdx} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                              {w}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Display for Menjodohkan */}
                  {q.questionType === "menjodohkan" && Array.isArray(q.extraData?.pairs) && (
                    <div className="space-y-1.5 pt-2 text-xs">
                      <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block">
                        Daftar Pasangan Menjodohkan:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {q.extraData.pairs.map((p, pIdx) => (
                          <div key={pIdx} className="flex items-center gap-2 bg-muted/40 p-2 rounded-lg border border-border/60">
                            <span className="font-semibold text-foreground">{p.left}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{p.right}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. Display for Benar / Salah */}
                  {q.questionType === "benar_salah" && (
                    <div className="flex items-center gap-2 pt-2 text-xs">
                      {["Benar", "Salah"].map((val) => {
                        const isCorrect = q.correctOption === val;
                        return (
                          <div
                            key={val}
                            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1.5 ${isCorrect
                              ? "bg-teal-500/10 border-teal-500 text-teal-700 dark:text-teal-300"
                              : "bg-muted/20 border-border text-muted-foreground"
                              }`}
                          >
                            {isCorrect && <Check className="h-3.5 w-3.5 text-teal-600" />}
                            <span>{val}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* 6. Display for Isian Singkat */}
                  {q.questionType === "isian" && (
                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <span className="text-muted-foreground font-medium">Kunci Jawaban Singkat:</span>
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30 font-mono font-bold text-xs px-2.5 py-0.5">
                        {q.correctOption}
                      </Badge>
                    </div>
                  )}

                  {/* 7. Display for Essay */}
                  {q.questionType === "essay" && (
                    <div className="pt-2 text-xs text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-600 dark:text-blue-400">
                        ✍️ Koreksi Manual Guru
                      </Badge>
                      <span>Jawaban siswa akan dikoreksi dan dinilai secara manual oleh guru pengampu.</span>
                    </div>
                  )}

                  {/* 8. Display for Numerik */}
                  {q.questionType === "numerik" && (
                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <span className="text-muted-foreground font-medium">Kunci Nilai Angka:</span>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 font-mono font-bold text-xs px-2.5 py-0.5">
                        {q.correctOption} {q.extraData?.tolerance ? `(± Toleransi ${q.extraData.tolerance})` : "(Nilai Tepat)"}
                      </Badge>
                    </div>
                  )}

                  {/* 9. Display for Melengkapi Kalimat */}
                  {q.questionType === "melengkapi" && (
                    <div className="flex items-center gap-2 pt-2 text-xs">
                      <span className="text-muted-foreground font-medium">Kunci Kata/Frasa Rumpang:</span>
                      <Badge variant="outline" className="bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30 font-bold text-xs px-2.5 py-0.5">
                        {q.extraData?.clozeAnswer || q.correctOption}
                      </Badge>
                    </div>
                  )}
                </div>

                {canManageBank && (
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (confirm(`Hapus butir soal #${idx + 1}?`)) {
                          onDeleteQuestion?.(q.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Question Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border p-4 sm:p-6">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pr-6">
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Brain className="h-5 w-5 text-emerald-600" /> Tambah Butir Soal CBT
              </DialogTitle>
              <Button
                type="button"
                variant={forceArabicMode ? "default" : "outline"}
                size="sm"
                onClick={() => setForceArabicMode(!forceArabicMode)}
                className={`h-7 px-2.5 text-[11px] font-semibold gap-1 ${forceArabicMode ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-amber-500/40 text-amber-600"
                  }`}
              >
                🇸🇦 {forceArabicMode ? "Mode Arab Aktif" : "Mode Arab (Khat Naskh)"}
              </Button>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-0.5">
              Inputkan butir soal evaluasi madrasah untuk 9 ragam AKM literasi & numerasi.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Teks Pertanyaan / Butir Soal</Label>
                {isCurrentArabic && (
                  <span className="text-[11px] text-amber-600 font-semibold font-arabic">
                    الخط العربي (Amiri Naskh) • Rata Kanan
                  </span>
                )}
              </div>
              <textarea
                rows={3}
                dir={isCurrentArabic ? "rtl" : "ltr"}
                placeholder={isCurrentArabic ? "اكتب السؤال هنا بالتفصيل..." : "Tuliskan butir soal secara lengkap dan jelas..."}
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                className={`w-full p-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${isCurrentArabic ? "font-arabic text-base leading-loose text-right" : "text-xs"
                  }`}
              />
            </div>

            {/* Gambar Pendukung Soal (File Server / Disk) */}
            <div className="space-y-1.5 p-3 rounded-lg border border-border bg-muted/20">
              <Label className="text-xs font-semibold flex items-center justify-between">
                <span>Gambar / Ilustrasi Pendukung Soal (Opsional)</span>
                <span className="text-[10px] text-muted-foreground"></span>
              </Label>
              {qImageUrl ? (
                <div className="relative inline-block mt-2">
                  <img src={qImageUrl} alt="Preview" className="h-32 rounded-md object-contain border bg-background" />
                  <button
                    type="button"
                    onClick={() => setQImageUrl("")}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm hover:opacity-90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="text-xs max-w-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-emerald-50 dark:file:bg-emerald-950 file:text-emerald-700 dark:file:text-emerald-300"
                  />
                  {isUploadingImage && <span className="text-xs text-muted-foreground">Mengunggah...</span>}
                </div>
              )}
            </div>

            {/* Audio Pendukung Soal (Istima' Bahasa Arab / Listening Bahasa Inggris) */}
            <div className="space-y-1.5 p-3 rounded-lg border border-blue-500/30 bg-blue-50/10 dark:bg-blue-950/10">
              <Label className="text-xs font-semibold flex items-center justify-between text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Audio Soal (Istima' Bahasa Arab / Listening Bahasa Inggris)</span>
                </span>
                <span className="text-[10px] text-muted-foreground">MP3 / WAV Maks 15MB</span>
              </Label>
              {qAudioUrl ? (
                <div className="flex items-center gap-2 pt-1">
                  <audio controls src={qAudioUrl} className="h-8 max-w-sm" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setQAudioUrl("")}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Hapus Audio
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 pt-1">
                  <Input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    disabled={isUploadingAudio}
                    className="text-xs max-w-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 dark:file:bg-blue-950 file:text-blue-700 dark:file:text-blue-300"
                  />
                  {isUploadingAudio && <span className="text-xs text-muted-foreground">Mengunggah audio...</span>}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Mata Pelajaran</Label>
                <select
                  value={qMapel}
                  onChange={(e) => setQMapel(e.target.value)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                >
                  {allowedMapels.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                  <option value="Bahasa Arab">Bahasa Arab</option>
                  <option value="Al-Qur'an Hadits">Al-Qur'an Hadits</option>
                  <option value="Fiqih">Fiqih</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tipe Soal (AKM)</Label>
                <select
                  value={qType}
                  onChange={(e) => setQType(e.target.value as QuestionType)}
                  className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold"
                >
                  <option value="pg">🔘 Pilihan Ganda Tunggal (A-D)</option>
                  <option value="pg_kompleks">☑️ PG Kompleks (Multi Jawaban)</option>
                  <option value="merangkai_kalimat">🔤 Merangkai Kalimat (Bahasa)</option>
                  <option value="menjodohkan">🔗 Menjodohkan</option>
                  <option value="benar_salah">⚖️ Benar / Salah</option>
                  <option value="isian">✍️ Teks Singkat (Isian)</option>
                  <option value="essay">📝 Esai / Uraian</option>
                  <option value="numerik">🔢 Numerik</option>
                  <option value="melengkapi">🔲 Melengkapi Kalimat</option>
                </select>
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Bobot Poin</Label>
                <Input
                  type="number"
                  value={qPoints}
                  onChange={(e) => setQPoints(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            {/* 1. Options Input for Pilihan Ganda Tunggal */}
            {qType === "pg" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Opsi Jawaban & Kunci Jawaban</Label>
                  <span className="text-[11px] text-muted-foreground">*Klik huruf A/B/C/D untuk menetapkan Kunci Benar</span>
                </div>
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const stateVal = key === "A" ? optA : key === "B" ? optB : key === "C" ? optC : optD;
                  const setStateFn = key === "A" ? setOptA : key === "B" ? setOptB : key === "C" ? setOptC : setOptD;
                  const isOptAr = isArabicText(stateVal) || isCurrentArabic;

                  return (
                    <div key={key} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCorrectKey(key)}
                        className={`h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center transition-colors shrink-0 ${correctKey === key
                          ? "bg-emerald-600 text-white ring-2 ring-emerald-500 shadow-xs"
                          : "bg-muted text-muted-foreground border hover:bg-accent"
                          }`}
                      >
                        {key}
                      </button>
                      <Input
                        dir={isOptAr ? "rtl" : "ltr"}
                        placeholder={`Teks pilihan jawaban ${key}...`}
                        value={stateVal}
                        onChange={(e) => setStateFn(e.target.value)}
                        className={`text-xs h-9 ${isOptAr ? "font-arabic text-sm text-right" : ""}`}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Options Input for PG Kompleks */}
            {qType === "pg_kompleks" && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">Opsi Jawaban & Centang Kunci Benar (Multi)</Label>
                  <span className="text-[11px] text-sky-600 dark:text-sky-400 font-bold">
                    {pgKompleksKeys.length} Kunci Benar Terpilih
                  </span>
                </div>
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const stateVal = key === "A" ? optA : key === "B" ? optB : key === "C" ? optC : optD;
                  const setStateFn = key === "A" ? setOptA : key === "B" ? setOptB : key === "C" ? setOptC : setOptD;
                  const isChecked = pgKompleksKeys.includes(key);
                  const score = pgKompleksScores[key] ?? 5;
                  const isOptAr = isArabicText(stateVal) || isCurrentArabic;

                  return (
                    <div
                      key={key}
                      className={`p-2.5 rounded-lg border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs transition ${isChecked ? "border-sky-500/60 bg-sky-500/10 dark:bg-sky-950/20" : "border-border bg-background"
                        }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setPgKompleksKeys((prev) => prev.filter((k) => k !== key));
                              } else {
                                setPgKompleksKeys((prev) => [...prev, key]);
                              }
                            }}
                            className="rounded border-border text-sky-600 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                          />
                          <span className={`font-bold w-4 text-center ${isChecked ? "text-sky-700 dark:text-sky-300 font-extrabold" : "text-muted-foreground"}`}>
                            {key}.
                          </span>
                        </label>
                        <Input
                          dir={isOptAr ? "rtl" : "ltr"}
                          placeholder={`Teks pilihan opsi ${key}...`}
                          value={stateVal}
                          onChange={(e) => setStateFn(e.target.value)}
                          className={`text-xs h-8 flex-1 ${isOptAr ? "font-arabic text-sm text-right" : ""}`}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1.5 pl-6 sm:pl-0 shrink-0">
                        <span className="text-[10px] text-muted-foreground font-medium">Skor Poin:</span>
                        <Input
                          type="number"
                          min={0}
                          value={score}
                          disabled={!isChecked}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            setPgKompleksScores((prev) => ({ ...prev, [key]: val }));
                          }}
                          className="h-8 w-16 text-center text-xs font-mono font-bold text-sky-700 dark:text-sky-300"
                        />
                      </div>
                    </div>
                  );
                })}
                <p className="text-[10px] text-muted-foreground italic">
                  * Siswa dapat mencentang lebih dari 1 pilihan jawaban. Skor terakumulasi sesuai opsi benar yang dipilih siswa.
                </p>
              </div>
            )}

            {/* 3. Merangkai Kalimat */}
            {qType === "merangkai_kalimat" && (() => {
              const words = targetSentence.trim().split(/\s+/).filter(Boolean);
              return (
                <div className="space-y-2.5 pt-2 border-t border-border">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">
                      Kalimat Target Yang Benar (Urutan Lengkap):
                    </Label>
                    <Input
                      dir={isCurrentArabic ? "rtl" : "ltr"}
                      placeholder="Contoh: Siswa madrasah belajar giat setiap hari / العلم نور يهتدي به الإنسان"
                      value={targetSentence}
                      onChange={(e) => setTargetSentence(e.target.value)}
                      className={`text-xs ${isCurrentArabic ? "font-arabic text-base text-right leading-loose" : ""}`}
                    />
                  </div>
                  {words.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-orange-500/10 border border-orange-300 dark:border-orange-900/50 space-y-1">
                      <span className="text-[11px] font-semibold text-orange-800 dark:text-orange-300 block">
                        Pratinjau {words.length} Potongan Kata (Otomatis Diacak untuk Siswa):
                      </span>
                      <div className="flex flex-wrap gap-1.5" dir={isCurrentArabic ? "rtl" : "ltr"}>
                        {words.map((w, wIdx) => (
                          <Badge key={wIdx} variant="secondary" className={`bg-background border border-orange-400 font-normal px-2 py-0.5 ${isCurrentArabic ? "font-arabic text-sm" : "text-xs"}`}>
                            {w}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground italic">
                    * Kata-kata di atas akan disajikan dalam susunan acak di layar CBT. Siswa mengklik kata untuk menyusun kalimat.
                  </p>
                </div>
              );
            })()}

            {/* 4. Menjodohkan */}
            {qType === "menjodohkan" && (
              <div className="space-y-2.5 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-foreground">
                    Daftar Pasangan Premis Kiri ↔ Pasangan Kanan
                  </Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setMatchingPairs((prev) => [...prev, { left: "", right: "" }])}
                    className="text-[11px] font-medium gap-1 h-7 px-2 border-indigo-400 text-indigo-700 dark:text-indigo-300"
                  >
                    <Plus className="h-3 w-3" /> Tambah Pasangan
                  </Button>
                </div>
                <div className="space-y-2">
                  {matchingPairs.map((pair, pIdx) => (
                    <div key={pIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/60">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[11px] font-bold text-muted-foreground w-4 text-center shrink-0">{pIdx + 1}.</span>
                        <Input
                          dir={isCurrentArabic ? "rtl" : "ltr"}
                          placeholder="Premis / Istilah Kiri..."
                          value={pair.left}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMatchingPairs((prev) => prev.map((p, i) => (i === pIdx ? { ...p, left: val } : p)));
                          }}
                          className={`text-xs flex-1 ${isCurrentArabic ? "font-arabic text-sm text-right" : ""}`}
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-1 pl-6 sm:pl-0">
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 hidden sm:block" />
                        <Input
                          dir={isCurrentArabic ? "rtl" : "ltr"}
                          placeholder="Jawaban Tepat Kanan..."
                          value={pair.right}
                          onChange={(e) => {
                            const val = e.target.value;
                            setMatchingPairs((prev) => prev.map((p, i) => (i === pIdx ? { ...p, right: val } : p)));
                          }}
                          className={`text-xs flex-1 border-indigo-300 dark:border-indigo-800 ${isCurrentArabic ? "font-arabic text-sm text-right" : ""}`}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          disabled={matchingPairs.length <= 2}
                          onClick={() => setMatchingPairs((prev) => prev.filter((_, i) => i !== pIdx))}
                          className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * Pada lembar ujian CBT siswa, pilihan kanan otomatis diacak dalam dropdown untuk dijodohkan.
                </p>
              </div>
            )}

            {/* 5. Options Input for Benar / Salah */}
            {qType === "benar_salah" && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Label className="text-xs font-semibold text-foreground">Kunci Jawaban Yang Benar:</Label>
                <div className="flex gap-3">
                  {["Benar", "Salah"].map((val) => (
                    <Button
                      key={val}
                      type="button"
                      variant={correctKey === val ? "default" : "outline"}
                      onClick={() => setCorrectKey(val)}
                      className={`flex-1 font-bold text-xs h-10 ${correctKey === val ? "bg-teal-600 hover:bg-teal-700 text-white" : ""
                        }`}
                    >
                      {val}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Teks Singkat (Isian) */}
            {qType === "isian" && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <Label className="text-xs font-semibold text-foreground">Kunci Jawaban Teks Singkat:</Label>
                <Input
                  dir={isCurrentArabic ? "rtl" : "ltr"}
                  placeholder="Ketikkan kata / frasa jawaban singkat yang tepat..."
                  value={isianAnswer}
                  onChange={(e) => setIsianAnswer(e.target.value)}
                  className={`text-xs font-medium ${isCurrentArabic ? "font-arabic text-sm text-right" : ""}`}
                />
                <p className="text-[10px] text-muted-foreground italic">
                  * Koreksi otomatis bersifat case-insensitive (mengabaikan huruf besar/kecil dan spasi berlebih).
                </p>
              </div>
            )}

            {/* 7. Essay Info */}
            {qType === "essay" && (
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Catatan Soal Uraian:</strong> Jawaban essay siswa akan tersimpan ke database dan muncul di halaman <strong>Analisis Nilai & Koreksi Essay</strong> untuk diberi nilai manual oleh guru.
              </div>
            )}

            {/* 8. Numerik */}
            {qType === "numerik" && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Nilai Kunci Jawaban (Angka):</Label>
                    <Input
                      type="text"
                      placeholder="Contoh: 100 atau 3.14"
                      value={numericKey}
                      onChange={(e) => setNumericKey(e.target.value)}
                      className="text-xs font-mono font-medium border-amber-300 dark:border-amber-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-foreground">Toleransi Nilai (± Margin):</Label>
                    <Input
                      type="number"
                      step="any"
                      min={0}
                      placeholder="0 (isi 0 jika harus angka persis)"
                      value={numericTolerance}
                      onChange={(e) => setNumericTolerance(parseFloat(e.target.value) || 0)}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic">
                  * Jawaban siswa dinilai benar jika nilai angka berada dalam rentang [Kunci - Toleransi, Kunci + Toleransi].
                </p>
              </div>
            )}

            {/* 9. Melengkapi Kalimat */}
            {qType === "melengkapi" && (
              <div className="space-y-1.5 pt-2 border-t border-border">
                <Label className="text-xs font-semibold text-foreground">
                  Kunci Kata / Frasa Pengisi Bagian Rumpang [...]:
                </Label>
                <Input
                  dir={isCurrentArabic ? "rtl" : "ltr"}
                  placeholder="Ketikkan kata/frasa pengisi bagian kosong..."
                  value={isianAnswer}
                  onChange={(e) => setIsianAnswer(e.target.value)}
                  className={`text-xs font-medium border-cyan-300 dark:border-cyan-800 ${isCurrentArabic ? "font-arabic text-sm text-right" : ""}`}
                />
                <p className="text-[10px] text-muted-foreground italic">
                  * Pada teks soal gunakan tanda [...] untuk menandai bagian kalimat yang harus diisi oleh siswa.
                </p>
              </div>
            )}

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)} className="text-xs flex-1 sm:flex-none">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs flex-1 sm:flex-none">
                <Save className="h-4 w-4" /> Simpan Ke Bank Soal
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
            <input
              type="file"
              id="cbt-excel-file-input"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setSelectedExcelFile(f);
              }}
            />

            {!selectedExcelFile ? (
              <label
                htmlFor="cbt-excel-file-input"
                className="p-5 border-2 border-dashed border-emerald-500/40 rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500 transition-colors bg-emerald-50/20 dark:bg-emerald-950/10 cursor-pointer"
              >
                <Upload className="h-8 w-8 text-emerald-600" />
                <div className="text-xs font-semibold text-foreground">Klik untuk Memilih Berkas Excel (.xlsx / .csv)</div>
                <p className="text-[11px] text-muted-foreground">Format resmi Bank Soal Pilihan Ganda MTsN 2 Cilacap</p>
              </label>
            ) : (
              <div className="p-3 rounded-lg border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-foreground truncate">{selectedExcelFile.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {(selectedExcelFile.size / 1024).toFixed(1)} KB · Siap diimpor ke Bank Soal
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedExcelFile(null)}
                  className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const { downloadCbtTemplateExcel } = await import("@/utils/quizExcelHelper");
                  downloadCbtTemplateExcel("Template_Bank_Soal_CBT_AKM_MTsN2.xlsx");
                } catch (err) {
                  toast.error("Gagal mengunduh template Excel CBT");
                }
              }}
              className="w-full text-xs gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <Download className="h-3.5 w-3.5" /> Unduh Format Template Excel Resmi CBT (9 Ragam AKM)
            </Button>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)} className="text-xs">
              Batal
            </Button>
            <Button
              size="sm"
              disabled={!selectedExcelFile || importing}
              onClick={handleRealImportExcel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
            >
              <Check className="h-4 w-4" /> {importing ? "Memproses..." : "Unggah & Impor Soal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
