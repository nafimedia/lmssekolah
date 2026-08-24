import { useState, useEffect } from "react";
import { MysqlDataService } from "@/services/mysqlDataService";
import { saveUserProfileOverride } from "@/services/mysqlAuthService";
import { toast } from "sonner";
import { Save, Edit3 } from "lucide-react";
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

export interface UserItem {
  id: string;
  full_name: string;
  email: string;
  nis: string;
  class: string;
  roles: string[];
  phone?: string;
}

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserItem | null;
  onUserUpdated: (updatedUser: UserItem) => void;
}

export function EditUserDialog({
  isOpen,
  onOpenChange,
  user,
  onUserUpdated,
}: EditUserDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nisNip, setNisNip] = useState("");
  const [userClass, setUserClass] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      const cleanNis = (user.nis || "").replace(/^(NISN|NIP)\.\s*/i, "").trim();
      setNisNip(cleanNis);
      setUserClass(user.class || "Semua");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName || !email) {
      return toast.error("Nama Lengkap dan Email tidak boleh kosong.");
    }

    setIsLoading(true);
    try {
      const isSiswa = user.roles.length === 1 && user.roles.includes("siswa");
      const idPrefix = isSiswa ? "NISN. " : "NIP. ";
      const formattedNis = nisNip ? `${idPrefix}${nisNip}` : user.nis;

      const updatedUserObj: UserItem = {
        ...user,
        full_name: fullName,
        email: email.trim().toLowerCase(),
        nis: formattedNis,
        class: userClass || "Semua",
        phone: phone || "",
      };

      // 1. Immediately persist profile override locally so login with new email works
      saveUserProfileOverride(user.email, {
        id: user.id,
        email: email.trim().toLowerCase(),
        full_name: fullName,
        nis_nip: nisNip,
        class_name: userClass || "Semua",
        roles: user.roles,
        phone: phone || "",
      });

      // 2. Persist updates to MySQL database / cache
      await MysqlDataService.updateUserProfile({
        originalEmail: user.email,
        id: user.id,
        fullName: fullName,
        email: email.trim().toLowerCase(),
        nipNis: nisNip,
        phone: phone || "",
        className: userClass,
      }).catch(() => {});

      onUserUpdated(updatedUserObj);
      toast.success(`✅ Data pengguna "${fullName}" (${email}) berhasil diperbarui!`);
      onOpenChange(false);
    } catch (err) {
      toast.error("Gagal memperbarui data pengguna. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Edit3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Edit Data Pengguna
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Perbarui informasi nama, NIP/NISN, email, dan penugasan kelas/mapel pengguna.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Nama Lengkap & Gelar:</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Contoh: AH. SYARIF HIDAYAH, S.Pd.I"
              className="text-xs font-semibold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">NIP / NISN:</Label>
              <Input
                value={nisNip}
                onChange={(e) => setNisNip(e.target.value)}
                placeholder="199204042025051002"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Kelas / Mapel Spesialisasi:</Label>
              <Input
                value={userClass}
                onChange={(e) => setUserClass(e.target.value)}
                placeholder="VIII-A / Al Qur'an Hadis"
                className="text-xs font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">Alamat Email:</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@mtsn2cilacap.sch.id"
              className="text-xs font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">No. Telepon / WhatsApp:</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="text-xs font-mono"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              size="sm"
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              <Save className="h-4 w-4" /> {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
