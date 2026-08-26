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
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Eye,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { CBTExam } from "@/types/cbt";

import { MysqlAuthService } from "@/services/mysqlAuthService";
import { isSameClass, normalizeRombelName } from "@/utils/classNormalization";

interface CBTLiveSessionProps {
  exams: CBTExam[];
  userRole?: string;
  onStartExam: (exam: CBTExam) => void;
  onCreateExam?: (newExam: Partial<CBTExam>) => void;
}

export const CBTLiveSession: React.FC<CBTLiveSessionProps> = ({
  exams,
  userRole = "siswa",
  onStartExam,
  onCreateExam,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState<CBTExam | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [inputToken, setInputToken] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStudentName, setResetStudentName] = useState("Ahmad Dani Prasetya");

  // New Exam Form State
  const [newTitle, setNewTitle] = useState("");
  const [newMapel, setNewMapel] = useState("Matematika");
  const [newKelas, setNewKelas] = useState("VIII A");
  const [newDurasi, setNewDurasi] = useState("60");
  const [newToken, setNewToken] = useState("MTS2-NEW");
  const [newPassingScore, setNewPassingScore] = useState("75");

  const isWaliKelas = userRole === "walikelas" || userRole === "wali_kelas";
  const me = MysqlAuthService.getActiveUser();
  const rawClass = me?.class_name || "Rombel 8A";
  const binaanRombel = normalizeRombelName(rawClass);

  const filteredExams = exams.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.token.toLowerCase().includes(searchTerm.toLowerCase());

    if (isWaliKelas) {
      const examClass = normalizeRombelName(e.kelas || "");
      const isClassMatch = isSameClass(examClass, binaanRombel) || examClass.toLowerCase().includes(binaanRombel.toLowerCase().replace("rombel", "").trim());
      return matchesSearch && isClassMatch;
    }

    if (userRole === "siswa") {
      return matchesSearch && (e.status === "Dibuka" || e.status === "Terjadwal");
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

    const created: Partial<CBTExam> = {
      id: String(Date.now()),
      title: newTitle,
      mapel: newMapel,
      kelas: newKelas,
      token: newToken.toUpperCase(),
      durationMinutes: parseInt(newDurasi, 10) || 60,
      passingScore: parseInt(newPassingScore, 10) || 75,
      soalCount: 20,
      status: "Dibuka",
    };

    onCreateExam?.(created);
    toast.success("✅ Sesi Ujian CBT Baru Berhasil Diterbitkan!", {
      description: `Token Resmi: ${created.token} (${created.kelas})`,
    });
    setIsCreateModalOpen(false);
  };

  const handleResetSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("🔄 Sesi Ujian Siswa Berhasil Direset!", {
      description: `Akun ${resetStudentName} diizinkan login ulang & melanjutkan ujian CBT.`,
    });
    setIsResetModalOpen(false);
  };

  const isExecutiveRole = userRole === "kamad" || userRole === "waka" || userRole === "admin";
  const isTeacherOrAdmin = userRole === "guru" || userRole === "admin" || userRole === "admin_akademik";

  return (
    <div className="space-y-6">
      {/* RBAC Role Scope Notification Banner */}
      <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold text-foreground">
            Akses Hak Peran (RBAC):{" "}
            <span className="font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
              {userRole === "siswa"
                ? "Siswa (Peserta CBT)"
                : userRole === "guru"
                  ? "Guru Pengampu (Proktor & Pembuat Sesi)"
                  : userRole === "walikelas" || userRole === "wali_kelas"
                    ? "Wali Kelas (Monitoring Rombel Binaan)"
                    : userRole === "kamad"
                      ? "Kepala Madrasah (Executive Monitoring)"
                      : userRole === "waka"
                        ? "Waka Kurikulum (Audit & Proktor)"
                        : "Super Admin (Full Access)"}
            </span>
          </span>
        </div>

        {/* {isWaliKelas && (
          <Badge variant="outline" className="bg-emerald-600/10 text-emerald-600 border border-emerald-500/30 px-3 py-1 font-bold text-xs gap-1">
            <Lock className="h-3.5 w-3.5" /> 🔒 Terkunci Rombel Binaan: {binaanRombel}
          </Badge>
        )} */}

        {isTeacherOrAdmin && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsResetModalOpen(true)}
            className="gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 border-amber-400/40 hover:bg-amber-500/10 h-7"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Sesi Terkunci Siswa
          </Button>
        )}
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari judul ujian, mata pelajaran, atau token..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {isTeacherOrAdmin && (
          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="gap-1.5 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" /> Terbitkan Sesi CBT Baru
          </Button>
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
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant={exam.status === "Dibuka" ? "default" : "secondary"}
                    className={`text-[11px] font-bold ${exam.status === "Dibuka"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                      : ""
                      }`}
                  >
                    {exam.status === "Dibuka" ? "🟢 Live Sesi" : exam.status}
                  </Badge>
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
                        className="flex-1 font-bold text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => toast.info(`Memantau Proctor Live CBT: ${exam.title}`)}
                      >
                        <Users className="h-3.5 w-3.5" /> Proctor Live
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Mata Pelajaran</Label>
                <Input
                  value={newMapel}
                  onChange={(e) => setNewMapel(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold">Rombel / Kelas Target</Label>
                <Input
                  value={newKelas}
                  onChange={(e) => setNewKelas(e.target.value)}
                  className="text-xs"
                />
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

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                <Sparkles className="h-4 w-4" /> Terbitkan Sesi Ujian
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
                value={resetStudentName}
                onChange={(e) => setResetStudentName(e.target.value)}
                className="text-xs"
              />
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
