import React, { useEffect } from "react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Home,
  UserCheck,
  BookOpen,
  Users,
  FileText,
  Award,
  BookMarked,
  FolderKanban,
  Library,
  Bell,
  Bot,
  Shield,
  Send,
  Printer,
  Sparkles,
} from "lucide-react";

interface GlobalCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (key: string) => void;
  handleSwitchRole: (role: string) => void;
  activeRole: string;
  assignedRoles: string[];
  onOpenWaModal?: () => void;
}

export function GlobalCommandPalette({
  isOpen,
  onClose,
  setActiveTab,
  handleSwitchRole,
  activeRole,
  assignedRoles,
  onOpenWaModal,
}: GlobalCommandPaletteProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open triggered from parent or direct listener
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const rawNavMenuItems = [
    { key: "beranda", label: "Beranda Ringkasan & Dashboard Utama", icon: Home, group: "Modul Utama" },
    { key: "kehadiran", label: activeRole === "siswa" ? "Kehadiran Saya" : "Presensi Pagi & Sesi Mengajar KBM", icon: UserCheck, group: "Modul Utama" },
    { key: "ruang_mengajar", label: "Ruang Mengajar, Jurnal & LKPD", icon: BookOpen, group: "Modul Utama" },
    { key: "sdm_gtk", label: "SDM & Direktori Guru Staf MTsN 2", icon: Users, group: "Modul Utama" },
    { key: "modul_ajar", label: "Perangkat Bahan Ajar & RPP Merdeka", icon: FileText, group: "Pembelajaran & Nilai" },
    { key: "nilai", label: activeRole === "siswa" ? "Rekap Nilai Saya" : "Penilaian & E-Rapor Kurikulum Merdeka", icon: Award, group: "Pembelajaran & Nilai" },
    { key: "asesmen", label: "Pusat Asesmen Formatif & Sumatif", icon: Sparkles, group: "Pembelajaran & Nilai" },
    { key: "tahfidz", label: activeRole === "siswa" ? "Setoran Tahfidz Saya" : "Setoran Hafalan & Rapor Tahfidz Qur'an", icon: BookMarked, group: "Pembelajaran & Nilai" },
    { key: "kokurikuler", label: "Kegiatan Kokurikuler & Projek P5-PPRA", icon: FolderKanban, group: "Pembelajaran & Nilai" },
    { key: "perpustakaan", label: "Perpustakaan Digital & E-Book Buku", icon: Library, group: "Layanan Sekolah" },
    { key: "pengumuman", label: "Pengumuman Resmi & Buletin Madrasah", icon: Bell, group: "Layanan Sekolah" },
    { key: "asisten_ai", label: "Asisten AI & Tools Digital Pembelajaran", icon: Bot, group: "Layanan Sekolah" },
  ];

  // Disallowed menu keys for student role
  const studentDisallowedKeys = new Set(["ruang_mengajar", "sdm_gtk", "modul_ajar", "siakad", "manajemen_kelas", "users"]);
  
  const navMenuItems = rawNavMenuItems.filter((item) => {
    if (activeRole === "siswa" && studentDisallowedKeys.has(item.key)) {
      return false;
    }
    return true;
  });

  const roleLabels: Record<string, { label: string; icon: string }> = {
    guru: { label: "Guru Pengampu Mapel", icon: "👨‍🏫" },
    walikelas: { label: "Wali Kelas Rombel", icon: "🏫" },
    wali_kelas: { label: "Wali Kelas Rombel", icon: "🏫" },
    siswa: { label: "Siswa Madrasah", icon: "🎓" },
    kamad: { label: "Kepala Madrasah (Kamad)", icon: "🏛️" },
    waka: { label: "Wakil Kepala Madrasah", icon: "👔" },
    admin: { label: "Administrator Sistem", icon: "⚙️" },
    admin_akademik: { label: "Admin Akademik", icon: "📚" },
  };

  const handleSelectTab = (key: string) => {
    setActiveTab(key);
    onClose();
  };

  const handleSelectRole = (role: string) => {
    handleSwitchRole(role);
    onClose();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <CommandInput placeholder="🔎 Ketik nama fitur, navigasi, atau tindakan cepat..." />
      <CommandList className="p-2 max-h-[380px]">
        <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
          Fitur atau pencarian tidak ditemukan. Coba ketik "Presensi", "Tahfidz", "Rapor", atau "Guru".
        </CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="⚡ Tindakan Cepat (Quick Actions)">
          <CommandItem
            onSelect={() => handleSelectTab("tahfidz")}
            className="cursor-pointer text-xs font-semibold gap-2 py-2"
          >
            <BookMarked className="h-4 w-4 text-emerald-500" />
            <span>Setor Hafalan Tahfidz</span>
          </CommandItem>
          {onOpenWaModal && activeRole !== "siswa" && (
            <CommandItem
              onSelect={() => {
                onOpenWaModal();
                onClose();
              }}
              className="cursor-pointer text-xs font-semibold gap-2 py-2"
            >
              <Send className="h-4 w-4 text-emerald-500" />
              <span>Buka Log WA Gateway Notifikasi</span>
            </CommandItem>
          )}
          <CommandItem
            onSelect={() => handleSelectTab("nilai")}
            className="cursor-pointer text-xs font-semibold gap-2 py-2"
          >
            <Printer className="h-4 w-4 text-blue-500" />
            <span>{activeRole === "siswa" ? "Lihat Rekap Nilai Saya" : "Cetak E-Rapor Kurikulum Merdeka PDF"}</span>
          </CommandItem>
          {activeRole !== "siswa" && (
            <CommandItem
              onSelect={() => handleSelectTab("asisten_ai")}
              className="cursor-pointer text-xs font-semibold gap-2 py-2"
            >
              <Bot className="h-4 w-4 text-purple-500" />
              <span>Buka Asisten AI & Tools Digital Pembelajaran</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator className="my-1" />

        {/* Navigation Groups */}
        <CommandGroup heading="📌 Navigasi Modul LMS">
          {navMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.key}
                onSelect={() => handleSelectTab(item.key)}
                className="cursor-pointer text-xs font-medium gap-2 py-2"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span className="font-semibold text-foreground">{item.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>

        {assignedRoles.length > 1 && (
          <>
            <CommandSeparator className="my-1" />
            <CommandGroup heading="👤 Ganti Peran / Perspektif (Switch Role)">
              {assignedRoles.map((r) => {
                const info = roleLabels[r] || { label: r.toUpperCase(), icon: "👤" };
                const isCurrent = activeRole === r;
                return (
                  <CommandItem
                    key={r}
                    onSelect={() => handleSelectRole(r)}
                    className="cursor-pointer text-xs font-medium gap-2 py-2 justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{info.icon}</span>
                      <span className={isCurrent ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}>
                        Mode {info.label}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-600 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                        Aktif
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
