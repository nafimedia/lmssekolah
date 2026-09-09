import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MysqlAuthService } from "@/services/mysqlAuthService";
import { MysqlDataService, JadwalRow } from "@/services/mysqlDataService";
import logoAsset from "@/assets/logo-mtsn2.png.asset.json";
import { BerandaModule } from "@/components/dashboard/modules/beranda/BerandaModule";
import { GlobalCommandPalette } from "@/components/dashboard/components/GlobalCommandPalette";
import { NotificationCenterPopover } from "@/components/dashboard/components/NotificationCenterPopover";
import { TableRowsSkeleton } from "@/components/dashboard/components/ModuleSkeleton";
import { INITIAL_MASTER_MAPEL } from "@/services/masterMapelService";
import { isSubjectAllowedForUser, filterSubjectsForUser, getTeacherAssignedSubjects, getTeacherAssignedClasses, ALL_SCHOOL_SUBJECTS } from "@/services/teacherSubjectAccess";
import { resolveWaliKelasRombel } from "@/utils/classNormalization";
import { useEffect, useState, useMemo, Fragment, lazy, Suspense } from "react";
import { createPortal } from "react-dom";

// Code-Splitting Lazy Loaded Heavy Modules:
const ProfilModule = lazy(() => import("@/components/dashboard/modules/profil/ProfilModule").then((m) => ({ default: m.ProfilModule })));
const SiakadMasterDataModule = lazy(() => import("@/components/dashboard/modules/siakad/SiakadMasterDataModule").then((m) => ({ default: m.SiakadMasterDataModule })));
const RuangMengajarModule = lazy(() => import("@/components/dashboard/modules/ruangmengajar/RuangMengajarModule").then((m) => ({ default: m.RuangMengajarModule })));
const SdmGtkModule = lazy(() => import("@/components/dashboard/modules/sdm/SdmGtkModule").then((m) => ({ default: m.SdmGtkModule })));
const PengumumanModule = lazy(() => import("@/components/dashboard/modules/pengumuman/PengumumanModule").then((m) => ({ default: m.PengumumanModule })));
const AgendaKalenderModule = lazy(() => import("@/components/dashboard/modules/agenda/AgendaKalenderModule").then((m) => ({ default: m.AgendaKalenderModule })));
const PerpustakaanModule = lazy(() => import("@/components/dashboard/modules/perpustakaan/PerpustakaanModule").then((m) => ({ default: m.PerpustakaanModule })));
const UserManagementModule = lazy(() => import("@/components/dashboard/modules/user/UserManagementModule").then((m) => ({ default: m.UserManagementModule })));
const KehadiranModule = lazy(() => import("@/components/dashboard/modules/kehadiran/KehadiranModule").then((m) => ({ default: m.KehadiranModule })));
const JadwalModule = lazy(() => import("@/components/dashboard/modules/jadwal/JadwalModule").then((m) => ({ default: m.JadwalModule })));
const ModulAjarModule = lazy(() => import("@/components/dashboard/modules/modulajar/ModulAjarModule").then((m) => ({ default: m.ModulAjarModule })));
const ManajemenKelasModule = lazy(() => import("@/components/dashboard/modules/manajemenkelas/ManajemenKelasModule").then((m) => ({ default: m.ManajemenKelasModule })));
const MonitoringKbmLiveModule = lazy(() => import("@/components/dashboard/modules/monitoringkbmlive/MonitoringKbmLiveModule").then((m) => ({ default: m.MonitoringKbmLiveModule })));
const ApresiasiGuruModule = lazy(() => import("@/components/dashboard/modules/apresiasi/ApresiasiGuruModule").then((m) => ({ default: m.ApresiasiGuruModule })));
const ApresiasiSiswaModule = lazy(() => import("@/components/dashboard/modules/apresiasi/ApresiasiSiswaModule").then((m) => ({ default: m.ApresiasiSiswaModule })));
const RaporModule = lazy(() => import("@/components/dashboard/modules/rapor/RaporModule").then((m) => ({ default: m.RaporModule })));
const ProgressBelajarModule = lazy(() => import("@/components/dashboard/modules/progress/ProgressBelajarModule").then((m) => ({ default: m.ProgressBelajarModule })));
const TahfidzModule = lazy(() => import("@/components/dashboard/modules/tahfidz/TahfidzModule").then((m) => ({ default: m.TahfidzModule })));
const LaporanTahfidzEksekutif = lazy(() => import("@/components/dashboard/modules/tahfidz/TahfidzModule").then((m) => ({ default: m.LaporanTahfidzEksekutif })));
const KokurikulerModule = lazy(() => import("@/components/dashboard/modules/kokurikuler/KokurikulerModule").then((m) => ({ default: m.KokurikulerModule })));
const KokurikulerSiswaModule = lazy(() => import("@/components/dashboard/modules/kokurikuler/KokurikulerSiswaModule").then((m) => ({ default: m.KokurikulerSiswaModule })));
const AsistenAIModule = lazy(() => import("@/components/dashboard/modules/asistenai/AsistenAIModule").then((m) => ({ default: m.AsistenAIModule })));
const PusatAsesmenModule = lazy(() => import("@/components/dashboard/modules/asesmen/PusatAsesmenModule").then((m) => ({ default: m.PusatAsesmenModule })));
const MataPelajaranModule = lazy(() => import("@/components/dashboard/modules/mapel/MataPelajaranModule").then((m) => ({ default: m.MataPelajaranModule })));
const CBTModule = lazy(() => import("@/components/dashboard/modules/cbt/CBTModule").then((m) => ({ default: m.CBTModule })));
const PengaturanModule = lazy(() => import("@/components/dashboard/modules/pengaturan/PengaturanModule").then((m) => ({ default: m.PengaturanModule })));
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
  Inbox,
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

