import { useState, useEffect } from "react";
import { UserCog, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { GtkItem } from "../SdmGtkModule";

interface EditGtkDialogProps {
  selectedGtk: GtkItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveGtk: (updated: GtkItem) => void;
}

export function EditGtkDialog({ selectedGtk, isOpen, onOpenChange, onSaveGtk }: EditGtkDialogProps) {
  const [formData, setFormData] = useState<Partial<GtkItem>>({});

  useEffect(() => {
    if (selectedGtk) {
      setFormData({ ...selectedGtk });
    }
  }, [selectedGtk]);

  if (!selectedGtk) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nip) {
      return toast.error("Nama Lengkap dan NIP wajib diisi!");
    }

    const updated: GtkItem = {
      ...selectedGtk,
      name: formData.name || selectedGtk.name,
      nip: formData.nip || selectedGtk.nip,
      golongan: formData.golongan || selectedGtk.golongan,
      statusKepegawaian: (formData.statusKepegawaian || selectedGtk.statusKepegawaian) as any,
      mapelUtama: formData.mapelUtama || selectedGtk.mapelUtama,
      totalJp: Number(formData.totalJp) || selectedGtk.totalJp,
      tugasTambahan: formData.tugasTambahan || selectedGtk.tugasTambahan,
      isSertifikasi: Boolean(formData.isSertifikasi),
      email: formData.email || selectedGtk.email,
      phone: formData.phone || selectedGtk.phone,
    };

    onSaveGtk(updated);
    toast.success(`Data pegawai GTK ${updated.name} berhasil diperbarui!`);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-primary">
            <UserCog className="h-5 w-5" /> Edit Data Pegawai GTK
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Perbarui data biodata, pangkat/golongan, status kepegawaian, dan tugas mengajar pegawai GTK.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold mb-1 block">Nama Lengkap & Gelar *</Label>
              <Input
                className="h-8 text-xs"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">NIP / NIK *</Label>
              <Input
                className="h-8 text-xs font-mono"
                value={formData.nip || ""}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Status Kepegawaian</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2.5 text-xs font-semibold"
                value={formData.statusKepegawaian || "PNS"}
                onChange={(e) => setFormData({ ...formData, statusKepegawaian: e.target.value as any })}
              >
                <option value="PNS">PNS</option>
                <option value="PPPK">PPPK</option>
                <option value="GTT / Honor">GTT / Honor</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Pangkat / Golongan</Label>
              <Input
                className="h-8 text-xs"
                value={formData.golongan || ""}
                onChange={(e) => setFormData({ ...formData, golongan: e.target.value })}
                placeholder="misal: Pembina (IV/a)"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Mapel Utama / Jabatan</Label>
              <Input
                className="h-8 text-xs"
                value={formData.mapelUtama || ""}
                onChange={(e) => setFormData({ ...formData, mapelUtama: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Beban mengajar (JP/Minggu)</Label>
              <Input
                type="number"
                className="h-8 text-xs font-mono"
                value={formData.totalJp || 24}
                onChange={(e) => setFormData({ ...formData, totalJp: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">Email</Label>
              <Input
                type="email"
                className="h-8 text-xs font-mono"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold mb-1 block">No. WhatsApp / HP</Label>
              <Input
                className="h-8 text-xs font-mono"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold mb-1 block">Tugas Tambahan</Label>
            <Input
              className="h-8 text-xs"
              value={formData.tugasTambahan || ""}
              onChange={(e) => setFormData({ ...formData, tugasTambahan: e.target.value })}
              placeholder="misal: Wali Kelas 8A & Pembina Pramuka"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg border border-border">
            <Checkbox
              id="isSertifikasi"
              checked={formData.isSertifikasi || false}
              onCheckedChange={(checked) => setFormData({ ...formData, isSertifikasi: Boolean(checked) })}
            />
            <Label htmlFor="isSertifikasi" className="text-xs font-semibold cursor-pointer">
              Pegawai sudah memiliki Sertifikat Pendidik (TPG / Lulus Sertifikasi)
            </Label>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold gap-1.5">
              <Save className="h-4 w-4" /> Simpan Perubahan
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
