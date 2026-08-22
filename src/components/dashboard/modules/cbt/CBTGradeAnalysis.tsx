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
  BarChart3,
  Search,
  Download,
  Zap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Users,
  Award,
  BookOpen,
  Send,
  FileSpreadsheet,
  UserCheck,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { CBTGradeAnalysisItem } from "@/types/cbt";

interface CBTGradeAnalysisProps {
  grades: CBTGradeAnalysisItem[];
  userRole?: string;
  studentName?: string;
  onSendRemedial?: (studentId: string, studentName: string) => void;
  onSendEnrichment?: (studentId: string, studentName: string) => void;
}

export const CBTGradeAnalysis: React.FC<CBTGradeAnalysisProps> = ({
  grades,
  userRole = "guru",
  studentName = "ALIYA QIARA ABDULLAH",
  onSendRemedial,
  onSendEnrichment,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedStudent, setSelectedStudent] = useState<CBTGradeAnalysisItem | null>(null);
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);
  const [isEnrichmentModalOpen, setIsEnrichmentModalOpen] = useState(false);

  // Remedial & Enrichment Form State
  const [remedialNote, setRemedialNote] = useState("Kerjakan Ujian Susulan / LKPD Remedial Bab 1");
  const [enrichmentNote, setEnrichmentNote] = useState("Materi Tantangan Soal HOTS & Modul Pengayaan");

  const isSiswa = userRole === "siswa";
  const isWaliKelas = userRole === "walikelas" || userRole === "wali_kelas";
  const isGuru = userRole === "guru";
  const isExecutive = userRole === "kamad" || userRole === "waka" || userRole === "admin" || userRole === "admin_akademik";

  // Filter Grades by Role Scope
  const filteredGrades = grades.filter((g) => {
    // Siswa only sees their own grade
    if (isSiswa) {
      return g.name.toLowerCase().includes(studentName.toLowerCase()) || g.name === "ALIYA QIARA ABDULLAH";
    }

    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.classRombel.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || g.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalStudents = grades.length;
  const passedStudents = grades.filter((g) => g.status === "Lulus KKM").length;
  const remedialStudents = grades.filter((g) => g.status === "Remedial").length;
  const passPercentage = totalStudents > 0 ? Math.round((passedStudents / totalStudents) * 100) : 0;
  const avgScore =
    totalStudents > 0
      ? Math.round(grades.reduce((acc, curr) => acc + curr.totalScore, 0) / totalStudents)
      : 0;

  const handleOpenRemedialModal = (item: CBTGradeAnalysisItem) => {
    setSelectedStudent(item);
    setIsRemedialModalOpen(true);
  };

  const handleOpenEnrichmentModal = (item: CBTGradeAnalysisItem) => {
    setSelectedStudent(item);
    setIsEnrichmentModalOpen(true);
  };

  const handleSendRemedialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    onSendRemedial?.(selectedStudent.id, selectedStudent.name);
    toast.success("⚡ Ujian Remedial Berhasil Dikirim!", {
      description: `Tugas/Sesi Perbaikan telah dikirim ke akun siswa: ${selectedStudent.name}`,
    });
    setIsRemedialModalOpen(false);
  };

  const handleSendEnrichmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    onSendEnrichment?.(selectedStudent.id, selectedStudent.name);
    toast.success("🌟 Modul Pengayaan HOTS Berhasil Dikirim!", {
      description: `Materi Pengayaan telah dikirim ke akun siswa: ${selectedStudent.name}`,
    });
    setIsEnrichmentModalOpen(false);
  };

  // Siswa View Layout (Personal Result Card)
  if (isSiswa) {
    const myGrade = filteredGrades[0] || grades[0];
    const isPassed = myGrade?.status === "Lulus KKM";

    return (
      <div className="space-y-6">
        <Card className="border-border bg-card overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">Transkrip Nilai CBT Saya</CardTitle>
                  <CardDescription className="text-xs">
                    Siswa: <span className="font-semibold text-foreground">{studentName}</span> | Kelas: VIII A
                  </CardDescription>
                </div>
              </div>

              <Badge
                variant={isPassed ? "default" : "destructive"}
                className={`text-xs font-bold px-3 py-1 ${
                  isPassed
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                    : "bg-amber-500/10 text-amber-600 border-amber-300"
                }`}
              >
                {isPassed ? "✓ LULUS KKM (≥75)" : "⚠ PERLU REMEDIAL (<75)"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground font-semibold">Skor Pilihan Ganda (PG)</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{myGrade?.pgScore || 85}</h3>
              </div>

              <div className="p-4 rounded-xl bg-muted/40 border border-border">
                <p className="text-xs text-muted-foreground font-semibold">Skor Koreksi Essay</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{myGrade?.essayScore || 10}</h3>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-xs text-muted-foreground font-semibold">Total Nilai Akhir CBT</p>
                <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  {myGrade?.totalScore || 95} / 100
                </h3>
              </div>
            </div>

            {/* Action Notice for Remedial or Enrichment */}
            <div
              className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                isPassed
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300"
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 text-sm">
                {isPassed ? <Sparkles className="h-4 w-4 text-emerald-600" /> : <Zap className="h-4 w-4 text-amber-500" />}
                {isPassed ? "🌟 Selamat! Anda Lulus KKM (75)" : "⚡ Tindak Lanjut Program Remedial"}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isPassed
                  ? "Capaian evaluasi Anda memenuhi batas KKM. Silakan akses Modul Pengayaan HOTS untuk pendalaman materi."
                  : "Nilai Anda di bawah KKM 75. Guru pengampu telah menugaskan Ujian Remedial / LKPD Perbaikan untuk menuntaskan nilai."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards for Teachers & Executives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Peserta CBT</p>
              <h3 className="text-2xl font-bold text-foreground mt-0.5">{totalStudents} Siswa</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Persentase Lulus KKM (≥75)</p>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {passPercentage}% ({passedStudents} Siswa)
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Siswa Perlu Remedial (&lt;75)</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {remedialStudents} Siswa
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Zap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Rata-Rata Nilai Rombel</p>
              <h3 className="text-2xl font-bold text-primary mt-0.5">{avgScore} / 100</h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
              <BarChart3 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Action Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-2 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama siswa, NIS, atau rombel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-input bg-background text-xs font-semibold focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Lulus KKM">Lulus KKM (≥75)</option>
            <option value="Remedial">Remedial (&lt;75)</option>
          </select>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => toast.success("📊 File Rekap Nilai CBT (.xlsx) Berhasil Diunduh!")}
          className="gap-1.5 font-bold text-xs border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <FileSpreadsheet className="h-4 w-4" /> Export Excel Nilai CBT
        </Button>
      </div>

      {/* Grade Table Card */}
      <Card className="border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground font-semibold uppercase tracking-wider border-b border-border">
              <tr>
                <th className="p-3 pl-4">Siswa</th>
                <th className="p-3">NIS</th>
                <th className="p-3">Rombel</th>
                <th className="p-3 text-center">Skor PG</th>
                <th className="p-3 text-center">Skor Essay</th>
                <th className="p-3 text-center">Total Nilai</th>
                <th className="p-3">Status KKM (75)</th>
                <th className="p-3 text-right pr-4">Tindak Lanjut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredGrades.map((g) => {
                const isPassed = g.status === "Lulus KKM";
                return (
                  <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 pl-4 font-bold text-foreground">{g.name}</td>
                    <td className="p-3 text-muted-foreground font-mono">{g.nis}</td>
                    <td className="p-3 font-medium">{g.classRombel}</td>
                    <td className="p-3 text-center font-semibold">{g.pgScore}</td>
                    <td className="p-3 text-center font-semibold">{g.essayScore}</td>
                    <td className="p-3 text-center">
                      <span className="font-extrabold text-sm text-foreground">{g.totalScore}</span>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant={isPassed ? "default" : "destructive"}
                        className={`text-[11px] font-bold ${
                          isPassed
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-800"
                            : "bg-amber-500/10 text-amber-600 border-amber-300 dark:border-amber-800"
                        }`}
                      >
                        {isPassed ? "✓ Lulus KKM" : "⚠ Remedial"}
                      </Badge>
                    </td>
                    <td className="p-3 text-right pr-4">
                      {isPassed ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEnrichmentModal(g)}
                          disabled={!isGuru && !isExecutive}
                          className="gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-500/10 h-7 px-2.5"
                        >
                          <Sparkles className="h-3 w-3" /> Kirim Pengayaan
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenRemedialModal(g)}
                          disabled={!isGuru && !isExecutive}
                          className="gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 border-amber-300 hover:bg-amber-500/10 h-7 px-2.5"
                        >
                          <Zap className="h-3 w-3 text-amber-500" /> Kirim Remedial
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Remedial Modal */}
      <Dialog open={isRemedialModalOpen} onOpenChange={setIsRemedialModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Zap className="h-5 w-5 text-amber-500" /> Penugasan Remedial CBT
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Kirimkan ujian susulan / tugas remedial untuk siswa:{" "}
              <span className="font-bold text-foreground">{selectedStudent?.name}</span> (Nilai: {selectedStudent?.totalScore})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendRemedialSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Instruksi & Materi Remedial</Label>
              <textarea
                rows={3}
                value={remedialNote}
                onChange={(e) => setRemedialNote(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background text-xs focus:outline-none"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRemedialModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" /> Kirim Remedial Ke Siswa
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Enrichment Modal */}
      <Dialog open={isEnrichmentModalOpen} onOpenChange={setIsEnrichmentModalOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Sparkles className="h-5 w-5 text-emerald-600" /> Penugasan Modul Pengayaan (HOTS)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Berikan materi tantangan pengayaan untuk siswa tuntas KKM:{" "}
              <span className="font-bold text-foreground">{selectedStudent?.name}</span> (Nilai: {selectedStudent?.totalScore})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendEnrichmentSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Instruksi & Materi Pengayaan</Label>
              <textarea
                rows={3}
                value={enrichmentNote}
                onChange={(e) => setEnrichmentNote(e.target.value)}
                className="w-full p-3 rounded-lg border border-input bg-background text-xs focus:outline-none"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEnrichmentModalOpen(false)} className="text-xs">
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" /> Kirim Modul Pengayaan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
