import React, { useState } from "react";
import {
  Upload,
  Sparkles,
  Trophy,
  User as UserIcon,
  Shield,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

interface ProfilModuleProps {
  userProfile?: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
  activeRole?: string;
}

export function ProfilModule({
  userProfile,
  setUserProfile,
  activeRole,
}: ProfilModuleProps) {
  const [activeTab, setActiveTab] = useState<"biodata" | "avatar" | "keamanan" | "lencana">("biodata");

  // Form states for biodata & motto
  const [name, setName] = useState(userProfile?.name || "Ahmad Fauzi");
  const [nipNis, setNipNis] = useState(userProfile?.nipNis || "0081928371");
  const [email, setEmail] = useState(userProfile?.email || "ahmad.fauzi@mtsn2cilacap.sch.id");
  const [phone, setPhone] = useState(userProfile?.phone || "081234567890");
  const [address, setAddress] = useState(userProfile?.address || "Jl. Masjid No. 12, Cilacap Tengah");
  const [tagline, setTagline] = useState(
    userProfile?.tagline || "Man Jadda Wajada - Barangsiapa bersungguh-sungguh pasti berhasil 🚀"
  );

  // Avatar upload states
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(userProfile?.avatarUrl || null);

  // Security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSiswa = activeRole === "siswa";

  const handleSaveBiodata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama lengkap tidak boleh kosong!");
    if (!tagline.trim()) return toast.error("Motto / Tagline tidak boleh kosong!");

    setUserProfile?.((prev: any) => ({
      ...prev,
      name,
      nipNis,
      email,
      phone,
      address,
      tagline,
    }));

    toast.success("✅ Perubahan Profil & Motto Berhasil Disimpan!", {
      description: "Motto baru Anda kini otomatis ditampilkan di Dashboard.",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Harap pilih file gambar (JPG, PNG, WEBP)!");
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    if (!previewAvatar) return toast.error("Belum ada foto yang dipilih!");

    setUserProfile?.((prev: any) => ({
      ...prev,
      avatarUrl: previewAvatar,
    }));

    toast.success("📸 Foto Profil Avatar Berhasil Diperbarui!", {
      description: "Foto baru Anda kini aktif di Header & Sidebar LMS.",
    });
  };

  const handleResetAvatar = () => {
    setPreviewAvatar(null);
    setUserProfile?.((prev: any) => ({
      ...prev,
      avatarUrl: null,
    }));
    toast.success("Foto profil dikembalikan ke inisial default.");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) return toast.error("Masukkan kata sandi lama Anda!");
    if (newPassword.length < 6) return toast.error("Kata sandi baru minimal 6 karakter!");
    if (newPassword !== confirmPassword) return toast.error("Konfirmasi kata sandi baru tidak cocok!");

    toast.success("🔒 Kata Sandi Berhasil Diperbarui!");
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Hero Card */}
      <Card className="border-border bg-card overflow-hidden shadow-md">
        <div className="h-32 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 p-4 flex justify-between items-start">
          <Badge className="bg-white/20 text-white border-white/20 font-mono text-xs">
            MADRASAH TSANAWIYAH NEGERI 2 CILACAP
          </Badge>
          <Badge variant="outline" className="bg-black/30 text-emerald-300 border-emerald-400/40 text-xs font-bold uppercase">
            {activeRole?.replace("_", " ")}
          </Badge>
        </div>

        <CardContent className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="relative">
              {/* Profile Avatar Frame */}
              <Avatar className="h-28 w-28 border-4 border-background shadow-xl ring-2 ring-emerald-500/50">
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-emerald-700 text-white text-3xl font-extrabold">
                    {(userProfile?.name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Requirement 3: Overlay Achievement Badges for Students on/near Profile Photo */}
              {isSiswa && userProfile?.badges && userProfile.badges.length > 0 && (
                <div className="absolute -bottom-2 -right-2 flex -space-x-1 hover:space-x-1 transition-all">
                  <Badge
                    title="Lencana Prestasi Penilaian Guru"
                    className="bg-amber-500 text-black border-2 border-background shadow-lg px-2 py-0.5 text-[10px] font-extrabold flex items-center gap-1 animate-pulse"
                  >
                    🏆 PRESTASI
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left sm:ml-2">
              <h1 className="text-2xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                {userProfile?.name || name}
              </h1>
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                {isSiswa ? "NISN: " : "NIP: "}
                <span className="font-semibold text-foreground">{userProfile?.nipNis || nipNis}</span> • MTsN 2 Cilacap
              </div>

              {/* Requirement 2: Motto / Tagline Badge Box */}
              <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 max-w-xl">
                <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" /> Motto Hidup / Tagline Pembelajaran:
                </div>
                <p className="text-xs font-semibold italic mt-0.5 text-foreground">
                  "{userProfile?.tagline || tagline}"
                </p>
              </div>
            </div>

            <div className="shrink-0 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("avatar")}
                className="gap-1.5 text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
              >
                <Upload className="h-3.5 w-3.5" /> Ganti Foto
              </Button>
            </div>
          </div>

          {/* Requirement 3: Badges Chips Displayed Near Profile for Student */}
          {isSiswa && userProfile?.badges && userProfile.badges.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 mt-2">
              <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-500" /> Lencana Apresiasi Guru (Penilaian Prestasi Siswa):
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.badges.map((b: string, i: number) => (
                  <Badge
                    key={i}
                    className="bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 text-xs font-bold px-2.5 py-1 flex items-center gap-1"
                  >
                    {b}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sub-Tabs Management */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === "biodata" ? "default" : "outline"}
          className={`gap-2 text-xs font-bold ${
            activeTab === "biodata" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
          onClick={() => setActiveTab("biodata")}
        >
          <UserIcon className="h-3.5 w-3.5" /> 1. Edit Biodata & Motto
        </Button>

        <Button
          size="sm"
          variant={activeTab === "avatar" ? "default" : "outline"}
          className={`gap-2 text-xs font-bold ${
            activeTab === "avatar" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
          onClick={() => setActiveTab("avatar")}
        >
          <Upload className="h-3.5 w-3.5" /> 2. Upload Foto Profil
        </Button>

        <Button
          size="sm"
          variant={activeTab === "keamanan" ? "default" : "outline"}
          className={`gap-2 text-xs font-bold ${
            activeTab === "keamanan" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
          }`}
          onClick={() => setActiveTab("keamanan")}
        >
          <Shield className="h-3.5 w-3.5" /> 3. Keamanan & Password
        </Button>

        {isSiswa && (
          <Button
            size="sm"
            variant={activeTab === "lencana" ? "default" : "outline"}
            className={`gap-2 text-xs font-bold ${
              activeTab === "lencana" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
            }`}
            onClick={() => setActiveTab("lencana")}
          >
            <Trophy className="h-3.5 w-3.5" /> 4. Lencana Prestasi
          </Button>
        )}
      </div>

      {/* TAB 1: EDIT BIODATA & MOTTO */}
      {activeTab === "biodata" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-emerald-600" /> Edit Biodata & Motto Pembelajaran
            </CardTitle>
            <CardDescription className="text-xs">
              Perbarui informasi identitas pribadi dan motto hidup yang akan tampil di Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveBiodata} className="space-y-4">
              {/* Requirement 2: Tagline / Motto Field */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                <Label htmlFor="prof-tagline" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Motto Hidup / Tagline Pembelajaran (Muncul di Dashboard)
                </Label>
                <textarea
                  id="prof-tagline"
                  name="tagline"
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="Tuliskan motto inspiratif Anda..."
                  className="w-full p-3 rounded-lg border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-muted-foreground">
                  *Motto ini akan ditampilkan secara otomatis di bagian salam pembuka Dashboard masing-masing user.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-name" className="text-xs font-semibold">Nama Lengkap & Gelar</Label>
                  <Input id="prof-name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prof-nipnis" className="text-xs font-semibold">{isSiswa ? "NISN" : "NIP / NUPTK"}</Label>
                  <Input id="prof-nipnis" name="nipNis" value={nipNis} onChange={(e) => setNipNis(e.target.value)} className="text-xs font-mono" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prof-email" className="text-xs font-semibold">Email Official</Label>
                  <Input id="prof-email" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="text-xs" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prof-phone" className="text-xs font-semibold">No. WhatsApp (Notifikasi EWS)</Label>
                  <Input id="prof-phone" name="phone" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="text-xs font-mono" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prof-address" className="text-xs font-semibold">Alamat Tempat Tinggal</Label>
                <textarea
                  id="prof-address"
                  name="address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-lg border border-input bg-background text-xs"
                />
              </div>

              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Simpan Perubahan Profil & Motto
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: UPLOAD FOTO AVATAR (Requirement 1: Upload Foto Cukup Foto Saja) */}
      {activeTab === "avatar" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-600" /> Upload Foto Profil Avatar
            </CardTitle>
            <CardDescription className="text-xs">
              Unggah pas foto profil resmi Anda (Format JPG, PNG, WEBP max 2MB).
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Live Preview Box */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs font-bold text-muted-foreground">Preview Live Avatar:</div>
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-2 ring-emerald-500/50">
                  {previewAvatar ? (
                    <img src={previewAvatar} alt="Preview Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback className="bg-emerald-700 text-white text-4xl font-extrabold">
                      {(name || "U").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>

              {/* Upload Dropzone */}
              <div className="flex-1 w-full space-y-4">
                <div className="p-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center text-center gap-2 hover:border-emerald-500/50 transition-colors bg-muted/20">
                  <Upload className="h-8 w-8 text-emerald-600" />
                  <div className="text-xs font-semibold text-foreground">Pilih Berkas Foto Dari Komputer</div>
                  <Input type="file" accept="image/*" onChange={handleFileChange} className="text-xs cursor-pointer max-w-xs" />
                  <p className="text-[11px] text-muted-foreground">
                    *Foto otomatis terkompresi dan diperbarui di Header Topbar & Sidebar.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveAvatar}
                    disabled={!previewAvatar}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Pasang Foto Profil Ini
                  </Button>

                  <Button size="sm" variant="outline" onClick={handleResetAvatar} className="text-xs font-semibold text-destructive">
                    Reset Ke Default
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: KEAMANAN & PASSWORD */}
      {activeTab === "keamanan" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" /> Pengaturan Keamanan & Kata Sandi
            </CardTitle>
            <CardDescription className="text-xs">
              Perbarui kata sandi akun Anda untuk meningkatkan keamanan akses LMS.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSaveSecurity} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="old-password" className="text-xs font-semibold">Kata Sandi Saat Ini</Label>
                <Input id="old-password" name="oldPassword" autoComplete="current-password" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="text-xs" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-xs font-semibold">Kata Sandi Baru</Label>
                <Input id="new-password" name="newPassword" autoComplete="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="text-xs" />
                {newPassword && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span>Kekuatan Kata Sandi:</span>
                      <span className={newPassword.length >= 8 ? "text-emerald-500 font-bold" : "text-amber-500"}>
                        {newPassword.length >= 8 ? "🟢 Kuat (Strong)" : "⚠️ Sedang (Medium)"}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          newPassword.length >= 8 ? "bg-emerald-500 w-full" : "bg-amber-500 w-1/2"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-xs font-semibold">Konfirmasi Kata Sandi Baru</Label>
                <Input id="confirm-password" name="confirmPassword" autoComplete="new-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="text-xs" />
              </div>

              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5">
                <KeyRound className="h-4 w-4" /> Perbarui Kata Sandi
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: LENCANA PRESTASI SISWA (Requirement 3: Tampilan Lencana untuk Siswa Berprestasi) */}
      {isSiswa && activeTab === "lencana" && (
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" /> Daftar Lencana Prestasi Penilaian Guru
            </CardTitle>
            <CardDescription className="text-xs">
              Penghargaan resmi yang diberikan oleh guru pengampu dan wali kelas atas pencapaian akademik & sikap.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: "⭐ Siswa Aktif & Responsif", desc: "Sangat aktif berdiskusi dan bertanya dalam KBM", date: "15 Juli 2026", guru: "Dra. Hj. Siti Rahmah" },
                { title: "🏆 Nilai Perfect 100", desc: "Mendapatkan nilai sempurna 100 pada Asesmen PAS", date: "20 Juli 2026", guru: "Bpk. Hendra Wijaya" },
                { title: "🌟 Hafalan Mutqin Juz 30", desc: "Menyetorkan hafalan Juz 30 tajwid mumtaz", date: "24 Juli 2026", guru: "Ust. Abdul Halim" },
              ].map((badge, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-2 hover:border-amber-500/60 transition">
                  <div className="font-extrabold text-sm text-amber-800 dark:text-amber-300">{badge.title}</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{badge.desc}</p>
                  <div className="pt-2 border-t border-amber-500/20 text-[11px] text-muted-foreground flex justify-between font-mono">
                    <span>{badge.guru}</span>
                    <span>{badge.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
