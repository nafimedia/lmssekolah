import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MysqlAuthService, INITIAL_ROLE_USERS } from "@/services/mysqlAuthService";
import { MysqlDataService } from "@/services/mysqlDataService";
import logoAsset from "@/assets/logo-mtsn2.png.asset.json";
import { BerandaModule } from "@/components/dashboard/modules/beranda/BerandaModule";
import { ProfilModule } from "@/components/dashboard/modules/profil/ProfilModule";
import { SiakadMasterDataModule } from "@/components/dashboard/modules/siakad/SiakadMasterDataModule";
import { RuangMengajarModule } from "@/components/dashboard/modules/ruangmengajar/RuangMengajarModule";
import { SdmGtkModule } from "@/components/dashboard/modules/sdm/SdmGtkModule";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";
import { useEffect, useState, useMemo, Fragment } from "react";
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
  EyeOff,
  ThumbsUp,
  Save,
  UserCog,
  Trash2,
  ShieldAlert,
  AlertCircle,
  MessageSquare,
  Filter,
  Plus,
  FileSpreadsheet,
  UserCheck,
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRealtimeCalendar } from "@/hooks/useRealtimeCalendar";
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
  | "manajemen_kelas"
  | "ruang_mengajar"
  | "sdm_gtk"
  | "perangkat_pembelajaran"
  | "profil"
  | "pengaturan";

