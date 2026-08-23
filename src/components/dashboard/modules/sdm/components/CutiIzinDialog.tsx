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

interface CutiIzinDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddLeave: (leaveData: { teacherName: string; leaveType: string; startDate: string; endDate: string; reason: string }) => void;
}

export function CutiIzinDialog({ isOpen, onOpenChange, onAddLeave }: CutiIzinDialogProps) {
  const [teacherName, setTeacherName] = useState("");
  const [leaveType, setLeaveType] = useState("Cuti Tahunan");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName || !reason) return;
    onAddLeave({ teacherName, leaveType, startDate, endDate, reason });
    onOpenChange(false);
    setTeacherName("");
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Pengajuan Cuti / Izin Pegawai GTK
          </DialogTitle>
          <DialogDescription>Masukkan detail permohonan cuti / izin resmi pegawai.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold">Nama Pegawai GTK</Label>
            <Input placeholder="Nama lengkap pegawai" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} required className="mt-1 text-xs" />
          </div>

          <div>
            <Label className="text-xs font-semibold">Jenis Cuti / Izin</Label>
            <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
              <option value="Cuti Tahunan">Cuti Tahunan</option>
              <option value="Cuti Sakit">Cuti Sakit</option>
              <option value="Cuti Melahirkan">Cuti Melahirkan</option>
              <option value="Izin Dinas Luar">Izin Dinas Luar / Pelatihan</option>
              <option value="Izin Keperluan Keluarga">Izin Keperluan Keluarga</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Tanggal Mulai</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Tanggal Selesai</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="mt-1 text-xs" />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Alasan / Keterangan</Label>
            <textarea
              className="w-full min-h-[70px] rounded-md border border-input bg-background p-3 text-xs"
              placeholder="Tuliskan keperluan..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Kirim Pengajuan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
