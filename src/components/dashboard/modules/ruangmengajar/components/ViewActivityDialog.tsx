import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Users, Brain, CheckCircle2, Sparkles, Save, Check, Lock } from "lucide-react";
import { toast } from "sonner";
import { MysqlDataService } from "@/services/mysqlDataService";
import { isSubjectAllowedForUser } from "@/services/teacherSubjectAccess";

export interface ActivityDetail {
  id: string;
  title: string;
  type: "LKPD" | "TUGAS_KELOMPOK" | "QUIZ" | string;
  dueDate: string;
  status: string;
  submittedCount: number;
  totalStudents: number;
}

interface StudentGradeRow {
  id: string;
  nisn: string;
  name: string;
  status: string;
  score: string;
  feedback: string;
}

interface ViewActivityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ActivityDetail | null;
  activeRombel: string;
  activeMapel: string;
}

export function ViewActivityDialog({
  isOpen,
  onOpenChange,
  activity,
  activeRombel,
  activeMapel,
}: ViewActivityDialogProps) {
  const [grades, setGrades] = useState<StudentGradeRow[]>([]);
  const isAllowed = isSubjectAllowedForUser(activeMapel);

  useEffect(() => {
    if (!isOpen || !activity) return;

    let isMounted = true;
    Promise.all([
      MysqlDataService.getLkpdGrades(activity.id),
      MysqlDataService.getUsers(),
    ]).then(([savedGrades, users]) => {
      if (!isMounted) return;
      const siswaList = (users || []).filter((u: any) => u.role === "siswa");

      const normActive = activeRombel.toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
      const is7A = normActive.includes("VIIA") || normActive.includes("7A");
      const is7B = normActive.includes("VIIB") || normActive.includes("7B");
      const is8A = normActive.includes("VIIIA") || normActive.includes("8A");
      const is8B = normActive.includes("VIIIB") || normActive.includes("8B");
      const is9A = normActive.includes("IXA") || normActive.includes("9A");
      const is9B = normActive.includes("IXB") || normActive.includes("9B");

      const matched = siswaList.filter((u: any) => {
        const cls = (u.class_name || u.class || "").toUpperCase().replace(/\s+/g, "").replace(/-/g, "");
        if (is7A) return cls.includes("VIIA") || cls.includes("7A");
        if (is7B) return cls.includes("VIIB") || cls.includes("7B");
        if (is8A) return cls.includes("VIIIA") || cls.includes("8A");
        if (is8B) return cls.includes("VIIIB") || cls.includes("8B");
        if (is9A) return cls.includes("IXA") || cls.includes("9A");
        if (is9B) return cls.includes("IXB") || cls.includes("9B");
        return cls === normActive || cls.includes(normActive) || normActive.includes(cls);
      });

      if (matched.length > 0) {
        setGrades(
          matched.map((u: any, idx: number) => {
            const nisn = u.nis_nip || u.nis || "-";
            const match = savedGrades?.find(
              (g) => g.student_nisn === nisn || (g.student_name && g.student_name.toLowerCase() === (u.full_name || u.name).toLowerCase())
            );
            return {
              id: u.id || `g_${idx}`,
              nisn: nisn,
              name: u.full_name || u.name,
              status: match?.status || "BELUM MENGUMPULKAN",
              score: match?.score ? String(match.score) : "",
              feedback: match?.feedback || "",
            };
          })
        );
      } else {
        setGrades([]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, activeRombel, activity]);

  if (!activity) return null;

  const handleStatusChange = (id: string, status: string) => {
    if (!isAllowed) return;
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, status } : g)));
  };

  const handleScoreChange = (id: string, score: string) => {
    if (!isAllowed) return;
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, score } : g)));
  };

  const handleFeedbackChange = (id: string, feedback: string) => {
    if (!isAllowed) return;
    setGrades((prev) => prev.map((g) => (g.id === id ? { ...g, feedback } : g)));
  };

  const handleSaveGrades = async () => {
    if (!activity) return;
    if (!isAllowed) {
      return toast.error("Akses Ditolak: Anda hanya memiliki hak akses Lihat (Read-Only) pada Mata Pelajaran ini.");
    }
    const dbGrades = grades.map((g) => ({
      activity_id: activity.id,
      student_id: g.id,
      student_nisn: g.nisn,
      student_name: g.name,
      status: g.status,
      score: g.score,
      feedback: g.feedback,
    }));

    await MysqlDataService.saveLkpdGradesBatch(activity.id, dbGrades);
    toast.success(`✅ Nilai LKPD "${activity.title}" berhasil disimpan ke Database MySQL & tersinkronisasi ke Penilaian Kelas!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-bold gap-1">
                {activity.type === "LKPD" && <FileText className="h-3 w-3 text-emerald-600" />}
                {activity.type === "TUGAS_KELOMPOK" && <Users className="h-3 w-3 text-blue-600" />}
                {activity.type === "QUIZ" && <Brain className="h-3 w-3 text-purple-600" />}
                {activity.type}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {activeMapel} · {activeRombel}
              </span>
            </div>

            {!isAllowed && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[10px] gap-1">
                <Lock className="h-3 w-3" /> 🔒 Hanya Dibaca (Bukan Pengampu Mapel)
              </Badge>
            )}
          </div>

          <DialogTitle className="text-lg font-extrabold">{activity.title}</DialogTitle>
          <DialogDescription className="text-xs">
            Batas Waktu: {activity.dueDate} · Progres Pengumpulan: {grades.filter((g) => g.status === "TERKUMPUL").length}/{grades.length || activity.totalStudents} Siswa
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Lembar Kerja Peserta Didik Digital (LKPD Interactive)
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Instruksi Siswa: Bacalah studi kasus penerapan norma hukum pada modul Ajar Bab 1, kemudian diskusikan bersama kelompokmu 3 contoh perilaku tertib hukum di lingkungan madrasah.
            </p>
          </div>

          {/* Student Grading Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-foreground flex items-center justify-between">
              <span>Lembar Pemeriksaan & Input Nilai Siswa ({activeRombel}):</span>
              <span className="text-[11px] text-emerald-600 font-mono">
                {grades.filter((g) => g.score !== "").length}/{grades.length} Terpasang Nilai
              </span>
            </h4>

            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/60 text-left font-bold text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-2.5 px-3">NISN & Nama Siswa</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 w-28 text-center">Nilai (0-100)</th>
                    <th className="py-2.5 px-3">Catatan Umpan Balik / Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {grades.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted-foreground text-xs">
                        Belum ada data siswa terdaftar untuk <strong>{activeRombel}</strong> dalam database.
                      </td>
                    </tr>
                  ) : (
                    grades.map((g) => (
                      <tr key={g.id} className="hover:bg-muted/30 transition">
                        <td className="py-2.5 px-3 font-semibold">
                          <div className="font-bold text-foreground">{g.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{g.nisn}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <select
                            disabled={!isAllowed}
                            className={`h-7 rounded-md border text-[11px] font-bold px-2 ${
                              g.status === "TERKUMPUL"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : g.status === "DIPERIKSA"
                                ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300"
                                : "bg-muted text-muted-foreground border-border"
                            } ${!isAllowed ? "opacity-60 cursor-not-allowed" : ""}`}
                            value={g.status}
                            onChange={(e) => handleStatusChange(g.id, e.target.value)}
                          >
                            <option value="BELUM MENGUMPULKAN">BELUM MENGUMPULKAN</option>
                            <option value="TERKUMPUL">TERKUMPUL</option>
                            <option value="DIPERIKSA">DIPERIKSA</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            type="number"
                            placeholder="0-100"
                            disabled={!isAllowed}
                            value={g.score}
                            onChange={(e) => handleScoreChange(g.id, e.target.value)}
                            className={`h-7 text-xs font-mono font-bold text-center border-emerald-300 dark:border-emerald-800 ${
                              !isAllowed ? "opacity-60 cursor-not-allowed bg-muted" : ""
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <Input
                            placeholder={isAllowed ? "Tuliskan apresiasi / catatan umpan balik..." : "Pengisian umpan balik terkunci (Hanya Pengampu)"}
                            disabled={!isAllowed}
                            value={g.feedback}
                            onChange={(e) => handleFeedbackChange(g.id, e.target.value)}
                            className={`h-7 text-xs bg-background/80 border-border ${
                              !isAllowed ? "opacity-60 cursor-not-allowed bg-muted" : ""
                            }`}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <Button variant="outline" size="sm" className="text-xs font-bold" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>

          {isAllowed ? (
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
              onClick={handleSaveGrades}
            >
              <Save className="h-4 w-4" /> Simpan Nilai & Sync Ke Penilaian Kelas
            </Button>
          ) : (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs gap-1.5 py-1.5 px-3">
              <Lock className="h-3.5 w-3.5" /> Akses Edit Terkunci (Bukan Mapel Pengampu)
            </Badge>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
