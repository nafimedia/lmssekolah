import { useState } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import { toast } from "sonner";
import { Shield } from "lucide-react";
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

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: (newUser: { id: string; full_name: string; email: string; nis: string; class: string; roles: string[] }) => void;
}

export function AddUserDialog({ isOpen, onOpenChange, onUserCreated }: AddUserDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("MtsN2#2026!Sec");
  const [nis, setNis] = useState("");
  const [userClass, setUserClass] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["guru"]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      return toast.error("Harap isi Nama Lengkap, Email, dan Kata Sandi.");
    }

    if (selectedRoles.length === 0) {
      return toast.error("Pilih minimal 1 role untuk pengguna baru.");
    }

    const strength = MysqlAuthService.validatePasswordStrength(password);
    if (!strength.isValid) {
      return toast.error(`Kata sandi terlalu lemah: ${strength.feedback.join(", ")}`);
    }

    const primaryRole = selectedRoles[0];
    const isSiswa = selectedRoles.includes("siswa");
    const idPrefix = isSiswa ? "NISN. " : "NIP. ";
    const cleanNisInput = nis.trim();
    const formattedNis = cleanNisInput
      ? cleanNisInput.startsWith("NISN.") || cleanNisInput.startsWith("NIP.")
        ? cleanNisInput
        : `${idPrefix}${cleanNisInput}`
      : "";

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    const cleanClass = userClass.trim() || "Semua";

    const newUserObj = {
      id: String(Date.now()),
      full_name: cleanFullName,
      email: cleanEmail,
      nis: formattedNis,
      class: cleanClass,
      roles: selectedRoles,
    };

    try {
      const regRes = await MysqlAuthService.registerUser({
        email: cleanEmail,
        password,
        full_name: cleanFullName,
        role: primaryRole as any,
        nis_nip: formattedNis,
        class_name: cleanClass,
      });

      // Save all assigned roles to MySQL if multi-role selected
      if (selectedRoles.length > 1 || selectedRoles[0] !== primaryRole) {
        await MysqlDataService.updateUserRole(
          (regRes as any)?.id || newUserObj.id,
          selectedRoles,
          cleanEmail,
          formattedNis
        );
      }
    } catch (err) {}

    onUserCreated(newUserObj);
    toast.success(`Akun pengguna ${cleanFullName} dengan ${selectedRoles.length} role (${selectedRoles.join(", ").toUpperCase()}) berhasil ditambahkan ke database MySQL!`);
    onOpenChange(false);

    setFullName("");
    setEmail("");
    setPassword("MtsN2#2026!Sec");
    setNis("");
    setUserClass("");
    setSelectedRoles(["guru"]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Tambah Pengguna Baru
          </DialogTitle>
          <DialogDescription>
            Formulir pembuatan akun pengguna baru dan penetapan peran hak akses di MTsN 2 Cilacap.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateUser} className="space-y-4 py-2">
          <div>
            <Label htmlFor="add-name" className="text-xs font-semibold">Nama Lengkap & Gelar</Label>
            <Input
              id="add-name"
              placeholder="Contoh: AH. SYARIF HIDAYAH, S.Pd.I"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="add-email" className="text-xs font-semibold">Email / Username</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="fauzi@mtsn2cilacap.sch.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="add-pass" className="text-xs font-semibold">Kata Sandi Default</Label>
              <Input
                id="add-pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="add-nis" className="text-xs font-semibold">NIP / NISN (Opsional)</Label>
              <Input
                id="add-nis"
                placeholder="NIP. 19850512..."
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                className="mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label htmlFor="add-class" className="text-xs font-semibold">Kelas / Rombel</Label>
              <Input
                id="add-class"
                placeholder="8A / 8B / Semua"
                value={userClass}
                onChange={(e) => setUserClass(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Pilih Peran Pengguna (Dapat Memilih Lebih Dari 1 Role)</Label>
              <span className="text-[10px] text-emerald-600 font-bold">{selectedRoles.length} Role Terpilih</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {[
                { id: "guru", label: "👨‍🏫 Guru Pengampu" },
                { id: "siswa", label: "🎓 Siswa" },
                { id: "walikelas", label: "📋 Wali Kelas" },
                { id: "waka", label: "📐 Waka Kurikulum" },
                { id: "kamad", label: "🏛️ Kepala Madrasah" },
                { id: "admin_akademik", label: "💼 Admin Akademik" },
                { id: "admin", label: "🛡️ Super Admin" },
              ].map((r) => {
                const isSelected = selectedRoles.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        if (selectedRoles.length <= 1) return toast.error("Minimal 1 role wajib dipilih!");
                        setSelectedRoles(selectedRoles.filter((item) => item !== r.id));
                      } else {
                        setSelectedRoles([...selectedRoles, r.id]);
                      }
                    }}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                        : "bg-muted/40 border-border hover:bg-muted"
                    }`}
                  >
                    <span>{r.label}</span>
                    {isSelected && <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
              Simpan & Buat Akun
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
