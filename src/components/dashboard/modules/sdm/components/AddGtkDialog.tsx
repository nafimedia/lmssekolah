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
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";

interface AddGtkDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGtk: (newGtk: any) => void;
}

export function AddGtkDialog({ isOpen, onOpenChange, onAddGtk }: AddGtkDialogProps) {
  const [formName, setFormName] = useState("");
  const [formNip, setFormNip] = useState("");
  const [formStatus, setFormStatus] = useState<"PNS" | "PPPK" | "GTT / Honor">("PNS");
  const [formGolongan, setFormGolongan] = useState("Penata (III/c)");
  const [formMapel, setFormMapel] = useState(INITIAL_MASTER_MAPEL[0]?.name || "Al Qur'an Hadis");
  const [formJp, setFormJp] = useState(24);
  const [formTugas, setFormTugas] = useState("Guru Pengampu");
  const [formSertifikasi, setFormSertifikasi] = useState(true);
  const [formPhone, setFormPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formNip) return;

    onAddGtk({
      id: "gtk-" + Date.now(),
      name: formName,
      nip: formNip,
      npk: formNip.substring(0, 11),
      statusKepegawaian: formStatus,
      golongan: formGolongan,
      mapelUtama: formMapel,
      totalJp: Number(formJp),
      tugasTambahan: formTugas,
      isSertifikasi: formSertifikasi,
      email: `${formNip}@guru.mtsn2cilacap.sch.id`,
      phone: formPhone || "081234567890",
    });

    onOpenChange(false);
    setFormName("");
    setFormNip("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" /> Tambah Data Pegawai GTK Baru
          </DialogTitle>
          <DialogDescription className="text-xs">
            Formulir pendataan Guru & Tenaga Kependidikan baru MTsN 2 Cilacap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label className="text-xs font-semibold">Nama Lengkap & Gelar</Label>
            <Input placeholder="Contoh: AH. SYARIF HIDAYAH, S.Pd.I" value={formName} onChange={(e) => setFormName(e.target.value)} required className="mt-1 text-xs" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">NIP / NIK Pegawai</Label>
              <Input placeholder="19920404..." value={formNip} onChange={(e) => setFormNip(e.target.value)} required className="mt-1 text-xs font-mono" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Status Kepegawaian</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}>
                <option value="PNS">PNS (Aparatur Sipil Negara)</option>
                <option value="PPPK">PPPK (Pegawai Pemerintah)</option>
                <option value="GTT / Honor">GTT / Guru Honor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Golongan / Pangkat</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={formGolongan} onChange={(e) => setFormGolongan(e.target.value)}>
                <option value="Penata Muda (III/a)">Penata Muda (III/a)</option>
                <option value="Penata Muda Tk. I (III/b)">Penata Muda Tk. I (III/b)</option>
                <option value="Penata (III/c)">Penata (III/c)</option>
                <option value="Penata Tk. I (III/d)">Penata Tk. I (III/d)</option>
                <option value="Pembina (IV/a)">Pembina (IV/a)</option>
                <option value="Pembina Tk. I (IV/b)">Pembina Tk. I (IV/b)</option>
                <option value="Pembina Utama Muda (IV/c)">Pembina Utama Muda (IV/c)</option>
                <option value="IX (PPPK)">IX (PPPK)</option>
                <option value="Non-Golongan (Honor)">Non-Golongan (Honor)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Mata Pelajaran Utama</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={formMapel} onChange={(e) => setFormMapel(e.target.value)}>
                {INITIAL_MASTER_MAPEL.map((m) => (
                  <option key={m.code} value={m.name}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Beban Mengajar (JP / Minggu)</Label>
              <Input type="number" min={0} value={formJp} onChange={(e) => setFormJp(Number(e.target.value))} className="mt-1 text-xs" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Status TPG / Sertifikasi</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={formSertifikasi ? "true" : "false"} onChange={(e) => setFormSertifikasi(e.target.value === "true")}>
                <option value="true">✅ Sudah Sertifikasi (TPG Aktif)</option>
                <option value="false">⏳ Belum Sertifikasi</option>
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Tugas Tambahan / Wali Kelas</Label>
            <Input placeholder="Contoh: Wali Kelas 8A / Pembina Ekstrakulikuler" value={formTugas} onChange={(e) => setFormTugas(e.target.value)} className="mt-1 text-xs" />
          </div>

          <div>
            <Label className="text-xs font-semibold">Nomor WhatsApp Aktif</Label>
            <Input placeholder="081234567890" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="mt-1 text-xs font-mono" />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Data GTK</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
