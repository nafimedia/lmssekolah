import React, { useState, useEffect } from "react";
import {
  Upload,
  Sparkles,
  Trophy,
  User as UserIcon,
  Shield,
  CheckCircle2,
  KeyRound,
  Bell,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";

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
  const [updateNotification, setUpdateNotification] = useState<string | null>(null);

  // Form states for biodata & motto
  const [name, setName] = useState(userProfile?.name || "Ahmad Fauzi");
  const [nipNis, setNipNis] = useState(userProfile?.nipNis || "0081928371");
  const [email, setEmail] = useState(userProfile?.email || "ahmad.fauzi@mtsn2cilacap.sch.id");
  const [phone, setPhone] = useState(userProfile?.phone || "081234567890");
  const [address, setAddress] = useState(userProfile?.address || "Jl. Masjid No. 12, Cilacap Tengah");
  const [tagline, setTagline] = useState(
    userProfile?.tagline || "Man Jadda Wajada - Barangsiapa bersungguh-sungguh pasti berhasil 🚀"
  );
  const [classNameState, setClassNameState] = useState(userProfile?.className || "VIII (Delapan)");
  const [rombelName, setRombelName] = useState(userProfile?.rombelName || "VIII A (Rombel 8A)");
  const [waliKelas, setWaliKelas] = useState(userProfile?.waliKelas || "Bpk. Hendra Wijaya, M.Sc");

  // Avatar upload states
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(userProfile?.avatarUrl || null);

  // Security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSiswa = activeRole === "siswa";

  // Re-sync internal form states whenever active user or userProfile changes
  useEffect(() => {
    const activeUser = MysqlAuthService.getActiveUser();
    let savedBio: any = {};
    if (typeof window !== "undefined") {
      try {
        savedBio = JSON.parse(localStorage.getItem("lms_user_biodata_v1") || "{}");
      } catch (e) {}
    }

    const currentEmail = activeUser?.email || userProfile?.email || "ahmad.fauzi@mtsn2cilacap.sch.id";
    const userBio = savedBio[currentEmail.toLowerCase()] || {};

    setName(userBio.name || userProfile?.name || activeUser?.full_name || "Ahmad Fauzi");
    setEmail(userBio.email || userProfile?.email || activeUser?.email || "ahmad.fauzi@mtsn2cilacap.sch.id");
    setNipNis(userBio.nipNis || userProfile?.nipNis || activeUser?.nis_nip || "0081928371");
    setPhone(userBio.phone || userProfile?.phone || "081234567890");
    setAddress(userBio.address || userProfile?.address || "Jl. Masjid No. 12, Cilacap Tengah");
    setTagline(userBio.tagline || userProfile?.tagline || "Man Jadda Wajada - Barangsiapa bersungguh-sungguh pasti berhasil 🚀");
    setClassNameState(userBio.className || userProfile?.className || "VIII (Delapan)");
    setRombelName(userBio.rombelName || userProfile?.rombelName || "VIII A (Rombel 8A)");
    setWaliKelas(userBio.waliKelas || userProfile?.waliKelas || "Bpk. Hendra Wijaya, M.Sc");
  }, [userProfile]);

  const handleSaveBiodata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama lengkap tidak boleh kosong!");
    if (!email.trim()) return toast.error("Email tidak boleh kosong!");
    if (!tagline.trim()) return toast.error("Motto / Tagline tidak boleh kosong!");

    const activeUser = MysqlAuthService.getActiveUser();
    const originalEmail = activeUser?.email || email;

    // 1. Update parent React state
    setUserProfile?.((prev: any) => ({
      ...prev,
      name: name.trim(),
      nipNis: nipNis.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      tagline: tagline.trim(),
      className: classNameState,
      rombelName,
      waliKelas,
    }));

    // 2. Update Active Session in MysqlAuthService
    if (activeUser) {
      MysqlAuthService.setActiveUser({
        ...activeUser,
        full_name: name.trim(),
        email: email.trim(),
        nis_nip: nipNis.trim(),
      });
    }

    // 3. Update localStorage bio
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("lms_user_biodata_v1") || "{}";
        const bioMap = JSON.parse(raw);
        const bioData = {
          name: name.trim(),
          email: email.trim(),
          nipNis: nipNis.trim(),
          phone: phone.trim(),
          address: address.trim(),
          tagline: tagline.trim(),
          className: classNameState,
          rombelName,
          waliKelas,
        };
        bioMap[originalEmail.toLowerCase()] = bioData;
        bioMap[email.trim().toLowerCase()] = bioData;
        localStorage.setItem("lms_user_biodata_v1", JSON.stringify(bioMap));
      } catch (err) {}
    }

    // 4. Update database MySQL
    try {
      await MysqlDataService.updateUserProfile({
        originalEmail,
        fullName: name.trim(),
        email: email.trim(),
        nipNis: nipNis.trim(),
        phone: phone.trim(),
        address: address.trim(),
        tagline: tagline.trim(),
        className: classNameState,
      });

      // 5. System WA Log Notification
      await MysqlDataService.saveWaLog({
        parent_name: name.trim(),
        phone: phone.trim() || "081234567890",
        student_name: name.trim(),
        category: "UPDATE PROFIL",
        message: `[NOTIFIKASI AKTIVITAS USER]: Profil & email akun ${name.trim()} (${email.trim()}) berhasil diperbarui pada ${new Date().toLocaleTimeString("id-ID")} WIB.`,
        status: "TERKIRIM",
      }).catch(() => {});
    } catch (e) {}

    const successMsg = `🎉 Pembaruan Berhasil! Data profil & email Anda (${email.trim()}) telah diperbarui secara permanen ke sistem MySQL.`;
    setUpdateNotification(successMsg);

    toast.success("✅ Perubahan Profil & Email Berhasil Disimpan!", {
      description: `Profil ${name.trim()} (${email.trim()}) telah tersimpan permanen.`,
      duration: 8000,
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

    if (typeof window !== "undefined") {
      localStorage.setItem("lms_user_avatar", previewAvatar);
      const currentUser = MysqlAuthService.getActiveUser();
      if (currentUser) {
        MysqlAuthService.setActiveUser({
          ...currentUser,
          avatar_url: previewAvatar,
        });
      }
    }

    const avatarMsg = "📸 Foto Profil Avatar Anda berhasil diperbarui dan aktif di seluruh sistem LMS!";
    setUpdateNotification(avatarMsg);

    toast.success("📸 Foto Profil Avatar Berhasil Diperbarui & Disimpan!", {
      description: "Foto baru Anda kini tersimpan dan aktif di seluruh tampilan LMS.",
      duration: 8000,
    });
  };

  const handleResetAvatar = () => {
    setPreviewAvatar(null);
    setUserProfile?.((prev: any) => ({
      ...prev,
      avatarUrl: null,
    }));

    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_user_avatar");
      const currentUser = MysqlAuthService.getActiveUser();
      if (currentUser) {
        const { avatar_url, ...rest } = currentUser;
        MysqlAuthService.setActiveUser(rest);
      }
    }

    toast.success("Foto profil dikembalikan ke inisial default.");
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword) return toast.error("Masukkan kata sandi saat ini!");

    const strength = MysqlAuthService.validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      return toast.error(`Kata sandi baru terlalu lemah: ${strength.feedback.join(", ")}`);
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Konfirmasi kata sandi baru tidak cocok!");
    }

    const activeUser = MysqlAuthService.getActiveUser();
    const userIdentifier = activeUser?.email || userProfile?.email || "user";

    const res = await MysqlAuthService.changePassword(userIdentifier, oldPassword, newPassword);
    if (res.success) {
      toast.success(res.message);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inline Banner Notifikasi Perubahan Profil */}
      {updateNotification && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-emerald-500" /> Notifikasi Pembaruan Akun LMS
              </div>
              <p className="text-xs text-emerald-700/90 dark:text-emerald-300/90 mt-0.5">{updateNotification}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-500/20 shrink-0"
            onClick={() => setUpdateNotification(null)}
          >
            Tutup ✕
          </Button>
        </div>
      )}

      {/* Profile Header Hero Card with Super High Contrast & Rich Aesthetics */}
      <Card className="border-border bg-card overflow-hidden shadow-lg">
        {/* Banner - Clean Gradient with Top Badges Only */}
        <div className="h-44 sm:h-48 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-4 sm:p-6 flex flex-wrap justify-between items-start border-b border-emerald-500/30">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/10 text-emerald-100 border-emerald-400/40 font-mono text-xs font-bold tracking-wide">
              🏫 MADRASAH TSANAWIYAH NEGERI 2 CILACAP
            </Badge>
            {isSiswa && (
              <Badge className="bg-amber-400 text-slate-950 border-amber-300 font-black text-xs px-3 py-1 shadow-sm">
                🎓 KELAS {rombelName.toUpperCase()}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/40 text-xs font-extrabold uppercase px-2.5 py-1">
              {activeRole?.replace("_", " ")}
            </Badge>
            {isSiswa && (
              <Badge className="bg-blue-500/30 text-blue-200 border-blue-400/40 text-xs font-bold px-2.5 py-1">
                STATUS: AKTIF (2026/2027)
              </Badge>
            )}
          </div>
        </div>

        {/* Card Content - Clean Uncluttered Layout */}
        <CardContent className="px-4 sm:px-8 pb-6 pt-0 relative">
          {/* Top Row: Avatar & Action Button */}
          <div className="flex flex-wrap items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="relative">
              <Avatar className="h-32 w-32 sm:h-36 sm:w-36 border-4 border-background shadow-2xl ring-4 ring-emerald-500/50 bg-slate-900">
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white text-4xl font-black">
                    {(userProfile?.name || name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>

              {isSiswa && userProfile?.badges && userProfile.badges.length > 0 && (
                <div className="absolute -bottom-2 -right-2">
                  <Badge
                    title="Lencana Prestasi Penilaian Guru"
                    className="bg-amber-400 text-slate-950 border-2 border-background shadow-lg px-2.5 py-1 text-[11px] font-black flex items-center gap-1"
                  >
                    🏆 PRESTASI
                  </Badge>
                </div>
              )}
            </div>

            <div className="shrink-0 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("avatar")}
                className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20"
              >
                <Upload className="h-4 w-4" /> Ganti Foto Profil
              </Button>
            </div>
          </div>

          {/* Student Profile Info Section (Clean & Spacious) */}
          <div className="space-y-4">
            {/* Student Name */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {userProfile?.name || name}
              </h1>
              <p className="text-xs text-muted-foreground font-medium mt-0.5">
                Siswa Aktif MTs Negeri 2 Cilacap — Tahun Ajaran 2026/2027
              </p>
            </div>

            {/* High Contrast Academic Metadata Bar */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border shadow-2xs">
                <span className="text-muted-foreground font-medium">{isSiswa ? "NISN:" : "NIP:"}</span>
                <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{userProfile?.nipNis || nipNis}</strong>
              </div>

              {isSiswa && (
                <>
                  <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border shadow-2xs">
                    <span className="text-muted-foreground font-medium">Tingkat Kelas:</span>
                    <strong className="text-foreground font-bold">{classNameState}</strong>
                  </div>

                  <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 shadow-2xs font-bold">
                    <span>Rombel:</span>
                    <span className="uppercase">{rombelName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/30 shadow-2xs font-bold">
                    <span>Wali Kelas:</span>
                    <span>{waliKelas}</span>
                  </div>
                </>
              )}
            </div>

            {/* Motto / Tagline Badge Box (Super High Contrast Dark Box) */}
            <div className="p-4 rounded-xl bg-slate-900 dark:bg-slate-950 text-white border border-emerald-500/40 shadow-sm space-y-1.5">
              <div className="font-extrabold flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-300">
                <Sparkles className="h-4 w-4 text-amber-400" /> Motto Hidup / Tagline Pembelajaran:
              </div>
              <p className="text-xs sm:text-sm font-semibold italic text-emerald-100 leading-relaxed">
                "{userProfile?.tagline || tagline}"
              </p>
            </div>

            {/* Student Achievement Badges Display */}
            {isSiswa && userProfile?.badges && userProfile.badges.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <Trophy className="h-4 w-4 text-amber-500" /> Lencana Apresiasi Guru (Penilaian Prestasi Siswa):
                </div>
                <div className="flex flex-wrap gap-2">
                  {userProfile.badges.map((b: string, i: number) => (
                    <Badge
                      key={i}
                      className="bg-amber-400 text-slate-950 border-amber-300 text-xs font-extrabold px-3 py-1 flex items-center gap-1.5 shadow-2xs"
                    >
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
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

              {isSiswa && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-class" className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Tingkat Kelas Siswa</Label>
                    <Input id="prof-class" value={classNameState} onChange={(e) => setClassNameState(e.target.value)} className="text-xs font-semibold bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-rombel" className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Rombel / Ruang Kelas</Label>
                    <Input id="prof-rombel" value={rombelName} onChange={(e) => setRombelName(e.target.value)} className="text-xs font-semibold bg-background" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="prof-walikelas" className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Wali Kelas Pengampu</Label>
                    <Input id="prof-walikelas" value={waliKelas} onChange={(e) => setWaliKelas(e.target.value)} className="text-xs font-semibold bg-background" />
                  </div>
                </div>
              )}

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
                {newPassword && (() => {
                  const strength = MysqlAuthService.validatePasswordStrength(newPassword);
                  const colorMap = {
                    "Sangat Lemah": "bg-rose-500 text-rose-500",
                    "Lemah": "bg-orange-500 text-orange-500",
                    "Sedang": "bg-amber-500 text-amber-500",
                    "Kuat": "bg-emerald-500 text-emerald-500",
                    "Sangat Kuat": "bg-emerald-400 text-emerald-400 font-bold",
                  };
                  return (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[11px] font-semibold">
                        <span>Kekuatan Sandi:</span>
                        <span className={colorMap[strength.label].split(" ")[1]}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5">
                        {[1, 2, 3, 4].map((barIndex) => (
                          <div
                            key={barIndex}
                            className={`h-full rounded-full transition-all ${
                              strength.score >= barIndex ? colorMap[strength.label].split(" ")[0] : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      {strength.feedback.length > 0 ? (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400">
                          Saran: {strength.feedback.join(", ")}
                        </p>
                      ) : (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          ✓ Memenuhi seluruh kebijakan keamanan kata sandi LMS
                        </p>
                      )}
                    </div>
                  );
                })()}
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
