import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Lock,
  UserCheck,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
  User,
  Hash,
  BookMarked,
  Mail,
  Sun,
  Moon,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    let user = null;
    try {
      user = await MysqlAuthService.getValidSession();
    } catch {}
    if (user) {
      const isAdmin = user.role === "admin";
      throw redirect({ to: (isAdmin ? "/admin" : "/dashboard") as any });
    }
  },
  head: () => ({
    meta: [
      { title: "Masuk & Daftar — LMS MTsN 2 Cilacap" },
      { name: "description", content: "Portal Masuk dan Pendaftaran Siswa & Guru MTs Negeri 2 Cilacap." },
      { property: "og:title", content: "Autentikasi — LMS MTsN 2 Cilacap" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tema Terang / Gelap (Light / Dark Mode)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("lms_theme");
      if (saved) return saved === "dark";
      return (
        document.documentElement.classList.contains("dark") ||
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("lms_theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("lms_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Form State Pendaftaran Akun Baru
  const [regRole, setRegRole] = useState<"siswa" | "guru">("siswa");
  const [fullName, setFullName] = useState("");
  const [nisNip, setNisNip] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [className, setClassName] = useState("Rombel 8A");
  const [subjectSpecialty, setSubjectSpecialty] = useState("Matematika");

  const redirectUser = (role: string) => {
    const targetRoute = role === "admin" ? "/admin" : "/dashboard";
    navigate({ to: targetRoute as any, replace: true });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoginError(null);

    const result = await MysqlAuthService.authenticateUser(email, password);
    setLoading(false);

    if (result.success && result.user) {
      setLoginError(null);
      toast.success(`Selamat datang kembali, ${result.user.full_name}!`);
      redirectUser(result.user.role);
    } else {
      const errorMsg = result.message || "Kata sandi atau identitas yang Anda masukkan belum sesuai.";
      setLoginError(errorMsg);
      toast.error("Akses Ditolak", {
        description: errorMsg,
      });
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanNisNip = nisNip.trim();
    if (!cleanNisNip) {
      setLoading(false);
      return toast.error(regRole === "siswa" ? "Wajib mengisi NISN / Nomor Induk Siswa!" : "Wajib mengisi NIP / Nomor Induk Pegawai!");
    }

    const finalEmail = regEmail.trim()
      ? regEmail.trim().toLowerCase()
      : (regRole === "siswa"
          ? `${cleanNisNip}@siswa.mtsn2cilacap.sch.id`
          : `${cleanNisNip}@guru.mtsn2cilacap.sch.id`);

    const strength = MysqlAuthService.validatePasswordStrength(regPassword);
    if (!strength.isValid) {
      setLoading(false);
      return toast.error(`Kata sandi terlalu sederhana: ${strength.feedback.join(", ")}`);
    }

    const result = await MysqlAuthService.registerUser({
      email: finalEmail,
      password: regPassword,
      full_name: fullName,
      role: regRole,
      nis_nip: cleanNisNip,
      class_name: regRole === "siswa" ? className : undefined,
      subject_specialty: regRole === "guru" ? subjectSpecialty : undefined,
    });

    setLoading(false);

    if (result.success && result.user) {
      toast.success(`Akun ${regRole === "siswa" ? "Siswa" : "Guru"} berhasil didaftarkan!`);
      redirectUser(result.user.role);
    } else {
      toast.error(result.message || "Pendaftaran akun belum berhasil.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      
      {/* Header Atas: Navigasi Kembali & Tombol Ganti Tema */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between pt-2 pb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ke Beranda</span>
        </Link>

        {/* Tombol Toggle Dark / Light Theme */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
          className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs transition-all cursor-pointer"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </header>

      {/* Kontainer Utama: 1 Card di Tengah Layar */}
      <main className="w-full max-w-md mx-auto my-auto">
        <Card className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl overflow-hidden transition-colors">
          
          {/* Header Card: Logo & Identitas Madrasah */}
          <CardHeader className="text-center pt-8 pb-4 px-6 sm:px-8 space-y-3">
            <div className="flex justify-center">
              <div className="p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-800/40">
                <img
                  src="/logomts.png"
                  alt="Logo MTsN 2 Cilacap"
                  className="h-14 w-14 object-contain"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                LMS MTsN 2 Cilacap
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Portal Pembelajaran & Sistem Informasi Akademik
              </CardDescription>
            </div>
          </CardHeader>

          {/* Isi Card: Tab Masuk & Daftar */}
          <CardContent className="px-6 sm:px-8 pb-8 pt-2">
            <Tabs defaultValue="signin" className="w-full" onValueChange={() => setLoginError(null)}>
              
              {/* Tab Selector */}
              <TabsList className="grid grid-cols-2 w-full bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6">
                <TabsTrigger
                  value="signin"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs font-semibold text-xs rounded-lg py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Masuk</span>
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs font-semibold text-xs rounded-lg py-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Baru</span>
                </TabsTrigger>
              </TabsList>

              {/* ===== TAB MASUK ===== */}
              <TabsContent value="signin" className="space-y-4 focus-visible:outline-hidden">
                <form onSubmit={signIn} className="space-y-4">
                  
                  {/* Alert Error Login */}
                  {loginError && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                      <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Gagal Masuk</div>
                        <p className="text-[11px] text-rose-600 dark:text-rose-300/90 mt-0.5">{loginError}</p>
                      </div>
                    </div>
                  )}

                  {/* Input NIP / NISN / Email */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="si-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        NIP / NISN / Email
                      </Label>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Akun Resmi</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <Input
                        id="si-email"
                        name="email"
                        type="text"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Contoh: 19790614... atau NISN"
                        className="pl-9 text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Input Kata Sandi */}
                  <div className="space-y-1.5">
                    <Label htmlFor="si-pass" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Kata Sandi
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="si-pass"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan kata sandi"
                        className="pl-9 pr-9 text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                        tabIndex={-1}
                        aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Catatan Bantuan Kecil */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Guru silakan gunakan NIP, siswa menggunakan NISN resmi dari madrasah.
                  </p>

                  {/* Tombol Masuk */}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" /> Memeriksa Akun...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        Masuk ke Portal LMS <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* ===== TAB PENDAFTARAN ===== */}
              <TabsContent value="signup" className="space-y-3.5 focus-visible:outline-hidden">
                <form onSubmit={signUp} className="space-y-3.5">
                  
                  {/* Pilihan Peran: Siswa / Guru */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Peran</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegRole("siswa")}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          regRole === "siswa"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Siswa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole("guru")}
                        className={`flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          regRole === "guru"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                            : "bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                        }`}
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Guru</span>
                      </button>
                    </div>
                  </div>

                  {/* Nama Lengkap */}
                  <div className="space-y-1.5">
                    <Label htmlFor="su-fullname" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nama Lengkap
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="h-4 w-4" />
                      </div>
                      <Input
                        id="su-fullname"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={regRole === "siswa" ? "Contoh: AHMAD FAUZI" : "Contoh: SAYONO, S.Pd., M.Pd."}
                        className="pl-9 text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* NISN / NIP */}
                  <div className="space-y-1.5">
                    <Label htmlFor="su-nisnip" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {regRole === "siswa" ? "NISN Siswa" : "NIP Pegawai"}
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Hash className="h-4 w-4" />
                      </div>
                      <Input
                        id="su-nisnip"
                        required
                        value={nisNip}
                        onChange={(e) => setNisNip(e.target.value)}
                        placeholder={regRole === "siswa" ? "Contoh: 0127790481" : "Contoh: 197705132007101002"}
                        className="pl-9 text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Kelas (Siswa) atau Mapel (Guru) */}
                  {regRole === "siswa" ? (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kelas / Rombel</Label>
                      <Select value={className} onValueChange={setClassName}>
                        <SelectTrigger className="text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl">
                          <SelectValue placeholder="Pilih Rombel" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          {["Rombel 7A", "Rombel 7B", "Rombel 8A", "Rombel 8B", "Rombel 9A", "Rombel 9B"].map((cls) => (
                            <SelectItem key={cls} value={cls} className="text-xs">
                              {cls}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label htmlFor="su-mapel" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Mata Pelajaran Utama
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <BookMarked className="h-4 w-4" />
                        </div>
                        <Input
                          id="su-mapel"
                          required
                          value={subjectSpecialty}
                          onChange={(e) => setSubjectSpecialty(e.target.value)}
                          placeholder="Contoh: Matematika / Fikih"
                          className="pl-9 text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email (Opsional) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="su-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email (Opsional)
                      </Label>
                      <span className="text-[10px] text-slate-400">Bisa dikosongkan</span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="h-4 w-4" />
                      </div>
                      <Input
                        id="su-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={
                          nisNip.trim()
                            ? `${nisNip.trim()}@${regRole === "siswa" ? "siswa" : "guru"}.mtsn2cilacap.sch.id`
                            : "Dibuat otomatis dari NISN / NIP"
                        }
                        className="pl-9 text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Kata Sandi */}
                  <div className="space-y-1.5">
                    <Label htmlFor="su-pass" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Buat Kata Sandi
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="su-pass"
                        type={regShowPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Minimal 6 karakter"
                        className="pl-9 pr-9 text-xs py-2 bg-slate-50/50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-emerald-500 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setRegShowPassword(!regShowPassword)}
                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
                        tabIndex={-1}
                        aria-label={regShowPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                      >
                        {regShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Tombol Buat Akun */}
                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Sparkles className="h-4 w-4 animate-spin" /> Mendaftarkan...
                      </span>
                    ) : (
                      <span>Daftar Akun {regRole === "siswa" ? "Siswa" : "Guru"}</span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer Sederhana di Bawah Card */}
      <footer className="w-full max-w-md mx-auto text-center py-4 space-y-1">
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          © {new Date().getFullYear()} MTs Negeri 2 Cilacap
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Kementerian Agama Republik Indonesia
        </p>
      </footer>
    </div>
  );
}