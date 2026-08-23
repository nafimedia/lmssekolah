import { Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { StudentItem } from "./DaftarSiswaKelasTab";

interface CetakSuratDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentItem | null;
  classNameTitle: string;
  waliKelasName: string;
  onPrint: () => void;
}

export function CetakSuratDialog({
  isOpen,
  onOpenChange,
  student,
  classNameTitle,
  waliKelasName,
  onPrint,
}: CetakSuratDialogProps) {
  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="border-b border-border pb-3">
          <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Pratinjau Surat Resmi Wali Kelas
            </div>
            <Badge className="bg-primary text-primary-foreground font-mono text-xs">{classNameTitle}</Badge>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Format Dokumen Resmi Keterangan / Undangan Wali Kelas MTsN 2 Cilacap.
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
            <div className="py-1 bg-emerald-800 text-white font-extrabold text-xs text-center uppercase tracking-widest rounded-xs">
              SURAT PEMBERITAHUAN / KETERANGAN WALI KELAS
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-800 leading-relaxed">
            <div>
              Yang bertanda tangan di bawah ini, Wali Kelas <strong>{classNameTitle}</strong> MTsN 2 Cilacap menerangkan bahwa:
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-medium">
              <div>Nama Siswa: <strong className="text-slate-950 font-bold">{student.name}</strong></div>
              <div>NISN / NIK: <strong className="font-mono text-slate-900">{student.nisn}</strong></div>
              <div>Rombongan Belajar: <strong>{classNameTitle}</strong></div>
              <div>Nama Orang Tua / Wali: <strong>{student.parentName || `Orang Tua ${student.name}`}</strong></div>
              <div>Rekap Kehadiran Semester: <strong className="text-emerald-800 font-bold">{student.hadirPct}% Hadir</strong></div>
            </div>

            <p>
              Menyampaikan pemberitahuan / catatan resmi wali kelas terkait perkembangan akademik, presensi harian, serta kedisiplinan siswa di madrasah.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-6 text-slate-800 border-t border-slate-200">
            <div className="text-center space-y-8">
              <div>Mengetahui,<br />Kepala MTsN 2 Cilacap</div>
              <div className="font-bold underline text-slate-950">H. Mohammad Fathoni, M.Pd</div>
            </div>
            <div className="text-center space-y-8">
              <div>Cilacap, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Wali Kelas {classNameTitle}</div>
              <div className="font-bold underline text-slate-950">{waliKelasName}</div>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
          <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
          <Button type="button" size="sm" className="bg-primary text-primary-foreground font-bold gap-1.5" onClick={onPrint}>
            <Printer className="h-4 w-4" /> Cetak Dokumen PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
