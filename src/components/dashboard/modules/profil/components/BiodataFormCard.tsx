import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User as UserIcon } from "lucide-react";

interface BiodataFormCardProps {
  name: string;
  setName: (v: string) => void;
  nipNis: string;
  setNipNis: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  address: string;
  setAddress: (v: string) => void;
  tagline: string;
  setTagline: (v: string) => void;
  classNameState: string;
  setClassNameState: (v: string) => void;
  rombelName: string;
  setRombelName: (v: string) => void;
  waliKelas: string;
  setWaliKelas: (v: string) => void;
  isSiswa: boolean;
  handleSaveBiodata: (e: React.FormEvent) => void;
}

export function BiodataFormCard({
  name,
  setName,
  nipNis,
  setNipNis,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  tagline,
  setTagline,
  classNameState,
  setClassNameState,
  rombelName,
  setRombelName,
  waliKelas,
  setWaliKelas,
  isSiswa,
  handleSaveBiodata,
}: BiodataFormCardProps) {
  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-primary" /> Pengaturan Biodata & Identitas Pengguna
        </CardTitle>
        <CardDescription className="text-xs">
          Perbarui informasi profil dasar, kontak WhatsApp, dan motto belajar Anda.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSaveBiodata} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nama Lengkap & Gelar</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required className="text-xs font-medium" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{isSiswa ? "NISN / Nomor Induk Siswa" : "NIP / NIK Pengajar"}</Label>
              <Input value={nipNis} onChange={(e) => setNipNis(e.target.value)} className="text-xs font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Alamat Email Aktif</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="text-xs font-mono" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nomor WhatsApp / HP</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="text-xs font-mono" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Alamat Tempat Tinggal</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} className="text-xs" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Motto / Tagline Inspiratif</Label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} className="text-xs italic" />
          </div>

          {isSiswa && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Tingkat Kelas</Label>
                <Input value={classNameState} onChange={(e) => setClassNameState(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rombongan Belajar</Label>
                <Input value={rombelName} onChange={(e) => setRombelName(e.target.value)} className="text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Wali Kelas</Label>
                <Input value={waliKelas} onChange={(e) => setWaliKelas(e.target.value)} className="text-xs" />
              </div>
            </div>
          )}

          <div className="pt-3 flex justify-end">
            <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
              💾 Simpan Perubahan Biodata
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
