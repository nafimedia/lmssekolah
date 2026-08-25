import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Lock, UserCheck, ShieldCheck, GraduationCap, BookOpen, KeyRound, Eye, EyeOff, AlertCircle, Sparkles, Building2, Server, Database, CheckCircle2, ArrowRight } from "lucide-react";

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

/* 🌌 Interactive Particle Network & Constellation Canvas */
function ParticleNetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const mouse = { x: -1000, y: -1000, radius: 160 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // Generate 70 Particles with random velocities
    const particleCount = Math.min(80, Math.floor((width * height) / 18000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1.2,
      color: Math.random() > 0.4 ? "rgba(16, 185, 129, 0.8)" : "rgba(20, 184, 166, 0.8)",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and move particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on boundaries
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle dot with subtle glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();

        // Connect particles within distance
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(20, 184, 166, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }

        // Connect particle to mouse cursor if within range
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.radius) {
          const malpha = (1 - mdist / mouse.radius) * 0.45;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(52, 211, 153, ${malpha})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration Form States (Isolated from Sign In)
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
      const errorMsg = result.message || "Kata sandi yang Anda masukkan salah.";
      setLoginError(errorMsg);
      toast.error("🔒 Autentikasi Gagal!", {
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
      return toast.error(regRole === "siswa" ? "Wajib mengisikan NIS / NISN!" : "Wajib mengisikan NIP / ID Pendidik!");
    }

    const finalEmail = regEmail.trim()
      ? regEmail.trim().toLowerCase()
      : (regRole === "siswa"
          ? `${cleanNisNip}@siswa.mtsn2cilacap.sch.id`
          : `${cleanNisNip}@guru.mtsn2cilacap.sch.id`);

    const strength = MysqlAuthService.validatePasswordStrength(regPassword);
    if (!strength.isValid) {
      setLoading(false);
      return toast.error(`Kata sandi terlalu lemah: ${strength.feedback.join(", ")}`);
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
      toast.success(`Akun ${regRole === "siswa" ? "Siswa" : "Guru"} berhasil mendaftar!`);
      redirectUser(result.user.role);
    } else {
      toast.error(result.message || "Gagal mendaftar akun baru.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 lg:p-8 relative overflow-hidden font-sans">
      {/* 🌌 Interactive Particle Constellation Canvas */}
      <ParticleNetworkCanvas />

      {/* Dynamic Rotating Halo & Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-teal-500/10 bg-gradient-to-tr from-teal-500/15 via-emerald-500/10 to-cyan-500/15 animate-spin-slow blur-3xl" />
        <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[140px] animate-blob-1" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-[160px] animate-blob-2" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 items-center z-10 my-auto">
        {/* Sisi Kiri: Branding Showcase (Laptop & Desktop) */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-8 lg:p-10 rounded-3xl bg-slate-900/60 border border-teal-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden min-h-[420px]">
          {/* Subtle Ambient Light Corner */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="space-y-6 my-auto">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-extrabold border-teal-500/40 text-teal-400 bg-teal-500/10 px-3 py-1 gap-1.5 rounded-full">
                <Building2 className="h-3.5 w-3.5" /> KEMENTERIAN AGAMA REPUBLIK INDONESIA
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <img
                src="/logomts.png"
                alt="Logo MTsN 2 Cilacap"
                className="h-16 w-16 rounded-full bg-slate-950 p-1.5 border-2 border-teal-500/40 shadow-xl"
              />
              <div>
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-teal-200 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                  LMS MTsN 2 Cilacap
                </h1>
                <p className="text-xs font-semibold text-teal-400/90 tracking-wide mt-0.5">
                  Madrasah Tsanawiyah Negeri 2 Cilacap
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Platform Manajemen Pembelajaran, Presensi KBM, Asesmen CBT, dan Rapor Digital Terpadu Berbasis Kurikulum Merdeka Kemenag.
            </p>
          </div>

          {/* Clean Footer */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>LMS MTsN 2 Cilacap</span>
            <span>Hak Cipta © MTs Negeri 2 Cilacap</span>
          </div>
        </div>

        {/* Sisi Kanan: Form Card Login & Pendaftaran */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card className="bg-slate-900/90 border-teal-500/30 shadow-2xl text-slate-100 rounded-3xl backdrop-blur-2xl overflow-hidden">
            <CardHeader className="text-center pb-4 pt-6 px-6 sm:px-8 border-b border-slate-800/60">
              <div className="lg:hidden flex items-center justify-center gap-3 mb-2">
                <img
                  src="/logomts.png"
                  alt="Logo MTsN 2 Cilacap"
                  className="h-10 w-10 rounded-full bg-slate-950 p-1 border border-teal-500/40 shadow-md"
                />
                <span className="text-xl font-black bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
                  LMS MTsN 2 Cilacap
                </span>
              </div>
              <CardTitle className="text-xl font-black tracking-tight text-slate-100">
                Masuk Sistem LMS
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Silakan masukkan Email / NIP / NISN dan kata sandi Anda.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue="signin" className="w-full" onValueChange={() => setLoginError(null)}>
                <TabsList className="grid grid-cols-2 w-full bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-bold text-xs rounded-lg py-2 transition-all shadow-xs"
                  >
                    Masuk Akun
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white font-bold text-xs rounded-lg py-2 transition-all shadow-xs"
                  >
                    Daftar Akun Baru
                  </TabsTrigger>
                </TabsList>

                {/* TAB MASUK */}
                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={signIn} className="space-y-4">
                    {loginError && (
                      <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="font-bold text-rose-200">🔒 Akses Ditolak: Autentikasi Gagal</div>
                          <p className="text-[11px] text-rose-300/90">{loginError}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="si-email" className="text-slate-300 text-xs font-bold flex items-center justify-between">
                        <span>Email / Username Resmi</span>
                        <span className="text-[10px] text-teal-400 font-mono font-normal">NIP / NISN / Email</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="si-email"
                          name="email"
                          type="text"
                          autoComplete="username"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Contoh: 197906142007102002 atau kamad"
                          className="bg-slate-950 border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white rounded-xl text-xs py-2.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="si-pass" className="text-slate-300 text-xs font-bold">
                        Kata Sandi
                      </Label>
                      <div className="relative">
                        <Input
                          id="si-pass"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="bg-slate-950 border-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-white rounded-xl text-xs py-2.5 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin" /> Memverifikasi Kata Sandi...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Masuk Ke System LMS <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* TAB DAFTAR */}
                <TabsContent value="signup" className="space-y-3.5">
                  <form onSubmit={signUp} className="space-y-3.5">
                    {/* Selector Role Pendaftaran */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-300 text-xs font-bold">Pilih Jenis Akun</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole("siswa")}
                          className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all ${
                            regRole === "siswa"
                              ? "bg-teal-950 border-teal-400 text-teal-300 shadow-xs"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Siswa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole("guru")}
                          className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold border transition-all ${
                            regRole === "guru"
                              ? "bg-teal-950 border-teal-400 text-teal-300 shadow-xs"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Guru / Pendidik</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="su-fullname" className="text-slate-300 text-xs font-bold">
                        Nama Lengkap
                      </Label>
                      <Input
                        id="su-fullname"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={regRole === "siswa" ? "Contoh: AHMAD FAUZI" : "Contoh: SAYONO, S.Pd., M.Pd."}
                        className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white rounded-xl text-xs py-2.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="su-nisnip" className="text-slate-300 text-xs font-bold">
                        {regRole === "siswa" ? "NISN / Nomor Induk Siswa" : "NIP / Nomor Induk Pegawai"}
                      </Label>
                      <Input
                        id="su-nisnip"
                        required
                        value={nisNip}
                        onChange={(e) => setNisNip(e.target.value)}
                        placeholder={regRole === "siswa" ? "Contoh: 0127790481" : "Contoh: 197705132007101002"}
                        className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white rounded-xl text-xs py-2.5"
                      />
                    </div>

                    {regRole === "siswa" ? (
                      <div className="space-y-1.5">
                        <Label className="text-slate-300 text-xs font-bold">Rombel / Kelas</Label>
                        <Select value={className} onValueChange={setClassName}>
                          <SelectTrigger className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs py-2.5">
                            <SelectValue placeholder="Pilih Rombel" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-800 text-slate-100">
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
                        <Label htmlFor="su-mapel" className="text-slate-300 text-xs font-bold">
                          Mata Pelajaran Utama
                        </Label>
                        <Input
                          id="su-mapel"
                          required
                          value={subjectSpecialty}
                          onChange={(e) => setSubjectSpecialty(e.target.value)}
                          placeholder="Contoh: Matematika / Fikih / Bahasa Indonesia"
                          className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white rounded-xl text-xs py-2.5"
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label htmlFor="su-email" className="text-slate-300 text-xs font-bold flex items-center justify-between">
                        <span>Email (Opsional)</span>
                        <span className="text-[10px] text-teal-400 font-mono font-normal">Otomatis dari NISN/NIP</span>
                      </Label>
                      <Input
                        id="su-email"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder={
                          nisNip.trim()
                            ? `${nisNip.trim()}@${regRole === "siswa" ? "siswa" : "guru"}.mtsn2cilacap.sch.id`
                            : "Opsional (Otomatis dibuatkan)"
                        }
                        className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white rounded-xl text-xs py-2.5"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="su-pass" className="text-slate-300 text-xs font-bold">
                        Buat Kata Sandi Akun
                      </Label>
                      <div className="relative">
                        <Input
                          id="su-pass"
                          type={regShowPassword ? "text" : "password"}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="bg-slate-950 border-slate-800 focus:border-teal-500 text-white rounded-xl text-xs py-2.5 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword(!regShowPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition"
                          tabIndex={-1}
                        >
                          {regShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] mt-2"
                      disabled={loading}
                    >
                      {loading ? "Menyiapkan Akun..." : `Daftar Akun ${regRole === "siswa" ? "Siswa" : "Guru"}`}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}