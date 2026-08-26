import { useState, useEffect } from "react";
import { UserCheck, CheckCircle2, AlertCircle, Clock, Save, Sparkles, MessageSquare, Inbox, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { isSameClass } from "@/utils/classNormalization";

export interface StudentAttendance {
  id: string;
  nis: string;
  name: string;
  status: "HADIR" | "SAKIT" | "IZIN" | "ALPA";
  notes?: string;
}

interface PresensiTabProps {
  activeRombel: string;
  activeMapel: string;
}

export function PresensiTab({ activeRombel, activeMapel }: PresensiTabProps) {
  // Initialize strictly with empty array - NO hardcoded dummy students
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const dateToday = new Date().toISOString().split("T")[0];

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      MysqlDataService.getUsers(),
      MysqlDataService.getKbmPresensi(activeRombel, activeMapel, dateToday),
    ])
      .then(([users, kbmRows]) => {
        if (!isMounted) return;
        const siswaList = (users || []).filter((u: any) => u.role === "siswa");
        const matchedSiswa = siswaList.filter((u: any) => isSameClass(u.class_name || u.class, activeRombel));

        if (matchedSiswa.length > 0) {
          const loaded: StudentAttendance[] = matchedSiswa.map((u: any, idx: number) => {
            const nis = u.nis_nip || u.nis || "-";
            const match = kbmRows?.find(
              (r) => r.student_nis === nis || (r.student_name && r.student_name.toLowerCase() === (u.full_name || u.name).toLowerCase())
            );
            return {
              id: u.id || `s_${idx}`,
              nis: nis,
              name: u.full_name || u.name,
              status: match ? match.status : "HADIR",
              notes: match?.notes || "",
            };
          });
          setStudents(loaded);
        } else {
          // Strictly empty array when no real students exist in database for this Rombel
          setStudents([]);
        }
      })
      .catch(() => {
        if (isMounted) setStudents([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRombel, activeMapel]);

  const countHadir = students.filter((s) => s.status === "HADIR").length;
  const countSakit = students.filter((s) => s.status === "SAKIT").length;
  const countIzin = students.filter((s) => s.status === "IZIN").length;
  const countAlpa = students.filter((s) => s.status === "ALPA").length;

  const handleSetStatus = (id: string, status: "HADIR" | "SAKIT" | "IZIN" | "ALPA") => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  const handleSetNotes = (id: string, notes: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, notes } : s)));
  };

  const handleAllHadir = () => {
    if (students.length === 0) return;
    setStudents((prev) => prev.map((s) => ({ ...s, status: "HADIR" })));
    toast.success("✨ Seluruh siswa berhasil diset HADIR!");
  };

  const handleSavePresensi = async () => {
    if (students.length === 0) {
      toast.error("Tidak ada siswa terdaftar pada rombel ini untuk disimpan.");
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading(`⏳ Menyimpan presensi ${students.length} siswa ${activeRombel} ke Database MySQL...`);

    try {
      const activeTeacherName = MysqlAuthService.getActiveUser()?.full_name || "GURU PENGAMPU";

      const records = students.map((s) => ({
        rombel: activeRombel,
        mapel: activeMapel,
        guru_name: activeTeacherName,
        student_nis: s.nis,
        student_name: s.name,
        status: s.status,
        notes: s.notes || "",
        date_str: dateToday,
      }));

      const success = await MysqlDataService.saveKbmPresensiBatch(activeRombel, activeMapel, dateToday, records as any);
      if (success) {
        toast.success(`✅ Rekap Presensi KBM ${activeRombel} (${activeMapel}) berhasil disimpan permanen ke Database MySQL!`, {
          id: toastId,
          description: `${students.length} Siswa Terproses (Hadir: ${countHadir}, Sakit: ${countSakit}, Izin: ${countIzin}, Alpa: ${countAlpa})`,
        });
      } else {
        toast.error(`❌ Gagal menyimpan presensi ke Database MySQL. Silakan periksa koneksi server.`, {
          id: toastId,
        });
      }
    } catch (err: any) {
      toast.error(`❌ Gagal menyimpan presensi: ${err?.message || err}`, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> Presensi Real-Time Sesi KBM ({activeRombel})
          </CardTitle>
          <CardDescription className="text-xs">
            Presensi terikat dengan jadwal KBM {activeMapel} hari ini. Tandai siswa yang tidak hadir.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
            onClick={handleAllHadir}
            disabled={students.length === 0 || isSaving}
          >
            <Sparkles className="h-3.5 w-3.5" /> Set Semua Hadir
          </Button>

          <Button
            size="sm"
            className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-70"
            onClick={handleSavePresensi}
            disabled={students.length === 0 || isSaving}
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            {isSaving ? "Menyimpan..." : "Simpan Presensi"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Stat Badges Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">HADIR</div>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{countHadir}</div>
          </div>
          <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 text-center">
            <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">SAKIT</div>
            <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">{countSakit}</div>
          </div>
          <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-center">
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">IZIN</div>
            <div className="text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">{countIzin}</div>
          </div>
          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-center">
            <div className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">ALPA</div>
            <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">{countAlpa}</div>
          </div>
        </div>

        {/* Table Student Attendance List */}
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Memuat data presensi siswa {activeRombel}...</div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
            <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <div className="font-semibold text-foreground text-sm">Belum Ada Siswa Terdaftar pada {activeRombel}</div>
            <p>Database saat ini tidak memiliki akun siswa terdaftar untuk rombel ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-xl shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 w-28">NIS</th>
                  <th className="py-3 px-4">Nama Siswa</th>
                  <th className="py-3 px-4 text-center">Status Kehadiran</th>
                  <th className="py-3 px-4 min-w-[200px]">Keterangan / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 text-center font-mono font-medium">{index + 1}</td>
                    <td className="py-3 px-4 font-mono font-semibold text-muted-foreground">{student.nis}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{student.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {(["HADIR", "SAKIT", "IZIN", "ALPA"] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleSetStatus(student.id, st)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${student.status === st
                                ? st === "HADIR"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : st === "SAKIT"
                                    ? "bg-amber-600 text-white shadow-xs"
                                    : st === "IZIN"
                                      ? "bg-blue-600 text-white shadow-xs"
                                      : "bg-rose-600 text-white shadow-xs"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Input
                        placeholder="Tuliskan catatan/keterangan..."
                        value={student.notes || ""}
                        onChange={(e) => handleSetNotes(student.id, e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
