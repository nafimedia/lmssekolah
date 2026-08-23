import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface AvatarUploadCardProps {
  name: string;
  previewAvatar: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveAvatar: () => void;
  handleResetAvatar: () => void;
}

export function AvatarUploadCard({
  name,
  previewAvatar,
  handleFileChange,
  handleSaveAvatar,
  handleResetAvatar,
}: AvatarUploadCardProps) {
  const getInitials = (n: string) => {
    if (!n) return "US";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.substring(0, 2).toUpperCase();
  };

  return (
    <Card className="border-border shadow-sm bg-card">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" /> Foto Profil Avatar Digital
        </CardTitle>
        <CardDescription className="text-xs">
          Unggah foto profil terbaru Anda untuk ditampilkan pada kartu identitas & aplikasi LMS.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-md">
              {previewAvatar ? (
                <img src={previewAvatar} alt="Avatar" className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary font-black text-2xl">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          <div className="space-y-3 flex-1">
            <div>
              <Label className="text-xs font-semibold">Pilih Berkas Foto Baru</Label>
              <Input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                className="mt-1 text-xs cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Format yang didukung: JPG, PNG, WEBP. Ukuran maksimal 2 MB.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-primary text-primary-foreground font-bold text-xs" onClick={handleSaveAvatar}>
                📸 Simpan Foto Profil
              </Button>
              {previewAvatar && (
                <Button size="sm" variant="outline" className="text-xs font-semibold" onClick={handleResetAvatar}>
                  Hapus Foto
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
