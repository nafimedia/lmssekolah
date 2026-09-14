import { useState, useEffect } from "react";
import { UserCheck, CheckCircle2, AlertCircle, Clock, Save, MessageSquare, Inbox, Loader2 } from "lucide-react";
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
    const toastId = toast.loading(`⏳ Menyimpan presensi ${students.length} siswa ${activeRombel}...`);

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
        toast.success(`✅ Rekap Presensi KBM ${activeRombel} (${activeMapel}) berhasil disimpan!`, {
          id: toastId,
          description: `${students.length} Siswa Terproses (Hadir: ${countHadir}, Sakit: ${countSakit}, Izin: ${countIzin}, Alpa: ${countAlpa})`,
        });
      } else {
        toast.error(`❌ Gagal menyimpan presensi. Silakan periksa koneksi server.`, {
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
    <Card className="border-border shadow-xs bg-card overflow-hidden">
      {/* Header Bersih & Ringkas (Clean UI Mobile-First) */}
      <div className="p-3 sm:p-4 border-b border-border flex items-center justify-between gap-2 bg-muted/15">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold truncate text-foreground">
              Presensi KBM {activeRombel}
            </h3>
            <p className="text-[10px] text-muted-foreground truncate hidden sm:block">
              {activeMapel} · {students.length} Siswa Terdaftar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-2.5 text-xs font-semibold gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
            onClick={handleAllHadir}
            disabled={students.length === 0 || isSaving}
            title="Setel semua siswa menjadi Hadir"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Set Semua Hadir</span>
            <span className="sm:hidden">Semua Hadir</span>
          </Button>

          <Button
            size="sm"
            className="h-8 px-2.5 text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs disabled:opacity-70"
            onClick={handleSavePresensi}
            disabled={students.length === 0 || isSaving}
          >
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isSaving ? "Menyimpan..." : "Simpan Presensi"}</span>
            <span className="sm:hidden">Simpan</span>
          </Button>
        </div>
      </div>

      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* Stat Badges Overview - Compact Single Row Strip */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 p-1.5 bg-muted/25 rounded-xl border border-border/70 text-center">
          <div className="py-1 px-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">HADIR</span>
            <span className="text-sm sm:text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{countHadir}</span>
          </div>
          <div className="py-1 px-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-300 block">SAKIT</span>
            <span className="text-sm sm:text-lg font-extrabold font-mono text-amber-600 dark:text-amber-400">{countSakit}</span>
          </div>
          <div className="py-1 px-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <span className="text-[9px] sm:text-[10px] font-bold text-blue-700 dark:text-blue-300 block">IZIN</span>
            <span className="text-sm sm:text-lg font-extrabold font-mono text-blue-600 dark:text-blue-400">{countIzin}</span>
          </div>
          <div className="py-1 px-1 rounded-lg bg-rose-500/10 border border-rose-500/20">
            <span className="text-[9px] sm:text-[10px] font-bold text-rose-700 dark:text-rose-300 block">ALPA</span>
            <span className="text-sm sm:text-lg font-extrabold font-mono text-rose-600 dark:text-rose-400">{countAlpa}</span>
          </div>
        </div>

        {/* Student Attendance Content */}
        {isLoading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Memuat data presensi siswa {activeRombel}...</div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground space-y-2">
            <Inbox className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <div className="font-semibold text-foreground text-sm">Belum Ada Siswa Terdaftar pada {activeRombel}</div>
            <p>Belum ada data siswa yang terdaftar untuk kelas / rombel ini.</p>
          </div>
        ) : (
          <>
            {/* Tampilan Mobile: Quick-Tap Cards Ramah Layar Ponsel */}
            <div className="block md:hidden space-y-2">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="p-2.5 rounded-xl border border-border bg-card space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground w-4 shrink-0">
                          {index + 1}.
                        </span>
                        <h5 className="font-bold text-xs text-foreground truncate">{student.name}</h5>
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono pl-5.5">{student.nis}</p>
                    </div>

                    <Badge
                      className={`text-[9px] font-bold uppercase shrink-0 px-2 py-0.5 ${
                        student.status === "HADIR"
                          ? "bg-emerald-600 text-white"
                          : student.status === "SAKIT"
                          ? "bg-amber-600 text-white"
                          : student.status === "IZIN"
                          ? "bg-blue-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}
                    >
                      {student.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 pt-1 border-t border-border/50">
                    {(["HADIR", "SAKIT", "IZIN", "ALPA"] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleSetStatus(student.id, st)}
                        className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all text-center ${
                          student.status === st
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
                        {st === "HADIR" ? "Hadir" : st === "SAKIT" ? "Sakit" : st === "IZIN" ? "Izin" : "Alpa"}
                      </button>
                    ))}
                  </div>

                  {student.status !== "HADIR" && (
                    <Input
                      placeholder="Catatan / keterangan tidak hadir..."
                      value={student.notes || ""}
                      onChange={(e) => handleSetNotes(student.id, e.target.value)}
                      className="h-7 text-[11px] bg-muted/30 mt-1"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Tampilan Desktop: Tabel Lengkap */}
            <div className="hidden md:block overflow-x-auto border border-border rounded-xl shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
                    <th className="py-2.5 px-3 w-10 text-center">No</th>
                    <th className="py-2.5 px-3 w-28">NIS</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
                    <th className="py-2.5 px-3 min-w-[180px]">Keterangan / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {students.map((student, index) => (
                    <tr key={student.id} className="hover:bg-muted/30 transition">
                      <td className="py-2.5 px-3 text-center font-mono font-medium">{index + 1}</td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-muted-foreground">{student.nis}</td>
                      <td className="py-2.5 px-3 font-bold text-foreground">{student.name}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {(["HADIR", "SAKIT", "IZIN", "ALPA"] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleSetStatus(student.id, st)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                                student.status === st
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
                      <td className="py-2.5 px-3">
                        <Input
                          placeholder="Catatan / keterangan..."
                          value={student.notes || ""}
                          onChange={(e) => handleSetNotes(student.id, e.target.value)}
                          className="h-7 text-xs bg-background"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
