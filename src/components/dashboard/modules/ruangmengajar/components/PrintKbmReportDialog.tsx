import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, FileText, Download, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { KbmHistoryItem } from "./RiwayatKbmSection";

interface PrintKbmReportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  historyList: KbmHistoryItem[];
  activeRombel?: string;
  activeMapel?: string;
}

export function PrintKbmReportDialog({
  isOpen,
  onOpenChange,
  historyList,
  activeRombel,
  activeMapel,
}: PrintKbmReportDialogProps) {
  const handlePrint = () => {
    window.print();
    toast.success("Memproses dokumen cetak Rekap Jurnal KBM...");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
          <DialogTitle className="text-base font-extrabold flex items-center gap-2">
            <Printer className="h-5 w-5 text-primary" /> Pratinjau Cetak Laporan Rekap Jurnal KBM Digital
          </DialogTitle>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Cetak / Simpan PDF
          </Button>
        </DialogHeader>

        {/* Printable Official Madrasah Document Content */}
        <div className="p-6 bg-white text-slate-900 rounded-xl border border-border shadow-xs space-y-6 font-sans">
          {/* Official Kop Surat */}
          <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
            <h2 className="font-black text-lg text-emerald-800 uppercase tracking-wide">KANTOR KEMENTERIAN AGAMA KABUPATEN CILACAP</h2>
            <h1 className="font-black text-xl text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</h1>
            <p className="text-[11px] text-slate-600">Jl. KH. Ahmad Dahlan No. 12, Cilacap · Telp/Fax: (0282) 534123 · Website: mtsn2cilacap.sch.id</p>
          </div>

          {/* Report Title */}
          <div className="text-center space-y-1 py-2">
            <h3 className="font-black text-base uppercase underline text-slate-900">LAPORAN REKAPITULASI JURNAL & PRESENSI KBM DIGITAL</h3>
            <p className="text-xs font-semibold text-slate-600">Semester Ganjil · Tahun Ajaran 2026/2027</p>
          </div>

          {/* Metadata Block */}
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <p><span className="text-slate-500">Mata Pelajaran:</span> {activeMapel || "Pendidikan Kewarganegaraan"}</p>
              <p><span className="text-slate-500">Kelas / Rombel:</span> {activeRombel || "Semua Rombel Diampu"}</p>
            </div>
            <div className="text-right">
              <p><span className="text-slate-500">Guru Pengampu:</span> ANGGUN NOVTALIA BERLIANI, S.Pd.</p>
              <p><span className="text-slate-500">Tanggal Cetak:</span> 24 Agustus 2026</p>
            </div>
          </div>

          {/* Journal Summary Table */}
          <table className="w-full text-xs border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="border border-slate-300 p-2 text-center w-10">No</th>
                <th className="border border-slate-300 p-2 text-left w-28">Tanggal</th>
                <th className="border border-slate-300 p-2 text-left w-24">Kelas</th>
                <th className="border border-slate-300 p-2 text-left">Materi / Pokok Bahasan KBM</th>
                <th className="border border-slate-300 p-2 text-center w-24">Presensi</th>
                <th className="border border-slate-300 p-2 text-center w-24">Status Jurnal</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-200">
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold">{idx + 1}</td>
                  <td className="border border-slate-300 p-2 font-mono font-semibold">{item.date}</td>
                  <td className="border border-slate-300 p-2 font-bold">{item.rombel}</td>
                  <td className="border border-slate-300 p-2 font-medium">{item.topic}</td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold text-emerald-700">{item.attendance}</td>
                  <td className="border border-slate-300 p-2 text-center font-bold text-emerald-600">Terisi ✓</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature Block */}
          <div className="pt-8 grid grid-cols-2 text-xs font-semibold text-center">
            <div className="space-y-12">
              <p>Mengetahui,<br />Kepala MTsN 2 Cilacap</p>
              <div>
                <p className="font-bold underline">Drs. Hj. Umi Solikhatun, M.Pd.</p>
                <p className="text-[10px] text-slate-500">NIP. 196805121994032001</p>
              </div>
            </div>

            <div className="space-y-12">
              <p>Cilacap, 24 Agustus 2026<br />Guru Mata Pelajaran</p>
              <div>
                <p className="font-bold underline">ANGGUN NOVTALIA BERLIANI, S.Pd.</p>
                <p className="text-[10px] text-slate-500">NIP. 198511042010012009</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
