import { useState, useMemo } from "react";
import { Award, Download, FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { getTeacherAssignedSubjects, getTeacherAssignedClasses, ALL_SCHOOL_SUBJECTS } from "@/services/teacherSubjectAccess";
import { exportToExcelXml } from "@/utils/excelExporter";
import { toast } from "sonner";

export function RaporModule({ activeRole }: { activeRole?: string }) {
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin";
  const isGuru = activeRole === "guru";

  const [selectedClassModal, setSelectedClassModal] = useState<any>(null);
  const [selectedEntryModal, setSelectedEntryModal] = useState<any>(null);

  const [isPrintRaporOpen, setIsPrintRaporOpen] = useState(false);
  const [raporStudentName, setRaporStudentName] = useState("ALIYA QIARA ABDULLAH");
  const [raporNisn, setRaporNisn] = useState("12123301000288");
  const [raporClass, setRaporClass] = useState("8A (VIII A)");

  const handlePrintRapor = () => {
    window.print();
    toast.success(`🖨️ Cetak E-Rapor Kurikulum Merdeka (${raporStudentName}) berhasil diproses!`);
  };

  const mapelDetails = [
    { code: "AGM-01", mapel: "Al Qur'an Hadis", teacher: "AH. SYARIF HIDAYAH, S.Pd.I", pertemuan: "18/18 Pertemuan (100%)", cp: "95% Tuntas", tugas: 90, kuis: 92, cbt: 88, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "AGM-02", mapel: "Akidah Akhlak", teacher: "WAKHIBUN, S.P", pertemuan: "16/18 Pertemuan (88%)", cp: "90% Tuntas", tugas: 88, kuis: 86, cbt: 85, avg: 86, kkm: "Tuntas (≥75)" },
    { code: "AGM-03", mapel: "Fikih", teacher: "CARYATI,", pertemuan: "17/18 Pertemuan (94%)", cp: "92% Tuntas", tugas: 92, kuis: 90, cbt: 89, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "AGM-04", mapel: "Sejarah Kebudayaan Islam", teacher: "H. DASIRUN, S.Ag., M.Pd.I", pertemuan: "16/18 Pertemuan (88%)", cp: "90% Tuntas", tugas: 88, kuis: 88, cbt: 86, avg: 87, kkm: "Tuntas (≥75)" },
    { code: "AGM-05", mapel: "Bahasa Arab", teacher: "ENDAH SUPRIHATIN, S.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "96% Tuntas", tugas: 92, kuis: 94, cbt: 90, avg: 92, kkm: "Tuntas (≥75)" },
    { code: "UMM-01", mapel: "Bahasa Indonesia", teacher: "SOBIYATI, S.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "94% Tuntas", tugas: 89, kuis: 91, cbt: 88, avg: 89, kkm: "Tuntas (≥75)" },
  ];

  const handleExportExcelLeger = () => {
    const headers = ["No", "Kode Mapel", "Mata Pelajaran", "Guru Pengampu", "Tugas & LKPD", "Kuis", "CBT", "Nilai Akhir", "Keterangan KKM"];
    const rows = mapelDetails.map((m, idx) => [
      idx + 1,
      m.code,
      m.mapel,
      m.teacher,
      m.tugas,
      m.kuis,
      m.cbt,
      m.avg,
      m.kkm,
    ]);
    exportToExcelXml("Leger_Nilai_E_Rapor_MTsN2_Cilacap", "Leger_Nilai", headers, rows);
    toast.success("📊 File Excel Leger Nilai E-Rapor berhasil diunduh!");
  };

  const activeUserForEntry = MysqlAuthService.getActiveUser();
  const assignedSubjectsForEntry = useMemo(() => getTeacherAssignedSubjects(activeUserForEntry) || ALL_SCHOOL_SUBJECTS, [activeUserForEntry]);
  const assignedClassesForEntry = useMemo(() => getTeacherAssignedClasses(activeUserForEntry), [activeUserForEntry]);

  const teacherEntryList = useMemo(() => {
    const list: Array<{ code: string; mapel: string; rombel: string; totalSiswa: number; entered: number; progress: number; status: string; c: string }> = [];
    assignedSubjectsForEntry.forEach((subject) => {
      assignedClassesForEntry.forEach((cls) => {
        list.push({
          code: "MP-" + subject.substring(0, 3).toUpperCase(),
          mapel: subject,
          rombel: cls,
          totalSiswa: 32,
          entered: 32,
          progress: 100,
          status: "Lengkap 100%",
          c: "text-emerald-500",
        });
      });
    });
    return list;
  }, [assignedSubjectsForEntry, assignedClassesForEntry]);

  const classesList = [
    { name: "Kelas VII A", wali: "MISBAH AHMAD DANI, S.Pd", siswa: 32, avg: 86.4, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas VII B", wali: "ENDAH SUPRIHATIN, S.Pd", siswa: 32, avg: 85.8, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas VIII A", wali: "Dra. Hj. Siti Rahmah, M.Pd", siswa: 32, avg: 88.2, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas VIII B", wali: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", siswa: 32, avg: 87.4, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas IX A", wali: "SOBIYATI, S.Pd", siswa: 32, avg: 89.1, icon: "🎓", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas IX B", wali: "SAYONO, S.Pd., M.Pd.", siswa: 32, avg: 88.5, icon: "🎓", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" /> Transkrip & E-Rapor Kurikulum Merdeka
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekapitulasi Penilaian Formatif, Sumatif, Asesmen CBT, & Cetak Lembar E-Rapor Resmi MTsN 2 Cilacap.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10" onClick={handleExportExcelLeger}>
            <Download className="h-3.5 w-3.5 mr-1 text-emerald-500" /> 📊 Export Leger Excel (.xls)
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsPrintRaporOpen(true)}>
            <Download className="h-3.5 w-3.5 mr-1" /> 🖨️ Cetak E-Rapor PDF
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-xs mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Daftar Transkrip Nilai Akademik</span>
            <Badge className="bg-emerald-600 text-white text-xs">Status: Tuntas 100%</Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Rincian akumulasi nilai per mata pelajaran Kurikulum Merdeka MTsN 2 Cilacap.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted text-muted-foreground font-bold text-left">
              <tr>
                <th className="p-3">Kode</th>
                <th className="p-3">Mata Pelajaran</th>
                <th className="p-3">Guru Pengampu</th>
                <th className="p-3 text-center">Tugas (30%)</th>
                <th className="p-3 text-center">Kuis (30%)</th>
                <th className="p-3 text-center">CBT (40%)</th>
                <th className="p-3 text-center font-extrabold text-foreground">Nilai Rapor</th>
                <th className="p-3 text-right">KKM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mapelDetails.map((m, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition">
                  <td className="p-3 font-mono font-bold text-muted-foreground">{m.code}</td>
                  <td className="p-3 font-bold text-foreground">{m.mapel}</td>
                  <td className="p-3 text-muted-foreground">{m.teacher}</td>
                  <td className="p-3 text-center font-mono">{m.tugas}</td>
                  <td className="p-3 text-center font-mono">{m.kuis}</td>
                  <td className="p-3 text-center font-mono">{m.cbt}</td>
                  <td className="p-3 text-center font-extrabold font-mono text-primary text-sm">{m.avg}</td>
                  <td className="p-3 text-right">
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-bold">
                      {m.kkm}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 🖨️ MODAL PRATINJAU & CETAK E-RAPOR PDF */}
      <Dialog open={isPrintRaporOpen} onOpenChange={setIsPrintRaporOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" /> Pratinjau E-Rapor Kurikulum Merdeka
              </div>
              <Badge className="bg-blue-600 text-white font-mono text-xs">{raporClass}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Format lembar Rapor Hasil Belajar Peserta Didik Resmi MTsN 2 Cilacap.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-4 mb-2">
                <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                <div className="text-center flex-1 pr-14">
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                  <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                </div>
              </div>
              <div className="mt-2 py-1 bg-blue-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs text-center">
                RAPOR HASIL BELAJAR PESERTA DIDIK (KURIKULUM MERDEKA)
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>
                <div>Nama Siswa: <strong className="text-slate-950 font-bold">{raporStudentName}</strong></div>
                <div>NISN / NIS: <span className="font-mono">{raporNisn}</span></div>
              </div>
              <div>
                <div>Kelas / Rombel: <strong>{raporClass}</strong></div>
                <div>Tahun Ajaran: <strong className="text-blue-900 font-extrabold">2026/2027 (Semester Ganjil)</strong></div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">Mata Pelajaran</th>
                    <th className="border border-slate-300 p-2 text-center">Nilai Akhir</th>
                    <th className="border border-slate-300 p-2 text-left">Capaian Pembelajaran (CP) Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {mapelDetails.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{m.mapel}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-blue-900 text-xs">{m.avg}</td>
                      <td className="border border-slate-300 p-2 text-slate-700">
                        Menunjukkan penguasaan sangat baik dalam alur {m.mapel} {m.cp}.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div className="font-bold text-slate-900">Catatan Wali Kelas:</div>
              <div className="text-slate-700 italic">
                "Ananda {raporStudentName} menunjukkan semangat belajar yang sangat tinggi dan tingkat kedisiplinan serta akhlak terpuji. Pertahankan kinerjamu."
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Orang Tua / Wali</div>
                <div className="font-bold underline text-slate-950">( .......................... )</div>
              </div>
              <div className="text-center space-y-8">
                <div>Wali Kelas {raporClass}</div>
                <div className="font-bold underline text-slate-950">Dra. Hj. Siti Rahmah, M.Pd</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">Solihun, S.Pd, M.Si.</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintRaporOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5" onClick={handlePrintRapor}>
              <Download className="h-4 w-4" /> 🖨️ Cetak E-Rapor PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
