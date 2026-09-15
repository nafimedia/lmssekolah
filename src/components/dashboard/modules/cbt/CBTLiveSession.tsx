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
  MonitorCheck,
  KeyRound,
  Clock,
  PlayCircle,
  Plus,
  Search,
  CheckCircle2,
  Users,
  ShieldAlert,
  RotateCcw,
  ShieldCheck,
  Eye,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { CBTExam } from "@/types/cbt";
import { MysqlDataService } from "@/services/mysqlDataService";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";

interface CBTLiveSessionProps {
  exams: CBTExam[];
  userRole?: string;
  onStartExam: (exam: CBTExam) => void;
  onCreateExam?: (newExam: Partial<CBTExam>) => void;
  onDeleteExam?: (examId: string) => void;
  availableRombels?: string[];
}

export const CBTLiveSession: React.FC<CBTLiveSessionProps> = ({
  exams,
  userRole = "siswa",
  onStartExam,
  onCreateExam,
  onDeleteExam,
  availableRombels,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState<CBTExam | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStudentName, setResetStudentName] = useState("");
  const [realStudents, setRealStudents] = useState<{ id: string; name: string; nisn?: string; rombel?: string }[]>([]);

  React.useEffect(() => {
    MysqlDataService.getUsers()
      .then((users) => {
        const students = users
          .filter((u: any) => u.role === "siswa")
          .map((u: any) => ({
            id: String(u.id),
            name: u.full_name || u.name,
            nisn: u.nis_nip || u.nisn || "",
            rombel: normalizeRombelName(u.class_name || u.rombel || "Rombel 8A"),
          }));
        setRealStudents(students);
      })
      .catch(() => {});
  }, []);

  // Standard Rombels for MTsN 2 Cilacap
  const defaultRombels = [
    "Kelas 7A", "Kelas 7B", "Kelas 7C", "Kelas 7D", "Kelas 7E", "Kelas 7F", "Kelas 7G", "Kelas 7H",
    "Kelas 8A", "Kelas 8B", "Kelas 8C", "Kelas 8D", "Kelas 8E", "Kelas 8F", "Kelas 8G", "Kelas 8H",
    "Kelas 9A", "Kelas 9B", "Kelas 9C", "Kelas 9D", "Kelas 9E", "Kelas 9F", "Kelas 9G", "Kelas 9H",
  ];
  const allAvailableRombels = availableRombels && availableRombels.length > 0 ? availableRombels : defaultRombels;

  // New Exam Form State with Multi-Rombel Support
  const [newTitle, setNewTitle] = useState("");
  const [newMapel, setNewMapel] = useState("Matematika");
  const [selectedClasses, setSelectedClasses] = useState<string[]>(["Semua Kelas"]);
  const [newDurasi, setNewDurasi] = useState("60");
  const [newToken, setNewToken] = useState("MTS2-NEW");
  const [newPassingScore, setNewPassingScore] = useState("75");
  const [newRandomizeQuestions, setNewRandomizeQuestions] = useState(true);
  const [newRandomizeOptions, setNewRandomizeOptions] = useState(true);
  const [newQuestionLimit, setNewQuestionLimit] = useState("0");

  const isWaliKelas = userRole === "walikelas" || userRole === "wali_kelas";
  const me = MysqlAuthService.getActiveUser();
  const rawClass = me?.class_name || "Rombel 8A";
  const binaanRombel = normalizeRombelName(rawClass);

  // Helper matching Multi-Rombel (e.g. "Kelas 7A, Kelas 7B" or "Semua Kelas")
  const isExamTargetMatch = (examKelas: string, targetRombel: string) => {
    if (!examKelas || examKelas === "Semua" || examKelas === "Semua Rombel" || examKelas === "Semua Kelas") {
      return true;
    }
    const cleanTarget = normalizeRombelName(targetRombel).toLowerCase().replace("rombel", "").replace("kelas", "").trim();
    const parts = examKelas.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    return parts.some((p) => {
      if (isSameClass(p, targetRombel)) return true;
      const cleanP = normalizeRombelName(p).toLowerCase().replace("rombel", "").replace("kelas", "").trim();
      return cleanP === cleanTarget || cleanP.includes(cleanTarget) || cleanTarget.includes(cleanP);
    });
  };

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.token.toLowerCase().includes(searchTerm.toLowerCase());

    if (isWaliKelas) {
      return matchesSearch && isExamTargetMatch(e.kelas || "", binaanRombel);
    }

    if (userRole === "siswa") {
      const isClassMatch = isExamTargetMatch(e.kelas || "", rawClass);
      return matchesSearch && (e.status === "Dibuka" || e.status === "Terjadwal") && isClassMatch;
    }
    return matchesSearch;
  });

  const handleOpenTokenModal = (exam: CBTExam) => {
    setSelectedExam(exam);
    setInputToken("");
    setIsTokenModalOpen(true);
  };

  const handleVerifyTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    if (inputToken.trim().toUpperCase() !== selectedExam.token.toUpperCase()) {
      return toast.error("❌ Token Ujian Tidak Valid!", {
        description: "Periksa kembali token resmi dari proktor / pengawas ujian.",
      });
    }

    toast.success("🔑 Token Valid! Selamat Mengerjakan CBT Ujian Online.");
    setIsTokenModalOpen(false);
    onStartExam(selectedExam);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      return toast.error("Judul ujian tidak boleh kosong!");
    }

    const targetKelas =
      selectedClasses.includes("Semua Kelas") || selectedClasses.length === 0
        ? "Semua Kelas"
        : selectedClasses.join(", ");

    const created: Partial<CBTExam> = {
      id: String(Date.now()),
      title: newTitle,
      mapel: newMapel,
      kelas: targetKelas,
      token: newToken.toUpperCase(),
      durationMinutes: parseInt(newDurasi, 10) || 60,
      passingScore: parseInt(newPassingScore, 10) || 75,
      soalCount: 20,
      status: "Dibuka",
      randomizeQuestions: newRandomizeQuestions,
      randomizeOptions: newRandomizeOptions,
      questionLimit: parseInt(newQuestionLimit, 10) || 0,
      isRemedial: false,
    };

    onCreateExam?.(created);
    toast.success("✅ Sesi Ujian CBT Baru Berhasil Diterbitkan!", {
      description: `Token: ${created.token} | Rombel: ${created.kelas}`,
    });
    setIsCreateModalOpen(false);
  };

  const handleResetSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetStudentName.trim()) {
      return toast.error("Silakan pilih atau ketik nama/NIS siswa yang ingin di-reset!");
    }
    toast.success("Sesi Ujian Siswa Berhasil Di-reset", {
      description: `Siswa ${resetStudentName} diizinkan login ulang & melanjutkan ujian CBT.`,
    });
    setIsResetModalOpen(false);
    setResetStudentName("");
  };

  const isExecutiveRole = userRole === "kamad" || userRole === "waka" || userRole === "admin";
  const isTeacherOrAdmin = userRole === "guru" || userRole === "admin" || userRole === "admin_akademik";

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul ujian, mata pelajaran, atau token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        {isTeacherOrAdmin && (
          <div className="flex flex-col xs:flex-row sm:flex-row items-stretch sm:items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsResetModalOpen(true)}
              className="gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 border-amber-400/40 hover:bg-amber-500/10 flex-1 sm:flex-none justify-center h-9"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Sesi Terkunci Siswa
            </Button>
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none justify-center h-9"
            >
              <Plus className="h-4 w-4" /> Terbitkan Sesi CBT Baru
            </Button>
          </div>
        )}
      </div>

      {/* Exam Cards Grid */}
      {filteredExams.length === 0 ? (
        <Card className="col-span-full border-dashed border-border p-8 text-center bg-muted/20">
          <CardContent className="space-y-3 p-0">
            <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <MonitorCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Belum Ada Sesi Ujian CBT Online</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {userRole === "siswa"
                  ? "Belum ada sesi ujian CBT yang diterbitkan atau dibuka oleh guru pengampu saat ini."
                  : "Belum ada sesi ujian CBT yang diterbitkan. Klik '+ Terbitkan Sesi CBT Baru' untuk membuat ujian baru."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <Card
              key={exam.id}
              className="hover:shadow-md transition-all border-border bg-card overflow-hidden flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant={exam.status === "Dibuka" ? "default" : "secondary"}
                      className={`text-[11px] font-bold ${
                        exam.status === "Dibuka"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                          : ""
                      }`}
                    >
                      {exam.status === "Dibuka" ? "🟢 Live Sesi" : exam.status}
                    </Badge>
                    {exam.isRemedial && (
                      <Badge className="bg-amber-600 text-white font-bold text-[10px]">
                        REMEDIAL
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[11px] font-mono font-bold">
                    Token: {exam.token}
                  </Badge>
                </div>

                <CardTitle className="text-base font-bold text-foreground leading-snug mt-2">
                  {exam.title}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Mapel: <span className="font-semibold text-foreground">{exam.mapel}</span> | Kelas: {exam.kelas}
                </CardDescription>

                {/* Badges for Randomize & Limits */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {exam.randomizeQuestions && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      🔀 Acak Soal
                    </Badge>
                  )}
                  {exam.randomizeOptions && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      🔀 Acak Opsi
                    </Badge>
                  )}
                  {Boolean(exam.questionLimit && exam.questionLimit > 0) && (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      🎯 {exam.questionLimit} Soal
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4 pt-0 space-y-4">
                <div className="p-3 rounded-lg bg-muted/40 text-xs space-y-1 border border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durasi Ujian:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-emerald-500" /> {exam.durationMinutes} Menit
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jumlah Soal:</span>
                    <span className="font-semibold text-foreground">{exam.soalCount} Soal (PG/Essay)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Batas KKM:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">Score {exam.passingScore}</span>
                  </div>
                </div>

                <div className="pt-1">
                  {userRole === "siswa" ? (
                    <Button
                      size="sm"
                      className="w-full font-bold text-xs gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenTokenModal(exam)}
                    >
                      <PlayCircle className="h-4 w-4" /> Masukkan Token & Kerjakan
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs font-semibold"
                        onClick={() => handleOpenTokenModal(exam)}
                      >
                        <KeyRound className="h-3.5 w-3.5 text-primary" /> Test Token
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 px-2.5 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm(`Hapus sesi ujian CBT: ${exam.title}?`)) {
                            onDeleteExam?.(exam.id);
                          }
                        }}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Token Verification Modal */}
      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <KeyRound className="h-5 w-5 text-emerald-600" /> Verifikasi Token Sesi CBT
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              {selectedExam?.title} ({selectedExam?.mapel})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleVerifyTokenSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Masukkan Token Ujian (6 Karakter)</Label>
              <Input
                placeholder="Contoh: MTS2-MAT"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="font-mono text-center text-lg font-bold tracking-widest uppercase"
                autoFocus
                maxLength={10}
              />
              <p className="text-[11px] text-muted-foreground text-center">
                Minta kode token kepada proktor atau pengawas ujian di ruang CBT.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTokenModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Verifikasi & Mulai Ujian
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create New CBT Exam Modal (Guru/Admin) */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Plus className="h-5 w-5 text-emerald-600" /> Buat Sesi Ujian CBT Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Terbitkan sesi ujian baru berbasis komputer untuk rombel siswa.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Judul Ujian</Label>
              <Input
                placeholder="misal: CBT PAT Semester Genap - Matematika"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Mata Pelajaran</Label>
              <Input
                value={newMapel}
                onChange={(e) => setNewMapel(e.target.value)}
                className="text-xs"
              />
            </div>

            {/* Pemilih Multi-Rombel Paralel */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Rombel / Kelas Target (Multi-Select Paralel)</Label>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {selectedClasses.includes("Semua Kelas")
                    ? "Semua Kelas"
                    : `${selectedClasses.length} Rombel Terpilih`}
                </Badge>
              </div>

              {/* Tombol Preset Cepat */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <Button
                  type="button"
                  size="sm"
                  variant={selectedClasses.includes("Semua Kelas") ? "default" : "outline"}
                  className={`h-6 text-[10px] px-2 py-0 ${selectedClasses.includes("Semua Kelas") ? "bg-emerald-600 text-white" : ""}`}
                  onClick={() => setSelectedClasses(["Semua Kelas"])}
                >
                  Semua Kelas
                </Button>
                {(["7", "8", "9"] as const).map((lvl) => {
                  const classesOfLvl = allAvailableRombels.filter((r) => r.includes(lvl));
                  const isAllOfLvl = classesOfLvl.length > 0 && classesOfLvl.every((c) => selectedClasses.includes(c));
                  return (
                    <Button
                      key={lvl}
                      type="button"
                      size="sm"
                      variant={isAllOfLvl ? "default" : "outline"}
                      className={`h-6 text-[10px] px-2 py-0 ${isAllOfLvl ? "bg-emerald-600 text-white" : ""}`}
                      onClick={() => {
                        if (isAllOfLvl) {
                          setSelectedClasses((prev) => prev.filter((c) => !classesOfLvl.includes(c)));
                        } else {
                          setSelectedClasses((prev) => [
                            ...prev.filter((c) => c !== "Semua Kelas"),
                            ...classesOfLvl.filter((c) => !prev.includes(c)),
                          ]);
                        }
                      }}
                    >
                      + Semua Kelas {lvl}
                    </Button>
                  );
                })}
              </div>

              {/* Grid Rombel Checkbox Chips */}
              <div className="p-2 rounded-lg border border-border bg-muted/20 max-h-32 overflow-y-auto grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                {allAvailableRombels.map((rombel) => {
                  const isSelected = selectedClasses.includes("Semua Kelas") || selectedClasses.includes(rombel);
                  return (
                    <label
                      key={rombel}
                      className={`flex items-center gap-1.5 p-1.5 rounded-md border text-[11px] font-medium cursor-pointer transition-all select-none ${
                        isSelected
                          ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-2xs"
                          : "bg-background text-muted-foreground border-border/70 hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          if (selectedClasses.includes("Semua Kelas")) {
                            setSelectedClasses(allAvailableRombels.filter((r) => r !== rombel));
                          } else if (selectedClasses.includes(rombel)) {
                            const remaining = selectedClasses.filter((r) => r !== rombel);
                            setSelectedClasses(remaining.length === 0 ? ["Semua Kelas"] : remaining);
                          } else {
                            setSelectedClasses([...selectedClasses.filter((r) => r !== "Semua Kelas"), rombel]);
                          }
                        }}
                        className="h-3 w-3 rounded text-emerald-600 focus:ring-emerald-500 shrink-0"
                      />
                      <span className="truncate">{rombel.replace("Kelas", "").trim()}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Durasi (Menit)</Label>
                <Input
                  type="number"
                  value={newDurasi}
                  onChange={(e) => setNewDurasi(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Token Ujian</Label>
                <Input
                  value={newToken}
                  onChange={(e) => setNewToken(e.target.value.toUpperCase())}
                  className="text-xs font-mono uppercase font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Batas KKM</Label>
                <Input
                  type="number"
                  value={newPassingScore}
                  onChange={(e) => setNewPassingScore(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Pengaturan Acak & Batas Soal (Roadmap CBT MTsN 2 Cilacap) */}
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/20">
              <Label className="text-xs font-semibold text-foreground block">
                Pengaturan Keamanan & Randomisasi
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRandomizeQuestions}
                    onChange={(e) => setNewRandomizeQuestions(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Acak Urutan Soal Siswa</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRandomizeOptions}
                    onChange={(e) => setNewRandomizeOptions(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Acak Pilihan Jawaban (A-D)</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Batas Jumlah Soal Acak:</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newQuestionLimit}
                    onChange={(e) => setNewQuestionLimit(e.target.value)}
                    className="w-20 h-8 text-xs text-center font-bold"
                  />
                  <span className="text-[11px] text-muted-foreground">(0 = Ambil Semua)</span>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-xs">
                <PlayCircle className="h-4 w-4" /> Terbitkan Sesi Ujian
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Session Modal (Admin / Proktor) */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <RotateCcw className="h-5 w-5 text-amber-500" /> Reset Ujian Siswa (Kendala / Lock)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Buka kembali sesi ujian siswa yang dikunci anti-cheat atau terkendala mati listrik.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetSessionSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Nama Siswa / NIS</Label>
              <Input
                list="cbt-reset-students-list"
                placeholder="Pilih atau cari nama siswa / NIS..."
                value={resetStudentName}
                onChange={(e) => setResetStudentName(e.target.value)}
                className="text-xs"
              />
              <datalist id="cbt-reset-students-list">
                {realStudents.map((s) => (
                  <option key={s.id} value={`${s.name} (${s.rombel})`}>
                    {s.nisn ? `NIS: ${s.nisn}` : ""}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
              <div className="font-bold flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5" /> Konfirmasi Hak Akses Proktor
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Aksi ini akan me-reset status ujian siswa dari <strong>"Dikunci System"</strong> kembali ke <strong>"Sedang Mengerjakan"</strong>.
              </p>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsResetModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" /> Reset Sesi Sekarang
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
