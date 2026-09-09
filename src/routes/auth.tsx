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
import {
  Lock,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  Building2,
  ArrowRight,
  LogIn,
  UserPlus,
  Layers,
  CheckCircle2,
  User,
  Hash,
  BookMarked,
  Mail,
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

/* 🌌 Canvas Partikel Interaktif Konstelasi (Halus, Ringan, 60 FPS) */
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

    const mouse = { x: -1000, y: -1000, radius: 150 };

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

    // Hitung jumlah partikel optimal agar animasi tetap ringan & mulus
    const particleCount = Math.min(75, Math.floor((width * height) / 19000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 1.8 + 1.2,
      color: Math.random() > 0.45 ? "rgba(16, 185, 129, 0.75)" : "rgba(20, 184, 166, 0.75)",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Gambar titik partikel
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Hubungkan garis antar partikel yang berdekatan
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            const alpha = (1 - dist / 125) * 0.22;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(20, 184, 166, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }

        // Efek garis ke kursor mouse
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouse.radius) {
          const malpha = (1 - mdist / mouse.radius) * 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(52, 211, 153, ${malpha})`;
          ctx.lineWidth = 1.1;
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-80" />;
}

function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Form State Pendaftaran
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
      {/* 🌌 Latar Partikel Interaktif */}
      <ParticleNetworkCanvas />

      {/* Efek Cahaya Halus & Latar Belakang Modern */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Glow Aurora Hijau & Teal */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-gradient-to-tr from-emerald-600/15 via-teal-500/10 to-cyan-500/15 animate-spin-slow blur-[130px]" />
        <div className="absolute top-12 left-12 w-[400px] h-[400px] bg-emerald-500/15 rounded-full blur-[140px] animate-blob-1" />
        <div className="absolute bottom-12 right-12 w-[450px] h-[450px] bg-teal-500/15 rounded-full blur-[150px] animate-blob-2" />
        
        {/* Kisi Halus (Dot Mesh) */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70" />
      </div>

      {/* Kontainer Utama Dua Kolom */}
      <div className="max-w-6xl w-full grid lg:grid-cols-12 gap-8 lg:gap-10 items-center z-10 my-auto">
        
        {/* SISI KIRI: Branding & Informasi Unggulan (Hanya Tampil di Layar Besar) */}
        <div className="lg:col-span-6 hidden lg:flex flex-col justify-between p-8 lg:p-10 rounded-3xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-xl shadow-2xl relative overflow-hidden min-h-[580px]">
          {/* Cahaya Sudut Halus */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Branding */}
          <div className="space-y-6">
            {/* Lencana Resmi Kemenag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Building2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>KEMENTERIAN AGAMA REPUBLIK INDONESIA</span>
            </div>

            {/* Logo & Nama Sekolah */}
            <div className="flex items-center gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl blur-xs opacity-75 group-hover:opacity-100 transition duration-300" />
                <img
                  src="/logomts.png"
                  alt="Logo MTsN 2 Cilacap"
                  className="relative h-16 w-16 rounded-2xl bg-slate-950 p-2 border border-emerald-400/40 shadow-xl object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                  LMS MTsN 2 Cilacap
                </h1>
                <p className="text-xs font-semibold text-emerald-400 tracking-wider uppercase mt-1">
                  Madrasah Mandiri Berprestasi
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              Portal pembelajaran digital dan sistem informasi akademik terpadu MTs Negeri 2 Cilacap berstandar Kurikulum Merdeka Kemenag.
            </p>

            {/* 3 Kartu Keunggulan (Micro-Cards) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">KBM Digital Interaktif</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Akses modul materi ajar, jurnal kelas, dan presensi 18 pertemuan secara mudah.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">Ujian CBT & Penilaian Otomatis</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Pelaksanaan asesmen daring dengan kalkulasi nilai instan sesuai standar ketuntasan KKM 75.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-100">E-Rapor & Portofolio Siswa</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                    Pencatatan rekap nilai rapor madrasah dan pemantauan hafalan Tahfidz Al-Qur'an.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Status Keamanan */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Koneksi Aman & Database Terlindungi</span>
            </div>
            <span>© MTsN 2 Cilacap</span>
          </div>
        </div>

        {/* SISI KANAN: Formulir Masuk & Pendaftaran */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card className="bg-slate-900/85 border-emerald-500/25 shadow-2xl text-slate-100 rounded-3xl backdrop-blur-2xl overflow-hidden border">
            
            {/* Header Form */}
            <CardHeader className="text-center pb-4 pt-6 px-6 sm:px-8 border-b border-slate-800/60">
              {/* Logo di Layar HP/Mobile */}
              <div className="lg:hidden flex items-center justify-center gap-3 mb-3">
                <img
                  src="/logomts.png"
                  alt="Logo MTsN 2 Cilacap"
                  className="h-11 w-11 rounded-xl bg-slate-950 p-1.5 border border-emerald-500/40 shadow-md"
                />
                <div className="text-left">
                  <span className="text-lg font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent block">
                    LMS MTsN 2 Cilacap
                  </span>
                  <span className="text-[10px] text-emerald-400/90 font-medium">Madrasah Tsanawiyah Negeri</span>
                </div>
              </div>

              <CardTitle className="text-xl font-bold tracking-tight text-slate-100">
                Akses Portal Madrasah
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                Silakan masuk menggunakan NIP, NISN, atau Email resmi Anda.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8">
              <Tabs defaultValue="signin" className="w-full" onValueChange={() => setLoginError(null)}>
                
                {/* Switch Tab: Masuk vs Daftar */}
                <TabsList className="grid grid-cols-2 w-full bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 mb-6">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-xs rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Masuk Akun</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md font-bold text-xs rounded-xl py-2.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Daftar Baru</span>
                  </TabsTrigger>
                </TabsList>

                {/* ===== TAB MASUK AKUN ===== */}
                <TabsContent value="signin" className="space-y-4 focus-visible:outline-hidden">
                  <form onSubmit={signIn} className="space-y-4">
                    
                    {/* Kotak Pemberitahuan jika Login Gagal */}
                    {loginError && (
                      <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-rose-300 animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <div className="font-bold text-rose-200">Gagal Masuk</div>
                          <p className="text-[11px] text-rose-300/90 leading-relaxed">{loginError}</p>
                        </div>
                      </div>
                    )}

                    {/* Input NIP / NISN / Email */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="si-email" className="text-slate-200 text-xs font-semibold">
                          Identitas Masuk
                        </Label>
                        <span className="text-[10px] text-emerald-400 font-medium">NIP / NISN / Email</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                          placeholder="Masukkan NIP, NISN, atau Email"
                          className="bg-slate-950/80 border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl text-xs py-2.5 pl-10 pr-3 transition-colors placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Input Kata Sandi */}
                    <div className="space-y-1.5">
                      <Label htmlFor="si-pass" className="text-slate-200 text-xs font-semibold">
                        Kata Sandi
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                          placeholder="Ketik kata sandi Anda"
                          className="bg-slate-950/80 border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl text-xs py-2.5 pl-10 pr-10 transition-colors placeholder:text-slate-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
                          tabIndex={-1}
                          aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Petunjuk Pengguna */}
                    <div className="rounded-xl bg-slate-950/40 border border-slate-800/60 p-2.5 text-[11px] text-slate-400 leading-relaxed flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400 px-1.5 py-0">
                        INFO
                      </Badge>
                      <span>Guru gunakan NIP, siswa gunakan NISN resmi sekolah.</span>
                    </div>

                    {/* Tombol Aksi Masuk */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin" /> Memeriksa Data...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Masuk ke Portal LMS <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* ===== TAB PENDAFTARAN AKUN BARU ===== */}
                <TabsContent value="signup" className="space-y-3.5 focus-visible:outline-hidden">
                  <form onSubmit={signUp} className="space-y-3.5">
                    
                    {/* Pilih Jenis Akun (Siswa atau Guru) */}
                    <div className="space-y-1.5">
                      <Label className="text-slate-200 text-xs font-semibold">Pilih Peran Akun</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole("siswa")}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            regRole === "siswa"
                              ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-sm ring-1 ring-emerald-400/50"
                              : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <GraduationCap className="w-4 h-4" />
                          <span>Siswa</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole("guru")}
                          className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            regRole === "guru"
                              ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-sm ring-1 ring-emerald-400/50"
                              : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Guru / Pendidik</span>
                        </button>
                      </div>
                    </div>

                    {/* Nama Lengkap */}
                    <div className="space-y-1.5">
                      <Label htmlFor="su-fullname" className="text-slate-200 text-xs font-semibold">
                        Nama Lengkap
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="h-4 w-4" />
                        </div>
                        <Input
                          id="su-fullname"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder={regRole === "siswa" ? "Contoh: AHMAD FAUZI" : "Contoh: SAYONO, S.Pd., M.Pd."}
                          className="bg-slate-950/80 border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl text-xs py-2.5 pl-10 pr-3 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Nomor Induk (NISN untuk Siswa, NIP untuk Guru) */}
                    <div className="space-y-1.5">
                      <Label htmlFor="su-nisnip" className="text-slate-200 text-xs font-semibold">
                        {regRole === "siswa" ? "NISN / Nomor Induk Siswa" : "NIP / Nomor Induk Pegawai"}
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Hash className="h-4 w-4" />
                        </div>
                        <Input
                          id="su-nisnip"
                          required
                          value={nisNip}
                          onChange={(e) => setNisNip(e.target.value)}
                          placeholder={regRole === "siswa" ? "Contoh: 0127790481" : "Contoh: 197705132007101002"}
                          className="bg-slate-950/80 border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl text-xs py-2.5 pl-10 pr-3 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Kelas Rombel untuk Siswa ATAU Mata Pelajaran untuk Guru */}
                    {regRole === "siswa" ? (
                      <div className="space-y-1.5">
                        <Label className="text-slate-200 text-xs font-semibold">Rombongan Belajar (Kelas)</Label>
                        <Select value={className} onValueChange={setClassName}>
                          <SelectTrigger className="bg-slate-950/80 border-slate-800 text-white rounded-xl text-xs py-2.5 focus:border-emerald-500">
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
                        <Label htmlFor="su-mapel" className="text-slate-200 text-xs font-semibold">
                          Mata Pelajaran Utama
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <BookMarked className="h-4 w-4" />
                          </div>
                          <Input
                            id="su-mapel"
                            required
                            value={subjectSpecialty}
                            onChange={(e) => setSubjectSpecialty(e.target.value)}
                            placeholder="Contoh: Matematika / Fikih / Bahasa Indonesia"
                            className="bg-slate-950/80 border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl text-xs py-2.5 pl-10 pr-3 transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {/* Email (Opsional) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="su-email" className="text-slate-200 text-xs font-semibold">
                          Email (Opsional)
                        </Label>
                        <span className="text-[10px] text-emerald-400 font-medium">Bisa Dikosongkan</span>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                          className="bg-slate-950/80 border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl text-xs py-2.5 pl-10 pr-3 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Buat Kata Sandi */}
                    <div className="space-y-1.5">
                      <Label htmlFor="su-pass" className="text-slate-200 text-xs font-semibold">
                        Buat Kata Sandi
                      </Label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <Input
                          id="su-pass"
                          type={regShowPassword ? "text" : "password"}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="bg-slate-950/80 border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-white rounded-xl text-xs py-2.5 pl-10 pr-10 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setRegShowPassword(!regShowPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-1 rounded-md transition-colors"
                          tabIndex={-1}
                          aria-label={regShowPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        >
                          {regShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Tombol Daftar Akun */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99] cursor-pointer mt-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4 animate-spin" /> Menyiapkan Akun...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Daftar Akun {regRole === "siswa" ? "Siswa" : "Guru"}
                        </span>
                      )}
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