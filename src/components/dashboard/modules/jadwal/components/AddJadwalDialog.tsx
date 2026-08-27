import { useState, useEffect } from "react";
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
import { MysqlDataService } from "@/services/mysqlDataService";

interface AddJadwalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJadwal: (newJadwal: { selectedHari: string; jam: string; mapel: string; inputTingkat: string; inputRombel: string; guru: string }) => void;
}

export function AddJadwalDialog({ isOpen, onOpenChange, onAddJadwal }: AddJadwalDialogProps) {
  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const [selectedHari, setSelectedHari] = useState("Senin");
  const [jam, setJam] = useState("07.30 - 08.15");
  const [mapel, setMapel] = useState("Matematika");
  const [inputTingkat, setInputTingkat] = useState("Kelas VIII");
  const [inputRombel, setInputRombel] = useState("Rombel 8A");
  const [guru, setGuru] = useState("");
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
      if (guruUsers.length > 0 && !guru) {
        setGuru(guruUsers[0].full_name || guruUsers[0].name);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJadwal({ selectedHari, jam, mapel, inputTingkat, inputRombel, guru });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" /> Tambah Jadwal Pelajaran Baru
          </DialogTitle>
          <DialogDescription>Masukkan detail Kelas, Rombel, Mata Pelajaran, dan Guru Pengampu.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Tingkat Kelas</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={inputTingkat} onChange={(e) => setInputTingkat(e.target.value)}>
                <option value="Kelas VII">Kelas VII (7)</option>
                <option value="Kelas VIII">Kelas VIII (8)</option>
                <option value="Kelas IX">Kelas IX (9)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Nama Rombel</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={inputRombel} onChange={(e) => setInputRombel(e.target.value)}>
                <option value="Rombel 7A">Rombel 7A</option>
                <option value="Rombel 7B">Rombel 7B</option>
                <option value="Rombel 7C">Rombel 7C</option>
                <option value="Rombel 8A">Rombel 8A</option>
                <option value="Rombel 8B">Rombel 8B</option>
                <option value="Rombel 8C">Rombel 8C</option>
                <option value="Rombel 9A">Rombel 9A</option>
                <option value="Rombel 9C">Rombel 9C</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Pilih Hari</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none" value={selectedHari} onChange={(e) => setSelectedHari(e.target.value)}>
                {hariList.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Alokasi Waktu Jam</Label>
              <Input placeholder="07.30 - 09.00" value={jam} onChange={(e) => setJam(e.target.value)} required className="mt-1 text-xs font-mono" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Mata Pelajaran</Label>
            <Input placeholder="Contoh: Matematika" value={mapel} onChange={(e) => setMapel(e.target.value)} required className="mt-1 text-xs" />
          </div>

          <div>
            <Label className="text-xs font-semibold">Guru Pengampu (Master Data MySQL)</Label>
            <select
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              value={guru}
              onChange={(e) => setGuru(e.target.value)}
              required
            >
              <option value="" disabled>-- Pilih Guru Pengampu --</option>
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
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Jadwal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
