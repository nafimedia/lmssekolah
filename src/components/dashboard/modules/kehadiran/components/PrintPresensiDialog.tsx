import { UserCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { KemenagLogo } from "@/components/common/KemenagLogo";

interface PrintPresensiDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedClass: string;
  selectedMonth: string;
  filteredAttendance: any[];
  onPrint: () => void;
}

export function PrintPresensiDialog({
  isOpen,
  onOpenChange,
  selectedClass,
  selectedMonth,
  filteredAttendance,
  onPrint,
}: PrintPresensiDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" /> Pratinjau Rekapitulasi Presensi Bulanan
            </div>
            <Badge className="bg-emerald-600 text-white font-mono text-xs">{selectedClass}</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Format Dokumen Resmi Rekapitulasi Kehadiran Siswa MTsN 2 Cilacap ({selectedMonth}).
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
          <div className="border-b-2 border-slate-900 pb-3">
            <div className="flex items-center gap-4 mb-2">
              <KemenagLogo className="h-16 w-16" />
              <div className="text-center flex-1 pr-14">
                <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
              </div>
            </div>
            <div className="py-1 bg-emerald-800 text-white font-extrabold text-xs text-center uppercase tracking-widest rounded-xs">
              REKAPITULASI PRESENSI KEHADIRAN SISWA BULANAN
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>Rombongan Belajar: <strong className="text-emerald-900 font-bold">{selectedClass}</strong></div>
            <div>Bulan / Periode: <strong>{selectedMonth}</strong></div>
            <div>Tahun Ajaran: <strong>2026/2027 Ganjil</strong></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="border border-slate-300 p-2 text-center w-8">No</th>
                  <th className="border border-slate-300 p-2 text-left">NISN</th>
                  <th className="border border-slate-300 p-2 text-left">Nama Lengkap Siswa</th>
                  <th className="border border-slate-300 p-2 text-center">Hadir</th>
                  <th className="border border-slate-300 p-2 text-center">Izin</th>
                  <th className="border border-slate-300 p-2 text-center">Sakit</th>
                  <th className="border border-slate-300 p-2 text-center">Alpa</th>
                  <th className="border border-slate-300 p-2 text-center">% Hadir</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((s, idx) => {
                  const effHadir = s.hadir + (s.today === "hadir" ? 1 : 0);
                  const effIzin = s.izin + (s.today === "izin" ? 1 : 0);
                  const effSakit = s.sakit + (s.today === "sakit" ? 1 : 0);
                  const effAlpa = s.alpa + (s.today === "alpa" ? 1 : 0);
                  const totDays = effHadir + effIzin + effSakit + effAlpa || 1;
                  const effPct = Math.round((effHadir / totDays) * 1000) / 10;

                  return (
                    <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-mono">{s.nisn}</td>
                      <td className="border border-slate-300 p-2 font-bold">{s.name}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold text-emerald-800">{effHadir}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">{effIzin}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono">{effSakit}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono text-red-700 font-bold">{effAlpa}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-950">{effPct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
            <div className="text-center space-y-8">
              <div>Wali Kelas {selectedClass}</div>
              <div className="font-bold underline text-slate-950">
                {selectedClass.includes("7A") ? "MAULIDIA NURUL IZATI, S.Pd" : selectedClass.includes("7B") ? "RINDANG FARIHA IDANA, S.Pd" : selectedClass.includes("8A") ? "SOBIYATI, S.Pd" : selectedClass.includes("8B") ? "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" : selectedClass.includes("9A") ? "NOVANTYA KARTIKAWATI, S.Pd" : selectedClass.includes("9B") ? "INDAH NURROHMAH, S.Pd" : "Wali Kelas MTsN 2 Cilacap"}
              </div>
            </div>
            <div className="text-center space-y-8">
              <div>Cilacap, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Kepala MTsN 2 Cilacap</div>
              <div className="font-bold underline text-slate-950">H. SOLIHUN, S.Pd., M.Si</div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={onPrint}>
            <Printer className="h-4 w-4" /> Cetak Rekap Presensi PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
