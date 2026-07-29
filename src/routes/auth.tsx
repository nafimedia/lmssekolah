import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Lock, UserCheck, ShieldCheck, GraduationCap, BookOpen, KeyRound } from "lucide-react";

export const Route = createFileRoute("/auth")({
  ssr: false,
  beforeLoad: async () => {
    const user = MysqlAuthService.getActiveUser();
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
  
  // Registration Form States
  const [regRole, setRegRole] = useState<"siswa" | "guru">("siswa");
  const [fullName, setFullName] = useState("");
  const [nisNip, setNisNip] = useState("");
  const [className, setClassName] = useState("VIII A");
  const [subjectSpecialty, setSubjectSpecialty] = useState("Matematika");

  const redirectUser = (role: string) => {
    const targetRoute = role === "admin" ? "/admin" : "/dashboard";
    navigate({ to: targetRoute as any, replace: true });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await MysqlAuthService.authenticateUser(email, password);
    setLoading(false);

    if (result.success && result.user) {
      toast.success(`Selamat datang kembali, ${result.user.full_name}! (Argon2 Hashed)`);
      redirectUser(result.user.role);
    } else {
      toast.error("Gagal masuk. Periksa email/username & kata sandi Anda.");
    }
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!nisNip.trim()) {
      setLoading(false);
      return toast.error(regRole === "siswa" ? "Wajib mengisikan NIS / NISN!" : "Wajib mengisikan NIP / ID Pendidik!");
    }

    const result = await MysqlAuthService.registerUser({
      email,
      password,
      full_name: fullName,
      role: regRole,
      nis_nip: nisNip,
      class_name: regRole === "siswa" ? className : undefined,
      subject_specialty: regRole === "guru" ? subjectSpecialty : undefined,
    });

    setLoading(false);

    if (result.success && result.user) {
      toast.success(`Akun ${regRole === "siswa" ? "Siswa" : "Guru"} berhasil dibuat dengan Argon2!`);
      redirectUser(result.user.role);
    } else {
      toast.error("Gagal mendaftar akun baru.");
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("asd123");
    setLoading(true);

    MysqlAuthService.authenticateUser(demoEmail, "asd123").then((res) => {
      setLoading(false);
      if (res.user) {
        toast.success(`Berhasil masuk sebagai ${res.user.full_name} (${res.user.role})`);
        redirectUser(res.user.role);
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center px-4 py-8 space-y-6">
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-10 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[130px]" />
      </div>

      <Card className="w-full max-w-md bg-slate-900/90 border-teal-900/50 shadow-2xl text-slate-100 z-10">
        <CardHeader className="text-center space-y-2 pb-4">
          <img
            src="/logomts.png"
            alt="Logo MTsN 2 Cilacap"
            className="h-14 w-14 mx-auto rounded-full bg-slate-950 p-1 border border-teal-500/40 shadow-lg"
          />
          <CardTitle className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
            LMS MTsN 2 Cilacap
          </CardTitle>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Badge variant="outline" className="text-[10px] border-teal-500/50 text-teal-300 bg-teal-950/60">
              <Lock className="w-3 h-3 mr-1 text-emerald-400" /> Argon2 Encrypted
            </Badge>
            <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-300 bg-amber-950/60">
              MySQL Local Engine
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full bg-slate-950 border border-teal-900/40">
              <TabsTrigger value="signin" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white font-bold">
                Masuk Akun
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white font-bold">
                Daftar Akun Baru
              </TabsTrigger>
            </TabsList>

            {/* TAB MASUK */}
            <TabsContent value="signin">
              <form onSubmit={signIn} className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="si-email" className="text-slate-300 text-xs font-semibold">
                    Email / Username Resmi
                  </Label>
                  <Input
                    id="si-email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@mtsn2cilacap.sch.id"
                    className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="si-pass" className="text-slate-300 text-xs font-semibold">
                    Kata Sandi (Argon2 Verified)
                  </Label>
                  <Input
                    id="si-pass"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-extrabold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20"
                  disabled={loading}
                >
                  {loading ? "Memverifikasi Argon2..." : "Masuk Ke System LMS"}
                </Button>
              </form>
            </TabsContent>

            {/* TAB DAFTAR */}
            <TabsContent value="signup">
              <form onSubmit={signUp} className="space-y-3.5 mt-4">
                {/* Selector Role Pendaftaran */}
                <div className="space-y-1.5">
                  <Label className="text-slate-300 text-xs font-semibold">Pilih Jenis Akun</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole("siswa")}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border transition-all ${
                        regRole === "siswa"
                          ? "bg-teal-950 border-teal-400 text-teal-300 shadow"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>Siswa MTsN 2</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole("guru")}
                      className={`flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-bold border transition-all ${
                        regRole === "guru"
                          ? "bg-emerald-950 border-emerald-400 text-emerald-300 shadow"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Guru / Pendidik</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="su-name" className="text-slate-300 text-xs font-semibold">
                    Nama Lengkap
                  </Label>
                  <Input
                    id="su-name"
                    name="fullName"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={regRole === "siswa" ? "mis. Muhammad Fairuz" : "mis. Dra. Hj. Siti Rahmah"}
                    className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white"
                  />
                </div>

                {/* Field Khusus NISN (Siswa) vs NIP (Guru) */}
                <div className="space-y-1">
                  <Label htmlFor="su-nisnip" className="text-slate-300 text-xs font-semibold">
                    {regRole === "siswa" ? "NIS / NISN Siswa (Wajib)" : "NIP / ID Pendidik (Wajib)"}
                  </Label>
                  <Input
                    id="su-nisnip"
                    name="nisNip"
                    required
                    value={nisNip}
                    onChange={(e) => setNisNip(e.target.value)}
                    placeholder={regRole === "siswa" ? "10 Digit NISN Resmi" : "18 Digit NIP / NPTK"}
                    className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white"
                  />
                </div>

                {regRole === "siswa" ? (
                  <div className="space-y-1">
                    <Label className="text-slate-300 text-xs font-semibold">Kelas Rombel</Label>
                    <Select value={className} onValueChange={setClassName}>
                      <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                        <SelectValue placeholder="Pilih Kelas" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white">
                        <SelectItem value="VII A">Kelas VII A</SelectItem>
                        <SelectItem value="VII B">Kelas VII B</SelectItem>
                        <SelectItem value="VIII A">Kelas VIII A</SelectItem>
                        <SelectItem value="VIII B">Kelas VIII B</SelectItem>
                        <SelectItem value="IX A">Kelas IX A</SelectItem>
                        <SelectItem value="IX B">Kelas IX B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="su-subject" className="text-slate-300 text-xs font-semibold">
                      Mata Pelajaran Utama
                    </Label>
                    <Input
                      id="su-subject"
                      name="subject"
                      value={subjectSpecialty}
                      onChange={(e) => setSubjectSpecialty(e.target.value)}
                      placeholder="mis. Matematika / Al-Qur'an Hadits"
                      className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="su-email" className="text-slate-300 text-xs font-semibold">
                    Email Pengguna
                  </Label>
                  <Input
                    id="su-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@mtsn2cilacap.sch.id"
                    className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="su-pass" className="text-slate-300 text-xs font-semibold">
                    Kata Sandi (Enkripsi Argon2)
                  </Label>
                  <Input
                    id="su-pass"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength={6}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 Karakter"
                    className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 pt-2"
                  disabled={loading}
                >
                  {loading ? "Menyimpan Argon2..." : `Daftar Akun ${regRole === "siswa" ? "Siswa" : "Guru"}`}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Demo Login Bar for 7 Roles (Di-hide otomatis saat mode Production) */}
      {(import.meta.env.VITE_SHOW_QUICK_LOGIN !== "false" && import.meta.env.VITE_APP_ENV !== "production") && (
        <Card className="w-full max-w-md border-teal-900/50 bg-slate-900/80 backdrop-blur-md z-10">
          <CardHeader className="py-2.5 px-4">
            <div className="text-[11px] font-bold text-teal-300 uppercase tracking-wider text-center flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Quick Login 7 Role (Development Only)</span>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0 grid grid-cols-2 gap-2 text-xs">
            <Button variant="outline" size="sm" className="justify-start gap-1.5 h-8 text-[11px] bg-slate-950 border-slate-800 hover:border-teal-500 text-slate-200" onClick={() => handleQuickLogin("admin@mail.com")}>
              🛡️ Super Admin
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-1.5 h-8 text-[11px] bg-slate-950 border-slate-800 hover:border-teal-500 text-slate-200" onClick={() => handleQuickLogin("kamad@mtsn2cilacap.sch.id")}>
              🏛️ Kamad
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-1.5 h-8 text-[11px] bg-slate-950 border-slate-800 hover:border-teal-500 text-slate-200" onClick={() => handleQuickLogin("waka@mtsn2cilacap.sch.id")}>
              📐 Waka Kurikulum
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-1.5 h-8 text-[11px] bg-slate-950 border-slate-800 hover:border-teal-500 text-slate-200" onClick={() => handleQuickLogin("walikelas@mtsn2cilacap.sch.id")}>
              📋 Wali Kelas 8A
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-1.5 h-8 text-[11px] bg-slate-950 border-slate-800 hover:border-teal-500 text-slate-200" onClick={() => handleQuickLogin("guru@mtsn2cilacap.sch.id")}>
              👨‍🏫 Guru Pengampu
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-1.5 h-8 text-[11px] bg-slate-950 border-slate-800 hover:border-teal-500 text-slate-200" onClick={() => handleQuickLogin("siswa@mtsn2cilacap.sch.id")}>
              🎓 Siswa 8A
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}