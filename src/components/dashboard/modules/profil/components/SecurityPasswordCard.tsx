import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Shield } from "lucide-react";

interface SecurityPasswordCardProps {
  oldPassword: string;
  setOldPassword: (v: string) => void;
  newPassword: string;
  setNewPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  handleSaveSecurity: (e: React.FormEvent) => void;
}

export function SecurityPasswordCard({
  oldPassword,
  setOldPassword,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  handleSaveSecurity,
}: SecurityPasswordCardProps) {
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" /> Keamanan & Perubahan Kata Sandi Akun
        </CardTitle>
        <CardDescription className="text-xs">
          Perbarui kata sandi akun LMS Anda secara berkala untuk menjaga kerahasiaan data.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSaveSecurity} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Kata Sandi Saat Ini</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Kata Sandi Baru</Label>
            <Input
              type="password"
              placeholder="Minimal 8 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Konfirmasi Kata Sandi Baru</Label>
            <Input
              type="password"
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="text-xs font-mono"
            />
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border border-border text-xs text-muted-foreground space-y-1">
            <div className="font-bold text-foreground flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-emerald-500" /> Kriteria Kekuatan Password:
            </div>
            <ul className="list-disc pl-4 text-[11px] space-y-0.5">
              <li>Minimal 8 karakter panjang</li>
              <li>Mengandung kombinasi huruf besar (A-Z) dan huruf kecil (a-z)</li>
              <li>Mengandung minimal 1 angka (0-9)</li>
            </ul>
          </div>

          <div className="pt-2">
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
              🔒 Perbarui Kata Sandi Akun
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
