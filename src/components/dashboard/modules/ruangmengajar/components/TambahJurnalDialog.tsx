import { useState } from "react";
import { Plus } from "lucide-react";
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

interface TambahJurnalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJurnal: (newJurnal: { title: string; rombel: string; mapel: string; meeting: string; notes: string }) => void;
  activeRombel: string;
  activeMapel: string;
}

export function TambahJurnalDialog({ isOpen, onOpenChange, onAddJurnal, activeRombel, activeMapel }: TambahJurnalDialogProps) {
  const [title, setTitle] = useState("");
  const [meeting, setMeeting] = useState("Pertemuan 16");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAddJurnal({ title, rombel: activeRombel, mapel: activeMapel, meeting, notes });
    onOpenChange(false);
    setTitle("");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Tambah Entri Jurnal KBM Harian
          </DialogTitle>
          <DialogDescription>
            Catat jurnal mengajar tatap muka untuk {activeRombel} ({activeMapel}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold">Topik Materi Pembelajaran</Label>
            <Input placeholder="Contoh: Hukum Bacaan Mad Silah & Mad Badal" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Mata Pelajaran</Label>
              <Input value={activeMapel} disabled className="mt-1 text-xs bg-muted font-bold" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Rombel Target</Label>
              <Input value={activeRombel} disabled className="mt-1 text-xs bg-muted font-bold" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Sesi Pertemuan</Label>
            <Input value={meeting} onChange={(e) => setMeeting(e.target.value)} required className="mt-1 text-xs font-mono" />
          </div>

          <div>
            <Label className="text-xs font-semibold">Catatan KBM & Evaluasi</Label>
            <textarea
              className="w-full min-h-[70px] rounded-md border border-input bg-background p-3 text-xs"
              placeholder="Siswa mampu menguasai tajwid dengan sangat baik..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Jurnal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
