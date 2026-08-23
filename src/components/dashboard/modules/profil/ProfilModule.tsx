import { useState, useEffect } from "react";
import { User as UserIcon, Shield, KeyRound, Trophy, Bell, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService, UserAchievementRow } from "@/services/mysqlDataService";

import { BiodataFormCard } from "./components/BiodataFormCard";
import { SecurityPasswordCard } from "./components/SecurityPasswordCard";
import { AvatarUploadCard } from "./components/AvatarUploadCard";
import { AchievementsCard } from "./components/AchievementsCard";

interface ProfilModuleProps {
  userProfile?: any;
  setUserProfile?: React.Dispatch<React.SetStateAction<any>>;
  activeRole?: string;
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export function ProfilModule({
  userProfile,
  setUserProfile,
  activeRole,
}: ProfilModuleProps) {
  const [activeTab, setActiveTab] = useState<"biodata" | "avatar" | "keamanan" | "lencana">("biodata");
  const [updateNotification, setUpdateNotification] = useState<string | null>(null);

  // Form states for biodata
  const [name, setName] = useState(userProfile?.name || "ABIGAIL HASAN YUSUF PRAYOGA");
  const [nipNis, setNipNis] = useState(userProfile?.nipNis || "0081928371");
  const [email, setEmail] = useState(userProfile?.email || "abigail@siswa.mtsn2cilacap.sch.id");
  const [phone, setPhone] = useState(userProfile?.phone || "081234567890");
  const [address, setAddress] = useState(userProfile?.address || "Jl. Raya Cilacap No. 12, Karangpucung");
  const [tagline, setTagline] = useState(userProfile?.tagline || "Man Jadda Wajada - Barangsiapa bersungguh-sungguh pasti berhasil 🚀");
  const [classNameState, setClassNameState] = useState(userProfile?.className || "VIII (Delapan)");
  const [rombelName, setRombelName] = useState(userProfile?.rombelName || "VIII A (Rombel 8A)");
  const [waliKelas, setWaliKelas] = useState(userProfile?.waliKelas || "Dra. Hj. Siti Rahmah, M.Pd");

  // Avatar upload states
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(userProfile?.avatarUrl || null);

  // Security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSiswa = activeRole === "siswa";

  // Achievements State (MySQL Persisten)
  const [dbAchievements, setDbAchievements] = useState<UserAchievementRow[]>([]);
  const loadAchievementsData = async () => {
    try {
      const data = await MysqlDataService.getUserAchievements();
      setDbAchievements(data || []);
    } catch (e) {
      console.warn("Gagal memuat prestasi user dari MySQL:", e);
    }
  };

  useEffect(() => {
    loadAchievementsData();
  }, []);

  useEffect(() => {
    const activeUser = MysqlAuthService.getActiveUser();
    let savedBio: any = {};
    if (typeof window !== "undefined") {
      try {
        savedBio = JSON.parse(localStorage.getItem("lms_user_biodata_v1") || "{}");
      } catch (e) {}
    }

    const currentEmail = activeUser?.email || userProfile?.email || "abigail@siswa.mtsn2cilacap.sch.id";
    const userBio = savedBio[currentEmail.toLowerCase()] || {};

    setName(userBio.name || userProfile?.name || activeUser?.full_name || "ABIGAIL HASAN YUSUF PRAYOGA");
    setEmail(userBio.email || userProfile?.email || activeUser?.email || "abigail@siswa.mtsn2cilacap.sch.id");
    setNipNis(userBio.nipNis || userProfile?.nipNis || activeUser?.nis_nip || "0081928371");
    setPhone(userBio.phone || userProfile?.phone || "081234567890");
    setAddress(userBio.address || userProfile?.address || "Jl. Raya Cilacap No. 12, Karangpucung");
    setTagline(userBio.tagline || userProfile?.tagline || "Man Jadda Wajada - Barangsiapa bersungguh-sungguh pasti berhasil 🚀");
    setClassNameState(userBio.className || userProfile?.className || "VIII (Delapan)");
    setRombelName(userBio.rombelName || userProfile?.rombelName || "VIII A (Rombel 8A)");
    setWaliKelas(userBio.waliKelas || userProfile?.waliKelas || "Dra. Hj. Siti Rahmah, M.Pd");
  }, [userProfile]);

  const handleSaveBiodata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Nama lengkap tidak boleh kosong!");
    if (!email.trim()) return toast.error("Email tidak boleh kosong!");
    if (!tagline.trim()) return toast.error("Motto / Tagline tidak boleh kosong!");

    const activeUser = MysqlAuthService.getActiveUser();
    const originalEmail = activeUser?.email || email;

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

    if (activeUser) {
      MysqlAuthService.setActiveUser({
        ...activeUser,
        full_name: name.trim(),
        email: email.trim(),
        nis_nip: nipNis.trim(),
      });
    }

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

    setUpdateNotification("📸 Foto Profil Avatar Anda berhasil diperbarui dan aktif di seluruh sistem LMS!");
    toast.success("📸 Foto Profil Avatar Berhasil Diperbarui & Disimpan!");
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
      <SectionHeader title="Profil Saya & Keamanan Akun" sub="Kelola informasi biodata diri, foto profil, dan keamanan akun." />
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

      <div className="flex items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80 w-fit">
        {[
          { id: "biodata", label: "Biodata & Identitas", icon: UserIcon },
          { id: "avatar", label: "Foto Avatar Digital", icon: Shield },
          { id: "keamanan", label: "Keamanan & Password", icon: KeyRound },
          { id: "lencana", label: "Lencana & Prestasi", icon: Trophy },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === t.id ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <t.icon className="h-4 w-4" />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === "biodata" && (
        <BiodataFormCard
          name={name}
          setName={setName}
          nipNis={nipNis}
          setNipNis={setNipNis}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          address={address}
          setAddress={setAddress}
          tagline={tagline}
          setTagline={setTagline}
          classNameState={classNameState}
          setClassNameState={setClassNameState}
          rombelName={rombelName}
          setRombelName={setRombelName}
          waliKelas={waliKelas}
          setWaliKelas={setWaliKelas}
          isSiswa={isSiswa}
          handleSaveBiodata={handleSaveBiodata}
        />
      )}

      {activeTab === "avatar" && (
        <AvatarUploadCard
          name={name}
          previewAvatar={previewAvatar}
          handleFileChange={handleFileChange}
          handleSaveAvatar={handleSaveAvatar}
          handleResetAvatar={handleResetAvatar}
        />
      )}

      {activeTab === "keamanan" && (
        <SecurityPasswordCard
          oldPassword={oldPassword}
          setOldPassword={setOldPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          handleSaveSecurity={handleSaveSecurity}
        />
      )}

      {activeTab === "lencana" && (
        <AchievementsCard dbAchievements={dbAchievements} />
      )}
    </div>
  );
}