import { ErrorBoundary } from "@/components/ErrorBoundary";

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
  | "monitoring_kbm_live"
  | "sdm_gtk"
  | "perangkat_pembelajaran"
  | "profil"
  | "pengaturan";

const MENU: { key: MenuKey; label: string; icon: typeof Home; group?: string }[] = [
  { key: "beranda", label: "Beranda", icon: Home, group: "Utama" },
  { key: "monitoring_kbm_live", label: "Pantau KBM Langsung", icon: Activity, group: "Utama" },
  { key: "ruang_mengajar", label: "Ruang Mengajar Hub", icon: BookOpen, group: "Utama" },
  { key: "sdm_gtk", label: "Manajemen SDM GTK", icon: Users, group: "Utama" },
  { key: "siakad", label: "Data Pokok Akademik", icon: BarChart3, group: "Utama" },
  { key: "manajemen_kelas", label: "Manajemen Kelas & Rombel", icon: Layers, group: "Utama" },
  { key: "users", label: "Kelola Akun & Hak Akses", icon: Shield, group: "Utama" },
  { key: "pengumuman", label: "Pengumuman", icon: Megaphone, group: "Utama" },
  { key: "jadwal", label: "Jadwal Pelajaran", icon: CalendarClock, group: "Utama" },
  { key: "agenda", label: "Agenda & Kalender Akademik", icon: CalendarDays, group: "Utama" },
  { key: "kehadiran", label: "Kehadiran & Rekap Presensi", icon: UserCheck, group: "Utama" },
  { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", icon: BookOpen, group: "Akademik" },
  { key: "modul_ajar", label: "Bahan Ajar", icon: FileText, group: "Akademik" },
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
  { key: "pengaturan", label: "Pemeliharaan & Cadangan Data", icon: Settings, group: "Lainnya" },
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
      { key: "monitoring_kbm_live", label: "🔴 Pantau KBM Langsung", group: "Utama & Kontrol" },
      { key: "sdm_gtk", label: "Manajemen SDM GTK", group: "Utama & Kontrol" },
      { key: "manajemen_kelas", label: "Manajemen Kelas", group: "Utama & Kontrol" },
      { key: "users", label: "Kelola Akun & Hak Akses", group: "Utama & Kontrol" },
      { key: "siakad", label: "Data Pokok Akademik", group: "Akademik" },
      { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", group: "Akademik" },
      { key: "modul_ajar", label: "Bahan Ajar", group: "Akademik" },
      { key: "jadwal", label: "Jadwal Pelajaran Madrasah", group: "Akademik" },
      { key: "pengumuman", label: "Pengumuman", group: "Akademik" },
      { key: "agenda", label: "Agenda Madrasah", group: "Akademik" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi & CBT" },
      { key: "nilai", label: "Rekap Nilai Sistem", group: "Evaluasi & CBT" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Apresiasi & Pembinaan" },
      { key: "tahfidz_report", label: "Laporan Tahfidz", group: "Monitoring Eksekutif" },
      { key: "kokurikuler_report", label: "Laporan P5", group: "Monitoring Eksekutif" },
      { key: "pengaturan", label: "Pemeliharaan & Cadangan Data", group: "Pengaturan" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  admin_akademik: {
    label: "Administrator Akademik",
    badge: "ADMIN AKADEMIK",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Akademik", group: "Utama & Monitoring" },
      { key: "monitoring_kbm_live", label: "🔴 Pantau KBM Langsung", group: "Utama & Monitoring" },
      { key: "sdm_gtk", label: "Manajemen SDM GTK", group: "Utama & Monitoring" },
      { key: "manajemen_kelas", label: "Manajemen Kelas", group: "Utama & Monitoring" },
      { key: "users", label: "Data Akun Madrasah", group: "Utama & Monitoring" },
      { key: "siakad", label: "Data Pokok Akademik", group: "Akademik & Kurikulum" },
      { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", group: "Akademik & Kurikulum" },
      { key: "modul_ajar", label: "Pustaka Bahan Ajar", group: "Akademik & Kurikulum" },
      { key: "jadwal", label: "Jadwal Pelajaran Madrasah", group: "Akademik & Kurikulum" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi & Penilaian" },
      { key: "nilai", label: "Rekap Nilai & Rapor", group: "Evaluasi & Penilaian" },
      { key: "agenda", label: "Agenda & Kalender", group: "Informasi & Pengaturan" },
      { key: "pengumuman", label: "Pengumuman Resmi", group: "Informasi & Pengaturan" },
      { key: "perpustakaan", label: "E-Library Digital", group: "Informasi & Pengaturan" },
      { key: "profil", label: "Profil Saya", group: "Informasi & Pengaturan" },
    ],
  },
  kamad: {
    label: "Kepala Madrasah",
    badge: "KEPALA MADRASAH",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Kamad", group: "Kepemimpinan & GTK" },
      { key: "monitoring_kbm_live", label: "🔴 Pantau KBM Langsung", group: "Kepemimpinan & GTK" },
      { key: "sdm_gtk", label: "Kinerja & SDM GTK", group: "Kepemimpinan & GTK" },
      { key: "apresiasi_guru", label: "Pembinaan & Apresiasi GTK", group: "Kepemimpinan & GTK" },

      { key: "perangkat_pembelajaran", label: "Perangkat Pembelajaran", group: "Akademik & Kurikulum" },
      { key: "modul_ajar", label: "Bahan Ajar Madrasah", group: "Akademik & Kurikulum" },
      { key: "manajemen_kelas", label: "Monitoring Rombel", group: "Akademik & Kurikulum" },
      { key: "jadwal", label: "Jadwal Pelajaran", group: "Akademik & Kurikulum" },
      { key: "siakad", label: "Data Pokok Akademik", group: "Akademik & Kurikulum" },

      { key: "nilai", label: "Rekap Nilai & Leger", group: "Evaluasi & Mutu" },
      { key: "progress", label: "Progress Belajar Rombel", group: "Evaluasi & Mutu" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi & Mutu" },
      { key: "tahfidz_report", label: "Laporan Tahfidz Quran", group: "Evaluasi & Mutu" },
      { key: "kokurikuler_report", label: "Laporan Kokurikuler P5", group: "Evaluasi & Mutu" },

      { key: "agenda", label: "Agenda Madrasah", group: "Informasi & Akun" },
      { key: "pengumuman", label: "Pengumuman Resmi", group: "Informasi & Akun" },
      { key: "profil", label: "Profil Saya", group: "Informasi & Akun" },
    ],
  },
  waka: {
    label: "Waka Kurikulum",
    badge: "WAKA KURIKULUM",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Waka", group: "Utama & Monitoring" },
      { key: "monitoring_kbm_live", label: "🔴 Pantau KBM Langsung", group: "Utama & Monitoring" },
      { key: "manajemen_kelas", label: "Manajemen Kelas", group: "Utama & Monitoring" },
      { key: "sdm_gtk", label: "Beban Mengajar Guru (24 JP)", group: "Kurikulum & GTK" },
      { key: "siakad", label: "Data Pokok Akademik", group: "Kurikulum & GTK" },
      { key: "perangkat_pembelajaran", label: "Validasi Perangkat Pembelajaran", group: "Kurikulum & GTK" },
      { key: "modul_ajar", label: "Validasi Bahan Ajar", group: "Kurikulum & GTK" },
      { key: "jadwal", label: "Jadwal Pelajaran Madrasah", group: "Kurikulum & GTK" },
      { key: "cbt", label: "Monitoring CBT", group: "Evaluasi & Penilaian" },
      { key: "progress", label: "Progress Rombel", group: "Evaluasi & Penilaian" },
      { key: "nilai", label: "Laporan Pembelajaran", group: "Evaluasi & Penilaian" },
      { key: "apresiasi_guru", label: "Award & Warning Guru", group: "Evaluasi & Penilaian" },
      { key: "tahfidz_report", label: "Laporan Tahfidz", group: "Laporan Khusus" },
      { key: "kokurikuler_report", label: "Laporan P5", group: "Laporan Khusus" },
      { key: "agenda", label: "Agenda & Kalender", group: "Informasi & Pengaturan" },
      { key: "pengumuman", label: "Pengumuman Resmi", group: "Informasi & Pengaturan" },
      { key: "profil", label: "Profil Saya", group: "Informasi & Pengaturan" },
    ],
  },
  walikelas: {
    label: "Wali Kelas",
    badge: "PORTAL WALI KELAS",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Wali Kelas", group: "Manajemen Kelas" },
      { key: "kehadiran", label: "Presensi Rombel 8A", group: "Manajemen Kelas" },
      { key: "manajemen_kelas", label: "Manajemen Kelas", group: "Manajemen Kelas" },
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
    label: "Wali Kelas",
    badge: "PORTAL WALI KELAS",
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
      { key: "ruang_mengajar", label: "Ruang Mengajar KBM Live", group: "Ruang Mengajar" },
      { key: "cbt", label: "CBT & Bank Soal", group: "Penilaian & Asesmen" },
      { key: "perangkat_pembelajaran", label: "Perangkat Guru (RPP & ATP)", group: "Administrasi & Kurikulum" },
      { key: "nilai", label: "Rekap Nilai & Leger Rapor", group: "Penilaian & Rapor" },
      { key: "jadwal", label: "Jadwal Mengajar Saya", group: "Informasi & Referensi" },
      { key: "agenda", label: "Kalender Akademik", group: "Informasi & Referensi" },
      { key: "perpustakaan", label: "E-Library Madrasah", group: "Informasi & Referensi" },
      { key: "asisten_ai", label: "Asisten AI Pembelajaran", group: "Alat Bantu" },
      { key: "profil", label: "Profil Saya", group: "Pengaturan" },
    ],
  },
  siswa: {
    label: "Siswa Madrasah",
    badge: "RUANG BELAJAR SISWA",
    allowedMenus: [
      { key: "beranda", label: "Dashboard Siswa", group: "Ruang Belajar" },
      { key: "jadwal", label: "Jadwal Pelajaran", group: "Ruang Belajar" },
      { key: "mapel", label: "Materi & Modul Ajar", group: "Ruang Belajar" },
      { key: "tugas", label: "Tugas & Submisi LKPD", group: "Ruang Belajar" },
      { key: "cbt", label: "CBT Ujian Online", group: "Ruang Belajar" },
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
  const [active, setActive] = useState<MenuKey>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as MenuKey;
      if (tab) return tab;
    }
    return "beranda";
  });
  const [openMobile, setOpenMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const me = MysqlAuthService.getActiveUser();

  useEffect(() => {
    if (!me && typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }, [me]);

  if (!me) {
    return null;
  }

  // Multi-Role list allocated to currently logged-in user (Superadmin All Roles Access)
  const myAssignedRoles = useMemo(() => {
    if (!me) return ["siswa"];
    const cleanEmail = me.email ? me.email.toLowerCase().trim() : "";
    const isSuperAdminUser =
      me.role === "admin" ||
      me.role === "superadmin" ||
      cleanEmail === "admin@mail.com";

    // Superadmin has access to ALL 7 roles in the system
    if (isSuperAdminUser) {
      return ["admin", "admin_akademik", "kamad", "waka", "walikelas", "guru", "siswa"];
    }

    // Siswa Role Isolation
    if (me.role === "siswa" || cleanEmail.includes("siswa@") || cleanEmail.endsWith("@siswa.mtsn2cilacap.sch.id")) {
      return ["siswa"];
    }

    let savedRolesMap: Record<string, string[]> = {};
    if (typeof window !== "undefined") {
      try {
        savedRolesMap = JSON.parse(
          localStorage.getItem("lms_user_roles_overrides") ||
          localStorage.getItem("lms_persisted_user_roles_v2") ||
          "{}"
        );
      } catch (e) { }
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

    const set = new Set<string>();
    roles.forEach((r: string) => {
      const lower = r.toLowerCase().trim();
      if (lower === "admin" || lower === "superadmin") {
        if (isSuperAdminUser) set.add("admin");
      } else if (lower === "admin_akademik") {
        set.add("admin_akademik");
        set.add("guru");
      } else if (lower === "kamad") {
        set.add("kamad");
      } else if (lower === "waka") {
        set.add("waka");
        set.add("guru");
      } else if (lower === "walikelas" || lower === "wali_kelas") {
        set.add("walikelas");
        set.add("guru");
      } else if (lower === "guru" || lower === "guru_mapel") {
        set.add("guru");
      } else if (lower === "siswa") {
        set.add("siswa");
      }
    });

    if (set.has("kamad")) {
      // Catatan Client: "Masa Kamad mulang lah" -> Kamad is strictly executive monitoring only (1 role: kamad)
      return ["kamad"];
    }

    if (set.has("siswa") && set.size > 1) {
      // If user has 'siswa' role, force pure student role isolation
      return ["siswa"];
    }

    if (set.size === 0) set.add("guru");
    return Array.from(set);
  }, [me]);

  const [activeRole, setActiveRole] = useState<string>(() => {
    let candidate = "";
    if (typeof window !== "undefined") {
      candidate = localStorage.getItem("lms_active_role_pref") || "";
    }
    const activeUserSession = MysqlAuthService.getActiveUser();
    if (!candidate) {
      if (activeUserSession?.role && activeUserSession.role.includes(",")) {
        candidate = activeUserSession.role.split(",")[0].trim();
      } else {
        candidate = activeUserSession?.role || "siswa";
      }
    }
    return candidate || "siswa";
  });

  // Strict RBAC Guard: Keep activeRole strictly within myAssignedRoles!
  useEffect(() => {
    if (myAssignedRoles && myAssignedRoles.length > 0) {
      if (!myAssignedRoles.includes(activeRole)) {
        const fallbackRole = myAssignedRoles[0];
        setActiveRole(fallbackRole);
        if (typeof window !== "undefined") {
          localStorage.setItem("lms_active_role_pref", fallbackRole);
        }
      }
    }
  }, [myAssignedRoles, activeRole]);

  // Auth Diagnostic Log (Requirement #11)
  useEffect(() => {
    if (me) {
      console.log("[AUTH DEBUG]", {
        userId: me.id,
        email: me.email,
        databaseRole: me.role,
        myAssignedRoles,
        resolvedActiveRole: activeRole,
      });
    }
  }, [me, myAssignedRoles, activeRole]);

  const handleSwitchRole = (newRole: string) => {
    if (!myAssignedRoles.includes(newRole)) {
      toast.error("❌ Anda tidak memiliki wewenang untuk peran ini!");
      return;
    }
    setActiveRole(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem("lms_active_role_pref", newRole);
    }
    setActive("beranda");
    const info = ROLE_LABELS[newRole] || { label: newRole.toUpperCase().replace("_", " "), icon: "👤" };
    toast.success(`🔄 Mode Peran Aktif Diubah Ke: ${info.icon} ${info.label}`);
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
  const allowedKeys = useMemo(() => roleInfo.allowedMenus.map((x) => x.key), [roleInfo]);

  const activeUserForSidebar = MysqlAuthService.getActiveUser();
  const resolvedWaliRombel = resolveWaliKelasRombel(activeUserForSidebar, null, "rombel");

  const filteredMenu = roleInfo.allowedMenus
    .map((item) => {
      const base = MENU.find((m) => m.key === item.key);
      if (!base) return null;
      let label = item.label || base.label;
      if (activeRole === "walikelas" || activeRole === "wali_kelas") {
        label = label
          .replace("Rombel 8A", resolvedWaliRombel)
          .replace("Kelas 8A", resolvedWaliRombel.replace("Rombel", "Kelas"))
          .replace(" 8A", ` ${resolvedWaliRombel.replace("Rombel ", "")}`);
      }
      return {
        ...base,
        label,
        group: item.group || base.group,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const groups = Array.from(new Set(filteredMenu.map((m) => m.group)));

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash) {
      if (window.location.hash === "#" || window.location.hash === "#/") {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, []);

  useEffect(() => {
    const keys = roleInfo.allowedMenus.map((x) => x.key);
    if (!keys.includes(active)) {
      if ((active === "ruang_mengajar" || active === "modul_ajar") && keys.includes("mapel")) {
        setActive("mapel");
        return;
      }
      if (active === "mapel" && keys.includes("ruang_mengajar")) {
        setActive("ruang_mengajar");
        return;
      }
      setActive("beranda");
    }
  }, [activeRole, active, roleInfo]);

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

  const rawDisplayName = me?.full_name || userProfile?.name || "Pengguna";
  const displayName = !rawDisplayName || /^\d+$/.test(rawDisplayName.trim()) ? (userProfile?.name && !/^\d+$/.test(userProfile.name) ? userProfile.name : "Pengguna") : rawDisplayName;

  const roleInfo = ROLE_PERMISSIONS[activeRole] || ROLE_PERMISSIONS.siswa;
  const allowedKeys = roleInfo.allowedMenus.map((x) => x.key);

  const resolvedWaliRombel = useMemo(() => {
    return resolveWaliKelasRombel(me || userProfile, null, "rombel");
  }, [me, userProfile]);

  const sidebarBadge = (activeRole === "walikelas" || activeRole === "wali_kelas")
    ? `WALI KELAS ${resolvedWaliRombel.replace("Rombel ", "")}`
    : roleInfo.badge;

  const filteredMenu = roleInfo.allowedMenus
    .map((item) => {
      const base = MENU.find((m) => m.key === item.key);
      if (!base) return null;
      let label = item.label || base.label;
      if (activeRole === "walikelas" || activeRole === "wali_kelas") {
        label = label
          .replace("Rombel 8A", resolvedWaliRombel)
          .replace("Kelas 8A", resolvedWaliRombel.replace("Rombel", "Kelas"))
          .replace(" 8A", ` ${resolvedWaliRombel.replace("Rombel ", "")}`);
      }
      return {
        ...base,
        label,
        group: item.group || base.group,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const groups = Array.from(new Set(filteredMenu.map((m) => m.group)));

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
              <div className="text-[10px] text-sidebar-primary font-mono font-semibold truncate uppercase">{sidebarBadge}</div>
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
                <div className="text-[10px] text-sidebar-foreground/85 truncate font-mono font-bold uppercase tracking-wider">
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
        <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between gap-1.5 sm:gap-4 border-b border-border bg-background/95 px-2 sm:px-4 lg:px-8 backdrop-blur-md">
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9 border border-border shrink-0" />
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center justify-center sm:justify-between w-8 sm:w-64 md:w-72 h-8 sm:h-9 px-2 sm:px-3 text-xs bg-muted/40 hover:bg-muted/70 text-muted-foreground border border-border/80 rounded-xl transition cursor-pointer shrink-0 sm:shrink"
              title="Cari fitur, siswa, mapel..."
            >
              <span className="flex items-center gap-2 truncate">
                <Search className="h-3.5 w-3.5 opacity-70 shrink-0" />
                <span className="hidden sm:inline truncate">Cari fitur, siswa, mapel...</span>
              </span>
              <kbd className="hidden sm:inline-flex font-mono text-[10px] font-extrabold bg-background px-1.5 py-0.5 rounded border border-border text-foreground shrink-0">
                Ctrl K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Notification Center Popover (Disabled for clean header visual per user request) */}
            {/* <NotificationCenterPopover
              setActiveTab={(key: string) => setActive(key as MenuKey)}
              onOpenWaModal={() => setIsWaModalOpen(true)}
              activeRole={activeRole}
              userProfile={userProfile}
            /> */}

            {/* Multi-Role Switcher Dropdown */}
            {myAssignedRoles.length > 1 || isSuperAdmin ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1 text-[10px] sm:text-xs font-bold border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 shadow-xs h-8 sm:h-9 px-1.5 sm:px-3 shrink-0">
                    <Shield className="h-3.5 w-3.5 text-emerald-500 shrink-0 hidden xs:inline" />
                    <span className="hidden md:inline">Mode Role:</span>
                    <span className="uppercase font-extrabold truncate max-w-[65px] sm:max-w-none">{ROLE_LABELS[activeRole]?.icon || "👤"} {activeRole.replace("_", " ")}</span>
                    <ChevronDown className="h-3 w-3 opacity-60 ml-0.5 shrink-0" />
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
                        className={`flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-semibold cursor-pointer ${isSelected ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold" : ""
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
              <Button size="sm" variant="outline" className="hidden sm:flex text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 h-8 sm:h-9 px-2 sm:px-3 shrink-0" onClick={() => setIsWaModalOpen(true)}>
                <Send className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> <span>WA Gateway</span>
              </Button>
            )}

            {/* WA Modal */}
            <WAGatewayLogModal isOpen={isWaModalOpen} onClose={() => setIsWaModalOpen(false)} />

            {/* Global Cmd+K Command Palette Modal */}
            <GlobalCommandPalette
              isOpen={isCommandPaletteOpen}
              onClose={() => setIsCommandPaletteOpen(false)}
              setActiveTab={(key: string) => setActive(key as MenuKey)}
              handleSwitchRole={handleSwitchRole}
              activeRole={activeRole}
              assignedRoles={myAssignedRoles}
              onOpenWaModal={() => setIsWaModalOpen(true)}
            />

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-1 hover:bg-accent rounded-full border border-border/40">
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-emerald-500/40 shrink-0">
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
                {allowedKeys.includes("users") && (
                  <DropdownMenuItem onClick={() => setActive("users")}>
                    <Shield className="h-4 w-4 mr-2" /> Kelola Akun & Hak Akses
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

        <main className="p-3 sm:p-4 lg:p-8 flex-1 overflow-x-hidden font-sans">
          <ErrorBoundary>
            <Suspense fallback={<TableRowsSkeleton rows={5} />}>
              {active === "beranda" && <BerandaModule activeRole={activeRole} userProfile={userProfile} dbStats={dbStats} setActiveTab={(key: string) => setActive(key as MenuKey)} />}
              {active === "monitoring_kbm_live" && (
                activeRole === "admin" || activeRole === "admin_akademik" || activeRole === "kamad" || activeRole === "waka" ? (
                  <MonitoringKbmLiveModule />
                ) : (
                  <div className="p-12 text-center border border-dashed border-red-200 rounded-2xl bg-red-50/30">
                    <h3 className="font-extrabold text-sm text-red-600">Akses Terbatas — Supervisi Pimpinan</h3>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                      Menu <strong>Monitoring KBM Live</strong> khusus diperuntukkan bagi Kepala Madrasah (Kamad), Waka Kurikulum, dan Administrator.
                    </p>
                  </div>
                )
              )}
              {active === "ruang_mengajar" && <RuangMengajarModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "sdm_gtk" && <SdmGtkModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "siakad" && <SiakadMasterDataModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "manajemen_kelas" && <ManajemenKelasModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "perangkat_pembelajaran" && <MataPelajaranModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "mapel" && <MataPelajaranModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "users" && activeRole !== "siswa" && <UserManagementModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "kehadiran" && activeRole !== "siswa" && <KehadiranModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "jadwal" && <JadwalModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "modul_ajar" && <ModulAjarModule activeRole={activeRole} userProfile={userProfile} />}
              {(active === "apresiasi" || active === "apresiasi_guru") && <ApresiasiGuruModule activeRole={activeRole} />}
              {active === "apresiasi_siswa" && <ApresiasiSiswaModule />}
              {active === "nilai" && <RaporModule activeRole={activeRole} />}
              {active === "progress" && <ProgressBelajarModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "asesmen" && <PusatAsesmenModule activeRole={activeRole} userProfile={userProfile} />}
              {active === "tugas" && <PusatAsesmenModule activeRole={activeRole} initialTab="individu" userProfile={userProfile} />}
              {active === "quiz" && <PusatAsesmenModule activeRole={activeRole} initialTab="kuis" userProfile={userProfile} />}
              {active === "cbt" && <CBTModule userRole={activeRole} studentName={userProfile?.name || me?.full_name} />}
              {(active === "tahfidz" || active === "laporan_tahfidz" || active === "tahfidz_report") && (
                activeRole === "kamad" || activeRole === "waka" || activeRole === "admin" || activeRole === "admin_akademik" ? (
                  <LaporanTahfidzEksekutif activeRole={activeRole} userProfile={userProfile} />
                ) : (
                  <TahfidzModule activeRole={activeRole} userProfile={userProfile} />
                )
              )}
              {(active === "kokurikuler" || active === "kokurikuler_report") && (activeRole === "siswa" ? <KokurikulerSiswaModule userProfile={userProfile} /> : <KokurikulerModule activeRole={activeRole} />)}
              {active === "asisten_ai" && <AsistenAIModule activeRole={activeRole} />}
              {active === "pengumuman" && <PengumumanModule />}
              {active === "agenda" && <AgendaKalenderModule />}
              {active === "perpustakaan" && <PerpustakaanModule activeRole={activeRole} />}
              {active === "profil" && <ProfilModule userProfile={userProfile} setUserProfile={setUserProfile} activeRole={activeRole} />}
              {active === "pengaturan" && <PengaturanModule />}
            </Suspense>
          </ErrorBoundary>
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

/* ---------- Extracted Modules: UserManagementModule, KehadiranModule, JadwalModule ---------- */

/* ---------- New Menu Pages ---------- */

function Pengumuman() {
  return <PengumumanModule />;
}
