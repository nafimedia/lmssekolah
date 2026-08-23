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
  onAddAgenda: (newAgenda: { title: string; category: string; selectedDate: string; desc: string }) => void;
}

export function AddAgendaDialog({ isOpen, onOpenChange, onAddAgenda }: AddAgendaDialogProps) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("cbt");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [desc, setDesc] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedDate) return toast.error("Harap lengkapi judul dan tanggal agenda!");

    onAddAgenda({ title, category: cat, selectedDate, desc });
    setTitle("");
    setDesc("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" /> Tambah Agenda Kegiatan Baru
          </DialogTitle>
          <DialogDescription>Masukkan detail kegiatan resmi madrasah ke dalam kalender.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nama / Judul Kegiatan</Label>
            <Input placeholder="Contoh: Ujian Tengah Semester (PTS)..." value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Kategori Kegiatan</Label>
              <select className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs" value={cat} onChange={(e) => setCat(e.target.value)}>
                <option value="cbt">🔴 Ujian CBT</option>
                <option value="rapat">🟣 Rapat Dinas</option>
                <option value="kokurikuler">🟡 Kokurikuler P5</option>
                <option value="libur">🟢 Libur Resmi</option>
                <option value="kbm">🔵 KBM Efektif</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Tanggal Pelaksanaan</Label>
              <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Keterangan / Detail Tambahan</Label>
            <textarea
              className="w-full min-h-[80px] rounded-md border border-input bg-background p-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
              placeholder="Tuliskan keterangan tempat atau perlengkapan..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Agenda</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
