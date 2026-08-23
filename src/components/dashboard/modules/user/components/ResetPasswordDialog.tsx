import { useState } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { toast } from "sonner";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface ResetPasswordDialogProps {
  user: { id: string; full_name: string; email: string; nis: string; roles: string[] } | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordDialog({ user, isOpen, onOpenChange }: ResetPasswordDialogProps) {
  const [adminNewPassword, setAdminNewPassword] = useState("MtsN2#2026!Reset");
  const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);

  const confirmAdminResetPassword = async (customPass?: string) => {
    if (!user) return;
    const targetPass = customPass || adminNewPassword;

    const res = await MysqlAuthService.adminResetPassword(user.email, targetPass);
    if (res.success) {
      toast.success(`🔒 Kata sandi akun ${user.full_name} (${user.email}) berhasil diubah menjadi: "${targetPass}"`, {
        duration: 9000,
      });
      onOpenChange(false);
    } else {
      toast.error(res.message);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-teal-600" /> Kelola & Reset Kata Sandi Pengguna
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Fitur kontrol khusus Super Administrator untuk memperbarui kata sandi akun pengguna LMS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-xs space-y-1">
            <div><span className="font-semibold text-muted-foreground">Target Akun:</span> <strong className="text-foreground">{user.full_name}</strong></div>
            <div><span className="font-semibold text-muted-foreground">Email / Username:</span> <code className="font-mono text-foreground">{user.email}</code></div>
            <div><span className="font-semibold text-muted-foreground">NIP / NISN:</span> <code className="font-mono text-foreground">{user.nis}</code></div>
          </div>

          <div className="p-3 border border-border rounded-xl bg-muted/30 space-y-2">
            <div className="text-xs font-bold flex items-center justify-between">
              <span>⚡ Reset Cepat (Default Password)</span>
              <Badge variant="outline" className="text-[10px] bg-teal-500/10 text-teal-600 border-teal-500/30">
                Otomatis
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Sistem akan mereset password akun ini menjadi kata sandi sementara yang aman: <code className="font-mono text-teal-600 dark:text-teal-400 font-bold">MtsN2#2026!Reset</code>
            </p>
            <Button
              size="sm"
              type="button"
              variant="outline"
              className="w-full text-xs font-bold border-teal-500/40 text-teal-600 hover:bg-teal-500/10"
              onClick={() => confirmAdminResetPassword("MtsN2#2026!Reset")}
            >
              ⚡ Terbitkan Password Reset Default
            </Button>
          </div>

          <div className="space-y-2 pt-1">
            <Label htmlFor="admin-custom-pass" className="text-xs font-semibold">Atau Masukkan Kata Sandi Kustom Baru</Label>
            <div className="relative">
              <Input
                id="admin-custom-pass"
                type={showAdminNewPassword ? "text" : "password"}
                value={adminNewPassword}
                onChange={(e) => setAdminNewPassword(e.target.value)}
                placeholder="Min 8 Karakter (Huruf Besar, Kecil & Angka)"
                className="text-xs pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowAdminNewPassword(!showAdminNewPassword)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
              >
                {showAdminNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {adminNewPassword && (() => {
              const strength = MysqlAuthService.validatePasswordStrength(adminNewPassword);
              return (
                <p className={`text-[10px] ${strength.isValid ? "text-emerald-500 font-semibold" : "text-amber-500"}`}>
                  Kekuatan: {strength.label} {strength.feedback.length > 0 ? `(${strength.feedback.join(", ")})` : "✓"}
                </p>
              );
            })()}
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button
              size="sm"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1.5 text-xs"
              onClick={() => confirmAdminResetPassword()}
            >
              <KeyRound className="h-4 w-4" /> Simpan Kata Sandi Kustom
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
