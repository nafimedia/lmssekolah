import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MysqlAuthService, INITIAL_ROLE_USERS } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import logoAsset from "@/assets/logo-mtsn2.png.asset.json";
import { BerandaModule } from "@/components/dashboard/modules/beranda/BerandaModule";
import { ProfilModule } from "@/components/dashboard/modules/profil/ProfilModule";
import { SiakadMasterDataModule } from "@/components/dashboard/modules/siakad/SiakadMasterDataModule";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  Award,
  AlertTriangle,
  FolderKanban,
  Eye,
  ThumbsUp,
  MessageSquare,
  Filter,
  Plus,
  FileSpreadsheet,
  UserCheck,
  ShieldAlert,
  ShieldCheck,
  Laptop,
  Activity,
  Heart,
  Send,
  Maximize2,
  Minimize2,
  Check,
  Briefcase,
  Bot,
  ExternalLink,
  Clock,
  XCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { WAGatewayLogModal } from "@/components/dashboard/modules/WAGatewayLogModal";
import { CBTModule } from "@/components/dashboard/modules/cbt/CBTModule";
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
  useSidebar,
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
  | "agenda"
  | "kehadiran"
  | "mapel"
  | "modul_ajar"
  | "asesmen"
  | "tugas"
  | "quiz"
  | "cbt"
  | "nilai"
  | "progress"
  | "apresiasi_guru"
  | "apresiasi_siswa"
  | "asisten_ai"
  | "tahfidz"
  | "tahfidz_report"
  | "kokurikuler"
  | "kokurikuler_report"
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
  { key: "agenda", label: "Agenda & Kalender Akademik", icon: CalendarDays, group: "Utama" },
  { key: "kehadiran", label: "Kehadiran & Rekap Presensi", icon: UserCheck, group: "Utama" },
  { key: "mapel", label: "Mata Pelajaran", icon: BookOpen, group: "Akademik" },
  { key: "modul_ajar", label: "Modul Ajar PDF", icon: FileText, group: "Akademik" },
  { key: "asesmen", label: "Pusat Asesmen", icon: ClipboardCheck, group: "Akademik" },
  { key: "tugas", label: "Tugas", icon: PencilLine, group: "Akademik" },
  { key: "quiz", label: "Quiz Interaktif", icon: Brain, group: "Akademik" },
  { key: "cbt", label: "CBT / Ujian", icon: MonitorCheck, group: "Akademik" },
  { key: "nilai", label: "Nilai", icon: GraduationCap, group: "Penilaian" },
  { key: "progress", label: "Progress Belajar", icon: LineChart, group: "Penilaian" },
  { key: "apresiasi_guru", label: "Award & Warning Guru", icon: Trophy, group: "Monitoring & Apresiasi" },
  { key: "apresiasi_siswa", label: "Award & Warning Siswa", icon: Award, group: "Monitoring & Apresiasi" },
  { key: "asisten_ai", label: "Asisten AI & Tools", icon: Bot, group: "Asisten & Tools" },
  { key: "tahfidz", label: "Tahfidz", icon: BookMarked, group: "Penilaian" },
  { key: "tahfidz_report", label: "Laporan Tahfidz Qur'an", icon: BookMarked, group: "Monitoring Eksekutif" },
  { key: "kokurikuler", label: "Kegiatan Kokurikuler (P5)", icon: FolderKanban, group: "Monitoring Eksekutif" },
  { key: "kokurikuler_report", label: "Laporan Kokurikuler (P5)", icon: FolderKanban, group: "Monitoring Eksekutif" },
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
      { key: "users", label: "Data User & Perizinan", group: "Utama & Kontrol" },
      { key: "siakad", label: "SIAKAD Master & Pengampu", group: "Akademik" },
      { key: "mapel", label: "Master Pelajaran", group: "Akademik" },
      { key: "jadwal", label: "Master Jadwal", group: "Akademik" },
      { key: "pengumuman", label: "Pengumuman", group: "Akademik" },
      { key: "agenda", label: "Agenda Madrasah", group: "Akademik" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi & CBT" },
      { key: "nilai", label: "Rekap Nilai Sistem", group: "Evaluasi & CBT" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Apresiasi & Pembinaan" },
      { key: "tahfidz_report", label: "Laporan Tahfidz", group: "Monitoring Eksekutif" },
      { key: "kokurikuler_report", label: "Laporan Kokurikuler (P5)", group: "Monitoring Eksekutif" },
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
      { key: "agenda", label: "Agenda & Kalender", group: "Master Data" },
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
      { key: "agenda", label: "Agenda & Kalender Akademik", group: "Informasi & Agenda" },
      { key: "pengumuman", label: "Pengumuman", group: "Informasi & Agenda" },
      { key: "jadwal", label: "Jadwal Pelajaran", group: "Informasi & Agenda" },
      { key: "progress", label: "Progress Belajar Rombel", group: "Monitoring & Evaluasi" },
      { key: "nilai", label: "Laporan Pembelajaran Kelas", group: "Monitoring & Evaluasi" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Apresiasi & Pembinaan" },
      { key: "tahfidz_report", label: "Laporan Tahfidz Qur'an", group: "Laporan Khusus" },
      { key: "kokurikuler_report", label: "Laporan Kokurikuler (P5)", group: "Laporan Khusus" },
      { key: "cbt", label: "Monitoring CBT Live", group: "Monitoring & Evaluasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  waka: {
    label: "Waka Kurikulum",
    badge: "📐 WAKA KURIKULUM",
    allowedMenus: [
      { key: "beranda", label: "Executive Dashboard", group: "Kurikulum & Validasi" },
      { key: "siakad", label: "SIAKAD Master & Pengampu", group: "Kurikulum & Validasi" },
      { key: "mapel", label: "Perangkat Ajar 1-18", group: "Kurikulum & Validasi" },
      { key: "agenda", label: "Agenda & Kalender Akademik", group: "Kurikulum & Validasi" },
      { key: "pengumuman", label: "Pengumuman", group: "Kurikulum & Validasi" },
      { key: "progress", label: "Progress Belajar Rombel", group: "Monitoring & Evaluasi" },
      { key: "nilai", label: "Laporan Pembelajaran Kelas", group: "Monitoring & Evaluasi" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Apresiasi & Pembinaan" },
      { key: "tahfidz_report", label: "Laporan Tahfidz Qur'an", group: "Laporan Khusus" },
      { key: "kokurikuler_report", label: "Laporan Kokurikuler (P5)", group: "Laporan Khusus" },
      { key: "cbt", label: "Monitoring CBT Live", group: "Monitoring & Evaluasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  walikelas: {
    label: "Wali Kelas 8A",
    badge: "📋 WALI KELAS 8A",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Kelas 8A", group: "Manajemen Kelas" },
      { key: "jadwal", label: "Jadwal Kelas 8A", group: "Manajemen Kelas" },
      { key: "agenda", label: "Agenda & Kalender", group: "Manajemen Kelas" },
      { key: "pengumuman", label: "Pengumuman", group: "Manajemen Kelas" },
      { key: "cbt", label: "Monitoring CBT Kelas 8A", group: "Monitoring & Penilaian" },
      { key: "progress", label: "Progress Belajar Siswa 8A", group: "Monitoring & Penilaian" },
      { key: "nilai", label: "Laporan Pembelajaran 8A", group: "Monitoring & Penilaian" },
      { key: "tahfidz", label: "Setoran Tahfidz 8A", group: "Monitoring & Penilaian" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  wali_kelas: {
    label: "Wali Kelas 8A",
    badge: "📋 WALI KELAS 8A",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Kelas 8A", group: "Manajemen Kelas" },
      { key: "jadwal", label: "Jadwal Kelas 8A", group: "Manajemen Kelas" },
      { key: "agenda", label: "Agenda & Kalender", group: "Manajemen Kelas" },
      { key: "pengumuman", label: "Pengumuman", group: "Manajemen Kelas" },
      { key: "cbt", label: "Monitoring CBT Kelas 8A", group: "Monitoring & Penilaian" },
      { key: "progress", label: "Progress Belajar Siswa 8A", group: "Monitoring & Penilaian" },
      { key: "nilai", label: "Laporan Pembelajaran 8A", group: "Monitoring & Penilaian" },
      { key: "tahfidz", label: "Setoran Tahfidz 8A", group: "Monitoring & Penilaian" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  guru: {
    label: "Guru Pengampu",
    badge: "👨‍🏫 GURU PENGAMPU",
    allowedMenus: [
      { key: "beranda", label: "Beranda Mengajar & Jadwal", group: "Ruang Mengajar" },
      { key: "mapel", label: "Mata Pelajaran Diampu", group: "Ruang Mengajar" },
      { key: "modul_ajar", label: "Modul Ajar PDF", group: "Ruang Mengajar" },
      { key: "jadwal", label: "Jadwal Mengajar Hari Ini", group: "Ruang Mengajar" },
      { key: "cbt", label: "CBT / Terbitkan Ujian & Bank Soal", group: "Penilaian & CBT" },
      { key: "asesmen", label: "Pusat Asesmen & Penilaian", group: "Penilaian & CBT" },
      { key: "tugas", label: "Koreksi Tugas LKPD", group: "Penilaian & CBT" },
      { key: "nilai", label: "Input Nilai & Progress Entry", group: "Penilaian & CBT" },
      { key: "agenda", label: "Agenda & Kalender Akademik", group: "Informasi & Media" },
      { key: "perpustakaan", label: "E-Library & Buku Digital", group: "Informasi & Media" },
      { key: "asisten_ai", label: "Asisten AI & Tools Guru", group: "Asisten & Apresiasi" },
      { key: "apresiasi_siswa", label: "Award & Warning Siswa", group: "Asisten & Apresiasi" },
      { key: "pengumuman", label: "Pengumuman Resmi", group: "Informasi & Media" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  siswa: {
    label: "Siswa Kelas 8A",
    badge: "🎓 RUANG BELAJAR SISWA",
    allowedMenus: [
      { key: "beranda", label: "Beranda Belajar & Presensi", group: "Ruang Belajar" },
      { key: "mapel", label: "Materi & Modul (Pertemuan 1-18)", group: "Ruang Belajar" },
      { key: "jadwal", label: "Jadwal Pelajaran Hari Ini", group: "Ruang Belajar" },
      { key: "kehadiran", label: "Kehadiran & Rekap Presensi", group: "Ruang Belajar" },
      { key: "tugas", label: "Tugas Baru & Submisi LKPD", group: "Evaluasi & Ujian" },
      { key: "quiz", label: "Kuis Interaktif Live", group: "Evaluasi & Ujian" },
      { key: "cbt", label: "CBT Ujian Online", group: "Evaluasi & Ujian" },
      { key: "nilai", label: "Rekap Nilai Saya", group: "Progress & Rapor" },
      { key: "progress", label: "Progress Belajar (CP %)", group: "Progress & Rapor" },
      { key: "tahfidz", label: "Setoran Tahfidz Qur'an", group: "Progress & Rapor" },
      { key: "agenda", label: "Agenda & Kalender Akademik", group: "Informasi & Media" },
      { key: "kokurikuler", label: "Kegiatan Kokurikuler (P5)", group: "Informasi & Media" },
      { key: "perpustakaan", label: "E-Library Video & Audio", group: "Informasi & Media" },
      { key: "profil", label: "Profil & Lencana Saya", group: "Pengaturan" },
    ],
  },
};

function Dashboard() {
  const [active, setActive] = useState<MenuKey>("beranda");
  const [openMobile, setOpenMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeRole, setActiveRole] = useState<string>("siswa");
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // User Profile Global State (Synchronized with logged in user session)
  const [userProfile, setUserProfile] = useState(() => {
    const activeUserSession = MysqlAuthService.getActiveUser();
    return {
      name: activeUserSession?.full_name || "Pengguna LMS",
      role: activeUserSession?.role || activeRole,
      tagline: "Man Jadda Wajada - Barangsiapa bersungguh-sungguh pasti berhasil 🚀",
      avatarUrl: activeUserSession?.avatar_url || (null as string | null),
      nipNis: activeUserSession?.nis_nip || "",
      email: activeUserSession?.email || "",
      phone: "081234567890",
      address: "Cilacap, Jawa Tengah",
      badges: [
        "⭐ Siswa/Pendidik Aktif",
        "🏆 Terverifikasi LMS",
      ],
    };
  });

  useEffect(() => {
    const user = MysqlAuthService.getActiveUser();
    if (user) {
      setUserProfile((prev) => ({
        ...prev,
        name: user.full_name && user.full_name.trim() !== "" ? user.full_name : prev.name,
        email: user.email || prev.email,
        nipNis: user.nis_nip || prev.nipNis,
        role: user.role || activeRole,
        avatarUrl: user.avatar_url || prev.avatarUrl,
      }));
    }
  }, [activeRole]);

  // Live Database Synchronized Stats Query (100% Real Laragon MySQL db_lms)
  const { data: dbStats } = useQuery({
    queryKey: ["dashboard_db_stats"],
    queryFn: async () => {
      return await MysqlDataService.getDatabaseStats();
    },
    refetchInterval: 5000,
  });

  const roleInfo = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.siswa;
  const allowedKeys = roleInfo.allowedMenus.map((x) => x.key);

  const filteredMenu = roleInfo.allowedMenus
    .map((item) => {
      const base = MENU.find((m) => m.key === item.key);
      if (!base) return null;
      return {
        ...base,
        label: item.label || base.label,
        group: item.group || base.group,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const groups = Array.from(new Set(filteredMenu.map((m) => m.group)));

  useEffect(() => {
    if (!allowedKeys.includes(active)) {
      setActive("beranda");
    }
  }, [activeRole]);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const user = MysqlAuthService.getActiveUser();
      if (user) {
        return {
          full_name: user.full_name && !/^\d+$/.test(user.full_name) ? user.full_name : (INITIAL_ROLE_USERS[user.email]?.name || user.full_name || "Ahmad Fauzi"),
          role: user.role,
          email: user.email,
          avatar_url: user.avatar_url || (typeof window !== "undefined" ? localStorage.getItem("lms_user_avatar") : null) || null,
        };
      }
      return null;
    },
  });

  const isSuperAdmin = me?.role === "admin" || me?.email?.toLowerCase() === "admin@mail.com" || me?.role === "superadmin";

  useEffect(() => {
    if (me?.role) {
      setActiveRole(me.role);
    }
  }, [me]);

  const handleSignOut = async () => {
    MysqlAuthService.logout();
    await queryClient.cancelQueries();
    queryClient.clear();
    navigate({ to: "/auth", replace: true });
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  if (!isMounted) {
    return (
      <div className="min-h-screen w-full bg-background grid place-items-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-xs font-semibold text-muted-foreground">Memuat Dashboard LMS MTsN 2 Cilacap...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardContent
        active={active}
        setActive={setActive}
        dark={dark}
        setDark={setDark}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        isSuperAdmin={isSuperAdmin}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        dbStats={dbStats}
        me={me}
        handleSignOut={handleSignOut}
        isWaModalOpen={isWaModalOpen}
        setIsWaModalOpen={setIsWaModalOpen}
      />
    </SidebarProvider>
  );
}

function DashboardContent({
  active,
  setActive,
  dark,
  setDark,
  activeRole,
  setActiveRole,
  isSuperAdmin,
  userProfile,
  setUserProfile,
  dbStats,
  me,
  handleSignOut,
  isWaModalOpen,
  setIsWaModalOpen,
}: any) {
  const { setOpenMobile } = useSidebar();

  const rawDisplayName = me?.full_name || userProfile?.name || "Ahmad Fauzi";
  const displayName = !rawDisplayName || /^\d+$/.test(rawDisplayName.trim()) ? (userProfile?.name && !/^\d+$/.test(userProfile.name) ? userProfile.name : "Ahmad Fauzi") : rawDisplayName;

  const roleInfo = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.siswa;
  const allowedKeys = roleInfo.allowedMenus.map((x) => x.key);

  const filteredMenu = roleInfo.allowedMenus
    .map((item) => {
      const base = MENU.find((m) => m.key === item.key);
      if (!base) return null;
      return {
        ...base,
        label: item.label || base.label,
        group: item.group || base.group,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const groups = Array.from(new Set(filteredMenu.map((m) => m.group)));

  return (
    <>
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
            <div className="leading-tight overflow-hidden group-data-[state=collapsed]:hidden">
              <div className="font-bold text-sm text-sidebar-foreground truncate">MTsN 2 Cilacap</div>
              <div className="text-[11px] text-sidebar-primary font-bold truncate uppercase">{roleInfo.badge}</div>
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent className="px-2 py-4 space-y-4">
          {groups.map((g) => (
            <SidebarGroup key={g}>
              <SidebarGroupLabel className="text-xs font-bold text-sidebar-foreground/60 uppercase tracking-wider px-2 mb-1 group-data-[state=collapsed]:hidden">
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
                          tooltip={m.label}
                          isActive={isActive}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setActive(m.key);
                            setOpenMobile(false);
                            if (typeof window !== "undefined") {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                          className={`gap-3 font-semibold cursor-pointer text-xs sm:text-sm transition-all ${
                            isActive
                              ? "bg-primary text-primary-foreground font-bold shadow-xs data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          }`}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate group-data-[state=collapsed]:hidden">{m.label}</span>
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
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="h-9 w-9 ring-2 ring-emerald-500/40 shrink-0">
                {userProfile?.avatarUrl || me?.avatar_url ? (
                  <img src={userProfile?.avatarUrl || me?.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-emerald-600 text-white text-xs font-black">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="leading-tight overflow-hidden group-data-[state=collapsed]:hidden">
                <div className="font-extrabold text-xs text-sidebar-foreground truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono font-bold uppercase">
                  {activeRole.replace("_", " ")}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-destructive hover:bg-destructive/10 shrink-0" title="Keluar">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Container */}
      <div className="flex flex-col flex-1 min-w-0 min-h-screen bg-background">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-9 w-9 border border-border" />
            <div className="relative hidden md:block w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari mapel, tugas, materi..."
                className="pl-9 text-xs h-9 bg-muted/30"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Admin Switch Role Tester Dropdown */}
            {isSuperAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20">
                    <Shield className="h-3.5 w-3.5" /> Role: <span className="uppercase">{activeRole.replace("_", " ")}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel className="text-xs font-bold text-muted-foreground">Mode Switch Perspektif User</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setActiveRole("admin"); toast.info("Mode Perspektif: SUPER ADMIN"); }}>
                    🛡️ Super Admin (Full Access)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("admin_akademik"); toast.info("Mode Perspektif: ADMIN AKADEMIK"); }}>
                    📋 Admin Akademik
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("kamad"); toast.info("Mode Perspektif: KEPALA MADRASAH (KAMAD)"); }}>
                    🏛️ Kepala Madrasah (Kamad)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("waka"); toast.info("Mode Perspektif: WAKIL KEPALA (WAKA)"); }}>
                    💼 Wakil Kepala (Waka)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("walikelas"); toast.info("Mode Perspektif: WALI KELAS"); }}>
                    🏫 Wali Kelas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("guru"); toast.info("Mode Perspektif: GURU MAPEL"); }}>
                    👨‍🏫 Guru Pengampu
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setActiveRole("siswa"); toast.info("Mode Perspektif: SISWA"); }}>
                    🎓 Siswa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {(activeRole === "guru" || activeRole === "walikelas" || activeRole === "wali_kelas" || activeRole === "kamad" || activeRole === "waka" || activeRole === "admin_akademik" || activeRole === "admin") && (
              <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" onClick={() => setIsWaModalOpen(true)}>
                <Send className="h-3.5 w-3.5 text-emerald-500" /> <span className="hidden sm:inline">WA Gateway</span>
              </Button>
            )}

            {/* WA Modal */}
            <WAGatewayLogModal isOpen={isWaModalOpen} onClose={() => setIsWaModalOpen(false)} />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2.5 p-1.5 hover:bg-accent rounded-full border border-border/40">
                  <Avatar className="h-8 w-8 ring-2 ring-emerald-500/40 shrink-0">
                    {userProfile?.avatarUrl || me?.avatar_url ? (
                      <img src={userProfile?.avatarUrl || me?.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-emerald-600 text-white text-xs font-black">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="hidden sm:flex flex-col text-left leading-tight">
                    <span className="text-xs font-bold text-foreground truncate max-w-[150px]">
                      {displayName}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">
                      {activeRole.replace("_", " ")}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  Akun Terhubung: <br />
                  <strong className="text-foreground text-sm font-bold">{displayName}</strong>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActive("profil")}>
                  <UserIcon className="h-4 w-4 mr-2" /> Profil Saya
                </DropdownMenuItem>
                {activeRole !== "siswa" && (
                  <DropdownMenuItem onClick={() => setActive("users")}>
                    <Shield className="h-4 w-4 mr-2" /> Data User & Role
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive font-semibold" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="p-4 lg:p-8 flex-1">
          {active === "beranda" && <BerandaModule activeRole={activeRole} userProfile={userProfile} dbStats={dbStats} setActiveTab={(key: string) => setActive(key as MenuKey)} />}
          {active === "siakad" && <SiakadMasterDataModule />}
          {active === "mapel" && <MataPelajaran activeRole={activeRole} userProfile={userProfile} />}
          {active === "users" && activeRole !== "siswa" && <DataUserRole />}
          {active === "pengumuman" && <Pengumuman />}
          {active === "jadwal" && <Jadwal activeRole={activeRole} userProfile={userProfile} />}
          {active === "agenda" && <AgendaKalender activeRole={activeRole} />}
          {active === "kehadiran" && <KehadiranSiswa />}
          {active === "modul_ajar" && <ModulAjar activeRole={activeRole} userProfile={userProfile} />}
          {active === "asesmen" && <PusatAsesmen activeRole={activeRole} />}
          {active === "tugas" && <Tugas />}
          {active === "quiz" && <Quiz />}
          {active === "cbt" && <CBT activeRole={activeRole} />}
          {active === "nilai" && <Nilai activeRole={activeRole} />}
          {active === "progress" && <Progress activeRole={activeRole} />}
          {active === "apresiasi_guru" && <ApresiasiGuru activeRole={activeRole} />}
          {active === "apresiasi_siswa" && <ApresiasiSiswa activeRole={activeRole} />}
          {active === "asisten_ai" && <AsistenAITools />}
          {active === "tahfidz" && <Tahfidz />}
          {active === "tahfidz_report" && <LaporanTahfidzEksekutif activeRole={activeRole} />}
          {active === "kokurikuler" && <KokurikulerSiswa />}
          {active === "kokurikuler_report" && <LaporanKokurikuler activeRole={activeRole} />}
          {active === "perpustakaan" && <Perpustakaan />}
          {active === "profil" && <ProfilModule userProfile={userProfile} setUserProfile={setUserProfile} activeRole={activeRole} />}
          {active === "pengaturan" && <Pengaturan />}
        </main>
      </div>
    </>
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

  useEffect(() => {
    let isMounted = true;
    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        if (users && users.length > 0) {
          const formatted = users.map((u) => ({
            id: String(u.id),
            full_name: u.full_name,
            email: u.email,
            nis: `${u.identity_type || (u.role === "siswa" ? "NISN" : "NIP")}. ${u.nis_nip || "-"}`,
            class: u.class_name || u.subject_specialty || "Semua",
            roles: [u.role || "siswa"],
          }));
          setDummyUsersList(formatted);
        }
      })
      .catch((err) => console.warn("Failed fetching users from MySQL:", err));

    return () => {
      isMounted = false;
    };
  }, []);

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

    // Register user to MysqlAuthService
    try {
      await MysqlAuthService.registerUser({
        email,
        password,
        full_name: fullName,
        role: selectedRole as any,
        nis_nip: newUserObj.nis,
        class_name: userClass,
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

function Jadwal({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const rawClass = userProfile?.class_name || "VIII-A";

  const getStudentGrade = (cName: string) => {
    if (cName.includes("7") || cName.toUpperCase().includes("VII")) return "Kelas VII";
    if (cName.includes("9") || cName.toUpperCase().includes("IX")) return "Kelas IX";
    return "Kelas VIII";
  };

  const getStudentRombel = (cName: string) => {
    const clean = cName.replace(/[^0-9A-C]/gi, "").toUpperCase();
    if (clean.includes("7A")) return "Rombel 7A";
    if (clean.includes("7B")) return "Rombel 7B";
    if (clean.includes("7C")) return "Rombel 7C";
    if (clean.includes("8B")) return "Rombel 8B";
    if (clean.includes("8C")) return "Rombel 8C";
    if (clean.includes("9A")) return "Rombel 9A";
    if (clean.includes("9C")) return "Rombel 9C";
    return "Rombel 8A";
  };

  const hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const [filterKelas, setFilterKelas] = useState(isSiswa ? getStudentGrade(rawClass) : "Semua");
  const [filterRombel, setFilterRombel] = useState(isSiswa ? getStudentRombel(rawClass) : "Semua");

  const [jadwal, setJadwal] = useState<
    Record<string, { j: string; m: string; tingkat: string; rombel: string; g: string }[]>
  >({
    Senin: [
      { j: "07.30 - 09.00", m: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Bpk. Hendra Wijaya, M.Sc" },
      { j: "09.15 - 10.45", m: "Al-Quran Hadits", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Dra. Hj. Siti Rahmah, M.Pd" },
      { j: "09.15 - 10.45", m: "Bahasa Arab", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "Ustadzah Nurul Hidayah, S.Pd.I" },
      { j: "10.45 - 12.15", m: "Fiqih", tingkat: "Kelas IX", rombel: "Rombel 9C", g: "Dra. Hj. Siti Rahmah, M.Pd" },
    ],
    Selasa: [
      { j: "07.30 - 09.00", m: "IPA Terpadu", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Ibu Ratna Dewi, M.Pd" },
      { j: "09.15 - 10.45", m: "Fiqih", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Dra. Hj. Siti Rahmah, M.Pd" },
      { j: "09.15 - 10.45", m: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "Bpk. Slamet Riyadi, M.Pd" },
    ],
    Rabu: [
      { j: "07.30 - 09.00", m: "Bahasa Inggris", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Achmad Makmun Rosid, S.Pd., M.Pd" },
      { j: "09.15 - 10.45", m: "Informatika & Coding", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "H. Ahmad Syukri, S.Kom" },
      { j: "07.30 - 09.00", m: "Al-Quran Hadits", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "Dra. Hj. Siti Rahmah, M.Pd" },
    ],
    Kamis: [
      { j: "07.30 - 09.00", m: "Akidah Akhlak", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Ust. Abdul Halim, S.Ag" },
      { j: "09.15 - 10.45", m: "Sejarah Kebudayaan Islam", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Drs. KH. Mahmud Ridwan" },
      { j: "07.30 - 09.00", m: "IPS", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "Ibu Maryati, S.Pd" },
    ],
    Jumat: [
      { j: "07.30 - 09.00", m: "PJOK", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Bpk. Agus Santoso, S.Pd" },
      { j: "07.30 - 09.00", m: "PJOK", tingkat: "Kelas VII", rombel: "Rombel 7C", g: "Bpk. Agus Santoso, S.Pd" },
    ],
    Sabtu: [
      { j: "07.30 - 09.00", m: "Seni Budaya", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "Ibu Rina Indriani, S.Sn" },
      { j: "07.30 - 09.00", m: "Seni Budaya", tingkat: "Kelas VIII", rombel: "Rombel 8C", g: "Ibu Rina Indriani, S.Sn" },
    ],
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
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Jadwal Pelajaran {isSiswa && <Badge className="bg-primary text-primary-foreground font-bold text-xs">📍 Kelas {rawClass}</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSiswa
              ? `Jadwal alokasi jam tatap muka & pembelajaran khusus Kelas ${rawClass} MTsN 2 Cilacap`
              : "Plotting alokasi jadwal mengajar & belajar per Tingkat Kelas dan Rombel MTsN 2 Cilacap"}
          </p>
        </div>
        {!isSiswa && (
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
            + Tambah Jadwal Pelajaran
          </Button>
        )}
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

function MataPelajaran({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const rawClass = userProfile?.class_name || "VIII-A";

  const getStudentGradeKey = (cName: string): "VII" | "VIII" | "IX" => {
    if (cName.includes("7") || cName.toUpperCase().includes("VII")) return "VII";
    if (cName.includes("9") || cName.toUpperCase().includes("IX")) return "IX";
    return "VIII";
  };

  const [kelas, setKelas] = useState<"VII" | "VIII" | "IX">(isSiswa ? getStudentGradeKey(rawClass) : "VIII");
  const [selectedMapel, setSelectedMapel] = useState<string | null>(null);
  const [selectedPertemuan, setSelectedPertemuan] = useState<number | null>(null);
  const [forumComment, setForumComment] = useState("");
  const [forumList, setForumList] = useState([
    { name: "Muhammad Fairuz", time: "10 mnt lalu", text: "Assalamu'alaikum ustadzah, untuk hafalan hadits disetorkan dalam bentuk rekaman audio atau video?" },
    { name: "Dra. Hj. Siti Rahmah, M.Pd", time: "5 mnt lalu", text: "Wa'alaikumsalam Fairuz, boleh berupa rekaman audio MP3 atau video MP4 ya." }
  ]);
  const [presensiDone, setPresensiDone] = useState(false);

  const mapelList = [
    { code: "AGM-01", name: "Al-Quran Hadits", category: "Keagamaan", teacher: "Dra. Hj. Siti Rahmah, M.Pd", icon: "📖" },
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
    { code: "AGM-01", name: "Al-Quran Hadits", category: "Keagamaan", teacher: "Dra. Hj. Siti Rahmah, M.Pd", icon: "📖", jp: 2, kkm: 75, status: "Aktif" },
    { code: "AGM-02", name: "Akidah Akhlak", category: "Keagamaan", teacher: "Ust. Abdul Halim, S.Ag", icon: "🕌", jp: 2, kkm: 75, status: "Aktif" },
    { code: "AGM-03", name: "Fiqih", category: "Keagamaan", teacher: "Dra. Hj. Siti Rahmah, M.Pd", icon: "⚖️", jp: 2, kkm: 75, status: "Aktif" },
    { code: "AGM-04", name: "Sejarah Kebudayaan Islam", category: "Keagamaan", teacher: "Drs. KH. Mahmud Ridwan", icon: "🏛️", jp: 2, kkm: 75, status: "Aktif" },
    { code: "AGM-05", name: "Bahasa Arab", category: "Keagamaan", teacher: "Ustadzah Nurul Hidayah, S.Pd.I", icon: "🗣️", jp: 3, kkm: 75, status: "Aktif" },
    { code: "UMM-01", name: "Matematika", category: "Umum", teacher: "Bapak Hendra Wijaya, M.Sc", icon: "📐", jp: 4, kkm: 75, status: "Aktif" },
    { code: "UMM-02", name: "Ilmu Pengetahuan Alam", category: "Umum", teacher: "Ibu Ratna Dewi, M.Pd", icon: "🔬", jp: 4, kkm: 75, status: "Aktif" },
    { code: "UMM-06", name: "Informatika & Coding", category: "Umum", teacher: "H. Ahmad Syukri, S.Kom", icon: "💻", jp: 2, kkm: 75, status: "Aktif" }
  ]);

  useEffect(() => {
    MysqlDataService.getSubjects().then((res) => {
      if (res && res.length > 0) {
        setMapelsStateList(
          res.map((r) => ({
            code: r.code,
            name: r.name,
            category: r.category || "Keagamaan",
            teacher: r.teacher_name,
            icon: r.icon || "📖",
            jp: r.jp || 2,
            kkm: r.kkm || 75,
            status: r.status || "Aktif",
          }))
        );
      }
    });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");

  const [isAddMapelOpen, setIsAddMapelOpen] = useState(false);
  const [editingMapelCode, setEditingMapelCode] = useState<string | null>(null);
  const [deletingMapel, setDeletingMapel] = useState<{ code: string; name: string } | null>(null);

  const [inputCode, setInputCode] = useState("");
  const [inputName, setInputName] = useState("");
  const [inputCategory, setInputCategory] = useState("Keagamaan");
  const [inputTeacher, setInputTeacher] = useState("");
  const [inputJp, setInputJp] = useState(2);
  const [inputKkm, setInputKkm] = useState(75);
  const [inputStatus, setInputStatus] = useState("Aktif");

  const openAddModal = () => {
    setEditingMapelCode(null);
    setInputCode("");
    setInputName("");
    setInputCategory("Keagamaan");
    setInputTeacher("");
    setInputJp(2);
    setInputKkm(75);
    setInputStatus("Aktif");
    setIsAddMapelOpen(true);
  };

  const openEditModal = (m: (typeof mapelsStateList)[0]) => {
    setEditingMapelCode(m.code);
    setInputCode(m.code);
    setInputName(m.name);
    setInputCategory(m.category);
    setInputTeacher(m.teacher);
    setInputJp(m.jp || 2);
    setInputKkm(m.kkm || 75);
    setInputStatus(m.status || "Aktif");
    setIsAddMapelOpen(true);
  };

  const handleSaveMapel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode || !inputName || !inputTeacher) return toast.error("Harap lengkapi kode, nama mapel, dan guru pengampu!");

    const formattedCode = inputCode.toUpperCase().trim();
    const iconStr = inputCategory === "Keagamaan" ? "📖" : inputCategory === "Muatan Lokal" ? "🎨" : "📚";

    const payload = {
      code: formattedCode,
      name: inputName,
      category: inputCategory,
      teacher_name: inputTeacher,
      jp: Number(inputJp),
      kkm: Number(inputKkm),
      status: inputStatus,
      icon: iconStr,
    };

    MysqlDataService.saveSubject(payload).catch((e) => console.warn(e));

    if (editingMapelCode) {
      setMapelsStateList((prev) =>
        prev.map((item) =>
          item.code === editingMapelCode
            ? {
                ...item,
                code: formattedCode,
                name: inputName,
                category: inputCategory,
                teacher: inputTeacher,
                jp: Number(inputJp),
                kkm: Number(inputKkm),
                status: inputStatus,
                icon: iconStr,
              }
            : item
        )
      );
      toast.success(`Berhasil memperbarui data mapel ${inputName}!`);
    } else {
      if (mapelsStateList.some((item) => item.code.toUpperCase() === formattedCode)) {
        return toast.error(`Kode Mapel ${formattedCode} sudah ada dalam database!`);
      }
      const newObj = {
        code: formattedCode,
        name: inputName,
        category: inputCategory,
        teacher: inputTeacher,
        icon: iconStr,
        jp: Number(inputJp),
        kkm: Number(inputKkm),
        status: inputStatus,
      };
      setMapelsStateList([newObj, ...mapelsStateList]);
      toast.success(`Mata Pelajaran ${inputName} (${formattedCode}) berhasil ditambahkan!`);
    }

    setIsAddMapelOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingMapel) return;
    MysqlDataService.deleteSubject(deletingMapel.code).catch((e) => console.warn(e));
    setMapelsStateList((prev) => prev.filter((item) => item.code !== deletingMapel.code));
    toast.success(`Mata Pelajaran ${deletingMapel.name} (${deletingMapel.code}) telah dihapus.`);
    setDeletingMapel(null);
  };

  const filteredMapels = mapelsStateList.filter((m) => {
    const matchesCategory = selectedCategoryFilter === "All" || m.category === selectedCategoryFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.teacher.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const totalMapel = mapelsStateList.length;
  const totalJp = mapelsStateList.reduce((acc, curr) => acc + (curr.jp || 2), 0);
  const keagamaanCount = mapelsStateList.filter((m) => m.category === "Keagamaan").length;
  const umumMulokCount = mapelsStateList.filter((m) => m.category !== "Keagamaan").length;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Data & Ruang Pembelajaran Mapel</h1>
          <p className="text-sm text-muted-foreground mt-1">Kelas {kelas} · Kurikulum Merdeka Madrasah 2026/2027 • MTsN 2 Cilacap</p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-md" onClick={openAddModal}>
          <Plus className="h-4 w-4" /> Tambah Mapel Baru
        </Button>
      </div>

      {/* Ringkasan Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Total Mata Pelajaran</p>
              <p className="text-xl font-extrabold mt-0.5 text-emerald-600 dark:text-emerald-400">{totalMapel} Mapel</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Alokasi JP / Minggu</p>
              <p className="text-xl font-extrabold mt-0.5 text-blue-600 dark:text-blue-400">{totalJp} JP Total</p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border-purple-500/20">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Mapel Keagamaan</p>
              <p className="text-xl font-extrabold mt-0.5 text-purple-600 dark:text-purple-400">{keagamaanCount} Mapel Kemenag</p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Sparkles className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/20">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground">Mapel Umum & Mulok</p>
              <p className="text-xl font-extrabold mt-0.5 text-amber-600 dark:text-amber-400">{umumMulokCount} Mapel</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Bar Pencarian */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
        {/* Selector Tingkat Kelas */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl">
          {(["VII", "VIII", "IX"] as const).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={kelas === k ? "default" : "ghost"}
              className={`h-7 text-xs font-bold px-3 rounded-lg ${kelas === k ? "shadow-sm" : ""}`}
              onClick={() => setKelas(k)}
            >
              Kelas {k}
            </Button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 md:max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="mapel-search"
              name="mapelSearch"
              placeholder="Cari kode, nama mapel, atau guru pengampu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 text-xs h-9 bg-background"
            />
          </div>

          <div className="flex items-center gap-1 w-full sm:w-auto">
            {["All", "Keagamaan", "Umum", "Muatan Lokal"].map((cat) => (
              <Button
                key={cat}
                type="button"
                size="sm"
                variant={selectedCategoryFilter === cat ? "secondary" : "outline"}
                className="h-9 text-[11px] font-semibold px-2.5 whitespace-nowrap"
                onClick={() => setSelectedCategoryFilter(cat)}
              >
                {cat === "All" ? "Semua" : cat}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Card Mapel */}
      {filteredMapels.length === 0 ? (
        <Card className="p-8 text-center border-dashed">
          <p className="text-sm font-semibold text-muted-foreground">Tidak ada mata pelajaran yang cocok dengan pencarian / filter.</p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMapels.map((m) => (
            <Card key={m.code} className="hover:border-primary/50 transition group flex flex-col justify-between">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{m.icon}</span>
                    <Badge variant="outline" className="text-[10px] font-mono font-bold bg-muted">{m.code}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={`text-[10px] font-bold ${m.status === "Aktif" ? "bg-emerald-600 text-white" : "bg-slate-600 text-white"}`}>
                      {m.status}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(m);
                      }}
                      title="Edit Mapel"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingMapel({ code: m.code, name: m.name });
                      }}
                      title="Hapus Mapel"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <CardTitle className="text-base font-bold mt-2.5 text-foreground">{m.name}</CardTitle>
                <CardDescription className="text-xs font-medium line-clamp-1">{m.teacher}</CardDescription>
              </CardHeader>

              <CardContent className="px-4 pb-4 pt-0">
                <div className="flex items-center gap-2 mt-3 mb-3 text-[11px] font-semibold text-muted-foreground flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-muted">KKM: {m.kkm}</span>
                  <span className="px-2 py-0.5 rounded bg-muted">{m.jp} JP/mgg</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">{m.category}</span>
                </div>

                <div className="flex justify-between items-center text-xs border-t border-border pt-2.5">
                  <span className="text-muted-foreground text-[11px]">18 Pertemuan • Modul Ajar</span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto font-bold text-primary hover:underline text-xs"
                    onClick={() => setSelectedMapel(m.name)}
                  >
                    Buka Pembelajaran →
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Form Tambah / Edit Mapel */}
      <Dialog open={isAddMapelOpen} onOpenChange={setIsAddMapelOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {editingMapelCode ? "Edit Master Mata Pelajaran" : "Tambah Mata Pelajaran Baru"}
            </DialogTitle>
            <DialogDescription>Input & perbarui data master kurikulum madrasah MTsN 2 Cilacap.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveMapel} className="space-y-3.5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="mapel-code" className="text-xs font-semibold">Kode Mapel</Label>
                <Input
                  id="mapel-code"
                  name="mapelCode"
                  placeholder="AGM-06 / UMM-07"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  required
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="mapel-category" className="text-xs font-semibold">Kategori Mapel</Label>
                <select
                  id="mapel-category"
                  name="mapelCategory"
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                  value={inputCategory}
                  onChange={(e) => setInputCategory(e.target.value)}
                >
                  <option value="Keagamaan">Keagamaan</option>
                  <option value="Umum">Umum</option>
                  <option value="Muatan Lokal">Muatan Lokal</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="mapel-name" className="text-xs font-semibold">Nama Mata Pelajaran</Label>
              <Input
                id="mapel-name"
                name="mapelName"
                placeholder="Contoh: Fiqih Lanjutan / Bahasa Sunda"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label htmlFor="mapel-teacher" className="text-xs font-semibold">Guru Pengampu Utama</Label>
              <Input
                id="mapel-teacher"
                name="mapelTeacher"
                placeholder="Nama Guru Lengkap & Gelar"
                value={inputTeacher}
                onChange={(e) => setInputTeacher(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="mapel-jp" className="text-xs font-semibold">Alokasi JP</Label>
                <Input
                  id="mapel-jp"
                  name="mapelJp"
                  type="number"
                  min={1}
                  max={8}
                  value={inputJp}
                  onChange={(e) => setInputJp(Number(e.target.value))}
                  required
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="mapel-kkm" className="text-xs font-semibold">KKM Standar</Label>
                <Input
                  id="mapel-kkm"
                  name="mapelKkm"
                  type="number"
                  min={50}
                  max={100}
                  value={inputKkm}
                  onChange={(e) => setInputKkm(Number(e.target.value))}
                  required
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="mapel-status" className="text-xs font-semibold">Status Mapel</Label>
                <select
                  id="mapel-status"
                  name="mapelStatus"
                  className="w-full h-9 rounded-md border border-border bg-background px-2 text-xs mt-1"
                  value={inputStatus}
                  onChange={(e) => setInputStatus(e.target.value)}
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddMapelOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                {editingMapelCode ? "Simpan Perubahan" : "Simpan Mapel Baru"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Konfirmasi Hapus Mapel */}
      <Dialog open={!!deletingMapel} onOpenChange={(open) => !open && setDeletingMapel(null)}>
        <DialogContent className="sm:max-w-sm border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Hapus Mata Pelajaran?
            </DialogTitle>
            <DialogDescription className="text-xs mt-1">
              Apakah Anda yakin ingin menghapus <strong>{deletingMapel?.name}</strong> ({deletingMapel?.code})? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeletingMapel(null)}>Batal</Button>
            <Button type="button" variant="destructive" size="sm" className="font-bold" onClick={handleDeleteConfirm}>
              Ya, Hapus Mapel
            </Button>
          </DialogFooter>
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
    { t: "Hafalan Surat Ad-Duha", m: "Al-Quran Hadis", due: "30 Juli", status: "Dinilai" },
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
  const quizList = [
    { id: "q1", t: "Kuis Bab 1 - Bilangan Bulat", m: "Matematika", d: "10 soal · 15 mnt", icon: "📐", totalQuestions: 10, duration: 15 },
    { id: "q2", t: "Kuis Simple Present & Past Tense", m: "Bahasa Inggris", d: "20 soal · 20 mnt", icon: "🗣️", totalQuestions: 20, duration: 20 },
    { id: "q3", t: "Kuis Rukun Iman & Asmaul Husna", m: "Akidah Akhlak", d: "15 soal · 15 mnt", icon: "🕌", totalQuestions: 15, duration: 15 },
    { id: "q4", t: "Kuis Ekosistem & Rantai Makanan", m: "IPA Terpadu", d: "12 soal · 20 mnt", icon: "🔬", totalQuestions: 12, duration: 20 },
    { id: "q5", t: "Kuis Tajwid & Mad Thabi'i", m: "Al-Quran Hadits", d: "10 soal · 15 mnt", icon: "📖", totalQuestions: 10, duration: 15 },
  ];

  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizTimeLeft, setQuizTimeLeft] = useState(600);
  const [quizFinished, setQuizFinished] = useState(false);

  const sampleQuestions = [
    { q: "Hasil dari ( -12 ) × 4 + 72 ÷ ( -6 ) adalah ...", opts: { A: "-60", B: "-36", C: "36", D: "60" }, correct: "A" },
    { q: "Dua suku berikutnya dari barisan 3, 7, 11, 15, ... adalah ...", opts: { A: "18, 22", B: "19, 23", C: "19, 24", D: "20, 25" }, correct: "B" },
    { q: "Bentuk sederhana dari 3x + 5y - 2x + y adalah ...", opts: { A: "x + 6y", B: "5x + 6y", C: "x + 4y", D: "5x + 4y" }, correct: "A" },
    { q: "Persamaan garis yang melalui titik (2, 5) dan bergradien 3 adalah ...", opts: { A: "y = 3x - 1", B: "y = 3x + 1", C: "y = 3x - 5", D: "y = 3x + 5" }, correct: "A" },
    { q: "Nilai dari 2^4 × 2^3 adalah ...", opts: { A: "64", B: "128", C: "256", D: "512" }, correct: "B" },
  ];

  const handleStartQuiz = (q: any) => {
    setActiveQuiz(q);
    setCurrentIdx(0);
    setQuizAnswers({});
    setQuizFinished(false);
    setQuizTimeLeft(q.duration * 60);
    setIsQuizModalOpen(true);

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  useEffect(() => {
    if (!isQuizModalOpen || quizFinished || quizTimeLeft <= 0) return;
    const t = setInterval(() => {
      setQuizTimeLeft((prev) => {
        if (prev <= 1) {
          setQuizFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [isQuizModalOpen, quizFinished, quizTimeLeft]);

  const handleFinishQuiz = () => {
    setQuizFinished(true);
    toast.success("🎉 Kuis Berhasil Diselesaikan!", { description: "Jawaban Anda telah dicatat oleh sistem." });
  };

  const calculateScore = () => {
    let score = 0;
    sampleQuestions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) score += 20;
    });
    return score;
  };

  useEffect(() => {
    if (isQuizModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isQuizModalOpen]);

  return (
    <>
      <SectionHeader title="Quiz Interaktif Live" sub="Latihan soal interaktif & kuis singkat real-time berhadiah XP" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizList.map((q) => (
          <Card key={q.id} className="hover:border-primary/50 transition shadow-xs">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0 font-bold text-2xl">
                  {q.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30 mb-1">
                    {q.m}
                  </Badge>
                  <div className="font-bold text-sm text-foreground leading-snug">{q.t}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                    <span>⏱️ {q.d}</span>
                    <span>• 🎁 +50 XP</span>
                  </div>
                </div>
              </div>
              <Button size="sm" className="w-full font-bold bg-primary text-primary-foreground gap-1.5" onClick={() => handleStartQuiz(q)}>
                <Brain className="h-4 w-4" /> Mulai Kuis Interaktif
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fullscreen Quiz Player Modal */}
      {isQuizModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-background w-screen h-screen min-h-screen flex flex-col p-0 m-0 overflow-hidden text-foreground">
            {/* Header */}
            <div className="bg-muted/40 border-b border-border p-4 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold">
                  ⚡
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground leading-tight">{activeQuiz?.t}</h2>
                  <p className="text-xs text-muted-foreground">Mapel: {activeQuiz?.m} • Mode Kuis Interaktif</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleFullscreen}
                  className="h-8 text-xs font-bold gap-1 bg-background border-border hover:bg-accent"
                >
                  {isFullscreen ? <Minimize2 className="h-3.5 w-3.5 text-primary" /> : <Maximize2 className="h-3.5 w-3.5 text-primary" />}
                  <span className="hidden sm:inline">{isFullscreen ? "Keluar Fullscreen" : "Mode Fullscreen"}</span>
                </Button>

                {!quizFinished && (
                  <Badge variant="outline" className="px-3 py-1.5 font-mono font-bold text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                    ⏱️ Sisa Waktu: {Math.floor(quizTimeLeft / 60)}:{String(quizTimeLeft % 60).padStart(2, "0")}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {!quizFinished ? (
                <>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-bold">
                    <span>Soal Ke-{currentIdx + 1} dari {sampleQuestions.length}</span>
                    <span>Skor Terjawab: {Object.keys(quizAnswers).length}/{sampleQuestions.length}</span>
                  </div>

                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${((currentIdx + 1) / sampleQuestions.length) * 100}%` }}
                    />
                  </div>

                  <Card className="border-border shadow-xs max-w-4xl mx-auto">
                    <CardContent className="p-6 space-y-4">
                      <div className="text-base sm:text-lg font-bold text-foreground leading-relaxed">
                        {sampleQuestions[currentIdx]?.q}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 pt-2">
                        {Object.entries(sampleQuestions[currentIdx]?.opts || {}).map(([key, val]) => {
                          const isSelected = quizAnswers[currentIdx] === key;
                          return (
                            <button
                              key={key}
                              onClick={() => setQuizAnswers((prev) => ({ ...prev, [currentIdx]: key }))}
                              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition font-medium text-sm ${
                                isSelected
                                  ? "border-primary bg-primary/10 text-primary font-bold shadow-xs ring-1 ring-primary/40"
                                  : "border-border hover:border-primary/40 bg-card text-foreground"
                              }`}
                            >
                              <span className={`h-8 w-8 rounded-lg border grid place-items-center font-bold text-xs shrink-0 ${isSelected ? "bg-primary text-primary-foreground border-primary" : "border-border bg-muted"}`}>
                                {key}
                              </span>
                              <span>{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Footer Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-border max-w-4xl mx-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentIdx === 0}
                      onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                    >
                      ← Soal Sebelumnya
                    </Button>

                    {currentIdx < sampleQuestions.length - 1 ? (
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground font-bold"
                        onClick={() => setCurrentIdx((prev) => Math.min(sampleQuestions.length - 1, prev + 1))}
                      >
                        Soal Berikutnya →
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                        onClick={handleFinishQuiz}
                      >
                        <CheckCircle2 className="h-4 w-4" /> Selesaikan Kuis
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-10 space-y-6 max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/15 text-emerald-600 grid place-items-center mx-auto text-4xl font-bold">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">Kuis Selesai!</h3>
                    <p className="text-sm text-muted-foreground mt-1">Hasil latihan kuis interaktif Anda telah dihitung.</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase">NILAI AKHIR KUIS</div>
                    <div className="text-5xl font-black text-emerald-600 font-mono">{calculateScore()} / 100</div>
                    <Badge className="bg-emerald-600 text-white font-bold">
                      {calculateScore() >= 75 ? "LULUS SANGAT BAIK 🎉 (+50 XP)" : "CUKUP BAIK (+25 XP)"}
                    </Badge>
                  </div>

                  <Button className="w-full bg-primary text-primary-foreground font-bold" onClick={() => setIsQuizModalOpen(false)}>
                    Tutup & Kembali ke Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function CBT({ activeRole }: { activeRole?: string }) {
  return <CBTModule userRole={activeRole} />;
}

function Nilai({ activeRole }: { activeRole?: string }) {
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin";
  const isGuru = activeRole === "guru";

  const [selectedClassModal, setSelectedClassModal] = useState<any>(null);
  const [selectedEntryModal, setSelectedEntryModal] = useState<any>(null);

  const teacherEntryList = [
    { code: "AGM-01", mapel: "Al-Quran Hadits", rombel: "Kelas VIII A", totalSiswa: 32, entered: 32, progress: 100, status: "Lengkap 100%", c: "text-emerald-500" },
    { code: "AGM-01", mapel: "Al-Quran Hadits", rombel: "Kelas VIII B", totalSiswa: 32, entered: 28, progress: 87.5, status: "Entry 87.5%", c: "text-blue-500" },
    { code: "AGM-03", mapel: "Fiqih Kebangsaan", rombel: "Kelas IX C", totalSiswa: 31, entered: 20, progress: 64.5, status: "Entry 64.5%", c: "text-amber-500" },
  ];

  const classesList = [
    { name: "Kelas VII A", wali: "Ibu Ratna Dewi, M.Pd", siswa: 32, avg: 88.5, icon: "🏫", mapelsCount: 8, tuntas: "30 Siswa Tuntas" },
    { name: "Kelas VII B", wali: "Ust. Abdul Halim, S.Ag", siswa: 32, avg: 86.2, icon: "🏫", mapelsCount: 8, tuntas: "28 Siswa Tuntas" },
    { name: "Kelas VIII A", wali: "Dra. Hj. Siti Rahmah", siswa: 32, avg: 91.0, icon: "🏫", mapelsCount: 8, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas VIII B", wali: "Bapak Hendra Wijaya, M.Sc", siswa: 31, avg: 87.4, icon: "🏫", mapelsCount: 8, tuntas: "29 Siswa Tuntas" },
    { name: "Kelas IX A", wali: "H. Ahmad Syukri, S.Kom", siswa: 32, avg: 92.8, icon: "🎓", mapelsCount: 8, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas IX B", wali: "Ustadzah Nurul Hidayah, S.Pd.I", siswa: 31, avg: 89.1, icon: "🎓", mapelsCount: 8, tuntas: "30 Siswa Tuntas" },
  ];

  const mapelDetails = [
    { code: "AGM-01", mapel: "Al-Quran Hadits", teacher: "Dra. Hj. Siti Rahmah, M.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "95% Tuntas", tugas: 90, kuis: 92, cbt: 88, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "AGM-02", mapel: "Akidah Akhlak", teacher: "Ust. Abdul Halim, S.Ag", pertemuan: "16/18 Pertemuan (88%)", cp: "90% Tuntas", tugas: 88, kuis: 86, cbt: 85, avg: 86, kkm: "Tuntas (≥75)" },
    { code: "AGM-03", mapel: "Fiqih", teacher: "Dra. Hj. Siti Rahmah, M.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "92% Tuntas", tugas: 92, kuis: 90, cbt: 89, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "UMM-01", mapel: "Matematika", teacher: "Bapak Hendra Wijaya, M.Sc", pertemuan: "15/18 Pertemuan (83%)", cp: "85% Tuntas", tugas: 82, kuis: 85, cbt: 80, avg: 82, kkm: "Tuntas (≥75)" },
    { code: "UMM-02", mapel: "Ilmu Pengetahuan Alam", teacher: "Ibu Ratna Dewi, M.Pd", pertemuan: "16/18 Pertemuan (88%)", cp: "88% Tuntas", tugas: 88, kuis: 87, cbt: 86, avg: 87, kkm: "Tuntas (≥75)" },
    { code: "UMM-06", mapel: "Informatika & Coding", teacher: "H. Ahmad Syukri, S.Kom", pertemuan: "18/18 Pertemuan (100%)", cp: "100% Tuntas", tugas: 95, kuis: 96, cbt: 94, avg: 95, kkm: "Tuntas (≥75)" },
  ];

  const studentSelfNilai = [
    { m: "Matematika", t: 85, k: 88, u: 82 },
    { m: "B. Indonesia", t: 90, k: 87, u: 85 },
    { m: "B. Inggris", t: 78, k: 80, u: 75 },
    { m: "IPA", t: 88, k: 90, u: 86 },
    { m: "Fikih", t: 92, k: 95, u: 90 },
  ];

  // Tampilan khusus Guru Pengampu (Input Nilai & Progress Entry)
  if (isGuru) {
    return (
      <>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-emerald-500" /> Input Nilai & Progress Entry per Mapel / Rombel
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Pemantauan persentase kelengkapan entry nilai Formatif, Sumatif, Tugas & Kuis untuk mata pelajaran yang Anda ampu.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teacherEntryList.map((item, idx) => (
            <Card key={idx} className="hover:border-emerald-500/50 transition cursor-pointer shadow-xs" onClick={() => setSelectedEntryModal(item)}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-600 bg-emerald-500/10">
                    {item.rombel}
                  </Badge>
                  <Badge className="bg-emerald-600 text-white font-mono text-[10px]">{item.status}</Badge>
                </div>
                <CardTitle className="text-base font-bold mt-2">{item.mapel}</CardTitle>
                <CardDescription className="text-xs">Kode Mapel: {item.code}</CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-1 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-foreground">Progress Entry Nilai Siswa</span>
                    <span className={`font-bold font-mono ${item.c}`}>{item.entered}/{item.totalSiswa} Siswa ({item.progress}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>

                <Button size="sm" variant="ghost" className="w-full text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 mt-2">
                  📝 Detail Entry Nilai Siswa →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal Detail Entry Nilai per Siswa */}
        <Dialog open={!!selectedEntryModal} onOpenChange={() => setSelectedEntryModal(null)}>
          <DialogContent className="sm:max-w-3xl border-border bg-card">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-emerald-500" /> Detail Input Nilai - {selectedEntryModal?.mapel} ({selectedEntryModal?.rombel})
              </DialogTitle>
              <DialogDescription className="text-xs">
                Kelengkapan skor Formatif, Sumatif, Tugas & Kuis • Progress Entry: <strong>{selectedEntryModal?.progress}%</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted font-bold text-muted-foreground">
                  <tr>
                    <th className="p-2.5">Nama Siswa</th>
                    <th className="p-2.5 text-center">Formatif (Avg)</th>
                    <th className="p-2.5 text-center">Sumatif (Avg)</th>
                    <th className="p-2.5 text-center">Tugas</th>
                    <th className="p-2.5 text-center">Kuis</th>
                    <th className="p-2.5 text-center font-bold">Skor Akhir</th>
                    <th className="p-2.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { name: "Ahmad Fauzi", f: 90, s: 88, t: 92, k: 90, fin: 90 },
                    { name: "Anisa Rahma", f: 88, s: 86, t: 90, k: 88, fin: 88 },
                    { name: "Muhammad Fairuz", f: 94, s: 92, t: 95, k: 94, fin: 94 },
                  ].map((s, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="p-2.5 font-bold">{s.name}</td>
                      <td className="p-2.5 text-center font-mono">{s.f}</td>
                      <td className="p-2.5 text-center font-mono">{s.s}</td>
                      <td className="p-2.5 text-center font-mono">{s.t}</td>
                      <td className="p-2.5 text-center font-mono">{s.k}</td>
                      <td className="p-2.5 text-center font-mono font-bold text-emerald-600">{s.fin}</td>
                      <td className="p-2.5 text-right">
                        <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold" onClick={() => toast.success(`Edit skor nilai ${s.name}...`)}>
                          Edit Nilai
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedEntryModal(null)}>Tutup</Button>
              <Button size="sm" className="bg-emerald-600 text-white font-bold" onClick={() => { toast.success("Seluruh nilai berhasil disimpan ke E-Rapor!"); setSelectedEntryModal(null); }}>
                Simpan Permanen Nilai
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (!isExecutive && !isWaliKelas) {
    return (
      <>
        <SectionHeader title="Nilai Saya" sub="Rekap nilai per mata pelajaran" />
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
                {studentSelfNilai.map((n, i) => {
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

  // Tampilan Wali Kelas (Scope Kelas 8A)
  if (isWaliKelas) {
    return (
      <>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-blue-500" /> Laporan Pembelajaran & Pertemuan Mapel Kelas 8A
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Progres Kehadiran Guru/Pertemuan Alur 1-18 dan Progres Ketercapaian Pembelajaran (CP %) tiap mapel di Kelas 8A.
            </p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => toast.success("Laporan Pembelajaran Rombel 8A (PDF) berhasil diunduh!")}>
            <Download className="h-3.5 w-3.5 mr-1" /> Unduh Laporan 8A PDF
          </Button>
        </div>

        <Card className="border-border shadow-xs">
          <CardHeader className="py-4 border-b border-border bg-muted/20">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base font-bold">Matriks Mata Pelajaran & Progres Pembelajaran Kelas 8A</CardTitle>
                <CardDescription className="text-xs">Wali Kelas: Dra. Hj. Siti Rahmah, M.Pd • 32 Siswa</CardDescription>
              </div>
              <Badge className="bg-blue-600 text-white font-mono font-bold text-xs">ROMBEL 8A</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/60 text-muted-foreground font-bold border-b border-border">
                <tr>
                  <th className="p-3">Kode & Mapel</th>
                  <th className="p-3">Guru Pengampu Utama</th>
                  <th className="p-3 text-center">Progres Pertemuan Guru</th>
                  <th className="p-3 text-center">Capaian CP (%)</th>
                  <th className="p-3 text-center">Rata-rata 8A</th>
                  <th className="p-3 text-center">Status KKM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mapelDetails.map((m, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition">
                    <td className="p-3 font-semibold">
                      <div className="font-bold text-foreground">{m.mapel}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{m.code}</div>
                    </td>
                    <td className="p-3 font-medium text-foreground">{m.teacher}</td>
                    <td className="p-3 text-center">
                      <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-mono font-bold text-[11px]">
                        {m.pertemuan}
                      </Badge>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-emerald-600 text-white font-mono font-bold text-[11px]">
                        {m.cp}
                      </Badge>
                    </td>
                    <td className="p-3 text-center font-bold font-mono text-primary text-sm">{m.avg}</td>
                    <td className="p-3 text-center">
                      <Badge className="bg-emerald-600 text-white text-[10px]">{m.kkm}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </>
    );
  }

  // Tampilan Executive Kamad / Waka / Admin
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" /> Laporan Pembelajaran & Hasil Belajar Rombel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ringkasan nilai per kelas di MTsN 2 Cilacap. Klik <strong>Detail</strong> pada tiap kelas untuk melihat nilai mapel, nama guru pengampu, dan status KKM.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => toast.success("Laporan Rekap Nilai Madrasah (PDF) berhasil diunduh!")}>
          <Download className="h-3.5 w-3.5 mr-1" /> Unduh Rekap Nilai PDF
        </Button>
      </div>

      {/* Grid Ikon & Nama Kelas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classesList.map((c, idx) => (
          <Card key={idx} className="hover:border-primary/50 transition cursor-pointer shadow-xs group" onClick={() => setSelectedClassModal(c)}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2 rounded-xl bg-primary/10 group-hover:scale-105 transition">{c.icon}</span>
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary bg-primary/5">
                  Rata-rata: {c.avg}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold mt-3 group-hover:text-primary transition">{c.name}</CardTitle>
              <CardDescription className="text-xs">Wali Kelas: {c.wali}</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-2">
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Jumlah Siswa:</span>
                  <strong className="text-foreground font-mono">{c.siswa} Siswa</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status KKM:</span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">{c.tuntas}</Badge>
                </div>
              </div>
              <Button size="sm" className="w-full mt-4 text-xs font-bold gap-1 bg-primary/15 text-primary hover:bg-primary hover:text-white border-0 transition">
                <Eye className="h-3.5 w-3.5" /> Klik Detail Mapel & Guru →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Detail Mapel, Guru Pengampu, & Nilai Rombel */}
      <Dialog open={!!selectedClassModal} onOpenChange={() => setSelectedClassModal(null)}>
        <DialogContent className="sm:max-w-3xl border-border bg-card max-h-[85vh] overflow-y-auto">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <span>{selectedClassModal?.icon}</span> Detail Laporan Pembelajaran & Nilai - {selectedClassModal?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Wali Kelas: <strong>{selectedClassModal?.wali}</strong> • {selectedClassModal?.siswa} Siswa Aktif • Rata-rata Kelas: <strong className="text-primary">{selectedClassModal?.avg}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Daftar Mata Pelajaran, Guru Pengampu, & Evaluasi Nilai:</div>
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3 text-left">Kode & Mapel</th>
                    <th className="p-3 text-left">Guru Pengampu Utama</th>
                    <th className="p-3 text-center">Tugas</th>
                    <th className="p-3 text-center">Kuis</th>
                    <th className="p-3 text-center">CBT</th>
                    <th className="p-3 text-center font-bold">Rata-rata</th>
                    <th className="p-3 text-center">Status KKM</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mapelDetails.map((m, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition">
                      <td className="p-3 font-semibold">
                        <div className="font-bold text-foreground">{m.mapel}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{m.code}</div>
                      </td>
                      <td className="p-3 font-medium text-foreground">{m.teacher}</td>
                      <td className="p-3 text-center font-mono">{m.tugas}</td>
                      <td className="p-3 text-center font-mono">{m.kuis}</td>
                      <td className="p-3 text-center font-mono">{m.cbt}</td>
                      <td className="p-3 text-center font-bold font-mono text-primary text-sm">{m.avg}</td>
                      <td className="p-3 text-center">
                        <Badge className="bg-emerald-600 text-white text-[10px]">{m.kkm}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setSelectedClassModal(null)}>Tutup</Button>
            <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => toast.success(`Rekap Nilai Official ${selectedClassModal?.name} berhasil diunduh!`)}>
              🖨️ Cetak PDF Nilai Kelas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Progress({ activeRole }: { activeRole?: string }) {
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isExecutive = activeRole === "kamad" || activeRole === "waka" || activeRole === "admin";

  const [selectedProgressClass, setSelectedProgressClass] = useState<any>(null);
  const [selectedStudentModal, setSelectedStudentModal] = useState<any>(null);

  const studentsList8A = [
    { name: "Ahmad Fauzi", nis: "0081928371", cp: 95, tugas: 92, status: "Mutqin & Tuntas" },
    { name: "Anisa Rahma", nis: "0081928372", cp: 90, tugas: 88, status: "Tuntas KKM" },
    { name: "Fatimah Az-Zahra", nis: "0081928373", cp: 96, tugas: 94, status: "Mumtaz" },
    { name: "Muhammad Fairuz", nis: "0081928374", cp: 98, tugas: 95, status: "Mumtaz" },
    { name: "Zaid bin Tsabit", nis: "0081928375", cp: 100, tugas: 98, status: "Mumtaz" },
    { name: "Aisyah Humaira", nis: "0081928376", cp: 94, tugas: 91, status: "Tuntas KKM" },
  ];

  const rombelProgressList = [
    { name: "Kelas VII A", cp: 92, tugas: 88, walikelas: "Ibu Ratna Dewi, M.Pd", total: 32 },
    { name: "Kelas VII B", cp: 85, tugas: 82, walikelas: "Ust. Abdul Halim, S.Ag", total: 32 },
    { name: "Kelas VIII A", cp: 95, tugas: 90, walikelas: "Dra. Hj. Siti Rahmah", total: 32 },
    { name: "Kelas VIII B", cp: 88, tugas: 84, walikelas: "Bapak Hendra Wijaya, M.Sc", total: 31 },
    { name: "Kelas IX A", cp: 98, tugas: 94, walikelas: "H. Ahmad Syukri, S.Kom", total: 32 },
    { name: "Kelas IX B", cp: 90, tugas: 86, walikelas: "Ustadzah Nurul Hidayah, S.Pd.I", total: 31 },
  ];

  const mapelProgressBreakdown = [
    { mapel: "Al-Quran Hadits", teacher: "Dra. Hj. Siti Rahmah", cp: 100, tugas: 95, pertemuan: "18 dari 18 Pertemuan" },
    { mapel: "Akidah Akhlak", teacher: "Ust. Abdul Halim", cp: 90, tugas: 88, pertemuan: "16 dari 18 Pertemuan" },
    { mapel: "Fiqih", teacher: "Dra. Hj. Siti Rahmah", cp: 92, tugas: 90, pertemuan: "17 dari 18 Pertemuan" },
    { mapel: "Matematika", teacher: "Bapak Hendra Wijaya", cp: 85, tugas: 80, pertemuan: "15 dari 18 Pertemuan" },
    { mapel: "IPA", teacher: "Ibu Ratna Dewi", cp: 88, tugas: 85, pertemuan: "16 dari 18 Pertemuan" },
    { mapel: "Informatika & Coding", teacher: "H. Ahmad Syukri", cp: 100, tugas: 96, pertemuan: "18 dari 18 Pertemuan" },
  ];

  if (!isExecutive && !isWaliKelas) {
    const studentMapel = [
      { m: "Matematika", p: 78 },
      { m: "B. Indonesia", p: 92 },
      { m: "IPA", p: 65 },
      { m: "Fikih", p: 88 },
      { m: "B. Arab", p: 55 },
    ];
    return (
      <>
        <SectionHeader title="Progress Belajar Saya" sub="Persentase penyelesaian pertemuan per mapel" />
        <div className="space-y-4">
          {studentMapel.map((x, i) => (
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

  // Tampilan Wali Kelas (Scope Siswa Kelas 8A)
  if (isWaliKelas) {
    return (
      <>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <LineChart className="h-6 w-6 text-blue-500" /> Progress Belajar Siswa Rombel 8A
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Persentase Capaian Pembelajaran (CP %) dan Pengumpulan Tugas LKPD untuk 32 Siswa Binaan Kelas 8A.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentsList8A.map((s, idx) => (
            <Card key={idx} className="hover:border-primary/50 transition cursor-pointer shadow-xs" onClick={() => setSelectedStudentModal(s)}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="font-mono text-xs font-bold text-blue-600 bg-blue-500/10">
                    NISN: {s.nis}
                  </Badge>
                  <Badge className="bg-emerald-600 text-white text-[10px] font-bold">{s.status}</Badge>
                </div>
                <CardTitle className="text-base font-bold mt-2">{s.name}</CardTitle>
                <CardDescription className="text-xs">Siswa Rombel VIII A</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-1 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-foreground">Capaian Pembelajaran (CP)</span>
                    <span className="text-emerald-500 font-bold font-mono">{s.cp}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${s.cp}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-foreground">Tugas LKPD Terkumpul</span>
                    <span className="text-blue-500 font-bold font-mono">{s.tugas}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${s.tugas}%` }} />
                  </div>
                </div>

                <Button size="sm" variant="ghost" className="w-full text-xs font-bold text-primary mt-2 hover:bg-primary/10">
                  🔍 Detail Progress Siswa →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal Detail Progress Siswa */}
        <Dialog open={!!selectedStudentModal} onOpenChange={() => setSelectedStudentModal(null)}>
          <DialogContent className="sm:max-w-xl border-border bg-card">
            <DialogHeader className="border-b border-border pb-3">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Rincian Progress Belajar - {selectedStudentModal?.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                NISN: <strong>{selectedStudentModal?.nis}</strong> • Rombel VIII A • Walikelas: Dra. Hj. Siti Rahmah, M.Pd
              </DialogDescription>
            </DialogHeader>

            <div className="py-2 space-y-3 max-h-[60vh] overflow-y-auto text-xs">
              <div className="font-bold uppercase text-muted-foreground">Kelengkapan Pertemuan & Tugas LKPD 18 Pertemuan:</div>
              {mapelProgressBreakdown.map((m, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-muted/20 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-foreground">{m.mapel}</div>
                    <div className="text-[11px] text-muted-foreground">{m.pertemuan}</div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-600 text-white font-mono font-bold">{m.cp}% Tuntas</Badge>
                    <div className="text-[10px] text-muted-foreground mt-0.5">Tugas: {m.tugas}%</div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button size="sm" variant="outline" onClick={() => setSelectedStudentModal(null)}>Tutup</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Tampilan Executive (Kamad / Waka / Admin)
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <LineChart className="h-6 w-6 text-primary" /> Progress Belajar Rombel & Submisi Tugas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Persentase capaian pembelajaran (CP / Alur 1-18) dan persentase tugas/pekerjaan terkumpul per kelas di MTsN 2 Cilacap.
          </p>
        </div>
      </div>

      {/* Grid Class Progress */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rombelProgressList.map((r, idx) => (
          <Card key={idx} className="hover:border-primary/50 transition cursor-pointer shadow-xs" onClick={() => setSelectedProgressClass(r)}>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-bold text-xs bg-primary/10 text-primary border-primary/20">
                  {r.name}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">{r.total} Siswa</span>
              </div>
              <CardTitle className="text-base font-bold mt-2">Progress Belajar {r.name}</CardTitle>
              <CardDescription className="text-xs">Wali Kelas: {r.walikelas}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3">
              {/* Progress 1: Capaian Pembelajaran */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-foreground">Capaian Pembelajaran (CP)</span>
                  <span className="text-emerald-500 font-bold font-mono">{r.cp}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${r.cp}%` }} />
                </div>
              </div>

              {/* Progress 2: Tugas Terkumpul */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-foreground">Tugas Terkumpul & Selesai</span>
                  <span className="text-blue-500 font-bold font-mono">{r.tugas}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${r.tugas}%` }} />
                </div>
              </div>

              <Button size="sm" variant="ghost" className="w-full text-xs font-bold text-primary mt-2 hover:bg-primary/10">
                🔍 Klik Detail Rombel →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Detail Progress Per Rombel */}
      <Dialog open={!!selectedProgressClass} onOpenChange={() => setSelectedProgressClass(null)}>
        <DialogContent className="sm:max-w-2xl border-border bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Detail Progress Belajar & Tugas - {selectedProgressClass?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Wali Kelas: <strong>{selectedProgressClass?.walikelas}</strong> • Rata-rata Capaian CP: <strong className="text-emerald-500">{selectedProgressClass?.cp}%</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3 max-h-[60vh] overflow-y-auto">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rincian Pertemuan & Submisi per Mata Pelajaran:</div>
            {mapelProgressBreakdown.map((m, i) => (
              <div key={i} className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-sm text-foreground">{m.mapel}</div>
                    <div className="text-xs text-muted-foreground">{m.teacher} • {m.pertemuan}</div>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs font-bold text-emerald-500">
                    CP {m.cp}%
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Progress Alur Pertemuan</div>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${m.cp}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Tugas LKPD Terkumpul</div>
                    <div className="h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${m.tugas}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedProgressClass(null)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- 4. Menu Award/Badge & Warning untuk Guru ---------- */
function ApresiasiGuru({ activeRole }: { activeRole?: string }) {
  const [teachersList, setTeachersList] = useState([
    { id: "1", name: "Dra. Hj. Siti Rahmah, M.Pd", mapel: "Al-Quran Hadits & Fiqih", nip: "197804122002122001", badges: ["🏆 Guru Inovatif", "⭐ Presensi Presisi 100%"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "2", name: "Ust. Abdul Halim, S.Ag", mapel: "Akidah Akhlak", nip: "198205102005011003", badges: ["🌟 Media Ajar Terkreatif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "3", name: "Bapak Hendra Wijaya, M.Sc", mapel: "Matematika", nip: "198509202010011002", badges: ["🔥 Ketuntasan KKM Tinggi"], warningCount: 1, status: "Pembinaan Tambahan" },
    { id: "4", name: "H. Ahmad Syukri, S.Kom", mapel: "Informatika & Coding", nip: "198811152014021001", badges: ["🏆 Guru Inovatif", "💡 Modul Inspiratif"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "5", name: "Ibu Ratna Dewi, M.Pd", mapel: "Ilmu Pengetahuan Alam", nip: "199003052016012004", badges: ["⭐ Presensi Presisi 100%"], warningCount: 0, status: "Aktif Terpuji" },
    { id: "6", name: "Ustadzah Nurul Hidayah, S.Pd.I", mapel: "Bahasa Arab", nip: "199207182018012002", badges: ["🌟 Media Ajar Terkreatif"], warningCount: 0, status: "Aktif Terpuji" },
  ]);

  const [historyList, setHistoryList] = useState([
    { id: "h1", teacher: "Dra. Hj. Siti Rahmah, M.Pd", type: "award", title: "🏆 Guru Inovatif", emote: "🎉", comment: "Sangat inspiratif dalam pemanfaatan media digital Al-Quran Hadits Pertemuan 1-18.", date: "26 Juli 2026" },
    { id: "h2", teacher: "Bapak Hendra Wijaya, M.Sc", type: "warning", title: "⚠️ Kelengkapan Modul Terlambat", emote: "⚠️", comment: "Mohon segera melengkapi unggahan LKPD Pertemuan 15 Matematika.", date: "24 Juli 2026" },
  ]);

  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [actionType, setActionType] = useState<"award" | "warning">("award");
  const [badgeCategory, setBadgeCategory] = useState("🏆 Guru Inovatif");
  const [warningCategory, setWarningCategory] = useState("⚠️ Presensi Perlu Ditingkatkan");
  const [emote, setEmote] = useState("🎉");
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAction = (teacher: any, type: "award" | "warning") => {
    setSelectedTeacher(teacher);
    setActionType(type);
    setEmote(type === "award" ? "🎉" : "⚠️");
    setCommentText("");
    setIsModalOpen(true);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const title = actionType === "award" ? badgeCategory : warningCategory;
    const newHistory = {
      id: String(Date.now()),
      teacher: selectedTeacher.name,
      type: actionType,
      title: `${emote} ${title.replace(/^[^\s]+\s/, '')}`,
      emote,
      comment: commentText || (actionType === "award" ? "Apresiasi atas dedikasi dan kinerja pembelajaran di madrasah." : "Catatan pembinaan untuk peningkatan kualitas KBM."),
      date: "Hari ini",
    };

    setHistoryList([newHistory, ...historyList]);

    if (actionType === "award") {
      setTeachersList(
        teachersList.map((t) =>
          t.id === selectedTeacher.id
            ? { ...t, badges: Array.from(new Set([...t.badges, title])) }
            : t
        )
      );
      toast.success(`Award ${title} berhasil diberikan kepada ${selectedTeacher.name}!`);
    } else {
      setTeachersList(
        teachersList.map((t) =>
          t.id === selectedTeacher.id
            ? { ...t, warningCount: t.warningCount + 1, status: "Perlu Evaluasi Pembinaan" }
            : t
        )
      );
      toast.warning(`Catatan Pembinaan berhasil dikirimkan kepada ${selectedTeacher.name}!`);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Apresiasi & Catatan Pembinaan Guru (Award & Warning)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Portal Kepala Madrasah untuk memberikan penghargaan (award/badge) atau catatan pembinaan (warning) kepada Guru Pengampu beserta emotikon & komentar.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 text-amber-500 grid place-items-center font-bold text-xl">
              🏆
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Award Diberikan</div>
              <div className="text-2xl font-extrabold font-mono text-amber-500">{historyList.filter(h => h.type === "award").length + 26} Lencana</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/10 via-card to-card border-destructive/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-destructive/20 text-destructive grid place-items-center font-bold text-xl">
              ⚠️
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Catatan Warning Aktif</div>
              <div className="text-2xl font-extrabold font-mono text-destructive">{historyList.filter(h => h.type === "warning").length + 2} Warning</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/20 text-emerald-500 grid place-items-center font-bold text-xl">
              👨‍🏫
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Guru Pengampu</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-500">54 Guru</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="guru_list" className="space-y-4">
        <TabsList className="bg-muted p-1 border border-border">
          <TabsTrigger value="guru_list" className="text-xs font-bold gap-1.5">
            👨‍🏫 Daftar Guru & Pemberian Apresiasi
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs font-bold gap-1.5">
            📜 Riwayat Award & Warning Diberikan ({historyList.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: List Guru */}
        <TabsContent value="guru_list">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachersList.map((t) => (
              <Card key={t.id} className="border-border hover:border-primary/40 transition shadow-xs">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                        {t.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Badge variant={t.warningCount > 0 ? "destructive" : "secondary"} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold mt-2 leading-snug">{t.name}</CardTitle>
                  <CardDescription className="text-xs">{t.mapel} • {t.nip}</CardDescription>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-2 space-y-3">
                  <div className="space-y-1">
                    <div className="text-[11px] text-muted-foreground font-semibold">Lencana & Apresiasi Diterima:</div>
                    <div className="flex flex-wrap gap-1">
                      {t.badges.map((b, idx) => (
                        <Badge key={idx} variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-semibold">
                          {b}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs h-8 gap-1"
                      onClick={() => handleOpenAction(t, "award")}
                    >
                      🏆 Beri Award
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive border-destructive/30 hover:bg-destructive/10 font-bold text-xs h-8 gap-1"
                      onClick={() => handleOpenAction(t, "warning")}
                    >
                      ⚠️ Warning
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: History */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Log Riwayat Apresiasi & Pembinaan Kepala Madrasah</CardTitle>
              <CardDescription className="text-xs">Catatan resmi penghargaan dan arahan pembinaan yang telah dikirimkan ke guru.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted text-muted-foreground font-bold text-left">
                  <tr>
                    <th className="p-3">Guru Penerima</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3 text-center">Emote</th>
                    <th className="p-3">Komentar / Catatan Kamad</th>
                    <th className="p-3 text-right">Tanggal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {historyList.map((h) => (
                    <tr key={h.id} className="hover:bg-muted/30 transition">
                      <td className="p-3 font-bold text-foreground">{h.teacher}</td>
                      <td className="p-3">
                        <Badge className={h.type === "award" ? "bg-amber-500 text-black font-bold" : "bg-destructive text-white font-bold"}>
                          {h.title}
                        </Badge>
                      </td>
                      <td className="p-3 text-center text-lg">{h.emote}</td>
                      <td className="p-3 text-muted-foreground italic">"{h.comment}"</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{h.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Beri Award / Warning */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {actionType === "award" ? (
                <>
                  <Trophy className="h-5 w-5 text-amber-500" /> Beri Award / Lencana Ke Guru
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" /> Kirim Catatan Warning / Pembinaan
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Penerima: <strong className="text-foreground">{selectedTeacher?.name}</strong> ({selectedTeacher?.mapel})
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAction} className="space-y-4 py-2">
            {actionType === "award" ? (
              <div>
                <Label className="text-xs font-semibold">Pilih Jenis Award / Lencana:</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
                  value={badgeCategory}
                  onChange={(e) => setBadgeCategory(e.target.value)}
                >
                  <option value="🏆 Guru Inovatif">🏆 Guru Inovatif</option>
                  <option value="⭐ Presensi Presisi 100%">⭐ Presensi Presisi 100%</option>
                  <option value="🌟 Media Ajar Terkreatif">🌟 Media Ajar Terkreatif</option>
                  <option value="🔥 Ketuntasan KKM Tinggi">🔥 Ketuntasan KKM Tinggi</option>
                  <option value="💡 Modul Inspiratif">💡 Modul Inspiratif</option>
                </select>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold">Pilih Kategori Catatan Warning:</Label>
                <select
                  className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold"
                  value={warningCategory}
                  onChange={(e) => setWarningCategory(e.target.value)}
                >
                  <option value="⚠️ Presensi Perlu Ditingkatkan">⚠️ Presensi Perlu Ditingkatkan</option>
                  <option value="📝 Kelengkapan Modul Terlambat">📝 Kelengkapan Modul Terlambat</option>
                  <option value="💬 Evaluasi KBM Kelas">💬 Evaluasi KBM Kelas</option>
                  <option value="📌 Respon Tugas Lambat">📌 Respon Tugas Lambat</option>
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Pilih Emotikon:</Label>
              <div className="flex items-center gap-2 mt-1">
                {(actionType === "award" ? ["🎉", "👑", "🎖️", "🌟", "🔥", "🏆"] : ["⚠️", "📢", "📌", "⌛", "💬", "🚨"]).map((emo) => (
                  <button
                    type="button"
                    key={emo}
                    onClick={() => setEmote(emo)}
                    className={`h-9 w-9 rounded-xl border text-lg grid place-items-center transition ${
                      emote === emo ? "bg-primary/20 border-primary scale-110" : "bg-muted/40 border-border hover:bg-muted"
                    }`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Komentar / Pesan Kepala Madrasah:</Label>
              <textarea
                placeholder={actionType === "award" ? "Tuliskan apresiasi khusus untuk apresiasi guru ini..." : "Tuliskan arahan perbaikan dan pembinaan..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full h-24 rounded-md border border-border bg-background p-3 text-xs mt-1"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className={actionType === "award" ? "bg-amber-500 text-black font-bold" : "bg-destructive text-white font-bold"}>
                {actionType === "award" ? "Kirim Award & Badge" : "Kirim Catatan Warning"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- 5. Agenda Madrasah & Kalender Akademik ---------- */
function AgendaKalender({ activeRole }: { activeRole?: string }) {
  const [filterCategory, setFilterCategory] = useState("semua");
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState(false);

  const [agendaList, setAgendaList] = useState([
    { id: "1", title: "CBT Ujian Tengah Semester (PTS) Ganjil", category: "cbt", date: "10 - 15 Agustus 2026", desc: "Evaluasi Komputer Pertemuan 1-9 untuk seluruh rombel.", badge: "🔴 Ujian CBT" },
    { id: "2", title: "Rapat Pleno Evaluasi KBM & Kurikulum", category: "rapat", date: "18 Agustus 2026", desc: "Rapat koordinasi Kepala Madrasah, Waka, dan Guru Pengampu.", badge: "🟣 Rapat Dinas" },
    { id: "3", title: "Gelar Karya Projek Kokurikuler P5 (Batik Cilacap)", category: "kokurikuler", date: "25 Agustus 2026", desc: "Pameran karya seni batik dan produk wirausaha siswa.", badge: "🟡 Kokurikuler P5" },
    { id: "4", title: "Hari Libur Nasional & Peringatan HUT RI", category: "libur", date: "17 Agustus 2026", desc: "Upacara bendera & Kegiatan peringatan kemerdekaan.", badge: "🟢 Libur Resmi" },
    { id: "5", title: "Bimbingan Sertifikasi Tahfidz Juz 30", category: "kbm", date: "01 - 05 September 2026", desc: "Murojaah massal & ujian kelayakan tajwid siswa.", badge: "🔵 KBM Efektif" },
  ]);

  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("cbt");
  const [dateStr, setDateStr] = useState("");
  const [desc, setDesc] = useState("");

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateStr) return toast.error("Harap lengkapi judul dan tanggal agenda!");
    const badge = cat === "cbt" ? "🔴 Ujian CBT" : cat === "rapat" ? "🟣 Rapat Dinas" : cat === "libur" ? "🟢 Libur Resmi" : "🔵 KBM Efektif";
    setAgendaList([{ id: String(Date.now()), title, category: cat, date: dateStr, desc, badge }, ...agendaList]);
    toast.success(`Agenda ${title} berhasil ditambahkan ke Kalender Akademik!`);
    setIsAddAgendaOpen(false);
    setTitle("");
    setDateStr("");
    setDesc("");
  };

  const filteredAgenda = filterCategory === "semua" ? agendaList : agendaList.filter((a) => a.category === filterCategory);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Agenda Madrasah & Kalender Akademik
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jadwal kegiatan madrasah, pelaksanaan ujian CBT, rapat dinas guru, dan hari efektif KBM MTsN 2 Cilacap.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddAgendaOpen(true)}>
          + Tambah Agenda Baru
        </Button>
      </div>

      {/* Filter Kategori */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3 overflow-x-auto">
        <span className="text-xs font-bold text-muted-foreground mr-1">Filter Kategori:</span>
        {[
          { k: "semua", label: "Semua Agenda" },
          { k: "cbt", label: "🔴 Ujian CBT" },
          { k: "rapat", label: "🟣 Rapat Dinas" },
          { k: "kokurikuler", label: "🟡 Kokurikuler P5" },
          { k: "libur", label: "🟢 Libur" },
          { k: "kbm", label: "🔵 KBM Efektif" },
        ].map((f) => (
          <Button
            key={f.k}
            size="sm"
            variant={filterCategory === f.k ? "default" : "outline"}
            className="text-xs font-bold shrink-0"
            onClick={() => setFilterCategory(f.k)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Grid Events */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgenda.map((a) => (
          <Card key={a.id} className="border-border hover:border-primary/40 transition shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-bold">
                  {a.badge}
                </Badge>
                <span className="text-xs font-mono font-bold text-primary">{a.date}</span>
              </div>
              <CardTitle className="text-base font-bold mt-2 leading-snug">{a.title}</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-1">
              <p className="text-xs text-muted-foreground leading-relaxed">{a.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Form Tambah Agenda */}
      <Dialog open={isAddAgendaOpen} onOpenChange={setIsAddAgendaOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Tambah Agenda Akademik Baru
            </DialogTitle>
            <DialogDescription>Input kegiatan resmi ke Kalender Akademik Madrasah.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAgenda} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Kegiatan / Agenda</Label>
              <Input placeholder="Contoh: Rapat Koordinasi Wali Kelas" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Kategori</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={cat} onChange={(e) => setCat(e.target.value)}>
                  <option value="cbt">🔴 Ujian CBT</option>
                  <option value="rapat">🟣 Rapat Dinas</option>
                  <option value="kokurikuler">🟡 Kokurikuler P5</option>
                  <option value="libur">🟢 Libur</option>
                  <option value="kbm">🔵 KBM Efektif</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Tanggal / Periode</Label>
                <Input placeholder="Contoh: 15-18 Agustus 2026" value={dateStr} onChange={(e) => setDateStr(e.target.value)} required className="mt-1 text-xs" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Deskripsi Kegiatan</Label>
              <textarea placeholder="Rincian agenda..." value={desc} onChange={(e) => setDesc(e.target.value)} className="w-full h-20 rounded-md border border-border bg-background p-3 text-xs mt-1" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddAgendaOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">Simpan Agenda</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- 6. Laporan Tahfidz Qur'an Eksekutif ---------- */
function LaporanTahfidzEksekutif({ activeRole }: { activeRole?: string }) {
  const [selectedJuz, setSelectedJuz] = useState("Juz 30");

  const tahfidzClassSummary = [
    { class: "Kelas VII A", total: 32, mutqin: "28 Siswa (87.5%)", avgScore: 92.4, status: "Mumtaz", topStudent: "Ahmad Fauzi" },
    { class: "Kelas VII B", total: 32, mutqin: "26 Siswa (81.2%)", avgScore: 89.8, status: "Jayyid Jiddan", topStudent: "Siti Nurhaliza" },
    { class: "Kelas VIII A", total: 32, mutqin: "30 Siswa (93.7%)", avgScore: 95.1, status: "Mumtaz", topStudent: "Muhammad Rayhan" },
    { class: "Kelas VIII B", total: 31, mutqin: "27 Siswa (87.0%)", avgScore: 91.2, status: "Mumtaz", topStudent: "Fatimah Az-Zahra" },
    { class: "Kelas IX A", total: 32, mutqin: "32 Siswa (100%)", avgScore: 97.5, status: "Mumtaz", topStudent: "Zaid bin Tsabit" },
    { class: "Kelas IX B", total: 31, mutqin: "29 Siswa (93.5%)", avgScore: 93.8, status: "Mumtaz", topStudent: "Aisyah Humaira" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-emerald-500" /> Laporan Eksekutif Tahfidz Al-Quran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoring Kepala Madrasah atas capaian target hafalan siswa per Juz, ketuntasan tajwid, dan leaderboard Rombel MTsN 2 Cilacap.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => toast.success("PDF Rekap Tahfidz Eksekutif Madrasah berhasil diunduh!")}>
          <Download className="h-3.5 w-3.5 mr-1" /> 🖨️ Export PDF Rekap Tahfidz
        </Button>
      </div>

      {/* Target Juz Selector */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <span className="text-xs font-bold text-muted-foreground mr-1">Target Juz Eksekutif:</span>
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

      {/* Executive Tahfidz Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/20 text-emerald-500 grid place-items-center font-bold text-xl">
              📖
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Siswa Mutqin ({selectedJuz})</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-500">172 Siswa (89.5%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 via-card to-card border-blue-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-500/20 text-blue-500 grid place-items-center font-bold text-xl">
              🌟
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Rata-rata Nilai Tajwid</div>
              <div className="text-2xl font-extrabold font-mono text-blue-500">93.3 (Mumtaz)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 via-card to-card border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-purple-500/20 text-purple-500 grid place-items-center font-bold text-xl">
              🕌
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Setoran Terverifikasi</div>
              <div className="text-2xl font-extrabold font-mono text-purple-500">1,840 Surah</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Capaian Tahfidz per Rombel */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Matriks Capaian Tahfidz Al-Quran per Rombel ({selectedJuz})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted text-muted-foreground font-bold text-left">
              <tr>
                <th className="p-3">Nama Rombel</th>
                <th className="p-3 text-center">Jumlah Siswa</th>
                <th className="p-3 text-center">Siswa Mutqin</th>
                <th className="p-3 text-center">Rata-rata Tajwid</th>
                <th className="p-3">Top Hafiz Rombel</th>
                <th className="p-3 text-right font-semibold">Evaluasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tahfidzClassSummary.map((t, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition">
                  <td className="p-3 font-bold text-foreground">{t.class}</td>
                  <td className="p-3 text-center font-mono">{t.total}</td>
                  <td className="p-3 text-center">
                    <Badge className="bg-emerald-600 text-white font-mono">{t.mutqin}</Badge>
                  </td>
                  <td className="p-3 text-center font-bold font-mono text-primary text-sm">{t.avgScore}</td>
                  <td className="p-3 font-semibold text-foreground">👑 {t.topStudent}</td>
                  <td className="p-3 text-right">
                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-bold">
                      {t.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}

/* ---------- 7. Laporan Kegiatan Kokurikuler (P5 / PPA-RA) ---------- */
function LaporanKokurikuler({ activeRole }: { activeRole?: string }) {
  const [projectsList] = useState([
    {
      id: "p1",
      title: "Gaya Hidup Berkelanjutan: Pengolahan Sampah Organik & Bank Sampah Madrasah",
      target: "Tingkat VII (Kelas VII A - VII D)",
      coordinator: "Ibu Ratna Dewi, M.Pd",
      progress: 85,
      studentsCount: 312,
      status: "Sangat Berkembang",
      outcomes: ["Kompos Organik Super", "Kerajinan Daur Ulang", "Bank Sampah Digital"],
    },
    {
      id: "p2",
      title: "Kearifan Lokal: Pelestarian Batik & Seni Daerah Cilacap",
      target: "Tingkat VIII (Kelas VIII A - VIII D)",
      coordinator: "Dra. Hj. Siti Rahmah, M.Pd",
      progress: 90,
      studentsCount: 318,
      status: "Sangat Berkembang",
      outcomes: ["Kain Batik Tulis Motif Cilacap", "Pameran Seni Daerah", "Katalog Digital Motif Batik"],
    },
    {
      id: "p3",
      title: "Kewirausahaan: Pasar Digital & Business Day Siswa Madrasah",
      target: "Tingkat IX (Kelas IX A - IX D)",
      coordinator: "H. Ahmad Syukri, S.Kom",
      progress: 95,
      studentsCount: 318,
      status: "Sangat Berkembang",
      outcomes: ["Stand Wirausaha Digital", "Produk Kuliner Halal", "Laporan Keuangan Wirausaha"],
    },
  ]);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-500" /> Laporan Kegiatan Kokurikuler (P5 & PPA-RA)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekap Eksekutif Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil Alamin (P5/PPA-RA) MTsN 2 Cilacap.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white" onClick={() => toast.success("PDF Laporan Portofolio Kokurikuler berhasil diunduh!")}>
          <Download className="h-3.5 w-3.5 mr-1" /> 🖨️ Cetak Portfolio P5 PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-purple-500/10 via-card to-card border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-purple-500/20 text-purple-500 grid place-items-center font-bold text-xl">
              🌿
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Projek Kokurikuler</div>
              <div className="text-2xl font-extrabold font-mono text-purple-500">3 Tema Aktif</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card border-emerald-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/20 text-emerald-500 grid place-items-center font-bold text-xl">
              🎓
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Total Siswa Terlibat</div>
              <div className="text-2xl font-extrabold font-mono text-emerald-500">948 Siswa (100%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 via-card to-card border-amber-500/30">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/20 text-amber-500 grid place-items-center font-bold text-xl">
              🎨
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Gelar Karya & Produk</div>
              <div className="text-2xl font-extrabold font-mono text-amber-500">9 Produk Karya</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projectsList.map((p) => (
          <Card key={p.id} className="border-border hover:border-purple-500/40 transition shadow-xs">
            <CardHeader className="p-5 pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <Badge className="bg-purple-600 text-white text-[10px] mb-1">{p.target}</Badge>
                  <CardTitle className="text-lg font-bold">{p.title}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">Koordinator Projek: <strong>{p.coordinator}</strong> • {p.studentsCount} Siswa</CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-bold text-xs shrink-0">
                  {p.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-5 pt-0 space-y-4">
              {/* Progress Bar Projek */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Capaian Implementasi Projek</span>
                  <span className="text-purple-500 font-mono font-bold">{p.progress}% Tuntas</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                </div>
              </div>

              {/* Artifact Outomes */}
              <div className="space-y-1.5 pt-2 border-t border-border">
                <div className="text-xs font-bold text-muted-foreground">Hasil Produk & Gelar Karya Siswa:</div>
                <div className="flex flex-wrap gap-2">
                  {p.outcomes.map((out, i) => (
                    <Badge key={i} variant="secondary" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs font-medium">
                      ✨ {out}
                    </Badge>
                  ))}
                </div>
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
            <BookMarked className="h-6 w-6 text-primary" /> Modul Keagamaan Tahfidz Al-Quran
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

function Perpustakaan() {
  const [filterTag, setFilterTag] = useState("Semua");
  const [activeMediaModal, setActiveMediaModal] = useState<any>(null);

  const [bukuList, setBukuList] = useState([
    { id: "1", t: "Buku Digital Fikih Kelas VIII (Kemenag)", icon: FileText, tag: "PDF Modul", size: "12.4 MB", type: "pdf", url: "#" },
    { id: "2", t: "Video Tutorial Pembelajaran Tajwid Mad Silah", icon: Video, tag: "Video Tutorial", size: "45.0 MB", type: "video", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", desc: "Penjelasan audio-visual contoh hukum bacaan Mad Silah Qashirah & Thawilah." },
    { id: "3", t: "Audio Murottal Tajwid Juz 30 (Surah An-Naba')", icon: Headphones, tag: "Audio Murottal", size: "18.2 MB", type: "audio", audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", desc: "Murottal merdu beserta panduan makhraj dan hukum tajwid." },
    { id: "4", t: "Video Tutorial Praktikum Organ Pernapasan IPA", icon: Video, tag: "Video Tutorial", size: "38.5 MB", type: "video", videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4", desc: "Peragaan simulasi paru-paru dan mekanisme inspirasi-ekspirasi." },
    { id: "5", t: "E-Book Sejarah Kebudayaan Islam", icon: Library, tag: "E-Book", size: "8.7 MB", type: "pdf", url: "#" },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("PDF Modul");

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    setBukuList([
      { id: String(Date.now()), t: title, icon: tag === "Video Tutorial" ? Video : tag === "Audio Murottal" ? Headphones : FileText, tag, size: "3.5 MB", type: tag === "Video Tutorial" ? "video" : tag === "Audio Murottal" ? "audio" : "pdf", url: "#" },
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
            Koleksi E-Book resmi Kemenag, Modul PDF, Video Pembelajaran, Audio Murottal Streaming, & Simulasi Interaktif.
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
          const isMedia = k.type === "video" || k.type === "audio";
          return (
            <Card key={k.id} className="border-border shadow-xs hover:border-primary/40 transition group">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 font-bold group-hover:scale-105 transition">
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

                {isMedia ? (
                  <Button size="sm" className="shrink-0 text-xs font-bold gap-1 bg-primary text-primary-foreground" onClick={() => setActiveMediaModal(k)}>
                    ▶ {k.type === "video" ? "Tonton" : "Dengar"}
                  </Button>
                ) : (
                  <Button size="icon" variant="ghost" className="shrink-0" onClick={() => toast.success(`Membuka berkas ${k.t}`)}>
                    <Download className="h-4 w-4 text-primary" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* MODAL STREAMING VIDEO / AUDIO PLAYER (TANPA DOWNLOAD) */}
      <Dialog open={!!activeMediaModal} onOpenChange={() => setActiveMediaModal(null)}>
        <DialogContent className="sm:max-w-xl border-border bg-card">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              {activeMediaModal?.type === "video" ? <Video className="h-5 w-5 text-blue-500" /> : <Headphones className="h-5 w-5 text-purple-500" />}
              {activeMediaModal?.t}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {activeMediaModal?.desc || "Media pembelajaran digital terintegrasi MTsN 2 Cilacap"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-4">
            {activeMediaModal?.type === "video" && (
              <div className="rounded-xl overflow-hidden bg-black border border-border aspect-video grid place-items-center">
                <video controls autoPlay className="w-full h-full object-contain">
                  <source src={activeMediaModal?.videoUrl} type="video/mp4" />
                  Browser Anda tidak mendukung HTML5 Video.
                </video>
              </div>
            )}

            {activeMediaModal?.type === "audio" && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-950 text-white space-y-4 text-center border border-purple-500/30">
                <div className="h-16 w-16 mx-auto rounded-full bg-purple-500/20 text-purple-300 grid place-items-center font-bold text-2xl animate-pulse">
                  🎧
                </div>
                <div>
                  <div className="font-bold text-sm">{activeMediaModal?.t}</div>
                  <div className="text-xs text-slate-300 mt-1">Pemutar Streaming Audio Murottal (Cukup dengarkan tanpa download)</div>
                </div>
                <div className="pt-2">
                  <audio controls autoPlay className="w-full rounded-lg">
                    <source src={activeMediaModal?.audioUrl} type="audio/mpeg" />
                    Browser Anda tidak mendukung HTML5 Audio.
                  </audio>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border">
            <Badge variant="outline" className="text-[10px] text-muted-foreground mr-auto">
              🔒 Standard Streaming Mode (Tonton / Dengar Tanpa Download)
            </Badge>
            <Button size="sm" variant="outline" onClick={() => setActiveMediaModal(null)}>Tutup Pemutar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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



/* ---------- Modul Ajar PDF per Jenjang ---------- */
function ModulAjar({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const rawClass = userProfile?.class_name || "VIII-A";

  const getStudentJenjang = (cName: string) => {
    if (cName.includes("7") || cName.toUpperCase().includes("VII")) return "Kelas VII";
    if (cName.includes("9") || cName.toUpperCase().includes("IX")) return "Kelas IX";
    return "Kelas VIII";
  };

  const initialJenjang = isSiswa ? getStudentJenjang(rawClass) : "semua";
  const [selectedJenjang, setSelectedJenjang] = useState(initialJenjang);
  const [modulList, setModulList] = useState([
    { id: "m1", title: "Modul Ajar Al-Quran Hadits Pertemuan 1-18", mapel: "Al-Quran Hadits", jenjang: "Kelas VIII", teacher: "Dra. Hj. Siti Rahmah, M.Pd", size: "3.4 MB", date: "15 Juli 2026", status: "Terverifikasi Waka" },
    { id: "m2", title: "Modul Ajar Fiqih Kebangsaan & Ibadah", mapel: "Fiqih", jenjang: "Kelas IX", teacher: "Dra. Hj. Siti Rahmah, M.Pd", size: "4.1 MB", date: "18 Juli 2026", status: "Terverifikasi Waka" },
    { id: "m3", title: "Modul Ajar Akidah Akhlak Perilaku Terpuji", mapel: "Akidah Akhlak", jenjang: "Kelas VII", teacher: "Ust. Abdul Halim, S.Ag", size: "2.8 MB", date: "10 Juli 2026", status: "Terverifikasi Waka" },
    { id: "m4", title: "Modul Ajar Matematika Aljabar & Geometri", mapel: "Matematika", jenjang: "Kelas VIII", teacher: "Bapak Hendra Wijaya, M.Sc", size: "5.2 MB", date: "12 Juli 2026", status: "Terverifikasi Waka" },
  ]);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newMapel, setNewMapel] = useState("Al-Quran Hadits");
  const [newJenjang, setNewJenjang] = useState("Kelas VIII");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return toast.error("Harap isi judul modul ajar!");
    setModulList([
      { id: String(Date.now()), title: newTitle, mapel: newMapel, jenjang: newJenjang, teacher: "Dra. Hj. Siti Rahmah, M.Pd", size: "3.8 MB", date: "Hari ini", status: "Terverifikasi Waka" },
      ...modulList,
    ]);
    toast.success(`Modul Ajar PDF "${newTitle}" berhasil diunggah!`);
    setIsUploadOpen(false);
    setNewTitle("");
  };

  const filteredModul = selectedJenjang === "semua" ? modulList : modulList.filter((m) => m.jenjang === selectedJenjang);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" /> Perangkat Ajar & Modul Ajar PDF {isSiswa && <Badge className="bg-emerald-600 text-white font-bold text-xs">📍 Kelas {rawClass}</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSiswa
              ? `Akses berkas PDF Modul Ajar Kurikulum Merdeka khusus Kelas ${rawClass} MTsN 2 Cilacap`
              : "Unggah dan kelola file PDF Modul Ajar Kurikulum Merdeka per mata pelajaran & jenjang (Kelas VII, VIII, IX)."}
          </p>
        </div>
        {!isSiswa && (
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> + Unggah Modul Ajar PDF
          </Button>
        )}
      </div>

      {/* Filter Jenjang */}
      <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
        <span className="text-xs font-bold text-muted-foreground mr-1">Filter Jenjang:</span>
        {["semua", "Kelas VII", "Kelas VIII", "Kelas IX"].map((j) => (
          <Button
            key={j}
            size="sm"
            variant={selectedJenjang === j ? "default" : "outline"}
            className="text-xs font-bold"
            onClick={() => setSelectedJenjang(j)}
          >
            {j === "semua" ? "Semua Jenjang" : j}
          </Button>
        ))}
      </div>

      {/* List Modul Ajar PDF */}
      <div className="grid sm:grid-cols-2 gap-4">
        {filteredModul.map((m) => (
          <Card key={m.id} className="border-border hover:border-emerald-500/50 transition shadow-xs">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 text-emerald-600 grid place-items-center shrink-0 font-bold text-xl">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="text-[10px] font-bold text-emerald-600 border-emerald-500/30">
                    {m.jenjang} • {m.mapel}
                  </Badge>
                  <Badge className="bg-emerald-600 text-white text-[10px]">{m.status}</Badge>
                </div>
                <div className="font-bold text-sm text-foreground mt-1 truncate">{m.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Penyusun: {m.teacher}</div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border">
                  <span>Ukuran File: <strong>{m.size}</strong></span>
                  <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10" onClick={() => toast.success(`Mengunduh file PDF ${m.title}...`)}>
                    <Download className="h-3 w-3 mr-1" /> Unduh PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Upload Modul Ajar PDF */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-500" /> Unggah Modul Ajar PDF Baru
            </DialogTitle>
            <DialogDescription className="text-xs">Pilih mata pelajaran, jenjang kelas, dan dokumen PDF modul ajar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Judul Modul Ajar / RPP</Label>
              <Input placeholder="Contoh: Modul Ajar Al-Quran Hadits Pertemuan 1-18" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Mata Pelajaran</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={newMapel} onChange={(e) => setNewMapel(e.target.value)}>
                  <option value="Al-Quran Hadits">Al-Quran Hadits</option>
                  <option value="Fiqih">Fiqih</option>
                  <option value="Akidah Akhlak">Akidah Akhlak</option>
                  <option value="Bahasa Arab">Bahasa Arab</option>
                  <option value="Matematika">Matematika</option>
                  <option value="IPA">IPA</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Jenjang Kelas</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={newJenjang} onChange={(e) => setNewJenjang(e.target.value)}>
                  <option value="Kelas VII">Kelas VII</option>
                  <option value="Kelas VIII">Kelas VIII</option>
                  <option value="Kelas IX">Kelas IX</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pilih Dokumen PDF</Label>
              <Input type="file" accept=".pdf" className="mt-1 text-xs cursor-pointer" />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsUploadOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-emerald-600 text-white font-bold">Simpan & Unggah PDF</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- Pusat Asesmen Reorganisasi ---------- */
function PusatAsesmen({ activeRole }: { activeRole?: string }) {
  const [activeTab, setActiveTab] = useState("formatif");

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" /> Pusat Asesmen & Penilaian Pembelajaran
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reorganisasi modul asesmen Kurikulum Merdeka Kemenag: Formatif, Sumatif, Kuis Interaktif, Tugas Individu, Kelompok, & Tidak Terstruktur.
          </p>
        </div>
      </div>

      {/* 6 Tabs Submenu Asesmen */}
      <Tabs defaultValue="formatif" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto p-1 bg-muted/60 rounded-xl mb-6">
          <TabsTrigger value="formatif" className="text-xs font-bold py-2">📝 Formatif (F1-F3)</TabsTrigger>
          <TabsTrigger value="sumatif" className="text-xs font-bold py-2">🎯 Sumatif (S1-S3)</TabsTrigger>
          <TabsTrigger value="kuis" className="text-xs font-bold py-2">⚡ Kuis Interaktif</TabsTrigger>
          <TabsTrigger value="individu" className="text-xs font-bold py-2">👤 Tugas Individu</TabsTrigger>
          <TabsTrigger value="kelompok" className="text-xs font-bold py-2">👥 Tugas Kelompok</TabsTrigger>
          <TabsTrigger value="terstruktur" className="text-xs font-bold py-2">🌐 Non Terstruktur</TabsTrigger>
        </TabsList>

        <TabsContent value="formatif">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold">Asesmen Formatif (Formatif 1, 2, 3)</CardTitle>
                  <CardDescription className="text-xs">Observasi harian, diskusi kelompok, & asesmen proses pembelajaran siswa.</CardDescription>
                </div>
                <Button size="sm" className="text-xs font-bold bg-primary text-primary-foreground" onClick={() => toast.success("Form Input Asesmen Formatif Baru dibuat!")}>
                  + Buat Formatif Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3">Nama Asesmen Formatif</th>
                    <th className="p-3">Mata Pelajaran & Kelas</th>
                    <th className="p-3 text-center">Tanggal Asesmen</th>
                    <th className="p-3 text-center">Siswa Dinilai</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">Formatif 1: Observasi Praktik Tajwid Mad Silah</td>
                    <td className="p-3 font-medium">{"Al-Quran Hadits (Kelas VIII A)"}</td>
                    <td className="p-3 text-center font-mono">15 Juli 2026</td>
                    <td className="p-3 text-center font-mono font-bold text-emerald-500">32/32 Siswa (100%)</td>
                    <td className="p-3 text-right"><Badge className="bg-emerald-600 text-white">TUNTAS</Badge></td>
                  </tr>
                  <tr className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">Formatif 2: Diskusi Kelompok Syarat Sembelihan</td>
                    <td className="p-3 font-medium">Fiqih (Kelas IX C)</td>
                    <td className="p-3 text-center font-mono">20 Juli 2026</td>
                    <td className="p-3 text-center font-mono font-bold text-blue-500">28/32 Siswa (87%)</td>
                    <td className="p-3 text-right"><Badge variant="outline" className="text-blue-500 border-blue-500/30">BERLANGSUNG</Badge></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sumatif">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold">Asesmen Sumatif (Sumatif 1 PTS, Sumatif 2 Unit, Sumatif 3 PAS)</CardTitle>
                  <CardDescription className="text-xs">Ujian terstruktur penentu pencapaian ketuntasan Kurikulum Merdeka.</CardDescription>
                </div>
                <Button size="sm" className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white" onClick={() => toast.success("Jadwal Ujian Sumatif Baru ditambahkan!")}>
                  + Buat Sumatif Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3">Nama Asesmen Sumatif</th>
                    <th className="p-3">Mata Pelajaran & Rombel</th>
                    <th className="p-3 text-center">Batas Pengerjaan</th>
                    <th className="p-3 text-center">Rata-rata Nilai</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr className="hover:bg-muted/30 transition">
                    <td className="p-3 font-bold text-foreground">Sumatif 1 (PTS): CBT Tajwid & Hadits Ganjil</td>
                    <td className="p-3 font-medium">{"Al-Quran Hadits (Kelas VIII A)"}</td>
                    <td className="p-3 text-center font-mono">15 Agustus 2026</td>
                    <td className="p-3 text-center font-mono font-bold text-primary text-sm">91.4</td>
                    <td className="p-3 text-right"><Button size="sm" variant="ghost" className="text-xs text-primary font-bold">Input Skor →</Button></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kuis">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base font-bold">Kuis Interaktif Online</CardTitle>
                  <CardDescription className="text-xs">Platform kuis kilat Pilihan Ganda & Isian singkat interaktif.</CardDescription>
                </div>
                <Button size="sm" className="text-xs font-bold bg-amber-500 hover:bg-amber-600 text-black" onClick={() => toast.success("Kuis Interaktif Baru dibuat!")}>
                  + Buat Kuis Baru
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex justify-between items-center">
                <div>
                  <Badge className="bg-amber-500 text-black text-[10px] font-bold mb-1">⚡ KUIS INTERAKTIF LIVE</Badge>
                  <div className="font-bold text-base text-foreground">Kuis Tajwid Challenge Pertemuan 16</div>
                  <div className="text-xs text-muted-foreground">10 Soal Pilihan Ganda • 32 Siswa Siap Mengerjakan</div>
                </div>
                <Button size="sm" className="bg-amber-500 text-black font-bold text-xs" onClick={() => toast.success("Sesi Kuis Interaktif dimulai!")}>
                  Mulai Kuis Live ▶
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="individu">
          <Card className="border-border p-5 text-xs text-muted-foreground">
            Daftar Penugasan Mandiri Siswa (Tugas Individu LKPD Pertemuan 1-18).
          </Card>
        </TabsContent>

        <TabsContent value="kelompok">
          <Card className="border-border p-5 text-xs text-muted-foreground">
            Daftar Penugasan Kelompok & Ruang Diskusi Kolaboratif Siswa.
          </Card>
        </TabsContent>

        <TabsContent value="terstruktur">
          <Card className="border-border p-5 text-xs text-muted-foreground">
            Penugasan Tidak Terstruktur (Portofolio Mandiri / Projek Bebas Siswa).
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}

/* ---------- Menu Asisten AI & Tools Guru ---------- */
function AsistenAITools() {
  const toolsList = [
    { name: "ChatGPT (OpenAI)", desc: "Asisten AI perancang RPP, kuis interaktif, & pembuatan soal CBT.", icon: "🤖", link: "https://chatgpt.com", badge: "AI Assistant", color: "from-emerald-500/20 to-teal-500/20" },
    { name: "NotebookLM (Google)", desc: "Pengolah dokumen modul ajar & rangkuman materi otomatis dari sumber PDF.", icon: "📓", link: "https://notebooklm.google.com", badge: "Google AI", color: "from-blue-500/20 to-indigo-500/20" },
    { name: "Google Workspace", desc: "Akses cepat Google Docs, Slides, Forms, & Classroom untuk KBM.", icon: "💼", link: "https://workspace.google.com", badge: "Productivity", color: "from-amber-500/20 to-orange-500/20" },
    { name: "Canva for Education", desc: "Desain presentasi media ajar interaktif & infografis pelajaran.", icon: "🎨", link: "https://canva.com", badge: "Media Design", color: "from-purple-500/20 to-pink-500/20" },
    { name: "Quizizz Interaktif", desc: "Platform kuis game gamifikasi interaktif untuk menguji pemahaman kelas.", icon: "🎮", link: "https://quizizz.com", badge: "Gamification", color: "from-red-500/20 to-rose-500/20" },
    { name: "PhET Interactive Sims", desc: "Simulasi praktikum laboratorium Sains & Matematika interaktif.", icon: "🔬", link: "https://phet.colorado.edu", badge: "Science Lab", color: "from-cyan-500/20 to-sky-500/20" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-500" /> Asisten AI & Digital Tools Pembelajaran Guru
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kumpulan alat bantu kecerdasan buatan & media digital produksi pembelajaran yang terintegrasi untuk Guru MTsN 2 Cilacap.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {toolsList.map((t, idx) => (
          <Card key={idx} className="border-border hover:border-blue-500/50 transition shadow-xs group">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <span className="text-3xl p-2 rounded-xl bg-blue-500/10 group-hover:scale-110 transition">{t.icon}</span>
                <Badge variant="outline" className="font-mono text-[10px] font-bold text-blue-500 border-blue-500/20">
                  {t.badge}
                </Badge>
              </div>
              <CardTitle className="text-base font-bold mt-3 group-hover:text-blue-500 transition flex items-center gap-1.5">
                {t.name} <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </CardTitle>
              <CardDescription className="text-xs">{t.desc}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <a href={t.link} target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full text-xs font-bold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white mt-2">
                  <Bot className="h-3.5 w-3.5" /> Buka {t.name.split(' ')[0]} ↗
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

/* ---------- Award Badge & Warning untuk Siswa ---------- */
function ApresiasiSiswa({ activeRole }: { activeRole?: string }) {
  const [studentsList, setStudentsList] = useState([
    { id: "1", name: "Ahmad Fauzi", rombel: "Kelas VIII A", nis: "0081928371", badges: ["⭐ Siswa Aktif", "🏆 Nilai Perfect 100"], warningCount: 0 },
    { id: "2", name: "Anisa Rahma", rombel: "Kelas VIII A", nis: "0081928372", badges: ["🌟 Hafalan Mutqin"], warningCount: 0 },
    { id: "3", name: "Budi Santoso", rombel: "Kelas VIII A", nis: "0081928373", badges: [], warningCount: 1 },
    { id: "4", name: "Fatimah Az-Zahra", rombel: "Kelas VIII A", nis: "0081928374", badges: ["💡 Solutif & Kreatif"], warningCount: 0 },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [actionType, setActionType] = useState<"award" | "warning">("award");
  const [badgeCategory, setBadgeCategory] = useState("⭐ Siswa Aktif");
  const [warningCategory, setWarningCategory] = useState("⚠️ Belum Mengumpulkan Tugas");
  const [emote, setEmote] = useState("🎉");
  const [commentText, setCommentText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenAction = (student: any, type: "award" | "warning") => {
    setSelectedStudent(student);
    setActionType(type);
    setEmote(type === "award" ? "🎉" : "⚠️");
    setCommentText("");
    setIsModalOpen(true);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const title = actionType === "award" ? badgeCategory : warningCategory;
    if (actionType === "award") {
      setStudentsList(
        studentsList.map((s) => (s.id === selectedStudent.id ? { ...s, badges: Array.from(new Set([...s.badges, title])) } : s))
      );
      toast.success(`Lencana ${title} berhasil diberikan kepada ${selectedStudent.name}!`);
    } else {
      setStudentsList(
        studentsList.map((s) => (s.id === selectedStudent.id ? { ...s, warningCount: s.warningCount + 1 } : s))
      );
      toast.warning(`Catatan Pembinaan ${title} berhasil dikirimkan kepada ${selectedStudent.name}!`);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-amber-500" /> Award, Badge & Warning Siswa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fitur Guru untuk memberikan apresiasi lencana karakter/prestasi dan catatan pembinaan kepada siswa di kelas yang diampu.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {studentsList.map((s) => (
          <Card key={s.id} className="border-border hover:border-amber-500/40 transition shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  NISN: {s.nis}
                </Badge>
                <Badge className="bg-blue-600 text-white text-[10px]">{s.rombel}</Badge>
              </div>
              <CardTitle className="text-base font-bold mt-2">{s.name}</CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-1 space-y-3">
              <div className="space-y-1">
                <div className="text-xs font-bold text-muted-foreground">Lencana Apresiasi:</div>
                <div className="flex flex-wrap gap-1.5">
                  {s.badges.length > 0 ? (
                    s.badges.map((b, i) => (
                      <Badge key={i} className="bg-amber-500/20 text-amber-700 border-amber-500/30 text-[10px]">
                        {b}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">Belum ada lencana</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <Button size="sm" className="w-1/2 text-xs font-bold bg-amber-500 text-black hover:bg-amber-600 gap-1" onClick={() => handleOpenAction(s, "award")}>
                  <Trophy className="h-3.5 w-3.5" /> + Beri Award
                </Button>
                <Button size="sm" variant="outline" className="w-1/2 text-xs font-bold text-destructive border-destructive/30 hover:bg-destructive/10 gap-1" onClick={() => handleOpenAction(s, "warning")}>
                  <AlertTriangle className="h-3.5 w-3.5" /> + Warning
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Award/Warning Siswa */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              {actionType === "award" ? <Trophy className="h-5 w-5 text-amber-500" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
              {actionType === "award" ? `Beri Award & Badge - ${selectedStudent?.name}` : `Kirim Warning Pembinaan - ${selectedStudent?.name}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAction} className="space-y-4 py-2">
            {actionType === "award" ? (
              <div>
                <Label className="text-xs font-semibold">Pilih Lencana Award:</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold" value={badgeCategory} onChange={(e) => setBadgeCategory(e.target.value)}>
                  <option value="⭐ Siswa Aktif & Responsif">⭐ Siswa Aktif & Responsif</option>
                  <option value="🏆 Nilai Perfect 100">🏆 Nilai Perfect 100</option>
                  <option value="🌟 Hafalan Mutqin">🌟 Hafalan Mutqin</option>
                  <option value="💡 Solutif & Kreatif">💡 Solutif & Kreatif</option>
                </select>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold">Pilih Kategori Warning:</Label>
                <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1 font-semibold" value={warningCategory} onChange={(e) => setWarningCategory(e.target.value)}>
                  <option value="⚠️ Belum Mengumpulkan Tugas">⚠️ Belum Mengumpulkan Tugas</option>
                  <option value="📝 Presensi Perlu Ditingkatkan">📝 Presensi Perlu Ditingkatkan</option>
                  <option value="💬 Evaluasi KBM">💬 Evaluasi KBM</option>
                </select>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Pilih Emotikon:</Label>
              <div className="flex items-center gap-2 mt-1">
                {(actionType === "award" ? ["🎉", "⭐", "🏆", "🌟", "💡"] : ["⚠️", "📝", "💬", "🚨"]).map((emo) => (
                  <button type="button" key={emo} onClick={() => setEmote(emo)} className={`h-9 w-9 rounded-xl border text-lg grid place-items-center transition ${emote === emo ? "bg-primary/20 border-primary scale-110" : "bg-muted/40 border-border hover:bg-muted"}`}>
                    {emo}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Pesan / Catatan Guru:</Label>
              <textarea placeholder="Tuliskan apresiasi atau catatan pembinaan..." value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full h-20 rounded-md border border-border bg-background p-3 text-xs mt-1" />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className={actionType === "award" ? "bg-amber-500 text-black font-bold" : "bg-destructive text-white font-bold"}>
                {actionType === "award" ? "Kirim Badge Siswa" : "Kirim Catatan Warning"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- Menu Kehadiran Siswa ---------- */
function KehadiranSiswa() {
  const [presensiList, setPresensiList] = useState([
    { id: "1", date: "Selasa, 28 Juli 2026", status: "Hadir di Kelas", time: "07:15 WIB", note: "Enroll Presensi Mandiri di Kelas VIII A", badge: "bg-emerald-600 text-white" },
    { id: "2", date: "Senin, 27 Juli 2026", status: "Hadir di Kelas", time: "07:10 WIB", note: "Enroll Presensi Mandiri di Kelas VIII A", badge: "bg-emerald-600 text-white" },
    { id: "3", date: "Jumat, 24 Juli 2026", status: "Hadir di Luar Kelas", time: "08:00 WIB", note: "Lomba Tahfidz Al-Qur'an Tingkat Kabupaten (Surat Tugas Terlampir)", badge: "bg-blue-600 text-white" },
    { id: "4", date: "Kamis, 23 Juli 2026", status: "Hadir di Luar Kelas", time: "07:30 WIB", note: "Izin Sakit (Surat Dokter Terlampir)", badge: "bg-amber-500 text-black font-bold" },
    { id: "5", date: "Rabu, 22 Juli 2026", status: "Alpha", time: "-", note: "Siswa tidak melakukan Enroll Harian", badge: "bg-destructive text-white" },
  ]);

  const [isPermohonanOpen, setIsPermohonanOpen] = useState(false);
  const [statusType, setStatusType] = useState("Hadir di Luar Kelas");
  const [dateInput, setDateInput] = useState("Rabu, 29 Juli 2026");
  const [keteranganText, setKeteranganText] = useState("");

  const handleCreatePermohonan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keteranganText) return toast.error("Harap isi keterangan izin atau kegiatan luar kelas!");
    const badge = statusType === "Hadir di Luar Kelas" ? "bg-blue-600 text-white" : "bg-amber-500 text-black font-bold";
    setPresensiList([
      { id: String(Date.now()), date: dateInput, status: statusType, time: "Pengajuan", note: keteranganText, badge },
      ...presensiList,
    ]);
    toast.success("Permohonan Presensi Hadir di Luar Kelas / Izin berhasil dikirimkan ke Wali Kelas!");
    setIsPermohonanOpen(false);
    setKeteranganText("");
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-emerald-500" /> Kehadiran & Rekap Presensi Siswa
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Rekap status presensi harian: Hadir di Kelas (Enroll Mandiri), Hadir di Luar Kelas (Izin/Sakit/Tugas Dinas), & Alpha.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setIsPermohonanOpen(true)}>
          + Ajukan Izin / Hadir Luar Kelas
        </Button>
      </div>

      {/* 4 Cards Summary Presensi */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border hover:border-emerald-500/50 transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 text-emerald-500 grid place-items-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Hadir di Kelas</div>
              <div className="text-xl font-bold font-mono text-emerald-500">18 Hari (90%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-blue-500/50 transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-500/15 text-blue-500 grid place-items-center font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Hadir di Luar Kelas</div>
              <div className="text-xl font-bold font-mono text-blue-500">2 Hari (10%)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-amber-500/50 transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 text-amber-500 grid place-items-center font-bold">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Izin / Sakit</div>
              <div className="text-xl font-bold font-mono text-amber-500">1 Hari</div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-destructive/50 transition">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-destructive/15 text-destructive grid place-items-center font-bold">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-semibold">Alpha (Tanpa Enroll)</div>
              <div className="text-xl font-bold font-mono text-destructive">1 Hari</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel Detail Riwayat Presensi Siswa */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold">Riwayat Presensi Harian Siswa (Bulan Juli 2026)</CardTitle>
          <CardDescription className="text-xs">Catatan otomatis dari tombol Enroll Harian & permohonan luar kelas.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted text-muted-foreground font-bold">
              <tr>
                <th className="p-3">Tanggal KBM</th>
                <th className="p-3 text-center">Waktu Presensi</th>
                <th className="p-3 text-center">Status Kehadiran</th>
                <th className="p-3">Keterangan / Alasan (Izin / Sakit / Dinas Luar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {presensiList.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition">
                  <td className="p-3 font-bold text-foreground">{item.date}</td>
                  <td className="p-3 text-center font-mono font-semibold">{item.time}</td>
                  <td className="p-3 text-center">
                    <Badge className={`${item.badge} text-[10px] font-bold`}>{item.status}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal Form Ajukan Izin / Luar Kelas */}
      <Dialog open={isPermohonanOpen} onOpenChange={setIsPermohonanOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" /> Ajukan Presensi Hadir Luar Kelas / Izin
            </DialogTitle>
            <DialogDescription className="text-xs">Lengkapi alasan izin, sakit, atau tugas dinas luar madrasah.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePermohonan} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Jenis Status Presensi</Label>
              <select className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1" value={statusType} onChange={(e) => setStatusType(e.target.value)}>
                <option value="Hadir di Luar Kelas">Hadir di Luar Kelas (Dinas Luar / Lomba)</option>
                <option value="Izin / Sakit">Izin Sakit / Halangan Syar'i</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Tanggal Berlaku</Label>
              <Input value={dateInput} onChange={(e) => setDateInput(e.target.value)} required className="mt-1 text-xs" />
            </div>

            <div>
              <Label className="text-xs font-semibold">Kolom Keterangan / Alasan Disertai Bukti</Label>
              <textarea placeholder="Contoh: Mengikuti Lomba Tahfidz Tingkat Kabupaten / Sakit demam surat dokter terlampir..." value={keteranganText} onChange={(e) => setKeteranganText(e.target.value)} className="w-full h-20 rounded-md border border-border bg-background p-3 text-xs mt-1" required />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPermohonanOpen(false)}>Batal</Button>
              <Button type="submit" size="sm" className="bg-blue-600 text-white font-bold">Kirim Permohonan Presensi</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- Kegiatan Kokurikuler Siswa (P5) ---------- */
function KokurikulerSiswa() {
  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FolderKanban className="h-6 w-6 text-purple-500" /> Kegiatan Kokurikuler & Projek P5-PPRA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil 'Alamin: Kehadiran projek & Laporan Gelar Karya Siswa.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <Badge className="bg-purple-600 text-white text-[10px] mb-1 w-fit">PROJEK P5 AKTIF</Badge>
            <CardTitle className="text-base font-bold">Kerajinan Batik Cilacap & Wirausaha Muda</CardTitle>
            <CardDescription className="text-xs">Koordinator Projek: Dra. Hj. Siti Rahmah • Target Gelar Karya: 25 Agustus 2026</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span>Kehadiran Sesi Projek Saya</span>
                <span className="text-emerald-500 font-mono font-bold">100% Hadir (8/8 Sesi)</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 space-y-2">
              <div className="font-bold text-xs text-foreground">Laporan & Dokumentasi Karya Projek:</div>
              <div className="text-xs text-muted-foreground">
                • Produk Batik Motif Wijayakusuma Cilacap buatan kelompok 8A tuntas diproduksi.<br />
                • Laporan analisis wirausaha & pemasaran siap dipresentasikan pada Gelar Karya.
              </div>
              <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs mt-2" onClick={() => toast.success("Laporan Projek P5 berhasil diunggah!")}>
                + Unggah Berkas Laporan Projek PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" /> Penilaian Karakter Profil Pelajar Pancasila
            </CardTitle>
            <CardDescription className="text-xs">Evaluasi pembiasaan karakter & dimensi Rahmatan Lil 'Alamin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { dim: "Beriman, Bertakwa, & Berakhlaq Mulia", score: "Sangat Baik (SB)", icon: "✨" },
              { dim: "Gotong Royong & Kolaborasi Kelompok", score: "Sangat Baik (SB)", icon: "👥" },
              { dim: "Kreativitas & Inovasi Produk Batik", score: "Berkembang Sesuai Harapan (BSH)", icon: "🎨" },
              { dim: "Kemandirian & Wirausaha", score: "Sangat Baik (SB)", icon: "💼" },
            ].map((item, idx) => (
              <div key={idx} className="p-3 rounded-lg border border-border bg-card flex justify-between items-center text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <span>{item.icon}</span>
                  <span>{item.dim}</span>
                </div>
                <Badge variant="outline" className="text-purple-600 border-purple-500/30 font-bold text-[10px]">
                  {item.score}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
