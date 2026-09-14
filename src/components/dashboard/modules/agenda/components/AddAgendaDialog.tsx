import { useState } from "react";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
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

interface AddAgendaDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAgenda: (newAgenda: {
    title: string;
    category: string;
    selectedDate: string;
    desc: string;
    isRedDate?: boolean;
    badge?: string;
  }) => void;
}

export function AddAgendaDialog({ isOpen, onOpenChange, onAddAgenda }: AddAgendaDialogProps) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("cbt");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [desc, setDesc] = useState("");
  const [isRedDate, setIsRedDate] = useState(false);

  // Jika user memilih kategori 'libur', default isRedDate otomatis true
  const handleCatChange = (newCat: string) => {
    setCat(newCat);
    if (newCat === "libur") {
      setIsRedDate(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedDate) return toast.error("Harap lengkapi judul dan tanggal agenda!");

    let defaultBadge = "🔵 Kegiatan Madrasah";
    if (cat === "libur") defaultBadge = "🔴 Libur Resmi";
    else if (cat === "cuti") defaultBadge = "🟡 Cuti Bersama";
    else if (cat === "cbt") defaultBadge = "🔵 Ujian CBT";
    else if (cat === "rapat") defaultBadge = "🟣 Rapat Dinas";
    else if (cat === "kokurikuler") defaultBadge = "🟡 Kegiatan Kokurikuler";
    else if (cat === "kbm") defaultBadge = "🟢 KBM Efektif";

    onAddAgenda({
      title,
      category: cat,
      selectedDate,
      desc,
      isRedDate,
      badge: defaultBadge,
    });
    setTitle("");
    setDesc("");
    setIsRedDate(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <CalendarClock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Tambah Agenda & Tanggal Merah Baru
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Masukkan detail kegiatan resmi madrasah atau tetapkan tanggal merah baru ke dalam kalender.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nama / Judul Kegiatan</Label>
            <Input
              placeholder="Contoh: Libur Awal Ramadhan / Ujian CBT..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori Kegiatan</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs text-foreground"
                value={cat}
                onChange={(e) => handleCatChange(e.target.value)}
              >
                <option value="cbt">🔵 Ujian CBT</option>
                <option value="libur">🔴 Libur Resmi / Tanggal Merah</option>
                <option value="cuti">🟡 Cuti Bersama</option>
                <option value="kokurikuler">🟡 Kegiatan Kokurikuler</option>
                <option value="rapat">🟣 Rapat Dinas</option>
                <option value="kbm">🟢 KBM Efektif</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tanggal Pelaksanaan</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Opsi Khusus Tanggal Merah */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/80 bg-muted/20">
            <input
              type="checkbox"
              id="red-date-toggle"
              checked={isRedDate}
              onChange={(e) => setIsRedDate(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="red-date-toggle" className="text-xs font-semibold text-foreground cursor-pointer select-none">
              Tetapkan sebagai <span className="text-red-600 dark:text-red-400 font-bold">Tanggal Merah</span> (Angka kalender berwarna merah)
            </label>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Keterangan / Detail Tambahan</Label>
            <textarea
              className="w-full min-h-[70px] rounded-md border border-input bg-background p-3 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              placeholder="Tuliskan keterangan tempat, petunjuk teknis, atau dasar surat keputusan..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Simpan Agenda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
