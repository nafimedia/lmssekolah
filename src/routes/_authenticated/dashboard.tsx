import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo-mtsn2.png.asset.json";
import { useEffect, useState } from "react";
import {
  Home,
  BookOpen,
  Users,
  Megaphone,
  Bell,
  Search,
  ChevronDown,
  FileText,
  Video,
  Headphones,
  FileCode2,
  ClipboardCheck,
  CalendarDays,
  Download,
  Upload,
  BarChart3,
  Menu as MenuIcon,
  LogOut,
  Settings,
  PencilLine,
  Brain,
  MonitorCheck,
  GraduationCap,
  LineChart,
  BookMarked,
  ScrollText,
  Library,
  User as UserIcon,
  Trophy,
  Medal,
  Flame,
  Star,
  Moon,
  Sun,
  CalendarClock,
  Shield,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Layers,
  Building2,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarRail,
} from "@/components/ui/sidebar";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type MenuKey =
  | "beranda"
  | "siakad"
  | "users"
  | "pengumuman"
  | "jadwal"
  | "mapel"
  | "tugas"
  | "quiz"
  | "cbt"
  | "nilai"
  | "progress"
  | "tahfidz"
  | "erapor"
  | "perpustakaan"
  | "profil"
  | "pengaturan";

const MENU: { key: MenuKey; label: string; icon: typeof Home; group?: string }[] = [
  { key: "beranda", label: "Beranda", icon: Home, group: "Utama" },
  { key: "siakad", label: "SIAKAD Master & Pengampu", icon: BarChart3, group: "Utama" },
  { key: "users", label: "Data User & Role", icon: Shield, group: "Utama" },
  { key: "pengumuman", label: "Pengumuman", icon: Megaphone, group: "Utama" },
  { key: "jadwal", label: "Jadwal Pelajaran", icon: CalendarClock, group: "Utama" },
  { key: "mapel", label: "Mata Pelajaran", icon: BookOpen, group: "Akademik" },
  { key: "tugas", label: "Tugas", icon: PencilLine, group: "Akademik" },
  { key: "quiz", label: "Quiz", icon: Brain, group: "Akademik" },
  { key: "cbt", label: "CBT / Ujian", icon: MonitorCheck, group: "Akademik" },
  { key: "nilai", label: "Nilai", icon: GraduationCap, group: "Penilaian" },
  { key: "progress", label: "Progress Belajar", icon: LineChart, group: "Penilaian" },
  { key: "tahfidz", label: "Tahfidz", icon: BookMarked, group: "Penilaian" },
  { key: "erapor", label: "E-Rapor", icon: ScrollText, group: "Penilaian" },
  { key: "perpustakaan", label: "Perpustakaan Digital", icon: Library, group: "Lainnya" },
  { key: "profil", label: "Profil", icon: UserIcon, group: "Lainnya" },
  { key: "pengaturan", label: "Pengaturan & Audit Log", icon: Settings, group: "Lainnya" },
];

const ROLE_PERMISSIONS: Record<
  string,
  { label: string; badge: string; allowedMenus: { key: MenuKey; label?: string; group?: string }[] }
