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
import { StudentHeaderBanner } from "@/components/dashboard/components/StudentHeaderBanner";
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
    { code: "AGM-01", mapel: "Al Qur'an Hadis", teacher: "AH. SYARIF HIDAYAH, S.Pd.I", pertemuan: "18/18 Pertemuan (100%)", cp: "Sangat Baik", tugas: 90, kuis: 92, cbt: 88, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "AGM-02", mapel: "Akidah Akhlak", teacher: "WAKHIBUN, S.P", pertemuan: "16/18 Pertemuan (88%)", cp: "Baik", tugas: 88, kuis: 86, cbt: 85, avg: 86, kkm: "Tuntas (≥75)" },
    { code: "AGM-03", mapel: "Fikih", teacher: "CARYATI, S.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "Sangat Baik", tugas: 92, kuis: 90, cbt: 89, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "AGM-04", mapel: "Sejarah Kebudayaan Islam", teacher: "H. DASIRUN, S.Ag., M.Pd.I", pertemuan: "16/18 Pertemuan (88%)", cp: "Baik", tugas: 88, kuis: 88, cbt: 86, avg: 87, kkm: "Tuntas (≥75)" },
    { code: "AGM-05", mapel: "Bahasa Arab", teacher: "ENDAH SUPRIHATIN, S.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "Sangat Baik", tugas: 92, kuis: 94, cbt: 90, avg: 92, kkm: "Tuntas (≥75)" },
    { code: "UMM-01", mapel: "Bahasa Indonesia", teacher: "SOBIYATI, S.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "Baik", tugas: 89, kuis: 91, cbt: 88, avg: 89, kkm: "Tuntas (≥75)" },
    { code: "UMM-02", mapel: "Bahasa Inggris", teacher: "ALI MANSUR, S.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "Baik", tugas: 88, kuis: 87, cbt: 89, avg: 88, kkm: "Tuntas (≥75)" },
    { code: "UMM-03", mapel: "Matematika", teacher: "ACHMAD MAKMUN, S.Pd.I", pertemuan: "17/18 Pertemuan (94%)", cp: "Baik", tugas: 85, kuis: 86, cbt: 84, avg: 85, kkm: "Tuntas (≥75)" },
    { code: "UMM-04", mapel: "Ilmu Pengetahuan Alam", teacher: "Dra. Hj. SITI RAHMAH, M.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "Baik", tugas: 89, kuis: 87, cbt: 88, avg: 88, kkm: "Tuntas (≥75)" },
    { code: "UMM-05", mapel: "Ilmu Pengetahuan Sosial", teacher: "UMI KHAFSOH, S.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "Sangat Baik", tugas: 92, kuis: 90, cbt: 91, avg: 91, kkm: "Tuntas (≥75)" },
    { code: "UMM-06", mapel: "Pendidikan Kewarganegaraan", teacher: "SAYONO, S.Pd.I", pertemuan: "17/18 Pertemuan (94%)", cp: "Sangat Baik", tugas: 90, kuis: 89, cbt: 91, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "UMM-07", mapel: "PJOK", teacher: "MISBAHUDIN, S.Pd.I", pertemuan: "18/18 Pertemuan (100%)", cp: "Sangat Baik", tugas: 95, kuis: 93, cbt: 94, avg: 94, kkm: "Tuntas (≥75)" },
    { code: "UMM-08", mapel: "Seni Budaya", teacher: "SITI NURJANAH, S.Pd", pertemuan: "16/18 Pertemuan (88%)", cp: "Sangat Baik", tugas: 93, kuis: 91, cbt: 92, avg: 92, kkm: "Tuntas (≥75)" },
    { code: "UMM-09", mapel: "Informatika", teacher: "FAHRUR ROZI, S.Kom", pertemuan: "18/18 Pertemuan (100%)", cp: "Sangat Baik", tugas: 94, kuis: 92, cbt: 93, avg: 93, kkm: "Tuntas (≥75)" },
    { code: "ML-01", mapel: "Bahasa Jawa", teacher: "TRI WAHYUNI, S.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "Baik", tugas: 88, kuis: 90, cbt: 89, avg: 89, kkm: "Tuntas (≥75)" },
  ];

  const getCpDescription = (mapelName: string, score: number) => {
    if (score >= 90) {
      return `Menunjukkan penguasaan sangat baik dalam pemahaman dan penerapan kompetensi dasar ${mapelName}.`;
    }
    if (score >= 80) {
      return `Menunjukkan penguasaan baik dalam aplikasi materi dan diskusi kelompok ${mapelName}.`;
    }
    if (score >= 75) {
      return `Menunjukkan penguasaan cukup dan telah mencapai ketuntasan kriteria KKTP ${mapelName}.`;
    }
    return `Perlu bimbingan lebih lanjut pada penguasaan materi utama ${mapelName}.`;
  };

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

  const renderGradeCell = (val: number | null | undefined) => {
    if (val === null || val === undefined || isNaN(val) || val === 0) {
      return <span className="text-muted-foreground font-mono italic text-xs">-</span>;
    }
    return <span className="font-mono font-bold">{val}</span>;
  };

  return (
    <>
      {activeRole === "siswa" ? (
        <StudentHeaderBanner
          title="Rekap Nilai & E-Rapor Saya"
          subtitle="Transkrip nilai tugas, kuis, CBT, dan lembar Rapor Hasil Belajar Kurikulum Merdeka"
          icon={Award}
          studentClass="Kelas VIII A"
          statusText="Status KKTP: 100% Tuntas"
          statusVariant="success"
          actionButtons={
            <Button size="sm" onClick={() => setIsPrintRaporOpen(true)} className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs">
              <FileText className="h-4 w-4" /> Cetak E-Rapor PDF
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" /> E-Rapor & Penilaian Kurikulum Merdeka
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Rekap nilai leger, cetak rapor resmi, dan monitoring ketuntasan KKTP siswa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportExcelLeger} className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20">
              <Download className="h-4 w-4 text-emerald-500" /> Unduh Leger Excel
            </Button>
            <Button size="sm" onClick={() => setIsPrintRaporOpen(true)} className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" /> Cetak E-Rapor PDF
            </Button>
          </div>
        </div>
      )}

      <Card className="border-border shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" /> Rekap Leger Nilai Siswa (Tahun Ajaran 2026/2027)
          </CardTitle>
          <CardDescription className="text-xs">
            Nilai tugas, kuis, CBT, dan nilai akhir mata pelajaran Kurikulum Merdeka.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">Mata Pelajaran</th>
                <th className="py-3 px-3">Guru Pengampu</th>
                <th className="py-3 px-3 text-center">Tugas</th>
                <th className="py-3 px-3 text-center">Kuis</th>
                <th className="py-3 px-3 text-center">CBT</th>
                <th className="py-3 px-3 text-center">Nilai Akhir</th>
                <th className="py-3 px-4 text-right">KKTP Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mapelDetails.map((m) => (
                <tr key={m.code} className="hover:bg-muted/30 transition">
                  <td className="py-3 px-4 font-bold text-foreground">{m.mapel}</td>
                  <td className="py-3 px-3 text-muted-foreground">{m.teacher}</td>
                  <td className="py-3 px-3 text-center">{renderGradeCell(m.tugas)}</td>
                  <td className="py-3 px-3 text-center">{renderGradeCell(m.kuis)}</td>
                  <td className="py-3 px-3 text-center">{renderGradeCell(m.cbt)}</td>
                  <td className="py-3 px-3 text-center text-primary text-sm">{renderGradeCell(m.avg)}</td>
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
                      <td className="border border-slate-300 p-2 text-slate-700 leading-snug">
                        {getCpDescription(m.mapel, m.avg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ekstrakurikuler & Ketidakhadiran */}
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900">Kegiatan Ekstrakurikuler & Kokurikuler (P5-PPRA):</div>
                <table className="w-full text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-200 text-slate-900 font-bold">
                      <th className="p-1 text-left">Kegiatan</th>
                      <th className="p-1 text-center">Nilai</th>
                      <th className="p-1 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-semibold">Pramuka Penggalang</td>
                      <td className="p-1 text-center font-bold text-emerald-700">A</td>
                      <td className="p-1">Sangat Aktif & Mandiri</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-1 font-semibold">Tahfidz Al-Qur'an</td>
                      <td className="p-1 text-center font-bold text-emerald-700">A</td>
                      <td className="p-1">Tuntas Juz 30 & Surat An-Naba</td>
                    </tr>
                    <tr>
                      <td className="p-1 font-semibold">PMR Madya</td>
                      <td className="p-1 text-center font-bold text-blue-700">B</td>
                      <td className="p-1">Aktif & Disiplin</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border border-slate-200 rounded-md p-3 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900">Ketidakhadiran / Presensi Semester:</div>
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="py-1">Sakit (S)</td>
                      <td className="py-1 text-right font-mono font-bold">0 Hari</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-1">Izin (I)</td>
                      <td className="py-1 text-right font-mono font-bold">0 Hari</td>
                    </tr>
                    <tr>
                      <td className="py-1">Tanpa Keterangan (A)</td>
                      <td className="py-1 text-right font-mono font-bold text-emerald-600">0 Hari (Nihil)</td>
                    </tr>
                  </tbody>
                </table>
                <div className="pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-200">
                  <span>Status Verifikasi E-Rapor:</span>
                  <span className="font-bold text-emerald-700">TERVERIFIKASI RESMI</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div className="font-bold text-slate-900">Catatan Wali Kelas:</div>
              <div className="text-slate-700 italic">
                "Ananda {raporStudentName} menunjukkan prestasi akademik dan non-akademik yang sangat membanggakan. Pertahankan semangat juang dan tingkatkan kedisiplinan serta akhlakul karimah."
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Orang Tua / Wali Siswa</div>
                <div className="font-bold underline text-slate-950">( .......................... )</div>
              </div>
              <div className="text-center space-y-8">
                <div>Wali Kelas {raporClass}</div>
                <div className="font-bold underline text-slate-950">Dra. Hj. Siti Rahmah, M.Pd</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">H. Solihun, S.Pd., M.Si.</div>
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
