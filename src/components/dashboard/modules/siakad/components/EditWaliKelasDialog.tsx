import { useState, useEffect } from "react";
import { UserCheck, Save, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditWaliKelasDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rombel: { id: string; name: string; grade: string; waliKelas: string } | null;
  teacherList: string[];
  onSave: (rombelId: string, newWaliKelas: string) => void;
}

export function EditWaliKelasDialog({
  isOpen,
  onOpenChange,
  rombel,
  teacherList,
  onSave,
}: EditWaliKelasDialogProps) {
  const [selectedWali, setSelectedWali] = useState("");
  const [customTeacherName, setCustomTeacherName] = useState("");

  const availableTeachers = Array.from(new Set(teacherList || [])).filter(Boolean);

  useEffect(() => {
    if (rombel) {
      setSelectedWali(rombel.waliKelas || "");
      setCustomTeacherName("");
    }
  }, [rombel]);

  if (!rombel) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWaliName =
      selectedWali === "CUSTOM" ? customTeacherName.trim() : selectedWali;

    if (!finalWaliName) return;

    onSave(rombel.id, finalWaliName);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-teal-900/60 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-teal-300">
            <Pencil className="h-5 w-5 text-teal-400" />
            Edit Wali Kelas ({rombel.name})
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Tugaskan Guru Pengampu resmi sebagai Wali Kelas untuk Rombel{" "}
            <strong className="text-teal-200">{rombel.name} ({rombel.grade})</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-teal-400" /> Pilih Guru Wali Kelas
            </Label>
            <select
              value={selectedWali}
              onChange={(e) => setSelectedWali(e.target.value)}
              className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs font-semibold text-white focus:border-teal-500 focus:outline-none"
            >
              {availableTeachers.map((t) => (
                <option key={t} value={t}>
                  👨‍🏫 {t}
                </option>
              ))}
              <option value="CUSTOM">➕ Input Nama Guru Baru (Manual)</option>
            </select>
          </div>

          {selectedWali === "CUSTOM" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-300">
                Nama Lengkap & Gelar Guru Baru
              </Label>
              <input
                type="text"
                required
                value={customTeacherName}
                onChange={(e) => setCustomTeacherName(e.target.value)}
                placeholder="Contoh: BAPAK AHMAD, S.Pd"
                className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          )}

          <div className="p-3 rounded-lg bg-teal-950/40 border border-teal-900/50 text-[11px] text-teal-300 flex items-center gap-2">
            <span>ℹ️ Perubahan Wali Kelas akan langsung tersimpan di sistem Akademik Madrasah & Rapor.</span>
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
              <Save className="h-4 w-4" /> Simpan Wali Kelas
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
