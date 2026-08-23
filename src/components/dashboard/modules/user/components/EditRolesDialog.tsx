import { useState, useEffect } from "react";
import { toast } from "sonner";
import { UserCog, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EditRolesDialogProps {
  user: { id: string; full_name: string; email: string; nis: string; roles: string[] } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveRoles: (userId: string, userEmail: string, newRoles: string[]) => void;
}

export function EditRolesDialog({ user, isOpen, onOpenChange, onSaveRoles }: EditRolesDialogProps) {
  const [tempEditRoles, setTempEditRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setTempEditRoles([...user.roles]);
    }
  }, [user]);

  const toggleTempEditRole = (role: string) => {
    if (tempEditRoles.includes(role)) {
      if (tempEditRoles.length <= 1) {
        return toast.error("Minimal 1 role aktif wajib dimiliki pengguna!");
      }
      setTempEditRoles(tempEditRoles.filter((r) => r !== role));
    } else {
      setTempEditRoles([...tempEditRoles, role]);
    }
  };

  const handleSave = () => {
    if (!user) return;
    if (tempEditRoles.length === 0) {
      return toast.error("Pengguna harus memiliki minimal 1 role aktif!");
    }
    onSaveRoles(user.id, user.email, tempEditRoles);
    toast.success(`💾 Hak akses multi-role untuk ${user.full_name} berhasil disimpan secara permanen! (${tempEditRoles.join(", ").toUpperCase()})`);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <UserCog className="h-5 w-5 text-emerald-600" /> Kelola & Simpan Hak Akses Multi-Role
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Atur dan centang peran (role) untuk akun pengguna ini, lalu klik Simpan Perubahan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs space-y-1">
            <div><span className="font-semibold text-muted-foreground">Nama Pengguna:</span> <strong className="text-foreground">{user.full_name}</strong></div>
            <div><span className="font-semibold text-muted-foreground">Email / Username:</span> <code className="font-mono text-foreground">{user.email}</code></div>
            <div><span className="font-semibold text-muted-foreground">NIP / NISN:</span> <code className="font-mono text-foreground">{user.nis}</code></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs font-semibold">Pilih Role yang Diberikan (Bisa Lebih Dari 1 Role)</Label>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                {tempEditRoles.length} Role Terpilih
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "guru", label: "👨‍🏫 Guru Pengampu" },
                { id: "siswa", label: "🎓 Siswa" },
                { id: "walikelas", label: "📋 Wali Kelas" },
                { id: "waka", label: "📐 Waka Kurikulum" },
                { id: "kamad", label: "🏛️ Kepala Madrasah" },
                { id: "admin_akademik", label: "💼 Admin Akademik" },
                { id: "admin", label: "🛡️ Super Admin" },
              ].map((r) => {
                const isSelected = tempEditRoles.includes(r.id);
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleTempEditRole(r.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                      isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                        : "bg-muted/40 border-border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>{r.label}</span>
                    {isSelected && <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs"
              onClick={handleSave}
            >
              <Save className="h-4 w-4" /> Simpan Perubahan Role
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
