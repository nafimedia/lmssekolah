import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Settings2, Moon, AlertCircle, CheckCircle2, RotateCcw } from "lucide-react";
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
import { getHijriDate } from "@/utils/hijriJawaHelper";

interface CalendarSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentHijriOffset: number;
  onSaveHijriOffset: (offset: number) => Promise<void>;
}

export function CalendarSettingsDialog({
  isOpen,
  onOpenChange,
  currentHijriOffset,
  onSaveHijriOffset,
}: CalendarSettingsDialogProps) {
  const [selectedOffset, setSelectedOffset] = useState<number>(currentHijriOffset);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedOffset(currentHijriOffset);
  }, [currentHijriOffset, isOpen]);

  const today = new Date();
  const previewHijri = getHijriDate(today, selectedOffset);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSaveHijriOffset(selectedOffset);
      toast.success("Pengaturan kalender Hijriah berhasil disimpan ke basis data!");
      onOpenChange(false);
    } catch {
      toast.error("Gagal menyimpan pengaturan kalender.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
            <Settings2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Penyesuaian Kalender Hijriah
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Khusus Superadmin: Sesuaikan penanggalan Hijriah jika terjadi perbedaan hasil Sidang Isbat Kemenag RI (Rukyatul Hilal / Istikmal).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Opsi Koreksi Hari */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              Koreksi Hari Hijriah (Offset)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: -1, label: "-1 Hari", desc: "Mundur 1 Hari" },
                { val: 0, label: "0 (Standar)", desc: "Hisab Kemenag" },
                { val: 1, label: "+1 Hari", desc: "Maju 1 Hari" },
              ].map((opt) => {
                const isActive = selectedOffset === opt.val;
                return (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setSelectedOffset(opt.val)}
                    className={`p-2.5 rounded-lg border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isActive
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/30"
                        : "border-border hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-bold">{opt.label}</span>
                    <span className="text-[10px] opacity-80">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kotak Preview Hasil Penyesuaian */}
          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-amber-500" /> Preview Penanggalan Hari Ini:
              </span>
              {selectedOffset !== 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                  Koreksi Aktif ({selectedOffset > 0 ? `+${selectedOffset}` : selectedOffset} Hari)
                </span>
              )}
            </div>
            <p className="text-sm font-black text-foreground">
              {previewHijri.day} {previewHijri.monthName} {previewHijri.year} H
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                ({previewHijri.arabicDay})
              </span>
            </p>
            <p className="text-[11px] text-muted-foreground">
              Masehi: {today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Catatan Informasi Regulasi */}
          <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 text-[11px] text-muted-foreground flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Perubahan ini berlaku seketika di seluruh portal (Admin, Guru, Siswa, Orang Tua) dan tersimpan permanen di database MySQL.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => setSelectedOffset(0)}
            disabled={selectedOffset === 0 || isSaving}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset ke 0
          </Button>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              type="button"
              size="sm"
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleSave}
              disabled={isSaving}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
