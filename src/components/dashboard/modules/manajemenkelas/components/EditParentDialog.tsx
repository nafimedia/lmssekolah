import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StudentItem } from "./DaftarSiswaKelasTab";
import { UserCheck, Phone, Save, User } from "lucide-react";

interface EditParentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentItem | null;
  onSave: (studentId: string, parentName: string, parentWa: string) => void;
}

export function EditParentDialog({ isOpen, onClose, student, onSave }: EditParentDialogProps) {
  const [parentName, setParentName] = useState("");
  const [parentWa, setParentWa] = useState("");

  useEffect(() => {
    if (student) {
      setParentName(student.parentName || `Orang Tua ${student.name.split(" ")[0]}`);
      setParentWa(student.parentWa || "081234567890");
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    onSave(student.id, parentName, parentWa);
    onClose();
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> Edit Data Orang Tua / Wali Siswa
          </DialogTitle>
          <DialogDescription className="text-xs">
            Perbarui nama orang tua/wali & kontak WhatsApp aktif untuk siswa <strong className="text-foreground">{student.name}</strong> ({student.class}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-muted-foreground" /> Nama Lengkap Orang Tua / Wali
            </Label>
            <Input
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Contoh: Drs. Yusuf Prayoga"
              className="h-9 text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-emerald-600" /> Nomor WhatsApp Aktif (WA Ortu)
            </Label>
            <Input
              required
              value={parentWa}
              onChange={(e) => setParentWa(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="h-9 text-xs font-mono font-semibold"
            />
            <p className="text-[11px] text-muted-foreground">
              Nomor ini akan otomatis terhubung ke fitur WA Alert Gateway saat pengiriman notifikasi presensi.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
              Batal
            </Button>
            <Button type="submit" size="sm" className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground">
              <Save className="h-4 w-4" /> Simpan Data Ortu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
