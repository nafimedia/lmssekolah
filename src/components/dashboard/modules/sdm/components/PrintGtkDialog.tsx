import { Printer, Download, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GtkItem } from "../SdmGtkModule";

import { KemenagLogo } from "@/components/common/KemenagLogo";

interface PrintGtkDialogProps {
  gtkList: GtkItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrintGtkDialog({ gtkList, isOpen, onOpenChange }: PrintGtkDialogProps) {
  const handlePrint = () => {
    window.print();
  };

  const totalPns = gtkList.filter((g) => g.statusKepegawaian === "PNS").length;
  const totalPppk = gtkList.filter((g) => g.statusKepegawaian === "PPPK").length;
  const totalHonorer = gtkList.filter((g) => g.statusKepegawaian === "GTT / Honor").length;
  const totalSertifikasi = gtkList.filter((g) => g.isSertifikasi).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto border-border bg-card">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary">
            <Printer className="h-5 w-5" /> Cetak Bio & Data SDM GTK PDF
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Laporan resmi data Pendidik & Tenaga Kependidikan MTsN 2 Cilacap lengkap dengan KOP Surat Kemenag dan Tanda Tangan Kamad.
          </DialogDescription>
        </DialogHeader>

        {/* Printable Area */}
        <div className="py-4 space-y-6 text-black bg-white p-6 rounded-xl border border-gray-200 printable-document">
          {/* Official KOP Surat */}
          <div className="flex items-center gap-4 border-b-4 border-double border-black pb-3 text-center">
            <div className="w-16 h-16 flex items-center justify-center shrink-0">
              <KemenagLogo className="w-16 h-16" />
            </div>
            <div className="flex-1 text-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">KEMENTERIAN AGAMA REPUBLIK INDONESIA</h3>
              <h2 className="text-sm font-black uppercase text-gray-900">KANTOR KEMENTERIAN AGAMA KABUPATEN CILACAP</h2>
              <h1 className="text-base font-black uppercase tracking-tight text-emerald-800">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</h1>
              <p className="text-[10px] text-gray-600 font-medium">
                Jl. Cendrawasih No. 09, Sumingkir, Jeruklegi, Kab. Cilacap, Jawa Tengah 53252 | Website: mtsn2cilacap.sch.id
              </p>
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold uppercase underline tracking-wide">
              DAFTAR INDUK PENDIDIK & TENAGA KEPENDIDIKAN (GTK)
            </h2>
            <p className="text-xs font-semibold text-gray-700">
              Tahun Ajaran 2026/2027 • MTsN 2 Cilacap
            </p>
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 rounded-lg border border-gray-300 text-xs font-medium">
            <div>Total GTK: <strong>{gtkList.length} Orang</strong></div>
            <div>PNS: <strong>{totalPns} Orang</strong></div>
            <div>PPPK / Honor: <strong>{totalPppk + totalHonorer} Orang</strong></div>
            <div>Sertifikasi (TPG): <strong>{totalSertifikasi} Guru</strong></div>
          </div>

          {/* GTK Table */}
          <table className="w-full text-[11px] border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gray-100 text-gray-900 font-bold border-b border-gray-400">
                <th className="border border-gray-400 px-2 py-1.5 text-center w-8">No</th>
                <th className="border border-gray-400 px-2 py-1.5 text-left">Nama Lengkap & Gelar</th>
                <th className="border border-gray-400 px-2 py-1.5 text-left">NIP / NPK</th>
                <th className="border border-gray-400 px-2 py-1.5 text-center">Status</th>
                <th className="border border-gray-400 px-2 py-1.5 text-left">Golongan</th>
                <th className="border border-gray-400 px-2 py-1.5 text-left">Mapel Utama</th>
                <th className="border border-gray-400 px-2 py-1.5 text-center">Beban JP</th>
                <th className="border border-gray-400 px-2 py-1.5 text-center">TPG</th>
              </tr>
            </thead>
            <tbody>
              {gtkList.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-bold">{idx + 1}</td>
                  <td className="border border-gray-300 px-2 py-1.5 font-bold">{item.name}</td>
                  <td className="border border-gray-300 px-2 py-1.5 font-mono text-[10px]">{item.nip}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{item.statusKepegawaian}</td>
                  <td className="border border-gray-300 px-2 py-1.5">{item.golongan}</td>
                  <td className="border border-gray-300 px-2 py-1.5 font-medium">{item.mapelUtama}</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-mono font-bold">{item.totalJp} JP</td>
                  <td className="border border-gray-300 px-2 py-1.5 text-center font-semibold">{item.isSertifikasi ? "Ya" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Official Signatures */}
          <div className="pt-6 grid grid-cols-2 text-xs font-semibold">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold">Waka Kurikulum</p>
              <div className="h-16"></div>
              <p className="font-bold underline">ALI MANSUR, S.Pd</p>
              <p className="text-[10px] text-gray-600 font-mono">NIP. 198302142023211010</p>
            </div>

            <div className="text-right">
              <p>Cilacap, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              <p className="font-bold">Kepala MTsN 2 Cilacap</p>
              <div className="h-16"></div>
              <p className="font-bold underline">Solihun, S.Pd, M.Si.</p>
              <p className="text-[10px] text-gray-600 font-mono">NIP. 197905162006041020</p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground font-bold gap-1.5" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Cetak Dokumen PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
