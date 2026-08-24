import { useState, useEffect } from "react";
import { CalendarDays, Save, Calendar, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AcademicYearItem } from "@/services/academicYearService";

interface AddTahunAjaranDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: AcademicYearItem | null;
  onSave: (item: Omit<AcademicYearItem, "id"> & { id?: string }) => void;
}

export function AddTahunAjaranDialog({
  isOpen,
  onOpenChange,
  initialData,
  onSave,
}: AddTahunAjaranDialogProps) {
  const [year, setYear] = useState("2026/2027");
  const [semester, setSemester] = useState<"Ganjil" | "Genap">("Ganjil");
  const [startDate, setStartDate] = useState("13 Juli 2026");
  const [endDate, setEndDate] = useState("19 Desember 2026");
  const [status, setStatus] = useState<"AKTIF" | "TERJADWAL" | "ARSIP">("TERJADWAL");
  const [isCurrent, setIsCurrent] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initialData) {
      setYear(initialData.year || "2026/2027");
      setSemester(initialData.semester || "Ganjil");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setStatus(initialData.status || "TERJADWAL");
      setIsCurrent(!!initialData.isCurrent);
      setNotes(initialData.notes || "");
    } else {
      setYear("2026/2027");
      setSemester("Ganjil");
      setStartDate("13 Juli 2026");
      setEndDate("19 Desember 2026");
      setStatus("TERJADWAL");
      setIsCurrent(false);
      setNotes("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year.trim() || !startDate.trim() || !endDate.trim()) return;

    onSave({
      id: initialData?.id,
      year: year.trim(),
      semester,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      status: isCurrent ? "AKTIF" : status,
      isCurrent,
      notes: notes.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-teal-900/60 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-teal-300">
            <CalendarDays className="h-5 w-5 text-teal-400" />
            {initialData ? "Edit Tahun Ajaran & Periode" : "Tambah Tahun Ajaran Baru"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Atur kalender akademik, semester, dan periode efektif KBM MTsN 2 Cilacap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Tahun Ajaran
              </Label>
              <Input
                type="text"
                required
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026/2027"
                className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white h-9 text-xs font-bold font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Semester
              </Label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value as "Ganjil" | "Genap")}
                className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs font-bold text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="Ganjil">Semester Ganjil</option>
                <option value="Genap">Semester Genap</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-teal-400" /> Tanggal Mulai KBM
              </Label>
              <Input
                type="text"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="13 Juli 2026"
                className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white h-9 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-rose-400" /> Tanggal Selesai KBM
              </Label>
              <Input
                type="text"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="19 Desember 2026"
                className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white h-9 text-xs font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">
              Status Periode
            </Label>
            <select
              value={status}
              disabled={isCurrent}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-xs font-semibold text-white focus:border-teal-500 focus:outline-none disabled:opacity-50"
            >
              <option value="TERJADWAL">🔵 TERJADWAL (Mendatang)</option>
              <option value="AKTIF">🟢 AKTIF SEKARANG</option>
              <option value="ARSIP">📦 ARSIP (Masa Lalu)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="cb-is-current"
              checked={isCurrent}
              onChange={(e) => {
                setIsCurrent(e.target.checked);
                if (e.target.checked) setStatus("AKTIF");
              }}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-teal-600 focus:ring-teal-500"
            />
            <Label
              htmlFor="cb-is-current"
              className="text-xs font-bold text-teal-300 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4 text-teal-400" />
              Aktifkan sebagai Periode Utama KBM Sekarang
            </Label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-300">
              Catatan / Keterangan Tambahan
            </Label>
            <Input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kurikulum Merdeka Kemenag 2026/2027"
              className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white h-9 text-xs"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold gap-1.5"
            >
              <Save className="h-4 w-4" /> Simpan Tahun Ajaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
