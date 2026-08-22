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
  { code: "AGM-01", name: "Al Qur'an Hadis", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "AH. SYARIF HIDAYAH, S.Pd.I", icon: "📖" },
  { code: "AGM-02", name: "Akidah Akhlak", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "WAKHIBUN, S.P", icon: "🕌" },
  { code: "AGM-03", name: "Fikih", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "CARYATI,", icon: "⚖️" },
  { code: "AGM-04", name: "Sejarah Kebudayaan Islam", category: "Keagamaan", jp: "2 JP", target: "Semua Tingkat", teacher: "H. DASIRUN, S.Ag., M.Pd.I", icon: "🏛️" },
  { code: "AGM-05", name: "Bahasa Arab", category: "Keagamaan", jp: "3 JP", target: "Semua Tingkat", teacher: "ENDAH SUPRIHATIN, S.Pd", icon: "🗣️" },
  { code: "UMM-01", name: "Bahasa Indonesia", category: "Umum", jp: "4 JP", target: "Semua Tingkat", teacher: "SOBIYATI, S.Pd", icon: "📝" },
  { code: "UMM-02", name: "Bahasa Inggris", category: "Umum", jp: "3 JP", target: "Semua Tingkat", teacher: "ACHMAD MAKMUN ROSID, S.Pd., M.Pd", icon: "🌐" },
  { code: "UMM-03", name: "Matematika", category: "Umum", jp: "4 JP", target: "Semua Tingkat", teacher: "SAYONO, S.Pd., M.Pd.", icon: "📐" },
  { code: "UMM-04", name: "Ilmu Pendidikan Alam", category: "Umum", jp: "4 JP", target: "Semua Tingkat", teacher: "NOVANTYA KARTIKAWATI, S.Pd", icon: "🔬" },
  { code: "UMM-05", name: "Ilmu Pendidikan Sosial", category: "Umum", jp: "3 JP", target: "Semua Tingkat", teacher: "UMI KHAFSOH, S.Pd", icon: "🌍" },
  { code: "UMM-06", name: "Pendidikan Kewarganegaraan", category: "Umum", jp: "2 JP", target: "Semua Tingkat", teacher: "ANGGUN NOVTALIA BERLIAN, S.Pd", icon: "🇮🇩" },
  { code: "UMM-07", name: "Pendidikan Jasmani, Olahraga dan Kesehatan", category: "Umum", jp: "2 JP", target: "Semua Tingkat", teacher: "NUR ROCHMAN SHODIQ, S.Pd.I", icon: "⚽" },
  { code: "UMM-08", name: "Prakarya dan Seni Budaya", category: "Umum", jp: "2 JP", target: "Semua Tingkat", teacher: "ISNAENI HASANAH, S.Pd.I", icon: "🎨" },
  { code: "MLK-01", name: "Bahasa Jawa", category: "Muatan Lokal", jp: "2 JP", target: "Semua Tingkat", teacher: "RINDANG FARIHA IDANA, S.Pd", icon: "📜" },
  { code: "PGB-01", name: "Bimbingan dan Konseling", category: "Pengembangan Diri", jp: "1 JP", target: "Semua Tingkat", teacher: "ASROR HIDAYAT, S.Pd", icon: "🤝" },
];
