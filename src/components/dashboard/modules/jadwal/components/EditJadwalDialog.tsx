import { useState, useEffect } from "react";
import { PencilLine } from "lucide-react";
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
import { JadwalRow, MysqlDataService } from "@/services/mysqlDataService";

interface EditJadwalDialogProps {
  editingJadwal: JadwalRow | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateJadwal: (updated: JadwalRow) => void;
  setEditingJadwal: React.Dispatch<React.SetStateAction<JadwalRow | null>>;
}

export function EditJadwalDialog({ editingJadwal, isOpen, onOpenChange, onUpdateJadwal, setEditingJadwal }: EditJadwalDialogProps) {
  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getUsers().then((users: any[]) => {
      if (!isMounted) return;
      const guruUsers = (users || []).filter(
        (u: any) => u.role !== "siswa" && (u.full_name || u.name)
      );
      guruUsers.sort((a: any, b: any) =>
        (a.full_name || a.name || "").localeCompare(b.full_name || b.name || "")
      );
      setTeachers(guruUsers);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJadwal) {
      onUpdateJadwal(editingJadwal);
      onOpenChange(false);
    }
  };

  if (!editingJadwal) return null;

  // Check if current editingJadwal.guru is in teachers list
  const currentGuru = editingJadwal.guru || "";
  const isCurrentGuruInList = teachers.some(
    (t) => (t.full_name || t.name) === currentGuru
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <PencilLine className="h-5 w-5 text-primary" /> Edit Jadwal Pelajaran
          </DialogTitle>
          <DialogDescription>Perbarui detail jadwal KBM untuk rombel dan guru pengampu.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Tingkat Kelas</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={editingJadwal.tingkat || "Kelas VIII"}
                onChange={(e) => setEditingJadwal({ ...editingJadwal, tingkat: e.target.value })}
              >
                <option value="Kelas VII">Kelas VII (7)</option>
                <option value="Kelas VIII">Kelas VIII (8)</option>
                <option value="Kelas IX">Kelas IX (9)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Nama Rombel</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={editingJadwal.rombel || "Rombel 8A"}
                onChange={(e) => setEditingJadwal({ ...editingJadwal, rombel: e.target.value })}
              >
                <option value="Rombel 7A">Rombel 7A</option>
                <option value="Rombel 7B">Rombel 7B</option>
                <option value="Rombel 7C">Rombel 7C</option>
                <option value="Rombel 8A">Rombel 8A</option>
                <option value="Rombel 8B">Rombel 8B</option>
                <option value="Rombel 8C">Rombel 8C</option>
                <option value="Rombel 9A">Rombel 9A</option>
                <option value="Rombel 9B">Rombel 9B</option>
                <option value="Rombel 9C">Rombel 9C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Pilih Hari</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                value={editingJadwal.hari || "Senin"}
                onChange={(e) => setEditingJadwal({ ...editingJadwal, hari: e.target.value })}
              >
                {hariList.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Alokasi Waktu Jam</Label>
              <Input
                placeholder="07.30 - 08.15"
                value={editingJadwal.jam || ""}
                onChange={(e) => setEditingJadwal({ ...editingJadwal, jam: e.target.value })}
                required
                className="mt-1 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Mata Pelajaran</Label>
            <Input
              placeholder="Contoh: Matematika"
              value={editingJadwal.mapel || ""}
              onChange={(e) => setEditingJadwal({ ...editingJadwal, mapel: e.target.value })}
              required
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Guru Pengampu (Master Data MySQL)</Label>
            <select
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              value={currentGuru}
              onChange={(e) => setEditingJadwal({ ...editingJadwal, guru: e.target.value })}
              required
            >
              <option value="" disabled>-- Pilih Guru Pengampu --</option>

              {/* Render current teacher if not in database master list */}
              {currentGuru && !isCurrentGuruInList && (
                <option value={currentGuru}>{currentGuru}</option>
              )}

              {teachers.map((t, idx) => {
                const teacherName = t.full_name || t.name;
                const nipStr = t.nis_nip ? ` (NIP: ${t.nis_nip})` : "";
                return (
                  <option key={t.id || idx} value={teacherName}>
                    {teacherName}{nipStr}
                  </option>
                );
              })}
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Perubahan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
