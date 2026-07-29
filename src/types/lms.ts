import { Home } from "lucide-react";

export type MenuKey =
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
  | "perpustakaan"
  | "profil"
  | "pengaturan";

export interface MenuItem {
  key: MenuKey;
  label: string;
  icon: typeof Home;
  group?: string;
}

export interface RolePermission {
  label: string;
  badge: string;
  allowedMenus: { key: MenuKey; label: string; group?: string }[];
}

export interface PresensiItem {
  id: string;
  date: string;
  status: string;
  time: string;
  note: string;
  badge: string;
}

export interface StudentBadgeWarning {
  id: string;
  name: string;
  rombel: string;
  nis: string;
  badges: string[];
  warningCount: number;
  lastComment?: string;
  phoneWali?: string;
}
