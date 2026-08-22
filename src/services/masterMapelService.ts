export interface MasterMapelItem {
  code: string;
  name: string;
  category: "Keagamaan" | "Umum" | "Muatan Lokal" | "Pengembangan Diri";
  jp: string;
  target: string;
  teacher?: string;
  icon?: string;
}

// Single Source of Truth (Satu Pintu Master Data Mapel MTsN 2 Cilacap)
export const INITIAL_MASTER_MAPEL: MasterMapelItem[] = [
  { code: "AGM-01", name: "Al-Quran Hadits", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "AH. SYARIF HIDAYAH, S.Pd.I", icon: "📖" },
  { code: "AGM-02", name: "Akidah Akhlak", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "WAKHIBUN, S.P", icon: "🕌" },
  { code: "AGM-03", name: "Fiqih Kebangsaan", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "CARYATI,", icon: "⚖️" },
  { code: "AGM-04", name: "Sejarah Kebudayaan Islam (SKI)", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "H. DASIRUN, S.Ag., M.Pd.I", icon: "🏛️" },
  { code: "AGM-05", name: "Bahasa Arab", category: "Keagamaan", jp: "3 JP", target: "Semua Tingkat", teacher: "ENDAH SUPRIHATIN, S.Pd", icon: "🗣️" },
  { code: "UMM-01", name: "Matematika", category: "Umum", jp: "4 JP", target: "Semua Tingkat", teacher: "SAYONO, S.Pd., M.Pd.", icon: "📐" },
  { code: "UMM-02", name: "Ilmu Pengetahuan Alam (IPA)", category: "Umum", jp: "4 JP", target: "Semua Tingkat", teacher: "NOVANTYA KARTIKAWATI, S.Pd", icon: "🔬" },
  { code: "UMM-03", name: "Bahasa Indonesia", category: "Umum", jp: "4 JP", target: "Semua Tingkat", teacher: "SOBIYATI, S.Pd", icon: "📝" },
  { code: "UMM-04", name: "Bahasa Inggris", category: "Umum", jp: "3 JP", target: "Semua Tingkat", teacher: "RIDHO ANSHORI, S.Pd., M.Pd", icon: "🌐" },
  { code: "UMM-05", name: "Ilmu Pengetahuan Sosial (IPS)", category: "Umum", jp: "3 JP", target: "Semua Tingkat", teacher: "UMI KHAFSOH, S.Pd", icon: "🌍" },
  { code: "UMM-06", name: "Pendidikan Pancasila (PKn)", category: "Umum", jp: "2 JP", target: "Semua Tingkat", teacher: "ANGGUN NOVTALIA BERLIAN, S.Pd", icon: "🇮🇩" },
  { code: "UMM-07", name: "Informatika & Coding AI", category: "Umum", jp: "2 JP", target: "Semua Tingkat", teacher: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", icon: "💻" },
  { code: "MLK-01", name: "Bahasa Jawa (Mulok Daerah)", category: "Muatan Lokal", jp: "2 JP", target: "Semua Tingkat", teacher: "RINDANG FARIHA IDANA, S.Pd", icon: "📜" },
  { code: "MLK-02", name: "Tahfidz & Murottal Juz 30", category: "Muatan Lokal", jp: "2 JP", target: "Semua Tingkat", teacher: "MISBAH AHMAD DANI, S.Pd", icon: "☪️" },
];
