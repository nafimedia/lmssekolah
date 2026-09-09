/**
 * Helper deteksi dan format tipografi Bahasa Arab (Khat Naskh / Amiri)
 * Digunakan untuk soal CBT, tugas LKPD, Al-Qur'an, dan materi keagamaan MTsN 2 Cilacap.
 */

// Regex mendeteksi karakter Arabic Unicode (termasuk harakat, tanda waqaf, dan angka Arab)
export const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Mengecek apakah string mengandung karakter huruf atau harakat Arab
 */
export function isArabicText(text?: string | null): boolean {
  if (!text || typeof text !== "string") return false;
  return ARABIC_REGEX.test(text);
}

/**
 * Mengembalikan class CSS tipografi Arab jika teks terdeteksi berbahasa Arab
 */
export function getArabicClassName(
  text?: string | null,
  customArabicClass = "arabic-text font-arabic",
  defaultClass = ""
): string {
  return isArabicText(text) ? customArabicClass : defaultClass;
}

/**
 * Mengembalikan atribut dir (rtl atau ltr) secara otomatis berdasarkan konten
 */
export function getAutoTextDirection(text?: string | null): "rtl" | "ltr" {
  return isArabicText(text) ? "rtl" : "ltr";
}
