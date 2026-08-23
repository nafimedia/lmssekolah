import { CalendarClock, Download } from "lucide-react";
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
import { JadwalRow } from "@/services/mysqlDataService";

import { KemenagLogo } from "@/components/common/KemenagLogo";

interface PrintJadwalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filterKelas: string;
  filterRombel: string;
  jadwalList: JadwalRow[];
  onPrint: () => void;
}

export function PrintJadwalDialog({ isOpen, onOpenChange, filterKelas, filterRombel, jadwalList, onPrint }: PrintJadwalDialogProps) {
  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-blue-600" /> Pratinjau Matriks Jadwal Pelajaran KBM
            </div>
            <Badge className="bg-blue-600 text-white font-mono text-xs">{filterRombel === "Semua" ? "Seluruh Rombel" : filterRombel}</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Jadwal Resmi Alokasi Pembelajaran Tatap Muka & KBM MTsN 2 Cilacap (Tahun Ajaran 2025/2026 Ganjil).
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
            <div className="mt-2 py-1 bg-blue-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs">
              JADWAL PELAJARAN KBM MADRASAH (SEMESTER GANJIL)
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
            <div>Tingkat Kelas: <strong>{filterKelas}</strong></div>
            <div>Rombongan Belajar: <strong className="text-blue-900 font-bold">{filterRombel}</strong></div>
            <div>Tahun Ajaran: <strong>2025/2026 Ganjil</strong></div>
          </div>

          <div className="space-y-3">
            {hariList.map((h) => {
              const listForDay = (jadwalList || []).filter((s) => {
                if (s.hari !== h) return false;
                const matchKelas = filterKelas === "Semua" || s.tingkat === filterKelas;
                const matchRombel = filterRombel === "Semua" || s.rombel === filterRombel;
                return matchKelas && matchRombel;
              });
              if (listForDay.length === 0) return null;

              return (
                <div key={h} className="border border-slate-300 rounded-md overflow-hidden text-xs">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-300 flex justify-between">
                    <span>📅 HARI {h.toUpperCase()}</span>
                    <span className="font-mono text-[11px] text-slate-600">{listForDay.length} Sesi Pelajaran</span>
                  </div>
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-1.5 text-center w-24 border-r border-slate-200">Jam Waktu</th>
                        <th className="p-1.5 text-left border-r border-slate-200">Mata Pelajaran</th>
                        <th className="p-1.5 text-left border-r border-slate-200">Rombel / Ruang</th>
                        <th className="p-1.5 text-left">Guru Pengampu Utama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listForDay.map((s, idx) => (
                        <tr key={s.id || idx} className="border-b border-slate-200 hover:bg-slate-50">
                          <td className="p-1.5 text-center font-mono font-bold text-slate-900 border-r border-slate-200">{s.jam}</td>
                          <td className="p-1.5 font-bold text-blue-950 border-r border-slate-200">{s.mapel}</td>
                          <td className="p-1.5 border-r border-slate-200">{s.rombel} ({s.tingkat})</td>
                          <td className="p-1.5 text-slate-800">{s.guru || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
            <div className="text-center space-y-8">
              <div>Waka Kurikulum</div>
              <div className="font-bold underline text-slate-950">Dra. Hj. Siti Rahmah, M.Pd</div>
            </div>
            <div className="text-center space-y-8">
              <div>Cilacap, 11 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
              <div className="font-bold underline text-slate-950">Solihun, S.Pd, M.Si.</div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5" onClick={onPrint}>
            <Download className="h-4 w-4" /> 🖨️ Cetak Jadwal KBM PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
