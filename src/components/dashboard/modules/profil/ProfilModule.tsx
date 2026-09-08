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

function SectionHeader({ title }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
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
  const activeUserInit = MysqlAuthService.getActiveUser();
  const [name, setName] = useState(userProfile?.name || activeUserInit?.full_name || "");
  const [nipNis, setNipNis] = useState(userProfile?.nipNis || activeUserInit?.nis_nip || "");
  const [email, setEmail] = useState(userProfile?.email || activeUserInit?.email || "");
  const [phone, setPhone] = useState(userProfile?.phone || activeUserInit?.phone || "");
  const [address, setAddress] = useState(userProfile?.address || activeUserInit?.address || "");
  const [tagline, setTagline] = useState(userProfile?.tagline || "Belajar, Berprestasi, dan Berakhlakul Karimah 🚀");
  const [classNameState, setClassNameState] = useState(userProfile?.className || activeUserInit?.class_name || "-");
  const [rombelName, setRombelName] = useState(userProfile?.rombelName || activeUserInit?.class_name || "-");
  const [waliKelas, setWaliKelas] = useState(userProfile?.waliKelas || "-");

  // Avatar upload states
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(userProfile?.avatarUrl || null);

  // Security states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const isSiswa = activeRole === "siswa";
  const showAchievementsTab = activeRole === "guru" || activeRole === "walikelas" || activeRole === "siswa";

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
    if (showAchievementsTab) {
      loadAchievementsData();
    }
  }, [showAchievementsTab]);

  useEffect(() => {
    const activeUser = MysqlAuthService.getActiveUser();
    let savedBio: any = {};
    if (typeof window !== "undefined") {
      try {
        savedBio = JSON.parse(localStorage.getItem("lms_user_biodata_v1") || "{}");
      } catch (e) {}
    }

    const currentEmail = activeUser?.email || userProfile?.email || "";
    const userBio = currentEmail ? (savedBio[currentEmail.toLowerCase()] || {}) : {};

    const resolvedName = userBio.name || userProfile?.name || activeUser?.full_name || "";
    setName(resolvedName);
    setEmail(userBio.email || userProfile?.email || activeUser?.email || "");
    setNipNis(userBio.nipNis || userProfile?.nipNis || activeUser?.nis_nip || "");
    setPhone(userBio.phone || userProfile?.phone || activeUser?.phone || "");
    setAddress(userBio.address || userProfile?.address || activeUser?.address || "");
    setTagline(userBio.tagline || userProfile?.tagline || "Belajar, Berprestasi, dan Berakhlakul Karimah 🚀");
    setClassNameState(userBio.className || userProfile?.className || activeUser?.class_name || "-");
    setRombelName(userBio.rombelName || userProfile?.rombelName || activeUser?.class_name || "-");
    setWaliKelas(userBio.waliKelas || userProfile?.waliKelas || "-");
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

      if (phone.trim()) {
        await MysqlDataService.saveWaLog({
          parent_name: name.trim(),
          phone: phone.trim(),
          student_name: name.trim(),
          category: "UPDATE PROFIL",
          message: `[NOTIFIKASI AKTIVITAS USER]: Profil & email akun ${name.trim()} (${email.trim()}) berhasil diperbarui pada ${new Date().toLocaleTimeString("id-ID")} WIB.`,
          status: "TERKIRIM",
        }).catch(() => {});
      }
    } catch (e) {}

    const successMsg = `🎉 Pembaruan Berhasil! Data profil & email Anda (${email.trim()}) telah berhasil diperbarui.`;
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

  const handleSaveAvatar = async () => {
    if (!previewAvatar) return toast.error("Belum ada foto yang dipilih!");

    const currentUser = MysqlAuthService.getActiveUser();
    let finalUrl = previewAvatar;

    if (currentUser?.id) {
      try {
        const uploadRes = await MysqlDataService.uploadUserAvatar(currentUser.id, previewAvatar);
        if (uploadRes.success && uploadRes.avatarUrl) {
          finalUrl = uploadRes.avatarUrl;
        }
      } catch (err) {
        console.warn("Upload avatar to disk failed:", err);
      }
    }

    setUserProfile?.((prev: any) => ({
      ...prev,
      avatarUrl: finalUrl,
    }));

    if (typeof window !== "undefined") {
      localStorage.setItem("lms_user_avatar", finalUrl);
      if (currentUser) {
        MysqlAuthService.setActiveUser({
          ...currentUser,
          avatar_url: finalUrl,
        });
      }
    }

    setUpdateNotification("📸 Foto Profil Avatar Anda berhasil disimpan ke File Server & Database!");
    toast.success("📸 Foto Profil Avatar Berhasil Disimpan & Aktif!");
  };

  const handleResetAvatar = async () => {
    setPreviewAvatar(null);
    const currentUser = MysqlAuthService.getActiveUser();

    if (currentUser?.id) {
      try {
        await MysqlDataService.removeUserAvatar(currentUser.id);
      } catch (err) {
        console.warn("Remove avatar failed:", err);
      }
    }

    setUserProfile?.((prev: any) => ({
      ...prev,
      avatarUrl: null,
    }));

    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_user_avatar");
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

  const profileTabs = [
    { id: "biodata", label: "Biodata & Identitas", icon: UserIcon },
    { id: "avatar", label: "Foto Avatar Digital", icon: Shield },
    { id: "keamanan", label: "Keamanan & Password", icon: KeyRound },
    ...(showAchievementsTab ? [{ id: "lencana", label: "Lencana & Prestasi", icon: Trophy }] : []),
  ];

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
        {profileTabs.map((t) => (
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

      {activeTab === "lencana" && showAchievementsTab && (
        <AchievementsCard dbAchievements={dbAchievements} />
      )}
    </div>
  );
}
