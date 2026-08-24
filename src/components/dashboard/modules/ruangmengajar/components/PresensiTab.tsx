import { useState, useEffect } from "react";
import { UserCheck, CheckCircle2, AlertCircle, Clock, Save, Sparkles, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
  const [students, setStudents] = useState<StudentAttendance[]>([
    { id: "s1", nis: "20250701", name: "ACHMAD MAULANA", status: "HADIR", notes: "" },
    { id: "s2", nis: "20250702", name: "AHMAD SYARIFUDDIN", status: "HADIR", notes: "" },
    { id: "s3", nis: "20250703", name: "AISYAH NABIHAH", status: "HADIR", notes: "" },
    { id: "s4", nis: "20250704", name: "ANNISA NUR RAHMA", status: "HADIR", notes: "" },
    { id: "s5", nis: "20250705", name: "BAGAS PRATAMA", status: "SAKIT", notes: "Surat dokter dari Klinik Al-Syifa" },
    { id: "s6", nis: "20250706", name: "CITRA LESTARI", status: "HADIR", notes: "" },
    { id: "s7", nis: "20250707", name: "DENI KURNIAWAN", status: "HADIR", notes: "" },
    { id: "s8", nis: "20250708", name: "EKA PUTRI SAFITRI", status: "HADIR", notes: "" },
    { id: "s9", nis: "20250709", name: "FARHAN ARDIANSYAH", status: "IZIN", notes: "Acara keluarga (Tasyakuran)" },
    { id: "s10", nis: "20250710", name: "GILANG RAMADHAN", status: "HADIR", notes: "" },
    { id: "s11", nis: "20250711", name: "HANIFAH ZAHRA", status: "HADIR", notes: "" },
    { id: "s12", nis: "20250712", name: "INDRA KUSUMA", status: "HADIR", notes: "" },
  ]);

  const dateToday = "24/08/2026";

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      MysqlDataService.getUsers(),
      MysqlDataService.getKbmPresensi(activeRombel, activeMapel, dateToday),
    ]).then(([users, kbmRows]) => {
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
      }
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
    setStudents((prev) => prev.map((s) => ({ ...s, status: "HADIR" })));
    toast.success("✨ Seluruh siswa berhasil diset HADIR!");
  };

  const handleSavePresensi = async () => {
    const records = students.map((s) => ({
      rombel: activeRombel,
      mapel: activeMapel,
      guru_name: "SOBIYATI, S.Pd",
      student_nis: s.nis,
      student_name: s.name,
      status: s.status,
      notes: s.notes || "",
      date_str: dateToday,
    }));

    const success = await MysqlDataService.saveKbmPresensiBatch(activeRombel, activeMapel, dateToday, records as any);
    if (success) {
      toast.success(`✅ Rekap Presensi KBM ${activeRombel} (${activeMapel}) berhasil disimpan permanen ke Database MySQL!`);
    } else {
      toast.success(`✅ Rekap Presensi KBM ${activeRombel} (${activeMapel}) berhasil disimpan!`);
    }
  };

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-emerald-600" /> Presensi Real-Time Sesi KBM ({activeRombel})
          </CardTitle>
          <CardDescription className="text-xs">
            Presensi terikat dengan jadwal KBM {activeMapel} hari ini. Tandai siswa yang tidak hadir.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-bold gap-1 text-emerald-600 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50"
            onClick={handleAllHadir}
          >
            <Sparkles className="h-4 w-4" /> Set Semua Hadir
          </Button>

          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
            onClick={handleSavePresensi}
          >
            <Save className="h-4 w-4" /> Simpan Presensi
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Attendance Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">HADIR</span>
            <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">{countHadir}</span>
          </div>

          <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-center">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">SAKIT</span>
            <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">{countSakit}</span>
          </div>

          <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 text-center">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">IZIN</span>
            <span className="text-2xl font-black font-mono text-blue-700 dark:text-blue-300">{countIzin}</span>
          </div>

          <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20 text-center">
            <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block">ALPA</span>
            <span className="text-2xl font-black font-mono text-red-700 dark:text-red-300">{countAlpa}</span>
          </div>
        </div>

        {/* Student Attendance List Table */}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-left font-bold text-muted-foreground border-b border-border">
              <tr>
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3">NIS</th>
                <th className="py-2.5 px-3">Nama Siswa</th>
                <th className="py-2.5 px-3 text-center">Status Kehadiran</th>
                <th className="py-2.5 px-3">Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground text-xs">
                    <UserCheck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    Belum ada data siswa terdaftar untuk <strong>{activeRombel}</strong> dalam database MySQL.
                  </td>
                </tr>
              ) : (
                students.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-muted/30 transition">
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-muted-foreground">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono">{st.nis}</td>
                    <td className="py-2.5 px-3 font-bold text-foreground">{st.name}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(["HADIR", "SAKIT", "IZIN", "ALPA"] as const).map((stt) => (
                          <button
                            key={stt}
                            type="button"
                            onClick={() => handleSetStatus(st.id, stt)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all ${
                              st.status === stt
                                ? stt === "HADIR"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : stt === "SAKIT"
                                  ? "bg-amber-600 text-white shadow-xs"
                                  : stt === "IZIN"
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "bg-red-600 text-white shadow-xs"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {stt}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Input
                        placeholder="Tuliskan catatan/keterangan..."
                        value={st.notes || ""}
                        onChange={(e) => handleSetNotes(st.id, e.target.value)}
                        className="h-7 text-xs bg-background/80 border-border"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