> = {
  admin: {
    label: "Super Administrator",
    badge: "🛡️ SUPER ADMIN PORTAL",
    allowedMenus: [
      { key: "beranda", label: "Beranda & Log Sistem", group: "Utama & Kontrol" },
      { key: "siakad", label: "SIAKAD Master & Pengampu", group: "Utama & Kontrol" },
      { key: "users", label: "Data User & Perizinan", group: "Utama & Kontrol" },
      { key: "mapel", label: "Master Pelajaran", group: "Akademik" },
      { key: "jadwal", label: "Master Jadwal", group: "Akademik" },
      { key: "pengumuman", label: "Pengumuman", group: "Akademik" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi & CBT" },
      { key: "nilai", label: "Rekap Nilai Sistem", group: "Evaluasi & CBT" },
      { key: "pengaturan", label: "System Log & Backup", group: "Pengaturan" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  admin_akademik: {
    label: "Administrator Akademik",
    badge: "💼 ADMIN AKADEMIK",
    allowedMenus: [
      { key: "beranda", label: "Beranda Akademik", group: "Master Data" },
      { key: "siakad", label: "SIAKAD Master & Pengampu", group: "Master Data" },
      { key: "users", label: "Data Guru & Siswa", group: "Master Data" },
      { key: "mapel", label: "Master Mapel", group: "Master Data" },
      { key: "jadwal", label: "Master Jadwal", group: "Master Data" },
      { key: "pengumuman", label: "Pengumuman Resmi", group: "Informasi & Perpus" },
      { key: "perpustakaan", label: "Perpustakaan Digital", group: "Informasi & Perpus" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  kamad: {
    label: "Kepala Madrasah",
    badge: "🏛️ KEPALA MADRASAH",
    allowedMenus: [
      { key: "beranda", label: "Executive Dashboard", group: "Eksekutif" },
      { key: "siakad", label: "SIAKAD Master Data", group: "Eksekutif" },
      { key: "pengumuman", label: "Pengumuman", group: "Informasi" },
      { key: "jadwal", label: "Jadwal Pelajaran", group: "Informasi" },
      { key: "progress", label: "Progress Guru & Siswa", group: "Monitoring & Laporan" },
      { key: "nilai", label: "Laporan Hasil Belajar", group: "Monitoring & Laporan" },
      { key: "cbt", label: "Monitoring CBT Live", group: "Monitoring & Laporan" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  waka: {
    label: "Waka Kurikulum",
    badge: "📐 WAKA KURIKULUM",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Kurikulum", group: "Kurikulum & Validasi" },
      { key: "siakad", label: "SIAKAD Master & Pengampu", group: "Kurikulum & Validasi" },
      { key: "mapel", label: "Perangkat Ajar 1-18", group: "Kurikulum & Validasi" },
      { key: "jadwal", label: "Monitoring Jadwal", group: "Kurikulum & Validasi" },
      { key: "pengumuman", label: "Pengumuman", group: "Evaluasi" },
      { key: "progress", label: "Ketuntasan CP / TP", group: "Evaluasi" },
      { key: "nilai", label: "Rekap Nilai", group: "Evaluasi" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  walikelas: {
    label: "Wali Kelas 8A",
    badge: "📋 WALI KELAS 8A",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Kelas 8A", group: "Manajemen Kelas" },
      { key: "jadwal", label: "Jadwal Kelas 8A", group: "Manajemen Kelas" },
      { key: "pengumuman", label: "Pengumuman", group: "Manajemen Kelas" },
      { key: "nilai", label: "Nilai Siswa 8A", group: "E-Rapor & Nilai" },
      { key: "progress", label: "Presensi & Catatan Sikap", group: "E-Rapor & Nilai" },
      { key: "erapor", label: "E-Rapor & Cetak Rapor", group: "E-Rapor & Nilai" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  guru: {
    label: "Guru Pengampu",
    badge: "👨‍🏫 GURU PENGAMPU",
    allowedMenus: [
      { key: "beranda", label: "Beranda Mengajar", group: "Ruang Mengajar" },
      { key: "mapel", label: "Mata Pelajaran Diampu", group: "Ruang Mengajar" },
      { key: "jadwal", label: "Jadwal Mengajar", group: "Ruang Mengajar" },
      { key: "tugas", label: "Koreksi Tugas LKPD", group: "Penilaian & CBT" },
      { key: "quiz", label: "Kuis Interaktif", group: "Penilaian & CBT" },
      { key: "cbt", label: "CBT Bank Soal & Nilai", group: "Penilaian & CBT" },
      { key: "nilai", label: "Input Rekap Nilai", group: "Penilaian & CBT" },
      { key: "pengumuman", label: "Pengumuman", group: "Informasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  siswa: {
    label: "Siswa Kelas 8A",
    badge: "🎓 RUANG BELAJAR SISWA",
    allowedMenus: [
      { key: "beranda", label: "Beranda Belajar", group: "Ruang Belajar" },
      { key: "mapel", label: "Ruang Belajar (Pertemuan 1-18)", group: "Ruang Belajar" },
      { key: "jadwal", label: "Jadwal Saya", group: "Ruang Belajar" },
      { key: "tugas", label: "Tugas & Submisi LKPD", group: "Evaluasi & Ujian" },
      { key: "quiz", label: "Kuis Interaktif", group: "Evaluasi & Ujian" },
      { key: "cbt", label: "CBT / Ujian Online", group: "Evaluasi & Ujian" },
      { key: "nilai", label: "Nilai Saya", group: "Progress & Rapor" },
      { key: "progress", label: "Progress Belajar", group: "Progress & Rapor" },
      { key: "tahfidz", label: "Setoran Tahfidz", group: "Progress & Rapor" },
      { key: "erapor", label: "E-Rapor Saya", group: "Progress & Rapor" },
      { key: "perpustakaan", label: "Perpustakaan Digital", group: "Lainnya" },
      { key: "profil", label: "Profil & Lencana", group: "Lainnya" },
    ],
  },
};

function Dashboard() {
  const [active, setActive] = useState<MenuKey>("beranda");
  const [openMobile, setOpenMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeRole, setActiveRole] = useState<string>("siswa");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const roleInfo = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.siswa;
  const allowedKeys = roleInfo.allowedMenus.map((x) => x.key);

  const filteredMenu = roleInfo.allowedMenus.map((item) => {
    const base = MENU.find((m) => m.key === item.key)!;
    return {
      ...base,
      label: item.label || base.label,
      group: item.group || base.group,
    };
  });

  const groups = Array.from(new Set(filteredMenu.map((m) => m.group)));

  useEffect(() => {
    if (!allowedKeys.includes(active)) {
      setActive("beranda");
    }
  }, [activeRole]);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const demoStr = typeof window !== "undefined" ? localStorage.getItem("lms_demo_user") : null;
      if (demoStr) {
        try {
          const demoObj = JSON.parse(demoStr);
          if (demoObj && demoObj.role) {
            return {
              full_name: demoObj.full_name || demoObj.email || "Pengguna Demo",
              role: demoObj.role,
              email: demoObj.email,
            };
          }
        } catch (e) {}
      }

      const { data: userRes } = await supabase.auth.getUser();
      const uid = userRes.user?.id;
      if (!uid) return null;
      const [{ data: profile }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("full_name,nis,class").eq("id", uid).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", uid),
      ]);
      const priority = ["admin", "kamad", "waka", "guru", "siswa"] as const;
      const role = priority.find((r) => roles?.some((x) => x.role === r)) ?? "siswa";
      return {
        full_name: profile?.full_name || userRes.user?.email || "",
        role,
        email: userRes.user?.email,
      };
    },
  });

  useEffect(() => {
    if (me?.role) {
      setActiveRole(me.role);
    }
  }, [me]);

  const handleSignOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lms_demo_user");
    }
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background text-foreground font-sans">
        {/* Lovable Native Shadcn Sidebar Universal 7 Peran */}
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          
          {/* Header Sidebar */}
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <img
                src="/logomts.png"
                alt="Logo MTsN 2 Cilacap"
                className="h-10 w-10 object-contain rounded-xl bg-white p-1 shadow-sm border border-sidebar-border shrink-0"
              />
              <div className="leading-tight overflow-hidden">
                <div className="font-bold text-sm text-sidebar-foreground truncate">MTsN 2 Cilacap</div>
                <div className="text-[11px] text-sidebar-primary font-bold truncate uppercase">{roleInfo.badge}</div>
              </div>
            </div>
          </SidebarHeader>

          {/* Sidebar Content */}
          <SidebarContent className="px-2 py-4 space-y-4">
            {groups.map((g) => (
              <SidebarGroup key={g}>
                <SidebarGroupLabel className="text-xs font-bold text-sidebar-foreground/60 uppercase tracking-wider px-2 mb-1">
                  {g}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredMenu.filter((m) => m.group === g).map((m) => {
                      const Icon = m.icon;
                      const isActive = active === m.key;
                      return (
                        <SidebarMenuItem key={m.key}>
                          <SidebarMenuButton
                            isActive={isActive}
                            onClick={() => setActive(m.key)}
                            className="gap-3 font-semibold data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground hover:bg-sidebar-accent"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{m.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* Footer Sidebar */}
          <SidebarFooter className="p-3 border-t border-sidebar-border bg-sidebar-accent/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {(me?.full_name || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="leading-tight overflow-hidden">
                  <div className="text-xs font-semibold truncate text-sidebar-foreground">{me?.full_name || "Pengguna"}</div>
                  <div className="text-[10px] text-sidebar-primary font-bold capitalize truncate">{activeRole.replace("_", " ")}</div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-destructive hover:bg-destructive/10 shrink-0" title="Keluar">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          
          {/* Topbar Header */}
          <header className="sticky top-0 z-20 h-16 border-b border-border bg-card/90 backdrop-blur-md px-4 lg:px-8 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-9 w-9 text-foreground hover:bg-accent" />
              <div className="h-4 w-[1px] bg-border hidden sm:block" />

              <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
                <div className="flex items-center gap-2 w-full bg-muted/60 rounded-lg px-3 py-1.5 border border-border">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    className="bg-transparent outline-none text-sm w-full"
                    placeholder="Cari mapel, tugas, materi…"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setDark((v) => !v)}
                aria-label="Toggle dark mode"
              >
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Role Switcher (7 Peran) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1.5 text-xs font-semibold bg-primary/10 text-primary border-primary/30">
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span>Role: {activeRole.toUpperCase().replace("_", " ")}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs">Ganti Mode Perspektif Role</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setActiveRole("admin"); setActive("users"); toast.info("Mode Perspektif: SUPER ADMIN"); }}>
                    🛡️ Super Admin
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("admin_akademik"); toast.info("Mode Perspektif: ADMIN AKADEMIK"); }}>
                    💼 Admin Akademik
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("kamad"); toast.info("Mode Perspektif: KEPALA MADRASAH"); }}>
                    🏛️ Kepala Madrasah (Executive)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("waka"); toast.info("Mode Perspektif: WAKA KURIKULUM"); }}>
                    📐 Waka Kurikulum
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("wali_kelas"); toast.info("Mode Perspektif: WALI KELAS"); }}>
                    📋 Wali Kelas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("guru"); toast.info("Mode Perspektif: GURU PENGAMPU"); }}>
                    👨‍🏫 Guru Pengampu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("siswa"); toast.info("Mode Perspektif: SISWA"); }}>
                    🎓 Siswa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="icon" variant="ghost" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-secondary" />
              </Button>

              {/* Pojok Akun */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-muted transition">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {(me?.full_name || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left leading-tight">
                      <div className="text-sm font-semibold">{me?.full_name || "Pengguna"}</div>
                      <div className="text-[11px] text-muted-foreground capitalize">{activeRole.replace("_", " ")}</div>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActive("profil")}>
                    <UserIcon className="h-4 w-4 mr-2" /> Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setActive("users")}>
                    <Shield className="h-4 w-4 mr-2" /> Data User & Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          <main className="p-4 lg:p-8 flex-1">
          {active === "beranda" && <Beranda activeRole={activeRole} />}
          {active === "siakad" && <SiakadMasterData />}
          {active === "users" && <DataUserRole />}
          {active === "pengumuman" && <Pengumuman />}
          {active === "jadwal" && <Jadwal />}
          {active === "mapel" && <MataPelajaran />}
          {active === "tugas" && <Tugas />}
          {active === "quiz" && <Quiz />}
          {active === "cbt" && <CBT />}
          {active === "nilai" && <Nilai />}
          {active === "progress" && <Progress />}
          {active === "tahfidz" && <Tahfidz />}
          {active === "erapor" && <ERapor />}
          {active === "perpustakaan" && <Perpustakaan />}
          {active === "profil" && <Profil />}
          {active === "pengaturan" && <Pengaturan />}
        </main>
      </div>
    </div>
  </SidebarProvider>
);
}

/* ---------- Pages ---------- */

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

function Beranda({ activeRole }: { activeRole: string }) {
  // Executive Dashboard (Kepala Madrasah & Waka Kurikulum)
  if (activeRole === "kamad" || activeRole === "waka") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white p-6 lg:p-8 shadow-xl border border-emerald-500/30">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3">
            EXECUTIVE MONITORING DASHBOARD
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">
            {activeRole === "kamad" ? "Assalamu'alaikum, Bapak Kepala Madrasah 🏛️" : "Assalamu'alaikum, Waka Kurikulum 📐"}
          </h2>
          <p className="mt-2 text-sm text-slate-200 max-w-2xl leading-relaxed">
            Ringkasan kuis, ketuntasan kurikulum digital, persentase kehadiran guru & siswa, serta status ujian CBT online di MTsN 2 Cilacap.
          </p>
        </div>

        {/* Executive Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Total Siswa Aktif</div>
                <div className="text-xl font-bold font-mono">948 Siswa</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-secondary/30 text-secondary-foreground grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Total Guru Pengampu</div>
                <div className="text-xl font-bold font-mono">54 Guru</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Rata-rata Kehadiran</div>
                <div className="text-xl font-bold font-mono text-emerald-500">96.4%</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Ketuntasan KKM CBT</div>
                <div className="text-xl font-bold font-mono text-blue-500">92.8%</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Monitoring Cards */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <LineChart className="h-5 w-5 text-primary" /> Progress Pembelajaran Perangkat Ajar Guru
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { mapel: "Al-Qur'an Hadits", teacher: "Dra. Hj. Siti Rahmah", status: "18 Pertemuan (100%)", c: "text-emerald-500" },
                { mapel: "Akidah Akhlak", teacher: "Ust. Abdul Halim, S.Ag", status: "16 Pertemuan (88%)", c: "text-blue-500" },
                { mapel: "Matematika", teacher: "Bapak Hendra Wijaya", status: "15 Pertemuan (83%)", c: "text-amber-500" },
                { mapel: "Informatika & Coding", teacher: "H. Ahmad Syukri, S.Kom", status: "18 Pertemuan (100%)", c: "text-emerald-500" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-muted/40 border border-border/50 text-sm">
                  <div>
                    <div className="font-bold text-foreground">{row.mapel}</div>
                    <div className="text-xs text-muted-foreground">{row.teacher}</div>
                  </div>
                  <Badge variant="outline" className={`font-mono text-xs font-bold ${row.c}`}>
                    {row.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <MonitorCheck className="h-5 w-5 text-emerald-500" /> Monitoring Sesi Ujian CBT Online
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">CBT PAT Al-Qur'an Hadits (Kelas 8)</div>
                  <div className="text-xs text-muted-foreground">32 Siswa Mengerjakan • Latensi Server 14ms</div>
                </div>
                <Badge className="bg-emerald-600 text-white">AKTIF</Badge>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex justify-between items-center">
                <div>
                  <div className="font-bold text-sm text-foreground">CBT PAT Matematika (Kelas 9)</div>
                  <div className="text-xs text-muted-foreground">128 Siswa Selesai • Rata-rata Nilai 84.5</div>
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-600">SELESAI</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Wali Kelas Dashboard
  if (activeRole === "wali_kelas") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-950 text-white p-6 lg:p-8 shadow-xl border border-blue-500/30">
          <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-3">
            DASHBOARD WALI KELAS 8A
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Assalamu'alaikum, Wali Kelas 8A 📋</h2>
          <p className="mt-2 text-sm text-slate-200 max-w-2xl leading-relaxed">
            Pemantauan presensi harian siswa kelas 8A, catatan perkembangan wali kelas, serta pengisian dan pencetakan E-Rapor Madrasah.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Siswa Kelas 8A</div>
                <div className="text-xl font-bold font-mono">32 Siswa</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Presensi Kelas 8A</div>
                <div className="text-xl font-bold font-mono text-emerald-500">98% Hadir</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold">
                <ScrollText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Status E-Rapor</div>
                <div className="text-xl font-bold font-mono text-amber-500">Siap Cetak</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-purple-500/15 text-purple-500 grid place-items-center font-bold">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Rata-rata Nilai 8A</div>
                <div className="text-xl font-bold font-mono text-purple-500">88.4</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Guru Pengampu Dashboard
  if (activeRole === "guru") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-950 text-white p-6 lg:p-8 shadow-xl border border-emerald-500/30">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 mb-3">
            DASHBOARD GURU PENGAMPU
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Assalamu'alaikum, Ibu Dra. Hj. Siti Rahmah, M.Pd 👨‍🏫</h2>
          <p className="mt-2 text-sm text-slate-200 max-w-2xl leading-relaxed">
            Kelola jadwal mengajar, pengunggahan modul Pertemuan 1-18, pemeriksaan tugas siswa, serta penilaian CBT online.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center font-bold">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Mapel Diampu</div>
                <div className="text-xl font-bold font-mono">Al-Qur'an Hadits & Fikih</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold">
                <PencilLine className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Tugas Menunggu Penilaian</div>
                <div className="text-xl font-bold font-mono text-amber-500">3 Tugas</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Jadwal Mengajar Hari Ini</div>
                <div className="text-xl font-bold font-mono text-blue-500">2 Kelas (8A & 9C)</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Presensi Mengajar</div>
                <div className="text-xl font-bold font-mono text-emerald-500">100% Tuntas</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Admin Akademik Dashboard
  if (activeRole === "admin_akademik") {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 lg:p-8 shadow-xl border border-indigo-500/30">
          <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-3">
            DASHBOARD ADMIN AKADEMIK
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-extrabold">Assalamu'alaikum, Admin Akademik 💼</h2>
          <p className="mt-2 text-sm text-slate-200 max-w-2xl leading-relaxed">
            Pengelolaan jadwal pelajaran, plotting rombel & kelas, perpustakaan digital, serta pengumuman resmi madrasah.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Master Siswa</div>
                <div className="text-xl font-bold font-mono">948 Siswa</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Master Guru</div>
                <div className="text-xl font-bold font-mono">54 Guru</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Total Rombel</div>
                <div className="text-xl font-bold font-mono text-emerald-500">24 Rombel</div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold">Tahun Ajaran</div>
                <div className="text-xl font-bold font-mono text-amber-500">2026/2027 Ganjil</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Siswa & Default Dashboard
  const stats = [
    { label: "Siswa Aktif", value: "842", icon: Users },
    { label: "Mata Pelajaran", value: "24", icon: BookOpen },
    { label: "Tugas Baru", value: "12", icon: FileText },
    { label: "Kehadiran Hari Ini", value: "96%", icon: ClipboardCheck },
  ];
  return (
    <>
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-6 lg:p-8 mb-6 relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <Badge className="bg-secondary text-secondary-foreground mb-3">Selamat Datang</Badge>
          <h2 className="text-2xl lg:text-3xl font-bold">Assalamu'alaikum, Ahmad 👋</h2>
          <p className="mt-2 text-sm opacity-90">
            Semangat mengajar hari ini. Ada 3 tugas menunggu penilaian dan 2 kelas terjadwal.
          </p>
          <div className="mt-4 flex gap-2">
            <Button variant="secondary">Lihat Jadwal</Button>
            <Button variant="outline" className="bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
              Buat Tugas
            </Button>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-secondary/30 blur-2xl" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-xl font-bold">{s.value}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { t: "Tugas Matematika Bab 3 diunggah", who: "Bu Sari", time: "10 mnt lalu", icon: Upload },
              { t: "12 siswa mengumpulkan tugas B. Arab", who: "Kelas 8A", time: "1 jam lalu", icon: FileText },
              { t: "Ulangan IPA dinilai (32/32)", who: "Pak Rudi", time: "3 jam lalu", icon: ClipboardCheck },
              { t: "Materi video Fikih ditambahkan", who: "Pak Umar", time: "Kemarin", icon: Video },
            ].map((a, i) => {
              const Icon = a.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                  <div className="h-9 w-9 rounded-lg bg-accent grid place-items-center text-accent-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{a.t}</div>
                    <div className="text-xs text-muted-foreground">{a.who}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{a.time}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Jadwal Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { j: "07.30", m: "Matematika", k: "8A" },
              { j: "09.15", m: "B. Arab", k: "7B" },
              { j: "10.45", m: "Fikih", k: "9C" },
              { j: "13.00", m: "IPA Terpadu", k: "8A" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3 border-l-4 border-primary pl-3 py-1">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{s.m}</div>
                  <div className="text-xs text-muted-foreground">Kelas {s.k}</div>
                </div>
                <div className="text-xs font-mono">{s.j}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Gamifikasi: Lencana & Leaderboard */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Medal className="h-4 w-4 text-secondary" /> Lencana Saya
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-3">
            {[
              { i: Flame, t: "Rajin 7 Hari", c: "bg-orange-500/15 text-orange-500" },
              { i: Star, t: "Nilai Sempurna", c: "bg-yellow-500/15 text-yellow-500" },
              { i: BookOpen, t: "Kutu Buku", c: "bg-primary/15 text-primary" },
              { i: Trophy, t: "Juara Kuis", c: "bg-secondary/20 text-secondary" },
              { i: ClipboardCheck, t: "Tepat Waktu", c: "bg-emerald-500/15 text-emerald-500" },
              { i: Brain, t: "Master Quiz", c: "bg-purple-500/15 text-purple-500" },
            ].map((b, i) => {
              const Icon = b.i;
              return (
                <div key={i} className="flex flex-col items-center text-center gap-1">
                  <div className={`h-12 w-12 rounded-full grid place-items-center ${b.c}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-[10px] font-medium leading-tight">{b.t}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="h-4 w-4 text-secondary" /> Papan Peringkat Kelas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { n: "Aisyah R.", k: "9A", p: 980 },
              { n: "Rizky P.", k: "8B", p: 940 },
              { n: "Nadia S.", k: "9C", p: 915 },
              { n: "Fadli A.", k: "8A", p: 890 },
              { n: "Salma H.", k: "7B", p: 860 },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                <div
                  className={`h-8 w-8 rounded-full grid place-items-center text-xs font-bold ${i === 0
                      ? "bg-yellow-400 text-black"
                      : i === 1
                        ? "bg-gray-300 text-black"
                        : i === 2
                          ? "bg-amber-600 text-white"
                          : "bg-muted text-foreground"
                    }`}
                >
                  {i + 1}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
                    {r.n.split(" ").map((x) => x[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r.n}</div>
                  <div className="text-xs text-muted-foreground">Kelas {r.k}</div>
                </div>
                <div className="text-sm font-bold text-primary">{r.p} pts</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DataUserRole() {
  const [search, setSearch] = useState("");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  // Form input state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("asd123");
  const [nis, setNis] = useState("");
  const [userClass, setUserClass] = useState("8A");
  const [selectedRole, setSelectedRole] = useState("guru");

  const [dummyUsersList, setDummyUsersList] = useState([
    { id: "1", full_name: "Super Administrator MTsN 2", email: "admin@mail.com", nis: "NIP. 198501012010011001", class: "Semua", roles: ["admin"] },
    { id: "2", full_name: "H. Ahmad Syukri, S.Kom", email: "admin.akademik@mtsn2cilacap.sch.id", nis: "NIP. 198802152012011002", class: "Semua", roles: ["admin_akademik"] },
    { id: "3", full_name: "Drs. H. Hidayatullah, M.Ag", email: "kamad@mtsn2cilacap.sch.id", nis: "NIP. 197505102000031001", class: "Semua", roles: ["kamad"] },
    { id: "4", full_name: "Dra. Hj. Maryam, M.Pd", email: "waka@mtsn2cilacap.sch.id", nis: "NIP. 197808202003122002", class: "Semua", roles: ["waka"] },
    { id: "5", full_name: "Bpk. Hendra Wijaya, M.Sc", email: "walikelas@mtsn2cilacap.sch.id", nis: "NIP. 198203112008011005", class: "8A", roles: ["walikelas", "guru"] },
    { id: "6", full_name: "Dra. Hj. Siti Rahmah, M.Pd", email: "guru@mtsn2cilacap.sch.id", nis: "NIP. 198004122006042003", class: "8A, 8B, 9C", roles: ["guru"] },
    { id: "7", full_name: "Muhammad Fairuz Maulana", email: "siswa@mtsn2cilacap.sch.id", nis: "NISN. 0081234567", class: "8A", roles: ["siswa"] },
  ]);

  const availableRoles = ["admin", "admin_akademik", "kamad", "waka", "walikelas", "guru", "siswa"];

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      return toast.error("Harap isi Nama Lengkap, Email, dan Kata Sandi.");
    }

    const newUserObj = {
      id: String(Date.now()),
      full_name: fullName,
      email: email.trim().toLowerCase(),
      nis: nis || (selectedRole === "siswa" ? "NISN. 008" + Math.floor(100000 + Math.random() * 900000) : "NIP. 199" + Math.floor(10000000 + Math.random() * 90000000)),
      class: userClass || "Semua",
      roles: [selectedRole],
    };

    setDummyUsersList([newUserObj, ...dummyUsersList]);

    // Try Supabase signUp in background
    try {
      await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
            nis: newUserObj.nis,
            class: userClass,
          },
        },
      });
    } catch (err) {}

    toast.success(`Akun pengguna ${fullName} (${selectedRole.toUpperCase().replace("_", " ")}) berhasil ditambahkan!`);
    setIsAddUserOpen(false);
    
    // Reset Form
    setFullName("");
    setEmail("");
    setPassword("asd123");
    setNis("");
    setUserClass("8A");
    setSelectedRole("guru");
  };

  const toggleRole = (userId: string, role: string) => {
    setDummyUsersList((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const exists = u.roles.includes(role);
        const newRoles = exists ? u.roles.filter((r) => r !== role) : [...u.roles, role];
        return { ...u, roles: newRoles };
      })
    );
    toast.success(`Hak akses role ${role} berhasil diperbarui!`);
  };

  const filtered = dummyUsersList.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.nis.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <SectionHeader title="Manajemen Pengguna & Hak Akses (Role)" sub="Pengelolaan akun pengguna dan matriks wewenang LMS MTsN 2 Cilacap" />

      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Data Akun Pengguna & Hak Akses
            </CardTitle>
            <CardDescription>
              Total {dummyUsersList.length} Akun Terdaftar (Super Admin, Kamad, Waka, Wali Kelas, Guru, Siswa).
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari nama, email, NIS..."
                className="pl-9 h-9 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" className="gap-1.5 shrink-0 bg-primary text-primary-foreground font-bold" onClick={() => setIsAddUserOpen(true)}>
              + Tambah User Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left border-b border-border">
                  <th className="py-3 px-4 font-semibold">Pengguna & NIP/NIS</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Kelas</th>
                  <th className="py-3 px-4 font-semibold">Role Aktif</th>
                  <th className="py-3 px-4 font-semibold">Kelola Hak Akses</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border/60 hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-medium">
                      <div className="font-bold text-foreground">{u.full_name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{u.nis}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-4 text-xs font-semibold">{u.class}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <Badge key={r} variant="secondary" className="text-[10px] uppercase font-bold bg-primary/10 text-primary border border-primary/20">
                            {r.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {availableRoles.map((r) => {
                          const hasRole = u.roles.includes(r);
                          return (
                            <Button
                              key={r}
                              size="sm"
                              variant={hasRole ? "default" : "outline"}
                              className={`h-6 text-[10px] px-2 ${hasRole ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                              onClick={() => toggleRole(u.id, r)}
                            >
                              {hasRole ? `✓ ${r}` : `+ ${r}`}
                            </Button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Modal Form Tambah User Baru */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Tambah Pengguna Baru
            </DialogTitle>
            <DialogDescription>
              Formulir pembuatan akun pengguna baru dan penetapan peran hak akses di MTsN 2 Cilacap.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateUser} className="space-y-4 py-2">
            <div>
              <Label htmlFor="add-name" className="text-xs font-semibold">Nama Lengkap & Gelar</Label>
              <Input
                id="add-name"
                placeholder="Contoh: Drs. H. Ahmad Fauzi, M.Pd"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="add-email" className="text-xs font-semibold">Email / Username</Label>
                <Input
                  id="add-email"
                  type="email"
                  placeholder="fauzi@mtsn2cilacap.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="add-pass" className="text-xs font-semibold">Kata Sandi Default</Label>
                <Input
                  id="add-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="add-nis" className="text-xs font-semibold">NIP / NISN (Opsional)</Label>
                <Input
                  id="add-nis"
                  placeholder="NIP. 19850512..."
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="add-class" className="text-xs font-semibold">Kelas / Rombel</Label>
                <Input
                  id="add-class"
                  placeholder="8A / 8B / Semua"
                  value={userClass}
                  onChange={(e) => setUserClass(e.target.value)}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Peran Utama (Role)</Label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: "guru", label: "👨‍🏫 Guru Pengampu" },
                  { id: "siswa", label: "🎓 Siswa" },
                  { id: "walikelas", label: "📋 Wali Kelas" },
                  { id: "waka", label: "📐 Waka Kurikulum" },
                  { id: "kamad", label: "🏛️ Kepala Madrasah" },
                  { id: "admin_akademik", label: "💼 Admin Akademik" },
                  { id: "admin", label: "🛡️ Super Admin" },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRole(r.id)}
                    className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${
                      selectedRole === r.id
                        ? "bg-primary/10 border-primary text-primary shadow-xs"
                        : "bg-muted/40 border-border hover:bg-muted"
                    }`}
                  >
                    <span>{r.label}</span>
                    {selectedRole === r.id && <span className="text-primary font-bold">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddUserOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                Simpan & Buat Akun
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------- New Menu Pages ---------- */

function Pengumuman() {
  const [list, setList] = useState([
    { id: "1", t: "Libur Maulid Nabi", d: "Sekolah diliburkan Senin, 27 Juli 2026.", tag: "Pengumuman" },
    { id: "2", t: "Rapat Wali Murid Kelas 9", d: "Persiapan ujian akhir, Sabtu 08.00 WIB.", tag: "Agenda" },
    { id: "3", t: "Lomba MTQ Antar Kelas", d: "Pendaftaran dibuka sampai 20 Juli 2026.", tag: "Kegiatan" },
    { id: "4", t: "Update Kurikulum Merdeka", d: "Silabus baru untuk fase D telah tersedia.", tag: "Kurikulum" },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("Pengumuman");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !desc) return toast.error("Isi judul dan detail pengumuman!");
    setList([{ id: String(Date.now()), t: title, d: desc, tag }, ...list]);
    toast.success("Pengumuman resmi madrasah berhasil diterbitkan!");
    setIsOpen(false);
    setTitle("");
    setDesc("");
  };

  const handleDelete = (id: string) => {
    setList(list.filter((x) => x.id !== id));
    toast.success("Pengumuman berhasil dihapus!");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Pengumuman & Informasi</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelola berita resmi, pengumuman, dan agenda kegiatan MTsN 2 Cilacap</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => setIsImportOpen(true)}>
            <Upload className="h-3.5 w-3.5" /> Import Excel
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
            + Tambah Pengumuman Baru
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {list.map((n) => (
          <Card key={n.id} className="border-border shadow-xs hover:border-primary/30 transition">
            <CardContent className="p-4 flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 mt-0.5 font-bold">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="font-bold text-foreground">{n.t}</div>
                    <Badge variant="secondary" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
                      {n.tag}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => handleDelete(n.id)}>
                    Hapus
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.d}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Form Tambah Pengumuman */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" /> Terbitkan Pengumuman Baru
            </DialogTitle>
            <DialogDescription>Isi detail informasi pengumuman resmi madrasah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Pengumuman / Agenda</Label>
              <Input placeholder="Contoh: Pelaksanaan Asesmen Sumatif Akhir Semester" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Kategori / Tag</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="Pengumuman">Pengumuman</option>
                <option value="Agenda">Agenda</option>
                <option value="Kegiatan">Kegiatan</option>
                <option value="Kurikulum">Kurikulum</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Isi Informasi Pengumuman</Label>
              <textarea className="w-full min-h-[90px] p-3 rounded-md border border-border bg-background text-xs mt-1 outline-none" placeholder="Tuliskan pesan lengkap pengumuman..." value={desc} onChange={(e) => setDesc(e.target.value)} required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Terbitkan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Import Excel */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Import Master Data (Excel / CSV)
            </DialogTitle>
            <DialogDescription>Unggah berkas spreadsheet master data untuk diperbarui secara massal.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:bg-primary/5 transition cursor-pointer">
              <Upload className="h-8 w-8 text-primary mx-auto mb-2 opacity-80" />
              <div className="text-sm font-bold">Tarik & Lepas Berkas Excel di Sini</div>
              <div className="text-xs text-muted-foreground mt-1">Format didukung: .xlsx, .xls, .csv (Maks 10MB)</div>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={() => toast.success("Template Berkas Excel MTsN 2 Cilacap berhasil diunduh!")}>
              <Download className="h-4 w-4" /> Unduh Template Format Excel Official
            </Button>
          </div>
          <DialogFooter>
            <Button size="sm" className="w-full bg-primary text-primary-foreground font-bold" onClick={() => { toast.success("Data berhasil di-import!"); setIsImportOpen(false); }}>
              Mulai Import Data Massal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Jadwal() {
  const hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const [filterKelas, setFilterKelas] = useState("Semua");
  const [filterRombel, setFilterRombel] = useState("Semua");

  const [jadwal, setJadwal] = useState<
    Record<string, { j: string; m: string; tingkat: string; rombel: string; g: string }[]>
  >({
    Senin: [
      { j: "07.30 - 09.00", m: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Bpk. Hendra Wijaya, M.Sc" },
      { j: "09.15 - 10.45", m: "Bahasa Arab", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "Ustadzah Nurul Hidayah, S.Pd.I" },
      { j: "10.45 - 12.15", m: "Fiqih", tingkat: "Kelas IX", rombel: "Rombel 9C", g: "Dra. Hj. Siti Rahmah, M.Pd" },
    ],
    Selasa: [
      { j: "07.30 - 09.00", m: "IPA Terpadu", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Ibu Ratna Dewi, M.Pd" },
      { j: "09.15 - 10.45", m: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "Bpk. Slamet Riyadi, M.Pd" },
    ],
    Rabu: [{ j: "07.30 - 09.00", m: "Al-Qur'an Hadits", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "Dra. Hj. Siti Rahmah, M.Pd" }],
    Kamis: [{ j: "07.30 - 09.00", m: "IPS", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "Ibu Maryati, S.Pd" }],
    Jumat: [{ j: "07.30 - 09.00", m: "PJOK", tingkat: "Kelas VII", rombel: "Rombel 7C", g: "Bpk. Agus Santoso, S.Pd" }],
    Sabtu: [{ j: "07.30 - 09.00", m: "Seni Budaya", tingkat: "Kelas VIII", rombel: "Rombel 8C", g: "Ibu Rina Indriani, S.Sn" }],
  });

  const [isOpen, setIsOpen] = useState(false);
  const [selectedHari, setSelectedHari] = useState("Senin");
  const [jam, setJam] = useState("07.30 - 09.00");
  const [mapel, setMapel] = useState("Matematika");
  const [inputTingkat, setInputTingkat] = useState("Kelas VIII");
  const [inputRombel, setInputRombel] = useState("Rombel 8A");
  const [guru, setGuru] = useState("Bpk. Hendra Wijaya, M.Sc");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const currentList = jadwal[selectedHari] || [];
    const updated = [...currentList, { j: jam, m: mapel, tingkat: inputTingkat, rombel: inputRombel, g: guru }];
    setJadwal({ ...jadwal, [selectedHari]: updated });
    toast.success(`Jadwal ${mapel} (${inputTingkat} - ${inputRombel}) hari ${selectedHari} berhasil ditambahkan!`);
    setIsOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Jadwal Pelajaran</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Plotting alokasi jadwal mengajar & belajar per Tingkat Kelas dan Rombel MTsN 2 Cilacap
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
          + Tambah Jadwal Pelajaran
        </Button>
      </div>

      {/* Filter Bar Kelas & Rombel */}
      <div className="p-4 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1">Filter Tingkat Kelas:</span>
          {["Semua", "Kelas VII", "Kelas VIII", "Kelas IX"].map((k) => (
            <Button
              key={k}
              size="sm"
              variant={filterKelas === k ? "default" : "outline"}
              className="text-xs h-7 font-semibold"
              onClick={() => setFilterKelas(k)}
            >
              {k}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">Rombel:</span>
          <select
            className="h-8 rounded-md border border-border bg-background px-3 text-xs font-semibold"
            value={filterRombel}
            onChange={(e) => setFilterRombel(e.target.value)}
          >
            <option value="Semua">Semua Rombel</option>
            <option value="Rombel 7A">Rombel 7A</option>
            <option value="Rombel 7B">Rombel 7B</option>
            <option value="Rombel 7C">Rombel 7C</option>
            <option value="Rombel 8A">Rombel 8A</option>
            <option value="Rombel 8B">Rombel 8B</option>
            <option value="Rombel 8C">Rombel 8C</option>
            <option value="Rombel 9A">Rombel 9A</option>
            <option value="Rombel 9C">Rombel 9C</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hari.map((h) => {
          const listForDay = (jadwal[h] || []).filter((s) => {
            const matchKelas = filterKelas === "Semua" || s.tingkat === filterKelas;
            const matchRombel = filterRombel === "Semua" || s.rombel === filterRombel;
            return matchKelas && matchRombel;
          });

          return (
            <Card key={h} className="border-border shadow-xs">
              <CardHeader className="py-3 px-4 bg-muted/30 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>📅 {h}</span>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-mono">
                    {listForDay.length} Sesi
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {listForDay.length === 0 && (
                  <div className="text-xs text-muted-foreground py-3 text-center">Belum ada jadwal untuk filter ini</div>
                )}
                {listForDay.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 border-l-4 border-primary pl-3 py-1.5 bg-card rounded-r-lg shadow-2xs">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-foreground truncate">{s.m}</div>
                      <div className="flex items-center gap-1.5 my-1 flex-wrap">
                        <Badge variant="secondary" className="text-[9px] font-bold bg-muted text-foreground border-border">
                          🏛️ {s.tingkat}
                        </Badge>
                        <Badge className="text-[9px] font-bold bg-primary/15 text-primary border-primary/20">
                          🏫 {s.rombel}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">👨‍🏫 {s.g}</div>
                      <div className="text-[10px] font-mono font-bold text-primary mt-1">⏰ {s.j}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Form Tambah Jadwal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Tambah Jadwal Pelajaran Baru
            </DialogTitle>
            <DialogDescription>Masukkan detail Kelas, Rombel, Mata Pelajaran, dan Guru Pengampu.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Tingkat Kelas</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={inputTingkat} onChange={(e) => setInputTingkat(e.target.value)}>
                  <option value="Kelas VII">Kelas VII (7)</option>
                  <option value="Kelas VIII">Kelas VIII (8)</option>
                  <option value="Kelas IX">Kelas IX (9)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Nama Rombel</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={inputRombel} onChange={(e) => setInputRombel(e.target.value)}>
                  <option value="Rombel 7A">Rombel 7A</option>
                  <option value="Rombel 7B">Rombel 7B</option>
                  <option value="Rombel 7C">Rombel 7C</option>
                  <option value="Rombel 8A">Rombel 8A</option>
                  <option value="Rombel 8B">Rombel 8B</option>
                  <option value="Rombel 8C">Rombel 8C</option>
                  <option value="Rombel 9A">Rombel 9A</option>
                  <option value="Rombel 9C">Rombel 9C</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Pilih Hari</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={selectedHari} onChange={(e) => setSelectedHari(e.target.value)}>
                  {hari.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Alokasi Waktu Jam</Label>
                <Input placeholder="07.30 - 09.00" value={jam} onChange={(e) => setJam(e.target.value)} required className="mt-1 text-xs font-mono" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Mata Pelajaran</Label>
              <Input placeholder="Contoh: Matematika" value={mapel} onChange={(e) => setMapel(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Guru Pengampu</Label>
              <Input placeholder="Nama Guru Pengampu" value={guru} onChange={(e) => setGuru(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Jadwal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MataPelajaran() {
  const [kelas, setKelas] = useState<"VII" | "VIII" | "IX">("VIII");
  const [selectedMapel, setSelectedMapel] = useState<string | null>(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState<number | null>(null);
  const [forumComment, setForumComment] = useState("");
  const [forumList, setForumList] = useState([
    { name: "Muhammad Fairuz", time: "10 mnt lalu", text: "Assalamu'alaikum ustadzah, untuk hafalan hadits disetorkan dalam bentuk rekaman audio atau video?" },
    { name: "Dra. Hj. Siti Rahmah, M.Pd", time: "5 mnt lalu", text: "Wa'alaikumsalam Fairuz, boleh berupa rekaman audio MP3 atau video MP4 ya." }
  ]);
  const [presensiDone, setPresensiDone] = useState(false);

  const mapelList = [
    { code: "AGM-01", name: "Al-Qur'an Hadits", category: "Keagamaan", teacher: "Dra. Hj. Siti Rahmah, M.Pd", icon: "📖" },
    { code: "AGM-02", name: "Akidah Akhlak", category: "Keagamaan", teacher: "Ust. Abdul Halim, S.Ag", icon: "🕌" },
    { code: "AGM-03", name: "Fiqih", category: "Keagamaan", teacher: "Dra. Hj. Siti Rahmah, M.Pd", icon: "⚖️" },
    { code: "AGM-04", name: "Sejarah Kebudayaan Islam", category: "Keagamaan", teacher: "Drs. KH. Mahmud Ridwan", icon: "🏛️" },
    { code: "AGM-05", name: "Bahasa Arab", category: "Keagamaan", teacher: "Ustadzah Nurul Hidayah, S.Pd.I", icon: "🗣️" },
    { code: "UMM-01", name: "Matematika", category: "Umum", teacher: "Bapak Hendra Wijaya, M.Sc", icon: "📐" },
    { code: "UMM-02", name: "Ilmu Pengetahuan Alam", category: "Umum", teacher: "Ibu Ratna Dewi, M.Pd", icon: "🔬" },
    { code: "UMM-06", name: "Informatika & Coding", category: "Umum", teacher: "H. Ahmad Syukri, S.Kom", icon: "💻" }
  ];

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumComment.trim()) return;
    setForumList([...forumList, { name: "Siswa LMS", time: "Baru saja", text: forumComment }]);
    setForumComment("");
    toast.success("Komentar diskusi berhasil dikirim!");
  };

  if (selectedMapel && selectedPertemuan !== null) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <Button variant="ghost" size="sm" onClick={() => setSelectedPertemuan(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Pertemuan {selectedMapel}
          </Button>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Pertemuan Ke-{selectedPertemuan}
          </Badge>
        </div>

        {/* Card Header Pertemuan */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
              <span>{selectedMapel}</span> • <span>Pertemuan {selectedPertemuan} dari 18</span>
            </div>
            <CardTitle className="text-xl font-bold">
              {selectedPertemuan === 1 ? "Keutamaan Menuntut Ilmu dalam Hadits Riwayat Muslim" : `Materi Pembelajaran & Latihan Pertemuan ${selectedPertemuan}`}
            </CardTitle>
            <CardDescription>
              Tujuan Pembelajaran: Siswa mampu memahami dan mengamalkan kandungan hadits tentang pentingnya ilmu pengetahuan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Presensi Section */}
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm text-foreground">✋ Presensi Kehadiran Pertemuan {selectedPertemuan}</div>
                <div className="text-xs text-muted-foreground">Silakan klik tombol di samping untuk mencatat kehadiran Anda hari ini.</div>
              </div>
              <Button
                size="sm"
                disabled={presensiDone}
                className={presensiDone ? "bg-emerald-600 text-white" : "bg-primary text-primary-foreground"}
                onClick={() => {
                  setPresensiDone(true);
                  toast.success("Presensi berhasil dicatat! Anda dinyatakan HADIR.");
                }}
              >
                {presensiDone ? "✅ Presensi Hadir Terdaftar" : "Isi Presensi Hadir"}
              </Button>
            </div>

            {/* Media & Modul Tabs */}
            <Tabs defaultValue="modul" className="space-y-4">
              <TabsList className="bg-muted p-1 rounded-xl flex flex-wrap h-auto gap-1">
                <TabsTrigger value="modul" className="gap-2">📄 Modul PDF & PPT</TabsTrigger>
                <TabsTrigger value="video" className="gap-2">🎥 Video Tutorial</TabsTrigger>
                <TabsTrigger value="lkpd" className="gap-2">📝 LKPD</TabsTrigger>
                <TabsTrigger value="forum" className="gap-2">💬 Forum Diskusi ({forumList.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="modul" className="space-y-3">
                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Modul_Pembelajaran_Pertemuan_{selectedPertemuan}.pdf</div>
                      <div className="text-xs text-muted-foreground">Ukuran Berkas: 2.4 MB • Format PDF</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Memulai pengunduhan modul PDF...")}>
                    <Download className="h-4 w-4 mr-1" /> Unduh PDF
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/15 text-amber-500 grid place-items-center">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Slide_Presentasi_Pertemuan_{selectedPertemuan}.pptx</div>
                      <div className="text-xs text-muted-foreground">Ukuran Berkas: 4.8 MB • PPT Presentation</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toast.success("Memulai pengunduhan slide PPT...")}>
                    <Download className="h-4 w-4 mr-1" /> Unduh PPT
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-3">
                <div className="aspect-video w-full rounded-xl overflow-hidden border border-border bg-slate-950 flex items-center justify-center text-white">
                  <div className="text-center p-6 space-y-3">
                    <Video className="h-12 w-12 mx-auto text-primary animate-pulse" />
                    <div className="font-bold text-lg">Video Pembelajaran Interaktif Pertemuan {selectedPertemuan}</div>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Video tutorial penjelasan materi oleh tim guru pengampu MTsN 2 Cilacap.
                    </p>
                    <Button size="sm" className="gap-2" onClick={() => toast.info("Memutar video pembelajaran...")}>
                      <Video className="h-4 w-4" /> Putar Video
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lkpd" className="space-y-3">
                <div className="p-5 rounded-xl bg-card border border-border space-y-3">
                  <div className="font-bold text-sm flex items-center gap-2">
                    <PencilLine className="h-4 w-4 text-primary" />
                    Lembar Kerja Peserta Didik (LKPD Pertemuan {selectedPertemuan})
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Petunjuk: Kerjakan soal-soal latihan mandiri berikut di buku catatan digital atau unduh berkas LKPD di bawah ini, lalu kumpulkan jawaban Anda pada tombol unggah.
                  </p>
                  <Button size="sm" className="gap-1.5" onClick={() => toast.success("Membuka berkas LKPD...")}>
                    <Upload className="h-4 w-4" /> Kumpulkan Jawaban LKPD
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="forum" className="space-y-4">
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <Input
                    placeholder="Tulis pertanyaan atau tanggapan diskusi pertemuan ini..."
                    value={forumComment}
                    onChange={(e) => setForumComment(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit">Kirim</Button>
                </form>

                <div className="space-y-3">
                  {forumList.map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/40 border border-border/60 text-sm space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-primary">{f.name}</span>
                        <span className="text-[10px] text-muted-foreground">{f.time}</span>
                      </div>
                      <p className="text-xs text-foreground leading-relaxed">{f.text}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedMapel) {
    const p1To9 = Array.from({ length: 9 }, (_, i) => i + 1);
    const p10To18 = Array.from({ length: 9 }, (_, i) => i + 10);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
          <Button variant="ghost" size="sm" onClick={() => setSelectedMapel(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog Mata Pelajaran
          </Button>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Kelas {kelas} • 18 Pertemuan
          </Badge>
        </div>

        {/* Info Mapel, CP, TP, ATP */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <span>{selectedMapel}</span>
            </CardTitle>
            <CardDescription>
              Struktur Pembelajaran Digital Terpadu MTsN 2 Cilacap (Tahun Ajaran 2026/2027)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <div className="text-[11px] text-muted-foreground font-semibold">Capaian Pembelajaran (CP)</div>
                <div className="text-xs font-bold text-primary mt-1">Fase D (MTs)</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <div className="text-[11px] text-muted-foreground font-semibold">Tujuan Pembelajaran (TP)</div>
                <div className="text-xs font-bold text-primary mt-1">18 Indikator</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <div className="text-[11px] text-muted-foreground font-semibold">Alur Tujuan (ATP)</div>
                <div className="text-xs font-bold text-primary mt-1">Tersedia (PDF)</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                <div className="text-[11px] text-muted-foreground font-semibold">Modul Ajar & Buku Digital</div>
                <div className="text-xs font-bold text-primary mt-1">Lengkap</div>
              </div>
            </div>

            {/* List Pertemuan 1-18 */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Alur Pembemuan 1 s/d 18 (Semester 1 & 2)
              </h3>

              {/* Pertemuan 1 s/d 9 */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {p1To9.map((num) => (
                  <Card key={num} className="hover:border-primary/50 transition cursor-pointer" onClick={() => setSelectedPertemuan(num)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <Badge variant="secondary" className="text-[10px] mb-1">Pertemuan {num}</Badge>
                        <div className="text-sm font-semibold">
                          {num === 1 ? "Keutamaan Menuntut Ilmu" : num === 2 ? "Hafalan Surah Al-Mujadilah" : `Topik Pembelajaran ${num}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">PDF • Video • LKPD • Kuis</div>
                      </div>
                      <Button size="sm" variant="ghost">Buka</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Banner CBT UTS */}
              <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-500 text-black font-bold grid place-items-center">UTS</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Ujian Tengah Semester (CBT UTS)</div>
                    <div className="text-xs text-muted-foreground">Evaluasi Ujian Komputer untuk Pertemuan 1 s/d 9.</div>
                  </div>
                </div>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={() => toast.info("Mengakses Portal CBT UTS...")}>
                  Ikuti CBT UTS
                </Button>
              </div>

              {/* Pertemuan 10 s/d 18 */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {p10To18.map((num) => (
                  <Card key={num} className="hover:border-primary/50 transition cursor-pointer" onClick={() => setSelectedPertemuan(num)}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <Badge variant="secondary" className="text-[10px] mb-1">Pertemuan {num}</Badge>
                        <div className="text-sm font-semibold">
                          {num === 10 ? "Pendalaman Materi Lanjutan" : `Topik Pembelajaran ${num}`}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">PDF • Video • LKPD • Kuis</div>
                      </div>
                      <Button size="sm" variant="ghost">Buka</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Banner CBT PAS */}
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-600 text-white font-bold grid place-items-center">PAS</div>
                  <div>
                    <div className="font-bold text-sm text-foreground">Ujian Akhir Semester (CBT PAS)</div>
                    <div className="text-xs text-muted-foreground">Evaluasi Ujian Akhir Komputer untuk Pertemuan 10 s/d 18.</div>
                  </div>
                </div>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={() => toast.info("Mengakses Portal CBT PAS...")}>
                  Ikuti CBT PAS
                </Button>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [mapelsStateList, setMapelsStateList] = useState([
    { code: "AGM-01", name: "Al-Qur'an Hadits", category: "Keagamaan", teacher: "Dra. Hj. Siti Rahmah, M.Pd", icon: "📖" },
    { code: "AGM-02", name: "Akidah Akhlak", category: "Keagamaan", teacher: "Ust. Abdul Halim, S.Ag", icon: "🕌" },
    { code: "AGM-03", name: "Fiqih", category: "Keagamaan", teacher: "Dra. Hj. Siti Rahmah, M.Pd", icon: "⚖️" },
    { code: "AGM-04", name: "Sejarah Kebudayaan Islam", category: "Keagamaan", teacher: "Drs. KH. Mahmud Ridwan", icon: "🏛️" },
    { code: "AGM-05", name: "Bahasa Arab", category: "Keagamaan", teacher: "Ustadzah Nurul Hidayah, S.Pd.I", icon: "🗣️" },
    { code: "UMM-01", name: "Matematika", category: "Umum", teacher: "Bapak Hendra Wijaya, M.Sc", icon: "📐" },
    { code: "UMM-02", name: "Ilmu Pengetahuan Alam", category: "Umum", teacher: "Ibu Ratna Dewi, M.Pd", icon: "🔬" },
    { code: "UMM-06", name: "Informatika & Coding", category: "Umum", teacher: "H. Ahmad Syukri, S.Kom", icon: "💻" }
  ]);

  const [isAddMapelOpen, setIsAddMapelOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Keagamaan");
  const [newTeacher, setNewTeacher] = useState("");

  const handleCreateMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newTeacher) return toast.error("Harap lengkapi semua bidang form!");
    const newObj = {
      code: newCode.toUpperCase(),
      name: newName,
      category: newCategory,
      teacher: newTeacher,
      icon: newCategory === "Keagamaan" ? "📖" : "📚"
    };
    setMapelsStateList([newObj, ...mapelsStateList]);
    toast.success(`Mata Pelajaran ${newName} (${newCode}) berhasil ditambahkan!`);
    setIsAddMapelOpen(false);
    setNewCode("");
    setNewName("");
    setNewTeacher("");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mata Pelajaran & Ruang Pembelajaran</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelas {kelas} · Tahun Ajaran 2026/2027 • MTsN 2 Cilacap</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddMapelOpen(true)}>
          + Tambah Mata Pelajaran Baru
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["VII", "VIII", "IX"] as const).map((k) => (
          <Button
            key={k}
            size="sm"
            variant={kelas === k ? "default" : "outline"}
            onClick={() => setKelas(k)}
          >
            Kelas {k}
          </Button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mapelsStateList.map((m) => (
          <Card key={m.code} className="hover:border-primary/50 transition cursor-pointer" onClick={() => setSelectedMapel(m.name)}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl">{m.icon}</span>
                <Badge variant="outline" className="text-[10px] font-mono">{m.code}</Badge>
              </div>
              <CardTitle className="text-base font-bold mt-2">{m.name}</CardTitle>
              <CardDescription className="text-xs">{m.teacher}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                <span>18 Pertemuan • Modul</span>
                <span className="text-primary font-bold">Buka Pembelajaran →</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Form Tambah Mapel */}
      <Dialog open={isAddMapelOpen} onOpenChange={setIsAddMapelOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" /> Tambah Mata Pelajaran Baru
            </DialogTitle>
            <DialogDescription>Input master mata pelajaran kurikulum madrasah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateMapel} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Kode Mapel</Label>
                <Input placeholder="AGM-06 / UMM-07" value={newCode} onChange={(e) => setNewCode(e.target.value)} required className="mt-1 text-xs font-mono" />
              </div>

              <div>
                <Label className="text-xs font-semibold">Kategori</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}>
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Umum">Umum</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Nama Mata Pelajaran</Label>
              <Input placeholder="Contoh: Fiqih Lanjutan / Bahasa Sunda" value={newName} onChange={(e) => setNewName(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Guru Pengampu Utama</Label>
              <Input placeholder="Nama Guru Lengkap & Gelar" value={newTeacher} onChange={(e) => setNewTeacher(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMapelOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Mapel Baru</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Tugas() {
  const tugas = [
    { t: "Latihan Aljabar Bab 3", m: "Matematika", due: "25 Juli", status: "Belum" },
    { t: "Essay B. Indonesia", m: "B. Indonesia", due: "26 Juli", status: "Terkumpul" },
    { t: "Praktikum IPA", m: "IPA", due: "28 Juli", status: "Belum" },
    { t: "Hafalan Surat Ad-Duha", m: "Al-Qur'an Hadis", due: "30 Juli", status: "Dinilai" },
  ];
  return (
    <>
      <SectionHeader title="Tugas" sub="Daftar tugas & pengumpulan" />
      <div className="space-y-3">
        {tugas.map((t, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/15 text-primary grid place-items-center">
                <PencilLine className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold">{t.t}</div>
                <div className="text-xs text-muted-foreground">
                  {t.m} · Deadline {t.due}
                </div>
              </div>
              <Badge
                variant={t.status === "Belum" ? "destructive" : "secondary"}
                className="text-[10px]"
              >
                {t.status}
              </Badge>
              <Button size="sm" variant="outline">
                <Upload className="h-3.5 w-3.5 mr-1" /> Kumpul
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function Quiz() {
  const quiz = [
    { t: "Kuis Bab 1 - Bilangan Bulat", m: "Matematika", d: "10 soal · 15 mnt" },
    { t: "Kuis Simple Present", m: "B. Inggris", d: "20 soal · 20 mnt" },
    { t: "Kuis Rukun Iman", m: "Akidah Akhlak", d: "15 soal · 15 mnt" },
    { t: "Kuis Ekosistem", m: "IPA", d: "12 soal · 20 mnt" },
  ];
  return (
    <>
      <SectionHeader title="Quiz" sub="Latihan soal interaktif" />
      <div className="grid sm:grid-cols-2 gap-4">
        {quiz.map((q, i) => (
          <Card key={i} className="hover:shadow-md transition">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="h-11 w-11 rounded-xl bg-accent text-accent-foreground grid place-items-center">
                  <Brain className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold">{q.t}</div>
                  <div className="text-xs text-muted-foreground">{q.m}</div>
                  <div className="text-xs text-muted-foreground mt-1">{q.d}</div>
                </div>
              </div>
              <Button size="sm" className="w-full mt-4">Mulai Kuis</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function CBT() {
  const [activeTab, setActiveTab] = useState<"sesi" | "bank_soal" | "analisis">("sesi");

  // Sesi Ujian Live State
  const [ujianList] = useState([
    { id: "1", title: "CBT PAS Semester Ganjil - Matematika", mapel: "Matematika", kelas: "VIII A", durasi: "90 Mnt", soalCount: 20, token: "MTS2-MAT", status: "Dibuka" },
    { id: "2", title: "CBT PTS Ganjil - Fiqih & Keagamaan", mapel: "Fiqih", kelas: "VIII A", durasi: "60 Mnt", soalCount: 15, token: "MTS2-FQH", status: "Dibuka" },
    { id: "3", title: "Try Out ASPD - Bahasa Indonesia", mapel: "Bahasa Indonesia", kelas: "IX A", durasi: "120 Mnt", soalCount: 40, token: "MTS2-IND", status: "Terjadwal" },
  ]);

  // Exam Player State (Live Exam Modal)
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [activeExam, setActiveExam] = useState<any>(null);
  const [inputToken, setInputToken] = useState("");
  const [isExamLive, setIsExamLive] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [raguState, setRaguState] = useState<Record<number, boolean>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Sample Questions for Live Exam Engine
  const questions = [
    { id: 1, q: "Hasil dari ( -12 ) × 4 + 72 ÷ ( -6 ) adalah ...", options: { A: "-60", B: "-36", C: "36", D: "60" }, key: "A" },
    { id: 2, q: "Dua suku berikutnya dari barisan 3, 7, 11, 15, ... adalah ...", options: { A: "18, 22", B: "19, 23", C: "19, 24", D: "20, 25" }, key: "B" },
    { id: 3, q: "Persamaan garis yang melalui titik (2, 5) dan bergradien 3 adalah ...", options: { A: "y = 3x - 1", B: "y = 3x + 1", C: "y = 3x - 5", D: "y = 3x + 5" }, key: "A" },
    { id: 4, q: "Diketahui himpunan A = {x | x < 10, x ∈ bilangan prima}. Banyak himpunan bagian dari A adalah ...", options: { A: "8", B: "16", C: "32", D: "64" }, key: "B" },
  ];

  // Bank Soal State
  const [bankSoal, setBankSoal] = useState([
    { id: "1", mapel: "Matematika", jenis: "Pilihan Ganda", tanya: "Hasil dari (-12) x 4 + 72 : (-6)...", tingkat: "Sedang", kkm: "75", author: "Pak Hendra" },
    { id: "2", mapel: "Al-Qur'an Hadits", jenis: "Pilihan Ganda", tanya: "Arti dari surah Al-Mujadilah ayat 11 adalah...", tingkat: "Mudah", kkm: "75", author: "Bu Siti Rahmah" },
    { id: "3", mapel: "Fiqih", jenis: "Essay / Uraian", tanya: "Jelaskan perbedaan antara syarat sah dan rukun shalat...", tingkat: "Sukar", kkm: "75", author: "Bu Siti Rahmah" },
  ]);

  // Analisis Nilai & Remedial State
  const [analisisNilai] = useState([
    { name: "Muhammad Fairuz", nis: "2026001", pgScore: 85, essayScore: 10, totalScore: 95, status: "Lulus KKM" },
    { name: "Siti Aisyah", nis: "2026002", pgScore: 80, essayScore: 10, totalScore: 90, status: "Lulus KKM" },
    { name: "Ahmad Dani", nis: "2026003", pgScore: 55, essayScore: 10, totalScore: 65, status: "Remedial" },
    { name: "Rizky Ramadhan", nis: "2026004", pgScore: 60, essayScore: 10, totalScore: 70, status: "Remedial" },
  ]);

  const handleStartExam = (exam: any) => {
    setActiveExam(exam);
    setInputToken("");
    setIsTokenModalOpen(true);
  };

  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputToken.toUpperCase() !== activeExam?.token) {
      return toast.error("Token Ujian tidak valid! Periksa token resmi dari proktor.");
    }
    toast.success("Token Valid! Selamat mengerjakan CBT Ujian Online.");
    setIsTokenModalOpen(false);
    setIsExamLive(true);
  };

  const handleFinishExam = () => {
    setIsExamLive(false);
    setIsSubmitModalOpen(false);
    toast.success("CBT Ujian Berhasil Disubmit! Nilai Anda: 95/100 (LULUS KKM)");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MonitorCheck className="h-6 w-6 text-primary" /> CBT Engine & Assessment Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mesin Ujian Berbasis Komputer, Bank Soal, Timer Real-Time, & System Remedial Otomatis
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold" onClick={() => toast.success("Template Bank Soal Excel Diunduh!")}>
            <Download className="h-3.5 w-3.5" /> Export Excel Nilai
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs CBT */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-3">
        <Button
          size="sm"
          variant={activeTab === "sesi" ? "default" : "outline"}
          className="gap-2 text-xs font-bold"
          onClick={() => setActiveTab("sesi")}
        >
          <MonitorCheck className="h-3.5 w-3.5" /> 1. Sesi Ujian Live CBT
        </Button>
        <Button
          size="sm"
          variant={activeTab === "bank_soal" ? "default" : "outline"}
          className="gap-2 text-xs font-bold"
          onClick={() => setActiveTab("bank_soal")}
        >
          <Brain className="h-3.5 w-3.5" /> 2. Bank Soal & Tipe Soal
        </Button>
        <Button
          size="sm"
          variant={activeTab === "analisis" ? "default" : "outline"}
          className="gap-2 text-xs font-bold"
          onClick={() => setActiveTab("analisis")}
        >
          <CheckCircle2 className="h-3.5 w-3.5" /> 3. Rekap Nilai & Remedial (KKM 75)
        </Button>
      </div>

      {/* TAB 1: SESI UJIAN LIVE CBT */}
      {activeTab === "sesi" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ujianList.map((u) => (
            <Card key={u.id} className="border-border shadow-xs hover:border-primary/40 transition">
              <CardHeader className="p-4 bg-muted/20 border-b border-border">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    Token: {u.token}
                  </Badge>
                  <Badge className={u.status === "Dibuka" ? "bg-emerald-600 text-white text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                    {u.status}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold mt-2 leading-snug">{u.title}</CardTitle>
                <CardDescription className="text-xs">Target: {u.kelas} • Durasi: {u.durasi}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Jumlah Soal: <strong>{u.soalCount} PG</strong></span>
                  <span>Acak Soal & Jawaban: <strong>Aktif ✔</strong></span>
                </div>
                <Button size="sm" className="w-full bg-primary text-primary-foreground font-bold" onClick={() => handleStartExam(u)}>
                  Masuk Ujian (Input Token)
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: BANK SOAL & TIPE SOAL */}
      {activeTab === "bank_soal" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Bank Soal Madrasah (Item Bank System)</CardTitle>
              <CardDescription className="text-xs">Koleksi soal Pilihan Ganda, Isian Singkat, dan Essay Uraian.</CardDescription>
            </div>
            <Button size="sm" className="text-xs font-bold" onClick={() => toast.info("Form Tambah Soal Baru")}>
              + Buat Soal Baru
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-y border-border">
                  <tr>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Tipe Soal</th>
                    <th className="py-3 px-4">Cuplikan Pertanyaan</th>
                    <th className="py-3 px-4">Kesulitan</th>
                    <th className="py-3 px-4">Penulis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bankSoal.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-bold">{b.mapel}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-[10px] font-mono">{b.jenis}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">{b.tanya}</td>
                      <td className="py-3 px-4">
                        <Badge className={b.tingkat === "Sukar" ? "bg-red-500/15 text-red-600" : "bg-emerald-500/15 text-emerald-600"}>
                          {b.tingkat}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{b.author}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: ANALISIS NILAI & REMEDIAL */}
      {activeTab === "analisis" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Analisis Nilai CBT & Evaluasi Ketuntasan KKM (75)</CardTitle>
              <CardDescription className="text-xs">Sistem otomatis mendeteksi siswa di bawah KKM untuk diberikan Remedial.</CardDescription>
            </div>
            <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => toast.success("Notifikasi Remedial Dikirim ke Siswa!")}>
              ⚡ Tugaskan Remedial Massal
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-y border-border">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">NIS</th>
                    <th className="py-3 px-4">Skor PG</th>
                    <th className="py-3 px-4">Skor Essay</th>
                    <th className="py-3 px-4">Nilai Akhir</th>
                    <th className="py-3 px-4 text-center">Status KKM (75)</th>
                    <th className="py-3 px-4 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {analisisNilai.map((a, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-bold">{a.name}</td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{a.nis}</td>
                      <td className="py-3 px-4 font-mono">{a.pgScore}</td>
                      <td className="py-3 px-4 font-mono">{a.essayScore}</td>
                      <td className="py-3 px-4 font-bold text-base font-mono">{a.totalScore}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={a.status === "Lulus KKM" ? "bg-emerald-600 text-white" : "bg-destructive text-destructive-foreground"}>
                          {a.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {a.status === "Remedial" ? (
                          <Button size="sm" className="h-7 text-[11px] bg-amber-600 hover:bg-amber-700 text-white font-bold" onClick={() => toast.success(`Soal Remedial Dikirim ke ${a.name}`)}>
                            Kirim Remedial
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={() => toast.info(`Sertifikat Pengayaan untuk ${a.name}`)}>
                            🌟 Pengayaan
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODAL TOKEN UJIAN CBT */}
      <Dialog open={isTokenModalOpen} onOpenChange={setIsTokenModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Masukkan Token Sesi Ujian CBT
            </DialogTitle>
            <DialogDescription>
              Minta token keamanan 6-karakter resmi kepada pengawas/proktor ujian di ruangan.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleVerifyToken} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Ujian yang Diikuti:</Label>
              <div className="font-bold text-sm text-primary mt-0.5">{activeExam?.title}</div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Token Security Sesi</Label>
              <Input
                placeholder="Contoh: MTS2-MAT"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                required
                className="mt-1 text-center font-mono font-bold text-lg uppercase tracking-widest"
              />
              <div className="text-[11px] text-muted-foreground mt-1">Petunjuk Demo: Gunakan token <strong className="text-foreground">{activeExam?.token}</strong></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTokenModalOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Verifikasi & Mulai Ujian</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL FULL EXAM PLAYER (MESIN UJIAN LIVE REAL-TIME) */}
      <Dialog open={isExamLive} onOpenChange={setIsExamLive}>
        <DialogContent className="sm:max-w-3xl border-border bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-3">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <MonitorCheck className="h-5 w-5 text-primary" /> {activeExam?.title}
                </DialogTitle>
                <DialogDescription className="text-xs">Soal No. {currentQuestionIndex + 1} dari {questions.length} • Pilihan Ganda</DialogDescription>
              </div>
              <div className="flex items-center gap-2 bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-xl font-mono font-bold text-sm">
                ⏱️ Sisa Waktu: 58:42
              </div>
            </div>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6 py-3">
            {/* Area Lembar Soal (2 Cols) */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 text-sm font-medium leading-relaxed">
                {questions[currentQuestionIndex]?.q}
              </div>

              {/* Opsi Jawaban */}
              <div className="space-y-2">
                {Object.entries(questions[currentQuestionIndex]?.options || {}).map(([key, val]) => {
                  const isSelected = userAnswers[currentQuestionIndex] === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setUserAnswers({ ...userAnswers, [currentQuestionIndex]: key })}
                      className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                        isSelected ? "bg-primary/15 border-primary text-primary font-bold shadow-xs" : "bg-card border-border hover:bg-muted"
                      }`}
                    >
                      <div className={`h-7 w-7 rounded-lg font-bold text-xs grid place-items-center ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                        {key}
                      </div>
                      <div className="text-xs">{val}</div>
                    </div>
                  );
                })}
              </div>

              {/* Checkbox Ragu-Ragu */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ragu"
                  checked={!!raguState[currentQuestionIndex]}
                  onChange={(e) => setRaguState({ ...raguState, [currentQuestionIndex]: e.target.checked })}
                  className="h-4 w-4 rounded-md border-border accent-amber-500 cursor-pointer"
                />
                <label htmlFor="ragu" className="text-xs font-bold text-amber-600 cursor-pointer">
                  🟨 Ragu-Ragu dengan jawaban ini
                </label>
              </div>

              {/* Tombol Navigasi Soal */}
              <div className="flex justify-between pt-4 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  ← Soal Sebelumnya
                </Button>
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}>
                    Soal Selanjutnya →
                  </Button>
                ) : (
                  <Button size="sm" className="bg-emerald-600 text-white font-bold" onClick={() => setIsSubmitModalOpen(true)}>
                    Selesai & Submit Ujian
                  </Button>
                )}
              </div>
            </div>

            {/* Area Grid Navigasi Nomor Soal (1 Col) */}
            <div className="p-4 rounded-xl border border-border bg-muted/10 space-y-3">
              <div className="font-bold text-xs">Navigasi Nomor Soal</div>
              <div className="grid grid-cols-4 gap-2">
                {questions.map((q, idx) => {
                  const isAns = !!userAnswers[idx];
                  const isRagu = !!raguState[idx];
                  const isCurrent = currentQuestionIndex === idx;

                  let color = "bg-card border-border text-foreground";
                  if (isAns) color = "bg-emerald-600 text-white border-emerald-600";
                  if (isRagu) color = "bg-amber-500 text-white border-amber-500";

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-lg font-bold text-xs border flex items-center justify-center transition relative ${color} ${
                        isCurrent ? "ring-2 ring-primary ring-offset-2" : ""
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1 pt-2 border-t border-border text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-md bg-emerald-600 shrink-0" /> Terjawab</div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-md bg-amber-500 shrink-0" /> Ragu-Ragu</div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-md bg-card border border-border shrink-0" /> Belum Dijawab</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL KONFIRMASI SUBMIT UJIAN */}
      <Dialog open={isSubmitModalOpen} onOpenChange={setIsSubmitModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Konfirmasi Selesai Ujian</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyelesaikan dan mengirimkan seluruh jawaban CBT ini?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs space-y-1">
            <div>Jawaban Terisi: <strong>{Object.keys(userAnswers).length} dari {questions.length}</strong></div>
            <div>Status Ragu-Ragu: <strong>{Object.values(raguState).filter(Boolean).length} Soal</strong></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsSubmitModalOpen(false)}>Periksa Lagi</Button>
            <Button size="sm" className="bg-emerald-600 text-white font-bold" onClick={handleFinishExam}>
              Ya, Submit Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Nilai() {
  const nilai = [
    { m: "Matematika", t: 85, k: 88, u: 82 },
    { m: "B. Indonesia", t: 90, k: 87, u: 85 },
    { m: "B. Inggris", t: 78, k: 80, u: 75 },
    { m: "IPA", t: 88, k: 90, u: 86 },
    { m: "Fikih", t: 92, k: 95, u: 90 },
  ];
  return (
    <>
      <SectionHeader title="Nilai" sub="Rekap nilai per mata pelajaran" />
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left">
              <tr>
                <th className="p-3 font-semibold">Mata Pelajaran</th>
                <th className="p-3 font-semibold text-center">Tugas</th>
                <th className="p-3 font-semibold text-center">Kuis</th>
                <th className="p-3 font-semibold text-center">Ujian</th>
                <th className="p-3 font-semibold text-center">Rata-rata</th>
              </tr>
            </thead>
            <tbody>
              {nilai.map((n, i) => {
                const avg = Math.round((n.t + n.k + n.u) / 3);
                return (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-medium">{n.m}</td>
                    <td className="p-3 text-center">{n.t}</td>
                    <td className="p-3 text-center">{n.k}</td>
                    <td className="p-3 text-center">{n.u}</td>
                    <td className="p-3 text-center font-bold text-primary">{avg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

function Progress() {
  const mapel = [
    { m: "Matematika", p: 78 },
    { m: "B. Indonesia", p: 92 },
    { m: "IPA", p: 65 },
    { m: "Fikih", p: 88 },
    { m: "B. Arab", p: 55 },
  ];
  return (
    <>
      <SectionHeader title="Progress Belajar" sub="Persentase penyelesaian pertemuan per mapel" />
      <div className="space-y-4">
        {mapel.map((x, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold text-sm">{x.m}</div>
                <div className="text-xs text-muted-foreground">{x.p}% dari 18 pertemuan</div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${x.p}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

function Tahfidz() {
  const [selectedJuz, setSelectedJuz] = useState("Juz 30");
  const [hafalanList, setHafalanList] = useState([
    { id: "1", juz: "Juz 30", s: "An-Naba'", ayat: "1 - 40 (Lengkap)", status: "Mutqin", nilai: "98 (Mumtaz)", ustadz: "Ust. Abdul Halim, S.Ag", tgl: "22 Juli 2026", murojaah: "Mutqin 🔵" },
    { id: "2", juz: "Juz 30", s: "An-Nazi'at", ayat: "1 - 25", status: "Lancar", nilai: "90 (Jayyid Jiddan)", ustadz: "Ust. Abdul Halim, S.Ag", tgl: "20 Juli 2026", murojaah: "Lancar 🟢" },
    { id: "3", juz: "Juz 30", s: "'Abasa", ayat: "1 - 15", status: "Murojaah", nilai: "85 (Jayyid)", ustadz: "Ustadzah Nurul Hidayah", tgl: "18 Juli 2026", murojaah: "Perlu Murojaah 🟡" },
    { id: "4", juz: "Juz 30", s: "At-Takwir", ayat: "1 - 29 (Lengkap)", status: "Mutqin", nilai: "95 (Mumtaz)", ustadz: "Ust. Abdul Halim, S.Ag", tgl: "15 Juli 2026", murojaah: "Mutqin 🔵" },
    { id: "5", juz: "Juz 29", s: "Al-Mulk", ayat: "1 - 30 (Lengkap)", status: "Mutqin", nilai: "96 (Mumtaz)", ustadz: "Ust. Abdul Halim, S.Ag", tgl: "10 Juni 2026", murojaah: "Mutqin 🔵" },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [surah, setSurah] = useState("An-Naba'");
  const [ayat, setAyat] = useState("1 - 20");
  const [status, setStatus] = useState("Lancar");
  const [nilai, setNilai] = useState("90 (Jayyid Jiddan)");
  const [ustadz, setUstadz] = useState("Ust. Abdul Halim, S.Ag");

  const handleAddHafalan = (e: React.FormEvent) => {
    e.preventDefault();
    setHafalanList([
      { id: String(Date.now()), juz: selectedJuz, s: surah, ayat, status, nilai, ustadz, tgl: "Hari ini", murojaah: status === "Mutqin" ? "Mutqin 🔵" : "Lancar 🟢" },
      ...hafalanList,
    ]);
    toast.success(`Setoran QS. ${surah} (${ayat}) berhasil dicatat pada ${selectedJuz}!`);
    setIsOpen(false);
  };

  const filteredHafalan = hafalanList.filter((h) => h.juz === selectedJuz);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" /> Modul Keagamaan Tahfidz Al-Qur'an
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring Target Hafalan, Setoran Ayat, Evaluasi Tajwid, & Kartu Murojaah MTsN 2 Cilacap
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
          + Input Setoran Hafalan Baru
        </Button>
      </div>

      {/* Target Progress Hafalan Card */}
      <Card className="border-border shadow-xs mb-6 bg-linear-to-r from-primary/15 via-card to-card">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Capaian Target Hafalan ({selectedJuz})</div>
            <div className="text-xl font-extrabold text-foreground">Target Hafalan: 85% Tuntas</div>
            <div className="text-xs text-muted-foreground">Telah menyetorkan 12 dari 37 Surah di {selectedJuz} dengan Tajwid Mumtaz.</div>
          </div>
          <Button size="sm" variant="outline" className="text-xs font-bold shrink-0" onClick={() => toast.success(`Kartu Murojaah PDF (${selectedJuz}) berhasil diunduh!`)}>
            <Download className="h-3.5 w-3.5 mr-1" /> 🖨️ Cetak Kartu Murojaah PDF
          </Button>
        </CardContent>
      </Card>

      {/* Filter Target Juz */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <span className="text-xs font-bold text-muted-foreground mr-1">Target Juz:</span>
        {["Juz 30", "Juz 29", "Juz 1"].map((j) => (
          <Button
            key={j}
            size="sm"
            variant={selectedJuz === j ? "default" : "outline"}
            className="text-xs font-bold"
            onClick={() => setSelectedJuz(j)}
          >
            📖 {j}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {filteredHafalan.map((s) => (
          <Card key={s.id} className="border-border shadow-xs hover:border-primary/40 transition">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 font-bold">
                📖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-foreground truncate">QS. {s.s}</div>
                  <Badge className={s.status === "Mutqin" ? "bg-emerald-600 text-white text-[10px]" : "bg-primary/15 text-primary border-primary/20 text-[10px]"}>
                    {s.murojaah}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">Ayat: {s.ayat} • Nilai Tajwid: <strong className="text-foreground">{s.nilai}</strong></div>
                <div className="text-[11px] text-muted-foreground mt-1">Penguji: {s.ustadz} • {s.tgl}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Input Setoran Hafalan */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookMarked className="h-5 w-5 text-primary" /> Input Setoran Hafalan Baru ({selectedJuz})
            </DialogTitle>
            <DialogDescription>Catat setoran hafalan surah, ayat & evaluasi tajwid siswa.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddHafalan} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Nama Surah</Label>
                <Input placeholder="An-Naba'" value={surah} onChange={(e) => setSurah(e.target.value)} required className="mt-1 text-xs" />
              </div>
              <div>
                <Label className="text-xs font-semibold">Cakupan Ayat</Label>
                <Input placeholder="1 - 20" value={ayat} onChange={(e) => setAyat(e.target.value)} required className="mt-1 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Status Hafalan</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="Mutqin">Mutqin (Hafal Luar Kepala)</option>
                  <option value="Lancar">Lancar</option>
                  <option value="Murojaah">Murojaah (Perlu Pengulangan)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Nilai Tajwid & Makhraj</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={nilai} onChange={(e) => setNilai(e.target.value)}>
                  <option value="98 (Mumtaz)">98 (Mumtaz - Sempurna)</option>
                  <option value="90 (Jayyid Jiddan)">90 (Jayyid Jiddan - Sangat Baik)</option>
                  <option value="85 (Jayyid)">85 (Jayyid - Baik)</option>
                  <option value="75 (Maqbul)">75 (Maqbul - Cukup)</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Ustadz / Penguji</Label>
              <Input placeholder="Nama Penguji" value={ustadz} onChange={(e) => setUstadz(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Setoran</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ERapor() {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [raporItems] = useState([
    { code: "AGM-01", mapel: "Al-Qur'an Hadits", hadir: 100, tugas: 90, uts: 88, pas: 92, akhir: 91, grade: "A", deskripsi: "Sangat baik dalam hafalan dan pemahaman tajwid surah pendek." },
    { code: "AGM-03", mapel: "Fiqih", hadir: 98, tugas: 92, uts: 90, pas: 94, akhir: 92, grade: "A", deskripsi: "Sangat baik dalam praktik tata cara ibadah dan syariat keagamaan." },
    { code: "AGM-02", mapel: "Akidah Akhlak", hadir: 100, tugas: 95, uts: 92, pas: 95, akhir: 94, grade: "A", deskripsi: "Memiliki kebiasaan berakhlak mulia dan santun terhadap sesama." },
    { code: "AGM-05", mapel: "Bahasa Arab", hadir: 95, tugas: 88, uts: 85, pas: 90, akhir: 88, grade: "A", deskripsi: "Baik dalam penguasaan kosa kata (mufradat) dan percakapan harian." },
    { code: "UMM-01", mapel: "Matematika", hadir: 95, tugas: 85, uts: 82, pas: 88, akhir: 86, grade: "A", deskripsi: "Memahami konsep aljabar dan teorema pythagoras dengan presisi tinggi." },
    { code: "UMM-02", mapel: "Ilmu Pengetahuan Alam (IPA)", hadir: 92, tugas: 80, uts: 78, pas: 84, akhir: 81, grade: "B", deskripsi: "Baik dalam melakukan pengamatan praktikum dan laporan ilmiah." },
  ]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ScrollText className="h-6 w-6 text-primary" /> E-Rapor Madrasah & Laporan Hasil Belajar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sistem Penilaian Kurikulum Merdeka Kemenag: Presensi (10%) + Tugas (30%) + CBT UTS (30%) + CBT PAS (30%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold" onClick={() => toast.success("Export Rapor format Excel berhasil diunduh!")}>
            <Download className="h-3.5 w-3.5" /> Export Excel
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsPreviewOpen(true)}>
            🖨️ Preview & Cetak PDF Official
          </Button>
        </div>
      </div>

      {/* Summary Card E-Rapor */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center font-bold">
              📊
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Rata-Rata Nilai Rapor</div>
              <div className="text-lg font-extrabold text-foreground font-mono">89.3 (Predikat A)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 grid place-items-center font-bold">
              🌟
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Sikap & Akhlak</div>
              <div className="text-lg font-extrabold text-foreground">Sangat Baik (A)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center font-bold">
              📅
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Persentase Kehadiran</div>
              <div className="text-lg font-extrabold text-foreground font-mono">96.8% (Hadir)</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-xs mb-6">
        <CardHeader className="py-4 border-b border-border bg-muted/20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold">Rapor Semester Ganjil TA 2026/2027</CardTitle>
              <CardDescription className="text-xs">Rombel: VIII A • NISN: 0081928374 • Wali Kelas: Dra. Hj. Siti Rahmah, M.Pd</CardDescription>
            </div>
            <Badge className="bg-emerald-600 text-white font-mono text-xs px-3 py-1 font-bold">
              STATUS RAPOR: SUDAH DISAHKAN WALI KELAS ✔
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                <tr>
                  <th className="py-3 px-4">Mata Pelajaran</th>
                  <th className="py-3 px-4 text-center">Presensi (10%)</th>
                  <th className="py-3 px-4 text-center">Tugas (30%)</th>
                  <th className="py-3 px-4 text-center">UTS (30%)</th>
                  <th className="py-3 px-4 text-center">PAS (30%)</th>
                  <th className="py-3 px-4 text-center font-bold">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center font-bold">Grade</th>
                  <th className="py-3 px-4">Capaian Pembelajaran (CP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {raporItems.map((r) => (
                  <tr key={r.code} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-foreground">{r.mapel}</td>
                    <td className="py-3 px-4 text-center font-mono">{r.hadir}%</td>
                    <td className="py-3 px-4 text-center font-mono">{r.tugas}</td>
                    <td className="py-3 px-4 text-center font-mono">{r.uts}</td>
                    <td className="py-3 px-4 text-center font-mono">{r.pas}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-primary text-sm">{r.akhir}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge className="bg-primary text-primary-foreground font-bold text-xs">{r.grade}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs leading-relaxed">{r.deskripsi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* MODAL PREVIEW & CETAK E-RAPOR PDF OFFICIAL KEMENAG */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-2xl border-border bg-card max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <span>🖨️ Preview Lembar Cetak E-Rapor Official</span>
              <Badge variant="outline" className="font-mono text-[10px]">Kurikulum Merdeka Kemenag</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 bg-white text-slate-900 rounded-xl space-y-4 shadow-inner text-xs font-serif leading-relaxed">
            <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
              <div className="font-bold text-sm uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
              <div className="font-extrabold text-base uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
              <div className="text-[10px] text-slate-600">Jl. Raya Cilacap No. 42, Kab. Cilacap, Jawa Tengah • Telp: (0282) 534123</div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><strong>Nama Siswa:</strong> Muhammad Fairuz</div>
              <div><strong>Kelas / Rombel:</strong> VIII A</div>
              <div><strong>NISN / NISM:</strong> 0081928374 / 121133010002</div>
              <div><strong>Tahun Ajaran:</strong> 2026/2027 (Ganjil)</div>
            </div>

            <div className="font-bold border-b pb-1 text-xs">A. CAPAIAN HASIL BELAJAR AKADEMIK</div>
            <table className="w-full text-[10px] border-collapse border border-slate-300">
              <thead className="bg-slate-100 uppercase">
                <tr>
                  <th className="border border-slate-300 p-1.5 text-left">Mata Pelajaran</th>
                  <th className="border border-slate-300 p-1.5 text-center">Nilai Akhir</th>
                  <th className="border border-slate-300 p-1.5 text-center">Predikat</th>
                  <th className="border border-slate-300 p-1.5 text-left">Capaian Pembelajaran</th>
                </tr>
              </thead>
              <tbody>
                {raporItems.map((r, idx) => (
                  <tr key={idx}>
                    <td className="border border-slate-300 p-1.5 font-bold">{r.mapel}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold font-mono">{r.akhir}</td>
                    <td className="border border-slate-300 p-1.5 text-center font-bold">{r.grade}</td>
                    <td className="border border-slate-300 p-1.5">{r.deskripsi}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="font-bold border-b pb-1 text-xs pt-2">B. EKSTRAKURIKULER & TAFHIDZ</div>
            <div className="text-[10px] space-y-1">
              <div>• <strong>Pramuka Penggalang:</strong> Sangat Baik (Aktif dalam kegiatan Jambore Ranting).</div>
              <div>• <strong>Tahfidz Al-Qur'an Juz 30:</strong> Mutqin (Telah menyetorkan 12 Surah dengan Tajwid Mumtaz).</div>
            </div>

            <div className="grid grid-cols-2 pt-6 text-[10px] text-center">
              <div>
                Wali Kelas VIII A<br /><br /><br />
                <strong><u>Dra. Hj. Siti Rahmah, M.Pd</u></strong><br />
                NIP. 19780315 200501 2 004
              </div>
              <div>
                Kepala MTs Negeri 2 Cilacap<br /><br /><br />
                <strong><u>H. Ahmad Syukri, S.Kom, M.Pd</u></strong><br />
                NIP. 19720412 199803 1 002
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(false)}>Tutup</Button>
            <Button size="sm" className="bg-emerald-600 text-white font-bold" onClick={() => { toast.success("Cetak PDF E-Rapor Berhasil!"); setIsPreviewOpen(false); }}>
              🖨️ Cetak Berkas PDF Sekarang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Perpustakaan() {
  const [filterTag, setFilterTag] = useState("Semua");
  const [bukuList, setBukuList] = useState([
    { id: "1", t: "Buku Digital Fikih Kelas VIII (Kemenag)", icon: FileText, tag: "PDF Modul", size: "12.4 MB" },
    { id: "2", t: "Video Tutorial Pembelajaran Aljabar", icon: Video, tag: "Video Tutorial", size: "45.0 MB" },
    { id: "3", t: "Audio Murottal Tajwid Al-Baqarah", icon: Headphones, tag: "Audio Murottal", size: "18.2 MB" },
    { id: "4", t: "Simulasi Interaktif Rangkaian Listrik IPA", icon: FileCode2, tag: "Interaktif", size: "5.1 MB" },
    { id: "5", t: "E-Book Sejarah Kebudayaan Islam", icon: Library, tag: "E-Book", size: "8.7 MB" },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("PDF Modul");

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBukuList([
      { id: String(Date.now()), t: title, icon: FileText, tag, size: "3.5 MB" },
      ...bukuList,
    ]);
    toast.success(`Berkas "${title}" berhasil diunggah ke E-Library!`);
    setIsOpen(false);
    setTitle("");
  };

  const filtered = bukuList.filter((b) => filterTag === "Semua" || b.tag === filterTag);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" /> Perpustakaan Digital & E-Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Koleksi E-Book resmi Kemenag, Modul PDF, Video Tutorial, Audio Murottal, & Simulasi Interaktif
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
          + Unggah Berkas E-Library
        </Button>
      </div>

      {/* Filter Bar E-Library */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border pb-3">
        {["Semua", "PDF Modul", "Video Tutorial", "Audio Murottal", "Interaktif", "E-Book"].map((t) => (
          <Button
            key={t}
            size="sm"
            variant={filterTag === t ? "default" : "outline"}
            className="text-xs font-semibold"
            onClick={() => setFilterTag(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.id} className="border-border shadow-xs hover:border-primary/40 transition">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 font-bold">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground truncate">{k.t}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-primary/20">
                      {k.tag}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">{k.size}</span>
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="shrink-0" onClick={() => toast.success(`Unduh berkas ${k.t}`)}>
                  <Download className="h-4 w-4 text-primary" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal Form Unggah E-Library */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Unggah Berkas Digital ke E-Library
            </DialogTitle>
            <DialogDescription>Tambahkan modul, video, atau e-book ke koleksi perpustakaan madrasah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddBook} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Berkas / Modul</Label>
              <Input placeholder="Contoh: Modul Fikih Bab 3" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Kategori Media</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="PDF Modul">PDF Modul</option>
                <option value="Video Tutorial">Video Tutorial</option>
                <option value="Audio Murottal">Audio Murottal</option>
                <option value="Interaktif">Interaktif</option>
                <option value="E-Book">E-Book</option>
              </select>
            </div>

            <div className="border-2 border-dashed border-primary/30 rounded-xl p-4 text-center hover:bg-primary/5 transition cursor-pointer">
              <Upload className="h-6 w-6 text-primary mx-auto mb-1 opacity-80" />
              <div className="text-xs font-bold">Pilih Berkas dari Komputer</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">Format: PDF, PPTX, MP4, MP3 (Maks 50MB)</div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Unggah Berkas</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Pengaturan() {
  const [logs] = useState([
    { id: "1", user: "Admin Akademik (Slamet Riyadi)", act: "Mengunggah Pengumuman Baru: Libur Maulid Nabi", tgl: "24 Juli 2026 14:20" },
    { id: "2", user: "Guru (Hendra Wijaya, M.Sc)", act: "Input Nilai CBT PAS Matematika Kelas 8A", tgl: "24 Juli 2026 13:45" },
    { id: "3", user: "Super Admin (Ahmad Hidayat)", act: "Melakukan Backup Database System (.SQL)", tgl: "24 Juli 2026 10:15" },
    { id: "4", user: "System Auto Engine", act: "Mendeteksi Early Warning: 3 Siswa di bawah KKM", tgl: "24 Juli 2026 08:00" },
  ]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> System Settings, Audit Log & Backup
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Konfigurasi Sistem Utama, Log Aktivitas Pengguna, Early Warning System, & Pemeliharaan Database
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold" onClick={() => toast.info("Fitur Restore Database Siap")}>
            <Upload className="h-3.5 w-3.5" /> Restore DB
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => toast.success("Backup Database LMS MTsN 2 Cilacap Berhasil Diunduh! (.sql)")}>
            💾 Backup Database System
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Early Warning System Threshold Card */}
        <Card className="border-border shadow-xs border-l-4 border-l-amber-500">
          <CardHeader className="py-3 px-4 bg-amber-500/10">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400">
              ⚠️ Early Warning System (EWS)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              Batas Ambulans Otomatis untuk Notifikasi Pembimbingan Siswa:
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between font-bold">
                <span>Batas Minimum KKM:</span>
                <span className="font-mono text-primary">75 / 100</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Batas Min. Kehadiran:</span>
                <span className="font-mono text-primary">80%</span>
              </div>
            </div>
            <Badge className="bg-amber-600 text-white text-[10px] w-full justify-center">EWS Alert Status: AKTIF ✔</Badge>
          </CardContent>
        </Card>

        {/* System Server Info */}
        <Card className="border-border shadow-xs">
          <CardHeader className="py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              🖥️ Monitoring Health Server
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex justify-between"><span>CPU Utilization:</span><strong className="font-mono text-emerald-600">12% (Normal)</strong></div>
            <div className="flex justify-between"><span>RAM Usage:</span><strong className="font-mono text-emerald-600">1.4 GB / 8 GB</strong></div>
            <div className="flex justify-between"><span>Storage SSD:</span><strong className="font-mono text-emerald-600">24 GB / 256 GB</strong></div>
            <div className="flex justify-between"><span>Database Status:</span><strong className="font-mono text-primary">Supabase Cloud (Connected)</strong></div>
          </CardContent>
        </Card>

        {/* Security & Maintenance */}
        <Card className="border-border shadow-xs">
          <CardHeader className="py-3 px-4 bg-muted/30">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              🛡️ Keamanan & Modul
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span>Security Guard RBAC:</span>
              <Badge className="bg-emerald-600 text-white text-[10px]">Strict Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Auto Backup Schedule:</span>
              <Badge variant="outline" className="text-[10px]">Setiap 24 Jam</Badge>
            </div>
            <Button size="sm" variant="outline" className="w-full text-xs font-bold mt-2" onClick={() => toast.success("Cache sistem berhasil dibersihkan!")}>
              🧹 Bersihkan Cache System
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Audit Log Table */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-bold">Audit Trail & Activity Log System</CardTitle>
          <CardDescription className="text-xs">Rekap jejak aktivitas pengguna untuk transparansi dan audit keamanan.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-y border-border">
                <tr>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Aktivitas / Eksekusi System</th>
                  <th className="py-3 px-4 text-right">Waktu Eksekusi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-bold text-foreground">{l.user}</td>
                    <td className="py-3 px-4 text-muted-foreground">{l.act}</td>
                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">{l.tgl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Profil() {
  return (
    <>
      <SectionHeader title="Profil" sub="Informasi akun & pengaturan" />
      <Card>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              AH
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <div className="text-xl font-bold">Ahmad Hidayat, S.Pd.</div>
            <div className="text-sm text-muted-foreground">Admin / Guru Matematika</div>
            <div className="text-xs text-muted-foreground mt-1">
              NIP. 19850112 201001 1 003 · MTs Negeri 2 Cilacap
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              <Button size="sm"><Settings className="h-4 w-4 mr-1" /> Edit Profil</Button>
              <Button size="sm" variant="outline">Ubah Password</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function SiakadMasterData() {
  const [activeTab, setActiveTab] = useState<"ta" | "mapel" | "kelas_rombel" | "pengampu">("pengampu");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedRombelJadwal, setSelectedRombelJadwal] = useState<string | null>(null);

  // Stepper Header Config
  const steps = [
    { key: "ta", title: "Tahun Ajaran & Periode" },
    { key: "mapel", title: "Katalog Mapel" },
    { key: "kelas_rombel", title: "Kelas, Rombel & Jadwal" },
    { key: "pengampu", title: "Matriks Pengampu Mapel" },
  ] as const;

  // Dynamic States for SIAKAD
  const [tahunAjaran, setTahunAjaran] = useState([
    { id: "1", code: "2026/2027 Ganjil", sem: "Ganjil", status: "Aktif", totalSiswa: 948, totalRombel: 27 },
    { id: "2", code: "2025/2026 Genap", sem: "Genap", status: "Arsip", totalSiswa: 920, totalRombel: 27 },
    { id: "3", code: "2025/2026 Ganjil", sem: "Ganjil", status: "Arsip", totalSiswa: 920, totalRombel: 27 },
  ]);

  // Master Mapel (Persistent, Dibuat 1x)
  const [masterMapel] = useState([
    { code: "AGM-01", name: "Al-Qur'an Hadits", category: "Keagamaan" },
    { code: "AGM-02", name: "Akidah Akhlak", category: "Keagamaan" },
    { code: "AGM-03", name: "Fiqih", category: "Keagamaan" },
    { code: "AGM-04", name: "Sejarah Kebudayaan Islam", category: "Keagamaan" },
    { code: "AGM-05", name: "Bahasa Arab", category: "Keagamaan" },
    { code: "UMM-01", name: "Matematika", category: "Umum" },
    { code: "UMM-02", name: "Ilmu Pengetahuan Alam (IPA)", category: "Umum" },
    { code: "UMM-03", name: "Bahasa Indonesia", category: "Umum" },
    { code: "UMM-04", name: "Bahasa Inggris", category: "Umum" },
    { code: "UMM-06", name: "Informatika & Coding", category: "Umum" },
  ]);

  // Hierarki Kelas (Tingkat) -> Rombel -> Jadwal Pelajaran
  const [kelasTingkat] = useState([
    {
      tingkat: "Tingkat VII (Kelas 7)",
      rombels: [
        { id: "1", name: "VII A", wali: "Ustadzah Nurul Hidayah, S.Pd.I", siswaCount: 34 },
        { id: "2", name: "VII B", wali: "Bpk. Slamet Riyadi, M.Pd", siswaCount: 35 },
      ],
    },
    {
      tingkat: "Tingkat VIII (Kelas 8)",
      rombels: [
        { id: "3", name: "VIII A", wali: "Dra. Hj. Siti Rahmah, M.Pd", siswaCount: 32 },
        { id: "4", name: "VIII B", wali: "Ibu Maryati, S.Pd", siswaCount: 33 },
      ],
    },
    {
      tingkat: "Tingkat IX (Kelas 9)",
      rombels: [
        { id: "5", name: "IX A", wali: "Bpk. Hendra Wijaya, M.Sc", siswaCount: 35 },
      ],
    },
  ]);

  // Sample Data Jadwal di Dalam Rombel
  const rombelJadwalMap: Record<string, { hari: string; jam: string; mapel: string; guru: string }[]> = {
    "VII A": [
      { hari: "Senin", jam: "07.30 - 09.00", mapel: "Bahasa Arab", guru: "Ustadzah Nurul Hidayah, S.Pd.I" },
      { hari: "Senin", jam: "09.15 - 10.45", mapel: "Informatika & Coding", guru: "H. Ahmad Syukri, S.Kom" },
      { hari: "Selasa", jam: "07.30 - 09.00", mapel: "Bahasa Indonesia", guru: "Bpk. Slamet Riyadi, M.Pd" },
    ],
    "VIII A": [
      { hari: "Senin", jam: "07.30 - 09.00", mapel: "Matematika", guru: "Bpk. Hendra Wijaya, M.Sc" },
      { hari: "Senin", jam: "09.15 - 10.45", mapel: "Fiqih", guru: "Dra. Hj. Siti Rahmah, M.Pd" },
      { hari: "Selasa", jam: "07.30 - 09.00", mapel: "IPA Terpadu", guru: "Ibu Ratna Dewi, M.Pd" },
    ],
    "IX A": [
      { hari: "Rabu", jam: "07.30 - 09.00", mapel: "Al-Qur'an Hadits", guru: "Dra. Hj. Siti Rahmah, M.Pd" },
    ],
  };

  // TABEL PALING PENTING: Pengampu Mata Pelajaran (Guru + Mapel + Rombel)
  const [pengampuList, setPengampuList] = useState([
    { id: "1", guru: "Bpk. Hendra Wijaya, M.Sc", mapel: "Matematika", rombel: "VIII A", jam: "4 JP / mgg" },
    { id: "2", guru: "Dra. Hj. Siti Rahmah, M.Pd", mapel: "Fiqih", rombel: "VIII A", jam: "2 JP / mgg" },
    { id: "3", guru: "Dra. Hj. Siti Rahmah, M.Pd", mapel: "Al-Qur'an Hadits", rombel: "IX A", jam: "2 JP / mgg" },
    { id: "4", guru: "Ustadzah Nurul Hidayah, S.Pd.I", mapel: "Bahasa Arab", rombel: "VII A", jam: "3 JP / mgg" },
    { id: "5", guru: "Ibu Ratna Dewi, M.Pd", mapel: "Ilmu Pengetahuan Alam (IPA)", rombel: "VIII A", jam: "4 JP / mgg" },
    { id: "6", guru: "H. Ahmad Syukri, S.Kom", mapel: "Informatika & Coding", rombel: "VII A", jam: "2 JP / mgg" },
  ]);

  const [isAddPengampuOpen, setIsAddPengampuOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState("Bpk. Hendra Wijaya, M.Sc");
  const [selectedMapel, setSelectedMapel] = useState("Matematika");
  const [selectedRombel, setSelectedRombel] = useState("VIII A");

  const handleAddPengampu = (e: React.FormEvent) => {
    e.preventDefault();
    setPengampuList([
      {
        id: String(Date.now()),
        guru: selectedGuru,
        mapel: selectedMapel,
        rombel: selectedRombel,
        jam: "3 JP / mgg",
      },
      ...pengampuList,
    ]);
    toast.success(`Pengampu ${selectedGuru} -> ${selectedMapel} (${selectedRombel}) berhasil ditambahkan!`);
    setIsAddPengampuOpen(false);
  };

  const handleRunWizard = () => {
    toast.success("SIAKAD Workflow: Kenaikan Kelas Massal & Plotting Tahun Ajaran 2027/2028 Berhasil!");
    setIsWizardOpen(false);
    setWizardStep(1);
  };

  return (
    <>
      {/* Banner Utama SIAKAD */}
      <div className="p-6 rounded-2xl bg-linear-to-r from-primary/20 via-primary/10 to-transparent border border-primary/25 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground font-bold text-xs">SIAKAD ENGINE</Badge>
              <span className="text-xs text-muted-foreground font-mono">SIM Akademik MTsN 2 Cilacap</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground mt-1">
              Struktur Akademik Terintegrasi
            </h1>
            <p className="text-xs text-muted-foreground max-w-2xl mt-1 leading-relaxed">
              Model terpusat di mana Admin menyusun struktur <strong className="text-foreground">Tahun Ajaran → Semester → Kelas (Tingkat) → Rombel → Pengampu → Jadwal Pelajaran Rombel</strong>. Guru & Siswa otomatis terhubung tanpa perlu menginput kelas ulang tiap tahun.
            </p>
          </div>
          <Button size="sm" className="gap-2 font-bold bg-primary text-primary-foreground shadow-md shrink-0" onClick={() => setIsWizardOpen(true)}>
            <Sparkles className="h-4 w-4" /> ⚡ Workflow Tahun Ajaran Baru
          </Button>
        </div>
      </div>

      {/* Stepper Flow Header Interactive */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
        {steps.map((s, idx) => (
          <div
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition shrink-0 ${
              activeTab === s.key ? "bg-primary text-primary-foreground shadow-md" : "bg-card border border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <div className={`h-5 w-5 rounded-full text-[10px] grid place-items-center font-bold ${activeTab === s.key ? "bg-white text-primary" : "bg-muted text-foreground"}`}>
              {idx + 1}
            </div>
            <span>{s.title}</span>
          </div>
        ))}
      </div>

      {/* TAB 4: MATRIKS PENGAMPU MATA PELAJARAN (TABEL PALING PENTING) */}
      {activeTab === "pengampu" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Matriks Guru Pengampu Mapel (Teaching Assignment)
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Tabel utama penentu otomatisasi LMS: Menghubungkan <strong className="text-foreground">Guru + Mapel + Rombel</strong> pada Tahun Ajaran Aktif.
              </CardDescription>
            </div>
            <Button size="sm" className="gap-1.5 text-xs font-bold" onClick={() => setIsAddPengampuOpen(true)}>
              + Assign Guru Pengampu
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-y border-border">
                  <tr>
                    <th className="py-3 px-4">Guru Pengampu</th>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4">Target Rombel</th>
                    <th className="py-3 px-4">Beban Mengajar</th>
                    <th className="py-3 px-4 text-center">Status LMS</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pengampuList.map((p) => (
                    <tr key={p.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-bold text-foreground">{p.guru}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{p.mapel}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="font-bold bg-primary/10 text-primary border-primary/20">
                          Kelas {p.rombel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">{p.jam}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                          ✔ Otomatis Sync LMS
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:bg-destructive/10" onClick={() => {
                          setPengampuList(pengampuList.filter(x => x.id !== p.id));
                          toast.success("Plotting pengampu berhasil dihapus.");
                        }}>
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 1: TAHUN AJARAN & PERIODE SEMESTER */}
      {activeTab === "ta" && (
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Tahun Ajaran & Periode Semester SIAKAD</CardTitle>
              <CardDescription className="text-xs">Hanya 1 Tahun Ajaran yang dapat diaktifkan dalam satu waktu.</CardDescription>
            </div>
            <Button size="sm" className="text-xs font-bold" onClick={() => toast.info("Form Tambah Tahun Ajaran Baru")}>
              + Tambah Tahun Ajaran
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {tahunAjaran.map((t) => (
              <div key={t.id} className={`p-4 rounded-xl border flex items-center justify-between ${t.status === "Aktif" ? "bg-primary/5 border-primary/40" : "bg-card border-border"}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl grid place-items-center font-bold ${t.status === "Aktif" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    📅
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground flex items-center gap-2">
                      Tahun Ajaran {t.code}
                      {t.status === "Aktif" && <Badge className="bg-emerald-600 text-white text-[10px] font-bold">✔ AKTIF</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Semester {t.sem} • {t.totalSiswa} Siswa Terdaftar • {t.totalRombel} Rombel
                    </div>
                  </div>
                </div>
                {t.status !== "Aktif" && (
                  <Button size="sm" variant="outline" className="text-xs font-bold" onClick={() => {
                    setTahunAjaran(tahunAjaran.map(x => ({ ...x, status: x.id === t.id ? "Aktif" : "Arsip" })));
                    toast.success(`Tahun Ajaran ${t.code} telah diaktifkan secara global!`);
                  }}>
                    Aktifkan Sesi Ini
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: HIERARKI KELAS (TINGKAT) -> ROMBEL -> JADWAL PELAJARAN */}
      {activeTab === "kelas_rombel" && (
        <div className="space-y-6">
          {kelasTingkat.map((kt, i) => (
            <Card key={i} className="border-border shadow-xs">
              <CardHeader className="py-3 px-4 bg-muted/40 border-b border-border">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>🏛️ {kt.tingkat}</span>
                  <Badge variant="outline" className="text-[10px] font-mono">{kt.rombels.length} Rombel</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {kt.rombels.map((r) => (
                    <div key={r.id} className="p-4 rounded-xl border border-border bg-card space-y-3 hover:border-primary/40 transition">
                      <div className="flex items-center justify-between">
                        <div className="font-black text-base text-foreground">Rombel {r.name}</div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                          {r.siswaCount} Siswa
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Wali Kelas: <span className="font-bold text-foreground">{r.wali}</span>
                      </div>
                      <div className="pt-2 border-t border-border flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs font-bold gap-1" onClick={() => setSelectedRombelJadwal(r.name)}>
                          <CalendarClock className="h-3.5 w-3.5 text-primary" /> Jadwal Pelajaran
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs font-semibold" onClick={() => toast.info(`Roster Siswa Rombel ${r.name}`)}>
                          👥 Siswa
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: KATALOG MAPEL (PERSISTEN) */}
      {activeTab === "mapel" && (
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold">Katalog Mata Pelajaran (Persisten)</CardTitle>
            <CardDescription className="text-xs">
              Mata pelajaran dibuat 1x saja dan berlaku secara permanen lintas tahun ajaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {masterMapel.map((m) => (
              <div key={m.code} className="p-3 rounded-xl border border-border bg-card flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-foreground">{m.name}</div>
                  <div className="text-[11px] text-muted-foreground font-mono mt-0.5">{m.code} • {m.category}</div>
                </div>
                <Badge variant="secondary" className="text-[10px] font-bold">Persisten</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* MODAL JADWAL PELAJARAN DI DALAM ROMBEL */}
      <Dialog open={!!selectedRombelJadwal} onOpenChange={() => setSelectedRombelJadwal(null)}>
        <DialogContent className="sm:max-w-xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Jadwal Pelajaran Rombel {selectedRombelJadwal}
            </DialogTitle>
            <DialogDescription>
              Jadwal mingguan hasil plotting pengampu mata pelajaran untuk Rombel {selectedRombelJadwal}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {selectedRombelJadwal && (rombelJadwalMap[selectedRombelJadwal] || []).length === 0 && (
              <div className="text-xs text-muted-foreground py-4 text-center">Belum ada plotting jadwal untuk Rombel ini.</div>
            )}
            {selectedRombelJadwal && (rombelJadwalMap[selectedRombelJadwal] || []).map((j, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    {j.mapel}
                    <Badge variant="outline" className="text-[10px] font-mono">{j.hari}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{j.guru}</div>
                </div>
                <div className="text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                  {j.jam}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => setSelectedRombelJadwal(null)}>
              Tutup Modal Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL FORM TAMBAH PENGAMPU */}
      <Dialog open={isAddPengampuOpen} onOpenChange={setIsAddPengampuOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Assign Guru Pengampu Baru
            </DialogTitle>
            <DialogDescription>
              Hubungkan Guru, Mata Pelajaran, dan Rombel untuk alokasi kelas otomatis.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPengampu} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Pilih Guru Pengampu</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={selectedGuru} onChange={(e) => setSelectedGuru(e.target.value)}>
                <option value="Bpk. Hendra Wijaya, M.Sc">Bpk. Hendra Wijaya, M.Sc</option>
                <option value="Dra. Hj. Siti Rahmah, M.Pd">Dra. Hj. Siti Rahmah, M.Pd</option>
                <option value="Ustadzah Nurul Hidayah, S.Pd.I">Ustadzah Nurul Hidayah, S.Pd.I</option>
                <option value="Ibu Ratna Dewi, M.Pd">Ibu Ratna Dewi, M.Pd</option>
                <option value="H. Ahmad Syukri, S.Kom">H. Ahmad Syukri, S.Kom</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Mata Pelajaran</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={selectedMapel} onChange={(e) => setSelectedMapel(e.target.value)}>
                <option value="Matematika">Matematika</option>
                <option value="Al-Qur'an Hadits">Al-Qur'an Hadits</option>
                <option value="Fiqih">Fiqih</option>
                <option value="Bahasa Arab">Bahasa Arab</option>
                <option value="Ilmu Pengetahuan Alam (IPA)">Ilmu Pengetahuan Alam (IPA)</option>
                <option value="Informatika & Coding">Informatika & Coding</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Target Rombel</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={selectedRombel} onChange={(e) => setSelectedRombel(e.target.value)}>
                <option value="VII A">VII A</option>
                <option value="VII B">VII B</option>
                <option value="VIII A">VIII A</option>
                <option value="VIII B">VIII B</option>
                <option value="IX A">IX A</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddPengampuOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Pengampu</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL SIAKAD WORKFLOW WIZARD */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> SIAKAD Workflow: Pergantian Tahun Ajaran Baru
            </DialogTitle>
            <DialogDescription>
              Panduan 4-langkah otomatisasi kenaikan kelas massal dan alokasi semester baru.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between text-xs font-bold border-b border-border pb-2">
              <span className={wizardStep >= 1 ? "text-primary" : "text-muted-foreground"}>1. Aktifkan TA Baru</span>
              <span className={wizardStep >= 2 ? "text-primary" : "text-muted-foreground"}>2. Naik Kelas Massal</span>
              <span className={wizardStep >= 3 ? "text-primary" : "text-muted-foreground"}>3. Rombel & Wali</span>
              <span className={wizardStep >= 4 ? "text-primary" : "text-muted-foreground"}>4. Assign Pengampu</span>
            </div>

            {wizardStep === 1 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 1: Aktifkan Tahun Ajaran Baru</div>
                <p className="text-muted-foreground">Sistem akan menyetujui penutupan TA 2026/2027 dan membuka TA 2027/2028 Ganjil.</p>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Target: 2027/2028 Ganjil</Badge>
              </div>
            )}

            {wizardStep === 2 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 2: Process Kenaikan Kelas Massal</div>
                <p className="text-muted-foreground">Siswa Kelas VII dinaikkan ke VIII, VIII ke IX, dan IX dinyatakan Alumni secara otomatis.</p>
                <div className="p-3 bg-muted rounded-lg font-mono text-[11px]">
                  VII A (34 siswa) → VIII A<br />
                  VIII A (32 siswa) → IX A<br />
                  IX A (35 siswa) → Alumni (Graduated)
                </div>
              </div>
            )}

            {wizardStep === 3 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 3: Re-Assign Wali Kelas</div>
                <p className="text-muted-foreground">Salin atau tetapkan struktur Wali Kelas baru untuk Rombel TA 2027/2028.</p>
              </div>
            )}

            {wizardStep === 4 && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-sm">Langkah 4: Re-Assign Guru Pengampu Mapel</div>
                <p className="text-muted-foreground">Salin alokasi guru pengampu dari TA sebelumnya atau sesuaikan dengan plotting terbaru.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            {wizardStep > 1 && (
              <Button variant="outline" size="sm" onClick={() => setWizardStep(wizardStep - 1)}>Kembali</Button>
            )}
            {wizardStep < 4 ? (
              <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => setWizardStep(wizardStep + 1)}>
                Lanjut ke Langkah {wizardStep + 1} →
              </Button>
            ) : (
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" onClick={handleRunWizard}>
                Eksekusi Workflow SIAKAD
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