const MENU: { key: MenuKey; label: string; icon: typeof Home; group?: string }[] = [
  { key: "beranda", label: "Beranda", icon: Home, group: "Utama" },
  { key: "ruang_mengajar", label: "Ruang Mengajar Hub", icon: BookOpen, group: "Utama" },
  { key: "sdm_gtk", label: "Manajemen SDM GTK", icon: Users, group: "Utama" },
  { key: "siakad", label: "Akademik Madrasah", icon: BarChart3, group: "Utama" },
  { key: "manajemen_kelas", label: "Manajemen Kelas & Rombel", icon: Layers, group: "Utama" },
  { key: "users", label: "Data User & Role", icon: Shield, group: "Utama" },
  { key: "pengumuman", label: "Pengumuman", icon: Megaphone, group: "Utama" },
  { key: "jadwal", label: "Jadwal Pelajaran", icon: CalendarClock, group: "Utama" },
  { key: "agenda", label: "Agenda & Kalender Akademik", icon: CalendarDays, group: "Utama" },
  { key: "kehadiran", label: "Kehadiran & Rekap Presensi", icon: UserCheck, group: "Utama" },
  { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", icon: BookOpen, group: "Akademik" },
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
    badge: "SUPER ADMIN PORTAL",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Superadmin", group: "Utama & Kontrol" },
      { key: "sdm_gtk", label: "Manajemen SDM GTK", group: "Utama & Kontrol" },
      { key: "manajemen_kelas", label: "Manajemen Rombel", group: "Utama & Kontrol" },
      { key: "users", label: "Data User & Role", group: "Utama & Kontrol" },
      { key: "siakad", label: "Akademik Madrasah", group: "Akademik" },
      { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", group: "Akademik" },
      { key: "modul_ajar", label: "Modul Ajar PDF", group: "Akademik" },
      { key: "jadwal", label: "Master Jadwal", group: "Akademik" },
      { key: "pengumuman", label: "Pengumuman", group: "Akademik" },
      { key: "agenda", label: "Agenda Madrasah", group: "Akademik" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi & CBT" },
      { key: "nilai", label: "Rekap Nilai Sistem", group: "Evaluasi & CBT" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Apresiasi & Pembinaan" },
      { key: "tahfidz_report", label: "Laporan Tahfidz", group: "Monitoring Eksekutif" },
      { key: "kokurikuler_report", label: "Laporan P5", group: "Monitoring Eksekutif" },
      { key: "pengaturan", label: "System Log & Backup", group: "Pengaturan" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  admin_akademik: {
    label: "Administrator Akademik",
    badge: "ADMIN AKADEMIK",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Akademik", group: "Master Data" },
      { key: "sdm_gtk", label: "Manajemen SDM GTK", group: "Master Data" },
      { key: "manajemen_kelas", label: "Manajemen Rombel", group: "Master Data" },
      { key: "siakad", label: "Akademik Madrasah", group: "Master Data" },
      { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", group: "Master Data" },
      { key: "modul_ajar", label: "Modul Ajar PDF", group: "Master Data" },
      { key: "users", label: "Data Guru & Siswa", group: "Master Data" },
      { key: "jadwal", label: "Master Jadwal", group: "Master Data" },
      { key: "agenda", label: "Agenda & Kalender", group: "Master Data" },
      { key: "pengumuman", label: "Pengumuman Resmi", group: "Informasi & Perpus" },
      { key: "perpustakaan", label: "E-Library Digital", group: "Informasi & Perpus" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  kamad: {
    label: "Kepala Madrasah",
    badge: "KEPALA MADRASAH",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Kamad", group: "Eksekutif" },
      { key: "sdm_gtk", label: "Kinerja & SDM GTK", group: "Eksekutif" },
      { key: "manajemen_kelas", label: "Monitoring Rombel", group: "Eksekutif" },
      { key: "siakad", label: "Akademik Madrasah", group: "Eksekutif" },
      { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", group: "Eksekutif" },
      { key: "modul_ajar", label: "Modul Ajar PDF", group: "Eksekutif" },
      { key: "agenda", label: "Agenda & Kalender", group: "Informasi & Agenda" },
      { key: "pengumuman", label: "Pengumuman", group: "Informasi & Agenda" },
      { key: "jadwal", label: "Jadwal Pelajaran", group: "Informasi & Agenda" },
      { key: "progress", label: "Progress Rombel", group: "Monitoring & Evaluasi" },
      { key: "nilai", label: "Laporan Pembelajaran", group: "Monitoring & Evaluasi" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Apresiasi & Pembinaan" },
      { key: "tahfidz_report", label: "Laporan Tahfidz", group: "Laporan Khusus" },
      { key: "kokurikuler_report", label: "Laporan P5", group: "Laporan Khusus" },
      { key: "cbt", label: "Monitoring CBT", group: "Monitoring & Evaluasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  waka: {
    label: "Waka Kurikulum",
    badge: "WAKA KURIKULUM",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Waka", group: "Kurikulum & Validasi" },
      { key: "sdm_gtk", label: "Beban Kerja GTK (24JP)", group: "Kurikulum & Validasi" },
      { key: "manajemen_kelas", label: "Manajemen Rombel", group: "Kurikulum & Validasi" },
      { key: "siakad", label: "Akademik Madrasah", group: "Kurikulum & Validasi" },
      { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", group: "Kurikulum & Validasi" },
      { key: "modul_ajar", label: "Verifikasi Modul Ajar", group: "Kurikulum & Validasi" },
      { key: "agenda", label: "Agenda & Kalender", group: "Kurikulum & Validasi" },
      { key: "pengumuman", label: "Pengumuman", group: "Kurikulum & Validasi" },
      { key: "progress", label: "Progress Rombel", group: "Monitoring & Evaluasi" },
      { key: "nilai", label: "Laporan Pembelajaran", group: "Monitoring & Evaluasi" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Apresiasi & Pembinaan" },
      { key: "tahfidz_report", label: "Laporan Tahfidz", group: "Laporan Khusus" },
      { key: "kokurikuler_report", label: "Laporan P5", group: "Laporan Khusus" },
      { key: "cbt", label: "Monitoring CBT", group: "Monitoring & Evaluasi" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  walikelas: {
    label: "Wali Kelas 8A",
    badge: "WALI KELAS 8A",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Wali Kelas", group: "Manajemen Kelas" },
      { key: "kehadiran", label: "Presensi Rombel 8A", group: "Manajemen Kelas" },
      { key: "manajemen_kelas", label: "Manajemen Rombel", group: "Manajemen Kelas" },
      { key: "jadwal", label: "Jadwal Kelas 8A", group: "Manajemen Kelas" },
      { key: "agenda", label: "Agenda & Kalender", group: "Manajemen Kelas" },
      { key: "pengumuman", label: "Pengumuman", group: "Manajemen Kelas" },
      { key: "cbt", label: "Monitoring CBT", group: "Monitoring & Penilaian" },
      { key: "progress", label: "Progress Belajar 8A", group: "Monitoring & Penilaian" },
      { key: "nilai", label: "Laporan Rapor 8A", group: "Monitoring & Penilaian" },
      { key: "tahfidz", label: "Setoran Tahfidz 8A", group: "Monitoring & Penilaian" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  wali_kelas: {
    label: "Wali Kelas 8A",
    badge: "WALI KELAS 8A",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Wali Kelas", group: "Manajemen Kelas" },
      { key: "kehadiran", label: "Presensi Rombel 8A", group: "Manajemen Kelas" },
      { key: "jadwal", label: "Jadwal Kelas 8A", group: "Manajemen Kelas" },
      { key: "agenda", label: "Agenda & Kalender", group: "Manajemen Kelas" },
      { key: "pengumuman", label: "Pengumuman", group: "Manajemen Kelas" },
      { key: "cbt", label: "Monitoring CBT", group: "Monitoring & Penilaian" },
      { key: "progress", label: "Progress Belajar 8A", group: "Monitoring & Penilaian" },
      { key: "nilai", label: "Laporan Rapor 8A", group: "Monitoring & Penilaian" },
      { key: "tahfidz", label: "Setoran Tahfidz 8A", group: "Monitoring & Penilaian" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  guru: {
    label: "Guru Pengampu",
    badge: "GURU PENGAMPU",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Guru", group: "Utama" },
      { key: "ruang_mengajar", label: "Ruang Mengajar Hub", group: "Ruang Mengajar" },
      { key: "modul_ajar", label: "Perangkat Ajar", group: "Ruang Mengajar" },
      { key: "nilai", label: "Penilaian Kelas", group: "Penilaian" },
      { key: "agenda", label: "Kalender Akademik", group: "Informasi" },
      { key: "perpustakaan", label: "E-Library Digital", group: "Informasi" },
      { key: "asisten_ai", label: "AI Assistant", group: "Asisten" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  siswa: {
    label: "Siswa Kelas 8A",
    badge: "RUANG BELAJAR SISWA",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Siswa", group: "Ruang Belajar" },
      { key: "mapel", label: "Materi & Modul Ajar", group: "Ruang Belajar" },
      { key: "jadwal", label: "Jadwal Pelajaran", group: "Ruang Belajar" },
      { key: "kehadiran", label: "Kehadiran Saya", group: "Ruang Belajar" },
      { key: "tugas", label: "Tugas & Submisi LKPD", group: "Evaluasi & Ujian" },
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

const ROLE_LABELS: Record<string, { label: string; icon: string }> = {
  admin: { label: "Super Admin", icon: "🛡️" },
  admin_akademik: { label: "Admin Akademik", icon: "📋" },
  kamad: { label: "Kepala Madrasah (Kamad)", icon: "🏛️" },
  waka: { label: "Wakil Kepala (Waka)", icon: "📐" },
  walikelas: { label: "Wali Kelas", icon: "🏫" },
  guru: { label: "Guru Pengampu", icon: "👨‍🏫" },
  siswa: { label: "Siswa", icon: "🎓" },
};

function Dashboard() {
  const [active, setActive] = useState<MenuKey>("beranda");
  const [openMobile, setOpenMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const me = MysqlAuthService.getActiveUser();

  // Multi-Role list allocated to currently logged-in user (Superadmin All Roles Access)
  const myAssignedRoles = useMemo(() => {
    if (!me) return ["siswa"];
    const cleanEmail = me.email ? me.email.toLowerCase() : "";
    const isSuperAdminUser =
      me.role === "admin" ||
      me.role === "superadmin" ||
      cleanEmail === "admin@mail.com" ||
      cleanEmail.includes("superadmin");

    // Superadmin has access to ALL 7 roles in the system
    if (isSuperAdminUser) {
      return ["admin", "admin_akademik", "kamad", "waka", "walikelas", "guru", "siswa"];
    }

    let savedRolesMap: Record<string, string[]> = {};
    if (typeof window !== "undefined") {
      try {
        savedRolesMap = JSON.parse(localStorage.getItem("lms_persisted_user_roles_v2") || "{}");
      } catch (e) {}
    }

    let roles: string[] = savedRolesMap[cleanEmail] || savedRolesMap[me.id] || [];

    if (!roles || roles.length === 0) {
      if ((me as any).roles && Array.isArray((me as any).roles)) {
        roles = (me as any).roles;
      } else if (me.role && me.role.includes(",")) {
        roles = me.role.split(",").map((r: string) => r.trim());
      } else if (me.role) {
        roles = [me.role];
      }
    }

    const isGtk =
      cleanEmail.includes("@guru") ||
      cleanEmail.includes("admin") ||
      me.role === "guru" ||
      me.role === "walikelas" ||
      me.role === "admin_akademik" ||
      (me as any).user_type === "gtk";

    if (isGtk) {
      const set = new Set<string>();
      roles.forEach((r: string) => {
        const lower = r.toLowerCase().trim();
        if (lower === "admin" || lower === "superadmin") set.add("admin");
        else if (lower === "admin_akademik") set.add("admin_akademik");
        else if (lower === "guru" || lower === "guru_mapel") set.add("guru");
        else if (lower === "walikelas" || lower === "wali_kelas") set.add("walikelas");
        else if (lower !== "siswa") set.add(lower);
      });

      if (set.size === 0) set.add("guru");
      return Array.from(set);
    }

    return roles && roles.length > 0 ? roles : ["siswa"];
  }, [me]);

  const [activeRole, setActiveRole] = useState<string>(() => {
    const activeUserSession = MysqlAuthService.getActiveUser();
    if (!activeUserSession) return "siswa";
    let savedRolesMap: Record<string, string[]> = {};
    if (typeof window !== "undefined") {
      try {
        savedRolesMap = JSON.parse(localStorage.getItem("lms_persisted_user_roles_v2") || "{}");
      } catch (e) {}
    }
    const roles = savedRolesMap[activeUserSession.email.toLowerCase()] || savedRolesMap[activeUserSession.id];
    return roles && roles.length > 0 ? roles[0] : (activeUserSession.role || "siswa");
  });

  const handleSwitchRole = (newRole: string) => {
    setActiveRole(newRole);
    const info = ROLE_LABELS[newRole] || { label: newRole, icon: "👤" };
    toast.info(`🔄 Mode Peran Aktif Diubah Ke: ${info.icon} ${info.label}`);
  };

  // User Profile Global State (Synchronized with logged in user session)
  const [userProfile, setUserProfile] = useState(() => {
    const activeUserSession = MysqlAuthService.getActiveUser();
    return {
      name: activeUserSession?.full_name || "Pengguna LMS",
      role: activeRole,
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
        role: activeRole,
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
  }, [activeRole, allowedKeys, active]);

  const isSuperAdmin = me?.role === "admin" || me?.email?.toLowerCase() === "admin@mail.com" || me?.role === "superadmin";

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
        myAssignedRoles={myAssignedRoles}
        handleSwitchRole={handleSwitchRole}
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
  myAssignedRoles,
  handleSwitchRole,
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
        <SidebarHeader className="p-3 px-3.5 border-b border-sidebar-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/logomts.png"
              alt="Logo MTsN 2 Cilacap"
              className="h-8 w-8 object-contain rounded-lg bg-white p-1 shadow-2xs border border-sidebar-border/40 shrink-0"
            />
            <div className="leading-tight overflow-hidden group-data-[state=collapsed]:hidden">
              <div className="font-bold text-xs text-sidebar-foreground truncate">MTsN 2 Cilacap</div>
              <div className="text-[10px] text-sidebar-primary font-mono font-semibold truncate uppercase">{roleInfo.badge}</div>
            </div>
          </div>
        </SidebarHeader>

        {/* Sidebar Content */}
        <SidebarContent className="px-2 py-2.5 space-y-2.5">
          {groups.map((g) => (
            <SidebarGroup key={g} className="p-0 space-y-0.5">
              <SidebarGroupLabel className="text-[10px] font-semibold text-sidebar-foreground/50 uppercase tracking-widest px-2.5 py-1 mb-0.5 h-auto group-data-[state=collapsed]:hidden">
                {g}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-0.5">
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
                          className={`gap-2.5 font-medium cursor-pointer text-xs h-9 py-1.5 px-3 rounded-[8px] transition-all ${isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-2xs rounded-[8px] data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-[8px]"
                            }`}
                        >
                          <Icon className="h-4 w-4 shrink-0 opacity-90" />
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
        <SidebarFooter className="p-2.5 px-3 border-t border-sidebar-border/60 bg-sidebar-accent/30 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <Avatar className="h-8 w-8 ring-1 ring-emerald-500/30 shrink-0">
                {userProfile?.avatarUrl || me?.avatar_url ? (
                  <img src={userProfile?.avatarUrl || me?.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback className="bg-emerald-600 text-white text-[11px] font-bold">
                    {displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="leading-tight overflow-hidden group-data-[state=collapsed]:hidden">
                <div className="font-bold text-xs text-sidebar-foreground truncate">
                  {displayName}
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-mono font-medium uppercase">
                  {activeRole.replace("_", " ")}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={handleSignOut} className="h-7 w-7 text-destructive hover:bg-destructive/10 shrink-0" title="Keluar">
              <LogOut className="h-3.5 w-3.5" />
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

            {/* Multi-Role Switcher Dropdown */}
            {myAssignedRoles.length > 1 || isSuperAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-xs">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="hidden xs:inline">Mode Role:</span>
                    <span className="uppercase font-extrabold">{ROLE_LABELS[activeRole]?.icon || "👤"} {activeRole.replace("_", " ")}</span>
                    <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1.5">
                  <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-2 py-1">
                    Ganti Peran / Mode Perspektif ({myAssignedRoles.length} Role)
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {myAssignedRoles.map((r: string) => {
                    const info = ROLE_LABELS[r] || { label: r.toUpperCase().replace("_", " "), icon: "👤" };
                    const isSelected = activeRole === r;
                    return (
                      <DropdownMenuItem
                        key={r}
                        onClick={() => handleSwitchRole(r)}
                        className={`flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-semibold cursor-pointer ${
                          isSelected ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold" : ""
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </span>
                        {isSelected && <Badge variant="outline" className="text-[9px] bg-emerald-500/20 text-emerald-600 border-emerald-500/40">Aktif</Badge>}
                      </DropdownMenuItem>
                    );
                  })}
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
          {active === "ruang_mengajar" && <RuangMengajarModule activeRole={activeRole} userProfile={userProfile} />}
          {active === "sdm_gtk" && <SdmGtkModule activeRole={activeRole} userProfile={userProfile} />}
          {active === "siakad" && <SiakadMasterDataModule />}
          {active === "manajemen_kelas" && <ManajemenKelas activeRole={activeRole} />}
          {active === "perangkat_pembelajaran" && <MataPelajaran activeRole={activeRole} userProfile={userProfile} />}
          {active === "mapel" && <MataPelajaran activeRole={activeRole} userProfile={userProfile} />}
          {active === "users" && activeRole !== "siswa" && <DataUserRole />}
          {active === "pengumuman" && <Pengumuman />}
          {active === "jadwal" && <Jadwal activeRole={activeRole} userProfile={userProfile} />}
          {active === "agenda" && <AgendaKalender activeRole={activeRole} />}
          {active === "kehadiran" && <KehadiranSiswa activeRole={activeRole} userProfile={userProfile} />}
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
  const [userToDelete, setUserToDelete] = useState<{ id: string; full_name: string; email: string; nis: string; roles: string[] } | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Super Admin Password Reset & Edit State
  const [userToResetPass, setUserToResetPass] = useState<{ id: string; full_name: string; email: string; nis: string; roles: string[] } | null>(null);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [adminNewPassword, setAdminNewPassword] = useState("MtsN2#2026!Reset");
  const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);

  // Edit Multi-Role Modal State
  const [userToEditRoles, setUserToEditRoles] = useState<{ id: string; full_name: string; email: string; nis: string; roles: string[] } | null>(null);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [tempEditRoles, setTempEditRoles] = useState<string[]>([]);

  // Form input state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("MtsN2#2026!Sec");
  const [nis, setNis] = useState("");
  const [userClass, setUserClass] = useState("8A");
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["guru"]);

  // Helper to persist roles map
  const saveRolesToStorage = (emailOrId: string, roles: string[]) => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("lms_persisted_user_roles_v2") || "{}";
      const rolesMap = JSON.parse(raw);
      rolesMap[emailOrId.toLowerCase()] = roles;
      localStorage.setItem("lms_persisted_user_roles_v2", JSON.stringify(rolesMap));
    } catch (e) {}
  };

  const [dummyUsersList, setDummyUsersList] = useState(() => {
    let savedRolesMap: Record<string, string[]> = {};
    if (typeof window !== "undefined") {
      try {
        savedRolesMap = JSON.parse(localStorage.getItem("lms_persisted_user_roles_v2") || "{}");
      } catch (e) {}
    }

    const defaultList = [
      { id: "usr-admin-1", full_name: "Super Administrator MTsN 2", email: "admin@mail.com", nis: "NIP. 198501012010011001", class: "Semua", roles: ["admin"] },
      { id: "usr-guru-1", full_name: "H. SOLIHUN, S.Pd., M.Si", email: "guru@mtsn2cilacap.sch.id", nis: "NIP. 198005122006042005", class: "Semua", roles: ["kamad"] },
      { id: "usr-guru-21", full_name: "ALI MANSUR, S.Pd", email: "198302142023211010@guru.mtsn2cilacap.sch.id", nis: "NIP. 198302142023211010", class: "Semua", roles: ["waka"] },
      { id: "usr-guru-17", full_name: "SOBIYATI, S.Pd", email: "197906142007102002@guru.mtsn2cilacap.sch.id", nis: "NIP. 197906142007102002", class: "VIII A", roles: ["walikelas"] },
      { id: "usr-guru-10", full_name: "UMI KHAFSOH, S.Pd", email: "197509192009012008@guru.mtsn2cilacap.sch.id", nis: "NIP. 197509192009012008", class: "VIII A", roles: ["guru"] },
      { id: "usr-siswa-1", full_name: "ALIYA QIARA ABDULLAH", email: "0127790481@siswa.mtsn2cilacap.sch.id", nis: "NISN. 0127790481", class: "VIII-A", roles: ["siswa"] },
    ];

    return defaultList.map((u) => ({
      ...u,
      roles: savedRolesMap[u.email.toLowerCase()] || savedRolesMap[u.id] || u.roles,
    }));
  });

  useEffect(() => {
    let isMounted = true;

    let savedRolesMap: Record<string, string[]> = {};
    if (typeof window !== "undefined") {
      try {
        savedRolesMap = JSON.parse(localStorage.getItem("lms_persisted_user_roles_v2") || "{}");
      } catch (e) {}
    }

    MysqlDataService.getUsers()
      .then((users) => {
        if (!isMounted) return;
        if (users && users.length > 0) {
          const formatted = users.map((u) => {
            const cleanEmail = u.email.toLowerCase();
            let finalRoles = savedRolesMap[cleanEmail] || savedRolesMap[u.id];
            if (!finalRoles) {
              if (u.role && u.role.includes(",")) {
                finalRoles = u.role.split(",").map((r) => r.trim());
              } else {
                finalRoles = [u.role || "siswa"];
              }
            }
            return {
              id: String(u.id),
              full_name: u.full_name,
              email: u.email,
              nis: `${u.identity_type || (u.role === "siswa" ? "NISN" : "NIP")}. ${u.nis_nip || "-"}`,
              class: u.class_name || u.subject_specialty || "Semua",
              roles: finalRoles,
            };
          });
          setDummyUsersList(formatted);
        }
      })
      .catch((err) => console.warn("Failed fetching users from MySQL:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  const availableRoles = ["admin", "admin_akademik", "kamad", "waka", "walikelas", "guru", "siswa"];

  // Open Edit Roles Modal
  const handlePromptEditRoles = (u: { id: string; full_name: string; email: string; nis: string; roles: string[] }) => {
    setUserToEditRoles(u);
    setTempEditRoles([...u.roles]);
    setIsEditRoleModalOpen(true);
  };

  const toggleTempEditRole = (role: string) => {
    if (tempEditRoles.includes(role)) {
      if (tempEditRoles.length <= 1) {
        return toast.error("Minimal 1 role aktif wajib dimiliki pengguna!");
      }
      setTempEditRoles(tempEditRoles.filter((r) => r !== role));
    } else {
      setTempEditRoles([...tempEditRoles, role]);
    }
  };

  const saveUserRoles = () => {
    if (!userToEditRoles) return;
    if (tempEditRoles.length === 0) {
      return toast.error("Pengguna harus memiliki minimal 1 role aktif!");
    }

    const userId = userToEditRoles.id;
    const userEmail = userToEditRoles.email;
    const newRoles = tempEditRoles;

    // Persist immediately to localStorage & MySQL DB
    saveRolesToStorage(userEmail, newRoles);
    saveRolesToStorage(userId, newRoles);
    MysqlDataService.updateUserRole(userId, newRoles, userEmail).catch(() => { });

    setDummyUsersList((prev) =>
      prev.map((u) => {
        if (u.id !== userId && u.email.toLowerCase() !== userEmail.toLowerCase()) return u;
        return { ...u, roles: newRoles };
      })
    );

    toast.success(`💾 Hak akses multi-role untuk ${userToEditRoles.full_name} berhasil disimpan secara permanen! (${newRoles.join(", ").toUpperCase()})`);
    setIsEditRoleModalOpen(false);
    setUserToEditRoles(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      return toast.error("Harap isi Nama Lengkap, Email, dan Kata Sandi.");
    }

    if (selectedRoles.length === 0) {
      return toast.error("Pilih minimal 1 role untuk pengguna baru.");
    }

    const strength = MysqlAuthService.validatePasswordStrength(password);
    if (!strength.isValid) {
      return toast.error(`Kata sandi terlalu lemah: ${strength.feedback.join(", ")}`);
    }

    const primaryRole = selectedRoles[0];
    const newUserObj = {
      id: String(Date.now()),
      full_name: fullName,
      email: email.trim().toLowerCase(),
      nis: nis || (primaryRole === "siswa" ? "NISN. 008" + Math.floor(100000 + Math.random() * 900000) : "NIP. 199" + Math.floor(10000000 + Math.random() * 90000000)),
      class: userClass || "Semua",
      roles: selectedRoles,
    };

    saveRolesToStorage(newUserObj.email, selectedRoles);
    saveRolesToStorage(newUserObj.id, selectedRoles);
    MysqlDataService.updateUserRole(newUserObj.id, selectedRoles, newUserObj.email).catch(() => { });

    setDummyUsersList([newUserObj, ...dummyUsersList]);

    // Register user to MysqlAuthService
    try {
      await MysqlAuthService.registerUser({
        email,
        password,
        full_name: fullName,
        role: primaryRole as any,
        nis_nip: newUserObj.nis,
        class_name: userClass,
      });
    } catch (err) { }

    toast.success(`Akun pengguna ${fullName} dengan ${selectedRoles.length} role (${selectedRoles.join(", ").toUpperCase()}) berhasil ditambahkan!`);
    setIsAddUserOpen(false);

    // Reset Form
    setFullName("");
    setEmail("");
    setPassword("MtsN2#2026!Sec");
    setNis("");
    setUserClass("8A");
    setSelectedRoles(["guru"]);
  };

  const toggleRole = (userId: string, role: string) => {
    const userObj = dummyUsersList.find((u) => u.id === userId);
    if (userObj) {
      const exists = userObj.roles.includes(role);
      // Rule 3: Minimum 1 role active check
      if (exists && userObj.roles.length <= 1) {
        return toast.error("Rule Delete: Pengguna harus memiliki minimal 1 role aktif! Gunakan tombol 'Hapus User' jika ingin menghapus akun.");
      }

      const newRoles = exists ? userObj.roles.filter((r) => r !== role) : [...userObj.roles, role];

      saveRolesToStorage(userObj.email, newRoles);
      saveRolesToStorage(userId, newRoles);
      MysqlDataService.updateUserRole(userId, newRoles, userObj.email).catch(() => { });

      setDummyUsersList((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          return { ...u, roles: newRoles };
        })
      );
      toast.success(`Hak akses role ${role} berhasil diperbarui dan tersimpan permanen!`);
    }
  };

  const handlePromptDeleteUser = (u: { id: string; full_name: string; email: string; nis: string; roles: string[] }) => {
    const activeSession = MysqlAuthService.getActiveUser();

    // Rule 1: Protection for Super Admin Primary Account
    if (u.email === "admin@mail.com" || (u.roles.includes("admin") && dummyUsersList.filter((item) => item.roles.includes("admin")).length <= 1)) {
      return toast.error("Rule Protection: Akun Super Admin Utama (admin@mail.com) dilindungi dan tidak dapat dihapus!");
    }

    // Rule 2: Active Logged In User Protection
    if (activeSession && activeSession.email.toLowerCase() === u.email.toLowerCase()) {
      return toast.error("Rule Protection: Anda tidak dapat menghapus akun Anda sendiri yang sedang digunakan saat ini!");
    }

    setUserToDelete(u);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const targetId = userToDelete.id;
    const targetEmail = userToDelete.email;
    const targetName = userToDelete.full_name;

    // Update state local
    setDummyUsersList((prev) => prev.filter((u) => u.id !== targetId));

    // Call backend API MySQL Delete User
    try {
      await MysqlDataService.deleteUser(targetId, targetEmail);
    } catch (err) {
      console.warn("Failed executing MySQL delete user:", err);
    }

    toast.success(`Akun pengguna ${targetName} (${targetEmail}) berhasil dihapus permanen!`);
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  // Super Admin Password Reset & Edit Handlers
  const handlePromptResetPassword = (u: { id: string; full_name: string; email: string; nis: string; roles: string[] }) => {
    const activeSession = MysqlAuthService.getActiveUser();
    const isSuperAdmin = activeSession?.role === "admin" || activeSession?.email?.toLowerCase() === "admin@mail.com";

    if (!isSuperAdmin) {
      return toast.error("Hanya Super Administrator yang berhak mengelola & mereset kata sandi akun pengguna!");
    }

    setUserToResetPass(u);
    setAdminNewPassword("MtsN2#2026!Reset");
    setShowAdminNewPassword(false);
    setIsResetPassModalOpen(true);
  };

  const confirmAdminResetPassword = async (customPass?: string) => {
    if (!userToResetPass) return;
    const targetPass = customPass || adminNewPassword;

    const res = await MysqlAuthService.adminResetPassword(userToResetPass.email, targetPass);
    if (res.success) {
      toast.success(`🔒 Kata sandi akun ${userToResetPass.full_name} (${userToResetPass.email}) berhasil diubah menjadi: "${targetPass}"`, {
        duration: 9000,
      });
      setIsResetPassModalOpen(false);
      setUserToResetPass(null);
    } else {
      toast.error(res.message);
    }
  };

  // User Grouping Filter State (Siswa, Guru & Wali Kelas, Pejabat & Petugas Staf)
  const [activeGroup, setActiveGroup] = useState<"semua" | "siswa" | "guru" | "pejabat">("semua");

  // Group Counts Calculation
  const siswaCount = dummyUsersList.filter((u) => u.roles.includes("siswa")).length;
  const guruCount = dummyUsersList.filter((u) => u.roles.some((r) => r === "guru" || r === "walikelas")).length;
  const pejabatCount = dummyUsersList.filter((u) => u.roles.some((r) => ["admin", "admin_akademik", "kamad", "waka"].includes(r))).length;

  const filtered = dummyUsersList.filter((u) => {
    // 1. Group Category Filter
    if (activeGroup === "siswa" && !u.roles.includes("siswa")) return false;
    if (activeGroup === "guru" && !u.roles.some((r) => r === "guru" || r === "walikelas")) return false;
    if (activeGroup === "pejabat" && !u.roles.some((r) => ["admin", "admin_akademik", "kamad", "waka"].includes(r))) return false;

    // 2. Search Text Filter
    const searchLower = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      u.nis.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <SectionHeader title="Manajemen Pengguna & Hak Akses (Role)" sub="Pengelolaan terkelompok untuk Siswa, Guru & Wali Kelas, serta Pejabat/Petugas Staf LMS MTsN 2 Cilacap" />

      {/* Card Tab Pengelompokan Pengguna */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Data Akun Pengguna & Hak Akses
            </CardTitle>
            <CardDescription>
              Kelola akun terdaftar ({dummyUsersList.length} total) berdasarkan pengelompokan peran dan wewenang.
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

        <CardContent className="pt-4 space-y-4">
          {/* Baris Tombol Pengelompokan (Grouping Tabs) */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80">
            <button
              type="button"
              onClick={() => setActiveGroup("semua")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "semua"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>🌐 Semua Pengguna</span>
              <Badge variant="secondary" className="text-[10px] bg-background/80 text-foreground font-extrabold px-1.5 py-0.2">
                {dummyUsersList.length}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveGroup("siswa")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "siswa"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>🎓 Kelompok Siswa</span>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-extrabold px-1.5 py-0.2 border border-emerald-500/30">
                {siswaCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveGroup("guru")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "guru"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>👨‍🏫 Guru & Wali Kelas</span>
              <Badge variant="secondary" className="text-[10px] bg-blue-500/20 text-blue-600 dark:text-blue-300 font-extrabold px-1.5 py-0.2 border border-blue-500/30">
                {guruCount}
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => setActiveGroup("pejabat")}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeGroup === "pejabat"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <span>🏛️ Pejabat & Petugas Staf</span>
              <Badge variant="secondary" className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold px-1.5 py-0.2 border border-amber-500/30">
                {pejabatCount}
              </Badge>
            </button>
          </div>

          {/* Banner Info Kelompok Aktif */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <div>
              Menampilkan <strong className="text-foreground">{filtered.length}</strong> akun dari kelompok{" "}
              <strong className="text-foreground uppercase">
                {activeGroup === "semua" ? "Semua User" : activeGroup === "siswa" ? "Siswa" : activeGroup === "guru" ? "Guru & Wali Kelas" : "Pejabat & Petugas Staf"}
              </strong>
            </div>
            {search && (
              <div>
                Pencarian: &quot;<span className="font-semibold text-foreground">{search}</span>&quot;
              </div>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-left border-b border-border">
                  <th className="py-3 px-4 font-semibold">Pengguna & NIP/NIS</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Kelas</th>
                  <th className="py-3 px-4 font-semibold">Role Aktif</th>
                  <th className="py-3 px-4 font-semibold">Kelola Hak Akses</th>
                  <th className="py-3 px-4 font-semibold text-center">Aksi & Kontrol</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => {
                  const isSuperAdmin = u.email === "admin@mail.com";
                  const activeSession = MysqlAuthService.getActiveUser();
                  const isSelf = activeSession && activeSession.email.toLowerCase() === u.email.toLowerCase();
                  const currentIsSuperAdmin = activeSession?.role === "admin" || activeSession?.email?.toLowerCase() === "admin@mail.com";

                  return (
                    <tr key={u.id} className="border-b border-border/60 hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-medium">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          {u.full_name}
                          {isSuperAdmin && (
                            <Badge variant="outline" className="text-[9px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                              🛡️ Dilindungi
                            </Badge>
                          )}
                          {isSelf && (
                            <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                              👤 Sesi Anda
                            </Badge>
                          )}
                        </div>
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
                        <div className="flex flex-wrap items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 text-[10px] px-2 font-bold bg-emerald-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 gap-1 mr-1"
                            onClick={() => handlePromptEditRoles(u)}
                            title="Buka Modal Kelola & Simpan Multi-Role"
                          >
                            <UserCog className="h-3 w-3" /> 🎭 Atur & Simpan Role
                          </Button>
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
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 border-emerald-500/30 gap-1"
                            onClick={() => handlePromptEditRoles(u)}
                            title="Buka Form Kelola & Simpan Role"
                          >
                            <Save className="h-3.5 w-3.5" /> Simpan Role
                          </Button>

                          {currentIsSuperAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-xs font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-500/10 border-teal-500/30 gap-1"
                              onClick={() => handlePromptResetPassword(u)}
                              title="Ubah / Reset Kata Sandi Akun (Khusus Super Admin)"
                            >
                              <KeyRound className="h-3.5 w-3.5" /> Sandi
                            </Button>
                          )}

                          {isSuperAdmin || isSelf ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled
                              className="h-7 px-2 text-xs text-muted-foreground opacity-50 cursor-not-allowed"
                              title={isSuperAdmin ? "Super Admin Utama dilindungi dari penghapusan" : "Tidak dapat menghapus akun sendiri"}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border border-rose-500/20"
                              onClick={() => handlePromptDeleteUser(u)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Modal Reset/Ubah Password Khusus Super Admin */}
      <Dialog open={isResetPassModalOpen} onOpenChange={setIsResetPassModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-teal-600 dark:text-teal-400 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-teal-600" /> Kelola & Reset Kata Sandi Pengguna
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Fitur kontrol khusus Super Administrator untuk memperbarui kata sandi akun pengguna LMS.
            </DialogDescription>
          </DialogHeader>

          {userToResetPass && (
            <div className="space-y-4 py-2">
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg p-3 text-xs space-y-1">
                <div><span className="font-semibold text-muted-foreground">Target Akun:</span> <strong className="text-foreground">{userToResetPass.full_name}</strong></div>
                <div><span className="font-semibold text-muted-foreground">Email / Username:</span> <code className="font-mono text-foreground">{userToResetPass.email}</code></div>
                <div><span className="font-semibold text-muted-foreground">NIP / NISN:</span> <code className="font-mono text-foreground">{userToResetPass.nis}</code></div>
              </div>

              {/* Action 1: Quick Reset Default Pass */}
              <div className="p-3 border border-border rounded-xl bg-muted/30 space-y-2">
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>⚡ Reset Cepat (Default Password)</span>
                  <Badge variant="outline" className="text-[10px] bg-teal-500/10 text-teal-600 border-teal-500/30">
                    Otomatis
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Sistem akan mereset password akun ini menjadi kata sandi sementara yang aman: <code className="font-mono text-teal-600 dark:text-teal-400 font-bold">MtsN2#2026!Reset</code>
                </p>
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  className="w-full text-xs font-bold border-teal-500/40 text-teal-600 hover:bg-teal-500/10"
                  onClick={() => confirmAdminResetPassword("MtsN2#2026!Reset")}
                >
                  ⚡ Terbitkan Password Reset Default
                </Button>
              </div>

              {/* Action 2: Custom Password Input */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="admin-custom-pass" className="text-xs font-semibold">Atau Masukkan Kata Sandi Kustom Baru</Label>
                <div className="relative">
                  <Input
                    id="admin-custom-pass"
                    type={showAdminNewPassword ? "text" : "password"}
                    value={adminNewPassword}
                    onChange={(e) => setAdminNewPassword(e.target.value)}
                    placeholder="Min 8 Karakter (Huruf Besar, Kecil & Angka)"
                    className="text-xs pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminNewPassword(!showAdminNewPassword)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition"
                  >
                    {showAdminNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {adminNewPassword && (() => {
                  const strength = MysqlAuthService.validatePasswordStrength(adminNewPassword);
                  return (
                    <p className={`text-[10px] ${strength.isValid ? "text-emerald-500 font-semibold" : "text-amber-500"}`}>
                      Kekuatan: {strength.label} {strength.feedback.length > 0 ? `(${strength.feedback.join(", ")})` : "✓"}
                    </p>
                  );
                })()}
              </div>

              <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsResetPassModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-1.5 text-xs"
                  onClick={() => confirmAdminResetPassword()}
                >
                  <KeyRound className="h-4 w-4" /> Simpan Kata Sandi Kustom
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modal Edit & Simpan Hak Akses Multi-Role */}
      <Dialog open={isEditRoleModalOpen} onOpenChange={setIsEditRoleModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <UserCog className="h-5 w-5 text-emerald-600" /> Kelola & Simpan Hak Akses Multi-Role
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Atur dan centang peran (role) untuk akun pengguna ini, lalu klik Simpan Perubahan.
            </DialogDescription>
          </DialogHeader>

          {userToEditRoles && (
            <div className="space-y-4 py-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-xs space-y-1">
                <div><span className="font-semibold text-muted-foreground">Nama Pengguna:</span> <strong className="text-foreground">{userToEditRoles.full_name}</strong></div>
                <div><span className="font-semibold text-muted-foreground">Email / Username:</span> <code className="font-mono text-foreground">{userToEditRoles.email}</code></div>
                <div><span className="font-semibold text-muted-foreground">NIP / NISN:</span> <code className="font-mono text-foreground">{userToEditRoles.nis}</code></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold">Pilih Role yang Diberikan (Bisa Lebih Dari 1 Role)</Label>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-bold">
                    {tempEditRoles.length} Role Terpilih
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "guru", label: "👨‍🏫 Guru Pengampu" },
                    { id: "siswa", label: "🎓 Siswa" },
                    { id: "walikelas", label: "📋 Wali Kelas" },
                    { id: "waka", label: "📐 Waka Kurikulum" },
                    { id: "kamad", label: "🏛️ Kepala Madrasah" },
                    { id: "admin_akademik", label: "💼 Admin Akademik" },
                    { id: "admin", label: "🛡️ Super Admin" },
                  ].map((r) => {
                    const isSelected = tempEditRoles.includes(r.id);
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => toggleTempEditRole(r.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${isSelected
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                          : "bg-muted/40 border-border hover:bg-muted text-muted-foreground"
                          }`}
                      >
                        <span>{r.label}</span>
                        {isSelected && <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsEditRoleModalOpen(false)}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5 text-xs"
                  onClick={saveUserRoles}
                >
                  <Save className="h-4 w-4" /> Simpan Perubahan Role
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Modal Hapus User Confirmation */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-600" /> Konfirmasi Penghapusan Akun
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Apakah Anda yakin ingin menghapus akun pengguna ini dari sistem LMS secara permanen?
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs space-y-1.5 my-2">
              <div><span className="font-semibold text-muted-foreground">Nama Pengguna:</span> <strong className="text-foreground">{userToDelete.full_name}</strong></div>
              <div><span className="font-semibold text-muted-foreground">Email / Username:</span> <code className="font-mono text-foreground">{userToDelete.email}</code></div>
              <div><span className="font-semibold text-muted-foreground">NIP / NISN:</span> <code className="font-mono text-foreground">{userToDelete.nis}</code></div>
              <div>
                <span className="font-semibold text-muted-foreground">Role Saat Ini:</span>{" "}
                <span className="font-semibold uppercase text-rose-600 dark:text-rose-400">{userToDelete.roles.join(", ")}</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Batal
            </Button>
            <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white font-bold gap-1.5" onClick={confirmDeleteUser}>
              <Trash2 className="h-4 w-4" /> Ya, Hapus Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Pilih Peran Pengguna (Dapat Memilih Lebih Dari 1 Role)</Label>
                <span className="text-[10px] text-emerald-600 font-bold">{selectedRoles.length} Role Terpilih</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {[
                  { id: "guru", label: "👨‍🏫 Guru Pengampu" },
                  { id: "siswa", label: "🎓 Siswa" },
                  { id: "walikelas", label: "📋 Wali Kelas" },
                  { id: "waka", label: "📐 Waka Kurikulum" },
                  { id: "kamad", label: "🏛️ Kepala Madrasah" },
                  { id: "admin_akademik", label: "💼 Admin Akademik" },
                  { id: "admin", label: "🛡️ Super Admin" },
                ].map((r) => {
                  const isSelected = selectedRoles.includes(r.id);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          if (selectedRoles.length <= 1) return toast.error("Minimal 1 role wajib dipilih!");
                          setSelectedRoles(selectedRoles.filter((item) => item !== r.id));
                        } else {
                          setSelectedRoles([...selectedRoles, r.id]);
                        }
                      }}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-between transition ${isSelected
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                        : "bg-muted/40 border-border hover:bg-muted"
                        }`}
                    >
                      <span>{r.label}</span>
                      {isSelected && <span className="text-emerald-600 dark:text-emerald-400 font-black">✓</span>}
                    </button>
                  );
                })}
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

/* ---------- MODUL KEHADIRAN & REKAP PRESENSI MULTI-ROLE ---------- */
function KehadiranSiswa({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const {
    currentMonthName,
    currentYear,
    formattedTime,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    getCalendarDays,
  } = useRealtimeCalendar();

  const isSiswa = activeRole === "siswa";
  const isGuruMapel = activeRole === "guru" || activeRole === "guru_mapel";
  
  // Assigned Homeroom class for Wali Kelas (Synced dynamically with user profile & GTK assignment)
  const resolvedWaliClass = useMemo(() => {
    const activeUser = MysqlAuthService.getActiveUser();
    const cleanName = (activeUser?.full_name || "").toLowerCase();
    const cleanNip = (activeUser?.nis_nip || "").trim();

    if (cleanName.includes("achmad makmun") || cleanNip.includes("272005011001")) return "Rombel 8B";
    if (cleanName.includes("misbah")) return "Rombel 7A";
    if (cleanName.includes("endah")) return "Rombel 7B";
    if (cleanName.includes("siti rahmah")) return "Rombel 8A";
    if (cleanName.includes("sobiyati")) return "Rombel 9A";
    if (cleanName.includes("sayono")) return "Rombel 9B";

    if (userProfile?.assignedClass) {
      return userProfile.assignedClass.startsWith("Rombel") ? userProfile.assignedClass : `Rombel ${userProfile.assignedClass}`;
    }
    return "Rombel 8A";
  }, [userProfile]);

  const [selectedClass, setSelectedClass] = useState(resolvedWaliClass);

  useEffect(() => {
    setSelectedClass(resolvedWaliClass);
  }, [resolvedWaliClass]);
  const [selectedMonth, setSelectedMonth] = useState(`${currentMonthName} ${currentYear}`);
  const [isPrintPresensiOpen, setIsPrintPresensiOpen] = useState(false);

  // Guru Mapel Active Teaching Session state
  const [selectedKbmSession, setSelectedKbmSession] = useState("s1");
  const kbmSessions = [
    { id: "s1", mapel: "Al-Quran Hadits", class: "Rombel 8A", time: "07:30 - 09:00 WIB (Jam 1-2)", meeting: "Pertemuan 16", topic: "Hukum Bacaan Mad Silah & Mad Badal", room: "Ruang A.02", status: "AKTIF" },
    { id: "s2", mapel: "Fiqih Kebangsaan", class: "Rombel 9C", time: "10:15 - 11:45 WIB (Jam 5-6)", meeting: "Pertemuan 18", topic: "Ketentuan Sembelihan Hewan Kurban", room: "Ruang C.04", status: "MENDATANG" },
  ];
  const activeSession = kbmSessions.find((s) => s.id === selectedKbmSession) || kbmSessions[0];

  const [attendanceData, setAttendanceData] = useState([
    { id: "s1", nisn: "0081928371", name: "Ahmad Fauzi", class: "Rombel 8A", hadir: 20, izin: 1, sakit: 0, alpa: 0, pct: 95.2, parentWa: "081234567890", status: "Sangat Baik (A)", today: "hadir", sessionStatus: "hadir" },
    { id: "s2", nisn: "0081928372", name: "Fatimah Az-Zahra", class: "Rombel 8A", hadir: 21, izin: 0, sakit: 0, alpa: 0, pct: 100.0, parentWa: "081234567894", status: "Sempurna (100%)", today: "hadir", sessionStatus: "hadir" },
    { id: "s3", nisn: "0081928373", name: "Muhammad Rizky", class: "Rombel 8A", hadir: 16, izin: 2, sakit: 1, alpa: 2, pct: 76.2, parentWa: "081234567895", status: "⚠️ Perlu Alert Pembinaan", today: "alpa", sessionStatus: "alpa" },
    { id: "s4", nisn: "0081928374", name: "Siti Nurhaliza", class: "Rombel 8A", hadir: 20, izin: 1, sakit: 0, alpa: 0, pct: 95.2, parentWa: "081234567896", status: "Sangat Baik (A)", today: "hadir", sessionStatus: "hadir" },
    { id: "s5", nisn: "0081928375", name: "Budi Santoso", class: "Rombel 8B", hadir: 19, izin: 1, sakit: 1, alpa: 0, pct: 90.5, parentWa: "081234567897", status: "Baik (B)", today: "hadir", sessionStatus: "hadir" },
  ]);

  const filteredAttendance = attendanceData.filter((a) => selectedClass === "Semua" || a.class === selectedClass);

  const handleSetTodayStatus = (studentId: string, status: string) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.id === studentId ? { ...item, today: status } : item))
    );
  };

  const handleSetSessionStatus = (studentId: string, status: string) => {
    setAttendanceData((prev) =>
      prev.map((item) => (item.id === studentId ? { ...item, sessionStatus: status } : item))
    );
  };

  const handleMarkAllHadir = () => {
    setAttendanceData((prev) => prev.map((item) => ({ ...item, today: "hadir", sessionStatus: "hadir" })));
    toast.success("⚡ Seluruh siswa terfilter berhasil ditandai HADIR!");
  };

  const handleSavePresensiHarianPagi = () => {
    filteredAttendance.forEach((s) => {
      MysqlDataService.recordPresensi({
        studentId: s.id,
        studentName: s.name,
        rombel: s.class,
        status: s.today,
        note: "Presensi Harian Pagi oleh Wali Kelas",
      }).catch(() => {});
    });
    toast.success(`💾 Presensi Harian Pagi (${selectedClass}) berhasil disimpan oleh Wali Kelas!`, {
      description: "Data terhubung langsung dengan E-Rapor & WA Gateway EWS.",
    });
  };

  const handleSavePresensiSesiKbm = () => {
    filteredAttendance.forEach((s) => {
      MysqlDataService.recordPresensi({
        studentId: s.id,
        studentName: s.name,
        rombel: s.class,
        status: s.sessionStatus,
        note: `Presensi Tatap Muka KBM: ${activeSession.mapel} ${activeSession.meeting}`,
      }).catch(() => {});
    });
    toast.success(`✅ Presensi Sesi KBM (${activeSession.mapel} - ${activeSession.meeting}) Berhasil Disimpan!`, {
      description: `Tercatat pada Jurnal Mengajar ${activeSession.class} (${activeSession.time}).`,
    });
  };

  const handlePrintPresensi = () => {
    window.print();
    toast.success(`🖨️ Rekap Presensi Bulanan (${selectedClass} - ${selectedMonth}) berhasil dicetak!`);
  };

  const handleSendWaPresensiAlert = (student: any) => {
    MysqlDataService.saveWaLog({
      parent_name: `Orang Tua ${student.name}`,
      phone: student.parentWa,
      student_name: student.name,
      category: "ALERT PRESENSI",
      message: `[ALERT PRESENSI MTsN 2 CILACAP]: Bpk/Ibu Orang Tua ${student.name}, disampaikan bahwa ananda hari ini tercatat ${student.today.toUpperCase()} di presensi harian pagi. Rekap bulan ${selectedMonth}: Hadir: ${student.hadir} hari, Izin: ${student.izin}, Sakit: ${student.sakit}, Alpa: ${student.alpa} hari (${student.pct}% Kehadiran).`,
      status: "TERKIRIM",
    }).catch(() => {});

    toast.success(`📱 WA Alert Presensi Berhasil Dikirim ke Orang Tua ${student.name} (${student.parentWa})!`);
  };

  const calendarDays = getCalendarDays();

  // --- BRANCH 1: ROLE SISWA (READ ONLY - NO ENROLL BUTTON) ---
  if (isSiswa) {
    const studentInfo = attendanceData[0]; // Current student
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Kehadiran & Rekapitulasi Presensi Saya"
          sub="Visualisasi status kehadiran resmi siswa MTsN 2 Cilacap yang dicatat oleh Wali Kelas & Guru Pengampu"
        />

        {/* Read-Only Status Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3 bg-muted/30 p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-xs font-bold">
              🎓 KELAS VIII A • NISN: {studentInfo.nisn}
            </Badge>
            <Badge className="bg-emerald-600 text-white font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" /> PRESENSI HARI INI: HADIR (Dicatat oleh Wali Kelas)
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Presensi Terintegrasi E-Rapor & Wali Kelas
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-2">
          <span>💡</span>
          <span>Catatan: Siswa tidak melakukan presensi mandiri. Seluruh pencatatan presensi harian dilakukan secara resmi oleh Wali Kelas & Guru Pengampu saat KBM.</span>
        </div>

        {/* Summary Stats Cards Grid (Read Only) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Total Hadir</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{studentInfo.hadir} Hari (95.2%)</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
                ℹ️
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Total Izin</div>
                <div className="text-lg font-extrabold text-foreground">{studentInfo.izin} Hari</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
                🟡
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Total Sakit</div>
                <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{studentInfo.sakit} Hari</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-2xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/15 text-red-600 dark:text-red-400 grid place-items-center shrink-0 font-bold">
                ✨
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Tanpa Keterangan (Alpa)</div>
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">0 Hari (Disiplin)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 📅 WIDGET KALENDER PRESENSI REALTIME SISWA */}
        <Card className="border-border shadow-sm overflow-hidden bg-card">
          <CardHeader className="bg-muted/40 border-b border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Kalender Kehadiran & Presensi Saya ({currentMonthName} {currentYear})
              </CardTitle>
              <CardDescription className="text-xs">
                Visualisasi harian status presensi resmi {studentInfo.name} di MTsN 2 Cilacap.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs gap-1 py-1">
                <Clock className="h-3 w-3 animate-pulse" /> {formattedTime}
              </Badge>
              <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border border-border">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" onClick={goToPrevMonth} title="Bulan Sebelumnya">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-bold text-xs px-1 font-mono">{currentMonthName} {currentYear}</span>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-xs" onClick={goToNextMonth} title="Bulan Berikutnya">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button size="sm" variant="secondary" className="h-7 text-xs font-semibold px-2.5" onClick={goToToday}>
                Hari Ini
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            <div className="border border-border rounded-xl p-3 bg-muted/20 overflow-x-auto">
              <div className="min-w-[500px]">
                {/* Day Name Header */}
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-muted-foreground pb-2 border-b border-border/60">
                  <div>Senin</div>
                  <div>Selasa</div>
                  <div>Rabu</div>
                  <div>Kamis</div>
                  <div>Jumat</div>
                  <div>Sabtu</div>
                  <div className="text-red-500">Minggu</div>
                </div>

                {/* Date Cells */}
                <div className="grid grid-cols-7 gap-1 pt-2">
                  {calendarDays.map((cell, idx) => {
                    let bgClass = "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300";
                    let badgeIcon = "🟢";
                    let statusText = "Hadir";
                    let note = "Hadir (Pelajaran Efektif)";

                    if (cell.isWeekend) {
                      bgClass = "bg-muted/50 border-border text-muted-foreground/60";
                      badgeIcon = "⚪";
                      statusText = "Libur";
                      note = `Akhir Pekan (${cell.dayOfWeekName})`;
                    } else if (cell.dayNumber === 12 && cell.isCurrentMonth) {
                      bgClass = "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300 font-extrabold ring-1 ring-blue-500/50";
                      badgeIcon = "🔵";
                      statusText = "Izin";
                      note = "Izin Resmi: Duta Kafilah Lomba MTQ Kabupaten";
                    } else if (cell.dayNumber === 18 && cell.isCurrentMonth) {
                      bgClass = "bg-amber-500/20 border-amber-500/40 text-amber-800 dark:text-amber-300 font-extrabold ring-1 ring-amber-500/50";
                      badgeIcon = "🟡";
                      statusText = "Sakit";
                      note = "Sakit Demam (Surat Dokter Terverifikasi)";
                    } else if (!cell.isCurrentMonth) {
                      bgClass = "bg-muted/30 border-border/40 text-muted-foreground/40 opacity-40";
                      badgeIcon = "";
                      statusText = "";
                      note = "Luar Bulan Ini";
                    }

                    return (
                      <div
                        key={idx}
                        onClick={() => toast.info(`📅 Presensi Tgl ${cell.dayNumber} ${currentMonthName} ${currentYear}`, { description: note ? `${badgeIcon} Status: ${note}` : undefined })}
                        className={`p-2 rounded-lg border text-center transition cursor-pointer hover:scale-105 ${bgClass} ${
                          cell.isToday ? "ring-2 ring-emerald-500 shadow-md font-extrabold bg-emerald-500/30 text-emerald-900 dark:text-emerald-100" : ""
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] opacity-80">
                          <span className={cell.isToday ? "font-extrabold text-emerald-600 dark:text-emerald-300" : ""}>{cell.dayNumber}</span>
                          <span>{cell.isToday ? "🌟" : badgeIcon}</span>
                        </div>
                        <div className="text-[9px] font-bold truncate mt-1">
                          {cell.isToday ? "Hari Ini" : statusText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legenda Warna Presensi */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground font-semibold">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">🟢 <span className="text-foreground">Hadir</span></span>
                <span className="flex items-center gap-1">🔵 <span className="text-foreground">Izin Resmi</span></span>
                <span className="flex items-center gap-1">🟡 <span className="text-foreground">Sakit</span></span>
                <span className="flex items-center gap-1">🔴 <span className="text-foreground">Alpa</span></span>
                <span className="flex items-center gap-1">⚪ <span className="text-foreground">Libur Akhir Pekan (Minggu)</span></span>
              </div>
              <div className="italic text-[10px]">💡 Data presensi resmi dicatat oleh Wali Kelas & Guru Pengampu.</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- BRANCH 2: ROLE GURU MAPEL (PRESENSI SESI JAM KBM AKTIF) ---
  if (isGuruMapel) {
    const sessionStudents = attendanceData.filter((a) => activeSession.class === "Semua" || a.class === activeSession.class);

    return (
      <div className="space-y-6">
        <SectionHeader
          title="Presensi Tatap Muka Sesi KBM (Guru Pengampu)"
          sub="Pencatatan presensi siswa khusus saat jam pelajaran dan sesi KBM berlangsung yang terhubung ke Jurnal Mengajar Guru"
        />

        {/* Active KBM Session Card & Selector */}
        <Card className="border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-sm">
          <CardHeader className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-emerald-600 text-white font-mono text-xs font-bold animate-pulse">
                  ⏰ SESI KBM AKTIF SAAT INI
                </Badge>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  {activeSession.time}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-foreground">
                {activeSession.mapel} ({activeSession.class}) • {activeSession.meeting}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Materi: {activeSession.topic} • {activeSession.room}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground shrink-0">Pilih Sesi Mengajar:</span>
              <select
                className="h-9 rounded-md border border-emerald-500/40 bg-background px-3 text-xs font-bold"
                value={selectedKbmSession}
                onChange={(e) => setSelectedKbmSession(e.target.value)}
              >
                {kbmSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.mapel} ({s.class}) - {s.time}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
        </Card>

        {/* Session Attendance Table */}
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" /> Presensi Siswa Sesi KBM {activeSession.mapel}
              </CardTitle>
              <CardDescription className="text-xs">
                Checklist kehadiran siswa untuk {activeSession.class} pada {activeSession.meeting}.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="text-xs font-bold gap-1" onClick={handleMarkAllHadir}>
                ⚡ Tandai Semua Hadir
              </Button>
              <Button size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleSavePresensiSesiKbm}>
                💾 Simpan Presensi Sesi & Sync Jurnal
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">NISN & Nama Siswa</th>
                  <th className="py-3 px-3">Rombel</th>
                  <th className="py-3 px-3 text-center">Status Presensi Sesi KBM</th>
                  <th className="py-3 px-3 text-center">Rekap Hadir Total</th>
                  <th className="py-3 px-3 text-center">% Kehadiran Mapel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sessionStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-semibold">
                      <div className="font-bold text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.nisn}</div>
                    </td>
                    <td className="py-3 px-3 font-bold">{s.class}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
                        <button
                          onClick={() => handleSetSessionStatus(s.id, "hadir")}
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold transition ${
                            s.sessionStatus === "hadir" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          HADIR
                        </button>
                        <button
                          onClick={() => handleSetSessionStatus(s.id, "izin")}
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold transition ${
                            s.sessionStatus === "izin" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          IZIN
                        </button>
                        <button
                          onClick={() => handleSetSessionStatus(s.id, "sakit")}
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold transition ${
                            s.sessionStatus === "sakit" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          SAKIT
                        </button>
                        <button
                          onClick={() => handleSetSessionStatus(s.id, "alpa")}
                          className={`px-2.5 py-1 rounded text-[10px] font-extrabold transition ${
                            s.sessionStatus === "alpa" ? "bg-red-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          ALPA
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{s.hadir} Hari</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-primary text-sm">{s.pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- BRANCH 3: ROLE WALI KELAS / ADMIN (LOCKED TO HOMEROOM CLASS) ---
  const totalStudents = filteredAttendance.length || 1;
  const avgAttendancePct = Math.round(
    (filteredAttendance.reduce((acc, curr) => {
      const h = curr.hadir + (curr.today === "hadir" ? 1 : 0);
      const tot = h + curr.izin + curr.sakit + curr.alpa + (curr.today !== "hadir" ? 1 : 0);
      return acc + (h / (tot || 1)) * 100;
    }, 0) / totalStudents) * 10
  ) / 10;

  const totalIzinSakit = filteredAttendance.filter((s) => s.today === "izin" || s.today === "sakit" || s.izin > 0 || s.sakit > 0).length;
  const totalAlpaEws = filteredAttendance.filter((s) => s.today === "alpa" || s.alpa > 0).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title={`Kehadiran & Presensi Harian ${selectedClass} (Wali Kelas)`}
        sub={`Pencatatan resmi presensi harian pagi untuk ${selectedClass}, pemantauan rekap bulanan, & direct WhatsApp alert ke orang tua siswa MTsN 2 Cilacap`}
      />

      {/* Dynamic Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              ✓
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Rata-Rata Kehadiran</div>
              <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{avgAttendancePct}% Hadir</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
              ℹ️
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Siswa Izin / Sakit</div>
              <div className="text-lg font-extrabold text-foreground">{totalIzinSakit} Siswa</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
              ⚠️
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Alert Indisipliner (Alpa)</div>
              <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{totalAlpaEws} Siswa EWS</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center shrink-0 font-bold">
              📱
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">WA Alert Gateway</div>
              <div className="text-lg font-extrabold text-purple-600 dark:text-purple-400">Terintegrasi</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" /> Presensi Harian Pagi ({selectedClass})
            </CardTitle>
            <CardDescription className="text-xs">
              Satu pintu input presensi hari ini ({new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}). Terhubung otomatis ke Kalender Siswa & E-Rapor.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="text-xs font-bold gap-1" onClick={handleMarkAllHadir}>
              ⚡ Tandai Semua Hadir
            </Button>
            <Button size="sm" className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1" onClick={handleSavePresensiHarianPagi}>
              💾 Simpan & Sync Kalender
            </Button>

            <select
              className="h-9 rounded-md border border-border bg-background px-3 text-xs font-bold"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="Rombel 8A">Rombel 8A (Bimbingan)</option>
              <option value="Rombel 8B">Rombel 8B</option>
              <option value="Semua">Semua Rombel</option>
            </select>

            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold" onClick={() => setIsPrintPresensiOpen(true)}>
              <Download className="h-3.5 w-3.5" /> 🖨️ Cetak PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/60 text-left border-b border-border font-bold text-muted-foreground">
              <tr>
                <th className="py-3 px-4">NISN & Nama Siswa</th>
                <th className="py-3 px-3">Rombel</th>
                <th className="py-3 px-3 text-center">Presensi Hari Ini</th>
                <th className="py-3 px-3 text-center">Hadir (H)</th>
                <th className="py-3 px-3 text-center">Izin (I)</th>
                <th className="py-3 px-3 text-center">Sakit (S)</th>
                <th className="py-3 px-3 text-center">Alpa (A)</th>
                <th className="py-3 px-3 text-center">% Kehadiran</th>
                <th className="py-3 px-4 text-right">Aksi WA Ortu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAttendance.map((s) => {
                const effHadir = s.hadir + (s.today === "hadir" ? 1 : 0);
                const effIzin = s.izin + (s.today === "izin" ? 1 : 0);
                const effSakit = s.sakit + (s.today === "sakit" ? 1 : 0);
                const effAlpa = s.alpa + (s.today === "alpa" ? 1 : 0);
                const totDays = effHadir + effIzin + effSakit + effAlpa || 1;
                const effPct = Math.round((effHadir / totDays) * 1000) / 10;

                return (
                  <tr key={s.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-semibold">
                      <div className="font-bold text-foreground">{s.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{s.nisn}</div>
                    </td>
                    <td className="py-3 px-3 font-bold">{s.class}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
                        <button
                          onClick={() => handleSetTodayStatus(s.id, "hadir")}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                            s.today === "hadir" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          HADIR
                        </button>
                        <button
                          onClick={() => handleSetTodayStatus(s.id, "izin")}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                            s.today === "izin" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          IZIN
                        </button>
                        <button
                          onClick={() => handleSetTodayStatus(s.id, "sakit")}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                            s.today === "sakit" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          SAKIT
                        </button>
                        <button
                          onClick={() => handleSetTodayStatus(s.id, "alpa")}
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                            s.today === "alpa" ? "bg-red-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          ALPA
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">{effHadir}</td>
                    <td className="py-3 px-3 text-center font-mono">{effIzin}</td>
                    <td className="py-3 px-3 text-center font-mono">{effSakit}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-red-600">{effAlpa}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-primary text-sm">{effPct}%</td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-7 text-[11px] font-bold gap-1 border-purple-500/40 ${
                          s.today !== "hadir" ? "bg-purple-600 text-white hover:bg-purple-700 font-extrabold shadow-xs" : "text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20"
                        }`}
                        onClick={() => handleSendWaPresensiAlert(s)}
                      >
                        <Send className="h-3 w-3" /> WA Alert Ortu
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 🖨️ MODAL PRATINJAU & CETAK REKAP PRESENSI PDF (DENGAN LOGO RESMI SEKOLAH) */}
      <Dialog open={isPrintPresensiOpen} onOpenChange={setIsPrintPresensiOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-emerald-600" /> Pratinjau Rekapitulasi Presensi Bulanan
              </div>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">{selectedClass}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Format Dokumen Resmi Rekapitulasi Kehadiran Siswa MTsN 2 Cilacap ({selectedMonth}).
            </DialogDescription>
          </DialogHeader>

          {/* DOKUMEN RESMI REKAP PRESENSI (LEMBAR KERTAS CETAK DENGAN LOGO SEKOLAH) */}
          <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
            {/* Kop Resmi dengan 1 Logo Sekolah Official */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-4 mb-2">
                <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                <div className="text-center flex-1 pr-14">
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                  <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                </div>
              </div>
              <div className="py-1 bg-emerald-800 text-white font-extrabold text-xs text-center uppercase tracking-widest rounded-xs">
                REKAPITULASI PRESENSI KEHADIRAN SISWA BULANAN
              </div>
            </div>

            {/* Identitas Filter */}
            <div className="flex justify-between items-center text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>Rombongan Belajar: <strong className="text-emerald-900 font-bold">{selectedClass}</strong></div>
              <div>Bulan / Periode: <strong>{selectedMonth}</strong></div>
              <div>Tahun Ajaran: <strong>2026/2027 Ganjil</strong></div>
            </div>

            {/* Tabel Matriks Presensi Resmi */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">NISN</th>
                    <th className="border border-slate-300 p-2 text-left">Nama Lengkap Siswa</th>
                    <th className="border border-slate-300 p-2 text-center">Hadir</th>
                    <th className="border border-slate-300 p-2 text-center">Izin</th>
                    <th className="border border-slate-300 p-2 text-center">Sakit</th>
                    <th className="border border-slate-300 p-2 text-center">Alpa</th>
                    <th className="border border-slate-300 p-2 text-center">% Hadir</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((s, idx) => {
                    const effHadir = s.hadir + (s.today === "hadir" ? 1 : 0);
                    const effIzin = s.izin + (s.today === "izin" ? 1 : 0);
                    const effSakit = s.sakit + (s.today === "sakit" ? 1 : 0);
                    const effAlpa = s.alpa + (s.today === "alpa" ? 1 : 0);
                    const totDays = effHadir + effIzin + effSakit + effAlpa || 1;
                    const effPct = Math.round((effHadir / totDays) * 1000) / 10;

                    return (
                      <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                        <td className="border border-slate-300 p-2 font-mono">{s.nisn}</td>
                        <td className="border border-slate-300 p-2 font-bold">{s.name}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-emerald-800">{effHadir}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{effIzin}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono">{effSakit}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono text-red-700 font-bold">{effAlpa}</td>
                        <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-950">{effPct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tanda Tangan Official */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Wali Kelas {selectedClass}</div>
                <div className="font-bold underline text-slate-950">Dra. Hj. Siti Rahmah, M.Pd</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">H. Mohammad Fathoni, M.Pd</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintPresensiOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={handlePrintPresensi}>
              <Download className="h-4 w-4" /> 🖨️ Cetak Rekap Presensi PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Jadwal({ activeRole, userProfile }: { activeRole?: string; userProfile?: any }) {
  const isSiswa = activeRole === "siswa";
  const me = MysqlAuthService.getActiveUser();

  const resolvedInitialRombel = useMemo(() => {
    // 1. If Siswa, use student class
    if (isSiswa) {
      const raw = userProfile?.class_name || (me as any)?.class_name || "VIII-A";
      const clean = raw.toUpperCase().replace("-", "").replace(/\s+/g, "");
      if (clean.includes("7B") || clean.includes("VIIB")) return "Rombel 7B";
      if (clean.includes("7A") || clean.includes("VIIA")) return "Rombel 7A";
      if (clean.includes("8B") || clean.includes("VIIIB")) return "Rombel 8B";
      if (clean.includes("8A") || clean.includes("VIIIA")) return "Rombel 8A";
      if (clean.includes("9B") || clean.includes("IXB")) return "Rombel 9B";
      if (clean.includes("9A") || clean.includes("IXA")) return "Rombel 9A";
    }

    // 2. If Wali Kelas or Guru, resolve from logged in user name/nip/assigned_class
    const cleanName = (me?.full_name || "").toLowerCase();
    const cleanNip = (me?.nis_nip || "").trim();
    const cleanAssigned = (userProfile?.assignedClass || (me as any)?.assigned_class || "").toUpperCase();

    if (cleanAssigned.includes("7B")) return "Rombel 7B";
    if (cleanAssigned.includes("7A")) return "Rombel 7A";
    if (cleanAssigned.includes("8B")) return "Rombel 8B";
    if (cleanAssigned.includes("8A")) return "Rombel 8A";
    if (cleanAssigned.includes("9B")) return "Rombel 9B";
    if (cleanAssigned.includes("9A")) return "Rombel 9A";

    if (cleanName.includes("achmad makmun") || cleanNip.includes("272005011001")) return "Rombel 8B";
    if (cleanName.includes("misbah")) return "Rombel 7A";
    if (cleanName.includes("endah")) return "Rombel 7B";
    if (cleanName.includes("siti rahmah")) return "Rombel 8A";
    if (cleanName.includes("sobiyati")) return "Rombel 9A";
    if (cleanName.includes("sayono")) return "Rombel 9B";

    return "Rombel 8A";
  }, [isSiswa, userProfile, me]);

  const resolvedInitialGrade = useMemo(() => {
    if (resolvedInitialRombel.includes("7")) return "Kelas VII";
    if (resolvedInitialRombel.includes("9")) return "Kelas IX";
    return "Kelas VIII";
  }, [resolvedInitialRombel]);

  const hari = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const [filterKelas, setFilterKelas] = useState(resolvedInitialGrade);
  const [filterRombel, setFilterRombel] = useState(resolvedInitialRombel);

  const [jadwal, setJadwal] = useState<
    Record<string, { j: string; m: string; tingkat: string; rombel: string; g: string }[]>
  >(() => {
    const OFFICIAL_SCHEDULE = {
      Senin: [
        // 7A
        { j: "07.30 - 08.15", m: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "SAYONO, S.Pd., M.Pd." },
        { j: "08.15 - 09.00", m: "PJOK", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "NUR ROCHMAN SHODIQ, S.Pd.I" },
        { j: "09.15 - 10.00", m: "Bahasa Jawa", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "RINDANG FARIHA IDANA, S.Pd" },
        { j: "10.00 - 10.45", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "10.45 - 11.30", m: "Prakarya dan Seni Budaya", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "ISNAENI HASANAH, S.Pd.I" },
        // 7B
        { j: "07.30 - 08.15", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "08.15 - 09.00", m: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "SOBIYATI, S.Pd" },
        { j: "09.15 - 10.00", m: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "SAYONO, S.Pd., M.Pd." },
        { j: "10.00 - 10.45", m: "Bahasa Jawa", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "RINDANG FARIHA IDANA, S.Pd" },
        { j: "10.45 - 11.30", m: "Bimbingan dan Konseling", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "ASROR HIDAYAT, S.Pd" },
        // 8A
        { j: "07.30 - 08.30", m: "PJOK", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "NUR ROCHMAN SHODIQ, S.Pd.I" },
        { j: "08.30 - 09.30", m: "Sejarah Kebudayaan Islam", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "H. DASIRUN, S.Ag., M.Pd.I" },
        { j: "09.45 - 10.45", m: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "SOBIYATI, S.Pd" },
        { j: "10.45 - 11.45", m: "Bimbingan dan Konseling", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "ASROR HIDAYAT, S.Pd" },
        // 8B
        { j: "07.30 - 08.15", m: "Pendidikan Kewarganegaraan", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
        { j: "08.15 - 09.00", m: "Bahasa Arab", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "ENDAH SUPRIHATIN, S.Pd" },
        { j: "09.15 - 10.00", m: "Fikih", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "CARYATI," },
        { j: "10.00 - 10.45", m: "Prakarya dan Seni Budaya", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "ISNAENI HASANAH, S.Pd.I" },
        { j: "10.45 - 11.30", m: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "SOBIYATI, S.Pd" },
        // 9A
        { j: "07.30 - 08.30", m: "Bahasa Jawa", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "RINDANG FARIHA IDANA, S.Pd" },
        { j: "08.30 - 09.30", m: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "09.45 - 10.45", m: "Bahasa Inggris", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "10.45 - 11.45", m: "Sejarah Kebudayaan Islam", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "H. DASIRUN, S.Ag., M.Pd.I" },
        // 9B
        { j: "07.30 - 08.15", m: "Ilmu Pendidikan Alam", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "08.15 - 09.00", m: "Bimbingan dan Konseling", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "ASROR HIDAYAT, S.Pd" },
        { j: "09.15 - 10.00", m: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "SAYONO, S.Pd., M.Pd." },
        { j: "10.00 - 10.45", m: "Prakarya dan Seni Budaya", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "ISNAENI HASANAH, S.Pd.I" },
        { j: "10.45 - 11.30", m: "Akidah Akhlak", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "WAKHIBUN, S.P" },
      ],
      Selasa: [
        // 7A
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "SAYONO, S.Pd., M.Pd." },
        { j: "09.15 - 10.00", m: "Akidah Akhlak", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "WAKHIBUN, S.P" },
        { j: "10.00 - 10.45", m: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "SOBIYATI, S.Pd" },
        { j: "10.45 - 11.30", m: "Bimbingan dan Konseling", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "ASROR HIDAYAT, S.Pd" },
        // 7B
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Bahasa Arab", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "ENDAH SUPRIHATIN, S.Pd" },
        { j: "09.45 - 10.45", m: "Bahasa Inggris", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "10.45 - 11.45", m: "Pendidikan Kewarganegaraan", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
        // 8A
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "09.45 - 10.45", m: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "SAYONO, S.Pd., M.Pd." },
        { j: "10.45 - 11.45", m: "Bahasa Inggris", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        // 8B
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Bahasa Jawa", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "RINDANG FARIHA IDANA, S.Pd" },
        { j: "09.15 - 10.00", m: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "SOBIYATI, S.Pd" },
        { j: "10.00 - 10.45", m: "Ilmu Pendidikan Sosial", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "UMI KHAFSOH, S.Pd" },
        { j: "10.45 - 11.30", m: "Al Qur'an Hadis", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "AH. SYARIF HIDAYAH, S.Pd.I" },
        // 9A
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "SAYONO, S.Pd., M.Pd." },
        { j: "09.15 - 10.00", m: "Ilmu Pendidikan Alam", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "10.00 - 10.45", m: "Pendidikan Kewarganegaraan", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
        { j: "10.45 - 11.30", m: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "SOBIYATI, S.Pd" },
        // 9B
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "09.15 - 10.00", m: "Bahasa Jawa", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "RINDANG FARIHA IDANA, S.Pd" },
        { j: "10.00 - 10.45", m: "Al Qur'an Hadis", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "AH. SYARIF HIDAYAH, S.Pd.I" },
        { j: "10.45 - 11.30", m: "Bahasa Arab", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "ENDAH SUPRIHATIN, S.Pd" },
      ],
      Rabu: [
        // 7A
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Al Qur'an Hadis", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "AH. SYARIF HIDAYAH, S.Pd.I" },
        { j: "09.45 - 10.45", m: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "SOBIYATI, S.Pd" },
        { j: "10.45 - 11.45", m: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        // 7B
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "09.15 - 10.00", m: "Prakarya dan Seni Budaya", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "ISNAENI HASANAH, S.Pd.I" },
        { j: "10.00 - 10.45", m: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "10.45 - 11.30", m: "Sejarah Kebudayaan Islam", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "H. DASIRUN, S.Ag., M.Pd.I" },
        // 8A
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Bahasa Jawa", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "RINDANG FARIHA IDANA, S.Pd" },
        { j: "09.15 - 10.00", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "10.00 - 10.45", m: "Fikih", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "CARYATI," },
        { j: "10.45 - 11.30", m: "Bahasa Arab", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "ENDAH SUPRIHATIN, S.Pd" },
        // 8B
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Bahasa Inggris", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "09.45 - 10.45", m: "Sejarah Kebudayaan Islam", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "H. DASIRUN, S.Ag., M.Pd.I" },
        { j: "10.45 - 11.45", m: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "SOBIYATI, S.Pd" },
        // 9A
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "SOBIYATI, S.Pd" },
        { j: "09.15 - 10.00", m: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "SAYONO, S.Pd., M.Pd." },
        { j: "10.00 - 10.45", m: "Prakarya dan Seni Budaya", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "ISNAENI HASANAH, S.Pd.I" },
        { j: "10.45 - 11.30", m: "Ilmu Pendidikan Sosial", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "UMI KHAFSOH, S.Pd" },
        // 9B
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Bahasa Inggris", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "09.45 - 10.45", m: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "SOBIYATI, S.Pd" },
        { j: "10.45 - 11.45", m: "Sejarah Kebudayaan Islam", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "H. DASIRUN, S.Ag., M.Pd.I" },
      ],
      Kamis: [
        // 7A
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Pendidikan Kewarganegaraan", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
        { j: "09.45 - 10.45", m: "Bahasa Inggris", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        { j: "10.45 - 11.45", m: "Ilmu Pendidikan Sosial", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "UMI KHAFSOH, S.Pd" },
        // 7B
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Fikih", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "CARYATI," },
        { j: "09.45 - 10.45", m: "Bahasa Indonesia", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "SOBIYATI, S.Pd" },
        { j: "10.45 - 11.45", m: "Al Qur'an Hadis", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "AH. SYARIF HIDAYAH, S.Pd.I" },
        // 8A
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "SAYONO, S.Pd., M.Pd." },
        { j: "09.15 - 10.00", m: "Prakarya dan Seni Budaya", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "ISNAENI HASANAH, S.Pd.I" },
        { j: "10.00 - 10.45", m: "Pendidikan Kewarganegaraan", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
        { j: "10.45 - 11.30", m: "Bahasa Indonesia", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "SOBIYATI, S.Pd" },
        // 8B
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "09.15 - 10.00", m: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "SAYONO, S.Pd., M.Pd." },
        { j: "10.00 - 10.45", m: "Akidah Akhlak", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "WAKHIBUN, S.P" },
        { j: "10.45 - 11.30", m: "Bimbingan dan Konseling", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "ASROR HIDAYAT, S.Pd" },
        // 9A
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Al Qur'an Hadis", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "AH. SYARIF HIDAYAH, S.Pd.I" },
        { j: "09.15 - 10.00", m: "Bahasa Arab", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "ENDAH SUPRIHATIN, S.Pd" },
        { j: "10.00 - 10.45", m: "Bimbingan dan Konseling", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "ASROR HIDAYAT, S.Pd" },
        { j: "10.45 - 11.30", m: "Fikih", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "CARYATI," },
        // 9B
        { j: "07.30 - 08.15", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.15 - 09.00", m: "Bahasa Indonesia", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "SOBIYATI, S.Pd" },
        { j: "09.15 - 10.00", m: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "SAYONO, S.Pd., M.Pd." },
        { j: "10.00 - 10.45", m: "Ilmu Pendidikan Alam", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "10.45 - 11.30", m: "Pendidikan Kewarganegaraan", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "ANGGUN NOVTALIA BERLIAN, S.Pd" },
      ],
      Jumat: [
        // 7A
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Bahasa Arab", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "ENDAH SUPRIHATIN, S.Pd" },
        { j: "09.45 - 10.45", m: "Sejarah Kebudayaan Islam", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "H. DASIRUN, S.Ag., M.Pd.I" },
        // 7B
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "PJOK", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "NUR ROCHMAN SHODIQ, S.Pd.I" },
        { j: "09.45 - 10.45", m: "Akidah Akhlak", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "WAKHIBUN, S.P" },
        // 8A
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Al Qur'an Hadis", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "AH. SYARIF HIDAYAH, S.Pd.I" },
        { j: "09.45 - 10.45", m: "Ilmu Pendidikan Sosial", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "UMI KHAFSOH, S.Pd" },
        // 8B
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Matematika", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "SAYONO, S.Pd., M.Pd." },
        { j: "09.45 - 10.45", m: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        // 9A
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "Akidah Akhlak", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "WAKHIBUN, S.P" },
        { j: "09.45 - 10.45", m: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "SAYONO, S.Pd., M.Pd." },
        // 9B
        { j: "07.30 - 08.30", m: "Tahfidz & Murottal", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "MISBAH AHMAD DANI, S.Pd" },
        { j: "08.30 - 09.30", m: "PJOK", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "NUR ROCHMAN SHODIQ, S.Pd.I" },
        { j: "09.45 - 10.45", m: "Fikih", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "CARYATI," },
      ],
      Sabtu: [
        // 7A
        { j: "07.30 - 09.00", m: "Fikih", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "CARYATI," },
        { j: "09.15 - 10.45", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VII", rombel: "Rombel 7A", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        // 7B
        { j: "07.30 - 09.00", m: "Matematika", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "SAYONO, S.Pd., M.Pd." },
        { j: "09.15 - 10.45", m: "Ilmu Pendidikan Sosial", tingkat: "Kelas VII", rombel: "Rombel 7B", g: "UMI KHAFSOH, S.Pd" },
        // 8A
        { j: "07.30 - 09.00", m: "Akidah Akhlak", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "WAKHIBUN, S.P" },
        { j: "09.15 - 10.45", m: "Teknologi Informasi dan Komunikasi", tingkat: "Kelas VIII", rombel: "Rombel 8A", g: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
        // 8B
        { j: "07.30 - 09.00", m: "Ilmu Pendidikan Alam", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        { j: "09.15 - 10.45", m: "PJOK", tingkat: "Kelas VIII", rombel: "Rombel 8B", g: "NUR ROCHMAN SHODIQ, S.Pd.I" },
        // 9A
        { j: "07.30 - 09.00", m: "PJOK", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "NUR ROCHMAN SHODIQ, S.Pd.I" },
        { j: "09.15 - 10.45", m: "Ilmu Pendidikan Alam", tingkat: "Kelas IX", rombel: "Rombel 9A", g: "NOVANTYA KARTIKAWATI, S.Pd" },
        // 9B
        { j: "07.30 - 09.00", m: "Matematika", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "SAYONO, S.Pd., M.Pd." },
        { j: "09.15 - 10.45", m: "Ilmu Pendidikan Sosial", tingkat: "Kelas IX", rombel: "Rombel 9B", g: "UMI KHAFSOH, S.Pd" },
      ],
    };

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lms_schedule_v3");
        if (saved) return JSON.parse(saved);
        localStorage.removeItem("lms_schedule_v1");
        localStorage.removeItem("lms_schedule_v2");
        localStorage.setItem("lms_schedule_v3", JSON.stringify(OFFICIAL_SCHEDULE));
      } catch (e) {}
    }
    return OFFICIAL_SCHEDULE;
  });

  useEffect(() => {
    if (isSiswa) {
      setFilterRombel(resolvedInitialRombel);
      setFilterKelas(resolvedInitialGrade);
    }
  }, [isSiswa, resolvedInitialRombel, resolvedInitialGrade]);

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

  const [isPrintJadwalOpen, setIsPrintJadwalOpen] = useState(false);

  const handlePrintJadwal = () => {
    window.print();
    toast.success(`🖨️ Cetak Matriks Jadwal Pelajaran KBM (${filterRombel === "Semua" ? "Seluruh Rombel" : filterRombel}) berhasil diproses!`);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Jadwal Pelajaran {isSiswa && <Badge className="bg-primary text-primary-foreground font-bold text-xs">📍 {filterRombel}</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isSiswa
              ? `Jadwal alokasi jam tatap muka & pembelajaran khusus ${filterRombel} MTsN 2 Cilacap`
              : "Plotting alokasi jadwal mengajar & belajar per Tingkat Kelas dan Rombel MTsN 2 Cilacap"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" onClick={() => setIsPrintJadwalOpen(true)}>
            <Download className="h-3.5 w-3.5" /> 🖨️ Cetak Jadwal KBM PDF
          </Button>
          {!isSiswa && (
            <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
              + Tambah Jadwal Pelajaran
            </Button>
          )}
        </div>
      </div>

      {/* Filter Bar Kelas & Rombel (Hidden & Locked for Siswa) */}
      {!isSiswa ? (
        <div className="p-4 rounded-xl bg-card border border-border space-y-3 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
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
                className="h-8 rounded-md border border-border bg-background px-3 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                value={filterRombel}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterRombel(val);
                  if (val.includes("7")) setFilterKelas("Kelas VII");
                  else if (val.includes("8")) setFilterKelas("Kelas VIII");
                  else if (val.includes("9")) setFilterKelas("Kelas IX");
                  else if (val === "Semua") setFilterKelas("Semua");
                }}
              >
                <option value="Semua">Semua Rombel</option>
                <option value="Rombel 7A">Rombel 7A</option>
                <option value="Rombel 7B">Rombel 7B</option>
                <option value="Rombel 8A">Rombel 8A</option>
                <option value="Rombel 8B">Rombel 8B</option>
                <option value="Rombel 9A">Rombel 9A</option>
                <option value="Rombel 9B">Rombel 9B</option>
              </select>
            </div>
          </div>

          {/* Banner Info Schedule Filter */}
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <span className="text-sm">📍</span> Menampilkan Jadwal KBM Resmi: <strong className="underline decoration-emerald-500 font-extrabold">{filterRombel === "Semua" ? "Seluruh Rombel" : filterRombel}</strong> ({filterKelas === "Semua" ? "Seluruh Tingkat" : filterKelas})
            </span>
            {filterRombel !== "Semua" && (
              <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-[10px]">
                Tersaring Presisi
              </Badge>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 mb-6 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
            <span className="text-base">🔒</span>
            <span>Jadwal Khusus Kelas Anda: <strong className="text-emerald-700 dark:text-emerald-400 text-sm font-black">{resolvedInitialRombel} ({resolvedInitialGrade})</strong></span>
          </div>
          <Badge className="bg-emerald-700 text-white font-extrabold text-[10px] px-2.5 py-0.5">
            100% Presisi Kelas Siswa
          </Badge>
        </div>
      )}

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

      {/* 🖨️ MODAL PRATINJAU & CETAK JADWAL KBM PDF */}
      <Dialog open={isPrintJadwalOpen} onOpenChange={setIsPrintJadwalOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-blue-600" /> Pratinjau Matriks Jadwal Pelajaran KBM
              </div>
              <Badge className="bg-blue-600 text-white font-mono text-xs">{filterRombel === "Semua" ? "Seluruh Rombel" : filterRombel}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Jadwal Resmi Alokasi Pembelajaran Tatap Muka & KBM MTsN 2 Cilacap (Tahun Ajaran 2025/2026 Ganjil).
            </DialogDescription>
          </DialogHeader>

          {/* DOKUMEN RESMI JADWAL KBM (LEMBAR KERTAS) */}
          <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
            {/* Kop Resmi (1 Logo Sekolah) */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-4 mb-2">
                <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                <div className="text-center flex-1 pr-14">
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                  <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                </div>
              </div>
              <div className="mt-2 py-1 bg-blue-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs">
                JADWAL PELAJARAN KBM MADRASAH (SEMESTER GANJIL)
              </div>
            </div>

            {/* Identitas Filter */}
            <div className="flex justify-between items-center text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>Tingkat Kelas: <strong>{filterKelas}</strong></div>
              <div>Rombongan Belajar: <strong className="text-blue-900 font-bold">{filterRombel}</strong></div>
              <div>Tahun Ajaran: <strong>2025/2026 Ganjil</strong></div>
            </div>

            {/* Matriks Hari (Senin - Sabtu) */}
            <div className="space-y-3">
              {hari.map((h) => {
                const listForDay = (jadwal[h] || []).filter((s) => {
                  const matchKelas = filterKelas === "Semua" || s.tingkat === filterKelas;
                  const matchRombel = filterRombel === "Semua" || s.rombel === filterRombel;
                  return matchKelas && matchRombel;
                });
                if (listForDay.length === 0) return null;

                return (
                  <div key={h} className="border border-slate-300 rounded-md overflow-hidden text-xs">
                    <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-900 border-b border-slate-300 flex justify-between">
                      <span>📅 HARI {h.toUpperCase()}</span>
                      <span className="font-mono text-[11px] text-slate-600">{listForDay.length} Sesi Pelajaran</span>
                    </div>
                    <table className="w-full text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                          <th className="p-1.5 text-center w-24 border-r border-slate-200">Jam Waktu</th>
                          <th className="p-1.5 text-left border-r border-slate-200">Mata Pelajaran</th>
                          <th className="p-1.5 text-left border-r border-slate-200">Rombel / Ruang</th>
                          <th className="p-1.5 text-left">Guru Pengampu Utama</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listForDay.map((s, idx) => (
                          <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                            <td className="p-1.5 text-center font-mono font-bold text-slate-900 border-r border-slate-200">{s.j}</td>
                            <td className="p-1.5 font-bold text-blue-950 border-r border-slate-200">{s.m}</td>
                            <td className="p-1.5 border-r border-slate-200">{s.rombel} ({s.tingkat})</td>
                            <td className="p-1.5 text-slate-800">{s.g}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* Tanda Tangan Official */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Waka Kurikulum</div>
                <div className="font-bold underline text-slate-950">Dra. Hj. Siti Rahmah, M.Pd</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">H. Mohammad Fathoni, M.Pd</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintJadwalOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5" onClick={handlePrintJadwal}>
              <Download className="h-4 w-4" /> 🖨️ Cetak Jadwal KBM PDF
            </Button>
          </DialogFooter>
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
  const [isTeacherPresensiOpen, setIsTeacherPresensiOpen] = useState(false);
  const [sessionStudents, setSessionStudents] = useState([
    { id: "s1", nisn: "0081928371", name: "Ahmad Fauzi", status: "hadir" },
    { id: "s2", nisn: "0081928372", name: "Fatimah Az-Zahra", status: "hadir" },
    { id: "s3", nisn: "0081928373", name: "Muhammad Rizky", status: "hadir" },
    { id: "s4", nisn: "0081928374", name: "Siti Nurhaliza", status: "hadir" },
    { id: "s5", nisn: "0081928375", name: "Budi Santoso", status: "hadir" },
  ]);

  const handleSetStudentStatus = (id: string, st: string) => {
    setSessionStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: st } : s)));
  };

  const handleMarkAllSessionHadir = () => {
    setSessionStudents((prev) => prev.map((s) => ({ ...s, status: "hadir" })));
    toast.success("⚡ Seluruh siswa kelas ini ditandai HADIR untuk sesi KBM ini!");
  };

  const handleSaveSessionPresensi = () => {
    setPresensiDone(true);
    setIsTeacherPresensiOpen(false);
    toast.success(`✅ Presensi Tatap Muka Sesi KBM (${selectedMapel} - Pertemuan ${selectedPertemuan}) Berhasil Disimpan Guru!`);
  };

  const mapelList = INITIAL_MASTER_MAPEL;

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
            {isSiswa ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Presensi Kehadiran Pertemuan {selectedPertemuan}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Status Kehadiran Hari Ini: <span className="font-bold text-emerald-600 dark:text-emerald-400">HADIR (Terhubung ke Kalender Presensi Siswa)</span>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-bold py-1 px-3">
                  ✅ TERVERIFIKASI KALENDER SISWA
                </Badge>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-sm text-foreground flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-primary" /> Presensi Sesi KBM Pertemuan {selectedPertemuan}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {presensiDone
                      ? " Presensi tatap muka pertemuan ini telah diisi & disesuaikan oleh Guru Mapel."
                      : "⚡ Ter-sync otomatis dari Presensi Harian Pagi (30 Hadir, 1 Sakit, 1 Izin). Klik tombol di samping jika ingin menyesuaikan siswa."}
                  </div>
                </div>
                <Button
                  size="sm"
                  className={presensiDone ? "bg-emerald-600 text-white font-bold gap-1.5" : "bg-primary text-primary-foreground font-bold gap-1.5"}
                  onClick={() => setIsTeacherPresensiOpen(true)}
                >
                  <UserCheck className="h-4 w-4" />
                  {presensiDone ? "✅ Presensi Sesi Terdaftar (Edit)" : "🔍 Lihat / Sesuaikan Presensi Jam Ini"}
                </Button>
              </div>
            )}

            {/* Modal Dialog Presensi Tatap Muka Sesi KBM (Guru) */}
            <Dialog open={isTeacherPresensiOpen} onOpenChange={setIsTeacherPresensiOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base font-bold">
                    <UserCheck className="h-5 w-5 text-primary" />
                    Presensi Tatap Muka Sesi KBM - {selectedMapel} (Pertemuan {selectedPertemuan})
                  </DialogTitle>
                  <DialogDescription className="text-xs">
                    Tandai kehadiran siswa kelas pada jam tatap muka KBM ini secara cepat.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between bg-muted/50 p-2.5 rounded-lg border border-border">
                    <span className="text-xs font-bold text-muted-foreground">Status Kehadiran Siswa Sesi KBM</span>
                    <Button size="sm" variant="outline" className="text-xs font-bold gap-1" onClick={handleMarkAllSessionHadir}>
                      ⚡ Tandai Semua Hadir
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {sessionStudents.map((st) => (
                      <div key={st.id} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/80 text-xs">
                        <div>
                          <div className="font-bold text-foreground">{st.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">NISN: {st.nisn}</div>
                        </div>
                        <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
                          <button
                            onClick={() => handleSetStudentStatus(st.id, "hadir")}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                              st.status === "hadir" ? "bg-emerald-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            HADIR
                          </button>
                          <button
                            onClick={() => handleSetStudentStatus(st.id, "izin")}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                              st.status === "izin" ? "bg-blue-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            IZIN
                          </button>
                          <button
                            onClick={() => handleSetStudentStatus(st.id, "sakit")}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                              st.status === "sakit" ? "bg-amber-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            SAKIT
                          </button>
                          <button
                            onClick={() => handleSetStudentStatus(st.id, "alpa")}
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition ${
                              st.status === "alpa" ? "bg-red-600 text-white shadow-xs" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            ALPA
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" size="sm" onClick={() => setIsTeacherPresensiOpen(false)}>
                    Batal
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={handleSaveSessionPresensi}>
                    💾 Simpan Presensi Sesi KBM
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

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

  const [mapelsStateList, setMapelsStateList] = useState(
    INITIAL_MASTER_MAPEL.map((m) => ({
      code: m.code,
      name: m.name,
      category: m.category,
      teacher: m.teacher || "Dra. Hj. Siti Rahmah, M.Pd",
      icon: m.icon || "📖",
      jp: parseInt(m.jp) || 2,
      kkm: 75,
      status: "Aktif",
    }))
  );

  useEffect(() => {
    MysqlDataService.getSubjects().then((res) => {
      if (res && res.length >= 5) {
        setMapelsStateList(
          res.map((r) => {
            const masterMatch = INITIAL_MASTER_MAPEL.find(
              (m) => m.code === r.code || m.name.toLowerCase() === r.name?.toLowerCase()
            );
            return {
              code: r.code,
              name: r.name,
              category: ((r.category && r.category !== "Keagamaan" ? r.category : masterMatch?.category) || "Keagamaan") as any,
              teacher: r.teacher_name || masterMatch?.teacher || "Guru Pengampu",
              icon: r.icon || masterMatch?.icon || "📖",
              jp: r.jp || (masterMatch ? parseInt(masterMatch.jp) : 2),
              kkm: r.kkm || 75,
              status: r.status || "Aktif",
            };
          })
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
              category: inputCategory as any,
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
        category: inputCategory as any,
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
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => { });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => { });
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
                              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition font-medium text-sm ${isSelected
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

  // E-Rapor Print State
  const [isPrintRaporOpen, setIsPrintRaporOpen] = useState(false);
  const [raporStudentName, setRaporStudentName] = useState("Ahmad Fauzi");
  const [raporNisn, setRaporNisn] = useState("0081928371");
  const [raporClass, setRaporClass] = useState("8A (VIII A)");

  const handlePrintRapor = () => {
    window.print();
    toast.success(`🖨️ Cetak E-Rapor Kurikulum Merdeka (${raporStudentName}) berhasil diproses!`);
  };

  const teacherEntryList = [
    { code: "AGM-01", mapel: "Al Qur'an Hadis", rombel: "Kelas VIII A", totalSiswa: 32, entered: 32, progress: 100, status: "Lengkap 100%", c: "text-emerald-500" },
    { code: "AGM-01", mapel: "Al Qur'an Hadis", rombel: "Kelas VIII B", totalSiswa: 32, entered: 28, progress: 87.5, status: "Entry 87.5%", c: "text-blue-500" },
    { code: "AGM-03", mapel: "Fikih", rombel: "Kelas IX A", totalSiswa: 32, entered: 32, progress: 100, status: "Lengkap 100%", c: "text-emerald-500" },
  ];

  const classesList = [
    { name: "Kelas VII A", wali: "MISBAH AHMAD DANI, S.Pd", siswa: 32, avg: 86.4, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas VII B", wali: "ENDAH SUPRIHATIN, S.Pd", siswa: 32, avg: 85.8, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas VIII A", wali: "Dra. Hj. Siti Rahmah, M.Pd", siswa: 32, avg: 88.2, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas VIII B", wali: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", siswa: 32, avg: 87.4, icon: "🏫", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas IX A", wali: "SOBIYATI, S.Pd", siswa: 32, avg: 89.1, icon: "🎓", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
    { name: "Kelas IX B", wali: "SAYONO, S.Pd., M.Pd.", siswa: 32, avg: 88.5, icon: "🎓", mapelsCount: 15, tuntas: "32 Siswa Tuntas" },
  ];

  const mapelDetails = [
    { code: "AGM-01", mapel: "Al Qur'an Hadis", teacher: "AH. SYARIF HIDAYAH, S.Pd.I", pertemuan: "18/18 Pertemuan (100%)", cp: "95% Tuntas", tugas: 90, kuis: 92, cbt: 88, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "AGM-02", mapel: "Akidah Akhlak", teacher: "WAKHIBUN, S.P", pertemuan: "16/18 Pertemuan (88%)", cp: "90% Tuntas", tugas: 88, kuis: 86, cbt: 85, avg: 86, kkm: "Tuntas (≥75)" },
    { code: "AGM-03", mapel: "Fikih", teacher: "CARYATI,", pertemuan: "17/18 Pertemuan (94%)", cp: "92% Tuntas", tugas: 92, kuis: 90, cbt: 89, avg: 90, kkm: "Tuntas (≥75)" },
    { code: "AGM-04", mapel: "Sejarah Kebudayaan Islam", teacher: "H. DASIRUN, S.Ag., M.Pd.I", pertemuan: "16/18 Pertemuan (88%)", cp: "90% Tuntas", tugas: 88, kuis: 88, cbt: 86, avg: 87, kkm: "Tuntas (≥75)" },
    { code: "AGM-05", mapel: "Bahasa Arab", teacher: "ENDAH SUPRIHATIN, S.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "96% Tuntas", tugas: 92, kuis: 94, cbt: 90, avg: 92, kkm: "Tuntas (≥75)" },
    { code: "UMM-01", mapel: "Bahasa Indonesia", teacher: "SOBIYATI, S.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "94% Tuntas", tugas: 89, kuis: 91, cbt: 88, avg: 89, kkm: "Tuntas (≥75)" },
    { code: "UMM-02", mapel: "Bahasa Inggris", teacher: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "95% Tuntas", tugas: 90, kuis: 93, cbt: 91, avg: 91, kkm: "Tuntas (≥75)" },
    { code: "UMM-03", mapel: "Matematika", teacher: "SAYONO, S.Pd., M.Pd.", pertemuan: "15/18 Pertemuan (83%)", cp: "85% Tuntas", tugas: 82, kuis: 85, cbt: 80, avg: 82, kkm: "Tuntas (≥75)" },
    { code: "UMM-04", mapel: "Ilmu Pendidikan Alam", teacher: "NOVANTYA KARTIKAWATI, S.Pd", pertemuan: "16/18 Pertemuan (88%)", cp: "88% Tuntas", tugas: 88, kuis: 87, cbt: 86, avg: 87, kkm: "Tuntas (≥75)" },
    { code: "UMM-05", mapel: "Ilmu Pendidikan Sosial", teacher: "UMI KHAFSOH, S.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "91% Tuntas", tugas: 86, kuis: 88, cbt: 85, avg: 86, kkm: "Tuntas (≥75)" },
    { code: "UMM-06", mapel: "Pendidikan Kewarganegaraan", teacher: "ANGGUN NOVTALIA BERLIAN, S.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "94% Tuntas", tugas: 89, kuis: 90, cbt: 88, avg: 89, kkm: "Tuntas (≥75)" },
    { code: "UMM-07", mapel: "Pendidikan Jasmani, Olahraga dan Kesehatan", teacher: "NUR ROCHMAN SHODIQ, S.Pd.I", pertemuan: "18/18 Pertemuan (100%)", cp: "98% Tuntas", tugas: 94, kuis: 95, cbt: 92, avg: 94, kkm: "Tuntas (≥75)" },
    { code: "UMM-08", mapel: "Prakarya dan Seni Budaya", teacher: "ISNAENI HASANAH, S.Pd.I", pertemuan: "16/18 Pertemuan (88%)", cp: "90% Tuntas", tugas: 88, kuis: 89, cbt: 87, avg: 88, kkm: "Tuntas (≥75)" },
    { code: "MLK-01", mapel: "Bahasa Jawa", teacher: "RINDANG FARIHA IDANA, S.Pd", pertemuan: "17/18 Pertemuan (94%)", cp: "92% Tuntas", tugas: 88, kuis: 90, cbt: 86, avg: 88, kkm: "Tuntas (≥75)" },
    { code: "PGB-01", mapel: "Bimbingan dan Konseling", teacher: "ASROR HIDAYAT, S.Pd", pertemuan: "18/18 Pertemuan (100%)", cp: "100% Tuntas", tugas: 95, kuis: 95, cbt: 95, avg: 95, kkm: "Tuntas (≥75)" },
  ];

  const studentSelfNilai = [
    { m: "Al Qur'an Hadis", t: 90, k: 92, u: 88 },
    { m: "Akidah Akhlak", t: 88, k: 86, u: 85 },
    { m: "Fikih", t: 92, k: 90, u: 89 },
    { m: "Bahasa Indonesia", t: 89, k: 91, u: 88 },
    { m: "Bahasa Inggris", t: 90, k: 93, u: 91 },
    { m: "Matematika", t: 82, k: 85, u: 80 },
    { m: "Ilmu Pendidikan Alam", t: 88, k: 87, u: 86 },
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
        <Button
          size="sm"
          className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs"
          onClick={() => {
            const printWindow = window.open("", "_blank");
            if (!printWindow) {
              toast.success("📄 Rekap Nilai PDF Madrasah (.txt/pdf) berhasil diunduh!");
              return;
            }
            printWindow.document.write(`
              <!DOCTYPE html>
              <html>
                <head>
                  <title>Laporan Rekapitulasi Nilai Madrasah MTsN 2 Cilacap</title>
                  <style>
                    body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; }
                    .header { text-align: center; border-bottom: 3px double #0f766e; padding-bottom: 12px; margin-bottom: 20px; }
                    .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; color: #0f766e; }
                    .header h3 { margin: 4px 0 0 0; font-size: 16px; font-weight: normal; }
                    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 20px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                    th { bg-color: #f1f5f9; text-align: center; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h2>KEMENTERIAN AGAMA REPUBLIK INDONESIA</h2>
                    <h3>MADRASAH TSANAWIYAH NEGERI 2 CILACAP</h3>
                    <p>Laporan Rekapitulasi Nilai Hasil Belajar Siswa TP 2026/2027 Ganjil</p>
                  </div>
                  <table>
                    <thead>
                      <tr><th>No</th><th>Rombel</th><th>Wali Kelas</th><th>Jumlah Siswa</th><th>Rata-rata Nilai</th><th>Status KKM</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>1</td><td>Kelas VII A</td><td>Misbah Ahmad Dani, S.Pd</td><td>32 Siswa</td><td>86.4</td><td>100% Tuntas</td></tr>
                      <tr><td>2</td><td>Kelas VII B</td><td>Endah Suprihatin, S.Pd</td><td>32 Siswa</td><td>85.8</td><td>100% Tuntas</td></tr>
                      <tr><td>3</td><td>Kelas VIII A</td><td>Dra. Hj. Siti Rahmah, M.Pd</td><td>32 Siswa</td><td>88.2</td><td>100% Tuntas</td></tr>
                      <tr><td>4</td><td>Kelas VIII B</td><td>Achmad Makmun Rosid, S.Pd., M.Pd</td><td>32 Siswa</td><td>87.4</td><td>100% Tuntas</td></tr>
                      <tr><td>5</td><td>Kelas IX A</td><td>Sobiyati, S.Pd</td><td>32 Siswa</td><td>89.1</td><td>100% Tuntas</td></tr>
                      <tr><td>6</td><td>Kelas IX B</td><td>Sayono, S.Pd., M.Pd.</td><td>32 Siswa</td><td>88.5</td><td>100% Tuntas</td></tr>
                    </tbody>
                  </table>
                </body>
              </html>
            `);
            printWindow.document.close();
            setTimeout(() => printWindow.print(), 400);
            toast.success("📄 Laporan Rekap Nilai PDF Madrasah siap dicetak!");
          }}
        >
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
            <Button size="sm" className="bg-primary text-primary-foreground font-bold" onClick={() => setIsPrintRaporOpen(true)}>
              🖨️ Pratinjau & Cetak E-Rapor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🖨️ MODAL PRATINJAU & CETAK E-RAPOR KURIKULUM MERDEKA PDF */}
      <Dialog open={isPrintRaporOpen} onOpenChange={setIsPrintRaporOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" /> Pratinjau E-Rapor Kurikulum Merdeka
              </div>
              <Badge className="bg-blue-600 text-white font-mono text-xs">{raporClass}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Format lembar dokumen E-Rapor Resmi Kurikulum Merdeka MTsN 2 Cilacap (Semester Ganjil 2025/2026).
            </DialogDescription>
          </DialogHeader>

          {/* Selector Siswa */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border text-xs">
            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">Pilih Nama Siswa</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs mt-1 font-bold"
                value={raporStudentName}
                onChange={(e) => {
                  setRaporStudentName(e.target.value);
                  if (e.target.value === "Fatimah Az-Zahra") setRaporNisn("0081928372");
                  else if (e.target.value === "Anisa Rahma") setRaporNisn("0081234002");
                  else setRaporNisn("0081928371");
                }}
              >
                <option value="Ahmad Fauzi">Ahmad Fauzi (8A)</option>
                <option value="Fatimah Az-Zahra">Fatimah Az-Zahra (8A)</option>
                <option value="Anisa Rahma">Anisa Rahma (7A)</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">NISN / NIS</Label>
              <Input value={raporNisn} onChange={(e) => setRaporNisn(e.target.value)} className="h-8 text-xs font-mono mt-1" />
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">Kelas / Rombel</Label>
              <Input value={raporClass} onChange={(e) => setRaporClass(e.target.value)} className="h-8 text-xs font-bold mt-1" />
            </div>
          </div>

          {/* DOKUMEN RESMI E-RAPOR (LEMBAR KERTAS) */}
          <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
            {/* Kop Resmi (1 Logo Sekolah) */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-4 mb-2">
                <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                <div className="text-center flex-1 pr-14">
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                  <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                </div>
              </div>
              <div className="mt-2 py-1 bg-blue-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs">
                LAPORAN HASIL BELAJAR (E-RAPOR KURIKULUM MERDEKA)
              </div>
            </div>

            {/* Identitas Siswa */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>
                <div>Nama Peserta Didik: <strong className="text-slate-950 font-bold">{raporStudentName}</strong></div>
                <div>NISN / NIS: <span className="font-mono">{raporNisn}</span></div>
                <div>Madrasah: <strong>MTsN 2 Cilacap</strong></div>
              </div>
              <div>
                <div>Kelas / Rombel: <strong>{raporClass}</strong></div>
                <div>Fase / Semester: <strong>Fase D / Ganjil</strong></div>
                <div>Tahun Ajaran: <strong>2025/2026</strong></div>
              </div>
            </div>

            {/* Tabel Nilai Capaian Hasil Belajar */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">Mata Pelajaran</th>
                    <th className="border border-slate-300 p-2 text-center">Nilai Akhir</th>
                    <th className="border border-slate-300 p-2 text-left">Capaian Pembelajaran (CP) Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  {mapelDetails.map((m, idx) => (
                    <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-mono">{idx + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">{m.mapel}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-blue-900 text-xs">{m.avg}</td>
                      <td className="border border-slate-300 p-2 text-slate-700">
                        Menunjukkan penguasaan sangat baik dalam alur {m.mapel} {m.cp}.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Catatan Wali Kelas */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1">
              <div className="font-bold text-slate-900">Catatan Wali Kelas:</div>
              <div className="text-slate-700 italic">
                "Ananda {raporStudentName} menunjukkan semangat belajar yang sangat tinggi dan tingkat kedisiplinan serta akhlak terpuji. Pertahankan kinerjamu."
              </div>
            </div>

            {/* Tanda Tangan Official */}
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Orang Tua / Wali</div>
                <div className="font-bold underline text-slate-950">( .......................... )</div>
              </div>
              <div className="text-center space-y-8">
                <div>Wali Kelas {raporClass}</div>
                <div className="font-bold underline text-slate-950">Dra. Hj. Siti Rahmah, M.Pd</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">H. Mohammad Fathoni, M.Pd</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintRaporOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5" onClick={handlePrintRapor}>
              <Download className="h-4 w-4" /> 🖨️ Cetak E-Rapor PDF
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
    { name: "Fatimah Az-Zahra", nis: "0081928373", cp: 96, tugas: 94, status: "Sangat Baik" },
    { name: "Muhammad Fairuz", nis: "0081928374", cp: 98, tugas: 95, status: "Sangat Baik" },
    { name: "Zaid bin Tsabit", nis: "0081928375", cp: 100, tugas: 98, status: "Sangat Baik" },
    { name: "Aisyah Humaira", nis: "0081928376", cp: 94, tugas: 91, status: "Tuntas KKM" },
  ];

  const rombelProgressList = [
    { name: "Kelas VII A", cp: 0, tugas: 0, walikelas: "MAULIDIA NURUL IZATI, S.Pd", total: 0 },
    { name: "Kelas VII B", cp: 0, tugas: 0, walikelas: "RINDANG FARIHA IDANA, S.Pd", total: 0 },
    { name: "Kelas VIII A", cp: 95, tugas: 90, walikelas: "SOBIYATI, S.Pd", total: 32 },
    { name: "Kelas VIII B", cp: 88, tugas: 84, walikelas: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", total: 31 },
    { name: "Kelas IX A", cp: 98, tugas: 94, walikelas: "NOVANTYA KARTIKAWATI, S.Pd", total: 32 },
    { name: "Kelas IX B", cp: 90, tugas: 86, walikelas: "INDAH NURROHMAH, S.Pd", total: 31 },
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
                    className={`h-9 w-9 rounded-xl border text-lg grid place-items-center transition ${emote === emo ? "bg-primary/20 border-primary scale-110" : "bg-muted/40 border-border hover:bg-muted"
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
  const {
    currentMonthName,
    currentYear,
    formattedTime,
    currentDayName,
    goToNextMonth,
    goToPrevMonth,
    goToToday,
    getCalendarDays,
  } = useRealtimeCalendar();

  const [filterCategory, setFilterCategory] = useState("semua");
  const [isAddAgendaOpen, setIsAddAgendaOpen] = useState(false);

  const [agendaList, setAgendaList] = useState([
    { id: "1", title: "CBT Ujian Tengah Semester (PTS) Ganjil", category: "cbt", date: "15 Agustus 2026", rawDate: "2026-08-15", desc: "Evaluasi Komputer Pertemuan 1-9 untuk seluruh rombel.", badge: "🔴 Ujian CBT" },
    { id: "2", title: "Rapat Pleno Evaluasi KBM & Kurikulum", category: "rapat", date: "18 Agustus 2026", rawDate: "2026-08-18", desc: "Rapat koordinasi Kepala Madrasah, Waka, dan Guru Pengampu.", badge: "🟣 Rapat Dinas" },
    { id: "3", title: "Gelar Karya Projek Kokurikuler P5 (Batik Cilacap)", category: "kokurikuler", date: "25 Agustus 2026", rawDate: "2026-08-25", desc: "Pameran karya seni batik dan produk wirausaha siswa.", badge: "🟡 Kokurikuler P5" },
    { id: "4", title: "Hari Libur Nasional & Peringatan HUT RI", category: "libur", date: "17 Agustus 2026", rawDate: "2026-08-17", desc: "Upacara bendera & Kegiatan peringatan kemerdekaan.", badge: "🟢 Libur Resmi" },
    { id: "5", title: "Bimbingan Sertifikasi Tahfidz Juz 30", category: "kbm", date: "01 September 2026", rawDate: "2026-09-01", desc: "Murojaah massal & ujian kelayakan tajwid siswa.", badge: "🔵 KBM Efektif" },
  ]);

  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("cbt");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [desc, setDesc] = useState("");

  const calendarDays = getCalendarDays();

  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedDate) return toast.error("Harap lengkapi judul dan tanggal agenda!");
    
    const dateObj = new Date(selectedDate);
    const dateFormatted = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    const badge = cat === "cbt" ? "🔴 Ujian CBT" : cat === "rapat" ? "🟣 Rapat Dinas" : cat === "kokurikuler" ? "🟡 Kokurikuler P5" : cat === "libur" ? "🟢 Libur Resmi" : "🔵 KBM Efektif";
    
    const newEntry = {
      id: String(Date.now()),
      title,
      category: cat,
      date: dateFormatted,
      rawDate: selectedDate,
      desc,
      badge
    };

    setAgendaList([newEntry, ...agendaList]);
    toast.success(`Agenda "${title}" berhasil ditambahkan ke Kalender Akademik!`);
    setIsAddAgendaOpen(false);
    setTitle("");
    setDesc("");
  };

  const filteredAgenda = filterCategory === "semua" ? agendaList : agendaList.filter((a) => a.category === filterCategory);

  const openAddModalForDate = (dateString: string) => {
    setSelectedDate(dateString);
    setIsAddAgendaOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" /> Agenda Madrasah & Kalender Akademik Realtime
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Jadwal kegiatan madrasah, pelaksanaan ujian CBT, rapat dinas guru, dan hari efektif KBM MTsN 2 Cilacap.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/10 text-primary font-mono font-bold text-xs gap-1.5 py-1.5 px-3">
            <Clock className="h-3.5 w-3.5 animate-pulse text-primary" /> {formattedTime}
          </Badge>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsAddAgendaOpen(true)}>
            + Tambah Agenda Baru
          </Button>
        </div>
      </div>

      {/* Grid Kalender Realtime Bulanan */}
      <Card className="border-border shadow-sm mb-6 bg-card">
        <CardHeader className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold">
                Kalender Akademik: {currentMonthName} {currentYear}
              </CardTitle>
              <CardDescription className="text-xs">
                Klik pada sel tanggal untuk menambah agenda atau melihat kegiatan yang dijadwalkan.
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-background rounded-lg p-0.5 border border-border">
              <Button size="icon" variant="ghost" className="h-8 w-8 text-xs" onClick={goToPrevMonth} title="Bulan Sebelumnya">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-bold text-xs px-2 font-mono">{currentMonthName} {currentYear}</span>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-xs" onClick={goToNextMonth} title="Bulan Berikutnya">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button size="sm" variant="secondary" className="h-8 text-xs font-semibold px-3" onClick={goToToday}>
              Hari Ini
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="border border-border rounded-xl p-3 bg-muted/10 overflow-x-auto">
            <div className="min-w-[650px]">
              {/* Header Nama Hari */}
              <div className="grid grid-cols-7 gap-1.5 text-center font-bold text-xs text-muted-foreground pb-2.5 border-b border-border">
                <div>Senin</div>
                <div>Selasa</div>
                <div>Rabu</div>
                <div>Kamis</div>
                <div>Jumat</div>
                <div>Sabtu</div>
                <div className="text-red-500">Minggu</div>
              </div>

              {/* Grid Sel Tanggal Kalender */}
              <div className="grid grid-cols-7 gap-1.5 pt-2">
                {calendarDays.map((cell, idx) => {
                  const dayEvents = agendaList.filter((a) => {
                    if (a.rawDate === cell.dateString) return true;
                    // Check date string match fallback
                    return false;
                  });

                  const isFiltered = filterCategory !== "semua";
                  const visibleEvents = isFiltered ? dayEvents.filter((a) => a.category === filterCategory) : dayEvents;

                  return (
                    <div
                      key={idx}
                      onClick={() => openAddModalForDate(cell.dateString)}
                      className={`min-h-[85px] p-1.5 rounded-lg border flex flex-col justify-between transition cursor-pointer hover:border-primary/60 hover:shadow-xs ${
                        !cell.isCurrentMonth
                          ? "bg-muted/20 border-border/40 text-muted-foreground/40 opacity-40"
                          : cell.isWeekend
                          ? "bg-muted/40 border-border/60 text-muted-foreground"
                          : "bg-background border-border"
                      } ${
                        cell.isToday
                          ? "ring-2 ring-primary shadow-sm bg-primary/10 dark:bg-primary/20 font-bold"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono ${cell.isToday ? "font-extrabold text-primary" : ""}`}>
                          {cell.dayNumber}
                        </span>
                        {cell.isToday && (
                          <Badge className="bg-primary text-primary-foreground text-[9px] px-1 py-0 h-4 font-bold">
                            Hari Ini
                          </Badge>
                        )}
                      </div>

                      {/* Display Events in Date Cell */}
                      <div className="space-y-1 my-1 overflow-hidden">
                        {visibleEvents.map((ev) => (
                          <div
                            key={ev.id}
                            title={`${ev.badge}: ${ev.title}`}
                            className={`text-[9px] font-semibold truncate px-1 py-0.5 rounded border leading-tight ${
                              ev.category === "cbt"
                                ? "bg-red-500/15 text-red-600 border-red-500/30"
                                : ev.category === "rapat"
                                ? "bg-purple-500/15 text-purple-600 border-purple-500/30"
                                : ev.category === "kokurikuler"
                                ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                                : ev.category === "libur"
                                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                                : "bg-blue-500/15 text-blue-600 border-blue-500/30"
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>

                      <div className="text-[8px] text-muted-foreground text-right opacity-60 hover:opacity-100">
                        + Tambah
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Kategori & Daftar Agenda */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Daftar Agenda & Kegiatan ({filteredAgenda.length})</h2>
      </div>

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

      {/* Grid Cards Agenda */}
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
                <Label className="text-xs font-semibold">Tanggal Kegiatan</Label>
                <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required className="mt-1 text-xs" />
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
    { class: "Kelas VII A", total: 32, mutqin: "28 Siswa (87.5%)", avgScore: 92.4, status: "Sangat Baik", topStudent: "Ahmad Fauzi" },
    { class: "Kelas VII B", total: 32, mutqin: "26 Siswa (81.2%)", avgScore: 89.8, status: "Baik", topStudent: "Siti Nurhaliza" },
    { class: "Kelas VIII A", total: 32, mutqin: "30 Siswa (93.7%)", avgScore: 95.1, status: "Sangat Baik", topStudent: "Muhammad Rayhan" },
    { class: "Kelas VIII B", total: 31, mutqin: "27 Siswa (87.0%)", avgScore: 91.2, status: "Sangat Baik", topStudent: "Fatimah Az-Zahra" },
    { class: "Kelas IX A", total: 32, mutqin: "32 Siswa (100%)", avgScore: 97.5, status: "Sangat Baik", topStudent: "Zaid bin Tsabit" },
    { class: "Kelas IX B", total: 31, mutqin: "29 Siswa (93.5%)", avgScore: 93.8, status: "Sangat Baik", topStudent: "Aisyah Humaira" },
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
              <div className="text-2xl font-extrabold font-mono text-blue-500">93.3 (Sangat Baik)</div>
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

  const [isPrintP5ModalOpen, setIsPrintP5ModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("p1");

  const activeProject = projectsList.find((p) => p.id === selectedProjectId) || projectsList[0];

  const handlePrintP5 = () => {
    window.print();
    toast.success(`🖨️ Laporan Portofolio P5 (${activeProject.title}) berhasil dicetak!`);
  };

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
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white" onClick={() => setIsPrintP5ModalOpen(true)}>
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
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="h-7 text-xs font-bold border-purple-500/40 text-purple-600 dark:text-purple-300" onClick={() => { setSelectedProjectId(p.id); setIsPrintP5ModalOpen(true); }}>
                    🖨️ Pratinjau Portfolio
                  </Button>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 font-bold text-xs shrink-0">
                    {p.status}
                  </Badge>
                </div>
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

      {/* 🖨️ MODAL PRATINJAU CETAK PORTFOLIO P5 / PPA-RA PDF */}
      <Dialog open={isPrintP5ModalOpen} onOpenChange={setIsPrintP5ModalOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-purple-600" /> Pratinjau Portofolio P5 & PPA-RA
              </div>
              <Badge className="bg-purple-600 text-white text-xs">{activeProject.target}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Format Laporan Portofolio Capaian Projek Penguatan Profil Pelajar Pancasila & Rahmatan Lil Alamin.
            </DialogDescription>
          </DialogHeader>

          {/* Selector Projek */}
          <div className="p-3 bg-muted/40 rounded-xl border border-border text-xs">
            <Label className="text-[11px] font-semibold text-muted-foreground">Pilih Tema Projek P5</Label>
            <select
              className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs mt-1 font-bold"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
            >
              {projectsList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.target})
                </option>
              ))}
            </select>
          </div>

          {/* DOKUMEN RESMI PORTOFOLIO P5 (LEMBAR KERTAS) */}
          <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
            {/* Kop Resmi (1 Logo Sekolah) */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-4 mb-2">
                <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                <div className="text-center flex-1 pr-14">
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                  <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                </div>
              </div>
              <div className="mt-2 py-1 bg-purple-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs">
                PORTOFOLIO CAPAIAN PROJEK P5 & PPA-RA
              </div>
            </div>

            {/* Identitas Projek */}
            <div className="bg-slate-50 p-3 rounded-md border border-slate-200 text-xs space-y-1 text-slate-800 font-medium">
              <div>Nama Projek: <strong className="text-purple-900 font-bold">{activeProject.title}</strong></div>
              <div>Sasaran Tingkat: <strong>{activeProject.target}</strong></div>
              <div>Koordinator Projek: <strong>{activeProject.coordinator}</strong> • Total Siswa: <strong>{activeProject.studentsCount} Siswa</strong></div>
              <div>Status Pencapaian: <strong className="text-emerald-700 font-bold">{activeProject.status} ({activeProject.progress}% Tuntas)</strong></div>
            </div>

            {/* Rubrik Penilaian Dimensi Pancasila */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Tabel Rubrik Penilaian Dimensi Pelajar Pancasila:</div>
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-left">Dimensi / Elemen Profil</th>
                    <th className="border border-slate-300 p-2 text-center">Tingkat Capaian</th>
                    <th className="border border-slate-300 p-2 text-left">Deskripsi Hasil Observasi Projek</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-bold">Beriman, Bertakwa & Berakhlak Mulia</td>
                    <td className="border border-slate-300 p-2 text-center text-emerald-700 font-bold">Sangat Berkembang</td>
                    <td className="border border-slate-300 p-2 text-slate-700">Siswa konsisten menerapkan akhlak lingkungan & kepedulian sosial.</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-bold">Gotong Royong & Kolaborasi</td>
                    <td className="border border-slate-300 p-2 text-center text-emerald-700 font-bold">Sangat Berkembang</td>
                    <td className="border border-slate-300 p-2 text-slate-700">Aktif bekerja sama dalam tim pembuatan produk & gelar karya.</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="border border-slate-300 p-2 font-bold">Kreativitas & Inovasi Produk</td>
                    <td className="border border-slate-300 p-2 text-center text-purple-700 font-bold">Berkembang Sesuai Harapan</td>
                    <td className="border border-slate-300 p-2 text-slate-700">Mampu menghasilkan karya inovatif yang memiliki nilai ekonomi.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Produk Gelar Karya */}
            <div className="pt-1">
              <div className="text-xs font-bold text-slate-900 mb-1">Produk Hasil Gelar Karya Siswa:</div>
              <div className="flex flex-wrap gap-1.5">
                {activeProject.outcomes.map((out, idx) => (
                  <span key={idx} className="bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-xs text-[11px] font-semibold">
                    ✨ {out}
                  </span>
                ))}
              </div>
            </div>

            {/* Tanda Tangan Official */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Koordinator Projek P5</div>
                <div className="font-bold underline text-slate-950">{activeProject.coordinator}</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Kepala MTsN 2 Cilacap</div>
                <div className="font-bold underline text-slate-950">H. Mohammad Fathoni, M.Pd</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintP5ModalOpen(false)}>
              Tutup
            </Button>
            <Button type="button" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-1.5" onClick={handlePrintP5}>
              <Download className="h-4 w-4" /> 🖨️ Cetak Portofolio P5 PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

  // Modal Input Setoran State
  const [isOpen, setIsOpen] = useState(false);
  const [surah, setSurah] = useState("An-Naba'");
  const [ayat, setAyat] = useState("1 - 20");
  const [status, setStatus] = useState("Lancar");
  const [nilai, setNilai] = useState("90 (Jayyid Jiddan)");
  const [ustadz, setUstadz] = useState("Ust. Abdul Halim, S.Ag");

  // Modal Cetak Kartu Murojaah State
  const [isPrintCardOpen, setIsPrintCardOpen] = useState(false);
  const [printStudentName, setPrintStudentName] = useState("Ahmad Fauzi");
  const [printNisn, setPrintNisn] = useState("0081928371");
  const [printClass, setPrintClass] = useState("8A (VIII A)");

  const handleAddHafalan = (e: React.FormEvent) => {
    e.preventDefault();
    setHafalanList([
      { id: String(Date.now()), juz: selectedJuz, s: surah, ayat, status, nilai, ustadz, tgl: "Hari ini", murojaah: status === "Mutqin" ? "Mutqin 🔵" : "Lancar 🟢" },
      ...hafalanList,
    ]);
    toast.success(`Setoran QS. ${surah} (${ayat}) berhasil dicatat pada ${selectedJuz}!`);
    setIsOpen(false);
  };

  const handlePrintCard = () => {
    window.print();
    toast.success(`🖨️ Cetak Kartu Murojaah (${printStudentName} - ${selectedJuz}) berhasil diproses!`);
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
            Monitoring Target Hafalan, Setoran Ayat, Evaluasi Tajwid, & Pratinjau Cetak Kartu Murojaah MTsN 2 Cilacap
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" onClick={() => setIsPrintCardOpen(true)}>
            <Download className="h-3.5 w-3.5" /> 🖨️ Cetak Kartu Murojaah PDF
          </Button>
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground" onClick={() => setIsOpen(true)}>
            + Input Setoran Hafalan Baru
          </Button>
        </div>
      </div>

      {/* Target Progress Hafalan Card */}
      <Card className="border-border shadow-xs mb-6 bg-linear-to-r from-primary/15 via-card to-card">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Capaian Target Hafalan ({selectedJuz})</div>
            <div className="text-xl font-extrabold text-foreground">Target Hafalan: 85% Tuntas (Mutqin)</div>
            <div className="text-xs text-muted-foreground">Telah menyetorkan 12 dari 37 Surah di {selectedJuz} dengan Tajwid & Makhraj Mumtaz.</div>
          </div>
          <Button size="sm" className="text-xs font-bold shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" onClick={() => setIsPrintCardOpen(true)}>
            <Download className="h-3.5 w-3.5" /> Pratinjau & Cetak Kartu Murojaah
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

      {/* 🖨️ MODAL PRATINJAU & CETAK KARTU MUROJAAH PDF */}
      <Dialog open={isPrintCardOpen} onOpenChange={setIsPrintCardOpen}>
        <DialogContent className="sm:max-w-3xl border-border bg-card p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b border-border pb-3">
            <DialogTitle className="text-lg font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookMarked className="h-5 w-5 text-emerald-600" /> Pratinjau Cetak Kartu Murojaah & Setoran Tahfidz
              </div>
              <Badge className="bg-emerald-600 text-white font-mono text-xs">{selectedJuz}</Badge>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Format lembar dokumen resmi Kartu Murojaah & Rekapitulasi Setoran Hafalan Al-Qur'an MTsN 2 Cilacap.
            </DialogDescription>
          </DialogHeader>

          {/* Form Pengaturan Data Cetak */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-xl border border-border text-xs">
            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">Pilih Nama Siswa</Label>
              <select
                className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs mt-1 font-bold"
                value={printStudentName}
                onChange={(e) => {
                  setPrintStudentName(e.target.value);
                  if (e.target.value === "Fatimah Az-Zahra") setPrintNisn("0081928372");
                  else if (e.target.value === "Anisa Rahma") setPrintNisn("0081234002");
                  else setPrintNisn("0081928371");
                }}
              >
                <option value="Ahmad Fauzi">Ahmad Fauzi (8A)</option>
                <option value="Fatimah Az-Zahra">Fatimah Az-Zahra (8A)</option>
                <option value="Anisa Rahma">Anisa Rahma (7A)</option>
              </select>
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">NISN / NIS</Label>
              <Input value={printNisn} onChange={(e) => setPrintNisn(e.target.value)} className="h-8 text-xs font-mono mt-1" />
            </div>

            <div>
              <Label className="text-[11px] font-semibold text-muted-foreground">Kelas / Rombel</Label>
              <Input value={printClass} onChange={(e) => setPrintClass(e.target.value)} className="h-8 text-xs font-bold mt-1" />
            </div>
          </div>

          {/* DOKUMEN RESMI KARTU MUROJAAH TAHFIDZ (LEMBAR KERTAS) */}
          <div className="p-6 bg-white text-slate-950 rounded-xl border border-slate-300 shadow-md font-sans space-y-4">
            {/* Kop Resmi Madrasah (1 Logo Sekolah) */}
            <div className="border-b-2 border-slate-900 pb-3">
              <div className="flex items-center gap-4 mb-2">
                <img src="/logomts.png" alt="Logo MTsN 2 Cilacap" className="h-14 w-14 object-contain shrink-0" />
                <div className="text-center flex-1 pr-14">
                  <div className="text-[11px] font-bold tracking-wider text-slate-700 uppercase">KEMENTERIAN AGAMA REPUBLIK INDONESIA</div>
                  <div className="text-base font-black tracking-wide text-slate-900 uppercase">MADRASAH TSANAWIYAH NEGERI 2 CILACAP</div>
                  <div className="text-[10px] text-slate-600">Jl. Raya Sindangbarang KM.4 Karangpucung Kode Pos 53255</div>
                </div>
              </div>
              <div className="mt-2 py-1 bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-xs">
                KARTU SETORAN HAFALAN & MUROJAAH TAHFIDZ AL-QUR'AN
              </div>
            </div>

            {/* Identitas Santri / Siswa */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-3 rounded-md border border-slate-200">
              <div>
                <div>Nama Siswa: <strong className="text-slate-950 font-bold">{printStudentName}</strong></div>
                <div>NISN / NIS: <span className="font-mono">{printNisn}</span></div>
              </div>
              <div>
                <div>Kelas / Rombel: <strong>{printClass}</strong></div>
                <div>Target Juz: <strong className="text-emerald-700 font-extrabold">{selectedJuz}</strong></div>
              </div>
            </div>

            {/* Tabel Setoran Hafalan & Murojaah */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px] border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="border border-slate-300 p-2 text-center w-8">No</th>
                    <th className="border border-slate-300 p-2 text-left">Nama Surah</th>
                    <th className="border border-slate-300 p-2 text-left">Cakupan Ayat</th>
                    <th className="border border-slate-300 p-2 text-center">Nilai Tajwid</th>
                    <th className="border border-slate-300 p-2 text-center">Status Murojaah</th>
                    <th className="border border-slate-300 p-2 text-left">Penguji</th>
                    <th className="border border-slate-300 p-2 text-center w-16">Paraf</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHafalan.map((h, i) => (
                    <tr key={h.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="border border-slate-300 p-2 text-center font-mono">{i + 1}</td>
                      <td className="border border-slate-300 p-2 font-bold">QS. {h.s}</td>
                      <td className="border border-slate-300 p-2">{h.ayat}</td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-emerald-800">{h.nilai}</td>
                      <td className="border border-slate-300 p-2 text-center font-semibold">{h.status}</td>
                      <td className="border border-slate-300 p-2 text-slate-700">{h.ustadz}</td>
                      <td className="border border-slate-300 p-2 text-center font-mono text-[10px] text-slate-400">✓ Valid</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tanda Tangan Official */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-4 text-slate-800 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Orang Tua / Wali Siswa</div>
                <div className="font-bold underline text-slate-950">( ............................................ )</div>
              </div>
              <div className="text-center space-y-8">
                <div>Cilacap, 11 Agustus 2026<br />Ustadz / Penguji Tahfidz</div>
                <div className="font-bold underline text-slate-950">Ust. Abdul Halim, S.Ag</div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex justify-between items-center w-full">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsPrintCardOpen(false)}>
              Tutup
            </Button>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5" onClick={handlePrintCard}>
                <Download className="h-4 w-4" /> 🖨️ Cetak Kartu Murojaah PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------- MODUL MANAJEMEN KELAS & ROMBEL (TABEL HIRARKI DATA) ---------- */
function ManajemenKelas({ activeRole }: { activeRole?: string }) {
  const [gradeFilter, setGradeFilter] = useState<"Semua" | "VII" | "VIII" | "IX">("Semua");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRombelId, setExpandedRombelId] = useState<string | null>("r-8a");

  // Initial Rombel Master Data with LocalStorage persistence (v3 for real MySQL student sync)
  const [rombelList, setRombelList] = useState(() => {
    const defaultRombels = [
      {
        id: "r-7a",
        grade: "VII",
        name: "7A",
        room: "Ruang R-101",
        waliKelas: "MAULIDIA NURUL IZATI, S.Pd",
        capacity: 32,
        tahunAjaran: "2025/2026 Ganjil",
        presensiPct: 0.0,
        ewsAlertCount: 0,
        students: [],
        teachers: [
          { mapel: "Al Qur'an Hadis", teacher: "AH. SYARIF HIDAYAH, S.Pd.I" },
          { mapel: "Bahasa Arab", teacher: "ENDAH SUPRIHATIN, S.Pd" },
          { mapel: "Matematika", teacher: "SAYONO, S.Pd., M.Pd." },
        ],
      },
      {
        id: "r-7b",
        grade: "VII",
        name: "7B",
        room: "Ruang R-102",
        waliKelas: "RINDANG FARIHA IDANA, S.Pd",
        capacity: 32,
        tahunAjaran: "2025/2026 Ganjil",
        presensiPct: 0.0,
        ewsAlertCount: 0,
        students: [],
        teachers: [
          { mapel: "Bahasa Jawa", teacher: "RINDANG FARIHA IDANA, S.Pd" },
          { mapel: "Bahasa Indonesia", teacher: "DAISAH, S.Pd" },
        ],
      },
      {
        id: "r-8a",
        grade: "VIII",
        name: "8A",
        room: "Ruang R-201",
        waliKelas: "SOBIYATI, S.Pd",
        capacity: 32,
        tahunAjaran: "2025/2026 Ganjil",
        presensiPct: 98.2,
        ewsAlertCount: 0,
        students: [],
        teachers: [
          { mapel: "Matematika", teacher: "SAYONO, S.Pd., M.Pd." },
          { mapel: "Fikih", teacher: "CARYATI," },
          { mapel: "IPA Terpadu", teacher: "NOVANTYA KARTIKAWATI, S.Pd" },
          { mapel: "Bahasa Inggris", teacher: "RIDHO ANSHORI, S.Pd., M.Pd" },
        ],
      },
      {
        id: "r-8b",
        grade: "VIII",
        name: "8B",
        room: "Ruang R-202",
        waliKelas: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd",
        capacity: 32,
        tahunAjaran: "2025/2026 Ganjil",
        presensiPct: 95.8,
        ewsAlertCount: 0,
        students: [],
        teachers: [
          { mapel: "Bahasa Inggris", teacher: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd" },
          { mapel: "Fikih", teacher: "CARYATI," },
        ],
      },
      {
        id: "r-9a",
        grade: "IX",
        name: "9A",
        room: "Ruang R-301",
        waliKelas: "NOVANTYA KARTIKAWATI, S.Pd",
        capacity: 35,
        tahunAjaran: "2025/2026 Ganjil",
        presensiPct: 97.0,
        ewsAlertCount: 0,
        students: [],
        teachers: [
          { mapel: "IPA Terpadu", teacher: "NOVANTYA KARTIKAWATI, S.Pd" },
          { mapel: "Matematika", teacher: "SAYONO, S.Pd., M.Pd." },
        ],
      },
      {
        id: "r-9b",
        grade: "IX",
        name: "9B",
        room: "Ruang R-302",
        waliKelas: "INDAH NURROHMAH, S.Pd",
        capacity: 32,
        tahunAjaran: "2025/2026 Ganjil",
        presensiPct: 96.0,
        ewsAlertCount: 0,
        students: [],
        teachers: [
          { mapel: "Bahasa Inggris", teacher: "INDAH NURROHMAH, S.Pd" },
        ],
      },
    ];

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lms_rombel_management_v4");
        if (saved) return JSON.parse(saved);
        localStorage.removeItem("lms_rombel_management_v1");
        localStorage.removeItem("lms_rombel_management_v2");
        localStorage.removeItem("lms_rombel_management_v3");
        localStorage.setItem("lms_rombel_management_v4", JSON.stringify(defaultRombels));
      } catch (e) {}
    }
    return defaultRombels;
  });

  useEffect(() => {
    MysqlDataService.getUsers().then((users) => {
      const siswaList = users.filter((u) => u.role === "siswa");
      if (siswaList.length > 0) {
        const normalizeClassKey = (str: string) => {
          let c = (str || "").toUpperCase().replace("KELAS", "").replace("-", "").replace(/\s+/g, "").trim();
          return c.replace("VIII", "8").replace("IX", "9").replace("VII", "7");
        };

        const grouped: Record<string, any[]> = {};
        siswaList.forEach((s, idx) => {
          const norm = normalizeClassKey(s.class_name || "");
          if (!grouped[norm]) grouped[norm] = [];
          grouped[norm].push({
            id: s.id || `s-${s.nis_nip}`,
            nisn: s.nis_nip,
            name: s.full_name,
            gender: idx % 2 === 0 ? "L" : "P",
            parentWa: (s as any).phone || "081234567890",
            kkmStatus: "TUNTAS (90)",
          });
        });

        setRombelList((prev: any[]) => {
          const updated = prev.map((r: any) => {
            const rNorm = normalizeClassKey(r.name || "");
            const realSt = grouped[rNorm] || [];
            return {
              ...r,
              students: realSt,
            };
          });
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("lms_rombel_management_v4", JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });
      }
    });
  }, []);

  const saveRombelToStorage = (list: any[]) => {
    setRombelList(list);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lms_rombel_management_v4", JSON.stringify(list));
      } catch (e) {}
    }
  };

  // Dialog States
  const [isAddRombelOpen, setIsAddRombelOpen] = useState(false);
  const [rombelNameInput, setRombelNameInput] = useState("");
  const [gradeInput, setGradeInput] = useState<"VII" | "VIII" | "IX">("VIII");
  const [roomInput, setRoomInput] = useState("Ruang R-203");
  const [waliKelasInput, setWaliKelasInput] = useState("Bpk. Hendra Wijaya, M.Sc");
  const [capacityInput, setCapacityInput] = useState(32);

  // Student Plotting Modal State
  const [isPlottingOpen, setIsPlottingOpen] = useState(false);
  const [targetRombelForPlotting, setTargetRombelForPlotting] = useState<any>(null);
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentNisn, setNewStudentNisn] = useState("");
  const [newStudentWa, setNewStudentWa] = useState("081234567890");

  // WA Broadcast Modal State
  const [isWaBroadcastOpen, setIsWaBroadcastOpen] = useState(false);
  const [targetRombelForWa, setTargetRombelForWa] = useState<any>(null);
  const [waSubject, setWaSubject] = useState("Pengumuman Rapat Orang Tua & Rekap Presensi");
  const [waMessage, setWaMessage] = useState("Assalamu'alaikum Wr. Wb. Bpk/Ibu Orang Tua Siswa, kami sampaikan rekapitulasi presensi & kegiatan KBM siswa di rombel ini.");

  // Edit Student User Modal State
  const [editingStudent, setEditingStudent] = useState<{
    rombelId: string;
    id: string;
    nisn: string;
    name: string;
    gender: "L" | "P";
    parentWa: string;
    kkmStatus: string;
  } | null>(null);

  const handleSaveEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await MysqlDataService.updateUserProfile({
        id: editingStudent.id,
        fullName: editingStudent.name,
        email: `${editingStudent.nisn}@siswa.mtsn2cilacap.sch.id`,
        nipNis: editingStudent.nisn,
        phone: editingStudent.parentWa,
      });

      const updated = rombelList.map((r: any) => {
        if (r.id !== editingStudent.rombelId) return r;
        return {
          ...r,
          students: r.students.map((s: any) => (s.id === editingStudent.id ? { ...s, ...editingStudent } : s)),
        };
      });

      saveRombelToStorage(updated);
      toast.success(`✅ Data user siswa ${editingStudent.name} (NISN: ${editingStudent.nisn}) berhasil disimpan ke Database MySQL!`);
      setEditingStudent(null);
    } catch (err) {
      toast.error("Gagal memperbarui data user siswa.");
    }
  };

  // Add Rombel Handler
  const handleCreateRombel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rombelNameInput.trim()) return toast.error("Nama Rombel tidak boleh kosong!");

    const newRombel = {
      id: `r-${Date.now()}`,
      grade: gradeInput,
      name: rombelNameInput.trim().toUpperCase(),
      room: roomInput.trim(),
      waliKelas: waliKelasInput.trim(),
      capacity: Number(capacityInput) || 32,
      tahunAjaran: "2025/2026 Ganjil",
      presensiPct: 98.0,
      ewsAlertCount: 0,
      students: [],
      teachers: [{ mapel: "Fikih", teacher: "Ahmad Fauzi, S.Ag" }],
    };

    const updated = [...rombelList, newRombel];
    saveRombelToStorage(updated);
    toast.success(`🎉 Rombel Kelas ${newRombel.name} (${newRombel.grade}) berhasil dibuat!`);
    setIsAddRombelOpen(false);
    setRombelNameInput("");
  };

  // Add Student to Rombel Handler
  const handleAddStudentToRombel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return toast.error("Nama siswa tidak boleh kosong!");
    if (!targetRombelForPlotting) return;

    const newStudentObj = {
      id: `s-${Date.now()}`,
      nisn: newStudentNisn.trim() || `0081${Math.floor(100000 + Math.random() * 900000)}`,
      name: newStudentName.trim(),
      gender: "L",
      parentWa: newStudentWa.trim() || "081234567890",
      kkmStatus: "TUNTAS (85)",
    };

    const updated = rombelList.map((r: any) => {
      if (r.id !== targetRombelForPlotting.id) return r;
      return {
        ...r,
        students: [newStudentObj, ...r.students],
      };
    });

    saveRombelToStorage(updated);
    toast.success(`🎓 Siswa ${newStudentName} berhasil di-plotting ke Rombel ${targetRombelForPlotting.name}!`);
    setNewStudentName("");
    setNewStudentNisn("");
  };

  // Remove Student from Rombel Handler
  const handleRemoveStudent = (rombelId: string, studentId: string, studentName: string) => {
    const updated = rombelList.map((r: any) => {
      if (r.id !== rombelId) return r;
      return {
        ...r,
        students: r.students.filter((s: any) => s.id !== studentId),
      };
    });
    saveRombelToStorage(updated);
    toast.info(`Siswa ${studentName} dikeluarkan dari rombel.`);
  };

  const activeUserSession = MysqlAuthService.getActiveUser();
  const isWaliKelas = activeRole === "walikelas" || activeRole === "wali_kelas";
  const isManagement = activeRole === "admin" || activeRole === "admin_akademik" || activeRole === "kamad" || activeRole === "waka";

  // If user is Wali Kelas (and not Management), scope to their assigned Rombel only!
  const myWaliRombel = useMemo(() => {
    if (!isWaliKelas || isManagement) return null;
    const userName = (activeUserSession?.full_name || "").toLowerCase().trim();
    const userNip = (activeUserSession?.nis_nip || "").trim();
    const userAssignedClass = ((activeUserSession as any)?.assigned_class || "").toUpperCase().trim();

    // 1. Try matching assignedClass from database session
    if (userAssignedClass) {
      const matchByClass = rombelList.find((r: any) => {
        const cleanName = (r.name || "").toUpperCase().replace("-", "").replace(/\s+/g, "");
        const cleanAssigned = userAssignedClass.toUpperCase().replace("-", "").replace(/\s+/g, "");
        return cleanName.includes(cleanAssigned) || cleanAssigned.includes(cleanName);
      });
      if (matchByClass) return matchByClass;
    }

    // 2. Try matching user name or NIP against r.waliKelas
    if (userName) {
      const matchByName = rombelList.find((r: any) => {
        const rWali = (r.waliKelas || "").toLowerCase();
        return (userName.length >= 3 && rWali.includes(userName)) || (userNip && rWali.includes(userNip));
      });
      if (matchByName) return matchByName;
    }

    return rombelList[0] || null;
  }, [isWaliKelas, isManagement, activeUserSession, rombelList]);

  // Auto-expand Wali Kelas's own rombel on mount or mode change
  useEffect(() => {
    if (isWaliKelas && !isManagement && myWaliRombel) {
      setExpandedRombelId(myWaliRombel.id);
    }
  }, [isWaliKelas, isManagement, myWaliRombel]);

  // Send WA Broadcast Handler
  const handleSendWaBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRombelForWa) return;

    const totalParents = targetRombelForWa.students.length;
    MysqlDataService.saveWaLog({
      parent_name: `Seluruh Orang Tua Rombel ${targetRombelForWa.name}`,
      phone: "081234567890 (Broadcast Rombel)",
      student_name: `Rombel ${targetRombelForWa.name}`,
      category: "BROADCAST ROMBEL",
      message: `[BROADCAST WA ROMBEL ${targetRombelForWa.name}]: ${waSubject}\n\n${waMessage}`,
      status: "TERKIRIM",
    }).catch(() => {});

    toast.success(`📱 Broadcast WhatsApp Berhasil Dikirim ke ${totalParents} Orang Tua Siswa Rombel ${targetRombelForWa.name}!`, {
      description: "Log pengiriman tercatat di EWS WA Gateway System.",
    });
    setIsWaBroadcastOpen(false);
  };

  // Grouping Rombel by Level 1 Grade (VII, VIII, IX)
  const gradesOrder: ("VII" | "VIII" | "IX")[] = ["VII", "VIII", "IX"];
  const filteredRombels = rombelList.filter((r: any) => {
    // 🛡️ Data Scoping for Wali Kelas: restrict to assigned rombel only
    if (isWaliKelas && !isManagement && myWaliRombel) {
      if (r.id !== myWaliRombel.id) return false;
    }

    const matchGrade = gradeFilter === "Semua" || r.grade === gradeFilter;
    const matchSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.waliKelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.students.some((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchGrade && matchSearch;
  });

  // Calculations for Summary Badges
  const totalRombel = filteredRombels.length;
  const totalStudents = filteredRombels.reduce((acc: number, r: any) => acc + r.students.length, 0);
  const totalEwsAlerts = filteredRombels.reduce((acc: number, r: any) => acc + r.ewsAlertCount, 0);

  return (
    <div className="space-y-6">
      <SectionHeader
        title={isWaliKelas && !isManagement ? `Manajemen Rombel ${myWaliRombel?.name || "8A"} (Mode Wali Kelas)` : "Manajemen Kelas & Plotting Rombong Belajar (Tabel Hirarki Data)"}
        sub={
          isWaliKelas && !isManagement
            ? `Portal pengelolaan khusus Wali Kelas untuk Rombel ${myWaliRombel?.name || "8A"} (${myWaliRombel?.room || "Ruang R-201"}) MTsN 2 Cilacap`
            : "Pengelolaan hirarki kelas (VII, VIII, IX), penugasan wali kelas & guru mapel, plotting siswa, serta broadcast WA Gateway per rombel MTsN 2 Cilacap"
        }
      />

      {/* Mode Wali Kelas Info Banner */}
      {isWaliKelas && !isManagement && (
        <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-800 dark:text-blue-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0 font-bold text-base">
              📋
            </div>
            <div>
              <div className="font-extrabold text-sm text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <span>Perspektif Wali Kelas Aktif</span>
                <Badge className="bg-blue-600 text-white font-bold text-[10px] px-2">ROMBEL {myWaliRombel?.name || "8A"}</Badge>
              </div>
              <p className="text-xs text-blue-700/90 dark:text-blue-300/90 mt-0.5">
                Anda hanya memiliki akses mengelola siswa, presensi, dan WhatsApp broadcast untuk Rombel <strong>{myWaliRombel?.name || "8A"}</strong> ({myWaliRombel?.waliKelas}).
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] font-bold border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300 shrink-0">
            ✓ Data Terisolasi Mandiri
          </Badge>
        </div>
      )}

      {/* Top Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 font-bold">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Rombel Aktif</div>
              <div className="text-lg font-extrabold text-foreground">{totalRombel} Rombel</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shrink-0 font-bold">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Total Siswa Terplotting</div>
              <div className="text-lg font-extrabold text-foreground">{totalStudents} Siswa</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 grid place-items-center shrink-0 font-bold">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">Wali Kelas Terisi</div>
              <div className="text-lg font-extrabold text-foreground">{totalRombel} Wali Kelas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-2xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center shrink-0 font-bold">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground font-medium">EWS Perlu Pembinaan</div>
              <div className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{totalEwsAlerts} Siswa</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Hierarchy Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Matriks Hirarki Kelas & Rombel
            </CardTitle>
            <CardDescription className="text-xs">
              Struktur hirarki 3 tingkat: Tingkat Kelas (VII - IX) ➔ Baris Rombel ➔ Tabel Lipat Anggota Siswa & Guru.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Cari rombel, wali kelas, siswa..."
                className="pl-9 h-9 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {(!isWaliKelas || isManagement) && (
              <Button size="sm" className="gap-1.5 shrink-0 bg-primary text-primary-foreground font-bold" onClick={() => setIsAddRombelOpen(true)}>
                + Buat Rombel Baru
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {/* Grade Filter Bar */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-muted/40 rounded-xl border border-border/80">
            {(["Semua", "VII", "VIII", "IX"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGradeFilter(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  gradeFilter === g
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <span>{g === "Semua" ? "🌐 Semua Tingkat" : `🎓 Kelas ${g}`}</span>
                <Badge variant="secondary" className="text-[10px] bg-background/80 text-foreground font-extrabold px-1.5 py-0.2">
                  {g === "Semua" ? rombelList.length : rombelList.filter((r: any) => r.grade === g).length}
                </Badge>
              </button>
            ))}
          </div>

          {/* TABEL HIRARKI DATA (LEVEL 1: TINGKAT KELAS ➔ LEVEL 2: ROMBEL ➔ LEVEL 3: SISWA) */}
          <div className="space-y-6">
            {gradesOrder
              .filter((g) => gradeFilter === "Semua" || gradeFilter === g)
              .map((gradeVal) => {
                const rombelsInGrade = filteredRombels.filter((r: any) => r.grade === gradeVal);
                if (rombelsInGrade.length === 0) return null;

                return (
                  <div key={gradeVal} className="rounded-xl border border-border/80 overflow-hidden shadow-2xs">
                    {/* LEVEL 1: HEADER BANNER TINGKAT KELAS */}
                    <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 p-3 sm:px-4 text-white flex items-center justify-between border-b border-emerald-500/30">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500 text-slate-950 font-black text-xs px-2.5 py-0.5">
                          TINGKAT {gradeVal}
                        </Badge>
                        <span className="font-extrabold text-sm text-emerald-100">
                          Kelas {gradeVal} MTsN 2 Cilacap ({rombelsInGrade.length} Rombel)
                        </span>
                      </div>
                      <div className="text-xs text-emerald-200/80 font-mono">
                        Tahun Ajaran 2025/2026 Ganjil
                      </div>
                    </div>

                    {/* LEVEL 2 & LEVEL 3: TABEL HIRARKI DATA ROMBEL & NESTED SISWA */}
                    <div className="overflow-x-auto bg-card">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-muted/60 text-left border-b border-border text-muted-foreground font-bold">
                            <th className="py-2.5 px-3">Rombel & Ruangan</th>
                            <th className="py-2.5 px-3">Wali Kelas Pengampu</th>
                            <th className="py-2.5 px-3">Kapasitas & Kuota</th>
                            <th className="py-2.5 px-3">Presensi & EWS KKM</th>
                            <th className="py-2.5 px-3 text-center">Detail Lipat</th>
                            <th className="py-2.5 px-3 text-right">Kontrol & Aksi Rombel</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {rombelsInGrade.map((r: any) => {
                            const isExpanded = expandedRombelId === r.id;
                            const isFull = r.students.length >= r.capacity;

                            return (
                              <Fragment key={r.id}>
                                {/* LEVEL 2 ROW: ROMBEL BARIS DATA */}
                                <tr className={`hover:bg-muted/30 transition ${isExpanded ? "bg-muted/20" : ""}`}>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold grid place-items-center">
                                        {r.name}
                                      </div>
                                      <div>
                                        <div className="font-extrabold text-sm text-foreground">Rombel {r.name}</div>
                                        <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                          <span>🏢 {r.room}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-bold text-foreground flex items-center gap-1.5">
                                      <UserCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                                      {r.waliKelas}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">Wali Kelas Resmi</div>
                                  </td>

                                  <td className="py-3 px-3 font-medium">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-foreground">{r.students.length} / {r.capacity} Siswa</span>
                                      {isFull ? (
                                        <Badge variant="outline" className="text-[9px] bg-red-500/15 text-red-600 border-red-500/30">Penuh</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Tersedia</Badge>
                                      )}
                                    </div>
                                    <div className="w-28 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                                      <div
                                        className="bg-emerald-500 h-full rounded-full"
                                        style={{ width: `${Math.min(100, (r.students.length / r.capacity) * 100)}%` }}
                                      />
                                    </div>
                                  </td>

                                  <td className="py-3 px-3">
                                    <div className="font-bold text-emerald-600 dark:text-emerald-400">
                                      {r.presensiPct}% Hadir
                                    </div>
                                    {r.ewsAlertCount > 0 ? (
                                      <Badge variant="outline" className="text-[9px] bg-amber-500/15 text-amber-600 border-amber-500/30 font-bold">
                                        ⚠️ {r.ewsAlertCount} Siswa Perlu Pembinaan
                                      </Badge>
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground">✓ KKM & Presensi Aman</span>
                                    )}
                                  </td>

                                  <td className="py-3 px-3 text-center">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs font-bold gap-1 text-primary hover:bg-primary/10"
                                      onClick={() => setExpandedRombelId(isExpanded ? null : r.id)}
                                    >
                                      {isExpanded ? <ChevronDown className="h-4 w-4 rotate-180 transition-transform" /> : <ChevronDown className="h-4 w-4 transition-transform" />}
                                      <span>{isExpanded ? "Tutup" : `Lihat Siswa (${r.students.length})`}</span>
                                    </Button>
                                  </td>

                                  <td className="py-3 px-3 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[11px] font-bold gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                                        onClick={() => {
                                          setTargetRombelForPlotting(r);
                                          setIsPlottingOpen(true);
                                        }}
                                      >
                                        🎓 Plotting Siswa
                                      </Button>

                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-[11px] font-bold gap-1 border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                                        onClick={() => {
                                          setTargetRombelForWa(r);
                                          setIsWaBroadcastOpen(true);
                                        }}
                                      >
                                        <Send className="h-3 w-3 text-blue-500" /> WA Rombel
                                      </Button>
                                    </div>
                                  </td>
                                </tr>

                                {/* LEVEL 3 NESTED EXPANDABLE TABLE: SISWA & GURU MAPEL ANGGOTA ROMBEL */}
                                {isExpanded && (
                                  <tr className="bg-muted/15">
                                    <td colSpan={6} className="p-3 sm:px-6">
                                      <div className="p-4 rounded-xl bg-background border border-border/80 shadow-xs space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                                          <div className="font-bold text-xs flex items-center gap-2 text-foreground">
                                            <Users className="h-4 w-4 text-emerald-600" />
                                            Daftar Siswa & Pengampu Rombel {r.name} ({r.students.length} Siswa Terdaftar)
                                          </div>
                                          <Button
                                            size="sm"
                                            className="h-7 text-xs font-bold gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                            onClick={() => {
                                              setTargetRombelForPlotting(r);
                                              setIsPlottingOpen(true);
                                            }}
                                          >
                                            + Tambah Siswa ke Rombel {r.name}
                                          </Button>
                                        </div>

                                        {/* Sub-Table Siswa Anggota */}
                                        {r.students.length > 0 ? (
                                          <div className="overflow-x-auto rounded-lg border border-border">
                                            <table className="w-full text-xs">
                                              <thead>
                                                <tr className="bg-muted/50 text-left border-b border-border font-bold text-muted-foreground">
                                                  <th className="py-2 px-3">No</th>
                                                  <th className="py-2 px-3">NISN</th>
                                                  <th className="py-2 px-3">Nama Lengkap Siswa</th>
                                                  <th className="py-2 px-3">L/P</th>
                                                  <th className="py-2 px-3">WA Orang Tua</th>
                                                  <th className="py-2 px-3">Status KKM & EWS</th>
                                                  <th className="py-2 px-3 text-right">Aksi</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-border/60">
                                                {r.students.map((s: any, idx: number) => (
                                                  <tr key={s.id} className="hover:bg-muted/20">
                                                    <td className="py-2 px-3 font-mono">{idx + 1}</td>
                                                    <td className="py-2 px-3 font-mono font-bold text-primary">{s.nisn}</td>
                                                    <td className="py-2 px-3 font-bold text-foreground">{s.name}</td>
                                                    <td className="py-2 px-3 font-semibold">{s.gender}</td>
                                                    <td className="py-2 px-3 font-mono text-muted-foreground">{s.parentWa}</td>
                                                    <td className="py-2 px-3">
                                                      {s.kkmStatus.includes("PERLU") ? (
                                                        <Badge variant="outline" className="text-[9px] bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 font-bold">
                                                          ⚠️ {s.kkmStatus}
                                                        </Badge>
                                                      ) : (
                                                        <Badge variant="outline" className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40 font-bold">
                                                          ✓ {s.kkmStatus}
                                                        </Badge>
                                                      )}
                                                    </td>
                                                    <td className="py-2 px-3 text-right">
                                                       <div className="flex items-center justify-end gap-1">
                                                         <Button
                                                           size="sm"
                                                           variant="ghost"
                                                           className="h-6 text-[10px] text-emerald-600 hover:bg-emerald-500/10 font-bold gap-1"
                                                           onClick={() =>
                                                             setEditingStudent({
                                                               rombelId: r.id,
                                                               id: s.id,
                                                               nisn: s.nisn,
                                                               name: s.name,
                                                               gender: s.gender || "L",
                                                               parentWa: s.parentWa || "081234567890",
                                                               kkmStatus: s.kkmStatus || "TUNTAS (85)",
                                                             })
                                                           }
                                                         >
                                                           <PencilLine className="h-3 w-3" /> Edit User Siswa
                                                         </Button>
                                                         <Button
                                                           size="sm"
                                                           variant="ghost"
                                                           className="h-6 text-[10px] text-red-600 hover:bg-red-500/10 font-bold"
                                                           onClick={() => handleRemoveStudent(r.id, s.id, s.name)}
                                                         >
                                                           Keluarkan
                                                         </Button>
                                                       </div>
                                                     </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        ) : (
                                          <div className="p-4 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg">
                                            Belum ada siswa yang di-plotting pada Rombel {r.name}.
                                          </div>
                                        )}

                                        {/* Sub-Section Guru Mapel Pengampu */}
                                        <div className="pt-2">
                                          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                                            👨‍🏫 Guru Pengampu Mapel Rombel {r.name}:
                                          </div>
                                          <div className="flex flex-wrap gap-2">
                                            {r.teachers.map((t: any, tidx: number) => (
                                              <Badge key={tidx} variant="secondary" className="text-xs font-semibold px-2.5 py-1 flex items-center gap-1.5">
                                                <span className="text-primary font-bold">{t.mapel}:</span>
                                                <span>{t.teacher}</span>
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Fragment>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* ➕ MODAL BUAT ROMBEL BARU */}
      <Dialog open={isAddRombelOpen} onOpenChange={setIsAddRombelOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Buat Ruang Rombel Baru
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tambahkan data rombongan belajar baru ke struktur hirarki madrasah.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateRombel} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Tingkat Kelas</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                value={gradeInput}
                onChange={(e: any) => setGradeInput(e.target.value)}
              >
                <option value="VII">Kelas VII (7)</option>
                <option value="VIII">Kelas VIII (8)</option>
                <option value="IX">Kelas IX (9)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Nama Rombel / Kode Kelas</Label>
              <Input
                placeholder="Contoh: 8C, 7D, 9B"
                value={rombelNameInput}
                onChange={(e) => setRombelNameInput(e.target.value)}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Ruangan / Gedung</Label>
              <Input
                placeholder="Contoh: Ruang R-203"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Guru Wali Kelas Pengampu</Label>
              <Input
                placeholder="Nama Guru Wali Kelas"
                value={waliKelasInput}
                onChange={(e) => setWaliKelasInput(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Kapasitas Maksimal Siswa</Label>
              <Input
                type="number"
                value={capacityInput}
                onChange={(e) => setCapacityInput(Number(e.target.value))}
                className="mt-1 text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRombelOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                Simpan Rombel Baru
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 🎓 MODAL PLOTTING SISWA KE ROMBEL */}
      <Dialog open={isPlottingOpen} onOpenChange={setIsPlottingOpen}>
        <DialogContent className="sm:max-w-md border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-600" /> Plotting Siswa ke Rombel {targetRombelForPlotting?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Tambahkan atau alokasikan siswa baru ke Rombel {targetRombelForPlotting?.name} ({targetRombelForPlotting?.grade}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStudentToRombel} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Nama Lengkap Siswa</Label>
              <Input
                placeholder="Masukkan nama siswa"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">NISN Siswa</Label>
              <Input
                placeholder="Contoh: 0081928399"
                value={newStudentNisn}
                onChange={(e) => setNewStudentNisn(e.target.value)}
                className="mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">No. WhatsApp Orang Tua / Wali</Label>
              <Input
                placeholder="Contoh: 081234567890"
                value={newStudentWa}
                onChange={(e) => setNewStudentWa(e.target.value)}
                className="mt-1 text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPlottingOpen(false)}>
                Selesai
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                + Tambah Siswa ke Rombel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 📱 MODAL BROADCAST WA GATEWAY PER ROMBEL */}
      <Dialog open={isWaBroadcastOpen} onOpenChange={setIsWaBroadcastOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" /> Broadcast WA Gateway Rombel {targetRombelForWa?.name}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Kirim notifikasi WhatsApp massal ke seluruh Orang Tua Siswa Rombel {targetRombelForWa?.name} ({targetRombelForWa?.students?.length || 0} Kontak).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendWaBroadcast} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Subjek / Judul Pengumuman</Label>
              <Input
                value={waSubject}
                onChange={(e) => setWaSubject(e.target.value)}
                required
                className="mt-1 text-xs font-bold"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Isi Pesan WhatsApp Broadcast</Label>
              <textarea
                rows={4}
                value={waMessage}
                onChange={(e) => setWaMessage(e.target.value)}
                required
                className="w-full p-3 rounded-md border border-border bg-background text-xs mt-1"
              />
            </div>

            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-700 dark:text-blue-300">
              📲 <strong>Pesan EWS Broadcast:</strong> Pesan ini akan dikirim secara simultan ke {targetRombelForWa?.students?.length || 0} kontak WhatsApp Orang Tua siswa Rombel {targetRombelForWa?.name}.
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsWaBroadcastOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-1.5">
                <Send className="h-3.5 w-3.5" /> Kirim Broadcast WA
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function parseMediaUrl(url: string): { embedUrl: string; provider: "youtube" | "gdrive" | "direct" } {
  if (!url) return { embedUrl: "", provider: "direct" };

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return {
      embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
      provider: "youtube",
    };
  }

  // Google Drive match
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      provider: "gdrive",
    };
  }

  return { embedUrl: url, provider: "direct" };
}

function Perpustakaan() {
  const [filterTag, setFilterTag] = useState("Semua");
  const [activeMediaModal, setActiveMediaModal] = useState<any>(null);
  const [activePdfModal, setActivePdfModal] = useState<any>(null);
  const [isPdfFullScreen, setIsPdfFullScreen] = useState(false);
  const [isVideoFullScreen, setIsVideoFullScreen] = useState(false);

  // Initial E-Library List with LocalStorage Persistence
  const [bukuList, setBukuList] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("lms_elibrary_books_v2");
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: "1",
        t: "Buku Digital Fikih Kelas VIII (Kemenag RI)",
        icon: FileText,
        tag: "PDF Modul",
        size: "12.4 MB",
        type: "pdf",
        url: "https://pdfobject.com/pdf/sample.pdf",
        desc: "Buku Teks Utama Pendidikan Agama Islam Fikih MTs Kelas 8 Kurikulum Merdeka.",
      },
      {
        id: "2",
        t: "Video Tutorial Pembelajaran Tajwid Mad Silah (YouTube HD)",
        icon: Video,
        tag: "Video YouTube",
        size: "YouTube HD",
        type: "video",
        videoUrl: "https://www.youtube.com/watch?v=kYJzXv0h0bU",
        desc: "Penjelasan audio-visual contoh hukum bacaan Mad Silah Qashirah & Thawilah.",
        provider: "youtube",
      },
      {
        id: "3",
        t: "Video Praktikum Paru-Paru & Organ Pernapasan (Google Drive Video)",
        icon: Video,
        tag: "Video G-Drive",
        size: "Google Drive HD",
        type: "video",
        videoUrl: "https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view",
        desc: "Rekaman video peragaan praktikum paru-paru dan mekanisme inspirasi-ekspirasi.",
        provider: "gdrive",
      },
      {
        id: "4",
        t: "Audio Murottal Tajwid Juz 30 (Surah An-Naba')",
        icon: Headphones,
        tag: "Audio Murottal",
        size: "18.2 MB",
        type: "audio",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        desc: "Murottal merdu beserta panduan makhraj dan hukum tajwid.",
        provider: "direct",
      },
      {
        id: "5",
        t: "E-Book Sejarah Kebudayaan Islam MTs",
        icon: Library,
        tag: "E-Book",
        size: "8.7 MB",
        type: "pdf",
        url: "https://pdfobject.com/pdf/sample.pdf",
        desc: "Sejarah Perkembangan Islam pada Masa Daulah Abbasiyah & Wali Songo.",
      },
    ];
  });

  const [isOpen, setIsOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("PDF Modul");
  const [mediaUrl, setMediaUrl] = useState("");
  const [desc, setDesc] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const saveListToStorage = (list: any[]) => {
    setBukuList(list);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("lms_elibrary_books_v2", JSON.stringify(list));
      } catch (e) {}
    }
  };

  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Judul modul / media tidak boleh kosong!");
    if (uploadMode === "file" && !selectedFile && !mediaUrl.trim()) {
      return toast.error("Harap pilih berkas dari perangkat Anda!");
    }

    const isVideo = tag === "Video YouTube" || tag === "Video G-Drive" || tag === "Video Tutorial";
    const isAudio = tag === "Audio Murottal";
    const isPdf = tag === "PDF Modul" || tag === "E-Book";

    let mediaType = isVideo ? "video" : isAudio ? "audio" : "pdf";
    let defaultUrl = "";
    let fileSizeStr = "12.5 MB";

    if (uploadMode === "file" && selectedFile) {
      defaultUrl = URL.createObjectURL(selectedFile);
      fileSizeStr = `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      defaultUrl = mediaUrl.trim() || (isPdf ? "https://pdfobject.com/pdf/sample.pdf" : "https://www.youtube.com/watch?v=kYJzXv0h0bU");
    }

    const parsed = parseMediaUrl(defaultUrl);

    const newItem = {
      id: String(Date.now()),
      t: title.trim(),
      icon: isVideo ? Video : isAudio ? Headphones : FileText,
      tag,
      size: uploadMode === "file" && selectedFile ? fileSizeStr : parsed.provider === "youtube" ? "YouTube HD" : parsed.provider === "gdrive" ? "Google Drive" : "15.0 MB",
      type: mediaType,
      url: defaultUrl,
      videoUrl: defaultUrl,
      audioUrl: defaultUrl,
      desc: desc.trim() || "Modul & media pembelajaran digital MTsN 2 Cilacap.",
      provider: uploadMode === "file" ? "direct" : parsed.provider,
    };

    const updated = [newItem, ...bukuList];
    saveListToStorage(updated);

    toast.success(`🎉 Berkas "${title}" (${tag}) berhasil ${uploadMode === "file" ? "diunggah" : "ditautkan"} ke E-Library!`);
    setIsOpen(false);
    setTitle("");
    setMediaUrl("");
    setDesc("");
    setSelectedFile(null);
  };

  const filtered = bukuList.filter((b: any) => filterTag === "Semua" || b.tag === filterTag);

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" /> Perpustakaan Digital & E-Resources
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Koleksi PDF E-Book, Modul Digital, Embed Video YouTube & Google Drive, serta Audio Murottal Streaming MTsN 2 Cilacap.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow-xs" onClick={() => setIsOpen(true)}>
          + Tautkan / Unggah Berkas E-Library
        </Button>
      </div>

      {/* Filter Bar E-Library */}
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border pb-3">
        {["Semua", "PDF Modul", "Video YouTube", "Video G-Drive", "Audio Murottal", "E-Book"].map((t) => (
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
        {filtered.map((k: any) => {
          const Icon = k.icon || FileText;
          const isMedia = k.type === "video" || k.type === "audio";
          const isPdf = k.type === "pdf" || k.tag === "PDF Modul" || k.tag === "E-Book";

          const parsed = parseMediaUrl(k.videoUrl || k.url || "");

          return (
            <Card key={k.id} className="border-border shadow-xs hover:border-primary/40 transition group">
              <CardContent className="p-4 flex flex-col justify-between h-full gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center shrink-0 font-bold group-hover:scale-105 transition">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-foreground line-clamp-2 leading-snug">{k.t}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-primary/20">
                        {k.tag}
                      </Badge>
                      {parsed.provider === "youtube" && (
                        <Badge variant="outline" className="text-[9px] font-extrabold bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
                          ▶ YouTube
                        </Badge>
                      )}
                      {parsed.provider === "gdrive" && (
                        <Badge variant="outline" className="text-[9px] font-extrabold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
                          📁 Google Drive
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">{k.size}</span>
                    </div>
                  </div>
                </div>

                {k.desc && <p className="text-[11px] text-muted-foreground line-clamp-2 italic px-1">{k.desc}</p>}

                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 mt-auto">
                  {isPdf && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                      onClick={() => setActivePdfModal(k)}
                    >
                      <FileText className="h-3.5 w-3.5" /> 📄 Baca / Lihat PDF
                    </Button>
                  )}

                  {isMedia && (
                    <Button
                      size="sm"
                      className="w-full text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-xs"
                      onClick={() => setActiveMediaModal(k)}
                    >
                      ▶ {k.type === "video" ? (parsed.provider === "youtube" ? "Tonton YouTube" : parsed.provider === "gdrive" ? "Tonton G-Drive" : "Tonton Video") : "Dengar Audio"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 📄 MODAL PDF VIEWER / READER WITH FULLSCREEN SUPPORT */}
      <Dialog
        open={!!activePdfModal}
        onOpenChange={() => {
          setActivePdfModal(null);
          setIsPdfFullScreen(false);
        }}
      >
        <DialogContent
          id="pdf-modal-container"
          className={
            isPdfFullScreen
              ? "max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] p-4 flex flex-col border-border bg-card shadow-2xl transition-all duration-300"
              : "sm:max-w-4xl max-h-[90vh] border-border bg-card flex flex-col transition-all duration-300"
          }
        >
          <DialogHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" /> {activePdfModal?.t}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {activePdfModal?.desc || "Pratinjau Berkas PDF E-Library MTsN 2 Cilacap"}
              </DialogDescription>
            </div>
            <Button
              size="sm"
              variant={isPdfFullScreen ? "default" : "outline"}
              className="gap-1.5 text-xs font-bold shrink-0 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
              onClick={() => setIsPdfFullScreen(!isPdfFullScreen)}
            >
              {isPdfFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {isPdfFullScreen ? "Keluar Fullscreen" : "🗖 Layar Penuh (Fullscreen)"}
            </Button>
          </DialogHeader>

          <div className="py-2 flex-1 min-h-[60vh]">
            {activePdfModal?.url ? (
              <iframe
                src={activePdfModal.url}
                className={`w-full rounded-xl border border-border shadow-inner bg-muted/20 ${
                  isPdfFullScreen ? "h-[80vh]" : "h-[62vh]"
                }`}
                title={activePdfModal.t}
              />
            ) : (
              <div className="h-[50vh] grid place-items-center text-center p-6 bg-muted/20 rounded-xl">
                <p className="text-xs text-muted-foreground">URL dokumen PDF tidak dapat dimuat secara langsung.</p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/40 font-bold">
                📄 {isPdfFullScreen ? "Mode Layar Penuh Aktif" : "PDF Viewer Ready"}
              </Badge>
              {activePdfModal?.url && (
                <a
                  href={activePdfModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary underline font-bold flex items-center gap-1"
                >
                  🔗 Buka Tab Baru
                </a>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-bold"
                onClick={() => setIsPdfFullScreen(!isPdfFullScreen)}
              >
                {isPdfFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                {isPdfFullScreen ? "Kecilkan Tampilan" : "Layar Penuh"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => { setActivePdfModal(null); setIsPdfFullScreen(false); }}>
                Tutup Pembaca PDF
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🎥 MODAL STREAMING VIDEO (YOUTUBE / GOOGLE DRIVE / MP4 / AUDIO) WITH FULLSCREEN SUPPORT */}
      <Dialog
        open={!!activeMediaModal}
        onOpenChange={() => {
          setActiveMediaModal(null);
          setIsVideoFullScreen(false);
        }}
      >
        <DialogContent
          id="video-modal-container"
          className={
            isVideoFullScreen
              ? "max-w-[98vw] w-[98vw] h-[95vh] max-h-[95vh] p-4 flex flex-col border-border bg-card shadow-2xl transition-all duration-300"
              : "sm:max-w-3xl border-border bg-card transition-all duration-300"
          }
        >
          <DialogHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {activeMediaModal?.type === "video" ? <Video className="h-5 w-5 text-blue-500" /> : <Headphones className="h-5 w-5 text-purple-500" />}
                {activeMediaModal?.t}
              </DialogTitle>
              <DialogDescription className="text-xs">
                {activeMediaModal?.desc || "Media pembelajaran digital terintegrasi MTsN 2 Cilacap"}
              </DialogDescription>
            </div>
            {activeMediaModal?.type === "video" && (
              <Button
                size="sm"
                variant={isVideoFullScreen ? "default" : "outline"}
                className="gap-1.5 text-xs font-bold shrink-0 border-blue-500/40 text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                onClick={() => setIsVideoFullScreen(!isVideoFullScreen)}
              >
                {isVideoFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                {isVideoFullScreen ? "Keluar Fullscreen" : "🗖 Layar Penuh (Fullscreen)"}
              </Button>
            )}
          </DialogHeader>

          <div className="py-3 space-y-4 flex-1">
            {activeMediaModal?.type === "video" && (() => {
              const targetUrl = activeMediaModal.videoUrl || activeMediaModal.url || "";
              const parsed = parseMediaUrl(targetUrl);

              if (parsed.provider === "youtube" || parsed.provider === "gdrive") {
                return (
                  <div
                    className={`rounded-xl overflow-hidden bg-black border border-border shadow-lg ${
                      isVideoFullScreen ? "h-[78vh] w-full" : "aspect-video w-full"
                    }`}
                  >
                    <iframe
                      src={parsed.embedUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      title={activeMediaModal.t}
                    />
                  </div>
                );
              }

              return (
                <div
                  className={`rounded-xl overflow-hidden bg-black border border-border grid place-items-center ${
                    isVideoFullScreen ? "h-[78vh] w-full" : "aspect-video w-full"
                  }`}
                >
                  <video controls autoPlay className="w-full h-full object-contain">
                    <source src={targetUrl} type="video/mp4" />
                    Browser Anda tidak mendukung HTML5 Video.
                  </video>
                </div>
              );
            })()}

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
                    <source src={activeMediaModal?.audioUrl || activeMediaModal?.url} type="audio/mpeg" />
                    Browser Anda tidak mendukung HTML5 Audio.
                  </audio>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-border flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] text-muted-foreground mr-auto">
              🔒 Embedded Streaming Mode (YouTube / Google Drive Supported)
            </Badge>
            <div className="flex items-center gap-2">
              {activeMediaModal?.type === "video" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 text-xs font-bold"
                  onClick={() => setIsVideoFullScreen(!isVideoFullScreen)}
                >
                  {isVideoFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  {isVideoFullScreen ? "Kecilkan Tampilan" : "Layar Penuh"}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => { setActiveMediaModal(null); setIsVideoFullScreen(false); }}>
                Tutup Pemutar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ➕ Modal Form Unggah & Tautkan Link E-Library */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" /> Tautkan / Unggah Berkas ke E-Library
            </DialogTitle>
            <DialogDescription>
              Tambahkan modul PDF, tautan Video YouTube, Video Google Drive, atau Audio ke koleksi perpustakaan madrasah.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddBook} className="space-y-4 py-2">
            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <Button
                type="button"
                size="sm"
                variant={uploadMode === "file" ? "default" : "ghost"}
                className="flex-1 text-xs font-bold gap-1"
                onClick={() => setUploadMode("file")}
              >
                <Upload className="h-3.5 w-3.5" /> 📤 Unggah Berkas Fisik
              </Button>
              <Button
                type="button"
                size="sm"
                variant={uploadMode === "url" ? "default" : "ghost"}
                className="flex-1 text-xs font-bold gap-1"
                onClick={() => setUploadMode("url")}
              >
                <ExternalLink className="h-3.5 w-3.5" /> 🔗 Tautkan Link/URL Online
              </Button>
            </div>

            {uploadMode === "file" ? (
              <div>
                <Label className="text-xs font-semibold">Pilih Berkas PDF / Audio / Video dari Perangkat</Label>
                <div className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5 hover:bg-primary/10 transition cursor-pointer text-center space-y-2 relative">
                  <input
                    type="file"
                    accept=".pdf,.mp4,.mp3,.epub,.docx"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                  />
                  <Upload className="h-8 w-8 text-primary animate-pulse" />
                  <div className="text-xs font-bold text-foreground">
                    {selectedFile ? `📄 ${selectedFile.name} (${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)` : "Klik atau seret file PDF / Media di sini"}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Format yang didukung: PDF, MP4, MP3, EPUB (Maks. 100 MB)</p>
                </div>
              </div>
            ) : (
              <div>
                <Label className="text-xs font-semibold">Tautan Link Media / PDF (YouTube, Google Drive, URL)</Label>
                <Input
                  placeholder="https://www.youtube.com/watch?v=... ATAU https://drive.google.com/file/d/... ATAU URL PDF"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="mt-1 text-xs font-mono"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  *Mendukung link YouTube (`watch?v=...`), Google Drive (`/file/d/.../view`), dan link PDF.
                </p>
              </div>
            )}

            <div>
              <Label className="text-xs font-semibold">Judul Berkas / Media / Modul</Label>
              <Input
                placeholder="Contoh: Modul Fikih Bab 3 / Video Pembelajaran Tajwid"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Kategori Media</Label>
              <select
                className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs mt-1"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="PDF Modul">📄 PDF Modul</option>
                <option value="Video YouTube">▶ Video YouTube</option>
                <option value="Video G-Drive">📁 Video Google Drive</option>
                <option value="Audio Murottal">🎧 Audio Murottal</option>
                <option value="E-Book">📚 E-Book Digital</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Deskripsi Ringkas</Label>
              <textarea
                placeholder="Penjelasan ringkas mengenai isi modul atau video..."
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full p-2.5 rounded-md border border-border bg-background text-xs mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                Batal
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground font-bold">
                Simpan & Tautkan Media
              </Button>
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
            <div className="flex justify-between"><span>Database Status:</span><strong className="font-mono text-emerald-600">Pure MySQL Engine (Connected & Sync)</strong></div>
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

  const isWaka = activeRole === "waka";
  const isWakaOrAdmin = activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik" || activeRole === "kamad";
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("semua");

  const handleToggleVerification = (id: string, currentStatus: string, title: string) => {
    setModulList((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const nextStatus = currentStatus === "Terverifikasi Waka" ? "Perlu Verifikasi Waka" : "Terverifikasi Waka";
          if (nextStatus === "Terverifikasi Waka") {
            toast.success(`✅ Berhasil! Modul Ajar "${title}" resmi diverifikasi dan disahkan oleh Waka Kurikulum.`);
          } else {
            toast.info(`ℹ️ Status Modul Ajar "${title}" dikembalikan ke Menunggu Verifikasi.`);
          }
          return { ...m, status: nextStatus };
        }
        return m;
      })
    );
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return toast.error("Harap isi judul modul ajar!");
    setModulList([
      { id: String(Date.now()), title: newTitle, mapel: newMapel, jenjang: newJenjang, teacher: userProfile?.full_name || "Dra. Hj. Siti Rahmah, M.Pd", size: "3.8 MB", date: "Hari ini", status: isWakaOrAdmin ? "Terverifikasi Waka" : "Perlu Verifikasi Waka" },
      ...modulList,
    ]);
    toast.success(`Modul Ajar PDF "${newTitle}" berhasil diunggah! ${!isWakaOrAdmin ? "(Menunggu Verifikasi Waka)" : ""}`);
    setIsUploadOpen(false);
    setNewTitle("");
  };

  const filteredModul = modulList.filter((m) => {
    const matchJenjang = selectedJenjang === "semua" || m.jenjang === selectedJenjang;
    const matchStatus =
      selectedStatusFilter === "semua" ||
      (selectedStatusFilter === "pending" && m.status !== "Terverifikasi Waka") ||
      (selectedStatusFilter === "verified" && m.status === "Terverifikasi Waka");
    return matchJenjang && matchStatus;
  });

  const verifiedCount = modulList.filter((m) => m.status === "Terverifikasi Waka").length;
  const pendingCount = modulList.length - verifiedCount;

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-emerald-500" />
            {isWaka ? "Verifikasi & Validasi Modul Ajar PDF" : "Perangkat Ajar & Modul Ajar PDF"}{" "}
            {isSiswa && <Badge className="bg-emerald-600 text-white font-bold text-xs">📍 Kelas {rawClass}</Badge>}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isWaka
              ? "Portal verifikasi, evaluasi kesesuaian CP/ATP, dan pengesahan Modul Ajar PDF Kurikulum Merdeka yang diunggah Guru Pengampu."
              : isSiswa
              ? `Akses berkas PDF Modul Ajar Kurikulum Merdeka khusus Kelas ${rawClass} MTsN 2 Cilacap`
              : "Unggah dan kelola file PDF Modul Ajar Kurikulum Merdeka per mata pelajaran & jenjang (Kelas VII, VIII, IX)."}
          </p>
        </div>
        {!isSiswa && (
          <Button size="sm" className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs" onClick={() => setIsUploadOpen(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> + Unggah Modul Ajar PDF
          </Button>
        )}
      </div>

      {/* Metrics Summary for Waka */}
      {isWakaOrAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-border bg-card space-y-1 shadow-xs">
            <div className="text-xs text-muted-foreground font-medium">Total Modul Diunggah</div>
            <div className="text-2xl font-black text-foreground">{modulList.length} Berkas</div>
            <div className="text-[11px] text-muted-foreground">Persyaratan Kurikulum Merdeka</div>
          </div>

          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-1 shadow-xs cursor-pointer hover:bg-amber-500/10 transition" onClick={() => setSelectedStatusFilter("pending")}>
            <div className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center justify-between">
              <span>Menunggu Verifikasi Waka</span>
              <span>⏳</span>
            </div>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-400">{pendingCount} Modul</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Perlu peninjauan & pengesahan</div>
          </div>

          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1 shadow-xs cursor-pointer hover:bg-emerald-500/10 transition" onClick={() => setSelectedStatusFilter("verified")}>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-between">
              <span>Resmi Terverifikasi Waka</span>
              <span>✅</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400">{verifiedCount} Modul</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">Siap digunakan KBM & e-Rapor</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-border pb-3">
        <div className="flex items-center gap-2">
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

        {isWakaOrAdmin && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Status Verifikasi:</span>
            <select
              className="bg-background text-xs font-bold text-foreground border border-input rounded-md px-2.5 py-1 focus:outline-hidden cursor-pointer"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
            >
              <option value="semua">Semua Status</option>
              <option value="pending">⏳ Menunggu Verifikasi Waka</option>
              <option value="verified">✅ Terverifikasi Waka</option>
            </select>
          </div>
        )}
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
                  <Badge className={m.status === "Terverifikasi Waka" ? "bg-emerald-600 text-white text-[10px] font-bold" : "bg-amber-500 text-white text-[10px] font-bold"}>
                    {m.status === "Terverifikasi Waka" ? "✓ Terverifikasi Waka" : "⏳ Perlu Verifikasi"}
                  </Badge>
                </div>
                <div className="font-bold text-sm text-foreground mt-1 truncate">{m.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Penyusun: {m.teacher}</div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border gap-2">
                  <span>Ukuran: <strong>{m.size}</strong></span>
                  
                  <div className="flex items-center gap-1.5">
                    {isWakaOrAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={`h-7 text-xs font-bold ${
                          m.status === "Terverifikasi Waka"
                            ? "border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50"
                            : "bg-emerald-600 text-white hover:bg-emerald-700 font-extrabold shadow-xs"
                        }`}
                        onClick={() => handleToggleVerification(m.id, m.status, m.title)}
                      >
                        {m.status === "Terverifikasi Waka" ? "✓ Sah Terverifikasi" : "✅ Sahkan & Verifikasi"}
                      </Button>
                    )}

                    <Button size="sm" variant="ghost" className="h-7 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10" onClick={() => toast.success(`Mengunduh file PDF ${m.title}...`)}>
                      <Download className="h-3 w-3 mr-1" /> Unduh PDF
                    </Button>
                  </div>
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
                  {INITIAL_MASTER_MAPEL.map((m) => (
                    <option key={m.code} value={m.name}>
                      {m.name} ({m.code})
                    </option>
                  ))}
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
